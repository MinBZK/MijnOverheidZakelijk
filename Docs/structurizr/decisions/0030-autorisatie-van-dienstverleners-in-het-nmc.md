# 30. Autorisatie van dienstverleners in het NMC: FSC-toegangstoken, geen FTV

Datum: 2026-10-27

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0010 LDV implementatie](0010-ldv-implementatie.md): verwerkingen van persoonsgegevens worden vastgelegd in het Logboek Dataverwerkingen.
* [ADR 0020 Standaard afleverstatus-terugkoppeling](0020-standaard-afleverstatus-terugkoppeling.md): FSC op de inkomende richting, niet op de webhook.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): het Dienstverlenerregister en de autorisatie per dienstverlener op basis van het OIN uit het token.
* [ADR 0027 Koppelingen van het Notificatie Management Component](0027-koppelingen-van-het-nmc.md): de dienstverleners roepen het NMC aan over de FSC-inway.
* [ADR 0029 FSC-ontsluiting van het NMC via internet](0029-fsc-ontsluiting-nmc-via-internet.md): de toegang steunt volledig op FSC.

## Context

Dienstverleners roepen het Notificatie Management Component (NMC) aan over FSC. In de documentatie van MOZa worden FSC en FTV vaak in één adem genoemd, bijvoorbeeld als "FSC voor het contract, FTV voor het token per verzoek". De bijlage *Logging, Toegang en Doelbinding* beschrijft FTV als een token met organisatie-identiteit, rol en contractcontext dat de ontvangende service valideert. Voor de landing op de LPC moet vaststaan wat het NMC van FSC gebruikt, wat FTV inhoudt en of het NMC FTV toepast.

### Wat FSC regelt

FSC regelt de verbinding tussen organisaties:

* een contract per dienst tussen afnemer en aanbieder, met de grant als technische toestemming;
* wederzijdse identificatie met mTLS op basis van PKIoverheid, met het OIN als PeerID;
* per verzoek een toegangstoken in de header `Fsc-Authorization`, ondertekend door de Manager van de aanbieder, met `sub` = OIN van de afnemer en gebonden aan diens certificaat (`cnf`). De inway geeft deze header ongewijzigd door aan de service (fsc-core 2.0.0, §4.7.1.3);
* logging van de transacties door inway en outway.

FSC beslist op het niveau "deze organisatie mag deze dienst aanroepen" en levert per verzoek een geverifieerde OIN. Wat de afnemer binnen de dienst mag, valt buiten FSC.

### Wat FTV is

Federatieve Toegangsverlening is de methodiek van het Federatief Datastelsel voor autorisatie volgens het patroon Externalized Authorization Management. Toegangsregels staan buiten de applicatiecode in policies, worden centraal beheerd en lokaal afgedwongen, bij elk verzoek en op elk punt in de keten. De onderdelen volgen het XACML-model: een Policy Enforcement Point (PEP) onderschept het verzoek en voert het besluit uit, een Policy Decision Point (PDP) neemt het besluit op basis van de policies, een Policy Administration Point (PAP) beheert de policies en een Policy Information Point (PIP) levert aanvullende gegevens.

FTV bestaat uit drie standaarden, in beheer bij Logius:

| Standaard | Inhoud | Stand |
|---|---|---|
| NLGov AuthZEN 1.0 | Profiel op de OpenID AuthZEN Authorization API: het koppelvlak tussen PEP en PDP (subject, action, resource, context; antwoord ja of nee), met verwijzingen naar verwerkingsactiviteiten (aansluitend op het LDV) en het Algoritmeregister | Definitief; in maart 2026 aangemeld bij Forum Standaardisatie |
| Authorization Decision Log (ADL) 1.0 | Logboek van toegangsbesluiten: per besluit het verzoek en het antwoord in AuthZEN-formaat, gekoppeld aan het LDV en de FSC-logging via W3C Trace Context. Aanbieder en afnemer loggen elk hun eigen besluit | Definitief |
| Register Toegangsbeleid | Publicatie en inzage van toegangsbeleid | In ontwikkeling |

FTV kent geen eigen token. Het toegangstoken per verzoek is onderdeel van FSC. OpenFTV is de referentie-implementatie; de OpenFSC-inway heeft vanaf versie 2.8.0 een AuthZEN-plugin waarmee de inway als PEP een PDP raadpleegt voordat het verzoek de service bereikt.

### De toegangsregels van het NMC

Het NMC kent drie regels die fijner zijn dan een FSC-contract (ADR 0024, notificatiedocs §03, §04 en §06):

1. **Per object:** een dienstverlener leest en wijzigt alleen notificaties, status en events met zijn eigen OIN. Een notificatie van een andere dienstverlener bestaat voor de aanroeper niet.
2. **Per koppelvlak:** centrale en decentrale regie verwerken gegevens onder een eigen grondslag; welke dienstverlener welk regie-model mag gebruiken, is een toegangsregel.
3. **Per scope:** toegestane berichttypen en quota per dienstverlener.

Alle drie de regels hangen aan één sleutel, het OIN, en alle drie staan in het Dienstverlenerregister, dat het NMC ook nodig heeft voor de webhook, de bevestigingstermijn, de maximale cursorleeftijd en het beheerkanaal. Het NMC kent één soort aanroeper, de dienstverlener, die op eigen titel handelt. Er is geen subject-JWT, geen doelbinding per verzoek en geen delegatieketen.

