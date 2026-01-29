## 1. Doel en scope
Dit testplan beschrijft hoe wijzigingen aan de moza-profiel-service worden gevalideerd vóór en na het mergen naar main. Het plan dekt:
- Review vóór merge (inclusief een korte functionele check door de reviewer).
- Geautomatiseerde unit tests in de CI/CD‑pipeline.
- Een laatste (post‑deploy) test in de doelomgeving, met optie om story terug te zetten of nieuwe aan te maken.

Scope: alle wijzigingen die via Pull Requests (PR’s) richting `main` gaan, inclusief code, configuratie en documentatie.

Niet in scope: uitgebreide end‑to‑end ketentesten met systemen buiten dit project (die vallen onder keten- of acceptatietesten van de overkoepelende oplossing).

## 2. Rollen en verantwoordelijkheden
- Ontwikkelaar:
  - Maakt de PR, beschrijft wijziging, risico’s en testnotities.
  - Zorgt voor minimaal basisdekking met unit tests en een succesvolle lokale build.
  - Verantwoordelijk voor deployment naar de doelomgeving.
  - Initieert of faciliteert post‑deploy smoke test.
- Reviewer:
  - Voert code review uit (kwaliteit, security, performance, onderhoudbaarheid).
  - Doet een korte functionele check (manuele of lokale run) op de belangrijkste paden.
  - Keurt goed of vraagt aanpassingen.
- CI/CD:
  - Voert geautomatiseerde unit tests uit en bewaakt kwaliteitsgate (build, lint, coverage).
- Tester:
  - Bestaat nog niet binnen het team

## 3. Procesoverzicht
1) Voorbereiding PR
   - Belicht de changes duidelijke: doel, impact, risico’s, migraties.
   - Update of voeg unit tests toe voor gewijzigde logica.
   - Lokale checks: build, unit tests.

2) Code review en korte functionele check
   - Controleer codekwaliteit (readability, consistentie, error handling, logging, beveiliging van data).
   - Verifieer dat edge cases afgedekt zijn met tests waar relevant.
   - Voer een beknopte handmatige check uit (Indien nodig):
     - Start de service lokaal.
     - Doorloop 1–3 kritieke paden.
   - Gebruik de checklist in #6.

3) CI/CD‑pipeline
   - Trigger: open/updates op PR.
   - Stappen:
     - Build en dependency resolve.
     - Unit tests draaien met rapportage/coverage.
     - Linting scan
     - Security/package scan.
   - Kwaliteitspoorten:
     - Build moet slagen.
     - Alle unit tests moeten slagen.
     - Coverage ≥ x%.

4) Merge naar main
   - Voorwaarden: minstens één reviewer‑approval, CI/CD geslaagd.

5) Deploy naar doelomgeving
   - Automatisch voor TST, ACC, Pre-PRD of handmatig voor PRD.
   - Configuraties en secrets via omgevingsspecifieke instellingen.

6) Post‑deploy Smoke/Verificatie test
   - Voer smoke tests uit op 2–5 kernscenario’s.
     - Bevindingen en eventuele bugs registreren als issues met duidelijke referentie naar de commit/PR en de omgeving.
     - Indien blockers: deployment terugdraaien of hotfix proces starten conform releasebeleid.

## 4. Testsoorten en dekking
- Unit tests:
  - Dekken business logica, datamapping, foutenafhandeling en validatie.
  - Minimale dekking: projectnorm x% coverage.
- Integratie‑tests:
  - Kunnen via Quarkus testframework endpoints of repositories valideren met in‑memory database.
- Smoke tests:
  - Kort, snel, gericht op “werkt het überhaupt” in de doelomgeving.
    - Potentieel automatiseren dichter bij de release.

## 5. Acceptatiecriteria per fase
- Voor merge:
  - PR goedgekeurd door reviewers.
  - CI/CD Pipeline slaagt.
- Na deploy:
  - Smoke test geslaagd zonder blockers.
  - Eventuele non‑blocker bevindingen zijn geregistreerd met follow‑up.

## 6. Review- en test‑checklist (te gebruiken door reviewer)
- Documentatie aanwezig en duidelijk.
- Codekwaliteit: consistentie, naamgeving, foutafhandeling, logging.
- Security & privacy: geen gevoelige data in logs; invoervalidatie; afhankelijkheden up‑to‑date.
- Tests: relevante unit tests toegevoegd/aangepast; tests dekken nieuwe/gewijzigde paden en edge cases.
- Lokale of tijdelijke functionele check van kritieke paden uitgevoerd.
- CI/CD: alle jobs geslaagd; coverage/kwaliteitspoorten gehaald.

## 7. Defectbeheer en terugkoppeling
- Defects gevonden tijdens review of CI: koppel terug aan de Auteur met reproductie-stappen.
- Defects gevonden bij post‑deploy smoke test: registreer issue met omgeving, logs en impact. Bepaal samen mitigatie: hotfix/rollback/volgende release.

## 8. Versiebeheer en wijzigingsbeheer
- Elke wijziging gaat via PR met referentie naar issue/ticket.
- Merge naar `main` alleen na het voldoen aan de criteria in #5.

Discussie, waarschijnlijk pas iets wat interessant is na/bij livegang:
- Release notes of changelog bij significante wijzigingen bijhouden in `CHANGELOG.md`.