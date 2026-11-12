# 31. QUERY als methode voor opvragingen op een identificerend nummer

Datum: 2026-11-02

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0018 Opslag van Actualiteiten Service-gegevens en identificatie via subject claim](0018-afbakening-profiel-service-en-koppelcode.md): nevenservices krijgen geen BSN of KVK-nummer; de Profielservice is de service die het identificerend nummer wel ontvangt.
* [ADR 0021 Twee regie-modellen in plaats van de scenario's 2, 8 en 9](0021-twee-regie-modellen-ipv-scenarios.md): bij gecentraliseerde regie stuurt de dienstverlener een identificerend nummer (KvK, RSIN of BSN) en haalt het NMC de contactgegevens op bij de Profielservice.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): de koppelvlakken van het NMC voor dienstverleners.

## Context

De NL GOV API Design Rules (ADR 2.1.0) schrijven de standaard HTTP-methoden voor: GET haalt op en wijzigt niets, POST maakt aan. Dezelfde standaard verbiedt gevoelige informatie in URI's en staat operaties als sub-resource toe, met een padsegment dat met een underscore begint. De Spectral-linter van de standaard keurt alleen de sleutels `get`, `post`, `put`, `delete` en `patch` goed.

Een leesoperatie die een persoon of organisatie opzoekt op een identificerend nummer zit tussen die regels in. Met GET komt het nummer in de URI; met POST staat het in de body, maar is de operatie geen aanmaak. De Profielservice gebruikt daarvoor nu POST. Onderzocht is of de HTTP-methode QUERY deze opvragingen beter beschrijft.

### De methode QUERY

RFC 10008 (juni 2026) definieert de HTTP-methode QUERY: veilig en idempotent, met een request body, en met een cachebare response waarvan de body deel uitmaakt van de cachesleutel. De RFC noemt als reden voor de methode dat een URI vaker wordt gelogd en door tussenliggende systemen verwerkt dan de request content. QUERY beschrijft een opvraging op een identificerend nummer dus precies: het nummer staat in de body, en de methode zelf zegt dat de aanroep niets wijzigt en herhaald mag worden. Met POST moet dat laatste in de documentatie van de operatie staan.

OpenAPI 3.2 (september 2025) kent `query` als operatie in een path item. Om QUERY in de MOZa-keten te gebruiken is het volgende nodig:

* de specificaties gaan van OpenAPI 3.1 naar OpenAPI 3.2;
* `openapi-generator` (generator `jaxrs-spec`), dat de serverinterface van de Profielservice en de client in het NMC levert, moet OpenAPI 3.2 lezen en voor een `query`-operatie code genereren; nu genereert het daarvoor niets;
* `openapi-typescript`, dat de client van het portaal levert, moet een OpenAPI 3.2-document accepteren en de `query`-operatie opnemen, en `openapi-fetch` moet de methode kennen;
* de ADR-linter moet de methode toestaan;
* zolang de generator de methode niet levert, bedient Quarkus REST die met een handgeschreven `@HttpMethod`-annotatie buiten de gegenereerde interface om;
* nginx geeft QUERY door naar de backend; een `limit_except`-blok dat de methode uitsluit, moet worden aangepast.

Voor OpenAPI 3.2 in `openapi-generator`, `swagger-parser` en `openapi-typescript` staan wijzigingen open (zie Verwijzingen).

Bij Logius ligt het toestaan van QUERY in de API Design Rules voor. Tim van der Lippe, architect bij Logius, heeft daarvoor in juli 2026 een wijzigingsvoorstel ingediend, met de lees-extensie van het Logboek Dataverwerkingen als voorbeeld van een opvraging die nu POST gebruikt omdat er een BSN in de body kan staan. Het Technisch Overleg API heeft op 10 september 2026 besloten de methode pas te heroverwegen als OpenAPI 3.2 op de pas-toe-of-leg-uit-lijst staat, omdat OpenAPI 3.0, de versie op die lijst, de operatie `query` niet kent en bibliotheken en frameworks er nog niet klaar voor zijn. Het overleg stelde daarbij vast dat QUERY een veelvoorkomend probleem oplost.

### De Profielservice

De API van de Profielservice heeft momenteel twee leesoperaties met een identificerend nummer in de body. Dat kunnen er meer of minder worden; voor nu dienen ze als voorbeeld in deze ADR:

* **Ophalen profiel van een partij** (`POST /partij`): identificatietype (BSN, KVK of RSIN), nummer, en optioneel dienstverlener en dienst. Afnemers zijn het portaal, voor de ingelogde partij, en het NMC, dat bij gecentraliseerde regie per verzending het e-mailadres ophaalt (ADR 0021).
* **Ophalen profielen van meerdere partijen** (`POST /partijen/bulk`): een lijst identificaties.

Alle schrijfoperaties van de Profielservice (contactgegeven, voorkeur, e-mailverificatie) dragen het identificerend nummer eveneens in de body. Padparameters zijn UUID's van contactgegevens en voorkeuren en namen van dienstverleners. Nergens in de API staat een identificerend nummer in een pad of query string.

### Het NMC

Het NMC heeft geen leesoperatie met een identificerend nummer of e-mailadres als invoer:

* het versturen van een centrale of decentrale notificatie maakt een notificatie aan, met een id en een status; dat is een POST en geen opvraging;
* het lezen van statusovergangen gebruikt een opake cursor als query parameter; het gevoelige deel zit in de response, en daar verandert de methode niets aan;
* het bevestigen van verwerkte statusovergangen wijzigt de cursorpositie (PUT);
* de JWKS is publiek.

De dienstverlenerkant van het NMC is bewust push- en cursorgebaseerd (ADR 0024); een dienstverlener kent zijn eigen notificatie-id's en hoeft niet op ontvanger te zoeken.

## Decision

1. Een identificerend nummer (BSN, KVK-nummer, RSIN) en een e-mailadres staan in geen enkele MOZa-API in een URI, dus niet in een pad en niet in een query string. Ze staan in de request body.
2. QUERY (RFC 10008) is de methode voor leesoperaties met zo'n identificatie als invoer. MOZa beweegt daar naartoe: de specificaties gaan naar OpenAPI 3.2 en deze operaties krijgen de operatie `query`, op hetzelfde pad en met dezelfde body en response. Zolang OpenAPI 3.2 niet op de pas-toe-of-leg-uit-lijst staat en de API Design Rules QUERY daarom niet toestaan, staan de operaties als POST in de specificatie.
3. Een nieuwe leesoperatie van dit type krijgt een pad in de operatievorm van de API Design Rules, met een underscore-segment, bijvoorbeeld `/partijen/_zoek`. De bestaande paden `/partij` en `/partijen/bulk` van de Profielservice blijven binnen v1 ongewijzigd.
4. In de Profielservice zijn de twee opvragingen hierboven de operaties die naar QUERY gaan; de schrijfoperaties blijven POST, PUT, PATCH en DELETE. In het NMC is er geen operatie waarop dit van toepassing is.

## Consequences

* De huidige POST-vorm van beide opvragingen wordt onder pas-toe-of-leg-uit verantwoord met deze ADR. De beschrijving van beide operaties in de specificatie van de Profielservice verwijst ernaar en benoemt QUERY als de beoogde methode.
* Zolang de operaties POST zijn, stelt hun beschrijving expliciet dat de opvraging geen neveneffecten heeft en herhaald mag worden, zodat afnemers zoals de verzendtaak van het NMC bij een verbindingsfout opnieuw mogen aanroepen. Met QUERY volgt dat uit de methode.
* De overstap naar QUERY raakt de specificatie (OpenAPI 3.2), de gegenereerde serverinterface van de Profielservice en de gegenereerde clients in het NMC en het portaal. Paden, bodies en responses veranderen niet.
* De gateway en de FSC-inway en -outway moeten de methode QUERY doorlaten; dat hoort bij de overstap.
* Responses op deze opvragingen worden niet gecachet (`Cache-Control: no-store`, conform de transportregels van de ADR); de cachebaarheid van QUERY speelt geen rol.
* Een beheer- of zoekfunctie die op ontvanger zoekt, in welke service dan ook, valt onder punt 1 en 2.

## Verwijzingen

* [RFC 10008, The HTTP QUERY Method](https://datatracker.ietf.org/doc/draft-ietf-httpbis-safe-method-w-body/): veilig, idempotent, cachebaar
* [NL GOV API Design Rules 2.1.0](https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/): HTTP-methoden, geen gevoelige informatie in URI's, operaties als sub-resource met underscore
* [ADR Spectral-linter](https://gitdocumentatie.logius.nl/publicatie/api/adr/2.1.0/media/linter.yaml): regel `http-methods`
* [API-Design-Rules issue #347, Sta QUERY method toe als http method](https://github.com/Logius-standaarden/API-Design-Rules/issues/347): wijzigingsvoorstel van Tim van der Lippe (Logius) en de conclusie van het Technisch Overleg API van 10 september 2026
* [OpenAPI: HTTP methods](https://learn.openapis.org/specification/http-methods): de operatie `query` in OpenAPI 3.2
* [openapi-generator PR #24982](https://github.com/OpenAPITools/openapi-generator/pull/24982) en [issue #24212](https://github.com/OpenAPITools/openapi-generator/issues/24212): OpenAPI 3.2 en het wegvallen van onbekende operaties
* [swagger-parser issue #2248](https://github.com/swagger-api/swagger-parser/issues/2248): OpenAPI 3.2
* [openapi-typescript PR #2853](https://github.com/openapi-ts/openapi-typescript/pull/2853): de methode QUERY
* [Quarkus REST: custom HTTP methods](https://quarkus.io/guides/rest)
* [SANS ISC, The HTTP QUERY method](https://isc.sans.edu/diary/33352): gedrag van nginx en andere servers
