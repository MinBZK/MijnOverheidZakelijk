## Context

<details>
   <summary>Zie inhoud richtlijnen</summary>

    ### Context
    
    Een contextsectie hoort altijd als eerste onderdeel in softwaredocumentatie te staan en dient simpelweg om de rest van het document in de juiste setting te plaatsen.

    ### Intentie

    Een contextsectie zou de volgende vragen moeten beantwoorden:
    - Waar gaat dit softwareproject/-product/-systeem over?
    - Wat wordt er precies gebouwd?
    - Hoe past het in de bestaande omgeving?
    (bijvoorbeeld andere systemen, bedrijfsprocessen, enzovoort)
    - Wie maakt er gebruik van?
    (gebruikers, rollen, actoren, persona’s, enz.)

    ### Opbouw

    De contextsectie hoeft niet lang te zijn; één tot twee pagina’s is voldoende.
    Een contextdiagram is bovendien een uitstekende manier om het grootste deel van het verhaal visueel over te brengen.

    ### Motivatie

    Het komt verrassend vaak voor dat softwaredocumentatie níet begint met het neerzetten van de context. Dan zit je dertig pagina’s verder en vraag je je nog steeds af waarom de software bestaat en hoe deze in de bestaande IT-omgeving past.
    Een contextsectie kost weinig tijd om te maken, maar levert ontzettend veel waarde op — vooral voor mensen buiten het ontwikkelteam.

    ### Doelgroep

    Zowel technische als niet-technische lezers, binnen én buiten het directe softwareontwikkelingsteam.

    ### Verplicht

    Ja, alle softwaredocumentatie hoort te beginnen met een contextsectie die het geheel in de juiste setting plaatst.
</details>

---


## Functioneel Overzicht

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Functioneel overzicht

    Hoewel het doel van technische softwaredocumentatie niet is om tot in detail uit te leggen wat de software doet, kan het wel nuttig zijn om de context verder uit te werken en samen te vatten wat de belangrijkste functies van de software zijn.

    ### Intentie

    Deze sectie biedt de mogelijkheid om de kernfunctionaliteiten van het systeem samen te vatten (use cases, user stories, enzovoort).
    Een functioneel overzicht zou antwoord moeten geven op vragen zoals:
	- Is duidelijk wat het systeem daadwerkelijk doet?
	- Is duidelijk wie de belangrijkste gebruikers zijn (rollen, actoren, persona’s, enzovoort) en hoe het systeem in hun behoeften voorziet?

    Wanneer de software een bedrijfsproces of workflow automatiseert, zou een functioneel overzicht ook antwoord moeten geven op vragen als:
	- Is vanuit procesperspectief duidelijk wat het systeem doet?
	- Wat zijn de belangrijkste processen en hoe lopen de informatiestromen door het systeem?

    ### Opbouw

    Verwijs gerust naar bestaande documentatie als die beschikbaar is, zoals functionele specificaties, use-casebeschrijvingen of lijsten met user stories. Toch is het vaak waardevol om het bedrijfsdomein en de door het systeem geboden functionaliteit kort samen te vatten.

    Diagrammen kunnen hierbij helpen. Denk bijvoorbeeld aan:
	- een UML use-casediagram
	- een set eenvoudige wireframes die de belangrijkste onderdelen van de gebruikersinterface laten zien

    Het doel van deze sectie is altijd: het bieden van een functioneel overzicht.

    Wanneer de software een bedrijfsproces of workflow automatiseert, kan ook een flowchart of een UML-activiteitendiagram worden gebruikt. Hiermee worden de afzonderlijke stappen in het proces en hun samenhang inzichtelijk gemaakt. Dit is vooral nuttig om aspecten zoals parallelle verwerking, gelijktijdigheid en momenten waarop processen splitsen of samenkomen te benadrukken.

    ### Motivatie

    Deze sectie hoeft niet uitgebreid te zijn; diagrammen kunnen vaak al voldoende overzicht geven. Waar de contextsectie beschrijft hoe de software in de bestaande omgeving past, legt deze sectie uit wat het systeem daadwerkelijk doet. Het gaat hierbij om samenvatten en kaderen, niet om het volledig uitwerken van elke gebruikers- of systeeminteractie.

    ### Doelgroep

    Zowel technische als niet-technische lezers, binnen én buiten het directe softwareontwikkelingsteam.

    ### Verplicht

    Ja, alle softwaredocumentatie hoort een samenvatting te bevatten van de functionaliteit die door de software wordt geleverd.
