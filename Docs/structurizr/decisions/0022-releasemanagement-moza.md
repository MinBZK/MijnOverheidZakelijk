# 22. Releasemanagement MOZa

Datum: 2026-10-06

## Status

Proposed

Deze ADR legt vast hoe binnen MOZa releases tot stand komen, worden genummerd, gepubliceerd en teruggevonden. De besluiten zijn vastgesteld in drie teamsessies tussen 27 augustus en 24 september 2026.

De ADR gaat naar Accepted zodra open punt O1 — hoe een release op de Logius Private Cloud landt en of de digest die route overleeft — is beantwoord. Dat is het enige dat de overgang nog blokkeert.

## Gerelateerde ADRs

- [ADR 0012 Repositories op GitHub](0012-moza-repositories-github.md): alle repositories publiek onder MinBZK met prefix `moza-`. Deze ADR bouwt daarop voort met wat er per repository wordt uitgebracht.
- [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): het testproces tot en met merge en post-deploy validatie. Deze ADR sluit daarop aan vanaf de merge naar de hoofdbranch.

## Context

Bij MOZa is niet vast te stellen welke versie van welke component waar draait. Er is geen versienummer om naar te verwijzen. Daardoor is een bevinding op een testomgeving niet te koppelen aan een specifieke build, is er geen afgebakende set wijzigingen om aan beheer of afnemers te melden, betekent terugrollen "de vorige commit opzoeken" in plaats van "terug naar 1.3.2", en kan een afnemer van een gepubliceerde library niet zien of een upgrade breekt.

De uitgangssituatie, vastgesteld in augustus 2026 door inspectie van alle repositories: geen enkele git-tag, geen enkele changelog, uitsluitend `main` als langlevende branch, vijf verschillende versieschema's naast repositories zonder versie, en één repository die daadwerkelijk een versie publiceert. Conventional Commits worden gedeeltelijk gevolgd maar nergens afgedwongen. De bestaande deploymentdocumentatie beschrijft een GitFlow-model dat nooit is toegepast.

Er is dus geen bestaande praktijk om op voort te bouwen; wat hieronder staat wordt overal nieuw ingericht.

### Randvoorwaarden

De [NL GOV API Design Rules 2.1.0](https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/) leggen voor API's al vast wat er kan: `/core/semver` verplicht Semantic Versioning, `/core/uri-version` de major-versie in de URI met `v`-prefix, `/core/version-header` een `API-Version`-header in elke response, en `/core/transition-period` een vaste overgangstermijn met maximaal twee major-versies naast elkaar. Voor de API-versie is er dus geen keuze; de vrijheid zit in de versionering van het artefact en in het proces eromheen.

## Decision

### 1. Twee regimes

Er gelden twee regimes. Welk regime voor een repository geldt, wordt in die repository zelf vastgelegd — niet in deze ADR.

**Vol regime** — voor een repository met een deploybaar of herbruikbaar artefact dat buiten het bouwende team wordt gebruikt. Semantic Versioning, een git-tag per release, een GitHub Release met changelog, en een SBOM met herkomstattestatie.

**Licht regime** — voor een ondersteunende repository zonder externe afnemer van een artefact. Een tag en een GitHub Release bij een betekenisvolle wijziging; geen changelogverplichting, geen SBOM.

**Het criterium is de levenscyclusstatus**, niet een oordeel per geval: een repository valt onder het lichte regime zolang `developmentStatus` in zijn `publiccode.yml` op `development` staat, en gaat naar het volle regime zodra die status verder komt. Daarmee is geen apart besluit nodig wanneer een proof of concept volwassen wordt. Voorwaarde is wel dat dat veld in elke repository klopt; waar het ontbreekt of achterloopt, wordt het bij de invoering rechtgezet.

Binnen een regime gelden de regels uniform. Een afwijking is toegestaan, maar staat expliciet en met reden in de `README.md` van de betreffende repository — niet stilzwijgend.

Een repository kan ook buiten deze ADR vallen. Dat is een expliciete keuze die in die repository wordt vastgelegd, met de reden erbij.

### 2. Rollen en cadans

