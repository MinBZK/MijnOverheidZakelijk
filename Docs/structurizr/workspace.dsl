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
                NMC = container "Notificatie Management Component" "Voert de notificatielevenscyclus uit als state machine met eventlog in PostgreSQL (ADR 0024)" "Quarkus" "MOZa" {
                    // Koppelvlakken naar de dienstverlener. Bewust gesplitst voor duidelijkheid; centrale en decentrale intake kunnen ook één API zijn.
                    CentraleNotificatieController = component "Centrale-notificatie-controller" "Aanname op identificerend nummer (centrale regie); 202 na opslag in één transactie; quota per DV" "REST over FSC, OAuth2-token met OIN" "MOZa"
                    DecentraleNotificatieController = component "Decentrale-notificatie-controller" "Aanname met e-mailadres (decentrale regie); 202 na opslag in één transactie" "REST over FSC, OAuth2-token met OIN" "MOZa"
                    NotificatieStatusController = component "Notificatiestatus-controller" "Status opvragen, zoeken op dvRef en annuleren, binnen de eigen DV" "REST over FSC, OAuth2-token met OIN" "MOZa, Nog te bouwen"
                    NotificatiestatusFeed = component "Notificatiestatus-feed" "Cursorfeed van CloudEvents per DV over het eventlog; de DV bevestigt met de cursor" "REST over FSC, CloudEvents (NL GOV), OAuth2-token met OIN" "MOZa, Nog te bouwen"
                    // Inkomende events: eerst opslaan, dan bevestigen, daarna verwerken
                    AfleverstatusCallback = component "Afleverstatus-callback" "Ontvangt NotifyNL delivery receipts: valideert, slaat op als taak en antwoordt 200" "REST, bereikbaar vanaf internet, bearer-token" "MOZa"
                    // Levenscyclus
                    Statusbeheer = component "Statusbeheer" "Enige schrijver van de notificatiestatus: vergrendelt de rij, toetst de overgang en schrijft het event" "Java, PL/pgSQL-trigger" "MOZa, Nog te bouwen"
                    Verzendverwerker = component "Verzendverwerker" "Stateless workers die taken claimen (SKIP LOCKED, verzendbudget) en per taaksoort uitvoeren" "Java, SQL" "MOZa, Nog te bouwen"
                    AfleverstatusNavraag = component "Afleverstatus-navraag" "Vraagt bij NotifyNL de status op van pogingen zonder receipt; 404 geeft bezorgstatus-onbekend" "" "MOZa, Nog te bouwen"
                    NotificatiestatusWebhook = component "Notificatiestatus-webhook" "Terugkoppeltaak per DV: levert events op de webhook vanaf een eigen leverpositie" "webhook, CloudEvents (NL GOV), bearer-JWT met aud" "MOZa, Nog te bouwen"
                    // Adapters
                    ProfielAdapter = component "Profielservice-adapter" "Leest de voorkeur binnen de verzendtaak (wordt niet opgeslagen); meldt een e-mailadres ongeldig" "" "MOZa"
                    Dienstverlenerregister = component "Dienstverlenerregister" "Koppelt het OIN aan de dvId; berichttypen, quota, webhook en termijnen per DV" "" "MOZa, Nog te bouwen"
                    Sleutelbeheer = component "Sleutelbeheer" "Sleutel per notificatie onder de KEK uit de sleutelvoorziening; wissen van de sleutel is de wisactie" "" "MOZa, Nog te bouwen"
                    Verzendadapter = component "Verzendadapter" "Verstuurt via NotifyNL (template, personalisation, reference = poging) en vraagt statussen op" "bearer-JWT" "MOZa"
                }
                NotifyNL = container "NotifyNL" "Verstuurt template-berichten, meldt afleverstatus terug"
                notificatiedatabase = container "notificatiedatabase" "dienstverlener, notificatie, poging, taak, verzendbudget, event (eventlog), bevestiging, webhookpositie" "PostgreSQL" "Database, MOZa"
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

        Sleutelvoorziening = softwareSystem "Sleutelvoorziening" "Bewaart de KEK en de peppers van het NMC" "Existing System"
        LDV = softwareSystem "Logboek Dataverwerkingen" "Verwerkingslog van MOZa (ClickHouse), gevuld via de LDV-wrapper" "Shared System"
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
        NMC -> Sleutelvoorziening "Haalt de KEK en de peppers op bij het opstarten" ""
        NMC -> LDV "Schrijft verwerkingsregistraties" ""
        NMC -> DVOmcService "Notificatiestatus (optionele webhook)" "webhook, CloudEvents (NL GOV), bearer-JWT"
        NMC -> DVService "Notificatiestatus (optionele webhook)" "webhook, CloudEvents (NL GOV), bearer-JWT"
        DVOmcService -> NMC "Leest eventfeed en bevestigt, vraagt status op" "REST over FSC, OAuth2-token met OIN"
        DVService -> NMC "Leest eventfeed en bevestigt, vraagt status op" "REST over FSC, OAuth2-token met OIN"
        NotifyNL -> zakelijkeGebruiker "Verstuurt e-mail/SMS" ""

        // NMC componenten: koppelvlakken
        DVService -> CentraleNotificatieController "Aanname (identificerend nummer)" ""
        DVOmcService -> DecentraleNotificatieController "Aanname (e-mailadres)" ""
        DVService -> NotificatieStatusController "Status, zoeken, annuleren" ""
        DVOmcService -> NotificatieStatusController "Status, zoeken, annuleren" ""
        DVService -> NotificatiestatusFeed "Leest events met cursor, bevestigt" ""
        DVOmcService -> NotificatiestatusFeed "Leest events met cursor, bevestigt" ""
        NotifyNL -> AfleverstatusCallback "Delivery receipt (async)" ""
        NotificatiestatusWebhook -> DVOmcService "Notificatiestatus" "webhook, CloudEvents (NL GOV), bearer-JWT"
        NotificatiestatusWebhook -> DVService "Notificatiestatus" "webhook, CloudEvents (NL GOV), bearer-JWT"

        // NMC componenten: levenscyclus
        CentraleNotificatieController -> Statusbeheer "Aanname: notificatie, eerste taak en eerste event in één transactie" ""
        DecentraleNotificatieController -> Statusbeheer "Aanname: notificatie, eerste taak en eerste event in één transactie" ""
        CentraleNotificatieController -> Dienstverlenerregister "Toetst OIN, berichttype en quotum" ""
        DecentraleNotificatieController -> Dienstverlenerregister "Toetst OIN, berichttype en quotum" ""
        NotificatieStatusController -> Dienstverlenerregister "Toetst OIN" ""
        NotificatiestatusFeed -> Dienstverlenerregister "Toetst OIN; leest termijnen" ""
        NotificatiestatusWebhook -> Dienstverlenerregister "Leest webhook" ""
        Dienstverlenerregister -> notificatiedatabase "Leest dienstverlener" ""
        CentraleNotificatieController -> Sleutelbeheer "Versleutelt nummer en personalisation; HMAC van dvRef" ""
        DecentraleNotificatieController -> Sleutelbeheer "Versleutelt e-mailadres en personalisation; HMAC van dvRef" ""
        NotificatieStatusController -> Statusbeheer "Annuleren" ""
        NotificatieStatusController -> notificatiedatabase "Leest status" ""
        AfleverstatusCallback -> notificatiedatabase "Slaat inkomend event en verwerktaak op" ""
        Verzendverwerker -> notificatiedatabase "Claimt taken (SKIP LOCKED, verdeeld over DV's, verzendbudget); rondt af, stelt uit of markeert mislukt" ""
        Verzendverwerker -> Statusbeheer "Voert overgang uit (claim naar in-verzending of nieuwe poging, verzonden, receipts, verlopen)" ""
        Verzendverwerker -> Sleutelbeheer "Ontsleutelt binnen de verzendtaak en de taak ongeldig melden; wist de sleutel in de wistaak" ""
        Verzendverwerker -> NotificatiestatusWebhook "Voert terugkoppeltaak uit" ""
        Verzendverwerker -> LDV "Schrijft verwerkingsregistraties vóór elke externe aanroep" ""
        NotificatiestatusFeed -> LDV "Schrijft een verwerkingsregistratie per opgevraagde pagina" ""
        Verzendverwerker -> ProfielAdapter "Voorkeur ophalen; ongeldig melden" ""
        Verzendverwerker -> Verzendadapter "Laat versturen" ""
        Verzendverwerker -> AfleverstatusNavraag "Voert reconciliatietaak uit" ""
        AfleverstatusNavraag -> Verzendadapter "Vraagt status op" ""
        AfleverstatusNavraag -> Statusbeheer "Overgang bij late of ontbrekende receipt" ""
        Statusbeheer -> notificatiedatabase "FOR UPDATE vóór elke schrijfactie op de rij; status, versie en event; trigger toetst" ""
        NotificatiestatusFeed -> notificatiedatabase "Leest eventlog onder het watermerk (replica); schrijft de bevestiging" ""
        NotificatiestatusWebhook -> notificatiedatabase "Leest eventlog per DV onder het watermerk vanaf de leverpositie; schrijft de leverpositie" ""
        Sleutelbeheer -> Sleutelvoorziening "Haalt de KEK en de peppers op bij het opstarten" ""

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
                    containerInstance notificatiedatabase
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
            CentraleNotificatieController -> Dienstverlenerregister "Toetst OIN, berichttype en quotum"
            CentraleNotificatieController -> Sleutelbeheer "Versleutelt nummer en personalisation; HMAC van dvRef"
            CentraleNotificatieController -> Statusbeheer "Notificatie, verzendtaak en eerste event in één transactie; 202"
            Verzendverwerker -> notificatiedatabase "Claimt de verzendtaak (SKIP LOCKED, verzendbudget)"
            Verzendverwerker -> Statusbeheer "Overgang aangenomen naar in-verzending, in dezelfde claimtransactie"
            Verzendverwerker -> LDV "Schrijft de LDV-registratie vóór het ophalen van de voorkeur"
            Verzendverwerker -> ProfielAdapter "Voorkeur ophalen"
            Verzendverwerker -> LDV "Schrijft de LDV-registratie vóór het verzenden"
            Verzendverwerker -> Verzendadapter "Laat versturen (reference = poging)"
            Verzendadapter -> NotifyNL "POST; 201 met NotifyNL-id"
            Verzendverwerker -> Statusbeheer "Overgang in-verzending naar verzonden; taak afgerond; plant de navraagtaak"
            NotifyNL -> AfleverstatusCallback "Delivery receipt: delivered"
            AfleverstatusCallback -> notificatiedatabase "Valideert; slaat receipt op als taak zonder e-mailadres (reference = poging); 200"
            Verzendverwerker -> notificatiedatabase "Claimt de receipttaak"
            Verzendverwerker -> Statusbeheer "Overgang verzonden naar bezorgd (NotifyNL-id past op de poging); plant de vaststeltaak"
            Verzendverwerker -> notificatiedatabase "Claimt de vaststeltaak na de vaststellingstermijn (due)"
            Verzendverwerker -> Statusbeheer "Overgang bezorgd naar definitief-bezorgd"
            DVService -> NotificatiestatusFeed "Leest events met cursor; bevestigt"
            NotificatiestatusFeed -> notificatiedatabase "Leest eventlog onder het watermerk; schrijft de bevestiging"
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
