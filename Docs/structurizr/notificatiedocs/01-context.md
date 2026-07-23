# Notificatiedienst

> | **Status**     | Conceptversie                                                                   |
> |----------------|---------------------------------------------------------------------------------|
> | Laatste update | 23-07-2026                                                                      |


## Context

Binnen MijnOverheid Zakelijk is betrouwbare en tijdige communicatie richting burgers en ondernemers essentieel om te voldoen aan de Wet MEBV. Waar de `Profiel Service` voorziet in het vastleggen van contactgegevens en voorkeuren, faciliteert de Notificatiedienst het daadwerkelijk versturen van notificaties en het registreren van de afleverstatus. De dienst wordt samen met Logius, binnen het programma OBIS, neergezet als generieke voorziening tussen overheidsdiensten en verzendkanalen.

De dienst richt zich op dit moment op twee kanalen: e-mail (digitaal) en fysieke post. De intentie is om later meer kanalen toe te voegen, zoals alternatieve digitale kanalen en sms. De Notificatiedienst notificeert, maar levert het inhoudelijke bericht niet af: een notificatie meldt dat er een bericht klaarstaat op een digitale locatie. Beschikkingen zelf worden dus niet via de Notificatiedienst verzonden.

MOZa bouwt binnen de Notificatiedienst het Notificatie Management Component (NMC) en het bijbehorende Notificatieregister. NotifyNL, Contactherstel en de Printstraat zijn bestaande diensten die het NMC aanroept. Deze documentatie beschrijft de dienst als geheel, met de nadruk op het NMC.

De dienst ondersteunt twee regie-modellen. Bij decentrale regie houdt de dienstverlener via de OMC zelf de regie en regelt hij bij een mislukte aflevering ook het contactherstel zelf; bij centrale regie geeft de organisatie de regie uit handen aan het NMC, dat op basis van een identificerend nummer (KvK, RSIN of BSN) de voorkeur bij de Profielservice ophaalt en bij een mislukte aflevering ook het contactherstel voor de dienstverlener regelt. In de praktijk worden OMC en NMC complementair ingezet, waarbij de OMC de lead heeft.

### Uitdagingen

- Fragmentatie: elke organisatie heeft eigen systemen, integraties en afleverbewijzen voor het notificeren.
- Onbetrouwbaarheid: er is geen uniforme manier om vast te stellen of berichten zijn aangekomen.
- Dubbel werk: de behoeften zijn grotendeels gelijk, maar iedere dienstverlener bouwt ze opnieuw.
- Doelbinding en voorkeuren: notificaties moeten aansluiten op de opgegeven voorkeuren en rechtmatig worden verzonden.
- Schaalbaarheid en piekbelasting: grote aantallen attenderingen en kennisgevingen bij gebeurtenissen.
- Beveiliging en privacy: persoonsgegevens minimaliseren en conformiteit met wet- en regelgeving (o.a. AVG, MEBV).
- Toekomstvastheid: eenvoudig nieuwe kanalen kunnen aansluiten zonder wijzigingen bij afnemende diensten.

### Doel

**Overheidsorganisaties/dienstverleners** kunnen via één generieke API notificaties laten versturen, met terugkoppeling van de afleverstatus.

**Ondernemers** ontvangen attenderingen en kennisgevingen volgens hun opgegeven voorkeuren via betrouwbare, herkenbare en veilige kanalen.

De Notificatiedienst abstraheert kanaalspecifieke complexiteit en registreert afleverresultaten voor inzicht en verantwoording. Dienstverleners kunnen de dienst als totaaloplossing afnemen of losse onderdelen ervan inzetten.

![Notificatie Service Context](embed:NotificatieServiceContext)
