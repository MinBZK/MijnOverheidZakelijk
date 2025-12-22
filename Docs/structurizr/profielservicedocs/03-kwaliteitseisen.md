## Kwaliteitseisen

### Inleiding

Dit hoofdstuk vat de belangrijkste niet-functionele eisen (kwaliteitseisen) voor de Profiel Service samen. 
De eisen zijn zo veel mogelijk SMART geformuleerd en sluiten aan op het functioneel overzicht en de context. 
Waar relevant verwijzen we naar architectuurkeuzes in de ADR’s en ondersteunende documentatie.

### Overzicht

De onderstaande kwaliteitseisen zijn architectonisch significant en sturen ontwerp- en implementatiekeuzes:

- Beveiliging & Privacy (AVG, authenticatie/authorisatie, dataminimalisatie)
- Beschikbaarheid & Continuïteit
- Performance & Schaalbaarheid
- Auditability & Logging (LDV)
- Interoperabiliteit & Open Standaarden
- Observeerbaarheid (monitoring, metrics, tracing)
- Herstelbaarheid (back-up/restore, DR)

Waar zaken bewust buiten scope vallen, is dit expliciet benoemd.

#### Beveiliging & Privacy
- Authenticatie: Via erkende federatieve identiteiten (DigiD, eHerkenning, eIDas) conform ADR 0006. Eisen: OIDC/OAuth 2.0 flows, tokens met beperkte scopes, token TTL ≤ 60 min; refresh alleen server-to-server waar passend. Meetbaar via IDP-config en token policies.
- Autorisatie: scope-gebaseerd mogelijkheid (per dienst/dienstverlener) met dataminimalisatie. Alleen de minimaal opgevraagde attributen worden geleverd. Verplicht ‘least privilege’ op API-niveau & ontsloten via het FDS.
- Privacy/AVG: verwerkingsregister en grondslagregistratie op orde, volgens AVG artikel 6 en 30 respectief. Daarbij komt mee alleen noodzakelijke persoonsgegevens opslaan. 
- Dataretentie: operationele logs max. 90 dagen, audit-logs conform bewaartermijn in ADR 0005/0007. DPIA uitgevoerd vóór productie.
- Transport & opslag: TLS 1.2+ in transit; gevoelige secrets via sealed secrets, geen gevoelige data in logs. Encryptie-at-rest verplicht indien toepasbaar.

#### Beschikbaarheid & Continuïteit
Er is nog geen baseline voor bedacht, maar denk hier aan bijvoorbeeld:
- Doel beschikbaarheid betafase: ≥ 50% tijdens kantoortijden. Doel productie: ≥ 99,9% 24x7 (excl. gepland onderhoud). Vastgelegd als Service Level Objective (SLO) en gemonitord.
- Onderhoud: onaangekondigd tijdens betafase.

#### Performance & Schaalbaarheid
Er is nog geen baseline voor bedacht, maar denk hier aan bijvoorbeeld:
- Lezen (profiel opvragen door dienstverlener of gebruiker): p95 latency ≤ 150 ms binnen hetzelfde datacentrum; p99 ≤ 300 ms.
- Schrijven (profiel wijzigen door gebruiker): p95 end-to-end ≤ 500 ms exclusief out-of-band kanaalverificatie (e-mail/SMS). Kanaalverificatie is async en beïnvloedt UI-flow, niet server-SLA.
- Capaciteit: initieel kleine groep profielen (beta), maar schaalbaar naar 2M+ profielen. Opslag en indices ontwerpen voor lineaire schaal.

#### Auditability & Logging (LDV)
- Audit log: conform ADR 0005 en ADR 0007 worden relevante mutaties en bevragingen vastgelegd met wie/wat/wanneer/waarom. Alle muterende acties audit-logged en elke bevragingen geregistreerd voor transparantie/terugzoekbaarheid volgens LDV standaard.
- Onweerlegbaarheid: timestamps (UTC), correlatie-ID, en event-idempotency waar relevant. Toegang tot audit-logs is strikt geautoriseerd.

#### Interoperabiliteit & Open Standaarden
- API-contracten in OpenAPI 3.0+, JSON over HTTPS. HTTP-standaarden volgen REST best practices.
- Identiteiten en claims volgen de OIDC-standaard; authenticatie verloopt via erkende IdP’s (DigiD, eHerkenning, eIDAS).
- Koppelingen met KvK en andere bronnen via hun officiële API-standaarden. Afstemming met Federatief Data Stelsel (FDS) en LDV-implementatie (ADR 0010).

#### Observeerbaarheid
Er is nog geen baseline voor bedacht, maar denk hier aan bijvoorbeeld:
- Metrics: minimaal request-latency (p50/p95/p99), error-rate per endpoint, throughput, resource verbruik. Dashboards gepubliceerd en gedeeld met beheer.
- Tracing: Gedistribueerd tracing over inkomende en uitgaande calls. Log-niveau: INFO standaard, WARN/ERROR voor afwijkingen.

#### Herstelbaarheid (Back-up/Restore, DR)
Er is nog geen baseline voor bedacht, maar denk hier aan bijvoorbeeld:
- RPO ≤ XYZ minuten
- RTO ≤ 1? dag in pilot, ≤ XYZ minuten in productie. 
- Back-ups getest op herstel per half jaar. 
- Audit-log reconstructie (reverse delta read) is niet standaard, maar beschikbaar als laatste redmiddel bij noodgevallen (zie ADR 0005).

### Buiten scope / expliciete uitsluitingen
- Meertalige UI is niet vereist in de betafase?. ZIE PUNT 2 TOEGANKELIJKHEID & GEBRUIKSVRIENDELIJKHEID.
- SEO en PWA-eisen zijn momenteel niet van toepassing.
- Offline-first gebruik is uitgesloten.

### Meting en borging
- Geautomatiseerde kwaliteitscontroles (linting, security scanning/CVE), contracttests op API’s, Lighthouse voor front-end, performance tests (load/stress) in CI/CD, Unit tests voor business logica.
- SLO’s/SLA’s worden actief gemonitord en afwijkingen leiden tot incidenten en/of verbeteracties.


TODO NOTE: Zit hier nog wat MOZA-PORTAAL specifieke aspecten in, moeten die er uit omdat ze eigenlijk niet bij de profiel service horen?

