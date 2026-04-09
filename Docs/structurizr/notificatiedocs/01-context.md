# Notificatie Service

> | **Status**     | Conceptversie                                                                   |
> |----------------|---------------------------------------------------------------------------------|
> | Laatste update | 23-02-2026                                                                      |


## Context

Binnen MijnOverheid Zakelijk is betrouwbare, tijdige en kanaalonafhankelijke communicatie richting burgers en ondernemers essentieel om te voldoen aan de Wet MEBV. Waar de `Profiel Service` voorziet in het vastleggen van contactgegevens en voorkeuren, faciliteert de Notificatie Service het daadwerkelijk versturen van berichten en attenderingen via verschillende kanalen (zoals e‑mail, sms, push of toekomstige kanalen) en het registreren van de afleversstatus.

De Notificatie Service opereert als generieke voorziening tussen overheidsdiensten en verzendkanalen/platforms. 
Dit maakt het mogelijk om notificaties consistent aan te bieden, kanaalkeuzes van de gebruiker te respecteren en technische verschillen tussen verzendproviders af te schermen.

### Uitdagingen

- Fragmentatie van kanalen en leveranciers: elke dienstverlener heeft eigen integraties en afleverbewijzen.
- Doelbinding en voorkeuren: notificaties moeten aansluiten op door de gebruiker opgegeven voorkeuren en rechtmatig worden verzonden.
- Betrouwbaarheid en traceerbaarheid: afleversstatus, retries, dead‑lettering en auditlogs moeten uniform worden geborgd.
- Schaalbaarheid en piekbelasting: grote aantallen attenderingen & kennisgevingen bij gebeurtenissen.
- Beveiliging en privacy: persoonsgegevens minimaliseren, end‑to‑end beveiliging en conformiteit met wet‑ en regelgeving (o.a. AVG, MEBV).
- Toekomstvastheid: eenvoudig nieuwe kanalen en providers kunnen aansluiten zonder wijzigingen bij afnemende diensten.

### Doel

**Overheidsorganisaties/Dienstverleners** kunnen via één generieke interface templates aanmaken, en via een API deze afleveren over meerdere kanalen.

**Ondernemers** ontvangen attenderingen & kennisgevingen volgens hun opgegeven voorkeuren via betrouwbare, herkenbare en veilige kanalen.

De Notificatie Service abstraheert kanaalspecifieke complexiteit, past verzendbeleid en throttling toe, en registreert gebeurtenissen en afleversresultaten voor inzicht en verantwoording.

![Notificatie Service Context](embed:NotificatieServiceContext)
