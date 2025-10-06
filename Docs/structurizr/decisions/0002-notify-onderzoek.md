# 2. Notify Onderzoek

Date: 2025-07-07

## Status

Accepted

## Context

Tijdens onze gesprekken met verschillende organisaties (Belastingdienst, UWV en RDW) over aansluiten op MijnOverheidZakelijk kwam
een andere behoefte eigenlijk meer omhoog, een rijksbrede, goed werkende notificatie service.
Binnen Logius wordt hiervoor al gekeken naar NotifyNL, een fork van het project NotifyUK door het bedrijf Worth systems.
Vanuit het programma MijnOverheidZakelijk hadden we ook tijd om hier onderzoek naar te doen. Binnen dit onderzoek is er niet gekeken naar de functionele mogelijkheden maar alleen naar de technische keuzes (code, gebruikte third party systemen en architecturale beslissingen) en de verschillen tussen het base NotifyUK project en de Nederlandse fork.

De code is op dit moment opgesplitst in meerdere afzonderlijke Flask (python) projecten. Er is een front-end applicatie, genaamd 'admin', Daarnaast is er een back-end, aangeduid als 'api', die verantwoordelijk is voor het verwerken en versturen van de notificaties. Beide projecten maken gebruik van een gedeeld utils-project, dat als PIP-package wordt geïmporteerd om herbruikbare functionaliteit te bieden.

Voor veel van de kernfunctionaliteiten maakt Notify standaard gebruik van Amazon producten. Zo wordt Amazon SES (Simple Email Service) ingezet voor het versturen van e-mails, terwijl Amazon SQS (Simple Queue Service) wordt gebruikt voor het beheren van de queue. Voor het versturen van SMS-berichten wordt gebruikgemaakt van verschillende marktpartijen. Deze afhankelijkheid van externe cloud-diensten betekent dat het systeem sterk leunt op de infrastructuur van Amazon.


1. **Bestaande Notify-implementatie klonen zonder wijzigingen**

   Gebruik een directe fork van bijvoorbeeld de UK-versie, inclusief de bestaande e-mail- en sms-clients en bijbehorende afhankelijkheden, zoals AWS (Amazon Web Services). Dit is de snelste route naar een werkend systeem, maar biedt beperkte controle over toekomstige ontwikkeling. Er is een grotere afhankelijkheid van externe leveranciers, wat mogelijk minder wenselijk is vanuit het oogpunt van openheid en technologische onafhankelijkheid. Ook is het oplossen van technical debt lastig te realiseren omdat je sterk afhankelijk blijft van de upstream fork.

2. **Bestaande Notify-implementatie klonen en alleen de clients aanpassen**

   Fork de UK-versie en implementeer eigen providers voor e-mail en sms. Dit biedt meer controle over kritieke afhankelijkheden (zoals het vermijden van AWS), terwijl je nog steeds kunt profiteren van functionele updates uit het originele project. Wel is er minder flexibiliteit om grote structurele aanpassingen in de code door te voeren, wat het oplossen van technical debt op termijn bemoeilijkt.

3. **Bestaande Notify-implementatie klonen met structurele wijzigingen**

   Start met een fork van bijvoorbeeld de UK-versie, maar behandel deze slechts als initiële basis. Ontwikkel daarna zelfstandig verder zonder actief de upstream-code te volgen. Dit geeft maximale vrijheid in architectuurkeuzes en biedt de mogelijkheid om technical debt aan te pakken. Nadeel is dat je geen toekomstige verbeteringen uit de oorspronkelijke versie meer kunt overnemen.

4. **Volledig eigen ontwikkeling met lessen uit bestaande Notify-implementaties**

   Bouw een nieuwe codebase vanaf nul, geïnspireerd op bestaande oplossingen zoals die van de UK, Canada, Nederland of de VS. Dit geeft volledige vrijheid in technologie (bijvoorbeeld keuze voor een ander framework dan Flask/Python) en architectuur.

| Optie | Inspanning | Aanpasbaarheid  | Vendor lock-in | Aansluitbaarheid |
| ----- | ---------- | --------------- | -------------- | ---------------- |
| 1     | Laag       | Laag            | Ja             | Midden           |
| 2     | Laag       | Laag            | Nee            | Midden           |
| 3     | Midden     | Midden tot Hoog | Nee            | Hoog             |
| 4     | Hoog       | Hoog            | Nee            | Hoog             |

## Decision

Onze conclusie is dat dit project niet al te lastig is om zelf als overheid te gaan implementeren en door te ontwikkelen. De materie is niet al te lastig en er is bij de overheid intern genoeg kennis en ontwikkelkracht om dit zelf (open-source) te ontwikkelen.

Wel moet er een keuze worden gemaakt tot hoever de upstream met de UK variant moet worden onderhouden, hoe meer je zelf gaat veranderen/verbeteren aan de Nederlandse versie, hoe lastiger veranderingen die de UK doet terug te brengen zijn in de code base. Canada heeft dit opgelost door NotifyUK als start punt te gebruiken en vanaf daar zelf door te gaan ontwikkelen. Onze suggestie is om ook te kiezen voor deze oplossing, dus optie 3.

Wij zijn tot deze conclusie komen door de volgende overwegingen:

- De code heeft in onze opinie wat verbeter mogelijkheden, zo is de back-end code soms onnodig verwarrend en ondersteunt de front-end sommige basale functionaliteiten niet, zoals i18n/meertaligheid. Ons advies zou dan ook zijn om goed te kijken of er tijd is om de front-end te herschrijven en deze in een moderner jasje te steken, bijvoorbeeld door gebruik te maken van React. Mocht hier geen tijd voor zijn, dan kan er met beperkte inspanning ook worden gekeken naar het toevoegen van de benodigde functionaliteiten aan de bestaande front-end.
  Ook zal er wat tijd te gereserveerd moeten worden om technical debt van de back-end service aan te pakken.

- Er zijn verschillende aanpassingen nodig om de afhankelijkheden van third-party software weg te halen. Zo moet de Amazon simple queue service worden vervangen met een zelf gehoste queue, hierbij kan gedacht worden aan RabbitMQ. De Amazon simple email service moet worden vervangen door de mail-relay van de overheid (Logius) zelf. Ook moet er worden nagedacht hoe de SMS berichten worden verstuurd, is er bij de overheid al een partij die dit voor je kan doen, of moet hier een markt partij voor worden verzonden. Onze suggestie zou zijn om vast met de queue/email te beginnen terwijl hier over na wordt gedacht.

- Worth Systems heeft kleine aanpassingen gedaan op de UK versie van notify, zo hebben ze de telefoonnummer validatie aangepast naar een Nederlandse variant, een andere SMS provider toegevoegd en wat tekstuele aanpassingen gedaan, maar er moet nog heel veel gebeuren. Zo zijn alle templates nog in het Engels, linkt alles nog door naar de Engelse versie, is de website niet in de rijkshuisstijl, is er nog geen Nederlandse documentatie en zijn er nog geen grote code opschoon acties gedaan.
Er werd gecommuniceerd dat hier naar werd gekeken maar op het moment van schrijven is hier nog niks van terug te vinden op de productie omgeving, maar kijkend naar hun repository wordt er wel gewerkt aan een feature branch die misschien binnenkort gemerged kan worden.

## Consequences
- Er moet worden bepaald onder welk programma dit project komt te draaien
- Er moeten een aantal developers / team worden gevonden
- Er moet een beheer club worden gezocht