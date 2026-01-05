# MijnOverheid Zakelijk - Presentaties

Presentaties die gemaakt zijn m.b.v. [Reveal.js](https://revealjs.com/) voor
[MijnOverheid Zakelijk](https://mijnoverheidzakelijk.nl/).

## Vereisten

- [Node.js](https://nodejs.org/)
- [just](https://github.com/casey/just) - command runner

### just installeren

```bash
# macOS
brew install just

# Linux (met cargo)
cargo install just

# Andere opties: zie https://github.com/casey/just#installation
```

## Installatie

```bash
just setup
```

Dit installeert de npm dependencies en kopieert de benodigde vendor assets.

## Gebruik

Start de ontwikkelserver:

```bash
just slide
```

Bezoek vervolgens http://localhost:8080 in je browser.

## Beschikbare commando's

```bash
just             # Toon alle beschikbare commando's
just setup       # Installeer dependencies en kopieer assets
just slide       # Start development server
just present     # Alias voor slide
just copy-assets # Kopieer vendor assets opnieuw (na npm update)
just pdf         # Toon keuzemenu voor PDF export
just pdf --all   # Exporteer alle presentaties naar PDF
just pdf <naam>  # Exporteer specifieke presentatie naar PDF
```

## Keyboard shortcuts

- `Esc` - Slide overview
- `f` - Fullscreen
- `s` - Speaker notes
- `i` - Terug naar index pagina
- `Arrow keys` - Navigatie
- `Spatiebalk` - Video pause/play (op slides met video)

## PDF Export

### Geautomatiseerd (met Playwright)

De eenvoudigste manier om PDFs te genereren is met Playwright:

```bash
# Eenmalig: installeer Chromium browser voor Playwright
npx playwright install chromium

# Interactief keuzemenu
just pdf

# Exporteer alle presentaties
just pdf --all

# Exporteer specifieke presentatie
just pdf moza_pulse_20251202
```

De PDFs worden opgeslagen in de `pdf/` directory.

> **Let op:** Playwright wordt automatisch meegeïnstalleerd via `npm install`. Alleen de Chromium browser moet eenmalig apart geïnstalleerd worden.

### Handmatig (via browser)

Alternatief kun je handmatig exporteren via de browser:

1. Open de presentatie in de browser
2. Voeg `?print-pdf` toe aan de URL, bijvoorbeeld:
   `http://localhost:8080/moza_pulse_20251202.html?print-pdf`
3. Gebruik de printfunctie van de browser (`Cmd/Ctrl + P`)
4. Kies "Opslaan als PDF"

**Tips:**

- Gebruik Chrome of Chromium voor beste resultaten
- Zet achtergrondafbeeldingen aan in de printinstellingen
- Kies "Geen marges" voor de juiste lay-out
