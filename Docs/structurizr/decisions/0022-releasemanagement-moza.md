# 22. Releasemanagement MOZa

Datum: 2026-09-24

## Status

Proposed

In drie teamsessies zijn alle zevenentwintig beslispunten vastgesteld: veertien kernbesluiten en dertien procesafspraken. Die staan hieronder als besluit. Het laatste openstaande punt — het versieschema voor applicaties — is vastgesteld op Semantic Versioning; de afweging staat in paragraaf 4.1 en is uitgewerkt in het onderzoeksdocument dat bij deze ADR hoort.

Deze ADR gaat naar Accepted zodra open punt O1 — hoe een release op de Logius Private Cloud landt en of de digest die route overleeft — is beantwoord. Dat is het enige dat de overgang nog blokkeert.

## Gerelateerde ADRs

- [ADR 0012 Repositories op GitHub](0012-moza-repositories-github.md): alle repo's publiek onder MinBZK met prefix `moza-`. Deze ADR bouwt daarop voort met wat er per repository wordt uitgebracht.
- [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): het testproces tot en met merge en post-deploy validatie. Deze ADR sluit daarop aan vanaf de merge naar de hoofdbranch.

## Context

Bij MOZa is vandaag niet vast te stellen welke versie van welke component waar draait. Er is geen versienummer om naar te verwijzen. Daardoor is een bevinding op een testomgeving niet te koppelen aan een specifieke build, is er geen afgebakende set wijzigingen om aan beheer of afnemers te melden, betekent terugrollen "de vorige commit opzoeken" in plaats van "terug naar 1.3.2", en kan een afnemer van de logboekdataverwerking-library niet zien of een upgrade breekt.

### Feitenbeeld

Vastgesteld op 26 augustus 2026 door inspectie van alle elf repositories.

| Wat | Bevinding |
| --- | --- |
| Git-tags | Nul, in alle elf repo's samen. |
| Changelogs | Nul. |
| Langlevende branches | Alleen `main`. Geen `develop`, geen `release/*`. |
| Versieschema's | Vijf verschillende, plus drie repo's zonder versie: `1.0.0-SNAPSHOT` (3×), `1.0-SNAPSHOT` (1×), `1.0.0` (1×), `0.1.0-SNAPSHOT` (1×), `0.1.0` (2×), geen versie (3×). |
| Publiceert een versie | Eén van de elf: `moza-logboekdataverwerking` naar Maven Central, handmatig volgens `RELEASING.md`. |
| Mutabele tags | `moza-site` en `moza-mock` pushen een `:latest`-tag naar GHCR. |
| CI-dekking | 7 van de 11 draaien OpenSSF Scorecard. `moza-email-verificatie-service` heeft geen enkele workflow. |
| Commit-conventie | Half aanwezig: Dependabot volgt Conventional Commits consequent, handmatige commits wisselen af met vrije vorm. Niets dwingt het af. |
| Merge-stijl | Squash merge; het commitonderwerp eindigt op `(#<pr>)`. |

Daarnaast beschrijft `Docs/structurizr/docs/10-deployment.md` een GitFlow-model met `develop` → `release/x.x.x` → `main`. Dat model wordt in geen enkele repository toegepast en heeft dat nooit gedaan. De documentatie en de praktijk lopen dus uit elkaar; deze ADR corrigeert de documentatie naar de praktijk in plaats van andersom.

### Randvoorwaarden

De [NL GOV API Design Rules 2.1.0](https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/) leggen voor API's al vast wat er kan: `/core/semver` verplicht Semantic Versioning, `/core/uri-version` de major-versie in de URI met `v`-prefix, `/core/version-header` een `API-Version`-header in elke response, en `/core/transition-period` een vaste overgangstermijn met maximaal twee major-versies naast elkaar. Voor de API-versie is er dus geen keuze meer; de vrijheid zit in de versionering van het artefact en in het proces eromheen.

### Diversiteit van het landschap

De elf repositories dienen sterk uiteenlopende doelen: Java- en Kotlin-services, een herbruikbare library, een Next.js-frontend, een Hugo-website, een Python-proof-of-concept, een WireMock-image en een repository die alleen contracten, deployconfiguratie en PKI-materiaal bevat. Eén uniform regime daaroverheen wordt of te zwaar voor een mock, of te licht voor een library die door derden wordt ingebonden. Reikwijdte is daarom het eerste besluit, niet het laatste.

## Decision

### 1. Reikwijdte en regimes