</details>

---


## Kwaliteitseisen

<details>
    <summary> Zie inhoud guidelines</summary>

    ### Kwaliteitseisen

    Naast het functioneel overzicht, waarin de functionaliteit wordt samengevat, is het zinvol om een aparte sectie op te nemen waarin de **kwaliteitseisen** worden beschreven (ook wel bekend als *non-functionele eisen*).

    ### Intentie

    Deze sectie richt zich op het samenvatten van de belangrijkste kwaliteitsattributen en zou antwoord moeten geven op vragen zoals:

    - Is er een duidelijk begrip van de kwaliteitsattributen waaraan de architectuur moet voldoen?
    - Zijn de kwaliteitsattributen SMART geformuleerd  
    (specifiek, meetbaar, acceptabel/haalbaar, relevant en tijdgebonden)?
    - Zijn kwaliteitsattributen die vaak als vanzelfsprekend worden beschouwd expliciet als *out of scope* aangemerkt wanneer ze niet nodig zijn?  
    (bijvoorbeeld: *“gebruikersinterface-elementen worden uitsluitend in het Engels aangeboden”* om aan te geven dat meertaligheid niet expliciet wordt ondersteund)
    - Zijn er kwaliteitsattributen die onrealistisch zijn?  
    (bijvoorbeeld: echte 24x7-beschikbaarheid is binnen veel organisaties kostbaar en complex om te realiseren)

    Wanneer bepaalde kwaliteitsattributen als **architectonisch significant** worden beschouwd en daarmee invloed hebben op de architectuur, is het verstandig deze expliciet te benoemen. Zo kan er later in de documentatie eenvoudig naar worden verwezen.

    ### Opbouw

    Een goede eerste stap is het expliciet opsommen van alle relevante kwaliteitsattributen. Voorbeelden hiervan zijn:

    - Performance (bijvoorbeeld latency en throughput)
    - Schaalbaarheid (bijvoorbeeld data- en verkeersvolumes)
    - Beschikbaarheid  
    (bijvoorbeeld uptime, downtime, gepland onderhoud, 24x7, 99,9%, enz.)
    - Beveiliging  
    (bijvoorbeeld authenticatie, autorisatie, vertrouwelijkheid van data)
    - Uitbreidbaarheid
    - Flexibiliteit
    - Auditing
    - Monitoring en beheer
    - Betrouwbaarheid
    - Failover- en disaster-recoverydoelstellingen  
    (bijvoorbeeld handmatig versus automatisch, hersteltijd)
    - Business continuity
    - Interoperabiliteit
    - Juridische, compliance- en regelgevingsvereisten  
    (bijvoorbeeld AVG / dataprotectiewetgeving)
    - Internationalisatie (i18n) en lokalisatie (L10n)
    - Toegankelijkheid
    - Gebruiksvriendelijkheid
    - ...

    Elk kwaliteitsattribuut moet **eenduidig en precies** zijn geformuleerd, zodat er geen ruimte is voor interpretatie. Voorbeelden van onduidelijke formuleringen zijn:

    - “het verzoek moet snel worden afgehandeld”
    - “er mag geen overhead zijn”
    - “zo snel mogelijk”
    - “zo klein mogelijk”
    - “zo veel mogelijk klanten”
    - ...

    ### Motivatie

    Wanneer kwaliteitsattributen actief zijn overwogen en een rol hebben gespeeld bij het vormgeven van de softwarearchitectuur, is het verstandig deze ook vast te leggen. In de praktijk worden kwaliteitsattributen zelden kant-en-klaar aangeleverd en is er vaak verkenning en verfijning nodig om tot een goede set te komen.

    Het expliciet vastleggen van kwaliteitsattributen voorkomt ambiguïteit — zowel nu als tijdens toekomstig onderhoud en doorontwikkeling. Minder discussie achteraf, meer rust in de tent.

    ### Doelgroep

    Omdat kwaliteitsattributen voornamelijk technisch van aard zijn, is deze sectie primair bedoeld voor technische lezers binnen het softwareontwikkelingsteam.

    ### Verplicht

    Ja, alle technische softwaredocumentatie dient een samenvatting te bevatten van de kwaliteitsattributen / non-functionele eisen, omdat deze vrijwel altijd op de één of andere manier de uiteindelijke softwarearchitectuur beïnvloeden.

