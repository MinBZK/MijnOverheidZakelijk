# 12. Repositories op GitHub

Date: 2026-14-01

## Status

Proposed

## Context

Het project Mijn Overheid Zakelijk (MOZa) zal bestaan uit verschillende repositories. Deze worden conform [beleid](https://www.digitaleoverheid.nl/overzicht-van-alle-onderwerpen/open-source/beleid/) publiek beschikbaar gemaakt.

## Decision

Het Ministerie van Binnenlandse Zaken en Koninkrijksrelaties heeft hiervoor een GitHub‑organisatie gemaakt [MinBZK](https://github.com/MinBZK). Hieronder worden alle repositories van MOZa geplaatst met prefix ["moza-"](https://github.com/MinBZK?q=moza-#org-profile-repositories) en [topic mijnoverheidzakelijk](https://github.com/topics/mijnoverheidzakelijk).

## Consequences

Er zijn een reeks richtlijnen voor publieke open source projecten, vanuit publieke organisaties. 

### Open Source richtlijnen

Projecten op GitHub worden vergeleken met [Open Source standaarden](https://opensource.guide/). Elk project heeft hier
ook een checklist pagina voor binnen GitHub, te vinden op `https://github.com/MinBZK/<Projectnaam>/community`.

developer.overheid.nl heeft hier ook [handleidingen](https://developer.overheid.nl/kennisbank/open-source/) voor 
opgesteld op basis van de [standaard voor publieke code](https://codefor.nl/community-translations-standard/nl/).

#### Standaard richtlijnen vanuit MinBZK
Standaard krijgt elke repository richtlijnen mee vanuit de MinBZK organisatie. Deze worden beschikbaar gemaakt op
de pagina's op GitHub van de repository. Dit gaat om:

* Code of conduct, richtlijnen voor samenwerking in het project.
* Contributing, richtlijnen over hoe bijgedragen kan worden.
* Security, richtlijnen over hoe met security omgegaan wordt.
 
Controleer of deze richtlijnen toepasselijk en volledig zijn. Mocht dit niet zo zijn, dan kan er een eigen bestand in de
hoofdfolder geplaatst worden, respectievelijk genaamd `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` en `SECURITY.md`.



#### GitHub Community Standards checklist

Om aan de checklist op Github te voldoen zijn de volgende bestanden nodig: 

* Introductie in bestand `README.md`. Hierin wordt een korte samenvatting van het project gegeven met relevante extra 
  informatie. Zie [de handleiding bij developer.overheid.nl](https://developer.overheid.nl/kennisbank/open-source/standaarden/readme-md)
  * Overweeg om de status van het project aan te geven met [shields.io](https://shields.io/). Bijvoorbeeld 
      * ![Project Pre-Alpha Status](https://img.shields.io/badge/life_cycle-pre_alpha-red)
        ![Project Alpha Status](https://img.shields.io/badge/life_cycle-alpha-orange)
        ![Project Beta Status](https://img.shields.io/badge/life_cycle-beta-yellow)
        ![Project Production Status](https://img.shields.io/badge/life_cycle-production-green)
    * ![GitHub Licence](https://img.shields.io/github/license/MinBZK/MijnOverheidZakelijk)
    * ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/minbzk/mijn-bureau-infra/ci.yaml)
* Licentieverklaring in bestand `LICENSE` of `LICENSE.md`. Kies een licentie en plaats die in dit bestand.
  [Meestal is EUPL-1.2 passend](https://developer.overheid.nl/kennisbank/open-source/tutorials/open-source-software-licenties).
  Wanneer de
  [Engelse versie](https://interoperable-europe.ec.europa.eu/sites/default/files/custom-page/attachment/2020-03/EUPL-1.2%20EN.txt)
  geplaatst wordt, herkent GitHub deze en wordt deze direct als titel afgebeeld. Wanneer de
  [Nederlandse versie](https://interoperable-europe.ec.europa.eu/sites/default/files/inline-files/EUPL%20v1_2%20NL.txt)
  geplaatst wordt, is de titel 'License' en moet doorgeklikt worden om de licentie te bepalen.
* Issue templates. GitHub heeft voorbeeld templates voor Bugs, Features en Custom templates. Dit kan helpen om de juiste
  informatie in issues te krijgen. Zie
  [About issue and pull request templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates)
* Pull Request template. Dit helpt om te zorgen dat de juiste informatie toegevoegd wordt en standaard checks uitgevoerd
  worden voor het mergen. Zie
  [Creating a pull request template for your repository](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

#### Mogelijke toevoegingen

Daarnaast is het mogelijk om hier enkele toevoegingen op te doen. Ga na of deze nodig zijn of niet.

* Governance met `GOVERNANCE.md`. Hierin kan beschreven worden hoe besluiten genomen worden in het project, 
  bijvoorbeeld over hoe product- en technische keuzes gemaakt worden. Voorbeeld zijn o.a. te vinden bij
  [Public Code](https://github.com/publiccodenet/about/blob/develop/activities/supporting-codebase-governance/index.md),
  toegepast en vertaald in
  [Mijn Bureau](https://github.com/MinBZK/mijn-bureau/blob/main/GOVERNANCE.md), of [OSPO-NL](https://github.com/ospo-nl/kennisbank/blob/main/docs/nieuw-project/PROJECT_GOVERNANCE.md).
* Support met `SUPPORT.md`. Hier kan beschreven worden hoe gebruikers ondersteuning kunnen krijgen vanuit het project.
  Zie [Adding support resources to your project](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-support-resources-to-your-project)
* Toevoeging open source softwarecatalogi bestand met `publiccode.yml`. Hier is [een tool](https://developer.overheid.nl/kennisbank/open-source/tools/publiccode-yml-editor)
  voor, of deze kan via [een template](https://developer.overheid.nl/kennisbank/open-source/tutorials/voeg-een-publiccode-yml-bestand-toe)
  opgesteld worden.

### Security

* Overweeg om [OpenSSF scorecard](https://securityscorecards.dev/#what-is-openssf-scorecard) toe te voegen aan het
  project. Hiermee worden veel best practices gecontroleerd.
