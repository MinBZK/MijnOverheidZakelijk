# 14. Keuze voor e‑mailverificatieservice

Datum: 2026-02-23

## Status
Proposed

## Gerelateerde ADRs
- [ADR 0002 — Notify Onderzoek](0002-notify-onderzoek.md): achtergrond bij de keuze voor NotifyNL/NotifyRO als notificatiekanaal.
- [ADR 0011 — Positionering en gebruik van Profiel Service](0011-positionering-en-gebruik-van-profiel-service.md): de Profielservice die e‑mailverificatie nodig heeft.

## Context
Voor de Profielservice is een e‑mailverificatieservice nodig, zodat we e‑mailadressen kunnen valideren vóórdat ze worden gebruikt.

### Huidige situatie
Er bestaat al een e‑mailverificatieservice, ontwikkeld door Worth Systems in opdracht van de gemeente Amsterdam. 
De huidige flow werkt, maar verandert doordat Logius de Notificatieservice vervangt door NotifyRO.

![adr0014-huidige-vs-situatie.png](images/adr0014-huidige-vs-situatie.png)

### Nieuwe situatie
In de nieuwe situatie gebruikt de Profielservice NotifyRO om e‑mails te versturen. 
Als we daarnaast de verificatieservice van Worth blijven gebruiken, ontstaat een keten waarin die service via NotifyNL verstuurt, terwijl NotifyNL juist wordt vervangen door NotifyRO. Dit introduceert extra afhankelijkheden en complexiteit.

![adr0014-worth-vs-situatie.png](images/adr0014-worth-vs-situatie.png)

### Waarom niet verder met de verificatieservice van Worth Systems?
Naast de bovengenoemde architectuur complexiteit zijn er twee aanvullende redenen om niet verder te gaan met de bestaande verificatieservice:

1. **Andere technologiestack dan de rest van het platform.** De verificatieservice van Worth Systems is geschreven in TypeScript/Node. De beoogde beheerpartij, Logius, heeft een voorkeur voor Quarkus/Java. Een eigen service in dezelfde stack als de rest van het MijnOverheidZakelijk-platform verlaagt de drempel voor beheer en doorontwikkeling.

2. **Geen strategisch product van Worth Systems.** De verificatieservice is door Worth Systems ontwikkeld in opdracht van de gemeente Amsterdam en is beschikbaar als open source. Hoewel we de service zouden kunnen forken, betekent dit dat we zelf een TypeScript/Node-codebase moeten onderhouden — wat hetzelfde tech-stack-vraagstuk introduceert als hierboven beschreven.

### Nieuwe situatie met eigen verificatieservice
In dit scenario bouwen we een eigen e‑mailverificatieservice die direct via NotifyRO verstuurt.
Deze service kan in potentie hergebruikt worden door andere overheidsorganisaties die e‑mailverificatie nodig hebben.

![adr0014-eigen-vs-situatie.png](images/adr0014-eigen-vs-situatie.png)

## Overwogen alternatieven

| Alternatief | Voordelen | Nadelen |
|---|---|---|
| **Worth-verificatieservice behouden via NotifyNL** | Geen ontwikkelwerk nodig | NotifyNL wordt uitgefaseerd; creëert dubbele afhankelijkheid |
| **Worth-verificatieservice aanpassen voor NotifyRO** | Beperkt ontwikkelwerk | TypeScript/Node wijkt af van platformstack; afhankelijkheid van externe partij |
| **Worth-verificatieservice forken en zelf onderhouden** | Bewezen implementatie; geen afhankelijkheid van Worth | TypeScript/Node wijkt af van platformstack; onderhoud van externe codebase |
| **Eigen verificatieservice bouwen (gekozen)** | Eén tech-stack (Quarkus/Java); geen externe afhankelijkheden; directe integratie met NotifyRO | Vergt eigen ontwikkeling en onderhoud |

## Decision
We bouwen een eigen e‑mailverificatieservice die via NotifyRO verstuurt.

## Consequences
- We zijn verantwoordelijk voor ontwerp, ontwikkeling en onderhoud van de verificatieservice.
- We elimineren de afhankelijkheid van Worth Systems en NotifyNL.
- De service wordt gebouwd in Quarkus/Java, dezelfde stack als het MijnOverheidZakelijk-platform, wat beheer door Logius vereenvoudigt.
- De service kan in potentie hergebruikt worden door andere overheidsorganisaties.
- We introduceren een afhankelijkheid van NotifyRO voor het versturen van verificatie-e‑mails. NotifyRO wordt, net als het MijnOverheidZakelijk-platform, beheerd door Logius.

