# Falloff Accordion

Build a horizontal row of tall photo strips. When the pointer moves over a strip it opens wide, and its neighbours give way on a smooth bell-shaped falloff, so the whole row leans toward the pointer instead of one item snapping open. A caption fades and rises in on the open strip. It should feel soft, physical and Apple-like: springy widths, a slow zoom-out of the art, nothing abrupt.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/falloff-accordion/falloff-accordion.tsx`. Named export `FalloffAccordion`, plus the `FalloffStrip` type and a `DEFAULT_FALLOFF_STRIPS` array.

## API

`FalloffStrip = { title: string; meta: string; art: string }`. `art` is any CSS `background` value (a gradient, or `url(...) center / cover` for a photo). Titles must be unique; they are the React keys.

`FalloffAccordion` props:

- `strips?: FalloffStrip[]`, default seven gradient strips (angle 170deg, four stops each):
  - Glacier / Iceland: `#e3f2ff 0%, #9cc9f5 40%, #3f6fa8 75%, #1d2f4f`
  - Dune / Morocco: `#ffe2b8 0%, #f5a65b 45%, #b4572b 80%, #5a2615`
  - Fern / New Zealand: `#e4f7c7 0%, #8fd16a 40%, #2f7d4a 75%, #123a26`
  - Bloom / Japan: `#fff0f5 0%, #ffb3cf 40%, #d1477a 78%, #5c1837`
  - Basalt / Scotland: `#e8e8ed 0%, #a1a1aa 40%, #4b4b55 78%, #1d1d22`
  - Lagoon / Maldives: `#e0fffb 0%, #6fe3d6 40%, #1695a3 78%, #0b3c55`
  - Ember / Hawaii: `#ffe9d6 0%, #ff9f6b 35%, #e0402b 70%, #3b0d0d`
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: a column, items centred, 12px gap.
- Row: `display: flex`, 290px tall, 440px wide with `max-width: 100%`, 6px gap between strips.
- Each strip is a `<button type="button">`: `position: relative`, `min-width: 0`, `flex-basis: 0`, `overflow: hidden`, radius 16px, no outline. Start with `flex-grow: 1` so all strips are equal width.
- Inside each strip, three stacked layers:
  1. Art: an absolutely filling span with `background: art`. It is scaled (see Motion).
  2. Shade: an absolutely filling span with `radial-gradient(120% 60% at 50% 110%, rgba(0,0,0,.45), transparent 60%)` so the bottom darkens for the caption.
  3. Caption (only on the open strip): absolute, 16px from the bottom and left, a left-aligned column in white. Title 18px semibold, tracking −0.02em; meta 12px at 85% opacity. Keep both on one line (`white-space: nowrap`) so they do not reflow while the strip grows.
- Hint under the row: "Move along the row.", 13px, `#86868b` (dark `#98989d`).
- Focus ring: `focus-visible` 2px ring `#0071e3` with 2px offset; in dark mode ring `#0a84ff` with a black offset.
- The strip art keeps its colours in dark mode.

## Motion

**Falloff.** Keep one piece of state, `focus: number | null`. For each strip index `i`:

- `d = |i − focus|`
- `grow = focus === null ? 1 : 1 + 6 · exp(−d² / 1.1)`

So the focused strip gets `flex-grow` 7, its direct neighbours about 3.4, the next ones about 1.17, and the rest stay near 1. Animate `flexGrow` to `grow` with a spring: stiffness 200, damping 24. Because all strips share the fixed row width, growing one squeezes the others smoothly.

**Art zoom.** The art layer animates `scale` to 1.06 when its strip is open and 1.2 otherwise, over 0.8s with ease `[0.16, 1, 0.3, 1]`. Opening a strip therefore reads as the photo pulling back slightly.

**Caption.** Wrapped in `AnimatePresence`. Enters from `opacity 0, y 14, blur(4px)` to `opacity 1, y 0, blur(0)`; exits to `opacity 0, y 8`. Duration 0.35s with a 0.08s delay.

## Interaction and states

- `pointerenter` on a strip sets `focus` to its index. `focus` on a strip (keyboard Tab) also sets it.
- `pointerleave` on the row resets `focus` to `null`, so all strips spring back to equal width and captions leave.
- There is no click behaviour; the component is about the hover and focus falloff.
- Only one caption is visible at a time.

## Autoplay demo

With `autoplay`, start an interval of 1500ms with a counter `k = 0`. Each tick sets `focus = k mod strips.length`, then adds 2 to `k`, so it opens every other strip and wraps around. A ref `touched` is set when the pointer enters the row or a strip receives focus; the next tick clears the interval for good. Clear the interval on unmount and when `autoplay` or the strip count changes.

## Accessibility

- Each strip is a native button with `aria-label` = `"{title}, {meta}"` and `aria-expanded` true only on the open strip.
- Tab moves through strips and opens each as it receives focus.
- The art, shade and caption are decorative; the label carries the content.

## Acceptance checklist

- [ ] At rest all seven strips are equal width in a 440×290 row with 6px gaps and 16px corners.
- [ ] Hovering a strip opens it to about seven times its neighbours' base share, with neighbours shrinking on a smooth curve rather than all equally.
- [ ] Moving the pointer along the row shifts the bulge continuously, with spring overshoot but no jitter.
- [ ] The open strip's art eases from 1.2 to 1.06 scale over 0.8s.
- [ ] The caption rises and unblurs in about 0.35s after a short delay, and drops away when the strip closes.
- [ ] Leaving the row returns every strip to equal width.
- [ ] Tabbing through strips opens each in turn with a visible focus ring.
- [ ] Autoplay opens every other strip every 1.5s and stops for good once the pointer enters or a strip is focused.
- [ ] Dark mode changes only the hint colour and focus ring; the strips look the same.
