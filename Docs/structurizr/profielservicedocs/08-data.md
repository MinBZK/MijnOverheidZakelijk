## Data

### Gegevensmodel

Het gegevensmodel van de ProfielService is opgebouwd rond de entiteiten **PARTIJ** en **CONTACTGEGEVEN**.

1. **PARTIJ** is de basis van een natuurlijke persoon of rechtspersoon. Een partij kan één of meerdere identificaties hebben, zoals BSN, KVK, RSIN of andere vormen van identificatie. Zowel personen als ondernemingen zijn een PARTIJ.
2. **CONTACTGEGEVEN** legt vast hoe en via welk kanaal een partij gecontacteerd kan worden door een dienst of organisatie. Een contactgegeven kan optioneel gekoppeld worden aan een **SCOPE**, waarmee wordt vastgelegd voor welke onderneming (PARTIJ) en/of welke dienst van een dienstverlener (DIENST) het contactgegeven geldt.

Hiermee kunnen burgers en ondernemers vastleggen hoe zij gecontacteerd willen worden, bijvoorbeeld via e-mail of telefoon. Een ondernemer die meerdere bedrijven beheert kan per bedrijf verschillende contactgegevens en voorkeuren opslaan, terwijl het bedrijf (als PARTIJ) slechts één keer in de database voorkomt.

Ter ondersteuning van deze kernfunctionaliteit zijn vijf aanvullende entiteiten toegevoegd: **IDENTIFICATIE**, **VOORKEUR**, **SCOPE**, **DIENSTVERLENER** en **DIENST**.

Een **CONTACTGEGEVEN** of **VOORKEUR** kan nul of meer **SCOPE**s hebben. Een scope bakent af voor welke dienst en/of partij het contactgegeven of de voorkeur geldt; ontbreekt een scope, dan geldt het contactgegeven of de voorkeur als standaard voor alle diensten. Hierdoor kan eenzelfde waarde (bijvoorbeeld een e-mailadres) één keer worden vastgelegd en aan meerdere diensten worden gekoppeld zonder duplicatie.

Hieronder volgt een tabel met de definities die wij hanteren voor deze entiteiten.


#### PARTIJ

| Attribuut  | Omschrijving                    |
|------------|---------------------------------|
| **PARTIJ** |                                 |
| Id         | Unieke identificator van PARTIJ |


#### CONTACTGEGEVEN

| Attribuut               | Omschrijving                                                                 |
|-------------------------|------------------------------------------------------------------------------|
| **CONTACTGEGEVEN**      |                                                                              |
| Id                      | Unieke identificator van contactgegeven                                      |
| PartijId                | Identificator van de PARTIJ die eigenaar is van dit contactgegeven           |
| ContactType             | Het soort contactgegeven: `Email`, `Telefoonnummer`, `Adres` of `AppId`      |
| Waarde                  | De opgegeven contactwaarde (bijv. mailadres of telefoonnummer)               |
| IsValid                 | Of het contactgegeven syntactisch geldig is bevonden                         |
| GeverifieerdAt          | Tijdstip waarop het contactgegeven is geverifieerd; leeg als nog niet geverifieerd |
| VerificatieReferentieId | Referentie naar de lopende verificatieaanvraag (alleen relevant voor Email)  |
| CreatedAt               | Tijdstip van aanmaken                                                        |
| LastUpdated             | Tijdstip van laatste wijziging                                               |
| LastUsedAt              | Tijdstip waarop het contactgegeven voor het laatst is opgehaald              |

#### IDENTIFICATIE

| Attribuut           | Omschrijving                                                                                       |
|---------------------|----------------------------------------------------------------------------------------------------|
| **IDENTIFICATIE**   |                                                                                                    |
| PartijId            | Verwijzing naar de PARTIJ aan wie deze IDENTIFICATIE toebehoort                                    |
| IdentificatieType   | Wijze waarop PARTIJ uniek kan worden geïdentificeerd: BSN, KVK, RSIN of ander identificatiesysteem |
| IdentificatieNummer | Nummer waarmee PARTIJ uniek identificeerbaar is binnen het opgegeven IdentificatieType             |

#### VOORKEUR

