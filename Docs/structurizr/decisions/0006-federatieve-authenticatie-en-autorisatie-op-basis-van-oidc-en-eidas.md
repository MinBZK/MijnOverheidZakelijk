# 6. Federatieve Authenticatie en Autorisatie op basis van OpenID Connect en eIDAS 2.0

Date: 2025-10-27

## Status

Proposed

## Context

### Doel

Een federatieve architectuur voor authenticatie en autorisatie van gebruikers (DigiD / eHerkenning / eIDAS), waarmee rechtstreeks geauthenticeerd kan worden bij individuele services - zoals de Profiel Service, Berichten Services, MijnServices etc - met eenduidige trust- en token-flows die aansluiten op eIDAS 2.0 en OpenID Connect.

Het document beschrijft:

- Componenten en rollen
- Schematische architectuur (flowdiagram)
- Sequence diagram (met voorbeeld JWT-claims en HTTP-calls)
- Token- en trustmechanismen (OIDC, JWT, JWKS, aud, iss, acr)
- Security- en privacy-overwegingen
- Management-samenvatting (A4)

## Kerncomponenten

- **Gebruiker (Burger / Bedrijf)** – eindgebruiker die zich authenticeert met DigiD, eHerkenning of eIDAS.
- **Client (Portal / Mobile / SPA)** – applicatie die namens de gebruiker API-calls doet naar Berichten Services.
- **Identity Provider (IdP)** – OIDC en eIDAS-compatible of nationale IdP (DigiD/eHerkenning). Biedt ID Token, Access Token, JWKS.
- **Federation Trust Registry / Metadata Service** – centrale of federatieve trustlijst met IdP’s, clients en services.
- **Token Exchange / Gateway (optioneel)** – wisselt tokens om voor resource-specifieke tokens ([RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html)).
- **Berichten Service (Resource Server)** – valideert tokens en bepaalt autorisatie.
- **Policy Engine (OPA/XACML)** – beoordeelt toegangsregels.

## Architectuurdiagram

Er zijn verschillende mogelijkheden om op federatieve wijze toegang tot services te verlenen, waarvan twee hoofdopties (beiden eIDAS 2.0 compliant);

### Optie 1: Resource Server vertrouwt direct op de IdP (klassieke OIDC)

Klassieke OIDC validatie met trusts tussen elke Berichten Service en een centrale IdP. De *Token Exchange Service* (TE) vraagt een nieuw access token aan bij dezelfde IdP, maar dan met:

- een andere `aud` (audience): de URI van de specifieke Berichten Service;
- een beperkte `scope`

De Berichten Service (BSA / BSB) doet daarna:

- Controleer de signature van het token via de JWKS van de IdP
- Controleer of `aud` overeenkomt met zijn eigen identifier
- Controleer `exp`, `iss` en optioneel `azp` (authorized party)
- Daarna autorisatie via de **Policy Engine**

> **TLDR**; Dit is eenvoudig, omdat alle Resource Servers de centrale IdP vertrouwen

```mermaid
flowchart LR
  subgraph GebruikerSide["Gebruiker & Client"]
    U[Gebruiker]
    C[Client]
  end

  subgraph IdP["Identity Provider"]
    IdPMain["OpenID Connect IdP<br/>(DigiD/eHerkenning/eIDAS)"]
    JWKS[(JWKS Endpoint)]
  end

  subgraph Federation["Federation Layer"]
    TE[Token Exchange Service]
    PE[Policy Engine]
  end

  subgraph Resources["Berichten Services"]
    B1[Berichten Service A]
    B2[Berichten Service B]
  end

  %% --- Authentication & Token Issuance ---
  U -->|Login via browser redirect| IdPMain
  C -->|OIDC Auth Code Flow + PKCE| IdPMain
  IdPMain -->|ID Token + Access Token| C

  %% --- Resource Access ---
  C -->|Bearer Access Token| B1
  C -->|Bearer Access Token| B2

  %% --- Optional Token Exchange ---
  C -->|"Token Exchange Request (RFC 8693)"| TE
  TE -->|Validate subject_token| IdPMain
  TE -->|"Issue resource-scoped token (aud = BS-A/BS-B)"| C

  %% --- Validation & Authorization ---
  B1 -->|Validate token via JWKS| IdPMain
  B2 -->|Validate token via JWKS| IdPMain
  B1 -->|Authorization decision| PE
  B2 -->|Authorization decision| PE
```

### Optie 2: Federatieve validatie (trust via Trust Registry)

In een meer *federatieve* opzet (zoals eIDAS 2.0 en conform GDI) is er geen directe koppeling tussen elke Berichten Service en een centrale IdP, maar een Trust Registry die de services vertrouwen:

- De *Trust Registry* (TR) houdt biju welke issuers geldig zijn en hun JWKS locaties.
- Een Resource Server (zoals de Berichten Service) hoeft de IdP niet rechtstreeks te kennen; ze haalt de *issuer metadata* (inclusief JWKS URL) uit de Trust Registry
- Vervolgens valideert de Resource Server het token zelf (signature & claims)
- De *Trust Registry* kan optioneel caching en key rollover afhandelen

> **TLDR**; Dit model maakt het mogelijk dat meerdere IdP's meedoen in de federatie, zonder centrale afhankelijkheid


