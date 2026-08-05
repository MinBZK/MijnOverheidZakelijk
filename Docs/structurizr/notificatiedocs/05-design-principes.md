## Design Principes

### Inleiding

Het doel van dit hoofdstuk is om expliciet te maken welke principes we volgen, zodat ontwerp- en implementatiekeuzes consistent en uitlegbaar zijn voor alle betrokkenen.
Waar van toepassing verwijzen we naar onderliggende ADR’s en overige documentatie.

### Principes

De onderstaande principes ondersteunen de kwaliteitseisen in het kwaliteitseisen hoofdstuk
en vormen samen met de ADR’s de basis voor ontwerpkeuzes in de software-architectuur van de Notificatiedienst.

- Open standaarden, tenzij
  We geven de voorkeur aan open, breed gedragen standaarden voor interoperabiliteit.
  Voorbeelden: OpenAPI 3 voor API’s, JSON/HTTP, OIDC/OAuth 2.0 voor service-to-service authenticatie, RFC 9457 voor foutmeldingen en het NL GOV profiel voor CloudEvents voor de statusterugkoppeling (ADR 0020).

- Contract-first API-ontwikkeling (OpenAPI)
  De OpenAPI-specificaties zijn de bron: server-interfaces en uitgaande clients worden eruit gegenereerd.
  Semantic versioning op contracten; backward compatibility binnen een major versie. Contracttests bewaken compatibiliteit met afnemers en providers.

- Kanaal-agnostische API, adapters per externe dienst
  Het domeinmodel en de publieke API abstraheren kanaalspecifieke details.
  Integraties met externe diensten (NotifyNL, Profielservice, statusterugkoppeling naar de aanroeper) gebeuren via adapters/ports, zodat diensten vervangbaar zijn zonder breaking changes voor afnemers.

- Beveiliging en privacy by design
  Alleen noodzakelijke gegevens, least-privilege scopes, encryptie in transit, geen persoonsgegevens in logs.
  Het NMC slaat geen contactgegevens of identificerende nummers op; identificerende nummers worden in het logboek gepseudonimiseerd.
  Verwijzingen: ADR 0005, ADR 0006, ADR 0007, ADR 0010.

- Idempotentie en correlatie als first-class concerns
  Delivery receipts en statusupdates zijn idempotent; herhaalde events veroorzaken geen dubbele acties.
  De referentie die bij acceptatie wordt teruggegeven correleert de asynchrone status aan de oorspronkelijke aanvraag.

- Eenduidig statusmodel en callback-gedreven verwerking
  Notificaties volgen een expliciet statusmodel, afgeleid van de NotifyNL-afleverstatussen (zie hoofdstuk 8).
  De verwerking is webhook-gedreven in plaats van polling; state transitions zijn herleidbaar.

- Betrouwbaarheid via retries met back-off
  De uitgaande statusterugkoppeling wordt bij tijdelijke fouten herhaald met exponentiële back-off en een begrensd aantal pogingen.

- Hoge cohesie, lage koppeling
  Duidelijke scheiding tussen publieke API (controllers), orchestratie, adapters per externe dienst en de persistente laag.
  Modules hebben een beperkte verantwoordelijkheid en communiceren via expliciete contracten.

- Stateless services
  Instances zijn stateless; state zit in het Notificatieregister.
  Dit vereenvoudigt horizontale schaalbaarheid en rolling upgrades.

- Consistente foutafhandeling en API-conventies
  RESTful paden, semantisch correcte HTTP-methoden en statuscodes, eenduidige foutstructuur volgens RFC 9457 (application/problem+json).
  Heldere, mens- en machineleesbare foutmeldingen zonder persoonsgegevens.

- Configuratie boven code
  De URL’s van externe diensten (NotifyNL, Profielservice), credentials en wachttijden zijn runtime-configureerbaar en niet hard-gecodeerd, zodat omgevingen zonder codewijziging verschillen.

- Versiebeheer en gecontroleerde uitrol
  Backward-compatible wijzigingen worden gefaseerd uitgerold, breaking changes alleen in een nieuwe major.
  Iedere response vermeldt de API-versie via een API-Version header.

- Testbaarheid en kwaliteit geautomatiseerd
  Unit- en integratietests per laag (controllers, services, adapters); de testdekking wordt in de build afgedwongen.
