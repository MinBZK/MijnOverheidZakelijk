## Deployment

### Omgevingen

Productie gaat bij Logius draaien; de concrete inrichting daarvan volgt.

Voor ontwikkeling wordt ZAD (Rijks ICT Gilde) gebruikt:

- Iedere pull request krijgt automatisch een eigen preview-omgeving (`pr-<nummer>`), die bij het sluiten van de PR wordt opgeruimd.
- Bij een push naar `main` wordt de `stable`-omgeving bijgewerkt.
- Deployments verwijzen naar een immutable image-digest en gelden pas als geslaagd wanneer `/q/health/ready` beschikbaar is.

### Container image

Het image wordt met Jib gebouwd (basis `eclipse-temurin:25-jre`, non-root) en gepubliceerd naar de GitHub Container Registry: `ghcr.io/minbzk/moza-notificatiemanagementcomponent`.

### CI/CD

GitHub Actions:

- `maven.yml`: build en tests, inclusief de dekkingsnormen, op iedere push en pull request.
- `deploy.yml`: image-build en ZAD-deployment (previews en stable).
- Dependabot en OpenSSF Scorecard bewaken de dependencies en de repository-inrichting.

### Configuratie

Omgevingsspecifieke configuratie en secrets (database, NotifyNL API-key, callback-token, hash-pepper, LDV) worden buiten de repository beheerd en als omgevingsvariabelen aan de container meegegeven.

### Broncode

[MinBZK/moza-notificatiemanagementcomponent](https://github.com/MinBZK/moza-notificatiemanagementcomponent)
