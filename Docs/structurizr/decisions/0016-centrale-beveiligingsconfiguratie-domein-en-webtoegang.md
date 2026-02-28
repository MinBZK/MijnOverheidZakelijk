# 16. Centrale beveiligingsconfiguratie domein en webtoegang

Date: 2026-02-26

## Status

Accepted

## Context

Tijdens een controle via internet.nl zijn meerdere beveiligingsgerelateerde aandachtspunten geconstateerd op domeinniveau en webniveau:
1. E-mail was niet in gebruik, maar DNS suggereerde dat e-mail mogelijk was.
2. Er was geen CAA-record aanwezig.
3. Content-Security-Policy (CSP) was onvoldoende strikt en miste verplichte directives.

De website betreft een statische Hugo-site die draait in een OpenShift Kubernetes omgeving achter een NGINX Ingress Controller.

**Doel:**
De beveiligingsinstellingen centraal en audit-proof inrichten, zodat:
- Internet.nl groen scoort
- Security niet per container geregeld hoeft te worden
- Toekomstige developers begrijpen waar security is afgedwongen
- Beveiliging op domeinniveau en HTTP-niveau structureel geborgd is

---

## Beslissing

Beveiliging is centraal ingericht op twee niveaus:

### 1. DNS-niveau (domeinbeveiliging)

Voor het hoofddomein en publieke subdomeinen:

#### SPF (e-mail volledig uitgeschakeld)

```text
v=spf1 -all
```

**Betekenis:**
- Er mag geen e-mail verstuurd worden namens dit domein.
- Hard fail (`-all`) voorkomt misbruik.
- Soft fail (`~all`) is bewust niet gebruikt.

#### Geen MX-records
- Er zijn geen MX-records geconfigureerd.
- Het domein accepteert geen e-mail.

#### DMARC

```text
v=DMARC1; p=reject; adkim=s; aspf=s;
```

**Betekenis:**
- Eventuele e-mailpogingen worden geweigerd.
- Voorkomt spoofing.
- Versterkt audit-score.

#### CAA-record

```text
0 issue "letsencrypt.org"
```

**Betekenis:**
- Alleen de opgegeven Certificate Authority mag certificaten uitgeven.
- Voorkomt ongeautoriseerde certificaatuitgifte.
- Voldoet aan internet.nl vereisten.

**Resultaat:**
- E-mail volledig uitgeschakeld
- Certificaatuitgifte beperkt
- Domeinmisbruik geminimaliseerd

---

### 2. HTTP-niveau (webbeveiliging via Ingress)

Security headers worden centraal afgedwongen in de NGINX Ingress Controller, niet in de applicatie of container.

#### Reden
- Security hoort op de HTTP-boundary
- Centrale configuratie voorkomt duplicatie
- Consistent gedrag over meerdere websites
- Geen afhankelijkheid van container-images

#### Implementatie
In de Ingress resource:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
```

#### Waarom `more_set_headers`
- Overschrijft bestaande headers
- Werkt ook bij error responses
- Consistent gedrag in ingress-nginx
- Betrouwbaarder dan `add_header`

---

## Content-Security-Policy uitleg

De ingestelde CSP bevat:

| Directive                | Doel                                        |
|:-------------------------|:--------------------------------------------|
| `default-src 'self'`     | Alleen resources van eigen domein           |
| `script-src 'self'`      | Geen inline of externe scripts              |
| `style-src 'self'`       | Geen inline CSS                             |
| `img-src 'self' data:`   | Alleen lokale images + data URI             |
| `font-src 'self'`        | Alleen lokale fonts                         |
| `base-uri 'self'`        | Voorkomt manipulatie via `<base>`           |
| `form-action 'self'`     | Forms mogen alleen naar eigen domein posten |
| `frame-ancestors 'none'` | Voorkomt clickjacking                       |

**Belangrijk:**
- `unsafe-inline` is bewust verwijderd.
- Externe CDNs zijn niet toegestaan tenzij expliciet toegevoegd.

---

## Architectuuroverzicht

```text
Browser
↓
NGINX Ingress Controller  ← Security headers hier
↓
Service
↓
Hugo static container
```

DNS-beveiliging staat los van Kubernetes en geldt op domeinniveau.

---

## Gevolgen

### Positief
- Internet.nl compliant
- Centrale security-configuratie
- Geen per-container configuratie nodig
- Beveiliging afdwingbaar en controleerbaar
- Audit- en beheer-vriendelijk

### Aandachtspunten
- Wijzigingen aan CSP vereisen Ingress-aanpassing
- Externe scripts of embeds vereisen CSP-aanpassing
- Snippet-support moet toegestaan zijn in de Ingress-controller

---

## Validatie

Na wijziging wordt gecontroleerd met:

```bash
curl -I https://<host>
```

En periodiek via:
- [internet.nl](https://internet.nl)

---

## Conclusie

De beveiliging van het domein en de webtoegang is centraal ingericht:
- DNS voorkomt e-mailmisbruik en ongeautoriseerde certificaatuitgifte.
- HTTP-beveiliging wordt centraal afgedwongen via de NGINX Ingress Controller.
- De applicatie zelf blijft statisch en eenvoudig.
- Security is platformmatig geborgd in plaats van applicatie-afhankelijk.

Deze aanpak zorgt voor consistente, beheersbare en audit-proof beveiliging van publieke websites binnen het platform.
