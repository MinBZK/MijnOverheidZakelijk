## Kwaliteitseisen

> Waar het [Functioneel Overzicht](#2) de functionaliteit samenvat, worden hier de niet-functionele / kwaliteitseisen vastgesteld.
>
> Zie ook: [Inhoud guidelines Kwaliteitseisen](https://structurizr.com/help/documentation/quality-attributes)

Onderwerpen zijn:

- Performance (e.g. latency and throughput)
- Scalability (e.g. data and traffic volumes)
- Availability (e.g. uptime, downtime, scheduled maintenance, 24x7, 99.9%, etc)
- Security (e.g. authentication, authorisation, data confidentiality, etc)
- Extensibility
- Flexibility
- Auditing
- Monitoring and management
- Reliability
- Failover/disaster recovery targets (e.g. manual vs automatic, how long will this take?)
- Business continuity
- Interoperability
- Legal, compliance and regulatory requirements (e.g. data protection act)
- Internationalisation (i18n) and localisation (L10n)
- Accessibility
- Usability

### Accessibility

Alle webapplicaties van de overheid dienen te voldoen aan de [WCAG 2.1 A + AA standaarden](https://www.w3.org/standards/webdesign/accessibility). Zie hiervoor de wet- en regelgeving op [digitoegankelijkheid.nl](https://www.digitoegankelijk.nl/wetgeving/wat-verplicht).

Tijdens de Pilot zullen de volgende browsers ondersteund worden:

- Chrome
- Edge
- Safari
- Firefox

Hiervan worden de _laatste twee versies_ ondersteund. Ook wordt de _Responsive_ versie van deze browsers ondersteund. Motivatie: de gekozen browsers worden het meest gebruikt op het Internet. De keuze om de laatste twee versies van elke browser te ondersteunen is volgens het beleid van de Rijksoverheid,bij de Overheid, zoals bij Algemene Zaken. Uiteraard moet ook mobiel ondersteund worden. Vandaar de 'Responsive'-eis.

### Design systemen

NL Design System conform ADR 0009. UI-teksten in het Nederlands, 
**TODO**: en toepassing van de vertaal tooling van de Europese Commissie om alle talen van de EU te ondersteunen.

### Lighthouse

**Lighthouse test?
**Om de kwaliteitseisen te behalen maken we gebruik van een Lighthouse test, deze kijkt naar de volgende aspecten:

| Criteria       | Score |
| -------------- | ----- |
| Performance    | 80    |
| Accessibility  | 100   |
| Best Practices | 100   |
| SEO            | 0     |
| PWA            | 0     |

Accessibility & Best Practices zijn belangrijk in verband met Digi Toegankelijkheid en [W3 Web design](https://www.w3.org/standards/webdesign/accessibility). Performance is ook van belang, maar moet niet de Accessibility in de weg zitten dus is iets lager. Het resultaat van deze test fluctueert ook aan de hand van de server drukte. Metrics [hier](https://web.dev/lighthouse-performance/#metrics) te vinden.
SEO (Search Engine Optimization) en PWA (Progressive Web App) is niet relevant voor deze applicatie.

Let op: voor het daadwerkelijk voldoen aan de Accessibility richtlijnen dient er altijd een handmatige test te worden uitgevoerd door een toetsingsbureau!

### CVE issues

**TODO: welke tool gaan we gebruiken voor het automatisch controleren van CVE issues in de projecten**

### Open Standaarden

Via het Forum Standaardisatie van de Rijksoverheid is de volgende selectie van van toepassing zijnde Open Standaarden gemaakt. Zie PDF:
[Beslisboom_Open_Standaarden\_\_\_Forum_Standaardisatie.pdf](uploads/Beslisboom_Open_Standaarden___Forum_Standaardisatie.pdf)

### Monitoring en Management

NTB

### Concurrency/Stress Testing

NTB
