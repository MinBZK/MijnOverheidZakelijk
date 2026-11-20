# 26. Naamgevingsconventie voor domeinen en hostnamen van MOZa-voorzieningen

Datum: 2026-10-29

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): SPF, DMARC, CAA en de centrale security headers voor `mijnoverheidzakelijk.nl`. Dezelfde regels gelden voor de namen die volgens deze conventie worden uitgegeven.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): minimaal een acceptatieomgeving vóór productie. Deze ADR geeft die omgevingen een adres.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): of een domein bij Min AZ gemeld moet worden is daar een open besluit.

## Context

### Aanleiding: de Notificatiedienst

De Notificatiedienst wordt samen met Logius binnen het programma OBIS neergezet als generieke voorziening voor overheidsdiensten die notificaties willen laten versturen. Partijen die op de dienst aansluiten leggen haar adressen vast in hun eigen configuratie. Die adressen moeten daarom van ons zijn, blijven bestaan en de dienst herkenbaar benoemen. De dienst heeft nog geen eigen domeinnaam.

De Notificatiedienst is de eerste voorziening waar MOZa bij betrokken is die richting productie gaat. Het exacte moment daarvan moet nog worden bepaald. De stap naar productie maakt dat er nu concrete keuzes moeten worden gemaakt over het domein en de hostnamen.

### Waarom een conventie

Voor de adressen van MOZa-voorzieningen is nog geen naamgevingsconventie vastgelegd. De adressen van de PoC-omgeving onder `mijnoverheidzakelijk.nl` (zoals `profiel.`, `moza.` en `vakapplicatie.`) zijn in de praktijk ontstaan. De adressen van de ontwikkel- en previewomgevingen op ZAD volgen het patroon van dat platform (zie [Deployment](../docs/10-deployment.md)).

### Voorsorteren op aanvragen

Een domein of subdomein aanvragen kost doorlooptijd en hangt af van andere partijen. Met een conventie staat vooraf vast welke namen nodig zijn. Dan kan het subdomein één keer worden aangevraagd en krijgt elke volgende voorziening een eigen label daaronder, zonder nieuwe aanvraag.

### Domeinbeleid

De overheid heeft al te veel domeinnamen in beheer en wil dat aantal terugdringen. Het Internetdomeinbeleid Rijksoverheid vraagt daarom om waar mogelijk een bestaand overheidsbreed domein te hergebruiken en nieuwe diensten als subdomein onder te brengen. Een eigen domein per dienst past daar niet in; een nieuw domein is alleen te verantwoorden als het breder inzetbaar is dan één dienst. De Notificatiedienst is daarom een laag onder een groter geheel: een subdomein dat meer voorzieningen kunnen delen. Dat subdomein hangt op zijn beurt onder een bestaand overheidsdomein.

Welke naam dat subdomein krijgt, wordt nog onderzocht. `overheidsapps` en `obis` zijn in die volgorde de eerste kandidaten; andere namen kunnen nog in beeld komen. In deze ADR staat `<subdomein>` voor de uitkomst.

### Opties in volgorde van voorkeur

| Optie | Hoofdnaam Notificatiedienst | Beoordeling |
| :---- | :-------------------------- | :---------- |
| 1. Subdomein onder de uniforme overheidsextensie `.gov.nl` | `notificatiedienst.<subdomein>.gov.nl` | Sluit aan op het kabinetsbesluit voor één herkenbare overheidsextensie. Nu niet beschikbaar: onder de extensie worden nog geen namen uitgegeven en er is geen datum genoemd waarop dat wel kan. |
| 2. Subdomein onder `overheid.nl` | `notificatiedienst.<subdomein>.overheid.nl` | `overheid.nl` is een bestaand overheidsbreed domein, gehouden door Logius namens de Rijksoverheid. Hergebruik is wat het Internetdomeinbeleid Rijksoverheid vraagt. Het subdomein biedt ruimte aan latere voorzieningen onder dezelfde naam. |
| 3. Subdomein onder `rijksapps.nl` | `notificatiedienst.<subdomein>.rijksapps.nl` | Eveneens hergebruik van een bestaand overheidsdomein, zonder nieuwe registratie. Alleen aan de orde als optie 2 wordt afgewezen. |
| 4. Eigen `.nl`-domein | `notificatiedienst.<eigen domein>` | De naam is van ons en benoemt de dienst. Registratie loopt via de Dienst Publiek en Communicatie (DPC) als registrar van de Rijksoverheid; DNSSEC, SPF, DMARC en CAA worden apart ingericht. Een nieuw domein voegt toe aan het aantal dat de overheid juist wil terugdringen en is pas aan de orde als ook optie 3 afvalt; het moet dan voor meer dan één dienst bruikbaar zijn. |

