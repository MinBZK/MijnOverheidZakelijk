# 22. Georkestreerde state machine met eventlog voor de notificatielevenscyclus

Datum: 2026-08-31

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): keuze voor NotifyNL als verzendkanaal; de eigenschappen van NotifyNL bepalen een groot deel van deze beslissing.
* [ADR 0020 Standaard afleverstatus-terugkoppeling](0020-standaard-afleverstatus-terugkoppeling.md): status-query als basis en een optionele push naar de dienstverlener. Deze ADR legt vast hoe het NMC die terugkoppeling intern voedt.
* [ADR 0021 Twee regie-modellen](0021-twee-regie-modellen-ipv-scenarios.md): gecentraliseerde en gedecentraliseerde regie; beide modellen doorlopen de stappen uit deze ADR.

## Context

Het Notificatie Management Component (NMC) doorloopt per notificatie zes stappen:

1. Een dienstverlener (DV) biedt een notificatie aan met een eigen referentie (`dvRef`), een berichttype en, afhankelijk van het regie-model, een e-mailadres (gedecentraliseerd) of een identificerend nummer (gecentraliseerd, waarbij het NMC het e-mailadres bij de Profielservice ophaalt).
2. Het NMC biedt het bericht aan bij NotifyNL en ontvangt een NotifyNL-id.
3. NotifyNL meldt de afleverstatus asynchroon op een callback-URL van het NMC.
4. Bij een mislukte aflevering volgt opvolging: herverzending, en bij een onbereikbare ontvanger contactherstel. Bij het decentrale regie model meldt de NMC aan de DV dat de ontvanger onbereikbaar is; de DV levert de gegevens asynchroon aan die de Contactherstel-dienst nodig heeft. De NMC start daarmee contactherstel bij de Contactherstel-dienst. Open vraag of dit ook zo gaat werken voor het centrale regie model, momenteel neigt het voor die om dit geheel door de NMC te laten regelen.
5. Het NMC koppelt de status terug aan de DV.
6. De DV kan de status van een notificatie opvragen.





De kwaliteitseisen, in volgorde van gewicht:

* **Aflevering boven snelheid.** Een geaccepteerde notificatie gaat nooit verloren en eindigt altijd in een finale status waarvan de DV kennis kan nemen.
* **Dataminimalisatie.** Geen persoonsgegevens in logregels of events; identificerende nummers en adressen worden gewist zodra ze niet meer nodig zijn; berichtinhoud wordt niet bewaard.
* **Volume.** Voor het volume is de vraag nog uitstaand, maar 1 heeft aangegeven zoiezo een piek te hebben van 2,2M in één maand. Als wij voorbeelden dat dit potentieel in een periode van 5 dagen 9 uur kan vallen hebben we een losse richtlijn
* **Afnemers van uiteenlopende volwassenheid.** Veel DV's kunnen callback functionaliteit nog niet ondersteunen.
* **Horizontaal schalen.** Alle onderdelen kunnen horizontaal schalen om piek momenten te faciliteren.

De volgende eigenschappen van NotifyNL wegen zwaar in de keuze:

* Verzending wordt bevestigd met een 201 en een NotifyNL-id. De aanroeper geeft een `reference` mee die in de receipts terugkomt en waarop gezocht kan worden.
* Delivery receipts worden naar een callback-URL gepusht. Een mislukte callback wordt vijf keer met een interval van vijf minuten herhaald; daarna is de receipt weg. De receipt bevat het e-mailadres van de ontvanger.
* `temporary-failure` volgt pas nadat de e-mailprovider tot 72 uur heeft geprobeerd af te leveren; `permanent-failure` betekent een ongeldig adres; bij `technical-failure` hoort de aanroeper opnieuw aan te bieden.
* Authenticatie verloopt met een HS256-JWT over het publieke internet; de receipt-callback van het NMC is dus vanaf internet bereikbaar.



De Contactherstel-dienst is een dienst van een andere organisatie, met een doorlooptijd van dagen tot weken.

Vrijwel elke stap is asynchroon en aflevering weegt zwaarder dan snelheid. Dat roept de vraag op of een event-driven architectuur (een message broker met choreografie, of event sourcing) het passende model is, en zo niet, welke stappen dan wel als event en welke als opdracht gemodelleerd horen te worden.

## Decision

