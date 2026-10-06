```text
████████╗ █████╗  ██████╗  ██████╗██╗  ██╗ █████╗ ████████╗
╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝██║  ██║██╔══██╗╚══██╔══╝
   ██║   ███████║██║  ███╗██║     ███████║███████║   ██║
   ██║   ██╔══██║██║   ██║██║     ██╔══██║██╔══██║   ██║
   ██║   ██║  ██║╚██████╔╝╚██████╗██║  ██║██║  ██║   ██║
   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
        ///  ASMUS HELMS • 2026  ///
```

Jeg hedder Asmus Helms. Jeg er billedkunstner, men nogle gange roder jeg mig ud i webprojekter. Det her er et af dem.

TAGCHAT er et lille sted på nettet, hvor man kan hænge ud som et hoved. Skriv et navn, find et sted at stå, og sig noget. Lidt gamle chatrum, lidt hustage i New York, lidt en idé, som jeg ikke kunne lade være med at prøve.

Der er foreløbigt to rum: tagene og jazzklubben. Ingen konto, ingen profil, ingen krav om et godt brugernavn. Bare op til 16 mennesker i hvert rum og 140 tegn ad gangen.

## Sådan virker det

Klik på et ledigt sted, så dukker dit hoved op dér. Ingen gåtur imellem. Når du skriver, står beskeden ved dit hoved i otte sekunder. Den bliver også stående i rummets chatlog, som kan åbnes og trækkes rundt.

På tagene er der også et par ting at opdage. En vej til jazzklubben, en seddel og noget graffiti. Klik på et åbent billede eller hvor som helst omkring det for at lukke det igen.

Baggrunde og hoveder er GIF-filer. Et hoved fylder 120 × 120 pixels i en verden på 1080 × 1920 pixels. Hele rummet skaleres til skærmen.

## Kør det på din egen computer

Du skal have Node.js installeret. Åbn projektmappen i Terminal og kør:

```bash
npm install
npm start
```

Åbn http://localhost:3000. Lad Terminal være åben, mens serveren kører. Ctrl+C stopper den. To browservinduer kan bruges til at teste med to personer.

## Grafik og klikområder

Grafikken ligger i `public/`:

- `tagene.gif` og `jazzklub.gif`: de to rum.
- `mand1.gif`, `dame1.gif` og eventuelle `avatar1.gif`, `avatar2.gif` osv.: hoveder, som vælges tilfældigt ved indgang. Flere nummererede filer kan tilføjes; genstart serveren bagefter.
- `seddel.gif` og `graff.gif`: billederne, man kan åbne på tagene.
- `tagene_klik.gif`: det skjulte farvekort over tagene.

På klik-kortet betyder rødt, at man ikke kan klikke. Gult sender én til jazzklubben. Den øverste lysegrønne markering åbner sedlen, den nederste åbner graffitien. Mørkegrønt og øvrige farver er almindelig tagflade.

Serveren bruger `rooftops-hit-map.json`, som er genereret fra klik-kortet. Hvis GIF-kortet ændres, skal JSON-kortet også opdateres. Placeringerne følger stadig et usynligt grid med felter på 120 × 120 pixels; feltets centrum skal være tilladt, og der kan kun stå ét hoved pr. felt. Jazzklubbens felter styres af `jazz-map.json`.

## Online

Projektet bruger Node.js, Express og Socket.IO. På Render oprettes det som en Web Service med `npm ci` som build-kommando og `npm start` som start-kommando. Én serverinstans holder styr på begge rum.

De seneste 50 beskeder gemmes i hvert rum, mens serveren kører. Ved genstart forsvinder chatloggen. Det er stadig et lille eksperiment, og jeg bygger videre på det, efterhånden som jeg får idéer.

— Asmus Helms, 2026
