## Kwaliteitseisen

### Inleiding
Deze sectie beschrijft de belangrijkste niet-functionele eisen (NFR’s) voor de Verificatie Service.

### Overzicht
- Beveiliging & privacy (AVG):
  - Minimaliseer PII: bewaar uitsluitend ReferenceId en VerificationCode; het e‑mailadres wordt niet opgeslagen.
  - Geen PII in logs of trace‑attributen.
  - Encryptie at‑rest en in‑transit (TLS 1.2+).
  - OPTIE: Ontsluiten via FSC zodat het lastiger is via onze service massa emails te versturen door kwaadwillende partijen.
- Betrouwbaarheid & levering:
  - Rechtstreekse aanroep naar de Notificatie Service; timeouts, retries en idempotency aan client‑zijde van die aanroep.
  - Consistentie: onmiddellijk waar mogelijk; tijdelijke fouten worden gesignaleerd aan de aanroepende dienst.
- Performance & Error handling:
  - De verificatie service moet minimaal _nader te bepalen_ aantal aanvragen per uur kunnen verwerken.
  - Als een code twee keer wordt ingevoerd, krijgt de tweede een 'Code Already Used' foutmelding. (Zie #7.2.2)
- Rate limiting & misbruikpreventie:
  - Maximaal aantal verificatieverzoeken per aanroepende dienst per tijdseenheid: _nader te bepalen_.
  - Maximaal aantal validatiepogingen per referenceId: _nader te bepalen_.
  - Bij overschrijding retourneert de service HTTP 429 Too Many Requests.
- Authenticatie & autorisatie:
  - Aanroepende diensten authenticeren zich bij de Email Verificatie Service via _nader te bepalen (bijv. mTLS, OAuth2 client credentials)_.
  - Het admin-endpoint (`GET /api/v1/admin/statistics`) is alleen toegankelijk voor geautoriseerde beheerders.

