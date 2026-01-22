## Design Principes

### Inleiding

Het doel van dit hoofdstuk is om expliciet te maken welke principes we volgen, zodat ontwerp- en implementatiekeuzes consistent en uitlegbaar zijn voor alle betrokkenen.
Waar van toepassing verwijzen we naar onderliggende ADR’s en overige documentatie.

### Principes

De onderstaande principes ondersteunen de kwaliteitseisen in het kwaliteitseisen hoofdstuk
en vormen samen met de ADR’s de basis voor ontwerpkeuzes in de software‑architectuur van de Notificatie Service.

- Open standaarden, tenzij
  We geven de voorkeur aan open, breed gedragen standaarden voor interoperabiliteit.
  Voorbeelden: OpenAPI 3 voor API’s, JSON/HTTP, OIDC/OAuth 2.0 voor service‑to‑service authenticatie.

- Contract‑first API‑ontwikkeling (OpenAPI)
  API’s worden beschreven in OpenAPI; semantic versioning op contracten; backward compatibility binnen een major versie.
  Documentatie en try‑out via Swagger/Redoc. Contracttests bewaken compatibiliteit met afnemers en providers.

- Kanaal‑agnostische interfaces, adapters per provider
  Het domeinmodel en de publieke API abstraheren kanaalspecifieke details.
  Integraties met providers (bijv. NotifyNL/OMC) gebeuren via adapters/ports, zodat providers vervangbaar zijn zonder breaking changes voor afnemers.

- Beveiliging en privacy by design
  Alleen noodzakelijke gegevens, least‑privilege scopes, encryptie in transit, geen persoonsgegevens in logs.
  Audit van mutaties en statusovergangen. Pseudonimiseer referenties waar mogelijk.
  Verwijzingen: ADR 0005, ADR 0006, ADR 0007, ADR 0010.

- Idempotentie en correlatie als first‑class concerns
  Callback‑ en statusupdates zijn idempotent, herhaalde provider‑events veroorzaken geen dubbele acties.

- Eenduidig statusmodel en callback‑gedreven verwerking
  Notificaties volgen een expliciet statusmodel (Ex.Geaccepteerd, In de wachtrij geplaatst, Verzonden, Geleverd, Mislukt, Verlopen).
  Callbacks en polling leveren consistente, herleidbare staten op, state transitions zijn auditeerbaar.

- Betrouwbaarheid via retries, back‑off en DLQ
  Tijdelijke fouten worden behandeld met exponentiële back‑off, structurele fouten gaan naar een DLQ met reden.
  Replay van DLQ gebeurt gecontroleerd en gefilterd om duplicaten te vermijden.

- Resilience patterns standaard
  Timeouts, circuit breakers, bulkheads en back‑pressure op queues beschermen tegen cascaderende fouten en provider‑uitval.

- Hoge cohesie, lage koppeling
  Duidelijke scheiding tussen public API, applicatie‑/routeringslogica, provider‑adapters en persistente lagen.
  Modules hebben een beperkte verantwoordelijkheid en communiceren via expliciete contracten.

- Stateless services
  Instances zijn stateless; state zit in expliciete data stores (status, audit) en messaging.
  Dit vereenvoudigt horizontale schaalbaarheid en rolling upgrades.

- Consistente foutafhandeling en API‑conventies
  RESTful paden, semantisch correcte HTTP‑methoden en statuscodes, eenduidige foutstructuur (problemdetails).
  Heldere, mens‑ en machineleesbare foutmeldingen zonder persoonsgegevens.

- Configuratie boven code voor kanaalbeleid
  Kanaalkeuze, throttling, blackout‑windows en provider‑prioriteiten zijn runtime‑configureerbaar (feature flags waar passend) en niet hard‑gecodeerd.

- Versiebeheer en gecontroleerde uitrol
  Backward‑compatible wijzigingen worden gefaseerd uitgerold, breaking changes alleen in nieuwe major.
  Feature flags ondersteunen gefaseerde activatie per kanaal/provider.

- Testbaarheid en kwaliteit geautomatiseerd
  Unit‑ en integratietests voor statusmachine en adapters, contracttests met afnemers en providers, performance‑ en soak‑tests op queues en callbacks.
