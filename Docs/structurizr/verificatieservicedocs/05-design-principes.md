## Design Principes

### Inleiding
De Verificatie Service volgt onderstaande ontwerpprincipes om eenvoud, betrouwbaarheid en privacy te borgen.

### Principes
- Event‑driven en ontkoppeld
  - Starten van verificaties is synchroon, verzending gebeurt asynchroon via messagequeue.
- Privacy by design
  - Minimaliseer PII; geen PII in logs of traces; bewaartermijnen strikt.
- Fouttolerantie en herstelbaarheid
  - Retries met backoff & messagequeue.
- Meetbaarheid en observability
  - Gestructureerde logging metrics voor throughput/latency/fouten.
- Simpele, duidelijke contracten
  - Expliciete API‑schemata en berichtcontracten, versieerbaar; backwards compatibel evolueren.
