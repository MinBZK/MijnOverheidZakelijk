## Software architectuur

### Aanleiding

Een Rijksbrede voorziening voor het notificeren is nodig om te kunnen voldoen aan de [Wet Modernisering Elektronisch Bestuurlijk Verkeer (MEBV)](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/wetgeving/wet-modernisering-elektronisch-bestuurlijk-verkeer/), waarbij contactherstel een vereiste is. De dienst werkt dit uit in twee regie-modellen: gecentraliseerd en gedecentraliseerd.

### Regie-model: centraal en decentraal

De Notificatiedienst kent twee modellen voor wie de regie over een verzending voert:

- **Decentrale regie:** de dienstverlener houdt de regie. De Vakapplicatie roept de Output Management Component (OMC) aan; de OMC beschikt zelf al over de contactgegevens en initieert daarmee de notificatie bij het Notificatie Management Component (NMC). Het NMC haalt deze gegevens in dit model niet op.
- **Centrale regie:** de dienstverlener geeft de regie uit handen. Met de juiste juridische grondslag stuurt de organisatie op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC. Het NMC haalt zelf de voorkeur op bij de Profielservice.

![Notificatiedienst Context](embed:NotificatieServiceContext)

De Notificatiedienst bestaat uit het NMC en NotifyNL en verhoudt zich tot de Profielservice en de dienstverleners. MOZa bouwt het NMC en het Notificatieregister; NotifyNL is een bestaande dienst die het NMC aanroept.

![Notificatiedienst Container](embed:NotificatieServiceContainer)

### Componenten van het NMC

![NMC Componenten](embed:NMCComponents)

