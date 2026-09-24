# 24. Georkestreerde state machine met eventlog voor de notificatielevenscyclus

Datum: 2026-08-31

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): keuze voor NotifyNL als verzendkanaal; de eigenschappen van NotifyNL bepalen een groot deel van deze beslissing.
* [ADR 0020 Standaard afleverstatus-terugkoppeling](0020-standaard-afleverstatus-terugkoppeling.md): status-query als basis en een optionele push naar de dienstverlener. Deze ADR legt vast hoe het NMC die terugkoppeling intern voedt, voegt een cursorfeed toe naast de status-query en de webhook, en wijzigt ADR 0020 op twee punten (zie "Wijziging van ADR 0020" onder Decision): `subject` in de CloudEvents is de notificatie-id in plaats van de DV-referentie, en de inkomende DV-koppelvlakken lopen over FSC met een OAuth2-token op berichtniveau.
* [ADR 0021 Twee regie-modellen](0021-twee-regie-modellen-ipv-scenarios.md): gecentraliseerde en gedecentraliseerde regie; beide modellen doorlopen de stappen uit deze ADR.

## Context

Het Notificatie Management Component (NMC) doorloopt per notificatie zes stappen:

1. Een dienstverlener (DV) biedt een notificatie aan met een eigen referentie (`dvRef`), een berichttype en, afhankelijk van het regie-model, een e-mailadres (gedecentraliseerd) of een identificerend nummer (gecentraliseerd, waarbij het NMC het e-mailadres bij de Profielservice ophaalt).
2. Het NMC biedt het bericht aan bij NotifyNL en ontvangt een NotifyNL-id.
3. NotifyNL meldt de afleverstatus asynchroon op een callback-URL van het NMC.
4. Bij een mislukte aflevering volgt één herverzending; bij een onbereikbare ontvanger meldt het NMC bij gecentraliseerde regie het e-mailadres ongeldig bij de Profielservice. Contactherstel is in deze ADR niet uitgewerkt.
5. Het NMC koppelt de status terug aan de DV.
6. De DV kan de status van een notificatie opvragen.

Het NMC legt per notificatie een statusgeschiedenis vast: één rij per statusovergang met een volgnummer per notificatie, het tijdstip van de bron (voor een receipt de `completed_at` van NotifyNL) en het tijdstip van registratie op de eigen klok, met op de notificatierij een projectie van de laatste status. De statuswaarden zijn die van de NotifyNL-receipt (`delivered`, `temporary-failure`, `permanent-failure`, `technical-failure`) plus `created`, `sending` en `onbekend`; een eerdere status die terugkomt wordt opnieuw vastgelegd. Elke nieuw vastgelegde status gaat na de commit als CloudEvent naar de callback-URL van de DV, met ten hoogste drie pogingen. Een status-query, een volgnummer in de callback, een herverzending en een navraag bij NotifyNL ontbreken.

De kwaliteitseisen, in volgorde van gewicht:

* **Aflevering boven snelheid.** Een geaccepteerde notificatie gaat nooit verloren en eindigt altijd in een finale status waarvan de DV kennis kan nemen.
* **Dataminimalisatie.** Geen contactgegevens, identificerende nummers of berichtinhoud in logregels of events; het eventlog is pseudoniem en wordt als persoonsgegeven behandeld. Contactgegevens en de waarden voor de personalisation staan uitsluitend versleuteld op de notificatierij en worden met de sleutel gewist zodra ze niet meer nodig zijn; het NMC bewaart geen samengesteld bericht.
* **Volume.** Eén DV heeft een piek van 2,2 miljoen notificaties in één maand opgegeven. Ons huidig beoogd minimum is dat zo'n piek binnen vijf werkdagen van negen uur wordt afgevoerd, gemiddeld ruim 13 notificaties per seconde; de limiet per NotifyNL-service is de harde bovengrens.
* **Afnemers van uiteenlopende volwassenheid.** Veel DV's kunnen callbackfunctionaliteit nog niet ondersteunen.
* **Horizontaal schalen.** Alle onderdelen kunnen horizontaal schalen om piekmomenten te faciliteren.

De volgende eigenschappen van NotifyNL wegen zwaar in de keuze:

* Verzending wordt bevestigd met een 201 en een NotifyNL-id. De aanroeper geeft een `reference` mee die in de receipts terugkomt en waarop gezocht kan worden.
* Delivery receipts worden naar een callback-URL gepusht. Een mislukte callback wordt vijf keer met een interval van vijf minuten herhaald; daarna is de receipt weg. De receipt bevat het e-mailadres van de ontvanger.
* `temporary-failure` volgt pas nadat de e-mailprovider tot 72 uur heeft geprobeerd af te leveren; `permanent-failure` betekent een ongeldig adres; bij `technical-failure` hoort de aanroeper opnieuw aan te bieden.
* Een receipt `delivered` is niet definitief: tot zeven dagen erna kan de e-mailprovider het bericht alsnog weigeren en stuurt NotifyNL een faalreceipt. Onder de Wet modernisering elektronisch bestuurlijk verkeer (MEBV) geldt de aflevering na die termijn als geslaagd; een latere bounce blijft mogelijk, maar telt niet mee.
* Authenticatie verloopt met een HS256-JWT over het publieke internet, en NotifyNL pusht de receipts vanaf internet; de receipt-callback van het NMC is dus vanaf internet bereikbaar.

Vrijwel elke stap is asynchroon en aflevering weegt zwaarder dan snelheid. Dat roept de vraag op of een event-driven architectuur (een message broker met choreografie, of event sourcing) het passende model is, en zo niet, welke stappen dan wel als event en welke als opdracht gemodelleerd horen te worden.

## Decision

Het NMC is eigenaar van de notificatielevenscyclus en voert die uit als een **georkestreerde state machine in PostgreSQL** met een **transactioneel eventlog**. Er komt geen message broker en geen workflow-engine in de kern.