Een release is een pull request als elke andere. Elk teamlid mag er een maken; de eisen uit ADR 0017 (review-approval en geslaagde CI/CD vóór merge) gelden onverkort. Er komt geen aparte release-managerrol.

Elke merge naar `main` levert een intern deploybare build op. Een *versie* wordt uitgebracht wanneer er iets te melden valt aan afnemers of beheer, niet op een vast ritme.

Een hotfix volgt dezelfde weg: een pull request, een review en een release. Het verschil zit in de urgentie en, wanneer productie op een oudere versie draait, in de branch waarop hij landt.

### 3. Branching en merge

`main` is de enige langlevende branch. Ontwikkeling gebeurt in feature-branches die via een pull request naar `main` worden gemerged. Een release is een tag op een commit in `main`.

Een `release/x.y`-branch wordt alleen aangemaakt wanneer een productieversie moet worden gepatcht terwijl `main` al verder is. Staat `main` nog op dezelfde lijn, dan is er geen branch nodig en gaat de fix mee in de eerstvolgende release.

Is die branch wel nodig, dan wordt de fix **eerst op `main` gemaakt en gereviewd**. Daarna wordt de branch afgetakt van de betreffende tag en wordt die commit erheen gecherry-pickt, wat een patch-release op die lijn oplevert. Die volgorde voorkomt dat een fix alleen op de oude lijn bestaat en bij de volgende release weer verdwijnt. Alleen wanneer de fix op `main` niet toepasbaar is omdat de code daar al is vervangen, ontstaat hij op de release-branch zelf en wordt het probleem op `main` apart opgelost.

Merges gebeuren met squash. Merge commits en rebase worden in de repository-instellingen uitgezet. Omdat de titel van de pull request bij squash het commitonderwerp wordt, is die titel de plaats waar de aard van de wijziging wordt vastgelegd.

De uitgeschreven branchingstrategie hoort in `Docs/structurizr/docs/10-deployment.md`; deze ADR legt vast wat een release is en wanneer een branch nodig is.

### 4. Versienummering

**Schema.** Semantic Versioning, voor alles: applicaties, API-contracten en herbruikbare libraries. Er komt geen tweede schema naast.

**Waar de versie leeft.** Een versie staat op drie plaatsen — het versiebestand van het project, de container-image-tag, en het runtime-endpoint uit paragraaf 7 — en die krijgen dezelfde waarde.

**Van commit tot tag.** De volgorde ligt vast, omdat de verhouding tussen het versiebestand en de git-tag anders onduidelijk blijft:

1. Pull requests landen op `main` met een Conventional Commit-titel. Er verandert nog geen versienummer.
2. De release-tooling berekent uit die titels sinds de vorige tag welke bump nodig is, en opent een **release-pull-request** die het versiebestand — `pom.xml`, `package.json` of `pyproject.toml` — en de `CHANGELOG.md` bijwerkt. Hier wordt het nummer vastgesteld, en hier kan een mens het bijstellen.
3. Bij de merge van die pull request zet de tooling de tag op diezelfde commit, met hetzelfde nummer.
4. De tag triggert de publicatie. Image-tag, SBOM, attestatie en GitHub Release verwijzen er allemaal naar.

Versiebestand en tag kunnen daardoor niet uiteenlopen: ze komen uit één commit en worden door dezelfde automatisering gezet. De Conventional Commits bepalen *welk* nummer het wordt; de tag legt vast *dat* het dat nummer is, en is vanaf dat moment de identiteit waar al het andere naar verwijst. De image-tag staat niet in een bestand — CI leidt hem af uit de git-tag.

Daarmee vervalt de permanente `-SNAPSHOT`-versie die nu op meerdere hoofdbranches staat.

**Bepaling van de bump.** Elke pull request krijgt een Conventional Commit-prefix in de titel: `fix:` geeft een patch, `feat:` een minor, en `!` of `BREAKING CHANGE:` een major. Een prefix is op élke pull request verplicht — de CI-controle laat geen titel zonder geldige prefix door — maar niet elke prefix leidt tot een bump: `chore:`, `docs:`, `refactor:` en `test:` beschrijven wijzigingen waar een afnemer niets van merkt en tellen niet mee. Zonder die controle verwatert de conventie, en daarmee de changelog.

