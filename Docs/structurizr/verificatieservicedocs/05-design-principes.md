## Design Principes

### Inleiding
De Email Verificatie Service volgt onderstaande ontwerpprincipes om eenvoud, betrouwbaarheid en privacy te borgen.

### Principes
- Eenvoudig en direct gekoppeld
  - Starten van verificaties is synchroon; verzending gebeurt via een directe aanroep naar de Notificatie Service.
- Privacy by design
  - Minimaliseer PII; geen PII in logs of traces; bewaartermijnen strikt.
- Fouttolerantie en herstelbaarheid
  - Circuit breaker met fallback rond de aanroep naar de Notificatie Service om bij uitval snel te falen.
  - Rate limiting per e-mailadres ter voorkoming van misbruik.
- Meetbaarheid en observability
  - Gestructureerde logging metrics voor throughput/latency/fouten.
- Simpele, duidelijke contracten
  - Expliciete API‑schemata, versieerbaar; backwards compatibel evolueren.
