# 32. Beheer van TLS-certificaten: ACME voor publiek vertrouwde certificaten, handmatige vernieuwing voor PKIoverheid

Datum: 2026-11-04

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): het CAA-record van `mijnoverheidzakelijk.nl` staat alleen Let's Encrypt toe als uitgever.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): backendsystemen zijn op de LPC alleen via de FSC-Inway bereikbaar, met PKIoverheid-certificaten.
* [ADR 0026 Domein en hostnamen notificatiedienst](0026-domein-en-hostnamen-notificatiedienst.md): de hostnamen waarvoor certificaten nodig zijn.

## Context

De maximale geldigheidsduur van publiek vertrouwde certificaten daalt de komende jaren tot 47 dagen (CA/Browser Forum), en Let's Encrypt geeft certificaten uit met een looptijd van 90 dagen en korter. Waar MOZa zijn eigen certificaten moet beheren, passen handmatige uitgifte en vernieuwing daar niet meer bij.

ACME (RFC 8555) is het protocol waarmee een client bij een certificaatautoriteit een certificaat aanvraagt, de zeggenschap over de hostnamen aantoont en het certificaat vernieuwt, zonder tussenkomst van een beheerder. Let's Encrypt is een ACME-autoriteit die browsers vertrouwen. ACME staat sinds 1 januari 2026 op de pas-toe-of-leg-uit-lijst van het Forum Standaardisatie voor het verkrijgen, vernieuwen en intrekken van publiek vertrouwde TLS-certificaten; voor niet-publiek vertrouwde certificaten is ACME aanbevolen, en de wijze van domeinvalidatie is vrij. Voorwaarde is dat de via ACME gebruikte autoriteit in het CAA-record van het domein staat. In het cluster voert cert-manager het protocol uit: een `Issuer` beschrijft de autoriteit en de challenge, een `Certificate` beschrijft de hostnamen en het doel-secret.

Naast de publieke certificaten gebruikt MOZa certificaten onder de private root van PKIoverheid (Staat der Nederlanden Private Root CA): voor de inway en outway van FSC, en voor mutual TLS naar NotifyNL als die partij een PKIoverheid-certificaat vereist. PKIoverheid geeft sinds december 2022 geen publiek vertrouwde webservercertificaten meer uit, en browsers vertrouwen de private root niet; voor het portaal is PKIoverheid daarom geen optie. De TSP's van PKIoverheid (KPN, Digidentity, DigiCert) geven servercertificaten alleen uit via hun portaal, op een CSR van een geregistreerde certificaatbeheerder; geen van hen biedt ACME. De looptijd van een PKIoverheid-servercertificaat is in de praktijk een jaar; KPN geeft vanaf 28 oktober 2026 alleen nog certificaten van één jaar uit. Bij vernieuwing vereist PKIoverheid een nieuw sleutelpaar.

### Per platform

MOZa draait op drie platformen. Hoe een eigen certificaat op het platform komt, verschilt per platform.

* **Standaard Platform.** Hier draaien het portaal en de andere publieke hostnamen van `mijnoverheidzakelijk.nl`, achter de eigen gateway van MOZa. Het certificaat staat als secret in de namespace van de gateway. MOZa beweegt van dit platform weg.
* **ZAD.** Hier draaien de ontwikkel- en previewomgevingen. Voor de URL's die ZAD zelf uitgeeft levert het platform het certificaat. Voor een eigen URL doet het platform dat niet; daarvoor moet MOZa zelf certificaatbeheer inrichten, bijvoorbeeld met cert-manager. Hoe dat op ZAD het beste kan, moet nog worden onderzocht en besproken met het beheer van ZAD, dat hier mogelijk een voorziening voor kan bieden. Een eigen certificaat gaat met de sleutel als bijlage naar de component, en het platform geeft het TLS-verkeer ongewijzigd door (passthrough). De FSC-componenten op ZAD gebruiken zo certificaten van de test-CA van het FSC-testnet; een PKIoverheid-certificaat gaat langs dezelfde weg.
* **Logius Private Cloud (LPC).** Hier komen de systemen van MOZa in productie. Een systeem dat via FSC wordt ontsloten gebruikt PKIoverheid-certificaten op de Inway en Outway (ADR 0025, besluit 5 en 6). Niet elk systeem van MOZa wordt via FSC ontsloten; een systeem met een eigen publieke hostname heeft een publiek vertrouwd certificaat nodig. Daarvoor draait MOZa op de LPC naar verwachting een eigen cert-manager. Certificaten en sleutels staan op de LPC in HashVault.

## Decision

