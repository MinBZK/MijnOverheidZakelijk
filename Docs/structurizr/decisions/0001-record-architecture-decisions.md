# 1. Record architecture decisions

Date: 2025-05-01

## Status

Accepted

## Context

We moeten ontwerpbeslissingen bijhouden tijdens de ontwikkeling van dit project. Belangrijk is om daarvan een helder overzicht te hebben, zodat we deze later makkelijk kunnen terugvinden. Bijvoorbeeld keuzes voor bepaalde frameworks en packages. Zo kunnen nieuwe projectmedewerkers / developers ook snel zien waarom er bepaalde keuzes zijn gemaakt.

## Decision

We gaan gebruik maken van Architecture Decision Records, zoals [beschreven door Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).

Er is een ADR Tools CLI beschikbaar voor het snel kunnen aanmaken van nieuwe beslis-documenten.

- [ADR Tools](https://github.com/npryce/adr-tools)

Voorbeeld om een nieuw decision record aan te maken:

```
adr new Beslissing die genomen moet worden
```

## Consequences

We moeten keuzes die we maken ook wel gaan bijhouden. Als we dat consequent doen, is dit een heel mooie manier om alle gemaakte beslissingen inzichtelijk te houden.
