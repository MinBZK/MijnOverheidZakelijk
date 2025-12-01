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
```

## Keyboard shortcuts

- `Esc` - Slide overview
- `F` - Fullscreen
- `S` - Speaker notes
- `I` - Terug naar index pagina
- `Arrow keys` - Navigatie