Waar MOZa zijn eigen publieke TLS-certificaten moet beheren, doet het dat met ACME via cert-manager, met Let's Encrypt als certificaatautoriteit. Dat is nu het geval op het Standaard Platform; op de LPC geldt hetzelfde voor een systeem met een publieke hostname.

* Elke publieke hostname staat in een `Certificate`-resource; cert-manager vraagt het certificaat aan, bewaart het in het secret waarnaar de gateway verwijst en vernieuwt het 30 dagen vóór de vervaldatum.
* De zeggenschap over een hostname wordt aangetoond met de HTTP-01-challenge via een tijdelijke HTTPRoute op de eigen gateway.
* De ACME-accountsleutel is een secret in de namespace van de gateway.

PKIoverheid-certificaten worden handmatig vernieuwd, per certificaat en per looptijd van de TSP. Dat geldt op elk platform waar MOZa een PKIoverheid-certificaat houdt; op de LPC zijn dat de certificaten van de FSC-Inway en Outway.

* Per certificaat genereert MOZa een nieuw sleutelpaar en een CSR, dient die in bij de TSP en plaatst het ontvangen certificaat met de sleutel in de secretvoorziening van het platform: als sealed secret op het Standaard Platform, in HashVault op de LPC, als bijlage op ZAD.
* De vervaldatum van elk PKIoverheid-certificaat valt onder dezelfde bewaking als de ACME-certificaten, met een voorlooptijd die de doorlooptijd van de TSP dekt.

## Consequences

* Op de LPC hangt het beheer af van de ontsluiting: een systeem achter FSC kent alleen de jaarlijkse PKIoverheid-cyclus, een systeem met een publieke hostname valt onder ACME.
* Een certificaat wordt pas uitgegeven als elke hostname erin via DNS en de edge van het platform bereikbaar is op het moment van de challenge. Een hostname die nog niet bereikbaar is, blokkeert de uitgifte van het hele certificaat. Hostnamen gaan daarom pas in een `Certificate` als DNS en routering staan, of krijgen een eigen `Certificate`.
* Let's Encrypt hanteert limieten op mislukte validaties per hostname. Nieuwe hostnamen worden eerst tegen de staging-omgeving van Let's Encrypt gevalideerd.
* De gereedheid van elke `Certificate` en de vervaldatum van elk certificaat worden bewaakt, zodat een vastgelopen vernieuwing ruim vóór de vervaldatum zichtbaar is. De inrichting en de beheerhandelingen staan in de beheerdocumentatie (Beheer en Support, sectie Certificaten).
* Het CAA-record uit ADR 0016 blijft beperkt tot Let's Encrypt; een andere autoriteit vraagt een wijziging van dat record.
* De vernieuwing van PKIoverheid-certificaten blijft jaarlijks mensenwerk. Biedt een TSP later ACME met External Account Binding aan, dan kan de bestaande `Issuer`-opzet van cert-manager daar naartoe wijzen en vervalt de handmatige cyclus.

## Verwijzingen

* [RFC 8555, Automatic Certificate Management Environment (ACME)](https://www.rfc-editor.org/rfc/rfc8555)
* [Forum Standaardisatie: ACME](https://www.forumstandaardisatie.nl/open-standaarden/acme): pas toe of leg uit per 1 januari 2026 (OBDO 23 september 2025), met het [Forumadvies van 25 juni 2025](https://www.forumstandaardisatie.nl/sites/default/files/BFS/3-lijsten/standaarden/acme/20250625-Forumadvies-ACME.pdf)
* [cert-manager: ACME](https://cert-manager.io/docs/configuration/acme/)
* [NCSC: PKIoverheid stopt met webcertificaten](https://www.ncsc.nl/binaries/ncsc/documenten/factsheets/2021/september/29/factsheet-pkioverheid-stopt-met-webcertificaten/Factsheet+PKIoverheid+stopt+met+webcertificaten+v1.0.pdf)
* [Logius: verkorting geldigheidsduur publiek vertrouwde TLS-certificaten geldt niet voor PKIoverheid](https://www.logius.nl/actueel/verkorting-geldigheidsduur-publiek-vertrouwde-tls-certificaten-geldt-niet-voor-pkioverheid)
* [KPN: PKIoverheid servercertificaat aanvragen](https://www.kpn.com/zakelijk/pki-certificaten/pki-overheid-servercertificaat/aanvragen)
* [Let's Encrypt: rate limits](https://letsencrypt.org/docs/rate-limits/)
* [CA/Browser Forum ballot SC-081: reductie van de geldigheidsduur van TLS-certificaten](https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/)
