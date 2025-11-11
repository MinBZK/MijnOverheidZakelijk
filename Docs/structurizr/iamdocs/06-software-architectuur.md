## Software architectuur

### KvK BSN API-integratie

Om ondernemers op een betrouwbare manier te kunnen identificeren, maakt het systeem gebruik van de KvK-BSN API.  
Deze integratie stelt de service in staat organisaties op te vragen waarin een natuurlijk persoon één of meerdere functies vervult.

#### Interactie-overzicht

De endpoint **POST `/mijnoverheid/mijnorganisaties`** ontvangt het BSN van de betreffende persoon.  
De KvK-API verwerkt dit verzoek en retourneert een lijst met 0, 1 of meerdere organisaties die aan deze persoon zijn gekoppeld.  
De interactie volgt een eenvoudige request–response-flow, zoals weergegeven in het sequentiediagram.

![Sequentiediagram KvK BSN Api](./images/SeqKvKBSN.png "Sequentiediagram KvK BSN Api")

| **#** | **Omschrijving**                    | **Toelichting**                                                                                                                                  |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | POST /mijnoverheid/mijnorganisaties | De service doet een verzoek naar de KVK-API en stuurt hierbij het **BSN van de natuurlijk persoon** mee.                                         |
| 2     | Lijst met organisaties              | De KVK-API verwerkt het verzoek en retourneert een **lijst met 0, 1 of meerdere organisaties** waarin de natuurlijk persoon een functie vervult. |

<details>
  <summary>Zie mermaid code</summary>
  
    sequenceDiagram
        participant Service

        Service-->>KvK API: POST /mijnoverheid/mijnorganisaties
        activate KvK API
        KvK API-->>Service: Lijst met 0, 1, of meer organisaties
        deactivate KvK API

</details>
