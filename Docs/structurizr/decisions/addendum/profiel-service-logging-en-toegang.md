# Bijlage – Logging, Toegang en Doelbinding

**Onderwerp:** Logboek Dataverwerkingen (LDV), Federatief Service Contracteren (FSC) en Federatieve Toegangsverlening (FTV)  \
**Doel:** Beschrijvend kader voor juridische toetsing  \
**Doelgroep:** Juridische afdeling, privacy officers, auditors  \
**Status:** concept

---

## 1. Doel en positionering van deze bijlage

Deze bijlage beschrijft de wijze waarop **toegang tot services** en **logging van dataverwerkingen** zijn ingericht binnen het stelsel, onafhankelijk van de gekozen architectuurvariant voor de Profiel Service, Output Management Component (OMC) en eventuele andere ketencomponenten.

De beschreven inrichting is **variant-onafhankelijk** en wordt in alle scenario’s toegepast.

Deze bijlage is bedoeld om door juristen te worden beoordeeld op toereikendheid ten aanzien van doelbinding, proportionaliteit en accountability.

---

## 2. Logboek Dataverwerkingen (LDV)

### 2.1 Doel van het LDV

Het Logboek Dataverwerkingen (LDV) is een stelselvoorziening waarmee verwerkingen van persoonsgegevens **gestructureerd, uniform en ketenbreed** worden vastgelegd.

Het LDV heeft als doel om:
- inzicht te geven in welke verwerkingen plaatsvinden;
- transparantie te bieden richting toezicht en audits;
- achteraf controle mogelijk te maken op rechtmatigheid en doelgebruik.

### 2.2 Vastgelegde elementen

Per dataverwerking worden, conform de LDV-standaard, onder andere de volgende elementen vastgelegd:

- verwerkingsverantwoordelijke organisatie;
- betrokken systeem of component;
- doel van de verwerking;
- wettelijke grondslag;
- categorieën persoonsgegevens;
- betrokken actoren;
- tijdstip van verwerking.

De logging vindt plaats op ketenniveau, zodat samenhang tussen opeenvolgende verwerkingen inzichtelijk blijft.

### 2.3 Relatie tot doelbinding

Het LDV legt vast **welk doel is opgegeven bij een verwerking** en **welke gegevens daarbij zijn gebruikt**. Het LDV zelf stuurt of beperkt de verwerking niet, maar maakt deze **controleerbaar en toetsbaar**.

---

## 3. Federatieve Service Connectiviteit (FSC)

### 3.1 Doel van FSC

De FSC-standaard beschrijft hoe organisaties binnen een federatief stelsel diensten bij elkaar afnemen op basis van **contractuele afspraken**.

Toegang tot een service is uitsluitend mogelijk wanneer:
- een contract is afgesloten;
- de afnemende organisatie is geïdentificeerd;
- de afgesproken dienstverlening expliciet is vastgelegd.

### 3.2 Vastlegging van doelen in contracten

Binnen FSC kunnen contracten onder andere vastleggen:

- welke dienst wordt afgenomen;
- voor welk **doel of welke doelen** de dienst mag worden gebruikt;
- welke typen verzoeken zijn toegestaan;
- welke verantwoordelijkheden bij welke partij liggen.

Deze contracten vormen het **organisatorische en juridische kader** waarbinnen technische toegang wordt verleend.

### 3.3 Relatie tot gegevensverwerking

FSC bepaalt **wie** een dienst mag gebruiken en **onder welke voorwaarden**. Het contract fungeert daarmee als expliciete context waarbinnen gegevensverwerkingen plaatsvinden.

---

## 4. Federatieve Toegangsverlening (FTV)

### 4.1 Doel van FTV

Federatieve Toegangsverlening (FTV) beschrijft de methodiek waarmee organisaties binnen een federatief stelsel:
- elkaar herkennen;
- identiteit, rol en context betrouwbaar uitwisselen;
- toegang tot services technisch afdwingen.

FTV sluit aan op bestaande standaarden zoals OAuth2, OpenID Connect en SAML.

### 4.2 Autorisatie op basis van context

Bij service-aanroepen worden tokens gebruikt die context bevatten, zoals:

- organisatie-identiteit;
- rol of hoedanigheid;
- contractuele relatie;
- (indien van toepassing) het doel waarvoor toegang wordt gevraagd.

De ontvangende service valideert deze context voordat toegang wordt verleend.

### 4.3 Relatie tot doelbinding

FTV maakt het mogelijk om:
- toegang tot services te koppelen aan vooraf vastgelegde afspraken;
- verzoeken te weigeren wanneer context of autorisatie ontbreekt;
- per verzoek vast te stellen namens welke organisatie en binnen welke context wordt gehandeld.

---

## 5. Samenhang tussen LDV, FSC en FTV

De drie standaarden vullen elkaar aan:

- **FSC** beschrijft *wat* is afgesproken tussen organisaties;
- **FTV** borgt *dat* alleen partijen met geldige afspraken toegang krijgen;
- **LDV** legt vast *hoe* en *waarvoor* gegevens daadwerkelijk zijn verwerkt.

![Samenhang FSC, FTV, FDS en LDV](../images/adr0011-fsc-ftv-fds-ldv.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    flowchart LR
        Contract[FSC-contract]
        Token[FTV-token]
        Service[Service-aanroep]
        Log[LDV-registratie]

        Contract --> Token
        Token --> Service
        Service --> Log
    ```

</details>

Deze samenhang is in alle architectuurvarianten gelijk ingericht.

---

## 6. Afbakening van deze bijlage

Deze bijlage:
- beschrijft **niet** de interne logica van specifieke services;
- beschrijft **niet** welke doelen juridisch toelaatbaar zijn;
- bevat **geen oordeel** over proportionaliteit of rechtmatigheid.

De beoordeling of deze combinatie van maatregelen **toereikend is voor doelbinding** ligt expliciet bij de juridische toetsing.

---

## 7. Gebruik als bijlage

Deze tekst is bedoeld als:
- vaste bijlage bij architectuur- en ontwerpdocumenten;
- referentie voor DPIA’s en juridische beoordelingen;
- beschrijving van generieke, stelselbrede randvoorwaarden.

De inhoud is onafhankelijk van specifieke keuzes rondom de Profiel Service of notificatie-architectuur.