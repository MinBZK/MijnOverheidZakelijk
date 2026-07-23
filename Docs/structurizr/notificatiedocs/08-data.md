## Data

### Datastore typen

De Notificatiedienst gebruikt twee datastores:

- **PostgreSQL**
  Relationele datastore voor het Notificatieregister, de operationele bron van waarheid voor lopende notificaties.

- **ClickHouse**
  Kolom-georiënteerde datastore voor het Logboek Dataverwerking (LDV), gevuld via de LDV-wrapper conform [ADR 0005](/workspace/decisions#5) en [ADR 0010](/workspace/decisions#10).

### Datamodel

Het Notificatieregister bestaat uit één tabel, `notificatie`, aangemaakt met de Flyway-migratie `V1__init_notificatie.sql`:

| Veld                 | Type                     | Beschrijving |
|----------------------|--------------------------|--------------|
| `id`                 | UUID (PK)                | Interne sleutel |
| `external_reference` | UUID (uniek)             | Referentie van NotifyNL waarmee de delivery receipt aan de notificatie wordt gekoppeld |
| `callback_url`       | varchar(2048)            | Optionele URL waarop de aanroeper de statusterugkoppeling ontvangt |
| `status`             | varchar                  | Huidige status (zie statusmodel), afgedwongen met een check constraint |
| `aangemaakt`         | timestamp with time zone | Aanmaaktijdstip (UTC) |

Het register bevat bewust geen berichtinhoud, contactgegevens of identificerende nummers. Bij gecentraliseerde regie wordt het identificerend nummer alleen tijdens de aanroep gebruikt om de voorkeur bij de Profielservice op te halen. Voor het toekomstige contactherstel is voorzien dat het identificerend nummer met envelope-encryptie in het register wordt bewaard (zie hoofdstuk 6).

### Statusmodel

Het statusmodel volgt de afleverstatussen van NotifyNL:

| Status              | Betekenis |
|---------------------|-----------|
| `created`           | Verzoek ontvangen en geregistreerd |
| `sending`           | Geaccepteerd door NotifyNL, aflevering loopt |
| `delivered`         | Aflevering bevestigd |
| `permanent-failure` | Definitief mislukt (bijv. niet-bestaand adres) |
| `temporary-failure` | Tijdelijk mislukt (bijv. volle mailbox) |
| `technical-failure` | Technische fout; ook gebruikt voor onbekende statussen |

Een notificatie start als `created` en gaat na acceptatie door NotifyNL naar `sending`; de delivery receipt bepaalt de eindstatus. Na een succesvolle statusterugkoppeling aan de aanroeper wordt de registratie verwijderd, conform dataminimalisatie en opslagbeperking.

### Schema-beheer

| Omgeving     | Strategie | Toelichting |
|--------------|-----------|-------------|
| Ontwikkeling | Flyway bij opstarten | Migraties draaien automatisch bij het starten van de applicatie |
| Test         | Flyway op H2 | In-memory database, schema per testrun |
| Productie    | `validate` | Hibernate valideert het schema; Flyway-migraties draaien alleen wanneer dat per omgeving expliciet is geconfigureerd |

### Dataretentie en privacy

- **Persoonsgegevens**: het register en de applicatielogs bevatten geen persoonsgegevens. Identificerende nummers worden gepseudonimiseerd via HMAC-SHA256 met een geconfigureerde sleutel voordat ze naar het LDV geschreven worden.
- **Retentie**: registraties worden verwijderd zodra de afleverstatus is teruggekoppeld; het register bevat daardoor alleen lopende notificaties.
- **LDV**: verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen.
