## Deployment

> De koppeling tussen software architectuur en infrastructuur architectuur. (waar draait wat)
>
> Zie ook: [Inhoud guidelines Deployment](https://structurizr.com/help/documentation/deployment)

### Branching strategie

We maken gebruik van de GitFlow branching strategie. Dat wil zeggen dat er elke feature in zijn eigen feature-branch wordt
ontwikkeld en na review via een Merge Request naar de `develop` branch wordt gemerged. Nieuwe releases worden via een merge request van `develop` naar een `release/x.x.x` branch gepushed. Om de release naar productie te brengen, wordt de `release/x.x.x` branch naar `main` gemerged.

De software wordt door CI/CD pipelines uitgerold naar de omgevingen. Dat is een OpenShift 4.x omgeving. De uitrol naar de ontwikkelomgeving gaat automatisch na een commit op de `develop` branch.
De uitrol naar pre-productie gaat automatisch na een commit op de `main` branch. De uitrol naar productie vereist een
handmatige actie van een developer/beheerder in de build pipeline.

TODO: Plaatjes erbij? Of staat dit al ergens op "de nieuwe confluence"?

### Algemene SP beheer tooling

| Applicatie     | URL                                                               | Beschrijving                                                                   |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| GitLab         | https://gitlab.cicd.s15m.nl                                       | Source Code, Documentatie en pipelines                                         |
| Harbor         | https://harbor.cicd.s15m.nl                                       | Container registry met repo's, images en charts                                |
| Nexus          | https://nexus.cicd.s15m.nl                                        | Artefact registry met jouw artefacts                                           |
| Kibana Test    | https://kibana-test.cicd.s15m.nl                                  | Logging dashboards en alerts TEST clusters                                     |
| Kibana Prod    | https://kibana.cicd.s15m.nl                                       | Logging dashboards en alerts PROD clusters                                     |
| Grafana Test   | https://grafana-test.cicd.s15m.nl/                                | Monitoring dashboards en alerts TEST clusters                                  |
| Grafana Prod   | https://grafana-prod.cicd.s15m.nl/                                | Monitoring dashboards en alerts PROD clusters                                  |
| OpenShift Test | https://console-openshift-console.apps.test3.gn3.sp.rijksapps.nl/ | Inzien huidige Deployment/Secrets/Certificaten van het Kubernetes TEST cluster |
| OpenShift Prod | https://console-openshift-console.apps.prod3.gn3.sp.rijksapps.nl/ | Inzien huidige Deployment/Secrets/Certificaten van het Kubernetes PROD cluster |

### Prototype omgeving

De POC omgeving is te vinden op het TEST cluster van Openshift in de logius-moz-poc namespaces.

![](embed:Ontwikkelomgeving)

#### Applicaties

Door ons gehosten applicaties

| Applicatie       | URL                                              | Beschrijving                                                                       |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Landingspagina   | https://www.mijnoverheidzakelijk.nl/             | Landingspagina voor overzicht van de applicaties                                   |
| Voorkant         | https://voorkant.mijnoverheidzakelijk.nl/        | Voorkant voor de profiel & historie service                                        |
| Vakapplicatie    | https://vakapplicatie.mijnoverheidzakelijk.nl/   | Mock van een vakapplicatie waar notificatie process wordt gestart                  |
| Profiel Service  | https://profielservice.mijnoverheidzakelijk.nl/  | Hier worden email gegevens opgeslagen                                              |
| OMC              | https://omc.mijnoverheidzakelijk.nl/             | Output management component, regelt communicatie tussenn vakapplicatie en NotifyNL |

Extern gebruikte applicaties door prototype omgeving

| Applicatie             | URL                                                                          | Beschrijving                                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| NotifyNL               | https://admin.notifynl.nl/                                                   | Verantwoordelijk voor het versturen van email & sms notificaties |
| Kanaalherstel Service  | ???                                                                          | Service die brieven voor ons kan versturen i.g.v. uitval         |
| DigId                  | https://www.digid.nl/                                                        | Digidn                                                           |
| eHerkenning            | https://www.eherkenning.nl/nl                                                | EHerkenning                                                      |

### Uitrol naar omgeving

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
