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
- Logging en transparantie (conform LDV): registreren van relevante gebeurtenissen ten behoeve van inzage en troubleshooting.
- Audit logging voor juridische doeleinde.

#### Belangrijkste processen en informatiestromen:
1. Authenticatie en sessieopbouw – Inloggen via DigiD (burger/zzp'er), eHerkenning (ondernemer) of eIDAS (buitenlandse belanghebbende); autorisatie en scoping bepalen welk profiel en welke gegevens zichtbaar/bewerkbaar zijn. Flow verder uitgewerkt in 07-code-Aurthenticatie.
2. Profiel inzien en beheren – Gebruiker bekijkt bestaande gegevens en voorkeuren en voert wijzigingen door. Zie sequentie diagrammen hierover in 07-code-ProfielBeheren en 08-data-sequentiediagrammen.
3. Profiel bevragen door dienstverlener – Vakapplicaties (of OMC/dergelijks) halen via API contactgegevens/voorkeuren op. Scoping per dienst/dienstverlener bied focus en ondersteunt dataminimalisatie. Zie 08-data-sequentiediagrammen.


Verwijzing naar scenario 2/8 nog?
