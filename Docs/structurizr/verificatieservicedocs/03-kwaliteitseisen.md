## Kwaliteitseisen

### Inleiding
Deze sectie beschrijft de belangrijkste niet-functionele eisen (NFR’s) voor de Email Verificatie Service.

### Overzicht
- Beveiliging & privacy (AVG):
  - Minimaliseer PII: bewaar uitsluitend ReferenceId en VerificationCode; het e‑mailadres wordt niet opgeslagen.
  - Geen PII in logs of trace‑attributen.
  - Encryptie at‑rest en in‑transit (TLS 1.2+).
  - OPTIE: Ontsluiten via de Federatieve Service Connectiviteit (FSC) zodat het lastiger is via onze service massa emails te versturen door kwaadwillende partijen.
- Betrouwbaarheid & levering:
  - Rechtstreekse aanroep naar de Notificatie Service met timeouts en idempotency aan client‑zijde van die aanroep.
  - Circuit breaker rond de NotifyNL-aanroep om bij uitval snel te falen in plaats van vast te lopen op een trage of niet-reagerende externe dienst.
  - Consistentie: onmiddellijk waar mogelijk; tijdelijke fouten worden gesignaleerd aan de aanroepende dienst.
- Performance & Error handling:
  - De verificatie service moet minimaal _TODO_Bepalen_Throughput_ aantal aanvragen per uur kunnen verwerken.
  - HTTP client: connect-timeout 10s, request-timeout 30s.
  - Als een code twee keer wordt ingevoerd, krijgt de tweede een 'Code Already Used' foutmelding (409 Conflict).
- Rate limiting & misbruikpreventie:
  - Maximaal 5 verzendpogingen per e-mailadres binnen een tijdvenster van 15 minuten (configureerbaar). Verzoeken boven dit maximum worden geweigerd zonder dat NotifyNL wordt aangeroepen.
  - Maximaal aantal validatiepogingen per referenceId: _TODO_Bepalen_MaxValidatiePogingen_.
  - Bij overschrijding retourneert de service HTTP 429 Too Many Requests.
- Authenticatie & autorisatie:
  - Communicatie met de Notificatie Service (NotifyNL) verloopt via JWT Bearer Token authenticatie.
  - Het admin-endpoint (`GET /api/v1/admin/statistics`) is alleen toegankelijk voor geautoriseerde beheerders.