</details>

---

## Beperkingen

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Beperkingen

    Software bestaat niet in een vacuüm, maar binnen de context van de echte wereld — en die echte wereld kent **beperkingen**. Deze sectie maakt het mogelijk om die beperkingen expliciet vast te leggen, zodat duidelijk is dat er binnen deze kaders wordt gewerkt en hoe zij architecturale keuzes beïnvloeden.

    ### Intentie

    Beperkingen worden meestal opgelegd, maar dat maakt ze niet per definitie “slecht”. Integendeel: het beperken van het aantal keuzemogelijkheden maakt het ontwerpen van software vaak eenvoudiger. Deze sectie stelt je in staat om expliciet samen te vatten binnen welke beperkingen wordt gewerkt en welke beslissingen al voor je zijn genomen.

    ### Opbouw

    Net als bij de sectie over kwaliteitsattributen volstaat het om de bekende beperkingen op te sommen en deze kort toe te lichten. Voorbeelden van beperkingen zijn:

    - Tijd, budget en beschikbare middelen  
    - Goedgekeurde technologielijsten en technologische beperkingen  
    - Doelplatform voor deployment  
    - Bestaande systemen en integratiestandaarden  
    - Lokale standaarden  
    (bijvoorbeeld ontwikkel- en coderingsrichtlijnen)  
    - Publieke standaarden  
    (bijvoorbeeld HTTP, SOAP, XML, XML Schema, WSDL, enzovoort)  
    - Standaardprotocollen  
    - Standaard berichtformaten  
    - Omvang van het softwareontwikkelingsteam  
    - Vaardigheden en ervaringsprofiel van het softwareontwikkelingsteam  
    - Aard van de software  
    (bijvoorbeeld tactisch of strategisch)  
    - Politieke beperkingen  
    - Gebruik van intern intellectueel eigendom  
    - ...

    Wanneer beperkingen daadwerkelijk invloed hebben, is het zinvol om deze samen te vatten door te beschrijven:

    - wat de beperking is  
    - waarom deze wordt opgelegd  
    - door wie deze wordt opgelegd  

    En vooral: **waarom deze beperking van betekenis is voor de architectuur**.

    ### Motivatie

    Beperkingen hebben de kracht om de architectuur sterk te beïnvloeden, vooral wanneer zij het gebruik van bepaalde technologieën beperken. Door deze beperkingen expliciet vast te leggen, voorkom je dat in de toekomst vragen ontstaan over ogenschijnlijk vreemde of onverwachte architecturale keuzes. Ze waren zelden vreemd — alleen ongedocumenteerd.

    ### Doelgroep

    Deze sectie is bedoeld voor iedereen die betrokken is bij het softwareontwikkelproces. Sommige beperkingen zijn technisch van aard, andere juist organisatorisch of politiek.

    ### Verplicht

    Ja, alle technische softwaredocumentatie dient een samenvatting van de geldende beperkingen te bevatten, aangezien deze vrijwel altijd invloed hebben op de uiteindelijke softwarearchitectuur. Ook in omgevingen met ogenschijnlijk vaste en bekende beperkingen (zoals: *“al onze software is ASP.NET met een SQL Server-database”*) is het belangrijk deze expliciet vast te leggen — beperkingen hebben namelijk de neiging om in de loop der tijd te veranderen.

