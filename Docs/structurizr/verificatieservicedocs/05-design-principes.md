## Design Principes

### Inleiding
De Verificatie Service volgt onderstaande ontwerpprincipes om eenvoud, betrouwbaarheid en privacy te borgen.

### Principes
- Eenvoudig en direct gekoppeld
  - Starten van verificaties is synchroon; verzending gebeurt via een directe aanroep naar de Notificatie Service.
- Privacy by design
  - Minimaliseer PII; geen PII in logs of traces; bewaartermijnen strikt.
- Fouttolerantie en herstelbaarheid
  - Retries met backoff op de rechtstreekse notificatie‑aanroep.
- Meetbaarheid en observability
  - Gestructureerde logging metrics voor throughput/latency/fouten.
- Simpele, duidelijke contracten
  - Expliciete API‑schemata, versieerbaar; backwards compatibel evolueren.
