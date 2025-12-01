# 7. Logboek dataverwerking

Date: 2025-10-16

## Status

Declined

## Context

### Bevindingen Logboek Dataverwerking Prototype

#### Prototype Implementatie

Als onderdeel van ons onderzoek hebben we een Java-package ontwikkeld die OpenTelemetry traces en spans omzet naar een vooraf gedefinieerd dataformat voor logboekverwerking. Deze data wordt vervolgens opgeslagen in een ClickHouse database. Tijdens de implementatie en het testen van deze standaard hebben we verschillende uitdagingen geïdentificeerd.

#### Kritische Knelpunten bij Federatieve Implementatie

Voor organisaties die procesflows willen koppelen over hun eigen systemen en externe partijen heen, is een federatieve architectuur noodzakelijk. Binnen dit domein hebben we significante uitdagingen geconstateerd waarvoor momenteel geen uitgewerkte standaard beschikbaar is:

##### 1. Performance-uitdagingen bij het ophalen van span-hiërarchieën

Bij het reconstrueren van een complete trace moet worden vastgesteld of een span child-spans heeft. Deze kunnen zich zowel intern binnen het eigen systeem bevinden als bij externe partijen. Om de aanwezigheid van child-spans te verifiëren, moet er bij alle mogelijke logboek-verwerkingsservices worden gecontroleerd of deze een span bevatten met het betreffende span-ID als parent-ID.
Dit proces moet recursief worden herhaald voor elke gevonden child-span, wat theoretisch kan resulteren in honderden niveaus diep. Bij elk niveau moeten opnieuw calls worden uitgevoerd naar alle potentiële dataverwerkingsservices, wat leidt tot onacceptabele performance-overhead.

##### 2. Register LDV's

Er moet een trust registry komen met welke organisatie er allemaal een LDV service heeft draaien zodat je weet welke organisaties je uberhaupt kan bevragen.

##### 3. Inefficiënte datastructuur voor parent-referenties

De foreign_span_id (parent-referentie) wordt momenteel opgeslagen als JSON-string binnen de attributes. Bij het doorzoeken van spans vereist dit telkens het parsen van JSON-data om toegang te krijgen tot deze enkele waarde. Dit leidt tot aanzienlijke performance-problemen, met name bij grootschalige implementaties.

#### Conclusie en Aanbevelingen

Op basis van bovenstaande bevindingen concluderen we dat een federatieve implementatie van logboek-dataverwerking conform de huidige standaard niet schaalbaar is vanuit performance-perspectief.

##### Mogelijke oplossingen

1. Een mogelijke optimalisatie zou zijn om in de span-metadata te registreren naar welke externe partij de communicatie plaatsvindt. Deze informatie maakt momenteel echter geen deel uit van de LDV-standaard, waardoor dit niet op uniforme wijze kan worden geïmplementeerd.

2. Een overkoepelend parent trace id waarmee je alle foreign spans direct kan ophalen ipv het gebruik van een parent_span id in een json veld. dit voorkomt dat je recursief alle childs hoeft op te halen.

##### Aanbevolen aanpak:

###### Binnen eigen context (bijvoorbeeld MOZa):

Gebruik de standaard OpenTelemetry-implementatie voor het visualiseren van flows binnen de eigen systeemgrenzen.

###### Opslagoplossing:

Kies voor een gevestigde, productie-klare oplossing zoals Elastic APM voor het opslaan en analyseren van telemetrie-data, in plaats van een custom-implementatie.
Voor cross-organisatie trace-analyse raden we aan te wachten tot er een uitgewerkte federatieve standaard beschikbaar komt die bovenstaande performance-uitdagingen adresseert.

## Decision

Na nader overleg met het team van LDV op het Fieldlab 2025 bestaanszekerheid bij levensgebeurtenissen hebben geconcludeerd dat sommige van onze conclusie incorrect waren, en andere hebben wij in samenwerking kunnen rechttrekken. Daarom hebben wij de beslissing genomen LDV te implementeren. Zie ADR 0010-LDV-Implementatie voor meer informatie.

## Consequences

ADR 0010-ldv-implementatie.
