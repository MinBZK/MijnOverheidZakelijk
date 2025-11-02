# Profielservice

> | **Status**     | 🟢 Conceptversie   |
> | -------------- | ------------------ |
> | Laatste update | 02-11-2025         |
> | Auteur         | Robin Alderliesten |

## Visie

De Profiel Service stelt burgers en ondernemers in staat om op één vertrouwde plek hun contactgegevens en communicatievoorkeuren te beheren, en biedt overheidsinstanties via federatieve koppelingen veilige, actuele en herbruikbare profielinformatie voor persoonlijke en efficiënte dienstverlening.

## Achtergrond

Er bestaan al voorzieningen waarmee burgers gegevens kunnen beheren (zoals de MijnOverheid-instellingen), maar ondernemers vallen daar grotendeels buiten. Bovendien is de huidige inrichting vaak monolithisch en niet federatief; data wordt decentraal en niet herbruikbaar opgeslagen bij de dienstverleners.

### Een aantal uitdagingen

- Ondernemers moeten vaak opnieuw hun gegevens invullen bij elke overheidsdienst
- Er is géén centrale plek waar contactgegevens en -voorkeuren beheerd of opgehaald kunnen worden
- Er is onvoldoende inzicht over wie toegang heeft tot welke gegevens
- Met name voor ondernemers zijn er nog geen voorzieningen beschikbaar en komen er ook niet binnenkort

## Doel

De Profiel Service biedt een betrouwbare, gestandaardiseerde en federatieve manier om persoonlijke en bedrijfsprofielgegevens en (communicatie)voorkeuren vast te leggen, en te delen tussen erkende partijen.

![Profiel Service Context](embed:ProfielServiceContext)

De Profiel Service is een service die gebruikt kan worden in portalen of andere interactiecomponenten voor het ophalen van de voorkeuren van burgers en ondernemers.

De Profiel Service bevat persoons- en bedrijfsgegevens en die gebruikt kunnen worden voor de communicatie tussen de gebruiker en overheidsorganisaties. Dit zijn zowel contactgegevens (zoals e-mailadres en telefoonnummer) als voorkeuren waarover de communicatie tussen de gebruiker en de overheidsorganisatie plaatsvindt.

### Functionele doelstellingen

- Beheer van profielgegevens: e-mailadres, telefoonnummer, postadres (initieel) op een centrale plek
- Instellen van contactvoorkeuren: bijvoorbeeld voorkeur voor digitaal of post, notificatiekanalen, etc.
- Instellen van overige voorkeuren; denk aan weergaveinstellingen en overige sets van voorkeuren
- Ondersteuning van meerdere authenticatiemiddelen: DigiD, eHerkenning, eIDAS
- Koppeling met registers: KVK, BRP, BAG, gegevens bij de bron opvragen
- Federatief delen: gegevens worden centraal opgeslagen en beschikbaar gesteld aan verifieerbare dienstverleners

### Strategische doelstellingen

- Versterken van vertrouwen in digitale dienstverlening (conform het Federatieve Datastelsel)
- Verlagen van administratieve lasten voor ondernemers
- Verbeteren van "omnichannel communicatie" tussen overheid en gebruiker
- Herbruikbaarheid van profieldata over meerdere overheidsdomeinen heen
- Incrementele groei: klein beginnen en iteratief uitbreiden

## Benodigde afspraken

Om een centrale profiel service voor burgers en ondernemers neer te zetten is het noodzakelijk dat dienstverleners deze adopteren in hun eigen ecosystemen en MijnOmgevingen. Dit betekent dat er een algemeen erkende koppelvlak definitie moet komen op basis van de diverse bestaande unieke identificerende nummers, zoals BSN, KVK, eHerkenning PseudoID's, RSIN, etc, op basis waarvan de ingelogde gebruiker kan worden geidentificeerd en zijn gegevens kunnen worden bevraagd door de dienstverleners binnen hun eigen context.

Een aantal vragen die we daarbij nog beantwoord moeten krijgen zijn;

- PseudoID's - zijn deze uniek over alle dienstverleners heen?
- TODO: aanvullen



## Gefaseerde ontwikkelstrategie

| Fase                            | Omschrijving                                                                                                                             | Resultaat                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Fase 1 - Basisprofiel           | Eenvoudig profiel met e-mailadres, telefoonnummer, postadres en 1 algemene voorkeur (bijv. digitaal of post) voor burgers en ondernemers | Werkende MVP; alfa versie; eerste API's, federatieve authenticatie; LDV en Auditing |
| Fase 2 - Kanaalvoorkeuren       | Uitbreiding met kanaalspecifieke voorkeuren (sms, e-mail, berichtenmagazijn, portaal, etc)                                               | Ondersteuning voor omnichannel communicatie                                         |
| Fase 3 - Federatieve integratie | Integratie met overige bronregisters, zoals BRP, BAG etc.                                                                                | Data wordt actueel en verifieerbaar opgehaald                                       |
| Fase 4 - Ecosysteemontwikkeling | Andere overheidsdiensten sluiten aan via de gestelde standaarden (API's, IODC, etc)                                                      | Overheidsbreed gedragen profiel service adoptie                                     |

## Architectuurprincipes

- **Generieke Digitale Infrastructuur (GDI)** - alignment met de stelselafspraken en -richtlijnen van GDI
- **Logboek Dataverwerking (LDV)** - dataverwerkingen worden gelogd volgens de LDV standaarden
- **Data bij de bron** - Profiel Service als bron beheert en stelt data beschikbaar via API's
- **Verifieerbare toegang** - Toegang via OIDC/oAuth2, met "consent" en logging
- **Federatieve identiteit** - Gebruikers kunnen inloggen via hun bestaande middelen (DigiD, eHerkenning en eIDAS)
- **Interoperabiliteit** - API's volgen Nederlandse standaarden (zoals NORA, NL GOV API Design Rules, etc)
- **Privacy by design** - Minimale dataverwerking en expliciete toestemming

## Lange termijn visie

- De Profiel Service wordt een bouwsteen binnen de Generieke Digitale Infrastructuur (GDI); een generiek profielregister waar elke overheidsorganisatie op kan aansluiten.
- Burgers en ondernemers hebben volledige regie over hun gegevens.
- De overheid kan gepersonaliseerde communicatie aanbieden
- De dienst ondersteunt en/of faciliteert andere diensten, zoals:
  - MijnServices (VNG)
  - MijnOverheid
  - Digitaal Ondernemersplein
  - Notificatie- en Berichtenservices (NotifyNL & BBO)
  
## Positionering voor stakeholders

| Stakeholder                    | Waarde                                       |
| ------------------------------ | -------------------------------------------- |
| Gebruikers (burger/ondernemer) | Eén plek voor profielbeheer en voorkeuren    |
| Overheidsorganisaties          | Betrouwbare bron van actuele contactgegevens |
| Architecten en beleidsmakers   | Federatief en toekomstbestendig component    |
| Ontwikkelaars en leveranciers  | Eenduidige API's, herbruikbaar component     |
