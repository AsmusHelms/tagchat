```text
████████╗ █████╗  ██████╗  ██████╗██╗  ██╗ █████╗ ████████╗
╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝██║  ██║██╔══██╗╚══██╔══╝
   ██║   ███████║██║  ███╗██║     ███████║███████║   ██║
   ██║   ██╔══██║██║   ██║██║     ██╔══██║██╔══██║   ██║
   ██║   ██║  ██║╚██████╔╝╚██████╗██║  ██║██║  ██║   ██║
   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
        ///  ASMUS HELMS • 2026  ///
```


Jeg hedder Asmus Helms. Jeg er billedkunstner, men arbejder indimellem også med webprojekter. TAGCHAT er en browserbaseret multiplayer-chat med rum og grafik, som jeg tegner selv.

## Funktioner

- To rum: tagene og jazzklubben, med op til 16 brugere i hvert.
- Adgang med et alias på højst 16 tegn. Ingen registrering; aliases behøver ikke være unikke.
- Klik på et ledigt felt for at flytte med det samme. Ingen bevægelsesanimation.
- Tilfældigt avatarlook ved indgang. Avatarer er 120 × 120 pixels i verdensmål.
- Beskeder på højst 140 tegn, vist som talebobler i otte sekunder.
- Separat chatlog for hvert rum i et vindue, som kan trækkes rundt.
- Rumskift gennem overgangsfelter.
- Klikområder på tagene åbner sedler og graffiti. Klik hvor som helst for at lukke billedet.
- `/help` åbner en foreløbig hjælpetekst, kun for den bruger, der skriver kommandoen.

Verdenen er 1080 × 1920 pixels og skaleres til den synlige skærmhøjde. Positioner følger et usynligt grid med 9 × 16 felter på 120 × 120 pixels. Der kan stå én bruger pr. felt.

## Versions- og deploymenthistorik

Historikken beskriver de leverede projektversioner og forberedelsen til hosting på Render via GitHub. Datoer for de enkelte Render-deploys er ikke registreret her. De tidlige opdateringer er derfor angivet i rækkefølge uden en præcis dato. Daterede poster angiver projektopdateringer, ikke en bekræftet udgivelse på Render.

| Dato | Opdatering | Indhold |
| --- | --- | --- |
| Begyndelsen af oktober 2026 — præcis dato ikke registreret | Første prototype, v0.1 | Ét rum, højst 10 brugere, alias, klikbevægelse, blokerede gridfelter, 140 tegn pr. besked, talebobler og chatlog. Multiplayer med Node.js og Socket.IO. |
| Efter v0.1 — præcis dato ikke registreret | TAGCHAT v1 | Projektnavn, hele aliases uden afkortning, skrivemaskinefont og sort baggrund uden om rummet. |
| Efter navne- og layoutopdateringen — præcis dato ikke registreret | Første grafik | GIF-baggrund og avatar. Blokering af tagkanter, områder uden for tagene, den runde konstruktion og ovenlysvinduet. Kontrol af klik og startplacering på serveren. |
| Efter første grafik — præcis dato ikke registreret | Hosting på Render via GitHub | Projektet blev gjort klar til en Node Web Service med `npm ci` og `npm start`. GitHub blev valgt som kilde til opdateringer. Første live-deploys præcise dato er ikke registreret. |
| Efter hostingopsætningen — præcis dato ikke registreret | Mobilvisning og flere rum | Talebobler over avatarerne, flytbart chatvindue, tilpasning til skærmhøjde og mobiltastatur, 16 brugere pr. rum, rumvælger, separate chatlogs og tilfældige avatarlooks. |
| Før ASCII-logoet — præcis dato ikke registreret | Klik-kort og større avatarer | Avatarstørrelse på 120 × 120 pixels. Ny tagbaggrund, farvekort med blokerede områder, overgang til jazzklubben og billedområder til `seddel.gif` og `graff.gif`. Tilfældige looks fra `mand1.gif` og `dame1.gif`. |
| 6. oktober 2026 | Logo, README og klikområder | ASCII-logo over aliasfeltet og i README. Introduktion skrevet fra mig til andre. Opdateret klik-kort med større områder til rumskift og billeder. |
| 8. oktober 2026 | Nye grafikker, overgange og hjælp | Nye tag- og klubbaggrunde. De gamle avatarer erstattet af `avatar1.gif`–`avatar3.gif`. Dropdown fjernet; rumskift via gult felt på tagene og døren øverst til højre i klubben. Nyt område til `seddel2.gif`. `/help` åbner en foreløbig tekst uden at blive sendt til chatloggen. |
| 11. oktober 2026 | Justering af design | Lysegrå panelflader erstattet af sort. Tyndere skillelinjer, færre rammer, orange handlinger og cyan labels. Ingen ændring af illustrationer eller funktioner. |
| 11. oktober 2026 | Design og interface | Samlet designsystem med 28 MS Paint-farver, hardwareinspirerede knapper og paneler, tekniske labels og forbindelsesstatus. Responsivt layout, fokusmarkeringer og ensartede fejl- og hjælppaneler. Illustrationer og funktioner bevaret. |
| 9. oktober 2026 | Dokumentation | README gjort mere nøgtern. Versionshistorik tilføjet, og vejledninger samlet. Ingen ændringer i funktionerne. |