**Tagformaat.** `vMAJOR.MINOR.PATCH`, bijvoorbeeld `v1.2.0`.

**Startversie.** Een repository met een gepubliceerd, stabiel contract begint op `1.0.0`. Een repository waarvan `publiccode.yml` de status `development` meldt, begint op `0.y.z`; daarmee is expliciet dat er nog geen compatibiliteitsbelofte is. Dat is dezelfde regel die de regime-indeling stuurt. De toepassing per repository hoort bij de invoering daar.

**API-versie versus artefactversie.** Deze blijven gescheiden. Het OpenAPI-contract is leidend voor de API-versie, de git-tag voor de versie van het artefact. Een bugfix in een service is geen nieuwe API-versie.

**Snapshots.** Libraries publiceren `-SNAPSHOT`-versies naar de snapshot-repository, zodat een consumerende component kan meelopen met nog-niet-vastgelegd werk. Services krijgen geen snapshot-artefact; daarvoor zijn de per-commit-images bedoeld. Een snapshot is ook geen release candidate: wat je dan test is niet noodzakelijk wat je uitlevert, en daarvoor is een onveranderlijke pre-releaseversie het middel.

Daaruit volgt één regel: **een release bevat geen snapshot-afhankelijkheden.** Staat er een snapshot in de afhankelijkheidsboom, dan verwijst de SBOM uit paragraaf 5 naar iets wat meerdere builds kan zijn en breekt de herkomstketen precies daar. Af te dwingen met de enforcer-regel `requireReleaseDeps` in het `release`-profiel.

**Multi-module repositories.** Eén versie voor de hele repository, zolang geen partij buiten die repository de afzonderlijke modules inbindt. Zodra een module daarbuiten wordt gebruikt, krijgt die een eigen versie en eigen publicatie. Het omslagpunt wordt nu vastgelegd om later een migratie van repo-brede naar per-module-versies te voorkomen.

### 5. Publiceren en distributie

Per artefacttype geldt een kanaal:

- **GitHub Releases** — voor elke repository in het volle regime, met tag en changelog. Dit is het fundament: zonder tag is er geen versie om over te praten.
- **GitHub Container Registry** — voor container-images, met een semver-tag naast de immutable digest.
- **Maven Central** — voor herbruikbare libraries, onder de namespace `nl.mijnoverheidzakelijk`.
- **Harbor en Nexus** — de keten van het Standaard Platform. Omdat de Logius Private Cloud GitHub niet kan benaderen, loopt de route naar productie hier hoe dan ook langs; of de digest die overgang overleeft, is open punt O1.

**Onveranderlijkheid.** Een gepubliceerde versie ligt vast. Een versie-tag wordt niet verplaatst en niet overschreven; een fout in een release leidt tot een nieuwe patch-versie. Uitrollen gebeurt op digest, niet op tag.

Wijzigbare tags vervallen. Een tag als `:latest`, die telkens naar een ander artefact wijst, maakt onmogelijk wat deze ADR juist wil bereiken: kunnen zeggen wat er draait. Versietags blijven bestaan en blijven naar dezelfde digest verwijzen.

**Moment van publiceren.** Een merge naar `main` levert een intern deploybare build. Pas bij een release-tag ontstaat een gepubliceerde, onveranderlijke versie met release notes.

**Herkomst.** Bij elke release in het volle regime wordt een CycloneDX-SBOM als asset meegeleverd, samen met een build provenance attestation. Dat sluit aan op de OpenSSF Scorecard-workflows die al in het merendeel van de repositories draaien, en weegt zwaar bij publieke code en binnen het BIO-kader.

### 6. Release-documentatie

De changelog wordt gegenereerd uit de Conventional Commits en landt zowel in `CHANGELOG.md` als in de GitHub Release. Omdat de generatie via een release-pull-request loopt, kan de tekst vóór merge worden bijgesteld.