| Attribuut    | Omschrijving                                                                                                |
|--------------|-------------------------------------------------------------------------------------------------------------|
| **VOORKEUR** |                                                                                                             |
| Id           | Unieke identificator van voorkeur                                                                           |
| PartijId     | Verwijzing naar de PARTIJ waarvoor de voorkeur geldt                                                        |
| VoorkeurType | Het type voorkeur (enum): `WebsiteTaal`, `MagGebeldWorden`, `WebsiteThema`, `Aanhef`, `OntvangViaBerichtenbox` |
| Waarde       | De waarde van de voorkeur, afhankelijk van het VoorkeurType                                                 |
| CreatedAt    | Tijdstip van aanmaken                                                                                       |
| LastUpdated  | Tijdstip van laatste wijziging                                                                              |
| LastUsedAt   | Tijdstip waarop de voorkeur voor het laatst is opgehaald                                                    |

##### VoorkeurTypes

| VoorkeurType            | Omschrijving                                                                                  |
|-------------------------|-----------------------------------------------------------------------------------------------|
| WebsiteTaal             | Taalvoorkeur voor communicatie en weergave (bijv. `nl`, `en`)                                 |
| MagGebeldWorden         | Of de partij gebeld mag worden                                                                |
| WebsiteThema            | Thema/weergavevoorkeur voor de website                                                        |
| Aanhef                  | Aanhef die gebruikt mag worden bij contact met de partij (bijv. "Dhr. Jansen")                |
| OntvangViaBerichtenbox  | Of de partij berichten via de Berichtenbox wil ontvangen                                      |

#### SCOPE

Een SCOPE bakent af voor welke DIENST en/of PARTIJ een CONTACTGEGEVEN of VOORKEUR geldt. Een scope hoort bij precies één CONTACTGEGEVEN óf één VOORKEUR (XOR). Een CONTACTGEGEVEN of VOORKEUR zonder scopes geldt als standaard voor alle diensten.

Twee scopes met dezelfde DienstId en PartijId-combinatie worden binnen één CONTACTGEGEVEN of VOORKEUR niet dubbel opgeslagen; bij een dubbele toevoeging wordt de bestaande scope hergebruikt.

| Attribuut         | Omschrijving                                                                                |
|-------------------|---------------------------------------------------------------------------------------------|
| **SCOPE**         |                                                                                             |
| Id                | Unieke identificator van scope                                                              |
| ContactgegevenId  | Verwijzing naar het CONTACTGEGEVEN waar deze scope bij hoort (XOR met VoorkeurId)           |
| VoorkeurId        | Verwijzing naar de VOORKEUR waar deze scope bij hoort (XOR met ContactgegevenId)            |
| DienstId          | Optionele verwijzing naar de DIENST waarop de scope betrekking heeft                        |
| PartijId          | Optionele verwijzing naar de PARTIJ waarvoor de scope geldt (bijvoorbeeld een organisatie)  |


#### DIENSTVERLENER

| Attribuut          | Omschrijving                            |
|--------------------|-----------------------------------------|
| **DIENSTVERLENER** |                                         |
| Id                 | Unieke identificator van DIENSTVERLENER |
| Naam               | Naam van de dienstverlener              |


#### DIENST

| Attribuut        | Omschrijving                       |
|------------------|------------------------------------|
| **DIENST**       |                                    |
| Id               | Unieke identificator van de dienst |
| DienstverlenerId | Verwijzing naar DIENSTVERLENER     |
| Beschrijving     | Beschrijving van de dienst         |


#### Logboek Dataverwerkingen (LDV)

