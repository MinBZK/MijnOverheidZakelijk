# 26. Eigen domein voor de Notificatiedienst en hostnamen per omgeving

Datum: 2026-10-27

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): SPF, DMARC, CAA en de centrale security headers voor `mijnoverheidzakelijk.nl`. Deze ADR past dezelfde regels toe op het domein van de Notificatiedienst en op subdomeinen per omgeving.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): minimaal een acceptatieomgeving vóór productie; de omgevingsinrichting wordt per project bepaald. Deze ADR geeft die omgevingen een adres.
* ADR 0022 Releasemanagement MOZa (Proposed): hetzelfde artefact gaat van pre-productie naar productie.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): NotifyNL meldt afleverstatussen terug op de receipt-callback van het NMC; die callback-URL wordt per omgeving bij NotifyNL geregistreerd.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): afnemers bereiken een backendsysteem alleen via FSC en naast de inway heeft het geen eigen publiek endpoint; Swagger UI staat alleen aan in niet-productieomgevingen; of het domein bij Min AZ gemeld moet worden is daar een open besluit. Dat productie van het NMC op de Logius Private Cloud (LPC) draait, staat in notificatiedocs §14.
* ADR 0027 Koppelingen van het Notificatie Management Component (in voorbereiding): de FSC-inway, de receipt-callback en de webhook als koppelingen met een adres.
* ADR 0029 FSC-ontsluiting van het NMC via internet (in voorbereiding): de inway staat met een internetadres in de FSC Directory.

## Context

### Het domein

De Notificatiedienst is een dienst van Logius voor alle dienstverleners die notificaties willen laten versturen. Dienstverleners richten hun FSC-contract, hun testen en hun webhook op adressen van de Notificatiedienst, NotifyNL krijgt per omgeving een callback-URL geregistreerd, en de inway staat met zijn adres in de FSC Directory. Die adressen worden door anderen vastgelegd en moeten daarom van ons zijn, blijven bestaan en de dienst herkenbaar benoemen.

De Notificatiedienst heeft nog geen hostnaam. Ontwikkelversies draaien op ZAD onder hostnamen van het platform: een preview per pull request (`pr-<nummer>`) en een `stable`-omgeving die `main` volgt. Productie komt op de LPC. Daartussen komen een test-, een acceptatie- en een pre-productieomgeving.

Overwogen domeinen:

| Optie | Voorbeeld productie | Beoordeling |
| :---- | :------------------ | :---------- |
| Subdomein onder `mijnoverheidzakelijk.nl` | `nmc.mijnoverheidzakelijk.nl` | Bestaand domein met bestaande DNS-beveiliging en gateway. De naam zegt "MijnOverheid Zakelijk", terwijl de Notificatiedienst niet aan dat portaal gebonden is en ook door dienstverleners buiten MOZa wordt gebruikt. Een dienstverlener die een contract afsluit of een webhook ontvangt, ziet een naam die de dienst niet benoemt. |
| Naam onder de uniforme overheidsextensie `.gov.nl` | `notificatiedienst.gov.nl` | Sluit aan op het kabinetsbesluit voor één herkenbare overheidsextensie. De beheerder van de extensie geeft nog geen namen uit; er is geen datum waarop dat wel kan. |
| Eigen `.nl`-domein voor de Notificatiedienst | `api.overheidsnotificatiedienst.nl` | De naam benoemt de dienst en niets anders. Registratie loopt via de Dienst Publiek en Communicatie (DPC) als registrar van de Rijksoverheid; DNS-beveiliging en certificaten worden voor dit domein apart ingericht. Als `.gov.nl` beschikbaar komt, wordt dit domein een alias van de naam daaronder. |

De naam `notificatiedienst.nl` is in gebruik bij een andere partij, net als `notificaties.nl`, `notificatie.nl` en `notificatieservice.nl`. Vrij zijn onder meer `overheidsnotificatiedienst.nl`, `overheidsnotificaties.nl` en `notificatiedienst-overheid.nl` (stand SIDN, 2026-10-27).

### De omgevingen

