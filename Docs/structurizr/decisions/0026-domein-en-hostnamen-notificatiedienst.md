# 26. Domein van de Notificatiedienst

Datum: 2026-10-29

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0016 Centrale beveiligingsconfiguratie domein en webtoegang](0016-centrale-beveiligingsconfiguratie-domein-en-webtoegang.md): SPF, DMARC, CAA en de centrale security headers voor `mijnoverheidzakelijk.nl`. Dezelfde regels gelden voor de namen van de Notificatiedienst.
* [ADR 0017 Inrichting testen MOZa](0017-Inrichting-testen-MOZa.md): minimaal een acceptatieomgeving vóór productie. Deze ADR geeft die omgevingen een adres.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): of een domein bij Min AZ gemeld moet worden is daar een open besluit.
* ADR 0027 Koppelingen van het Notificatie Management Component (in voorbereiding): de koppelingen van het NMC krijgen een adres onder de naam uit deze ADR.

## Context

De Notificatiedienst wordt samen met Logius binnen het programma OBIS neergezet als generieke voorziening voor overheidsdiensten die notificaties willen laten versturen. Partijen die op de dienst aansluiten leggen haar adressen vast in hun eigen configuratie. Die adressen moeten daarom van ons zijn, blijven bestaan en de dienst herkenbaar benoemen. De dienst heeft nog geen eigen domeinnaam.

De naam moet de dienst benoemen en niet het portaal: de Notificatiedienst is niet aan MijnOverheid Zakelijk gebonden en wordt ook buiten MOZa gebruikt.

De overheid heeft al te veel domeinnamen in beheer en wil dat aantal terugdringen. Het Internetdomeinbeleid Rijksoverheid vraagt daarom om waar mogelijk een bestaand overheidsbreed domein te hergebruiken en nieuwe diensten als subdomein onder te brengen. Een eigen domein per dienst past daar niet in; een nieuw domein is alleen te verantwoorden als het breder inzetbaar is dan één dienst. De Notificatiedienst is daarom een laag onder een groter geheel: het programma OBIS, dat meer voorzieningen kan opleveren die dezelfde naam delen. De programmanaam hangt op zijn beurt onder een bestaand overheidsdomein.

Overwogen opties, in volgorde van voorkeur:

| Optie | Hoofdnaam Notificatiedienst | Beoordeling |
| :---- | :-------------------------- | :---------- |
| 1. Subdomein onder de uniforme overheidsextensie `.gov.nl` | `notificaties.obis.gov.nl` | Sluit aan op het kabinetsbesluit voor één herkenbare overheidsextensie. De aanvraag is afgewezen: de beheerder van de extensie geeft nog geen namen uit en noemt geen datum waarop dat wel kan. |
| 2. Subdomein onder `overheid.nl` | `notificaties.obis.overheid.nl` | `overheid.nl` is een bestaand overheidsbreed domein, gehouden door Logius namens de Rijksoverheid. Hergebruik is wat het Internetdomeinbeleid Rijksoverheid vraagt. `obis.overheid.nl` benoemt het programma en biedt ruimte aan latere voorzieningen van OBIS. |
| 3. Subdomein onder `rijksapps.nl` | `notificaties.obis.rijksapps.nl` | Eveneens hergebruik van een bestaand overheidsdomein, zonder nieuwe registratie. De naam benoemt een ander product en zegt aansluitende partijen niets over OBIS of de Notificatiedienst. Alleen aan de orde als optie 2 wordt afgewezen. |
| 4. Eigen `.nl`-domein voor het programma | `notificaties.obis-overheid.nl` | De naam is van ons en benoemt programma en dienst. Registratie loopt via de Dienst Publiek en Communicatie (DPC) als registrar van de Rijksoverheid; DNSSEC, SPF, DMARC en CAA worden apart ingericht. Een nieuw domein voegt toe aan het aantal dat de overheid juist wil terugdringen en is pas aan de orde als ook optie 3 afvalt; het moet dan voor meer dan één dienst bruikbaar zijn. |

## Decision

De Notificatiedienst krijgt haar adressen onder `obis.overheid.nl`, met `notificaties.obis.overheid.nl` als hoofdnaam. Komt die naam er niet, dan volgt de voorkeursvolgorde hierboven.

1. **Domein.** Het programma vraagt `obis.overheid.nl` aan bij Logius als houder van `overheid.nl`. Daaronder is `notificaties.obis.overheid.nl` de hoofdnaam van de Notificatiedienst; andere voorzieningen van OBIS krijgen een eigen label onder `obis.overheid.nl`. Er wordt geen domein voor de Notificatiedienst alleen geregistreerd. De componenten van MijnOverheid Zakelijk blijven onder `mijnoverheidzakelijk.nl`.