Release notes zijn gericht op de Product Owner en de technische beheerders. Ze bestaan uit één document met twee lagen: een functionele samenvatting die beschrijft wat van de wijziging gemerkt wordt, boven de gegenereerde technische lijst. De functionele kop is verplicht bij minor- en major-releases en optioneel bij patches.

Wat in een nieuwe major-versie verdwijnt of verandert, wordt minimaal één minor-release eerder al als deprecated gemarkeerd. De aankondiging zit dus in de release *vóór* de breaking change, niet in de release die hem doorvoert: een afnemer ziet de waarschuwing terwijl zijn integratie nog werkt. `/core/transition-period` begrenst dit al tot maximaal twee major API-versies naast elkaar; de exacte ondersteuningstermijn volgt uit open punt O3a.

De GitHub Release is de bron van release-informatie. `CHANGELOG.md` biedt de leesbare historie in de repository. De Structurizr-documentatie verwijst daarnaar in plaats van het te dupliceren.

### 7. Traceerbaarheid en omgevingen

Elke service maakt zijn versie, commit-sha en buildtijdstip zichtbaar via een runtime-endpoint en als OCI-label op het image. Die drie waarden staan niet in de broncode — op het moment van schrijven bestaan ze nog niet — maar worden bij de build uit de git-tag en de commit afgeleid en in het artefact gebakken.

Voor het label geldt de bestaande OCI-conventie: de annotaties `org.opencontainers.image.version`, `.revision` en `.created`. Voor het endpoint ligt het formaat nog niet vast; voor de Quarkus-services ligt de `quarkus-info`-extensie voor de hand, die `/q/info` serveert met onder meer git- en buildgegevens. Dat wordt bij de eerste invoering vastgesteld, zodat elke service hetzelfde oplevert en het overzicht ze op één manier kan uitlezen.

Daarnaast komt er één overzicht dat per omgeving toont welke versie er draait. Zonder dat overzicht blijft het probleem uit de context bestaan, ook met versienummers.

Naast de omgeving die meeloopt met `main` komt er een omgeving die op een release-tag draait. Daarmee wordt promotie van een artefact zichtbaar en ontstaat een plek om een release te valideren voordat hij verder gaat. Een omgevingsnaam die een uitgebrachte versie suggereert terwijl er de laatste stand van `main` draait, wordt bij die gelegenheid rechtgezet.

Artefacten worden gepromoveerd tussen omgevingen, niet per omgeving opnieuw gebouwd: dezelfde digest gaat van ontwikkel- naar productieomgeving. Opnieuw bouwen per omgeving betekent dat iets anders wordt getest dan wordt uitgerold.

Voor rollback geldt een vastgelegde procedure: terugkeren naar de digest van de vorige versie. Wie daartoe besluit en binnen welke termijn, wordt vastgelegd in aansluiting op stap 6 van ADR 0017.

## Afwegingen

Vijf keuzes hadden een reëel alternatief. Hieronder staat waarom het de andere kant op is gevallen.

**Twee regimes in plaats van één beleid.** De repositories dienen sterk uiteenlopende doelen: services, een herbruikbare library, frontends, een website, proofs of concept, een mock-image en een repository met alleen contracten en deployconfiguratie. Eén uniform beleid daaroverheen wordt onvermijdelijk of te zwaar voor een mock, of te licht voor een library die door derden wordt ingebonden. De prijs is dat het onderscheid onderhouden moet worden; dat is beperkt gehouden door het aan één objectief veld te koppelen in plaats van aan een oordeel per geval.

**SemVer in plaats van CalVer.** Voor de applicatieversie is CalVer (`JJJJ.MM.PATCH`) overwogen, omdat je aan zo'n nummer direct afleest hoe oud een versie ongeveer is. Vier dingen gaven de doorslag de andere kant op:

