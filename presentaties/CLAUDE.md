# Presentaties MOZa

Dit bestand biedt richtlijnen voor Claude Code (claude.ai/code) bij het werken met code in deze repository.

## Projectoverzicht

Dit is een Reveal.js presentatieomgeving voor MijnOverheid Zakelijk (MOZa), gestyled volgens de Rijkshuisstijl. Presentaties worden gebouwd in HTML en gebruiken custom CSS voor overheidsbranding.

## Development Commando's

```bash
# Installeer dependencies en kopieer assets
just setup

# Start development server
just slide

# Toegankelijk op http://localhost:8080
```

## PDF Export

### Geautomatiseerd (met Playwright)

De aanbevolen manier om PDFs te genereren:

```bash
# Eenmalig: installeer Chromium browser voor Playwright
npx playwright install chromium

# Interactief keuzemenu (of exporteer alles)
just pdf

# Exporteer specifieke presentatie
just pdf moza_pulse_20251202
```

PDFs worden opgeslagen in de `pdf/` directory. Het export script staat in `scripts/export-pdf.js`.

> Playwright wordt meegeïnstalleerd via `npm install`. Alleen Chromium moet eenmalig apart geïnstalleerd worden.

### Handmatig (via browser)

Alternatief via de browser print functie:

1. Open de presentatie in de browser
2. Voeg `?print-pdf` toe aan de URL (bijv. `http://localhost:8080/moza_pulse_20251202.html?print-pdf`)
3. Gebruik de printfunctie van de browser (Cmd/Ctrl + P)
4. Kies "Opslaan als PDF"

**Tips voor handmatige export:**

- Gebruik Chrome of Chromium voor beste resultaten
- Zet achtergrondafbeeldingen aan in de printinstellingen
- Kies "Geen marges" voor de juiste lay-out

## Architectuur

- **index.html**: Overzichtspagina met links naar alle presentaties
- **[presentatie].html**: Individuele Reveal.js presentaties (bijv. `moza_pulse_20251202.html`)
- **assets/css/rijkshuisstijl_reveal.css**: Custom styling voor Reveal.js met Rijkshuisstijl
- **assets/js/reveal-init.js**: Gemeenschappelijke Reveal.js configuratie
- **assets/images/**: Gedeelde images zoals logo's
- **content/**: Presentatie-specifieke assets (afbeeldingen, video's) per presentatie
- **scripts/export-pdf.js**: Playwright script voor geautomatiseerde PDF export
- **pdf/**: Output directory voor geëxporteerde PDFs (git-ignored)


## Afhankelijkheden

Versies worden beheerd in `package.json`:

- **Reveal.js**: Presentatie framework
- **reveal.js-mermaid-plugin**: Diagrammen in slides
- **@rijkshuisstijl-community/font**: Rijksoverheid lettertype
- **@nl-rvo/design-tokens**: Overheid design tokens
- **Playwright**: Headless browser voor PDF export (vereist eenmalig `npx playwright install chromium`)

## Belangrijke Functionaliteiten

### Reveal.js Integratie

- Presentatie navigatie met pijltjestoetsen
- Verticale slides (subsecties) met `<section>` binnen `<section>`
- Presenter notes met `<aside class="notes">`

### Keyboard Shortcuts

- **Pijltjestoetsen**: Navigeren tussen slides
- **Spatiebalk**: Video pause/play op huidige slide
- **i**: Terug naar indexpagina
- **s**: Speaker view openen (presenter notes)
- **f**: Fullscreen mode
- **Esc**: Overzichtsmodus

### Overheidsbranding

- Kleuren: Rijksoverheid blauw (#154273), oranje (#E17000)
- Lettertype: Fira Sans via Rijkshuisstijl Community Font
- Logo wordt automatisch getoond bovenaan elke slide

### Speciale CSS Classes voor Slides

- `.title-slide`: Titelpagina styling
- `.hide-logo`: Verberg het Rijksoverheid logo op deze slide
- `.show-controls`: Toon navigatieknoppen
- `.hide-controls`: Verberg navigatieknoppen

## Nieuwe Slide Toevoegen

1. Maak een nieuwe `<section>` binnen de `.slides` div:
```html
<section>
  <h2>Slide Titel</h2>
  <p>Inhoud hier</p>
</section>
```

2. Voor verticale subsecties (naar beneden navigeren):
```html
<section>
  <section><h2>Hoofd slide</h2></section>
  <section><h2>Sub slide 1</h2></section>
  <section><h2>Sub slide 2</h2></section>
</section>
```

3. Met presenter notes:
```html
<section>
  <h2>Titel</h2>
  <aside class="notes">
    Dit ziet alleen de spreker in speaker view (druk 's')
  </aside>
</section>
```

## Nieuwe Presentatie Toevoegen

1. Kopieer een bestaande presentatie als template
2. Maak een map aan in `content/` voor presentatie-specifieke assets
3. Voeg een link toe aan `index.html` in de `.presentations` div

## Opmerkingen

- Het project gebruikt Nederlandse Government design tokens en fonts
- Afbeeldingen in `/content/[presentatie]/` voor presentatie-specifieke assets
- Video's ondersteunen `data-start-time` attribuut voor automatische playback op specifieke tijdstip
- Bij video-fouten kan een `.video-fallback` element getoond worden
