workspace "Mijn Overheid Zakelijk" "Het model voor Mijn Overheid Zakelijk" {
    !docs docs
    !adrs decisions
    model {
        zakelijkeGebruiker = person "Zakelijke Gebruiker" ""
        DVMedewerker = person "Medewerker bij een Dienstverlener" ""

        group "KVK" {
            KvkHandelsregister = softwareSystem "Handelsregister" "De handelsregister api bij de KVK, bevat informatie over organisaties" "Existing System"
            KvkMijnOrganisaties = softwareSystem "Organisatiesregister" "Organisatieregister api bij de kvk, vertaalt bsn naar kvk's" "Existing System"
        }

        group "DI" {
            DV = softwareSystem "Dienstverlener" "Vakapplicatie (mockup) van een organisatie voor uitwerking van de twee regie-modellen"  {
                DVOmcService = container "Output management component" "Routeren van de output van processen naar de juiste kanalen" ""
                DVService = container "Dienstverlener Service" "Een vakapplicatie of service bij een DV die processen start waarbij notificaties verstuurd moeten worden" "" {
                }
                group "Datastores" {
                    DVOMCDatabase = container "Output management component Database" "Bevat status & geschiedenis van contactmomenten" "PostgreSQL" "Database"
                    DVProfielStorage = container "Profiel-opslag" "Eigen contactgegevens en -voorkeuren van de dienstverlener" "" "Database"
                }
            }
        }

        group "Logius" {
            Berichtenbox = softwareSystem "BBO" "De Berichtenbox voor Burgers en Ondernemers" "Existing System"
            NotificatieService = softwareSystem "Notificatiedienst" "Versturen van notificaties" {
                !docs notificatiedocs
                NMC = container "Notificatie Management Component" "Voert de notificatielevenscyclus uit als georkestreerde state machine met eventlog (ADR 0022); geen broker, geen workflow-engine" "Quarkus" "MOZa" {
                    // Koppelvlakken naar de dienstverlener. Bewust gesplitst voor duidelijkheid; centrale en decentrale intake kunnen ook één API zijn.
                    CentraleNotificatieController = component "Centrale-notificatie-controller" "Aanname op identificerend nummer (centrale regie); 202 na opslag van notificatie, eerste taak en eerste event in één transactie" "REST" "MOZa"
                    DecentraleNotificatieController = component "Decentrale-notificatie-controller" "Aanname met e-mailadres (decentrale regie); 202 na opslag in één transactie" "REST" "MOZa"
                    NotificatieStatusController = component "Notificatiestatus-controller" "Status opvragen, zoeken op dvRef-HMAC, annuleren tot aan de claim" "REST" "MOZa, Nog te bouwen"
                    NotificatiestatusFeed = component "Notificatiestatus-feed" "Cursorfeed over het eventlog per DV, gelezen onder het watermerk van de oudste lopende transactie" "REST" "MOZa, Nog te bouwen"
                    // Inkomende events: eerst opslaan, dan bevestigen, daarna verwerken
                    AfleverstatusCallback = component "Afleverstatus-callback" "Ontvangt NotifyNL delivery receipts; slaat het event op zonder e-mailadres en antwoordt daarna 200" "REST, bereikbaar vanaf internet" "MOZa"
                    // Levenscyclus
                    Statusbeheer = component "Statusbeheer" "Enige schrijver van de notificatiestatus: vergrendelt de rij, toetst de overgang, verhoogt de versie; de databasetrigger schrijft het event" "Java, PL/pgSQL-trigger" "MOZa, Nog te bouwen"
                    Verzendverwerker = component "Verzendverwerker" "Stateless workers claimen taken met SKIP LOCKED binnen het verzendbudget en voeren ze per taaksoort uit: verzenden, receipts verwerken, ongeldig melden" "PostgreSQL-jobbibliotheek" "MOZa, Nog te bouwen"
                    AfleverstatusNavraag = component "Afleverstatus-navraag" "Vraagt bij NotifyNL de status op van pogingen zonder receipt (na 1, 6 en 24 uur, daarna dagelijks)" "" "MOZa, Nog te bouwen"
                    NotificatiestatusWebhook = component "Notificatiestatus-webhook" "Leest per DV het eventlog met een cursor, bundelt naar de laatste status en levert op de geregistreerde webhook" "webhook, CloudEvents (NL GOV), bearer-JWT" "MOZa, Nog te bouwen"
                    // Adapters
                    ProfielAdapter = component "Profielservice-adapter" "Leest de voorkeur binnen de verzendtaak (wordt niet opgeslagen); meldt een e-mailadres ongeldig" "" "MOZa"
                    Verzendadapter = component "Verzendadapter" "Verstuurt via NotifyNL (template_id, personalisation, reference = poging) en vraagt de status op" "bearer-JWT" "MOZa"
                }
                NotifyNL = container "NotifyNL" "Verstuurt template-berichten, meldt afleverstatus terug"
                notificatiedatabase = container "notificatiedatabase" "notificatie, poging, taak (lease, due) en event (commit-geordend eventlog zonder persoonsgegevens, maandpartities); versleutelde velden met sleutel per notificatie" "PostgreSQL" "Database, MOZa"
            }
        }

        group "MOZA" {
            MOZA = softwareSystem "Mijn Overheid Zakelijk" "De Mijn Overheid omgeving voor zakelijke gebruikers" {
                MozFE = container "MOZA Frontend" "Portaal voor de NextJS applicatie" "React" "Front-End"
                MozBE = container "MOZA Backend" "Webapplicatie waar een zakelijke gebruiker zijn contactvoorkeuren kan beheren" "NextJS"
            }
            ProfielService = softwareSystem "Profiel Service" "Bevat contactvoorkeuren en contactgegevens van een identificeerbaar persoon"  {
                !docs profielservicedocs
                ProfielServiceBackend = container "Profiel Service" "Bevat contactvoorkeuren en contactgegevens van een identificeerbaar persoon" "Quarkus"
                profielServiceDatabase = container "Profiel service Database" "Bevat basis profielinformatie over ondernemingen" "PostgreSQL" "Database"
            }
            IAM = softwareSystem "IAM Gateway" "Identity Provider / Broker en Access Management System (Keycloak)" "Shared System" {
                !docs iamdocs
                iamService = container "IAM Service" "Service inclusief management portaal voor IAM" "Keycloak" "Front-End"
                iamDatabase = container "IAM Database" "Bevat de authenticatie en autorisatie gegevens" "PostgreSQL" "Database"
            }
            VerificatieService = softwareSystem "Verificatie Service" "Verifieert gebruikers email" {
                !docs verificatieservicedocs
                VerificatieServiceBackend = container "Verificatie Service" "Verantwoordelijk voor het verwerken voor verificatie verzoeken" "Quarkus"
                VerifiecatieServiceDatabase = container "Verificatie Service Database" "Bevat de verificatie gegevens" "PostgreSQL" "Database"
            }
        }

        eHerkenning = softwareSystem "eHerkenning" "Identity Provider voor bedrijven" "Existing System"
        DigiD = softwareSystem "DigiD" "Identity Provider voor burgers en ZZP-ers" "Existing System"
        EIDAS = softwareSystem "EIDAS" "Identity Provider voor Europese bedrijven" "Existing System"

        // Relationships between people and software systems
        DVMedewerker -> DVService "Start notificatie process"
        zakelijkeGebruiker -> MozFE "Beheert profiel via"

        // Relationships between containers
        MozFE -> MozBE "Gebruikt" ""
        MozBE -> IAM "Authenticeert gebruikers via" "OAUTH2"
        MozBE -> ProfielServiceBackend "Leest en bewerkt profiel informatie" ""
        MozBE -> KvkHandelsregister "Haalt bedrijf informatie op" ""
        MozBE -> KvkMijnOrganisaties "Haalt organisaties op." ""
        MozBE -> DVOmcService  "Verzamelt contactmomenten" ""

        // ProfielService
        ProfielServiceBackend -> profielServiceDatabase "Leest en bewerkt profiel informatie"
        ProfielServiceBackend -> VerificatieServiceBackend "verifieert email adressen via"

        // VerificatieService
        VerificatieServiceBackend -> VerifiecatieServiceDatabase "Slaat gegevens op in" ""
        VerificatieServiceBackend -> NotifyNL "Verstuurt notificatie via" ""

        // IAM
        IAM -> eHerkenning "Gebruikt als IDP" "OAUTH2"
        IAM -> DigiD "Gebruikt als IDP" "OAUTH2"
        IAM -> EIDAS "Gebruikt als IDP" "OAUTH2"
        iamService -> iamDatabase "Slaat gegevens op in"

        // OMC (decentrale regie)
        DVOmcService -> DVOMCDatabase "Slaat gegevens op in" ""
        DVOmcService -> DVProfielStorage "Haalt contactgegevens op" ""
        DVOmcService -> Berichtenbox "Verstuurt kennisgeving via" ""
        DVOmcService -> NMC "Initiëren notificatie (decentrale regie)" ""

        DVService -> DVOmcService "Start notificatie" ""
        DVService -> NMC "Initiëren notificatie (centrale regie)" ""


        // Berichtenbox
        Berichtenbox -> NMC "Verstuurt kennisgeving" ""
        Berichtenbox -> ProfielServiceBackend "Haalt profiel informatie op" ""


        // Notificatiedienst
        NMC -> NotifyNL "Verstuurt notificatie, vraagt status op" "REST, bearer-JWT"
        NotifyNL -> NMC "Delivery receipt (async)" ""
        NMC -> ProfielServiceBackend "Haalt voorkeur op binnen de verzendtaak, meldt e-mailadres ongeldig" ""
        NMC -> notificatiedatabase "State machine, taken en eventlog in één transactie" ""
        NMC -> DVOmcService "Notificatiestatus (optionele webhook)" "webhook, CloudEvents (NL GOV), bearer-JWT"
        NMC -> DVService "Notificatiestatus (optionele webhook)" "webhook, CloudEvents (NL GOV), bearer-JWT"
        DVOmcService -> NMC "Leest eventfeed, vraagt status op" "REST"
        DVService -> NMC "Leest eventfeed, vraagt status op" "REST"
        NotifyNL -> zakelijkeGebruiker "Verstuurt e-mail/SMS" ""

        // NMC componenten: koppelvlakken
        DVService -> CentraleNotificatieController "Aanname (identificerend nummer)" ""
        DVOmcService -> DecentraleNotificatieController "Aanname (e-mailadres)" ""
        DVService -> NotificatieStatusController "Status, zoeken, annuleren" ""
        DVOmcService -> NotificatieStatusController "Status, zoeken, annuleren" ""
        DVService -> NotificatiestatusFeed "Leest events met cursor" ""
        DVOmcService -> NotificatiestatusFeed "Leest events met cursor" ""
        NotifyNL -> AfleverstatusCallback "Delivery receipt (async)" ""
        NotificatiestatusWebhook -> DVOmcService "Notificatiestatus" "webhook, CloudEvents (NL GOV), bearer-JWT"
        NotificatiestatusWebhook -> DVService "Notificatiestatus" "webhook, CloudEvents (NL GOV), bearer-JWT"

        // NMC componenten: levenscyclus
        CentraleNotificatieController -> Statusbeheer "Aanname: notificatie, eerste taak en eerste event in één transactie" ""
        DecentraleNotificatieController -> Statusbeheer "Aanname: notificatie, eerste taak en eerste event in één transactie" ""
        NotificatieStatusController -> Statusbeheer "Annuleren" ""
        NotificatieStatusController -> notificatiedatabase "Leest status" ""
        AfleverstatusCallback -> notificatiedatabase "Slaat inkomend event en verwerktaak op" ""
        Verzendverwerker -> notificatiedatabase "Claimt taken (SKIP LOCKED, verzendbudget); rondt af of stelt uit" ""
        Verzendverwerker -> Statusbeheer "Voert overgang uit" ""
        Verzendverwerker -> ProfielAdapter "Voorkeur ophalen; ongeldig melden" ""
        Verzendverwerker -> Verzendadapter "Laat versturen" ""
        Verzendverwerker -> AfleverstatusNavraag "Voert reconciliatietaak uit" ""
        AfleverstatusNavraag -> Verzendadapter "Vraagt status op" ""
        AfleverstatusNavraag -> Statusbeheer "Overgang bij late of ontbrekende receipt" ""
        Statusbeheer -> notificatiedatabase "FOR UPDATE; status en versie; trigger schrijft event" ""
        NotificatiestatusFeed -> notificatiedatabase "Leest eventlog onder het watermerk (replica)" ""
        NotificatiestatusWebhook -> notificatiedatabase "Leest eventlog per DV met cursor; schrijft bevestiging" ""

        // NMC componenten: adapters
        ProfielAdapter -> ProfielServiceBackend "Leest voorkeur, meldt e-mailadres ongeldig" ""
        Verzendadapter -> NotifyNL "Verstuurt notificatie, vraagt status op" "REST, bearer-JWT"

        // Deployment groups
        deploymentEnvironment "Ontwikkelomgeving" {
            deploymentNode "LOGIUS-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "Logius" "" "iets:latest" {
                    softwareSystemInstance Berichtenbox
                    containerInstance NotifyNL
                    containerInstance ProfielServiceBackend
                    containerInstance NMC
                }
            }
            deploymentNode "DV-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "DV" "" "iets:latest" {
                    containerInstance DVOmcService
                    containerInstance DVService
                }
            }
            deploymentNode "LOGIUS-MOZ-ONT" "" "ODCN" {
                deploymentNode "client-zakelijk" "" "nodejs/react" {
                    containerInstance MozBE
                }
                deploymentNode "iam-deployment" "" "iam:latest" {
                    softwareSystemInstance IAM
                    containerInstance iamService
                    containerInstance iamDatabase
                }
            }
            deploymentNode "eHerkenning-ONT" "" "OAUTH-2" {
                deploymentNode "eHerkenning-deployment" "" "Keycloak" {
                    softwareSystemInstance eHerkenning
                }
            }
        }
        deploymentEnvironment "Profielservicedeployment" {
                deploymentNode "LOGIUS-O-ENVIRONMENT" "" "Ergens" {
                    deploymentNode "Logius" "" "iets:latest" {
                        containerInstance ProfielServiceDatabase
                        containerInstance ProfielServiceBackend
                    }
                }
        }
    }




    views {
        systemLandscape "SysteemLandschap" "Systeem Landschap diagram" {
            include *
            autoLayout
        }
        systemContext MOZA "MOZAContext" {
            include *
            autoLayout
        }

        systemContext ProfielService "ProfielServiceContext" {
            include *
            autoLayout
        }
        systemContext NotificatieService "NotificatieServiceContext" {
            include *
            autoLayout
        }
        systemContext VerificatieService "VerificatieServiceContext" {
            include *
            autoLayout
        }
        systemContext Berichtenbox "BerichtenboxContext" {
            include *
            autoLayout
        }

        systemContext IAM "IAMContext" {
            include *
            autoLayout
        }

        container MOZA "MOZAContainer" {
            include *
            autoLayout
        }

        container DV "DVContainer" {
            include *
            autoLayout
        }

        container ProfielService "ProfielServiceContainer" {
            include *
            autoLayout
        }

        container NotificatieService "NotificatieServiceContainer" {
            include *
            autoLayout
        }

        component NMC "NMCComponents" "Componenten binnen het Notificatie Management Component" {
            include *
            autoLayout
        }

        dynamic NMC "NMCVerzending" "Verzending, receipt en overgang (centrale regie, geslaagde aflevering)" {
            DVService -> CentraleNotificatieController "Aanname (identificerend nummer)"
            CentraleNotificatieController -> Statusbeheer "Notificatie, verzendtaak en event aangenomen in één transactie; 202"
            Verzendverwerker -> notificatiedatabase "Claimt de verzendtaak (SKIP LOCKED, verzendbudget)"
            Verzendverwerker -> ProfielAdapter "Voorkeur ophalen"
            Verzendverwerker -> Verzendadapter "Laat versturen (reference = poging)"
            Verzendadapter -> NotifyNL "POST; 201 met NotifyNL-id"
            Verzendverwerker -> Statusbeheer "Overgang aangenomen naar verzonden; taak afgerond"
            NotifyNL -> AfleverstatusCallback "Delivery receipt: delivered"
            AfleverstatusCallback -> notificatiedatabase "Slaat receipt op zonder e-mailadres; 200"
            Verzendverwerker -> Statusbeheer "Overgang verzonden naar bezorgd"
            NotificatiestatusWebhook -> notificatiedatabase "Leest events per DV met cursor"
            NotificatiestatusWebhook -> DVService "Notificatiestatus bezorgd"
            autoLayout
        }


        container VerificatieService "VerificatieServiceContainer" {
            include *
            autoLayout
        }

        deployment * "Ontwikkelomgeving" "Ontwikkelomgeving" "Omgeving voor MOZ"  {
            include *
            autoLayout
        }

        deployment ProfielService "Profielservicedeployment" "ProfielServiceDeployment" "Omgeving voor MOZ"  {
            include *
            autoLayout
        }

        styles {
            element "Existing System" {
                background #bbbbbb
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Shared System" {
                background #ffb612
                color #000000
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "MOZa" {
                background #E8A33D
                color #000000
            }
            element "Nog te bouwen" {
                border dashed
                opacity 70
            }
            element "Person" {
                background #08427b
                color #ffffff
                shape Person
            }
            element "Database" {
                shape Cylinder
            }
            element "Object Store" {
                shape Folder
            }
            element "Front-End" {
                shape WebBrowser
            }

            element "Refine" {
                background #990000
            }
        }
    }
}