## Kør lokalt

Installér Node.js. Åbn projektmappen i Terminal og kør:

```bash
npm install
npm start
```

Åbn [http://localhost:3000](http://localhost:3000). Lad Terminal være åben, mens serveren kører. Stop med Ctrl+C. To browservinduer kan bruges til at teste flere brugere.

## Grafik og klikområder

Filerne ligger i `public/`:

| Fil | Funktion |
| --- | --- |
| `tagene.gif` | Baggrund til tagene. |
| `jazzklub.gif` | Baggrund til jazzklubben. |
| `avatar1.gif`, `avatar2.gif`, `avatar3.gif` osv. | Tilfældige avatarlooks. Flere nummererede filer opdages ved serverstart. |
| `seddel.gif`, `seddel2.gif`, `graff.gif` | Billeder, som åbnes fra tagene. |
| `tagene_klik.gif` | Skjult farvekort med klikområder. |

Farvekortets røde områder afviser klik. Gult skifter til jazzklubben. Det lysegrønne felt øverst til højre åbner `seddel2.gif`, feltet ved den runde konstruktion åbner `seddel.gif`, og det nederste åbner `graff.gif`. Mørkegrønt og øvrige farver behandles som almindelig tagflade.

Serveren bruger `rooftops-hit-map.json`, genereret fra farvekortet. Efter ændringer i `tagene_klik.gif` skal kortet genopbygges:

```bash
python3 scripts/build_hit_map.py
```

Scriptet kræver Python og Pillow. Genstart serveren efter ændringer. Et gridfelts centrum skal være tilladt, før en bruger kan stå der.

Jazzklubbens blokerede felter styres af `jazz-map.json`. Overgangen tilbage til tagene er defineret i `server.js` ved døren øverst til højre. Den foreløbige hjælpetekst kan ændres i `public/index.html`.

## Deploy på Render

Projektet bruger Node.js, Express og Socket.IO. Én serverinstans holder styr på begge rum.

| Indstilling | Værdi |
| --- | --- |
| Service | Web Service |
| Runtime | Node |
| Build command | `npm ci` |
| Start command | `npm start` |
| Root directory | Tom, når projektfilerne ligger i repositoryets rod. |

Upload projektets indhold til GitHub, inklusive `package.json`, `package-lock.json`, `server.js`, kortfilerne og `public/`. Upload ikke `node_modules` eller zip-filen. Udgiv den nye commit på Render; brug manuel deploy, hvis automatisk deploy ikke er aktiveret.

## Nuværende begrænsninger

De seneste 50 beskeder gemmes i hukommelsen i hvert rum. Ved servergenstart nulstilles chatlogs, og brugerne skal forbindes igen. Efter afbrudt forbindelse kommer brugeren ind på tagene igen.

Der er endnu ingen brugerregistrering, vedvarende historik eller særskilt spam- og botbeskyttelse. Hjælpeteksten er foreløbig.

— Asmus Helms, 2026


## Designsystem — 11. oktober 2026

Webinterfacet bruger en hardwareinspireret ramme med reference til CASIO og klassisk Nintendo-hardware. Sort er den gennemgående baggrund, hvid bruges til tekst og grå til fine skillelinjer. Orange markerer centrale handlinger, cyan bruges til tekniske labels, og gul til hover på primære knapper. Grøn og rød anvendes til forbindelsesstatus. Firkantede knapper har tynde kanter og en kort forskydning ved tryk. Paneler har ingen dekorative slagskygger. Der bruges ingen gradients eller gennemsigtige farvelag.

Alle UI-farver hentes fra de 28 globale CSS-variabler `--paint-01` til `--paint-28` i `public/styles.css`. Semantiske variabler (`--surface`, `--ink`, `--paper`, `--muted`, `--accent`, `--error`) henviser til paletten. Browserens antialiasing af tekst og illustrationernes egne farver er ikke del af CSS-paletten.

| Variabel | HEX | Variabel | HEX |
| --- | --- | --- | --- |
| `--paint-01` | `#000000` | `--paint-15` | `#FFFFFF` |
| `--paint-02` | `#808080` | `--paint-16` | `#C0C0C0` |
| `--paint-03` | `#800000` | `--paint-17` | `#FF0000` |
| `--paint-04` | `#808000` | `--paint-18` | `#FFFF00` |
| `--paint-05` | `#008000` | `--paint-19` | `#00FF00` |
| `--paint-06` | `#008080` | `--paint-20` | `#00FFFF` |
| `--paint-07` | `#000080` | `--paint-21` | `#0000FF` |
| `--paint-08` | `#800080` | `--paint-22` | `#FF00FF` |
| `--paint-09` | `#808040` | `--paint-23` | `#FFFF80` |
| `--paint-10` | `#004040` | `--paint-24` | `#00FF80` |
| `--paint-11` | `#0080FF` | `--paint-25` | `#80FFFF` |
| `--paint-12` | `#004080` | `--paint-26` | `#8080FF` |
| `--paint-13` | `#8000FF` | `--paint-27` | `#FF0080` |
| `--paint-14` | `#804000` | `--paint-28` | `#FF8040` |

Courier New/Courier bruges til logo, tekniske labels, status og kontroller. Arial/Helvetica bruges til almindelig tekst og chatbeskeder. Systemet kræver ingen eksterne fonte eller nye runtime-afhængigheder.

Genbrugelige styles omfatter knapper og inputfelter, `.machine-label`, `.toolbar`, `.connection`, `.chat-panel`, `.chat-header`, `.error`, `.room-error`, `.image-overlay` og `.help-card`. Tastaturfokus markeres med palettens himmelblå. Knapper har en minimumshøjde på 44 pixels. Fejltekst vises i eksisterende live-regioner.

Spilfladen bevarer 9:16-proportionerne. Den eksisterende ResizeObserver skalerer fladen, og klik omregnes fortsat til 1080 × 1920 verdenskoordinater. Avatarer, overgange, kommandoer og billedområder er bevaret. Der er ingen dropdown-navigation. Alle GIF-filer er bevaret uændrede i denne designopdatering.



## Opdatering — 11. oktober 2026: rumplacering og loading

Klubbens tidligere helt åbne grid er erstattet med et konservativt kort, som blokerer scenen, baren, møbler og yderkanter. Blokeringerne følger 120-pixel-felter og er derfor grove. Serverens fælles `walkable`-kontrol bruges både til klik og valg af startfelt ved indgang og rumskift.

Teksten om to rum og 16 personer er fjernet fra indgangsskærmen. En enkel loading-side vises ved første forbindelse og indlæsning af baggrund ved rumskift. En fejl ved forbindelse viser en mulighed for at prøve igen. Baggrundsindlæsning har en timeout på otte sekunder. Ingen nye afhængigheder.

Det vedhæftede ASCII-loading-artwork er indsat med skyline, TAGCHAT-logo og byline. `public/loading-art.js` genererer motivet og skalerer hele kompositionen samlet fra 740 × 642 pixels efter den tilgængelige bredde og højde. Ingen vandret scrolling eller ændring af motivets interne placeringer. På smalle skærme bliver ASCII-detaljerne tilsvarende mindre. Statusfeltet viser den faktiske forbindelse eller indlæsning; tegnene er dekorative og viser ikke en procentvis fremdrift. Ingen nye afhængigheder.