- Paragraaf 7 levert de ouderdom al, en exacter dan een maandnummer. Het belangrijkste argument voor CalVer wordt dus al door een ander besluit ingelost.
- Eén schema is eenvoudiger dan twee. De API-versie ligt via `/core/semver` vast op SemVer en een herbruikbare library heeft een compatibiliteitssignaal nodig; CalVer voor applicaties betekent twee leeswijzen door elkaar, binnen een multi-module repository zelfs binnen één buildbestand.
- Het compatibiliteitssignaal blijft nodig. Vandaag bindt niemand een MOZa-service in als afhankelijkheid, maar dat is niet uitgesloten; onder CalVer draagt de applicatieversie dan geen signaal meer.
- Een hotfix op een oude lijn blijft leesbaar. `1.2.1` naast een `main` die bij `1.4` is, is begrijpelijk. Het CalVer-equivalent `2026.08.4`, uitgebracht in september, noemt de lijn en niet de releasedatum — en breekt daarmee juist de belofte waarvoor CalVer werd overwogen.

Wat deze keuze kost: de ouderdom staat niet in het nummer maar wordt uit het endpoint of het image-label gelezen. Daarmee is paragraaf 7 geen prettige toevoeging maar een dragend onderdeel. Daarnaast vergt elke release een beoordeling of er sprake is van een breaking change — een vraag die onder CalVer niet bestaat.

**Trunk-based in plaats van GitFlow.** De bestaande documentatie beschreef GitFlow met `develop` en `release/x.x.x`. Dat model is nooit toegepast; in de praktijk is er alleen `main`. De keuze is dus niet om iets af te schaffen maar om vast te leggen wat er gebeurt, en de documentatie daarop te corrigeren in plaats van andersom. De complexiteit van een releasebranch wordt alleen betaald wanneer er werkelijk een oude lijn gepatcht moet worden.

**Het versiebestand bijwerken in de release-PR, niet via `${revision}`.** Het alternatief is een `${revision}`-property in de pom die bij de build wordt ingevuld, met de `flatten-maven-plugin` om de gepubliceerde pom kloppend te houden. Dat levert een compactere diff op en de versie staat nergens hardcoded, maar zij is dan niet meer af te lezen uit de repository zelf — daarvoor moet je de buildconfiguratie erbij halen. De gekozen werkwijze houdt de versie zichtbaar in de historie. De prijs is één extra commit per release, en die is klein: het is dezelfde commit waarin de changelog uit paragraaf 6 wordt aangevuld, dus de release-pull-request bestaat toch al.

**Snapshots alleen voor libraries.** Overwogen is om snapshots overal af te schaffen, omdat ze veranderlijk zijn en daarmee haaks staan op de onveranderlijkheid uit paragraaf 5. Voor libraries is dat te streng: zonder snapshot moet een consumerende component wachten op een formele release of lokaal installeren, wat in CI niet werkt en bij een collega evenmin. Voor services is de afschaffing wel terecht — een service wordt niet als afhankelijkheid opgenomen maar uitgerold, dus niemand haalt hem ooit als Maven-artefact op.

## Consequences

### Wat dit oplevert

- Van elke component in het volle regime is vast te stellen welke versie waar draait en wat er tussen twee versies is veranderd.
- Afnemers zien aan het versienummer of een upgrade breekt; één schema over de hele keten betekent dat niemand twee leeswijzen hoeft te kennen.
- Terugrollen wordt een gerichte handeling in plaats van een zoektocht.
- Release-documentatie ontstaat als bijproduct van het ontwikkelwerk in plaats van als aparte taak.
- De documentatie beschrijft weer wat er werkelijk gebeurt.

### Wat dit kost

- Pull-request-titels moeten gedisciplineerd worden volgens Conventional Commits. Dat is de enige merkbare gedragsverandering, en zij moet in CI sluitend worden gemaakt.
- Bij elke release moet worden beoordeeld of een wijziging breekt. Onder SemVer draagt die beoordeling het versienummer; wordt zij overgeslagen, dan verliest het nummer zijn betekenis.
- In elke repository moet release-automatisering worden ingericht en het versiebestand uit de handmatige sfeer worden gehaald.
- Waar vandaag een wijzigbare tag wordt gepusht, verliezen consumenten die daarop vertrouwen hun referentie en moeten zij worden omgezet.
- Het regime-onderscheid moet worden onderhouden: een nieuwe repository vraagt een expliciete keuze, een statuswijziging in `publiccode.yml` een promotie.

