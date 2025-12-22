## Functioneel overzicht

### Inleiding

Dit hoofdstuk bouwt voort op de context en visie en verwijst naar aanvullende documentatie en diagrammen. 
Het biedt kort en duidelijk inzicht in wat de Profiel Service doet, voor wie het dat doet en hoe de belangrijkste informatiestromen lopen.

### Overzicht

De Profiel Service biedt één centrale voorziening waar burgers en ondernemers hun contactgegevens en communicatievoorkeuren kunnen beheren, 
en waar overheidsorganisaties deze, met toestemming en volgens afspraken, betrouwbaar kunnen opvragen. 
Daarmee ondersteunt de Profiel Service federatieve en herbruikbare digitale dienstverlening binnen de overheid.

Wat het systeem feitelijk doet, is het centraal opslaan en ontsluiten van profielgegeven/contactgegevens, voor burgers en ondernemers. 
Belangrijke gebruikers en hun behoeften zijn:
- Burger/ondernemer: eigen profiel beheren (inzien, toevoegen, wijzigen, verwijderen), voorkeuren instellen en waar nodig gegevens verifiëren.
- Dienstverlener/Vakapplicatie: via API’s profiel- en contactgegevens ophalen.

Belangrijke leveranciers zijn:
- Identiteitsproviders (DigiD, eHerkenning, eIDas): verzorgen de authenticatie waarmee toegang tot het profiel mogelijk is.
- De KvK, integratie met KvK voor verrijking en verificatie van data bij de bron waaronder api gebruik om identificaties (BSN & KvK) aan elkaar te koppelen.
- Digitaal Ondernemersplein die noodzakelijk gaat zijn in het bijhouden van actuele updates over bijvoorbeeld subsidies of wetswijzigingen.


