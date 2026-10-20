# Build prompt: Aether — independent designer and developer portfolio

Build a single-page personal portfolio for **Aether**, the one-person studio of Jordan Vale, an independent designer and developer in Lisbon. The feel is editorial and quiet, like the front of a design magazine: white page, light grey sections, white cards, huge tight headlines and one deep rose accent. The hero is a magazine masthead above a contact sheet of every project in miniature, which the visitor reads through a glass lens they drag across it.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so it looks the same in a dark-mode host. Set `colorScheme: "light"` and explicit background and text colours on the root.
- Framer Motion 12 for all motion. No other UI libraries, no remote images, no web fonts. Project artwork is CSS gradients plus small inline SVG drawings.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky glass nav.** Logo: a rose dot inside a tilted orbit ring with a small ink moon travelling round it, plus "Aether". Links Work, Process, Writing, Services; a rose "Book a call" button.
2. **Masthead hero.** A thin meta row with a bottom rule: "Issue 07 · Autumn 2026", "Jordan Vale, independent designer and developer, Lisbon" (hidden on phones) and a pill "Booking from January" with a pulsing rose dot. Headline, left-aligned and enormous, word by word: "I design and build **quiet** software." Below, a two-column row: the sub "Aether is a studio of one. I take a product from a rough idea to shipped code: the research, the screens, the design system and the front end. Six projects below, all still in use." and, right-aligned, "See the work" and "Book a call". Then, nearly full-bleed (1320px), the **Glass Lens** contact sheet: a warm paper panel (`#fbfaf8`) titled "Contact sheet · Selected work 2023–2026" with six numbered tiles in a row (three per row below 900px), each with a title and a tiny caption (client and one result). Tile 03 is circled by hand in rose with "my favourite". The lens is measured to the container width, 190px on desktop and 140px on phones, zoom 1.7, and drifts on its own until grabbed. Caption: "Drag the lens across the contact sheet. Every project is on it, in miniature."
3. **Disciplines marquee** between hairlines: Product design, Design systems, Front-end in React, Interaction and motion, Type, Prototypes you can test, separated by rose dots.
4. **Selected work** (`#work`). "Six projects, all still shipping." / "Pick a layout to browse, or open one from the index. Each line says what changed, not just what I made." Left card: a **Layout Switch** (local copy that takes project tiles with artwork inside, an accent, and a controlled open tile) cycling grid, row, feature and pile. Right card: a numbered index (01–06) with a thumbnail, title, role and result, and year; clicking a row opens that tile in the layout and a rose-tint highlight glides to the row. Projects: Halden (banking for freelancers, shipped in 11 weeks), Fieldnote (a journal that writes back, daily writers 9% to 31%), Kiln (a ceramics studio's shop, sold out in four days), Line 4 (tram wayfinding, twelve stations, zero arrows), Aether Mono (a variable monospace, 41 KB), Tidewater (sea-level dashboard read by 140 councils).
5. **How I work** (`#process`), grey, pinned scroll story. "Paper, then pixels, then production." Steps: "01 · Colour / Chosen on paper before a screen exists." with a **Fan Deck** of the twelve-chip Halden palette; "02 · Critique / Notes in the margin, sketches underneath." with a **Page Curl** whose front is a week-3 review note ("Put the balance first. Freelancers check it before anything else.") and whose back is the pencil wireframe it came from; "03 · Code / Shipped by the same hands." with a **Dock** of six tools (Sketchbook, Canvas, Type specimens, Code editor, Motion curves, Deploys).
6. **Writing** (`#writing`). "Notes from the desk." with "One essay a quarter. No newsletter pop-ups." Three essay cards (date, read time, title, one-line summary, "Read essay →") that lift on hover.
7. **Kind words**, grey. Three quote cards from invented clients (Mara Ellison of Halden, Tobias Wren of Fieldnote, Inês Carvalho of Kiln Studio) with a rose quote mark.
8. **Work together** (`#services`). "Three ways in. Fixed prices." / "Two projects at a time, never more." Three radio tiles: Two-week sprint $9,800, Product partner $14,500 / month, Design system audit $6,200; the chosen tile gets a rose inset ring via `layoutId` and its three inclusions expand. Beside it, a card "One page, one signature." with a **Sign & Seal** card titled with the chosen engagement and price, and under a rule "Rather write first?" with a **Copy Chip** for hello@aether.studio.
9. **FAQ**: agencies, design-only work, what you need to start, location and hours.
10. **CTA band**: "Have something that should feel quieter?" / "Tell me what it is and who uses it. I reply within two working days."
11. **Footer** with Work, Studio and Elsewhere columns; note "The studio of Jordan Vale, independent designer and developer."

## Look

- Page white, sections `#f5f5f7`, cards white, contact sheet `#fbfaf8`. Ink `#1d1d1f`, secondary `#6e6e73`.
- One rose: `#9d174d` for text, buttons, rings and marks (about 8:1 on white), with a wash `#fdf2f8`.
- System font stack. Hero headline `clamp(48px, 8vw, 112px)`, weight 600, line-height 0.95, tracking -0.06em. Section titles `clamp(34px, 5.4vw, 60px)`. Contact sheet captions 10–12px (the lens is how you read them). `tabular-nums` on prices and numbers.
- Cards radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`; project tiles 10–16px; pill buttons.

## Motion

- Lens: drag with elastic constraints and inertia (power 0.3, time constant 300), scale 1.06 while dragged; it splits colour at the rim using red and blue copies at ±3.5% magnification. Autoplay drifts it with soft springs (stiffness 30, damping 12) every 2.6 s until touched.
- Layout tiles spring between arrangements (stiffness 220, damping 26, a 25ms stagger); the open tile fills the frame and the others fade to 25%.
- Index highlight, offer ring and swatches use `layoutId` springs (stiffness 400–420, damping 32–34). Offer inclusions open with a height spring (300 / 30) and slide in 50ms apart.
- Scroll story: the active step is taken from scroll progress, every visual stays mounted and cross-fades with a spring (160 / 24) while a rose rail fills.
- Reveals are short (20px or less), once. Logo moon and the availability pulse loop gently.

## Motion Kit components and their jobs

- Glass Lens: reads the contact sheet in the hero.
- Layout Switch (local copy with project tiles and a controlled open tile): the selected work gallery.
- Fan Deck: a client palette, click to copy hex.
- Page Curl: a review note with the sketch underneath.
- Dock: the six tools on the desk.
- Sign & Seal: signing the one-page agreement.
- Copy Chip: the email address.
- A local pinned scroll story with a hydration-safe media query.

## Responsive and accessibility

- At 390px: the meta row drops the long line, the headline scales down, the contact sheet becomes three columns by two rows (560px tall) with a 140px lens, the work layout uses a fit-to-width scaler above the index, the story stacks with each visual under its text, and nothing scrolls sideways.
- The lens width comes from a measured container, never from `window` during render. Index rows are buttons with `aria-pressed`; offers are a radio group; icon buttons have labels; focus rings are visible in rose.
- Keep tiny caption text on the sheet decorative only: every project is repeated in full in the index.

## Final checklist

- [ ] The lens drifts, drags and magnifies the contact sheet at every width.
- [ ] Layouts glide; clicking an index row opens its tile and highlights the row.
- [ ] Choosing an engagement moves the ring, opens its list and retitles the signature card.
- [ ] One rose, hard-coded; correct in a dark-mode host; contrast at least 4.5:1.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
