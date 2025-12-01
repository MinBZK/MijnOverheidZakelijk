# 10. Logboek dataverwerking implementeren

Date: 2025-12-01

## Status

Proposed

## Context

Het Logboek Dataverwerking (LDV) is een standaard van Logius die gericht is op het vergroten van de controleerbaarheid van de overheid. Dit betekent dat overheidsorganisaties hun handelingen en besluiten altijd moeten kunnen toelichten, aan burgers, bedrijven en andere overheidsinstanties.
Het LDV-standaard helpt hierbij door een uniforme manier te bieden om vast te leggen welke gegevens van burgers en bedrijven worden verwerkt, hoe dit gebeurt en om welke redenen.

### Fieldlab 2025 Bestaandzekerheid bij levensgebeurtenissen

Bij dit fieldlab hebben wij nauw samengewerkt met het team van LDV. Hier liepen wij tegen diverse hindernissen aan in het standaard die we samen hebben kunnen oplossen. Uiteindelijk hebben wij hiervoor een open-source java package ontwikkeld waarmee wij, of andere geintereseerde, makkelijk het LDV standaard kunnen implementeren. De java package staat op [Github](https://www.google.com)
Ook heeft LDV zelf deze package toegelicht hier: [developer.overheid.nl - jakarta](https://developer.overheid.nl/kennisbank/data/standaarden/logboek-dataverwerkingen/implementaties/jakarta)

## Decision

MOZa heeft de beslissing genomen om Logboek dataverwerking te implementeren in de profiel service.
Hiernaast zullen wij ook aan de gebruiker de logging gaan tonen in het MOZa portaal, dit houdt in dat wanneer deze inlogt er een pagina of widget beschikbaar zal zijn waar de geschiedenis van bevragingen te zien is.

## Consequences

De consequenties hiervan zijn driedelig. Ten eerste zoals benoemd, hebben wij hiervoor een java package gemaakt en geupload naar de maven repository, enige onderhoud hiervan zal op kort termijn nog nodig zijn. De tweede consequentie is dat wij een Clickhouse database neer hebben moeten zetten in onze omgeving waarnaar deze logging kan worden gestuurd. Hiernaast zullen wij het MOZa portaal moeten gaan aanpassen zodat deze logging kan ophalen en tonen aan ingelogde gebruikers.

Als laatste zullen wij in de toekomst nog met het team van LDV in overleg om onze logging open te stellen aan de inzichte API, maar die is nog in development.