1. **Eén bron van waarheid.** De tabellen `notificatie` en `poging` (één rij per verzendpoging) zijn de bron van waarheid. Eén overgangsfunctie is de enige schrijver van de status; zij vergrendelt de notificatierij (`FOR UPDATE`) vóór elke schrijfactie op die rij, toetst de overgang aan de toegestane overgangen, verhoogt de versie en schrijft in dezelfde transactie een event weg in het eventlog `event`. De applicatie schrijft het event; een databasetrigger weigert een wijziging van de versie zonder een event met hetzelfde volgnummer in dezelfde transactie, zodat ook een herverzending (de status blijft `verzonden`) een event schrijft. De trigger houdt de tabel van toegestane paren (van, naar); de kopie in de applicatie wordt door een test tegen de triggerdefinitie gecontroleerd. De regels die van de poging afhangen (aantal pogingen, ordening van receipts, `geldig_tot`) staan in de receiptverwerking, niet in de trigger.
2. **Bijwerkingen als taken.** Verzenden (inclusief voorkeur ophalen), receipts verwerken, reconciliëren, bezorging vaststellen, terugkoppelen, ongeldig melden en wissen zijn rijen in een takentabel met soort, DV-id, notificatie-id (leeg voor taken per DV of per systeem), lease, pogingenteller, oplopend claim-epoch, trace-id en een `due`-tijdstip. Workers claimen taken met `SELECT ... FOR UPDATE SKIP LOCKED` op (soort, DV-id, `due`): een claimronde kiest de DV's met openstaand werk en claimt per DV een deel van de batch, met tokens uit een verzendbudget per Notify-service. De claim is een eigen transactie die vóór de uitvoering committet; de overgang na de uitvoering is een tweede transactie waarin de rijvergrendeling op de notificatie aan elke schrijfactie op die rij voorafgaat. De lease dekt de hele batch en wordt per taak verlengd vóór elke externe aanroep. Timers zijn data (`due`), geen berichten. De pogingenteller telt alleen mislukkingen in het NMC zelf; een uitstel na een fout in de aanroep van NotifyNL, de Profielservice of het LDV telt niet mee. Een uitgeputte verzendtaak leidt tot `technisch-mislukt`; een uitgeputte taak van een andere soort krijgt de status `mislukt`, telt in een metriek en wacht op beheer, dat de taak heropent of de overgang forceert. Een controletaak zoekt periodiek elke notificatie zonder terminale status en zonder open of mislukte taak en plant de ontbrekende taak opnieuw: een verzendtaak bij `aangenomen`, een herclaim van dezelfde poging bij `in-verzending`, bij `verzonden` een verzendtaak als geen poging lopend is en anders een navraagtaak, en een vaststeltaak bij `bezorgd`; een unieke index op (notificatie, soort) voor open taken voorkomt dubbele planning; receipttaken vallen daarbuiten en zijn uniek op (poging, tijdstip uit de receipt), zodat meerdere receipts voor één notificatie tegelijk open kunnen staan. Een onderhoudstaak maakt de volgende partitie van het eventlog aan zodra de lopende voor 80% is gevuld; een default-partitie vangt op wat daarbuiten valt.
3. **Events naar buiten via het log.** Elke overgang schrijft een rij in `event`: notificatie-id, DV-id, volgnummer, van, naar, reden, tijdstip en transactie-id. Het volgnummer is gelijk aan de versie van de notificatie na de overgang. `tijdstip` is het registratietijdstip op de klok van het NMC; het tijdstip van de bron, voor een receipt de `completed_at` van NotifyNL, staat op de poging en is het tijdstip voor het afleverbewijs. Het log bevat geen contactgegevens, geen identificerende nummers en geen DV-referentie; het is pseudonieme informatie die de DV kan herleiden en wordt als persoonsgegeven behandeld. Een cursor bestaat uit een cluster-epoch, de transactie-id en het event-id en is voor de DV een ondoorzichtige tekst. De feed leest op (transactie-id, event-id) onder het visibiliteitswatermerk van de oudste lopende transactie, zodat een cursor nooit een laat gecommit event overslaat. De feed garandeert geen volgorde tussen events van dezelfde notificatie: de DV verwerkt per `subject` op `sequence` en negeert een lager volgnummer na een hoger. Het cluster-epoch wordt door beheer verhoogd bij een herstel uit back-up of een promotie waarbij de transactie-id-reeks niet doorloopt; een cursor met een ander epoch of in een verwijderde partitie krijgt 410 en de DV herstart vanaf het oudste beschikbare event. Het log is de enige bron voor terugkoppeling aan DV's, voor rapportage en voor het afleverbewijs en heeft één bewaartermijn, die van het afleverbewijs. Het is gepartitioneerd op bereiken van transactie-id, zodat de feed alleen de partities vanaf de cursor leest; een partitie wordt opgeruimd op de leeftijd van haar jongste event.
4. **Inkomende events worden eerst opgeslagen.** De receipt-callback van NotifyNL authenticeert en valideert het inkomende bericht (schema en omvang), schrijft het weg als taak zonder het e-mailadres uit de receipt en antwoordt pas daarna met 200; een taak verwerkt het event via de overgangsfunctie. De `reference` is het id van de poging; een receipt met een `reference` die op geen poging past wordt niet opgeslagen, alleen geteld. De verwerktaak beoordeelt de receipt onder de rijvergrendeling: draagt de poging nog geen NotifyNL-id (de worker viel uit tussen de 201 en de commit), dan neemt de poging het id uit de receipt over en voert de verwerktaak eerst de overgang `in-verzending` naar `verzonden` uit namens de worker, of bij een herverzending het vastleggen van de poging; past het id op de poging of op een van haar duplicaat-id's, dan wordt de receipt verwerkt; anders wordt het id als duplicaat op de poging vastgelegd en de receipt verwerkt alsof het de poging betreft, omdat elk duplicaat dezelfde ontvanger en dezelfde inhoud draagt. Receipts worden per poging geordend op het tijdstip in de receipt zelf (`completed_at`), begrensd op de systeemtijd, niet op aankomst. Een receipt met een status die het NMC niet kent wordt op de poging vastgelegd zonder overgang en geteld; de navraag loopt door en eindigt zonder herkende uitkomst in `bezorgstatus-onbekend`. De afleverstatus-navraag voert de navraagtaken (soort reconciliëren) uit die de verzend-commit per poging plant: zij vraagt de status op van elke poging met een NotifyNL-id en zonder receipt, na 1, 6 en 24 uur en daarna dagelijks tot de bewaartermijn van NotifyNL, in batches en met een vast aandeel van hetzelfde verzendbudget als het verzenden; een verwerkte receipt rondt de navraagtaak af. Een 404 op die opvraag, of het verstrijken van de bewaartermijn van NotifyNL zonder uitkomst, sluit de navraag af: de poging eindigt in `onbekend` en de notificatie in `bezorgstatus-onbekend`, de enige terminale status die een later binnengekomen receipt nog mag corrigeren. Een receipt `delivered` brengt de notificatie naar `bezorgd` en plant een vaststeltaak met `due` op het tijdstip uit de receipt plus de vaststellingstermijn (de termijn uit de MEBV, zeven dagen, als configuratiewaarde) plus het callback-venster van NotifyNL als marge, zodat een faalreceipt met een `completed_at` binnen de termijn de taak niet kan kruisen. Die taak sluit de notificatie af als `definitief-bezorgd`. Een `temporary-failure` of `permanent-failure` binnen de vaststellingstermijn wordt verwerkt volgens de gewone regels en rondt de open vaststeltaak af zonder overgang; een nieuwe `delivered` plant een nieuwe vaststeltaak. Een faalreceipt na de termijn wordt op de poging vastgelegd zonder overgang. De vaststeltaak vraagt niets na bij NotifyNL, omdat de bewaartermijn van NotifyNL de vaststellingstermijn niet hoeft te dekken.
5. **DV-contract: cursorfeed erbij naast status-query en webhook.** Naast de status-query en de webhook uit ADR 0020 komt er een cursorfeed: de DV leest zijn events als CloudEvents volgens het NL GOV-profiel (`sequence` is het volgnummer, `subject` de notificatie-id) via `GET /v1/notificaties/wijzigingen?cursor=` en bevestigt de cursor. De bij onboarding geregistreerde webhook blijft optioneel; een terugkoppeltaak per DV leest hetzelfde log onder hetzelfde watermerk en levert elk event, gebundeld per aanroep, met een ondertekende bearer-JWT. De bevestiging is de feedcursor die de DV zelf schrijft; de webhook houdt per DV alleen een leverpositie bij en een 2xx op de webhook is geen bevestiging. Elke webhook-aanroep draagt de cursor van het laatst geleverde event; een DV met webhook bevestigt daarmee via dezelfde bevestigingsaanroep. Onbevestigde terminale statussen ouder dan een per DV afgesproken termijn worden per DV gemeld op het beheerkanaal uit het DV-contract; na de maximale cursorleeftijd uit dat contract vervalt de cursor (410) en houdt hij het opruimen van het log niet langer tegen. Een gepauzeerde webhook hervat met een oplopende wachttijd tot ten hoogste een dag, of eerder op verzoek van de DV.
6. **Persoonsgegevens.** `dvRef` wordt aan de deur vervangen door een HMAC over DV-id en `dvRef`, met een pepper per doel en een pepperversie op de rij; het NMC bewaart geen door de DV gekozen referentie in platte tekst. Het e-mailadres (gedecentraliseerd) of het identificerend nummer (gecentraliseerd) en de waarden voor de personalisation staan versleuteld op de rij met een sleutel per notificatie, gewrapt door een KEK uit de sleutelvoorziening van het platform; de KEK wordt bij het opstarten opgehaald en in het geheugen gehouden, zodat de sleutelvoorziening niet op het aanroeppad ligt. Het wissen van de gewrapte sleutel is de wisactie en gebeurt als taak op een vaste termijn na de terminale status; de envelope dient de rotatie van de KEK (herwrappen van de sleutels per notificatie door een onderhoudstaak, zonder herversleuteling van de gegevens) en de versleuteling in rust, niet het wissen uit back-ups, dat door het verlopen van de back-ups gebeurt. Ontsleutelen gebeurt alleen in de verzendtaak en in de taak ongeldig melden, die het identificerend nummer nodig heeft; er is geen leespad voor beheer. NotifyNL bewaart het adres en het samengestelde bericht gedurende zijn eigen bewaartermijn; die termijn staat in de verwerkersovereenkomst en de afleverstatus-navraag is erop afgestemd. Het e-mailadres uit de Profielservice wordt binnen de verzendtaak opgehaald en nooit opgeslagen.
7. **Ongeldig melden als opdracht.** Bij gecentraliseerde regie volgt op `permanent-failure` een taak die het e-mailadres bij de Profielservice ongeldig meldt: een idempotente aanroep over FSC met het identificerend nummer in de body. Het event "onbereikbaar" gaat zonder persoonsgegevens het log in; de opvolging ligt bij de DV.
8. **Eigen taakmechaniek.** Claim-SQL, lease, claim-epoch, het budgetgestuurde batch-claimen en de verdeling over DV's zijn eigen code; een bestaande jobbibliotheek biedt het claim-epoch in de commit en de verdeling over DV's niet.
9. **Autorisatie per DV.** De DV-koppelvlakken worden ontsloten over FSC. Elke aanroep draagt een OAuth2-toegangstoken volgens het NL GOV Assurance profile for OAuth 2.0 (client credentials met `private_key_jwt`), uitgegeven door de IAM-gateway van MOZa, met het OIN van de DV als claim. Een dienstverlenerregister, gevuld bij onboarding, koppelt het OIN aan de `dvId` en houdt per DV de toegestane berichttypen, de quota, de webhook, de bevestigingstermijn, de maximale cursorleeftijd en het beheerkanaal. De `dvId` staat op de notificatie en op elk event; status, zoeken, annuleren, feed en bevestiging werken uitsluitend binnen de `dvId` uit het token, en een notificatie van een andere DV bestaat voor de aanroeper niet (404). De HMAC over DV-id en `dvRef` maakt zoeken per DV afgesloten; `dvRef` is per contract een ondoorzichtige referentie zonder persoonsgegevens. Quota per DV worden bij de aanname afgedwongen (429), de feed heeft een maximale paginagrootte en een aanroeplimiet per DV. De redenen die de DV ziet zijn grof: `onbereikbaar`, `geen-contactgegevens`, `verlopen`, `geannuleerd`, `technisch`; een onbekende partij en een ontbrekende voorkeur vallen beide onder `geen-contactgegevens`, en een DV met een ongewoon hoog aandeel `geen-contactgegevens` wordt gemeld.
10. **Verwerkingslogging.** Elke taak die persoonsgegevens verwerkt of verstrekt (verzenden inclusief voorkeur ophalen, reconciliëren, ongeldig melden, terugkoppelen) schrijft een LDV-registratie vóór de externe aanroep, onder de trace-id die de taak van de aanname heeft meegekregen; een mislukte externe aanroep na een geschreven registratie is aanvaarde overrapportage. De feed schrijft per opgevraagde pagina één LDV-registratie voor de DV, vóór het antwoord. Een LDV-registratie die niet weggeschreven kan worden stelt de taak uit, zonder dat de pogingenteller oploopt, en laat een feedaanroep falen.

