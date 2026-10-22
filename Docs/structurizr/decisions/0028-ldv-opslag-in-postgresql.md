# 28. PostgreSQL als opslag voor het Logboek Dataverwerkingen

Datum: 2026-10-08

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0007 Logboek dataverwerking](0007-logboek-dataverwer.md) en [ADR 0010 Logboek dataverwerking implementeren](0010-ldv-implementatie.md): MOZa implementeert LDV met de eigen wrapper. ADR 0010 noemt ClickHouse als database voor de logging; deze ADR wijzigt dat.
* [ADR 0015 LDV overzetten naar Kotlin](0015-LDV-overzetten-kotlin.md): de wrapper waarin de backendkeuze zit.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): het NMC schrijft een LDV-registratie vóór elke externe aanroep.

## Context

De Profielservice en het Notificatie Management Component (NMC) leggen hun verwerkingen vast in het Logboek Dataverwerkingen via de LDV-wrapper (`moza-logboekdataverwerking`). Tot nu toe was ClickHouse de beoogde database voor productie. Voor het testen gebruiken we PostgreSQL, omdat dat aanzienlijk minder resources vraagt.

De wrapper ondersteunt sinds versie 2.0.0 beide backends achter één `SpanRepository`, gekozen met `logboekdataverwerking.dbms` (`clickhouse` is de standaard, `postgresql` het alternatief). Beide JDBC-drivers zijn optioneel; een service declareert alleen de driver van de gekozen backend. De PostgreSQL-backend slaat `attributes` en `resource` op als `jsonb`, heeft een primary key op `(trace_id, span_id)` en schrijft elke export als één transactie, alles of niets.

Drie eigenschappen van ons gebruik bepalen de keuze:

* **Schrijfpatroon.** De standaardinstelling `span-processor=simple` met `write-failure-policy=fail-closed` is de enige combinatie die aan de acknowledgement-eis van de LDV-standaard voldoet. Elke span wordt dan synchroon en los weggeschreven binnen de request, en een verwerking met N betrokkenen doet N+1 inserts. ClickHouse is ontworpen voor grote, gebundelde inserts; veel kleine losse inserts leggen merge-druk op de MergeTree-tabel. PostgreSQL is gebouwd voor precies dit patroon van kleine transactionele schrijfacties.
* **Volume.** De verwerkingen van de Profielservice en het NMC volgen uit handelingen van ondernemers en uit notificaties van dienstverleners. Dat volume ligt ordes van grootte onder de schaal waarvoor ClickHouse zijn compressie en analytische snelheid inzet.
* **Beheer.** De Profielservice en het NMC draaien al op PostgreSQL. Back-up, monitoring en kennis van PostgreSQL zijn daardoor al ingericht; ClickHouse is een tweede database-engine met eigen beheer, alleen voor het logboek.

Bij het NMC staat LDV uit (`logboekdataverwerking.enabled=false`), in afwachting van een werkende ClickHouse-configuratie. Bij de Profielservice komt `logboekdataverwerking.enabled` voor acc en prod uit de sealed secret, en voor de Profielservice is een ClickHouse-database ingericht (ADR 0010). Of daar al logregels in staan, staat niet in de configuratie.

## Decision

Het Logboek Dataverwerkingen van MOZa slaat zijn logregels op in PostgreSQL, op alle omgevingen.

* Services zetten `logboekdataverwerking.dbms=postgresql` en configureren alleen de `logboekdataverwerking.postgresql.*`-properties. De `clickhouse.*`-properties en de bijbehorende secrets vervallen.
* Het logboek krijgt een eigen PostgreSQL-database, gescheiden van de databases van de services. Het logboek is insert-only en kent andere bewaartermijnen en andere lezers dan de applicatiedata.
* De `span-processor` blijft `simple` en de `write-failure-policy` blijft `fail-closed`.

## Alternatieven

* **ClickHouse in productie, PostgreSQL in test.** Afgewezen. Test en productie draaien dan op verschillende backends, met verschillend gedrag bij fouten (SQLState tegenover ClickHouse-foutcodes) en bij transacties. ClickHouse levert voor ons volume geen voordeel op dat de extra engine en het hogere resourcegebruik rechtvaardigt.
* **ClickHouse met `span-processor=batch`.** Lost de merge-druk op met gebundelde inserts. Afgewezen omdat `batch` niet voldoet aan de acknowledgement-eis: de applicatie keert terug voordat de export is bevestigd en `fail-closed` degradeert tot log-only.
* **ClickHouse met asynchrone inserts (`async_insert` met `wait_for_async_insert=1`).** ClickHouse bundelt dan de losse inserts aan de serverkant en bevestigt pas na het wegschrijven, zodat de acknowledgement-eis overeind blijft. Elke verwerking wacht daarbij op de flush-interval van de server, wat latency toevoegt aan iedere request met een `@Logboek`-actie. Afgewezen omdat het de beheerlast van een tweede engine niet wegneemt en het volume de bundeling niet nodig maakt.

De afweging kantelt bij een volume waarbij PostgreSQL de inserts of de opslag niet meer bijhoudt, of bij een centrale analytische bevraging van het logboek over grote periodes. De wrapper ondersteunt dan nog steeds ClickHouse als backend.

## Consequences

* De Profielservice en het NMC gebruiken nog wrapper 1.1.0, van vóór de backendkeuze. Overstappen betekent een upgrade naar 2.x, `dbms=postgresql` zetten en de `clickhouse.*`-properties, -environmentvariabelen en sealed secrets vervangen door `postgresql.*`. Beide services hebben de PostgreSQL-driver al als dependency.
* Als de ClickHouse-database van de Profielservice op acc of prod al logregels bevat, worden die bij de overstap naar PostgreSQL gemigreerd of tot het einde van hun bewaartermijn in ClickHouse bewaard.
* De lokale `docker-compose` van de Profielservice draait PostgreSQL in plaats van ClickHouse voor het logboek.
* Per omgeving is een PostgreSQL-database voor het logboek nodig. De wrapper maakt bij start zelf de tabel aan (`CREATE TABLE IF NOT EXISTS`), dus de databaserol van de wrapper heeft rechten om in die database een tabel aan te maken.
* Met `fail-closed` faalt een verwerking als het logboek niet bereikbaar is. De beschikbaarheid van de logboekdatabase bepaalt daarmee mede de beschikbaarheid van de Profielservice en het NMC.
* PostgreSQL heeft geen ingebouwde TTL zoals ClickHouse. Het opschonen van logregels na de bewaartermijn gebeurt met een periodieke delete of met partitionering op tijd.
* De wrapper maakt alleen een primary key op `(trace_id, span_id)` aan. Het tonen van de verwerkingen per ondernemer in het portaal (ADR 0010) bevraagt het logboek op betrokkene; daarvoor is een index op het betrokkene-attribuut in `attributes` nodig.
* De beschrijving van het LDV-systeem in `workspace.dsl` ("Verwerkingslog van MOZa (ClickHouse)") en de consequentie over ClickHouse in ADR 0010 volgen deze beslissing.

## Verwijzingen

* [moza-logboekdataverwerking](https://github.com/MinBZK/moza-logboekdataverwerking): README, secties over `dbms`, `span-processor` en `write-failure-policy`.
* [ClickHouse: asynchronous inserts](https://clickhouse.com/docs/optimize/asynchronous-inserts)
