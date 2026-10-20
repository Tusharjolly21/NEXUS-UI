# Cinematic Logo Cloud

Build a "trusted by" logo cloud section with a cinematic entrance. In the default grid, each logo blurs into view one after another as the section scrolls in; then a soft invisible spotlight follows the pointer, and logos it passes resolve from soft grey to crisp ink, grow slightly and lift. Two marquee variants show the logos as drifting white pills that ease off under the mouse and can be dragged and flung with momentum. Neutral ink on whatever background it sits on, in light and dark.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[440px]:`, `@[560px]:`), framer-motion (`motion`, `useInView`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`). The marquee runs on `requestAnimationFrame`.
- File: `components/cinematic-logo-cloud/cinematic-logo-cloud.tsx`, named export `CinematicLogoCloud`, exported `DEFAULT_LOGO_CLIENTS`, types `CinematicLogoCloudProps` and `LogoCloudClient`.

## API

`LogoCloudClient`: `{ name: string; logo?: ReactNode; src?: string; slug?: string; text?: boolean; className?: string; nameClassName?: string; invertDark?: boolean }`. `logo` wins over `src`; with neither, draw a monogram. `slug` is accepted but ignored (nothing is fetched). `text` renders the name as a wordmark styled by `className`. `invertDark` inverts a `src` image in dark mode.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `clients` | `LogoCloudClient[]` | 12 fictional brands with drawn glyphs | Logos. |
| `variant` | `"grid" \| "marquee" \| "marquee-named"` | `"grid"` | Layout. |
| `eyebrow` | `string` | `"Trusted by teams building the future of AI."` | Small caps label; empty hides it. |
| `description` | `string` | — | Line under the eyebrow. |
| `speed` | `number` | `40` | Marquee drift px/s. |
| `autoplay` | `boolean` | `false` | Grid only: sweep the spotlight until pointed at. |
| `className` | `string` | `""` | Section classes. |

Default brands: Orbitly, Northwind, Kitefly, Parallel, Hexa, Vela, Quadrant, Meridian, Pulse, Signal, Duet, Astra, each with a 24-unit SVG glyph at 1.15em (in order: ring with a dot, two waves, filled diamond, H, filled hexagon, outlined triangle, 2×2 squares with two at .35 opacity, circle with horizon line, P, pulse line, two overlapping discs with one at .45, six-spoke asterisk; strokes 2, round caps) and the class `font-semibold tracking-[-0.03em]`.

## Layout and look

- Section: full width, padding 40px vertical (`@container` in grid mode).
- Header (centred, 16px sides): eyebrow 12px semibold uppercase, tracking .14em, `#6e6e73` / `#a1a1a6`; description 14px same colour, 6px top margin.
- Mark: custom `logo` at the given font size; `src` image at that height (lazy, not draggable); otherwise a monogram square, radius 28%, white semibold initial at 55% of size, background picked from `#0071e3 #30d158 #ff9f0a #bf5af2 #ff375f #64d2ff` by a string hash (`h = h·31 + charCode`).
- Grid: `<ul aria-label="Customers">`, margin-top 24px, max-width 1024px, centred; 2 columns, 3 at container ≥440px, 4 at ≥560px. Cell: 66px tall, centred, padding 0 12px. Brand: mark (22px, 24px for images) + name 17px semibold tracking −0.03em, gap 8px (images show no name); text-only clients render the name at 20px. Ink `#1d1d1f` / `#f5f5f7`.
- Marquee: margin-top 24px. Viewport overflow hidden, padding 12px vertical, `cursor: grab` (grabbing when active), `touch-action: pan-y`, `select-none`, masked `linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`. Track holds N copies of the list (gap 12px, 12px right padding); measure with a ResizeObserver: `N = max(2, ceil(viewport / listWidth) + 1)`. Pills: radius 16px, white / `#1c1c1e`, ink text, shadow `0 0 0 1px rgba(0,0,0,.05), 0 8px 20px -14px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`). Plain marquee pills: padding 12px 20px, mark at 22px only. Named: padding 10px 16px, gap 10px, 20px mark + name 15px semibold tracking −0.02em (using `nameClassName ?? className`).
- Pause button: absolute bottom −4px right 12px, 28px circle, grey icon (hover `black/5` / `white/10`), 12px pause or play glyph.

## Motion

- Grid entrance (once, when the grid is 40px inside the viewport): each cell from `opacity 0, blur(10px), y 14` to rest, spring stiffness 120, damping 18, delay `0.06·i`.
- Spotlight: pointer position in grid pixels (parked at −10000 when away). Per cell, `d = distance(pointer, cell centre) / 150`, `lit = e^(−d²)`, `glow = spring(lit, 200/24)`. Map glow 0→1 to opacity .6→1, scale 1→1.06, y 0→−2px.
- Marquee loop (dt capped 50ms): `slow` is a spring (120/20) toward 1, or .15 while a mouse hovers. Base velocity `−speed·slow` (0 when paused). Fling velocity decays by `0.04^dt` per second and snaps to 0 below 4. `x += (base + fling)·dt`, wrapped into `[−span, 0)` where span is the first list's width; round to 0.001.
- Drag: capture the pointer, move `x` by the pointer delta directly (wrapped), smooth velocity `v = (dx/dt_ms)·1000·0.6 + v·0.4`. On release set fling to `clamp(v, ±2400)`.

## Interaction and states

- Grid: pointer move sets the spotlight; leave parks it off-canvas so all logos return to grey.
- Marquee: hover (mouse only) slows to 15%; leave restores; drag scrubs and flings; the pause button toggles drift.
- Reduced motion: grid shows immediately with no blur, no scale or lift (opacity still brightens); marquee becomes a static centred wrapped row of pills with no pause button.

## Autoplay demo

Grid only, not under reduced motion: after 900ms, move the spotlight along `x = w·(0.5 + 0.42·sin(0.8t))`, `y = h·(0.5 + 0.4·sin(1.3t + 1))` every frame until the first pointer move over the grid.

## Accessibility

- Lists are labelled "Customers"; marquee items carry `aria-label` with the brand name in the first copy, and duplicate copies are `aria-hidden`. Monograms and glyphs are `aria-hidden`; images use empty `alt` because the name is on the item.
- Pause button: `aria-pressed`, labels "Pause logo marquee" / "Play logo marquee", 2px `#0071e3` / `#0a84ff` focus ring.

## Acceptance checklist

- [ ] Grid logos blur in one by one when scrolled into view.
- [ ] A ~150px soft spotlight brightens, grows and lifts logos under the pointer.
- [ ] Grid is 2, 3 or 4 columns by container width.
- [ ] Marquee loops seamlessly at any width.
- [ ] Mouse hover slows the marquee smoothly; drag and fling carry momentum that decays.
- [ ] `marquee-named` shows marks with names in pills.
- [ ] Clients without `logo` or `src` show coloured monograms.
- [ ] Reduced motion shows static logos.
