## Beperkingen

### Inleiding

Deze sectie beschrijft de expliciete randvoorwaarden en beperkingen waarbinnen de Profiel Service wordt ontworpen en gerealiseerd.
Doel is om gemaakte keuzes en context te borgen en later te kunnen herleiden waarom bepaalde opties zijn overwogen.

### Overzicht

De volgende categorieën beperkingen zijn van toepassing. Per punt noemen we wat de beperking inhoudt, door wie/waarom deze is opgelegd en de impact op de architectuur.

#### Organisatorische en tijd/budget beperkingen
- Betafase: lever een werkende beta met kernfunctionaliteit binnen beperkte tijd en middelen. Opgelegd door programma. Impact: focus op ‘must haves’; nice-to-haves. Systeem is uitbreidbaar richting productie, maar implementeert in de beta een minimale set.

#### Identiteit, authenticatie en autorisatie
- Verplicht ondersteuning van federatieve authenticatie (DigiD, eHerkenning, eIDas) en OIDC/OAuth2 (ADR 0006). Opgelegd door rijksbeleid en interoperabiliteitseisen en benodigde gebruikersinformatie. Impact: eigen credential management is uitgesloten; integratie met IDP’s bepaalt login-flows en token-handling. Voor betafase waarschijnlijk alleen eHerkenning.
- Scope-gebaseerde autorisatie voor dienstverleners via FDS; scopes beperken toegang tot de minimaal noodzakelijke rechten (least privilege), bijvoorbeeld read-only waar van toepassing. Opgelegd door architectuurkader; alle API’s moeten scopes/claims afdwingen.

#### Juridisch en compliance
- AVG toepasselijke logging/LDV-vereisten (ADR 0007, 0010). Opgelegd door wet- en regelgeving. Impact: auditeerbare gebeurtenissen, transparantie en bewaartermijnen zijn verplicht, persoonlijk identificeerbare informatie in logging vermijden.
- Gebruik van KvK-gegevens conform betreffende API-voorwaarden. Impact: caching/bewaren van externe gegevens is ingezet, met beperkingen, en aan voorwaarden gebonden.

#### Technologiestack en standaarden
- API’s in OpenAPI 3.0+, JSON over HTTPS; gebruik van standaard HTTP-protocollen. Impact: geen propriëtaire protocol keuzes.

#### Integraties en afhankelijkheden
- Afhankelijkheid van externe stelsels/voorzieningen: IDP’s (DigiD/eHerkenning/eIDas), KvK, LDV/FDS. Opgelegd door functionele doelstellingen. Impact: beschikbaarheid en performance worden mede bepaald door externe SLA’s; timeouts, retries en circuit breakers zijn nodig.
TODO Willen wij hiervoor circuit breakers gebruiken?

#### Deploy- en hostingkader
- Uitrol op een standaard overheidscloud/infrastructuur met centrale voorzieningen (logging, monitoring, secret management). Opgelegd door hostingpartij/beheer. Impact: keuze voor specifieke PaaS-diensten of databases kan beperkt zijn; encryptie-at-rest en netwerkpolicies volgen platform-standaard.
- Netwerkbeperkingen: alleen uitgaand verkeer naar whitelisted endpoints (bijv. KvK, IDP’s). Impact: service discovery en integraties moeten binnen deze restricties werken.

#### Ontwikkelproces en team
- Uitgebreid team, maar gedeelde capaciteit met andere deelprojecten. Opgelegd door programma. Impact: prioritering op kerndoelen, gefaseerde oplevering. Automatisering (CI/CD, tests) is essentieel om snelheid/kwaliteit te borgen.

#### Data en migratie
- Geen migratie van historisch profielmateriaal uit legacy. Opgelegd door scopebeperking. Impact: betafase start ‘greenfield’; koppeling aan bestaande datasets gebeurt via bronverificatie (b.v. KvK). Potentiële datamigratie naar productie wordt onderzocht in overleg met de betrokken dienstverleners, om te bepalen of deze technisch haalbaar is en of het meerwaarde biedt.

### Waarom deze beperkingen ertoe doen
- Beperken van keuzes versnelt ontwerp en implementatie, maar stuurt ook de architectuur: federatieve auth en FDS-scopes vereisen strikte scheiding van verantwoordelijkheden en dataminimalisatie; LDV/AVG dwingt auditability en logging-architectuur; hosting- en netwerkstandaarden bepalen integratiepatronen (API-gateway, TLS, secrets). Door deze constraints expliciet te maken, voorkomen we schijnbaar ‘vreemde’ keuzes achteraf.

### Verwijzingen
- ADR 0005 – AuditLog & EventSourcing
- ADR 0006 – Federatieve authenticatie en autorisatie op basis van OIDC en eIDas
- ADR 0007 – Logboek dataverwerking (LDV)
- ADR 0009 – NL Design System
- ADR 0010 – LDV implementatie

