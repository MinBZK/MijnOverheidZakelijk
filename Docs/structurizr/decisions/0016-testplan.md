# 16. Testplan MOZa

Datum: 2026-04-09

## Status

Proposed

## Context

Wijzigingen aan MOZa-services moeten gevalideerd worden vóór en na het mergen naar `main`. Er was geen vastgelegd testbeleid: het was onduidelijk welke testsoorten wanneer worden ingezet, wie waarvoor verantwoordelijk is en hoe bevindingen worden opgepakt. Dit leidde tot inconsistentie in de manier waarop wijzigingen worden gevalideerd.

Dit testplan dekt:
- Review vóór merge (inclusief een korte functionele check door de reviewer).
- Geautomatiseerde unit- en integratietests in de CI/CD-pipeline.
- Post-deploy validatie in de doelomgeving (smoke- en regressietests).
- User Acceptance Tests (UAT) bij wijzigingen met functionele impact.
- Ketentests bij wijzigingen aan integratiepunten of API-contracten.
- Performance- en loadtests bij wijzigingen met mogelijke impact op prestaties.
- Fuzzing tests in de CI/CD-pipeline bij wijzigingen aan inputverwerking of API-interfaces.

Scope: alle wijzigingen die via Pull Requests (PR's) richting `main` gaan, inclusief code, configuratie en documentatie.

Niet in scope:
- De werkwijze voor meerdere omgevingen; momenteel is er één gedeelde omgeving die dev/test/prod combineert.

## Decision

### Testsoorten en dekking

Niet alle testsoorten zijn verplicht voor elke wijziging; inzet van testtypen is risicogedreven en afhankelijk van de aard van de wijziging.

- **Unit tests** — Dekken businesslogica, datamapping, foutafhandeling en validatie. Minimale dekking: projectnorm _nader te bepalen_ % coverage.
- **Integratietests** — Valideren endpoints of repositories via het testframework van de betreffende service (bijv. Quarkus-testframework met in-memory database).
- **Ketentests** — Valideren dat de service correct samenwerkt met afhankelijke en consumerende systemen. Gericht op end-to-end scenario's over meerdere systemen. Uitgevoerd bij wijzigingen aan API-contracten, datamodellen of integratiegedrag, in samenwerking met betrokken teams. Niet standaard onderdeel van elke wijziging; inzet is risicogedreven.
- **Smoke tests** — Korte, snelle tests om te verifiëren dat de applicatie functioneel beschikbaar is in de doelomgeving. Gericht op kernfunctionaliteit.
- **Regressietests** — Controleren dat bestaande functionaliteit correct blijft functioneren na een wijziging. Gericht op kernscenario's en bekende risicogebieden. Uitgevoerd na deployment, handmatig en/of met automatisering. Regressietests groeien op basis van risico en eerdere defecten, niet op basis van elke wijziging.
- **User Acceptance Tests (UAT)** — Valideren dat functionele wijzigingen voldoen aan acceptatiecriteria en businessverwachtingen. Alleen bij wijzigingen met zichtbare functionele impact. Uitgevoerd door Product Owner of business stakeholder, gefaciliteerd door Tester.
- **Performance- en loadtests** — Valideren dat de service voldoet aan prestatieeisen. Niet standaard; inzet is risicogedreven.
- **Fuzzing tests** — Testen de robuustheid door het aanbieden van ongeldige, onverwachte of gemanipuleerde input. Geautomatiseerd uitgevoerd in de CI/CD-pipeline via GitHub Actions.

### Rollen en verantwoordelijkheden

- **Ontwikkelaar:**
    - Maakt de PR en beschrijft wijziging, risico's en testnotities.
    - Is verantwoordelijk voor volledige testdekking met unit-, integratie-, regressie- en fuzzing tests.
    - Is verantwoordelijk voor deployment naar de doelomgeving.
    - Verifieert technisch dat de uitrol correct is verlopen.
- **Reviewer:**
    - Voert code review uit (kwaliteit, security, performance, onderhoudbaarheid).
    - Voert een korte functionele check uit (handmatig of via lokale run) op de belangrijkste paden.
    - Keurt goed of vraagt aanpassingen.
- **CI/CD:**
    - Voert geautomatiseerde checks uit en bewaakt kwaliteitspoorten (build, linting, tests, coverage).
    - Voert smoke- en regressietests uit na deployment.
    - Voert fuzzing tests uit gericht op robuustheid en security.
- **Tester:**
    - Faciliteert en coördineert ketentests met betrokken teams.
    - Faciliteert User Acceptance Tests (UAT).
    - Voert performance- en loadtests uit.

### Procesoverzicht

1. **Voorbereiding PR**
    - Beschrijf doel, impact, risico's en eventuele migraties.
    - Voeg unit-, regressie-, integratie- en fuzzing tests toe of pas deze aan voor gewijzigde logica.
    - Lokale checks: build, CI/CD-checks, functionele wijzigingen getest, alle tests geslaagd.

2. **Code review en functionele check**
    - Beoordeel codekwaliteit (leesbaarheid, consistentie, foutafhandeling, logging, databeveiliging).
    - Verifieer dat relevante edge cases zijn afgedekt met tests.
    - Voer indien nodig een beknopte handmatige check uit: start de service lokaal en doorloop 1–3 relevante paden.
    - Gebruik de review-checklist (zie hieronder).

3. **CI/CD-pipeline**
    - Trigger: openen of bijwerken van een PR.
    - Stappen: build en dependency resolution, unit tests met rapportage en coverage, integratietests, fuzzing tests, linting, security- en dependency-scan.
    - Kwaliteitspoorten: build slaagt, alle unit-/integratie-/fuzzing tests slagen, coverage ≥ _nader te bepalen_ %.

4. **Merge naar `main`**
    - Voorwaarden: minimaal één reviewer approval en een geslaagde CI/CD-pipeline.

5. **Deployment naar doelomgeving**
    - Automatische deployment naar de gedeelde omgeving.

6. **Post-deploy validatie**
    - CI/CD voert smoke tests uit op 2–5 kernscenario's.
    - CI/CD voert een regressietest uit op relevante kernfunctionaliteit.
    - Bevindingen worden teruggekoppeld aan de ontwikkelaar: direct oplossen, of registreren als issue met referentie naar PR/commit en omgeving.
    - Bij blockers: rollback of hotfix conform afgesproken releaseproces (_releasebeleid nader vast te stellen_).

7. **User Acceptance Test** (indien van toepassing)
    - Uitgevoerd bij functionele wijzigingen met gebruikers- of businessimpact.
    - Validatie op basis van vooraf vastgestelde acceptatiecriteria.
    - Bevindingen worden teruggekoppeld en opgevolgd via issue-tracking.

8. **Ketentest** (indien van toepassing)
    - Uitgevoerd bij wijzigingen met impact op integraties of afnemende systemen.
    - End-to-end validatie over de betrokken services.
    - Bevindingen worden teruggekoppeld en opgevolgd via issue-tracking.

9. **Performance- en loadtests** (indien van toepassing)
    - Uitgevoerd bij wijzigingen met mogelijke impact op prestaties of schaalbaarheid.
    - Resultaten worden beoordeeld en eventuele bevindingen opgevolgd via issue-tracking.

10. **Fuzzing tests**
    - Geautomatiseerd uitgevoerd in de CI/CD-pipeline via GitHub Actions.
    - Resultaten worden beoordeeld en eventuele bevindingen opgevolgd via issue-tracking.

### Acceptatiecriteria per fase

- **Voor merge:** PR goedgekeurd door reviewer(s), CI/CD-pipeline geslaagd.
- **Na deployment:** Smoke tests geslaagd zonder blockers. Eventuele non-blocker bevindingen zijn teruggekoppeld of geregistreerd met follow-up.

### Review-checklist (te gebruiken door reviewer)

- Documentatie is aanwezig en duidelijk.
- Codekwaliteit: consistente naamgeving, foutafhandeling en logging.
- Security & privacy: geen gevoelige data in logs, invoervalidatie op orde, afhankelijkheden actueel.
- Tests: relevante unit-, integratie-, regressie- en fuzzing tests toegevoegd of aangepast; nieuwe en gewijzigde paden afgedekt.
- Functionele check van kritieke paden uitgevoerd.
- CI/CD: alle checks geslaagd en kwaliteitspoorten gehaald.

### Terugkoppeling en opvolging van bevindingen

- Bevindingen tijdens review of CI/CD: terugkoppelen aan de ontwikkelaar met duidelijke reproductiestappen.
- Bevindingen tijdens post-deploy validatie: terugkoppelen aan de ontwikkelaar en in overleg bepalen: directe fix/hotfix, rollback of opvolging in een volgende release via een nieuwe issue.

### Versiebeheer en wijzigingsbeheer

- Elke wijziging verloopt via een PR met referentie naar een issue of ticket.
- Merge naar `main` alleen na het voldoen aan de acceptatiecriteria.

## Consequences

- Alle teamleden volgen hetzelfde testproces bij wijzigingen, wat consistentie en kwaliteit bevordert.
- Ontwikkelaars zijn verantwoordelijk voor volledige testdekking, niet alleen basisdekking.
- Smoke-, regressie- en fuzzing tests draaien geautomatiseerd in CI/CD, waardoor handmatige testlast afneemt.
- De tester-rol verschuift naar het faciliteren van ketentests, UAT en performance-/loadtests.
- Bij opschaling kan dit plan worden uitgebreid met meerdere omgevingen (development, staging, productie) en feature branch deployments.
- Releasebeleid is nog nader vast te stellen; dit ADR verwijst ernaar maar definieert het niet.