Het NMC is eigenaar van de notificatielevenscyclus en voert die uit als een **georkestreerde state machine in PostgreSQL** met een **transactioneel eventlog**. Er komt geen message broker en geen workflow-engine in de kern.

1. **Eén bron van waarheid.** De tabellen `notificatie` en `poging` (één rij per verzendpoging) zijn de bron van waarheid. Eén overgangsfunctie is de enige schrijver van de status; zij vergrendelt de notificatierij (`FOR UPDATE`), toetst de overgang aan de toegestane overgangen en schrijft in dezelfde transactie een event weg in het eventlog `event`. Een databasetrigger weigert een statuswijziging zonder bijbehorend event.
2. **Bijwerkingen als taken.** Verzenden, voorkeur ophalen, receipts verwerken, reconciliëren, contactherstel starten en terugkoppelen zijn rijen in een takentabel met lease, pogingenteller, claim-epoch en een `due`-tijdstip. Workers claimen taken met `SELECT ... FOR UPDATE SKIP LOCKED`, in batches, met tokens uit een verzendbudget per Notify-service. Timers zijn data (`due`), geen berichten. Een uitgeputte taak is zelf een overgang naar een terminale status; er bestaat geen status zonder timer of overgang.
3. **Events naar buiten via het log.** Elke overgang schrijft een rij in `event`: notificatie-id, volgnummer, van, naar, reden, tijdstip. Het log bevat geen persoonsgegevens en geen DV-referentie. Het is commit-geordend (visibiliteitswatermerk op transactie-id), zodat een cursor nooit een event overslaat. Het log is de enige bron voor terugkoppeling aan DV's, voor rapportage en voor het afleverbewijs, met per doel een eigen bewaartermijn en maandpartities.
4. **Inkomende events worden eerst opgeslagen.** De receipt-callback van NotifyNL en de uitkomst-callback van Contactherstel schrijven het inkomende event weg (zonder het e-mailadres uit de receipt) en antwoorden pas daarna met 200; een taak verwerkt het event via de overgangsfunctie. Een reconciler vraagt de status van elke poging zonder receipt op bij NotifyNL na 1, 6, 24 en daarna dagelijks tot de bewaartermijn van NotifyNL; daarna eindigt de poging in `bezorgstatus-onbekend`, de enige terminale status die een later event nog mag corrigeren.
5. **DV-contract: pull als basis, push als versneller.** De DV leest zijn events via bijvoorbeeld een cursorfeed (`GET /notificaties/wijzigingen?since=`). Een bij onboarding geregistreerde webhook is optioneel; een dispatcher per DV leest hetzelfde log, bundelt naar de laatste status per notificatie en levert met een ondertekende bearer-JWT. Beide paden schrijven dezelfde bevestiging (`laatste_bevestigde_sequence`); onbevestigde terminale statussen worden per DV gemeld op een menselijk kanaal.
6. **Persoonsgegevens.** `dvRef` wordt aan de deur vervangen door een peppered HMAC; het NMC bewaart geen door de DV gekozen referentie in platte tekst. Het e-mailadres (gedecentraliseerd) of het identificerend nummer (gecentraliseerd) staat versleuteld op de rij met een sleutel per notificatie, gewrapt door een externe KEK; het wissen van de sleutel is de wisactie. Voor contactherstel staan de door de DV aangeleverde herstelgegevens één keer op het ontvangerrecord, onder een eigen sleutel met een harde bewaargrens die losstaat van de uitkomst; het adres of nummer uit de aanname wordt daarvoor niet bewaard. Het e-mailadres uit de Profielservice wordt binnen de verzendtaak opgehaald en nooit opgeslagen.
7. **Ontvangerrecord.** Een record per ontvanger, gesleuteld op de HMAC van het adres of nummer, houdt onbereikbaarheid en de contactherstel-status bij. Het onderdrukt nieuwe verzendingen alleen na `permanent-failure` of bij ontbrekende contactgegevens, met een vervaltermijn, en wordt vrijgegeven bij een geslaagde aflevering. Contactherstel wordt per ontvanger één keer gestart, met een afkoelperiode; een notificatie voor een ontvanger met lopend contactherstel koppelt daaraan zonder de DV om herstelgegevens te vragen, en een late uitkomst wordt op alle gekoppelde notificaties toegepast.
8. **Contactherstel als opdracht, op verzoek van de DV.** Het event "onbereikbaar" gaat zonder persoonsgegevens het log in en zet de opvolging op `gegevens-gevraagd`; de DV leest dat via de feed of de webhook en levert de herstelgegevens aan met een synchrone, idempotente aanroep (`POST /notificaties/{id}/contactherstel`). Het starten van contactherstel bij de Contactherstel-dienst en het ongeldig melden van een e-mailadres bij de Profielservice zijn idempotente aanroepen over FSC, met de herstelgegevens respectievelijk het identificerend nummer in de body en de voorkeurversie als referentie. Blijven de herstelgegevens binnen de per DV afgesproken termijn uit, dan eindigt de opvolging in `contactherstel-niet-aangevraagd`.
9. **Taakmechaniek uit een bestaande bibliotheek waar mogelijk.** Lease, herhaling en dead-lettering komen uit een bewezen PostgreSQL-jobbibliotheek voor de runtime; het claimbeleid (verzendbudget) is eigen code bovenop die mechaniek. De claim-SQL en lease-semantiek van de bibliotheek worden in het ontwerp vastgelegd.