```mermaid
flowchart LR
  subgraph GebruikerSide["Gebruiker & Client"]
    U[Gebruiker]
    C[Client]
  end

  subgraph IdP["Identity Provider"]
    IdPMain["OpenID Connect IdP<br/>(DigiD/eHerkenning/eIDAS)"]
    JWKS[(JWKS Endpoint)]
  end

  subgraph Federation["Federation Layer"]
    TR[Trust Registry / Metadata Service]
    TE[Token Exchange Service]
    PE[Policy Engine]
  end

  subgraph Resources["Berichten Services"]
    B1[Berichten Service A]
    B2[Berichten Service B]
  end

  %% --- Authentication & Token Issuance ---
  U -->|Login via browser redirect| IdPMain
  C -->|OIDC Auth Code Flow + PKCE| IdPMain
  IdPMain -->|ID Token + Access Token| C

  %% --- Resource Access via Federation ---
  C -->|"Token Exchange Request (RFC 8693)"| TE
  TE -->|Validate subject_token| IdPMain
  TE -->|"Issue resource-scoped token (aud = BS-A/BS-B)"| C

  %% --- Trust Registry Distribution ---
  TR -->|Publishes issuer metadata + JWKS URLs| B1
  TR -->|Publishes issuer metadata + JWKS URLs| B2
  TR -->|Publishes issuer metadata + JWKS URLs| TE

  %% --- Token Validation ---
  C -->|Bearer Resource Token| B1
  C -->|Bearer Resource Token| B2
  B1 -->|"Validate signature using JWKS (from TR)"| IdPMain
  B2 -->|"Validate signature using JWKS (from TR)"| IdPMain

  %% --- Authorization ---
  B1 -->|Authorization decision| PE
  B2 -->|Authorization decision| PE

```

## Sequence diagram (optie 2)

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant C as Client (SPA / Portal)
  participant IdP as Identity Provider (DigiD/eHerkenning/eIDAS)
  participant FR as Trust Registry
  participant BS as Berichten Service

  U->>C: Navigeert naar client
  C->>IdP: Authorization Code Flow (OIDC + PKCE)
  IdP->>C: Authorization Code
  C->>IdP: Token Request (code, verifier)
  IdP->>C: ID Token + Access Token (JWT)
  C->>BS: GET /api/messages (Authorization: Bearer <token>)
  BS->>FR: Vraag trusted issuers (metadata)
  BS->>IdP: Haal JWKS en valideer handtekening
  BS->>BS: Autorisatie via Policy Engine (OPA)
  BS-->>C: JSON Response met berichtenlijst
```

**Voorbeeld Access Token (JWT payload):**

```json
{
  "iss": "https://login.mijnoverheid.nl",
  "aud": ["https://berichten.belastingdienst.nl"],
  "sub": "urn:person:NL:BSN:999999999",
  "acr": "urn:etoegang:core:assurance-class:loa4",
  "scope": "messages.read",
  "exp": 1730100000,
  "iat": 1730096400,
  "client_id": "mijnoverheid-app",
  "consent": true
}
```

**Voorbeeld HTTP-aanroep:**

```http
GET /api/messages HTTP/1.1
Host: berichten.belastingdienst.nl
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

---

## Management-samenvatting (A4)

### Doel

Het federatief berichtenmagazijn maakt het mogelijk dat burgers en bedrijven **rechtstreeks** hun berichten kunnen ophalen bij overheidsorganisaties, zonder centrale bottleneck. De gebruiker logt veilig in via DigiD, eHerkenning of eIDAS, waarna zijn identiteit met beveiligde tokens wordt doorgegeven aan de afzonderlijke Berichten Services.

### Waarom federatief?

* **Schaalbaarheid:** geen centrale berichtenhub die alles aggregeert.
* **Autonomie:** elke organisatie behoudt beheer over eigen berichten en beleid.
* **Veiligheid:** tokens en trust worden cryptografisch gevalideerd via eIDAS-standaarden.
* **Europese interoperabiliteit:** sluit aan op eIDAS 2.0 en toekomstige European Digital Identity Wallets.

### Hoe werkt het?

1. De gebruiker logt in via een erkende IdP (DigiD, eHerkenning, eIDAS).
2. De applicatie ontvangt een digitaal ondertekend toegangstoken.
3. Dit token wordt gebruikt om direct de Berichten Services van deelnemende organisaties aan te roepen.
4. Elke service valideert de handtekening en controleert of de gebruiker bevoegd is.
5. De response (berichtenlijst of notificatie) wordt direct aan de gebruiker getoond.

### Belangrijkste bouwstenen

| Component                   | Beschrijving                                                                     |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Identity Provider (IdP)** | Zorgt voor betrouwbare inlog en identiteitsverklaring (DigiD/eHerkenning/eIDAS). |
| **Trust Registry**          | Beheert welke IdP’s, clients en services elkaar vertrouwen.                      |
| **Berichten Service**       | Verwerkt de berichtenaanvragen en valideert tokens.                              |
| **Policy Engine**           | Past regels toe (wie mag wat zien).                                              |
| **Token Exchange**          | (Optioneel) maakt tokens geldig voor specifieke services.                        |

### Veiligheidsprincipes

* Alleen ondertekende tokens van erkende IdP’s.
* Geen centrale opslag van persoonsgegevens.
* Transparant en controleerbaar via federatief trustmodel.
* Aansluitend op eIDAS 2.0 LoA- en metadata-standaarden.

### Conclusie

Deze federatieve aanpak combineert **veiligheid**, **autonomie** en **interoperabiliteit**. Het is een toekomstvaste oplossing die volledig aansluit bij eIDAS 2.0 en de European Digital Identity-architectuur, zonder centrale kwetsbaarheden of schaalproblemen.

---

## Mogelijke vervolgstappen

* Definieer Trust Registry API en governance-model.
* Maak proof-of-concept met 2 Berichten Services, één IdP en tokenvalidatie.
* Test met eHerkenning LoA_HIGH en eIDAS cross-border login.
* Documenteer metadata-profielen volgens eIDAS 2.0 schema's.
