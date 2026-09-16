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

De takentabel, het eventlog, de herverzending, de reconciler, de eventfeed en het status-endpoint uit hoofdstuk 6 zijn nog niet gebouwd.

### Klassen (doelontwerp ADR 0022)

De componenten uit hoofdstuk 6 werken uit tot de klassen hieronder. Dit is het doelontwerp van [ADR 0022](/workspace/decisions#22); de pakketstructuur hierboven beschrijft de huidige code. Klassen die blijven bestaan houden hun naam (`NotifyNLVerzendAdapter`, `ProfielServiceAdapter`, `NotifyNLCallbackController`, `ConsumentCallbackAdapter`, `HashHelper`, `NotificatieRepository`). De orchestrator `NotificatieService` vervalt; zijn verantwoordelijkheden verdelen zich over de aanname, de overgangsfunctie en de taakhandlers.

#### Domein

De entiteiten volgen de tabellen één op één. `Notificatie` draagt de status en een versie die per overgang met één oploopt. `Event` draagt de transactie-id (`xid8`) waarop de feed sorteert, zodat een cursor nooit een laat gecommit event overslaat. Contactgegevens staan versleuteld met een sleutel per notificatie; het eventlog en de `Taak`-payload bevatten geen persoonsgegevens.

![NMC klassen: domein](./images/nmc-klassen-domein.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    classDiagram
        direction LR
        namespace domain {
            class Notificatie {
                +UUID id
                +UUID dvId
                +bytes dvRefHmac
                +String berichtType
                +NotificatieStatus status
                +int versie
                +Reden laatsteReden
                +Instant geldigTot
                +bytes ontvangerVersleuteld
                +bytes sleutelGewrapt
                +Instant aangenomenOp
            }
            class Poging {
                +UUID id
                +UUID notificatieId
                +int nummer
                +PogingStatus status
                +UUID notifyNlId
                +Instant verzondenOp
                +Instant laatsteReceiptOp
            }
            class Taak {
                +long id
                +TaakSoort soort
                +UUID notificatieId
                +Instant due
                +Instant leaseTot
                +UUID claimEpoch
                +int pogingen
                +jsonb payload
            }
            class Event {
                +long id
                +xid8 xactId
                +Instant tijdstip
                +UUID dvId
                +UUID notificatieId
                +int volgnummer
                +String van
                +String naar
                +Reden reden
            }
            class NotificatieStatus {
                <<enumeration>>
                aangenomen
                verzonden
                bezorgd
                niet-bezorgbaar
                technisch-mislukt
                bezorgstatus-onbekend
                verlopen
                geannuleerd
            }
            class PogingStatus {
                <<enumeration>>
                gepland
                verzonden
                bezorgd
                tijdelijk-mislukt
                permanent-mislukt
                technisch-mislukt
                onbekend
            }
            class TaakSoort {
                <<enumeration>>
                verzenden
                receipt-verwerken
                reconcilieren
                ongeldig-melden
            }
        }
        Notificatie "1" --> "1..*" Poging
        Notificatie "1" --> "*" Taak
        Notificatie "1" --> "1..*" Event
        Notificatie ..> NotificatieStatus
        Poging ..> PogingStatus
        Taak ..> TaakSoort
    ```

</details>

#### Statusovergangen

De `Overgangsfunctie` staat alleen de overgangen hieronder toe; een dubbele of ongeordende receipt is een no-op. Terminale statussen zijn absorberend, met als enige uitzondering `bezorgstatus-onbekend`, dat door een laat event nog naar `bezorgd` of `niet-bezorgbaar` mag. Bij een herverzending of nieuwe poging blijft de notificatie `verzonden`; de poging draagt de tussenstatus. Een tweede temporary-failure of een permanent-failure leidt tot `niet-bezorgbaar`; technical-failure geeft een begrensd aantal nieuwe pogingen en daarna `technisch-mislukt`. Een permanente 4xx van NotifyNL of de Profielservice is direct terminaal.

![NMC statusovergangen](./images/nmc-statusovergangen.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    stateDiagram-v2
        direction LR
        state "niet-bezorgbaar" as niet_bezorgbaar
        state "technisch-mislukt" as technisch_mislukt
        state "bezorgstatus-onbekend" as bezorgstatus_onbekend
        [*] --> aangenomen : aanname, 202
        aangenomen --> verzonden : NotifyNL 201
        aangenomen --> verlopen : geldig_tot verstreken
        aangenomen --> geannuleerd : annulering tot aan de claim
        aangenomen --> technisch_mislukt : permanente 4xx
        aangenomen --> niet_bezorgbaar : geen contactgegevens of onderdrukt
        verzonden --> verzonden : nieuwe poging
        verzonden --> bezorgd : receipt delivered
        verzonden --> niet_bezorgbaar : permanent-failure of 2e temporary-failure
        verzonden --> technisch_mislukt : pogingen uitgeput
        verzonden --> bezorgstatus_onbekend : reconciler uitgeput
        bezorgstatus_onbekend --> bezorgd : laat event
        bezorgstatus_onbekend --> niet_bezorgbaar : laat event
        bezorgd --> [*]
        niet_bezorgbaar --> [*]
        technisch_mislukt --> [*]
        verlopen --> [*]
        geannuleerd --> [*]
    ```

</details>

#### Levenscyclus en taken

`Overgangsfunctie` is de enige schrijver van de status; alle andere klassen roepen haar aan binnen hun eigen transactie, zodat werk, taakafronding en event samen committen. `TaakWorker` claimt taken via `TaakClaimer` (`SELECT ... FOR UPDATE SKIP LOCKED`, batch, tokens uit `Verzendbudget`) en delegeert per taaksoort aan een `TaakHandler`. De HTTP-aanroep naar NotifyNL valt tussen de claim-transactie en de overgangstransactie, nooit erin. `Eventfeed` leest het eventlog onder het watermerk van de oudste lopende transactie; `WebhookDispatcher` gebruikt dezelfde feed per dienstverlener.

![NMC klassen: levenscyclus en taken](./images/nmc-klassen-levenscyclus.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    classDiagram
        direction TB
        namespace levenscyclus {
            class AannameService {
                +aannemen(AannameOpdracht opdracht) UUID
                +annuleren(UUID notificatieId)
            }
            class Overgangsfunctie {
                +status(UUID notificatieId, NotificatieStatus naar, Reden reden) OvergangUitkomst
                -vergrendel(UUID notificatieId) Notificatie
            }
            class Overgangsregels {
                +toegestaan(van, naar) boolean
                +uitReceipt(Poging poging, Receipt receipt) Overgang
            }
            class OvergangUitkomst {
                <<enumeration>>
                uitgevoerd
                no-op
            }
            class ReceiptVerwerker {
                +verwerk(InkomendEvent event)
            }
            class Reconciler {
                +reconcilieer(Poging poging)
            }
        }
        namespace taak {
            class TaakWorker {
                +run()
            }
            class TaakClaimer {
                +claim(TaakSoort soort, int batch) List~Taak~
                +afronden(Taak t)
                +uitstellen(Taak t, Instant due)
                +uitgeput(Taak t)
            }
            class Verzendbudget {
                +neem(String notifyService, int n) int
            }
            class TaakHandler {
                <<interface>>
                +soort() TaakSoort
                +voerUit(Taak t)
            }
            class VerzendTaakHandler
            class ReceiptTaakHandler
            class ReconciliatieTaakHandler
            class OngeldigMeldenTaakHandler
        }
        namespace terugkoppeling {
            class Eventfeed {
                +lees(UUID dvId, Cursor cursor, int limiet) EventPagina
                +bevestig(UUID dvId, Cursor cursor)
            }
            class WebhookDispatcher {
                +dispatch(UUID dvId)
            }
            class Cursor {
                +xid8 xactId
                +long eventId
            }
        }
        TaakWorker --> TaakClaimer
        TaakWorker --> TaakHandler
        TaakClaimer --> Verzendbudget
        TaakHandler <|.. VerzendTaakHandler
        TaakHandler <|.. ReceiptTaakHandler
        TaakHandler <|.. ReconciliatieTaakHandler
        TaakHandler <|.. OngeldigMeldenTaakHandler
        AannameService --> Overgangsfunctie
        VerzendTaakHandler --> Overgangsfunctie
        ReceiptTaakHandler --> ReceiptVerwerker
        ReceiptVerwerker --> Overgangsregels
        ReceiptVerwerker --> Overgangsfunctie
        ReconciliatieTaakHandler --> Reconciler
        Reconciler --> Overgangsfunctie
        Overgangsfunctie --> Overgangsregels
        Overgangsfunctie ..> OvergangUitkomst
        WebhookDispatcher --> Eventfeed
        Eventfeed ..> Cursor
    ```

</details>

#### Randen: controllers, callbacks, adapters en opslag

De controllers implementeren de gegenereerde server-interfaces en bevatten geen logica. De NotifyNL-callback schrijft het inkomende event via `InkomendEventOpslag` weg als taak en antwoordt daarna; de verwerking volgt in de `TaakWorker`. `Sleutelbeheer` beheert de sleutel per notificatie onder een externe KEK; wissen van de sleutel is de wisactie.

![NMC klassen: randen](./images/nmc-klassen-randen.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    classDiagram
        direction LR
        namespace controller {
            class CentraleNotificatieController {
                +aannemen(CentraleAanname body) NotificatieId
            }
            class DecentraleNotificatieController {
                +aannemen(DecentraleAanname body) NotificatieId
            }
            class NotificatieStatusController {
                +status(UUID id) NotificatieStatusResponse
                +zoeken(ZoekVraag dvRef) NotificatieStatusResponse
                +annuleren(UUID id)
            }
            class EventfeedController {
                +wijzigingen(String since, int limiet) EventPagina
                +bevestigen(String cursor)
            }
        }
        namespace inkomend {
            class NotifyNLCallbackController {
                +receipt(Receipt r)
            }
            class InkomendEventOpslag {
                +slaOp(Bron bron, Object payloadZonderPii) Taak
            }
        }
        namespace client {
            class NotifyNLVerzendAdapter {
                +verstuur(Poging p, String templateId, Map personalisation) UUID
                +status(UUID notifyNlId) Receipt
            }
            class ProfielServiceAdapter {
                +voorkeur(PartijIdentificatie id) Voorkeur
                +meldOngeldig(PartijIdentificatie id, long voorkeurVersie)
            }
            class ConsumentCallbackAdapter {
                +lever(Webhook w, List~Event~ events)
            }
        }
        namespace repository {
            class NotificatieRepository
            class PogingRepository
            class TaakRepository
            class EventRepository
        }
        namespace crypto {
            class Sleutelbeheer {
                +versleutel(UUID notificatieId, bytes waarde) bytes
                +ontsleutel(UUID notificatieId, bytes waarde) bytes
                +wis(UUID notificatieId)
            }
            class HashHelper {
                +hmac(String waarde) bytes
            }
        }
        namespace levenscyclus {
            class AannameService
            class Overgangsfunctie
            class Reconciler
            class Eventfeed
            class WebhookDispatcher
            class VerzendTaakHandler
            class OngeldigMeldenTaakHandler
        }
        CentraleNotificatieController --> AannameService
        DecentraleNotificatieController --> AannameService
        NotificatieStatusController --> AannameService : annuleren
        NotificatieStatusController --> NotificatieRepository
        EventfeedController --> Eventfeed
        NotifyNLCallbackController --> InkomendEventOpslag
        InkomendEventOpslag --> TaakRepository
        AannameService --> HashHelper
        AannameService --> Sleutelbeheer
        VerzendTaakHandler --> ProfielServiceAdapter
        VerzendTaakHandler --> NotifyNLVerzendAdapter
        Reconciler --> NotifyNLVerzendAdapter
        OngeldigMeldenTaakHandler --> ProfielServiceAdapter
        WebhookDispatcher --> ConsumentCallbackAdapter
        Overgangsfunctie --> NotificatieRepository
        Overgangsfunctie --> PogingRepository
        Eventfeed --> EventRepository
    ```

</details>

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
