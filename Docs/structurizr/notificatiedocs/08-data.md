## Data

### Datastore typen

De Notificatiedienst gebruikt twee datastores:

- **PostgreSQL**
  Relationele datastore voor het Notificatieregister: de bron van waarheid voor notificaties, taken en het eventlog.

- **ClickHouse**
  Kolom-georiënteerde datastore voor het Logboek Dataverwerking (LDV), gevuld via de LDV-wrapper conform [ADR 0005](/workspace/decisions#5) en [ADR 0010](/workspace/decisions#10).

### Datamodel

Het Notificatieregister volgt [ADR 0024](/workspace/decisions#24): `dienstverlener` is het register uit de onboarding, de tabellen `notificatie` en `poging` zijn de bron van waarheid, `taak` draagt de bijwerkingen, `verzendbudget` de tokens per Notify-service, `event` het eventlog en `bevestiging` en `webhookpositie` de cursors per dienstverlener. Hoofdstuk 7 werkt de tabellen uit tot klassen.

| Tabel | Inhoud | Persoonsgegevens |
|---|---|---|
| `dienstverlener` | id, OIN, toegestane berichttypen, quotum, webhook-URL, bevestigingstermijn, maximale cursorleeftijd, beheerkanaal | Geen; organisatiegegevens uit de onboarding |
| `notificatie` | id, dienstverlener (`dv_id`), HMAC van de referentie met pepperversie, payload-hash, batch-id, berichttype, status, versie, laatste reden, `geldig_tot`, versleutelde ontvanger, versleutelde personalisation, gewrapte sleutel, aannametijdstip | Ontvanger en personalisation, uitsluitend versleuteld met de sleutel per notificatie |
| `poging` | id, notificatie, nummer, status, NotifyNL-id, NotifyNL-id's van duplicaten, verzendtijdstip, tijdstip uit de laatste receipt | Geen; het NotifyNL-id is een verwijzing |
| `taak` | id, soort, dienstverlener, notificatie (leeg voor taken per dienstverlener of per systeem), `due`, lease, oplopend claim-epoch, pogingenteller, trace-id, status (open of mislukt), payload | Geen; de payload bevat geen contactgegevens, nummers of berichtinhoud |
| `verzendbudget` | Notify-service, tijdvak van een minuut, resterende tokens; aangemaakt door de eerste claim in het tijdvak | Geen |
| `event` | id, transactie-id (`xid8`), tijdstip, dienstverlener, notificatie, volgnummer, van, naar, reden; gepartitioneerd op bereiken van transactie-id | Pseudoniem: herleidbaar door de dienstverlener via de notificatie-id, en daarom behandeld als persoonsgegeven |
| `bevestiging` | dienstverlener, cursor, tijdstip; de bevestiging die de dienstverlener zelf schrijft | Geen |
| `webhookpositie` | dienstverlener, leverpositie, aantal mislukkingen, gepauzeerd tot | Geen |

Het register bevat geen referentie van de dienstverlener in platte tekst en geen samengesteld bericht. Het e-mailadres uit de Profielservice wordt bij centrale regie binnen de verzendtaak opgehaald en niet opgeslagen. De sleutel per notificatie is gewrapt met een KEK uit de sleutelvoorziening van het platform; het wissen van die sleutel is de wisactie.

### Statusmodel

`notificatie.status`: `aangenomen`, `in-verzending`, `verzonden`, `bezorgd`, en terminaal `definitief-bezorgd`, `niet-bezorgbaar`, `technisch-mislukt`, `bezorgstatus-onbekend`, `verlopen` en `geannuleerd`. `bezorgd` is niet terminaal: binnen de vaststellingstermijn uit de MEBV kan een `temporary-failure` of `permanent-failure` de notificatie nog naar `verzonden`, `niet-bezorgbaar` of `verlopen` brengen; daarna maakt een vaststeltaak hem `definitief-bezorgd`. Terminale statussen zijn absorberend, met als enige uitzondering `bezorgstatus-onbekend`, dat door een laat event nog naar `bezorgd` of `niet-bezorgbaar` mag; een late `temporary-failure` of `technical-failure` wordt daar alleen op de poging vastgelegd.

`poging.status`: `gepland`, `verzonden`, `bezorgd`, `tijdelijk-mislukt`, `permanent-mislukt`, `technisch-mislukt` en `onbekend`, afgeleid van de afleverstatussen van NotifyNL (`delivered`, `temporary-failure`, `permanent-failure`, `technical-failure`). Een poging is lopend zolang haar status `verzonden` of `onbekend` is.

Elke overgang van de notificatie verhoogt de versie en schrijft een event met hetzelfde volgnummer; een databasetrigger weigert een wijziging van de versie zonder event en houdt de tabel van toegestane paren. De feed garandeert geen volgorde binnen één notificatie; de dienstverlener verwerkt per notificatie op volgnummer. De volledige overgangsregels en het toestandsdiagram staan in ADR 0024 en hoofdstuk 7.

> Stand van de implementatie: het huidige NMC (PoC-fase) heeft de tabel `notificatie` (`V1__init_notificatie.sql`, `V2__notificatie_retentie.sql`) met `id`, `versie`, `external_reference`, `callback_url` en een projectie van de laatste status (`laatste_status`, `laatste_status_tijdstip`, `laatste_status_update`), en de tabel `notificatie_status` met per notificatie de statusgeschiedenis op volgnummer, met het tijdstip van de bron (`completed_at` uit de receipt) en van de registratie. Statussen: `created`, `sending`, `delivered`, `permanent-failure`, `temporary-failure`, `technical-failure` en `onbekend`. Een nachtelijke retentiejob verwijdert notificaties waarvan de laatste statusregistratie ouder is dan de bewaartermijn, ongeacht de status, met cascade naar de geschiedenis; de statusterugkoppeling verwijdert niets. Dat model vervalt met de eerste migratie naar het ontwerp hierboven.

### Schema-beheer

| Omgeving     | Strategie | Toelichting |
|--------------|-----------|-------------|
| Ontwikkeling | Flyway bij opstarten | Migraties draaien automatisch bij het starten van de applicatie |
| Test         | Flyway bij opstarten + `validate` | PostgreSQL; migraties draaien bij het starten en Hibernate valideert het schema |
| Productie    | `validate` | Hibernate valideert het schema; Flyway-migraties draaien alleen wanneer dat per omgeving expliciet is geconfigureerd |

### Dataretentie en privacy

- **Persoonsgegevens**: contactgegevens, identificerende nummers en de waarden voor de personalisation staan uitsluitend versleuteld op de notificatierij. Het eventlog is pseudoniem en wordt als persoonsgegeven behandeld; de applicatielogs bevatten geen persoonsgegevens. Identificerende nummers worden gepseudonimiseerd via HMAC-SHA256 met een eigen pepper voordat ze naar het LDV geschreven worden; de HMAC van de referentie van de dienstverlener en het LDV-pseudoniem gebruiken verschillende peppers.
- **Sleutelbeheer**: de KEK en de peppers staan in de sleutelvoorziening van het platform en worden bij het opstarten opgehaald. Een KEK-rotatie herwrapt de sleutels per notificatie in een onderhoudstaak, zonder herversleuteling van de gegevens. Elke pepper heeft een versie die op de rij staat; een pepper wordt niet herberekend, omdat de invoer niet bewaard wordt: een nieuwe versie geldt voor nieuwe rijen, een zoekopdracht toetst tegen alle versies die nog op rijen staan, en een gecompromitteerde pepper leidt tot versneld wissen van de rijen met die versie.
- **Retentie**: de gewrapte sleutel per notificatie wordt door een wistaak gewist op een vaste termijn na de terminale status; daarna is de rij pseudoniem, en de rijen in `notificatie` en `poging` worden na de bewaartermijn van het afleverbewijs door de onderhoudstaak verwijderd. De wislatentie is gelijk aan de bewaartermijn van de back-ups. Het eventlog is gepartitioneerd op bereiken van transactie-id met de bewaartermijn van het afleverbewijs; een partitie wordt pas verwijderd nadat haar jongste event ouder is dan die termijn, en alleen als geen bevestiging of leverpositie er nog naar wijst; een cursor ouder dan de maximale cursorleeftijd van die dienstverlener telt niet meer mee. Taken worden na afronding verwijderd; afgewezen receipts worden niet opgeslagen. NotifyNL bewaart het adres en het samengestelde bericht gedurende zijn eigen bewaartermijn, vastgelegd in de verwerkersovereenkomst. De bewaartermijn van het afleverbewijs is een configuratiewaarde per omgeving totdat de wettelijke termijn is vastgesteld.
- **LDV**: verwerkingen worden vastgelegd volgens de standaard Logboek Dataverwerkingen, vanuit de taak die persoonsgegevens verwerkt of verstrekt (voorkeur ophalen, verzenden, reconciliëren, ongeldig melden, terugkoppelen), vóór de externe aanroep en onder de trace-id van de aanname.
