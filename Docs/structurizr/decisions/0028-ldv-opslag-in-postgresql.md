# 28. PostgreSQL als opslag voor het Logboek Dataverwerkingen

Datum: 2026-10-08

## Status

Proposed

## Gerelateerde ADRs

* [ADR 0007 Logboek dataverwerking](0007-logboek-dataverwer.md) en [ADR 0010 Logboek dataverwerking implementeren](0010-ldv-implementatie.md): MOZa implementeert LDV met de eigen wrapper. ADR 0010 noemt ClickHouse als database voor de logging; deze ADR wijzigt dat.
* [ADR 0015 LDV overzetten naar Kotlin](0015-LDV-overzetten-kotlin.md): de wrapper waarin de backendkeuze zit.
* [ADR 0024 Georkestreerde state machine met eventlog](0024-georkestreerde-state-machine-met-eventlog.md): het NMC schrijft een LDV-registratie vóór elke externe aanroep.

## Context

Het Notificatie Management Component (NMC) legt zijn verwerkingen vast in het Logboek Dataverwerkingen via de LDV-wrapper (`moza-logboekdataverwerking`), vóór elke externe aanroep (ADR 0024). ADR 0010 koos ClickHouse als database voor het logboek. Het NMC draait zelf op PostgreSQL (ADR 0024). Voor het testen is PostgreSQL aantrekkelijker, omdat dat aanzienlijk minder resources vraagt.

De wrapper ondersteunt beide backends achter één `SpanRepository`, gekozen met `logboekdataverwerking.dbms` (`clickhouse` is de standaard, `postgresql` het alternatief). Beide JDBC-drivers zijn optioneel; een service declareert alleen de driver van de gekozen backend. De PostgreSQL-backend slaat `attributes` en `resource` op als `jsonb`, heeft een primary key op `(trace_id, span_id)`, schrijft elke export als één transactie, alles of niets, en doet dat over één JDBC-verbinding waarop exports na elkaar lopen.

Drie eigenschappen van ons gebruik bepalen de keuze:

* **Schrijfpatroon.** De standaardinstelling `span-processor=simple` met `write-failure-policy=fail-closed` is de enige combinatie die aan de acknowledgement-eis van de LDV-standaard voldoet. De wrapper exporteert dan elke logregel synchroon zodra die afsluit, binnen de request, en wacht op de bevestiging van de database. Die export valt binnen de transactie van de service: een geweigerde logregel rolt de verwerking terug. Een verwerking schrijft een actie-regel en bij meerdere betrokkenen een regel per betrokkene, elk als eigen insert; een mislukte verwerking schrijft daarna nog een uitkomst-regel. Het patroon is daarmee een stroom van kleine, losse, transactionele inserts met een synchrone bevestiging. ClickHouse is ontworpen voor grote, gebundelde inserts; veel kleine losse inserts leggen merge-druk op de MergeTree-tabel. PostgreSQL is gebouwd voor precies dit patroon.
* **Volume.** De verwerkingen van het NMC volgen uit notificaties van dienstverleners: per notificatie een registratie vóór het ophalen van de voorkeur en vóór het verzenden, en een registratie per opgevraagde pagina van de statusfeed. De huidige beoogde aantallen zijn klein genoeg dat PostgreSQL daar prima mee omgaat; de schaal waarop ClickHouse zijn compressie en analytische snelheid inzet is hier niet aan de orde.
* **Beheer.** Het NMC draait hoe dan ook op PostgreSQL. Met het logboek in dezelfde engine komt er geen beheer bij: één back-upprotocol en hersteltest, één monitoring en alarmering, één patch- en versiebeleid, één toegangsbeheer van databaserollen en één versleuteling in rust, voor applicatiedata en logboek samen. ClickHouse zou een tweede engine zijn met een eigen versie van elk van die onderdelen, alleen voor het logboek.

## Decision

