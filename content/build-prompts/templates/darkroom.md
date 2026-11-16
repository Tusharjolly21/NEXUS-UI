# Build prompt: Darkroom — AI image studio app

Build **Darkroom**, a full-screen, chat-first image studio for an invented product. People describe a place, a time of day and a feeling, and a print develops on screen, then lands in a gallery. There is no image model: every print is painted live on a canvas from the prompt and a seed, so the same prompt and seed always give the same print. The feel is a warm darkroom, near-black with an ember accent, with a light paper theme a click away.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (theme variables for dark and light, selection, focus rings, tooltips from `data-tip`, thin scrollbars, a spin, a shimmer, a breathe and a wave) under a `.dr` wrapper.
- Framer Motion 12 for all motion. No other UI, canvas or animation libraries.
- Fonts self-hosted from `/public/fonts/darkroom`: Inter (variable) for everything, Geist Mono (variable) for sizes, seeds and keys. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the avatar is a DiceBear Notionists SVG inlined as a data URL.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## The print engine

- **Seeded random and noise**: a small seeded generator, `between`, `pick` and `lerp`, and 2D value noise with fractal sums.
- **Prompt reader**: finds subjects (sea, mountains, sun, moon, city, forest, plants, desert, night, birds, snow, river, island, clouds, lighthouse), a palette word and a style word, with synonyms.
- **Scene**: from the subjects, a seed and an aspect ratio, builds a unit-space scene: sky, sun or moon, stars, clouds, birds, a boat, a lamp, and layers of ridges, dunes, pines, shore skylines with lit windows, islands, water, snow caps and rivers, near to far.
- **Painters**: nine styles that draw the same scene differently. Risograph (separate ink plates overprinted in multiply, slightly off register), paper cut (stacked cards with soft cast shadows), halftone poster (two rotated dot screens over a flat render), Bauhaus grid (rotated primary motifs around a hero tile), cyanotype (pressed plants exposed through a brushed sheet of Prussian blue), topographic contour (a height field with marching-squares lines, coastline, a river traced downhill, spot heights, scale bar and north arrow), gradient mesh (swirled colour blobs, blurred, with fluted glass or a glossy orb), pixel art (a 104 pixel grid with Bayer dithering) and ink wash (fading ridges, dry-brush crests, mist and a red seal). All of them add film grain.

## Screens

1. **Sidebar.** Workspace switcher, New chat (N) and Search (Ctrl K), chats grouped under collapsible projects with relative times, then a theme switch, shortcuts, settings (a quick develop switch), and the account with credits left. On phones it is a drawer you can drag shut.
2. **Chat.** An empty state with a welcome and four starter prompts with live thumbnails. Each prompt becomes a user bubble with tags, then the agent's note on what it read and how it chose to print it, the developing prints, and actions: good result, not quite, copy prompt, download, Variations (four new seeds) and Upscale (the same seed at twice the size).
3. **Developing print.** A step label (reading prompt, composing, developing, fixing), a seconds countdown and a hairline bar. A spiral of grains gathers into a grid, takes on the print's tones and colours, then a soft blurred frame and the sharp image fade up through it.
4. **Landing in the gallery.** When a job finishes, its prints go to the top of the gallery and each one flies from its chat card into its slot, or onto the gallery button when the panel is closed.
5. **Composer.** Chips for what is tuned (reference palette, style, aspect, count), a growing prompt field, a plus menu to borrow a palette from an earlier print and set aspect ratio and image count, a style button, a model menu, simulated dictation, a Develop button, and a footer with project, agent or direct mode, an Enter hint and a context ring.
6. **Gallery panel.** A right panel you can widen or hide (a draggable bottom sheet on phones) with Gallery and Styles tabs. The gallery is a shortest-column masonry with spring reflow, favourites, download and delete with Undo. Styles shows every style as a card previewed with the prompt being typed.
7. **Viewer.** A full-screen print with wheel and pinch zoom around the pointer, drag to pan, double-click to jump in, a zoom bar, previous and next with the arrow keys, and a side panel with the prompt, style, palette, seed, size, aspect, model, Use prompt and Remix.
8. **Search.** A Ctrl K dialog over chat titles and prints (title, prompt and style), driven by the arrow keys.

## Look

- Dark: page `#0C0B0A`, panel `#121110`, raised `#1A1816` and `#24211E`, hairlines in warm white at 7 and 12%; ink `#F3EFE9`, text `#B8B0A7`, soft `#8F877F`; accent `#FF6B3D` with ink `#1C0B04`.
- Light: page `#F6F3EE`, panel white, raised `#F0ECE6`; ink `#1B1815`, text `#4F4943`, soft `#6B645D`; accent `#C73F17`.
- Inter at 12.5 to 15px for the interface and 28px with tight tracking for the welcome; radii 9 to 22px; prints sit on soft insets with 12 to 14px corners.

## Motion

- Springs for menus, pills, chips, tiles and the gallery reflow; a single orchestrated develop sequence per print; a flight with a slight tilt and a lifted shadow into the gallery.
- The develop animation, zoom and pan run on canvases and motion values, so they never re-render React.
- With reduced motion, prints appear developed, flights are skipped and the gallery updates in place.

## Content

Darkroom, Mira Castell and every project, chat and print are invented sample content. Keep models, styles, palettes, projects, starter prints and ideas as arrays in a data file so a reader can swap in their own.
