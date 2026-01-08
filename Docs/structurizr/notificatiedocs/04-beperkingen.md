## Beperkingen

### Inleiding

Deze sectie beschrijft de expliciete randvoorwaarden en beperkingen waarbinnen de Notificatie Service wordt ontworpen en gerealiseerd.
Doel is om gemaakte keuzes en context te borgen en later te kunnen herleiden waarom bepaalde opties zijn overwogen.

### Overzicht

De volgende categorieën beperkingen zijn van toepassing. Per punt noemen we wat de beperking inhoudt, door wie/waarom deze is opgelegd en de impact op de architectuur.

#### Organisatorische en tijd/budget beperkingen
- Betafase: lever een werkende beta met kernfunctionaliteit (aanname, routering, status/callbacks, retries/DLQ) binnen beperkte tijd en middelen. Opgelegd door programma. Impact: focus op ‘must haves’; nice-to-haves en minder gebruikte kanalen worden gefaseerd toegevoegd. Ontwerp blijft uitbreidbaar richting productie.

#### Identiteit, authenticatie en autorisatie
- Service‑to‑service authenticatie via OIDC/OAuth2 verplicht (ADR 0006). Opgelegd door rijksbeleid en interoperabiliteitseisen. Impact: geen eigen credential management; integratie met IDP/token provider bepaalt token‑handling; korte TTL’s en beperkte scopes.
- Scope‑gebaseerde autorisatie voor dienstverleners via FDS; scopes beperken toegang tot minimaal noodzakelijke rechten (least privilege) en doelbinding. Impact: alle API’s moeten scopes/claims afdwingen.

#### Juridisch en compliance
- AVG en LDV‑vereisten (ADR 0007, 0010): auditeerbare gebeurtenissen, transparantie en bewaartermijnen zijn verplicht; geen persoonsgegevens in applicatielogs, alleen referenties/ID’s. Opgelegd door wet‑ en regelgeving. Impact: centrale auditlog, correlatie‑ID’s en idempotentie zijn noodzakelijk; logging wordt gestructureerd ingericht m.b.v LDV.
- Bewijslast/afleverbewijs: afleverstatus en relevante provider‑referenties moeten reproduceerbaar zijn. Impact: eenduidige statusmodellering en opslag van provider‑referenties zonder overtreding dataminimalisatie.

#### Technologiestack en standaarden
- API’s in OpenAPI 3.0+, JSON over HTTPS; gebruik van standaard HTTP‑protocollen. Opgelegd door interoperabiliteit. Impact: geen propriëtaire protocollen; contract‑first ontwikkeling.
- Digitoegankelijk wordt rekening mee gehouden bij het ontwikkelen van front-end zaken. Opgelegd door UX‑kaders Rijksoverheid. Impact: UI‑componentkeuze is beperkt; consistentie en toegankelijkheid worden geborgd.
- Java in combinatie met Quarkus. Opgelegd door beoogde beheerpartij. Impact: minimaal.

#### Integraties en afhankelijkheden
- Afhankelijkheid van kanaalproviders/voorzieningen (bijv. NotifyNL). Opgelegd door functionele doelstelling en bestaande voorzieningen. Impact: beschikbaarheid/performance mede bepaald door externe SLA’s; timeouts, retries, circuit breakers en back‑pressure noodzakelijk.
- Callbackmechanismen zijn provider‑gedreven en niet uniform. Impact: normalisatielaag/adapters nodig; idempotente event‑verwerking en DLQ verplicht.

#### Deploy- en hostingkader
- Uitrol op picard platform van Logius. Opgelegd door beoogde beheerpartij. Impact: keuze voor specifieke PaaS‑diensten of databases kan beperkt zijn; encryptie‑at‑rest en netwerkpolicies volgen platform‑standaard.
- Netwerkbeperkingen: alleen uitgaand verkeer naar whitelisted endpoints. Impact: service discovery en integraties moeten binnen deze restricties werken; egress‑controle en proxy’s waar nodig.

#### Ontwikkelproces en team
- Gedeelde capaciteit met andere deelprojecten (Profiel service, MOZa-Portaal, BBO). Opgelegd door programma. Impact: prioritering op kernflows, gefaseerde oplevering; automatisering (CI/CD, contracttests) is essentieel om snelheid/kwaliteit te borgen.

#### Data, opslag en retentie
- Geen langdurige opslag van berichtinhoud met persoonsgegevens in operationele logs; minimale opslag van status en referenties. Opgelegd door AVG. Impact: design richt op metadata‑opslag en verwijzingen i.p.v. payloads; retentiebeleid afdwingen (auditlogs conform ADR 0005/0007).
- Greenfield start, geen migratie van oude notificatie historiek.

### Waarom deze beperkingen ertoe doen
Beperkingen versnellen ontwerp en implementatie, maar sturen ook de architectuur: 
  - Federatieve auth/scopes vereisen strikte scheiding en dataminimalisatie
  - AVG dwingt auditability en gestructureerde logging
  - Afhankelijkheid van externe providers vereist robuuste integratiepatronen (timeouts, retries, circuit breakers, DLQ) en een eenduidig statusmodel. 
Door deze constraints expliciet te maken, voorkomen we schijnbaar ‘vreemde’ keuzes achteraf.

### Verwijzingen
- ADR 0002 – Notify onderzoek
- ADR 0003 – Scenario bepaling
- ADR 0005 – AuditLog & EventSourcing
- ADR 0006 – Federatieve authenticatie en autorisatie op basis van OIDC en eIDas
- ADR 0007 – Logboek Dataverwerking (LDV)
- ADR 0009 – NL Design System
- ADR 0010 – LDV implementatie
