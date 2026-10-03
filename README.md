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
