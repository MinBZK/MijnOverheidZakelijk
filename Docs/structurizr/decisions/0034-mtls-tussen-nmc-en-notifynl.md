# 34. mTLS tussen het NMC en NotifyNL

Datum: 2026-11-16

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): NotifyNL als verzendkanaal.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): de twee koppelingen met NotifyNL en hun authenticatie met een JWT en een bearer-token. Deze ADR vervangt de zin "De authenticatie richting NotifyNL is een JWT, geen mTLS" uit de Consequences van ADR 0024.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): besluit 5 (naast de inway geen eigen publiek bereikbaar endpoint), besluit 10 (BIO-toetsing als formele toets) en het open besluit of verkeer tussen componenten via FSC loopt, met NotifyNL als voorbeeld.
* [ADR 0027 Koppelingen van het Notificatie Management Component](0027-koppelingen-van-het-nmc.md): de koppelingen 2 en 3 met NotifyNL.
* [ADR 0029 FSC-ontsluiting van het NMC via internet](0029-fsc-ontsluiting-nmc-via-internet.md): het netwerk telt niet als beveiligingsmaatregel.
* [ADR 0032 Beheer van TLS-certificaten](0032-acme-voor-certificaatbeheer.md): cert-manager voor uitgifte en vernieuwing van certificaten, en de bewaking van vervaldata.

## Context

Het Notificatie Management Component (NMC) heeft twee koppelingen met NotifyNL (ADR 0024):

* **Uitgaand.** Het NMC roept de REST-API van NotifyNL aan om een e-mail te versturen, op `reference` te zoeken en de afleverstatus op te vragen. Elke aanroep draagt een JWT die het NMC ondertekent met het secret uit de API-key van de NotifyNL-service.
* **Inkomend.** NotifyNL meldt elke statuswijziging als delivery receipt op de Afleverstatus-callback van het NMC, met een bearer-token dat bij NotifyNL is geregistreerd.

Over beide koppelingen lopen persoonsgegevens. Bij het verzenden zijn dat het e-mailadres van de ontvanger en de waarden voor de personalisation, die vrije inhoud van de dienstverlener zijn. De delivery receipt bevat het e-mailadres. Een identificerend nummer zoals het BSN stuurt het NMC niet als eigen veld naar NotifyNL.

Zonder mTLS blijkt alleen uit de JWT en het bearer-token wie de aanroeper is. Een gelekt secret is dan genoeg om zich als het NMC of als NotifyNL voor te doen.
Voor de landing in productie is het uitgangspunt dat verbindingen waarover persoonsgegevens lopen met mTLS zijn beveiligd: beide kanten tonen in de TLS-handshake een certificaat. De BIO-toetsing uit ADR 0025 is daarop de formele toets. mTLS kan op de koppelvlakken van NotifyNL worden ingeschakeld.

Het verkeer tussen het NMC en NotifyNL loopt over twee soorten netwerkpaden:

* **Verkeer van buiten Logius.** De ontwikkel- en previewomgevingen van het NMC draaien op ZAD, buiten Logius. Die omgevingen gebruiken naar verwachting een mock van NotifyNL. Roept een omgeving buiten Logius NotifyNL wel aan, dan loopt het verkeer over internet: het NMC roept het publieke adres van NotifyNL aan, en de Afleverstatus-callback is een pad van het NMC dat vanaf internet bereikbaar is. Zolang NotifyNL en het NMC in productie niet op hetzelfde platform staan, geldt dit pad ook daar.
* **Verkeer binnen Logius.** Productie van het NMC gaat op de Logius Private Cloud (LPC) draaien, in dezelfde namespace als NotifyNL. Het verkeer hoeft Logius dan niet te verlaten.

De koppelingen met NotifyNL zijn geen Digikoppeling-koppelvlak; NotifyNL biedt de GOV.UK Notify API. Het voorschrift van Digikoppeling om PKIoverheid-certificaten te gebruiken (TLS001, PKI005) geldt hier dus niet. De BIO schrijft voor verkeer tussen systemen geen soort certificaat voor. De BIO vraagt wel dat het sleutelbeheer is belegd, dat beide partijen hun afspraken over cryptografie vastleggen en dat de sterkte van de cryptografie de adviezen van het NCSC volgt.

De callback van NotifyNL kent twee instellingen: een URL en een bearer-token.

## Decision

