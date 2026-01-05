## Functioneel overzicht

Wat hebben wij onderzocht en uitgewerkt?

### Voorkant

De huidige voorkant van onze services is gebaseerd op MijnOverheid voor burgers. Hier kan een fictieve zakelijke gebruiker zijn e-mailadres instellen en contactmomenten bekijken. Ons doel is om deze voorkant, MijnOverheidZakelijk, verder te ontwikkelen tot een platform waar zakelijke gebruikers diverse zaken voor hun onderneming, stichting of vergelijkbare organisatie kunnen regelen. Denk bijvoorbeeld aan het aanvragen van subsidies, het melden van zwangerschapsverlof van medewerkers of het registreren van bedrijfsauto’s.

### Profiel service

Deze service beheert het profiel van een onderneming, momenteel beperkt tot het e-mailadres. Op de achtergrond haalt de service aanvullende gegevens op uit het Handelsregister van de KvK. De ambitie van de profiel service is om een centrale plek te worden waar verschillende overheidsinstanties terechtkunnen als ze (contact)informatie van een bedrijf nodig hebben.

### Output management component (OMC)

De OMC is verantwoordelijk voor de communicatie tussen vakapplicaties en Notify. Deze service ondersteunt contactherstel, wat betekent dat meerdere contactkanalen kunnen worden opgegeven. Bij uitval van een kanaal wordt het volgende kanaal in de prioriteitsvolgorde benaderd. De OMC registreert uitgebreide event-logs, die zowel voor de eindgebruiker als in de vakapplicatie zichtbaar zijn.

Bij een permanent falende reactie van een kanaal pakt de OMC dit ook op. In dat geval verzamelt de OMC de adresgegevens en initieert een call naar een brievendienst, die vervolgens een fysieke brief bezorgt.

### Notify

Notify verstuurt de daadwerkelijke attenderingen en kennisgevingen naar de eindgebruiker, via e-mail, sms en/of brief. De precieze invulling van deze service wordt nog onderzocht; zie hiervoor ook [ADR-0002](/workspace/decisions#2).

### Vakapplicatie

De vakapplicatie simuleert een systeem dat draait bij een externe partij die zakelijke gebruikers moet notificeren, zoals het UWV of de Belastingdienst. In de gemockte variant die wij beschikbaar stellen, is het mogelijk om een paar scenario’s te testen: scenario 2, scenario 8 en scenario 9. Voor meer uitleg over deze scenario’s, zie ook [ADR-0003](/workspace/decisions#3) en Scenario beschrijvingen in dit hoofdstuk.

### Historie service

De historie-service is op dit moment nog grotendeels conceptueel. Deze service wordt verantwoordelijk voor het verzamelen van alle contactmomenten, zodat deze eenvoudig inzichtelijk zijn voor zowel de zakelijke gebruiker als de vakapplicatie. Dit gebeurt op een federatieve manier: de gebruiker logt in bij MijnOverheidZakelijk om zijn contactmomenten te bekijken, waarna de historie-service bij verschillende overheidsinstanties de relevante gegevens ophaalt en aan de gebruiker toont.

### Figma

De meest actuele UX-designs zijn terug te vinden in Figma: [figmalink hier]

### Scenario beschrijvingen

Functionele beschrijving van de werking van onze vakapplicatie: de twee opties worden in de frontend weergegeven als een reeks knoppen.

Voor meer informatie zie [decision scenario bepaling](/workspace/decisions#3)

#### Scenario 2

![Scenario 2 uitgetekend](./images/Scenario2.png "Scenario 2 uitgetekend")

<details>
  <summary>Zie mermaid code</summary>
  
    mermaid
    sequenceDiagram
        actor Medewerker
        Medewerker->>Vakapplicatie:
        activate Vakapplicatie
        Vakapplicatie->>Notificatie service:Verstuur verzoek tot notificatie
        activate Notificatie service
        Notificatie service-->>Vakapplicatie:
        deactivate Vakapplicatie
        Notificatie service-->>Vakapplicatie:Notificatie status update callback
        deactivate Notificatie service
        activate Vakapplicatie
        Vakapplicatie->>Vakapplicatie:Afhandeling callback
        deactivate Vakapplicatie
</details>

#### Scenario 8

![Scenario 8 uitgetekend](./images/Scenario8.png "Scenario 8 uitgetekend")

<details>
  <summary>Zie mermaid code</summary>
    
    mermaid
    sequenceDiagram
        actor Medewerker
        Medewerker->>Vakapplicatie:
        activate Vakapplicatie
        Vakapplicatie->>OMC:Verstuur verzoek tot notificatie
        deactivate Vakapplicatie
        activate OMC
        OMC->>Profiel service:Haal contact inforamtie op o.b.v. kvknummer
        activate Profiel service
        Profiel service-->>OMC:
        deactivate Profiel service
        OMC->>Notificatie service:Verstuur verzoek tot notificatie
        activate Notificatie service
        deactivate OMC

        Notificatie service-->>OMC:Notificatie status update callback
        deactivate Notificatie service
        activate OMC
        alt status = mislukt
            OMC->>Profiel service:Haal adres gegevens op o.b.v. kvknummer
            activate Profiel service
            Profiel service-->>OMC:
            deactivate Profiel service
            OMC->>Notificatie service:Stuur verzoek tot brief
            activate Notificatie service
            Notificatie service-->>OMC:Brief callback
            deactivate Notificatie service
        end
        deactivate OMC
        OMC-->>Vakapplicatie:Optionele callback

</details>
