# 11. Positionering en gebruik van Profiel Service

Date: 2025-12-12

## Status

Proposed

## Context

Bij de uitwerking van de eerste alfa-versie van de Profiel Service, moet naast naar requirements van de organisaties ook gekeken worden naar aan welke randvoorwaarden een eventuele MVP zou moeten voldoen. Daar komt ook de doelbinding bij kijken en daarbij moeten we voldoen aan de AVG.

We hebben twee variaties waarop de Profiel Service beschikbaar gesteld kan worden aan overheidsorganisaties.

### Optie 1: Profiel Service als Centraal register

Wanneer we de Profiel Service beschikbaar stellen als centraal register waar overheidsorganisaties op aansluiten, is er sprake van het verstrekken van persoonsgegevens. Dit zou kunnen als de burger of ondernemer zijn of haar gegevens zelf in de Profiel Service heeft ingevuld, met als doel via deze contactvoorkeuren te kunnen worden benaderd door overheidsorganisaties.

### Diagram: Profiel Service als centraal register

**LET OP: AANPASSEN NOG!!!**
```mermaid
sequenceDiagram
    participant Dienstverlener@{"type" : "collections"}
    participant OMC as Output Management Component
    participant PS as Profiel Service
    participant NS as Notificatie Service
    actor BO as Burger of Ondernemer

    Dienstverlener ->> OMC: Stuurt notificatiebericht + identificatienummer
    OMC ->> PS: Stuurt identificatienummer
    PS -->> OMC: Levert contactvoorkeuren
    OMC ->> NS: Stuurt notificatiebericht + voorkeurskanaal
    NS ->> BO: Stuurt bericht via voorkeurskanaal
    NS -->> OMC: Status aflevering (OK/NOK)
    OMC -->> Dienstverlener: Status aflevering (OK/NOK)
```

Om dit te toetsen, dienen we deze optie voor te leggen bij juridisch adviseurs. Hiervoor is bijgevoegd doelbinding document opgesteld, waarin is beschreven wie, welke gegevens met welk doel kan raadplegen en hoe we ervoor zorgen dat dit veilig gebeurt.

- [Doelbinding - Profiel Service als centraal register](./addendum/0011-BIJL1-doelbinding-profiel-service-als-centraal-register.md)

### Optie 2: Profiel Service als onderdeel van de Overheidsbrede Notificatie Dienst (OND)

Wanneer we de Profiel Service niet opzichzelfstaand beschikbaar stellen, maar als onderdeel van de overheidsbrede notificatie dienst, zorgen we ervoor dat persoonsgegevens niet buiten deze omgeving worden gedeeld.


### Diagram Profiel Service als onderdeel van Overheidsbrede Notificatie Dienst (OND)

```mermaid
sequenceDiagram
    participant Dienstverlener@{"type" : "collections"}
    participant OMC as Output Management Component
    participant PS as Profiel Service
    participant NS as Notificatie Service
    actor BO as Burger of Ondernemer

    Dienstverlener ->> OMC: Stuurt notificatiebericht + identificatienummer
    OMC ->> PS: Stuurt identificatienummer
    PS -->> OMC: Levert contactvoorkeuren
    OMC ->> NS: Stuurt notificatiebericht + voorkeurskanaal
    NS ->> BO: Stuurt bericht via voorkeurskanaal
    NS -->> OMC: Status aflevering (OK/NOK)
    OMC -->> Dienstverlener: Status aflevering (OK/NOK)
```


## Decision

Nog geen beslissing genomen.

## Consequences

Beide opties hebben plus- en minpunten. Hieronder zetten we deze uiteen;