### Wijziging van ADR 0020

De keuze uit ADR 0020 voor CloudEvents, de status-query en de webhook als push blijft staan; deze ADR voegt de cursorfeed met bevestiging toe, die in ADR 0020 niet als optie was gewogen, en wijzigt twee punten. `subject` is de notificatie-id, omdat het log geen DV-referentie bevat. De inkomende DV-koppelvlakken lopen over FSC, met daarbovenop een OAuth2-token op berichtniveau dat de DV identificeert.

De CloudEvents in feed en webhook hebben: `id` het event-id, `source` de URI van het NMC, `type` `nl.overheid.moz.notificatie.status.<naar>`, `subject` de notificatie-id, `time` het tijdstip, `sequence` het volgnummer met `sequencetype` `Integer`, en als data `van`, `naar`, `reden` en `versie`. `sequence` is per `subject` oplopend; de feed als geheel heeft geen doorlopende teller, de cursor vervult die rol.

De paden dragen een major-versie: `POST /v1/notificaties/centraal`, `POST /v1/notificaties/decentraal`, `GET /v1/notificaties/{id}`, `GET /v1/notificaties?dvRef=` (een lijst), `DELETE /v1/notificaties/{id}` (annuleren), `GET /v1/notificaties/wijzigingen?cursor=`, `PUT /v1/notificaties/wijzigingen/bevestiging`, en de receipt-callback `POST /v1/notifynl/receipts`. Fouten zijn RFC 9457-problemen met een eigen type voor het quotum (429) en voor een vervallen cursor (410).

