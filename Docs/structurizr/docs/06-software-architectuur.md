## Software Architectuur

> De Software Architectuur is de "big picture view" en beschrijft de structuur van de software.
>
> Zie ook: [Inhoud guidelines Software Architectuur](https://structurizr.com/help/documentation/software-architecture)

### Systeem Landschap diagram

Om een beeld te schetsen van het Mijn Overheid Zakelijk systeem landschap, inclusief notificeren met kanaalherstel, berichtenbox en de profielservice, is hier een totaaloverzicht van het gehele systeemlandschap van Mijn Overheid Zakelijk. In de verdere paragrafen van dit hoofdstuk zoomen we verder in op de verschillende onderdelen. Via het diagram kan ook verder worden ingezoomd op de verschillende softwaresystemen.

![](embed:SysteemLandschap)

### Architectuurschets Notificeren

Het eerste onderwerp van het programma om te verkennen is een Rijksbrede voorziening voor het notificeren, waarbij een kanaalherstel functionaliteit een vereiste is om te kunnen voldoen aan de [Wet Modernisering Elektronisch Bestuurlijk Verkeer (MEBV)](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/wetgeving/wet-modernisering-elektronisch-bestuurlijk-verkeer/).

Daarvoor zijn door Paul Janssen, architect bij de VNG, een aantal scenario's geschetst die verschillende situaties oplossen in verschillende evoluties van het notificatie proces. Wij hebben daaruit een selectie van 2 scenarios uitgewerkt in prototypes, namelijk #2 en #8. Naar aanleiding van verder onderzoek is gebleken dat er nog een extra scenario nodig is, welke we tot scenario #9 hebben benoemd, waarbij ook het kanaalherstel wordt gefasciliteerd.

![Notificatie Context](embed:NotificatieServiceContext)

In het Notificatie Service context diagram is de Notificatie Service uitgewerkt en wordt weergegeven hoe de drie scenario’s interacteren met de Notificatie Service. De belangrijkste aandachtspunten in deze afbeelding zijn de vier services die binnen het Logius-landschap opereren: de Berichtenbox voor Burgers en Ondernemers (BBO), de Kanaalhersteldienst, de Notificatie Service en de Profiel Service. De eerste twee zijn grijs weergegeven om aan te duiden dat het bestaande systemen betreft.

![](embed:NotificatieServiceContainer)

In het Notificatie Service Container Diagram wordt verder ingezoomd op de onderdelen van de Notificatie Service. Deze bestaat uit twee componenten: NotifyNL en de Kennisgeving Service.

Daarnaast zijn ook de Kanaalhersteldienst en de Profiel Service opgenomen. Deze twee componenten zijn bepalend voor de onderlinge verschillen tussen de drie scenario’s: de BD maakt gebruik van zowel de Profiel Service als de Kanaalhersteldienst, het UWV raadpleegt enkel de Profiel Service, en de RVO maakt van geen van beide gebruik.  
Meer over dit onderscheid wordt zichtbaar in het scenario onder het kopje _Belastingdienst_, waarin beide componenten actief worden ingezet.

De drie scenario’s illustreren verschillende vormen van notificaties. Scenario 2 (RVO) betreft een attendering, terwijl scenario’s 8 (UWV) en 9 (BD) betrekking hebben op kennisgevingen.

#### RVO (Scenario 2)

Dit is nog steeds het eenvoudigste scenario: de RVO roept hierbij rechtstreeks NotifyNL aan, die vervolgens de notificatie verstuurt naar de zakelijke gebruiker. De Profiel Service wordt hierbij niet gebruikt, wat betekent dat RVO zelf de contactgegevens moet aanleveren. Ook wordt de Kanaalhersteldienst niet aangeroepen; bij een kanaalstoring zou RVO dit dus zelf moeten afhandelen.

#### UWV (Scenario 8)

In scenario 8, vertegenwoordigd door het UWV, wordt eerst de contactinformatie opgehaald bij de Profiel Service voordat NotifyNL wordt aangeroepen om de notificatie te versturen. Dit betekent dat er in geval van kanaaluitval geen kanaalherstel plaatsvindt vanuit de Notificatie Service.

#### Belastingdienst (Scenario 9)

In dit scenario roept de BD de Berichtenbox voor Burgers en Ondernemers (BBO) aan, die vervolgens het notificatieproces namens hen uitvoert. De BBO haalt de profielinformatie op bij de Profiel Service en geeft deze door aan de Kennisgeving Service. Deze is vervolgens verantwoordelijk voor het versturen van de notificatie naar NotifyNL.

Belangrijk om te vermelden is dat de BD ook de mogelijkheid heeft om het notificatieproces niet via de BBO, maar rechtstreeks te initiëren via de Kennisgeving Service. In dat geval slaat de BD de BBO over en levert zelf de benodigde gegevens aan. De verdere afhandeling, waaronder het ophalen van profielinformatie en het versturen van de notificatie naar NotifyNL, verloopt vervolgens identiek.

Indien het afleveren van de notificatie mislukt door kanaaluitval, start de Kennisgeving Service automatisch het kanaalherstelproces. Hierbij worden opnieuw de adresgegevens opgehaald bij het handelsregister, waarna deze worden doorgegeven aan de Kanaalhersteldienst voor verdere afhandeling.

### De scenario's

In dit hoofdstuk worden de drie scenario’s verder toegelicht. Zie ook [ADR-0003](/workspace/decisions#3) en hoofdstuk 2.8 voor aanvullende context.

#### RVO - Scenario 2

![](embed:RVOContainer)

Dit scenario representeert het versturen van een _attendering_.  
De RVO beschikt over een interne service die notificaties (e-mail, sms of brief) wil versturen naar zakelijke gebruikers. Deze service roept rechtstreeks de Notificatie Service aan en levert daarbij zelf de benodigde contactgegevens aan. De Notificatie Service verstuurt de notificatie direct.

Als het afleveren van de notificatie mislukt (bijvoorbeeld door kanaalproblemen), meldt de Notificatie Service dit terug aan de RVO. De verdere afhandeling van de fout ligt volledig bij de RVO.

#### UWV - Scenario 8

![](embed:UWVContainer)

Scenario 8 is functioneel uitgebreider dan scenario 2. Ook hier is sprake van een interne service — de UWV Service — die een notificatie wil versturen naar een zakelijke gebruiker. In plaats van direct met de Notificatie Service te communiceren, stuurt de UWV Service de aanvraag door naar een Output Management Component (OMC).

De OMC is verantwoordelijk voor het ophalen van de contactgegevens bij de Profiel Service. Met deze informatie wordt de notificatie via de Notificatie Service verzonden. In dit scenario is er nog geen sprake van geautomatiseerd kanaalherstel: als aflevering faalt, is het aan de OMC of de UWV om het probleem op te lossen.

#### BD - Scenario 9

![](embed:BDContainer)

Scenario 9 lijkt in grote lijnen op scenario 8, maar bevat enkele technische verschillen.

De BD Service initieert de verzending van een notificatie naar een zakelijke gebruiker. De aanvraag wordt doorgestuurd naar de OMC, die — net als in scenario 8 — de contactinformatie ophaalt bij de Profiel Service.

Daarna heeft de BD twee routes om de notificatie te versturen: direct via de Notificatie Service of indirect via de BBO. In beide gevallen verloopt het proces grotendeels hetzelfde en is het eindresultaat identiek. Bij directe verzending stuurt de BD de notificatie rechtstreeks naar de Notificatie Service. In het geval van de BBO-route levert de OMC de benodigde gegevens aan bij de Berichtenbox voor Burgers en Ondernemers (BBO), die op haar beurt contact opneemt met de Notificatie Service om de notificatie af te leveren.

Als de Notificatie Service een foutmelding geeft vanwege kanaaluitval, start de Kennisgeving Service, een container binnen de Notificatie Service, automatisch het kanaalherstelproces. Daarbij worden de adresgegevens opgehaald bij de het handelsregister en doorgegeven aan de Kanaalhersteldienst voor verdere afhandeling.

### Architectuurschets Profiel Service

![](embed:ProfielServiceContainer)

Dit diagram toont het containerniveau van de Profiel Service en de systemen waarmee deze interageert. De Profiel Service bestaat uit een service-laag met een achterliggende database. Daarnaast raadpleegt de service het Handelsregister, om twee redenen:

1. Het tonen van bedrijfsinformatie aan zakelijke gebruikers via MijnOverheid Zakelijk.
2. Het verstrekken van adresgegevens aan de Berichtenbox voor Burgers en Ondernemers (BBO), wanneer deze daar om vraagt.

De systemen en scenario’s die de Profiel Service bevragen, worden hieronder toegelicht.

#### Mijn Overheid Zakelijk

MijnOverheid Zakelijk wordt in een later hoofdstuk uitgebreider behandeld. Vanuit het perspectief van de Profiel Service fungeert MijnOverheid Zakelijk als de interface waar zakelijke gebruikers hun profielinformatie kunnen inzien en beheren. Daarnaast haalt MijnOverheid Zakelijk ook contactmomenten op bij onder andere de BD en het UWV. Deze interacties worden verder toegelicht in het betreffende hoofdstuk.

#### RVO (Scenario 2)

In scenario 2 wordt geen gebruik gemaakt van de Profiel Service. Om die reden is RVO niet opgenomen in het diagram.

#### UWV (Scenario 8)

In dit scenario raadpleegt het UWV de Profiel Service om contactgegevens van de zakelijke gebruiker op te halen. Deze informatie is nodig voor het versturen van een kennisgeving.

#### BD (Scenario 9)

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

### Architectuur ProfielService

#### Gegevensmodel

Het gegevensmodel van de ProfielService is opgebouwd rond twee entiteiten: PARTIJ en CONTACTVOORKEUR.

1. PARTIJ beschrijft een natuurlijke persoon of rechtspersoon die geïdentificeerd kan worden via verschillende identificatietypen, zoals BSN, KVK of RSIN.

2. CONTACTVOORKEUR legt vast hoe en via welk kanaal een partij gecontacteerd wil worden door een bepaalde dienst of organisatie.

Hiermee kunnen burgers en ondernemers hun voorkeuren zelf beheren en bepalen of communicatie bijvoorbeeld via e-mail of telefoon verloopt, en of dit zakelijk of privé van toepassing is.

Hieronder een tabel van definities die wij aanhouden binnen die entiteiten.

| Attribuut           | Omschrijving                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| PARTIJ              |                                                                                                              |
| Id                  | Unieke identificator van PARTIJ                                                                              |
| IdentificatieType   | Wijze waarop PARTIJ uniek kan worden geïdentificeerd, te weten: BSN, KVK, RSIN of ander identificatiesysteem |
| IdentificatieNummer | Nummer waarmee PARTIJ uniek identificeerbaar is binnen het opgegeven IdentificatieType                       |

| Attribuut       | Omschrijving                                                                           |
| --------------- | -------------------------------------------------------------------------------------- |
| CONTACTVOORKEUR |                                                                                        |
| Id              | Unieke identificator van CONTACTVOORKEUR                                               |
| VanPartijId     | Identificator van de eigenaar uit PARTIJ voor deze CONTACTVOORKEUR                     |
| VoorPartijId    | Identificator op welke PARTIJ deze CONTACTVOORKEUR betrekking heeft                    |
| Scope           | Het toepassingsgebied van deze CONTACTVOORKEUR, te weten: Burger of Zakelijk           |
| DienstType      | Het organisatie-identificatienummer (OIN) waarop dit CONTACTVOORKEUR mogelijk kan zijn |
| Type            | Het soort CONTACTVOORKEUR, te weten: e-mail of (mobiel) telefoonnummer                 |
| Waarde          | De door de eigenaar opgegeven waarde voor het CONTACTVOORKEUR-Type                     |
| IsGeverifieerd  | Indicator of Waarde daadwerkelijk is verbonden met VanPartijId                         |
| GeverifieerdAt  | Datum waarop IsGeverifieerd voor het laatst is ingesteld                               |

Het onderstaande diagram geeft de structuur van het gegevensmodel weer, inclusief de relaties tussen PARTIJ en CONTACTVOORKEUR.

![Gegevensmodel met Persoon](./images/ArchitectuurProfielService/Gegevensmodel.png "Gegevensmodel")

<details>
  <summary>Zie mermaid code</summary>
  
    erDiagram
        PARTIJ {
            int Id PK "NOT NULL"
            enum IdentificatieType "NOT NULL"
            text IdentificatieNummer "NOT NULL"
        }

        CONTACTVOORKEUR {
            int Id PK "NOT NULL"
            int VanPartijId FK "NOT NULL"
            int VoorPartijId FK ""
            enum Scope "NOT NULL"
            enum DienstType ""
            enum Type "NOT NULL"
            text Waarde "NOT NULL"
            bool IsGeverifieerd "NOT NULL"
            date GeverifieerdAt "NOT NULL"
        }

        %% Relationships
        PARTIJ ||--o{ CONTACTVOORKEUR : "VanPartijId"
        PARTIJ |o--|{ CONTACTVOORKEUR : "VoorPartijId"

</details>

#### Sequentiediagrammen

De volgende diagrammen illustreren de belangrijkste interacties met de ProfielService.

1. Dienstverlener bevraagt de ProfielService  
   In dit scenario vraagt een dienstverlener de contactvoorkeuren op van een ondernemer of onderneming.  
   Deze informatie kan de dienstverlener dan gebruiken om kennisgevingen en/of attenderingen correct af te kunnen leveren.

![Sequentiediagram dienstverlener bevraagd profielservice](./images/ArchitectuurProfielService/SeqDienstverlenerBevraagdProfiel.png "Sequentiediagram dienstverlener bevraagd profielservice")

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        participant Dienstverlener

        Dienstverlener-->>Mandaat Service: Vraag gemandateerde bsn(s) op
        activate Mandaat Service
        Mandaat Service-->>Dienstverlener: Ok
        deactivate Mandaat Service

        participant Profiel as Profiel Service

        Dienstverlener->>Profiel: GET contactvoorkeuren Bsn en/of KvK
        activate Profiel
        Profiel-->>Dienstverlener: Contactvoorkeur(en) + Bsn
        deactivate Profiel

</details>

2. Ondernemer bekijkt en wijzigt contactvoorkeuren  
   Dit scenario toont hoe een ondernemer via het MOZa-portaal zijn eigen contactvoorkeuren kan inzien en aanpassen.  
   Afhankelijk van de loginmethode (bijv. DigiD of eHerkenning) worden de relevante ondernemingen opgehaald, waarna de ondernemer zijn voorkeuren per onderneming kan beheren.  
   Na het aanpassen van een voorkeur wordt deze wijziging via de ProfielService opgeslagen, en indien van toepassing geverifieerd.

![Sequentiediagram ondernemer bekijkt en update contactvoorkeuren](./images/ArchitectuurProfielService/SeqOndernemerProfiel.png "Sequentiediagram ondernemer bekijkt en update contactvoorkeuren")

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        actor Ondernemer
        participant MOZa as MOZa Portaal
        participant KvK as KvK
        participant Profiel as Profiel Service

        Ondernemer->>MOZa: Logt in
        activate MOZa

        alt Als login via DigiD
            MOZa->>KvK: Haal ondernemingen op voor BSN
            deactivate MOZa
            activate KvK
            KvK-->>MOZa: Geeft ondernemingen terug (KvK-nummers)
            deactivate KvK
            activate MOZa
        end

        MOZa->>Ondernemer: Toon Profiel Pagina
        Ondernemer->>MOZa: Opent pagina 'Contactvoorkeuren'

        MOZa->>Profiel: GET contactvoorkeuren (BSN + KvK)
        deactivate MOZa
        activate Profiel
        Profiel-->>MOZa: Contactvoorkeuren terug
        deactivate Profiel
        activate MOZa

        MOZa->>Ondernemer: Toon pagina 'Contactvoorkeuren'

        Ondernemer->>MOZa: Past contactvoorkeur aan

        MOZa->>Profiel: PATCH contactvoorkeur (BSN + KvK)
        deactivate MOZa
        activate Profiel
        Profiel-->>MOZa: Ok (voorkeur bijgewerkt)
        deactivate Profiel
        activate MOZa

        MOZa-->>Ondernemer: Toont bevestiging
        deactivate MOZa

</details>

Deze scenario’s vormen de basis voor de interacties tussen de ProfielService, dienstverleners en eindgebruikers binnen de keten.
