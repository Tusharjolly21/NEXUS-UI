Build a stack of testimonial cards. The front card is a clean white quote card; the ones behind peek out below it, slightly smaller and alternately tilted. Flick the top card sideways (or press a key) and it flies out, drops behind the pile halfway through its throw and slides home into the back slot with a little wobble, while the next card rises to the front and its highlighted words get a fresh highlighter stroke sweeping in from the left. Calm, tactile and Apple-light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`, `PanInfo`).
- File: `components/card-stack-rotator/card-stack-rotator.tsx`, named export `CardStackRotator`, exported types `CardData` and `CardStackRotatorProps`.

## API

`CardData = { id: string; content: string; name: string; designation: string; avatarUrl?: string; initials?: string; company?: string; companyLogoUrl?: string }`. In `content`, words wrapped in `**double asterisks**` are highlighted. `companyLogoUrl` is accepted but not drawn. Initials default to the first letters of the first two name words.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `CardData[]` | required | Cards, front first. Renders nothing when empty. |
| `rotationInterval` | `number` | `0` | Throw the front card every N ms; 0 is off. |
| `maxVisible` | `number` | `3` | Cards drawn in the stack (clamped 1..n). |
| `stackOffset` | `number` | `14` | px each card behind peeks out below. |
| `scaleStep` | `number` | `0.05` | Scale lost per card behind. |
| `cardWidth` | `string` | `"420px"` | CSS width of the stack (never wider than its container). |
| `cardHeight` | `string` | `"auto"` | CSS card height; `auto` sizes to the tallest card. |
| `cardBackground`, `cardBorderColor`, `textColor`, `mutedColor`, `highlightBackground`, `highlightTextColor` | `string` | — | Optional colour overrides; defaults follow light/dark. |
| `contentFontSize`, `nameFontSize`, `designationFontSize`, `borderRadius` | `string` | — | Optional type and radius overrides. |
| `shadowIntensity` | `number` | `0.5` | 0-1 shadow strength. |
| `pauseOnHover` | `boolean` | `true` | Pause `rotationInterval` while hovered. |
| `direction` | `"forward" \| "backward"` | `"forward"` | Forward throws left, backward throws right. |
| `hint` | `string` | `"Flick the top card away."` | Caption under the stack; `""` hides it. |
| `onChange` | `(id: string) => void` | — | Id of the card that comes to the front. |
| `autoplay` | `boolean` | `false` | Throws the top card every 2.6s until touched. |
| `className` | `string` | `""` | Root classes. |

## Layout and look

- Root: flex column, centred, gap 16, `max-width: 100%`, width `cardWidth`.
- Stack: a CSS grid where every card occupies the same cell (`col-start-1 row-start-1`), so the height is the tallest card (or `cardHeight`). Bottom margin `(count − 1) · stackOffset` leaves room for the peeking cards. Radius 24, focusable.
- Card wrapper per slot: z-index `50 − slot`, `transform-origin: 50% 100%`. Animated to `y = min(slot, count−1)·stackOffset`, `scale = 1 − min(slot, count−1)·scaleStep`, `rotate = side·min(slot, 3)·1.1°` (side +1 for even slots, −1 for odd; 0 for the front card or under reduced motion), opacity 0 for slots ≥ count.
- Card (`<figure>`): radius 24, padding 24, white (dark `#1c1c1e`), text `#1d1d1f` (dark `#f5f5f7`), flex column. Shadow: `0 0 0 1px line, 0 {14 + s·16}px {28 + s·30}px −24px rgba(0,0,0, 0.2 + s·0.4)` where s = `shadowIntensity`, line `rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`) unless overridden.
- Content opacity: 1 for the front card, 0.35 for slot 1, 0 for the rest (0.25s), so only the front is readable.
- Top row: a 20×15 double-quote glyph in `#0071e3` (dark `#0a84ff`) and a counter "{position} / {total}" (12px tabular, `#86868b` / `#a1a1a6`). Position is the card's original index + 1.
- Quote: 12px below, 17px, line-height 1.45, tracking −0.015em, `text-wrap: pretty`.
- Highlights: the word in medium weight, `#0059b3` (dark `#6cb6ff`), over a rounded (5px) block inset −3px horizontally and 1px vertically, `rgba(0,113,227,.13)` (dark `rgba(10,132,255,.26)`).
- Footer (`mt-auto`, 20px top padding, gap 12): a 40px avatar (image, or initials 13px semibold white on a 135° gradient picked by index from `#5ac8fa→#0071e3`, `#ffb340→#ff6b3d`, `#7ee0a1→#1fa463`, `#d6a4ff→#8e44ec`, `#ff8fa3→#ff375f`), then name (15px semibold, tracking −0.01em, truncate) over "designation, company" (12px `#6e6e73` / `#a1a1a6`, truncate).
- Hint: 12px `#86868b` / `#a1a1a6`.

