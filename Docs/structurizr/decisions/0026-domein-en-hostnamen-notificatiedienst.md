# 26. Domein van de Notificatiedienst

Datum: 2026-10-29

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): SPF, DMARC, CAA en de centrale security headers voor `mijnoverheidzakelijk.nl`. Deze ADR past dezelfde regels toe op de namen van de Notificatiedienst.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): minimaal een acceptatieomgeving vóór productie. Deze ADR geeft die omgevingen een adres.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): NotifyNL meldt afleverstatussen terug op de receipt-callback van het NMC; die callback-URL wordt per omgeving bij NotifyNL geregistreerd.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): afnemers bereiken een backendsysteem alleen via FSC; of een domein bij Min AZ gemeld moet worden is daar een open besluit.
* ADR 0027 Koppelingen van het Notificatie Management Component (in voorbereiding): de FSC-inway, de receipt-callback en de webhook als koppelingen met een adres.
* ADR 0029 FSC-ontsluiting van het NMC via internet (in voorbereiding): de inway staat met een internetadres in de FSC Directory.

## Context

De Notificatiedienst wordt samen met Logius binnen het programma OBIS neergezet als generieke voorziening voor alle dienstverleners die notificaties willen laten versturen. Dienstverleners richten hun FSC-contract, hun testen en hun webhook op adressen van de Notificatiedienst, NotifyNL krijgt per omgeving een callback-URL geregistreerd, en de inway staat met zijn adres in de FSC Directory. Die adressen worden door anderen vastgelegd en moeten daarom van ons zijn, blijven bestaan en de dienst herkenbaar benoemen.

De Notificatiedienst heeft nog geen eigen hostnaam. Ontwikkelversies draaien op ZAD onder hostnamen van het platform: een preview per pull request (`pr-<nummer>`) en een `stable`-omgeving die `main` volgt. Productie komt op de Logius Private Cloud (LPC). Daartussen komen een test-, een acceptatie- en een pre-productieomgeving, die elk een vaste eigen naam nodig hebben omdat NotifyNL, dienstverleners en monitoring die naam vastleggen.

De naam moet de dienst benoemen en niet het portaal: de Notificatiedienst is niet aan MijnOverheid Zakelijk gebonden en wordt ook door dienstverleners buiten MOZa gebruikt. Omdat de dienst binnen OBIS wordt ontwikkeld en dat programma meer voorzieningen kan opleveren, gaat de voorkeur uit naar een naam op programmaniveau met de dienst als laag daaronder. Het Internetdomeinbeleid Rijksoverheid vraagt bovendien om waar mogelijk een bestaand overheidsbreed domein te hergebruiken in plaats van een nieuw domein te registreren.

Overwogen opties, in volgorde van voorkeur:

| Optie | Hoofdnaam Notificatiedienst | Beoordeling |
| :---- | :-------------------------- | :---------- |
| 1. Naam onder de uniforme overheidsextensie `.gov.nl` | `notificaties.obis.gov.nl` | Sluit aan op het kabinetsbesluit voor één herkenbare overheidsextensie. De aanvraag is afgewezen: de beheerder van de extensie geeft nog geen namen uit en noemt geen datum waarop dat wel kan. |
| 2. Subdomein onder `overheid.nl` | `notificaties.obis.overheid.nl` | `overheid.nl` is een bestaand overheidsbreed domein, gehouden door Logius namens de Rijksoverheid, met DNSSEC en beleid op de apex. Hergebruik is wat het Internetdomeinbeleid Rijksoverheid vraagt. `obis.overheid.nl` benoemt het programma en biedt ruimte aan latere voorzieningen van OBIS. |
| 3. Eigen `.nl`-domein voor het programma | `notificaties.obis-overheid.nl` | De naam is van ons en benoemt programma en dienst. Registratie loopt via de Dienst Publiek en Communicatie (DPC) als registrar van de Rijksoverheid; DNSSEC, SPF, DMARC en CAA worden apart ingericht. Een eigen domein is pas aan de orde als optie 2 wordt afgewezen. |
| 4. Subdomein onder `mijnoverheidzakelijk.nl` | `nmc.mijnoverheidzakelijk.nl` | Bestaand domein met bestaande gateway. De naam zegt "MijnOverheid Zakelijk" tegen dienstverleners die niets met dat portaal te maken hebben. Afgevallen. |

## Decision

