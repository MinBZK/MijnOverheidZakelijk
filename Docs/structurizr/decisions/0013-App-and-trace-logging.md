# 13. Application and trace logging

Date: 2026-02-02

## Status

Proposed

## Context

Voor het kunnen beheren, bewaken en analyseren van de MOZa‑diensten maken we onderscheid tussen:

- Trace logging (distributie van request/flow‑informatie over services heen), voor performance‑analyse, oorzaak/gevolg en ketenoverzicht.
- Applicatie logging (event/operational logs), voor functionele en technische gebeurtenissen binnen een component.

We hebben besloten de LDV‑standaard te gebruiken voor het uitwisselen en opslaan van trace‑data. 
Tegelijk willen we eenduidige afspraken voor applicatie logging vastleggen zodat logs betrouwbaar, AVG‑veilig en goed doorzoekbaar zijn.

Gerichte eisen vanuit team/veld:
- Elke log moet uniek zijn.
- Houd de log regels stabiel en beheersbaar.
- Log geen lijsten/arrays.
- Concateneer geen strings.
- Log geen gebruikersdata.
- Duidelijke semantiek van log niveaus: Error/Warning/Info/Debug.


## Decision

1. Trace logging via LDV
   - De distributie/uitwisseling van trace‑gegevens gebeurt via LDV conform ADR 0010. LDV is leidend voor het verzamelen en analyseren van trace gegevens.
   - Geen persoonsgegevens in trace‑attributes. Attributen zijn beperkt tot technische/operationele waarden. Functionele identifiers die herleidbaar zijn tot personen worden niet gelogd.

2. Applicatie logging:
   - Formaat: gestructureerde logging (JSON waar mogelijk) met vaste velden: `timestamp`, `level`, `message`, `properties`, `traceId`(?), `spanId`(?).
   - Uniekheid?
   - Geen lijsten/arrays:
   - Geen string concatenatie:
     - Gebruik message templates met placeholders: `"Bestand {fileName} verwerkt in {durationMs} ms"`.
   - Geen gebruikersdata:
     - Log nooit namen, adressen, BSN, e‑mail, telefoonnummers, vrije invoer, of andere PII. Gebruik gehashte/gepseudonimiseerde technische id's indien noodzakelijk en goedgekeurd.
   - Niveaus en semantiek:
     - Error – een fout/exception: functionaliteit is mislukt of niet hersteld; bevat een exception object en een duidelijke oorzaak.
     - Warning – iets is misgegaan of afwijkend, maar niet direct kritisch; de workflow kan doorgaan of is automatisch hersteld.
     - Info – iets ongebruikelijks of interessants is gebeurd (state change, start/stop, feature toggle, belangrijke configuratie) zonder fout.
     - Debug – uitsluitend voor lokaal/development/diagnostiche gebruik; in productie standaard uitgeschakeld.


## Wat loggen we
Standaard loggen we uitsluitend errors: exceptions waarbij de verwerking niet kan worden voortgezet.
Warning- en info-logs worden alleen toegevoegd wanneer de ontwikkelaar of reviewer dit zinvol acht.
 - Een voorbeeld van een warning is wanneer een controller wordt aangeroepen met ongeldige parameters.
