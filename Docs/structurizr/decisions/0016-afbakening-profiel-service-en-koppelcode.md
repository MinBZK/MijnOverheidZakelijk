# 16. Opslag van Actualiteiten Service-gegevens en introductie van een koppelcode

Datum: 2026-04-14

## Status
Proposed

## Gerelateerde ADRs
- [ADR 0011 — Positionering en gebruik van Profiel Service](0011-positionering-en-gebruik-van-profiel-service.md): positionering, doel en doelbinding van de Profiel Service.

## Context

Binnen MOZa worden steeds meer gepersonaliseerde functies ontwikkeld. Voor de functionaliteit rondom actualiteiten (artikelen, subsidies, wetswijzigingen, "Berichten in uw buurt") hebben we aanvankelijk voorkeuren zoals `PostcodeVoorkeur` en `OnderwerpVoorkeur` tijdelijk in de Profiel Service ondergebracht, omdat daar al een voorkeurmechanisme beschikbaar was.

Inmiddels ontstaat er meer gegevensbehoefte rondom actualiteiten: naast postcode- en onderwerpvoorkeuren willen we ook gemarkeerde (favoriete) artikelen en mogelijk verdere applicatie-specifieke gebruikerscontext opslaan. Dat dwingt tot een principiëlere vraag: horen deze gegevens wel in de Profiel Service thuis?

De conclusie is dat ze dat niet doen. De Profiel Service heeft als doel het vastleggen van contact- en communicatievoorkeuren van een partij die organisatie-overstijgend gebruikt kunnen worden. De voorkeuren rondom actualiteiten zijn geen generieke contactvoorkeuren, maar zijn inherent verbonden aan de functionaliteit van één specifieke toepassing: de Actualiteiten Service. Ze hebben buiten die toepassing geen betekenis en passen daarmee niet binnen de scope en het doelbindingskader van de Profiel Service.

### Indeling van gegevens per service

| Gegeven             | Thuishorend in        | Reden                                            |
|---------------------|-----------------------|--------------------------------------------------|
| Postcode-voorkeur   | Actualiteiten Service | Voorkeur uitsluitend relevant voor actualiteiten |
| Onderwerp-voorkeur  | Actualiteiten Service | Voorkeur uitsluitend relevant voor actualiteiten |
| Favoriete artikelen | Actualiteiten Service | Applicatie-specifiek gebruikersgedrag            |

### Koppelcode op de partij

Deze gegevens moeten nog wel gekoppeld worden aan een persoon/partij op één of andere manier.
Dit zou kunnen door het BSN direct in de Actualiteiten Service op te slaan, maar het rechtstreeks doorgeven van BSN of KVK-nummer aan elke nevenservice is uit oogpunt van dataminimalisatie en AVG onwenselijk.

Om dit op te lossen introduceert de Profiel Service een **koppelcode** op de `partijen`-tabel: een stabiele, niet-raadbare identifier die per partij wordt uitgegeven.
Nevenservices zoals de Actualiteiten Service slaan hun gegevens op onder deze koppelcode. De koppelcode fungeert zo indirect als een zachte verwijzing naar de persoon, maar de onderliggende databases blijven fysiek gescheiden.

## Decision

1. De Profiel Service blijft verantwoordelijk voor gegevens die generieke, organisatie-overstijgende contact- en communicatievoorkeuren van een partij beschrijven.
2. Voorkeuren en gebruikersgegevens die inherent verbonden zijn aan één specifieke toepassing worden door die toepassing zelf opgeslagen. Voor actualiteiten betekent dit dat postcode-voorkeuren, onderwerpvoorkeuren en favoriete artikelen naar de Actualiteiten Service worden verplaatst.
3. De Profiel Service voegt een `koppelcode` toe aan de `partijen`-tabel. Nevenservices refereren aan een partij via deze koppelcode, zonder kennis van BSN of KVK-nummer.

## Consequences

- Het doel en de scope van de Profiel Service blijven helder afgebakend; het doelbindingskader hoeft niet te worden opgerekt voor applicatie-specifieke gegevens.
- De tijdelijke `PostcodeVoorkeur` en `OnderwerpVoorkeur` verdwijnen uit de Profiel Service.
- De Profiel Service krijgt een nieuw veld `koppelcode` op de `partijen`-tabel, dat bij het aanmaken van een partij gegenereerd wordt.
- Nevenservices halen via de Profiel Service de koppelcode van de ingelogde partij op voordat zij applicatie-specifieke gegevens kunnen opslaan of uitlezen. Dit patroon passen we toe op onze eigen nevenservices; externe nevenservices maken hierin hun eigen afweging.
- Bij aanpassingen moet de Profiel Service erop letten dat andere partijen afhankelijk zijn van de koppelcode.
- Verwijdering van een partij vereist afstemming tussen services.
- Dit patroon is herbruikbaar voor toekomstige nevenservices met vergelijkbare gegevensbehoeften.
