## Software architectuur

De Verificatie Service bestaat uit een lichte API voor het starten en valideren van verificaties en roept de Notificatie Service
rechtstreeks aan om e‑mails te versturen. Alle noodzakelijke statusinformatie wordt opgeslagen in een datastore.

### Systeem Container diagram

![](embed:VerificatieServiceContainer)

### Componenten
- API component
  - Eindpunten om een verificatie te starten en te valideren.
  - Roept de Notificatie Service direct aan; slaat minimale status op (ReferenceId + VerificationCode).
- Datastore
  - Tabellen/collecties voor Verification en Attempt (zie Data hoofdstuk).
  - Geen opslag van e‑mailadressen; TTL/opschoning op codes.
