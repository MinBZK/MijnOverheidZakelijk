## Kwaliteitseisen

### Inleiding

Dit hoofdstuk vat de belangrijkste niet-functionele eisen voor de Notificatie Service samen.
De eisen zijn zo veel mogelijk SMART geformuleerd en sluiten aan op het functioneel overzicht en de context.
Waar relevant verwijzen we naar architectuurkeuzes in de ADR’s en ondersteunende documentatie.

### Overzicht

De onderstaande kwaliteitseisen zijn architectonisch significant en sturen ontwerp- en implementatiekeuzes:

- Beveiliging & Privacy (AVG, authenticatie/authorisatie, dataminimalisatie)
- Beschikbaarheid & Continuïteit
- Performance & Schaalbaarheid
- Betrouwbaarheid & Afleverzekerheid (deliverability, retries)
- Auditability & Logging (LDV)
- Interoperabiliteit & Open Standaarden
- Observeerbaarheid (monitoring, metrics, tracing)
- Herstelbaarheid (back-up/restore, DR)
- Toegankelijkheid & Gebruiksvriendelijkheid (waar van toepassing voor beheer/UI)

Waar zaken bewust buiten scope vallen, is dit expliciet benoemd.

#### Beveiliging & Privacy
- Authenticatie: Service‑to‑service authenticatie via OIDC/OAuth 2.0 (conform ADR 0006). Tokens met beperkte scopes, geen long‑lived secrets in code. 
- Autorisatie: Scope‑gebaseerde autorisatie per dienst/dienstverlener, met dataminimalisatie. Alleen minimaal noodzakelijke persoonsgegevens worden verwacht en niet redundantly opgeslagen.
- Privacy/AVG: verwerkingsregister en grondslagregistratie op orde (AVG art. 6 en 30). DPIA uitgevoerd vóór productie. Pseudonimiseer of hash waar mogelijk correlatie‑ID’s zonder persoonsherleidbaarheid in logs.
- Dataretentie: operationele logs max. 90 dagen; audit‑logs conform bewaartermijnen uit ADR 0005/0007. Payloads met persoonsgegevens niet in applicatielogs opslaan.
- Transport & opslag: TLS 1.2+ in transit; secrets via sealed secrets/secret manager; encryptie‑at‑rest waar toepasbaar.

#### Beschikbaarheid & Continuïteit
- Doel beschikbaarheid betafase: ≥ 50% tijdens kantoortijden. Doel productie: ≥ 99,9% 24x7 (excl. gepland onderhoud). Vastgelegd als SLO en gemonitord.
- Onderhoud: onaangekondigd mogelijk in betafase; productie onderhoud gecommuniceerd via standaard releaseproces.
- Degradatie: bij uitval van een kanaal moet de service gedegen degraderen (queueing, retries, failover) zonder dat upstream systemen blokkeren.

#### Performance & Schaalbaarheid
- TODO, dit is een beetje verzonnen BS, maar zoiets moeten we gaan bepalen.
- Aanname notificatieverzoek (API): p95 latency ≤ 150 ms binnen hetzelfde DC; p99 ≤ 300 ms (excl. downstream kanaal‑roundtrip).
- Callback‑verwerking: p95 ≤ 100 ms per event; idempotent binnen 24 uur zodat dubbele provider‑callbacks geen inconsistenties veroorzaken.
- Throughput initiële doelstelling: 50 notificaties/sec per instance; horizontaal schaalbaar naar ≥ 500/sec door te schalen.
- Wachtrijen gebruiken back‑pressure; geen onbegrensde in‑memory buffers. Batch‑publish naar providers waar toegestaan.

#### Betrouwbaarheid & Afleverzekerheid
- Retries: Exponentiële back‑off per kanaal; max retry‑duur configureerbaar. Niet‑afleverbare berichten gaan naar DLQ met reden.
- Ordering: Geen harde ordering‑garantie over kanalen, wel best‑effort ordering.
- Statusmodellering: eenduidige statussen (Accepted, Enqueued, Sent, Delivered, Failed, Expired). Overgangen zijn audit‑baar en herleidbaar.

#### Auditability & Logging (LDV)
- Audit log: conform ADR 0005 en ADR 0007. Mutaties en externe afleverresultaten worden gelogd.
- Onweerlegbaarheid: timestamps (UTC), correlatie‑ID, provider‑referenties en verificatie op event‑integriteit. Toegang tot audit‑logs strikt geautoriseerd.

#### Interoperabiliteit & Open Standaarden
- API‑contracten in OpenAPI 3.0+, JSON over HTTPS. HTTP‑statuscodes volgens REST best practices.
- Afstemming met Federatief Data Stelsel (FDS) en LDV‑implementatie (ADR 0010).

#### Observeerbaarheid
- Metrics minimaal: request‑latency (p50/p95/p99), error‑rate per endpoint, queue‑diepte, retry‑tellingen, DLQ instroom/doorlooptijd, callback‑verwerkingstijden.
- Tracing: Tracing over inkomende verzoeken, provider‑aanbieding en callbacks; correlatie‑ID propagatie verplicht.
- Logging: Log op INFO/WARN/ERROR; geen persoonsgegevens in logs, gebruik referenties/ID’s.

#### Herstelbaarheid (Back‑up/Restore, DR)
- TODO, dit is een beetje verzonnen BS, maar zoiets moeten we gaan bepalen.
- RPO/RTO: pilot RTO ≤ 1 werkdag; productie RPO ≤ X minuten, RTO ≤ Y minuten (waarden nader te bepalen met beheer). 
- Back‑ups: TODO hebben we hier iets van backups, van berichten die nog net niet verzonden zijn ofzo? 
- DLQ‑replay: gecontroleerde replay voorziening met filtering om incidenten te herstellen zonder duplicaten.

### Toegankelijkheid & Gebruiksvriendelijkheid
- Frontend voldoet aan WCAG 2.1 A+AA; toetsing via Lighthouse en handmatige audit. 
- Ondersteunde browsers: Chrome, Edge, Safari, Firefox (laatste twee versies), inclusief responsive weergave, conform beleid Rijksoverheid.

### Open Standaarden
TODO iets over forum standaardisatie en beslisboom open standaard

### Kwaliteitsmeting en borging
- Geautomatiseerde kwaliteitscontroles (linting, security scanning/CVE), contracttests op API’s in CI/CD.
- Lighthouse voor eventuele UI’s; Accessibility & Best Practices prioriteit. SEO/PWA niet van toepassing.
- SLO’s/SLA’s worden actief gemonitord; afwijkingen leiden tot incidenten en verbeteracties.

### Buiten scope / expliciete uitsluitingen
- Offline‑first gebruik is uitgesloten.