### Stand van optie 1

Optie 1 heeft de voorkeur en is op dit moment niet te krijgen. `.gov.nl` is de extensie die het kabinet voor alle overheidsdiensten heeft aangewezen. Wij hebben verkend of een naam onder `.gov.nl` mogelijk is. Het antwoord was dat onder de extensie op dit moment nog geen namen worden uitgegeven; een datum waarop dat wel kan is niet genoemd.

De Notificatiedienst kan daar niet onbeperkt op wachten. Aansluitende partijen leggen de adressen vast in hun eigen configuratie zodra zij aansluiten, en de test- en acceptatieomgevingen uit ADR 0017 hebben een adres nodig voordat de dienst in productie gaat. Zonder domeinnaam kan geen partij aansluiten, en een wachttijd zonder einddatum is niet te plannen.

Daarom begint het afwerken van de lijst met uitzoeken of en wanneer een naam onder `.gov.nl` mogelijk is. Lukt dat niet, dan liggen de volgende opties klaar.

## Decision

Dit is een voorstel ter besluitvorming. Voorgesteld wordt een naamgevingsconventie vast te leggen voor de domeinen en hostnamen van MOZa-voorzieningen, met de Notificatiedienst als eerste toepassing. Voor het domein werken wij de opties af in volgorde van voorkeur: de eerste optie die haalbaar is, wordt het domein. De naam van het subdomein wordt nog gekozen; de kandidaten staan hierboven.

1. **Domein.** Wij beginnen bij optie 1 en zoeken uit of `<subdomein>.gov.nl` mogelijk is. Lukt dat niet, dan vragen wij `<subdomein>.overheid.nl` aan bij Logius als houder van `overheid.nl` (optie 2). Wordt die afgewezen, dan `<subdomein>.rijksapps.nl` (optie 3). Valt ook die af, dan registreren wij via DPC één eigen `.nl`-domein dat meer voorzieningen draagt dan alleen de Notificatiedienst (optie 4); de naam daarvan wordt dan gekozen in afstemming met de beheerders van het domeinnaambeleid en getoetst aan het Internetdomeinbeleid Rijksoverheid en op beschikbaarheid bij SIDN. Onder het domein krijgt elke voorziening een eigen label; er wordt geen domein voor één voorziening alleen geregistreerd. Het naamschema geldt bij elke optie ongewijzigd.

2. **Naamschema.** Voorgesteld wordt voor alle MOZa-voorzieningen hetzelfde schema te gebruiken:

   `[<omgeving>.]<voorziening>.<subdomein>.<domein>`

   Het label van de voorziening is de naam van de voorziening, in kleine letters en zonder spaties; de Notificatiedienst krijgt dus `notificatiedienst`.

   Productie is de hoofdnaam zelf; een niet-productieomgeving krijgt haar label ervoor. De labels zijn `tst`, `acc` en `preprod`; een adres zonder omgevingslabel betekent altijd productie.

3. **Eerste toepassing: de Notificatiedienst.** De Notificatiedienst krijgt `notificatiedienst.<subdomein>.<domein>` als hoofdnaam. `<domein>` is het domein uit de eerste haalbare optie, bijvoorbeeld `gov.nl` of `overheid.nl`. Haar omgevingen:

   | Omgeving | Hostnaam |
   | :------- | :------- |
   | test | `tst.notificatiedienst.<subdomein>.<domein>` |
   | acceptatie | `acc.notificatiedienst.<subdomein>.<domein>` |
   | pre-productie | `preprod.notificatiedienst.<subdomein>.<domein>` |
   | productie | `notificatiedienst.<subdomein>.<domein>` |

   Deze ADR werkt de conventie nu alleen voor de Notificatiedienst uit. De conventie geldt ook voor andere MOZa-voorzieningen: zodra een voorziening een adres nodig heeft, krijgt zij haar hostnamen volgens hetzelfde schema.

4. **Bestaande adressen onder `mijnoverheidzakelijk.nl`.** Hoe de huidige adressen van de PoC-omgeving zich tot deze conventie verhouden, moet nog worden bepaald.