</details>

---

## Design Principes

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Design Principes

    De sectie **Design Principes** biedt ruimte om de uitgangspunten samen te vatten die zijn gebruikt (of nog steeds worden gebruikt) bij het ontwerpen en bouwen van de software.

    ### Intentie

    Het doel van deze sectie is om expliciet te maken welke principes worden gevolgd. Deze principes kunnen zijn opgelegd door stakeholders, maar kunnen ook bewust zijn gekozen door het softwareontwikkelingsteam zelf.

    ### Opbouw

    Wanneer er al een bestaande set softwareontwikkelprincipes beschikbaar is (bijvoorbeeld op een ontwikkelwiki), kan hier simpelweg naar worden verwezen. In andere gevallen is het aan te raden om de gehanteerde principes expliciet op te sommen en elk principe te voorzien van een korte toelichting of een verwijzing naar aanvullende documentatie.

    Voorbeelden van principes zijn:

    - Architecturale gelaagdheidsstrategie  
    - Geen businesslogica in views  
    - Geen database-toegang in views  
    - Gebruik van interfaces  
    - Altijd een ORM gebruiken  
    - Dependency injection  
    - Het Hollywood-principe  
    (*don’t call us, we’ll call you*)  
    - Hoge cohesie, lage koppeling  
    - Volgen van SOLID-principes:  
    - Single Responsibility Principle  
    - Open/Closed Principle  
    - Liskov Substitution Principle  
    - Interface Segregation Principle  
    - Dependency Inversion Principle  
    - DRY (*Don’t Repeat Yourself*)  
    - Zorg dat alle componenten stateless zijn  
    (bijvoorbeeld om schalen te vereenvoudigen)  
    - Voorkeur voor een rijk domeinmodel  
    - Voorkeur voor een anemisch domeinmodel  
    - Altijd stored procedures gebruiken  
    - Nooit stored procedures gebruiken  
    - Het wiel niet opnieuw uitvinden  
    - Gemeenschappelijke aanpak voor foutafhandeling, logging, enzovoort  
    - Kopen in plaats van zelf bouwen  
    - ...

    ### Motivatie

    De reden om principes expliciet vast te leggen, is om ervoor te zorgen dat iedereen die betrokken is bij de softwareontwikkeling begrijpt welke uitgangspunten worden gehanteerd. Simpel gezegd: principes zorgen voor consistentie in de codebase, doordat veelvoorkomende problemen steeds op dezelfde manier worden benaderd. Minder discussie, meer voorspelbaarheid.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor de technische leden van het softwareontwikkelingsteam.

    ### Verplicht

    Ja, alle technische softwaredocumentatie dient een samenvatting te bevatten van de principes die zijn of worden gebruikt bij de ontwikkeling van de software.

</details>

---

## Software Architectuur

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Softwarearchitectuur

    De sectie **Softwarearchitectuur** beschrijft het “grote geheel” en biedt een overzicht van de structuur van de software. In traditionele architectuurdocumentatie wordt dit vaak aangeduid als een *conceptueel* of *logisch* overzicht. Daarbij ontstaat regelmatig discussie over de vraag in hoeverre zulke overzichten ook implementatiedetails, zoals technologiekeuzes, moeten bevatten.

    ### Intentie

    Het doel van deze sectie is om de softwarearchitectuur van het systeem samen te vatten, zodat de volgende vragen beantwoord kunnen worden:

    - Hoe ziet het “grote geheel” eruit?  
    - Is er een duidelijke structuur?  
    - Is op hoofdlijnen duidelijk hoe het systeem werkt  
    (het “30.000-voet-overzicht”)?  
    - Worden de belangrijkste containers en technologiekeuzes inzichtelijk gemaakt?  
    - Worden de belangrijkste componenten en hun onderlinge interacties getoond?  
    - Wat zijn de belangrijkste interne interfaces?  
    (bijvoorbeeld een webservice tussen de weblaag en de businesslaag)

    ### Opbouw

    De kern van deze sectie bestaat uit **containerdiagrammen** en **componentdiagrammen**, aangevuld met een korte toelichting waarin wordt uitgelegd wat elk diagram laat zien, plus een beknopte samenvatting van iedere container en/of component.

    In sommige gevallen kunnen UML-sequentiediagrammen of samenwerkingsdiagrammen nuttig zijn om te laten zien hoe componenten met elkaar samenwerken bij het ondersteunen van belangrijke use cases of user stories. Gebruik deze alleen wanneer ze daadwerkelijk extra inzicht bieden en weersta de verleiding om álle use cases of user stories tot in detail uit te werken.

    ### Motivatie

    De reden om deze sectie op te nemen is dat zij fungeert als de “kaart” van de software. Het geeft betrokkenen een overzicht van het systeem en helpt ontwikkelaars om hun weg te vinden in de codebase. Zonder kaart verdwaalt iedereen — sommigen alleen wat sneller dan anderen.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor de technische leden van het softwareontwikkelingsteam.

    ### Verplicht

    Ja, alle technische softwaredocumentatie dient een sectie over softwarearchitectuur te bevatten. Een goed begrip van de totale structuur van de software is essentieel voor iedereen binnen het ontwikkelteam.

