## Software architectuur

De Verificatie Service bestaat uit een lichte API voor het starten en valideren van verificaties, een messagequeue voor ontkoppeling,
en worker(s) die de Notificatie Service aanroepen om e‑mails te versturen. Alle statusinformatie opgeslagen in een datastore.

### Systeem Container diagram

![](embed:VerificatieServiceContainer)

### Componenten
- API component
  - Eindpunten om een verificatie te starten en te valideren.
  - Schrijft opdrachten naar de queue; slaat minimale status op.
- Worker component
  - Leest opdrachten uit de queue en roept de Notificatie Service aan met de e‑mail en templategegevens.
  - Markeert statusovergangen en hanteert retries/backoff.
- Datastore
  - Tabellen/collecties voor Verification en Attempt (zie Data hoofdstuk).
- Message Queue