## Motion

- Slot changes (rising, shrinking, tilting): spring "tuck" stiffness 190, damping 17, mass 0.9.
- Drag: only the front card, `dragMomentum={false}`, scale 1.03 while dragging, `rotate` mapped from x: −260 → −14°, 0 → 0, 260 → 14°. Release is a throw if `|offset.x| > 90` or `|velocity.x| > 520`; otherwise spring x and y back to 0 (stiffness 300, damping 26).
- Throw: direction = sign of dx (fallback the configured direction). Spring x to `dir·300` (stiffness 260, damping 30, initial velocity `dx·2`) and y to `clamp(dy·0.4, −80, 40) − 30` with the same spring. After 190ms, rotate the order (front to back) so the card drops behind the pile, then tuck x and y back to 0 so it slides into its back slot.
- Programmatic throws (autoplay, interval, keys) bump a `pulse` counter; the front card reacts by throwing with `dx = dirSign·160`, `dy = −40`.
- Highlighter: `scaleX` 0 → 1 from the left (originX 0) whenever the card becomes the front, spring 160 / 20 with delay `0.25 + segmentIndex·0.08`. When the card leaves the front it collapses in 0.15s.

## Interaction and states

- Order is an array of card indices; rotating forward moves the head to the end, backward moves the tail to the head. Re-seed the order when the number of cards changes.
- Keys on the stack: ArrowRight, Enter or Space throw the front card; ArrowLeft brings the last card back to the front (no throw, just the tuck spring).
- `onChange` fires whenever the front card's id changes (not on mount).
- `rotationInterval` runs only with 2+ cards and pauses while hovered if `pauseOnHover`.
- Reduced motion: no drag, no tilt, the throw skips the fly-out and just reorders, highlights are always shown.

## Autoplay demo

With 2+ cards, bump the pulse every 2600ms; any pointer down or key press stops it permanently. The demo uses four cards, e.g. "We shipped the new onboarding in **three days**. The stack alone got more replies than the launch email." (Sana Whitfield, Head of Design, Pebblework) at width 400px.

## Accessibility

- Stack: `role="group"`, `aria-roledescription="carousel"`, `aria-label="Testimonials, {i} of {n}: {name}"`, `tabIndex 0`, focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset on `#f5f5f7` (dark black).
- Cards behind the front are `aria-hidden`. A visually hidden `aria-live="polite"` region reads the front quote (asterisks stripped), name and designation. Decorative quote glyph and initials are `aria-hidden`.

## Acceptance checklist

- Three cards are visible: the front flat, two behind smaller, lower and tilted opposite ways.
- A short drag springs back; a long or fast drag throws the card, which tucks in at the back with a wobble.
- The next card rises and its highlighted words get a sweeping highlighter stroke, staggered.
- `direction="backward"` throws to the right for keys and autoplay.
- ArrowRight/Enter/Space throw; ArrowLeft brings the previous card back.
- `onChange` reports the new front id each time.
- `rotationInterval` pauses on hover; autoplay stops for good on touch.
- Dark mode recolours cards, text and highlights; overrides win when given.

---

<!-- Card Stack Rotator: Motion Kit variant brief -->

> The Card Stack Rotator page has 2 variants. The brief above rebuilds the original Card Stack Rotator; the brief below rebuilds the Motion Kit Rolodex Testimonials variant.

---

<!-- variant: rolodex-testimonials -->

# Rolodex Testimonials