Er gelden twee regimes. Per repository wordt vastgelegd welk regime van toepassing is. `moza-portaal` en `moza-actualiteiten-service` vallen buiten de reikwijdte van deze ADR; het beleid geldt voor negen repositories.

**Vol regime** — voor alles met een deploybaar of herbruikbaar artefact dat buiten het bouwende team wordt gebruikt. Semantic Versioning, een git-tag per release, een GitHub Release met changelog, en een SBOM met herkomstattestatie.

- `moza-profiel-service`
- `moza-notificatiemanagementcomponent`
- `moza-email-verificatie-service`
- `moza-logboekdataverwerking`
- `moza-poc-fbs-berichtenbox`

**Licht regime** — voor ondersteunende repositories zonder externe afnemer van een artefact. Wel een tag en een GitHub Release bij een betekenisvolle wijziging, geen changelogverplichting, geen SBOM.

- `moza-site`
- `moza-mock`
- `moza-fsc-testnet`
- `moza-poc-digitale-assistent`

**Promotie tussen regimes** gebeurt op één objectieve regel in plaats van per geval: een repository valt onder het lichte regime zolang `developmentStatus` in zijn `publiccode.yml` op `development` staat, en gaat naar het volle regime zodra die status verder komt. Daarmee is geen apart besluit nodig wanneer een proof-of-concept volwassen wordt.

**Buiten scope.** `moza-portaal` en `moza-actualiteiten-service` vallen niet onder deze ADR. `moza-actualiteiten-service` is bevroren: geen actieve ontwikkeling, één branch, één buildworkflow, geen deploy en geen publicatie. Wordt hij niet verder ontwikkeld, dan wordt de repository gearchiveerd; wordt hij opgepakt, dan valt hij vanaf dat moment onder het volle regime. Een repository die noch onderhouden noch gearchiveerd is, is de duurste variant.

Binnen een regime gelden de regels uniform. Een afwijking is toegestaan, maar staat expliciet en met reden in de `README.md` van de betreffende repository. Dat `moza-email-verificatie-service` vandaag zonder CI en met een niet-SemVer-vormige versie meeloopt, is geen keuze geweest maar het gevolg van het ontbreken van een norm.

### 2. Rollen en cadans

Een release is een pull request als elke andere. Elk teamlid mag er een maken; de eisen uit ADR 0017 (review-approval en geslaagde CI/CD vóór merge) gelden onverkort. Er komt geen aparte release-managerrol.

Elke merge naar `main` levert een intern deploybare build op. Een *versie* wordt uitgebracht wanneer er iets te melden valt aan afnemers of beheer, niet op een vast ritme.

### 3. Branching en merge

`main` is de enige langlevende branch. Ontwikkeling gebeurt in feature-branches die via een pull request naar `main` worden gemerged. Een release is een tag op een commit in `main`.

Een `release/x.y`-branch wordt alleen aangemaakt wanneer een productieversie moet worden gepatcht terwijl `main` al verder is. Die branch wordt dan afgetakt van de betreffende tag, ontvangt de fix via cherry-pick, en levert een patch-release op; dezelfde fix gaat ook naar `main`. De complexiteit van een releasebranch wordt zo alleen betaald wanneer die nodig is.

Merges gebeuren met squash. Merge commits en rebase worden in de repository-instellingen uitgezet. Omdat de titel van de pull request bij squash het commitonderwerp wordt, is die titel de plaats waar de aard van de wijziging wordt vastgelegd.

Dit besluit vervangt de GitFlow-beschrijving in `Docs/structurizr/docs/10-deployment.md`.

Uit dit besluit volgen twee inrichtingsacties op ZAD:

- De bestaande deployment `stable` wordt hernoemd naar `latest`. Dat is de omgeving die bij elke merge naar `main` wordt bijgewerkt. Het raakt `deploy.yml` in de betrokken services en de eenmalige configuratie op die deployment in Operations Manager.
- Er komt een aparte release-omgeving die op een release-tag draait, naast de `latest`-omgeving. Daarmee wordt promotie van een artefact zichtbaar en ontstaat een plek om een release te valideren voordat hij verder gaat.

> Het woord *latest* komt hierdoor in twee betekenissen voor. De ZAD-deployment `latest` is een **omgeving**: een plek waar iets draait. De `:latest`-tag die in paragraaf 5 vervalt is een **image-tag**: een verwijzing die naar een steeds ander artefact kan wijzen. Het eerste is een naam, het tweede is het probleem.

### 4. Versienummering