### Per stap: event of opdracht

"Event" betekent in deze ADR: een rij in het eventlog, gelezen door consumers met een cursor onder een visibiliteitswatermerk. Nergens is een broker of choreografie bedoeld. Per stap staat hieronder wat een event-model op die plek zou opleveren en wat de doorslag gaf. Twee constateringen gelden voor elke stap:

* Meerdere replica's van een worker zijn geen fan-out. Replica's zijn competing consumers: elke taak moet bij precies één van hen landen. `SKIP LOCKED` levert die verdeling; een broker-queue levert dezelfde semantiek via een tweede systeem. Fan-out speelt alleen waar verschillende consumers elk álle events willen zien, en dat is stap 5.
* De afleversemantiek is in beide modellen at-least-once. Een verlopen lease en een unacked bericht dat opnieuw wordt aangeboden zijn hetzelfde verschijnsel; de dedup bij de externe partij (opzoeken op `reference`) blijft in elk ontwerp nodig. Het verschil zit in de stappen waarvan het werk zelf een databaseschrijfactie is: daar vallen werk en bevestiging in één transactie samen, terwijl een broker-consumer per stap twee systemen beslaat en dus een outbox of eigen idempotentie nodig heeft.

#### 1 Aanname: opdracht

Synchroon verzoek, één transactie (notificatie, eerste taak, eerste event), 202 met notificatie-id; idempotent op DV plus `dvRef`-HMAC plus payload-hash, binnen de bewaartermijn van de notificatie; een batch-id groepeert alleen de aanlevering.

*Wat een event zou opleveren:* acceptatie ontkoppeld van de opslag, met een queue die piekmomenten absorbeert.

*Doorslag:* de notificatierij is zelf al de buffer; na de 202 loopt de verzendpijplijn in eigen tempo leeg. Een 202 vóór duurzame opslag breekt de eis dat een geaccepteerde notificatie nooit verloren gaat, de DV heeft synchrone validatie en een direct bruikbaar handvat nodig, en stap 6 zou eventual consistent worden (404 direct na de 202).

#### 2 Verzenden en voorkeur ophalen: opdracht

Geleasede taak, batch-claim tegen het verzendbudget per Notify-service. Elke claim van een verzendtaak, eerste verzending of herverzending, loopt via de overgangsfunctie onder de rijvergrendeling: `aangenomen` naar `in-verzending` voor de eerste poging, `verzonden` naar `verzonden` met een nieuwe poging voor een herverzending; is de notificatie inmiddels terminaal of `bezorgd`, dan wordt de taak afgerond zonder verzending. Zo delen annuleren, claimen en een late receipt dezelfde vergrendeling. De commit na de 201 loopt via dezelfde functie (`in-verzending` naar `verzonden`, of het vastleggen van de poging bij een herverzending) en plant de navraagtaak voor de poging, met `due` na een uur. Een herclaim na een verlopen lease is geen overgang: hij hergebruikt dezelfde poging, verhoogt het claim-epoch en zoekt eerst op `reference`; een tweede verzending blijft mogelijk wanneer de eerste aanroep nog onderweg was, en de commit met het lagere claim-epoch wordt geweigerd. Een dubbele e-mail na een verlopen lease is een aanvaard risico; de lease begrenst het niet, de zoekopdracht op `reference` verkleint het.

