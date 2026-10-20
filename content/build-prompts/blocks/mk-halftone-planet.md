# Halftone Planet

Build a two-column payments hero whose right side is a halftone globe: a disc of dots whose size and opacity come from lighting, with a light source that follows the pointer and slow bands of latitude drifting round so the planet reads as turning. The headline words rise in with a blur. It should feel premium and quiet: Apple-like type, one accent colour, and a globe that responds gently rather than spinning wildly.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container`, `@2xl`, `@4xl`, `cqi` units), framer-motion (`motion`, `useReducedMotion`).
- The globe is a plain 2D `<canvas>` with a `requestAnimationFrame` loop; no 3D library.
- File: `halftone-planet.tsx`, named export `HalftonePlanet`, exported `HalftonePlanetProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#0071e3"` | Primary button, badge dot, focus rings. |
| `accentDark` | `string` | — | Dark-mode accent. If unset: `#0a84ff` when `accent` is the default, otherwise `accent`. |
| `ink` | `string` | `"#1d1d1f"` | Dot colour in light mode. |
| `inkDark` | `string` | `"#f5f5f7"` | Dot colour in dark mode. |
| `autoplay` | `boolean` | `true` | Latitude bands drift so the planet turns. |
| `onAction` | `(label: "primary" \| "secondary") => void` | — | Called by the buttons (which `preventDefault` and never navigate). |
| `className` | `string` | — | Merged onto the section. |

## Layout and look

- Section: `@container relative w-full overflow-hidden px-5 py-16 @2xl:py-28`, background `#fbfbfd` (dark `#000`). CSS variables `--mk-accent` and `--mk-accent-dark` set inline.
- Inner grid: `mx-auto max-w-[1120px]`, one column, `@4xl` two columns, `items-center`, gap 24px.
- Copy column (`z-10`, flex column, gap 20px, `@2xl` 24px):
  - Badge pill: `rounded-full px-3 py-1.5`, 13px medium, white with `0 0 0 1px rgba(0,0,0,.08)` (dark `#1c1c1e`, `0 0 0 1px #3a3a3c`); an accent "●" (aria-hidden) then "Now in 40 countries".
  - H1: `clamp(38px, 7.4cqi, 84px)` (at `@4xl`: `clamp(44px, 6.6cqi, 84px)`), semibold, leading 0.98, tracking −0.055em, `#1d1d1f` / `#f5f5f7`. Words: "Payments that travel as far as you do." each in an inline-block span with `margin-right: 0.22em` (none on the last).
  - Paragraph: max 460px, `clamp(16px, 2.4cqi, 19px)`, leading 1.45, `#6e6e73` / `#a1a1a6`: "Accept cards and local methods in 40 countries from one integration. Move your pointer across the globe to light it up."
  - Buttons (wrap, gap 12px), 48px tall pills, 24px x-padding, 15px medium: "Start accepting payments" (accent bg, white text; dark uses `--mk-accent-dark`) and "See coverage" (white, `0 0 0 1px rgba(0,0,0,.1)`; dark `#1c1c1e`, ring `#3a3a3c`, text `#f5f5f7`).
- Globe column: `relative aspect-square w-full max-w-[min(520px,100%)] justify-self-center`, canvas `absolute inset-0 h-full w-full`, `aria-hidden`.
- Canvas drawing (backing = offset size × `min(2, dpr)`):
  - `R = min(W, H) × 0.46`, centre `(W/2, H × 0.52)`.
  - `gap = clamp(R/dpr/26, 6, 9) × dpr` (keeps dot count similar on small canvases). Rows step by `gap`; odd rows offset by `gap/2` (hex packing). Skip points outside the disc.
  - Normal: `nx = x/R`, `ny = y/R`, `nz = sqrt(1 − nx² − ny²)`. Light `L = (Lx, Ly, lz)` with `lz = sqrt(max(0.05, 1 − Lx² − Ly²))`. `lit = nx·Lx + ny·Ly + nz·lz`.
  - Bands: `lat = asin(ny)`, `lon = atan2(nx, nz) + t`, `band = 0.55 + 0.45·sin(lat·7 + sin(lon·2)·0.8)`; `lit = max(0, lit) × band`.
  - Radius `(0.4 + lit·3.4) × dpr × (0.6 + nz·0.4) × (gap / (9·dpr))`; skip if under `0.35·dpr`. Alpha `0.25 + lit·0.75`. Fill colour = ink (or inkDark when `<html>` has `.dark`).
- Responsive: phone and tablet stack copy above the globe; from the `@4xl` container width the two sit side by side. Type scales with container width via `cqi`.

## Motion

- Light rest position `(−0.5, −0.6)` (upper left). Each frame the light eases 6% toward its target (`L += (target − L) × 0.06`); with reduced motion it jumps.
- Spin: `t += 0.004` per frame while `autoplay` and not reduced motion.
- Idle optimisation: skip drawing when not visible (IntersectionObserver), or when not spinning, the light isn't moving (delta ≤ 0.001) and nothing is dirty. Resize and theme change set dirty.
- Entrance (framer-motion, ease `[0.16, 1, 0.3, 1]`): badge from `opacity 0, y 8` over 0.7s; each headline word from `opacity 0, y 30, blur(10px)` over 0.9s with delay `0.1 + i × 0.06`; paragraph from `y 12` over 0.9s, delay 0.5; buttons row from `y 12`, delay 0.65; globe from `opacity 0, scale 0.85` over 1.4s, delay 0.2.
- Buttons: `whileHover y −2`, `whileTap scale 0.96`.

## Interaction and states

- `pointermove` and `pointerdown` on the section aim the light: map the pointer to the canvas rect as −1..1 on each axis, clamp the vector to length 0.95, set as target.
- `pointerleave` (mouse only) sends the light back to rest; touch keeps the last tap.
- A MutationObserver on `<html>`'s class swaps ink colours on theme change.
- Clean up the frame, IntersectionObserver, ResizeObserver and MutationObserver.

## Autoplay demo

With `autoplay` (the default) the bands drift continuously, so the planet slowly turns even without a pointer. Turning it off leaves a static globe that still follows the pointer.

## Accessibility

- Canvas is `aria-hidden`; the heading and paragraph carry the message.
- Buttons are anchors with `href="#"` whose click is prevented; focus ring `ring-2` in the accent with 2px offset (dark offset colour black).
- `prefers-reduced-motion`: no band drift, the light snaps instead of easing; entrance animations still resolve to their final state.

## Acceptance checklist

- [ ] A hex-packed halftone disc renders, lit from the upper left at rest.
- [ ] Moving the pointer anywhere over the section smoothly moves the highlight.
- [ ] Latitude bands drift so the globe appears to rotate while `autoplay` is on.
- [ ] Dots shrink and fade toward the limb and the unlit side.
- [ ] Headline words rise in one by one from a blur.
- [ ] Changing the theme recolours the dots without a reload.
- [ ] Layout is one column on narrow containers and two from `@4xl`.
- [ ] Buttons never navigate and report "primary"/"secondary" to `onAction`.
- [ ] Custom `accent` recolours the button, badge dot and focus rings in both themes.
- [ ] The loop draws nothing off screen and stays idle when nothing changes.
