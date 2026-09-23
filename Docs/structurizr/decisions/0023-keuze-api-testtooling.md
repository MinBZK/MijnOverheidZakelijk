# 23. Keuze tooling voor het testen van de API's

Datum: 2026-09-16

## Status
Proposed

## Gerelateerde ADRs en documenten
- [ADR 0012 - MOZa repositories op GitHub](0012-moza-repositories-github.md): bepaalt dat GitHub Actions de pipeline is.
- [ADR 0017 - Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): het eerdere testkader, waar hoofdstuk 12 bewust van afwijkt.\
Relevant voor deze ADR omdat de acceptatietest door product owner en belanghebbenden en de functionele check door de reviewer daaruit komen. Juist die gebruikers hebben een tool zonder Git nodig, en of die twee activiteiten terugkeren is nog niet besloten.
- [ADR 0022 - Georkestreerde state machine met eventlog voor de notificatielevenscyclus](0022-georkestreerde-state-machine-met-eventlog.md): op het moment van schrijven nog een voorstel op een eigen branch. Die ADR ontsluit de koppelvlakken voor dienstverleners over FSC, met daarbovenop een OAuth2-token per bericht en autorisatie per dienstverlener. Als deze ADR landt, dan geldt *De directe route kent geen authenticatie* niet meer voor de NMC en heeft een journey tegen die koppelvlakken ook een token nodig.
- [Hoofdstuk 12 - Testen](../docs/12-testen.md): teststrategie en testplan backendservices. Deze ADR voegt geen laag toe aan dat model, maar kiest gereedschap binnen twee bestaande lagen.
- `TESTVERBETERPLAN.md`, gap 21 (geen e2e-suite), gap 22 (geen performancetests), gap 23 (geen DAST).
- De repository `moza-mock` (WireMock-stubs plus een Bruno-collectie).

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
7. gratis en/of open source.

Aanvullend is in de story opgemerkt dat het ook belangrijk is *"dat er ook een (integratie) API test draait in de pipeline (eventueel nightly op main)."*

### Uitgangssituatie

Vier eigenschappen van de huidige situatie sturen de keuze meer dan de toolvergelijking zelf.

**De API's zijn contract-first.** `src/main/resources/META-INF/openapi.yaml` is in beide services de bron: de DTO's en de controller-interfaces worden eruit gegenereerd en hetzelfde bestand wordt statisch op `/openapi.json` geserveerd. Een collectie hoeft dus niet met de hand geschreven en onderhouden te worden, maar wordt uit het contract gegenereerd. Dat haalt het grootste bezwaar tegen elke API-client weg namelijk dat de collectie na een aantal sprints niet meer klopt. Het weegt bovendien mee in de keuze zelf: een tool die geen OpenAPI kan importeren valt, ongeacht zijn overige kwaliteiten, af.

**Er staat al een UI.** Swagger UI is op elke ZAD-deployment bereikbaar op `/docs`, ook op de `pr-<n>`-omgevingen. Een niet-technicus die één call wil afvuren tegen een pull request kan dat vandaag al, zonder installatie en zonder Git. Wat Swagger UI niet biedt is opslaan, delen en sequenties. De toolingkeuze gaat dus over die drie dingen, niet over "een UI".

**De directe route kent geen authenticatie, de FSC-route wel.** Wie een service rechtstreeks op haar ZAD-adres aanroept, heeft geen credentials nodig: er is geen OIDC of API-key op de eigen endpoints. Dat houdt de drempel voor handmatig gebruik laag. Via FSC is dat anders: daar zijn een clientcertificaat, een access token en een FSC-transactie-id nodig (zie *De FSC-route naar de NMC*). De keuze moet dus ook met die authenticatie overweg kunnen. Dat wordt eerder meer dan minder: ADR 0022 stelt voor de koppelvlakken voor dienstverleners over FSC te ontsluiten met een OAuth2-token per bericht.

**De componentlaag is al een geautomatiseerde API-test.** Elk endpoint wordt per pull request van buitenaf getest met REST Assured tegen een draaiende service. Die laag is snel, deterministisch, draait koud op een laptop en wijst bij een probleem direct naar de oorzaak.

