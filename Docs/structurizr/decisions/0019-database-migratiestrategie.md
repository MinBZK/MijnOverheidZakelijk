# 19. Database migratiestrategie

Datum: 2026-05-19

## Status

Proposed

## Context

De Profiel Service draaide tot nu toe met `quarkus.hibernate-orm.schema-management.strategy=update`. Hibernate genereert en muteert dan zelf de tabellen op basis van de JPA-entities. Voor lokale ontwikkeling werkt dat, maar voor reproduceerbare deploys is het ongeschikt: schemawijzigingen zijn niet in git zichtbaar, kunnen niet worden gereviewd, en kunnen niet betrouwbaar op acceptatie of productie worden gespeeld. Dat is in strijd met BIO-eisen rond change management en met de uitgangspunten van NeRDS.

Ook de tests gaven geen dekking op het schema. Die draaiden tegen H2 in PostgreSQL-compatibiliteitsmodus, met `quarkus.flyway.enabled=false` en `schema-management.strategy=drop-and-create`: het testschema kwam uit de JPA-entities. De migratiescripts werden daardoor door geen enkele test uitgevoerd, en uitvoeren kon ook niet: `V1__init_gegevensmodel.sql` begint met `CREATE EXTENSION IF NOT EXISTS pgcrypto`, en H2 kent noch die extensie, noch de partiële unique indexen en expressie-indexen verderop in het model. Een groene testrun zei daarmee niets over het schema waarop de service draait.

Tegelijk is het gegevensmodel van de Profiel Service substantieel herzien (zie `08-data.md` en `09-infrastructuur-architectuur.md`). Dit is het natuurlijke moment om een migratietool in te voeren, een eerste migratiescript te leveren, en hibernate over te zetten naar `validate`.

