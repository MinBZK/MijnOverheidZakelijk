## Context

> De context schetst een eerste beeld van de rest van de documentatie c.q. het project / systeem.  
> Zie ook: [Inhoud guidelines Context](https://structurizr.com/help/documentation/context)

In het Mijn Overheid Zakelijk prototyping team houden we ons bezig met het maken van technische oplossingen om aan de hand daarvan vooruitgang te boeken in het programma en te komen tot een definitieve technische oplossing zodat overheidsinstanties kunnen voldoen aan de [Wet MEBV](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/wetgeving/wet-modernisering-elektronisch-bestuurlijk-verkeer/).

Als ondernemer dien je hier te kunnen inloggen met `eHerkenning` of `DigiD` (eerst gesimuleerd). Daarna kun je je profiel bekijken, wat een set van gegevens is uit het `KVK Basisregister`, aangevuld met ontbrekende gegevens beginnende met het e-mailadres.

Als er geen e-mailadres is, moet de ondernemer het kunnen invullen en wordt dit bewaard in de `Profiel Service` database. Als er reeds een e-mailadres bekend is, moet de ondernemer dit ook weer kunnen aanpassen.

Naast de profielinformatie, dient de ondernemer een geschiedenis lijst van contactmomenten te kunnen inzien. Dit wordt opgehaald uit de `Historie Service`, welke de callbacks van het `Output Management Component` of de `NotifyNL Service` ontvangt.

![](embed:MOZAContext)