### Wat er al staat, en wat dat wel en niet bewijst

In `moza-mock` staat een Bruno-collectie van 76 verzoeken met vijf omgevingen, voor het laatst bijgewerkt op 25 augustus 2026. De collectie hoort bij de WireMock-stubs in diezelfde repository: er is één verzoek per stub, elk verzoek assert de verwachte statuscode, en de collectie draaien is daarmee een smoketest van de mocks. Daarnaast bevat zij een map `e2e` met een journey van acht stappen over Profielservice en NMC heen, en een omgeving `zad - stable` waarin `profielUrl` naar de echte gedeployde Profielservice wijst terwijl de rest op WireMock blijft staan.

**Dit is geen eerdere toolingkeuze en telt in deze ADR niet als argument.** Bruno is daar in gebruik geraakt omdat men daar bekend mee was. Er is geen onderzoek aan voorafgegaan, geen afweging tegen alternatieven vastgelegd en geen ADR geschreven.\
Deze ADR doet die beoordeling alsnog, en doet dat zonder de uitkomst vooraf vast te leggen: was het onderzoek op een ander gereedschap uitgekomen, dan had hier een migratiepad gestaan.

### De FSC-route naar de NMC

Naast de directe route loopt er een route via FSC: afnemer, outway, inway, NMC. Een ontwikkelaar heeft die in september 2026 met Bruno doorlopen tegen de FSC-omgeving van Lovelace en tegen de NMC, allebei op ZAD. Alleen Bruno draaide lokaal. De stappen waren:

1. de dienst aanmaken;
2. de dienst publiceren in de directory;
3. een verbinding aanvragen voor een hash grant;
4. het clientcertificaat van de outway aan de collectie toevoegen;
5. met de hash grant een access token ophalen bij FSC;
6. de NMC aanroepen met dat token en een FSC-transactie-id.

De notificatie kwam aan in de mailbox.

Wat die test bewijst en wat niet:

- **Bewezen:** Bruno kan de FSC-route aan, dus een clientcertificaat, een tokenaanvraag en de FSC-headers in één sequentie. De FSC-componenten op ZAD zijn bereikbaar van buiten ZAD.
- **Niet bewezen:** dat de transactie in de transactielog van beide peers staat. Dat is het eigenlijke acceptatiecriterium van deze route en is nog niet nagelopen.
- **Nog niet geschikt voor een pipeline:** de certificaatinstelling in de collectie verwijst naar een vast pad op de laptop van de ontwikkelaar. Besluit 13 beschrijft hoe dat wel moet.

### Wat de vraag wél en niet is

De vraag lijkt op het eerste gezicht om een geautomatiseerde API-regressiesuite te vragen. Die hebben we al: dat is de componentlaag. Deze naast de bestaande suite in een API-client nabouwen levert een tweede, met de hand onderhouden regressiesuite op die dezelfde defecten vangt, trager is, en pas nadat er ergens iets gedeployd is. Dat is in strijd met uitgangspunt 2 uit de teststrategie (test op de laagste laag waar het risico echt is) en uitgangspunt 4 (elke laag beantwoordt precies één vraag).

De vraag valt uiteen in twee behoeften, die in het testmodel op verschillende plaatsen liggen:

- **Handmatig en exploratief onderzoeken van de API**, ook door mensen zonder Git en zonder IDE. Het testplan noemt dit expliciet als de enige bewust handmatige activiteit, getimeboxt en charter-gestuurd. Hiervoor is nu geen vastgelegd gereedschap.
- **Een geautomatiseerde API-test in de pipeline tegen een gedeployde omgeving.** Dit is gap 21 uit het verbeterplan: de e2e-laag, 's nachts tegen `main`, met een maximum van ongeveer tien journeys en het toelatingscriterium dat een journey een storing moet vangen die geen enkele test van één losse service kan vangen.

**Het werkelijke gat zit in de pipeline, niet in de tooling.** In geen van de repositories draait vandaag een API-test in CI: `moza-mock/.github/workflows/deploy.yml` bouwt en deployt alleen de WireMock-image, en nergens komt een aanroep van een collectierunner voor. De handmatige helft van de story bestaat feitelijk al, zij het ongeordend en zonder vastgelegde keuze; de helft waar de story-opmerking om vraagt bestaat niet.

