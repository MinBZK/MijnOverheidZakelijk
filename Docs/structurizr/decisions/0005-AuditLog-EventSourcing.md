# 5. Event Sourcing

Date: 2025-10-05

## Status

Accepted

## Context

Vanuit de business kregen we de vraag om event sourcing te onderzoeken in de context van de Profiel Service, wat momenteel dus alleen een e-mailadres betreft maar in de toekomst meer zou kunnen bevatten.

Hieronder een eenvoudig voorbeeld van hoe de tijdlijn van een profiel er uit zou kunnen zien:  
![Profiel tijdlijn](./images/ProfielTijdlijn.png "Profiel tijdlijn")

<details>
  <summary>Zie mermaid code</summary>

```
mermaid
flowchart TD
    subgraph Profiel Tijdlijn
        E[2025-01-01: ProfielCreated email=1]:::event --> D[2025-02-02: ProfielUpdated email=2]:::event --> C[2025-03-03: ProfielUpdated email=3]:::event --> B[2025-04-04: ProfielDeleted]:::event
    end

    classDef event fill:#e3f2fd,stroke:#2196f3,color:#0d47a1;
```

</details>

### Event Sourcing

Event sourcing is een manier van gegevensopslag waarbij niet de actuele state van een entiteit wordt opgeslagen, maar alle events die tot die state hebben geleid.  
Elke wijziging aan een profiel, bijvoorbeeld het aanpassen van een e-mailadres of toevoegen van een telefoonnummer, wordt vastgelegd als een apart event.  
De actuele state van een profiel wordt dan bepaald door alle events in chronologische volgorde opnieuw toe te passen.

Onderstaande illustratie toont hoe een profiel vanuit de initiële state wordt opgebouwd door het herhalen van events tot de bevraagde versie is bereikt:  
![Event Source Read](./images/EventSourceRead.png "Event Source Read")

<details>
  <summary>Zie mermaid code</summary>

```
mermaid
flowchart TD
    subgraph Event Sourced Voorbeeld
        X[User Requests Profiel at=2025-02-15]:::action
        A[Base Profiel email=1]:::current
        X -->|Load base state| A
        A -->|Apply event 2025-02-02: email updated to 2| B[Reconstructed Profiel email=2]
    end

    classDef current fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20;
    classDef action fill:#fff9c4,stroke:#fbc02d,color:#f57f17;
```

</details>

### Audit Logging

Audit logging daarentegen legt de wijzigingen vast ten opzichte van de huidige state, grootendeels voor audit- of compliance-doeleinden.  
De primaire opslag blijft de actuele state van het profiel, terwijl de audit log enkel dient voor naspeurbaarheid en historische reconstructie wanneer nodig.

Het verschil met event sourcing is dat audit logging niet bedoeld is om de actuele state telkens opnieuw op te bouwen, maar om een historische reconstructie mogelijk te maken wanneer dat gevraagd wordt.  
Dit kan bijvoorbeeld door middel van een reverse delta read, zoals hieronder geïllustreerd:  
![Reverse Read Voorbeeld](./images/ReverseDeltaRead.png "Reverse Read Voorbeeld")

Een reverse delta read betekent het toepassen van de opgeslagen audit logs in volgorde van nieuwste eerst, tot aan de datum die de ondernemer of toezichthouder heeft opgegeven.  
Hiermee kan de state van een profiel op een eerder moment worden herleid, zonder dat het volledige eventverloop hoeft te worden opgebouwd.

<details>
  <summary>Zie mermaid code</summary>

```
mermaid
flowchart TD
    subgraph Reverse Read Voorbeeld
        X[User requests Profiel at=2025-02-15]:::action
        A[Current Profiel email=3]:::current
        X -->|Load current state| A
        A -->|Apply reverse deltas: undo 2025-04-04 & 2025-03-03| Y[Reconstructed Profiel email=2]
    end

    classDef current fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20;
    classDef action fill:#fff9c4,stroke:#fbc02d,color:#f57f17;
```

</details>

## Decision

Na het afwegen van beide scenario’s hebben we geconcludeerd dat Audit Logging op dit moment geschikter is, maar we blijven de toekomst in het oog houden, waarin een uitgebreidere profielservice mogelijk meer voordeel haalt uit event sourcing.
De belangrijkste reden is dat bijna elke use case enkel de laatste versie van het profiel nodig heeft.  
Bij Event Sourcing zou dan telkens opnieuw het hele profiel moeten worden opgebouwd, wat onnodige complexiteit en performancekosten met zich meebrengt voor de huidige schaal en scope.

## Consequences

- We implementeren Audit Logging als eerste stap, inclusief ondersteuning voor reverse reads, zodat historische reconstructie mogelijk blijft.
- De architectuur wordt zodanig opgezet dat een eventuele migratie naar Event Sourcing in de toekomst niet wordt uitgesloten.
- Voor nu blijft de Profiel Service state-based met audit trail.
