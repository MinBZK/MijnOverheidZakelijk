# Software Architectuur

Dit is de Software Architectuur Documentatie en bestaat uit documentatie in Markdown

en architectuur diagrammen als code, volgens het C4 model
m.b.v. Structurizr: https://structurizr.com/.

De documentatie is ook online beschikbaar via: https://docs.mijnoverheidzakelijk.nl.

## Getting Started

De documentatie bestaat uit een markdown bestand per hoofdstuk, welke automatisch samengevoegd worden tot 1 document.
De diagrammen worden gedefinieerd in het bestand: 'workspace.dsl'.

Kies hiervoor een editor naar keuze. Dit kan van alles zijn, maar wij gebruiken hiervoor VSCode of IntelliJ.

### Structurizr Lite Docker Image

Er is een Docker-image beschikbaar genaamd Structurizr Lite, waarmee je lokaal een gratis versie van Structurizr kunt draaien. Hiervoor heb je een lokale installatie van Docker nodig.

Voor een nieuwe installatie, volg de instructies op [Getting Started With Structurizr Lite](https://dev.to/simonbrown/getting-started-with-structurizr-lite-27d0).

### Structurizr Starten

Ervan uitgaande dat je Docker hebt geinstalleerd, kun je nu Structurizr Lite starten met de volgende commando's:

```bash
docker/podman pull structurizr/lite
docker/podman run -it --rm -p 8080:8080 -v <Path-To-Folder>/MijnOverheidZakelijk/Docs/structurizr:/usr/local/structurizr structurizr/lite
```

| Note: vervang `[PATH]` met het volledige, lokale pad naar de solution, bijv.: `/Users/Robin/software-architectuur/structurizr`.

Het volledige commando zou dan zijn:

```bash
docker/podman run -it --rm -p 8080:8080 -v /Users/Robin/software-architectuur/structurizr:/usr/local/structurizr structurizr/lite
```

### Alternatief / Quick View & Edit

- Ga naar de online editor: https://structurizr.com/dsl
- Plak de tekst uit het .DSL bestand in de editor en klik op Render.

## Architecture Decision Records

Belangrijke Architecturele beslissingen worden vastgelegd in Architecture Decision Records (ADR's). Structurizr ondersteunt dit. Voor meer informatie hoe deze te gebruiken zie de ADR Tools CLI link hieronder.

## Handige Plugins en Extensions

### CLI tools

- [ADR Tools](https://github.com/npryce/adr-tools)

### Visual Studio Code Extensions

- C4 DSL extension (systemticks.c4-dsl-extension)
- Structurizr (ciarant.vscode-structurizr)
- PlantUML (jebbs.plantuml)

### IntelliJ Plugins

- DSL Platform
