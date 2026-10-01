# Productiegereedheid van de NMC
## Algemene production ready checklist

Datum: 2026-09-23. Levend document — de status hieronder geldt op dat moment; sommige punten die nodig zijn voor production-ready kunnen inmiddels al voltooid zijn.

## Legenda

Elk onderdeel hieronder heeft een status:

- **Aanwezig** — bestaande CI-checks of documentatie dekken dit al
- **Actie nodig** — moet nog gebeuren of belegd worden vóór productie
- **Besluit nodig** — vraagt een keuze, geen losse actie
- **Niet van toepassing** — expliciet uitgesloten, met reden (zie onderaan)

De kolom **Story** bevat de link naar de bijbehorende story zodra die is aangemaakt.

## Infrastructuur, netwerk & TLS

| Item | Status | Toelichting | Story                                                                                        |
| --- | --- | --- |----------------------------------------------------------------------------------------------|
| Beslissen domein naam | Actie nodig | Om een domeinnaam aan te vragen en te registreren moeten we wel eerst bepalen wat de domeinnaam gaat zijn | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1148 |
| Domeinnaam aangevraagd bij Min AZ | Actie nodig | Los van het Websiteregister (zie "Niet van toepassing"): AZ moet apart geïnformeerd worden over het productie-domein/URL (URL registratie), zodat bekend is dat de NMC daar draait | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1149 |
| Opname in LPC-loadbalancer & hosting-allowlist | Actie nodig | | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1165 |
| DV/OV-certificaat (evt. met SAN) | Actie nodig | | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1167 |
| internet.nl-test | Actie nodig | Geldt voor elke HTTPS-service, niet alleen websites | https://github.com/MinBZK/MijnOverheidZakelijk/issues/866 (spits story nog wel toe voor NMC) |
| SSL Labs-test | Actie nodig | | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1168 |
| X-Forwarded-For wegschrijven voor forensisch onderzoek | Actie nodig | Hoort bij het bestaande Logboek Dataverwerkingen (LDV), dat nu nog uitstaat op preview (`LOGBOEKDATAVERWERKING_ENABLED=false`) totdat de ClickHouse-config werkt | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1169 |

## Beveiliging