2. **Terugvalopties.** Wordt `obis.overheid.nl` afgewezen, dan vraagt het programma `obis.rijksapps.nl` aan. Valt ook die af, dan registreert het programma via DPC één eigen `.nl`-domein op programmaniveau, dat alle voorzieningen van OBIS draagt en niet alleen de Notificatiedienst. De werknaam daarvoor is `obis-overheid.nl`; dat is een voorstel, de definitieve naam wordt op dat moment gekozen in afstemming met de beheerders van het domeinnaambeleid en getoetst aan het Internetdomeinbeleid Rijksoverheid en op beschikbaarheid bij SIDN. Het naamschema hieronder geldt bij elke terugvaloptie ongewijzigd, met `notificaties.obis.<domein>` als hoofdnaam.

3. **Omgevingen.** De omgevingen hangen onder de hoofdnaam. Productie is de hoofdnaam zelf; een niet-productieomgeving krijgt haar label ervoor. De labels zijn `tst`, `acc` en `preprod`; een adres zonder omgevingslabel betekent altijd productie.

   | Omgeving | Hostnaam |
   | :------- | :------- |
   | test | `tst.notificaties.obis.overheid.nl` |
   | acceptatie | `acc.notificaties.obis.overheid.nl` |
   | pre-productie | `preprod.notificaties.obis.overheid.nl` |
   | productie | `notificaties.obis.overheid.nl` |

4. **Beheer van de zone.** Het programma vraagt bij Logius delegatie van `obis.overheid.nl` naar eigen naamservers, zodat de records onder eigen beheer vallen. Op de namen gelden de maatregelen uit ADR 0016: `v=spf1 -all`, geen MX, een expliciet DMARC-record met `p=reject` en een CAA-record met de gebruikte uitgever; DNSSEC volgt uit de keten van `overheid.nl` en wordt bij delegatie op de eigen zone voortgezet. De dienst verstuurt zelf geen e-mail vanaf deze naam.

5. **Latere `.gov.nl`-naam.** Komt `.gov.nl` beschikbaar, dan wordt `notificaties.obis.gov.nl` de hoofdnaam en blijft de naam onder `overheid.nl` als alias bestaan zolang aansluitende partijen ernaar verwijzen. Het naamschema gaat ongewijzigd mee.

## Consequences

* Bij toekenning van `obis.overheid.nl` komt er geen domeinnaam bij in het Register Internetdomeinen Overheid; latere voorzieningen van OBIS krijgen een label onder dezelfde naam en vragen evenmin een domein aan.
* Aansluitende partijen zien één naam die programma en dienst benoemt en los staat van MijnOverheid Zakelijk.
* De keuze hangt af van de toekenning door Logius. Tot `obis.overheid.nl` is toegekend, worden geen adressen van de Notificatiedienst bij aansluitende partijen vastgelegd.
* Onder `overheid.nl` gelden de apex-records en het beleid van Logius; eigen records zijn er alleen voor wat Logius delegeert of op verzoek aanmaakt. Wordt de zone niet gedelegeerd, dan loopt elke DNS-wijziging via Logius.
* Bij de laatste terugvaloptie komt er een tweede domein naast `mijnoverheidzakelijk.nl`, met eigen registratie, DNS-zone, DNSSEC, SPF, DMARC en CAA, en een eigen plek in de periodieke internet.nl-controle uit ADR 0016.
* Het label `preprod` wordt in documenten als "pre-productie" geschreven; in hostnamen wordt het nooit anders gespeld, omdat labels in configuratie van aansluitende partijen letterlijk terugkomen.

### Buiten deze beslissing

* Op welk platform de omgevingen draaien en hoe de DNS-records daarheen verwijzen.
* Certificaten en toegangsbeperkingen per omgeving.
* Of de naam bij Min AZ gemeld moet worden: het open besluit uit ADR 0025 geldt ook hier.

## Verwijzingen

* [notificatiedocs §01 Context](../notificatiedocs/01-context.md): de Notificatiedienst als generieke voorziening binnen het programma OBIS
* [notificatiedocs §14 Productiegereedheid](../notificatiedocs/14-productiegereedheid.md): de domeinnaam en de melding bij Min AZ als open punten
* [Internetdomeinbeleid Rijksoverheid 1.0](https://digitaleoverheid.nl/html/internetdomeinbeleid-rijksoverheid.html): hergebruik van een bestaand overheidsbreed domein gaat vóór een nieuw domein
* [Register Internetdomeinen Overheid: `overheid.nl`](https://organisaties.overheid.nl/domeinen/71428/Logius/domeinnaamregistratie/29606579/overheid.nl): Logius als houder van `overheid.nl` namens de Rijksoverheid
* [Binnenlands Bestuur, "Aanvraag voor toplevel-domeinnaam pas 2026 mogelijk"](https://www.binnenlandsbestuur.nl/digitaal/aanvraag-voor-toplevel-domeinnaam-pas-2026-mogelijk): stand van de invoering van `.gov.nl`
* [Dienst Publiek en Communicatie](https://organisaties.overheid.nl/domeinen/94546/Dienst_Publiek_en_Communicatie): registrar van domeinnamen van de Rijksoverheid
