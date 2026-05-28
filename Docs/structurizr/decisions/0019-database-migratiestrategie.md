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
- In productie staat `migrate-at-start` op `false`. Migraties draaien daar als aparte Kubernetes Job of init-container vóór de app-rollout. Dat voorkomt race condities tussen pods, maakt migrate-failures expliciet, en laat migraties met een aparte DB-rol met DDL-rechten draaien terwijl de app zelf met een minder geprivilegieerde rol draait (least-privilege, BIO-vriendelijk).
- We werken **forward-only**: bij een fout in een migratie wordt een corrigerende `Vn+1` toegevoegd. We gebruiken geen `flyway undo`. Bij behoefte aan terugdraaiing wordt een nieuwe forward-migratie geschreven.
- V1 is het volledige doelmodel vanaf een lege database. Er is geen historische baseline, omdat alle bestaande dev-databases mogen worden weggegooid (greenfield-fase).
- Tests draaien standaard op Quarkus dev services PostgreSQL (Testcontainers). H2 blijft als afhankelijkheid beschikbaar voor lokaal experimenteren maar wordt niet meer als testprofiel gebruikt, omdat het PostgreSQL-specifieke features (partial unique index, `pgcrypto`, `gen_random_uuid()`) niet ondersteunt.

## Alternatieven

- **Liquibase.** Eersteklas Quarkus-extensie, ondersteunt declaratieve rollback, preconditions, contexts/labels en DB-agnostieke abstracties. Afgewezen omdat de service maar één DB-engine (PostgreSQL) gebruikt, de unieke Liquibase-features (rollback, preconditions, DB-agnostiek) hier geen praktische waarde leveren, en plain SQL voor dit team beter reviewbaar is dan XML/YAML changesets.
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
