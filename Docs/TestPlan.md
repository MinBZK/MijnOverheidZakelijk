## 1. Doel en scope
Dit testplan beschrijft hoe wijzigingen aan de moza-profiel-service worden gevalideerd vóór en na het mergen naar `main`. 
Het plan dekt:
- Review vóór merge (inclusief een korte functionele check door de reviewer).
- Geautomatiseerde unit tests in de CI/CD-pipeline.
- Post-deploy validatie in de doelomgeving (smoke- en regressietests).
- User Acceptance Tests (UAT) bij wijzigingen met functionele impact.
- Ketentests bij wijzigingen aan integratiepunten of API-contracten.
- Performance- en loadtests bij wijzigingen met mogelijke impact op prestaties.
- Fuzzing tests bij wijzigingen aan inputverwerking of API-interfaces.


Scope: alle wijzigingen die via Pull Requests (PR’s) richting `main` gaan, inclusief code, configuratie en documentatie.

Niet in scope:
- De werkwijze voor meerdere omgevingen; momenteel is er één gedeelde omgeving
  die dev/test/prod combineert.


---

## 2. Rollen en verantwoordelijkheden
- Ontwikkelaar:
    - Maakt de PR en beschrijft wijziging, risico’s en testnotities.
    - Zorgt voor minimale basisdekking met unit tests en een succesvolle lokale build.
    - Is verantwoordelijk voor deployment naar de doelomgeving.
    - Verifieert technisch dat de uitrol correct is verlopen.
- Reviewer:
    - Voert code review uit (kwaliteit, security, performance, onderhoudbaarheid).
    - Voert een korte functionele check uit (handmatig of via lokale run) op de belangrijkste paden.
    - Keurt goed of vraagt aanpassingen.
- CI/CD:
    - Voert geautomatiseerde checks uit en bewaakt kwaliteitspoorten (build, linting, tests, coverage).
- Tester:
    - Voert smoke en regressietests uit na deployment.
    - Faciliteert en coördineert ketentests met betrokken teams.
    - Faciliteert User Acceptance Tests (UAT).
    - Voert performance en load tests uit.
    - Voert fuzzing tests uit gericht op robuustheid en security.

---

## 3. Procesoverzicht
1) Voorbereiding PR
    - Beschrijf doel, impact, risico’s en eventuele migraties.
    - Voeg unit tests toe of pas deze aan voor gewijzigde logica.
    - Lokale checks: build, functionele wijzigingen getest, unit tests geslaagd.

2) Code review en functionele check
    - Beoordeel codekwaliteit (leesbaarheid, consistentie, foutafhandeling, logging, databeveiliging).
    - Verifieer dat relevante edge cases zijn afgedekt met tests.
    - Voer indien nodig een beknopte handmatige check uit:
        - Start de service lokaal.
        - Doorloop 1–3 relevante paden.
    - Gebruik de checklist in #6.

3) CI/CD-pipeline
    - Trigger: openen of bijwerken van een PR.
    - Stappen:
        - Build en dependency resolution.
        - Uitvoeren van unit tests met rapportage en coverage.
        - Linting.
        - Security- en dependency-scan.
    - Kwaliteitspoorten:
        - Build slaagt.
        - Alle unit tests slagen.
        - Coverage ≥ x%.

4) Merge naar `main`
    - Voorwaarden: minimaal één reviewer approval en een geslaagde CI/CD-pipeline.

5) Deployment naar doelomgeving
    - Automatische deployment naar de gedeelde omgeving.

6) Post-deploy validatie
    - Tester voert smoke tests uit op 2–5 kernscenario’s.
    - Tester voert een regressietest uit op relevante kernfunctionaliteit.
    - Bevindingen worden teruggekoppeld aan de ontwikkelaar:
        - Direct oplossen, of
        - Registreren als issue met referentie naar PR/commit en omgeving.
    - Bij blockers: rollback of hotfix conform releasebeleid.

7) User Acceptance Test (indien van toepassing)
    - Uitgevoerd bij functionele wijzigingen met gebruikers of businessimpact.
    - Validatie op basis van vooraf vastgestelde acceptatiecriteria.
    - Bevindingen worden teruggekoppeld en opgevolgd conform defectbeheer.

8) Ketentest (indien van toepassing)
    - Uitgevoerd bij wijzigingen met impact op integraties of afnemende systemen.
    - End-to-end validatie over de betrokken services.
    - Bevindingen worden teruggekoppeld en opgevolgd conform defectbeheer.

9) Performance en fuzzing tests (indien van toepassing)
    - Uitgevoerd bij wijzigingen met mogelijke impact op prestaties, stabiliteit of beveiliging.
    - Resultaten worden beoordeeld en eventuele bevindingen opgevolgd conform defectbeheer.


