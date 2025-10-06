# 4. OpenKlant & OpenZaak voor fase 1

Date: 2025-07-15

## Status

Accepted

## Context

1. **OpenKlant gebruiken i.p.v. een profiel service ontwikkelen**

   OpenKlant is op dit moment te uitgebreid voor de eerste fase; een nadere afweging is pas zinvol zodra de requirements concreter zijn.
   Enkele voorbeelden:
   Een partij kan meerdere digitale adressen hebben, waar wij e-mails naartoe kunnen sturen. Echter, er ontbreekt een mogelijkheid om aan te geven waarvoor een adres bedoeld is (bijv. voor financiële communicatie).
   Daarnaast bevat OpenKlant meerdere velden (zoals rekeningnummer, actor en interne taak) die wij voorlopig niet zouden gebruiken.

2. **OpenZaak inzetten voor zaak gericht werken (ZGW) aan de vakapplicatie kant**

   OpenZaak, eventueel in combinatie met OpenKlant en OpenNotificatie, zou een rol kunnen spelen binnen de dienstverlenende partijen (zoals UWV, Belastingdienst, etc.).
   Voor de eerste fase is dit echter niet aan te raden, gezien de aanzienlijke tijdsinvestering die van deze partijen gevraagd zou worden om ZGW te implementeren.
   In latere fases kan deze optie opnieuw worden overwogen.
   Een belangrijke kanttekening hierbij is dat kanaalherstel momenteel is ingebouwd in de zelfontwikkelde OMC, en niet in het ZGW-ecosysteem.

## Decision

Geen gebruik van OpenZaak & OpenKlant in de eerste fase.

## Consequences

Voor de eerste fase maken we gebruik van de zelfontwikkelde profielservice en OMC.
In latere fases, en zodra de requirements duidelijker zijn, moet deze keuze opnieuw worden overwogen.