### Per stap: event of opdracht

"Event" betekent in deze ADR: een rij in het commit-geordende eventlog, gelezen door consumers met een cursor. Nergens is een broker of choreografie bedoeld. Per stap staat hieronder wat een event-model op die plek zou opleveren en wat de doorslag gaf. Twee constateringen gelden voor elke stap:

* Meerdere replica's van een worker zijn geen fan-out. Replica's zijn competing consumers: elke taak moet bij precies één van hen landen. `SKIP LOCKED` levert die verdeling; een broker-queue levert dezelfde semantiek via een tweede systeem. Fan-out speelt alleen waar verschillende consumers elk álle events willen zien, en dat is stap 5.
* De afleversemantiek is in beide modellen at-least-once. Een verlopen lease en een unacked bericht dat opnieuw wordt aangeboden zijn hetzelfde verschijnsel; de dedup bij de externe partij (opzoeken op `reference`) blijft in elk ontwerp nodig. Het verschil zit in de stappen waarvan het werk zelf een databaseschrijfactie is: daar vallen werk en bevestiging in één transactie samen, terwijl een broker-consumer per stap twee systemen beslaat en dus een outbox of eigen idempotentie nodig heeft.



#### 1 Aanname: opdracht

Synchroon verzoek, één transactie (notificatie, eerste taak, eerste event), 202 met notificatie-id; idempotent op DV plus `dvRef`-HMAC plus payload-hash.

*Wat een event zou opleveren:* acceptatie ontkoppeld van de opslag, met een queue die piekmomenten absorbeert.

*Doorslag:* de notificatierij is zelf al de buffer; na de 202 loopt de de verzendpijplijn in eigen tempo leeg. Een 202 vóór duurzame opslag breekt de eis dat een geaccepteerde notificatie nooit verloren gaat, de DV heeft synchrone validatie en een direct bruikbaar handvat nodig, en stap 6 zou eventual consistent worden (404 direct na de 202).

#### 2 Verzenden en voorkeur ophalen: opdracht

Geleasede taak, batch-claim tegen het verzendbudget per Notify-service, commit via de overgangsfunctie met statusbewaking (`gepland` naar `verzonden`); na een herclaim eerst opzoeken op `reference`.

*Wat een event zou opleveren:* push naar workers zonder polling, backpressure via prefetch, schalen op queue-diepte.

*Doorslag:* de verzendsnelheid wordt begrensd door het verzendbudget, een gedeelde teller in de database; push versnelt het verzenden niet, het verplaatst alleen waar de achterstand staat. De dedup en de statuscommit blijven ook met een broker nodig, maar beslaan dan twee systemen. En tussen voorkeur- en verzendstap zou het e-mailadres berichtinhoud op de broker worden.

#### 3 Receipt: inkomend event, georkestreerde verwerking

Eerst opslaan (zonder het e-mailadres uit de receipt), dan 200 antwoorden, daarna verwerken onder rijvergrendeling; de reconciler garandeert de eindstatus.

*Dit is het eventvormige deel:* NotifyNL meldt een event, en het ontwerp behandelt het zo: opslaan vóór verwerken, herverwerkbaar.

*Waarom geen broker ertussen:* de receipts komen bij NotifyNL vandaan al at-least-once en ongeordend, dus dedup en ordening horen bij de overgangsfunctie onder rijvergrendeling. De opslag-eerst-tabel is al de queue; een broker zou dezelfde regels een tweede keer nodig hebben.