Build testimonials on a rolodex. The quote cards ride round a 3D drum that clicks to the next quote every few seconds; the cards above and below tip away, fade and darken. Drag it to spin, flick it and it keeps going, and it always comes to rest square on a card. Under the drum a row of dots shows which quote is in front.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`, `useReducedMotion`), the `cn` class helper.
- File: `components/card-stack-rotator/rolodex-testimonials.tsx`. Named export `RolodexTestimonials`, exported types `RolodexTestimonialsProps` and `RolodexCard`.

## API

`RolodexCard = { quote: string; name: string; role: string; hue: [string, string] }`. `hue` is the two colours of the avatar gradient.

- `cards?: RolodexCard[]`: defaults to ten demo quotes (Maya Chen, Arjun Rao, Lena Ortiz, Tom Becker, Sara Kim, Dev Patel, Noor Haddad, Eli Novak, Ana Lima, Kai Ito, each with a short one-line quote and a role such as "Design lead, Loop").
- `autoplay?: boolean`, default `false`: clicks to the next quote every 2600ms until touched.
- `onChange?: (index: number) => void`: index of the card that is front.
- `className?: string`.

## Layout and look

- Root: column, centred, 16px gap, `w-[380px] max-w-full`, ink `#1d1d1f` (dark `#f5f5f7`).
- Viewport: `relative h-[380px] w-full`, radius 24px (for the focus outline), `cursor: grab` (grabbing while pressed), `touch-action: none`, no text selection. Inside it a layer that fills it with `perspective: 900px` and a vertical mask `linear-gradient(to bottom, transparent, #000 21%, #000 79%, transparent)` so the ends fade into whatever is behind. The mask replaces a colour overlay, so no page colour is needed in light or dark.
- Drum: absolute, `inset-x-4`, full height, `transform-style: preserve-3d`.
- Card: `figure`, absolute, `inset-x-0`, top 50%, height 150px, margin top -75px, flex column with space between, `p-5`, radius 20px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05)` plus `0 14px 30px -18px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.1)`), `backface-visibility: hidden`. Quote: 16px, line height 1.4, tracking -0.01em, wrapped in curly quotes. Caption row: 32px avatar circle (135 degree gradient of `hue`), name 13px semibold, role 12px `#6e6e73` (dark `#a1a1a6`), both truncating.
- Shade layer: absolute, covers the card, radius 20px, `#1d1d1f` (dark `#000`).
- Dots: row, 6px gap, one 6px high pill per card in ink (dark `#f5f5f7`).

## Motion

- One motion value `rot` (degrees) drives everything. With `N` cards the step is `360 / N` and the drum radius is `round(150 / 2 / tan(pi / N)) + 10`.
- Card `i` has relative angle `a = ((i * step + rot) mod 360)` wrapped into -180..180. Its transform is `translateZ(-radius) rotateX(a deg) translateZ(radius)`; opacity `max(0, 1 - |a| / 95)`; shade opacity `min(0.5, |a| / 180)`.
- The active index is `(round(-rot / step) mod N + N) mod N`. The dots animate width 6 to 18 and opacity .2 to 1 for the active one.
- Drag: pointer down stops any animation, captures the pointer and remembers the start; moving by `dy` sets `rot = start - dy * 0.45` and tracks velocity in degrees per second. Release projects `rot + velocity * 0.25`, rounds to the nearest multiple of `step` and springs there with `{ stiffness: 140, damping: 20, velocity }`.
- Step: `goBy(k)` springs to `round(rot / step) * step - k * step` with `{ stiffness: 160, damping: 18 }`.
- Reduced motion: stepping and settling are instant, no autoplay.

## Interaction and states

- Pointer drag on the viewport spins the drum. Arrow Down goes to the next quote, Arrow Up to the previous one. The viewport is focusable (`tabindex 0`) with a visible 2px offset outline `#0071e3` (dark `#0a84ff`).
- Any pointer down, key or focus marks the carousel touched and ends autoplay for good.
- `onChange` fires only when the front card changes.

## Autoplay demo

Every 2600ms call `goBy(1)` while the drum is on screen and the tab is visible. Stops for good on touch. Never runs under reduced motion.

## Accessibility

- The viewport is a `group` with `aria-roledescription="carousel"`, a label that explains the arrow keys and `aria-keyshortcuts`. The 3D drum and dots are `aria-hidden`. A screen reader only paragraph reads "Testimonial X of N: quote, name, role" and is announced politely only after the visitor has interacted, so autoplay does not chatter.

## Acceptance checklist

- [ ] The front card is flat and fully opaque; the ones above and below tip away, fade and darken.
- [ ] A drag spins the drum, a flick coasts, and it always stops square on a card.
- [ ] Arrow keys step through the quotes.
- [ ] Autoplay clicks forward every 2.6s, pauses off screen, stops on touch.
- [ ] The fade at the top and bottom works on any background in light and dark.
- [ ] Dark mode recolours cards, text, shade and dots.
- [ ] Fits at 320px wide.
