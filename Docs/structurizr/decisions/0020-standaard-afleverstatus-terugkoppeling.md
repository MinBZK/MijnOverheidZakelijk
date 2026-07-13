# 20. Standaard voor de afleverstatus-terugkoppeling van de Notificatiedienst

Datum: 2026-06-16

## Status
Proposed

## Gerelateerde ADRs
- [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): keuze voor NotifyNL als verzendkanaal, waaruit de asynchrone afleverstatus (delivery receipt) voortkomt die we hier terugkoppelen.

## Context

De Notificatiedienst verstuurt notificaties via NotifyNL. NotifyNL bevestigt bij aanbieding alleen de acceptatie; de uiteindelijke afleverstatus volgt asynchroon als delivery receipt naar de inkomende Afleverstatus-callback van het NMC. Het NMC koppelt die status vervolgens terug aan de consument, gecorreleerd op de referentie die de consument bij het oorspronkelijke verzoek heeft meegegeven.

Voor die uitgaande terugkoppeling moeten we een standaard kiezen. Dat is niet één keuze: CloudEvents is bijvoorbeeld een berichtformaat (envelope), geen aflevermechanisme. De overheids-richtlijnen bieden opties op verschillende, onafhankelijke lagen, en op meerdere van die lagen staat een standaard op de "pas toe of leg uit"-lijst van het Forum Standaardisatie. Er is dus geen enkel voorgeschreven antwoord; we kiezen en motiveren.

> Let op: onderstaande beschrijvingen zijn afgeleid uit informatieve samenvattingen van de standaarden. De publicaties op forumstandaardisatie.nl en Logius zijn leidend.

### De lagen

- **Berichtformaat (envelope):** het NL GOV profiel voor CloudEvents (v1.0 pas-toe-of-leg-uit, vastgesteld OBDO 25-11-2025), of platte JSON, of SOAP/ebXML wanneer voor Digikoppeling wordt gekozen.
- **Interactiepatroon / transport:** webhook (HTTP push, het aanbevolen event-driven patroon in de NL API Strategie), Server-Sent Events, WebSockets, of pull/polling als terugvaloptie wanneer de afnemer geen inkomend endpoint kan aanbieden.
- **Koppelvlak-stack:** de moderne event-stack (webhook met CloudEvents, aansluitend op Abonneren/Notificatieservices) tegenover Digikoppeling (profielen REST-API, WUS, ebMS2 en Grote Berichten). Ook Digikoppeling staat op de pas-toe-of-leg-uit-lijst.
- **Connectiviteit en autorisatie:** FSC (Federated Service Connectivity, verplicht bij het Digikoppeling REST-API-profiel), OIN met PKIoverheid (mTLS) bij Digikoppeling, en op berichtniveau een ondertekende bearer-JWT.

### De realistische opties

| # | Optie | Formaat | Transport | Sync/async | Betrouwbaarheid | Opmerking |
|---|-------|---------|-----------|------------|-----------------|-----------|
| 1 | Webhook + NL GOV CloudEvents | CloudEvents (JSON) | Webhook (push) | Async | Durable queue + idempotentie | Lichtgewicht |
| 2 | Webhook + platte JSON | Platte JSON | Webhook (push) | Async | Retries + idempotentie op applicatieniveau | Afwijking van CloudEvents; vergt een "leg uit" |
| 3 | Digikoppeling ebMS2 `osb-rm` | SOAP/ebXML | ebMS2 | Async | Reliable messaging (AckRequested, duplicate-eliminatie, at-most-once) | Zwaar: CPA per partij, OIN + PKIoverheid; formele route voor gegarandeerde aflevering |
| 4 | Status-query endpoint (pull op referentie) | JSON | HTTPS GET (pull) | Sync | n.v.t. (afnemer haalt zelf op) | Laagste drempel, geen inkomend endpoint nodig; complementair aan de push |

Belangrijke nuance: omdat zowel CloudEvents als Digikoppeling pas-toe-of-leg-uit zijn, kunnen ze beide tegelijk van toepassing lijken. Ze sluiten elkaar echter niet uit: het zijn keuzes op verschillende lagen, en de gekozen combinatie wordt onderbouwd.

### Afweging per optie

1. **Webhook + CloudEvents.** Voordeel: licht, een gestandaardiseerde envelope met tooling, schaalt naar veel afnemers. Nadeel: de aflevergarantie zit op applicatieniveau (durable queue plus idempotentie), niet als bilaterale protocolgarantie.
2. **Webhook + platte JSON.** Voordeel: een lage drempel voor afnemers, geen CloudEvents-bibliotheek nodig. Nadeel: wijkt af van de CloudEvents-standaard (vergt een "leg uit") en mist de gestandaardiseerde envelope.
3. **Digikoppeling ebMS2 (`osb-rm`).** Voordeel: formele, bilaterale reliable messaging met acks en duplicaateliminatie, plus non-repudiation in de signed variant. Nadeel: zwaar (CPA per partij, OIN, PKIoverheid), een hoge drempel die slecht schaalt naar veel afnemers.
4. **Status-query endpoint.** Voordeel: de laagste drempel, geen inkomend endpoint nodig, en het loopt in dezelfde richting als de aanroepen die de afnemer al doet. Nadeel: pull, dus de afnemer moet de status zelf opvragen en krijgt deze niet uit zichzelf binnen.

## Decision

De richting waar we naar neigen:

1. **Voorkeursrichting:** twee complementaire mechanismen. Als basis een status-query endpoint waarop de afnemer de afleverstatus per referentie opvraagt; dit heeft de laagste drempel en vergt geen inkomend endpoint. Daarnaast, optioneel, een push via webhook met het NL GOV CloudEvents-profiel en een ondertekende bearer-JWT, met een durable queue en idempotente verwerking voor betrouwbare aflevering. Reden: de query dekt elke afnemer, en de push is het aanbevolen event-driven patroon voor wie de status direct wil ontvangen.
2. **Formele alternatieve route:** in principe sluiten afnemers aan op onze standaard; Digikoppeling ebMS2 (`osb-rm`) blijft alleen als uitzondering beschikbaar wanneer een afnemer het ebMS2-profiel of formele non-repudiation contractueel voorschrijft.
3. **Connectiviteit:** FSC past op de inkomende richting, waarmee afnemers de Notificatiedienst aanroepen. Het status-query endpoint loopt diezelfde richting op en sluit daar dus op aan. De push gaat de andere kant op en loopt niet over diezelfde verbinding; FSC ligt daarvoor niet voor de hand, omdat elke afnemer dan een eigen callback-service zou moeten registreren en dat de aansluitdrempel verhoogt.
4. **Privacy:** persoonsgegevens (BSN, KvK, RSIN) blijven buiten de CloudEvents context-attributen; de referentie dient als `subject`.

### Waarom nog niet vastgesteld

De keuze hangt af van een aantal punten die nog open staan:

- of een afnemer het ebMS2-profiel of formele non-repudiation contractueel voorschrijft;
- of platte JSON als "leg uit" acceptabel is voor afnemers die geen CloudEvents-bibliotheek kunnen of willen gebruiken.
