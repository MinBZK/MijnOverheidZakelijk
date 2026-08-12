## Deployment

### View

De deployment view van de Profiel Servie is hieronder te vinden, deze bevat uiteindelijk maar 2 containers.
De eerste is de Profiel Service zelf, met daarin de API-componenten en business logica, en de tweede is de bijbehorende postgresql database.

![](embed:ProfielServiceDeployment)


### Omgeving

De omgeving is gehost op het Standaard Platform, specifiek in het TEST cluster van Openshift in de logius-moz-poc namespaces.

#### Broncode

De broncode van de applicatie is open-source beschikbaar op [GitHub](https://www.github.com/MinBZK/moza-profiel-service).  
De infrastructuur files staat op de private gitlab server van het Standaard Platform.

### ZAD PR-preview-omgeving

Naast de POC-deployment hierboven krijgt elke Pull Request op `moza-profiel-service`
automatisch een eigen, tijdelijke deployment op ZAD (`pr-<nummer>`), zodat een
reviewer de wijziging kan uitproberen zonder eerst naar de POC-omgeving te
deployen. Bij het sluiten van de PR wordt die omgeving weer opgeruimd. Push/merge
naar `main` deployt daarnaast naar een persistente `stable`-omgeving op ZAD.

Dit is uitsluitend een PR-preview-/ontwikkelomgeving — de POC-deployment op het
Standaard Platform hierboven en de landing op LPC blijven ongewijzigd de weg naar
een echte (test)omgeving. Zie `docs/zad-deploy.md` in `moza-profiel-service` voor
de workflow, de benodigde omgevingsvariabelen en de bekende afwijkingen t.o.v. de
POC-inrichting (o.a. de gedeelde database tussen PR-previews en de scheduler die
daarom op previews uitstaat).
