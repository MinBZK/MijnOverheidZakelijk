## Code

> Ook wel "Development View" of "Implementation View" genoemd, waarin dieper kan worden ingegaan op de implementatie van specifieke componenten van de software.
>
> Zie ook: [Inhoud guidelines Code](https://structurizr.com/help/documentation/code)

### Sequentie diagrammen

#### Sequentie diagram voor profiel bekijken

![Profiel bekijken + Logboek Dataverwerking](./images/SeqProfielBekijken.png "Profiel bekijken + Logboek Dataverwerking")

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        actor ZakelijkGebruiker
        ZakelijkGebruiker->>MijnOverheid Zakelijk: Wilt profiel bekijken
        activate MijnOverheid Zakelijk
        MijnOverheid Zakelijk->>Profiel service:Haalt profiel gegevens op
        deactivate MijnOverheid Zakelijk
        activate Profiel service
        Profiel service->>Logboek Dataverwerking: READ log wegschrijven
        deactivate Profiel service
        activate Logboek Dataverwerking
        Logboek Dataverwerking-->>Profiel service: Ok
        deactivate Logboek Dataverwerking
        activate Profiel service
        Profiel service-->>MijnOverheid Zakelijk: Profiel gegevens
        deactivate Profiel service
        activate MijnOverheid Zakelijk
        MijnOverheid Zakelijk-->>ZakelijkGebruiker: Yippie
        deactivate MijnOverheid Zakelijk

</details>

#### Sequentie diagram voor email updaten met email verificatie

![Update Email + EventSourcing](./images/SeqUpdateEmail.png "Update Email + EventSourcing")

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        actor ZakelijkGebruiker
        ZakelijkGebruiker->>MijnOverheid Zakelijk: Update email
        activate MijnOverheid Zakelijk
        MijnOverheid Zakelijk->>Profiel service: Verstuurt email update
        deactivate MijnOverheid Zakelijk
        activate Profiel service
        participant EventSourcing@{ "type" : "database" }
        participant EmailVerificatieService
        Profiel service->>EventSourcing: 'Update aangevraagd'-log opslaan
        deactivate Profiel service
        activate EventSourcing
        EventSourcing-->>Profiel service: Ok
        deactivate EventSourcing
        activate Profiel service
        Profiel service->>EmailVerificatieService: Start verificatieprocess
        deactivate Profiel service
        activate EmailVerificatieService
        EmailVerificatieService-->>ZakelijkGebruiker: Verstuur mail
        deactivate EmailVerificatieService
        activate ZakelijkGebruiker
        ZakelijkGebruiker-)MijnOverheid Zakelijk: Verifieer email
        deactivate ZakelijkGebruiker
        activate MijnOverheid Zakelijk
        MijnOverheid Zakelijk->>Profiel service: Verstuurt verificatie verzoek
        deactivate MijnOverheid Zakelijk
        activate Profiel service
        Profiel service->>EmailVerificatieService:  Verifieer verificatie verzoek
        deactivate Profiel service
        activate EmailVerificatieService
        EmailVerificatieService-->>Profiel service: Bevestig verificatie
        deactivate EmailVerificatieService
        activate Profiel service
        Profiel service->>EventSourcing: 'Update geverifieerd'-log opslaan
        deactivate Profiel service
        activate EventSourcing
        EventSourcing-->>Profiel service: Ok
        deactivate EventSourcing
        activate Profiel service
        Profiel service-->>MijnOverheid Zakelijk: Profiel gegevens
        deactivate Profiel service
        activate MijnOverheid Zakelijk
        MijnOverheid Zakelijk-->>ZakelijkGebruiker: Yippie
        deactivate MijnOverheid Zakelijk

</details>