#### 4a Herverzending en verval: opdracht

`due` als timer; beleid per berichttype; `geldig_tot` leidt tot `verlopen`.

*Wat een event zou opleveren:* delayed messages als retrymechanisme en een dead-letter-queue na uitputting.

*Doorslag:* de vertragingen zijn uren tot 72 uur en de aantallen op piekmomenten groot; daar zijn delayed exchanges volgens hun eigen documentatie ongeschikt voor. Annuleren tot aan de claim is bij een `due`-rij een update; een gepubliceerd uitgesteld bericht is niet meer in te trekken.

#### 4b Contactherstel en ongeldig melden: een event zonder persoonsgegevens, dan opdrachten

Het event "onbereikbaar" gaat het log in met opvolging `gegevens-gevraagd`; de DV leest het via stap 5 en levert de herstelgegevens aan met een synchrone, idempotente aanroep, zoals in stap 1. Daarna volgen idempotente aanroepen over FSC: contactherstel starten en, bij gecentraliseerde regie, het e-mailadres ongeldig melden bij de Profielservice; dat laatste volgt direct op `permanent-failure`, zonder op de DV te wachten.

*Wat een event zou opleveren:* "onbereikbaar" als event waarop een consumer reageert. Dat event bestaat, en de DV is er de consument van.

*Doorslag:* de uitvoering wijzigt gegevens bij twee andere organisaties en vereist bevestiging en idempotentie: opdracht-semantiek. Die organisaties abonneren niet op een interne broker, de herstelgegevens en het identificerend nummer horen niet in een event, en "één keer per ontvanger met afkoelperiode" is een invariant op het ontvangerrecord.

#### 4c Wachten op de DV en op de uitkomst: inkomende events, georkestreerd wachten

Twee wachtfasen: eerst op de herstelgegevens van de DV, daarna op de uitkomst van de Contactherstel-dienst. Beide events worden eerst opgeslagen; de uitkomst wordt toegepast op alle notificaties van de ontvanger.

*Event waar het er een is:* de DV en de andere organisatie melden elk een event en dat wordt zo opgeslagen.

*Doorslag voor orkestratie eromheen:* het wachten op de DV loopt tot een afgesproken termijn, met een escalatietermijn en een harde bewaargrens voor de herstelgegevens. Dat zijn timers en status van het NMC, geen berichten.

#### 5 Terugkoppelen: event

Elke overgang is een event in het log; cursorfeed en optionele dispatcher lezen het; bevestiging per notificatie.

*Waarom hier wél:* dit is het enige punt met echte fan-out. Feed, dispatcher, rapportage en afleverbewijs consumeren dezelfde events, elk in eigen tempo, met een cursor die door de commit-ordening nooit een event overslaat.

*Waarom als log en geen broker-topic:* de consumers zijn DV's van uiteenlopende volwassenheid buiten onze infrastructuur; pull met bevestiging dekt ze allemaal (zie alternatief 5), en het log is tegelijk het afleverbewijs met eigen bewaartermijnen.

#### 6 Status opvragen: query

Lezen van de eigen status, op notificatie-id of via `POST /notificaties/zoeken` op de `dvRef`-HMAC.

*Wat een event-model zou opleveren:* een apart leesmodel (projectie) dat onafhankelijk schaalt.

*Doorslag:* de status is al het leesmodel en is consistent vanaf de 202. Een projectie zou eventual consistent zijn en een tweede opslag vragen zonder leesvolume dat erom vraagt.

### Statusmodel

`notificatie.status`: `aangenomen`, `verzonden`, en terminaal `bezorgd`, `niet-bezorgbaar`, `technisch-mislukt`, `bezorgstatus-onbekend`, `verlopen`, `geannuleerd`. Terminale statussen zijn absorberend, met als enige uitzondering `bezorgstatus-onbekend`, dat door een laat event naar `bezorgd` of `niet-bezorgbaar` mag.

`notificatie.opvolging` (aparte dimensie, apart teruggekoppeld): `geen`, `gegevens-gevraagd`, `contactherstel-gestart`, `contactherstel-niet-aangevraagd`, `contactherstel-afgerond`, `contactherstel-mislukt`, `contactherstel-alsnog-afgerond`.

