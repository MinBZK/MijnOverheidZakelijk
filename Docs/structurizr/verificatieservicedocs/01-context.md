# Verificatie Service

## Context

### Doel

De Verificatie Service verzorgt het verifiëren van e‑mailadressen voor andere diensten.
De service biedt een gestandaardiseerd, privacy‑bewust en robuust proces om een verificatiecode te genereren, 
te versturen via de Notificatie Service en vervolgens te valideren.

Kernpunten:
- Producer/consumer‑model via een messagequeue om ontkoppeling en betrouwbaarheid te borgen.
- Verificatiecodes worden niet direct door de Verificatie Service verstuurd, maar via de Notificatie Service.
- Minimale opslag van gegevens.
- Heldere API richting aanroepende diensten voor het starten en afronden van verificaties.

### Scope en relaties
- Aanroepende dienst start een e‑mailverificatie proces.
- Verificatie Service beheert de levenscyclus van verificatieverzoeken en codes.
- Notificatie Service verzorgt het afleveren van de e‑mail aan de gebruiker.

![Verificatie Service Context](embed:VerificatieServiceContext)

### Buiten scope
- Het rechtstreeks versturen van e‑mails.
- Multi‑kanaal verificatie anders dan e‑mail.
