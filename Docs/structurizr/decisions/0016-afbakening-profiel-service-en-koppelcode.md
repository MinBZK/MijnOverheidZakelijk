# 16. Opslag van Actualiteiten Service-gegevens en identificatie via subject claim

Datum: 2026-04-22

## Status
Proposed

## Gerelateerde ADRs
- [ADR 0006 — Federatieve authenticatie en autorisatie op basis van OIDC en eIDAS](0006-federatieve-authenticatie-en-autorisatie-op-basis-van-oidc-en-eidas.md): authenticatie- en autorisatiemechanisme dat de subject claim levert.
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

### Identificatie van de partij in nevenservices

Deze gegevens moeten nog wel gekoppeld worden aan een persoon/partij op één of andere manier.
Het rechtstreeks opslaan van BSN of KVK-nummer in elke nevenservice is uit oogpunt van dataminimalisatie en AVG onwenselijk.

Omdat authenticatie centraal via Keycloak en de API-gateway verloopt (zie ADR 0006), beschikt iedere nevenservice per request al over een geldig JWT met een stabiele **subject claim** (`sub`). Deze subject claim is een niet-raadbare, pseudonieme identifier per partij; BSN en KVK-nummer blijven daarmee beperkt tot de onderdelen die ze daadwerkelijk nodig hebben. De nevenservice gebruikt de subject claim als sleutel waaronder zij de applicatie-specifieke gegevens van een partij opslaat.

Er is daarmee geen aanvullend koppelmechanisme in de Profiel Service nodig: de subject claim vervult die rol al, zonder extra opzoeking vanuit de nevenservice.

## Decision

1. De Profiel Service blijft verantwoordelijk voor gegevens die generieke, organisatie-overstijgende contact- en communicatievoorkeuren van een partij beschrijven.
2. Voorkeuren en gebruikersgegevens die inherent verbonden zijn aan één specifieke toepassing worden door die toepassing zelf opgeslagen. Voor actualiteiten betekent dit dat postcode-voorkeuren, onderwerpvoorkeuren en favoriete artikelen naar de Actualiteiten Service worden verplaatst.
3. Nevenservices identificeren de ingelogde partij via de subject claim (`sub`) uit het JWT dat via de API-gateway wordt meegegeven. Er wordt geen BSN of KVK-nummer aan nevenservices doorgegeven en er wordt geen aparte koppelcode in de Profiel Service geïntroduceerd.

## Consequences

- Het doel en de scope van de Profiel Service blijven helder afgebakend; het doelbindingskader hoeft niet te worden opgerekt voor applicatie-specifieke gegevens.
- De tijdelijke `PostcodeVoorkeur` en `OnderwerpVoorkeur` verdwijnen uit de Profiel Service.
- Nevenservices hebben geen extra aanroep naar de Profiel Service nodig voor het vaststellen van de identiteit van de gebruiker.
- Nevenservices zijn afhankelijk van de stabiliteit van de subject claim. Als de authenticatieprovider (Keycloak) wijzigt of de subject claim opnieuw wordt uitgegeven, moet er een migratiestrategie voor bestaande records worden bedacht.
- Verwijdering van een partij vereist afstemming tussen services: de subject claim is pseudoniem en wordt door nevenservices zelf beheerd, waardoor opruimen een expliciete actie vereist.
- Dit patroon is herbruikbaar voor toekomstige nevenservices met vergelijkbare gegevensbehoeften.

## Toekomstige overweging: pairwise subject identifiers

Momenteel ontvangt elke nevenservice dezelfde `sub`-waarde voor een gebruiker, omdat de API-gateway één token doorgeeft dat voor alle backends wordt gebruikt. Twee nevenservices kunnen hun gegevens daardoor in principe op basis van `sub` aan elkaar koppelen.

Indien op termijn sterker gepseudonimiseerd moet worden, of als de correlatiegrens tussen onze eigen diensten scherper moet worden getrokken kan Keycloak per OIDC-cliënt een **pairwise subject identifier** uitgeven. In dat model ontvangt iedere cliënt een eigen, niet-linkbare `sub` voor dezelfde gebruiker.

Dat vergt wel dat elke nevenservice een eigen cliëntrelatie met Keycloak heeft, óf dat de gateway per backend een token exchange uitvoert zodat elke service een audience-specifiek token krijgt. De huidige "één-token-voor-alle-backends"-opzet is met pairwise niet meer toereikend.

Deze stap is nu niet nodig, maar is wel een logisch vervolg als het identificatieniveau tussen nevenservices strikter moet worden.