`poging.status`: `gepland`, `verzonden`, `bezorgd`, `tijdelijk-mislukt`, `permanent-mislukt`, `technisch-mislukt`, `onbekend`.

Overgangsregels, in één functie voor receipts, reconciler en opvolging:

* `delivered` op de lopende poging: `bezorgd`.
* Een faalreceipt voor een niet-lopende poging wordt op die poging vastgelegd zonder overgang van de notificatie.
* `permanent-failure`: `niet-bezorgbaar` met reden `onbereikbaar`; opvolging naar `gegevens-gevraagd`, of naar `contactherstel-gestart` als voor de ontvanger al contactherstel loopt.
* Herstelgegevens van de DV: opvolging van `gegevens-gevraagd` naar `contactherstel-gestart`; verstrijkt de termijn zonder herstelgegevens: `contactherstel-niet-aangevraagd`.
* `temporary-failure` op poging 1: één herverzending; op poging 2: `niet-bezorgbaar`.
* `technical-failure`: nieuwe poging, begrensd, daarna `technisch-mislukt`.
* Permanente 4xx van NotifyNL of van de Profielservice: direct terminaal (`technisch-mislukt` of `niet-bezorgbaar` naar oorzaak).
* Een dubbele of ongeordende receipt is een no-op.

## Alternatieven

### 1. Volledig event-driven: choreografie over een message broker

Elke stap publiceert een bericht (RabbitMQ met acknowledgements, of Kafka); consumers reageren; de status ontstaat als projectie.

Voordelen: ontkoppeling van stappen, push in plaats van polling, backpressure via prefetch, fan-out naar meerdere consumers, en een model dat aansluit bij het asynchrone karakter van het domein.

Waarom niet:

* De invarianten zijn per notificatie: toegestane overgangen, idempotentie per poging, timers van uren tot weken. Choreografie verspreidt die invarianten over elke consumer, en elke consumer heeft dan alsnog de statusopslag nodig.
* "Status wijzigen en volgende stap publiceren" is in een broker-ontwerp een dubbele schrijfactie. De oplossing is een outbox-tabel, en die outbox is precies de takentabel uit dit ontwerp.
* Acknowledgements geven at-least-once aflevering; idempotentie blijft een eigenschap van de consumer en van zijn statusopslag. Op dat punt is een broker gelijkwaardig aan een lease op een databaserij.
* Timers passen niet in een broker. De delayed-message-exchange van RabbitMQ bewaart uitgestelde berichten op één node, verliest ze bij uitval van die node en is volgens de eigen documentatie ongeschikt voor honderdduizenden tot miljoenen uitgestelde berichten; een piekmoment levert precies dat op. Kafka kent geen per-bericht acknowledgement en blokkeert een partitie op één trage afnemer.
* Tussen de voorkeurstap en de verzendstap zou het e-mailadres als berichtinhoud over de broker gaan. Het alternatief, beide stappen in één consumer, is orkestratie.
* Het status-endpoint wordt eventual consistent; een DV die direct na de 202 de status opvraagt kan een 404 krijgen.
* De Contactherstel-dienst en de DV's zijn andere organisaties; zij consumeren niet van een interne broker. Het enige echte fan-out-punt, stap 5, wordt door het eventlog al bediend.
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

Waarom niet als basis: het NMC weet dan niet of de DV de terminale status heeft ontvangen, en veel DV's kunnen geen beveiligd inkomend endpoint bieden. Een niet-bereikbare webhook zou bovendien per event retries opleveren en een terugkerende DV overspoelen. De cursorfeed met bevestiging dekt elke DV; de webhook blijft als optie, in lijn met ADR 0020.

### 6. Minimale registratie die na de terugkoppeling wordt gewist

Alleen referentie, status en callback-URL bewaren en de rij na de terugkoppeling verwijderen.

Waarom niet: zonder eventlog is het afleverbewijs niet reproduceerbaar, bestaat er geen feed en geen bevestiging, en is elke verloren callback een stille stop. De dataminimalisatie wordt bereikt door het log persoonsgegevensvrij te houden en de versleutelde velden met de sleutel te wissen.

## Consequences

