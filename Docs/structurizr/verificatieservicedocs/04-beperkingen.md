## Beperkingen

### Inleiding
Dit hoofdstuk beschrijft randvoorwaarden en bewuste keuzes/uitsluitingen die het ontwerp van de Email Verificatie Service begrenzen.

### Overzicht
- Geen gebruik van een message queue
  - Het versturen van e‑mail verloopt via een directe aanroep naar de Notificatie Service.
  - De API mag een directe afhankelijkheid hebben van de Notificatie Service (configureerbaar endpoint/contract).
- Notificaties uitsluitend via Notificatie Service
  - De Email Verificatie Service verstuurt zelf geen e‑mails; afleveren gebeurt via de Notificatie Service met default template.
  - De Notificatie Service moet een endpoint bieden voor het versturen van een e‑mail met verificatiecode.
  - Bij onbereikbaarheid van de Notificatie Service retourneert de Email Verificatie Service een foutmelding aan de aanroepende dienst. Retry-beleid: maximaal 5 pogingen met exponential backoff.
- Privacy en logging 
  - Geen PII in trace‑attributen of applicatielogs.
- Data‑minimalisatie en bewaartermijnen
  - Alleen noodzakelijke data worden opgeslagen: ReferenceId en VerificationCode (geen e‑mailadres).
  - TTL voor codes (standaard 10 minuten) en opschoning van afgeronde/verlopen verzoeken zijn verplicht.
  - Opschoning van verlopen verificatiecodes vindt plaats via een scheduled job (cron) die periodiek records verwijdert waarvan `ValidUntil` is verstreken.
- Functionele beperkingen (v1)
  - Alleen e‑mail als kanaal.
- Technische kaders
  - Gebruik van TLS 1.2+.
