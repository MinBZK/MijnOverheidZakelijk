## Context en doelstelling

Er bestaan al voorzieningen waarmee burgers gegevens kunnen beheren (zoals MijnOverheid-profielen), maar ondernemers vallen daar grotendeels buiten. Bovendien is de huidige inrichting vaak monolithisch en niet federatief; data wordt centraal opgeslagen in plaats van bij de bron of eigenaar.

**Een aantal uitdagingen;**

- Ondernemers moeten vaak opnieuw hun gegevens invullen bij elke overheidsdienst
- Er is geen 1 plek waar contactgegevens en -voorkeuren beheerd worden
- Er is onvoldoende inzicht over wie toegang heeft tot welke gegevens
- Met name voor ondernemers zijn er nog geen voorzieningen beschikbaar en komen er ook niet binnenkort

**Doel**

De Profiel Service biedt een betrouwbare, gestandaardiseerde en federatieve manier om persoonlijke en bedrijfsprofielgegevens en communicatievoorkeuren vast te leggen en te delen tussen erkende partijen.

![Profiel Service Context](embed:ProfielServiceContext)

De Profiel Service is een (verzameling van) service(s) die gebruikt kan worden in portalen of andere interactiecomponenten. De Profiel Service bevat persoons- en bedrijfsgegevens die gebruikt kunnen worden voor de communicatie tussen de gebruiker en de overheidsorganisaties. Dit zijn zowel contactgegevens (zoals e-mailadres of telefoonnummer) als de kanaalvoorkeuren (zoals e-mail, SMS of post) waarover de communicatie tussen de gebruiker en de overheidsorganisatie plaatsvindt.

## Visie

De Profiel Service stelt burgers en ondernemers in staat om op één vertrouwde plek hun contactgegevens en communicatievoorkeuren te beheren, en biedt overheidsinstanties via federatieve koppelingen veilige, actuele en herbruikbare profielinformatie voor persoonlijke en efficiënte dienstverlening.

## Doelstellingen

### Functionele doelstellingen

- Beheer van profielgegevens: e-mailadres, telefoonnummer, postadres (initieel)
- Instellen van contactvoorkeuren: bijvoorbeeld voorkeur voor digitaal of post, notificatiekanalen, etc.
- Ondersteuning van meerdere authenticatiemiddelen: DigiD, eHerkenning, eIDAS
- Koppeling met registers: KVK, BRP, BAG, gegevens bij de bron opvragen
- Federatief delen: gegevens worden niet centraal opgeslagen, maar beschikbaar gesteld via verifieerbare bronnen

### Strategische doelstellingen

- Versterken van vertrouwen in digitale dienstverlening (conform het Federatieve Datastelsel)
- Verlagen van administratieve lasten voor ondernemers
- Verbeteren van "omnichannel communicatie" tussen overheid en gebruiker
- Herbruikbaarheid van profieldata over meerdere overheidsdomeinen heen
- Incrementele groei: klein beginnen en iteratief uitbreiden

## Gefaseerde ontwikkelstrategie

| Fase                            | Omschrijving                                                                                                 | Resultaat                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Fase 1 - Basisprofiel           | Eenvoudig profiel met e-mailadres, telefoonnummer, postadres en 1 algemene voorkeur (bijv. digitaal of post) | Werkende MVP; alfa versie; eerste API's, federatieve authenticatie; LDV en Auditing |
| Fase 2 - Bedrijfsprofielen      | Koppeling met KVK en eHerkenning, beheer van bedrijfsprofielen                                               | Ondernemers kunnen namens een organisatie handelen                                  |
| Fase 3 - Kanaalvoorkeuren       | Uitbreiding met kanaalspecifieke voorkeuren (sms, e-mail, berichtenmagazijn, portaal, etc)                   | Ondersteuning voor omnichannel communicatie                                         |
| Fase 4 - Federatieve integratie | Integratie met overige bronregisters, zoals BRP, BAG etc.                                                    | Data wordt actueel en verifieerbaar opgehaald                                       |
| Fase 5 - Ecosysteemontwikkeling | Andere overheidsdiensten sluiten aan via de gestelde standaarden (API's, IODC, etc)                          | Federatief netwerk van vertrouwde profielknooppunten                                |

## Architectuurprincipes

- **Federatief Datastelsel** - alignment met de stelselafspraken en -richtlijnen
- **Data bij de bron** - Profiel Service beheert verwijzingen, niet kopieën
- **Verifieerbare toegang** - Toegang via IODC/oAuth2, met "consent" en logging
- **Federatieve identiteit** - Gebruikers kunnen inloggen via hun bestaande middelen (DigiD, eHerkenning en eIDAS)
- **Interoperabiliteit** - API's volgen Nederlandse standaarden (zoals NORA, NL GOV API Design Rules, HaalCentraal, etc)
- **Privacy by design** - Minimale dataverwerking en expliciete toestemming

## Lange termijn visie

- De Profiel Service wordt een bouwsteen binnen het Federatief Datastelsel; een federatief profielregister waar elke overheidsorganisatie op kan aansluiten.
- Burgers en ondernemers hebben volledige regie over hun gegevens.
- De overheid kan gepersonaliseerde commnunicatie aanbieden, zonder centrale opslag.
- De dienst wordt een enabler voor andere diensten, zoals:
  - MijnServices (VNG)
  - MijnOverheid.nl
  - Digitaal Ondernemersplein
  - Notificatie- en Berichtenservices (NotifyNL & BBO)
  - Federatieve identiteits- en autorisatiemodellen

## Positionering voor stakeholders

| Stakeholder                    | Waarde                                       |
| ------------------------------ | -------------------------------------------- |
| Gebruikers (burger/ondernemer) | Eén plek voor profielbeheer en voorkeuren    |
| Overheidsorganisaties          | Betrouwbare bron van actuele contactgegevens |
| Architecten en beleidsmakers   | Federatief en toekomstbestendig component    |
| Ontwikkelaars en leveranciers  | Eenduidige API's, herbruikbaar component     |