## Onderzoeksopzet

De kandidaten zijn beoordeeld tegen de zeven eisen, gesplitst naar **twee rollen**. Die splitsing is nodig omdat een vergelijking zonder haar oneerlijk wordt: een gereedschap zonder UI om verzoeken op te stellen faalt eis 1 en 4 per definitie en hoort niet tegen een API-client afgewogen te worden, maar tegen andere testframeworks.

- **Rol A — handmatige API-client met UI.** Moet eis 1 tot en met 4 halen. Dit is waar de story primair om vraagt.
- **Rol B — geautomatiseerde runner voor de pipeline.** Moet eis 5 en 6 halen. Een tool die beide rollen vervult heeft een streepje voor, omdat wat handmatig wordt aangeklikt dan hetzelfde artefact is als wat de pipeline draait.

Eis 7 (gratis en/of open source) geldt voor beide rollen en is een harde eis, geen weging.

Licenties en projectactiviteit zijn gemeten op 10 september 2026; zie *Meetgegevens*.

## Rol A: handmatige API-client

| Kandidaat | Licentie | Oordeel |
|---|---|---|
| **Bruno** | MIT | **Gekozen**; zie hieronder |
| Hoppscotch CE | MIT | Serieuze kandidaat, alleen zinvol zelf gehost; terugvaloptie |
| Yaak | MIT | Serieuze kandidaat; governancevoorbehoud |
| SoapUI Open Source | EUPL 1.1 | Afgevallen op opslagformaat |
| Postman | closed, SaaS | Afgevallen op eis 7 en gegevensbescherming |
| Insomnia | gemengd | Afgevallen; duwt naar account en cloud |
| Apidog | closed, SaaS | Afgevallen, zelfde grond als Postman |
| Restfox, Insomnium, Milkman | MIT e.a. | Werkend maar wezenlijk kleinere projecten |
| Thunder Client, REST Client | extensies | Vereisen VS Code; falen eis 1 |

\
**Bruno.** Desktopapplicatie die volledig offline werkt zonder account.\
Collecties zijn mappen met platte-tekstbestanden op schijf: te openen vanuit de applicatie, te delen als map of zip, en te versioneren in Git voor wie dat wil. Importeert een OpenAPI-document rechtstreeks uit bestand of URL en groepeert de verzoeken op de tags uit het contract. Vervult ook rol B, met dezelfde bestanden. Van de beoordeelde clients het meest actieve project.

**Hoppscotch Community Edition.** Zelf te hosten met Docker, browser-based dus behoeft geen installatie op de laptop, en met workspaces die het delen wél centraal maken.\
Dit is de enige kandidaat die de "idealiter vanuit een centrale plek"-eis volledig invult, en het sluit aan op de suggestie in de story om naar ZAD te kijken. Het kost een deployment, een database en een koppeling met een identity provider, plus het beheer daarvan, voor een probleem dat een gedeelde map ook oplost.\
En het lost het onderliggende probleem niet op: een centrale collectie die niemand uit het contract regenereert veroudert net zo hard als een gedeelde zip.

**Yaak.** Functioneel een goed alternatief voor Bruno, offline, MIT, en een groot en actief project.\
Het voorbehoud is niet technisch maar bestuurlijk: het project neemt naar eigen zeggen alleen bijdragen aan voor bugfixes en wordt gefinancierd uit aangeschafte licenties.\
Open source qua licentie, maar niet gemeenschappelijk bestuurd.\
Voor een overheidsorganisatie die op de levensduur van een tool wedt is dat een ander risicoprofiel dan Bruno of Hoppscotch.

**SoapUI Open Source.** Haalt de eisen op papier: UI, testsuites met sequentiële stappen, asserties, en een `testrunner` voor CI.\
De licentie is EUPL 1.1, dezelfde familie als de EUPL-1.2 waaronder MOZA zelf publiceert, en het project wordt onderhouden (5.9.0 in juli 2025).\
Wat het afwijst is het opslagformaat: een SoapUI-project is **één groot XML-bestand**. Daarmee vervalt eis 3 in de praktijk zodra twee mensen eraan werken: onleesbare diffs, samenvoegconflicten bij elke wijziging, en geen manier om één verzoek in een pull request te beoordelen.\
De historische kracht van de tool ligt bovendien bij SOAP en WSDL, wat hier niet speelt.