Het NMC slaat zijn logregels van het Logboek Dataverwerkingen op in PostgreSQL, op alle omgevingen.

* Services zetten `logboekdataverwerking.dbms=postgresql` en configureren alleen de `logboekdataverwerking.postgresql.*`-properties. De `clickhouse.*`-properties en de bijbehorende secrets vervallen.
* Het logboek krijgt een eigen PostgreSQL-database, gescheiden van de databases van de services. Het logboek is insert-only en kent andere bewaartermijnen en andere lezers dan de applicatiedata.
* De `span-processor` blijft `simple` en de `write-failure-policy` blijft `fail-closed`.

## Alternatieven

* **ClickHouse in productie, PostgreSQL in test.** Afgewezen. Test en productie draaien dan op verschillende backends, met verschillend gedrag bij fouten (SQLState tegenover ClickHouse-foutcodes) en bij transacties. ClickHouse levert voor ons volume geen voordeel op dat de extra engine en het hogere resourcegebruik rechtvaardigt.
* **ClickHouse met `span-processor=batch`.** Lost de merge-druk op met gebundelde inserts. Afgewezen omdat `batch` niet voldoet aan de acknowledgement-eis: de applicatie keert terug voordat de export is bevestigd en `fail-closed` degradeert tot log-only.
* **ClickHouse met asynchrone inserts (`async_insert` met `wait_for_async_insert=1`).** ClickHouse bundelt dan de losse inserts aan de serverkant en bevestigt pas na het wegschrijven, zodat de acknowledgement-eis overeind blijft. Elke verwerking wacht daarbij op de flush-interval van de server, wat latency toevoegt aan iedere request met een `@Logboek`-actie. Afgewezen omdat het de beheerlast van een tweede engine niet wegneemt en het volume de bundeling niet nodig maakt.

De afweging kantelt bij een volume waarbij PostgreSQL de inserts of de opslag niet meer bijhoudt, of bij een centrale analytische bevraging van het logboek over grote periodes. De wrapper ondersteunt dan nog steeds ClickHouse als backend.

## Migratie tussen de backends

Als de afweging later kantelt moet de data worden verhuisd naar de andere variant. Beide varianten slaan dezelfde logregel op in dezelfde kolommen: trace-id, span-id, status, naam, begin- en eindtijd in milliseconden sinds epoch, parent-span-id en de twee platte sleutel-waardeverzamelingen `attributes` en `resource`. De verschillen zijn het type van die laatste twee kolommen (`Map(String, String)` in ClickHouse, `jsonb` in PostgreSQL), de parent-span-id van een rootregel (de nul-id in ClickHouse, `NULL` in PostgreSQL) en de kolomnamen (`traceId` tegenover `trace_id`). Elk van die verschillen is in beide richtingen zonder verlies te vertalen. Het logboek is bovendien insert-only en de sleutel `(trace_id, span_id)` is in beide backends dezelfde. Een migratie is daarmee een eenmalige kopie van rijen, in drie stappen:

1. **Bulkkopie.** De wrapper maakt de doeltabel aan bij het eerste gebruik; een eenmalig script zet daarna de bestaande rijen over. Van PostgreSQL naar ClickHouse leest ClickHouse de brontabel rechtstreeks met de `postgresql()`-tabelfunctie in één `INSERT ... SELECT`, waarbij de `jsonb`-kolommen met `JSONExtract` naar `Map` gaan. Van ClickHouse naar PostgreSQL exporteert ClickHouse de tabel als `JSONEachRow` of CSV en laadt PostgreSQL die met `COPY`. In beide richtingen bestaat de vertaling uit het hernoemen van kolommen en het omzetten van de parent-span-id.
2. **Omschakelen.** De service wisselt `logboekdataverwerking.dbms`, declareert de andere JDBC-driver en krijgt de bijbehorende properties en secrets. Omdat de wrapper synchroon en fail-closed schrijft, is er geen buffer of wachtrij die eerst leeg moet lopen: na de herstart schrijft de service alleen nog naar de nieuwe backend.
3. **Nakopie.** Indien we de service gedurende de migratie niet uit zouden zetten moet er een nakopie plaatsvinden: rijen die tussen de bulkkopie en de herstart zijn geschreven, worden op `start_time` geselecteerd en alsnog overgezet. Naar PostgreSQL is dat idempotent met `ON CONFLICT DO NOTHING` op de sleutel; naar ClickHouse wordt de selectie op tijd begrensd, omdat MergeTree geen unieke sleutel afdwingt.

