# 33. Kanaal en mechanisme voor geautomatiseerde CI meldingen

Datum: 04-11-2026

## Status
Accepted

## Gerelateerde documenten
* [ADR 0023 Keuze tooling voor het testen van de API's](0023-keuze-api-testtooling.md)
* [Handleiding Digilab Chat (Mattermost - bots)](https://digilab.overheid.nl/docs/mattermost/#bots)

## Context

Met het opzetten van de e2e nachtrun is er de wens om de resultaten van een foutgelopen run aan het team te kunnen melden.\
Deze wens zal wellicht vaker gaan spelen in het geval van meldingen van CI, monitoring en Productie.\
In het geval van monitoring en productie zal apart bekeken moeten worden wat daar de gewenste notificatie opties zijn.

## Besluit

Er is door het team besloten gebruik te maken van een mattermost notificatie-bot.\
Vanuit de mattermost hostende partij zijn hier al voorzieningen voor getroffen.\
Dit betreft een incoming webhook waarmee een geconfigureerde Github Action op basis van secret `MATTERMOST_WEBHOOK_URL` berichten op een vastgezet kanaal kan posten.
De bot wordt geconfigureerd met de volgende informatie:
- Titel: E2e-nachtrun-notificaties
- Description: Meldingen van de e2e nachtrun.
- Channel: e2e-nachtrun-notificaties

## Consequenties

1. De URL is een bearer credential. Geaccepteerd risico: wie de URL heeft, kan in dat kanaal posten. 
2. Er wordt alleen bij rood gemeld. Geaccepteerd risico: een cron die stilvalt is stil.\
Mitigatie - een waakhond die wekelijks controleert of er nog een scheduled run heeft gedraaid (gebouwd, e2e-waakhond.yml).
3. Geen gegevens in de melding. Alleen journeynaam, uitkomst en run-URL - geen journal-inhoud, geen e-mailadressen, ook geen testadressen. 
4. Deze keuze betreft vooralsnog alleen testmeldingen.
