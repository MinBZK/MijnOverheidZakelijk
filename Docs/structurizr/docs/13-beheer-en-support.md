## Beheer en Support

### Gezamenlijke War-Room

Er is momenteel geen fysieke, gezamenlijke "special operation"-room, aangezien we ons nog in de POC-fase bevinden.

### Incidentenprocedure

Er is momenteel nog geen incidentenprocedure opgesteld, aangezien we ons nog in de POC-fase bevinden. Incidenten/bugs worden gemeld bij de Product Owner en komen in de backlog, daar worden ze opgepakt door het DevTeam.

### Hosting Standaard Platform

De omgeving wordt gehost door het Standaard Platform van Logius. Incidenten en wijzigingen kunnen, met de juiste rechten, worden ingeschoten via Topdesk: https://topdesk.sp-cloudservices.nl/tas/public/login/form.

### Nieuwe Medewerker

Nieuwe medewerkers hebben een Standaard Platform account nodig om verbinding te kunnen maken met de VPN en toegang te
krijgen tot de omgevingen. Dit account wordt geregeld via het Standaard Platform.

### Accounts

- VPN
- GitLab

### Vertrek van medewerkers

Wanneer medewerkers het team verlaten, wordt de toegang tot hun account bij het SP ingetrokken op de laatste werkdag. Daarmee kunnen zij niet meer bij de omgevingen.

### Backups Restoren

Voor het terugzetten van backups van bijvoorbeeld Persistant Volume Claims (PVC's) en andere objecten die je niet vanuit de pipelines of eigen MinIO omgeving kunt herstellen, kan men bij het Standaard Platform terecht via het Self-Service portaal, of de Topdesk formulieren. Hiervoor dient men wel de juiste rechten te hebben (Developer en Resource Beheerder).

- Self Service portaal: [https://ssp.cicd.s15m.nl/](https://ssp.cicd.s15m.nl/)
- Topdesk: [https://topdesk.sp-cloudservices.nl/](https://topdesk.sp-cloudservices.nl/https://topdesk.sp-cloudservices.nl/)

### Databases beheren

Er wordt [Code First](https://www.entityframeworktutorial.net/code-first/what-is-code-first.aspx) ontwikkeld, wat betekent dat de database schema's worden gegenereerd op basis van de in de code gedefinieerde modellen. Hierdoor zal het niet nodig zijn, of liever gezegd niet de bedoeling, om aanpassingen in de database definities te maken. Uiteraard kan er nog steeds beheer op databases nodig zijn waarvoor je verbinding met een database moet kunnen maken.

Verbinden met een database op het SP kan via CLI of een IDE (bijvoorbeeld Azure Data Studio of IntelliJ). Om vanaf de ontwikkelwerkplek direct in te loggen op een database of andere service op kubernetes dien je port forwarding in te stellen.

```shell
kubectl port-forward service/postgres-service 5432:5432
```

> Zie ook: [Use Port Forwarding to Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)

### Databases restoren

### Certificaten

Voor de omgevingen van MOZ hebben we nog geen certificaten aangevraagd.

### Secrets

In "Secrets" staan de login gegevens van de diverse componenten, denk aan hier aan bijvoorbeeld Databases en externe API's.

**POC omgeving:**

Iedereen die een hierboven genoemd VPN en Openshift account heeft, kan voor deze omgevingen een certificaat/secret neerzetten en verwijderen.

**Certificaat als Sealed Secret installeren op OpenShift**

Voor het installeren van een certificaat in OpenShift is een .key en een .crt bestand nodig. Heb je deze niet, maak deze dan aan. Let op: De key dient unencrypted te zijn.

**Secret maken en sealen**

1. Inloggen op OpenShift
   1. Ga naar de OpenShift webinterface (zie URL in Deployment View)
   2. Log in met sp-oidcdp
   3. Klik op je naam > Copy login command
   4. Nogmaals inloggen
   5. Klik op Display Token
   6. Kopieer het eerste commando
2. Open je terminal/console
3. Plak het commando dat je zojuist hebt gekopieerd: `oc login`
4. Kies de gewenste omgeving: `oc project [naam-omgeving]`
5. Download de public key van het desbetreffende cluster (TEST of PROD) om te kunnen sealen uit https://gitlab.cicd.s15m.nl/sp-docs/publiek/-/wikis/applicatie-uitrollen/ci-cd/Sealed-Secrets.
6. Maak het secret aan en seal deze met het volgende commando (pas [] aan):
   ```
   kubectl create secret generic [secret-naam] -n [namespace]
   --from-file=tls.key=[file-naam]
   --from-file=tls.crt=[file-naam]
   --dry-run -o yaml | kubeseal --cert env_public-key-[test|prod].pem --format yaml - > [bestandsnaam].yaml
   ```
7. Upload het secret naar OpenShift:  
   `kubectl apply -f [kies_filename].yaml`
   1. LET OP: op de productie namespaces kan dit commando alleen worden uitgevoerd onder account van technisch applicatie
      beheer met de toevoeging: `--as logius-moz-tab`

**Certificaten bewerken**

- TODO: hier info over hoe certificaten te bewerken

### Monitoring

- Kibana & Grafana: bouwstenen van het Standaard Platform.

> Zie [deployment](Deployment) voor URL's.

### Logging

Voor de logging strategie maken we een onderscheid in gebruikte standaard services, en onze eigen services / containers. Standaard Services hebben hun eigen, onaangepaste logging. Onze eigen services / containers hebben service specifieke logging en bijbehorende foutmeldingen. Alle logging van de services is inzichtelijk via Kibana en Grafana.

Wanneer er bijzonderheden zijn in de logging van een van onze services, kan dat hier worden beschreven.

> Zie [deployment](Deployment) voor URL's.

### Meest voorkomende storingen en oplossingen

- TODO: Meest voorkomende storingen en bijbehorende oplossingen beschrijven.
