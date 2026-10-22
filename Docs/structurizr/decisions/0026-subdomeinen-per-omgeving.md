# 26. Subdomeinen per omgeving onder mijnoverheidzakelijk.nl

Datum: 2026-10-07

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): SPF, DMARC, CAA en de centrale security headers voor het hoofddomein en de publieke subdomeinen. Deze ADR legt vast hoe die regels doorwerken naar subdomeinen per omgeving.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): minimaal een acceptatieomgeving vóór productie; de omgevingsinrichting wordt per project bepaald. Deze ADR geeft die omgevingen een adres.
* ADR 0022 Releasemanagement MOZa (Proposed, [PR #1175](https://github.com/MinBZK/MijnOverheidZakelijk/pull/1175)): hetzelfde artefact gaat van pre-productie naar productie.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): NotifyNL meldt afleverstatussen terug op de receipt-callback van het NMC; die callback-URL wordt per omgeving bij NotifyNL geregistreerd.
* ADR 0025 Productiegereedheid backendsystemen (Proposed, nog niet op `main`): productie van het NMC draait op de Logius Private Cloud (LPC) en afnemers bereiken het alleen via FSC; Swagger UI staat alleen aan in niet-productieomgevingen.

## Context

Het domein `mijnoverheidzakelijk.nl` heeft nu één laag subdomeinen, één per applicatie: `www`, `moza`, `profiel`, `docs`, `start`, `zaken`, `omc` en `vakapplicatie` (zie [hoofdstuk 10 Deployment](../docs/10-deployment.md)). Een hostnaam benoemt alleen de applicatie erachter. Alles hangt aan één gateway met een listener voor `*.mijnoverheidzakelijk.nl` naast een voor het kale domein, beide met hetzelfde certificaat. Wat achter `profiel.mijnoverheidzakelijk.nl` draait is in de praktijk de acceptatieomgeving; de naam laat dat niet zien.

Het Notificatie Management Component (NMC) heeft onder dit domein nog geen enkele hostnaam. Ontwikkelversies draaien op ZAD onder hostnamen van het platform: een preview per pull request (`pr-<nummer>`) en een `stable`-omgeving die `main` volgt. Productie komt op de LPC en is daar volgens ADR 0025 voor afnemers alleen via FSC bereikbaar, zonder publiek endpoint. Daartussen komen een test-, een acceptatie- en een pre-productieomgeving. Elke omgeving, productie inbegrepen, heeft een vaste, eigen hostnaam nodig, omdat:

* NotifyNL per omgeving een callback-URL voor receipts geregistreerd krijgt en die URL niet mag wisselen bij een herdeploy of een platformwissel; voor productie mag die naam alleen binnen de LPC of via FSC bereikbaar zijn, afhankelijk van het open besluit in ADR 0025 over verkeer tussen NotifyNL en het NMC binnen de LPC;
* dienstverleners hun FSC-contract en hun testen op een adres richten dat van ons is en blijft;
* monitoring, DNS-beleid en certificaten per omgeving te beheren moeten zijn zonder de productienamen te raken.

Daarmee ligt de vraag voor hoe de omgeving in de naam komt en waar in de hiërarchie. Eén eis uit de techniek weegt daarbij zwaar: een wildcard in een certificaat of een listener dekt precies één label ([RFC 6125](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3)). `*.mijnoverheidzakelijk.nl` dekt `nmc.mijnoverheidzakelijk.nl`, maar niet `nmc.tst.mijnoverheidzakelijk.nl`. Een tweede eis komt uit ADR 0016: SPF wordt niet overgeërfd door subdomeinen, DMARC wel (zonder `sp=` geldt `p=` ook voor subdomeinen), en een CAA-record geldt voor alles eronder tenzij een subdomein een eigen CAA zet.

### Overwogen opties

| Optie | Voorbeeld tst / productie | Beoordeling |
| :---- | :------------------------ | :---------- |
| A. Omgeving onder de component | `tst.nmc.mijnoverheidzakelijk.nl` / `nmc.mijnoverheidzakelijk.nl` | Groepeert per applicatie. Een wildcard-certificaat dekt dan één applicatie met al haar omgevingen, zodat productie en test in hetzelfde certificaat zitten. Beleid per omgeving (toegang, robots, headers) is niet op één punt te zetten. |
| B. Component onder de omgeving | `nmc.tst.mijnoverheidzakelijk.nl` / `nmc.mijnoverheidzakelijk.nl` | Groepeert per omgeving. Eén wildcard-certificaat, één listener en één set DNS-records per omgeving; de productienamen blijven ongewijzigd en onaangeraakt door testwerk. Namen zijn een label langer. |
| C. Omgeving als achtervoegsel in het label | `nmc-tst.mijnoverheidzakelijk.nl` / `nmc.mijnoverheidzakelijk.nl` | Past in de huidige listener en het huidige certificaat. Daardoor delen test- en productienamen hetzelfde certificaat en dezelfde listener. Geen scheidslijn in DNS; de platte lijst groeit met applicaties maal omgevingen. |
| D. Een domein per omgeving | `nmc.mijnoverheidzakelijk-tst.nl` / `nmc.mijnoverheidzakelijk.nl` | Volledige scheiding, maar elke registratie loopt via het domeinnaambeleid van de Rijksoverheid, elk domein heeft zijn eigen DNS-beveiliging nodig en de namen lijken op phishingdomeinen. |

## Decision

De omgeving wordt een eigen laag in de DNS-hiërarchie, direct onder het hoofddomein. De component staat daaronder (optie B).

1. **Naamschema.** Een niet-productieomgeving heet `<component>.<omgeving>.mijnoverheidzakelijk.nl`; productie heet `<component>.mijnoverheidzakelijk.nl`. De omgevingslabels zijn `tst`, `acc` en `preprod`. Productie krijgt geen label, zodat de bestaande namen de productienamen zijn en een adres zonder omgevingslabel altijd productie betekent. Voor het NMC levert dat op:

   | Omgeving | Hostnaam |
   | :------- | :------- |
   | test | `nmc.tst.mijnoverheidzakelijk.nl` |
   | acceptatie | `nmc.acc.mijnoverheidzakelijk.nl` |
   | pre-productie | `nmc.preprod.mijnoverheidzakelijk.nl` |
   | productie | `nmc.mijnoverheidzakelijk.nl` |

2. **Componentlabels.** Elke applicatie heeft één kort label dat in alle omgevingen gelijk is: `nmc` voor het NMC, en de bestaande labels (`www`, `moza`, `profiel`, `docs`, `start`, `zaken`, `omc`, `vakapplicatie`) voor de bestaande applicaties, zolang die bestaan. Infrastructuur die een eigen adres per omgeving nodig heeft, zoals de FSC Inway, krijgt op dezelfde manier een label (`inway.acc.mijnoverheidzakelijk.nl`). Een component heeft per omgeving één hostnaam; functies binnen een component (API, receipt-callback, health-endpoints, Swagger UI) zijn paden op die hostnaam.

3. **De omgevingslaag is een naamlaag.** Welk platform een omgeving draait (ZAD, het Standaard Platform, de LPC) staat los van de naam. Een record in de omgevingszone verwijst naar waar die omgeving op dat moment draait, als CNAME naar een platformhostnaam of als A/AAAA-record naar een eigen gateway. Een naam onder dit schema zegt ook niets over bereikbaarheid: `nmc.mijnoverheidzakelijk.nl` is volgens ADR 0025 alleen binnen de LPC of via FSC bereikbaar. De ZAD-omgeving `stable` van het NMC is de testomgeving en krijgt het adres `nmc.tst.mijnoverheidzakelijk.nl`. PR-previews blijven op de platformhostnamen van ZAD en krijgen geen naam onder ons domein: ze zijn kortlevend en elke naam zou een DNS-record en een certificaat kosten.

4. **Certificaten per omgeving.** Elke omgevingszone heeft een eigen certificaat, als wildcard `*.<omgeving>.mijnoverheidzakelijk.nl` of met opgesomde SAN's; het productiecertificaat dekt uitsluitend productienamen. De CAA uit ADR 0016 (`letsencrypt.org`) geldt daarmee ook voor de omgevingszones. Zet een platform een andere uitgever in, dan krijgt die omgevingszone een eigen CAA-record met die uitgever, zodat het hoofddomein ongemoeid blijft.

5. **DNS-beveiliging per omgevingszone.** Op `tst`, `acc` en `preprod` worden de maatregelen uit ADR 0016 herhaald: `v=spf1 -all`, geen MX en een expliciet DMARC-record met `p=reject`. Hostnamen die als CNAME zijn ingericht kunnen zelf geen TXT-record dragen; de uitsluiting van e-mail staat dan op de omgevingszone. De omgevingszones blijven records binnen de bestaande DNS-zone en worden niet met NS-records gedelegeerd aan een platform.

6. **Beleid per omgeving.** De centrale security headers uit ADR 0016 gelden op elke hostnaam. Niet-productieomgevingen sturen daarnaast `X-Robots-Tag: noindex` en vallen buiten het Websiteregister; toegangsbeperkingen (IP-allowlist, alleen FSC) worden per omgevingszone ingesteld, zodat een beperking op `acc` nooit productie raakt. Alle hostnamen zijn alleen over HTTPS bereikbaar.

7. **`www` blijft de landingspagina.** De omgevingslaag hangt direct onder het hoofddomein. Het kale domein en `www` blijven de publieke website; die krijgt zelf geen `tst`- of `acc`-variant onder dit schema zolang daar geen aparte omgeving voor bestaat.

## Consequences

* Een adres zegt voortaan welke omgeving het is. `profiel.mijnoverheidzakelijk.nl` is daarmee per definitie productie; wat nu onder die naam de acceptatieomgeving is, verhuist naar `profiel.acc.mijnoverheidzakelijk.nl` zodra er een echte productieomgeving naast komt. Tot die tijd wijst de productienaam naar de enige omgeving die er is, zoals ADR 0017 toestaat.
* De huidige gateway dekt met `*.mijnoverheidzakelijk.nl` geen enkele omgevingszone. Draait een omgeving achter die gateway, dan komt er per omgeving een listener met een eigen certificaat-secret bij. Draait een omgeving op ZAD of de LPC, dan wijst het DNS-record daarheen en is de gateway niet betrokken.
* Een wildcard-certificaat vereist bij Let's Encrypt de DNS-01-uitdaging en dus schrijfrechten op de DNS-zone vanuit de uitgevende omgeving. Waar die rechten er niet zijn, worden per omgeving de hostnamen opgesomd en via HTTP-01 uitgegeven; het schema werkt in beide gevallen.
* Of `nmc.mijnoverheidzakelijk.nl` op de LPC onder ons DNS kan vallen, bepaalt Logius als beheerder van het platform en van de Notificatiedienst. Dit schema vraagt van de LPC alleen een stabiel doeladres voor het DNS-record en een certificaat voor die ene naam; mocht Logius een eigen domein verlangen, dan geldt dit schema voor `tst`, `acc` en `preprod` en wordt de productienaam een alias.
* Het aantal DNS-records groeit met het aantal omgevingen maal het aantal componenten plus drie zone-apexen met SPF en DMARC. Internet.nl toetst per hostnaam; de omgevingszones komen in de periodieke controle uit ADR 0016 mee.
* De callback-URL die bij NotifyNL per omgeving wordt geregistreerd en de adressen in FSC-contracten van dienstverleners zijn vanaf nu namen onder ons domein. Een platformwissel van een omgeving is daarmee alleen een DNS-wijziging aan onze kant.
* Het label `preprod` wordt in documenten als "pre-productie" geschreven; in hostnamen wordt het nooit anders gespeld, omdat labels in callback-URL's, contracten en certificaten letterlijk terugkomen.

### Buiten deze beslissing

* Welk platform `acc` en `preprod` van het NMC draaien, en of dat hetzelfde platform is als `tst`.
* De inrichting van toegangsbeperkingen per omgeving; deze ADR legt alleen vast dat de omgevingszone het punt is waarop ze worden gezet.
* Of de omgevingslaag ook geldt voor hostnamen die Logius op de LPC zelf uitgeeft voor componenten die geen MOZa-component zijn.

## Verwijzingen

* [hoofdstuk 10 Deployment](../docs/10-deployment.md): huidige hostnamen van de prototype-omgeving
* [notificatiedocs §10 Deployment](../notificatiedocs/10-deployment.md): ZAD-omgevingen `pr-<nummer>` en `stable`, productie op de LPC
* [RFC 6125 §6.4.3](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3): een wildcard dekt één label
* [RFC 7489 §6.3](https://www.rfc-editor.org/rfc/rfc7489#section-6.3): DMARC `sp`, standaard gelijk aan `p`
* [RFC 8659](https://www.rfc-editor.org/rfc/rfc8659): CAA, overerving naar subdomeinen
* [Let's Encrypt: Challenge Types](https://letsencrypt.org/docs/challenge-types/): wildcard alleen via DNS-01
* [Domeinnaambeleid Rijksoverheid](https://www.communicatierijk.nl/vakkennis/rijkswebsites/verplichte-richtlijnen/domeinnaambeleid-rijksoverheid): registratie van domeinnamen voor de Rijksoverheid
