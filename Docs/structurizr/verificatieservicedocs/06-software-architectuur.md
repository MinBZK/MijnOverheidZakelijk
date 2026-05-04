## Software architectuur

De Email Verificatie Service bestaat uit een lichte API voor het starten en valideren van verificaties en roept de Notificatie Service
rechtstreeks aan om e‑mails te versturen. Alle noodzakelijke statusinformatie wordt opgeslagen in een datastore.

### Tech stack

| Onderdeel | Technologie |
|-----------|-------------|
| Framework | Quarkus 3.x |
| Taal | Java 21+ |
| Build tool | Maven 3.9+ |
| ORM | Hibernate ORM met Panache |
| Database | PostgreSQL |
| HTTP Client | Java HttpClient (HTTP/2) |
| Authenticatie (NotifyNL) | JWT Bearer Token (SmallRye JWT) |
| Fault tolerance | SmallRye Fault Tolerance |
| API-documentatie | OpenAPI / Swagger UI |

### Deployment

De service wordt als container gedeployed (Docker). Er zijn meerdere Dockerfile-varianten beschikbaar:

- **JVM** (standaard) — Red Hat UBI9 OpenJDK 21 runtime, poort 8080, non-root user.
- **Native** — GraalVM native image voor lagere opstarttijd en geheugengebruik.

Lokale ontwikkeling draait via Docker Compose (inclusief PostgreSQL).

### Systeem Container diagram

![](embed:VerificatieServiceContainer)

### Componenten
- API component
  - Eindpunten om een verificatie te starten en te valideren.
  - Roept de Notificatie Service direct aan; slaat minimale status op (ReferenceId + VerificationCode).
- Datastore
  - PostgreSQL met tabellen voor VerificatieCode en VerificatieStatistieken (zie Data hoofdstuk).
  - Geen opslag van e‑mailadressen; TTL/opschoning op codes.
  - Connection pool: max 16 verbindingen.
- Scheduled job
  - Opschoningstaak draait elke 60 seconden; verwijdert verlopen en afgeronde verificatiecodes en verplaatst relevante gegevens naar de statistiekentabel.

### Fouttolerantie en misbruikpreventie

Rondom de aanroep naar NotifyNL zijn twee patronen toegepast:

- **Rate limiter** — een in-memory teller per e-mailadres bewaakt het aantal verzendpogingen binnen een tijdvenster (standaard 5 per 15 minuten, configureerbaar). Verzoeken boven het maximum worden geweigerd zonder dat NotifyNL wordt aangeroepen. Een geplande taak schoont verlopen entries op.
- **Circuit breaker** — `@CircuitBreaker` (SmallRye Fault Tolerance) op de verzendmethode. Na een drempel mislukte aanroepen gaat het circuit open en worden vervolgverzoeken direct doorgestuurd naar een fallback. Na een wachttijd schakelt het circuit naar half-open om herstel van NotifyNL te detecteren. Drempel, wachttijd en hersteldrempel zijn configureerbaar.