Elke omgeving, productie inbegrepen, heeft een vaste, eigen hostnaam nodig, omdat:

* NotifyNL per omgeving een callback-URL voor receipts geregistreerd krijgt en die URL niet mag wisselen bij een herdeploy of een platformwissel; voor productie mag die naam alleen binnen de LPC of via FSC bereikbaar zijn, afhankelijk van het open besluit in ADR 0025 over verkeer tussen NotifyNL en het NMC binnen de LPC;
* dienstverleners hun FSC-contract en hun testen op een adres richten dat van ons is en blijft;
* monitoring, DNS-beleid en certificaten per omgeving te beheren moeten zijn zonder de productienamen te raken.

Daarmee ligt de vraag voor hoe de omgeving in de naam komt en waar in de hiërarchie. Eén eis uit de techniek weegt daarbij zwaar: een wildcard in een certificaat of een listener dekt precies één label ([RFC 6125](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3)). `*.overheidsnotificatiedienst.nl` dekt `api.overheidsnotificatiedienst.nl`, maar niet `api.tst.overheidsnotificatiedienst.nl`. Een tweede eis komt uit ADR 0016: SPF wordt niet overgeërfd door subdomeinen, DMARC wel (zonder `sp=` geldt `p=` ook voor subdomeinen), en een CAA-record geldt voor alles eronder tenzij een subdomein een eigen CAA zet.

| Optie | Voorbeeld tst / productie | Beoordeling |
| :---- | :------------------------ | :---------- |
| A. Omgeving onder de component | `tst.api.overheidsnotificatiedienst.nl` / `api.overheidsnotificatiedienst.nl` | Groepeert per applicatie. Een wildcard-certificaat dekt dan één applicatie met al haar omgevingen, zodat productie en test in hetzelfde certificaat zitten. Beleid per omgeving (toegang, robots, headers) is niet op één punt te zetten. |
| B. Component onder de omgeving | `api.tst.overheidsnotificatiedienst.nl` / `api.overheidsnotificatiedienst.nl` | Groepeert per omgeving. Eén wildcard-certificaat, één listener en één set DNS-records per omgeving; de productienamen blijven ongewijzigd en onaangeraakt door testwerk. Namen zijn een label langer. |
| C. Omgeving als achtervoegsel in het label | `api-tst.overheidsnotificatiedienst.nl` / `api.overheidsnotificatiedienst.nl` | Past in één listener en één certificaat. Daardoor delen test- en productienamen hetzelfde certificaat en dezelfde listener. Geen scheidslijn in DNS; de platte lijst groeit met applicaties maal omgevingen. |
| D. Een domein per omgeving | `api.overheidsnotificatiedienst-tst.nl` / `api.overheidsnotificatiedienst.nl` | Volledige scheiding, maar elke registratie loopt via het domeinnaambeleid van de Rijksoverheid, elk domein heeft zijn eigen DNS-beveiliging nodig en de namen lijken op phishingdomeinen. |

## Decision

De Notificatiedienst krijgt een eigen `.nl`-domein dat de dienst benoemt. De omgeving wordt een eigen laag in de DNS-hiërarchie, direct onder het domein. De component staat daaronder (optie B).

1. **Domein.** Het domein van de Notificatiedienst is `overheidsnotificatiedienst.nl`, geregistreerd via DPC op naam van de Rijksoverheid. Het domein draagt uitsluitend de Notificatiedienst; de componenten van MijnOverheid Zakelijk blijven onder `mijnoverheidzakelijk.nl`.

2. **Naamschema.** Een niet-productieomgeving heet `<component>.<omgeving>.overheidsnotificatiedienst.nl`; productie heet `<component>.overheidsnotificatiedienst.nl`. De omgevingslabels zijn `tst`, `acc` en `preprod`. Productie krijgt geen label, zodat een adres zonder omgevingslabel altijd productie betekent. Voor de API van het NMC levert dat op:

   | Omgeving | Hostnaam |
   | :------- | :------- |
   | test | `api.tst.overheidsnotificatiedienst.nl` |
   | acceptatie | `api.acc.overheidsnotificatiedienst.nl` |
   | pre-productie | `api.preprod.overheidsnotificatiedienst.nl` |
   | productie | `api.overheidsnotificatiedienst.nl` |

