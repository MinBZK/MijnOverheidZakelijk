# 15. LDV omzetten naar kotlin van java

Datum: 2026-02-23

## Status
Accepted

## Context
De LDV package was gebouwd in Java. We wilden Kotlin binnen het project introduceren, maar op een beheerste manier: klein, afgebakend en met beperkte impact op de rest van het landschap.

LDV is hiervoor geschikt omdat het een duidelijke scope heeft en op de JVM draait, waardoor we Kotlin kunnen toepassen zonder het platform of de integraties te wijzigen.

Belangrijkste inhoudelijke overwegingen:
- Kotlin geeft null-safety en compacter/leesbaarder code, wat onderhoud vereenvoudigt.
- Java-interoperabiliteit maakt de overstap laag risico.

Niet-architectonisch maar wel praktisch: er was capaciteit om deze migratie uit te voeren; dit was een uitvoeringskans, niet de reden.

## Decision
We zetten de LDV package om van Java naar Kotlin als pilot: een gecontroleerde, kleinschalige introductie van Kotlin binnen één package, met behoud van functionaliteit en publieke contracten.

## Consequences
- LDV is nu geïmplementeerd in Kotlin; gebruik en gedrag blijven hetzelfde.
- We hebben ervaring opgedaan met Kotlin binnen een beperkte scope.
- Kotlin wordt hiermee een reële optie voor toekomstige onderdelen, op basis van de pilot-ervaring.
