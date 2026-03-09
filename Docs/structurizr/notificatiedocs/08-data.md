## Data

### Datastore typen

De Notificatie Service zou gebruik maken van twee datastores, gekozen op basis van het type data dat opgeslagen wordt:

- **PostgreSQL**
  Relationele datastore voor het opslaan van notificaties, events, templates en afbeeldingen. PostgreSQL zou dienen als de operationele bron van waarheid; alle statusovergangen en berichtverwerking zouden gebaseerd worden op de database-state.

- **ClickHouse**
  Kolom-georiënteerde datastore voor het Logboek Dataverwerking (LDV). Auditgebeurtenissen zouden hierin vastgelegd worden conform [ADR 0005](/workspace/decisions#5) en [ADR 0010](/workspace/decisions#10). ClickHouse is gekozen vanwege de optimalisatie voor schrijfintensieve, append-only workloads.

### Datamodel

Het datamodel zou bestaan uit vijf hoofdentiteiten. Alle entiteiten zouden voorzien worden van Hibernate Envers audit-trails (`@Audited`), waarmee elke mutatie op entiteitniveau bijgehouden zou worden in revisietabellen.

#### Notificatie

Centrale entiteit die een notificatieverzoek representeert.

| Veld | Type | Beschrijving |
|------|------|-------------|
| `id` | Long (PK) | Automatisch gegenereerd |
| `type` | Enum (EMAIL, SMS, BRIEF) | Notificatiekanaal |
| `onderwerp` | String (max 255) | Onderwerp van de notificatie |
| `inhoud` | Text | Inhoud/body van de notificatie |
| `ontvanger` | String (max 320) | Directe ontvanger (scenario 2) |
| `kvkNummer` | String (max 8) | KVK-nummer voor profielopzoeking (scenario 8/9) |
| `status` | Enum | Huidige status (zie statusmodel) |
| `kanaalStatus` | Enum (PRIMAIR, KANAALHERSTEL) | Of primair kanaal of kanaalherstel actief is |
| `kanaalherstel` | Boolean | Of kanaalherstel gewenst is bij falen |
| `callbackUrl` | String (max 2048) | URL voor statuscallbacks |
| `idempotencyKey` | String (max 255, uniek) | Sleutel voor idempotente verwerking |
| `aantalPogingen` | Integer | Aantal verzendpogingen |
| `volgendePogingOp` | Instant | Geplande volgende poging |
| `aangemaaktOp` | Instant | Aanmaaktijdstip |
| `bijgewerktOp` | Instant | Laatste wijziging |

#### NotificatieEvent

Audit-log van statusovergangen per notificatie.

| Veld | Type | Beschrijving |
|------|------|-------------|
| `id` | Long (PK) | Automatisch gegenereerd |
| `notificatie_id` | FK → Notificatie | Gerelateerde notificatie |
| `status` | Enum | Status op moment van event |
| `beschrijving` | String (max 2000) | Beschrijving van de gebeurtenis |
| `tijdstip` | Instant | Tijdstip van het event |

#### CallbackRegistratie

Registratie van callback-afleveringen naar de aanroepende vakapplicatie.

| Veld | Type | Beschrijving |
|------|------|-------------|
| `id` | Long (PK) | Automatisch gegenereerd |
| `notificatie_id` | FK → Notificatie | Gerelateerde notificatie |
| `callbackUrl` | String | Doel-URL voor de callback |
| `afgeleverd` | Boolean | Of de callback succesvol is afgeleverd |
| `aantalPogingen` | Integer | Aantal afleveringspogingen |
| `laatstePogingOp` | Instant | Tijdstip van laatste poging |
| `aangemaaktOp` | Instant | Aanmaaktijdstip |

#### EmailTemplate

Herbruikbare email-templates met variabelenondersteuning.

| Veld | Type | Beschrijving |
|------|------|-------------|
| `id` | Long (PK) | Automatisch gegenereerd |
| `naam` | String (max 100, uniek) | Unieke naam van het template |
| `beschrijving` | String (max 500) | Beschrijving van het template |
| `onderwerp` | String (max 255) | Email-onderwerp met `{{variabele}}` placeholders |
| `inhoud` | Text | Template-body in platte tekst met placeholders |
| `headerAfbeelding` | FK → TemplateAfbeelding | Optionele header-afbeelding |
| `footerAfbeelding` | FK → TemplateAfbeelding | Optionele footer-afbeelding |
| `variabelen` | Text | Komma-gescheiden lijst van gedeclareerde variabelenamen |
| `actief` | Boolean | Of het template beschikbaar is voor gebruik |
| `aangemaaktOp` | Instant | Aanmaaktijdstip |
| `bijgewerktOp` | Instant | Laatste wijziging |

#### TemplateAfbeelding

Afbeeldingen voor gebruik in email-templates (header/footer).

| Veld | Type | Beschrijving |
|------|------|-------------|
| `id` | Long (PK) | Automatisch gegenereerd |
| `naam` | String | Naam van de afbeelding |
| `mediaType` | String | MIME-type (image/png, image/jpeg, image/gif, image/webp) |
| `data` | Byte[] (LOB, lazy) | Afbeeldingsdata (max 5 MB) |
| `aangemaaktOp` | Instant | Aanmaaktijdstip |

### Relaties

```
Notificatie 1──* NotificatieEvent       (cascade, orphanRemoval)
Notificatie 1──* CallbackRegistratie    (cascade, orphanRemoval)
EmailTemplate *──0..1 TemplateAfbeelding  (header)
EmailTemplate *──0..1 TemplateAfbeelding  (footer)
```

### Statusmodel

Notificaties zouden een gedefinieerd statusmodel doorlopen. Overgangen zouden afgedwongen worden via een state machine (`NotificatieStatus.kanOvergaanNaar()`):

| Status | Beschrijving | Toegestane externe overgangen |
|--------|-------------|-------------------------------|
| GEACCEPTEERD | Verzoek ontvangen en gevalideerd | — |
| IN_DE_WACHTRIJ | Gepubliceerd naar berichtenwachtrij | MISLUKT |
| VERZONDEN | Succesvol verstuurd via kanaaladapter | GELEVERD, MISLUKT, VERLOPEN |
| GELEVERD | Bevestiging van aflevering ontvangen | — |
| MISLUKT | Alle pogingen mislukt | — |
| VERLOPEN | Notificatie verlopen zonder aflevering | — |

### Schema-beheer

| Omgeving | Strategie | Toelichting |
|----------|----------|-------------|
| Ontwikkeling (`%dev`) | `drop-and-create` | Schema wordt bij elke start opnieuw aangemaakt |
| Test (`%test`) | `drop-and-create` | H2 in-memory, schema per testrun |
| Productie (`%prod`) | `validate` | Schema wordt alleen gevalideerd, niet gewijzigd. Migraties worden apart beheerd |

### Dataretentie en privacy

- **Persoonsgegevens in logs**: Geen PII in INFO-level logs. KVK-nummers zouden gepseudonimiseerd worden via HMAC-SHA256 met een configureerbare sleutel voordat ze naar het LDV geschreven worden.
- **Audit trail**: Hibernate Envers zou revisiehistorie bijhouden van alle entiteitmutaties in `_AUD`-tabellen.
- **LDV**: Auditgebeurtenissen zouden naar ClickHouse geschreven worden conform de LDV-specificatie. De LDV-logging zou uitschakelbaar zijn via `logboekdataverwerking.enabled`.
- **Bewaartermijnen**: Operationele data zou de retentie-eisen uit de kwaliteitseisen volgen. Exacte termijnen worden nader bepaald met de beheerpartij.

### Messaging-data

RabbitMQ-berichten zouden uitsluitend het notificatie-ID (Long) bevatten. De database zou dienen als bron van waarheid; de consumer zou de volledige entiteit laden bij verwerking. Dit voorkomt dat gevoelige gegevens in de berichtenwachtrij terechtkomen en maakt idempotente verwerking mogelijk.
