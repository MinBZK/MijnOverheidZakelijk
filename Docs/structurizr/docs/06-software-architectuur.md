## Software Architectuur

> De Software Architectuur is de "big picture view" en beschrijft de structuur van de software.
>
> Zie ook: [Inhoud guidelines Software Architectuur](https://structurizr.com/help/documentation/software-architecture)

### Systeem Landschap diagram

Om een beeld te schetsen van het Mijn Overheid Zakelijk systeem landschap, inclusief notificeren met kanaalherstel, berichtenbox en de profielservice, is hier een totaaloverzicht van het gehele systeemlandschap van Mijn Overheid Zakelijk. In de verdere paragrafen van dit hoofdstuk zoomen we verder in op de verschillende onderdelen. Via het diagram kan ook verder worden ingezoomd op de verschillende softwaresystemen.

![](embed:SysteemLandschap)

### Architectuurschets Profiel Service

![](embed:ProfielServiceContainer)

Dit diagram toont het containerniveau van de Profiel Service en de systemen waarmee deze interageert. De Profiel Service bestaat uit een service-laag met een achterliggende database. Daarnaast raadpleegt de service het Handelsregister, om twee redenen:

1. Het tonen van bedrijfsinformatie aan zakelijke gebruikers via MijnOverheid Zakelijk.
2. Het verstrekken van adresgegevens aan de Berichtenbox voor Burgers en Ondernemers (BBO), wanneer deze daar om vraagt.

De systemen en scenario’s die de Profiel Service bevragen, worden hieronder toegelicht.

#### Mijn Overheid Zakelijk

MijnOverheid Zakelijk wordt in een later hoofdstuk uitgebreider behandeld. Vanuit het perspectief van de Profiel Service fungeert MijnOverheid Zakelijk als de interface waar zakelijke gebruikers hun profielinformatie kunnen inzien en beheren. Daarnaast haalt MijnOverheid Zakelijk ook contactmomenten op bij onder andere de BD en het UWV. Deze interacties worden verder toegelicht in het betreffende hoofdstuk.

#### Scenario 2

In scenario 2 wordt geen gebruik gemaakt van de Profiel Service. Om die reden is RVO niet opgenomen in het diagram.

#### Scenario 8

In dit scenario raadpleegt het UWV de Profiel Service om contactgegevens van de zakelijke gebruiker op te halen. Deze informatie is nodig voor het versturen van een kennisgeving.

#### Scenario 9

Scenario 9 maakt op één momenten gebruik van de Profiel Service namelijk:
Aan het begin van het proces, om de contactgegevens op te halen ten behoeve van het versturen van een kennisgeving.

Opmerking: de foutmelding vanuit de Notificatie Service richting BBO is in dit diagram niet visueel weergegeven.

### Architectuurschets MijnOverheid Zakelijk

![](embed:MOZAContext)

Het diagram hierboven toont de systeemcontext van MijnOverheid Zakelijk (MOZA). MOZA is het portaal waar zakelijke gebruikers hun profiel kunnen beheren en inzicht krijgen in hun contactmomenten met aangesloten overheidsorganisaties. Twee kerncomponenten zijn zichtbaar:

- **Mijn Overheid Zakelijk**, dat functioneert als gebruikersinterface voor de persoonlijke mijnomgeving van zakelijke gebruikers
- **De IAM Gateway**, die authenticatie faciliteert via eHerkenning (en potentieel DigiD)

#### Rol van de Zakelijke Gebruiker

Bovenaan het diagram is de zakelijke gebruiker gepositioneerd. Via het MOZA-portaal beheert deze gebruiker zijn profielgegevens, waaronder contactinformatie. Deze informatie speelt een centrale rol in de afhandeling van kennisgevingen binnen scenario’s 8 en 9, zoals eerder beschreven. Daarnaast biedt MOZA inzicht in contactmomenten met aangesloten organisaties, in dit geval de BD en het UWV.

#### MOZA in de scenario's

Hoewel scenario 2 (RVO) geen gebruik maakt van MOZA en daarom niet is opgenomen in het diagram, is de rol van MOZA in scenario’s 8 en 9 wél essentieel.

In **scenario 8** (UWV) zorgt MOZA ervoor dat de zakelijke gebruiker zijn contactinformatie up-to-date kan houden in de Profiel Service. De UWV raadpleegt deze gegevens vervolgens om kennisgevingen correct te adresseren.

In **scenario 9** (BD) is deze rol vergelijkbaar, maar uitgebreider: de contactinformatie is niet alleen nodig voor de initiële kennisgeving, maar ook voor het kanaalherstelproces indien een notificatie niet succesvol kan worden afgeleverd. Ook in dit scenario speelt MOZA een cruciale rol in het beschikbaar stellen van actuele en betrouwbare gegevens.
