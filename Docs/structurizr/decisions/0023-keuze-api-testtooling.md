# 23. Keuze tooling voor het testen van de API's

Datum: 2026-09-16

## Status
Proposed

## Gerelateerde documenten
- [Hoofdstuk 12 - Testen](../docs/12-testen.md): teststrategie en testplan backendservices. Deze ADR voegt geen laag toe aan dat model, maar kiest gereedschap binnen twee bestaande lagen.
- [TESTVERBETERPLAN-PROFIELSERVICE](https://docs.rijksapp.nl/docs/23220aa3-e724-4356-986a-7ec5801f8dcf/) en [TESTVERBETERPLAN-NMC](https://docs.rijksapp.nl/docs/63254085-ac3c-4ce0-94b3-91af1bc21e78/): de items *Geen e2e-suite in de pipeline*, *Geen performancetests* en *Geen DAST*.

## Termen
**Collectie**: een verzameling opgeslagen API-verzoeken met omgevingen en asserties.\
**Componentlaag**: de bestaande `@QuarkusTest`-laag die elk endpoint van buitenaf test, per pull request, koud en zonder gedeployde omgeving.\
**e2e-laag**: de laag uit het testplan die twee of meer gedeployde services over een echt netwerk aanspreekt.\
**Rol A / Rol B**: de twee gereedschapsrollen die in deze ADR apart worden beoordeeld; zie *Onderzoeksopzet*.\
**FSC**: Federatieve Service Connectiviteit. Een afnemer roept een dienst aan via zijn eigen outway en de inway van de aanbieder, op basis van een contract; zie hoofdstuk 4 van [Doelbinding - Logging en toegang](https://github.com/MinBZK/MijnOverheidZakelijk/tree/main/Docs/structurizr/decisions/addendum/profiel-service-logging-en-toegang.md), een addendum bij ADR-0011.\
**ZAD**: de omgeving waarnaar beide services per pull request (`pr-<n>`) en per merge naar main (`stable`) deployen.

## Context

Er is de wens om de API van de Profielservice en de NMC ook los te kunnen testen. De story vraagt om een toolingkeuze met deze eisen:

1. bruikbaar voor niet-technici, dus ook zonder Git-toegang;
2. een installatie op de gebruikerslaptop is toegestaan;
3. API-calls en testen moeten onderling gedeeld kunnen worden, idealiter centraal, eventueel via bestanden;
4. een UI waarin API-calls aangepast kunnen worden;
5. geautomatiseerde, sequentiële API-testen;
6. idealiter ook toepasbaar in de pipeline, in elk geval GitHub; of het in GitLab kan moet worden onderzocht;
7. gratis en/of open source;
8. er moet een (integratie) API test mee kunnen draaien in de pipeline (eventueel nightly op main).

De vraag valt uiteen in twee behoeften, die in het testmodel op verschillende plaatsen liggen:

- **Handmatig en exploratief onderzoeken van de API**, ook door mensen zonder Git en zonder IDE. Het testplan noemt dit expliciet als de enige bewust handmatige activiteit, getimeboxt en charter-gestuurd. Hiervoor is nu geen vastgelegd gereedschap.
- **Een geautomatiseerde API-test in de pipeline tegen een gedeployde omgeving.** Dit is het item *Geen e2e-suite in de pipeline* uit beide verbeterplannen: de e2e-laag, 's nachts tegen `main`, met een maximum van ongeveer tien journeys en het toelatingscriterium dat een journey een storing moet vangen die geen enkele test van één losse service kan vangen.

## Onderzoeksopzet

De kandidaten zijn beoordeeld tegen de zeven eisen, gesplitst naar **twee rollen**. 

- **Rol A — handmatige API-client met UI.** Moet eis 1 tot en met 4 halen.
- **Rol B — geautomatiseerde runner voor de pipeline.** Moet eis 5, 6 en 8 halen. Een tool die alle rollen vervult heeft een streepje voor, omdat wat handmatig wordt aangeklikt dan hetzelfde artefact is als wat de pipeline draait.

## Besluit

1. **Bruno vervult rol A en, voor de nachtelijke run, ook rol B.**
2. **Journeys die Bruno ontgroeien, gaan naar Karate of REST Assured.**
Heeft een journey polling of tijdgebonden asserties nodig, zoals de asynchrone bezorgstatus, dan wordt hij in Karate of REST Assured geschreven en niet met scripts in Bruno geforceerd.
3. **Schemathesis wordt als optionele derde stap voorgesteld,** in dezelfde nachtrun, tegen dezelfde omgeving, gevoed door hetzelfde `openapi.yaml`. Dit betreft een aanvulling met vrijwel nul onderhoud.

De volgende punten geven, in volgorde van gewicht, de doorslag voor besluit 1.:

- **Het vervult beide rollen met hetzelfde artefact.** Wat een tester aanklikt is het bestand dat de pipeline draait.\
Geen enkele andere kandidaat die rol A haalt, doet dat zonder een tweede gereedschap of een clouddienst.
- **Plat tekstformaat, één bestand per verzoek.** Dit is wat eis 3 in de praktijk waar maakt en wat SoapUI afwijst: deelbaar als map, leesbaar in een diff, te beoordelen in een pull request.
- **Volledig offline, zonder account.** Geen testdata en geen collectie bij een externe partij. Dit wijst Postman, Insomnia en Apidog af.
- **Importeert OpenAPI**, waardoor de collectie een afgeleide van het contract is en geen tweede handmatig onderhouden waarheid.
- **MIT, en het actiefste van de beoordeelde clients.**

## Onderzoeksresultaten
Licenties en projectactiviteit zijn gemeten op 10 september 2026; zie *Meetgegevens*.

### Rol A: handmatige API-client

| Kandidaat | Licentie | Oordeel |
|---|---|---|
| **Bruno** | MIT | **Gekozen**; zie hieronder |
| Hoppscotch CE | MIT | Serieuze kandidaat, alleen zinvol zelf gehost; terugvaloptie |
| Yaak | MIT | Serieuze kandidaat; governancevoorbehoud |
| SoapUI Open Source | EUPL 1.1 | **Afgevallen**: op opslagformaat |
| Postman | closed, SaaS | **Afgevallen**: op eis 7 en gegevensbescherming |
| Insomnia | gemengd | **Afgevallen**: duwt naar account en cloud |
| Apidog | closed, SaaS | **Afgevallen**: zelfde grond als Postman |
| Restfox, Insomnium, Milkman | MIT e.a. | **Afgevallen**: Werkend maar wezenlijk kleinere projecten |
| Thunder Client, REST Client | extensies | **Afgevallen**: Vereisen VS Code; falen eis 1 |

\
**Bruno.** Desktopapplicatie die volledig offline werkt zonder account.\
Collecties zijn mappen met platte-tekstbestanden op schijf: te openen vanuit de applicatie, te delen als map of zip, en te versioneren in Git voor wie dat wil. Importeert een OpenAPI-document rechtstreeks uit bestand of URL en groepeert de verzoeken op de tags uit het contract. Vervult ook rol B, met dezelfde bestanden. Van de beoordeelde clients het meest actieve project.

**Hoppscotch Community Edition.** Zelf te hosten met Docker, browser-based dus behoeft geen installatie op de laptop, en met workspaces die het delen wél centraal maken.\
Dit is de enige kandidaat die de "idealiter vanuit een centrale plek"-eis volledig invult, en het sluit aan op de suggestie in de story om naar ZAD te kijken. Het kost een deployment, een database en een koppeling met een identity provider, plus het beheer daarvan, voor een probleem dat een gedeelde map ook oplost.\
En het lost het onderliggende probleem niet op: een centrale collectie die niemand uit het contract regenereert veroudert net zo hard als een gedeelde zip.

**Yaak.** Functioneel een goed alternatief voor Bruno, offline, MIT, en een groot en actief project.\
Het voorbehoud is niet technisch maar bestuurlijk: het project neemt naar eigen zeggen alleen bijdragen aan voor bugfixes en wordt gefinancierd uit aangeschafte licenties.\
Open source qua licentie, maar niet gemeenschappelijk bestuurd wat ongewenste risico's met zich mee brengt.

### Rol B: geautomatiseerde runner

| Kandidaat | Licentie | Oordeel |
|---|---|---|
| **Bruno CLI** | MIT | **Gekozen** voor de nachtelijke smoke- en journeyrun |
| REST Assured | Apache 2.0 | **Afgevallen**: Al in gebruik in de componentlaag; blijft daar |
| Karate | Apache 2.0 | **Gekozen** als route voor journeys met asynchrone stappen |
| Playwright | Apache 2.0 | **Afgevallen**: Sterk, maar niet-Java; heroverwegen bij een frontend |
| Schemathesis | MIT | **Aanbevolen aanvulling**, geen vervanging |
| Hurl | Apache 2.0 | **Afgevallen**: Prima CLI, maar geen UI en dus geen dubbelrol |
| Newman | Apache 2.0 | **Afgevallen**: Alleen zinvol met Postman |
| Tavern, Venom | MIT/Apache | **Afgevallen**: Werkend, kleinere ecosystemen |
| Citrus | Apache 2.0 | **Afgevallen**: Sterk op messaging; hier overgedimensioneerd |
| Dredd | MIT | **Afgevallen**: Feitelijk niet meer onderhouden |
| Step CI | MPL-2.0 | **Afgevallen**: laatste commit augustus 2024 |
| Pact, k6, ZAP | div. | Staan al in het testplan voor contract, performance en DAST |

\
**Bruno CLI.** Draait dezelfde collectie als de applicatie en schrijft JSON-, JUnit- en HTML-rapportages.\
Er is een officiële Docker-image en een GitHub Action. De aanroep is een gewoon npm-commando.

**Playwright.** Doet met `APIRequestContext` zuiver API-testen zonder browser, en handelt asynchroon wachten met `expect.poll()` beter af dan scripting in een API-client.\
Het heeft geen UI om een verzoek op te stellen en vervult rol A dus niet.\
Als runner is het een echte kandidaat naast Karate. Het bezwaar is dat het testcode in Node/TypeScript zet in een Java-team.\
Het testplan stelt dat er een aanvullend testplan komt zodra MOZA een frontend krijgt.\
Op dat moment dekt Playwright browserjourneys én hun API-voorbereiding met één gereedschap, en verschuift de afweging.\
Dat is een expliciet heroverwegingsmoment, geen afwijzing.

**Schemathesis.** Genereert tests rechtstreeks uit het OpenAPI-document en zoekt naar antwoorden die het contract schenden, inclusief randgevallen die niemand met de hand zou opschrijven. Geen UI en geen handmatig gebruik.\
Wel een aanvulling met vrijwel nul onderhoud, omdat er niets te onderhouden valt: het contract is de test.

### Meetgegevens

Gemeten op 10 september 2026, via de GitHub-API.

| Project | Laatste push | Sterren | Licentie |
|---|---|---|---|
| Hoppscotch | 2026-09-08 | 80.263 | MIT |
| Bruno | 2026-09-10 | 46.865 | MIT |
| Yaak | 2026-09-10 | 19.188 | MIT |
| Restfox | 2026-07-03 | 2.756 | MIT |
| Step CI | 2024-08-03 | 1.870 | MPL-2.0 |
| SoapUI | 2026-06-08 | 1.706 | EUPL 1.1|

## Risico's

| Risico | Mitigatie |
|---|---|
| Bruno verschuift kernfunctionaliteit naar een betaalde editie. | Hergenereren van de verzoeken in de opvolger tool. Opnieuw handmatig asserties, koppeling tussen verzoeken, omgevingen en de journeys configureren. |
| De collectie groeit uit tot een tweede, met de hand onderhouden regressiesuite naast de componentlaag. | Bij review van een nieuwe journey is de toelatingsvraag verplicht. |
| Een clientcertificaat of sleutel belandt in een collectiemap, een zip of de repository. | De collectie bevat alleen variabelen; de bestanden komen lokaal uit een genegeerd `.env`-bestand en in de pipeline uit CI-secrets. |
| Productiedata in een handmatige collectie. | Geen productiedata in enige testomgeving, op geen enkele laag. Voorbeelddata in de collectie is synthetisch.|