Naast de hierboven beschreven entiteiten slaat de Profiel Service logregels op conform de [Logboek Dataverwerkingen standaard](https://logius-standaarden.github.io/logboek-dataverwerkingen/#interface). Wanneer een trace bij de Profiel Service begint (de Profiel Service is de initiërende dienst), wordt een identificerend nummer van de betrokkene opgeslagen in de LDV-attributen. De volgende attributen worden per logregel vastgelegd:

| Attribuut | Omschrijving |
|-----------|-------------|
| `dpl.core.processing_activity_id` | URI naar het verwerkingsactiviteitenregister met informatie over de verwerking |
| `dpl.core.data_subject_id` | Identificerend nummer van de betrokkene |
| `dpl.core.data_subject_id_type` | Type identificatiecode |
| `dpl.core.foreign_operation.processor` | URL naar externe applicatie |

Daarnaast worden de overige door de LDV-standaard vereiste velden (zoals `trace_id`, `span_id`, `start_time` en `end_time`) automatisch door de tracing-infrastructuur gevuld; de tabel hierboven beschrijft de attributen die de Profiel Service zelf invult.

Hiermee is elke verwerking van persoonsgegevens herleidbaar naar de betrokken persoon.

Het onderstaande diagram geeft de structuur van het gegevensmodel weer, inclusief de relaties tussen PARTIJ, VOORKEUR, CONTACTGEGEVEN, DIENSTVERLENER, en DIENST.

![Gegevensmodel](./images/ArchitectuurProfielService/Gegevensmodel.png "Gegevensmodel")

<details>
  <summary>Zie mermaid code</summary>
  
    erDiagram
        PARTIJ {
            int Id PK "NOT NULL"
        }

        CONTACTGEGEVEN {
            int Id PK "NOT NULL"
            int PartijId FK "NOT NULL"
            enum ContactType "NOT NULL"
            text Waarde "NOT NULL"
            bool IsValid "NOT NULL"
            datetime GeverifieerdAt ""
            text VerificatieReferentieId ""
            datetime CreatedAt "NOT NULL"
            datetime LastUpdated "NOT NULL"
            datetime LastUsedAt ""
        }

        VOORKEUR {
            int Id PK "NOT NULL"
            int PartijId FK "NOT NULL"
            enum VoorkeurType "NOT NULL"
            text Waarde "NOT NULL"
            datetime CreatedAt "NOT NULL"
            datetime LastUpdated "NOT NULL"
            datetime LastUsedAt ""
        }

        SCOPE {
            int Id PK "NOT NULL"
            int ContactgegevenId FK "XOR met VoorkeurId"
            int VoorkeurId FK "XOR met ContactgegevenId"
            int DienstId FK ""
            int PartijId FK ""
        }

        IDENTIFICATIE {
            int PartijId PK,FK "NOT NULL"
            enum IdentificatieType PK "NOT NULL"
            text IdentificatieNummer PK "NOT NULL"
        }

        DIENSTVERLENER {
            int Id PK "NOT NULL"
            string Naam "NOT NULL"
        }

        DIENST {
            int Id PK "NOT NULL"
            int DienstverlenerId FK "NOT NULL"
            string Beschrijving ""
        }

        %% Relationships
        PARTIJ ||--|{ IDENTIFICATIE : "PartijId"
        PARTIJ ||--o{ VOORKEUR : "PartijId"
        PARTIJ ||--o{ CONTACTGEGEVEN : "PartijId"
        CONTACTGEGEVEN ||--o{ SCOPE : "ContactgegevenId"
        VOORKEUR ||--o{ SCOPE : "VoorkeurId"
        DIENST ||--o{ SCOPE : "DienstId"
        PARTIJ ||--o{ SCOPE : "PartijId"
        DIENSTVERLENER ||--|{ DIENST : "DienstverlenerId"

</details>

#### Data Transfer Object (DTO)

Wanneer de profiel-service wordt bevraagd op een partij (`GET /api/profielservice/v1/{identificatieType}/{identificatieNummer}`), levert de response onderstaande structuur. Iedere `contactgegeven` en `voorkeur` bevat een `scopes`-lijst; een lege lijst betekent dat het contactgegeven of de voorkeur als standaard geldt voor alle diensten.

**YAML**

```yaml
partijId: 1
identificaties:
  - identificatieType: KVK
    identificatieNummer: "12345678"
contactgegevens:
  - id: 101
    type: Email
    waarde: contact@bedrijf.nl
    isGeverifieerd: true
    isValid: true
    createdAt: "2026-04-01T09:15:00"
    lastUpdated: "2026-04-01T09:15:00"
    scopes: []
  - id: 102
    type: Telefoonnummer
    waarde: "0612345678"
    isGeverifieerd: false
    isValid: true
    createdAt: "2026-04-02T10:00:00"
    lastUpdated: "2026-04-02T10:00:00"
    scopes:
      - dienst:
          id: 7
          beschrijving: "Subsidieaanvraag"
voorkeuren:
  - id: 201
    voorkeurType: WebsiteTaal
    waarde: "nl"
    createdAt: "2026-04-01T09:15:00"
    lastUpdated: "2026-04-01T09:15:00"
    scopes: []
  - id: 202
    voorkeurType: OntvangViaBerichtenbox
    waarde: "true"
    createdAt: "2026-04-03T14:20:00"
    lastUpdated: "2026-04-03T14:20:00"
    scopes:
      - dienst:
          id: 7
          beschrijving: "Subsidieaanvraag"
```

**JSON**

```json
{
  "partijId": 1,
  "identificaties": [
    { "identificatieType": "KVK", "identificatieNummer": "12345678" }
  ],
  "contactgegevens": [
    {
      "id": 101,
      "type": "Email",
      "waarde": "contact@bedrijf.nl",
      "isGeverifieerd": true,
      "isValid": true,
      "createdAt": "2026-04-01T09:15:00",
      "lastUpdated": "2026-04-01T09:15:00",
      "scopes": []
    },
    {
      "id": 102,
      "type": "Telefoonnummer",
      "waarde": "0612345678",
      "isGeverifieerd": false,
      "isValid": true,
      "createdAt": "2026-04-02T10:00:00",
      "lastUpdated": "2026-04-02T10:00:00",
      "scopes": [
        { "dienst": { "id": 7, "beschrijving": "Subsidieaanvraag" } }
      ]
    }
  ],
  "voorkeuren": [
    {
      "id": 201,
      "voorkeurType": "WebsiteTaal",
      "waarde": "nl",
      "createdAt": "2026-04-01T09:15:00",
      "lastUpdated": "2026-04-01T09:15:00",
      "scopes": []
    },
    {
      "id": 202,
      "voorkeurType": "OntvangViaBerichtenbox",
      "waarde": "true",
      "createdAt": "2026-04-03T14:20:00",
      "lastUpdated": "2026-04-03T14:20:00",
      "scopes": [
        { "dienst": { "id": 7, "beschrijving": "Subsidieaanvraag" } }
      ]
    }
  ]
}
```

### Sequentiediagrammen

De volgende diagrammen illustreren de belangrijkste interacties met de ProfielService.

1. Dienstverlener bevraagt de ProfielService  
   In dit scenario vraagt een dienstverlener de contactvoorkeuren op van een ondernemer of onderneming.  
   Deze informatie kan de dienstverlener dan gebruiken om kennisgevingen en/of attenderingen correct af te kunnen leveren.

![Sequentiediagram dienstverlener bevraagd profielservice](images/ArchitectuurProfielService/SeqDVBevraagdPS.png "Sequentiediagram dienstverlener bevraagd profielservice")


<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        participant Dienstverlener
        participant Profiel as Profiel Service

        Dienstverlener->>Profiel: GET contactvoorkeuren Bsn en/of KvK
        activate Profiel
        Profiel-->>Dienstverlener: Contactvoorkeur(en) + Bsn
        deactivate Profiel

</details>

2. Ondernemer bekijkt en wijzigt contactvoorkeuren  
   Dit scenario toont hoe een ondernemer via het MOZa-portaal zijn eigen contactvoorkeuren kan inzien en aanpassen.  
   Afhankelijk van de loginmethode (bijv. DigiD of eHerkenning) worden de relevante ondernemingen opgehaald, waarna de ondernemer zijn voorkeuren per onderneming kan beheren.  
   Na het aanpassen van een voorkeur wordt deze wijziging via de ProfielService opgeslagen, en indien van toepassing geverifieerd.

![Sequentiediagram ondernemer bekijkt en update contactvoorkeuren](./images/ArchitectuurProfielService/SeqOndernemerProfiel.png "Sequentiediagram ondernemer bekijkt en update contactvoorkeuren")

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        actor Ondernemer
        participant MOZa as MOZa Portaal
        participant KvK as KvK
        participant Profiel as Profiel Service

        Ondernemer->>MOZa: Logt in
        activate MOZa

        alt Als login via DigiD
            MOZa->>KvK: Haal ondernemingen op voor BSN
            deactivate MOZa
            activate KvK
            KvK-->>MOZa: Geeft ondernemingen terug (KvK-nummers)
            deactivate KvK
            activate MOZa
        end

        MOZa->>Ondernemer: Toon Profiel Pagina
        Ondernemer->>MOZa: Opent pagina 'Contactvoorkeuren'

        MOZa->>Profiel: GET contactvoorkeuren (BSN + KvK)
        deactivate MOZa
        activate Profiel
        Profiel-->>MOZa: Contactvoorkeuren terug
        deactivate Profiel
        activate MOZa

        MOZa->>Ondernemer: Toon pagina 'Contactvoorkeuren'

        Ondernemer->>MOZa: Past contactvoorkeur aan

        MOZa->>Profiel: PUT contactgegeven (BSN + KvK)
        deactivate MOZa
        activate Profiel
        Profiel-->>MOZa: Ok (voorkeur bijgewerkt)
        deactivate Profiel
        activate MOZa

        MOZa-->>Ondernemer: Toont bevestiging
        deactivate MOZa

</details>

Deze scenario’s vormen de basis voor de interacties tussen de ProfielService, dienstverleners en eindgebruikers binnen de keten.