* Acceptatie (202) betekent duurzaam opgeslagen. Elke niet-terminale status heeft een timer of een uitgeputte-taak-overgang; de reconciler maakt het NMC onafhankelijk van het callback-venster van NotifyNL.
* Alle schrijvers op een notificatie zijn geserialiseerd via de rijvergrendeling in de overgangsfunctie; de verzend-commit wordt door diezelfde functie bewaakt, zodat een receipt die eerder binnenkomt dan de verzend-commit niet wordt overschreven.
* Workers zijn stateless; schalen gebeurt op `min(achterstand, beschikbare tokens)` per verzendbudget. Lease is langer dan HTTP-timeout plus commit, de terminatieperiode is langer dan de lease, en elke commit draagt het claim-epoch.
* Een piekmoment van één DV wordt bij de aanname gebufferd en door de verzendpijplijn in volgorde van `due` afgevoerd, binnen het verzendbudget. Er is geen wachtrij of verdeling per DV; de quota per DV in het contract begrenzen de aanlevering.
* Het eventlog wordt maandelijks gepartitioneerd; de takentabel wordt per soort gepartitioneerd en rijen worden na afronding verwijderd. Elke databaserol heeft een statement-timeout; rapportage en lange feed-scans draaien op de replica. Met die discipline draagt één primary in de orde van 1 tot 5 miljoen notificaties per dag; daarboven wordt de takentabel met het verzendbudget afgesplitst naar een eigen database, wat een outbox tussen beide databases vergt. De modulegrens daarvoor (verzendpijplijn raakt alleen `taak`, `poging` en `verzendbudget` en roept de overgangsfunctie aan) ligt vanaf het begin vast.
* De afweging tegen een broker verschuift op twee punten: zodra er binnen het NMC een consumer ontstaat die events per push nodig heeft in plaats van via de feed, en bij de afsplitsing van de verzendpijplijn hierboven; de outbox die die splitsing vergt is het moment waarop een wachtrij tussen de delen een reëel alternatief is.
* De replica draait synchroon met `ANY 1` van twee standbys onder een operator met automatische failover; één synchrone standby zou bij uitval alle commits blokkeren.
* De databaseverbindingen lopen via een pooler; het ontwerp verdraagt transaction pooling doordat elke lock-constructie (rijvergrendeling, `SKIP LOCKED`-claim) binnen één transactie blijft en session-afhankelijke features (advisory locks, `LISTEN/NOTIFY`) niet worden gebruikt.
* De DV-koppelvlakken zijn pull-first. Registratie van webhooks, quota per DV, verzendvensters, het aanleveren van herstelgegevens, een batch-endpoint en annulering tot aan de claim horen bij het contract. Een batch-id groepeert alleen de aanlevering; elke notificatie houdt haar eigen identiteit, levenscyclus, status en annulering, ook wanneer een DV miljoenen notificaties één voor één aanbiedt.
* Het receipt-endpoint is vanaf internet bereikbaar en valt onder het dreigingsmodel; de authenticatie richting NotifyNL is een JWT, geen mTLS.
* Dataminimalisatie steunt op sleutelbeheer: een externe KEK, versionering van de pepper, en een vastgelegde wislatentie die rekening houdt met back-upbewaring. Het eventlog is pseudonieme informatie die door de DV herleidbaar is; per tabel is doel en bewaartermijn vastgelegd. Het onderdrukken van verzendingen over DV's heen op basis van een eerdere permanente fout is een eigen verwerkingsdoel en is als zodanig in de DPIA opgenomen, met een generieke reden richting andere DV's.
* Het statusmodel en de overgangsregels in deze ADR vervangen het model in `notificatiedocs/08-data.md`; de container- en componentbeschrijving in `notificatiedocs/06-software-architectuur.md` volgt dit ontwerp (aanname, workers, eventlog en dispatcher in plaats van één orchestrator).

### Buiten deze beslissing

* De tenancy bij NotifyNL: één service met onderhandelde limieten en één afzenderidentiteit, of een service per DV. Het verzendbudget en de templateregistratie werken in beide varianten.
* Het contract met de Contactherstel-dienst: transport, correlatie, uitkomst-endpoint en escalatietermijn; de inhoud van de herstelgegevens (een adres, of een verwijzing waarmee het adres wordt opgehaald), de termijn waarbinnen de DV ze aanlevert, en wie een eventuele adresopzoeking in BRP of Handelsregister onder welke autorisatie uitvoert.
* De wettelijke bewaartermijnen voor het afleverbewijs en het ontvangerrecord.
* De keuze van de jobbibliotheek voor de runtime.

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
