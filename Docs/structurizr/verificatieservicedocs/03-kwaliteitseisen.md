## Kwaliteitseisen

### Inleiding
Deze sectie beschrijft de belangrijkste niet-functionele eisen (NFR’s) voor de Verificatie Service.

### Overzicht
- Beveiliging & privacy (AVG):
  - Minimaliseer PII: bewaar alleen het e‑mailadres en strikt noodzakelijke metadata.
  - Geen PII in logs of trace‑attributen.
  - Encryptie at‑rest en in‑transit (TLS 1.2+).
  - OPTIE: Ontsluiten via FDS zodat het lastiger is via onze service massa emails te versturen door kwaadwillende partijen.
- Betrouwbaarheid & levering:
  - Gebruik van message queue met at‑least‑once aflevering.
  - Geen dubbele e‑mails bij retries: deduplicatie via messageId/idempotency‑key.
  - Eventual consistency geaccepteerd.
- Performance & Error handling:
  - De verificatie service moet minimaal x aantal aanvragen per uur kunnen verwerken.
  - Als een code twee keer wordt ingevoerd, krijgt de tweede een 'Code Already Used' foutmelding. (Zie #7.2.2)