**Schema.** Semantic Versioning, voor alles: applicaties, API-contracten en herbruikbare libraries. Er komt geen tweede schema naast.

Voor API-versies lag dat al vast via `/core/semver`. Voor de applicatieversie is CalVer (`JJJJ.MM.PATCH`, bijvoorbeeld `2026.08.1`) overwogen, omdat je aan zo'n nummer direct afleest hoe oud een versie ongeveer is. Die afweging is op vier gronden anders uitgevallen:

- **Paragraaf 7 levert de ouderdom al.** Versie, commit-sha en buildtijd komen op een runtime-endpoint en als OCI-label, met één overzicht per omgeving erbij. De ouderdom is daarmee exacter af te lezen dan uit een maandnummer, zonder het versienummer ermee te belasten. Het belangrijkste argument voor CalVer wordt dus al door een ander besluit ingelost.
- **Eén schema is eenvoudiger dan twee.** Met CalVer voor applicaties en SemVer voor contracten en libraries draaien twee schema's door elkaar — binnen `moza-poc-fbs-berichtenbox` zelfs binnen één `pom.xml`. Technisch mogelijk, maar het kost uitleg bij elke nieuwe collega en elke externe afnemer.
- **Het compatibiliteitssignaal blijft nodig.** Vandaag bindt niemand een MOZa-service in als afhankelijkheid. In de FBS-context is niet uitgesloten dat dat verandert; onder CalVer draagt de applicatieversie dan geen signaal meer.
- **Een hotfix op een oude lijn blijft leesbaar.** `1.2.1` naast een `main` die bij `1.4` is, is begrijpelijk. Het CalVer-equivalent `2026.08.4`, uitgebracht in september, noemt de lijn en niet de releasedatum — en breekt daarmee juist de belofte waarvoor CalVer werd overwogen.

Wat deze keuze kost, expliciet: de ouderdom staat niet in het nummer maar wordt uit het endpoint of het image-label gelezen. Daarmee is het versie-endpoint uit paragraaf 7 geen prettige toevoeging maar een dragend onderdeel van dit besluit. Daarnaast vergt elke release een beoordeling of er sprake is van een breaking change — een vraag die onder CalVer niet bestaat.

**Waar de versie leeft.** Er zijn drie plaatsen waar een versie staat: het versiebestand van het project, de container-image-tag, en het runtime-endpoint uit paragraaf 7. Die krijgen dezelfde waarde. Vandaag lopen ze uiteen: het versiebestand staat sinds de eerste commit op `1.0.0-SNAPSHOT` terwijl het image `main-<sha7>` heet en een runtime-endpoint ontbreekt.

**Hoe die versie wordt gezet.** Geen van de repositories gebruikt vandaag een CI-vriendelijke versionering. Twee werkwijzen liggen voor: een `${revision}`-property in de pom die bij de build wordt ingevuld, met de `flatten-maven-plugin` om de gepubliceerde pom kloppend te houden; of het versiebestand laten bijwerken door de release-tooling in de release-pull-request. Het voorstel is het tweede, omdat het aansluit bij hoe `moza-logboekdataverwerking` nu handmatig werkt en de versie zichtbaar blijft in de historie. De keuze wordt bevestigd bij de pilotrepository `moza-notificatiemanagementcomponent`; zij volgt niet uit het schema en blokkeert dit besluit niet.

**Startversie.** Repositories met een gepubliceerd, stabiel contract beginnen op `1.0.0`. Repositories waarvan `publiccode.yml` de status `development` meldt, beginnen op `0.y.z`; daarmee is expliciet dat er nog geen compatibiliteitsbelofte is. Dit is dezelfde regel die de regime-indeling stuurt, en zij geldt voor alle negen repositories in scope. De toewijzing per repository is een invulactie bij de implementatie. `moza-email-verificatie-service` staat vandaag op `1.0-SNAPSHOT` — twee componenten, niet SemVer-vormig — en wordt daarbij rechtgezet.

**Bepaling van de bump.** De versiebump wordt afgeleid uit Conventional Commits in de titel van de pull request: `fix:` geeft een patch, `feat:` een minor, en `!` of `BREAKING CHANGE:` een major. Tooling stelt op basis daarvan een release-pull-request op die vóór merge kan worden bijgesteld. De conventie wordt in CI afgedwongen; zonder die controle verwatert hij. Omdat het schema overal SemVer is, bepaalt dit mechanisme het versienummer voor applicaties, API-versies en libraries op dezelfde manier.

