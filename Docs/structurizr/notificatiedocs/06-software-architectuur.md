## Software architectuur

### Aanleiding

Een Rijksbrede voorziening voor het notificeren is nodig om te kunnen voldoen aan de [Wet Modernisering Elektronisch Bestuurlijk Verkeer (MEBV)](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/wetgeving/wet-modernisering-elektronisch-bestuurlijk-verkeer/), waarbij contactherstel een vereiste is. De dienst werkt dit uit in twee regie-modellen: gecentraliseerd en gedecentraliseerd.

### Regie-model: centraal en decentraal

De Notificatiedienst kent twee modellen voor wie de regie over een verzending voert:

- **Decentrale regie:** de dienstverlener houdt de regie. De Vakapplicatie roept de Output Management Component (OMC) aan; de OMC beschikt zelf al over de contactgegevens en initieert daarmee de notificatie bij het Notificatie Management Component (NMC). Het NMC haalt deze gegevens in dit model niet op.
- **Centrale regie:** de dienstverlener geeft de regie uit handen. Met de juiste juridische grondslag stuurt de organisatie op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC. Het NMC haalt zelf de voorkeur op bij de Profielservice.

![Notificatie Service Context](embed:NotificatieServiceContext)

De Notificatiedienst bestaat uit het NMC, NotifyNL, Contactherstel en Printstraat, en verhoudt zich tot de Profielservice, de KvK-API en de BRP-API.

![Notificatiedienst Container](embed:NotificatieServiceContainer)

### Componenten van het NMC

![NMC Componenten](embed:NMCComponents)

Het NMC orchestreert het notificatieproces:

- de **Centrale-regie-API** is de controller voor verzoeken op basis van een identificerend nummer; de NMC haalt zelf de voorkeur op;
- de **Decentrale-regie-API** is de controller voor verzoeken waarbij de aanvrager de gegevens al heeft opgehaald;
- de **Afleverstatus-callback** is de controller die de delivery receipts van NotifyNL ontvangt;
- de **Notificatie-orchestrator** coördineert de afhandeling: voorkeur ophalen, opslaan in het register en versturen, en bij een receipt de status verwerken, de consument terugkoppelen en zo nodig contactherstel starten;
- de **Profielservice-adapter** leest de voorkeur en invalideert e-mailadressen bij de Profielservice;
- de **Verzendadapter** verstuurt het bericht via NotifyNL met een template_id en de personalisation;
- de **Adres-adapter** haalt het adres op bij het KvK Handelsregister (KvK/RSIN) of de BRP (BSN);
- de **Contactherstel-coördinator** haalt bij onbereikbaarheid het adres op en geeft dit met de onbereikbaar-melding door aan de Contactherstel-dienst;
- de **Notificatiestatus-callback-adapter** koppelt de notificatiestatus terug aan de aanroeper, los van de inkomende NotifyNL-callback.

> De centrale en decentrale intake zijn hier als aparte controllers getekend voor de duidelijkheid. Functioneel kunnen ze ook één API zijn; de keuze hangt af van of de twee regie-modellen een eigen autorisatiegrens nodig hebben (de centrale regie verwerkt immers identificerende nummers onder een eigen grondslag).

Het **Notificatieregister** bewaart de minimale gegevens voor de asynchrone afhandeling: de referentie die bij de eerste aanroep aan de aanvrager wordt teruggegeven, met de afleverstatus. Zo kan de statusupdate later aan de juiste aanvrager worden teruggekoppeld zodra NotifyNL reageert.

Bij **centrale regie** bewaart het register daarnaast het identificerend nummer (BSN, KvK of RSIN), uitsluitend om bij een mislukte aflevering contactherstel te kunnen starten. Dat nummer wordt versleuteld opgeslagen met een per-record datasleutel (envelope-encryptie); het adres wordt pas bij een mislukte aflevering opgehaald bij het KvK Handelsregister of de BRP en niet bewaard. Bij **decentrale regie** legt het register geen identificerende gegevens vast: de afleverstatus gaat terug naar de OMC, die het contactherstel zelf voert.

De registratie wordt verwijderd zodra de statusupdate aan de dienstverlener is verstuurd, conform dataminimalisatie en opslagbeperking.

Verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen (LDV); dit is in de diagrammen niet als apart component opgenomen.

### Verzenden via NotifyNL

NotifyNL is template-gebaseerd: het NMC verstuurt geen kale tekst, maar verwijst naar een vooraf geregistreerde template en levert de waarden voor de personalisation aan. De templates en het samenstellen van het bericht zitten in NotifyNL; dat modelleren we niet zelf. Het opgeven van een template is verplicht. Authenticatie verloopt per verzoek met een ondertekende bearer-JWT.

NotifyNL bevestigt bij verzending alleen de acceptatie. De uiteindelijke afleverstatus volgt asynchroon: NotifyNL stuurt bij elke statuswijziging een delivery receipt naar een aparte Afleverstatus-callback van het NMC, gescheiden van de publieke Notificatie-API omdat het een inkomende webhook met een eigen contract betreft. Het NMC kan die status vervolgens als eigen consument-callback doorzetten naar de consument, mits die daarvoor een callback heeft geregistreerd; dat is optioneel, omdat niet elke afnemer dit direct ondersteunt. Deze uitgaande terugkoppeling volgt het NL GOV profiel voor CloudEvents (pas-toe-of-leg-uit) over een webhook, beveiligd met een ondertekende bearer-JWT en met retries en idempotente verwerking voor betrouwbare aflevering.

### Contactherstel

De Notificatiedienst regelt het contactherstel, maar voert het niet zelf uit: Contactherstel en Printstraat zijn bestaande Logius-diensten die de Notificatiedienst aanroept. Wanneer bij een centrale-regie-verzoek een e-mailadres of telefoonnummer onbereikbaar blijkt, haalt de Notificatiedienst het adres op bij het KvK Handelsregister (KvK/RSIN) of de BRP (BSN) en geeft dit met de onbereikbaar-melding door aan de Contactherstel-dienst. Die verzorgt vervolgens het herstel, waaronder fysieke verzending via de Printstraat. Het uitgangspunt is om contactherstelberichten slim te bundelen, zodat gebruikers niet worden overladen.

### De scenario's

![Dienstverlener Container](embed:DVContainer)

De twee regie-modellen vertalen zich naar twee scenario's. Zie ook hoofdstuk 2.

#### Gedecentraliseerde regie

De Vakapplicatie initieert via de OMC een notificatie en levert de contactgegevens zelf aan; het NMC verstuurt deze. De afleverstatus wordt wel asynchroon teruggekoppeld, zodat de dienstverlener weet of de aflevering is geslaagd. Er is geen contactherstel door de dienst: bij een mislukte aflevering ligt de opvolging bij de dienstverlener.

#### Gecentraliseerde regie

De organisatie geeft de regie uit handen en stuurt op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC, dat zelf de voorkeur ophaalt bij de Profielservice en verstuurt. Bij een mislukte aflevering door kanaaluitval verzorgt de Notificatiedienst het contactherstel: ze haalt het adres op bij het KvK Handelsregister of de BRP en geeft dit met de onbereikbaar-melding door aan de Contactherstel-dienst, die het bericht via de Printstraat fysiek verzendt.
