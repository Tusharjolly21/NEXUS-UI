# Stamp Swirl

Build a row of four perforated postage stamps whose artwork slowly swirls like wet ink. Hover or focus one and it lifts out of the row, straightens and grows, its ink swirls harder, the others shrink back, and its name and year slide in underneath. The feel is a tactile, physical collection with springy lifts and soft shadows.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`).
- File: `components/stamp-swirl/stamp-swirl.tsx`. Named export `StampSwirl`, props interface `StampSwirlProps`, item type `SwirlStamp`, and the default data as `DEFAULT_STAMPS`.

## API

- `stamps?: SwirlStamp[]`, default four stamps (below). `SwirlStamp = { name: string; date: string; value: string; art: string }`: `date` is the year of issue, `value` the face value printed in the corner (e.g. `"12c"`), `art` any CSS `background` value (layered gradients work best).
- `autoplay?: boolean`, default `false`. Lifts the stamps one after another until the pointer enters.

Default stamps (name, date, value, art):

- Tidepool, 1974, 12c: `radial-gradient(60% 50% at 30% 30%, #ffe6b8, rgba(255,230,184,0) 60%), radial-gradient(50% 60% at 75% 70%, #2ec4b6, rgba(46,196,182,0) 65%), linear-gradient(160deg,#9be7d8,#126e82)`
- Ember Fields, 1981, 20c: `radial-gradient(50% 50% at 70% 25%, #fff1c1, rgba(255,241,193,0) 60%), radial-gradient(60% 50% at 30% 75%, #e63946, rgba(230,57,70,0) 65%), linear-gradient(170deg,#ffb36b,#9d2b2b)`
- Night Bloom, 1968, 8c: `radial-gradient(45% 45% at 50% 40%, #f0c3ff, rgba(240,195,255,0) 60%), radial-gradient(60% 60% at 20% 80%, #5e5ce6, rgba(94,92,230,0) 65%), linear-gradient(170deg,#3a2f6b,#0f0c29)`
- Moss & Stone, 1990, 32c: `radial-gradient(55% 45% at 35% 35%, #e9f5c8, rgba(233,245,200,0) 60%), radial-gradient(60% 60% at 80% 80%, #3f6f3a, rgba(63,111,58,0) 65%), linear-gradient(160deg,#a7c47e,#2c3e2d)`

## Layout and look

- Root: a centred column with a 24px gap: the stamp row, then the caption.
- Row: flex, items centred, 16px gap, fixed height 210px (room for the lifted stamp).
- Each stamp is a `motion.button`, 84×104px, no outline by default. Resting tilt by index cycles `-3°, 2°, -1.5°, 3°`.
- Paper: an absolutely positioned white layer filling the button. Its edges are perforated with real holes so the surface behind shows through (works on any tinted or dark background). Do it with a CSS mask of five layers composited with `mask-composite: exclude` (`-webkit-mask-composite: xor` for Safari):
  - four hole rows using `radial-gradient(circle, #000 3.2px, transparent 3.6px)`: top and bottom rows with tile size `10px 8px`, `repeat-x`, at positions `1px -4px` and `1px calc(100% + 4px)`; left and right rows with tile size `8px 10px`, `repeat-y`, at `-4px 2px` and `calc(100% + 4px) 2px`;
  - a solid base `linear-gradient(#000,#000)` at `100% 100%`, `no-repeat`.
  This puts half-circle notches (radius about 3.4px) centred on each edge, every 10px.
- Artwork window: inset 7px, `overflow: hidden`. Inside it the art layer is inset `-8%` (bleeds past the window so displacement never shows an edge) with `background: art` and `filter: url(#id)`.
- Face value: bottom 4px, right 6px, 11px bold white with `text-shadow: 0 1px 3px rgba(0,0,0,.4)`.
- Shadow on the button via CSS `filter`: resting `drop-shadow(0 6px 10px rgba(0,0,0,.14))`, lifted `drop-shadow(0 18px 22px rgba(0,0,0,.28))` (switches instantly).
- Caption box: 44×260px, centred, clipped. Idle text "Hover a stamp." 13px `#86868b` (dark `#98989d`). Active: name in a serif italic at 18px `#1d1d1f` (dark `#f5f5f7`), and below it "Issued {date}" 12px tabular numbers `#86868b` (dark `#98989d`).
- Paper stays white in dark mode.

## Motion

- Swirl filter (one per stamp, id from `useId()` with non-alphanumerics stripped, prefixed with a letter): a zero-size hidden `<svg>` containing `<filter x="-10%" y="-10%" width="120%" height="120%">` with `feTurbulence type="turbulence" numOctaves="2"` feeding `feDisplacementMap in="SourceGraphic" xChannelSelector="R" yChannelSelector="B"`. Set turbulence `seed` to `1 + index`.
- A `requestAnimationFrame` loop per stamp, driven imperatively through refs (no React re-render per frame). With `t = now/1000 + index·2.3`:
  - `baseFrequency = "(0.012 + sin(0.7t)·0.004) (0.018 + cos(0.5t)·0.005)"`, 4 decimals;
  - displacement strength eases toward a target each frame: `s += (target − s)·0.06`, target 34 when the stamp is active, 12 otherwise, starting at 10; write `scale` with one decimal.
  Restart on `active` change; cancel on unmount.
- Stamp transform (framer `animate`, `initial={false}`), spring stiffness 260, damping 20:
  - active: `scale 1.45, rotate 0, y −6, zIndex 10`;
  - another stamp active: `scale 0.92`, its resting tilt, `y 0`, `zIndex 1`;
  - nothing active: `scale 1`, resting tilt, `y 0`.
- Caption: `AnimatePresence mode="popLayout" initial={false}` keyed by the active index (or "none"); enter from `y 18, opacity 0`, exit to `y −18, opacity 0`.

## Interaction and states

- State: `hover: number | null`.
- Pointer enter or focus sets a stamp active; leave or blur clears it.
- Reduced motion (`prefers-reduced-motion`): skip the rAF loop and set a fixed displacement scale (34 active, 12 otherwise).

## Autoplay demo

With `autoplay`, every 1500ms advance a counter `k` and set `hover` to `k mod (n+1)`, where the extra step `n` means "none" (so it lifts stamp 0, 1, 2, 3, then rests, then repeats). Pointer enter on the root, or focusing a stamp, marks the component as touched; the next tick clears the interval.

## Accessibility

- Each stamp is a real `<button type="button">` with `aria-label="{name}, {date}"`.
- Focus ring: `:focus-visible` 2px outline `#0071e3` (dark `#0a84ff`) with 4px offset; no ring-offset fill.
- The caption box has `aria-live="polite"`. The filter SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Four tilted stamps with notched perforated edges; the background shows through the notches in light and dark mode.
- [ ] Each artwork wobbles continuously, out of phase with the others.
- [ ] Hovering a stamp straightens it, lifts it 6px, scales it to 1.45 above its neighbours, deepens its shadow, and the others shrink to 0.92.
- [ ] The hovered stamp's distortion ramps up smoothly (not instantly) and relaxes back on leave.
- [ ] The caption rolls up from below to the stamp's name in serif italic and "Issued {year}".
- [ ] Focus behaves like hover.
- [ ] Autoplay walks the row every 1.5s with a rest step and stops once the pointer enters.
- [ ] With reduced motion on, the art is static but still changes strength when a stamp lifts.