*Wat een event zou opleveren:* push naar workers zonder polling, backpressure via prefetch, schalen op queue-diepte.

*Doorslag:* de verzendsnelheid wordt begrensd door het verzendbudget, een gedeelde teller in de database; push verplaatst alleen waar de achterstand staat. De dedup en de statuscommit blijven ook met een broker nodig, maar beslaan dan twee systemen. En tussen voorkeur- en verzendstap zou het e-mailadres berichtinhoud op de broker worden.

#### 3 Receipt: inkomend event, georkestreerde verwerking

Eerst opslaan (zonder het e-mailadres uit de receipt), dan 200 antwoorden, daarna verwerken onder rijvergrendeling; de afleverstatus-navraag garandeert de eindstatus.

*Dit is het eventvormige deel:* NotifyNL meldt een event, en het ontwerp behandelt het zo: opslaan vóór verwerken, herverwerkbaar.

*Waarom geen broker ertussen:* de receipts komen bij NotifyNL vandaan al at-least-once en ongeordend, dus dedup en ordening horen bij de overgangsfunctie onder rijvergrendeling. De opslag-eerst-tabel is al de queue; een broker zou dezelfde regels een tweede keer nodig hebben.

#### 4a Herverzending en verval: opdracht

`due` als timer; beleid per berichttype; `geldig_tot` geldt voor het starten van een poging: een verzending of herverzending wordt na `geldig_tot` niet meer gestart en de notificatie eindigt dan in `verlopen`; een poging die al bij NotifyNL ligt loopt door tot haar uitkomst, ook na `geldig_tot`.

*Wat een event zou opleveren:* delayed messages als retrymechanisme en een dead-letter-queue na uitputting.

*Doorslag:* de vertragingen zijn uren tot 72 uur en de aantallen op piekmomenten groot; daar zijn delayed exchanges ongeschikt voor. Annuleren tot aan de claim is bij een `due`-rij een update; een gepubliceerd uitgesteld bericht is niet meer in te trekken.

#### 4b Ongeldig melden: een event zonder persoonsgegevens, dan een opdracht

Het event "onbereikbaar" gaat het log in; de DV leest het via stap 5. Bij gecentraliseerde regie volgt direct op `permanent-failure` een taak die het e-mailadres bij de Profielservice ongeldig meldt, idempotent over FSC.

*Wat een event zou opleveren:* "onbereikbaar" als event waarop een consumer reageert. Dat event bestaat, en de DV is er de consument van.

*Doorslag:* het ongeldig melden wijzigt gegevens bij een andere dienst en vereist bevestiging en idempotentie: opdracht-semantiek. De Profielservice abonneert niet op een interne broker en het identificerend nummer hoort niet in een event.

#### 5 Terugkoppelen: event

Elke overgang is een event in het log; status-query, cursorfeed en optionele dispatcher lezen het; de DV bevestigt met een cursor per DV.

*Waarom hier wél:* dit is het enige punt met echte fan-out. Feed, dispatcher, rapportage en afleverbewijs consumeren dezelfde events, elk in eigen tempo, met een cursor die door het watermerk nooit een event overslaat.

*Waarom als log en geen broker-topic:* de consumers zijn DV's van uiteenlopende volwassenheid buiten onze infrastructuur; pull met bevestiging dekt ze allemaal (zie alternatief 5), en het log is tegelijk het afleverbewijs met zijn eigen bewaartermijn.

#### 6 Status opvragen: query

Lezen van de eigen status, met versie, op notificatie-id of via `GET /v1/notificaties?dvRef=` op de `dvRef`-HMAC binnen de eigen DV.

*Wat een event-model zou opleveren:* een apart leesmodel (projectie) dat onafhankelijk schaalt.

*Doorslag:* de status is al het leesmodel en is consistent vanaf de 202. Een projectie zou eventual consistent zijn en een tweede opslag vragen zonder leesvolume dat erom vraagt.

### Statusmodel

`notificatie.status`: `aangenomen`, `in-verzending`, `verzonden`, `bezorgd`, en terminaal `definitief-bezorgd`, `niet-bezorgbaar`, `technisch-mislukt`, `bezorgstatus-onbekend`, `verlopen`, `geannuleerd`. `bezorgd` is niet terminaal: binnen de vaststellingstermijn kan een `temporary-failure` of `permanent-failure` de notificatie nog naar `verzonden`, `niet-bezorgbaar` of `verlopen` brengen. Terminale statussen zijn absorberend, met als enige uitzondering `bezorgstatus-onbekend`, dat door een laat event naar `bezorgd` of `niet-bezorgbaar` mag; een late `temporary-failure` of `technical-failure` wordt daar alleen op de poging vastgelegd, zonder herverzending.

`poging.status`: `gepland`, `verzonden`, `bezorgd`, `tijdelijk-mislukt`, `permanent-mislukt`, `technisch-mislukt`, `onbekend`. Een poging is lopend zolang haar status `verzonden` of `onbekend` is.

Overgangsregels, in één functie voor receipts en afleverstatus-navraag:

