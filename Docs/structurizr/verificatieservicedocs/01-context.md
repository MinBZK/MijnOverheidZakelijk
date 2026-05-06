# Email Verificatie Service

> | **Status**     | Conceptversie                                                                   |
> |----------------|---------------------------------------------------------------------------------|
> | Laatste update | 18-03-2026                                                                      |
> | Codebase       | [verificatie service](https://github.com/MinBZK/moza-email-verificatie-service) |

## Context

Wanneer een gebruiker een e-mailadres opgeeft binnen MOZa, moet worden vastgesteld dat dit adres daadwerkelijk van de gebruiker is.
Zonder verificatie kunnen onjuiste of kwaadwillende e-mailadressen worden gekoppeld aan een account, met gevolgen voor communicatie en betrouwbaarheid van het platform.
De Email Verificatie Service lost dit op door een gestandaardiseerd verificatieproces aan te bieden dat andere diensten kunnen aanroepen.

### Doel

De Email Verificatie Service verzorgt het verifiëren van e‑mailadressen voor andere diensten.
De service biedt een gestandaardiseerd, privacy‑bewust en robuust proces om een verificatiecode te genereren,
te versturen via een Notificatie Service en vervolgens te valideren.

Kernpunten:
- Rechtstreekse aanroep naar de Notificatie Service.
- Verificatiecodes worden niet direct door de Email Verificatie Service verstuurd, maar via de Notificatie Service.
- Minimale opslag van data: uitsluitend ReferenceId en VerificationCode (het e‑mailadres wordt niet opgeslagen).
- Heldere API richting aanroepende diensten voor het starten en afronden van verificaties.
- De Email Verificatie Service is niet hard-gekoppeld aan een specifieke notificatie service, deze is in te stellen via configuratie.

### Scope en relaties
- Aanroepende dienst start een e‑mailverificatie proces.
- Email Verificatie Service beheert de levenscyclus van verificatieverzoeken en codes.
- De Email Verificatie Service roept de Notificatie Service direct aan om de e‑mail te versturen.
- De Email Verificatie Service houdt geen geschiedenis van e‑mailadressen bij; in de database worden alléén ReferenceId en VerificationCode opgeslagen.

Hieronder het scenario van MOZa en hoe de Email Verificatie Service in dat proces past.

![Verificatie Service Context](embed:VerificatieServiceContext)

### Buiten scope
- Het rechtstreeks versturen van e‑mails.
- Multi‑kanaal verificatie anders dan e‑mail.