**Bron van waarheid.** De git-tag is de bron. De release-automatisering werkt het versiebestand van het project bij — `pom.xml`, `package.json` of `pyproject.toml` — in de release-pull-request. Daarmee vervalt de permanente `-SNAPSHOT`-versie die nu in meerdere repositories op de hoofdbranch staat.

**Tagformaat.** `vMAJOR.MINOR.PATCH`, bijvoorbeeld `v1.2.0`.

**API-versie versus artefactversie.** Deze blijven gescheiden. Het OpenAPI-contract is leidend voor de API-versie; de git-tag voor de versie van het artefact. Een bugfix in een service is geen nieuwe API-versie. `moza-profiel-service` past dit onderscheid al toe met een `ApiVersion`-constante die losstaat van de projectversie.

**Snapshots.** Libraries publiceren `-SNAPSHOT`-versies naar de snapshot-repository, zodat afnemers kunnen meelopen met de ontwikkeling. Services krijgen geen snapshot-artefact; daarvoor zijn de bestaande per-commit-images bedoeld.

Een snapshot wordt niet gereleased maar gepubliceerd: een release is onveranderlijk, een snapshot juist niet. Hij is bedoeld voor één situatie — iemand anders moet met nog-niet-vastgelegd werk verder kunnen. Bijvoorbeeld wanneer `moza-logboekdataverwerking` een wijziging krijgt die een consumerende service nodig heeft, of wanneer twee componenten tegelijk wijzigen en in een ketentest tegen elkaar moeten draaien. Voor een deployable service is een snapshot zinloos: niemand lost daar een Maven-coördinaat voor op, en de per-commit-image doet dat werk al. Als release candidate is hij ongeschikt, omdat wat getest is niet noodzakelijk is wat wordt uitgeleverd; daarvoor is een onveranderlijke pre-releaseversie het aangewezen middel.

Daaruit volgt één regel: **een release bevat geen snapshot-afhankelijkheden.** Staat er een snapshot in de afhankelijkheidsboom, dan verwijst de SBOM uit paragraaf 5 naar iets wat meerdere builds kan zijn en breekt de herkomstketen precies daar. Dit wordt afgedwongen met de enforcer-regel `requireReleaseDeps` in het `release`-profiel.

**Multi-module repositories.** Omdat het schema overal hetzelfde is, speelt hier geen vraag meer over twee versieschema's naast elkaar. `moza-poc-fbs-berichtenbox` bevat drie libraries (`fbs-common`, `fbs-magazijnregister`, `fbs-berichtensessiecache`), twee services en een demo onder één `pom.xml`. Zolang geen partij buiten de repository die libraries inbindt, geldt één versie voor de hele repository. Zodra een library buiten de repository wordt gebruikt, krijgt die een eigen versie en eigen publicatie — hetzelfde pad dat `moza-logboekdataverwerking` al heeft afgelegd. Het omslagpunt wordt nu vastgelegd om later een migratie van repo-brede naar per-module-versies te voorkomen.

### 5. Publiceren en distributie

Per artefacttype geldt een kanaal:

- **GitHub Releases** — voor elke repository in het volle regime, met tag en changelog. Dit is het fundament: zonder tag is er geen versie om over te praten.
- **GitHub Container Registry** — voor service- en site-images, met een semver-tag naast de immutable digest.
- **Maven Central** — voor herbruikbare libraries, onder de namespace `nl.mijnoverheidzakelijk`.
- **Harbor en Nexus** — blijven de keten van het Standaard Platform. Omdat de Logius Private Cloud GitHub niet kan benaderen, loopt de route naar productie hier hoe dan ook langs; of de digest die overgang overleeft, is open punt O1.

**Onveranderlijkheid.** Een gepubliceerde versie ligt vast. Een versie-tag wordt niet verplaatst en niet overschreven; een fout in een release leidt tot een nieuwe patch-versie. Uitrollen gebeurt op digest, niet op tag. De mutabele `:latest`-tag in `moza-site` en `moza-mock` vervalt.

**Moment van publiceren.** Een merge naar `main` levert een intern deploybare build. Pas bij een release-tag ontstaat een gepubliceerde, onveranderlijke versie met release notes.

**Herkomst.** Bij elke release in het volle regime wordt een CycloneDX-SBOM als asset meegeleverd, samen met een build provenance attestation. Dat sluit aan op de OpenSSF Scorecard-workflows die al in het merendeel van de repositories draaien, en weegt zwaar bij publieke code en binnen het BIO-kader.

### 6. Release-documentatie

