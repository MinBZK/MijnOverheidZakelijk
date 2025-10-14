workspace "Mijn Overheid Zakelijk" "Het model voor Mijn Overheid Zakelijk" {
    !docs docs
    !adrs decisions
    model {
        zakelijkeGebruiker = person "Zakelijke Gebruiker" ""
        RVOMedewerker = person "Medewerker bij RVO" ""
        UWVMedewerker = person "Medewerker bij UWV" ""
        BDMedewerker = person "Medewerker bij BD" ""
        
        group "Belasting Dienst (BD)" {
            BD = softwareSystem "Belastingdienst" "Vakapplicatie (mockup) van een organisatie voor uitwerking van scenario #9"  {
                BdOmcService = container "Output management component" "Routeren van de output van processen naar de juiste kanalen" "C#"
                BDService = container "Belastingdienst Service" "Een vakapplicatie of service bij de BD die processen start waarbij notificaties verstuurd moeten worden" "" {
                }
                
                group "Datastores" {
                    DbOMCDatabase = container "Output management component Database" "Bevat status & geschiedenis van contactmomenten" "PostgreSQL" "Database"
                }
            }
        }

        group "KVK" {
            KvkHandelsregister = softwareSystem "Handelsregister" "De handelsregister api bij de KVK, bevat informatie over organisaties" "Existing System"
            KvkMijnOrganisaties = softwareSystem "Organisatiesregister" "Organisatieregister api bij de kvk, vertaalt bsn naar kvk's" "Existing System"
        }

        group "RVO" {
            RVO = softwareSystem "RVO" "Vakapplicatie (mockup) van een organisatie voor uitwerking van scenario #2"  {
                RVOService = container "RVO Service" "Een vakapplicatie of service bij de RVO die processen start waarbij notificaties verstuurd moeten worden" "" {
                }
            }
        }

        group "UWV" {
            UWV = softwareSystem "UWV" "Vakapplicatie (mockup) van een organisatie voor uitwerking van scenario #8"  {
                UwvOmcService = container "Output management component" "Routeren van de output van processen naar de juiste kanalen" "C#"
                UWVService = container "UWV Service" "Een vakapplicatie of service bij het UWV die processen start waarbij notificaties verstuurd moeten worden" "" {
                }
                
                group "Datastores" {
                    UwvOMCDatabase = container "Output management component Database" "Bevat status & geschiedenis van contactmomenten" "PostgreSQL" "Database"
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
        UWVMedewerker -> UWVService "Start notificatie process"
        zakelijkeGebruiker -> MozFE "Beheert profiel via"
        RVOMedewerker -> RVOService "Start notificatie process"
        BDMedewerker -> BdService "Start notificatie process"

        // RVO Service
        RVOService -> NotifyNL "Verstuurt notificaties via" "API call"

        // Relationships between containers
        MozFE -> MozBE "Gebruikt" ""
        MozBE -> IAM "Authenticeert gebruikers via" "OAUTH2"
        MozBE -> ProfielServiceBackend "Haalt profiel informatie op uit." ""
        MozBE -> KvkHandelsregister "Haalt bedrijfs informatie op uit." ""
        MozBE -> KvkMijnOrganisaties "Haalt organisaties op." ""
        MozBE -> UwvOmcService  "Verzamelt contactmomenten" ""
        MozBE -> BdOmcService  "Verzamelt contactmomenten" ""

        // ProfielService
        ProfielServiceBackend -> profielServiceDatabase "Haalt profiel informatie op" 

        // UwvOmcService
        UwvOmcService -> NotifyNL "Geeft notificatie info aan" ""
        UwvOmcService -> ProfielServiceBackend "Haalt profiel informatie op" ""
        UwvOmcService -> UwvOMCDatabase "Slaat gegevens op in" ""
        
        // BdOmcService
        BdService -> BdOmcService "Start notificatie process" ""

        // BdOmcService
        BdOmcService -> Berichtenbox "Verstuurt kennisgeving naar" ""
        BdOmcService -> ProfielServiceBackend "Haalt profiel informatie op" ""
        BdOmcService -> DbOMCDatabase "Slaat gegevens op in" ""
        BdOmcService -> KennisgevingService "Verstuur direct kennisgeving" ""

        // Berichtenbox
        Berichtenbox -> KennisgevingService "Verstuurt notificaties via" "API call"
        Berichtenbox -> ProfielServiceBackend "Haalt profiel informatie op" ""

        // UWV Service
        UWVService ->  UwvOmcService "Start notificatie" "API call"

        // KennisgevingService
        KennisgevingService -> KanaalHerstelDienst "Verstuurt kanaal herstel" ""
        KennisgevingService -> NotifyNL "Verstuurt notificatie via" ""
        KennisgevingService -> KvkHandelsregister "Adresgegevens ophalen" ""

        // Deployment groups
        deploymentEnvironment "Ontwikkelomgeving" {            
            deploymentNode "LOGIUS-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "Logius" "" "iets:latest" {
                    softwareSystemInstance KanaalHerstelDienst
                    softwareSystemInstance Berichtenbox
                    containerInstance NotifyNL
                    containerInstance ProfielServiceBackend
                }
            }
            deploymentNode "BD-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "BD" "" "iets:latest" {
                    containerInstance BdOmcService
                    containerInstance BDService
                }
            }          
            deploymentNode "RVO-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "RVO" "" "iets:latest" {
                    containerInstance RVOService
                }
            }
            deploymentNode "UWV-O-ENVIRONMENT" "" "Ergens" {
                deploymentNode "UWV" "" "iets:latest" {
                    containerInstance UwvOmcService
                    containerInstance UWVService
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

        container UWV "UWVContainer" {
            include *
            autoLayout
        }

        container RVO "RVOContainer" {
            include *
            autoLayout
        }
                
        container BD "BDContainer" {
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