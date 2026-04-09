# Verificatie Service

> | **Status**     | Conceptversie                                                                   |
> |----------------|---------------------------------------------------------------------------------|
> | Laatste update | 23-02-2026                                                                      |
> | Codebase       | [verificatie service](https://github.com/MinBZK/moza-email-verificatie-service) |

## Context

Het verifiëren van een e-mailadres vóórdat het in gebruik wordt genomen is essentieel. 
Zo wordt gewaarborgd dat de gebruiker toegang heeft tot het opgegeven e-mailadres.
Daarnaast is een notificatieservice noodzakelijk voor de werking van deze dienst, zodat er überhaupt een verificatie-e-mail kan worden verzonden.

### Doel

De Verificatie Service verzorgt het verifiëren van e‑mailadressen voor andere diensten.
De service biedt een gestandaardiseerd, privacy‑bewust en robuust proces om een verificatiecode te genereren, 
te versturen via een Notificatie Service en vervolgens te valideren.

Kernpunten:
- Rechtstreekse aanroep naar de Notificatie Service.
- Verificatiecodes worden niet direct door de Verificatie Service verstuurd, maar via de Notificatie Service.
- Minimale opslag van gegevens: uitsluitend ReferenceId en VerificationCode (het e‑mailadres wordt niet opgeslagen).
- Heldere API richting aanroepende diensten voor het starten en afronden van verificaties.
- De Verificatie Service is niet hard-gekoppeld aan een specifieke notificatie service, deze is in te stellen via configuratie.

### Scope en relaties
- Aanroepende dienst start een e‑mailverificatie proces.
- Verificatie Service beheert de levenscyclus van verificatieverzoeken en codes.
- De Verificatie Service roept de Notificatie Service direct aan om de e‑mail te versturen.
- De Verificatie Service houdt geen geschiedenis van e‑mailadressen bij; in de database worden alléén ReferenceId en VerificationCode opgeslagen. 

Hieronder het scenario van MOZa en hoe de verificatie service in dat process past.

![Verificatie Service Context](embed:VerificatieServiceContext)

### Buiten scope
- Het rechtstreeks versturen van e‑mails.
- Multi‑kanaal verificatie anders dan e‑mail.