</details>

---

## Code

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Code

    Hoewel andere delen van de documentatie de architectuur van de software op hoofdlijnen beschrijven, is het vaak wenselijk om ook details op een lager niveau vast te leggen om uit te leggen hoe zaken daadwerkelijk werken. Daarvoor is deze sectie bedoeld. In sommige architectuurdocumentatiesjablonen wordt dit ook wel het *implementatieoverzicht* of *ontwikkeloverzicht* genoemd.

    ### Intentie

    Het doel van de codesectie is het beschrijven van implementatiedetails van onderdelen van het softwaresysteem die belangrijk, complex of architectonisch significant zijn. Voorbeelden hiervan zijn:

    - Genereren/renderen van HTML  
    Een korte beschrijving van het framework dat is ontwikkeld voor het genereren van HTML, inclusief de belangrijkste klassen en concepten.
    - Databinding  
    De aanpak voor het bijwerken van businessobjecten als gevolg van HTTP POST-verzoeken.
    - Meerpagina-dataverzameling  
    Een korte beschrijving van het framework dat wordt gebruikt voor formulieren die meerdere webpagina’s beslaan.
    - Web MVC  
    Een voorbeeld van het gebruik van het toegepaste web-MVC-framework.
    - Beveiliging  
    De aanpak voor authenticatie en autorisatie, bijvoorbeeld met behulp van Windows Identity Foundation (WIF).
    - Domeinmodel  
    Een overzicht van de belangrijkste onderdelen van het domeinmodel.
    - Componentframework  
    Een korte beschrijving van het framework dat is gebouwd om componenten tijdens runtime te kunnen herconfigureren.
    - Configuratie  
    Een beschrijving van het standaardmechanisme voor componentconfiguratie binnen de codebase.
    - Architecturale gelaagdheid  
    Een overzicht van de gelaagdheidsstrategie en de patronen die worden gebruikt om deze te implementeren.
    - Exceptions en logging  
    Een samenvatting van de aanpak voor foutafhandeling en logging binnen de verschillende architectuurlagen.
    - Patronen en principes  
    Een toelichting op hoe architecturale patronen en principes in de code zijn toegepast.
    - …

    ### Opbouw

    Houd het eenvoudig. Gebruik per onderwerp een korte sectie en voeg diagrammen toe wanneer deze de lezer helpen. Een hoog-niveau UML-klassendiagram en/of sequentiediagram kan bijvoorbeeld nuttig zijn om de werking van een maatwerk- of intern ontwikkeld framework te verduidelijken.

    Weersta de verleiding om alle details op te nemen of om diagrammen te gebruiken die automatisch uit de codebase worden gegenereerd met UML-tools of IDE-plugins. Beter is het om een schematisch diagram te maken dat alleen de belangrijkste klassen, attributen en methoden toont. Diagrammen op hoofdlijnen zijn minder veranderlijk en blijven daardoor langer actueel, zelfs wanneer de code in detail wijzigt.

    ### Motivatie

    De motivatie voor deze sectie is ervoor te zorgen dat iedereen begrijpt hoe de belangrijke, complexe of significante onderdelen van het softwaresysteem werken. Dit maakt het mogelijk om de software consistent te onderhouden, uit te breiden en door te ontwikkelen. Daarnaast helpt deze sectie nieuwe teamleden om sneller ingewerkt te raken.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor de technische leden van het softwareontwikkelingsteam.

    ### Verplicht

    Nee, maar in grotere en niet-triviale softwaresystemen zijn er vrijwel altijd onderdelen die baat hebben bij een nadere toelichting.

