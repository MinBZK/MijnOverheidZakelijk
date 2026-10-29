# 29. FSC-ontsluiting van het NMC via internet

Datum: 2026-10-08

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0020 Standaard afleverstatus-terugkoppeling](0020-standaard-afleverstatus-terugkoppeling.md): FSC op de inkomende richting, waarmee dienstverleners de Notificatiedienst aanroepen.
* [ADR 0021 Twee regie-modellen in plaats van de scenario's 2, 8 en 9](0021-twee-regie-modellen-ipv-scenarios.md): bij gecentraliseerde regie kan het identificerend nummer een BSN zijn.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): de DV-koppelvlakken lopen over FSC met een OAuth2-token op berichtniveau; volume en gegevens per notificatie.
* [ADR 0025 Productiegereedheid van MOZa-backendsystemen](0025-productiegereedheid-backendsystemen.md): afnemers alleen via FSC; het adres van de inway is publiek bereikbaar via internet.
* ADR 0027 Koppelingen van het Notificatie Management Component (in voorbereiding): de FSC-inway als netwerkpad voor de dienstverleners.
* ADR 0030 Autorisatie van dienstverleners in het NMC (in voorbereiding): het FSC-toegangstoken als identiteit van de dienstverlener.

## Context

Dienstverleners roepen het Notificatie Management Component (NMC) aan over FSC (ADR 0020, ADR 0024). FSC is netwerkonafhankelijk. De beveiliging zit in mTLS (binnen het Digikoppeling REST API-profiel met PKIoverheid-certificaten en het OIN als PeerID), in de contracten (grants) en in de Directory. FSC is een verplicht onderdeel van het Digikoppeling REST API-profiel, en Digikoppeling staat zowel internet als Diginetwerk toe. Voor de FSC-inway van het NMC moet daarom een netwerk gekozen worden: internet of Diginetwerk.

De criteria voor die keuze, toegepast op het NMC:

1. **Bereikbaarheid voor de peers.** De inway-adressen in de Directory moeten bereikbaar zijn vanaf de outways van alle peers in de FSC-groep. Diginetwerk is alleen toegankelijk voor overheidsorganisaties en organisaties met een publieke taak. Bij decentrale regie roept de OMC van de dienstverlener het NMC aan, en die OMC draait vaak bij een leverancier. Voor zulke partijen zou naast Diginetwerk een tweede route nodig zijn.
2. **Aansluitvoorwaarden van wederpartijen.** Geen wederpartij of keten van het NMC eist een besloten netwerk.
3. **Risicoanalyse en classificatie (BIO).** Het NMC ontvangt per notificatie een e-mailadres of een identificerend nummer, een berichttype en de waarden voor de personalisation. Bij gecentraliseerde regie kan dat nummer een BSN zijn (ADR 0021). De personalisation is vrije inhoud van de dienstverlener (ADR 0024); het NMC kan niet afdwingen wat daarin staat. De combinatie die om netwerkscheiding kan vragen, BSN met bijzondere persoonsgegevens, ontstaat dus alleen als een dienstverlener bijzondere persoonsgegevens in de personalisation zet. Diginetwerk is besloten, maar versleutelt niet uit zichzelf; FSC-mTLS is op beide netwerken nodig. Netwerkscheiding zou een aanvullende laag zijn, geen vervanging van de versleuteling.
4. **Aanvalsoppervlak.** Een inway op internet is publiek bereikbaar voor scans, DDoS en misbruik van kwetsbaarheden in de TLS-stack of de inway zelf. Zonder geldig certificaat en contract komt een aanvaller niet bij het NMC. Op Diginetwerk is de blootstelling kleiner.
5. **Beschikbaarheid.** Diginetwerk borgt beschikbaarheid via een SLA; internet is best-effort. Met Diginetwerk wordt het NMC afhankelijk van de koppelnetwerkleverancier en diens wijzigingsprocessen. De verzending via NotifyNL en de receipt-callback van NotifyNL lopen over internet zolang NotifyNL buiten de LPC draait (ADR 0024; open besluit in ADR 0025).
6. **Hosting en inrichting.** Vanuit een Kubernetes-omgeving is internetconnectiviteit standaard aanwezig. Diginetwerk vraagt aparte routering, eigen adresruimte of NAT, DNS-inrichting en firewallwijzigingen via een leverancier, per koppeling en per omgeving (test, acceptatie, productie).
7. **Kosten en doorlooptijd.** Diginetwerk heeft aansluit- en abonnementskosten, en elke netwerkwijziging is een change bij de leverancier. Op internet sluit een nieuwe peer aan met alleen een FSC-contract.
8. **Volume.** Eén dienstverlener heeft een piek van 2,2 miljoen notificaties in één maand opgegeven (ADR 0024). Een Diginetwerk-aansluiting is doorgaans kleiner gedimensioneerd dan een internetuplink, en bij zulke volumes is de bandbreedte van die aansluiting een risico.

## Decision

Het NMC wordt op FSC ontsloten via **internet**. De FSC-inway van de Notificatiedienst is vanaf internet bereikbaar en staat met dat adres in de Directory. Er komt geen inway op Diginetwerk.

De doorslag geven drie punten:

* **Volume.** Bij de verwachte pieken is de capaciteit van een Diginetwerk-aansluiting een risico; een internetuplink schaalt mee.
* **Voorkeur van de afnemers.** Dienstverleners en hun leveranciers sluiten liever via internet aan. Dat vergt geen Diginetwerk-aansluiting en geen tweede route voor partijen zonder toegang tot Diginetwerk.
* **Gevoeligheid van de gegevens.** Dienstverleners zetten geen bijzondere persoonsgegevens in de personalisation; dat is een aansluitvoorwaarde. Een BSN met contactgegevens en een berichttype vraagt dan niet om netwerkscheiding als aanvullende maatregel bovenop FSC-mTLS en het OAuth2-token op berichtniveau.

Deze keuze wordt heroverwogen zodra een dienstverlener of keten Diginetwerk als aansluitvoorwaarde stelt, of een risicoanalyse netwerkscheiding als aanvullende maatregel voorschrijft. Een aanvullende inway op Diginetwerk komt dan in een eigen FSC-groep, met gescheiden Directory-registraties en certificaten.

## Consequences

* De inway is publiek bereikbaar en krijgt DDoS-bescherming en rate limiting aan de rand van het platform. Kwetsbaarheden in de inway en de TLS-stack worden met voorrang gepatcht.
* De toegang steunt volledig op FSC: mTLS met PKIoverheid-certificaten, contracten in de Directory, het FSC-toegangstoken met het OIN van de dienstverlener (ADR 0030) en het OAuth2-token op berichtniveau (ADR 0024). Het netwerk telt niet als beveiligingsmaatregel.
* De beschikbaarheid van de route naar de dienstverleners is best-effort, net als de route naar NotifyNL.
* Er zijn geen aansluitkosten of netwerkchanges bij een koppelnetwerkleverancier. Een nieuwe dienstverlener of omgeving sluit aan met een FSC-contract.
* De aansluitvoorwaarden van de Notificatiedienst verbieden bijzondere persoonsgegevens in de personalisation. Een dienstverlener die ze toch nodig heeft, is aanleiding om deze keuze te heroverwegen.
* Dienstverleners die alleen via Diginetwerk naar buiten kunnen, hebben een outway nodig die internet bereikt.

## Verwijzingen

* [FSC, Federated Service Connectivity](https://fsc-standaard.nl/): inway, outway, Directory en contracten
* [Digikoppeling Koppelvlakstandaard REST API 4.0.1](https://gitdocumentatie.logius.nl/publicatie/dk/restapi/4.0.1/): FSC verplicht binnen het profiel, OIN als PeerID, PKIoverheid als vertrouwensanker
* [Standaarden op developer.overheid.nl](https://developer.overheid.nl/kennisbank/infra/standaarden): FSC als onderdeel van het Digikoppeling REST API-profiel
* [Diginetwerk Architectuurdocument v1.4 (Logius)](https://test-dictu.logius.nl/sites/default/files/bestanden/website/Diginetwerk%20Architectuurdocument%20v1.4.pdf): Basiskoppelnetwerk, aangesloten netwerken en SLA
