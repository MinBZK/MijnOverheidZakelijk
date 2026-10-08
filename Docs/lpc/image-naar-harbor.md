# Een image van GHCR naar Harbor in de LPC

Een image dat op GitHub gebouwd is en publiek op GHCR staat, zet je in Harbor van de
Logius Private Cloud (LPC) met een pipeline in LPC-GitLab. Die pipeline kopieert het
image met skopeo van register naar register. De broncode gaat niet mee: de componenten
zijn open source, de code blijft in de publieke GitHub-repo, en het GitLab-project bevat
alleen de pipeline (`.gitlab-ci.yml`).

Deze handleiding gebruikt het image van de NotificatieManagementComponent (NMC) als
voorbeeld; voor een ander image verandert alleen de naam (zie
[Stap 3](#stap-3-de-job)). Het draaien van een component op de LPC (namespace,
database, secrets, netwerk) valt erbuiten.

## Hoe het werkt

- LPC-GitLab bereikt `ghcr.io` via een proxy, inclusief de host waar GHCR de lagen
  vandaan laat komen (`pkg-containers.githubusercontent.com`). `github.com` is niet
  nodig.
- `skopeo` kopieert van register naar register, zonder Docker-daemon of privileged
  runner. Met `--preserve-digests` faalt de kopie in plaats van stilletjes een andere
  digest op te leveren. Het image in Harbor is dus precies het image dat op GitHub
  gebouwd is en op ZAD draait: promoveren gebeurt zonder opnieuw te bouwen, en
  terugrollen op digest kan ook aan LPC-kant.
- De job draait op een instance-runner (Kubernetes-executor), zonder `tags:`. Het image
  `quay.io/skopeo/stable` mag gebruikt worden. Een kopie duurt ongeveer 30 seconden.

De job hieronder is getest op 8 oktober 2026 met tag `main-b21f043`, vanuit GitLab-project
`logius/open/gs/on/nmc-image-to-harbor`: digest
`sha256:d7c1239f3d9a68591f21857d72cdc8fdbade904353f982256ffae3c131416193` op GHCR én in
Harbor.

## Benodigde toegang

- Een account op LPC-GitLab met het recht om een project aan te maken in de subgroep
  `logius/open/gs/on`.
- Een account op Harbor (`https://harbor.az1.lpc.logius.nl`) met toegang tot project
  `gs` en het recht om daar robotaccounts aan te maken.

Namen van knoppen en menu's kunnen per GitLab- en Harbor-versie verschillen.

## Stap 1: GitLab-project

1. In LPC-GitLab: **New project** → **Create blank project**, in de subgroep
   `logius/open/gs/on`. Het project erft de variabelen en runners van die groep,
   waaronder `HARBOR_PAZ1_REGISTRY` en `HARBOR_PAZ1_PROJECT`; ze staan onder
   **Settings** → **CI/CD** → **Variables** als "Group variables (inherited)". De
   waarden zijn vanuit het project niet te zien.
2. Visibility: Private.
3. **Settings** → **CI/CD** → **Runners**: zet **Enable instance runners for this
   project** aan. Runners onder "Other available project runners" horen bij andere
   projecten; die niet inschakelen.

## Stap 2: robotaccount en variabelen

De pipeline logt bij Harbor in met een eigen robotaccount. Een team mag zijn eigen
robotaccounts in Harbor beheren. Gebruik niet het robotaccount van de subgroep
(`HARBOR_PAZ1_ROBOT`, `robot+gs+gitlab`): het secret in `HARBOR_PAZ1_SECRET` hoort er
niet bij, en de login faalt.

1. In Harbor, project `gs` → **Robot Accounts** → **New Robot Account**:
   - een naam die bij de pipeline hoort, bv. `nmc-pipeline`; deze Harbor gebruikt het
     voorvoegsel `robot+`, dus de volledige naam wordt `robot+gs+nmc-pipeline`;
   - een verloopdatum;
   - rechten: alleen Push en Pull op repositories.

   Kopieer na het opslaan de volledige naam en het secret: Harbor toont het secret één
   keer.
2. In het GitLab-project → **Settings** → **CI/CD** → **Variables** → **Add variable**:

   | Variabele | Waarde | Instelling |
   |---|---|---|
   | `NMC_HARBOR_ROBOT` | de volledige robotnaam | "Expand variable reference" uit |
   | `NMC_HARBOR_SECRET` | het secret | **Masked**, "Expand variable reference" uit |

   Met "Expand variable reference" aan leest GitLab een `$` in de waarde als verwijzing
   naar een andere variabele. "Protected" geeft een variabele alleen door aan pipelines
   op beschermde branches, zoals `main`; laat het uit als de job ook op andere branches
   moet draaien.

Na de verloopdatum faalt de login. Het team verlengt het robotaccount dan zelf in Harbor,
of maakt een nieuw secret aan en zet dat in `NMC_HARBOR_SECRET`.

## Stap 3: de job

1. **Build** → **Pipeline editor**, de inhoud hieronder plakken en committen naar `main`.
   In een leeg project meldt de editor vóór de eerste commit "Reference not found"; dat
   komt doordat de branch nog niet bestaat en verdwijnt na de commit.
2. GitLab start na de commit de pipeline met de standaardwaarde van `NMC_TAG`. Een
   andere tag kies je bij **Build** → **Pipelines** → **Run pipeline**.
3. De uitvoer staat bij de job onder **Build** → **Jobs**.

```yaml
variables:
  NMC_TAG:
    value: "main-b21f043"
    description: "Tag van het NMC-image op GHCR, bv. main-<sha7> of een releasetag"

kopieer-nmc-image:
  image: quay.io/skopeo/stable:latest
  script:
    - |
      : "${NMC_HARBOR_ROBOT:?projectvariabele NMC_HARBOR_ROBOT ontbreekt}"
      : "${NMC_HARBOR_SECRET:?projectvariabele NMC_HARBOR_SECRET ontbreekt}"

      # De login komt in een authfile, zodat het secret nergens als argument van een commando staat.
      # skopeo verwacht dat dat bestand nog niet bestaat of geldige JSON bevat; een leeg bestand faalt.
      AUTHFILE="$(mktemp -d)/auth.json"
      printf '%s' "$NMC_HARBOR_SECRET" | skopeo login --authfile "$AUTHFILE" --username "$NMC_HARBOR_ROBOT" --password-stdin "$HARBOR_PAZ1_REGISTRY"

      BRON="docker://ghcr.io/minbzk/moza-notificatiemanagementcomponent:$NMC_TAG"
      DOEL="docker://$HARBOR_PAZ1_REGISTRY/$HARBOR_PAZ1_PROJECT/moza-notificatiemanagementcomponent:$NMC_TAG"
      skopeo inspect --format "GHCR:   {{.Digest}}" "$BRON"
      skopeo copy --preserve-digests --dest-authfile "$AUTHFILE" "$BRON" "$DOEL"
      skopeo inspect --authfile "$AUTHFILE" --format "Harbor: {{.Digest}}" "$DOEL"
```

- Het secret komt niet in de joblog en staat nergens als argument van een commando: het
  gaat via stdin naar `skopeo login`, dat de login in een tijdelijk authfile zet.
- De eerste twee regels stoppen de job met een duidelijke melding als een van de
  projectvariabelen ontbreekt.
- `NMC_TAG` staat als globale variabele met een `description` bovenaan, zodat GitLab hem
  als vooringevuld veld toont bij **Run pipeline**; binnen een job werkt dat niet.
- Kies een tag die niet verandert: `main-<sha7>` of een releasetag. `pr-<n>`-tags
  worden bij elke push overschreven, en er is geen `latest`-tag. Bestaande tags en hun
  digests staan op
  [de packages-pagina](https://github.com/MinBZK/moza-notificatiemanagementcomponent/pkgs/container/moza-notificatiemanagementcomponent);
  de tag van de laatste commit op `main` is `main-` plus de eerste zeven tekens van de
  commit-hash.
- Commando's met dubbele punt plus spatie (`--format "GHCR:   ..."`) moeten in een
  `- |`-blok staan; los leest YAML ze als sleutel-waardepaar.
- Voor een ander image, bv. dat van de Profielservice, volstaat het om de image-naam in
  `BRON` en `DOEL` en de standaardwaarde van `NMC_TAG` aan te passen.

## Controleren

- In de joblog: `Login Succeeded!` en twee gelijke digests achter `GHCR:` en `Harbor:`.
- In Harbor: project `gs` → **Repositories** → `moza-notificatiemanagementcomponent`.
  Het artifact staat er met de tag en dezelfde digest.

## Foutmeldingen

| Melding | Betekenis |
|---|---|
| job blijft op *pending* staan | er is geen runner beschikbaar; controleer of de instance-runners aanstaan (stap 1) |
| `projectvariabele ... ontbreekt` | `NMC_HARBOR_ROBOT` of `NMC_HARBOR_SECRET` is niet gezet, of staat op Protected terwijl de pipeline op een onbeschermde branch draait |
| `invalid username/password` bij `skopeo login` | robotnaam en secret horen niet bij elkaar, of het robotaccount is verlopen of uitgeschakeld; vergelijk met **Robot Accounts** in Harbor |
| `unauthorized to access repository: ..., action: push` | het robotaccount mag niet pushen naar dit project |
| `manifest unknown` bij de eerste `skopeo inspect` | de tag in `NMC_TAG` bestaat niet op GHCR |
| `skopeo copy` faalt met een melding over een quotum of `exceed the configured upper limit` (exacte tekst niet geverifieerd) | het opslagquotum van Harbor-project `gs` is vol; vraag de projectbeheerder of Logius om ruimte of opruimen |

## Harbor-project `gs`

- **Bewaarbeleid:** een tag retention policy ruimt dagelijks op. Per repository blijven
  bewaard: de 3 laatst gepushte artifacts (elke tag), de 7 laatst gepushte met een tag
  als `*.*.*`, en `latest`. Een artifact blijft staan als één regel hem bewaart. Van de
  `main-<sha7>`-images blijven er dus 3 over; releasetags als `v1.2.0` vallen onder de
  regel van 7, zodat terugrollen kan naar een van de laatste 7 releases.
- **Scannen:** Harbor scant elk image bij een push met Trivy, maar blokkeert niets op
  basis van die scan ("Prevent vulnerable images from running" staat uit). Het resultaat
  staat bij het artifact.
- **Eisen aan het image:** Logius stelt geen expliciete eisen. Een signature (Cosign of
  Notation) is niet verplicht, en Harbor maakt bij een push geen SBOM. De LPC gaat
  binnenkort ook containers scannen; dat is nog geen eis.

## Het NMC-image

Ter referentie, voor als de LPC later eisen gaat stellen:

- Het image staat publiek op `ghcr.io/minbzk/moza-notificatiemanagementcomponent`,
  gebouwd met jib door `.github/workflows/deploy.yml` in
  [de NMC-repo](https://github.com/MinBZK/moza-notificatiemanagementcomponent). Het heeft een Docker v2-manifest en is
  gecomprimeerd ongeveer 180 MB.
- Base-image `eclipse-temurin:25-jre` (Docker Hub, op tag, niet op digest), draait als
  uid 1001.
- Geen image-signing en geen SBOM.
- Elk image bevat Swagger UI: de build geeft altijd
  `-Dquarkus.swagger-ui.always-include=true` mee, ook op `main`.
- Het image wordt gebouwd met `-DskipTests`; de tests draaien apart in `Maven verify`,
  een verplichte check vóór merge naar `main`.

## Zie ook

- MinBZK/MijnOverheidZakelijk#961: NMC LPC-provisioning (GitLab-project, Harbor,
  namespace, HashiCorp Vault, Postgres).
- MinBZK/MijnOverheidZakelijk#595: acceptatiecriteria LPC-infrastructuurmigratie.
- MinBZK/MijnOverheidZakelijk#1249: afspraken rondom de releasegang.
- MinBZK/MijnOverheidZakelijk#310: versienummering en releasebeheer.
- MinBZK/MijnOverheidZakelijk#1209: secretsbeheer en rotatie.
- MinBZK/MijnOverheidZakelijk#1165: opname in de LPC-loadbalancer en
  hosting-allowlist.
- MinBZK/MijnOverheidZakelijk#865: aansluiten op NotifyNL op LPC.
- MinBZK/MijnOverheidZakelijk#837: ServiceMonitor voor de NMC.
