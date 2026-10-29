# 27. Koppelingen van het Notificatie Management Component

Datum: 2026-10-07

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): NotifyNL als verzendkanaal.
* [ADR 0010 LDV implementatie](0010-ldv-implementatie.md): verwerkingen van persoonsgegevens worden vastgelegd in het Logboek Dataverwerkingen.
* [ADR 0018 Afbakening profiel-service en koppelcode](0018-afbakening-profiel-service-en-koppelcode.md): de Profielservice is bij centrale regie de bron van het e-mailadres.
* [ADR 0020 Standaard afleverstatus-terugkoppeling](0020-standaard-afleverstatus-terugkoppeling.md): CloudEvents, status-query en webhook richting de dienstverlener; FSC op de inkomende richting, niet op de webhook.
* [ADR 0021 Twee regie-modellen](0021-twee-regie-modellen-ipv-scenarios.md): wie de contactgegevens aanlevert en wie het contactherstel draagt.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): de levenscyclus en de componenten waaruit de koppelingen volgen.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): afnemers alleen via FSC, naast de inway geen eigen publiek endpoint, secrets in de secretsvoorziening van het hostingplatform. Dat productie van het NMC op de LPC draait, staat in notificatiedocs §14.
* [ADR 0030 Autorisatie van dienstverleners in het NMC](0030-autorisatie-van-dienstverleners-in-het-nmc.md): het FSC-toegangstoken is de identiteit van de dienstverlener; het NMC past geen FTV toe.

## Context

De Notificatiedienst gaat in productie bij Logius op de Logius Private Cloud (LPC). Voor die landing moet per koppeling van het Notificatie Management Component (NMC) vaststaan welk systeem aan de andere kant zit, in welke richting het verkeer loopt, over welk netwerkpad, met welke authenticatie en welke secrets daarvoor nodig zijn. Daaruit volgen de netwerkregels, de FSC-contracten en de inhoud van de secretsvoorziening.

