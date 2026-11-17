## Deployment

### Omgevingen

Productie komt op de Logius Private Cloud (LPC). Wat daarvoor nog nodig is, staat in [Productiegereedheid van de NMC](https://docs.mijnoverheidzakelijk.nl/main/notificatiedienst/sections/productiegereedheid-van-de-nmc/).

Voor ontwikkeling wordt ZAD (Rijks ICT Gilde) gebruikt (project `nd-j7s`, component `nmcapi`):

- Iedere pull request krijgt automatisch een eigen preview-omgeving (`pr-<nummer>`), die bij het sluiten van de PR wordt opgeruimd.
- Bij een push naar `main` wordt de `stable`-omgeving bijgewerkt.
- Deployments verwijzen naar een immutable image-digest en gelden pas als geslaagd wanneer `/q/health/ready` beschikbaar is.

### Container image

Het image wordt met Jib gebouwd (basis `eclipse-temurin:25-jre`, non-root) en gepubliceerd naar de GitHub Container Registry: `ghcr.io/minbzk/moza-notificatiemanagementcomponent`. Een commit op `main` krijgt de tag `main-<sha7>`, een pull request de tag `pr-<nummer>`.

Voor de LPC kopieert een pipeline in LPC-GitLab het image van GHCR naar Harbor van de LPC, met dezelfde digest. Die route is met het image van de NMC getest. Gebruik daarvoor een `main-<sha7>`-tag of een releasetag: een `pr-<nummer>`-tag wordt bij elke push overschreven. Zie [Deployment](https://docs.mijnoverheidzakelijk.nl/main/deployment/).

### CI/CD

GitHub Actions:

- `maven.yml`: build en tests, inclusief de dekkingsnormen, op iedere push en pull request.
- `deploy.yml`: image-build en ZAD-deployment (previews en stable).
- Dependabot en OpenSSF Scorecard bewaken de dependencies en de repository-inrichting.

### Configuratie

Omgevingsspecifieke configuratie en secrets (database, NotifyNL API-key, callback-token, LDV) worden buiten de repository beheerd en als omgevingsvariabelen aan de container meegegeven. De hash-pepper is in de PoC-fase ook een omgevingsvariabele; in het doelontwerp komen de KEK en de peppers bij het opstarten uit de sleutelvoorziening van het platform (ADR 0024).

### Broncode

[MinBZK/moza-notificatiemanagementcomponent](https://github.com/MinBZK/moza-notificatiemanagementcomponent)