De Notificatiedienst krijgt haar adressen onder `obis.overheid.nl`, met `notificaties.obis.overheid.nl` als hoofdnaam. Komt die naam er niet, dan registreert het programma een eigen `.nl`-domein.

1. **Domein.** Het programma vraagt `obis.overheid.nl` aan bij Logius als houder van `overheid.nl`. Daaronder is `notificaties.obis.overheid.nl` de hoofdnaam van de Notificatiedienst; andere voorzieningen van OBIS krijgen een eigen label onder `obis.overheid.nl`. De componenten van MijnOverheid Zakelijk blijven onder `mijnoverheidzakelijk.nl`.

2. **Terugvaloptie.** Wordt de aanvraag onder `overheid.nl` afgewezen, dan registreert het programma via DPC een eigen `.nl`-domein op programmaniveau, zodat het ook voor andere voorzieningen van OBIS bruikbaar is. De werknaam daarvoor is `obis-overheid.nl`; dat is een voorstel, de definitieve naam wordt op dat moment gekozen en getoetst aan het Internetdomeinbeleid Rijksoverheid en op beschikbaarheid bij SIDN. Het naamschema hieronder geldt dan ongewijzigd met `notificaties.obis-overheid.nl` als hoofdnaam.

3. **Omgevingen.** De omgevingen hangen onder de hoofdnaam. Productie is de hoofdnaam zelf; een niet-productieomgeving krijgt haar label ervoor. De labels zijn `tst`, `acc` en `preprod`; een adres zonder omgevingslabel betekent altijd productie.

   | Omgeving | Hostnaam |
   | :------- | :------- |
   | test | `tst.notificaties.obis.overheid.nl` |
   | acceptatie | `acc.notificaties.obis.overheid.nl` |
   | pre-productie | `preprod.notificaties.obis.overheid.nl` |
   | productie | `notificaties.obis.overheid.nl` |

   De ZAD-omgeving `stable` van het NMC is de testomgeving en krijgt het adres `tst.notificaties.obis.overheid.nl`. PR-previews blijven op de platformhostnamen van ZAD; ze zijn kortlevend en elke naam zou een DNS-record en een certificaat kosten.

4. **Componenten.** De hostnaam van een omgeving is het adres van de API van het NMC; functies binnen het NMC (API, receipt-callback, health-endpoints, Swagger UI) zijn paden op die hostnaam. Een component met een eigen TLS-endpoint, zoals de FSC-inway, krijgt een eigen label vóór de omgevingsnaam: `inway.notificaties.obis.overheid.nl` in productie en `inway.tst.notificaties.obis.overheid.nl` in test. De labels `tst`, `acc` en `preprod` zijn gereserveerd en worden niet als componentlabel gebruikt.

5. **Beheer van de zone.** Het programma vraagt bij Logius delegatie van `obis.overheid.nl` naar eigen naamservers, zodat records per omgeving onder eigen beheer vallen en een platformwissel een DNS-wijziging aan onze kant is. Op de namen gelden de maatregelen uit ADR 0016: `v=spf1 -all`, geen MX, een expliciet DMARC-record met `p=reject` en een CAA-record met de gebruikte uitgever; DNSSEC volgt uit de keten van `overheid.nl` en wordt bij delegatie op de eigen zone voortgezet. De dienst verstuurt zelf geen e-mail; notificaties gaan via NotifyNL vanaf het afzenderdomein van NotifyNL.

6. **Certificaten per omgeving.** Elke omgeving heeft een eigen certificaat. Het productiecertificaat somt de productienamen op (`notificaties.obis.overheid.nl`, `inway.notificaties.obis.overheid.nl`); een niet-productieomgeving gebruikt een wildcard op haar eigen laag (`*.tst.notificaties.obis.overheid.nl`) plus de omgevingsnaam zelf, of eveneens opgesomde namen. Een wildcard dekt precies één label ([RFC 6125](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3)), zodat productie en test nooit in één certificaat zitten.

7. **Latere `.gov.nl`-naam.** Komt `.gov.nl` beschikbaar, dan wordt `notificaties.obis.gov.nl` de hoofdnaam en blijft de naam onder `overheid.nl` als alias bestaan zolang contracten, callback-registraties en webhooks ernaar verwijzen. Het naamschema gaat ongewijzigd mee.

## Consequences

