## Code

### Email verifiëren

Onderstaande sectie geeft voorbeeldcontracten (API) en berichtschema’s (queue) en schetst de basislogica. Dit is geen implementatie, maar richtinggevend voor teams.

#### HTTP API
*Link naar swagger*


### Verification Service Sequence Diagrams

#### 1. Verification Request Flow

Deze flow beschrijft hoe een verificatie verzoek wordt aangemaakt en asynchroon wordt verstuurd.

![Verification Request Flow](./images/SequentieVerificationRequestFlow.png "Verification Request Flow")

<details>
  <summary>Zie mermaid code</summary>
    
    sequenceDiagram
        participant AanroependeDienst
        participant VC as VerificationController
        participant DB as Database
        participant RMQ as RabbitMQ
        participant VRH as VerificationRequestHandler
        participant NNL as NotifyNLService
    
        AanroependeDienst->>VC: POST /request {email}
        activate VC
        VC->>DB: Create & Persist VerificationCode
        VC->>RMQ: Send Code ID to 'verification-requests'
        VC-->>AanroependeDienst: 200 OK (Reference ID)
        deactivate VC
    
        Note over RMQ, VRH: Asynchronous Processing with Retry & Fallback
        RMQ->>VRH: Consume Message (Code ID)
        activate VRH
        
        loop Up to 6 attempts (1 initial + 5 retries)
            VRH->>DB: Find VerificationCode by ID
            VRH->>NNL: sendVerificationEmail(code)
            activate NNL
            NNL-->>VRH: Success / Exception
            deactivate NNL
            
            alt Success
                VRH->>DB: Update verifyEmailSentAt & Persist
                VRH-->>RMQ: Ack Message
                Note over VRH: Stop Loop
            else Exception
                Note over VRH: Exponential Backoff
            end
        end
        
        alt All retries failed
            VRH->>VRH: onMaxRetriesReached (Fallback)
            VRH-->>RMQ: Ack Message (Graceful Delete)
        end
        deactivate VRH
        
</details>

#### 2. Verification Completion Flow

Deze flow beschrijft hoe een gebruiker zijn email verifieërt met de ontvangen code.

![Verification Completion Flow](./images/SequentieVerificationCompletionFlow.png "Verification Completion Flow")

<details>
  <summary>Zie mermaid code</summary>

        sequenceDiagram
            participant AanroependeDienst
            participant VC as VerificationController
            participant DB as Database
        
            AanroependeDienst->>VC: POST /verify {referenceId, email, code}
            activate VC
            VC->>DB: Find VerificationCode by referenceId and email
            
            alt Code Not Found
                VC-->>AanroependeDienst: 200 OK {success: false, reasonId: 1, reasonMessage: "..."}
            else Code Found
                alt Code Expired
                    VC-->>AanroependeDienst: 200 OK {success: false, reasonId: 2, reasonMessage: "..."}
                else Code Already Used
                    VC-->>AanroependeDienst: 200 OK {success: false, reasonId: 3, reasonMessage: "..."}
                else Incorrect Code
                    VC-->>AanroependeDienst: 200 OK {success: false, reasonId: 4, reasonMessage: "..."}
                else Valid Code
                    VC->>DB: Update verifiedAt & Persist
                    VC-->>AanroependeDienst: 200 OK {success: true}
                end
            end
            deactivate VC

</details>

#### 3. Admin Statistics Flow

Deze flow is hoe een admin de statistieken kan ophalen van de verificatie service.

![Admin Statistics Flow](./images/SequentieAdminStatisticsFlow.png "Admin Statistics Flow")

<details>
  <summary>Zie mermaid code</summary>
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

</details>
