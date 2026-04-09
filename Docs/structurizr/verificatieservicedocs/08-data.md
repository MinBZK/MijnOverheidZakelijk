## Data

### Doel en uitgangspunten
- Minimaliseer PII: bewaar alléén wat nodig is om verificatie mogelijk te maken.
- Bewaartermijnen/TTL toepassen om oude/verlopen records automatisch te verwijderen.
- Encryptie at‑rest (DB) en in‑transit (TLS). Toegangsrechten volgens least privilege.

### Gegevensmodel

#### VERIFICATIECODE

| Attribuut           | Omschrijving                                                          |
|---------------------|-----------------------------------------------------------------------|
| **VERIFICATIECODE** | Minimalistische opslag voor het kunnen verifiëren van een code        |
| ReferenceId         | Referentie ID die de aanvrager gebruikt om de code te verifiëren      |
| Code                | De verificatiecode (6 cijfers)                                        |
| CreatedAt           | Tijdstip wanneer de verificatie is aangevraagd                        |
| UpdatedAt           | Tijdstip wanneer de tabel voor het laatst is geupdatet                |
| ValidUntil          | Tijdstip tot wanneer de verificatiecode geldig is                     |
| VerifiedAt          | Tijdstip wanneer de verificatie is geverifieerd                       |
| VerifyEmailSentAt   | Tijdstip wanneer de verificatie email is verstuurd                    |
| Attempts            | Aantal validatiepogingen voor deze verificatiecode                    |
| MaxAttempts         | Maximaal toegestane pogingen voordat de code ongeldig wordt (_nader te bepalen_, bijv. 5) |

#### VERIFICATIESTATISTIEKEN

| Attribuut                   | Omschrijving                                                                       |
|-----------------------------|------------------------------------------------------------------------------------|
| **VERIFICATIESTATISTIEKEN** |                                                                                    |
| CreatedAt                   | Tijdstip wanneer de verificatie is aangevraagd                                     |
| VerifiedAt                  | Tijdstip wanneer de verificatie is geverifieerd                                    |
| VerifyEmailSentAt           | Tijdstip wanneer de verificatie email is verstuurd                                 |
| FailureResult               | Uitkomst bij een mislukte verificatie. Enum met opties: `NOT_SENT`, `NOT_VERIFIED` |