Het werk zit vooral rondom de tabel:

* De index op het betrokkene-attribuut en de bevraging vanuit het portaal zijn per backend anders (`jsonb`-operatoren tegenover `Map`-toegang, en in ClickHouse een skip-index of een andere `ORDER BY` bij het aanmaken van de tabel). Die worden opnieuw gemaakt.
* Het opschonen na de bewaartermijn gaat mee: `TTL` in ClickHouse, een periodieke delete of partitionering in PostgreSQL.
* De beheerafspraken uit de contextsectie (back-up en hersteltest, monitoring en alarmering, patching, toegangsbeheer, versleuteling in rust) moeten voor de nieuwe engine staan vóór de omschakeling. Bij een overstap naar ClickHouse is dit het grootste deel van het werk.

De data zet de keuze niet vast. De omvang van een latere overstap wordt bepaald door de beheerinrichting van de nieuwe engine en de aanpassingen aan de bevragingen; de migratie van de logregels zelf is daarvan het kleinste deel.

## Consequences

* Het NMC declareert de PostgreSQL-driver en niet de ClickHouse-driver. De lokale ontwikkelomgeving draait PostgreSQL voor het logboek.
* Per omgeving is een PostgreSQL-database voor het logboek nodig. De wrapper maakt bij het eerste gebruik zelf de tabel aan (`CREATE TABLE IF NOT EXISTS`), dus de databaserol van de wrapper heeft rechten om in die database een tabel aan te maken.
* Met `fail-closed` faalt een verwerking als het logboek niet bereikbaar is. De beschikbaarheid van de logboekdatabase bepaalt daarmee mede de beschikbaarheid van het NMC. De logboekdatabase valt onder dezelfde beschikbaarheidsafspraken als de database van het NMC zelf.
* De wrapper schrijft over één verbinding en binnen de transactie van de service. Gelijktijdige verwerkingen wachten daardoor op elkaar bij het schrijven van hun logregels, en die wachttijd telt mee voor de transactietimeout van de service. Bij een piek is de latency van de logboekdatabase dus direct zichtbaar in de doorlooptijd van de verwerkingen.
* PostgreSQL heeft geen ingebouwde TTL zoals ClickHouse. Het opschonen van logregels na de bewaartermijn gebeurt met een periodieke delete of met partitionering op tijd.
* De wrapper maakt alleen een primary key op `(trace_id, span_id)` aan. Het tonen van de verwerkingen per ondernemer in het portaal (ADR 0010) bevraagt het logboek op betrokkene; daarvoor is een index op het betrokkene-attribuut in `attributes` nodig.
* De beschrijving van het LDV-systeem in `workspace.dsl` ("Verwerkingslog van MOZa (ClickHouse)") en de consequentie over ClickHouse in ADR 0010 volgen deze beslissing.

## Verwijzingen

* [moza-logboekdataverwerking](https://github.com/MinBZK/moza-logboekdataverwerking): README, secties over `dbms`, `span-processor` en `write-failure-policy`, "Interceptorvolgorde en transacties" en "Logregel vooraf, uitkomst achteraf".
* [ClickHouse: asynchronous inserts](https://clickhouse.com/docs/optimize/asynchronous-inserts)
* [ClickHouse: postgresql table function](https://clickhouse.com/docs/sql-reference/table-functions/postgresql)