De changelog wordt gegenereerd uit de Conventional Commits en landt zowel in `CHANGELOG.md` als in de GitHub Release. Omdat de generatie via een release-pull-request loopt, kan de tekst vóór merge worden bijgesteld.

Release notes zijn gericht op de Product Owner en de technische beheerders. Ze bestaan uit één document met twee lagen: een functionele samenvatting die beschrijft wat van de wijziging gemerkt wordt, boven de gegenereerde technische lijst. De functionele kop is verplicht bij minor- en major-releases en optioneel bij patches.

Een breaking change in een API wordt minimaal één minor-release vooraf aangekondigd en als deprecated gemarkeerd. `/core/transition-period` begrenst dit al tot maximaal twee major API-versies naast elkaar; de exacte ondersteuningstermijn wordt vastgesteld als onderdeel van open punt O3.

De GitHub Release is de bron van release-informatie. `CHANGELOG.md` biedt de leesbare historie in de repository. De Structurizr-documentatie verwijst daarnaar in plaats van het te dupliceren.

### 7. Traceerbaarheid en omgevingen

Elke service maakt zijn versie, commit-sha en buildtijdstip zichtbaar via een runtime-endpoint en als OCI-label op het image. Daarnaast komt er één overzicht dat per omgeving toont welke versie er draait. Zonder dat overzicht blijft het probleem uit de context bestaan, ook met versienummers.

Artefacten worden gepromoveerd tussen omgevingen, niet per omgeving opnieuw gebouwd: dezelfde digest gaat van ontwikkel- naar productieomgeving. Opnieuw bouwen per omgeving betekent dat iets anders wordt getest dan wordt uitgerold.

Voor rollback geldt een vastgelegde procedure: terugkeren naar de digest van de vorige versie. Wie daartoe besluit en binnen welke termijn, wordt vastgelegd in aansluiting op stap 6 van ADR 0017.

## Consequences

### Wat dit oplevert

- Van elke component in het volle regime is vast te stellen welke versie waar draait, en welke wijzigingen tussen twee versies zitten.
- Afnemers van libraries én van services kunnen aan het versienummer zien of een upgrade breekt; één schema over de hele keten betekent dat niemand twee leeswijzen hoeft te kennen.
- Terugrollen wordt een gerichte handeling in plaats van een zoektocht.
- Release-documentatie ontstaat als bijproduct van het normale ontwikkelwerk in plaats van als aparte taak.
- De documentatie beschrijft weer wat er werkelijk gebeurt.

### Wat dit kost

- Het team moet commit- en pull-request-titels disciplineren volgens Conventional Commits. Dat is de enige merkbare gedragsverandering. De conventie wordt al gedeeltelijk gevolgd, maar moet in CI sluitend worden gemaakt.
- Bij elke release moet worden beoordeeld of een wijziging breekt. Onder SemVer draagt die beoordeling het versienummer; wordt zij overgeslagen, dan verliest het nummer zijn betekenis.
- In elke repository moet release-automatisering worden ingericht en moet het versiebestand uit de handmatige sfeer worden gehaald.
- `moza-site` en `moza-mock` verliezen hun `:latest`-tag. Consumenten die daarop vertrouwen moeten worden omgezet.
- `moza-email-verificatie-service` heeft nog geen enkele workflow en vereist daarmee het meeste inrichtingswerk.
- Het onderscheid tussen twee regimes moet worden onderhouden: bij een nieuwe repository hoort een expliciete keuze, en bij een statuswijziging in `publiccode.yml` een promotie.
- De ZAD-inrichting verandert: de `stable`-deployment wordt hernoemd en er komt een release-omgeving bij.

### Risico's

- Een half doorgevoerde commit-conventie levert onbetrouwbare changelogs op. Daarom is de CI-controle geen optionele toevoeging maar onderdeel van het besluit.
- Zolang open punt O1 niet is uitgezocht, is niet zeker of promotie van hetzelfde artefact haalbaar is tot en met de Logius Private Cloud. Dat de LPC GitHub niet kan benaderen is al bekend, dus er is hoe dan ook een transportstap nodig; de vraag is of die de digest intact laat. Laat zij dat niet, dan moeten paragraaf 7 en de herkomstbelofte in paragraaf 5 worden herzien.
- Bij `moza-poc-fbs-berichtenbox` kan de keuze voor één repo-brede versie later alsnog een migratie vergen. Dat risico is bewust genomen omdat per-module-versionering nu meer complexiteit toevoegt dan het oplevert.
- Omdat het versienummer onder SemVer niets over ouderdom zegt, rust die informatiebehoefte volledig op het versie-endpoint en het OCI-label uit paragraaf 7. Wordt dat onderdeel uitgesteld, dan levert deze ADR minder op dan bedoeld: de vraag "hoe oud is wat hier draait" blijft dan onbeantwoord. Paragraaf 7 is daarmee geen sluitstuk maar een voorwaarde.

