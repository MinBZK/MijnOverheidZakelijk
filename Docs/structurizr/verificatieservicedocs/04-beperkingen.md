## Beperkingen

### Inleiding
Dit hoofdstuk beschrijft randvoorwaarden en bewuste keuzes/uitsluitingen die het ontwerp van de Verificatie Service begrenzen.

### Overzicht
- Geen gebruik van een message queue
  - Het versturen van e‑mail verloopt via een directe aanroep naar de Notificatie Service.
  - De API mag een directe afhankelijkheid hebben van de Notificatie Service (configureerbaar endpoint/contract).
- Notificaties uitsluitend via Notificatie Service
  - De Verificatie Service verstuurt zelf geen e‑mails; afleveren gebeurt via de Notificatie Service met default template.
- Privacy en logging 
  - Geen PII in trace‑attributen of applicatielogs.
- Data‑minimalisatie en bewaartermijnen
  - Alleen noodzakelijke gegevens worden opgeslagen: ReferenceId en VerificationCode (geen e‑mailadres).
  - TTL voor codes (standaard 10 minuten) en opschoning van afgeronde/verlopen verzoeken zijn verplicht.
- Functionele beperkingen (v1)
  - Alleen e‑mail als kanaal.
- Technische kaders
  - Gebruik van TLS 1.2+.
