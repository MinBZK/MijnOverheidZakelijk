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
            DV = softwareSystem "Dienstverlener" "Vakapplicatie (mockup) van een organisatie voor uitwerking van scenario #2"  {
                DVOmcService = container "Output management component" "Routeren van de output van processen naar de juiste kanalen" ""
                DVService = container "Dienstverlener Service" "Een vakapplicatie of service bij een DV die processen start waarbij notificaties verstuurd moeten worden" "" {
                }
                group "Datastores" {
                    DVOMCDatabase = container "Output management component Database" "Bevat status & geschiedenis van contactmomenten" "PostgreSQL" "Database"
                }
            }
        }

        group "Logius" {
            KanaalHerstelDienst = softwareSystem "Kanaalhersteldienst " "Verstuurt brieven t.b.v. het kaneelherstel met burgers of ondernemingen" "Existing System"
            Berichtenbox = softwareSystem "BBO" "De Berichtenbox voor Burgers en Ondernemers" "Existing System"
            NotificatieService = softwareSystem "Notificatie service" "Verstuurt emails & sms naar gebruikers"  {
                !docs notificatiedocs
                KennisgevingService = container "Kennisgeving service" "Regelt communicatie naar NotifyNL en Kanaalherstel" "" "Kennisgeving Service"
                NotifyNL = container "NotifyNL" "Verstuurt emails & sms naar gebruikers" "" "Notificatie Service"
            }
        }

        group "MOZA" {
            MOZA = softwareSystem "Mijn Overheid Zakelijk" "De Mijn Overheid omgeving voor zakelijke gebruikers" {
                MozFE = container "MOZA Frontend" "Portaal voor de NextJS applicatie" "React" "Front-End"
                MozBE = container "MOZA Backend" "Webapplicatie waar een zakelijke gebruiker zijn contactvoorkeuren kan beheren" "NextJS"
            }
            ProfielService = softwareSystem "Profiel Service" "Bevat contactvoorkeuren en contactgegevens van een identificeerbaar persoon"  {
                !docs profielservicedocs
                ProfielServiceBackend = container "Profiel Service" "Bevat contactvoorkeuren en contactgegevens van een identificeerbaar persoon" "C#"
                profielServiceDatabase = container "Profiel service Database" "Bevat basis profielinformatie over ondernemingen" "PostgreSQL" "Database"
            }
            IAM = softwareSystem "IAM Gateway" "Identity Provider / Broker en Access Management System (Keycloak)" "Shared System" {
                !docs iamdocs
                iamService = container "IAM Service" "Service inclusief management portaal voor IAM" "Keycloak" "Front-End"
                iamDatabase = container "IAM Database" "Bevat de authenticatie en autorisatie gegevens" "PostgreSQL" "Database"
            }
        }

        eHerkenning = softwareSystem "eHerkenning" "Identity Provider voor bedrijven" "Existing System"
        DigiD = softwareSystem "DigiD" "Identity Provider voor burgers en ZZP-ers" "Existing System"
        EIDAS = softwareSystem "EIDAS" "Identity Provider voor Europese bedrijven" "Existing System"

        // IAM
        IAM -> eHerkenning "Gebruikt als IDP" "OAUTH2"
        IAM -> DigiD "Gebruikt als IDP" "OAUTH2"
        IAM -> EIDAS "Gebruikt als IDP" "OAUTH2"
        iamService -> iamDatabase "Slaat gegevens op in"

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

        // DVOmcService
        DVOmcService -> NotifyNL "Verstuurt attendering via" ""
        DVOmcService -> ProfielServiceBackend "Haalt profiel informatie op" ""
        DVOmcService -> DVOMCDatabase "Slaat gegevens op in" ""
        // DVOmcService Scenario 9
        DVOmcService -> Berichtenbox "Verstuurt kennisgeving via" ""
        DVOmcService -> KennisgevingService "Verstuurt kennisgeving via" ""

        // Scenario 2v
        DVService -> NotifyNL "Verstuurt attendering via" ""

        // Scenario 8 & 9
        DVService ->  DVOmcService "Start notificatie" ""


        // Berichtenbox
        Berichtenbox -> KennisgevingService "Verstuurt kennisgeving via" ""
        Berichtenbox -> ProfielServiceBackend "Haalt profiel informatie op" ""


        // KennisgevingService
        KennisgevingService -> KanaalHerstelDienst "Kanaal herstel request" ""
        KennisgevingService -> NotifyNL "Verstuurt kennisgeving via" ""
        KennisgevingService -> KvkHandelsregister "Adresgegevens request" ""

        // Deployment groups
        deploymentEnvironment "Ontwikkelomgeving" {
            deploymentNode "LOGIUS-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "Logius" "" "iets:latest" {
                    softwareSystemInstance KanaalHerstelDienst
                    softwareSystemInstance Berichtenbox
                    containerInstance NotifyNL
                    containerInstance ProfielServiceBackend
                    containerInstance KennisgevingService
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