#### Kernfunctionaliteiten in het kort:
- Profiel inzien met overzicht van contactgegevens (e-mail, telefoon, postadres) en communicatievoorkeuren (bijv. kanaalvoorkeur, taal).
- Profiel beheren: toevoegen, wijzigen en verwijderen van contactgegevens; instellen van voorkeuren (algemeen en dienstspecifiek/scope-gebaseerd); verifiëren van contactkanalen (bijv. via bevestigingsmail/sms; status vastleggen).
- Profiel ophalen door dienstverleners: actuele contactgegevens en voorkeuren opvragen op basis van een partij-identificatie (bijv. KVK, BSN, RSIN), inclusief scope voor dienst/dienstverlener; inclusief verifieerbaarheidsindicatoren ontvangen.
- Identificaties koppelen en beheren: vastleggen van BSN/KvK/RSIN/etc. en koppelen aan één partijprofiel.
- Toegang verlenen aan dienstverleners conform afsprakenstelsel en autorisaties van het Federatieve Data Stelsel (FDS).
- Logging en transparantie (conform [LDV](https://www.logius.nl/onze-dienstverlening/gegevensuitwisseling/logboek-dataverwerkingen/wat-is-logboek-dataverwerkingen)): registreren van relevante gebeurtenissen ten behoeve van inzage en troubleshooting.
- Audit logging voor juridische doeleinde.

#### Belangrijkste processen en informatiestromen:
1. Authenticatie en sessieopbouw – Inloggen via DigiD (burger/zzp'er), eHerkenning (ondernemer) of eIDas (buitenlandse belanghebbende); autorisatie en scoping bepalen welk profiel en welke gegevens zichtbaar/bewerkbaar zijn. Flow verder uitgewerkt in 07-code-Aurthenticatie.

In deze flowchart is te zien hoe de diverse inlogopties worden gebruikt en welke identificerende informatie wij dan aan de gebruiker kunnen koppelen.
![Auth Flowchart](./images/ArchitectuurProfielService/AuthenticatieFlowChart.png "Auth Flowchart")

<details>
  <summary>Zie mermaid code</summary>

        flowchart TD;
        %% Trigger
            TRIGGER([De ondernemer wilt zijn contactgegevens updaten])-->S1;

        %% DigId scenario
            S1[Het systeem laat de inlog opties zien: 1. Digid, 2. eHerkenning, 3. eIDas als Burger 4. eIDas als Organisatie]-->S2;
            S2[De ondernemer kiest Digid]-->S3;
            S3[Het systeem met behulp van het BSN haalt hij de relevant KVK's op bij de KVK-BSN api.];
            S3-->SUCCESS_DigId;

        %% eHerkenning scenario
            S1-->EXT2a1;
            EXT2a1[De ondernemer kiest eHerkenning]-->EXT2a2;
            EXT2a2[Het systeem haalt de KVK & BSN uit de eHerkenning. Voor BSN komt die uit NIN & NIN_TYPE.]-->EXT2a3;
            EXT2a3[OPTIE: Het systeem gebruikt het BSN om de andere KVK's op te halen bij de KVK-BSN api??.];
            EXT2a2-->SUCCESS_eHerkenning;
            EXT2a3-->SUCCESS_eHerkenning;

        %% eIDas scenario
            S1-->EXT3a1;
            EXT3a1[De ondernemer kiest eIDas Burger]-->EXT3a2;
            EXT3a2[Het systeem haalt de Person Identifier, en optioneel Representative Person Identifier uit eIDas.];
            EXT3a2-->SUCCESS_eIDas_Burger;

            S1-->EXT4a1;
            EXT4a1[De ondernemer kiest eIDas Organisatie]-->EXT4a2;
            EXT4a2[Het systeem haalt de Legal Person Identifier, en optioneel Legal Entity Identifier uit eIDas.];
            EXT4a2-->SUCCESS_eIDas_Organisatie;

            SUCCESS_DigId([De ondernemer kan zijn contactgegevens updaten voor zichzelf en al zijn ondernemingen]);
            SUCCESS_eHerkenning([De ondernemer kan zijn contactgegevens updaten voor zichzelf en 1 onderneming]);
            SUCCESS_eIDas_Burger([De ondernemer kan zijn contactgegevens updaten voor deze eIDas Person Identifier]);
            SUCCESS_eIDas_Organisatie([De ondernemer kan zijn contactgegevens updaten voor deze eIDas Legal Person Identifier]);

</details>

2. Profiel inzien en beheren – Gebruiker bekijkt bestaande gegevens en voorkeuren en voert wijzigingen door. Zie sequentie diagrammen hierover in 07-code-ProfielBeheren en 08-data-sequentiediagrammen.

In de onderstaande sequentiediagram is te zien hoe een gebruiker zijn profiel kan bekijken en bijwerken als hij inlogd met DigiD.
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

3. Profiel bevragen door dienstverlener – Vakapplicaties (of OMC/dergelijks) halen via API contactgegevens/voorkeuren op. Scoping per dienst/dienstverlener bied focus en ondersteunt dataminimalisatie. Zie 08-data-sequentiediagrammen.

Hier is te zien is een eenvoudige sequentie diagram hoe de dienstverlener de informatie zou ophalen, en bijvoorbeeld gebruikt op een persoon aan de hand daarvan een notificatie te versturen.

![Sequentiediagram dienstverlener bevraagd profielservice en notificeert](./images/ArchitectuurProfielService/SeqDVBevraagdPSenNotificeert.png "Sequentiediagram dienstverlener bevraagd profielservice en notificeert")

<details>
  <summary>Zie mermaid code</summary>

    mermaid
    sequenceDiagram
    participant Dienstverlener@{"type" : "collections"}
    participant PS as Profiel Service
    participant NS as Notificatie Service
    actor BO as Burger of Ondernemer

    Dienstverlener ->> PS: Stuurt identificatienummer
    PS -->> Dienstverlener: Levert contactvoorkeuren
    Dienstverlener ->> NS: Stuurt inhoud notificatiebericht + voorkeurskanaal
    NS ->> BO: Stuurt bericht via voorkeurskanaal
    NS -->> Dienstverlener: Status aflevering (OK/NOK)

</details>