### Risico's

- Een half doorgevoerde commit-conventie levert onbetrouwbare changelogs op. Daarom is de CI-controle geen optionele toevoeging maar onderdeel van het besluit.
- Zolang open punt O1 niet is uitgezocht, is niet zeker of promotie van hetzelfde artefact haalbaar is tot en met de Logius Private Cloud. Dat de LPC GitHub niet kan benaderen is bekend, dus er is hoe dan ook een transportstap; de vraag is of die de digest intact laat. Laat zij dat niet, dan moeten paragraaf 7 en de herkomstbelofte in paragraaf 5 worden herzien.
- Omdat het versienummer onder SemVer niets over ouderdom zegt, rust die informatiebehoefte volledig op het versie-endpoint en het OCI-label. Wordt dat onderdeel uitgesteld, dan levert deze ADR minder op dan bedoeld.
- De regimeregel werkt alleen als `developmentStatus` per repository klopt. Staat dat veld overal op dezelfde waarde, dan maakt de regel geen onderscheid en valt het beleid terug op een oordeel per geval.

### Open punten

Deze punten vergen uitzoekwerk en zijn geen onderdeel van dit besluit:

**O1 — Hoe landt een release op de Logius Private Cloud?** De harde randvoorwaarde is dat de LPC GitHub niet kan benaderen. Een image in GHCR is daar dus niet direct op te halen, en ophalen via LSP valt af. Daarmee is de transportroute de kern van de vraag: welke registry is leidend op de LPC, hoe komt een artefact daarin — mirroren, importeren of opnieuw pushen — en blijft de digest daarbij behouden? Daarnaast: bouwt de bestaande pipeline het image zelf uit `main` of kan hij een bestaand artefact overnemen, en geldt er op de LPC een eigen artefacten- of bewaarbeleid dat afwijkt van O3b?

Paragraaf 7 staat of valt hiermee, en paragraaf 5 ook: de attestatie hangt aan de digest. Gaat die onderweg verloren, dan is de herkomstketen precies op het laatste stuk gebroken — en kan de rollbackprocedure niet terug naar een digest die aan LPC-zijde niet bestaat. Dit is geen versioneringsvraag: schema, tags en changelog liggen vast ongeacht de uitkomst; wat op het spel staat is de herkomstbelofte en het promotiemodel. *Het releaseproces wordt zo snel mogelijk besproken met Logius. Dit is het enige punt dat de overgang naar Accepted nog blokkeert.*

**O3a — Ondersteuningstermijn van oude major API-versies.** Hoe lang blijft een major-versie bereikbaar nadat de opvolger uit is, uitgedrukt in maanden? `/core/transition-period` begrenst het al tot twee naast elkaar; de termijn zelf is een productbesluit. *Belegd bij PO en architectuur; hoort bij paragraaf 6.*

**O3b — Bewaartermijn van artefacten.** Hoe lang blijven images en jars in de registries beschikbaar? Dit begrenst hoe ver terug de rollbackprocedure uit paragraaf 7 reikt: je kunt niet terug naar een digest die is opgeruimd. Releases op Maven Central zijn permanent, dus dit betreft alleen images en interne registries. *Belegd bij platform- en beheerteam.*

*Buiten scope:* het gebruik van code.overheid.nl is voor nu geparkeerd.

### Vervolg

- Per repository wordt vastgelegd welk regime geldt, welke startversie daarbij hoort, en of `developmentStatus` klopt.
- Per repository komt een `RELEASING.md` met de uitvoerbare stappen.
- `Docs/structurizr/docs/10-deployment.md` wordt gecorrigeerd op branching en versionering.
- Het releaseproces richting de Logius Private Cloud wordt zo snel mogelijk met Logius besproken (O1).
- De implementatie wordt uitgewerkt in afzonderlijke stories, in volgorde van afhankelijkheid: commit-conventie in CI, release-automatisering in één pilotrepository, uitfasering van wijzigbare image-tags, de release-omgeving, versie-endpoint en image-labels, het versieoverzicht per omgeving, SBOM en attestatie, en daarna uitrol per regime.