Het NMC voert de notificatielevenscyclus uit als een georkestreerde state machine in PostgreSQL met een transactioneel eventlog ([ADR 0024](/workspace/decisions#24)). Er is geen message broker en geen workflow-engine; timers zijn `due`-tijdstippen op taken en "event" betekent een rij in het eventlog, gelezen onder een visibiliteitswatermerk. Contactherstel wordt later aan het model toegevoegd; het model beschrijft de levenscyclus tot en met de terugkoppeling van de afleverstatus.

Koppelvlakken naar de dienstverlener:

- de **Centrale-notificatie-controller** neemt verzoeken aan op basis van een identificerend nummer (centrale regie). De aanname is synchroon en antwoordt met 202 nadat notificatie, eerste taak en eerste event in één transactie zijn opgeslagen; de quota per dienstverlener worden hier afgedwongen;
- de **Decentrale-notificatie-controller** doet hetzelfde voor verzoeken met een e-mailadres (decentrale regie);
- de **Notificatiestatus-controller** biedt status opvragen (met versie), zoeken op de dvRef-HMAC en annuleren tot aan de claim;
- de **Notificatiestatus-feed** biedt de cursorfeed van CloudEvents over het eventlog per dienstverlener, de toevoeging van ADR 0024 naast de status-query en de webhook; de dienstverlener verwerkt per notificatie op volgnummer en schrijft de bevestiging; per opgevraagde pagina schrijft de feed een LDV-registratie;
- het **Dienstverlenerregister** koppelt het OIN uit het token aan de dienstverlener en houdt per dienstverlener de toegestane berichttypen, quota, webhook, bevestigingstermijn, maximale cursorleeftijd en beheerkanaal bij, gevuld bij onboarding.

De koppelvlakken worden ontsloten over FSC. Elke aanroep draagt een OAuth2-toegangstoken (NL GOV Assurance profile for OAuth 2.0, uitgegeven door de IAM-gateway van MOZa) met het OIN van de dienstverlener; status, zoeken, annuleren, feed en bevestiging werken uitsluitend binnen die identiteit.

Inkomende events:

- de **Afleverstatus-callback** ontvangt de delivery receipts van NotifyNL, authenticeert en valideert de receipt, slaat het event zonder het e-mailadres uit de receipt op als taak en antwoordt daarna pas met 200. De `reference` is het id van de poging; een receipt met een onbekende `reference` wordt geteld en niet opgeslagen.

Levenscyclus:

- het **Statusbeheer** is de enige schrijver van de notificatiestatus, ook bij de aanname, de claim en het annuleren: het vergrendelt de notificatierij vóór elke schrijfactie op die rij, toetst de overgang aan de toegestane overgangen, verhoogt de versie en schrijft het event. Een databasetrigger houdt de tabel van toegestane paren en weigert een wijziging van de versie zonder event. Elke claim van een verzendtaak is een overgang (`aangenomen` naar `in-verzending`, of een nieuwe poging bij herverzending), zodat annuleren, claimen en een late receipt dezelfde vergrendeling delen;
- de **Verzendverwerker** bestaat uit stateless workers die taken claimen met `SELECT ... FOR UPDATE SKIP LOCKED` op soort, dienstverlener en `due`, in batches die over de dienstverleners met openstaand werk worden verdeeld en binnen het verzendbudget per Notify-service per tijdvak; de claim is een eigen transactie met een lease per batch die per taak wordt verlengd. Taaksoorten: verzenden (inclusief voorkeur ophalen), receipts verwerken, reconciliëren, bezorging vaststellen, terugkoppelen, e-mailadres ongeldig melden, wissen, controle en onderhoud (partities aanmaken, sleutels herwrappen, rijen opruimen). Een uitstel na een fout in de aanroep van NotifyNL of de Profielservice telt niet mee in de pogingenteller. Een uitgeputte verzendtaak leidt tot `technisch-mislukt`; elke andere uitgeputte taak krijgt de status mislukt, telt in een metriek en wacht op beheer, en de controletaak plant voor een notificatie zonder terminale status en zonder open of mislukte taak de ontbrekende taak opnieuw. Elke taak die persoonsgegevens verwerkt of verstrekt schrijft de LDV-registratie vóór de externe aanroep, onder de trace-id van de aanname;
- de **Afleverstatus-navraag** voert de navraagtaken uit die de verzend-commit per poging plant en een receipt afrondt: zij vraagt bij NotifyNL in batches en met een vast aandeel van hetzelfde verzendbudget de status op van elke poging met een NotifyNL-id en zonder receipt, na 1, 6 en 24 uur en daarna dagelijks tot de bewaartermijn van NotifyNL; een 404 of het verstrijken van die termijn leidt tot `bezorgstatus-onbekend`. Daarmee is het NMC onafhankelijk van het callback-venster van NotifyNL;
- de **Notificatiestatus-webhook** is een terugkoppeltaak per dienstverlener die hetzelfde eventlog onder hetzelfde watermerk leest vanaf een eigen leverpositie en elk event, gebundeld per aanroep, levert op een bij onboarding geregistreerde en gevalideerde webhook. Een 2xx op de webhook is geen bevestiging; de bevestiging is de feedcursor die de dienstverlener zelf schrijft. Na herhaald falen pauzeert de webhook en hervat met een oplopende wachttijd; de feed blijft het pad.

Adapters:

- de **Profielservice-adapter** leest de voorkeur binnen de verzendtaak, zonder het e-mailadres op te slaan, en meldt een e-mailadres ongeldig bij de Profielservice, na elke `permanent-failure` die op een poging past, ook via een duplicaat-id;
- de **Verzendadapter** verstuurt via NotifyNL met een template_id en de personalisation, met de poging als `reference`, zoekt na een herclaim eerst op `reference` en vraagt voor de Afleverstatus-navraag statussen in batches op;
- het **Sleutelbeheer** beheert de sleutel per notificatie onder een KEK in de sleutelvoorziening van het platform en de HMAC met een pepper per doel; het wissen van de sleutel is de wisactie.

> De centrale en decentrale intake zijn hier als aparte controllers getekend voor de duidelijkheid. Functioneel kunnen ze ook één API zijn; de keuze hangt af van of de twee regie-modellen een eigen autorisatiegrens nodig hebben (de centrale regie verwerkt immers identificerende nummers onder een eigen grondslag).

De verzending van één notificatie bij centrale regie, met een geslaagde aflevering:

![NMC Verzending](embed:NMCVerzending)

De **notificatiedatabase** (elders het Notificatieregister) is de bron van waarheid. De tabel `dienstverlener` is het register uit de onboarding; `notificatie` en `poging` dragen de status, `taak` de bijwerkingen met soort, dienstverlener, lease, `due` en trace-id, `verzendbudget` de tokens per Notify-service per tijdvak, `event` het eventlog, `bevestiging` de feedcursor per dienstverlener en `webhookpositie` de leverpositie van de webhook. De feed leest het eventlog onder het watermerk van de oudste lopende transactie; het log is gepartitioneerd op bereiken van transactie-id, zodat de feed alleen vanaf de cursor leest, en een partitie wordt pas opgeruimd nadat haar jongste event ouder is dan de bewaartermijn van het afleverbewijs, en alleen als geen bevestiging of leverpositie er nog naar wijst; een cursor ouder dan de maximale cursorleeftijd telt niet meer mee. Het eventlog bevat geen contactgegevens, identificerende nummers of referentie van de dienstverlener; het is pseudoniem en herleidbaar door de dienstverlener, wordt als persoonsgegeven behandeld en is de enige bron voor terugkoppeling, rapportage en afleverbewijs, met de bewaartermijn van het afleverbewijs. Contactgegevens en de waarden voor de personalisation staan op de notificatierij versleuteld met een sleutel per notificatie; het wissen van die sleutel is de wisactie, als taak op een vaste termijn na de terminale status. De referentie van de dienstverlener wordt aan de deur vervangen door een HMAC over dienstverlener en referentie. Hoofdstuk 7 werkt de componenten uit tot klassen.

> Stand van de implementatie: het huidige NMC (PoC-fase) bevat de twee intake-controllers, de Afleverstatus-callback, de Profielservice-adapter, de Verzendadapter, het Statusbeheer (de overgangsfunctie met de databasetrigger) en een callback-adapter die elke overgang na een receipt direct pusht. Het register bewaart per notificatie de status en de versie, per verzending een poging en per overgang een event. Verzenden en receipts verwerken lopen nog synchroon, zonder takentabel; een `temporary-failure` of `technical-failure` is terminaal zolang er geen herverzending is. Een nachtelijke retentiejob verwijdert notificaties waarvan de laatste statuswijziging ouder is dan de bewaartermijn, ongeacht de status. De takentabel, de Afleverstatus-navraag, de feed, de webhook als terugkoppeltaak en de overige componenten zijn nog niet gebouwd; in het componentdiagram staan die gestreept.

Verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen (LDV) vanuit de Verzendverwerker, vóór elke externe aanroep en vóór het terugkoppelen, en vanuit de Notificatiestatus-feed per opgevraagde pagina aan de dienstverlener, onder de trace-id van de aanname; het LDV staat in het model als extern systeem.

### Verzenden via NotifyNL

NotifyNL is template-gebaseerd: het NMC verstuurt geen kale tekst, maar verwijst naar een vooraf geregistreerde template en levert de waarden voor de personalisation aan. De templates en het samenstellen van het bericht zitten in NotifyNL; dat modelleren we niet zelf. Het opgeven van een template is verplicht. Authenticatie verloopt per verzoek met een ondertekende bearer-JWT.

NotifyNL bevestigt bij verzending alleen de acceptatie. De uiteindelijke afleverstatus volgt asynchroon: NotifyNL stuurt bij elke statuswijziging een delivery receipt naar een aparte Afleverstatus-callback van het NMC, gescheiden van de publieke Notificatie-API omdat het een inkomende webhook met een eigen contract betreft. Het NMC zet die status als event in het eventlog; de dienstverlener vraagt de status op via de Notificatiestatus-controller of leest de events als CloudEvents (NL GOV profiel, pas-toe-of-leg-uit) via de Notificatiestatus-feed en bevestigt de cursor. Een dienstverlener die een webhook heeft geregistreerd ontvangt dezelfde events als push, beveiligd met een ondertekende bearer-JWT; dat is optioneel, omdat niet elke afnemer een inkomend endpoint kan bieden.

Een receipt `delivered` is niet definitief: tot zeven dagen erna kan NotifyNL nog een faalreceipt sturen. De notificatie staat daarom eerst op `bezorgd` en wordt na de vaststellingstermijn uit de MEBV door een vaststeltaak `definitief-bezorgd`; een temporary-failure of permanent-failure binnen die termijn wordt verwerkt als bij een lopende poging, een latere wordt alleen op de poging vastgelegd.

Bij een tijdelijke of technische afleverfout, zoals een volle mailbox, biedt het NMC de notificatie zelf eenmaal opnieuw aan en informeert het de aanroeper bij iedere stap over de status (ADR 0024). Deze herverzending is nog niet geïmplementeerd. Het besluit of een mislukte notificatie tot een nieuw bericht moet leiden, blijft businesslogica van de dienstverlener.

### Contactherstel

Contactherstel wordt later aan het model toegevoegd. Bij een `permanent-failure` meldt het NMC bij gecentraliseerde regie het e-mailadres ongeldig bij de Profielservice en koppelt het `niet-bezorgbaar` met reden `onbereikbaar` terug; de opvolging ligt bij de dienstverlener.

### De scenario's

![Dienstverlener Container](embed:DVContainer)

De twee regie-modellen vertalen zich naar twee scenario's. Zie ook hoofdstuk 2.

#### Gedecentraliseerde regie

De Vakapplicatie initieert via de OMC een notificatie en levert de contactgegevens zelf aan; het NMC verstuurt deze. De afleverstatus wordt wel asynchroon teruggekoppeld, zodat de dienstverlener weet of de aflevering is geslaagd. Er is geen contactherstel door de dienst: bij een mislukte aflevering ligt de opvolging bij de dienstverlener.

#### Gecentraliseerde regie

De organisatie geeft de regie uit handen en stuurt op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC, dat zelf de voorkeur ophaalt bij de Profielservice en verstuurt. Bij een `permanent-failure` meldt het NMC het e-mailadres ongeldig bij de Profielservice en koppelt het de uitkomst terug; contactherstel wordt later aan het model toegevoegd.
