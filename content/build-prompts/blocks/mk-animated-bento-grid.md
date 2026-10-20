# Animated Bento Grid

Build a "why choose us" stats section as a bento grid of metric tiles whose numbers roll in like odometers when the grid scrolls into view. Hovering or focusing a tile lifts it and spins its digits a full turn before they land with a small overshoot. Each tile has an accent-tinted icon, an optional trend chip and a soft accent glow. Four surface treatments: plain, frosted glass over coloured blobs, a border that lights up where the pointer is, or a spotlight.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[520px]:`, `@min-[720px]:`), framer-motion (`motion`, `useInView`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useReducedMotion`).
- File: `components/animated-bento-grid/animated-bento-grid.tsx`, named exports `AnimatedBentoGrid` and `DEFAULT_BENTO_ITEMS`, types `AnimatedBentoGridProps`, `BentoItem`, `BentoVariant` (`"default" | "glass" | "gradient-border" | "spotlight"`), and `BentoGridPreset` (`{ id; label; icon; value; accent?; span?; trend? }`).

## API

`BentoItem`: `{ id: string; label: string; value: string; icon?: ReactNode; accent?: string; span?: "1x1" | "2x1" | "1x2" | "2x2"; trend?: { value: number; label: string } }`. In `value`, digits roll; every other character ("$", "%", "ms", ",") stays put. `accent` is a 6-digit hex (alpha is appended), default `#0071e3`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `BentoItem[]` | five stats (below) | Tiles in reading order. |
| `variant` | `BentoVariant` | `"default"` | Surface for every tile. |
| `columns` | `2 \| 3 \| 4` | `3` | Columns at full width. |
| `animated` | `boolean` | `true` | Roll in on scroll and spin on hover. |
| `staggerDelay` | `number` | `0` | Extra seconds before the first tile. |
| `autoplay` | `boolean` | `false` | Lift and spin each tile in turn until touched. |
| `className` | `string` | `""` | Grid wrapper classes. |
| `itemClassName` | `string` | `""` | Every tile wrapper. |

Defaults: Monthly revenue `$84,210`, 2x1, `#0071e3`, trend +12.4 "vs last month", trending-up icon; Latency `42ms`, `#30d158`, clock icon; Active users `32,184`, `#bf5af2`, +8.1 "this week", people icon; Uptime `99.99%`, `#ff9f0a`, shield-check icon; Edge regions `18`, `#ff3b30`, +20 "new this quarter", globe icon. Icons are 16px outline paths, stroke 1.6.

## Layout and look

- Wrapper: `@container`, relative, ink `#1d1d1f` / `#f5f5f7`. Grid: `grid-auto-flow: dense`, `grid-auto-rows: 1fr`, gap 12px. Columns: 2 → always 2; 3 → 2, then 3 at ≥520px; 4 → 2, 3 at ≥520px, 4 at ≥720px. Spans map to `col-span`/`row-span` 1 or 2.
- Glass variant only: behind the grid (rounded 28px, overflow hidden) three blurred blobs: 224px `#0071e3/25` (dark `#0a84ff/40`) at top-left (−40px), 224px `#bf5af2/25` (dark /40) bottom-right, 160px `#ff9f0a/20` at one third.
- Tile: focusable `role="group"`, flex column, space-between, radius 22px, padding 16px, overflow hidden, min-height 132px (276px for 1x2 and 2x2). Surfaces:
  - default and spotlight: white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`).
  - glass: `white/60` (dark `#1c1c1e/60`), `backdrop-blur-xl`, shadow adds `inset 0 1px 0 rgba(255,255,255,.9)` (dark `.08`).
  - gradient-border: white / `#1c1c1e`, only the drop shadow, plus an inset 1px hairline `rgba(0,0,0,.08)` / `rgba(255,255,255,.1)` and a 1.5px ring layer filled with `radial-gradient(160px circle at X% Y%, accent, transparent 75%)` masked to the border only (content-box mask with `xor` / `exclude` composite).
- Light: spotlight and glass get a layer `radial-gradient(220px circle at X% Y%, {accent}2e, transparent 70%)`. Default and gradient-border instead get a static 144px accent blob at right −40px, top −48px, opacity .10, `blur-2xl`.
- Top row: icon chip 32px, radius 10px, background `{accent}1f`, colour accent. Trend chip: rounded-full, padding 2px 8px, 11px semibold tabular, 10px arrow (up `M5 8.5v-7M2 4.5l3-3 3 3`, down mirrored); positive `#30d158/12` with `#1a7f37` (dark `#30d158`), negative `#ff3b30/10` with `#c9271d` (dark `#ff6961`); shows `|value|%`.
- Bottom: label 12px medium `#6e6e73` / `#a1a1a6`; value 6px below, semibold tabular, tracking −0.04em, 30px (36px for 2x1, 52px for 1x2/2x2); the trend label 12px grey under it on 2x1 and tall tiles.
- Odometer: each digit is a 1em tall, 0.62em wide window holding a column of 0–9 twice (20 rows); other characters are inline 1em-tall spans.

## Motion

- Tile entrance (once, 40px into view): `opacity 0, y 18, scale .96` → rest, spring stiffness 260, damping 22, delay `staggerDelay + i·0.07`.
- Odometer: wheel position is `digit` once shown (0 before), plus 10 when the tile's spin flag is set. Animate `y: −pos em`, spring stiffness 150, damping 15, mass .9. Digit delay `base + k·0.055` (k = digit index within the value), where base is `staggerDelay + i·0.07 + 0.1` during the first 1.4s after entering view and 0 afterwards so hovers respond instantly. Toggling the spin flag on each hover moves every wheel a full turn (forward or back) and lands with an overshoot.
- Lift: active tile `y −4`, spring 380/22.
- Pointer light: X/Y in percent (start 50, 30) smoothed by springs 260/28. When a tile becomes active without a pointer (focus or autoplay) park it at (78, 18). Spotlight layer opacity 1 when active, 0 otherwise (glass rests at .5), .3s. Border ring fades 0 ↔ 1 in .25s.
- With `animated` false or reduced motion: no entrance, digits snap, no lift, no spins.

## Interaction and states

- Pointer enter or focus on a tile: mark touched, make it active, toggle its spin. Leave or blur clears active if it was that tile. Pointer move updates the light.
- Pointer down anywhere marks the grid touched.

## Autoplay demo

Once in view (and animated, not reduced motion), every 1900ms make the next tile active and toggle its spin, cycling. On touch, stop and clear the active tile.

## Accessibility

- Each tile is focusable with `aria-label` like "Monthly revenue: $84,210, up 12.4% vs last month"; the odometer and decorative layers are `aria-hidden`. Focus outline 2px `#0071e3` / `#0a84ff`, offset 2px.

## Acceptance checklist

- [ ] Tiles rise in sequence and digits roll from 0 to their values, ones staggered by ~55ms.
- [ ] "$", "," and "%" stay fixed while digits spin.
- [ ] Hovering a tile lifts it 4px and spins its digits a full turn with overshoot.
- [ ] Revenue spans two columns and uses the larger 36px figure.
- [ ] `spotlight` shows an accent glow under the pointer; `gradient-border` lights the border there.
- [ ] `glass` shows frosted tiles over coloured blobs.
- [ ] Narrow containers drop to two columns.
- [ ] Autoplay lifts and spins each tile every 1.9s until touched.