**Postman.** Geen open source, en de gratis laag is een SaaS-product: collecties synchroniseren standaard naar de cloud van de leverancier en een echte offline modus is er niet meer. Voor services die persoonsgegevens verwerken is dat een verwerking bij een derde partij die we voor testdata niet willen aangaan.\
Newman, de runner, is wel open source, maar dan houd je een pipelinerunner over zonder de bijbehorende werkwijze.

**Insomnia.** Valt af om dezelfde reden in lichtere vorm als Postman.

**Apidog.** Valt af om exact dezelfde reden als Postman.

## Rol B: geautomatiseerde runner

| Kandidaat | Licentie | Oordeel |
|---|---|---|
| **Bruno CLI** | MIT | **Gekozen** voor de nachtelijke smoke- en journeyrun |
| REST Assured | Apache 2.0 | Al in gebruik in de componentlaag; blijft daar |
| Karate | Apache 2.0 | **Gekozen** als route voor journeys met asynchrone stappen |
| Playwright | Apache 2.0 | Sterk, maar niet-Java; heroverwegen bij een frontend |
| Schemathesis | MIT | **Aanbevolen aanvulling**, geen vervanging |
| Hurl | Apache 2.0 | Prima CLI, maar geen UI en dus geen dubbelrol |
| Newman | Apache 2.0 | Alleen zinvol met Postman |
| Tavern, Venom | MIT/Apache | Werkend, kleinere ecosystemen |
| Citrus | Apache 2.0 | Sterk op messaging; hier overgedimensioneerd |
| Dredd | MIT | Feitelijk niet meer onderhouden |
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

**Schemathesis.** Genereert tests rechtstreeks uit het OpenAPI-document en zoekt naar antwoorden die het contract schenden, inclusief randgevallen die niemand met de hand zou opschrijven.Geen UI en geen handmatig gebruik.\
Wel een aanvulling met vrijwel nul onderhoud, omdat er niets te onderhouden valt: het contract is de test.

## Meetgegevens

Gemeten op 10 september 2026, via de GitHub-API.

| Project | Laatste push | Sterren | Licentie |
|---|---|---|---|
| Hoppscotch | 2026-09-08 | 80.263 | MIT |
| Bruno | 2026-09-10 | 46.865 | MIT |
| Yaak | 2026-09-10 | 19.188 | MIT |
| Restfox | 2026-07-03 | 2.756 | MIT |
| Step CI | 2024-08-03 | 1.870 | MPL-2.0 |
| SoapUI | 2026-06-08 | 1.706 | EUPL 1.1 |

Sterren zeggen weinig over geschiktheid en staan hier alleen als grofmazige indicatie van hoeveel mensen een probleem al voor ons hebben gehad. De pushdatum is het cijfer dat telt: Step CI oogt levend maar heeft ruim twee jaar geen commit gezien, en is op die grond afgevallen.

## Besluit

**Bruno vervult rol A en, voor de nachtelijke run, ook rol B.**

De doorslag geven, in volgorde van gewicht:

1. **Het vervult beide rollen met hetzelfde artefact.** Wat een tester aanklikt is het bestand dat de pipeline draait.\
Geen enkele andere kandidaat die rol A haalt, doet dat zonder een tweede gereedschap of een clouddienst.
2. **Plat tekstformaat, één bestand per verzoek.** Dit is wat eis 3 in de praktijk waar maakt en wat SoapUI afwijst: deelbaar als map, leesbaar in een diff, te beoordelen in een pull request.
3. **Volledig offline, zonder account.** Geen testdata en geen collectie bij een externe partij. Dit wijst Postman, Insomnia en Apidog af.
4. **Importeert OpenAPI**, waardoor de collectie een afgeleide van het contract is en geen tweede handmatig onderhouden waarheid.
5. **MIT, en het actiefste van de beoordeelde clients.**

