## Code

De broncode van het NMC staat op GitHub: [MinBZK/moza-notificatiemanagementcomponent](https://github.com/MinBZK/moza-notificatiemanagementcomponent).

### Technologiestack

| Component          | Technologie                                        | Versie |
|--------------------|----------------------------------------------------|--------|
| Runtime            | Java                                               | 25     |
| Framework          | Quarkus                                            | 3.35.1 |
| Build tool         | Maven                                              | -      |
| ORM                | Hibernate ORM met Panache (repository pattern)     | -      |
| Databasemigraties  | Flyway                                             | -      |
| Database           | PostgreSQL (H2 in tests)                           | -      |
| API-contracten     | SmallRye OpenAPI + OpenAPI Generator (server-interfaces en uitgaande clients) | - |
| Uitgaande JWT      | SmallRye JWT Build (NotifyNL-authenticatie)        | -      |
| Foutafhandeling    | Quarkus HTTP Problem (RFC 9457)                    | -      |
| Health             | SmallRye Health                                    | -      |
| Container image    | Jib                                                | -      |
| Verwerkingslogging | LDV-wrapper (logboekdataverwerking-wrapper)        | -      |

### Pakketstructuur

De broncode volgt een gelaagde pakketstructuur onder `nl.rijksoverheid.moz.nmc`:

| Pakket                   | Verantwoordelijkheid                                                                                     |
|--------------------------|----------------------------------------------------------------------------------------------------------|
| `controller`             | REST-endpoints van de business-API (centrale en decentrale intake) en de API-Version responsefilter      |
| `service`                | Orchestratie van het notificatieproces en de mapping van berichttype naar NotifyNL-template              |
| `domain`                 | De notificatie-entiteit en het statusmodel                                                               |
| `repository`             | Toegang tot het Notificatieregister                                                                      |
| `client.notifynl`        | Verzendadapter naar NotifyNL, inclusief de JWT-opbouw per aanroep                                        |
| `client.profielservice`  | Adapter die de contactvoorkeur bij de Profielservice ophaalt                                             |
| `client.consumentcallback` | Statusterugkoppeling naar de aanroeper als CloudEvents-webhook met retries                             |
| `notifynlcallback`       | Inkomende NotifyNL delivery receipts: controller en bearer-token-authenticatiefilter                     |
| `helper`                 | Pseudonimisering met keyed HMAC en hulpfuncties voor RFC 9457-responses                                  |

De Adres-adapter en de Contactherstel-coördinator uit hoofdstuk 6 zijn nog niet gebouwd; ook herverzending en een endpoint om de notificatiestatus op te vragen ontbreken nog.

### Ontwikkelprincipes

#### Contract-first met OpenAPI

De API-specificaties in `src/main/resources/META-INF` zijn de bron. De server-interfaces worden gegenereerd (jaxrs-spec, interface-only) en de controllers implementeren die interfaces. De NotifyNL-callback heeft bewust een eigen specificatie, los van de business-API, omdat het een inkomende webhook met een eigen contract is. Ook de clients voor NotifyNL en de Profielservice worden gegenereerd uit hun specificaties.

#### Ports & adapters per externe dienst

Elke externe koppeling heeft een eigen adapter in een eigen pakket. De orchestrator kent alleen de adapters, niet de onderliggende REST-clients; externe diensten zijn daardoor vervangbaar zonder de orchestratie te raken.

#### Constructor injection

Afhankelijkheden worden via de constructor geïnjecteerd, niet via field injection.

#### Statusterugkoppeling met retries

De ConsumentCallbackAdapter verstuurt de statusterugkoppeling als CloudEvents-event en herhaalt bij fouten met exponentiële back-off en een begrensd aantal pogingen; de wachttijd is configureerbaar.

#### Foutafhandeling volgens RFC 9457

Fouten worden geretourneerd als `application/problem+json`, met een consistente structuur over alle endpoints.

### Testen

| Aspect          | Aanpak                                                                 |
|-----------------|------------------------------------------------------------------------|
| Framework       | JUnit 5 via `@QuarkusTest`                                             |
| Database        | H2 in-memory (vervangt PostgreSQL in tests)                            |
| REST API        | RestAssured                                                            |
| Externe services | Mockito `@InjectMock`                                                 |
| Testdekking     | JaCoCo; de build faalt onder 90% instructie- of 75% branch-dekking     |

Tests zijn per laag georganiseerd: controllers (REST-integratie), services (bedrijfslogica en berichttypen), adapters (NotifyNL, Profielservice, consument-callback) en helpers.