* Claim van de eerste verzendtaak: `aangenomen` naar `in-verzending`; claim van een herverzending: `verzonden` naar `verzonden` met een nieuwe poging; annuleren kan alleen vanuit `aangenomen`.
* `delivered` op welke poging dan ook, ook op een duplicaat-id: `bezorgd`; een nog openstaande verzendtaak wordt bij de claim afgerond zonder verzending. De vaststeltaak brengt `bezorgd` na de vaststellingstermijn naar `definitief-bezorgd`.
* Een `temporary-failure` of `permanent-failure` op de poging waarop `bezorgd` rust volgt binnen de vaststellingstermijn de regels hieronder alsof de poging nog liep: `verzonden` met een herverzendtaak, `niet-bezorgbaar` of `verlopen`; de open vaststeltaak wordt daarbij afgerond zonder overgang. Na die termijn, en voor elke andere niet-lopende poging, wordt de receipt op de poging vastgelegd zonder overgang van de notificatie.
* `permanent-failure`: `niet-bezorgbaar` met reden `onbereikbaar`.
* Een notificatie krijgt in totaal één herverzending, ongeacht de faalsoort: `temporary-failure` of `technical-failure` op de eerste poging plant een herverzendtaak, waarvan de claim de nieuwe poging aanmaakt; op de tweede poging geeft `temporary-failure` `niet-bezorgbaar` met reden `onbereikbaar` en `technical-failure` `technisch-mislukt`.
* Een 4xx van NotifyNL over het adres (validatiefout op het e-mailadres): `niet-bezorgbaar` met reden `onbereikbaar`. Een 401, 403, 429 of 5xx, een verbindingsfout of een time-out betreft de aanroep, niet de poging: de taak wordt uitgesteld en herhaald zonder dat de pogingenteller oploopt. Een storing bij NotifyNL kost de notificatie geen poging; het wachten wordt alleen door `geldig_tot` begrensd: verstrijkt dat tijdens het uitstel, dan eindigt de notificatie in `verlopen`. Een 404 op een statusopvraag, of het einde van de bewaartermijn van NotifyNL zonder uitkomst: `bezorgstatus-onbekend`.
* Een 4xx van de Profielservice over de partij (onbekend nummer, geen voorkeur): `niet-bezorgbaar` met reden `geen-contactgegevens`. Andere fouten van de Profielservice: uitstel en herhaling, eveneens zonder dat de pogingenteller oploopt.
* Een `temporary-failure` of `technical-failure` na `geldig_tot`, of een uitstel dat `geldig_tot` passeert: `verlopen` in plaats van een herverzending.
* Ongeldig melden bij de Profielservice volgt op elke `permanent-failure` die op een poging past, ook via een duplicaat-id.
* Een dubbele of ongeordende receipt is een no-op; alle lezingen van pogingen gebeuren binnen de rijvergrendeling.

## Alternatieven

### 1. Volledig event-driven: choreografie over een message broker

Elke stap publiceert een bericht (RabbitMQ met acknowledgements, of Kafka); consumers reageren; de status ontstaat als projectie.

Voordelen: ontkoppeling van stappen, push in plaats van polling, backpressure via prefetch, fan-out naar meerdere consumers, en een model dat aansluit bij het asynchrone karakter van het domein.

Waarom niet:

* De invarianten zijn per notificatie: toegestane overgangen, idempotentie per poging, timers van uren tot weken. Choreografie verspreidt die invarianten over elke consumer, en elke consumer heeft dan alsnog de statusopslag nodig.
* "Status wijzigen en volgende stap publiceren" is in een broker-ontwerp een dubbele schrijfactie. De oplossing is een outbox-tabel, en die outbox is precies de takentabel uit dit ontwerp.
* Acknowledgements geven at-least-once aflevering; idempotentie blijft een eigenschap van de consumer en van zijn statusopslag. Op dat punt is een broker gelijkwaardig aan een lease op een databaserij.
* Timers passen niet in een broker. De delayed-message-exchange van RabbitMQ bewaart uitgestelde berichten op één node, verliest ze bij uitval van die node en is ongeschikt voor honderdduizenden tot miljoenen uitgestelde berichten; een piekmoment levert precies dat op. Kafka kent geen per-bericht acknowledgement en blokkeert een partitie op één trage afnemer.
* Tussen de voorkeurstap en de verzendstap zou het e-mailadres als berichtinhoud over de broker gaan. Het alternatief, beide stappen in één consumer, is orkestratie.
* Het status-endpoint wordt eventual consistent; een DV die direct na de 202 de status opvraagt kan een 404 krijgen.
* De Profielservice en de DV's zijn andere diensten; zij consumeren niet van een interne broker. Het enige echte fan-out-punt, stap 5, wordt door het eventlog al bediend.
* Een broker is een tweede stateful systeem met eigen beheer voor een klein team, zonder consumer die hem nodig heeft.

### 2. Workflow-engine (Temporal, Zeebe, Restate)

Eén duurzame workflow per notificatie met activiteiten, retries, timers en signalen als primitieven.

Voordelen: timers, retries, signalen en versionering zijn opgelost; workers zijn stateless en schalen op de taakachterstand; goede zichtbaarheid per uitvoering.

Waarom niet:

* Een tweede bron van waarheid. De activiteit schrijft naar PostgreSQL, de engine legt de voltooiing vast in zijn eigen history: een dubbele schrijfactie die alleen door idempotentie van de activiteit wordt opgevangen.
* Stap 6 heeft geen consistent leespad: een query aan de engine herspeelt de history via een worker en de visibility-opslag is eventual consistent, terwijl een projectie pas door een activiteit wordt gevuld, na de acceptatie.
* De history blijft na afsluiting de ingestelde bewaartermijn staan; eerder verwijderen is een beheerhandeling. Wissen kan alleen door de sleutel te vernietigen, waarna herspelen en queries op afgesloten uitvoeringen breken.
* Uitvoeringen leven weken; elke wijziging in de workflowcode vraagt versionering en determinisme-discipline.
* Temporal zelf hosten betekent vier services plus opslag; Temporal Cloud is een Amerikaanse SaaS; Zeebe vereist sinds Camunda 8.6 een commerciële licentie voor productie; Restate is jong. Voor een klein team is dat veel beheer voor mechaniek die een takentabel met `due`, lease en pogingenteller ook biedt.

### 3. Event sourcing in PostgreSQL

Het eventlog als enige bron van waarheid; de status als projectie.

Voordelen: één schrijfactie, het afleverbewijs zit in het log, geen discipline van "beide bijwerken".

