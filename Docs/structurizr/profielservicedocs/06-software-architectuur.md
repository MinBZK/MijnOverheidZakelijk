## Software architectuur


### Systeem Landschap diagram

De Systeem landschap diagram geeft een overzicht van alle actoren binnen het geprojecteerde landschap.  
Dus niet alleen de Profiel Service, maar ook de systemen waarmee deze direct of indirect verbonden mee is.  
Het laat hoogover zien wat benodigd is voor om op verschillende manieren (scenario 2,8 en 9) notificaties te verzenden.

![](embed:SysteemLandschap)



### Systeem Container diagram

![](embed:ProfielServiceContainer)

Dit diagram toont het containerniveau van de Profiel Service en de systemen waarmee deze interageert. De Profiel Service bestaat uit een service-laag met een achterliggende database. Daarnaast raadpleegt de service het Handelsregister, om twee redenen:

1. Het tonen van bedrijfsinformatie aan zakelijke gebruikers via MijnOverheid Zakelijk.
2. Het verstrekken van adresgegevens aan de Berichtenbox voor Burgers en Ondernemers (BBO), wanneer deze daar om vraagt.