</details>

---

## Data

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Data

    De data die bij een softwaresysteem hoort, is meestal niet het primaire aandachtspunt, maar is vaak belangrijker dan de software zelf. Daarom is het in veel gevallen zinvol om ook de datastructuur en -afspraken te documenteren.

    ### Intentie

    Het doel van de datasectie is om alles vast te leggen wat vanuit dataperspectief van belang is. Deze sectie zou onder andere antwoord moeten geven op vragen zoals:

    - Hoe ziet het datamodel eruit?  
    - Waar wordt de data opgeslagen?  
    - Wie is eigenaar van de data?  
    - Hoeveel opslagruimte is nodig?  
    (met name relevant bij grote datavolumes of “big data”)  
    - Wat zijn de archiverings- en back-upstrategieën?  
    - Zijn er wettelijke of regelgevende vereisten voor langdurige archivering van bedrijfsdata?  
    - Geldt dit ook voor logbestanden en audit trails?  
    - Worden platte bestanden gebruikt voor opslag?  
    Zo ja, welk formaat wordt gehanteerd?

    ### Opbouw

    Houd de sectie overzichtelijk, met een korte toelichting per onderdeel dat wordt beschreven. Voeg waar nuttig domeinmodellen of entity-relationshipdiagrammen (ER-diagrammen) toe. Net als bij klassendiagrammen in de codesectie geldt: houd diagrammen op een hoog abstractieniveau en vermijd het opnemen van elk veld of iedere eigenschap.

    Wanneer gedetailleerde informatie nodig is, kan die doorgaans worden teruggevonden in de code of in de database zelf. De documentatie is bedoeld voor overzicht, niet als vervanging van de implementatie.

    ### Motivatie

    De motivatie voor deze sectie is dat data in de meeste softwaresystemen een veel langere levensduur heeft dan de software die haar heeft gecreëerd. Deze sectie ondersteunt iedereen die de data moet beheren, onderhouden of ondersteunen, evenals degenen die rapportages moeten maken of business intelligence-activiteiten uitvoeren.

    Daarnaast kan deze sectie dienen als startpunt wanneer het softwaresysteem in de toekomst — onvermijdelijk — wordt herschreven.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor technische leden van het softwareontwikkelingsteam, evenals anderen die betrokken zijn bij het deployen, ondersteunen en operationeel houden van het systeem.

    ### Verplicht

    Nee, maar de meeste softwaresystemen zijn niet klein of triviaal, en de data zal het stuk code dat haar heeft voortgebracht waarschijnlijk overleven.

</details>

---


