# 19. Database migratiestrategie

Datum: 2026-05-19

## Status

Proposed

## Context

De Profiel Service draaide tot nu toe met `quarkus.hibernate-orm.schema-management.strategy=update`. Hibernate genereert en muteert dan zelf de tabellen op basis van de JPA-entities. Voor lokale ontwikkeling werkt dat, maar voor reproduceerbare deploys is het ongeschikt: schemawijzigingen zijn niet in git zichtbaar, kunnen niet worden gereviewd, en kunnen niet betrouwbaar op acceptatie of productie worden gespeeld. Dat is in strijd met BIO-eisen rond change management en met de uitgangspunten van NeRDS.

Tegelijk is het gegevensmodel van de Profiel Service substantieel herzien (zie `08-data.md` en `09-infrastructuur-architectuur.md`). Dit is het natuurlijke moment om een migratietool in te voeren, een eerste migratiescript te leveren, en hibernate over te zetten naar `validate`.

De andere Quarkus-services binnen MOZa volgen later hetzelfde patroon. `moza-omc` (C# .NET) gebruikt EF Core Migrations en valt buiten de scope van deze ADR.

## Decision

We kiezen voor **Flyway**, geconfigureerd via de `quarkus-flyway` extensie.

- Migraties worden geschreven als SQL-scripts onder `src/main/resources/db/migration/`, met de Flyway-naamgevingsconventie `V{volgnummer}__{omschrijving}.sql`.
- `quarkus.hibernate-orm.database.generation` staat op `validate`. Bij applicatiestart wordt het schema vergeleken met de JPA-entities; afwijkingen leiden tot directe boot-fout.
- In dev/test draaien migraties automatisch bij applicatiestart (`quarkus.flyway.migrate-at-start=true`).
- In productie staat `migrate-at-start` op `false`. Migraties draaien daar als een aparte, pipeline-gestuurde stap vóór de app-rollout (een CI/CD-stage of een door de deploy aangeroepen Kubernetes Job), zonder handmatige tussenkomst van een DBA. Dat voorkomt race condities tussen pods, maakt migrate-failures expliciet, en laat migraties met een aparte DB-rol met DDL-rechten draaien terwijl de app zelf met een minder geprivilegieerde rol draait (least-privilege, BIO-vriendelijk). De exacte plaatsing (een runner die rechtstreeks met de database verbindt versus een Job in het cluster) hangt af van de netwerkscheiding en bepalen we zodra we toegang tot de omgeving hebben.
- We werken **forward-only**: een fout of een gewenste terugdraaiing wordt afgehandeld met een nieuwe corrigerende migratie (`Vn+1`), niet met `flyway undo`. Hoe herstel en terugdraaien precies werken staat onder Foutafhandeling en herstel.
- V1 is het volledige doelmodel vanaf een lege database. Er is geen historische baseline, omdat alle bestaande dev-databases mogen worden weggegooid (greenfield-fase).
- Tests draaien standaard op Quarkus dev services PostgreSQL (Testcontainers). H2 blijft als afhankelijkheid beschikbaar voor lokaal experimenteren maar wordt niet meer als testprofiel gebruikt, omdat het PostgreSQL-specifieke features (partial unique index, `pgcrypto`, `gen_random_uuid()`) niet ondersteunt.

## Foutafhandeling en herstel

Migraties worden vanuit de pipeline uitgevoerd en, waar nodig, teruggedraaid, zonder handmatige tussenkomst van een DBA. Dat werkt als volgt:

- **Gefaalde migratie.** PostgreSQL ondersteunt transactionele DDL en Flyway draait elke migratie in één transactie. Een migratie die faalt wordt daardoor in zijn geheel teruggedraaid; het schema blijft op de vorige versie en raakt niet half-toegepast. Omdat de migratie als aparte stap vóór de app-rollout draait, breekt een fout de uitrol af terwijl de draaiende app op het ongewijzigde schema blijft werken: geen downtime, wel een zichtbaar gefaalde deploy. Niet-transactionele statements (zoals `CREATE INDEX CONCURRENTLY`) vermijden we in reguliere migraties of isoleren we in een eigen migratie.
- **Gecontroleerde terugdraaiing.** Een reeds toegepaste migratie draaien we terug met een nieuwe forward-migratie (`Vn+1`) die de wijziging ongedaan maakt; die loopt via dezelfde pipeline als elke andere migratie. We gebruiken hiervoor geen `flyway undo` (een betaalde Flyway-functie); bij forward-only is dat ook niet nodig.
- **Laatste vangnet.** Vóór een productiemigratie wordt een backup/snapshot gemaakt, zodat point-in-time restore mogelijk is als een migratie data corrumpeert of niet transactioneel terug te draaien is. Dit herstel is tool-onafhankelijk en zou ook bij Liquibase nodig zijn. Het concrete backup-mechanisme en de RPO/RTO bepalen we zodra we toegang tot de omgeving hebben.

## Alternatieven

- **Liquibase.** Volwaardig alternatief met een eersteklas Quarkus-extensie en functies die het gratis Flyway niet biedt: declaratieve rollback, preconditions, contexts/labels en een DB-agnostisch changelog. Toch kiezen we Flyway, omdat juist die onderscheidende functies in onze situatie geen praktische waarde toevoegen: we richten ons op één database-engine (PostgreSQL), en we werken bewust forward-only, waardoor declaratieve rollback (de belangrijkste meerwaarde van Liquibase) niet wordt gebruikt. Liquibase's rollback lost bovendien niet het scenario van een halverwege gefaalde migratie op; dat herstel leunt bij beide tools op transactionele DDL en backup/restore (zie Foutafhandeling en herstel). Voor onze use case zijn de tools daarmee functioneel gelijkwaardig en geeft de lagere conceptuele overhead van Flyway met plain-SQL-migraties de doorslag.
- **`hibernate.schema-management=update` handhaven.** Afgewezen wegens niet-reproduceerbaarheid, geen audit trail, niet-veilig voor productie.
- **`hibernate.schema-management=create-drop` voor dev, geen prod-pad.** Afgewezen omdat het de prod-vraag onbeantwoord laat en evolutie van bestaande databases onmogelijk maakt.

## Consequences

- Iedere schemawijziging gaat via een nieuwe `Vn__*.sql`. Reviewers zien letterlijk de SQL die uitgevoerd wordt.
- `hibernate.database.generation=validate` legt drift tussen JPA-entities en het echte schema vroeg bloot.
- Productie-deploys vereisen een aparte migratie-stap in de pipeline. Initiële implementatie volgt in een vervolgstory.
- Tests vereisen een Docker-runtime voor Testcontainers. GitHub Actions ubuntu-runners hebben dat standaard.
- Column-level encryption van `IDENTIFICATIE.IdentificatieNummer` en `CONTACTGEGEVEN.Waarde`, en de BSNk-pseudonimisering, worden in vervolgmigraties geleverd. Beide zijn beschreven in `09-infrastructuur-architectuur.md`.
- Hibernate Envers is in V1 tijdelijk uitgeschakeld (`quarkus.hibernate-envers.active=false`). Een vervolgmigratie (V2) voegt de `*_aud`-tabellen en `revinfo` toe, daarna wordt Envers weer aangezet. Tot die tijd hebben de `@Audited`-annotaties op de entiteiten geen runtime-effect. Wie Envers eerder activeert vóórdat V2 is gedraaid loopt tegen schema-validatie-fouten aan bij applicatiestart.

## Verwijzingen

- [§08 Data](../profielservicedocs/08-data.md)
- [§09 Infrastructuurarchitectuur](../profielservicedocs/09-infrastructuur-architectuur.md)
