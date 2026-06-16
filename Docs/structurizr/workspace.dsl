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
            DV = softwareSystem "Dienstverlener" "Vakapplicatie (mockup) van een organisatie voor uitwerking voor scenario 2, 8 & 9"  {
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
            NotificatieService = softwareSystem "Notificatiedienst" "Versturen van notificaties en contactherstel" {
                !docs notificatiedocs
                NMC = container "Notificatie Management Component" "Orchestreert notificaties en contactherstel" "" "MOZa, Nog te bouwen" {
                    // Bewust gesplitst voor duidelijkheid; centrale en decentrale intake kunnen ook één API zijn.
                    CentraleRegieAPI = component "Centrale-regie-API" "Controller: intake op identificerend nummer (NMC resolvet)" "REST" "MOZa, Nog te bouwen"
                    DecentraleRegieAPI = component "Decentrale-regie-API" "Controller: intake met reeds opgehaalde gegevens" "REST" "MOZa, Nog te bouwen"
                    AfleverstatusCallback = component "Afleverstatus-callback" "Controller: ontvangt NotifyNL delivery receipts" "REST" "MOZa, Nog te bouwen"
                    Orchestrator = component "Notificatie-orchestrator" "Coordineert voorkeur, opslag, versturen en statusverwerking" "" "MOZa, Nog te bouwen"
                    ProfielAdapter = component "Profielservice-adapter" "Leest voorkeur en invalideert e-mailadres" "" "MOZa, Nog te bouwen"
                    Verzendadapter = component "Verzendadapter" "Verstuurt via NotifyNL (template_id + personalisation)" "bearer-JWT" "MOZa, Nog te bouwen"
                    AdresAdapter = component "Adres-adapter" "Haalt adres op bij KvK Handelsregister of BRP" "" "MOZa, Nog te bouwen"
                    Contactherstelcoordinator = component "Contactherstel-coordinator" "Haalt bij onbereikbaarheid het adres op en meldt dit aan de Contactherstel-dienst" "" "MOZa, Nog te bouwen"
                    ConsumentCallbackAdapter = component "Consument-callback-adapter" "Koppelt afleverstatus terug aan de consument; los van de inkomende NotifyNL-callback" "webhook, CloudEvents (NL GOV), bearer-JWT" "MOZa, Nog te bouwen"
                }
                NotifyNL = container "NotifyNL" "Verstuurt template-berichten, meldt afleverstatus terug" "" "Notificatie Service"
                Contactherstel = container "Contactherstel" "Bepaalt en voert contactherstel uit" "" "Team Geel"
                Printstraat = container "Printstraat" "Verzorgt fysieke verzending" "" "Team Geel"
                notificatiedatabase = container "notificatiedatabase" "Referentie, status en (centrale regie) versleuteld identificerend nummer; tot de callback is verstuurd" "PostgreSQL" "Database, Nog te bouwen"
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
        BRP = softwareSystem "BRP-API" "Adresgegevens o.b.v. BSN" "Existing System"

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
        VerificatieServiceBackend -> NotifyNL "Verstuurd notificatie via" ""

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
        NMC -> NotifyNL "Verstuurt notificatie" "REST, bearer-JWT"
        NotifyNL -> NMC "Delivery receipt (async)" ""
        NMC -> ProfielServiceBackend "Haalt voorkeur op, invalideert e-mailadres" ""
        NMC -> notificatiedatabase "Bewaart verzoek en status" ""
        NMC -> KvkHandelsregister "Adres ophalen (KVK/RSIN)" ""
        NMC -> BRP "Adres ophalen (BSN)" ""
        NMC -> Contactherstel "Meldt onbereikbaar + adres" ""
        NMC -> DVOmcService "Afleverstatus (optioneel)" "webhook, CloudEvents (NL GOV), bearer-JWT"
        Contactherstel -> Printstraat "Fysiek contactherstel" ""
        NotifyNL -> zakelijkeGebruiker "Verstuurt e-mail/SMS" ""
        Printstraat -> zakelijkeGebruiker "Verstuurt brief" ""

        // NMC componenten
        DVService -> CentraleRegieAPI "Initiëren notificatie (identificerend nummer)" ""
        DVOmcService -> DecentraleRegieAPI "Initiëren notificatie (met gegevens)" ""
        NotifyNL -> AfleverstatusCallback "Delivery receipt (async)" ""
        CentraleRegieAPI -> Orchestrator "Delegeert verzoek" ""
        DecentraleRegieAPI -> Orchestrator "Delegeert verzoek" ""
        AfleverstatusCallback -> Orchestrator "Delegeert receipt" ""
        Orchestrator -> ProfielAdapter "Voorkeur ophalen / e-mailadres invalideren" ""
        Orchestrator -> notificatiedatabase "Bewaart en werkt status bij" ""
        Orchestrator -> Verzendadapter "Laat versturen" ""
        Orchestrator -> Contactherstelcoordinator "Triggert contactherstel" ""
        Orchestrator -> ConsumentCallbackAdapter "Koppelt afleverstatus terug (optioneel)" ""
        ConsumentCallbackAdapter -> DVOmcService "Afleverstatus" "webhook, CloudEvents (NL GOV), bearer-JWT"
        ProfielAdapter -> ProfielServiceBackend "Leest voorkeur, invalideert e-mailadres" ""
        Verzendadapter -> NotifyNL "Verstuurt notificatie" "REST, bearer-JWT"
        Contactherstelcoordinator -> AdresAdapter "Adres ophalen" ""
        AdresAdapter -> KvkHandelsregister "Adres ophalen (KVK/RSIN)" ""
        AdresAdapter -> BRP "Adres ophalen (BSN)" ""
        Contactherstelcoordinator -> Contactherstel "Meldt onbereikbaar + adres" ""

        // Deployment groups
        deploymentEnvironment "Ontwikkelomgeving" {
            deploymentNode "LOGIUS-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "Logius" "" "iets:latest" {
                    softwareSystemInstance Berichtenbox
                    containerInstance NotifyNL
                    containerInstance ProfielServiceBackend
                    containerInstance NMC
                    containerInstance Contactherstel
                    containerInstance Printstraat
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
            element "Nog te bouwen" {
                background #E8A33D
                color #000000
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
