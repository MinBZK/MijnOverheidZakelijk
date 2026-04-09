## Code

### Email verifiëren

Onderstaande sectie geeft voorbeeldcontracten (API) en schetst de basislogica. Dit is geen implementatie, maar richtinggevend voor teams.

#### HTTP API

De volledige OpenAPI-specificatie is momenteel niet publiek beschikbaar, maar op te vragen bij het team.

##### Endpoints overzicht

| Methode | Pad                          | Beschrijving                        | Succesrespons | Foutrespons                      |
|---------|------------------------------|-------------------------------------|---------------|----------------------------------|
| POST    | `/api/v1/request`            | Start een e-mailverificatie         | 200 OK        | 502 Bad Gateway (notificatie mislukt) |
| POST    | `/api/v1/verify`             | Valideer een verificatiecode        | 200 OK        | Zie foutcodes hieronder          |
| GET     | `/api/v1/admin/statistics`   | Haal verificatiestatistieken op     | 200 OK        | 401/403                          |

##### Foutcodes bij verificatie (`POST /api/v1/verify`)

Foutresponses volgen [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) (`application/problem+json`), conform de NL API Design Rules.

| Situatie          | HTTP Status                | ReasonId | Beschrijving                                      |
|-------------------|----------------------------|----------|---------------------------------------------------|
| Code niet gevonden | 404 Not Found             | 1        | Geen verificatie gevonden voor het opgegeven referenceId |
| Code verlopen     | 410 Gone                   | 2        | De verificatiecode is verlopen                     |
| Code reeds gebruikt | 409 Conflict              | 3        | De verificatiecode is al gebruikt                  |
| Onjuiste code     | 422 Unprocessable Entity    | 4        | De opgegeven code is onjuist                       |
| Geldige code      | 200 OK                     | —        | Verificatie geslaagd                               |

### Email Verificatie Service Sequentiediagrammen

#### Verification Request Flow

Deze flow beschrijft hoe een verificatieverzoek wordt aangemaakt en direct via de Notificatie Service wordt verstuurd.

![Verification Request Flow](./images/SequentieVerificationRequestFlow.png "Verification Request Flow")

<details>
<summary>Zie mermaid code</summary>

```mermaid
sequenceDiagram
    participant AanroependeDienst
    participant VC as VerificationController
    participant DB as Database
    participant NNL as NotificatieService
    AanroependeDienst->>VC: POST /request {email}
    activate VC
    VC->>DB: Create {referenceId, verificationCode}
    VC->>NNL: sendVerificationEmail(email, verificationCode)
    activate NNL
    NNL-->>VC: 200 OK
    deactivate NNL
    VC-->>AanroependeDienst: 200 OK (referenceId)
    deactivate VC
```

</details>

#### Verification Completion Flow

Deze flow beschrijft hoe een gebruiker zijn email verifieert met de ontvangen code.

![Verification Completion Flow](./images/SequentieVerificationCompletionFlow.png "Verification Completion Flow")

<details>
<summary>Zie mermaid code</summary>

```mermaid
sequenceDiagram
    participant AanroependeDienst
    participant VC as VerificationController
    participant DB as Database
    AanroependeDienst->>VC: POST /verify {referenceId, code}
    activate VC
    VC->>DB: Find by referenceId
    alt Code Expired
        VC-->>AanroependeDienst: 410 Gone {reasonId: 2}
    else Code Already Used
        VC-->>AanroependeDienst: 409 Conflict {reasonId: 3}
    else Code Not Found
        VC-->>AanroependeDienst: 404 Not Found {reasonId: 1}
    else Code Found
        alt Incorrect Code
            VC-->>AanroependeDienst: 422 Unprocessable Entity {reasonId: 4}
        else Valid Code
            VC->>DB: Delete record & Save statistics
            VC-->>AanroependeDienst: 200 OK {success: true}
        end
    end
    deactivate VC
```

</details>

#### Admin Statistics Flow

Deze flow is hoe een admin de statistieken kan ophalen van de verificatie service.

![Admin Statistics Flow](./images/SequentieAdminStatisticsFlow.png "Admin Statistics Flow")

<details>
<summary>Zie mermaid code</summary>

```mermaid
sequenceDiagram
    participant Admin
    participant ASC as AdminStatisticsController
    participant DB as Database (VerificationStatistics)
    Admin->>ASC: GET /admin/statistics
    activate ASC
    ASC->>DB: List all VerificationStatistics
    ASC->>ASC: Calculate average time and unverified percentage
    ASC-->>Admin: 200 OK (AdminStatisticsResponse)
    deactivate ASC
```

</details>
