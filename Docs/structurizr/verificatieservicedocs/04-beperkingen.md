## Beperkingen

### Inleiding
Dit hoofdstuk beschrijft randvoorwaarden en bewuste keuzes/uitsluitingen die het ontwerp van de Verificatie Service begrenzen.

### Overzicht
- Ontkoppeling via queue is verplicht
  - Het versturen van e‑mail is asynchroon en verloopt uitsluitend via een messagequeue.
  - De API mag geen directe afhankelijkheid hebben van de Notificatie Service.
- Notificaties uitsluitend via Notificatie Service
  - De Verificatie Service verstuurt zelf geen e‑mails; afleveren gebeurt via de Notificatie Service met default template.
- Privacy en logging 
  - Geen PII in trace‑attributen of applicatielogs.
- Data‑minimalisatie en bewaartermijnen
  - Alleen noodzakelijke gegevens worden opgeslagen.
  - TTL voor codes (standaard 10 minuten) en opschoning van afgeronde/verlopen verzoeken zijn verplicht.
- Functionele beperkingen (v1)
  - Alleen e‑mail als kanaal.
- Technische kaders
  - Gebruik van TLS 1.2+.
