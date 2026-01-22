## Software architectuur

### Architectuurschets Notificeren

Het eerste onderwerp van het programma om te verkennen is een Rijksbrede voorziening voor het notificeren, waarbij een kanaalherstel functionaliteit een vereiste is om te kunnen voldoen aan de [Wet Modernisering Elektronisch Bestuurlijk Verkeer (MEBV)](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/wetgeving/wet-modernisering-elektronisch-bestuurlijk-verkeer/).

Daarvoor zijn door Paul Janssen, architect bij de VNG, een aantal scenario's geschetst die verschillende situaties oplossen in verschillende evoluties van het notificatie proces. Wij hebben daaruit een selectie van 2 scenarios uitgewerkt in prototypes, namelijk #2 en #8. Naar aanleiding van verder onderzoek is gebleken dat er nog een extra scenario nodig is, welke we tot scenario #9 hebben benoemd, waarbij ook het kanaalherstel wordt gefasciliteerd.

![Notificatie Context](embed:NotificatieServiceContext)

In het Notificatie Service context diagram is de Notificatie Service uitgewerkt en wordt weergegeven hoe de drie scenario’s interacteren met de Notificatie Service. De belangrijkste aandachtspunten in deze afbeelding zijn de vier services die binnen het Logius-landschap opereren: de Berichtenbox voor Burgers en Ondernemers (BBO), de Kanaalhersteldienst, de Notificatie Service en de Profiel Service. De eerste twee zijn grijs weergegeven om aan te duiden dat het bestaande systemen betreft.

![](embed:NotificatieServiceContainer)

In het Notificatie Service Container Diagram wordt verder ingezoomd op de onderdelen van de Notificatie Service. Deze bestaat uit twee componenten: NotifyNL en de Kennisgeving Service.

Daarnaast zijn ook de Kanaalhersteldienst en de Profiel Service opgenomen. Deze twee componenten zijn bepalend voor de onderlinge verschillen tussen de drie scenario’s: de BD maakt gebruik van zowel de Profiel Service als de Kanaalhersteldienst, het UWV raadpleegt enkel de Profiel Service, en de DV maakt van geen van beide gebruik.  
Meer over dit onderscheid wordt zichtbaar in het scenario onder het kopje _Belastingdienst_, waarin beide componenten actief worden ingezet.

De drie scenario’s illustreren verschillende vormen van notificaties. Scenario 2 betreft een attendering, terwijl scenario’s 8 (UWV) en 9 (BD) betrekking hebben op kennisgevingen.

#### Scenario 2

Dit is nog steeds het eenvoudigste scenario: de DV roept hierbij rechtstreeks NotifyNL aan, die vervolgens de notificatie verstuurt naar de zakelijke gebruiker. De Profiel Service wordt hierbij niet gebruikt, wat betekent dat DV zelf de contactgegevens moet aanleveren. Ook wordt de Kanaalhersteldienst niet aangeroepen; bij een kanaalstoring zou DV dit dus zelf moeten afhandelen.

#### Scenario 8

In scenario 8, vertegenwoordigd door het DV, wordt eerst de contactinformatie opgehaald bij de Profiel Service voordat NotifyNL wordt aangeroepen om de notificatie te versturen. Dit betekent dat er in geval van kanaaluitval geen kanaalherstel plaatsvindt vanuit de Notificatie Service.

#### Scenario 9

In dit scenario roept de BD de Berichtenbox voor Burgers en Ondernemers (BBO) aan, die vervolgens het notificatieproces namens hen uitvoert. De BBO haalt de profielinformatie op bij de Profiel Service en geeft deze door aan de Kennisgeving Service. Deze is vervolgens verantwoordelijk voor het versturen van de notificatie naar NotifyNL.

Belangrijk om te vermelden is dat de BD ook de mogelijkheid heeft om het notificatieproces niet via de BBO, maar rechtstreeks te initiëren via de Kennisgeving Service. In dat geval slaat de BD de BBO over en levert zelf de benodigde gegevens aan. De verdere afhandeling, waaronder het ophalen van profielinformatie en het versturen van de notificatie naar NotifyNL, verloopt vervolgens identiek.

Indien het afleveren van de notificatie mislukt door kanaaluitval, start de Kennisgeving Service automatisch het kanaalherstelproces. Hierbij worden opnieuw de adresgegevens opgehaald bij het handelsregister, waarna deze worden doorgegeven aan de Kanaalhersteldienst voor verdere afhandeling.

### De scenario's

In dit hoofdstuk worden de drie scenario’s verder toegelicht. Zie ook [ADR-0003](/workspace/decisions#3) en hoofdstuk 2.8 voor aanvullende context.
In de onderstaande diagram worden alle 3 de scenarios tegelijk weergegeven.

![](embed:DVContainer)

#### Scenario 2

Dit scenario representeert het versturen van een _attendering_.  
De RVO beschikt over een interne service die notificaties (e-mail, sms of brief) wil versturen naar zakelijke gebruikers. Deze service roept rechtstreeks de Notificatie Service aan en levert daarbij zelf de benodigde contactgegevens aan. De Notificatie Service verstuurt de notificatie direct.

Als het afleveren van de notificatie mislukt (bijvoorbeeld door kanaalproblemen), meldt de Notificatie Service dit terug aan de RVO. De verdere afhandeling van de fout ligt volledig bij de RVO.

#### Scenario 8

Scenario 8 is functioneel uitgebreider dan scenario 2. Ook hier is sprake van een interne service — de DV Service — die een notificatie wil versturen naar een zakelijke gebruiker. In plaats van direct met de Notificatie Service te communiceren, stuurt de DV Service de aanvraag door naar een Output Management Component (OMC).

De OMC is verantwoordelijk voor het ophalen van de contactgegevens bij de Profiel Service. Met deze informatie wordt de notificatie via de Notificatie Service verzonden. In dit scenario is er nog geen sprake van geautomatiseerd kanaalherstel: als aflevering faalt, is het aan de OMC of de DV om het probleem op te lossen.

#### Scenario 9

Scenario 9 lijkt in grote lijnen op scenario 8, maar bevat enkele technische verschillen.

De BD Service initieert de verzending van een notificatie naar een zakelijke gebruiker. De aanvraag wordt doorgestuurd naar de OMC, die — net als in scenario 8 — de contactinformatie ophaalt bij de Profiel Service.

Daarna heeft de BD twee routes om de notificatie te versturen: direct via de Notificatie Service of indirect via de BBO. In beide gevallen verloopt het proces grotendeels hetzelfde en is het eindresultaat identiek. Bij directe verzending stuurt de BD de notificatie rechtstreeks naar de Notificatie Service. In het geval van de BBO-route levert de OMC de benodigde gegevens aan bij de Berichtenbox voor Burgers en Ondernemers (BBO), die op haar beurt contact opneemt met de Notificatie Service om de notificatie af te leveren.

Als de Notificatie Service een foutmelding geeft vanwege kanaaluitval, start de Kennisgeving Service, een container binnen de Notificatie Service, automatisch het kanaalherstelproces. Daarbij worden de adresgegevens opgehaald bij de het handelsregister en doorgegeven aan de Kanaalhersteldienst voor verdere afhandeling.
