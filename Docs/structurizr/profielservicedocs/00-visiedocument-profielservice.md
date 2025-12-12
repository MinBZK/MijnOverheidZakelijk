# Profiel Service

> | **Status**     | Conceptversie      |
> | -------------- | ------------------ |
> | Laatste update | 21-11-2025         |
> | Auteur         | Robin Alderliesten |

## Visie

De Profiel Service stelt burgers en ondernemers in staat om op één vertrouwde plek hun contactgegevens en communicatievoorkeuren te beheren, en biedt overheidsinstanties via federatieve koppelingen veilige, actuele en herbruikbare profielinformatie voor persoonlijke en efficiënte dienstverlening.

## Wat is de Profiel Service

De Profiel Service vormt een bouwsteen binnen de digitale overheid. Het biedt burgers én ondernemers één centrale plek waar zij hun contactgegevens en communicatievoorkeuren kunnen beheren. Overheidsorganisaties kunnen deze gegevens via gestandaardiseerde API’s opvragen en gebruiken om betrouwbaar, persoonlijk en efficiënt te communiceren — altijd met toestemming van de gebruiker.

Waar vandaag de dag veel contactgegevens versnipperd zijn opgeslagen in losse portalen en applicaties, brengt de Profiel Service dit samen in een centraal, goed beheerd register. Daarmee vormt het een solide basis voor federatieve dienstverlening: één betrouwbare bron die andere federatieve services ondersteunt met actuele en verifieerbare profielinformatie.

## Waarom een Profiel Service

Voor burgers bestaat al de mogelijkheid om bepaalde gegevens te beheren via MijnOverheid, maar ondernemers vallen grotendeels buiten de boot. Zij moeten hun contactinformatie nog te vaak handmatig herhalen bij elke overheidsdienst. Ook is er geen centrale plek waar communicatievoorkeuren kunnen worden vastgelegd — zoals de voorkeur voor digitaal of post.

De Profiel Service lost dit op door:

- één betrouwbare bron van contact- en voorkeursgegevens te bieden,
- overheidsbreed hergebruik mogelijk te maken,
- burgers en ondernemers de regie te geven over hoe zij met de overheid communiceren.

## Doel en waarde

De Profiel Service is bedoeld om:

- **Burgers en ondernemers** controle te geven over hun profielgegevens en communicatievoorkeuren, op één vertrouwde plek.
- **Overheidsorganisaties** te voorzien van actuele en verifieerbare gegevens, rechtstreeks uit een centrale bron.
- **De digitale overheid** te versterken met een herbruikbare bouwsteen die past binnen de Generieke Digitale Infrastructuur (GDI).

### Functionele doelstellingen

- Beheer van profielgegevens: e-mailadres, telefoonnummer, postadres etc. op een centrale plek
- Instellen van contactvoorkeuren: bijvoorbeeld voorkeur voor digitaal of post, notificatiekanalen, etc.
- Instellen van overige voorkeuren; denk aan weergaveinstellingen en overige sets van voorkeuren
- Ondersteuning van meerdere authenticatiemiddelen: DigiD, eHerkenning, eIDAS
- Koppeling met registers: KVK, BRP, BAG, gegevens bij de bron opvragen
- Federatief delen: gegevens worden centraal opgeslagen en beschikbaar gesteld aan verifieerbare dienstverleners

### Strategische doelstellingen

- Versterken van vertrouwen in digitale dienstverlening (conform de Generieke Digitale Infrastructuur (GDI))
- Verlagen van administratieve lasten voor ondernemers
- Verbeteren van "omnichannel communicatie" tussen overheid en gebruiker
- Herbruikbaarheid van profieldata over meerdere overheidsdomeinen heen
- Incrementele groei: klein beginnen en iteratief uitbreiden

## Benodigde afspraken

Om een centrale Profiel Service voor burgers en ondernemers neer te zetten is het noodzakelijk dat dienstverleners deze adopteren in hun eigen ecosystemen en MijnOmgevingen. Hiervoor werken we volgens de principes van het programma Generieke Digitale Infrastructuur (GDI). Dit betekent dat afspraken en standaarden worden neergezet en de Profiel Service als voorziening beschikbaar wordt gemaakt.

In de komende periode werken we aan het verzamelen van informatie en het beantwoorden van vragen die hierover onstaan bij de uitwerking.