## Infrastructuur Architectuur

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Infrastructuurarchitectuur

    Hoewel het grootste deel van de documentatie is gericht op de software zelf, moet ook de infrastructuur worden meegenomen. Softwarearchitectuur gaat immers over de samenhang tussen **software en infrastructuur**.

    ### Intentie

    Deze sectie beschrijft de fysieke en/of virtuele hardware en netwerken waarop de software wordt uitgerold. Ook al ben je als softwarearchitect niet altijd verantwoordelijk voor het ontwerpen van de infrastructuur, je moet wel begrijpen of deze toereikend is om de architecturale doelen te ondersteunen.

    Deze sectie is bedoeld om onder andere de volgende vragen te beantwoorden:

    - Is er een duidelijke fysieke architectuur?  
    - Welke hardware (virtueel of fysiek) wordt gebruikt binnen de verschillende lagen?  
    - Is er voorzien in redundantie, failover en disaster recovery, indien van toepassing?  
    - Is duidelijk hoe de gekozen hardwarecomponenten zijn geschaald en geselecteerd?  
    - Indien meerdere servers of locaties worden gebruikt:  
    wat zijn de netwerkverbindingen daartussen?  
    - Wie is verantwoordelijk voor beheer en onderhoud van de infrastructuur?  
    - Zijn er centrale teams voor gedeelde infrastructuur, zoals:  
    - databases  
    - message brokers  
    - applicatieservers  
    - netwerken, routers en switches  
    - load balancers en reverse proxies  
    - internetverbindingen  
    - Wie is eigenaar van de infrastructuurresources?  
    - Zijn er voldoende omgevingen beschikbaar voor:  
    ontwikkeling, testen, acceptatie, pre-productie en productie?

    ### Opbouw

    De kern van deze sectie bestaat meestal uit een **infrastructuur- of netwerkdiagram** waarin de verschillende hardware- en netwerkcomponenten worden weergegeven (zoals servers, routers, firewalls, load balancers, enzovoort) en hoe deze met elkaar samenhangen.

    Het diagram wordt begeleid door een korte toelichting die uitlegt wat er wordt getoond en welke keuzes zijn gemaakt.

    ### Motivatie

    De motivatie voor deze sectie is het vastleggen van de infrastructuur en het expliciet maken dat deze de softwarearchitectuur ondersteunt. Geen verrassingen bij livegang — altijd prettig.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor technische leden van het softwareontwikkelingsteam, evenals voor mensen die betrokken zijn bij het deployen, ondersteunen en operationeel beheren van het softwaresysteem.

    ### Verplicht

    Ja, technische softwaredocumentatie dient een sectie over infrastructuurarchitectuur te bevatten, omdat deze laat zien dat de infrastructuur is begrepen en expliciet is meegenomen in de architecturale overwegingen.

</details>

---

## Deployment

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Deployment

    De deploymentsectie beschrijft de koppeling tussen de softwarearchitectuur en de infrastructuurarchitectuur. Met andere woorden: **waar draait wat**.

    ### Intentie

    Deze sectie wordt gebruikt om te beschrijven hoe de software (bijvoorbeeld containers of componenten) wordt gemapt op de infrastructuur. Soms is dit een eenvoudige één-op-éénrelatie (zoals een webapplicatie op één webserver), maar in andere gevallen is de situatie complexer (bijvoorbeeld een webapplicatie die over meerdere servers in een serverfarm wordt uitgerold).

    Deze sectie beantwoordt onder andere de volgende vragen:

    - Hoe en waar wordt de software geïnstalleerd en geconfigureerd?  
    - Is duidelijk hoe de software wordt uitgerold over de infrastructuurelementen die zijn beschreven in de infrastructuurarchitectuur?  
    (bijvoorbeeld één-op-één, meerdere containers per server, enzovoort)  
    - Als dit nog niet definitief is:  
    welke opties zijn er en zijn deze vastgelegd?  
    - Is duidelijk hoe CPU- en geheugengebruik wordt verdeeld over processen die op dezelfde infrastructuur draaien?  
    - Draaien containers en/of componenten in een:  
    - active-active  
    - active-passive  
    - hot-standby  
    - warm-standby  
    - cold-standby  
    opstelling?  
    - Is de deployment- en rollbackstrategie gedefinieerd?  
    - Wat gebeurt er bij een software- of infrastructuurstoring?  
    - Is duidelijk hoe data tussen locaties wordt gerepliceerd?

    ### Opbouw

    Er zijn verschillende manieren om deze sectie vorm te geven:

    - **Tabellen**  
    Eenvoudige tabellen die de mapping tonen tussen softwarecontainers en/of componenten en de infrastructuur waarop ze worden uitgerold.
    - **Diagrammen**  
    UML-deploymentdiagrammen of aangepaste versies van infrastructuurdiagrammen waarin zichtbaar is waar de software draait.

    Aanvullend kunnen notaties, kleurcoderingen of symbolen worden gebruikt om de runtime-status van software en infrastructuur aan te geven, zoals *active*, *passive*, *hot-standby*, *warm-standby* of *cold-standby*.

    ### Motivatie

    De motivatie voor deze sectie is ervoor te zorgen dat iedereen begrijpt hoe de software functioneert zodra deze het ontwikkelstadium verlaat. Daarnaast helpt deze sectie bij het documenteren van vaak complexe deployments binnen enterprise-omgevingen.

    Zelfs in teams die continuous delivery toepassen en hun deployments volledig hebben gescript met tools zoals Puppet, Chef, Vagrant, Docker of vergelijkbare tooling, biedt deze sectie een waardevol overzicht.

    ### Doelgroep

    Deze sectie is voornamelijk bedoeld voor technische leden van het softwareontwikkelingsteam, evenals voor mensen die betrokken zijn bij het deployen, ondersteunen en operationeel beheren van het softwaresysteem.

    ### Verplicht

    Ja, alle technische softwaredocumentatie dient een deploymentsectie te bevatten. Deze helpt bij het beantwoorden van de vaak mysterieuze vraag waar de software precies draait — of heeft gedraaid.