De andere Quarkus-services binnen MOZa volgen later hetzelfde patroon. `moza-omc` (C# .NET) gebruikt EF Core Migrations en valt buiten de scope van deze ADR.

## Decision

We kiezen voor **Flyway**, geconfigureerd via de `quarkus-flyway` extensie.

- Migraties worden geschreven als SQL-scripts onder `src/main/resources/db/migration/`, met de Flyway-naamgevingsconventie `V{volgnummer}__{omschrijving}.sql`. Een migratie die een eerdere migratie opruimt of terugdraait noemt die in de omschrijving: `V9__contract_v4_drop_oude_kolom.sql`, `V6__revert_v5_hernoem_kolom.sql`. De omschrijving komt in `flyway_schema_history` terecht, zodat die relatie ook zichtbaar is als alleen de database voorhanden is.
- `quarkus.hibernate-orm.schema-management.strategy` staat op `validate`. Bij applicatiestart wordt het schema vergeleken met de JPA-entities; afwijkingen leiden tot directe boot-fout.
- Migraties draaien op alle omgevingen automatisch bij applicatiestart (`quarkus.flyway.migrate-at-start=true`), in de pod zelf; er komt geen aparte migratiestap in de pipeline. Starten meerdere pods tegelijk, dan serialiseert Flyway ze via een session-level advisory lock in PostgreSQL; valt een pod tijdens de migratie weg, dan geeft de database die lock direct vrij. Bij een rolling update faalt een mislukte migratie in de nieuwe pod terwijl de oude pods blijven draaien. Consequentie van migreren-bij-start is dat de datasource-rol van de applicatie DDL-rechten heeft; een aparte, minder geprivilegieerde runtime-rol past niet in dit model.
- Op acceptatie en productie staat `quarkus.hibernate-orm.schema-management.strategy` tijdelijk op `update`, zodat drift tussen entities en migraties wordt overbrugd zolang het gegevensmodel nog snel verandert. Die uitzondering vervalt zodra het gegevensmodel stabiliseert; de eindsituatie is `validate` op alle omgevingen.
- We werken **forward-only**: een fout of een gewenste terugdraaiing wordt afgehandeld met een nieuwe corrigerende migratie (`Vn+1`), niet met `flyway undo`. Hoe herstel en terugdraaien precies werken staat onder Foutafhandeling en herstel.
- Forward-only geldt per database, niet per bestand: een migratie is **onveranderlijk zodra hij op productie is toegepast**. Daarvóór wordt het bestand zelf gecorrigeerd, zodat productie een foute migratie nooit uitvoert. Een migratie die faalt is door de transactie al teruggedraaid en dus nergens toegepast; is hij op dev of acceptatie wel geslaagd, dan brengt `flyway repair` (of een reset, zolang die omgeving geen te bewaren data heeft) de checksums daar weer in lijn met het gecorrigeerde bestand.
- Migraties zijn **backwards-compatible** (expand/contract). Een migratie voegt toe of verruimt, zodat de vorige applicatieversie op het nieuwe schema blijft werken. Een latere migratie ruimt de oude vorm op, nadat de nieuwe applicatieversie draait en terugrollen niet meer aan de orde is. Een kolom hernoemen of verwijderen in dezelfde migratie als de code die erop leunt hoort daar niet bij; dat wordt gesplitst in een verruimende en een opruimende migratie.
- V1 is het volledige doelmodel vanaf een lege database. Er is geen historische baseline, omdat alle bestaande dev-databases mogen worden weggegooid (greenfield-fase).
- Tests draaien tegen een embedded PostgreSQL (Zonky embedded-postgres): de test-JVM start zelf een echt PostgreSQL-proces, zonder Docker. Dat is nodig omdat de CI-runners van het LPC geen Docker bieden, waardoor dev services PostgreSQL (Testcontainers) afvalt. Flyway voert in de tests de echte migraties uit en Hibernate staat op `validate`; H2 en het entity-gegenereerde testschema zijn verwijderd.

## Foutafhandeling en herstel

Migraties draaien geautomatiseerd bij applicatiestart; er is geen aparte migratiestap of DBA-handeling in de uitrol. Herstel werkt als volgt:

- **Gefaalde migratie.** PostgreSQL ondersteunt transactionele DDL en Flyway draait elke migratie in één transactie. Een migratie die faalt wordt daardoor in zijn geheel teruggedraaid; het schema blijft op de vorige versie en raakt niet half-toegepast. De rolling update houdt de oude pods in de lucht op het ongewijzigde schema. Geen downtime, wel een zichtbaar gefaalde deploy. Niet-transactionele statements (zoals `CREATE INDEX CONCURRENTLY`) vermijden we. Is zo'n statement toch nodig, dan krijgt het een eigen migratie met `executeInTransaction=false`; falen daarvan kan wel handmatige opruiming vergen (achtergebleven INVALID index, `flyway repair`).
- **Gecontroleerde terugdraaiing.** Een reeds toegepaste migratie draaien we terug met een nieuwe forward-migratie (`Vn+1`) die de wijziging ongedaan maakt; die wordt uitgerold zoals elke andere migratie. We gebruiken hiervoor geen `flyway undo` (een betaalde Flyway-functie); bij forward-only is dat ook niet nodig. Omdat migraties backwards-compatible zijn, kan de applicatie zelfstandig worden teruggerold en hoeft het schema daarvoor niet mee terug.
- **Laatste vangnet.** Een migratie die data corrumpeert of niet transactioneel terug te draaien is, valt buiten wat Flyway kan herstellen. Herstel loopt dan via een restore van de periodieke back-up van het hostingplatform; het dataverlies is begrensd door het back-upinterval. Dit herstel is tool-onafhankelijk en zou ook bij Liquibase nodig zijn.

## Alternatieven

- **Liquibase.** Volwaardig alternatief met een eersteklas Quarkus-extensie. Op functionaliteit biedt Liquibase meer dan Flyway OSS: de rollback-functionaliteit zit in de open source versie en draait een changeset terug inclusief het bijwerken van de eigen administratie (`DATABASECHANGELOG`), waar `flyway undo` een betaalde editie vereist. Daarnaast kent Liquibase preconditions en contexts/labels; Flyway OSS heeft daarvoor alleen `locations` en placeholders. Ook op het schema lopen de tools minder uiteen dan vaak wordt aangenomen: met formatted-SQL-changelogs blijft de gereviewde tekst gelijk aan de uitgevoerde tekst, en zijn `CREATE EXTENSION` en partiële indexen gewoon SQL.

  De doorslag geeft het gedrag van de migratielock, omdat migraties bij het starten van de pod draaien. Flyway neemt daarvoor een session-level advisory lock in PostgreSQL: valt de verbinding weg, dan geeft de database de lock direct vrij en kan een volgende pod verder. Liquibase legt de lock vast als rij in `DATABASECHANGELOGLOCK`. Een pod die tijdens de migratie wordt afgebroken laat die rij staan, waarna elke volgende start blijft wachten tot iemand de rij met de hand verwijdert. Bij een rolling update op Kubernetes moet een afgebroken pod zonder handmatige actie op productie kunnen worden opgevolgd, en dat verschil is hier zwaarwegender dan het functionele voordeel van Liquibase.

  Voor een halverwege gefaalde migratie zijn beide tools gelijkwaardig; dat herstel leunt in beide gevallen op transactionele DDL (zie Foutafhandeling en herstel). Voor het terugdraaien van een geslaagde migratie biedt Liquibase meer, al maken forward-only en expand/contract dat geval klein.

  De afweging kantelt als migraties niet langer bij applicatiestart draaien maar als aparte stap vóór de rollout, want het lock-gedrag weegt dan minder zwaar. Datzelfde geldt bij een tweede database-engine of bij behoefte aan preconditions en omgevingsspecifieke migraties.
- **`hibernate.schema-management=update` als migratiemechanisme handhaven.** Afgewezen: schemawijzigingen staan dan nergens als reviewbare tekst, de volgorde waarin ze zijn toegepast is niet vast te stellen, en het schema volgt uit de entities van de draaiende versie in plaats van uit een vastgelegde reeks stappen. Dat is iets anders dan de `update` die op acceptatie en productie na Flyway draait: daar is de reeks migraties leidend en overbrugt `update` alleen de resterende drift.
- **`hibernate.schema-management=create-drop` voor dev, geen prod-pad.** Afgewezen omdat het de prod-vraag onbeantwoord laat en evolutie van bestaande databases onmogelijk maakt.

## Consequences

- Iedere schemawijziging gaat via een nieuwe `Vn__*.sql`. Reviewers zien letterlijk de SQL die uitgevoerd wordt.
- `quarkus.hibernate-orm.schema-management.strategy=validate` legt drift tussen JPA-entities en het echte schema vroeg bloot. Deze vangrail werkt in dev en in elke testrun; acceptatie en productie staan tijdens de PoC-fase nog op `update`.
- Iedere testrun voert de echte migratiescripts uit tegen een echte PostgreSQL. Een fout in een migratie of drift tussen entities en migraties breekt daardoor de testrun, en database-afgedwongen invarianten (zoals de partial unique index op maximaal één default contactgegeven per partij en type) zijn met tests afgedekt.
- Column-level encryption van `IDENTIFICATIE.IdentificatieNummer` en `CONTACTGEGEVEN.Waarde` en de BSNk-pseudonimisering vallen buiten V1. Beide zijn beschreven in `09-infrastructuur-architectuur.md`.

## Verwijzingen

- [§08 Data](../profielservicedocs/08-data.md)
- [§09 Infrastructuurarchitectuur](../profielservicedocs/09-infrastructuur-architectuur.md)