Het NMC en NotifyNL communiceren in beide richtingen over mTLS. Dat geldt voor het verkeer van buiten Logius en voor het verkeer binnen Logius, met dezelfde oplossing.

1. **Uitgaand toont het NMC een clientcertificaat.** NotifyNL accepteert aanroepen voor de NotifyNL-services van het NMC alleen over een verbinding met dat certificaat. Het NMC valideert het servercertificaat van NotifyNL.
2. **Inkomend toont NotifyNL een clientcertificaat.** Een verzoek op het callback-pad zonder geldig clientcertificaat van NotifyNL wordt geweigerd.
3. **De server- en clientcertificaten komen van een eigen CA die cert-manager beheert.** De CA geeft alleen de certificaten voor deze koppeling uit. cert-manager vernieuwt ze automatisch, met een korte looptijd.
4. **Beide kanten controleren de keten en het subject.** Het certificaat van de ander moet door de eigen CA zijn uitgegeven en het subject moet dat van de wederpartij zijn. Alleen de keten controleren is onvoldoende, omdat het NMC en NotifyNL zich dan met elkaars certificaat kunnen aanmelden.
5. **mTLS komt bovenop de bestaande authenticatie.** De JWT op de uitgaande aanroepen en het bearer-token op de callback blijven. De JWT bepaalt bij NotifyNL namens welke service en met welke API-key wordt verzonden; mTLS stelt vast welk systeem de verbinding opzet.
6. **Het verkeer loopt rechtstreeks tussen het NMC en NotifyNL**, zonder FSC en zonder een voorziening van het platform die mTLS namens de applicatie uitvoert.

### Per netwerkpad

| | Verkeer van buiten Logius | Verkeer binnen Logius |
|---|---|---|
| Route | Internet: het publieke adres van NotifyNL en het publiek bereikbare callback-pad van het NMC | Adressen binnen de LPC |
| Uitgaand (NMC naar NotifyNL) | Clientcertificaat van het NMC, servercertificaat van NotifyNL gevalideerd | Hetzelfde |
| Inkomend (NotifyNL naar NMC) | Clientcertificaat van NotifyNL, afgedwongen op het callback-adres | Hetzelfde |
| Bescherming op netwerkniveau | Aanroeplimiet op de ingress (ADR 0024) | Geen vervanging van mTLS: het netwerk telt niet als beveiligingsmaatregel |

### Technische oplossingen

| Onderdeel | Oplossing |
|---|---|
| Clientcertificaat van het NMC | De REST-client naar NotifyNL gebruikt de benoemde TLS-configuratie `notify` van Quarkus. Die krijgt een key store met het clientcertificaat en de private sleutel, en een trust store met de eigen CA, waartegen het servercertificaat van NotifyNL wordt gevalideerd. |
| Eigen CA | Een `Issuer` van cert-manager met een eigen CA-certificaat. De private sleutel van de CA is een secret. |
| Certificaten en sleutels van het NMC | cert-manager schrijft het clientcertificaat, het servercertificaat voor de callback en de private sleutels als secret weg; het NMC leest ze daaruit. |
| Clientcertificaat op de callback | De component die TLS voor het NMC beëindigt, vraagt een clientcertificaat, valideert de keten en het subject en stuurt een verzoek op het callback-pad alleen dan door naar het NMC. Het callback-pad van het NMC is alleen via die component bereikbaar. |
| Adres van de callback | De callback staat op dezelfde hostname als de overige paden van het NMC, op een eigen pad. Het clientcertificaat wordt in de TLS-handshake gevraagd, voordat het pad van het verzoek bekend is; de eis dat het er is, geldt alleen op het callback-pad. |
| Kant van NotifyNL | NotifyNL vertrouwt de eigen CA en gebruikt een servercertificaat van die CA op de API. NotifyNL dwingt daar het clientcertificaat van het NMC af en toont bij elke delivery receipt een eigen clientcertificaat van die CA. De inrichting ligt bij het beheerteam van NotifyNL. |
| Vernieuwing | cert-manager vernieuwt de certificaten automatisch vóór de vervaldatum, met een nieuw sleutelpaar. Het NMC laadt een vernieuwd certificaat zonder herstart (`reload-period` van de TLS-configuratie). De controle op het subject in plaats van op één vast certificaat maakt dat een vernieuwd certificaat zonder wijziging aan de andere kant wordt geaccepteerd. |

## Alternatieven

### 1. FSC in beide richtingen

