# Price Odometer

Build a seat-based pricing card whose monthly total rolls like a mechanical odometer. Each digit is its own vertical reel that spins on a soft, slightly heavy spring, digits ripple from right to left, new columns (and the thousands comma) slide in as the number grows, and a "Save N%" badge pops in when you switch to yearly billing. It should feel tactile and precise, like a well-made hardware counter.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`, `layoutId`).
- File: `components/price-odometer/price-odometer.tsx`. Named exports `PriceOdometer` (and `PriceOdometerProps`) plus a reusable `RollingNumber({ value }: { value: number })`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `monthlyRate` | `number` | `15` | Price per seat billed monthly. |
| `yearlyRate` | `number` | `12` | Price per seat billed yearly. |
| `maxSeats` | `number` | `100` | Top of the seats slider (min is 1). |
| `accent` | `string` | `"#0071e3"` | Slider fill, focus ring, badge text and tint. |
| `autoplay` | `boolean` | `false` | Changes seats and billing by itself until someone interacts. |

State: `yearly` (starts false), `seats` (starts 8). `rate = yearly ? yearlyRate : monthlyRate`, `total = rate × seats`, `saving = round((1 − yearlyRate / monthlyRate) × 100)`.

## Layout and look

- Card: full width, max 460px, 28px padding, 24px vertical gap, radius 28px. Light: white, shadow `0 0 0 1px rgba(0,0,0,.04), 0 24px 50px -28px rgba(0,0,0,.28)`. Dark: `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -28px rgba(0,0,0,.6)`.
- Top row (space-between): a 220px, 2-column segmented control (radius 12px, 3px padding, bg `#f0f0f3` / dark `#3a3a3c`; buttons 32px tall, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`; "Monthly" and "Yearly"). Active thumb: white / dark `#636366`, radius 9px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`. On the right, when yearly: badge "Save {saving}%", fully rounded, padding 6px × 10px, 12px semibold, text accent, background accent + `"1f"` (~12% alpha).
- Price block (4px gap): a row aligned to the top — "$" at 40px, tracking −0.02em, 8px top margin, 4px right margin; the rolling number at 84px semibold, line-height 1, tracking −0.045em, tabular numbers, `#1d1d1f` / `#f5f5f7`; "/mo" at 17px medium, tracking −0.01em, `#86868b` / `#98989d`, bottom-aligned with 12px bottom margin and 10px left margin. Under it: "$`rate` per seat, billed monthly|yearly" at 14px grey.
- Seats (10px gap): label "Seats" (15px medium) and the value (15px semibold, tabular) space-between on a baseline. Slider area 26px tall: a 4px rounded track `#e8e8ed` / dark `#48484a`, an accent fill from the left with width `(seats − 1) / (maxSeats − 1) × 100%`, and a native range input on top with a transparent track.
- Range thumb (style via `::-webkit-slider-thumb` and `::-moz-range-thumb`): 26px white circle, no border, shadow `0 3px 10px rgba(0,0,0,.18), 0 0 0 .5px rgba(0,0,0,.06)`; scales to 1.12 while active (0.2s transition); on keyboard focus the thumb gets `0 0 0 3px accent`.

## The rolling number

- Format with `toLocaleString("en-US")` and split into characters.
- Each **digit** is a window `1em` tall and `0.6em` wide, `overflow: hidden`, with a vertical mask `linear-gradient(180deg, transparent, #000 16%, #000 84%, transparent)` (set both `mask-image` and `-webkit-mask-image`) so the reel fades at top and bottom. Inside, a column of the numbers 0–9, each `1em` tall and centred. Show digit `d` by translating the column to `y = −d em`.
- A **comma** is a plain span `0.28em` wide.
- Wrap every character in a `motion.span` keyed by its position **from the right** plus its kind, e.g. `p3d` or `p4c`. This keeps the ones/tens/hundreds reels stable as the number gains or loses columns.

## Motion

- Reel spring: stiffness 160, damping 19, mass 1.1 (`initial={false}`). Each reel is delayed `(positionFromRight − 1) × 0.04s`, so the ones digit moves first and the change ripples left.
- Columns: `AnimatePresence initial={false} mode="popLayout"`, each column `layout`; enter from `opacity 0, width 0, blur(6px)` to `width auto`, sharp; exit back to that; spring stiffness 260, damping 28. The `$`, number row and `/mo` are `layout` too, so they slide when the width changes.
- Segment thumb: shared `layoutId` (namespaced with `useId`), spring stiffness 420, damping 32.
- Save badge: enters from `scale 0.4, rotate −14°, opacity 0`, exits to `scale 0.6, opacity 0`, spring stiffness 500, damping 14 (a lively pop with overshoot).
- Slider fill width: spring stiffness 400, damping 40, so it trails the thumb a touch when autoplay jumps.

## Interaction and states

- Monthly/Yearly buttons set billing; the total and the per-seat line update immediately and the reels roll.
- Slider: `min 1`, `max maxSeats`, integer steps; dragging, clicking the track and arrow keys all update seats.
- Any pointer-down anywhere on the card, or a slider change, marks the component touched.

## Autoplay demo

When `autoplay` is true, every 1900ms apply the next step of this loop: seats 24 → toggle billing → seats 3 → seats 67 → toggle billing → seats 100 → seats 12 → repeat. Once touched, the interval clears itself on its next tick.

## Accessibility

- Number wrapper has `aria-label` with the formatted total; the individual reel characters are `aria-hidden` (the 0–9 columns must not be read). The price row has `role="status"`.
- Segmented control: `role="group"`, `aria-label="Billing period"`, buttons with `aria-pressed` and a 2px accent focus-visible outline.
- The slider is a native range input with a `<label htmlFor>` "Seats"; hide the default focus outline and show the thumb ring instead.

## Acceptance checklist

- [ ] Default shows $120/mo (8 seats × $15).
- [ ] Dragging seats rolls each digit vertically, ones digit first, with a soft settle.
- [ ] Going from 3 digits to 4 slides in a new column and a comma; the "$" and "/mo" glide aside.
- [ ] The rolling digits fade out at the top and bottom edges.
- [ ] Switching to Yearly rolls to the yearly total, the thumb slides, and "Save 20%" pops in with a tilt.
- [ ] Screen readers hear the formatted total once, not ten digits per column.
- [ ] With `autoplay`, values change every 1.9s and stop after the first pointer-down.
- [ ] Dark mode matches the colours above.
