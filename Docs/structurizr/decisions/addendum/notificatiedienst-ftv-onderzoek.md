# Onderzoek: rol van Federatieve Toegangsverlening (FTV) voor het NMC

**Onderwerp:** wat FTV betekent voor het Notificatie Management Component (NMC) naast het gebruik van FSC  \
**Datum:** 2026-10-08  \
**Status:** concept

---

## 1. Aanleiding

Het NMC wordt voor dienstverleners ontsloten over FSC (issue #859). In de documentatie worden FSC en FTV vaak in één adem genoemd, bijvoorbeeld als "FSC voor het contract, FTV voor het token per verzoek". Dit onderzoek zet uiteen wat FTV inhoudt, wat FSC al afdekt en wat FTV daar voor het NMC aan toevoegt.

## 2. Wat FTV is

Federatieve Toegangsverlening is de methodiek van het Federatief Datastelsel voor autorisatie volgens het patroon Externalized Authorization Management (EAM). Toegangsregels staan buiten de applicatiecode in policies, worden centraal beheerd en lokaal afgedwongen, bij elk verzoek en op elk punt in de keten.

De onderdelen volgen het XACML-model:

- **PEP** (Policy Enforcement Point): onderschept het verzoek, vraagt een besluit en voert het uit. Dat kan een gateway voor de applicatie zijn of een component in de applicatie.
- **PDP** (Policy Decision Point): neemt het besluit op basis van de policies.
- **PAP** (Policy Administration Point): beheert de policies.
- **PIP** (Policy Information Point): levert aanvullende gegevens voor het besluit.

FTV bestaat uit drie standaarden, in beheer bij Logius:

| Standaard | Inhoud | Stand |
|---|---|---|
| NLGov AuthZEN 1.0 | Profiel op de OpenID AuthZEN Authorization API: het koppelvlak tussen PEP en PDP (subject, action, resource, context; antwoord ja of nee). Het profiel voegt verwijzingen naar verwerkingsactiviteiten (aansluitend op het LDV) en naar het Algoritmeregister toe. | Definitief; in maart 2026 aangemeld bij Forum Standaardisatie, nog niet op de pas-toe-of-leg-uitlijst |
| Authorization Decision Log (ADL) 1.0 | Logboek van toegangsbesluiten: per besluit het verzoek en het antwoord in AuthZEN-formaat, op vier detailniveaus (besluit; plus policyversies; plus PIP-bronnen; plus PDP-configuratie). Aanbieder en afnemer loggen elk hun eigen besluit. Gekoppeld aan het LDV en de FSC-logging via W3C Trace Context. | Definitief |
| Register Toegangsbeleid | Publicatie en inzage van toegangsbeleid. | In ontwikkeling, eerste versie verwacht in 2026 |

OpenFTV is de referentie-implementatie van een EAM-oplossing. De OpenFSC-inway heeft een AuthZEN-plugin (configuratie `AuthZenServiceURL`, `AuthZenCAPath`, `AuthZenWithBody`, in versie 2.8.0) waarmee de inway als PEP een PDP raadpleegt voordat het verzoek de service bereikt. Of deze plugin in de op ZAD gepinde versies (v2.5.2 en v2.6.0) aanwezig is, is niet nagegaan.

## 3. Wat FSC al afdekt

FSC regelt de verbinding tussen organisaties:

- een contract per dienst tussen afnemer en aanbieder, met de grant als technische toestemming;
- wederzijdse identificatie met mTLS op basis van PKIoverheid, met het OIN als PeerID;
- per verzoek een toegangstoken in de header `Fsc-Authorization`, ondertekend door de Manager van de aanbieder, met `sub` = OIN van de afnemer en gebonden aan diens certificaat (`cnf`). De inway geeft deze header ongewijzigd door aan de service (fsc-core 2.0.0, §4.7.1.3);
- logging van de transacties door inway en outway.

Het toegangstoken per verzoek is daarmee onderdeel van FSC. Het is geen FTV-token; FTV kent geen eigen token.

FSC beslist op het niveau "deze organisatie mag deze dienst aanroepen". Wat de afnemer binnen de dienst mag, valt buiten FSC.

## 4. Wat FTV toevoegt voor het NMC

### 4.1 Toegangsregels binnen de dienst

Het NMC kent regels die fijner zijn dan een FSC-contract:

1. **Per object:** een dienstverlener leest en wijzigt alleen notificaties, status en events met zijn eigen OIN (notificatiedocs, 03-kwaliteitseisen).
2. **Per koppelvlak:** centrale en decentrale regie verwerken gegevens onder een eigen grondslag; de centrale intake ontvangt identificerende nummers. Welke dienstverlener welk regie-model mag gebruiken, is een toegangsregel (notificatiedocs, 06-software-architectuur).
3. **Per scope:** scope-gebaseerde autorisatie per dienst en dienstverlener (notificatiedocs, 04-beperkingen).

FTV biedt een plek voor deze regels buiten de code:

- Regel 2 en 3 hangen alleen af van de OIN en het aangeroepen pad. Een PDP achter de AuthZEN-plugin van de inway kan ze afdwingen, met de OIN uit het FSC-token als subject en pad en methode als resource en action. Een nieuwe dienstverlener of een gewijzigd regie-model is dan een policywijziging in plaats van een release van het NMC.
- Regel 1 hangt af van de eigenaar van een notificatie in de NMC-database. Een PDP zou daarvoor het NMC als PIP moeten raadplegen. Deze controle blijft in het NMC zelf, zoals nu ontworpen; de OIN komt dan uit het doorgegeven `Fsc-Authorization`-token.

### 4.2 Verantwoording van toegangsbesluiten

Het LDV legt vast welke persoonsgegevens met welk doel zijn verwerkt. Het ADL legt vast waarom een verzoek is toegelaten of geweigerd. Samen met de FSC-logging vormen ze drie logboeken die via dezelfde trace aan elkaar gekoppeld zijn.

Voor het NMC betekent dit:

- Bij een PDP achter de inway logt die PDP of de inway de besluiten in het ADL.
- Een weigering door het NMC zelf (regel 1) is ook een toegangsbesluit. Zonder ADL staat die alleen in de applicatielog.
- Het NMC moet de W3C `traceparent` van het inkomende verzoek overnemen in zijn LDV-registraties. Anders is een LDV-regel niet terug te voeren op het FSC-verzoek en het besluit dat de toegang verleende.

### 4.3 Het NMC als afnemer

Bij centrale regie haalt het NMC het e-mailadres op bij de Profielservice. Het NMC is dan afnemer:

- Volgens het ADL logt ook de afnemer zijn besluit om het verzoek te doen.
- Als de Profielservice een PDP gebruikt die het doel van de verwerking meeweegt, moet het NMC dat doel in de context van het verzoek meegeven. Dit hangt af van hoe de Profielservice zijn toegang inricht.

### 4.4 Wat FTV niet verandert

- De FSC-inrichting (contract, grant, mTLS, toegangstoken) blijft zoals ingeregeld.
- De subject-authenticatie (namens welke burger of onderneming) valt buiten FTV en blijft in de service.
- De koppelingen die niet over FSC lopen (NotifyNL-callback, webhook naar de dienstverlener) vallen buiten FTV. De authenticatie van de NotifyNL-callback staat in notificatiedocs, 03-kwaliteitseisen.
- Het OAuth2-toegangstoken van de IAM-gateway van MOZa dat de notificatiedocs noemen, is geen onderdeel van FTV. Naast het FSC-token draagt het dezelfde OIN; of beide nodig zijn, is een aparte vraag.

## 5. Verplichting

FTV is voor het NMC nu niet verplicht. NLGov AuthZEN ligt bij Forum Standaardisatie ter beoordeling. Na opname op de pas-toe-of-leg-uitlijst valt een nieuwe autorisatievoorziening voor het NMC onder pas toe of leg uit. Het ADL hangt daaraan vast, omdat het de AuthZEN-berichten logt.

## 6. Conclusie en advies

FSC bepaalt welke organisatie het NMC mag aanroepen en levert per verzoek een geverifieerde OIN. FTV bepaalt wat die organisatie binnen het NMC mag en legt elk besluit daarover vast. Het per-verzoek-token dat nu als FTV wordt aangeduid, hoort bij FSC.

Advies:

1. Gebruik in de documentatie "FSC-toegangstoken" voor het `Fsc-Authorization`-token en reserveer "FTV" voor policy-gebaseerde autorisatie en het ADL. De bijlage *Logging, Toegang en Doelbinding* (§5 en §6) beschrijft FTV nu als tokenuitwisseling.
2. Leid de OIN van de dienstverlener in het NMC af uit het doorgegeven `Fsc-Authorization`-token en houd de eigenaarscontrole per notificatie in het NMC.
3. Neem de W3C `traceparent` van het inkomende verzoek over in de LDV-registraties van het NMC.
4. Vraag Logius of de inway op de LPC de AuthZEN-plugin aanbiedt met een PDP en een ADL. Zo ja, verplaats de regels per koppelvlak en per scope (4.1, regel 2 en 3) naar policies. Zo nee, houd ze in het NMC en volg de beoordeling door Forum Standaardisatie.

## 7. Bronnen

- [FTV, VNG Realisatie](https://vng-realisatie.github.io/ftv/): methodiek, principes, toepassen
- [NLGov AuthZEN](https://vng-realisatie.github.io/ftv/methodiek/authzen-nlgov/)
- [Authorization Decision Log](https://vng-realisatie.github.io/ftv/methodiek/adl/)
- [Register Toegangsbeleid](https://vng-realisatie.github.io/ftv/methodiek/register-toegangsbeleid/)
- [Logius, openbare consultatie NLGov AuthZEN 1.0](https://www.logius.nl/actueel/openbare-consultatie-nlgov-authzen-authorization-api-v10)
- [OpenFSC inway, Go-package](https://pkg.go.dev/go.open-fsc.nl/inway) en [AuthZEN-plugin](https://pkg.go.dev/go.open-fsc.nl/v2/inway/plugins)
- [FSC-standaard](https://fsc-standaard.nl/)