Verder:

6. **De collectie wordt gegenereerd uit `openapi.yaml`** en is niet met de hand geschreven. Het contract blijft de bron.\
Omgevingsbestanden voor lokaal, `pr-<n>` en `stable` staan ernaast.\
Secrets staan er nooit in maar komen uit een genegeerd `.env`-bestand of uit CI-secrets.

7. **Niet-technici krijgen de collectie als map of zip,** of als bijlage bij een release.\
Dat is geen omweg om Git heen maar de expliciete invulling van eis 3.

8. **Er komt geen centrale hosting, voorlopig.**\
Dit besluit wordt heroverwogen zodra er meer dan één groep buiten het team met de collectie werkt, of zodra meer dan eens blijkt dat er een verouderde zip in omloop is.\
Zelf hosten van Hoppscotch Community Edition op ZAD is dan de eerste optie om te onderzoeken.\
Die heroverweging beantwoordt ook wat er met de pipeline gebeurt, want met twee gereedschappen vervalt het argument dat één artefact beide rollen vervult (besluit 1).

9. **De pipelinerol van Bruno is de nachtelijke smoke- en journeyrun tegen ZAD `stable`,** in GitHub Actions, met `--reporter-junit` en het resultaat als artifact. Dit is de invulling van de opmerking in de story en van gap 21. 
Het is uitdrukkelijk **geen** tweede regressiesuite: de per-PR-dekking van elk endpoint blijft in de componentlaag, koud en zonder omgeving, conform uitgangspunt 10.

10. **De toelatingsregel van de e2e-laag blijft gelden.**\
Een journey komt alleen in de nachtrun als hij een storing vangt die geen enkele test van één losse service kan vangen: deployconfiguratie, secretsinjectie, netwerkbeleid, service discovery, of de volgorde van twee services.\
De eerste kandidaten zijn de asynchrone bezorgstatus, zoals gap 21 al aanwijst, en de FSC-route naar de NMC.\
Die laatste gaat over precies de grenzen die de toelatingsregel noemt: netwerkbeleid, certificaten, service discovery via de directory en de samenwerking van twee peers. Geen componenttest kan die afdekken.

11. **De bestaande e2e-journey wordt eerst hersteld, daarna pas geautomatiseerd.**\
Stap 7 krijgt de verplichte request body en de journey maakt zijn eigen data met een run-id en ruimt die op.\
Een journey die groen is omdat hij tegen een mock draait, is geen e2e-test.\
Automatiseren vóór het herstel legt de fout vast in plaats van hem te vinden.
Context: **Stap 7 van de e2e-journey stuurt geen request body mee bij de DELETE**, terwijl het contract die verplicht stelt. Tegen WireMock slaagt de stap, want een mock valideert de body niet. Tegen de echte Profielservice geeft dezelfde aanroep een `400` met `"Request body mag niet leeg zijn"`.

12. **Journeys die Bruno ontgroeien, gaan naar Karate of REST Assured.**\
Heeft een journey polling of tijdgebonden asserties nodig, zoals de asynchrone bezorgstatus, dan wordt hij in Karate of REST Assured geschreven en niet met scripts in Bruno geforceerd.\
Playwright wordt heroverwogen zodra MOZA een frontend krijgt en het aanvullende testplan uit hoofdstuk 12 aan de orde is.

13. **De collectie verwijst naar certificaten, maar bevat ze nooit.**\
De certificaatinstelling voor het FSC-domein staat in de collectie, met variabelen als paden, bijvoorbeeld `{{process.env.FSC_CLIENT_CERT}}`. De CLI vult die variabelen bij elke aanroep in; een relatief pad lost hij op ten opzichte van de collectiemap. Lokaal komen de waarden uit een genegeerd `.env`-bestand.\
In de pipeline schrijft de workflow certificaat en sleutel uit CI-secrets naar een tijdelijke map en zet de variabelen.\
Is een eigen vertrouwensanker nodig, dan gaat dat mee via `--cacert`. Een vast pad in de collectie is uitgesloten, want dat werkt maar op één laptop.\
Certificaat- en sleutelbestanden staan nooit in een collectiemap, een zip of een repository.\
De FSC-journey is daarmee gereedschap voor ontwikkelaars en de pipeline, niet voor niet-technici. Zij gebruiken de directe route.