---

## 4. Testsoorten en dekking
Niet alle testsoorten zijn verplicht voor elke wijziging; inzet van testtypen is risicogedreven en afhankelijk van de aard van de wijziging.

- Unit tests:
    - Dekken businesslogica, datamapping, foutafhandeling en validatie.
    - Minimale dekking: projectnorm x% coverage.
- Integratietests:
    - Valideren endpoints of repositories via het Quarkus-testframework met een in-memory database.
- Ketentests:
    - Valideren dat de service correct samenwerkt met afhankelijke en consumerende systemen.
    - Gericht op end-to-end scenario’s over meerdere systemen binnen de keten.
    - Uitgevoerd bij wijzigingen aan API-contracten, datamodellen of integratiegedrag.
    - Uitgevoerd in samenwerking met betrokken teams.
    - Niet standaard onderdeel van elke wijziging; inzet is risicogedreven. 
- Smoke tests:
    - Korte, snelle tests om te verifiëren dat de applicatie functioneel beschikbaar is in de doelomgeving.
    - Gericht op kernfunctionaliteit.
- Regressietests:
    - Controleren dat bestaande, eerder werkende functionaliteit correct blijft functioneren na een wijziging.
    - Gericht op kernscenario’s en bekende risicogebieden.
    - Uitgevoerd na deployment, handmatig en/of met automatisering.
    - Uitbreiding van regressietests:
      - Nieuwe regressietests worden toegevoegd bij:
          - Opgeloste bugs in bestaande functionaliteit.
          - Productie issues of incidenten.
          - Wijzigingen met verhoogd risico op impact op kernfunctionaliteit.
      - Regressietests worden niet standaard uitgebreid bij:
          - Volledig nieuwe, geïsoleerde functionaliteit.
          - Technische wijzigingen zonder functionele impact.
      - Regressietests groeien op basis van risico en eerdere defecten, niet op basis van elke wijziging.
- User Acceptance Tests (UAT):
    - Valideren dat functionele wijzigingen voldoen aan afgesproken acceptatiecriteria en business verwachtingen.
    - Gericht op het perspectief van gebruikers of afnemende systemen.
    - Uitgevoerd na deployment en na geslaagde smoke en regressie tests.
    - Alleen van toepassing bij wijzigingen met zichtbare functionele impact.
    - Uitgevoerd door Product Owner of business stakeholder, gefaciliteerd door Tester.
- Performance en load tests:
    - Valideren dat de service voldoet aan afgesproken prestatieeisen.
    - Uitgevoerd bij wijzigingen die invloed kunnen hebben op performance of schaalbaarheid.
    - Niet standaard onderdeel van elke wijziging; inzet is risico gedreven.
- Fuzzing tests:
    - Testen de robuustheid en foutafhandeling van de service door het aanbieden van ongeldige, onverwachte of gemanipuleerde input.
    - Gericht op het vroegtijdig detecteren van crashes, security issues en onjuiste foutafhandeling.
    - Met name van toepassing bij wijzigingen aan API’s, inputvalidatie of parsing logica.



---

## 5. Acceptatiecriteria per fase
- Voor merge:
    - PR goedgekeurd door reviewer(s).
    - CI/CD-pipeline geslaagd.
- Na deployment:
    - Smoke tests geslaagd zonder blockers.
    - Eventuele non-blocker bevindingen zijn teruggekoppeld of geregistreerd met follow-up.

---

## 6. Review-checklist (te gebruiken door reviewer)
- Documentatie is aanwezig en duidelijk.
- Codekwaliteit: consistente naamgeving, foutafhandeling en logging.
- Security & privacy: geen gevoelige data in logs, invoervalidatie op orde, afhankelijkheden actueel.
- Tests: relevante unit tests toegevoegd of aangepast; nieuwe en gewijzigde paden afgedekt.
- Functionele check van kritieke paden uitgevoerd.
- CI/CD: alle checks geslaagd en kwaliteitspoorten gehaald.

---

## 7. Defectbeheer en terugkoppeling
- Defects gevonden tijdens review of CI/CD:
    - Terugkoppelen aan de ontwikkelaar met duidelijke reproductiestappen.
- Defects gevonden tijdens post-deploy validatie:
    - Terugkoppelen aan de ontwikkelaar en in overleg bepalen: directe fix/hotfix, rollback of opvolging in een volgende release via een nieuwe issue.

---

## 8. Versiebeheer en wijzigingsbeheer
- Elke wijziging verloopt via een PR met referentie naar een issue of ticket.
- Merge naar `main` alleen na het voldoen aan de acceptatiecriteria in #5.

Discussie (optioneel, na livegang):
- Bij significante wijzigingen release notes of een changelog bijhouden in `CHANGELOG.md`.