5. **Latere `.gov.nl`-naam.** Komen wij niet bij optie 1 uit en komt `.gov.nl` later beschikbaar, dan stellen wij voor `<voorziening>.<subdomein>.gov.nl` de hoofdnaam te maken en de naam onder het eerder gekozen domein als alias te laten bestaan zolang aansluitende partijen ernaar verwijzen. Voor de Notificatiedienst is dat `notificatiedienst.<subdomein>.gov.nl`. Het naamschema gaat ongewijzigd mee.

## Consequences

* Bij toekenning van een subdomein onder een bestaand domein (optie 1, 2 of 3) komt er geen domeinnaam bij in het Register Internetdomeinen Overheid; latere voorzieningen krijgen een label onder dezelfde naam en vragen evenmin een domein aan.
* De conventie is nu alleen voor de Notificatiedienst toegepast. Andere MOZa-voorzieningen volgen haar zodra zij een adres nodig hebben; daarvoor is geen nieuw besluit over het naamschema nodig.
* Aansluitende partijen zien per voorziening één naam die de dienst benoemt, opgebouwd volgens hetzelfde schema.
* De keuze hangt eerst af van de uitkomst voor `.gov.nl`, en daarna van de toekenning door Logius. Tot de naam van het subdomein is gekozen en het domein is toegekend, worden geen adressen van de Notificatiedienst bij aansluitende partijen vastgelegd.
* Komt het domein onder `overheid.nl` (optie 2), dan gelden de apex-records en het beleid van Logius. Wie de records onder `<subdomein>.overheid.nl` beheert, en of de zone wordt gedelegeerd, wordt bij de aanvraag met Logius afgesproken.
* Bij optie 4 komt er een nieuw domein bij, met eigen registratie, DNS-zone, DNSSEC, SPF, DMARC en CAA, en een eigen plek in de periodieke internet.nl-controle uit ADR 0016.
* Het label `preprod` wordt in documenten als "pre-productie" geschreven; in hostnamen wordt het nooit anders gespeld, omdat labels in configuratie van aansluitende partijen letterlijk terugkomen.

### Aanvragen

* Eerst wordt uitgezocht of `<subdomein>.gov.nl` mogelijk is. Lukt dat niet, dan wordt `<subdomein>.overheid.nl` aangevraagd bij Logius. In beide gevallen moet eerst de naam van het subdomein gekozen zijn.
* Latere voorzieningen hoeven geen eigen domein aan te vragen; zij krijgen een label onder het toegekende subdomein.

### Buiten deze beslissing

* Op welk platform de omgevingen draaien en hoe de DNS-records daarheen verwijzen.
* Certificaten en toegangsbeperkingen per omgeving.
* Of de naam bij Min AZ gemeld moet worden: het open besluit uit ADR 0025 geldt ook hier.
* De adressen van de ontwikkel- en previewomgevingen op ZAD; die volgen het patroon van het platform.

## Verwijzingen

* [notificatiedocs §01 Context](../notificatiedocs/01-context.md): de Notificatiedienst als generieke voorziening binnen het programma OBIS
* [notificatiedocs §14 Productiegereedheid](../notificatiedocs/14-productiegereedheid.md): de domeinnaam en de melding bij Min AZ als open punten
* [Deployment](../docs/10-deployment.md): de huidige omgevingen en adressen van MOZa, op ZAD en in de PoC-omgeving
* [Internetdomeinbeleid Rijksoverheid 1.0](https://digitaleoverheid.nl/html/internetdomeinbeleid-rijksoverheid.html): hergebruik van een bestaand overheidsbreed domein gaat vóór een nieuw domein
* [Register Internetdomeinen Overheid: `overheid.nl`](https://organisaties.overheid.nl/domeinen/71428/Logius/domeinnaamregistratie/29606579/overheid.nl): Logius als houder van `overheid.nl` namens de Rijksoverheid
* [Binnenlands Bestuur, "Aanvraag voor toplevel-domeinnaam pas 2026 mogelijk"](https://www.binnenlandsbestuur.nl/digitaal/aanvraag-voor-toplevel-domeinnaam-pas-2026-mogelijk): stand van de invoering van `.gov.nl`
* [Dienst Publiek en Communicatie](https://organisaties.overheid.nl/domeinen/94546/Dienst_Publiek_en_Communicatie): registrar van domeinnamen van de Rijksoverheid