NotifyNL zou als service op een FSC-inway staan en het NMC zou via een outway aanroepen; voor de delivery receipts andersom. FSC levert mTLS met PKIoverheid-certificaten en sluit aan op besluit 5 uit ADR 0025.

Niet gekozen. FSC is de ontsluiting naar afnemers van een backendsysteem. Het NMC en NotifyNL vormen samen de Notificatiedienst; aan elke kant van deze koppeling staat precies één systeem. FSC vraagt hier per richting een inway, een outway en een contract, en maakt NotifyNL afhankelijk van een eigen outway om delivery receipts te kunnen afleveren, terwijl de callback van NotifyNL alleen een URL en een bearer-token kent. Daar staat geen autorisatie tegenover die het clientcertificaat met de subjectcontrole niet al geeft.

### 2. mTLS door het platform binnen Logius, eigen mTLS alleen daarbuiten

Binnen de LPC zou een voorziening van het platform, zoals een service mesh, het verkeer tussen de workloads versleutelen en wederzijds authenticeren. Alleen het verkeer over internet zou dan eigen clientcertificaten gebruiken.

Niet gekozen. Dit hangt af van een voorziening die het platform moet aanbieden en waar het NMC en NotifyNL allebei onder moeten vallen. Het dekt alleen verkeer binnen de LPC; over internet is het niet te gebruiken. De identiteit van de wederpartij wordt bovendien door het platform uitgegeven, buiten het beheer van beide teams.

## Consequences

* De authenticatie van beide koppelingen steunt op twee factoren: het certificaat op de verbinding en het secret in het verzoek. Een gelekte API-key of een gelekt callback-token is zonder de private sleutel niet bruikbaar.
* Voor de koppeling tussen het NMC en NotifyNL is het open besluit uit ADR 0025 hiermee genomen: dit verkeer loopt niet over FSC. Voor de overige koppelingen tussen componenten blijft dat besluit open.
* Er komt een eigen CA bij. Wie de private sleutel van die CA beheert, wordt vastgelegd in het cryptografiebeleid, zoals de BIO vraagt. De vervaldata van de CA en van de certificaten vallen onder de bewaking uit ADR 0032.
* De koppeling hangt af van cert-manager op het platform en van de afspraak met het beheerteam van NotifyNL om de eigen CA te vertrouwen.
* Een verlopen of geweigerd certificaat stopt het verzenden en de delivery receipts tegelijk. Het NMC behandelt dat als een storing bij NotifyNL: de verzendtaken wachten en worden hervat, en de Afleverstatus-navraag haalt de statussen op van pogingen waarvoor geen receipt is binnengekomen.
* Een verzoek dat om het clientcertificaat wordt geweigerd, bereikt het NMC niet en telt dus niet mee in de metriek voor afgewezen receipts. De component die TLS beëindigt, levert die signalering.
* Wordt de CA vervangen of verandert een subject, dan moet de andere kant haar controle aanpassen voordat het nieuwe certificaat in gebruik gaat.
### Buiten deze beslissing

* Welke certificaten de omgevingen buiten productie gebruiken.
* Welke component op de LPC TLS voor het NMC beëindigt en over welke adressen het verkeer binnen de LPC loopt.
* mTLS op de overige koppelingen van het NMC.

## Verwijzingen

* [notificatiedocs §06 Software architectuur](../notificatiedocs/06-software-architectuur.md)
* [notificatiedocs §14 Productiegereedheid](../notificatiedocs/14-productiegereedheid.md)
* [Digikoppeling Beveiligingstandaarden en voorschriften 3.0.1](https://gitdocumentatie.logius.nl/publicatie/dk/beveilig/3.0.1/): TLS001 en PKI005
* [Baseline Informatiebeveiliging Overheid 2 (BIO2)](https://github.com/MinBZK/Baseline-Informatiebeveiliging-Overheid): overheidsmaatregelen voor cryptografie
* [cert-manager CA issuer](https://cert-manager.io/docs/configuration/ca/): certificaten uit een eigen CA
* [GOV.UK Notify REST API](https://docs.notifications.service.gov.uk/rest-api.html): authenticatie en callbacks
* [Quarkus TLS registry](https://quarkus.io/guides/tls-registry-reference): benoemde TLS-configuraties met key store en trust store
* [FSC, Federated Service Connectivity](https://fsc-standaard.nl/): inway, outway en contracten
