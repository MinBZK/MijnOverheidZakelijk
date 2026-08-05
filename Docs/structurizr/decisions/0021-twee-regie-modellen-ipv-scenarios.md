# 21. Twee regie-modellen in plaats van de scenario's 2, 8 en 9

Datum: 2026-06-16

## Status
Proposed

Vervangt [ADR 0003 Scenario bepaling](0003-scenario-bepaling.md).

## Gerelateerde ADRs
- [ADR 0003 Scenario bepaling](0003-scenario-bepaling.md): de beslissing die de scenario's 2 en 8 uitwerkte en die deze ADR vervangt.
- [ADR 0002 Notify Onderzoek](0002-notify-onderzoek.md): keuze voor NotifyNL als verzendkanaal binnen de Notificatiedienst.

## Context

ADR 0003 werkte de notificatie-aanpak uit aan de hand van de architectuurscenario's van Paul Jansen: scenario 2 (alle vakapplicaties verbinden rechtstreeks met de notificatieservice) en scenario 8 (een generiek tussencomponent, destijds "OMC" genoemd, bij de organisaties dat contactmomenten opslaat en kanaalherstel regelt). In latere documentatie kwam daar scenario 9 bij.

Inmiddels is de architectuur van de Notificatiedienst uitgekristalliseerd rond twee regie-modellen. Wie de regie over een verzending voert is de enige onderscheidende factor die er functioneel toe doet. Daarom beschrijven we de Notificatiedienst voortaan alleen nog aan de hand van die twee modellen, gecentraliseerde en gedecentraliseerde regie, in plaats van de scenario-nummering.

## Decision

1. We laten de scenario-nummering (2, 8, 9) en de bijbehorende Paul-Jansen-framing los als beschrijvingskader voor de Notificatiedienst.
2. Er zijn nog twee scenario's, die samenvallen met de twee regie-modellen:
   - **Gedecentraliseerde regie:** de dienstverlener voert de regie. De Vakapplicatie roept via de Output Management Component (OMC) het Notificatie Management Component (NMC) aan en levert de contactgegevens zelf aan. Het NMC verstuurt deze via NotifyNL en haalt zelf geen voorkeur op. De afleverstatus koppelt de Notificatiedienst wel asynchroon terug, zodat de dienstverlener weet of de aflevering is geslaagd; bij een mislukte aflevering ligt de opvolging bij de dienstverlener.
   - **Gecentraliseerde regie:** de organisatie geeft de regie uit handen. Met de juiste grondslag stuurt zij op basis van een identificerend nummer (KvK, RSIN of BSN) en een templateverwijzing een verzoek naar het NMC. Het NMC haalt zelf de voorkeur op bij de Profielservice, verstuurt via NotifyNL en verzorgt bij een mislukte aflevering het contactherstel.
3. Scenario 8 als aparte variant (profielverrijking zonder contactherstel) wordt niet meer aangeboden. De keuze is binair: of je voert zelf de regie (gedecentraliseerd), of je geeft de regie volledig uit handen inclusief contactherstel (gecentraliseerd).

## Consequences

- ADR 0003 wordt hiermee vervangen; de daarin uitgewerkte scenario's 2 en 8 vervallen als beschrijvingskader.
- De notificatiedocumentatie is al herschreven naar de twee regie-modellen (hoofdstuk 2 met een sequencediagram per model, en hoofdstuk 6).
- Documenten buiten de notificatiedocs verwijzen nog naar scenario 2, 8 en 9 en moeten nog worden bijgewerkt: `docs/02`, `docs/06`, `profielservicedocs/06`, en de verwijzing naar "ADR 0003 Scenario bepaling" in `04-beperkingen.md`. Dit wordt apart opgepakt.
- Het wegvallen van de losse scenario-variant voor profielverrijking zonder contactherstel maakt het aanbod scherper: contactherstel hoort inherent bij de gecentraliseerde regie, omdat alleen dat model over het identificerend nummer beschikt.
