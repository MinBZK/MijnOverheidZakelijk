## Design Principes

### Inleiding

Het doel van dit hoofdstuk is om expliciet te maken welke principes we volgen, zodat ontwerp- en implementatiekeuzes consistent en uitlegbaar zijn voor alle betrokkenen.
Indien een principe is vastgelegd in een ADR of elders, is een verwijzing opgenomen. In andere gevallen is een korte toelichting toegevoegd.

### Principes

De onderstaande principes ondersteunen de kwaliteitseisen in het kwaliteitseisen hoofdstuk 
en vormen samen met de ADR’s de basis voor ontwerpkeuzes in de software-architectuur.

- Open standaarden, tenzij  
  We geven de voorkeur aan open, breed gedragen standaarden voor interoperabiliteit.  
  Voorbeelden: OpenAPI 3 voor API’s, JSON/HTTP, OIDC/OAuth 2.0 voor federatieve login.

- Contract-first API-ontwikkeling (OpenAPI)  
  API’s worden beschreven in OpenAPI en versiebeheer (semantic versioning) wordt toegepast op contracten. Documentatie en try-out via Swagger.  

- Beveiliging en privacy by design  
  Minimaalheidsprincipe (data-minimalisatie), least-privilege, encryptie in transit, auditing van mutaties en bevragingen.  
  Verwijzingen: ADR 0005 (AuditLog/EventSourcing), ADR 0006 (federatieve authenticatie/authorisatie), ADR 0007 (Logboek Dataverwerking), ADR 0008 (Data-eigenaar).

- Federatieve authenticatie en autorisatie  
  Inloggen via erkende identiteiten (DigiD, eHerkenning, eIDas). Token-gebaseerde toegang via OIDC/OAuth 2.0.  
  Verwijzing: ADR 0006.

- Hoge cohesie, lage koppeling  
  Services en modules hebben een duidelijke, beperkte verantwoordelijkheid en communiceren via expliciete contracten. Dit vergroot onderhoudbaarheid en vervangbaarheid.

- SOLID en DRY  
  Klassen en componenten volgen Single Responsibility; we vermijden duplicatie en prefereren hergebruik van gedeelde bouwblokken.


- Dependency Injection  
  Losse koppeling via interfaces en dependency inversion; concrete implementaties worden via CDI geïnjecteerd.  
  Het gekozen DI-mechanisme volgt de Quarkus-standaard (Jakarta CDI/Arc).

- Architecturale gelaagdheid en scheiding van verantwoordelijkheden  
  Duidelijke scheiding tussen API-/controllerlaag, applicatie-/servicelaag en persistentierepository.  
  Businesslogica bevindt zich uitsluitend in de servicelaag; controllers bevatten geen businesslogica en hebben geen directe database-toegang.

- Stateless services  
  Schaalbaarheid en eenvoudige uitrol door stateless service-instances; state wordt in expliciete data stores of messaging vastgelegd.  
  Verwijzing: Kwaliteitseisen – Beschikbaarheid & Schaalbaarheid (profielservicedocs/03-kwaliteitseisen.md).

- Auditability als first-class concern  
  Alle muterende acties en reads)worden vastgelegd ten behoeve van transparantie.  
  Verwijzingen: ADR 0005, ADR 0007, ADR 0010. Zie ook Beperkingen - Juridisch en compliance (profielservicedocs/04-beperkingen.md).

- Het wiel niet opnieuw uitvinden  
  Voorkeur voor hergebruik van standaarden, componenten en SDK’s boven maatwerk, tenzij harde eisen dit verhinderen.  
  Verwijzingen: ADR’s en koppelingen met OpenZaak/OpenKlant (ADR 0004), NL Design System (ADR 0009).

- Gemeenschappelijke aanpak voor foutafhandeling, logging en tracing  
  Eenduidige error-responses op API’s, centrale correlatie-ID, gestructureerde logging en distributed tracing.  
  Verwijzing: Kwaliteitseisen – Observeerbaarheid (profielservicedocs/03-kwaliteitseisen.md), ADR 0010.

- Domeinmodel: rijk waar nodig, anemisch waar passend  
  De Profielservice hanteert een pragmatische domeinstrategie op basis van boundedcontexts.  
  Domeingebieden met niet-triviale bedrijfs- of wettelijke regels (zoals profielbeheer, autorisatie van dienstverleners en privacy/toestemming) gebruiken een rijk domeinmodel waarin invarianten expliciet worden afgedwongen.  
  Domeingebieden die primair technisch of CRUD-gedreven zijn (zoals identiteitskoppelingen en auditlogging) hanteren een anemisch domeinmodel om complexiteit te beperken.

- Consistente naamgeving en API-conventies  
  RESTful paden, HTTP-methoden semantisch correct, duidelijke statuscodes en foutstructuren.  
  TODO: API style guide toevoegen? Of vinden we dat te veel van het goede?

- Koppelen via officiële API’s en registers  
  Integraties met o.a. KvK en andere bronnen verlopen via hun officiële API-standaarden.  
  Verwijzing: Kwaliteitseisen – Interoperabiliteit & Open Standaarden.