Waarom niet: stap 6 vereist een projectie in dezelfde transactie, en dan vallen beide ontwerpen samen. Event sourcing lost de commit-ordening van de feed en de gelijktijdigheid van taken op dezelfde notificatie niet op, en herspelen en versioneren van items die weken leven is zwaarder dan een migratie op rijen. De gekozen variant houdt de status als bron en dwingt met een trigger af dat elke overgang een event schrijft.

### 4. RabbitMQ als werkwachtrij naast PostgreSQL als bron van waarheid

Voordelen: push naar workers, backpressure via prefetch, dead-letter exchange, geen polling-last op de database.

Waarom niet: de timers kunnen er niet in (zie alternatief 1), dus de timers staan toch in PostgreSQL en de broker verdubbelt de `SKIP LOCKED`-claim. De publicatie vanuit de transactie vergt een outbox. Extra cluster zonder functionele winst.

### 5. Push (webhook) als primair DV-contract

Voordelen: de DV krijgt de status direct; sluit aan bij het webhook-patroon van de NL API Strategie.

Waarom niet als basis: het NMC weet dan niet of de DV de terminale status heeft ontvangen, en veel DV's kunnen geen beveiligd inkomend endpoint bieden. Een niet-bereikbare webhook zou bovendien per event retries opleveren en een terugkerende DV overspoelen. De status-query en de cursorfeed dekken elke DV; de webhook blijft als optie, in lijn met ADR 0020.

### 6. Minimale registratie die na de terugkoppeling wordt gewist

Alleen referentie, status en callback-URL bewaren en de rij na de terugkoppeling verwijderen.

Waarom niet: zonder eventlog is het afleverbewijs niet reproduceerbaar, bestaat er geen feed en geen bevestiging, en is elke verloren callback een stille stop. De dataminimalisatie wordt bereikt door het log persoonsgegevensvrij te houden en de versleutelde velden met de sleutel te wissen.

### 7. Statusgeschiedenis per notificatie met directe push

Per notificatie een geordende lijst van statussen met de receiptwaarden van NotifyNL, een projectie van de laatste status op de rij, en bij elke nieuw vastgelegde status direct een push naar de callback-URL van de DV.

Voordelen: het afleverbewijs zit in de geschiedenis, elke overgang is een insert, en de push is eenvoudig.

Waarom niet als eindontwerp: de geschiedenis is per notificatie geordend en heeft geen positie in commit-volgorde, dus er is geen cursor waarmee een DV de events van al zijn notificaties zonder gaten leest, en geen bevestiging; een push die na de laatste poging niet is aangekomen is verloren. De ene statuslijst vermengt de status van de notificatie met de uitkomst van een verzendpoging, waardoor een herverzending en een late receipt op een eerdere poging niet uit te drukken zijn en niet is belegd welke uitkomst telt. Optimistic locking laat twee gelijktijdige receipts botsen in plaats van ze te serialiseren. De gekozen variant houdt de insert-only geschiedenis op volgnummer, maakt van het volgnummer de versie van de notificatie, splitst notificatiestatus en pogingstatus en leest de terugkoppeling uit het log.

## Consequences