3. **Componentlabels.** Elke component heeft één kort label dat in alle omgevingen gelijk is: `api` voor het NMC en `inway` voor de FSC-inway (`inway.acc.overheidsnotificatiedienst.nl`). Een component heeft per omgeving één hostnaam; functies binnen een component (API, receipt-callback, health-endpoints, Swagger UI) zijn paden op die hostnaam. Hetzelfde schema geldt voor de componenten onder `mijnoverheidzakelijk.nl` (`profiel.acc.mijnoverheidzakelijk.nl`) zodra die een tweede omgeving krijgen.

4. **De omgevingslaag is een naamlaag.** Welk platform een omgeving draait (ZAD, het Standaard Platform, de LPC) staat los van de naam. Een record in de omgevingszone verwijst naar waar die omgeving op dat moment draait, als CNAME naar een platformhostnaam of als A/AAAA-record naar een eigen gateway. Een naam onder dit schema zegt ook niets over bereikbaarheid: `api.overheidsnotificatiedienst.nl` is volgens ADR 0025 alleen binnen de LPC of via FSC bereikbaar, met uitzondering van de receipt-callback van NotifyNL zolang NotifyNL buiten de LPC draait (ADR 0027). De ZAD-omgeving `stable` van het NMC is de testomgeving en krijgt het adres `api.tst.overheidsnotificatiedienst.nl`. PR-previews blijven op de platformhostnamen van ZAD en krijgen geen naam onder ons domein: ze zijn kortlevend en elke naam zou een DNS-record en een certificaat kosten.

5. **Certificaten per omgeving.** Elke omgevingszone heeft een eigen certificaat, als wildcard `*.<omgeving>.overheidsnotificatiedienst.nl` of met opgesomde SAN's; het productiecertificaat dekt uitsluitend productienamen. Het domein krijgt een CAA-record met `letsencrypt.org`, zoals ADR 0016 dat voor `mijnoverheidzakelijk.nl` vastlegt. Zet een platform een andere uitgever in, dan krijgt die omgevingszone een eigen CAA-record met die uitgever, zodat het hoofddomein ongemoeid blijft.

6. **DNS-beveiliging.** Op de apex en op `tst`, `acc` en `preprod` gelden de maatregelen uit ADR 0016 (`v=spf1 -all`, geen MX en een expliciet DMARC-record met `p=reject`), aangevuld met DNSSEC op de zone. Het domein verstuurt geen e-mail; de notificaties zelf gaan via NotifyNL vanaf het afzenderdomein van NotifyNL. Hostnamen die als CNAME zijn ingericht kunnen zelf geen TXT-record dragen; de uitsluiting van e-mail staat dan op de omgevingszone. De omgevingszones blijven records binnen de DNS-zone van het domein en worden niet met NS-records gedelegeerd aan een platform.

7. **Beleid per omgeving.** De centrale security headers uit ADR 0016 gelden op elke hostnaam. Niet-productieomgevingen sturen daarnaast `X-Robots-Tag: noindex`; toegangsbeperkingen (IP-allowlist, alleen FSC) worden per omgevingszone ingesteld, zodat een beperking op `acc` nooit productie raakt. Alle hostnamen zijn alleen over HTTPS bereikbaar.

8. **Apex en `www`.** Het kale domein en `www` zijn gereserveerd voor de publieke informatie over de Notificatiedienst, zoals de aansluitvoorwaarden en de documentatie, en dragen geen API. Zolang die informatie elders staat, verwijzen zij daarheen.

## Consequences

