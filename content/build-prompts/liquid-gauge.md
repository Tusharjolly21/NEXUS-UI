# Liquid Gauge

Build a storage meter drawn as liquid in a glass orb. Two layers of waves roll across the surface at different speeds, small bubbles rise through the liquid, the surface leans toward the pointer, and the big percentage in the middle is drawn twice so the part that sits under the liquid turns white. Pressing "Clean up" or "Add files" changes the level, which springs to its new height and sloshes. Near full, the liquid turns orange and the caption warns. The feel is a calm Apple-style settings widget with a playful physical core.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`).
- File: `components/liquid-gauge/liquid-gauge.tsx`. Named export `LiquidGauge` and its `LiquidGaugeProps` type.

## API

- `total?: number`, default `200`: capacity, in units (treat anything below 1 as 1).
- `defaultUsed?: number`, default `136`: amount used on first render, clamped to `0..total`.
- `accent?: string`, default `"#0a84ff"`: liquid colour below the warning level.
- `warnAt?: number`, default `85`: percentage at which the liquid turns `#ff9f0a` and the caption warns.
- `unit?: string`, default `"GB"`.
- `onChange?: (used: number) => void`: called with the new amount after a button press, only if it actually changed.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 16px gap.
- Orb: an SVG exactly 220×220 (`S = 220`, viewBox `0 0 220 220`), `role="img"`, `aria-label="Storage {pct}% used"`. Orb radius `R = 100`, centred at (110, 110). Give every id below a per-instance suffix from `useId()` with colons stripped.
- Defs: clipPath `orb` (the orb circle); clipPath `liq` holding one path (the front wave shape, updated every frame); radialGradient `gl` at cx 35%, cy 28%, r 75% with white stops at offset 0 / opacity .9, offset .35 / opacity .15, offset 1 / opacity 0.
- Paint order:
  1. Orb background circle, fill `#f2f4f8` (dark `#2c2c2e`).
  2. Group clipped to `orb`: the back wave path (fill = liquid colour, opacity .35), the front wave path (fill = liquid colour), the percentage text, the same text again inside a group clipped to `liq` filled `#ffffff`, then the bubbles.
  3. Glare: the orb circle filled with `gl` (dark: opacity .5).
  4. Rim: the orb circle, no fill, 1.5px stroke `rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`).
  5. Highlight: an ellipse at (76, 58), rx 26, ry 10, white at fill-opacity .6 (dark: the element also gets opacity .6), rotated −28° about its centre.
- Percentage text: centred at x 110, baseline y 124, 44px, weight 600, letter-spacing −0.04em, tabular numbers, fill `#1d1d1f` (dark `#f5f5f7`). Content is the rounded level, e.g. `68%`.
- Bubbles: 7 circles at cx `50 + i·20`, r `2 + (i mod 3)`, white at fill-opacity .55.
- Caption block (column, centred, 4px gap, `aria-live="polite"`): `"{used} {unit} of {total} {unit} used"` at 15px semibold `#1d1d1f` (dark `#f5f5f7`); under it 12px either "Plenty of room left." in `#86868b` (dark `#98989d`) or, when warning, "Almost full. Time for a clean-up." in `#c2410c` (dark `#ff9f0a`).
- Buttons row, 8px gap. Both 36px tall, rounded-full, 16px horizontal padding, 13px medium:
  - "Clean up": background `#f0f0f3`, text `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`). Subtracts 40.
  - "Add files": background `#1d1d1f`, text white (dark `#f5f5f7` / `#1d1d1f`). Adds 30. Its focus ring has a 2px offset (dark offset colour `#1c1c1e`).

## Motion

- `level`: `useSpring(used / total, { stiffness: 40, damping: 9 })`, a 0..1 fraction. Setting it springs the surface and overshoots a little.
- `lean`: `useSpring(0, { stiffness: 80, damping: 12 })`. On pointer move over the root set it to `((clientX − left) / width − 0.5) · 2` (−1..1); on pointer leave set it to 0.
- `amp`: a motion value starting at 6 (wave amplitude in px).
- Waves are built every frame in a `requestAnimationFrame` loop and written straight to the path `d` attributes (no React renders). A time `t` advances 0.04 per frame. For a wave with phase `φ`, amplitude `a` and wavelength factor `k`: `y0 = 110 + 100 − level · 200`; start at `M 0 220`, then for x = 0, 4, 8 … 220 add `L x (y0 + sin(x / k + φ) · a + (x − 110) · lean · 0.18)`, close with `L 220 220 Z`.
  - Back wave: `φ = t · 0.8 + 1.6`, `a = amp · 0.8`, `k = 26`.
  - Front wave: `φ = t · 1.3`, `a = amp`, `k = 34`. The same string goes into the `liq` clip path.
- Changing the level: clamp to `0..total`, round, set state, `level.set(v / total)`, and slosh: stop any running slosh, then `animate(amp, [6, 16, 6], { duration: 1.6, ease: "easeOut" })`.
- Displayed percentage: subscribe to `level` with `useMotionValueEvent` and store `round(level · 100)` in state, so the number counts while the surface springs.
- Liquid colour: both wave paths `animate={{ fill: colour }}` (default tween), where colour is `#ff9f0a` when the percentage ≥ `warnAt`, else `accent`.
- Bubbles: each animates `cy` from `S + 10` (230) to `110 + 100 − (pct / 100) · 200 + 20` (just under the surface) with `duration 2.4 + (i mod 4) · 0.5`, `delay i · 0.45`, `repeat: Infinity`, `ease: "easeIn"`; `initial cy` 230.
- Buttons: `whileTap={{ scale: 0.94 }}`.
- Reduced motion (`useReducedMotion()`): `t` stops advancing (the surface stays still but still follows the level), no slosh, no bubbles.

## Interaction and states

- "Clean up" subtracts 40 and "Add files" adds 30, clamped. If the clamped value differs, call `onChange(used)`.
- Moving the pointer anywhere over the component tilts the surface toward it.
- Warning state (≥ `warnAt`%): orange liquid and the warning caption.

## Autoplay demo

With `autoplay`, every 2600ms set the level to the next of `[168, 92, 186, 136]` (written for a 200-unit store; scale each by `total / 200`), looping. A `touched` ref is set on pointer down on the buttons row or by pressing a button; the next tick clears the interval for good. `onChange` is not called by autoplay. Cancel the frame loop, the interval and any slosh animation on unmount.

## Accessibility

- The orb is `role="img"` with a live percentage label; the caption is `aria-live="polite"`.
- Both buttons are native `<button type="button">`; focus ring `focus-visible` 2px `#0071e3` (dark `#0a84ff`), no default outline.
- SSR safe: the wave paths render empty on the server and are filled by the first frame.

## Acceptance checklist

- [ ] The liquid rolls in two layers, the back one fainter and moving slower.
- [ ] Moving the pointer left or right tilts the surface toward it; leaving levels it out with a little wobble.
- [ ] Pressing a button springs the level with a visible overshoot and a bigger wave that settles over about 1.6s.
- [ ] The percentage counts up or down during the spring, and the part under the liquid is white while the rest is dark.
- [ ] At 85% or more the liquid turns orange and the caption warns in orange.
- [ ] Bubbles rise from the bottom and stop just under the surface.
- [ ] Autoplay cycles 84% → 46% → 93% → 68% every 2.6s and stops for good on the first button press.
- [ ] Two instances on a page each use their own clip paths.
- [ ] Dark mode swaps the orb, rim, text, caption and buttons; reduced motion stills the waves.