## Gefaseerde ontwikkelstrategie

De Profiel Service wordt stapsgewijs gerealiseerd, met een nadruk op eenvoud, hergebruik en federatieve samenwerking.

| Fase                      | Beschrijving                                                                           | Resultaat                                                    |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1. Basisprofiel           | Eenvoudig profiel met e-mailadres, telefoonnummer, postadres en één algemene voorkeur. | Werkend MVP; eerste API’s; DigiD/eHerkenning/eIDAS; logging  |
| 2. Kanaalvoorkeuren       | Ondersteuning voor kanaalspecifieke voorkeuren (e-mail, sms, etc.).                    | Omnichannel communicatie overheidsbreed ondersteund          |
| 3. Federatieve integratie | Integratie met bronregisters zoals KvK, BRP en BAG                                     | Actuele, verifieerbare gegevens direct bij de bron opgehaald |
| 4. Ecosysteemontwikkeling | Overheidsorganisaties sluiten aan via standaarden en API’s.                            | Overheidsbreed gedragen profielservice binnen de GDI         |

## Architectuur en uitgangspunten

- **Centraal profielregister:** één betrouwbare bron van waarheid voor contact- en voorkeursgegevens.
- **Ondersteuning voor federatieve diensten:** de Profiel Service zelf is centraal, maar stelt gegevens beschikbaar aan federatieve toepassingen.
- **NeRDS**: Ontwikkeling volgt Nederlandse Richtlijn Digitale Systemen (NeRDS).
- **Open standaarden:** API’s volgen NORA, NL GOV API Design Rules en GDI-richtlijnen.
- **Federatieve identiteit:** toegang via DigiD, eHerkenning en eIDAS.
- **Privacy by design:** minimale dataverwerking, transparantie en logging conform LDV.
- **Data bij de bron:** de Profiel Service als basisregister voor contactvoorkeuren

## Lange termijn visie

Op langere termijn groeit de Profiel Service uit tot een generieke bouwsteen binnen de GDI — een betrouwbare voorziening waarop iedere overheidsorganisatie kan aansluiten.

- Burgers en ondernemers hebben volledige regie over hun gegevens.
- Overheidsorganisaties communiceren veilig en consistent met hun gebruikers.
- De Profiel Service ondersteunt een breed palet aan diensten, zoals:
  - MijnOverheid
  - MijnServices (VNG)
  - Digitaal Ondernemersplein
  - Notificatie- en berichtenservices (NotifyNL, BBO)
  - Alle MijnOmgevingen van overheidsdienstverleners.

## Positionering voor stakeholders

| Stakeholder                    | Waarde                                       |
| ------------------------------ | -------------------------------------------- |
| Gebruikers (burger/ondernemer) | Eén plek voor profielbeheer en voorkeuren    |
| Overheidsorganisaties          | Betrouwbare bron van actuele contactgegevens |
| Architecten en beleidsmakers   | GDI Bouwsteen en toekomstbestendig component |
| Ontwikkelaars en leveranciers  | Eenduidige API's, herbruikbaar component     |

## Oproep tot samenwerking

De ontwikkeling van de Profiel Service vraagt samenwerking tussen beleidsmakers, ontwerpers, ontwikkelaars en uitvoeringsorganisaties.  
Alleen door gezamenlijk standaarden te ontwikkelen, adoptie te stimuleren en kennis te delen ontstaat een breed gedragen voorziening die écht waarde toevoegt.

Wij nodigen daarom alle overheidsorganisaties uit om mee te denken, mee te bouwen en mee te leren.  
Samen maken we van de Profiel Service niet alleen een technische voorziening, maar een fundament voor betrouwbare, toegankelijke en toekomstbestendige digitale dienstverlening.

## Documentatie & Bronnen

- **[MijnOverheid Zakelijk startpagina](https://mijnoverheidzakelijk.nl)** - Meer informatie en documentatie over het programma MijnOverheid Zakelijk is te vinden via onze startpagina.
- **[GitHub](https://github.com/orgs/MinBZK/teams/mijnoverheid-zakelijk)** - Onze oplossingen worden Open Source ontwikkeld en zijn te vinden op de Github van MinBZK

## Contact

Programma MijnOverheid Zakelijk  
Ministerie van Binnenlandse Zaken en Koninkrijksrelaties  
info@mijnoverheidzakelijk.nl (mailbox aanmaken?)