### Open punten

Deze punten vergen uitzoekwerk en zijn geen onderdeel van dit besluit:

**O1 — Hoe landt een release op de Logius Private Cloud?** Dit punt omvat ook het voormalige O4; het bleken niet twee vragen maar één.

De harde randvoorwaarde is dat de LPC GitHub niet kan benaderen. Een image in GHCR is daar dus niet direct op te halen, en ophalen via LSP valt af. Daarmee is de transportroute geen detail maar de kern van de vraag: welke registry is leidend op de LPC, hoe komt een artefact daarin — mirroren, importeren of opnieuw pushen — en blijft de digest daarbij behouden? Daarnaast: bouwt de GitLab-pipeline het image zelf uit `main` of kan hij een bestaand artefact overnemen, en geldt er op de LPC een eigen artefacten- of bewaarbeleid dat afwijkt van O3b?

Paragraaf 7 staat of valt hiermee, en paragraaf 5 ook: de attestatie hangt aan de digest. Gaat die onderweg verloren, dan is de herkomstketen precies op het laatste stuk gebroken — en kan de rollbackprocedure niet terug naar een digest die aan LPC-zijde niet bestaat. Dit is geen versioneringsvraag: schema, tags en changelog liggen vast ongeacht de uitkomst; wat op het spel staat is de herkomstbelofte en het promotiemodel.

*Het releaseproces wordt zo snel mogelijk besproken met Logius. Dit is het enige punt dat de overgang naar Accepted nog blokkeert.*

**O3a — Ondersteuningstermijn van oude major API-versies.** Hoe lang blijft een major-versie bereikbaar nadat de opvolger uit is, uitgedrukt in maanden? `/core/transition-period` begrenst het al tot twee naast elkaar; de termijn zelf is een productbesluit. *Belegd bij PO en architectuur; hoort bij paragraaf 6.*

**O3b — Bewaartermijn van artefacten.** Hoe lang blijven images in GHCR en Harbor en jars in Nexus beschikbaar? Dit begrenst hoe ver terug de rollbackprocedure uit paragraaf 7 reikt: je kunt niet terug naar een digest die is opgeruimd. Releases op Maven Central zijn permanent, dus dit betreft alleen images en interne registries. *Belegd bij platform- en beheerteam.*

**O5 — `moza-actualiteiten-service`.** *Gesloten.* De repository is bevroren: er vindt geen actieve ontwikkeling plaats en hij blijft buiten dit beleid. Wordt de service niet verder ontwikkeld, dan wordt de repository gearchiveerd; wordt hij wél opgepakt, dan valt hij vanaf dat moment onder het volle regime. Daarmee blijft de toestand niet onbepaald en stopt de stroom dependabot-PR's en Scorecard-meldingen zonder eigenaar.

*Buiten scope:* het gebruik van code.overheid.nl is voor nu geparkeerd.

### Vervolg

- Per repository komt een `RELEASING.md` met de uitvoerbare stappen. `moza-logboekdataverwerking` heeft die al en dient als sjabloon.
- `Docs/structurizr/docs/10-deployment.md` wordt gecorrigeerd op branching en versionering.
- De ZAD-deployment `stable` wordt hernoemd naar `latest` en er wordt een release-omgeving ingericht.
- Het releaseproces richting de Logius Private Cloud wordt zo snel mogelijk met Logius besproken (O1).
- `moza-actualiteiten-service` wordt gearchiveerd als er geen vervolg aan wordt gegeven (O5).
- De release-automatisering wordt eerst ingericht in `moza-notificatiemanagementcomponent`. Daar worden ook twee dingen bevestigd die uit paragraaf 4 volgen: het mechanisme dat de versie zet (`${revision}` of bijwerken in de release-PR), en de startversie per repository.
- De implementatie wordt uitgewerkt in afzonderlijke stories, in volgorde van afhankelijkheid: commit-conventie in CI, release-automatisering in de pilotrepository, uitfasering van de `:latest`-image-tag, versie-endpoint en image-labels, SBOM en attestatie, CI voor `moza-email-verificatie-service`, en daarna uitrol per regime.
