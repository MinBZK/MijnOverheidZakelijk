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
- Authenticatie: dienstverleners authenticeren met een OAuth2-toegangstoken volgens het NL GOV Assurance profile for OAuth 2.0, uitgegeven door de IAM-gateway van MOZa, met het OIN als claim (ADR 0022); de koppelvlakken worden ontsloten over FSC. Tokens met beperkte scopes, geen long-lived secrets in code. De inkomende NotifyNL-callback is beveiligd met een bearer token dat alleen bij NotifyNL en het NMC bekend is; richting NotifyNL authenticeert het NMC per verzoek met een ondertekende JWT.
- Autorisatie: scope-gebaseerde autorisatie per dienst/dienstverlener, en per object: elke aanroep werkt uitsluitend binnen de dienstverlener-identiteit (OIN) uit het token, zodat een dienstverlener geen notificaties, status of events van een andere dienstverlener kan lezen of wijzigen.
- Dataminimalisatie: contactgegevens, identificerende nummers en de waarden voor de personalisation staan uitsluitend versleuteld op de notificatierij, met een sleutel per notificatie die op een vaste termijn na de terminale status wordt gewist; het NMC bewaart geen samengesteld bericht. Het eventlog bevat geen contactgegevens, identificerende nummers of referentie van de dienstverlener, is pseudoniem en herleidbaar door de dienstverlener en wordt als persoonsgegeven behandeld (zie hoofdstuk 8 en ADR 0022).
- Privacy/AVG: verwerkingsregister en grondslagregistratie op orde (AVG art. 6 en 30). DPIA uitgevoerd vóór productie. Identificerende nummers worden in het Logboek Dataverwerkingen gepseudonimiseerd met een keyed hash.
- Transport & opslag: TLS 1.2+ in transit; secrets via de secret-voorziening van het platform; encryptie-at-rest waar toepasbaar.

#### Beschikbaarheid & Continuïteit
- Doel beschikbaarheid PoC-fase: ≥ 50% tijdens kantoortijden. Doel productie: ≥ 99,9% 24x7 (excl. gepland onderhoud). Vastgelegd als SLO en gemonitord.
- Onderhoud: onaangekondigd mogelijk in PoC-fase; productie onderhoud gecommuniceerd via standaard releaseproces.
- Degradatie: bij uitval van NotifyNL, de Profielservice of het LDV blijft de aanname beschikbaar (202); de verzending wacht als taak en wordt hervat zodra de dienst terug is. De sleutelvoorziening ligt niet op het aanroeppad: de KEK en de peppers worden bij het opstarten opgehaald. Een verzoek faalt alleen expliciet bij een validatiefout of een overschreden quotum.

#### Performance & Schaalbaarheid
- Huidig beoogd minimum voor het volume: een piek van 2,2 miljoen notificaties van één dienstverlener in een maand wordt binnen vijf werkdagen van negen uur afgevoerd, met de limiet per NotifyNL-service als harde bovengrens. Een piek van één dienstverlener blokkeert de andere dienstverleners niet: de claim verdeelt elke batch over de dienstverleners met openstaand werk.
- Het NMC is stateless en horizontaal schaalbaar; de aanname is synchroon en de verzending loopt als taak in de achtergrond.
- Callback-verwerking is idempotent, zodat dubbele delivery receipts geen inconsistenties veroorzaken.

#### Betrouwbaarheid & Afleverzekerheid
- NotifyNL bevestigt de acceptatie synchroon; de afleverstatus volgt asynchroon via delivery receipts.
- Statusmodellering: eenduidig statusmodel, afgeleid van de NotifyNL-afleverstatussen (zie hoofdstuk 8). Overgangen zijn herleidbaar.
- Een geaccepteerde notificatie gaat nooit verloren en eindigt altijd in een terminale status waarvan de dienstverlener kennis kan nemen via de status-query, de feed of de optionele webhook; de webhook wordt bij fouten herhaald vanaf de eigen leverpositie en pauzeert na herhaald falen.
- Volledige afleverzekerheid bestaat bij e-mail niet: aflevering bij de mailserver van de ontvanger geldt als succesvolle verzending, mits die het bericht zonder foutmelding accepteert. Fouten zoals een volle mailbox of een niet-bestaand adres leiden tot een `temporary-failure` respectievelijk `permanent-failure` (zie hoofdstuk 8). Het NMC herverzendt eenmaal na een `temporary-failure` of `technical-failure` (ADR 0022); het besluit of een mislukte notificatie tot een nieuw bericht leidt, blijft bij de dienstverlener.

#### Auditability & Logging (LDV)
- Verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen (ADR 0007, ADR 0010).
- Onweerlegbaarheid: timestamps (UTC), referenties en gepseudonimiseerde identificerende nummers. Toegang tot audit-logs strikt geautoriseerd.

#### Interoperabiliteit & Open Standaarden
- API-contracten in OpenAPI 3.0+, JSON over HTTPS; contract-first ontwikkeling. HTTP-statuscodes volgens REST best practices.
- Foutmeldingen volgen RFC 9457 (application/problem+json).
- De statusterugkoppeling aan afnemers volgt het NL GOV profiel voor CloudEvents (ADR 0020, ADR 0022), conform de pas-toe-of-leg-uit-lijst van het Forum Standaardisatie, zowel in de cursorfeed (pull, `sequence`) als in de optionele webhook (push).
- Iedere response bevat een API-Version header ten behoeve van versionering.

#### Observeerbaarheid
- Health endpoints voor liveness en readiness (inclusief databasecheck) ten behoeve van het platform.
- Logging: log op INFO/WARN/ERROR; geen persoonsgegevens in logs, gebruik referenties/ID’s.
- Metrics met een alarm: de leeftijd van het watermerk van de feed, de achterstand per taaksoort, het aantal taken met status mislukt, het aantal notificaties in `bezorgstatus-onbekend`, het aantal onbevestigde terminale statussen per dienstverlener, het aantal afgewezen receipts en het aandeel `geen-contactgegevens` per dienstverlener. Tracing: de trace-id van de aanname loopt mee op elke taak.

#### Herstelbaarheid (Back-up/Restore, DR)
- Het Notificatieregister is de bron van waarheid voor lopende notificaties en het eventlog is het afleverbewijs; dataverlies raakt daarmee zowel lopende verzendingen als het bewijs. De database draait met een synchrone replica (`ANY 1` van twee standbys) en automatische failover; de bewaartermijn van de back-ups is de bovengrens van de wislatentie van gewiste sleutels.
- RPO/RTO worden nog vastgesteld.

### Kwaliteitsmeting en borging
- Geautomatiseerde build met testen in CI; de testdekking wordt afgedwongen in de build (minimaal 90% instructie- en 75% branch-dekking via JaCoCo).
- Dependency-updates via Dependabot; OpenSSF Scorecard bewaakt de repository-inrichting.
- SLO’s/SLA’s worden actief gemonitord; afwijkingen leiden tot incidenten en verbeteracties.

### Buiten scope / expliciete uitsluitingen
- Het NMC heeft geen eigen gebruikersinterface; eisen voor digitale toegankelijkheid van frontends zijn hier niet van toepassing.
- Offline-first gebruik is uitgesloten.
