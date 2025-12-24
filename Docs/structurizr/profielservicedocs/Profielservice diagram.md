## Diagram Dienstverleners, Profiel Service en BBO

![Diagram Profiel Service, dienstverleners en BBO](./images/profielservice-dienstverleners-bbo.png)

<details>
    <summary>Zie Mermaid code</summary>

    ```mermaid
    flowchart LR
    %% Stijlen
    classDef system fill:#0a4fa3,stroke:#333,stroke-width:1px,color:#fff
    classDef external fill:#ddd,stroke:#333,stroke-width:1px,color:#000
    
    %% Systemen
    
    BBO["**BBO**<br/><small>[Software System]</small><br/>De Berichtenbox voor Burgers en Ondernemers"]
    MOZAClient["**Mijn Overheid Zakelijk**<br/><small>[Software System]</small><br/>De Mijn Overheid omgeving voor zakelijke gebruikers"]
    PROFIEL["**Profiel Service**<br/><small>[Software System]</small><br/>Bevat contactvoorkeuren en contactgegevens van een identificeerbaar persoon"]
    BD["**Belastingdienst**<br/><small>[Software System]</small><br/>Vakapplicatie van de Belastingdienst"]
    RVO["**RVO**<br/><small>[Software System]</small><br/>Vakapplicatie van de RVO"]
    ETC["**ETC**<br/><small>[Software System]</small><br/>Vakapplicatie van een overheid dienstverlener"]
    
    %% Containers / organisaties
    subgraph MOZA["MOZa"]
        PROFIEL
    end
    
    subgraph Logius["Logius"]
        BBO
    end
    
    subgraph DV["Dienstverleners"]
        BD
        RVO
        ETC
    end
    
    %% Relaties
    BD -->|Haalt profielinformatie op| PROFIEL
    BD -->|Verstuurt kennisgeving naar| BBO
    RVO -->|Haalt profielinformatie op| PROFIEL
    ETC -->|Haalt profielinformatie op| PROFIEL
    
    MOZAClient -->|Haalt profielinformatie op uit| PROFIEL
    BBO -->|Haalt profielinformatie op| PROFIEL
    
    %% Klassen toepassen
    class BD,MOZAClient,PROFIEL,RVO,ETC system
    class BBO external
    ```

</details>
