## Kwaliteitseisen

### Inleiding

Dit hoofdstuk vat de belangrijkste niet-functionele eisen voor de Notificatiedienst samen.
De eisen sluiten aan op het functioneel overzicht en de context.
Waar relevant verwijzen we naar architectuurkeuzes in de ADR’s en ondersteunende documentatie.

### Overzicht

De onderstaande kwaliteitseisen zijn architectonisch significant en sturen ontwerp- en implementatiekeuzes:

- Beveiliging & Privacy (AVG, authenticatie/autorisatie, dataminimalisatie)
- Beschikbaarheid & Continuïteit
- Performance & Schaalbaarheid
- Betrouwbaarheid & Afleverzekerheid
- Auditability & Logging (LDV)
- Interoperabiliteit & Open Standaarden
- Observeerbaarheid (monitoring, metrics, tracing)
- Herstelbaarheid (back-up/restore, DR)

Waar zaken bewust buiten scope vallen, is dit expliciet benoemd.

#### Beveiliging & Privacy
- Authenticatie: service-to-service authenticatie via OIDC/OAuth 2.0 (conform ADR 0006). Tokens met beperkte scopes, geen long-lived secrets in code. De inkomende NotifyNL-callback is beveiligd met een bearer token dat alleen bij NotifyNL en het NMC bekend is; richting NotifyNL authenticeert het NMC per verzoek met een ondertekende JWT.
- Autorisatie: scope-gebaseerde autorisatie per dienst/dienstverlener, met dataminimalisatie.
- Dataminimalisatie: het NMC slaat geen contactgegevens, berichtinhoud of identificerende nummers op; het Notificatieregister bevat alleen de referentie, de afleverstatus en de callback-URL (zie hoofdstuk 8).
- Privacy/AVG: verwerkingsregister en grondslagregistratie op orde (AVG art. 6 en 30). DPIA uitgevoerd vóór productie. Identificerende nummers worden in het Logboek Dataverwerkingen gepseudonimiseerd met een keyed hash.
- Transport & opslag: TLS 1.2+ in transit; secrets via de secret-voorziening van het platform; encryptie-at-rest waar toepasbaar.

#### Beschikbaarheid & Continuïteit
- Doel beschikbaarheid PoC-fase: ≥ 50% tijdens kantoortijden. Doel productie: ≥ 99,9% 24x7 (excl. gepland onderhoud). Vastgelegd als SLO en gemonitord.
- Onderhoud: onaangekondigd mogelijk in PoC-fase; productie onderhoud gecommuniceerd via standaard releaseproces.
- Degradatie: bij uitval van NotifyNL of de Profielservice faalt een verzoek expliciet met een duidelijke foutmelding, zonder dat upstream-systemen blokkeren.

#### Performance & Schaalbaarheid
- Concrete doelstellingen voor latency en throughput worden vastgesteld zodra de verwachte volumes bekend zijn.
- Het NMC is stateless en horizontaal schaalbaar; de verwerking per verzoek bestaat uit een beperkt aantal externe aanroepen (Profielservice, NotifyNL).
- Callback-verwerking is idempotent, zodat dubbele delivery receipts geen inconsistenties veroorzaken.

#### Betrouwbaarheid & Afleverzekerheid
- NotifyNL bevestigt de acceptatie synchroon; de afleverstatus volgt asynchroon via delivery receipts.
- Statusmodellering: eenduidig statusmodel, afgeleid van de NotifyNL-afleverstatussen (zie hoofdstuk 8). Overgangen zijn herleidbaar.
- De statusterugkoppeling aan de aanroeper wordt bij fouten herhaald met exponentiële back-off.
- Volledige afleverzekerheid bestaat bij e-mail niet: aflevering bij de mailserver van de ontvanger geldt als succesvolle verzending, mits die het bericht zonder foutmelding accepteert. Fouten zoals een volle mailbox of een niet-bestaand adres leiden tot een `temporary-failure` respectievelijk `permanent-failure` (zie hoofdstuk 8). De businesslogica over herverzending ligt bij de dienstverlener.

#### Auditability & Logging (LDV)
- Verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen (ADR 0007, ADR 0010).
- Onweerlegbaarheid: timestamps (UTC), referenties en gepseudonimiseerde identificerende nummers. Toegang tot audit-logs strikt geautoriseerd.

#### Interoperabiliteit & Open Standaarden
- API-contracten in OpenAPI 3.0+, JSON over HTTPS; contract-first ontwikkeling. HTTP-statuscodes volgens REST best practices.
- Foutmeldingen volgen RFC 9457 (application/problem+json).
- De statusterugkoppeling aan afnemers volgt het NL GOV profiel voor CloudEvents (ADR 0020), conform de pas-toe-of-leg-uit-lijst van het Forum Standaardisatie.
- Iedere response bevat een API-Version header ten behoeve van versionering.

#### Observeerbaarheid
- Health endpoints voor liveness en readiness (inclusief databasecheck) ten behoeve van het platform.
- Logging: log op INFO/WARN/ERROR; geen persoonsgegevens in logs, gebruik referenties/ID’s.
- Metrics en tracing worden nog ingericht.

#### Herstelbaarheid (Back-up/Restore, DR)
- Het Notificatieregister bevat alleen lopende notificaties; registraties worden na afronding verwijderd. De impact van dataverlies is daardoor beperkt tot het uitblijven van statusterugkoppeling over lopende verzendingen.
- RPO/RTO en back-upbeleid worden nog vastgesteld.

### Kwaliteitsmeting en borging
- Geautomatiseerde build met testen in CI; de testdekking wordt afgedwongen in de build (minimaal 90% instructie- en 75% branch-dekking via JaCoCo).
- Dependency-updates via Dependabot; OpenSSF Scorecard bewaakt de repository-inrichting.
- SLO’s/SLA’s worden actief gemonitord; afwijkingen leiden tot incidenten en verbeteracties.

### Buiten scope / expliciete uitsluitingen
- Het NMC heeft geen eigen gebruikersinterface; eisen voor digitale toegankelijkheid van frontends zijn hier niet van toepassing.
- Offline-first gebruik is uitgesloten.
