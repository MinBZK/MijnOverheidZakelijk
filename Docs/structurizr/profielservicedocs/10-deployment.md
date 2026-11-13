## Deployment

### View

De deployment view van de Profiel Servie is hieronder te vinden, deze bevat uiteindelijk maar 2 containers.
De eerste is de Profiel Service zelf, met daarin de API-componenten en business logica, en de tweede is de bijbehorende postgresql database.

![](embed:ProfielServiceDeployment)


### Omgevingen

#### ZAD

ZAD (Rijks ICT Gilde) is de ontwikkel- en preview-omgeving van de Profiel Service (project `psd-law`, component `profielservice`).

- Elke Pull Request op `moza-profiel-service` krijgt automatisch een eigen, tijdelijke deployment (`pr-<nummer>`), zodat een reviewer de wijziging kan uitproberen. Bij het sluiten van de PR wordt die omgeving weer opgeruimd.
- Push/merge naar `main` deployt naar de persistente `stable`-omgeving: https://profielservice-stable-psd-law.rig.prd1.gn2.quattro.rijksapps.nl.
- Het image wordt met Jib gebouwd, gepubliceerd naar `ghcr.io/minbzk/moza-profiel-service` en op digest uitgerold. Een uitrol geldt pas als geslaagd wanneer `/q/health/ready` beschikbaar is.

De inrichting op ZAD wijkt op drie punten af van de POC-inrichting:

- De PR-previews en `stable` delen één database. De scheduler staat daarom op previews uit.
- `/q/health/ready` staat op de publieke poort. Op het Standaard Platform staat health op de interne managementpoort 9090.
- De verificatie-service is op ZAD de gedeelde WireMock-mock uit `moza-mock`.

Zie [docs/zad-deploy.md](https://github.com/MinBZK/moza-profiel-service/blob/main/docs/zad-deploy.md) in `moza-profiel-service` voor de workflow, de benodigde omgevingsvariabelen en de bekende valkuilen.

#### Standaard Platform

De POC-deployment is gehost op het Standaard Platform, specifiek in het TEST cluster van Openshift in de logius-moz-poc namespaces. De infrastructuur files staan op de private gitlab server van het Standaard Platform en de images in Harbor van het Standaard Platform.

#### LPC

Productie is voorzien op de Logius Private Cloud (LPC), zie [Infrastructuur Architectuur](https://docs.mijnoverheidzakelijk.nl/main/profiel-service/sections/infrastructuur-architectuur/). Het image gaat daarvoor ongewijzigd van GHCR naar Harbor van de LPC. Die route staat in [Deployment](https://docs.mijnoverheidzakelijk.nl/main/deployment/).

### Broncode

De broncode van de applicatie is open-source beschikbaar op [GitHub](https://www.github.com/MinBZK/moza-profiel-service).