Een PDP achter de inway kan regel 2 en 3 afdwingen met het OIN uit het FSC-token als subject en pad en methode als resource en action. Regel 1 hangt af van de eigenaar van een notificatie in de notificatiedatabase; een PDP zou daarvoor het NMC als PIP moeten raadplegen. Het Dienstverlenerregister zou dan twee keer bestaan, eenmaal als policy en eenmaal als tabel in het NMC.

## Decision

1. **Het FSC-toegangstoken is de identiteit van de dienstverlener.** Het NMC leidt het OIN af uit het doorgegeven `Fsc-Authorization`-token en valideert de handtekening tegen de sleutel van de eigen Manager. Het OIN komt nooit uit de payload.
2. **De toegangsregels blijven in het NMC.** Regie-model, berichttypen, quota en eigenaarschap per notificatie worden afgedwongen in het NMC op basis van het Dienstverlenerregister. Het NMC gebruikt geen PDP en is niet afhankelijk van een AuthZEN-plugin op de inway.
3. **Het NMC legt zijn toegangsbesluiten vast.** Elk toegelaten en elk geweigerd verzoek van een dienstverlener wordt gelogd als toegangsbesluit in het formaat van het Authorization Decision Log, met de W3C `traceparent` van het inkomende verzoek. Dezelfde `traceparent` gaat mee in de LDV-registraties van het NMC, zodat FSC-logging, toegangsbesluit en verwerkingsregistratie aan elkaar gekoppeld zijn.
4. **Terminologie.** Het per-verzoek-token in de header `Fsc-Authorization` heet in de documentatie van MOZa "FSC-toegangstoken". "FTV" is gereserveerd voor policy-gebaseerde autorisatie (AuthZEN, PDP) en het ADL.

FTV gaat verder dan de autorisatie die het NMC nodig heeft. De methodiek is bedoeld voor situaties met meerdere soorten aanroepers, regels die los van de applicatie wijzigen en toegangsbeleid dat voor buitenstaanders inzichtelijk moet zijn. Het NMC heeft één soort aanroeper met één sleutel, en elke regel is een opzoeking in een register dat het NMC toch al beheert. De regel die voor de gegevensbescherming het meest telt, eigenaarschap per notificatie, blijft bij een PDP ook in het NMC. Wat FTV wel toevoegt en het NMC mist, de verantwoording van toegangsbesluiten, is afgedekt met besluit 3 zonder PDP.

Deze keuze wordt heroverwogen zodra het NMC aanroepers krijgt die namens een ander handelen, een tweede soort aanroeper met andere rechten, of zodra dienstverleners het toegangsbeleid moeten kunnen inzien en betwisten. De regels per koppelvlak en per scope verhuizen dan naar policies; de eigenaarscontrole per notificatie blijft in het NMC.

## Consequences

* Inkomende verzoeken over FSC worden door het NMC zelf gevalideerd op het FSC-toegangstoken. De FSC-inrichting (contract, grant, mTLS, Directory) verandert niet.
* Het OAuth2-toegangstoken van de IAM-gateway van MOZa uit ADR 0024 is geen onderdeel van FTV. Naast het FSC-toegangstoken draagt het hetzelfde OIN; deze ADR laat ADR 0024 op dat punt ongewijzigd.
* Een nieuwe dienstverlener of een gewijzigd regie-model is een mutatie in het Dienstverlenerregister, geen policywijziging in een PAP.
* Het NMC schrijft naast het LDV een tweede logboek, het ADL. De weigering van een verzoek staat daarmee niet alleen in de applicatielog.
* Bij centrale regie is het NMC afnemer van de Profielservice. Als het ADL ook voor afnemers geldt, logt het NMC zijn besluit om het verzoek te doen op dezelfde wijze. Of de Profielservice het doel van de verwerking in de context van het verzoek verwacht, hangt af van haar eigen toegangsinrichting.
* De koppelingen die niet over FSC lopen, de NotifyNL-callback en de webhook naar de dienstverlener, vallen buiten deze ADR; hun authenticatie staat in ADR 0027.
* De bijlage *Logging, Toegang en Doelbinding* (§5 en §6) en de profielservicedocs beschrijven FTV als tokenuitwisseling en noemen het FSC-toegangstoken "FTV-token". Voor het NMC geldt de terminologie uit besluit 4.

Kanttekening: NLGov AuthZEN ligt bij Forum Standaardisatie ter beoordeling. Na opname op de pas-toe-of-leg-uitlijst valt een nieuwe autorisatievoorziening voor het NMC onder pas toe of leg uit; deze ADR is dan de uitleg.

## Verwijzingen

* [FTV, VNG Realisatie](https://vng-realisatie.github.io/ftv/): methodiek, principes, toepassen
* [NLGov AuthZEN](https://vng-realisatie.github.io/ftv/methodiek/authzen-nlgov/)
* [Authorization Decision Log](https://vng-realisatie.github.io/ftv/methodiek/adl/)
* [Register Toegangsbeleid](https://vng-realisatie.github.io/ftv/methodiek/register-toegangsbeleid/)
* [Logius, openbare consultatie NLGov AuthZEN 1.0](https://www.logius.nl/actueel/openbare-consultatie-nlgov-authzen-authorization-api-v10)
* [FSC-standaard](https://fsc-standaard.nl/): fsc-core 2.0.0 §4.7.1.3 over het doorgeven van `Fsc-Authorization`
* [OpenFSC inway, AuthZEN-plugin](https://pkg.go.dev/go.open-fsc.nl/v2/inway/plugins)
* [Bijlage Logging, Toegang en Doelbinding](addendum/profiel-service-logging-en-toegang.md)
