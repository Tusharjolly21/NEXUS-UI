# Build prompt: Asteria, an AI launch-page builder

Build a single-page landing site for **Asteria**, an AI tool that turns a rough product idea into a launch page. The visitor types one sentence (or picks a sample idea) and watches a real page assemble in front of them: name and nav, a headline typed out letter by letter, the pitch and button, a palette and artwork, feature cards and a price strip. The feel is Apple-light and calm: lots of white, one violet accent, big tight headlines, soft shadows, springy motion that always settles. The copy is honest and specific. Asteria drafts; the person decides. It never invents testimonials or numbers, and it marks anything it guessed.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 for layout and type. Hard-code colours; do not use theme tokens.
- Framer Motion 12 for every animation. No other animation or UI libraries.
- Every interactive file starts with `"use client"`. No remote images, no web fonts: use the system stack `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif`.

## Page structure and copy

1. **Sticky glass nav.** Logo (a violet rounded square with a white four-point sparkle that turns 90 degrees every few seconds) and "Asteria". Links: How it works, Examples, Publish, Pricing, FAQ, each smooth-scrolling to its section. A magnetic "Build a page" button. The bar gains a blurred background and hairline as you scroll. On phones the links fold into a dropdown sheet.
2. **Hero (centred).** Pill: "New · Export any page as Next.js code →". Headline: "A rough idea in. A launch page out." with "launch page" in violet. Sub: "Describe what you are making in one sentence. Asteria writes the copy, picks a palette and lays out a page you can edit, publish or export tonight." Below it a composer card: a text input ("Describe your idea, e.g. a tea club for night owls") and a "Build my page" button, then chips "Or try: Nightpaws · Crumb Club · Crux Log". Under that, a two-column stage: a 250px "Assembling" step rail (Name and navigation, Headline, Pitch and button, Palette and artwork, Features, Pricing) and a browser window showing the generated page at `nightpaws.asteria.page`.
3. **Launch marquee.** "Pages launched on Asteria this month" over a slow marquee of invented names in different type styles (Kettle & Fox, TIDEWATER, plainsong, Loop Kitchen, MOSSGROVE, brightpaw, Ferrous, NORTH ROW). No real companies.
4. **Stats.** Four counters with a hairline on top: 48,210 pages published since launch; 7 min median time from idea to live page; 31% of drafts go live with no edits; 14 languages it writes in.
5. **How it works (pinned scroll story).** Eyebrow "How it works", title "It drafts. You decide." Four steps scroll on the left while the visual on the right stays pinned and swaps: 01 Feed it ("Start with whatever you have", an upload drop zone whose files become chips that fill as they upload); 02 Voice ("Pick how it should sound", a pixel dropdown of six tones next to a Nightpaws headline that rewrites itself for each tone); 03 Palette ("A palette that fits the idea", a paint-chip deck that fans out into twelve colours, click to copy a hex); 04 Tweak ("Nudge it like a design tool", three scrub fields for type size, radius and gap driving a live mini hero).
6. **Before and after.** Title "From a notes file to a page people trust." A draggable before/after comparison: messy monospace notes on cream paper (with a crossed-out line and a sticky note) against the finished Nightpaws hero. Below, three small cards: Kept your words, Dropped the comparison, Flagged the guesses.
7. **Publish.** "Go live, or take the code with you." Left card: a progress button that becomes its own progress bar ("Publish page" to "Live") and a copy chip for `nightpaws.asteria.page`. Right, a dark card: "Or export the source." with a copyable `npx asteria export nightpaws` command and the exported file tree.
8. **Pricing.** "Free until it is worth paying for." A yearly billing switch above three plans: Sketch $0 forever; Launch $16 a month or $12 yearly (marked "Most picked" with a violet ring); Studio $48 or $38. Prices roll like an odometer when the switch flips.
9. **Quotes.** A marquee of four testimonial cards from invented makers.
10. **FAQ.** "Fair questions." Five accordion items: whole page, invented claims, ownership, custom domains, SEO.
11. **CTA band.** Dark rounded panel with a pointer-following violet glow: "Your idea deserves a page tonight." Buttons "Build my page" and "See examples".
12. **Footer.** Brand note and three link columns.

## The look

- Page `#fbfbfd`, alternate sections `#f5f5f7`, cards white. Text `#1d1d1f`, secondary `#6e6e73`. Accent `#7c3aed` for buttons, eyebrows and highlights (5.7:1 on white), with `#ede9fe` and `#f5f3ff` as tints. Generated sample pages use their own small palettes (indigo and amber for Nightpaws).
- Card radius 22 to 28px; card shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`.
- Hero headline `clamp(42px, 7.6vw, 96px)`, weight 600, line-height 0.98, letter-spacing -0.055em. Section titles `clamp(34px, 5.4vw, 60px)` at -0.04em. Body 17 to 21px. Captions 12 to 13px in `#6e6e73`, always with a one-line hint. Use `tabular-nums` on every number.

## The motion

- Springs everywhere: blocks of the generated page enter with `stiffness 260, damping 24` from 14px below with a short blur. Section reveals travel at most 24px, run once, trigger at a small visible amount and never leave content hidden.
- **Hero signature interaction:** submitting an idea runs a timeline. Each block of the preview starts as a grey placeholder and is swapped for the real block when its stage arrives, roughly every half second. The headline types at about 24ms per character with a blinking caret. The step rail ticks each stage off, with a small dot-matrix loader on the active step. Typed ideas produce a deterministic draft (a name from the first words, a palette picked from a hash of the text) and show an amber "2 lines guessed" note. Until the visitor touches the composer, the hero types a sample idea into the input and builds it, cycling through the three samples.
- Drive continuous values (scroll progress, scrubbed sizes) with motion values. Wrap the root in `MotionConfig reducedMotion="user"`. No `Math.random()` or `Date.now()` in render.

## Motion Kit components and their jobs

- **Upload Chips:** collecting the visitor's notes and decks in step 01.
- **Pixel Select:** the tone-of-voice picker that rewrites the sample headline.
- **Fan Deck:** the proposed brand palette, with click-to-copy hex values.
- **Scrub Inputs:** design-tool fields for size, radius and gap on the live mini hero.
- **Before / After:** notes against the finished draft.
- **Progress Button** and **Copy Buttons:** publishing, copying the address and the export command.
- **Matrix Loaders:** the active step in the assembly rail.
- **Switch** (from Animated Tabs) and **Rolling Number** (from Price Odometer): yearly billing and the rolling prices.

## Responsive and accessibility

- At 390px everything stacks, nothing scrolls sideways, and the hero headline drops to 42px. The step rail hides and the preview window keeps its proportions by scaling down to the column width.
- Real `<button>`, `<a>`, `<label>` and `<input>` elements with visible focus rings in the accent colour. Icon buttons get aria labels; the comparison handle is a keyboard slider; status text uses `aria-live`.
- Text contrast at least 4.5:1, including marquee names and captions.
- Give the template root an explicit background, text colour and `colorScheme: "light"` so it looks the same inside a dark host page.

## Final checklist

- [ ] The hero builds a page on load, and building from a typed idea works.
- [ ] Only invented brands, people and numbers appear.
- [ ] One accent colour, used consistently.
- [ ] Every section reveal is short and never leaves content invisible.
- [ ] No hydration warnings and no console errors.
- [ ] No horizontal scroll at 390px; the hero demo stays usable on a phone.
- [ ] Every interactive control is reachable and visible with the keyboard.
