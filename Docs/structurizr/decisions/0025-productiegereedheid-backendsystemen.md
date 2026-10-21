# 25. Productiegereedheid van MOZa-backendsystemen

Datum: 2026-10-07

## Status

Proposed

Het document gaat naar Accepted zodra de punten onder *Open besluiten* zijn genomen. Het bouwt ook voort op ADR 0022 en ADR 0023, die nog Proposed zijn; wijzigen die bij vaststelling, dan wordt dit document daarop bijgewerkt.

## Scope

Deze ADR geldt voor **backendsystemen** van MOZa: systemen zonder eigen gebruikersinterface die een API aanbieden aan andere systemen. Voorbeelden zijn de Notificatie Management Component (NMC), de Profielservice en Contactherstel. Frontends en websites vallen erbuiten.

De ADR is onafhankelijk van het hostingplatform en van wie een dienst beheert. Wat een specifiek backendsysteem met deze besluiten doet (op welk platform het draait, welke stories, welke status, welke afwijkingen), staat in een eigen productiegereedheidsdocument per systeem. Voor de NMC is dat [Productiegereedheid van de NMC](../notificatiedocs/14-productiegereedheid.md).

## Gerelateerde ADRs

* [ADR 0006 Federatieve authenticatie en autorisatie](0006-federatieve-authenticatie-en-autorisatie-op-basis-van-oidc-en-eidas.md): authenticatie van gebruikers richting services.
* [ADR 0007 Logboek Dataverwerkingen](0007-logboek-dataverwer.md) en [ADR 0010 LDV-implementatie](0010-ldv-implementatie.md): verwerkingslogging.
* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): de publieke website, met internet.nl en CSP. Deze ADR legt vast waarom dat voor backendsystemen anders is.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md) en [hoofdstuk 12 Testen](../docs/12-testen.md): teststrategie, waaronder de vastgestelde tooling voor DAST (OWASP ZAP) en performance (k6 of Gatling).
* [ADR 0019 Database-migratiestrategie](0019-database-migratiestrategie.md): het expand/contract-patroon.
* ADR 0022 Releasemanagement MOZa (Proposed, [PR #1175](https://github.com/MinBZK/MijnOverheidZakelijk/pull/1175)): releasen, rollback-mechaniek en open punt O1 (hoe een release op de LPC landt).
* ADR 0023 Keuze tooling voor het testen van de API's (Proposed, [PR #1135](https://github.com/MinBZK/MijnOverheidZakelijk/pull/1135)): Bruno voor handmatig en nachtelijk e2e-testen.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): de uitwerking voor de NMC van onder meer authenticatie, autorisatie per afnemer, quota en het wissen van persoonsgegevens.

## Context

Gangbare eisen voor productiegereedheid bij de Rijksoverheid gaan vaak uit van een website: een anoniem bereikbaar endpoint, een browser en een gebruikersinterface. Een backendsysteem heeft die niet. Een deel van die eisen geldt daarom niet, en een deel moet anders ingevuld worden. Deze ADR legt ook expliciet vast wat een backendsysteem bewust níet doet, met de reden erbij, zodat een ontbrekende toets herkenbaar is als keuze en niet als vergeten punt. Zonder gedeeld kader maakt elk systeem die afweging opnieuw, en is niet te zien waar systemen van elkaar afwijken.

Daarnaast zijn een aantal punten geen technische keuze van het bouwende team, maar liggen ze bij de beheerder van de dienst of bij de partij die het hostingplatform levert.

## Besluit

### Toepasbaarheid

1. **Een backendsysteem wordt getoetst als API, niet als website.** Eisen die uitgaan van een browser-UI vervallen: F12-inspectie, Piwik-analytics, het Websiteregister en de WCAG-toets. Een API-documentatie-UI zoals Swagger UI staat alleen aan in niet-productieomgevingen.
2. **De functionele scope per systeem is expliciet.** Het productiegereedheidsdocument van een systeem legt vast welke functionaliteit wel en niet meegaat naar productie. Iets dat stilzwijgend ontbreekt, telt niet als besluit.
3. **Wat op dienstniveau ligt, regelt het systeem niet zelf.** Een DPIA wordt opgesteld op het niveau van de dienst of het proces, niet per applicatie. Hetzelfde geldt voor verwerkersovereenkomsten, het verwerkingsregister, de afhandeling van verzoeken van betrokkenen en het operational-readiness-document. Wie dat oppakt, hangt af van wie de dienst beheert, en staat in het productiegereedheidsdocument van het systeem. Het backendsysteem levert de technische input.

### Hosting en ontsluiting

4. **Het hostingplatform wordt per systeem gekozen.** Deze ADR schrijft geen platform voor. Het productiegereedheidsdocument van een systeem legt vast op welk platform productie draait, en welke voorzieningen dat platform levert: back-up, secretsvoorziening, observability en netwerktoegang. Wat het platform niet levert, regelt het systeem zelf.
5. **Afnemers bereiken een backendsysteem alleen via FSC.** Elke afnemer heeft een FSC-contract nodig. Het adres van de Inway is publiek bereikbaar via internet, maar niet anoniem: zonder geldig contract en PKIoverheid-certificaat weigert de Inway de aanroep. Transportbeveiliging komt van FSC (mTLS binnen het PKI-vertrouwenskader). Naast de Inway heeft het systeem geen eigen publiek bereikbaar endpoint. Of verkeer tussen MOZa-componenten onderling ook via FSC loopt, is een open besluit.
6. **Toetsen op een publiek endpoint gebeuren op het Inway-adres.** Wat buitenstaanders van een backendsysteem kunnen zien, is de TLS- en DNS-configuratie van het adres waaronder de Inway het systeem ontsluit. Daarom:
   * worden de internet.nl- en SSL Labs-toets uitgevoerd op dat Inway-adres. Vraagt de Inway al tijdens de handshake om een clientcertificaat en mislukt de toets daardoor, dan wordt dat vastgelegd;
   * is er geen publiek DV/OV-certificaat nodig; FSC werkt met PKIoverheid-certificaten;
   * is er geen securityheaders.com-toets; die toetst headers die browsers beschermen (zie besluit 7);
   * staat er geen `security.txt` op het systeem zelf, omdat `/.well-known/security.txt` achter de Inway alleen met een contract bereikbaar is. Kwetsbaarheden worden gemeld via de responsible-disclosure-regeling van MinBZK (de organisatiebrede [`SECURITY.md`](https://github.com/MinBZK/.github/blob/main/SECURITY.md)), die verwijst naar het meldpunt van het NCSC.
7. **Response headers worden afgestemd op een JSON-API.** Een backendsysteem zet `X-Content-Type-Options: nosniff`, zodat een client de response niet als iets anders dan JSON interpreteert. Headers die browsers beschermen (CSP, `X-Frame-Options`, `Referrer-Policy`, HSTS) zijn niet van toepassing. Waar het hostingplatform of de Inway headers al centraal zet, wordt dat alleen geverifieerd.
8. **De aanroeper is herleidbaar voor forensisch onderzoek.** Achter de Inway en eventuele gateways van het hostingplatform is het bronadres niet dat van de aanroeper. Vastgelegd worden de identiteit uit het FSC-contract en het token, en `X-Forwarded-For` voor zover die wordt doorgegeven. Dit komt in een voorziening met audittrail-eisen, niet in de gewone applicatielog.

### Beveiliging

9. **Testen volgens de MOZa-teststrategie.** SAST (CodeQL), Dependabot en OpenSSF Scorecard draaien op de repository van elk backendsysteem. Daar komt een nachtelijke OWASP ZAP API-scan bij, aangestuurd door de OpenAPI-spec. Heeft een aanroep bijwerkingen buiten het systeem, zoals het versturen van een e-mail, dan wordt de scan zo ingericht dat die bijwerkingen niet bij echte ontvangers of externe diensten terechtkomen.
10. **BIO-toetsing en pentest zijn de formele toets, inclusief continuïteit.** Per systeem worden RTO en RPO vastgesteld. Back-up en herstel en het bedrijfscontinuïteitsplan horen bij de BIO-toetsing; een restore wordt daadwerkelijk getest. Bevindingen worden opgelost, of geaccepteerd met motivatie en een verantwoordelijke.
11. **Niet-idempotente schrijvende endpoints accepteren een `Idempotency-Key`.** Een retry van de client na een timeout mag geen dubbele verwerking opleveren. Dit volgt het patroon uit de NL GOV API Design Rules. De sleutel wordt in dezelfde transactie vastgelegd als het resultaat.
12. **Roept een systeem URL's aan namens een afnemer, zoals een webhook, dan worden die bij onboarding geregistreerd.** Een afnemer geeft geen URL per aanroep mee. Een geregistreerde URL wordt gecontroleerd op interne adressen (resolve-and-refuse en/of een egress-NetworkPolicy), om server-side request forgery te voorkomen.
13. **Per systeem wordt beoordeeld of de Cyberbeveiligingswet (NIS2) van toepassing is.** De uitkomst en de gebruikte criteria worden vastgelegd. Bij een positieve uitkomst volgen registratie, risicoanalyse en een incidentmeldingsproces.
14. **Secrets staan in een secretsvoorziening, met een rotatieprocedure per secret.** Welke voorziening dat is, hangt af van het hostingplatform (besluit 4). Secrets die pseudonimisering of versleuteling dragen, krijgen een rotatie die bestaande gegevens bruikbaar houdt, of een bewuste keuze om de correlatie te verbreken.

### Privacy

15. **Bewaar- en wistermijnen zijn per systeem vastgelegd, en het wissen is geautomatiseerd.** Persoonsgegevens worden niet langer bewaard dan nodig, en het wissen gebeurt door een taak, niet handmatig.
16. **Elke verwerking van persoonsgegevens wordt gelogd volgens het Logboek Dataverwerkingen.** Dat geldt ook voor verwerkingen in achtergrondtaken buiten een REST-aanroep.

### Open standaarden en authenticatie

17. **De pas-toe-of-leg-uit-standaarden worden systematisch getoetst.** Minimaal de OpenAPI Specification en de API Design Rules, en waar van toepassing het NL GOV-profiel voor CloudEvents. De beslisboom van Forum Standaardisatie wordt handmatig doorlopen ter bevestiging.
18. **Het systeem authenticeert en autoriseert elke aanroep zelf, ook achter FSC.** Dat de Inway een aanroep doorlaat, is niet genoeg. De enige uitzondering is de OpenAPI-spec (besluit 19). Een afnemer werkt uitsluitend binnen zijn eigen gegevens; gegevens van een andere afnemer bestaan voor hem niet. Het mechanisme verschilt per systeem en wordt per systeem vastgelegd: voor aanroepen namens gebruikers is dat ADR 0006, voor de NMC ADR 0024 §9, en de Profielservice hervalideert het FSC-token zelf ([§09 Infrastructuur](../profielservicedocs/09-infrastructuur-architectuur.md)).
19. **De OpenAPI-spec staat op `/openapi.json` binnen FSC.** Dat is de standaardlocatie uit de API Design Rules, zonder extra authenticatie bovenop FSC. Een CORS-header is niet nodig: er is geen browser die de spec cross-origin ophaalt. Een aparte publieke kopie is niet nodig: de code is open source, en wie vóór een FSC-contract wil zien wat een systeem biedt, kan daar terecht.

### Operationele gereedheid

20. **Rate limiting gebeurt per afnemer, en elke 429 krijgt een `Retry-After`.** Eerst wordt vastgesteld of de Inway of het hostingplatform al misbruikbescherming biedt; anders gebeurt het in de applicatie. Drempelwaarden volgen uit het workloadmodel van het systeem.
21. **Performance wordt getest tegen een drempel, niet als rapport.** Met k6 of Gatling, conform de teststrategie, tegen een workloadmodel per systeem. Er komen een lichte regelmatige run en een zwaardere pre-release-run met soak-test.
22. **Elk systeem is observeerbaar.** Elk systeem levert health endpoints, metrics en de alarmen uit zijn kwaliteitseisen, aangesloten op de observability-voorziening van het hostingplatform.
23. **Expand/contract geldt per release, niet per script.** Een `DROP` landt pas in een release ná de release waarin niets de kolom of tabel nog leest, zodat een rollback van één release altijd mogelijk is.
24. **Release en rollback volgen ADR 0022.** Elk teamlid mag releasen via PR, review en CI. Een rollback gaat terug naar de digest van de vorige versie. Per systeem wordt vastgelegd wie tot een rollback besluit, binnen welke termijn en wat het escalatiepad is.
25. **Productie draait op een geteste pipeline naar het hostingplatform.** Hetzelfde artefact gaat van pre-productie naar productie. Pas als die route getest is, klopt de aanname dat er geen verschil is tussen pre-prod- en prod-code.

## Open besluiten

Deze punten zijn nog niet genomen. Ze blokkeren de overgang naar Accepted.

| Besluit | Waarom open |
| --- | --- |
| Verkeer tussen MOZa-componenten via FSC? | Besluit 5 geldt voor afnemers. Of MOZa-componenten onderling ook via FSC communiceren, of bij hosting op hetzelfde platform via het netwerk van dat platform, is nog niet besloten. Voorbeeld: NotifyNL, dat de NMC aanroept om afleverstatussen terug te melden en door de NMC wordt aangeroepen om e-mail te versturen |
| Domein melden bij Min AZ? | Een backendsysteem heeft geen website, maar het Inway-adres is wel publiek bereikbaar (besluit 5). Of zo'n domein bij Min AZ gemeld moet worden, wordt onderzocht |

## Gevolgen

### Wat dit oplevert

* Eén kader voor alle MOZa-backendsystemen, ongeacht het hostingplatform. Afwegingen worden één keer gemaakt, en afwijkingen per systeem zijn zichtbaar.
* Er wordt niet getoetst op websitecriteria die voor een API geen betekenis hebben, en dat is onderbouwd.
* Het kader is naast de eisen van een dienstbeheerder of platformleverancier te leggen, zodat zichtbaar wordt waar de gaten zitten.

### Wat dit kost

* Elk backendsysteem houdt een eigen productiegereedheidsdocument bij.
* Elke afnemer moet eerst een FSC-contract hebben. Dat voegt een onboardingstap toe.
* Een aantal punten hangt af van de dienstbeheerder of de platformleverancier (DPIA, secretsvoorziening, operational readiness, onboarding op het platform). De doorlooptijd daarvan ligt niet bij het team.

### Risico's

* Zolang de onboarding op het hostingplatform niet rond is, zijn FSC-Inway, pipeline, observability en secrets niet in te richten.
* Als de pipeline naar het hostingplatform de digest niet behoudt (ADR 0022 O1), is de belofte dat precies hetzelfde artefact wordt uitgerold niet waar te maken.
