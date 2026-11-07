# Build prompt: Last Light, a game landing page drawn in characters

Build a single-page landing site for **Last Light**, an invented slow, open-country western about one gang and the last summer of the frontier. The page is dark and warm: a night plum background, cream type, one orange accent. Its signature is that every picture on it is drawn live in text characters, with real life moving inside each scene. Everything on the page is sample content for a game that does not exist.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- One block of plain CSS, scoped under a `.ll` root with every class prefixed `ll-`, so it can sit inside any project. Colours are hard-coded values in custom properties on that root.
- No animation library and no UI library. The scenes are WebGL 2 on a `<canvas>`, with a 2D canvas fallback. No remote images and no font service: the three pictures are in `/public/templates/last-light`, the fonts are self-hosted `.woff2` files in `/public/fonts/last-light`.
- `"use client"` on the page and the hook. Keep every word of copy, every rider and every scene setting in one `data.ts` file.

## The scene engine

Each scene is a picture redrawn as a grid of characters, on the picture's own grid (a set number of columns across, cells a set number of times taller than wide).

1. Build a glyph atlas on a 2D canvas from IBM Plex Mono Bold, using the marks ` ·-~=+*xocvsezaunmw%#&@MWB8`. Measure how much ink each mark carries, sort them by it, and build a 256-entry lookup from "amount of light" to "nearest mark and next nearest mark".
2. Draw the picture to a small source texture. A fragment shader runs once per pixel: it finds the cell, reads the picture's colour under it, and chooses the mark that carries that much light. Each mark's lit part takes the picture's colour at full strength and the rest of the cell carries what light is left, never quite black.
3. In stronger light a cell turns over into a lit rounded tile with a dark mark cut into it, which is how the skies and suns read. The two lower scenes cut full letters; the hero cuts a dot, a dash or a tilde. Silhouettes snap to one side of an edge so they stay one character sharp.
4. Marks swap for a neighbour in weight every few seconds, faster in the sun. When a scene first draws, the characters spill outward from the sun and settle, cycling through random marks until they land.
5. A warm lantern under the pointer brightens and warms the cells near it with a soft flicker. On touch screens a tap leaves a lantern that fades over a second.
6. Each scene has its own life compiled in with a `SCENE` define: the hero has a group of birds crossing every half minute, two distant ones and a hawk circling over the peak, fireflies over the meadow that drift towards the lantern, mist in the valley and drifting cloud light; the second scene has three vultures wheeling, embers lifting off the ground and eyes that smoulder; the third has heat haze over the desert, low dust and the same embers. Grass along the bottom sways in gusts. Birds are drawn as true silhouettes finer than the characters, with jointed wings and a wingbeat that glides now and then.
7. The first scene draws itself in on load. The other two draw themselves in the first time they are at least 20% on screen. Scenes stop drawing when they are off screen or the tab is hidden.
8. Without WebGL 2 draw the same picture once with the 2D canvas, still in characters. With reduced motion draw one still frame and never animate. Wait for the font, but never longer than 1.6 seconds.
9. The engine lives in its own module that takes a host element and a canvas and returns `light(u, v)`, `mapping()` and `destroy()`; a hook creates it in an effect and tears it down on unmount, so Strict Mode is safe. Report the character count ("Drawn live in 31,416 characters") back to the page.

## Page structure and copy

1. **Hero**, full window height, the first scene behind everything. A small plum shade under the nav and behind the words only. Nav: a round sun mark drawn as four stripes, "Last Light", links Story, The world, The gang, and a bordered "Wishlist" button. Words sit low and left: the headline "Ride out before the *light* goes." in a large high-contrast serif with "light" in italic and softer cream; the line "A slow, open-country western about one rider, one horse and the last summer of the frontier. Coming to PC and consoles in spring 2027."; a cream "Add to wishlist" button with an arrow and a ghost "Watch the trailer" button with a play triangle. A thin line along the bottom: a pulsing orange dot and the live character count on the left, "Pine Ridge, Wyoming Territory · 7:42 pm, sundown" on the right (hidden on phones). The words rise in one after another once the scene has drawn.
2. **Story.** Two columns from 900px: the statement "Wyoming Territory, 1899. The railroad is coming, and the open range has one summer left." and two short paragraphs about Eli Haskell's gang of seven and the Union Pacific surveying the valley, then a facts list: Setting, Year, The range (41 by 26 miles of open country), One sundown (24 real minutes, every evening).
3. **The world.** "Silas Crane owns everything the light touches." with a paragraph about the Deacon. Under it the second scene in a band no taller than 92% of the window, with a caption and the live count.
4. **The gang.** "Seven riders. One last summer." and "Point at a rider, or pick a name, to meet them." The third scene fills a wide band. A round hotspot sits on each of the seven riders (Wes Tolliver, Ada Rook, Hollis Vane, Eli Haskell, Amos Grey, Cass Marlow, June Ash), placed by their position in the picture so they stay on the figures at every size, and hidden if they fall off the edge. Pointing at, focusing or tapping a hotspot, or the matching name in the roster below, holds the lantern over that rider and shows a small blurred card with their name and one line. The roster is a grid of names, each with a hairline above that turns orange when active.
5. **How the summer goes.** Four pillars in two columns: Ride the range, Read the weather, Keep the gang together, Make camp, each with a sentence.
6. **Last call.** "The last summer starts in spring 2027." with a line about PC, PlayStation 5 and Xbox Series X|S and the same two buttons.
7. **Footer.** A line saying Last Light is a fictional game and every scene is drawn live in characters, and links Story, The world, The gang, Back to top.

## Look

- `--night #0c030b`, `--plum #1b0816` (text on cream buttons), `--bone #f6dcb0` (type), softer and fainter bone at 78% and 50%, `--ember #ff8d4e` (focus and the live dot), a hairline at bone 28%.
- Display type: Libre Caslon Display (headlines clamp from 46px to 112px, tight leading, balanced wrapping). Body and UI: IBM Plex Mono at 15px with generous line height; small captions 12px with tabular numbers. Page padding 16px on phones, 40px from 720px; content width 1240px.
- Buttons are 48px high with 3px corners. Hairline borders and small radii throughout, no shadows apart from a soft glow on the live dot.

## Responsive and accessibility

- On screens narrower than about 1:1 the hero picture fills the top and is wide enough to keep the sun and the rider in frame, and the grass dissolves into the night below it. The scenes' grids shrink to the cell size that suits the screen (about 5 to 9.5 CSS pixels wide) and redraw when the host is resized.
- Canvases are `aria-hidden`. Hotspots are real buttons with a label that includes the rider's name and line; the roster buttons are real buttons; focus rings are 2px orange. The name card is `aria-hidden` because the same words are in the labels.
- In-page links scroll smoothly, or at once with reduced motion. No random values or `window` reads during render. No horizontal scroll at 390px.

## Final checklist

- [ ] No remote images, no Google Fonts, no animation library; the two fonts and three pictures are local files.
- [ ] Scenes stop drawing off screen and in a hidden tab; reduced motion draws one still frame.
- [ ] The engine tears down cleanly on unmount (animation frame, observers, listeners, GL objects).
- [ ] Rider hotspots stay on the figures at every width; the roster and hotspots do the same thing.
- [ ] Names, places, dates and the game itself are invented, and the footer says so.
