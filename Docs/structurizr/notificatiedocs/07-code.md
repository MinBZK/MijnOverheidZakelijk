## Code

### Technologiestack

De Notificatie Service zou gebouwd worden met de volgende technologiestack:

| Component        | Technologie                               | Versie |
|------------------|-------------------------------------------|--------|
| Runtime          | Java                                      | 21     |
| Framework        | Quarkus                                   | 3.31.1 |
| Build tool       | Maven                                     | -      |
| ORM              | Hibernate ORM met Panache (Active Record) | -      |
| Audit trail      | Hibernate Envers                          | -      |
| Messaging        | SmallRye Reactive Messaging (RabbitMQ)    | -      |
| Email            | Quarkus Mailer (SMTP)                     | -      |
| API-documentatie | SmallRye OpenAPI                          | -      |
| Fault tolerance  | MicroProfile Fault Tolerance              | -      |
| REST clients     | Quarkus REST Client (OpenAPI Generator)   | -      |
| Authenticatie    | Quarkus OIDC (Keycloak)                   | -      |

### Pakketstructuur

De broncode zou een gelaagde pakketstructuur volgen onder `nl.rijksoverheid.moz.notificatie`:

| Pakket             | Verantwoordelijkheid                                                                                        |
|--------------------|-------------------------------------------------------------------------------------------------------------|
| `controller`       | JAX-RS REST-endpoints (NotificatieController, DlqController, EmailTemplateController, AfbeeldingController) |
| `services`         | Bedrijfslogica (NotificatieService, EmailTemplateService, KanaalherstelService, CallbackService)            |
| `services.channel` | Kanaaladapters per notificatietype (EmailKanaalAdapter, SmsKanaalAdapter, BriefKanaalAdapter)               |
| `entity`           | JPA-entiteiten met Panache Active Record patroon (Notificatie, NotificatieEvent, EmailTemplate, etc.)       |
| `dto.request`      | Inkomende request-objecten                                                                                  |
| `dto.response`     | Uitgaande response-objecten                                                                                 |
| `mapper`           | Mapping tussen entiteiten en DTO's                                                                          |
| `messaging`        | RabbitMQ-producers en -consumers (NotificatieProducer, NotificatieConsumer)                                 |
| `auth`             | API key authenticatie (ApiKeyFilter)                                                                        |
| `config`           | Configuratieklassen (RabbitMQ-topologie, SSRF-validatie, DNS-cache)                                         |
| `helper`           | Hulpklassen (HashHelper voor PII-pseudonimisering)                                                          |
| `common`           | Gedeelde enumeraties (NotificatieStatus, NotificatieType, KanaalStatus)                                     |

### Ontwikkelprincipes

#### Active Record patroon (Panache)

Alle entiteiten zouden `PanacheEntity` extenden en naast velden ook querymethoden bevatten. Dit maakt de code compacter doordat repository-klassen overbodig worden. Voorbeeld:

```java
Notificatie notificatie = Notificatie.findById(id);
List<Notificatie> mislukt = Notificatie.findByStatus(NotificatieStatus.MISLUKT);
```

#### Ports & Adapters voor kanalen

Kanaalspecifieke logica zou geabstraheerd worden achter een `NotificatieKanaal`-interface. Elke adapter zou `verstuur(Notificatie)` implementeren en voorzien worden van MicroProfile Fault Tolerance-annotaties (`@CircuitBreaker`, `@Retry`). Nieuwe kanalen zouden toegevoegd worden door een nieuwe adapter te implementeren zonder wijzigingen aan bestaande code.

#### Transactiegrenzen

Database-operaties en externe I/O (callbacks, kanaalverzending) zouden gescheiden worden om databaseconnecties niet te blokkeren tijdens netwerkverkeer. De `NotificatieConsumer` zou verwerking splitsen in een `@Transactional` methode voor databasewerk en een aparte stap voor callback-aflevering na commit.

#### OpenAPI-gegenereerde clients

Externe service-integraties (Profiel Service, Handelsregister, Kanaalhersteldienst) zouden gegenereerd worden uit OpenAPI-specificaties in `src/main/openapi/`. De gegenereerde clients zouden geconfigureerd worden via `application.properties` en type-safe zijn. Dit borgt dat integraties altijd in lijn zijn met de contracten.

### Testen

Voor het testen zouden wij de volgende strategie hanteren:

| Aspect | Aanpak |
|--------|--------|
| Framework | JUnit 5 via `@QuarkusTest` |
| Database | H2 in-memory (vervangt PostgreSQL in tests) |
| Messaging | SmallRye in-memory connectors (vervangt RabbitMQ) |
| Email | Quarkus mock-mailer |
| Authenticatie | `@TestSecurity` annotaties (OIDC uitgeschakeld) |
| Externe services | Mockito `@InjectMock` |

Tests zouden georganiseerd worden per laag:

| Testklasse | Scope |
|-----------|-------|
| `NotificatieControllerTest` | REST API-integratie voor notificatie-endpoints |
| `DlqControllerTest` | REST API-integratie voor DLQ-endpoints |
| `EmailTemplateControllerTest` | REST API-integratie voor template-endpoints |
| `AfbeeldingControllerTest` | REST API-integratie voor afbeelding-endpoints |
| `NotificatieServiceTest` | Service-laag bedrijfslogica |
| `EmailTemplateServiceTest` | Template-beheer bedrijfslogica |
| `NotificatieConsumerTest` | Berichtverwerking en retry/DLQ-logica |
| `CallbackServiceTest` | Callback-aflevering en SSRF-validatie |
| `KanaalherstelServiceTest` | Kanaalherstel-flow (succes en falen) |
| `TemplateRendererTest` | HTML-rendering en variabelenvervanging |
| `ApiKeyFilterTest` | API key authenticatie |
