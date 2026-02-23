## Data

### Doel en uitgangspunten
- Minimaliseer PII: bewaar alléén wat nodig is om verificatie mogelijk te maken.
- Bewaartermijnen/TTL toepassen om oude/verlopen records automatisch te verwijderen.
- Encryptie at‑rest (DB) en in‑transit (TLS). Toegangsrechten volgens least privilege.

### Gegevensmodel

#### VERIFICATIECODE

| Attribuut           | Omschrijving                                                          |
|---------------------|-----------------------------------------------------------------------|
| **VERIFICATIECODE** |                                                                       |
| CreatedAt           | Tijdstip wanneer de verificatie is aangevraagd                        |
| UpdatedAt           | Tijdstip wanneer de tabel voor het laatst is geupdatet                |
| ValidUntil          | Tijdstip tot wanneer de verificatiecode geldig is                     |
| VerifiedAt          | Tijdstip wanneer de verificatie is geverifieerd                       |
| VerifyEmailSentAt   | Tijdstip wanneer de verificatie email is verstuurd                    |
| Code                | De verificatiecode                                                    |
| Email               | Het email adres                                                       |
| ReferenceId         | Referentie ID die de aanvrager kan gebruiker om de code te verifieren |

#### VERIFICATIESTATISTIEKEN

| Attribuut                   | Omschrijving                                                                       |
|-----------------------------|------------------------------------------------------------------------------------|
| **VERIFICATIESTATISTIEKEN** |                                                                                    |
| CreatedAt                   | Tijdstip wanneer de verificatie is aangevraagd                                     |
| VerifiedAt                  | Tijdstip wanneer de verificatie is geverifieerd                                    |
| VerifyEmailSentAt           | Tijdstip wanneer de verificatie email is verstuurd                                 |
| FailureReason               | Waarom de verificatie is gefaald, Enum momenteel met optie NOT_SENT & NOT_VERIFIED |
