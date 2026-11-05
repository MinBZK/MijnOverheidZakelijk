## Deployment

### Branching strategie

Elke wijziging wordt in een eigen feature-branch ontwikkeld en na review via een pull request naar `main` gemerged. Voor de componenten op ZAD rolt een merge naar `main` de wijziging uit naar de `stable`-omgeving.

### Omgevingen

| Omgeving             | Platform                                  | Gebruik                                                                        |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| Ontwikkel en preview | ZAD (Rijks ICT Gilde)                     | Een preview per pull request en een `stable`-omgeving per component            |
| Prototype            | Standaard Platform van Logius (OpenShift) | De PoC-omgeving onder `mijnoverheidzakelijk.nl`                                |
| Productie            | Logius Private Cloud (LPC)                | Doelplatform voor productie van de backendsystemen; de inrichting is in opbouw |

### Uitrol naar ZAD

De backendsystemen en de ondersteunende tooling worden vanuit GitHub Actions uitgerold naar ZAD, met de actions uit [RijksICTGilde/zad-actions](https://github.com/RijksICTGilde/zad-actions). De workflow staat per repository in `.github/workflows/deploy.yml`.

- Een pull request krijgt een eigen preview-omgeving `pr-<nummer>`. De URL komt als comment op de pull request. Bij het sluiten van de pull request wordt de omgeving opgeruimd.
- Een push naar `main` werkt de persistente `stable`-omgeving bij.
- De workflow bouwt het image, pusht het naar de GitHub Container Registry (`ghcr.io/minbzk/<repository>`) en rolt het uit op de digest van dat image.
- Een uitrol geldt als geslaagd wanneer het health endpoint van de applicatie bereikbaar is.

ZAD rolt alleen een container-image uit. Configuratie en secrets staan per deployment in de ZAD Operations Manager en zitten niet in de workflow of in de repository. Bij de backendsystemen erft een preview zijn configuratie via `clone-from` van de deployment `feature`; `stable` heeft een eigen configuratie.

| Component       | Repository                                                                                              | ZAD-project | ZAD-component    | Persistente omgeving                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------- | ----------- | ---------------- | ---------------------------------------------------------------------- |
| NMC             | [moza-notificatiemanagementcomponent](https://github.com/MinBZK/moza-notificatiemanagementcomponent)    | `nd-j7s`    | `nmcapi`         | https://nmcapi-stable-nd-j7s.rig.prd1.gn2.quattro.rijksapps.nl         |
| Profiel Service | [moza-profiel-service](https://github.com/MinBZK/moza-profiel-service)                                  | `psd-law`   | `profielservice` | https://profielservice-stable-psd-law.rig.prd1.gn2.quattro.rijksapps.nl |
| Mock (WireMock) | [moza-mock](https://github.com/MinBZK/moza-mock)                                                        | `mozam-chu` | `wiremock`       | https://wiremock-dev-mozam-chu.rig.prd1.gn2.quattro.rijksapps.nl       |
| Gatus           | [moza-gatus](https://github.com/MinBZK/moza-gatus)                                                      | `mozag-on9` | `gatus`          | https://gatus-stable-mozag-on9.rig.prd1.gn2.quattro.rijksapps.nl       |

Een omgeving is bereikbaar op `https://<component>-<deployment>-<project>.rig.prd1.gn2.quattro.rijksapps.nl`. De mock heeft alleen de deployment `dev` en krijgt geen previews.

De details per systeem staan in het deploymenthoofdstuk van de [Profiel Service](https://docs.mijnoverheidzakelijk.nl/main/profiel-service/sections/deployment/) en van de [Notificatiedienst](https://docs.mijnoverheidzakelijk.nl/main/notificatiedienst/sections/deployment/).

### Uitrol naar de LPC

Voor de Logius Private Cloud (LPC) gaat de broncode niet naar GitLab. Een pipeline in LPC-GitLab kopieert het image dat op GitHub gebouwd is van GHCR naar Harbor van de LPC, met dezelfde digest. Het image op de LPC is daarmee hetzelfde image dat op ZAD heeft gedraaid.
Kies bij het kopiëren een tag die niet verandert, zoals `main-<sha7>` of een releasetag. Een tag `pr-<nummer>` wordt bij elke push overschreven. Het bewaarbeleid van Harbor ruimt oudere images zonder releasetag op, dus terugrollen naar een oudere versie vraagt een releasetag.

### Harbor

Er zijn twee Harbor-registries in gebruik:

- **Harbor van de LPC** (project `gs`) is de registry waaruit de LPC images haalt. Images komen hier via de kopieerpipeline uit de vorige paragraaf.
- **Harbor van het Standaard Platform** (`harbor-gn3.cicd.s15m.nl`, project `logius-moz`) bevat de images van de PoC-omgeving en dient daar als proxy voor publieke registries.

ZAD gebruikt geen Harbor en haalt images rechtstreeks van GHCR.

### Gebruikte Tooling

| Applicatie              | URL                                                                     | Beschrijving                                                                   |
| ----------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Github                  | https://github.com/orgs/MinBZK/teams/mijnoverheid-zakelijk/repositories | Source Code, Documentatie en CI/CD (GitHub Actions)                            |
| GHCR                    | https://github.com/orgs/MinBZK/packages                                 | Container registry voor de images die op GitHub gebouwd worden                 |
| Gatus                   | https://gatus-stable-mozag-on9.rig.prd1.gn2.quattro.rijksapps.nl        | Healthcheck-dashboard                                                          |
| Harbor (LPC)            |                                                                         | Container registry van de LPC                                                  |
| GitLab (SP)             | https://gitlab.cicd.s15m.nl                                             | Infra 'Code', en Pipelines van de PoC-omgeving                                 |
| Harbor (SP)             | https://harbor-gn3.cicd.s15m.nl                                         | Container registry van de PoC-omgeving met repo's, images en charts            |
| Nexus (SP)              | https://nexus.cicd.s15m.nl                                              | Artefact registry met jouw artefacts                                           |
| Kibana Test (SP)        | https://kibana-test.cicd.s15m.nl                                        | Logging dashboards en alerts TEST clusters                                     |
| Grafana Test (SP)       | https://grafana-test.cicd.s15m.nl/                                      | Monitoring dashboards en alerts TEST clusters                                  |
| OpenShift Test (SP)     | https://console-openshift-console.apps.test3.gn3.sp.rijksapps.nl/       | Inzien huidige Deployment/Secrets/Certificaten van het Kubernetes TEST cluster |

### Prototype omgeving

De POC omgeving is te vinden op het TEST cluster van het Standaard Platform (OpenShift) in de logius-moz-poc namespaces.

Per applicatie staat er een GitLab-project op het Standaard Platform met de infrastructuurbestanden en de pipeline. De pipeline downloadt de broncode van de main-branch uit de GitHub-repository, bouwt hieruit een image en pusht deze naar Harbor van het Standaard Platform. Daarna wordt de deployment bijgewerkt, via een sync van ArgoCD of met `kubectl`. De pipeline wordt handmatig gestart of door een schedule die op nieuwe commits controleert.

![](embed:Ontwikkelomgeving)

#### Applicaties

Door ons gehosten applicaties

| Applicatie      | URL                                            | Beschrijving                                                                       |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Landingspagina  | https://www.mijnoverheidzakelijk.nl/           | Landingspagina voor overzicht van de applicaties                                   |
| Voorkant        | https://moza.mijnoverheidzakelijk.nl/          | Voorkant voor de profiel & historie service                                        |
| Proefomgeving   | https://proef.moza.rijksapp.dev/moza/          | MOZa-proefomgeving op ZAD                                                          |
| Vakapplicatie   | https://vakapplicatie.mijnoverheidzakelijk.nl/ | Mock van een vakapplicatie waar notificatie process wordt gestart                  |
| Profiel Service | https://profiel.mijnoverheidzakelijk.nl/       | Hier worden profiel gegevens opgeslagen                                            |
| Structurizr     | https://docs.mijnoverheidzakelijk.nl/          | Documentatie wordt hier gehost                                                     |
| Keycloak        | https://start.mijnoverheidzakelijk.nl/         | Wordt gebruikt voor OAuth2 login voor de front end                                 |
| Zaken           | https://zaken.mijnoverheidzakelijk.nl/         | Mock van een zaakservice waar diverse diensten worden gesimuleerd                  |
| OMC             | https://omc.mijnoverheidzakelijk.nl/           | Output management component, regelt communicatie tussenn vakapplicatie en NotifyNL |

Extern gebruikte applicaties door prototype omgeving

| Applicatie            | URL                           | Beschrijving                                                     |
| --------------------- | ----------------------------- | ---------------------------------------------------------------- |
| NotifyNL              | https://admin.notifynl.nl/    | Verantwoordelijk voor het versturen van email & sms notificaties |
| Kanaalherstel Service | ???                           | Service die brieven voor ons kan versturen i.g.v. uitval         |
| DigId                 | https://www.digid.nl/         | Digidn                                                           |
| eHerkenning           | https://www.eherkenning.nl/nl | EHerkenning                                                      |

#### Postgres databases leegmaken

Er zijn situaties waarbij de data in database leeggemaakt dient te worden alvorens een uitrol kan worden gedaan. Voor het leegmaken van de Postgres database dien je de volgende stappen te doen (stap 1 t/m 3 is eenmalig):

1. Download de "oc - OpenShift Command Line Interface" CLI. Deze kan gedownload worden via https://console-openshift-console.apps.test3.gn3.sp.rijksapps.nl/command-line-tools
2. Maak een nieuw folder aan in Program Files bv. `openshift`
3. Voeg een nieuw pad aan je path environment variables -> "C:\Program Files\openshift"
4. Open een Powershell terminal om in te loggen in OpenShift. `oc login --web`
5. Switch naar `logius-moz-poc` namespace met de volgende kubernetes command: `oc project logius-moz-poc`
   Ter info. in deze stap wordt vanuit gegaan dat je de Kubernetes command-line tool(kubectl) al op je lokale omgeving beschikt. Deze komt namelijk mee wanneer je Docker op je omgeving hebt geinstalleerd. Als dit niet het geval is dan kan je de cli downloaden via https://kubernetes.io/docs/tasks/tools/#kubectl
6. Neem vervolgens de shell over van de draaiende Postgres pod in kubernetes `kubectl exec --tty --stdin postgres-statefulset-0 -- /bin/sh`
7. Maak een connectie met je Postgres database: `psql -h localhost -U postgres -d postgres`
8. Hij zal om een wachtwoord vragen, zie hiervoor de secret in openshift `postgres-postgresql`
9. Ga naar OpenShift om de Pods die met postgres praten down te scalen. Doe die door de deployments naar 0 replicas te scalen.
10. Maak een connectie met gewenste database met de volgende command `\c "databasename"`
11. Gebruik de volgende command om je data in de database leeg te maken `delete from tablename;`
12. Sluit je database connect af `\q`
13. Sluit je shell af met `exit`
