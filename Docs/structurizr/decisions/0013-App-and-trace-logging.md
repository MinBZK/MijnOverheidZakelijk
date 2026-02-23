# 13. Application and trace logging

Date: 2026-02-02

## Status

Proposed

## Context

Voor het kunnen beheren, bewaken en analyseren van de MOZa‑diensten maken we onderscheid tussen:

- Interne trace logging: trace‑ en flow‑informatie binnen onze eigen componenten en services voor performance‑analyse, oorzaak/gevolg, en doorstroom‑/latency‑inzichten.
- LDV keten‑tracering (over diensten/organisaties heen): trace‑informatie die gebruikt wordt om een verzoek over meerdere diensten/organisaties heen te volgen (ketenoverzicht voor derden/ketenpartners).
- Applicatie logging (event/operational logs), voor functionele en technische gebeurtenissen binnen een component.

We hebben besloten de LDV‑standaard te gebruiken voor het uitwisselen en opslaan van keten‑trace‑data (over services/organisaties heen). 
Tegelijk willen we eenduidige afspraken voor applicatie logging vastleggen zodat logs betrouwbaar, AVG‑veilig en goed doorzoekbaar zijn.

Gerichte eisen vanuit team/veld:
- Elke log moet uniek zijn.
- Houd de log regels stabiel en beheersbaar.
- Log geen lijsten/arrays.
- Concateneer geen strings.
- Log geen gebruikersdata.
- Duidelijke semantiek van log niveaus: Error/Warning/Info/Debug.


## Decision

1. Interne trace logging
   - Doel: inzicht in performance, doorlooptijden, wachttijden, foutpaden en oorzaak‑/gevolg binnen MOZa‑componenten.
   - Wanneer: Hoeft niet standaard, maar kan worden toegevoegd als nodig.
   - Bereik: uitsluitend intern gebruik; niet bedoeld voor ketenpartners.
   - Privacy/Personally Identifiable data (PII): geen persoonsgegevens in trace‑attributen; beperk attributen tot technische/operationele waarden.

2. LDV keten‑tracering (over diensten/organisaties)
   - De distributie/uitwisseling van keten‑trace‑gegevens gebeurt via LDV conform ADR 0010. LDV is leidend voor het verzamelen en analyseren van trace‑gegevens over service‑ en organisatiegrenzen heen.
   - Wanneer: Standaard toegepast voor API endpoints
   - Gebruik: bedoeld voor ketenoverzicht en voor derden/ketenpartners om een verzoek door de keten te volgen.
   - Privacy/PII: geen persoonsgegevens in trace‑attributen; functionele identifiers die herleidbaar zijn tot personen worden niet gelogd.

3. Applicatie logging
   - Formaat: gestructureerde logging (JSON) met vaste velden: `timestamp`, `level`, `message`, `properties` (key‑value).
   - Uniekheid: iedere logregel is identificeerbaar via combinatie van `timestamp` + bron + optionele `eventId`.
   - Wanneer: Toepassen wanneer developer of reviewer dit nodig vindt.
   - Geen lijsten/arrays: log primitives en korte key‑value properties; grote collecties niet loggen.
   - Geen string‑concatenatie:
     - Gebruik message templates met placeholders: `"Bestand {fileName} verwerkt in {durationMs} ms"`.
   - Geen gebruikersdata (PII):
     - Log nooit namen, adressen, BSN, e‑mail, telefoonnummers, vrije invoer, of andere PII. Gebruik gehashte/gepseudonimiseerde technische id's indien noodzakelijk en goedgekeurd.
   - Niveaus en semantiek:
     - Error – een fout/exception: functionaliteit is mislukt of niet hersteld; bevat een exception object en een duidelijke oorzaak.
     - Warning – iets is misgegaan of afwijkend, maar niet direct kritisch; de workflow kan doorgaan of is automatisch hersteld.
     - Info – iets ongebruikelijks of interessants is gebeurd (state change, start/stop, feature toggle, belangrijke configuratie) zonder fout.
     - Debug – uitsluitend voor lokaal/development/diagnostische gebruik; in productie standaard uitgeschakeld.

## Wat loggen we
Standaard loggen we uitsluitend errors: exceptions waarbij de verwerking niet kan worden voortgezet.
Warning‑ en info‑logs worden alleen toegevoegd wanneer de ontwikkelaar of reviewer dit zinvol acht.
- Voorbeeld Warning: een controller wordt aangeroepen met ongeldige parameters (validatie faalt) maar is afgehandeld.
- Interne trace logging is standaard aan in niet‑productie om performance‑knelpunten op te sporen; in productie beperken we detailniveau en retentie.
- LDV keten‑tracering wordt toegepast wanneer ketenverkeer dit vereist conform ADR 0010, met strikte uitsluiting van PII in attributen.
