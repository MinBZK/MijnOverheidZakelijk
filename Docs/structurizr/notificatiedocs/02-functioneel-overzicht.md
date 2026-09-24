## Functioneel overzicht

### Inleiding

Dit hoofdstuk bouwt voort op de context en verwijst naar aanvullende documentatie en diagrammen.
Het biedt kort en duidelijk inzicht in wat de Notificatiedienst doet, voor wie het dat doet en hoe de belangrijkste informatiestromen lopen.

### Overzicht

De Notificatiedienst biedt één generieke voorziening waarmee overheidsorganisaties notificaties (attenderingen en kennisgevingen) kunnen laten versturen. De dienst richt zich op e-mail als verzendkanaal; fysieke post wordt alleen ingezet als achtervang bij contactherstel en meer kanalen volgen later.
De service schermt kanaalspecifieke verschillen af en respecteert voorkeuren en doelbinding.

Belangrijke gebruikers en hun behoeften zijn:
- Dienstverleners en vakapplicaties: via een API een notificatie kunnen initiëren, met terugkoppeling over de status en het eindresultaat.
- Ondernemers en burgers: notificaties ontvangen volgens hun voorkeuren, met contactherstel wanneer een kanaal onbereikbaar blijkt.

#### Kernfunctionaliteiten in het kort:

De Notificatiedienst voert de regie op vijf functionaliteiten:

1. Bepalen van de ontvanger: de contactvoorkeur bepalen en de bijbehorende contactgegevens ophalen.
2. Verzending: het bericht samenstellen op basis van een template en daadwerkelijk versturen.
3. Response handling: het opvangen en registreren van de afleverstatus en het terugkoppelen daarvan aan de aanroeper.
4. Bepalen contactherstel: vaststellen of contactherstel nodig is en de bijbehorende adresgegevens vergaren.
5. Uitvoeren contactherstel: het initiëren, monitoren en opvolgen van contactherstel.

Dienstverleners kunnen de dienst als totaaloplossing afnemen of losse onderdelen inzetten; welke functionaliteiten het NMC uitvoert volgt uit het gekozen regie-model. Alle stappen worden vastgelegd conform LDV, met referenties voor traceerbaarheid end-to-end.

#### Belangrijkste processen en informatiestromen:
1. Aanname notificatieverzoek – Een vakapplicatie of organisatie doet een verzoek tot notificatie.
   - Het NMC valideert het verzoek, registreert de notificatie en geeft de aanroeper direct een referentie terug.
   - De afleverstatus volgt asynchroon.

2. Kanaalkeuze en voorkeursverwerking – Afhankelijk van het regie-model:
   - Bij gedecentraliseerde regie levert de aanroeper de contactgegevens zelf aan; het NMC haalt niets op.
   - Bij gecentraliseerde regie haalt het NMC de voorkeur en contactgegevens op bij de Profielservice.

3. Aflevering en status – Het NMC biedt het bericht aan bij NotifyNL, dat de acceptatie direct bevestigt en de afleverstatus asynchroon terugmeldt met delivery receipts.
   - Het NMC verwerkt de receipts idempotent; de aanroeper vraagt de status op, leest de eventfeed of ontvangt de optionele webhook.
   - Volledige afleverzekerheid bestaat bij e-mail niet: mailsystemen melden fouten niet altijd terug. Aflevering bij de mailserver van de ontvanger geldt daarom als succesvolle verzending, mits die het bericht zonder foutmelding (zoals een volle mailbox of een niet-bestaand adres) accepteert.

4. Opvolging – Het NMC herverzendt eenmaal na een tijdelijke of technische fout en meldt bij gecentraliseerde regie een ongeldig e-mailadres bij de Profielservice; de procesgevolgen van een mislukte notificatie liggen bij de dienstverlener. Contactherstel wordt later aan het model toegevoegd.


#### Scenario’s

De dienst kent twee scenario’s, die aansluiten op de twee regie-modellen (zie hoofdstuk 6). Bij gedecentraliseerde regie levert de dienstverlener de gegevens zelf aan via de OMC; bij gecentraliseerde regie geeft de organisatie de regie over voorkeur en verzending uit handen aan het NMC.

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
        NMC-->>OMC:Afleverstatus (optionele webhook)
        OMC->>NMC:Status opvragen of eventfeed lezen
        NMC-->>OMC:Status / events
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
        alt Adres ongeldig (permanent-failure)
            NMC->>Profielservice:E-mailadres ongeldig melden
        end
        NMC-->>Organisatie:Afleverstatus (optionele webhook)
        Organisatie->>NMC:Status opvragen of eventfeed lezen
        NMC-->>Organisatie:Status / events
</details>