| Item | Status | Toelichting | Story |
| --- | --- | --- | --- |
| BIO-toetsing / pentest | Actie nodig | Formele stap, zwaarder dan de geautomatiseerde scans die al in CI draaien (CodeQL, Scorecard, ClusterFuzzLite). BIO is gebaseerd op ISO 27001/27002, dus deze story bevat ook backup-herstel, bedrijfscontinuïteit, RTO en RPO voor de managed Postgres — voorheen een los item ("Backup & disaster recovery"), nu hierin opgenomen | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1170 |
| SAST (statische codeanalyse) | Aanwezig | CodeQL draait al in CI op elke PR/push (zie `.github/workflows/`) | |
| DAST (dynamische scan tegen een draaiende instantie) | Actie nodig | Nog niets ingericht. [WuppieFuzz](https://github.com/TNO-S3/WuppieFuzz) (TNO, open source) is specifiek gebouwd voor REST API's: genereert requests uit de OpenAPI-spec en meet coverage via JaCoCo, wat al onderdeel is van de bestaande JaCoCo-gate. Alternatief: OWASP ZAP | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1171 |
| `CallbackUrlValidator`'s SSRF-beperking | Besluit nodig | De validator is bewust een denylist op vorm, geen volledige SSRF-bescherming (staat zo in de javadoc); `callbackUrl` is aanroeper-gestuurd. Risico expliciet accepteren of dichten? | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1049 |
| Securityheaders-check | Actie nodig | Op de API toegesneden, niet de generieke browserscanner: HSTS/`X-Content-Type-Options` relevant, CSP grotendeels niet voor een JSON-API zonder HTML-rendering | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1172 |
| `security.txt` | Aanwezig | Staat al op `src/main/resources/META-INF/resources/.well-known/security.txt` (Contact: moza@minbzk.nl, Expires: 2027-06-16, Preferred-Languages: nl/en), niet verlopen. Open: is dat contactadres daadwerkelijk gemonitord, en is er een reminder om het vóór de Expires-datum te vernieuwen? | |
| Idempotency-Key op schrijvende endpoints | Actie nodig | `POST /centraal/notificaties` en `/decentraal/notificaties` hebben geen idempotency-mechanisme; een client-retry na een timeout kan een dubbele notificatie/e-mail opleveren. API Design Rules noemt een `Idempotency-Key`-header als standaardpatroon voor niet-idempotente operaties | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1174 |
| Cyberbeveiligingswet (NIS2) | Besluit nodig | Sinds 15-8-2026 van kracht. Valt de NMC, als gedeelde notificatie-infrastructuur voor meerdere Dienstverleners, onder de reikwijdte (essentiële/belangrijke dienst)? Zo ja: risicoanalyse, incidentmelding en registratie in het entiteitenregister zijn dan verplicht | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1202 |

## Privacy & gegevensbescherming

| Item | Status | Toelichting | Story |
| --- | --- | --- | --- |
| AVG-verplichtingen algemeen | Actie nodig | | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1205 |
| DPIA | Besluit nodig | De NMC verwerkt BSN/KVK/RSIN centraal voor meerdere Dienstverleners. Bestaat er al een DPIA op MijnOverheidZakelijk-programmaniveau die de NMC expliciet dekt, of is een eigen DPIA nodig? | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1204 |
| Retentiejob | Actie nodig | Dataminimalisatie richting de AVG | https://github.com/MinBZK/MijnOverheidZakelijk/issues/757 |

## Open standaarden & authenticatie

| Item | Status | Toelichting | Story |
| --- | --- | --- | --- |
| Forumstandaardisatie.nl / pas-toe-of-leg-uit | Actie nodig | Concreet van toepassing, via developer.overheid.nl/kennisbank: de OpenAPI Specification (eigen verplichte standaard, los van de API Design Rules), de API Design Rules zelf, en het NL GOV profile for CloudEvents (verplicht sinds 25-9-2025 — de NMC gebruikt al CloudEvents voor de consument-callback, nog te toetsen tegen het profiel) | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1206 |
| OpenAPI-publicatie op de standaardlocatie | Actie nodig | De API Design Rules (`publish-openapi`) eisen `/openapi.json` achter de base-URL, zonder authenticatie en met `Access-Control-Allow-Origin: *`. De NMC publiceert nu op `/q/openapi` (Quarkus-default), niet op `/openapi.json` | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1207 |
| Authenticatiemechanisme voor Dienstverleners | Actie nodig | Ontwerpbeslissing inmiddels gemaakt (zie kwaliteitseisen, ADR 0024): OAuth2-toegangstoken volgens het NL GOV Assurance profile for OAuth 2.0, uitgegeven door de IAM-gateway van MOZa, met het OIN als claim, koppelvlakken over FSC. Nog niet geïmplementeerd in de NMC-code (geen OAuth2/IAM-gateway-integratie aanwezig) | https://github.com/MinBZK/MijnOverheidZakelijk/issues/880 |
| Doorlopen [beslisboom open standaarden](https://www.forumstandaardisatie.nl/beslisboom/beslisboom-open-standaarden) | Actie nodig | Interactieve tool van Forum Standaardisatie; handmatig doorlopen per relevante keuze (o.a. authenticatiemechanisme, berichtformaat/CloudEvents). | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1208 |

## Operationele gereedheid

| Item | Status | Toelichting | Story |
| --- | --- | --- | --- |
| Secretsbeheer & rotatie | Actie nodig | `notify.api-key`, `notify.callback.bearer-token`, `hash.pepper` staan nu handmatig in ZAD Operations Manager, zonder vault en zonder rotatieprocedure | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1209 |
| Observability / alerting | Actie nodig | Grefana/Gibana nodig voor NMC. Wel mogelijk op LPC, nog niet op ZAD. | https://github.com/MinBZK/MijnOverheidZakelijk/issues/837 |
| Migratieveiligheid | Actie nodig | Bekende bevinding: de statusgeschiedenis-migratie doet expand én contract in één script (breekt rollback en rolling deploy). Geaccepteerd zolang er geen productie is — moet vóór januari opgelost zijn | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1246 |
| Rate limiting | Actie nodig | | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1247 |
| Load-/performancetest | Actie nodig | Capaciteit tegen verwacht productievolume nog niet gevalideerd. Workload-model inmiddels bekend (kwaliteitseisen): piek van 2,2 miljoen notificaties van één Dienstverlener per maand, af te voeren binnen vijf werkdagen, met eerlijke verdeling over Dienstverleners in het claim/batch-model | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1248 |
| Incident-runbook/beheer | Actie nodig | Bijv. DB-storing: wie is on-call en wat is de procedure? | https://github.com/MinBZK/MijnOverheidZakelijk/issues/844 |
| Afspraken rondom releasegang | Besluit nodig | Wie het releasebesluit neemt is al vastgesteld op MOZa-niveau (ADR 0022 §2: geen release-managerrol, elk teamlid mag releasen) — dat geldt ook terwijl de ADR nog "Proposed" is, los van open punt O1 (LPC-deploy). Nog open: wie het rollback-besluit voor de NMC neemt en binnen welke termijn — ADR 0022 §7 verwijst dat door naar afstemming met ADR 0017 stap 6, zonder het zelf in te vullen. Ook het escalatiepad bij onbereikbaarheid ontbreekt nog | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1187 |

## Functionele scope

Voor elk moet expliciet vastgelegd worden of het wel of bewust niet meegaat voor januari (stilzwijgend ontbreken is geen besluit). Zie ook [ADR 0020 — Standaard afleverstatus-terugkoppeling](../decisions/0020-standaard-afleverstatus-terugkoppeling.md) voor de aanverwante, nog niet vastgestelde keuze rond een status-query endpoint.

| Onderdeel | Voor januari? | Story |
| --- | --- | --- |
| Endpoint om de status op te vragen | Besluit nodig | https://github.com/MinBZK/MijnOverheidZakelijk/issues/904 |
| Contactherstel | Niet van toepassing | |
| Templating Service-koppeling (nu vaste NotifyNL-template-ID's) | Niet van toepassing | |
| OMC-koppeling | Niet van toepassing | |
| Keuze herverzending vs. contactherstel | Niet van toepassing | Ontwerpbeslissing inmiddels gemaakt in ADR 0024 (eenmalige herverzending bij `temporary-failure`/`technical-failure`; het besluit of een mislukte notificatie tot een nieuw bericht leidt blijft bij de Dienstverlener), maar de implementatie valt onder de event-driven-refactor-epic en staat niet gepland voor januari | |

## Productie-deploypipeline

| Item | Status | Toelichting | Story |
| --- | --- | --- | --- |
| Geteste pipeline naar het echte productiecluster (LPC) | Actie nodig | ZAD is uitsluitend de PR-preview-omgeving; "echte releases draaien op een ander cluster" volgens de eigen projectdocumentatie. Nog te bevestigen dat die pipeline naar LPC getest bestaat, zodat "geen verschil tussen pre-prod- en prod-code" ook in de praktijk klopt en niet alleen als aanname | https://github.com/MinBZK/MijnOverheidZakelijk/issues/1199 |

## Niet van toepassing

De NMC is een backend-API zonder eigen UI. Een deel van de oorspronkelijke checklist komt uit een generieke Rijkswebsite-checklist en is hier niet van toepassing. 

| Item | Waarom niet van toepassing |
| --- | --- |
| F12-inspector / alleen 200's | Geen browser-UI om te inspecteren — vervangen door synthetic monitoring op de echte endpoints |
| Piwik-analytics | Geen eindgebruikersbrowsersessies op een backend-API |
| Websiteregister Rijksoverheid | Geen website, dus geen registratie. Wél een aparte actie: BZK informeren over het productie-domein/URL (zie Infrastructuur), zodat bekend is dat de NMC daar draait |
| Toegankelijkheidstoets (WCAG) | Alleen relevant als Swagger UI publiek in productie zou staan; dat is nu een preview-only build-flag (`-Dquarkus.swagger-ui.always-include=true`). Bevestigen dat dit zo blijft, dan vervalt dit item volledig |

## Vervolgstappen

1. Eigenaren en een deadline vóór januari beleggen bij de aangemaakte stories (zie de Story-kolom per tabel hierboven)
2. Stories uitvoeren en status in dit document bijwerken na implementatie
