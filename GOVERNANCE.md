# Governance

Dit document beschrijft de bestuurlijke structuur en projectorganisatie van MijnOverheid Zakelijk (MOZa).

## Bestuurlijke structuur

MOZa kent een governance-model met vier groepen die samenwerken rondom de te ontwikkelen dienstverlening.

### Stuurgroep

- Draagvlak binnen eigen organisatie en ambassadeur richting andere organisaties
- Beschikbaar stellen van capaciteit en prioriteit
- Daadwerkelijk aansluiten van de eigen organisatie op generieke dienstverlening die ontwikkeld worden vanuit het programma MOZa

De stuurgroep bestaat uit directeuren van organisaties die deelnemen in de kopgroep van MOZa. Niet elk lid in de kopgroep is vertegenwoordig in de stuurgroep.

### Regieteam

- Meedenken over strategie en richting geven aan de te ontwikkelen generieke dienstverlening
- Zorgen voor aahaken van professionals uit de eigen organisatie
- Coördineren van onderzoeken en verzoeken, zoals aansluiting van de eigen organisatie

Het regieteam bestaat uit strategisch adviseurs en business consultants van organisaties die deelnemen in de kopgroep van MOZa.

### Professionals

- Meedenken over oplossingen
- Uitwerken van draagvlak
- Testen met eigen organisatie en deelname aan pilots

Deze groep bestaat uit product owners, ontwikkelaars, UX-ers, architecten, juristen, business analisten etc. De professionals kunnen komen van organisaties die deelnemen in de kopgroep van MOZa, maar ook van andere overheidsorgnisaties of van buiten de overheid.

### MOZa productteam

- Uitwerken van klantreizen en usecases
- Ontwikkelen en testen van prototypes
- Pilots samen met dienstverleners
- Realiseren van alfa- en bètaversies
- Communicatie
- Organiseren van fieldlabs

Het opdrachtgeverschap ligt bij de directie [Directie Digitale Overheid (PDI)](https://organisaties.overheid.nl/27646725/Directie_Digitale_Overheid/) van het [Ministerie van Binnenlandse Zaken en Koninkrijksrelaties (MinBZK)](https://organisaties.overheid.nl/9632/Binnenlandse_Zaken_en_Koninkrijksrelaties/).

Het project MOZa heeft een productmanager die sturing geeft aan:

* Architectuur
* Business analyse
* Communicatie
* UX-onderzoeker
* Meerdere ontwikkelteams die bestaan uit:
  * Product owner
  * Tech lead
  * UX-ontwerpers
  * Solution architect
  * Ontwikkelaars

## Projectstructuur

### Eindverantwoordelijk

De **productmanager** is samen met de **opdrachtgever MinBZK** eindverantwoordelijk voor het programma.

### Inhoudelijk verantwoordelijk

De **product owner** is samen met **UX** (gebruikersonderzoeken) inhoudelijk verantwoordelijk voor het product. De **architect** zorgt ervoor dat de verschillende services vanuit MOZa in het geheel passen.

### Technische teams

Het project zal uit verschillende technische teams gaan bestaan. Elk team heeft een **tech lead** die verantwoordelijk is voor de technische keuzes binnen het team. De hierboven genoemde rollen moeten vervuld zijn in elk team. Teamleden kunnen meerdere rollen vervullen.

## Open source governance

### Bijdragen

Iedereen kan bijdragen aan MOZa. Bijdragen verlopen via pull requests op GitHub. Zie [CONTRIBUTING.md](https://github.com/MinBZK/MijnOverheidZakelijk?tab=contributing-ov-file) voor de richtlijnen. We verwachten dat alle bijdragers zich houden aan onze [gedragscode](https://github.com/MinBZK/MijnOverheidZakelijk?tab=coc-ov-file).

### Rollen

- **Bijdrager** — Iedereen die een pull request indient. Bijdragers hoeven geen directe schrijftoegang tot de repositories te hebben.
- **Reviewer** — Teamleden die pull requests beoordelen op kwaliteit, functionaliteit en architectuur.
- **Maintainer** — Teamleden met schrijftoegang die pull requests mergen en releases beheren. Maintainers zijn onderdeel van het MOZa productteam.

### Besluitvorming

- **Pull requests** worden beoordeeld door minimaal één reviewer uit het productteam. De tech lead of product owner van het betreffende team beslist over het mergen.
- **Inhoudelijke keuzes** (functionaliteit, prioritering, roadmap) worden gemaakt door de product owner.
- **Architectuurkeuzes** die meerdere services raken, worden afgestemd met de architect.
- **Strategische keuzes** worden genomen door de productmanager.

### Issues en feature requests

Issues en feature requests kunnen worden ingediend via [GitHub Issues](https://github.com/MinBZK/MijnOverheidZakelijk/issues). Het productteam beoordeelt en prioriteert deze. Voor vragen en discussies kun je terecht bij [MOZa GitHub Discussions](https://github.com/MinBZK/MijnOverheidZakelijk/discussions).

### Beveiligingsproblemen

Heb je een beveiligingsprobleem gevonden? Open dan **geen** publiek issue, maar volg de procedure in ons [beveiligingsbeleid](https://github.com/MinBZK/MijnOverheidZakelijk?tab=security-ov-file).

## Meer informatie

- [mijnoverheidzakelijk.nl](https://mijnoverheidzakelijk.nl/)
- [Handboek MOZa](https://mijnoverheidzakelijk.nl/handboek/)