14. **De mailbox is een externe partij.**\
De FSC-route eindigt bij NotifyNL en een echte mailbox. Het testplan houdt externe partijen in de e2e-laag gestubd; alleen een periodieke live smoke-check raakt de echte dienst. In de nachtrun eindigt deze journey daarom bij de NMC en de transactielog, of hij wordt die periodieke smoke-check.\
Welke van de twee het wordt, moet nog worden besloten.

15. **Schemathesis wordt als optionele derde stap voorgesteld,** in dezelfde nachtrun, tegen dezelfde omgeving, gevoed door hetzelfde `openapi.yaml`.

### Waar collecties wonen

Drie soorten collectie, met elk een eigen plaats en een eigen doel. Zonder deze scheiding staan dezelfde verzoeken op twee plekken en lopen ze uit elkaar.

- **Stubsmoketest** blijft in `moza-mock/bruno`. Die verzoeken testen de WireMock-stubs, niet een service. Dat is een eigen doel en het hoort bij de stubs te staan.
- **Per-service collectie** staat bij de service, in `api-tests/` in de repository van die service, en wordt uit het contract van díe service gegenereerd. Dit is het gereedschap voor exploratief onderzoek en voor niet-technici.
- **Cross-service journeys** staan op één plaats, nu `moza-mock/bruno/e2e`. Alleen deze draaien in CI.

### Formaat

Bruno kent twee opslagformaten: het oorspronkelijke `.bru` en het nieuwere OpenCollection YAML, dat sinds versie 3.1 de standaard is voor nieuwe collecties. Beide worden ondersteund door de CLI en beide zijn plat tekst; binnen één collectie kunnen ze niet gemengd worden.

**Nieuwe collecties gebruiken OpenCollection YAML.** YAML is het formaat dat in dit project overal al gelezen wordt (`openapi.yaml`, de workflows, `docker-compose.yml`, `publiccode.yml`), waar `.bru` een eigen syntax is die nergens anders voorkomt. Dat weegt hier zwaarder dan gebruikelijk, omdat eis 1 om leesbaarheid voor niet-technici vraagt.

De bestaande collectie in `moza-mock` staat in `.bru`. Die migreert wanneer het uitkomt en niet met spoed: de migratie is verliesvrij, maar verloopt via exporteren en opnieuw importeren.\
De VS Code-extensie van Bruno ondersteunt OpenCollection YAML sinds versie 5.0.0.\
Twee formaten naast elkaar is aanvaardbaar zolang het per collectie consistent is.

### Antwoord op de GitLab-vraag

Deze vraag hoeft niet apart onderzocht te worden. De Bruno CLI is een gewoon npm-pakket en de aanroep is één regel shell. Elke CI die Node kan draaien, draait het: GitHub Actions, GitLab CI, of een pipeline op ZAD. Hetzelfde geldt voor Schemathesis (pip), Karate (Maven) en Playwright (npm). Er is dus geen scenario waarin we een aparte ZAD-pipeline moeten inrichten omdat de tool niet meekan.

Voor de FSC-route komt er een netwerkvraag bij: de runner moet de FSC-componenten op ZAD kunnen bereiken. De test vanaf een laptop laat zien dat die van buiten ZAD bereikbaar zijn, dus een GitHub-hosted runner kan dat naar verwachting ook. Dat wordt bevestigd bij de eerste nachtrun. Blijkt het niet zo te zijn, dan komt de suggestie uit de story terug: een runner binnen ZAD. Tot die tijd vervalt die suggestie.

## Gevolgen

