## Functioneel overzicht

### Inleiding

Dit hoofdstuk bouwt voort op de context en verwijst naar aanvullende documentatie en diagrammen.
Het biedt kort en duidelijk inzicht in wat de Notificatie Service doet, voor wie het dat doet en hoe de belangrijkste informatiestromen lopen.

### Overzicht

De Notificatie Service biedt één generieke voorziening waarmee overheidsorganisaties notificaties (attenderingen/kennisgevingen) kunnen aanmaken, routeren en afleveren via meerdere kanalen (o.a. e‑mail, sms, push en toekomstige kanalen). 
De service schermt kanaalspecifieke verschillen af, respecteert voorkeuren en doelbinding.

Wat het systeem feitelijk doet, is notificatieverzoeken betrouwbaar aannemen, verrijken, en afleveren, met observatie op status en foutafhandeling. 
Belangrijke gebruikers en hun behoeften zijn:
- Dienstverlener/Vakapplicaties: via API een notificatie kunnen aanmaken, met feedback over (tussen)status en eindresultaat.
- Kanaalproviders/voorzieningen: gestandaardiseerde aansturing en terugmeldingen via uniforme contracten.


#### Kernfunctionaliteiten in het kort:
- Notificaties aanmaken: API voor het registreren van een notificatieverzoek met metadata (template, correlatie‑ID).
- Routering en aflevering: aanbieden aan het juiste kanaal of provider; ondersteunen van meerdere providers en failover.
- Status & callbacks: vastleggen van (tussen)statussen; callbacks/webhooks naar de aanroeper; idempotente statusupdates.
- Retries & dead‑lettering: configureerbare retry‑strategie per kanaal; Dead Letter Queue (DLQ) voor niet‑afleverbare berichten.
- Logging & audit: gebeurtenissen vastleggen conform LDV; correlatie‑ID’s voor traceerbaarheid end‑to‑end.

#### Belangrijkste processen en informatiestromen:
1. Aanname notificatieverzoek – Een vakapplicatie doet een verzoek tot notificatie.
   - De Notificatie Service valideert het verzoek, bewaart een initiële status (bijv. Accepted/Queued).
   - Koppelt terug wanneer de status uiteindelijk naar Succeeded/Failed gaat.

2. Kanaalkeuze en voorkeursverwerking – De aannamen is dat de vakapplicatie de kanaal en voorkeur al heeft vastgelegd.
   - In sommige scenario's is de Notificatiedienst zelf verantwoordelijk voor contactherstel en het afleiden van adresgegevens.

3. Aflevering en status – De service biedt het bericht aan bij het gekozen kanaal en registreert tussenstappen (Enqueued, Sent, Delivered/Failed).
   - Callbacks vanaf de provider worden verwerkt en beschikbaar gesteld aan de aanroeper.

4. Retries, failover en fallback – Bij tijdelijke fouten worden retries toegepast met circuit-breaker 'back‑off''.
   - Indien overeengekomen, kan de OMC als fallback overschakelen naar een alternatieve kanaalstrategie.  
   - ^ TODO DISCUSSIEPUNT, moet het mogelijk zijn een geprioriteerde lijst van contactmethodes op kunnen sturen naar de notificatie service


#### Scenario’s

De dienst kent twee scenario’s, die aansluiten op de twee regie-modellen (zie hoofdstuk 6). Bij gedecentraliseerde regie levert de dienstverlener de gegevens zelf aan via de OMC; bij gecentraliseerde regie geeft de organisatie de regie uit handen aan het NMC, inclusief contactherstel bij een mislukte aflevering.

> De sequencediagrammen (mermaid) zijn leidend.

##### Gedecentraliseerde regie

<details>
  <summary>Zie mermaid code</summary>
  
    mermaid
    sequenceDiagram
        actor Medewerker
        Medewerker->>Vakapplicatie:
        activate Vakapplicatie
        Vakapplicatie->>OMC:Verstuur verzoek tot notificatie
        activate OMC
        OMC->>Eigen profielservice:Haal contactgegevens op
        Eigen profielservice-->>OMC:Contactgegevens
        OMC->>NMC:Initiëren notificatie
        activate NMC
        NMC->>NotifyNL:Verstuur notificatie
        NotifyNL-->>NMC:Geaccepteerd
        NMC-->>OMC:Geaccepteerd (referentie)
        NotifyNL-->>NMC:Afleverstatus (delivery receipt)
        NMC-->>OMC:Afleverstatus (optionele consument-callback)
        deactivate NMC
        OMC-->>Vakapplicatie:Optionele statusupdate
        deactivate OMC
        deactivate Vakapplicatie
</details>

##### Gecentraliseerde regie

<details>
  <summary>Zie mermaid code</summary>

    mermaid
    sequenceDiagram
        actor Medewerker
        Medewerker->>Organisatie:Start proces
        Organisatie->>NMC:Initiëren notificatie
        NMC->>Profielservice:Haal contactvoorkeur op
        Profielservice-->>NMC:Contactvoorkeur en gegevens
        NMC->>NotifyNL:Verstuur notificatie
        NotifyNL-->>NMC:Geaccepteerd
        NMC-->>Organisatie:Geaccepteerd (referentie)
        NotifyNL-->>NMC:Afleverstatus (delivery receipt)
        alt Aflevering mislukt
            NMC->>Adresbron:Adres ophalen (KvK Handelsregister of BRP)
            NMC->>Contactherstel:Onbereikbaar + adres
            Contactherstel->>Printstraat:Fysieke verzending
        end
      NMC-->>Organisatie:Afleverstatus (optionele consument-callback)
</details>
