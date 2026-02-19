## Functioneel overzicht

### Inleiding
De Verificatie Service faciliteert het verifiëren van e‑mailadressen voor aanroepende diensten (zoals de Profiel Service). Het primaire proces gebruikt een message queue om het genereren/opslaan van een verificatiecode te ontkoppelen van het versturen van de e‑mail via de Notificatie Service.

### Overzicht

#### Kernfunctionaliteiten in het kort:
- Start verificatie: aanroepende dienst vraagt om verificatie van een e‑mailadres.
- Code genereren en bewaren: de service maakt een (tijdelijk geldige) code aan.
- Notificatie aansturen: via de messagequeue wordt een verzoek geplaatst dat door een worker wordt afgehandeld; de worker roept de Notificatie Service aan om de code te versturen.
- Code valideren: aanroepende dienst levert de ontvangen code aan; de service valideert en retourneert de uitkomst (geldig/ongeldig/verlopen).
- Status en throttling: bewaakt aantal pogingen, geldigheid en timeouts; beschermt tegen misbruik.

#### Belangrijkste processen en informatiestromen:
1. Aanroepende Dienst → Verificatie Service: Start e‑mailverificatie.
2. Verificatie Service → Message Queue: Plaatst opdracht om e‑mail te versturen.
3. Verificatie Service haalt bericht op uit queue.
4. Verificatie Service → Notificatie Service: Vraagt versturen van e‑mail met verificatiecode.
5. Gebruiker → Aanroepende dienst: Voert code in, via een portaal. 
6. Aanroepende dienst → Verificatie Service: Valideer code.
7. Verificatie Service → Aanroepende dienst: Bevestigt of de code correct en (nog) geldig is.

Zie hoofdstuk [Code](07-code.md) voor sequentie diagrammen van dit proces.