* Acceptatie (202) betekent duurzaam opgeslagen. Elke niet-terminale status heeft een open taak of een timer, en de controletaak herstelt een notificatie zonder open of mislukte taak; de afleverstatus-navraag maakt het NMC onafhankelijk van het callback-venster van NotifyNL.
* Een faalreceipt na `delivered` die het callback-venster van NotifyNL niet haalt blijft onopgemerkt: de afleverstatus-navraag kijkt alleen naar pogingen zonder receipt en de vaststeltaak vraagt niets na. Het receipt-endpoint slaat eerst op en antwoordt daarna, dus dat verlies vergt een storing van dat endpoint langer dan het callback-venster. Dit is een aanvaard risico.
* Alle schrijvers op een notificatie zijn geserialiseerd via de rijvergrendeling in de overgangsfunctie; de verzend-commit wordt door diezelfde functie bewaakt, zodat een receipt die eerder binnenkomt dan de verzend-commit niet wordt overschreven.
* Workers zijn stateless; schalen gebeurt op `min(achterstand, beschikbare tokens)` per verzendbudget. De lease dekt de geclaimde batch en wordt per taak verlengd vóór elke externe aanroep; de terminatieperiode van een pod is langer dan één HTTP-timeout plus commit, en elke commit draagt het claim-epoch.
* Een piekmoment van één DV wordt bij de aanname gebufferd; de claim verdeelt elke batch over de DV's met openstaand werk, in volgorde van `due` per DV en binnen het verzendbudget, zodat een piek van één DV de andere DV's niet blokkeert. Quota per DV worden bij de aanname afgedwongen.
* Het eventlog wordt gepartitioneerd op bereiken van transactie-id; een partitie wordt pas verwijderd nadat haar jongste event ouder is dan de bewaartermijn van het afleverbewijs, en dan alleen als geen bevestiging of leverpositie er nog naar wijst; een cursor of leverpositie ouder dan de maximale cursorleeftijd van die DV telt daarbij niet meer mee en krijgt 410, respectievelijk herstart vanaf het oudste beschikbare event. De takentabel wordt per soort gepartitioneerd en rijen worden na afronding verwijderd. Het verzendbudget is een rij per Notify-service per tijdvak van een minuut, aangemaakt door de eerste claim in dat tijdvak (`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`), zonder aparte bijvuller en zonder een andere lock; niet-gebruikte tokens vervallen met het tijdvak, en de afleverstatus-navraag heeft een vast aandeel van elk tijdvak. Het NMC gebruikt eigen NotifyNL-services; andere MOZa-diensten delen die niet, zodat het budget de enige verbruiker van de limiet is. Elke databaserol heeft een statement-timeout, een transaction-timeout en een idle-in-transaction-timeout, omdat elke lopende schrijftransactie het watermerk van de feed vasthoudt; opruimen en wissen lopen in kleine batches met korte transacties. Rapportage en feed-scans draaien op de replica, waarbij feed en watermerk uit dezelfde snapshot komen; de feed heeft een maximale paginagrootte en een aanroeplimiet per DV. De modulegrens van de verzendpijplijn (raakt alleen `taak`, `poging` en `verzendbudget` en roept de overgangsfunctie aan) ligt vanaf het begin vast.
* De replica draait synchroon met `ANY 1` van twee standbys onder een operator met automatische failover die alleen de standby met de hoogste LSN promoveert, zodat een bevestigde commit niet verloren gaat; één synchrone standby zou bij uitval alle commits blokkeren.
* De databaseverbindingen lopen via een pooler; het ontwerp verdraagt transaction pooling doordat elke lock-constructie (rijvergrendeling, `SKIP LOCKED`-claim) binnen één transactie blijft en session-afhankelijke features (session-level advisory locks, `LISTEN/NOTIFY`) niet worden gebruikt.
* Registratie van webhooks, quota per DV, verzendvensters, een batch-endpoint en annulering tot aan de claim horen bij het DV-contract. Een batch-id groepeert alleen de aanlevering; elke notificatie houdt haar eigen identiteit, levenscyclus, status en annulering, ook wanneer een DV miljoenen notificaties één voor één aanbiedt.
* Een webhook-URL wordt bij registratie gevalideerd (alleen https, publiek adres, geen redirects, herresolutie bij elke aanroep) en opgenomen in de egress-allowlist. De JWT op de webhook heeft het NMC als `iss`, de webhook-URL als `aud` en een korte geldigheid; de DV controleert de handtekening met de publieke sleutel uit de JWKS van het NMC. Na een per DV afgesproken aantal mislukte leveringen pauzeert de webhook en blijft de feed het pad; de terugkoppeltaak levert alleen vanaf de eigen leverpositie, nooit per event opnieuw.
* Het receipt-endpoint is vanaf internet bereikbaar en valt onder het dreigingsmodel: het bearer-token van NotifyNL (twee tegelijk geldige tokens, zodat rotatie zonder onderbreking kan), een aanroeplimiet op de ingress, de schema- en omvangvalidatie vóór opslag en de koppeling op `reference` bepalen samen of een receipt wordt opgeslagen; afgewezen receipts worden geteld en niet bewaard. De authenticatie richting NotifyNL is een JWT, geen mTLS.
* De bewaking bestaat uit zeven metrieken met een alarm: de leeftijd van het watermerk, de achterstand per taaksoort, het aantal taken met status `mislukt`, het aantal notificaties in `bezorgstatus-onbekend`, het aantal onbevestigde terminale statussen per DV, het aantal afgewezen receipts en het aandeel `geen-contactgegevens` per DV.
* Dataminimalisatie steunt op sleutelbeheer: de KEK en de peppers staan in de sleutelvoorziening van het platform, niet in de omgeving van de applicatie. De KEK en de peppers worden bij het opstarten uit de sleutelvoorziening gehaald en alleen in het geheugen gehouden. De pepper is per doel verschillend (DV-referentie, LDV-pseudoniem) en draagt een versie op de rij. Een pepper wordt niet herberekend, omdat de invoer niet bewaard wordt: een nieuwe versie geldt voor nieuwe rijen, een zoekopdracht toetst tegen alle versies die nog op rijen staan, en een gecompromitteerde pepper leidt tot versneld wissen van de rijen met die versie. De wislatentie is gelijk aan de bewaartermijn van de back-ups; na het wissen van de sleutel is de rij pseudoniem, en de rijen in `notificatie` en `poging` worden door de onderhoudstaak verwijderd na de bewaartermijn van het afleverbewijs. Het eventlog is pseudonieme informatie die door de DV herleidbaar is; per tabel is doel en bewaartermijn vastgelegd.
* Het statusmodel en de overgangsregels in deze ADR vervangen het model in `notificatiedocs/08-data.md`; de hoofdstukken 3, 4 en 5 volgen dit ontwerp voor dataminimalisatie, degradatie en terugkoppeling, en de container- en componentbeschrijving in `notificatiedocs/06-software-architectuur.md` volgt dit ontwerp (aanname, workers, eventlog en dispatcher in plaats van één orchestrator).
* De statusgeschiedenis van de huidige implementatie gaat op in dit ontwerp: het volgnummer per notificatie wordt de versie van de notificatie en het volgnummer van het event, de projectie van de laatste status wordt `notificatie.status`, de receiptwaarden van NotifyNL worden de status van de poging met het tijdstip van de bron erbij, en de directe push per status wordt de terugkoppeltaak die het log leest.

### Buiten deze beslissing

* De tenancy bij NotifyNL: één service met onderhandelde limieten en één afzenderidentiteit, of een service per DV. Het verzendbudget en de templateregistratie werken in beide varianten.
* De wettelijke bewaartermijn voor het afleverbewijs; in dit ontwerp is de bewaartermijn een configuratiewaarde per omgeving.

## Verwijzingen

* [notificatiedocs §02 Functioneel overzicht](../notificatiedocs/02-functioneel-overzicht.md)
* [notificatiedocs §06 Software architectuur](../notificatiedocs/06-software-architectuur.md)
* [notificatiedocs §08 Data](../notificatiedocs/08-data.md)
* [GOV.UK Notify REST API](https://docs.notifications.service.gov.uk/rest-api.html): callbacks, statussen, limieten, bewaartermijn
* [PgBouncer features](https://www.pgbouncer.org/features.html): beperkingen van transaction pooling
* [RabbitMQ delayed message exchange](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange): beperkingen voor grote aantallen uitgestelde berichten
* [Temporal Server](https://docs.temporal.io/temporal-service/temporal-server): componenten en bewaartermijn van history
* [Camunda 8 licenties](https://docs.camunda.io/docs/reference/licenses/)
* [NL GOV profile for CloudEvents](https://logius-standaarden.github.io/NL-GOV-profile-for-CloudEvents/): `sequence` voor pull-consumers, geen gevoelige data in contextattributen