De koppelingen staan verspreid over ADR 0020, ADR 0024, de notificatiedocs en de configuratie van het NMC. Met de event-core-update (epic #1150) is de code op het model van ADR 0024 gebracht: aanname, verzendtaken, receipts, navraag, eventfeed, webhook en sleutelbeheer. Deze ADR legt het resulterende overzicht op één plek vast, inclusief wat het NMC bewust niet aanroept.

## Decision

Het NMC heeft de negen koppelingen hieronder en geen andere. Een nieuwe koppeling wordt aan dit overzicht toegevoegd voordat zij wordt gebouwd.

### Overzicht

| # | Systeem | Richting | Protocol en formaat | Authenticatie | Netwerkpad | Stand |
|---|---------|----------|---------------------|---------------|------------|-------|
| 1 | Dienstverleners: DV-service (centrale regie), OMC (decentrale regie), Berichtenbox (kennisgevingen) | inkomend | REST `/api/nmc/v1/...`; CloudEvents (NL GOV) op de feed | FSC-toegangstoken (`Fsc-Authorization`) met het OIN van de dienstverlener (ADR 0030); daarnaast het OAuth2-token (NL GOV Assurance profile) van de IAM-gateway van MOZa uit ADR 0024 | FSC-inway | API gebouwd; FSC en tokenvalidatie in doelontwerp |
| 2 | NotifyNL | uitgaand | REST (GOV.UK Notify API): e-mail versturen, zoeken op reference, status opvragen | bearer-JWT, ondertekend met het secret uit de API-key van de NotifyNL-service | internet (egress) | gebouwd |
| 3 | NotifyNL | inkomend | REST `POST /api/nmc/v1/notifynl-callback`, delivery receipt | bearer-token dat bij NotifyNL is geregistreerd | internet (publieke ingress, alleen dit pad) | gebouwd |
| 4 | Profielservice (zakelijk) | uitgaand | REST `POST /api/profielservice/v1/partij` | afnemer op eigen titel; caller-authenticatie aan de gateway van de Profielservice | binnen de LPC | ophalen gebouwd; ongeldig melden in doelontwerp |
| 5 | Webhook van de dienstverlener | uitgaand | webhook, CloudEvents (NL GOV) | bearer-JWT (RS256) van het NMC met `aud`; publieke sleutel op `/api/nmc/v1/.well-known/jwks.json` | egress naar de bij onboarding geregistreerde URL; niet over FSC | gebouwd |
| 6 | PostgreSQL (notificatiedatabase) | uitgaand | JDBC | gebruikersnaam en wachtwoord | binnen de LPC | gebouwd |
| 7 | Logboek Dataverwerkingen (LDV) | uitgaand | HTTP naar de Clickhouse-endpoint via de logboekdataverwerking-wrapper | gebruikersnaam en wachtwoord | binnen de LPC of naar de omgeving van het LDV | controllers gebouwd, per omgeving aan te zetten; Verzendverwerker in doelontwerp |
| 8 | Secretsvoorziening van het platform (HashiCorp Vault op de LPC) | uitgaand, bij opstarten | platformafhankelijk | platformidentiteit van de pod | binnen de LPC | nu omgevingsvariabelen; doelontwerp ADR 0024 |
| 9 | Platformmonitoring | inkomend | `/q/health/live`, `/q/health/ready`, `/q/metrics` (Prometheus) | geen | binnen de LPC | gebouwd |

### Per koppeling

**1. Dienstverleners.** De dienstverlener biedt notificaties aan (`POST /api/nmc/v1/centraal/notificaties` met een identificerend nummer, `POST /api/nmc/v1/decentraal/notificaties` met een e-mailadres), leest de eventfeed (`GET /api/nmc/v1/notificaties/wijzigingen?cursor=`) en bevestigt die (`PUT /api/nmc/v1/notificaties/wijzigingen/bevestiging`). `GET /api/nmc/v1/notificaties/{id}`, `GET /api/nmc/v1/notificaties?dvRef=` en `DELETE /api/nmc/v1/notificaties/{id}` zitten in het doelontwerp van ADR 0024. Bij decentrale regie is de aanroeper de OMC van de dienstverlener; de Berichtenbox gebruikt dezelfde koppelvlakken voor kennisgevingen. Alle aanroepen komen binnen over de FSC-inway van de Notificatiedienst. De identiteit van de dienstverlener is het OIN uit het FSC-toegangstoken in de header `Fsc-Authorization`, dat het NMC valideert tegen de sleutel van de eigen Manager (ADR 0030). Het OAuth2-token uit ADR 0024 §9 draagt hetzelfde OIN en wordt gevalideerd tegen de JWKS van de IAM-gateway, die het NMC periodiek ophaalt; er is geen aanroep naar de IAM-gateway per verzoek. Het Dienstverlenerregister koppelt het OIN aan de dienstverlener en bepaalt berichttypen, quota, webhook en termijnen. In de huidige code is één dienstverlener geconfigureerd en ontbreekt de inkomende authenticatie. De OpenAPI-spec staat binnen FSC op `/q/openapi`; ADR 0025 legt `/openapi.json` als locatie vast.

**2 en 3. NotifyNL.** Het NMC verstuurt per poging een e-mail met template-id, personalisation en de poging als `reference`, zoekt op `reference` wanneer de respons verloren is gegaan en vraagt de status op voor pogingen zonder receipt (Afleverstatus-navraag). Elke aanroep draagt een JWT die het NMC zelf ondertekent met het secret uit de API-key. Omgekeerd meldt NotifyNL elke statuswijziging als delivery receipt op de Afleverstatus-callback. Dat is het enige pad van het NMC dat vanaf internet bereikbaar moet zijn; het accepteert een bearer-token dat bij NotifyNL is geregistreerd en valt onder rate limiting op de ingress. De base-URL van NotifyNL is per omgeving configuratie.

**4. Profielservice.** Bij centrale regie zoekt het NMC binnen de verzendtaak het e-mailadres van de partij op aan de hand van identificatietype, identificatienummer, dienstverlener en dienst. Het identificerend nummer staat versleuteld op de notificatierij tot de wisactie; het e-mailadres wordt niet opgeslagen en is alleen in het geheugen aanwezig tijdens de poging. Een 400, 404 of 422 van de Profielservice geldt als onbekende partij en is terminaal voor de notificatie; een verbindingsfout of 5xx is een storing die de verzendtaak uitstelt zonder een poging te kosten. Het melden van een ongeldig e-mailadres na een `permanent-failure` loopt over dezelfde koppeling en zit in het doelontwerp van ADR 0024. Het NMC roept de Profielservice op eigen titel aan; het draagt geen token van een eindgebruiker. De Profielservice authenticeert haar afnemers aan haar eigen gateway. Of dat verkeer binnen de LPC over FSC loopt, is een open besluit uit ADR 0025.

**5. Webhook van de dienstverlener.** Een dienstverlener kan bij onboarding een webhook-URL laten registreren; in de huidige code staat die URL in het Dienstverlenerregister en is er geen registratie-endpoint. De terugkoppeltaak levert elk event als CloudEvent op die URL, vanaf een eigen leverpositie, met een door het NMC ondertekende JWT waarvan `aud` de webhook-URL is. De URL wordt vóór elke levering op vorm gecontroleerd (alleen https, geen IP-literal, geen interne hostnamen); de controle op het opgeloste adres bij registratie uit ADR 0024 zit in het doelontwerp. Na herhaalde mislukkingen pauzeert de webhook. De dienstverlener verifieert de JWT met de publieke sleutel op het JWKS-endpoint van het NMC. De webhook loopt niet over FSC: FSC past op de inkomende richting, de push gaat de andere kant op (ADR 0020). De feed uit koppeling 1 blijft de basis; de webhook is optioneel.

**6. PostgreSQL.** De notificatiedatabase bevat de state machine, de taken, het eventlog, het Dienstverlenerregister en het verzendbudget; alles wat het NMC onthoudt staat hier, in één transactie per overgang. Schemawijzigingen lopen via Flyway en draaien bij het opstarten van de pod (ADR 0019). Het lezen van de eventfeed van een replica zit in het doelontwerp van ADR 0024; de huidige code heeft één datasource.

**7. Logboek Dataverwerkingen.** De logboekdataverwerking-wrapper schrijft de verwerkingsregistraties rechtstreeks naar de Clickhouse-endpoint van het LDV: vanuit de controllers bij aanname en per opgevraagde feedpagina (gebouwd), en vanuit de Verzendverwerker vóór elke externe aanroep en vóór het terugkoppelen (doelontwerp uit het C4-model; de taakhandlers en de webhook-dispatcher registreren nu nog niet). Het LDV staat in het model als extern systeem; endpoint, database, tabel en inloggegevens zijn per omgeving configuratie.

**8. Secretsvoorziening.** Het NMC houdt drie soorten geheimen die het zelf gebruikt: de KEK-versies voor de sleutel per notificatie, de pepper voor de HMAC van het LDV-subject-id (doelontwerp ADR 0024: peppers per doel voor identificerend nummer en dvRef), en de private sleutel voor de webhook-JWT. Daarnaast heeft het de inloggegevens voor NotifyNL, de callback, PostgreSQL en Clickhouse. In de huidige inrichting komen al deze waarden als omgevingsvariabelen binnen; op de LPC komen zij uit de secretsvoorziening van het platform. Het NMC leest ze eenmalig bij het opstarten; de secretsvoorziening staat niet op het pad van een verzoek (ADR 0024).

**9. Platformmonitoring.** Het NMC publiceert health endpoints en Prometheus-metrics; van de zeven alarmmetrics uit ADR 0024 zijn er drie geregistreerd (mislukte taken, achterstand per taaksoort en afgewezen receipts), de overige vier zitten in het doelontwerp. Het platform van de LPC leest die uit; het NMC roept zelf geen monitoringsysteem aan.

### Wat het NMC niet aanroept

* **Contactherstelservice (Logius) en Printstraat.** Contactherstel maakt geen deel uit van deze editie. Bij een `permanent-failure` meldt het NMC bij centrale regie het e-mailadres ongeldig bij de Profielservice en koppelt het `niet-bezorgbaar` met reden `onbereikbaar` terug aan de dienstverlener; de opvolging ligt bij de dienstverlener (ADR 0021). Wordt contactherstel toegevoegd, dan komt de Contactherstelservice als uitgaande koppeling bij dit overzicht.
* **KvK, BRP en andere registers.** Het NMC lost geen identificerend nummer zelf op; het e-mailadres komt via de Profielservice.
* **IAM-gateway of FSC-Manager per verzoek.** Tokens worden lokaal gevalideerd: het FSC-toegangstoken tegen de sleutel van de eigen Manager, het OAuth2-token tegen de periodiek opgehaalde JWKS.
* **Message broker of workflow-engine.** Timers, wachtrijen en terugkoppeling lopen over PostgreSQL (ADR 0024).
* **Portaal, Verificatieservice en Actualiteitenservice.** Notificaties komen uitsluitend van dienstverleners binnen; het NMC heeft geen koppeling met de andere MOZa-services dan de Profielservice en het LDV.

## Consequences

### Netwerk op de LPC

* Inkomend vanaf internet: alleen `POST /api/nmc/v1/notifynl-callback`, met rate limiting op de ingress. Dit wijkt af van besluit 5 uit ADR 0025 (naast de inway geen eigen publiek endpoint) en geldt zolang NotifyNL buiten de LPC draait; dat is het open besluit uit ADR 0025. Alle overige paden zijn vanaf internet gesloten.
* Inkomend via FSC: de dienstverlener-API, inclusief de OpenAPI-spec en het JWKS-endpoint.
* Inkomend binnen de LPC: health en metrics voor het platform.
* Uitgaand naar internet: NotifyNL en de geregistreerde webhook-URL's van dienstverleners. Een webhook-URL op een intern adres wordt geweigerd; een egress-NetworkPolicy legt dezelfde grens op netwerkniveau vast.
* Uitgaand binnen de LPC: de Profielservice, PostgreSQL, de Clickhouse-endpoint van het LDV, de secretsvoorziening en de JWKS van de IAM-gateway.

### Secrets in de secretsvoorziening

| Secret | Gebruik | Rotatie |
|--------|---------|---------|
| Databasegebruiker en -wachtwoord, JDBC-URL | koppeling 6 | vrij, geen gegevens afhankelijk |
| NotifyNL API-key | koppeling 2 | vrij; nieuwe key bij NotifyNL aanmaken, oude intrekken |
| Callback bearer-token | koppeling 3 | nu één token; doelontwerp ADR 0024: twee geldige tokens tegelijk, zodat NotifyNL kan omschakelen |
| Hash-pepper | HMAC van het LDV-subject-id | nu één pepper zonder versie, alleen voor het LDV-subject-id; doelontwerp ADR 0024: HMAC van dvRef en identificerend nummer met pepper per doel met versie, nieuwe versie voor nieuwe rijen, zoeken over alle levende versies |
| KEK-versies met de huidige versie | sleutel per notificatie | nu alleen versiewissel voor nieuwe rijen; doelontwerp ADR 0024: de onderhoudstaak herverpakt bestaande sleutels |
| Private sleutel en key-id van de webhook-JWT | koppeling 5 | nieuwe sleutel naast de oude in de JWKS; oude vervalt na de geldigheidsduur van de tokens |
| Clickhouse-gebruiker en -wachtwoord | koppeling 7 | vrij |

De FSC-certificaten van de inway en de clientcredentials voor de Profielservice horen bij het platform en de FSC-inrichting, niet bij de applicatieconfiguratie.

### Buiten deze beslissing

* Hoe het NMC de secretsvoorziening op de LPC benadert: injectie door het platform of een aanroep van de Vault-API bij het opstarten.
* Of verkeer tussen MOZa-componenten binnen de LPC over FSC loopt (open besluit uit ADR 0025).
* Of de Notificatiedienst een eigen FSC-peer met eigen OIN wordt of meelift op een bestaande inway van Logius.
* Het contract met de Contactherstelservice en de Printstraat wanneer contactherstel wordt toegevoegd.
* De tenancy bij NotifyNL (ADR 0024).

## Verwijzingen

* [notificatiedocs §06 Software architectuur](../notificatiedocs/06-software-architectuur.md)
* [notificatiedocs §10 Deployment](../notificatiedocs/10-deployment.md)
* [MinBZK/moza-notificatiemanagementcomponent](https://github.com/MinBZK/moza-notificatiemanagementcomponent): `application.properties` en `docs/zad-deploy.md` voor de configuratiesleutels en omgevingsvariabelen
* [GOV.UK Notify REST API](https://docs.notifications.service.gov.uk/rest-api.html): authenticatie, callbacks en statussen
* [FSC, Federated Service Connectivity](https://fsc-standaard.nl/): inway, outway en contracten
* [NL GOV Assurance profile for OAuth 2.0](https://logius-standaarden.github.io/OAuth-NL-profiel/)
* [NL GOV profile for CloudEvents](https://logius-standaarden.github.io/NL-GOV-profile-for-CloudEvents/)
* [Logboek Dataverwerkingen](https://logius-standaarden.github.io/logboek-dataverwerkingen/)