</details>

---

## Ontwikkelomgeving

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Development Environment
    
    The development environment section allows you to summarise how people new to your team install tools and setup a development environment in order to work on the software.

    ### Intent

    The purpose of this section is to provide instructions that take somebody from a blank operating system installation to a fully-fledged development environment.

    ### Structure

    The type of things you might want to include are:
    - Pre-requisite versions of software needed.
    - Links to software downloads (either on the Internet or locally stored).
    - Links to virtual machine images.
    - Environment variables, Windows registry settings, etc.
    - Host name entries.
    - IDE configuration.
    - Build and test instructions.
    - Database population scripts.
    - Usernames, passwords and certificates for connecting to development and test services.
    - Links to build servers.
    - ...

    If you're using automated solutions (such as Vagrant, Docker, Puppet, Chef, Rundeck, etc), it's still worth including some brief information about how these solutions work, where to find the scripts and how to run them.

    ### Motivation

    The motivation for this section is to ensure that new developers can be productive as quickly as possible.

    ### Audience

    The audience for this section is the technical people in the software development team, especially those who are new to the team.

    ### Required

    Yes, because this information is usually lost and it's essential if the software will be maintained by a different set of people from the original developers.

</details>

---

## Beheer en Support

<details>
    <summary>Zie inhoud guidelines</summary>

    ### Operation and Support

    The operations and support section allows you to describe how people will run, monitor and manage your software.

    ### Intent

    Most systems will be subject to support and operational requirements, particularly around how they are monitored, managed and administered. Including a dedicated section in the software guidebook lets you be explicit about how your software will or does support those requirements. This section should address the following types of questions:

    - Is it clear how the software provides the ability for operation/support teams to monitor and manage the system?
    - How is this achieved across all tiers of the architecture?
    - How can operational staff diagnose problems?
    - Where are errors and information logged? (e.g. log files, Windows Event Log, SMNP, JMX, WMI, custom diagnostics, etc)
    - Do configuration changes require a restart?
    - Are there any manual housekeeping tasks that need to be performed on a regular basis?
    - Does old data need to be periodically archived?
    
    ### Structure

    This section is usually fairly narrative in nature, with a heading for each related set of information (e.g. monitoring, diagnostics, configuration, etc).

    ### Motivation

    Times change and team members move on, so recording this information can help prevent those situations in the future where nobody understands how to operate the software. It also helps to quickly answer basic questions such as, "where are the log files?".

    ### Audience

    The audience for this section is predominantly the technical people in the software development team along with others that may help deploy, support and operate the software system.

    ### Required
    
    Yes, an operations and support section should be included in all technical software documentation, unless you like throwing software into a black hole and hoping for the best.

</details>

---
