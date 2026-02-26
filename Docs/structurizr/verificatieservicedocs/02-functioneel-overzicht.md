## Functioneel overzicht

### Inleiding
De Verificatie Service faciliteert het verifiëren van e‑mailadressen voor aanroepende diensten (zoals de Profiel Service). Het primaire proces roept de Notificatie Service rechtstreeks aan. De aanroepende dienst krijgt een referentie id terug na het doen van een verificatieaanvraag.

### Overzicht

#### Kernfunctionaliteiten in het kort:
- Start verificatie: aanroepende dienst vraagt om verificatie van een e‑mailadres.
- Code genereren en bewaren: de service maakt een code aan en bewaart enkel ReferenceId en VerificationCode.
- Notificatie aansturen: de Verificatie Service roept de Notificatie Service direct aan om de e‑mail met verificatiecode te versturen.
- Code valideren: aanroepende dienst levert de ontvangen code aan; de service valideert en retourneert de uitkomst (geldig/ongeldig/verlopen).
- Status en throttling: bewaakt aantal pogingen, geldigheid en timeouts; beschermt tegen misbruik.

#### Belangrijkste processen en informatiestromen:

1. Aanroepende Dienst → Verificatie Service: Start e‑mailverificatie, ontvangt referentie id.
2. Verificatie Service → Notificatie Service: Rechtstreekse aanroep om e‑mail met verificatiecode te versturen.
3. Gebruiker → Aanroepende dienst: Voert code in, via een portaal.
4. Aanroepende dienst → Verificatie Service: Valideer code, met referenceId en code.
5. Verificatie Service → Aanroepende dienst: Bevestigt of de code correct en (nog) geldig is.

Zie hoofdstuk [Code](07-code.md) voor sequentie diagrammen van dit proces.
