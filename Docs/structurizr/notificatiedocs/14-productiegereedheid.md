# Productiegereedheid van de NMC

Stand per 2026-10-07. Dit document wordt bijgewerkt zolang de stories lopen.

Dit document past [ADR 0025 Productiegereedheid van MOZa-backendsystemen](../decisions/0025-productiegereedheid-backendsystemen.md) toe op de Notificatie Management Component (NMC). Per besluit uit die ADR staat hier wat de NMC ermee doet, in welke story en met welke status. De NMC moet in januari in productie draaien op de LPC; tot nu toe draait hij alleen op ZAD, als preview per pull request en als `stable`-omgeving op `main`.

Het ontwerp van de NMC zelf staat in [ADR 0024](../decisions/0024-georkestreerde-state-machine-met-eventlog.md).

## Functionele scope voor januari

Uitwerking van besluit 2.

| Onderdeel | Voor januari? | Toelichting | Story |
| --- | --- | --- | --- |
| Aanname, verzending en receiptverwerking | Ja | Volgens ADR 0024 | [#1150](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1150) |
| Herverzending | Ja | Eén herverzending na een `temporary-failure` of `technical-failure` (ADR 0024) | [#1160](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1160) |
| Cursorfeed | Ja | DV's zonder webhook volgen de status via de feed (ADR 0024 §5) | [#1161](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1161) |
| Webhook | Ja | Optioneel per DV, geregistreerd bij onboarding (ADR 0024 §5) | [#1162](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1162) |
| Status-query | Besluit nodig | Aanvulling op de feed om één notificatie direct op te vragen | [#904](https://github.com/MinBZK/MijnOverheidZakelijk/issues/904) |
| Contactherstel | Nee | | |
| Koppeling Templating Service | Nee | De NMC gebruikt vaste NotifyNL-template-ID's | |
| OMC-koppeling | Nee | | |

## Open besluiten voor de NMC

| Besluit | Waarom open | Story |
| --- | --- | --- |
| Domeinnaam | Wordt uitgewerkt in de context van FSC: het adres waaronder de Inway de NMC ontsluit | [#1148](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1148) |
| NotifyNL via FSC of via het platform? | NotifyNL komt naar verwachting ook binnen de LPC te draaien (open besluit in ADR 0025). ADR 0024 gaat nog uit van verkeer over het publieke internet: NotifyNL pusht de receipts vanaf internet en de NMC roept NotifyNL aan met een HS256-JWT. ADR 0024 wordt bijgewerkt zodra dit besloten is | — |
| Valt de NMC onder de Cyberbeveiligingswet? | Vraagt juridische/compliance-input (besluit 13) | [#1202](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1202) |
| Status-query voor januari? | Zie *Functionele scope* | [#904](https://github.com/MinBZK/MijnOverheidZakelijk/issues/904) |
| Wie besluit tot rollback | ADR 0022 legt de mechaniek vast, niet wie besluit en binnen welke termijn (besluit 24) | [#1249](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1249) |
| RTO en RPO | Bepalen de back-upfrequentie en de herstelvoorzieningen (besluit 10) | [#1170](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1170) |

## Uitwerking per besluit

**Legenda**

- **Aanwezig**: bestaande CI-checks, code of documentatie dekken dit al
- **Actie nodig**: moet nog gebeuren of belegd worden vóór productie
- **Besluit nodig**: vraagt een keuze, zie *Open besluiten*
- **Bij Logius**: wordt door Logius opgepakt; de NMC levert input
- **Niet van toepassing**: vervalt op grond van het besluit; de story kan in refinement worden afgesloten

### Toepasbaarheid

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 1 | F12-inspectie, Piwik, Websiteregister, WCAG | Niet van toepassing | Swagger UI staat alleen aan in de preview (`-Dquarkus.swagger-ui.always-include=true`) | |
| 3 | DPIA | Bij Logius | Op niveau van de Notificatiedienst | [#1204](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1204) |
| 3 | Verwerkersovereenkomsten, verwerkingsregister, betrokkenenrechten | Bij Logius | Wacht op de DPIA van de Notificatiedienst | [#1205](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1205) |
| 3 | Operational readiness / incident-runbook | Bij Logius | MOZa ondersteunt | [#844](https://github.com/MinBZK/MijnOverheidZakelijk/issues/844) |

### Hosting en ontsluiting

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 4 | LPC-onboarding | Actie nodig | Gitlab-project, Harbor, namespace, Vault-tenant, managed Postgres. Wacht op toegang | [#961](https://github.com/MinBZK/MijnOverheidZakelijk/issues/961) |
| 4, 5 | Opname in LPC-loadbalancer & hosting-allowlist | Actie nodig | In refinement: wat blijft nodig nu de NMC alleen via de FSC-Inway bereikbaar is? | [#1165](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1165) |
| 5 | Domein melden bij Min AZ | Besluit nodig | Te onderzoeken (BA); open besluit in ADR 0025 | [#1149](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1149) |
| 6 | DV/OV-certificaat | Niet van toepassing | | [#1167](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1167) |
| 6 | internet.nl-test | Niet van toepassing | | [#866](https://github.com/MinBZK/MijnOverheidZakelijk/issues/866) |
| 6 | SSL Labs-test | Niet van toepassing | | [#1168](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1168) |
| 6 | `security.txt` | Niet van toepassing | Het bestand staat nu nog in de code (`.well-known/security.txt`) | |
| 7 | Response headers | Actie nodig | Alleen `nosniff`; vaststellen of de LPC of de Inway hem al zet | [#1172](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1172) |
| 8 | Herleidbaarheid aanroeper | Actie nodig | Nagaan wat Inway en LPC-gateways doorgeven. LDV staat op preview nog uit (`LOGBOEKDATAVERWERKING_ENABLED=false`) | [#1169](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1169) |

### Beveiliging

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 9 | SAST, Dependabot, Scorecard | Aanwezig | CodeQL op elke PR/push; daarnaast ClusterFuzzLite | |
| 9 | DAST | Actie nodig | Nachtelijke ZAP API-scan. Een geslaagde POST verstuurt een echte e-mail via NotifyNL; de scan moet dat voorkomen | [#1171](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1171) |
| 10 | BIO-toetsing, pentest en continuïteit | Actie nodig | Inclusief back-up en geteste restore van de managed Postgres | [#1170](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1170) |
| 11 | Idempotency-Key | Actie nodig | Op `POST /centraal/notificaties` en `/decentraal/notificaties` | [#1174](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1174) |
| 12 | SSRF-bescherming webhook | Actie nodig | De webhook wordt per DV bij onboarding geregistreerd (ADR 0024 §5) | [#1049](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1049) |
| 13 | Cyberbeveiligingswet | Besluit nodig | | [#1202](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1202) |
| 14 | Secretsbeheer & rotatie | Actie nodig | `notify.api-key`, `notify.callback.bearer-token`, `hash.pepper`, KEK-versies en de webhook-JWT-sleutel staan nu handmatig in ZAD Operations Manager. De KEK-rotatie (#1155) dient als model | [#1209](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1209) |

### Privacy

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 15 | Retentie en wissen | Actie nodig | De retentiejob uit #757 wordt vervangen door de wistaak en onderhoudstaak uit ADR 0024: wissen van de sleutel per notificatie, en opruimen van het eventlog na de bewaartermijn van het afleverbewijs | [#1163](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1163) |
| 16 | Verwerkingslogging (LDV) | Actie nodig | Taakhandlers buiten een REST-request loggen nog niet naar LDV (ADR 0024 §10) | [#962](https://github.com/MinBZK/MijnOverheidZakelijk/issues/962) |

### Open standaarden en authenticatie

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 17 | Pas-toe-of-leg-uit-toets | Actie nodig | Inclusief het NL GOV CloudEvents-profiel; ADR 0024 zet `subject` op de notificatie-id | [#1206](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1206) |
| 17 | Beslisboom open standaarden | Actie nodig | | [#1208](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1208) |
| 18 | Authenticatie en autorisatie van DV's | Actie nodig | Besloten in ADR 0024 §9: OAuth2-toegangstoken volgens het NL GOV Assurance profile, uitgegeven door de IAM-gateway van MOZa, met het OIN van de DV als claim. Nog niet geïmplementeerd | [#880](https://github.com/MinBZK/MijnOverheidZakelijk/issues/880) |
| 19 | OpenAPI op `/openapi.json` | Actie nodig | Nu nog op `/q/openapi` | [#1207](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1207) |

### Operationele gereedheid

| Besluit | Item | Status | Toelichting | Story |
| --- | --- | --- | --- | --- |
| 20 | Rate limiting | Actie nodig | Dagquotum per DV en feedlimiet bestaan al, nog zonder `Retry-After` | [#1247](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1247) |
| 21 | Load-/performancetest | Actie nodig | Workloadmodel: piek van 2,2 miljoen notificaties van één DV per maand, af te voeren binnen vijf werkdagen, met eerlijke verdeling over DV's | [#1248](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1248) |
| 22 | Observability / alerting | Actie nodig | Grafana is beschikbaar op de LPC, niet op ZAD | [#837](https://github.com/MinBZK/MijnOverheidZakelijk/issues/837) |
| 23 | Migratieveiligheid | Actie nodig | De breuk in de rollback bij de release van de 1150-stack is op 2026-09-28 geaccepteerd, tot de eerste release met echte notificaties | [#1246](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1246) |
| 24 | Rollback-besluit en escalatiepad | Besluit nodig | | [#1249](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1249) |
| 24 | Release-automatisering (pilot) | Actie nodig | De NMC is de pilotrepository voor ADR 0022 | [#1187](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1187) |
| 25 | Pipeline naar de LPC | Actie nodig | Van GitHub via de LPC-GitLab naar Harbor; overlapt met ADR 0022 O1 | [#1199](https://github.com/MinBZK/MijnOverheidZakelijk/issues/1199) |
