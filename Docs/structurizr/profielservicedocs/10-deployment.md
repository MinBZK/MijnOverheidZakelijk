## Deployment

> De koppeling tussen software architectuur en infrastructuur architectuur. (waar draait wat)
>
> Zie ook: [Inhoud guidelines Deployment](https://structurizr.com/help/documentation/deployment)

### View

De deployment view van de Profiel Servie is hieronder te vinden, deze bevat uiteindelijk maar 2 containers.
De eerste is de Profiel Service zelf, met daarin de API-componenten en business logica, en de tweede is de bijbehorende postgresql database.

![](embed:ProfielServiceDeployment)


### Omgeving

De omgeving is gehost op het Standaard Platform, specifiek in het TEST cluster van Openshift in de logius-moz-poc namespaces.

#### Broncode
De broncode van de application is open-source beschikbaar op [GitHub](https://www.github.com/MinBZK/moza-profiel-service).  
De infrastructuur files staat op de private gitlab server van het Standaard Platform.