**Positief**
- Wat handmatig wordt aangeklikt en wat de pipeline draait is hetzelfde bestand. Een tester die een probleem vindt, levert de reproductie aan in het formaat dat de nachtrun kan overnemen.
- Geen testdata en geen collectie bij een externe partij.
- De collectie veroudert niet stilzwijgend, omdat hij uit het contract wordt gegenereerd en het contract al door `OpenApiContractDriftTest` bewaakt wordt.
- De GitLab-vraag en de vraag om centrale hosting zijn beantwoord zonder extra infrastructuur.
- Omdat het onderzoek uitkomt op een tool die toevallig al in huis is, zijn de invoeringskosten laag en hoeft niemand om te leren. Dat is een **gevolg** van de uitkomst en was geen grond ervoor.

**Negatief en geaccepteerd**
- Delen gaat via bestanden. Iemand kan met een oude zip werken. Dat is de prijs voor het niet hoeven beheren van een gehoste dienst, en de herzieningsvoorwaarde staat hierboven.
- Bruno is minder sterk in asynchrone journeys dan Karate of Playwright. Besluit 12 wijst zulke journeys vooraf toe aan Karate of REST Assured, in plaats van dat we het merken als de eerste journey vastloopt.
- Twee opslagformaten naast elkaar, tot `moza-mock` migreert.
- Er komt gereedschap bij dat onderhouden moet worden, ook al is het weinig.

## Risico's

| Risico | Mitigatie |
|---|---|
| Bruno verschuift kernfunctionaliteit naar een betaalde editie. | Zie *Uitstapclausule* hieronder. De trigger is nauw omschreven en het uitstappad ligt vast. |
| De collectie groeit uit tot een tweede, met de hand onderhouden regressiesuite naast de componentlaag. | Vastgelegd in besluit 9 en 10. Bij review van een nieuwe journey is de toelatingsvraag verplicht. |
| Dezelfde verzoeken raken verspreid over meerdere collecties en lopen uit elkaar. | De driedeling onder *Waar collecties wonen*, met per soort één plaats. |
| Een journey is groen omdat hij een mock raakt in plaats van een service. | Besluit 11. In de nachtrun staat per omgeving vast welke URL's een echte service zijn; een journey die alleen tegen mocks groen is, telt niet als e2e. |
| De nachtrun wordt flaky doordat `stable` gedeeld is. | De datadiscipline uit het testplan geldt onverkort: elke run maakt zijn eigen data met een run-id, ruimt op, en assert nooit op totalen of op "het laatste record". Nultolerantie op flakiness. |
| Secrets belanden in een gedeelde zip of in de repository. | Omgevingsbestanden met secrets staan in `.gitignore` en worden nooit meegeleverd. De herkomst van de bestaande `kvkApiKey` wordt bevestigd of de sleutel wordt verwijderd. |
| Een clientcertificaat of sleutel belandt in een collectiemap, een zip of de repository. | Besluit 13. De collectie bevat alleen variabelen; de bestanden komen lokaal uit een genegeerd `.env`-bestand en in de pipeline uit CI-secrets. |
| De FSC-journey stuurt elke nacht echte mail via NotifyNL. | Besluit 14. |
| Productiedata in een handmatige collectie. | Geen productiedata in enige testomgeving, op geen enkele laag. Voorbeelddata in de collectie is synthetisch. |

## Uitstapclausule

Bruno kent vandaag betaalde edities. Die zijn geen trigger: wat erin zit (Git-UI, SSO, audit logs, AI) gebruiken wij niet.

**De trigger is nauwer: de CLI of de collectierunner gaat achter een licentie.** Dat is wat de pipelinehelft breekt en daarmee het argument dat deze ADR draagt, namelijk dat één artefact beide rollen vervult. Een betaalde functie die alleen de applicatie raakt is een ongemak; een betaalde runner is een reden om te vertrekken.

**Converteren naar OpenCollection is niet het uitstappad.** OpenCollection is de specificatie van Bruno zelf. Overstappen van `.bru` naar OpenCollection verplaatst ons tussen twee formaten van dezelfde leverancier en verandert de afhankelijkheid dus niet. Een open *specificatie* is pas een waarborg als andere gereedschappen haar implementeren. Op 16 september 2026 is dat niet het geval: buiten Bruno is geen implementatie van OpenCollection gevonden. Wordt dat wel zo, dan verandert dit oordeel en hoort deze clausule herzien te worden; dat wordt opnieuw nagegaan bij elke herziening van deze ADR. De formaatkeuze in deze ADR staat op leesbaarheid en niet op uitstapbaarheid.

