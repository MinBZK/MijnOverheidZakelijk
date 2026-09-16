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

Het NMC voert de notificatielevenscyclus uit als een georkestreerde state machine in PostgreSQL met een transactioneel eventlog ([ADR 0022](/workspace/decisions#22)). Er is geen message broker en geen workflow-engine; timers zijn `due`-tijdstippen op taken en "event" betekent een rij in het commit-geordende eventlog. Contactherstel maakt geen deel uit van deze editie van het NMC; het model beschrijft de levenscyclus tot en met de terugkoppeling van de afleverstatus.

Koppelvlakken naar de dienstverlener:

- de **Centrale-notificatie-controller** neemt verzoeken aan op basis van een identificerend nummer (centrale regie). De aanname is synchroon en antwoordt met 202 nadat notificatie, eerste taak en eerste event in één transactie zijn opgeslagen;
- de **Decentrale-notificatie-controller** doet hetzelfde voor verzoeken met een e-mailadres (decentrale regie);
- de **Notificatiestatus-controller** biedt status opvragen, zoeken op de dvRef-HMAC en annuleren tot aan de claim;
- de **Notificatiestatus-feed** biedt de cursorfeed over het eventlog per dienstverlener, de basis van de terugkoppeling.

Inkomende events:

- de **Afleverstatus-callback** ontvangt de delivery receipts van NotifyNL, slaat het event op zonder het e-mailadres uit de receipt en antwoordt daarna pas met 200.

Levenscyclus:

- het **Statusbeheer** is de enige schrijver van de notificatiestatus: het vergrendelt de notificatierij, toetst de overgang aan de toegestane overgangen en verhoogt de versie. Een databasetrigger toetst de overgang nogmaals en schrijft het event, zodat een statuswijziging zonder event niet kan bestaan;
- de **Verzendverwerker** bestaat uit stateless workers die taken claimen met `SELECT ... FOR UPDATE SKIP LOCKED`, in batches en binnen het verzendbudget per Notify-service. Taaksoorten: verzenden (inclusief voorkeur ophalen), receipts verwerken en e-mailadres ongeldig melden;
- de **Afleverstatus-navraag** vraagt bij NotifyNL de status op van elke poging zonder receipt, na 1, 6 en 24 uur en daarna dagelijks. Daarmee is het NMC onafhankelijk van het callback-venster van NotifyNL;
- de **Notificatiestatus-webhook** leest per dienstverlener hetzelfde eventlog met een cursor, bundelt naar de laatste status per notificatie en levert op een bij onboarding geregistreerde webhook. Feed en webhook schrijven dezelfde bevestiging.

Adapters:

- de **Profielservice-adapter** leest de voorkeur binnen de verzendtaak, zonder het e-mailadres op te slaan, en meldt een e-mailadres ongeldig bij de Profielservice;
- de **Verzendadapter** verstuurt via NotifyNL met een template_id en de personalisation, met de poging als `reference`, en vraagt voor de Afleverstatus-navraag de status op.

> De centrale en decentrale intake zijn hier als aparte controllers getekend voor de duidelijkheid. Functioneel kunnen ze ook één API zijn; de keuze hangt af van of de twee regie-modellen een eigen autorisatiegrens nodig hebben (de centrale regie verwerkt immers identificerende nummers onder een eigen grondslag).

De verzending van één notificatie bij centrale regie, met een geslaagde aflevering:

![NMC Verzending](embed:NMCVerzending)

De **notificatiedatabase** is de bron van waarheid. De tabellen `notificatie` en `poging` dragen de status, `taak` de bijwerkingen met lease en `due` en `event` het commit-geordende eventlog. Het eventlog bevat geen persoonsgegevens en geen referentie van de dienstverlener en is de enige bron voor terugkoppeling, rapportage en afleverbewijs, met per doel een eigen bewaartermijn. Persoonsgegevens op de notificatierij staan versleuteld met een sleutel per notificatie; het wissen van die sleutel is de wisactie. De referentie van de dienstverlener wordt aan de deur vervangen door een peppered HMAC. Hoofdstuk 7 werkt de componenten uit tot klassen.

> Stand van de implementatie: het huidige NMC (PoC-fase) bevat de twee intake-controllers, de Afleverstatus-callback, de Profielservice-adapter, de Verzendadapter en een callback-adapter die per statuswijziging direct pusht. Het register bewaart per notificatie alleen referentie, afleverstatus en callback-URL. De takentabel, het eventlog en de overige componenten zijn nog niet gebouwd; in het componentdiagram staan die gestreept.

Verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen (LDV); dit is in de diagrammen niet als apart component opgenomen.

### Verzenden via NotifyNL

NotifyNL is template-gebaseerd: het NMC verstuurt geen kale tekst, maar verwijst naar een vooraf geregistreerde template en levert de waarden voor de personalisation aan. De templates en het samenstellen van het bericht zitten in NotifyNL; dat modelleren we niet zelf. Het opgeven van een template is verplicht. Authenticatie verloopt per verzoek met een ondertekende bearer-JWT.

NotifyNL bevestigt bij verzending alleen de acceptatie. De uiteindelijke afleverstatus volgt asynchroon: NotifyNL stuurt bij elke statuswijziging een delivery receipt naar een aparte Afleverstatus-callback van het NMC, gescheiden van de publieke Notificatie-API omdat het een inkomende webhook met een eigen contract betreft. Het NMC kan die status vervolgens als eigen consument-callback doorzetten naar de consument, mits die daarvoor een callback heeft geregistreerd; dat is optioneel, omdat niet elke afnemer dit direct ondersteunt. Deze uitgaande terugkoppeling volgt het NL GOV profiel voor CloudEvents (pas-toe-of-leg-uit) over een webhook, beveiligd met een ondertekende bearer-JWT en met retries en idempotente verwerking voor betrouwbare aflevering.

Bij een tijdelijke afleverfout, zoals een volle mailbox, is het de bedoeling dat het NMC de notificatie zelf opnieuw aanbiedt, gespreid over een langere periode, en de aanroeper bij iedere stap informeert over de status en de eerstvolgende actie. Deze herverzending is nog niet geïmplementeerd. Het besluit of een mislukte notificatie tot een nieuw bericht moet leiden, blijft businesslogica van de dienstverlener.

### Contactherstel

De Notificatiedienst regelt het contactherstel, maar voert het niet zelf uit: Contactherstel en Printstraat zijn bestaande Logius-diensten die de Notificatiedienst aanroept. Wanneer bij een centrale-regie-verzoek een e-mailadres of telefoonnummer onbereikbaar blijkt, haalt de Notificatiedienst het adres op bij het KvK Handelsregister (KvK/RSIN) of de BRP (BSN) en geeft dit met de onbereikbaar-melding door aan de Contactherstel-dienst. Die verzorgt vervolgens het herstel, waaronder fysieke verzending via de Printstraat. Het uitgangspunt is om contactherstelberichten slim te bundelen, zodat gebruikers niet worden overladen.

### De scenario's

![Dienstverlener Container](embed:DVContainer)

De twee regie-modellen vertalen zich naar twee scenario's. Zie ook hoofdstuk 2.

#### Gedecentraliseerde regie

De Vakapplicatie initieert via de OMC een notificatie en levert de contactgegevens zelf aan; het NMC verstuurt deze. De afleverstatus wordt wel asynchroon teruggekoppeld, zodat de dienstverlener weet of de aflevering is geslaagd. Er is geen contactherstel door de dienst: bij een mislukte aflevering ligt de opvolging bij de dienstverlener.

#### Gecentraliseerde regie

De organisatie geeft de regie uit handen en stuurt op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC, dat zelf de voorkeur ophaalt bij de Profielservice en verstuurt. Bij een mislukte aflevering door kanaaluitval verzorgt de Notificatiedienst het contactherstel: ze haalt het adres op bij het KvK Handelsregister of de BRP en geeft dit met de onbereikbaar-melding door aan de Contactherstel-dienst, die het bericht via de Printstraat fysiek verzendt.
