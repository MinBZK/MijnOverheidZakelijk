## Beperkingen

### Inleiding

Deze sectie beschrijft de expliciete randvoorwaarden en beperkingen waarbinnen de Notificatiedienst wordt ontworpen en gerealiseerd.
Doel is om gemaakte keuzes en context te borgen en later te kunnen herleiden waarom bepaalde opties zijn overwogen.

### Overzicht

De volgende categorieën beperkingen zijn van toepassing. Per punt noemen we wat de beperking inhoudt, door wie/waarom deze is opgelegd en de impact op de architectuur.

#### Organisatorische en tijd/budget beperkingen
- PoC-fase: lever een werkend proof-of-concept met kernfunctionaliteit (aanname, verzending via NotifyNL, statusterugkoppeling) binnen beperkte tijd en middelen. Opgelegd door programma. Impact: focus op ‘must haves’; contactherstel en aanvullende kanalen volgen gefaseerd. Ontwerp blijft uitbreidbaar richting productie.

#### Identiteit, authenticatie en autorisatie
- Service-to-service authenticatie via OIDC/OAuth2 verplicht (ADR 0006). Opgelegd door rijksbeleid en interoperabiliteitseisen. Impact: geen eigen credential management; integratie met IDP/token provider bepaalt token-handling; korte TTL’s en beperkte scopes.
- Scope-gebaseerde autorisatie voor dienstverleners; scopes beperken toegang tot minimaal noodzakelijke rechten (least privilege) en doelbinding. Impact: de API’s dwingen scopes/claims af zodra het koppelvlak federatief wordt ontsloten.

#### Juridisch en compliance
- AVG en LDV-vereisten (ADR 0007, 0010): auditeerbare gebeurtenissen, transparantie en bewaartermijnen zijn verplicht; geen persoonsgegevens in applicatielogs, alleen referenties/ID’s. Opgelegd door wet- en regelgeving. Impact: verwerkingslogging, referenties en idempotentie zijn noodzakelijk; logging wordt gestructureerd ingericht m.b.v. LDV.
- Bewijslast/afleverbewijs: afleverstatus en relevante NotifyNL-referenties moeten reproduceerbaar zijn. Impact: eenduidige statusmodellering en opslag van referenties zonder overtreding van dataminimalisatie.

#### Technologiestack en standaarden
- API’s in OpenAPI 3.0+, JSON over HTTPS; gebruik van standaard HTTP-protocollen. Opgelegd door interoperabiliteit. Impact: geen propriëtaire protocollen; contract-first ontwikkeling.
- Java in combinatie met Quarkus. Opgelegd door beoogde beheerpartij. Impact: minimaal.

#### Integraties en afhankelijkheden
- Afhankelijkheid van NotifyNL als verzendvoorziening. Opgelegd door functionele doelstelling. Impact: beschikbaarheid en afleversnelheid mede bepaald door de SLA van NotifyNL; timeouts en expliciete foutafhandeling noodzakelijk.
- De afleverstatus komt asynchroon binnen via delivery receipts van NotifyNL. Impact: idempotente callback-verwerking en een register dat de status aan de juiste aanvraag koppelt.
- E-mail biedt geen volledige afleverzekerheid: mailsystemen melden fouten niet altijd terug. Impact: aflevering bij de mailserver geldt als succes, tenzij die een fout teruggeeft (zoals een volle mailbox of een niet-bestaand adres); opvolging is belegd bij contactherstel en de dienstverlener.

#### Deploy- en hostingkader
- Productie gaat bij Logius draaien. Impact: platformstandaarden van Logius bepalen o.a. secrets, netwerkpolicies en encryptie-at-rest.
- Voor ontwikkeling en previews wordt ZAD gebruikt (zie hoofdstuk 10).
- Netwerkbeperkingen: alleen uitgaand verkeer naar whitelisted endpoints. Impact: service discovery en integraties moeten binnen deze restricties werken; egress-controle en proxy’s waar nodig.

#### Ontwikkelproces en team
- Gedeelde capaciteit met andere deelprojecten (Profiel service, MOZa-Portaal, BBO). Opgelegd door programma. Impact: prioritering op kernflows, gefaseerde oplevering; automatisering (CI/CD, contracttests) is essentieel om snelheid/kwaliteit te borgen.

#### Data, opslag en retentie
- Geen opslag van berichtinhoud of contactgegevens; minimale opslag van status en referenties, waarbij registraties na afronding worden verwijderd. Opgelegd door AVG. Impact: design richt zich op metadata-opslag en verwijzingen i.p.v. payloads.
- Greenfield start, geen migratie van oude notificatie historiek.

### Waarom deze beperkingen ertoe doen
Beperkingen versnellen ontwerp en implementatie, maar sturen ook de architectuur:
  - Federatieve auth/scopes vereisen strikte scheiding en dataminimalisatie
  - AVG dwingt auditability en gestructureerde logging
  - Afhankelijkheid van NotifyNL vereist robuuste integratiepatronen (timeouts, retries, idempotente callback-verwerking) en een eenduidig statusmodel.
Door deze constraints expliciet te maken, voorkomen we schijnbaar ‘vreemde’ keuzes achteraf.

### Verwijzingen
- ADR 0002 – Notify onderzoek
- ADR 0005 – AuditLog & EventSourcing
- ADR 0006 – Federatieve authenticatie en autorisatie op basis van OIDC en eIDas
- ADR 0007 – Logboek Dataverwerking (LDV)
- ADR 0010 – LDV implementatie
- ADR 0020 – Standaard afleverstatus terugkoppeling
- ADR 0021 – Twee regie-modellen in plaats van de scenario's 2, 8 en 9