Wat wél beschermt, in volgorde van kracht:

1. **De collectie is een afgeleide van `openapi.yaml`.** Dit is de eigenlijke verzekering en zij ligt er al. Valt Bruno weg, dan genereren we de verzoeken opnieuw in de opvolger; Yaak, Hoppscotch en Restfox importeren allemaal OpenAPI. Wat niet te regenereren is, is het handwerk: asserties, koppeling tussen verzoeken, omgevingen en de journeys. Dat is het te beschermen bezit, en het is klein. Dat het klein blijft is geen toeval maar besluit 9 en 10: dezelfde discipline die verhindert dat hier een tweede regressiesuite ontstaat, houdt de uitstapkosten laag.
2. **MIT is onherroepelijk voor wat al is uitgebracht.** Een leverancier kan toekomstige versies anders licentiëren, maar niet met terugwerkende kracht de MIT-verlening op gepubliceerde code intrekken. De eerste reactie op een betaalmuur is daarom de laatste MIT-versie van CLI en applicatie vastzetten. Dat koopt de tijd om rustig te kiezen. Forken mag, maar is alleen realistisch als een ander die last draagt.
3. **De journeys die er het meest toe doen kunnen naar Karate of REST Assured.** Apache 2.0, Java, vaardigheden al in huis, en in het testplan al benoemd. Dat is echte leveranciersonafhankelijkheid. Hoe meer van de belangrijke journeys daar staan, hoe minder deze clausule ooit hoeft te worden ingeroepen.

## Openstaande punten

1. In `moza-mock` staat een `kvkApiKey`. Naar alle waarschijnlijkheid is dat de publieke testsleutel van de KvK, maar dat is niet vastgelegd. het testplan stelt dat credentials nooit in de repository staan.\
Bevestigen dat de `kvkApiKey` in `moza-mock` de publieke testsleutel van de KvK is, of hem verwijderen.
2. Vaststellen of iemand de omgeving `zad - stable` daadwerkelijk draait; zo ja, dan faalt stap 7 daar.\
Stap 7 van de e2e-journey stuurt geen request body mee bij de DELETE, terwijl het contract die verplicht stelt.
3. Eigenaar aanwijzen voor de nachtrun en voor de triage van een rode run, zoals het testplan vraagt.
4. De certificaatinstelling in de FSC-collectie omzetten van een vast lokaal pad naar variabelen (besluit 13), en nagaan of de Bruno-applicatie die variabelen net zo invult als de CLI. Voor de CLI is dat vastgesteld in de broncode van versie 4.1.0.
5. Uitzoeken of de transactielog van beide peers via een API te bevragen is, zodat de FSC-journey erop kan asserten.
6. Besluiten of de FSC-journey in de nachtrun bij de NMC eindigt of de periodieke live smoke-check wordt (besluit 14).

## Voorgestelde aanpak

1. **Herstel de bestaande e2e-journey.** Request body op stap 7, run-id in de data, opruimen aan het eind. Dit is de goedkoopste stap en levert meteen het bewijs dat een echte omgeving iets vangt wat een mock niet vangt.
2. **Leg de per-service collectie vast.** Gegenereerd uit `openapi.yaml`, met omgevingen voor lokaal en ZAD, in `api-tests/` van elke service.
3. **Beproef het delen.** De collectie als zip aan iemand buiten het team geven en laten uitvoeren zonder Git en zonder verdere uitleg. Dat is de echte toets op eis 1 en 3, niet de installatie.
4. **Nachtrun in GitHub Actions.** Een workflow op schema die de journeys tegen `stable` draait, met JUnit-rapportage als artifact en een rode run die de volgende ochtend een eigenaar heeft. Klein beginnen.
5. **Uitbreiden, met de rem erop.** De FSC-route als volgende journey, zodra openstaande punten 4 tot en met 6 zijn opgelost. De asynchrone bezorgstatus daarna, in Karate of REST Assured als polling nodig blijkt. Schemathesis erbij in dezelfde nachtrun. Beide alleen als de vorige stap groen en stabiel is.