* Dienstverleners, NotifyNL en de FSC Directory zien één naam die de dienst benoemt en los staat van MijnOverheid Zakelijk. De callback-URL die bij NotifyNL per omgeving wordt geregistreerd en de adressen in FSC-contracten zijn namen onder ons domein; een platformwissel van een omgeving is daarmee alleen een DNS-wijziging aan onze kant.
* Het domein is een tweede domein naast `mijnoverheidzakelijk.nl`, met eigen registratie, eigen DNS-zone, eigen DNSSEC, SPF, DMARC en CAA, en eigen plek in de periodieke internet.nl-controle uit ADR 0016.
* Komt `.gov.nl` beschikbaar, dan wordt de naam daaronder de hoofdnaam en blijft `overheidsnotificatiedienst.nl` als alias bestaan zolang contracten, callback-registraties en webhooks ernaar verwijzen. Het schema met omgevingslagen en componentlabels gaat ongewijzigd mee naar het nieuwe domein.
* De gateway van MOZa dekt met `*.mijnoverheidzakelijk.nl` geen enkele naam van de Notificatiedienst. Draait een omgeving achter die gateway, dan komt er per omgeving een listener met een eigen certificaat-secret bij. Draait een omgeving op ZAD of de LPC, dan wijst het DNS-record daarheen en is de gateway niet betrokken.
* Een wildcard-certificaat vereist bij Let's Encrypt de DNS-01-uitdaging en dus schrijfrechten op de DNS-zone vanuit de uitgevende omgeving. Waar die rechten er niet zijn, worden per omgeving de hostnamen opgesomd en via HTTP-01 uitgegeven; het schema werkt in beide gevallen.
* Of `api.overheidsnotificatiedienst.nl` op de LPC onder ons DNS kan vallen, bepaalt Logius als beheerder van het platform en van de Notificatiedienst. Dit schema vraagt van de LPC alleen een stabiel doeladres voor het DNS-record en een certificaat voor die ene naam; verlangt Logius een eigen domein, dan geldt dit schema voor `tst`, `acc` en `preprod` en wordt de productienaam een alias.
* Het label `preprod` wordt in documenten als "pre-productie" geschreven; in hostnamen wordt het nooit anders gespeld, omdat labels in callback-URL's, contracten en certificaten letterlijk terugkomen.

### Buiten deze beslissing

* Welk platform `acc` en `preprod` van het NMC draaien, en of dat hetzelfde platform is als `tst`.
* De inrichting van toegangsbeperkingen per omgeving; deze ADR legt alleen vast dat de omgevingszone het punt is waarop ze worden gezet.
* Of de omgevingslaag ook geldt voor hostnamen die Logius op de LPC zelf uitgeeft voor componenten die geen onderdeel van de Notificatiedienst zijn.
* Of het domein bij Min AZ gemeld moet worden: het open besluit uit ADR 0025 geldt ook voor dit domein.

## Verwijzingen

* [notificatiedocs §10 Deployment](../notificatiedocs/10-deployment.md): ZAD-omgevingen `pr-<nummer>` en `stable`, productie op de LPC
* [notificatiedocs §14 Productiegereedheid](../notificatiedocs/14-productiegereedheid.md): productie van het NMC op de LPC; de domeinnaam en de melding bij Min AZ als open punten
* [hoofdstuk 10 Deployment](../docs/10-deployment.md): huidige hostnamen onder `mijnoverheidzakelijk.nl`
* [Binnenlands Bestuur, "Aanvraag voor toplevel-domeinnaam pas 2026 mogelijk"](https://www.binnenlandsbestuur.nl/digitaal/aanvraag-voor-toplevel-domeinnaam-pas-2026-mogelijk): stand van de invoering van `.gov.nl`
* [Dienst Publiek en Communicatie](https://organisaties.overheid.nl/domeinen/94546/Dienst_Publiek_en_Communicatie): registrar van domeinnamen van de Rijksoverheid
* [RFC 6125 §6.4.3](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3): een wildcard dekt één label
* [RFC 7489 §6.3](https://www.rfc-editor.org/rfc/rfc7489#section-6.3): DMARC `sp`, standaard gelijk aan `p`
* [RFC 8659](https://www.rfc-editor.org/rfc/rfc8659): CAA, overerving naar subdomeinen
* [Let's Encrypt: Challenge Types](https://letsencrypt.org/docs/challenge-types/): wildcard alleen via DNS-01