* Dienstverleners, NotifyNL en de FSC Directory zien één naam die programma en dienst benoemt en los staat van MijnOverheid Zakelijk. De callback-URL per omgeving en de adressen in FSC-contracten zijn namen onder ons beheer; een platformwissel van een omgeving is een DNS-wijziging aan onze kant.
* De keuze hangt af van de toekenning door Logius. Tot `obis.overheid.nl` is toegekend, worden geen adressen van de Notificatiedienst bij NotifyNL of in FSC-contracten vastgelegd; het NMC blijft tot die tijd op de platformhostnamen van ZAD bereikbaar.
* Onder `overheid.nl` gelden de apex-records en het beleid van Logius; eigen records zijn er alleen voor wat Logius delegeert of op verzoek aanmaakt. Wordt de zone niet gedelegeerd, dan loopt elke DNS-wijziging per omgeving via Logius.
* Bij de terugvaloptie komt er een tweede domein naast `mijnoverheidzakelijk.nl`, met eigen registratie, DNS-zone, DNSSEC, SPF, DMARC en CAA, en een eigen plek in de periodieke internet.nl-controle uit ADR 0016.
* De gateway van MOZa dekt met `*.mijnoverheidzakelijk.nl` geen enkele naam van de Notificatiedienst. Draait een omgeving achter die gateway, dan komt er per omgeving een listener met een eigen certificaat-secret bij. Draait een omgeving op ZAD of de LPC, dan wijst het DNS-record daarheen en is de gateway niet betrokken.
* Een wildcard-certificaat vereist bij Let's Encrypt de DNS-01-uitdaging en dus schrijfrechten op de zone vanuit de uitgevende omgeving. Zonder die rechten worden per omgeving de hostnamen opgesomd en via HTTP-01 uitgegeven; het schema werkt in beide gevallen.
* Het label `preprod` wordt in documenten als "pre-productie" geschreven; in hostnamen wordt het nooit anders gespeld, omdat labels in callback-URL's, contracten en certificaten letterlijk terugkomen.

### Buiten deze beslissing

* Welk platform `acc` en `preprod` van het NMC draaien, en of dat hetzelfde platform is als `tst`.
* De inrichting van toegangsbeperkingen per omgeving (IP-allowlist, alleen FSC); deze ADR legt alleen vast dat de omgevingsnaam het punt is waarop ze worden gezet.
* Of `notificaties.obis.overheid.nl` op de LPC onder ons DNS kan vallen, of dat Logius daar een eigen naam voor uitgeeft en de productienaam een alias wordt.
* Of de naam bij Min AZ gemeld moet worden: het open besluit uit ADR 0025 geldt ook hier.

## Verwijzingen

* [notificatiedocs §01 Context](../notificatiedocs/01-context.md): de Notificatiedienst als generieke voorziening binnen het programma OBIS
* [notificatiedocs §10 Deployment](../notificatiedocs/10-deployment.md): ZAD-omgevingen `pr-<nummer>` en `stable`, productie op de LPC
* [notificatiedocs §14 Productiegereedheid](../notificatiedocs/14-productiegereedheid.md): de domeinnaam en de melding bij Min AZ als open punten
* [hoofdstuk 10 Deployment](../docs/10-deployment.md): huidige hostnamen onder `mijnoverheidzakelijk.nl`
* [Internetdomeinbeleid Rijksoverheid 1.0](https://digitaleoverheid.nl/html/internetdomeinbeleid-rijksoverheid.html): hergebruik van een bestaand overheidsbreed domein gaat vóór een nieuw domein
* [Register Internetdomeinen Overheid: `overheid.nl`](https://organisaties.overheid.nl/domeinen/71428/Logius/domeinnaamregistratie/29606579/overheid.nl): Logius als houder van `overheid.nl` namens de Rijksoverheid
* [Binnenlands Bestuur, "Aanvraag voor toplevel-domeinnaam pas 2026 mogelijk"](https://www.binnenlandsbestuur.nl/digitaal/aanvraag-voor-toplevel-domeinnaam-pas-2026-mogelijk): stand van de invoering van `.gov.nl`
* [Dienst Publiek en Communicatie](https://organisaties.overheid.nl/domeinen/94546/Dienst_Publiek_en_Communicatie): registrar van domeinnamen van de Rijksoverheid
* [RFC 6125 §6.4.3](https://www.rfc-editor.org/rfc/rfc6125#section-6.4.3): een wildcard dekt één label
