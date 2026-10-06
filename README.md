# TAGCHAT v1

En lille realtime chat-verden med ét fælles rum.

## Kør lokalt

1. Installer Node.js (LTS).
2. Åbn Terminal i denne mappe.
3. Kør `npm install` første gang.
4. Kør `npm start`.
5. Åbn `http://localhost:3000`.

## v1

- Projektet hedder TAGCHAT.
- Hele aliases vises uden forkortelse.
- Typografien bruger en gammel skrivemaskine-stak: American Typewriter / Courier New / Courier.
- Alt uden om chatrummet er #000.
- Verdenen er 1080 × 1920 med et usynligt 9 × 16-grid.
- Maks. 10 samtidige brugere.
- Klik på et ledigt felt teleporterer avataren direkte dertil.
- Beskeder er maks. 140 tegn og vises som bobler i 8 sekunder.
- `bg.gif` og `avatar.gif` kobles på, når filerne er lagt ind.


## Baggrund og ståpladser

bg.gif (1080 × 1920) og avatar.gif (90 × 90) ligger i public. GIF-filerne er uændrede. Avataren vises i 90 × 90 verdenspixels.

room-map.json indeholder det usynlige 9 × 16-grid: # blokerer et felt, . tillader det. Første linje er øverst. De to åbne tagflader tillader forhøjninger, undtagen den runde konstruktion og ovenlysvinduet. Tagkanter og området uden for tagene er blokeret. Kortet er tilpasset i trin på 120 pixels, så grænserne er grove. Genstart serveren efter ændringer.

Stop den gamle server med Ctrl+C. Pak denne version ud, åbn mappen i Terminal, kør npm install og npm start. Åbn http://localhost:3000.

## Opdatering: to rum og mobilvisning

- 16 samtidige brugere pr. rum. TAGENE har samme blokeringer som før.
- JAZZKLUB har separat chatlog og egne ståpladser i jazz-map.json. Alle felter er foreløbigt åbne, da den endelige jazzklub.gif ikke er leveret.
- Læg jazzklub.gif i public/ for at åbne rum nummer to. Indtil da vises det som utilgængeligt; der bruges ikke en erstatningsbaggrund.
- Læg avatar1.gif, avatar2.gif osv. i public/. Serveren finder automatisk alle nummererede avatarer ved opstart, også avatar9.gif og senere. En tilfældig avatar tildeles ved indgang og bevares ved rumskift. Hvis ingen nummererede filer findes, bruges avatar.gif.
- Chatloggen er et flytbart vindue. Træk i CHAT-overskriften med mus eller finger. Luk med ×.
- Verden og kontroller tilpasses skærmens synlige højde. Talebobler ligger over alle avatarer og holdes indenfor verdenen.

Genstart serveren efter upload af avatarfiler. På Render: upload de ændrede filer til GitHub og deploy den nye commit. Ingen node_modules skal uploades. Build: npm ci. Start: npm start. Behold Free-planen og én serverinstans.

## Grafisk opdatering: tagene og hotspots

Avatarerne fylder nu 120 × 120 verdenspixels. De medfølgende mand1.gif og dame1.gif vælges tilfældigt. Nummererede avatar*.gif, mand*.gif og dame*.gif opdages ved serverstart.

Tagene bruger tagene.gif. Klik-kortet tagene_klik.gif er oversat til rooftops-hit-map.json:
- Rødt afviser klik.
- Gult skifter til jazzklubben; hvis det er fuldt, bliver brugeren på tagene.
- Øverste lysegrønne markering åbner seddel.gif.
- Nederste lysegrønne markering åbner graff.gif.
- Klik hvor som helst på det åbne billede eller baggrunden lukker det. Escape lukker også.
- Mørkegrønne tagområder og øvrige farver er almindelige klikområder.

Farverne kontrolleres af serveren. Bevægelse bruger fortsat usynlige 120 × 120-felter og øjeblikkelig teleport. Man placeres kun på felter, hvis centrum er almindelig tagflade, og felter kan ikke deles mellem brugere. Det betyder, at et ellers tilladt klik kan afvises, hvis det pågældende felts centrum er rødt eller en hotspot.

Ved ændringer i tagene_klik.gif skal rooftops-hit-map.json regenereres; den medfølgende JSON svarer til den aktuelle vedhæftede GIF. Genstart serveren og genindlæs browseren efter opdatering.
