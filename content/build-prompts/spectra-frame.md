Build a photo grid that rests in black and white. Point at a photo and colour blooms out as a growing circle from exactly where the pointer came in; the photo widens, zooms slightly, its row grows taller and every other photo dims. Move off and the colour drains back into the point where the pointer left. A caption slides up on the open photo. Gallery-quiet, Apple-light, all springs.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useReducedMotion`), React `useId`.
- File: `components/spectra-frame/spectra-frame.tsx`, named export `SpectraFrame` (also default), exported types `SpectraFrameProps` and `SpectraImage`.

## API

`SpectraImage = { src?: string; alt: string }` (no `src` → a drawn scene; `alt` is the caption and accessible name).

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `images` | `SpectraImage[]` | 8 drawn scenes | Photos in reading order. |
| `imageCount` | `number` | `8` | Slices `images`. |
| `columns` | `number` | `4` | Photos per row (rounded, min 1). |
| `gap` | `number` | `8` | Gap in px. |
| `borderRadius` | `number` | `16` | Photo radius in px. |
| `padding` | `number` | `0` | Padding round the grid. |
| `backgroundColor` | `string` | `"transparent"` | Behind the grid. |
| `grayscaleIntensity` | `number` | `100` | 0–100 grey for resting photos. |
| `scaleAmount` | `number` | `1.06` | Zoom of the open photo. |
| `cellMinHeight` | `number` | `128` | Resting row height. |
| `hoveredMinHeight` | `number` | `176` | Height of the open photo's row (grid total stays fixed). |
| `expandedFlex` | `number` | `2.2` | Width growth of the open photo vs. neighbours. |
| `onSelect` | `(index) => void` | – | Click or keyboard activation. |
| `hint` | `string` | `"Point at a photo."` | Caption under the grid; `""` hides it. |
| `autoplay` | `boolean` | `false` | Opens photos in turn until touched. |
| `className` | `string` | `""` | Classes on the root. |

Keep these deprecated no-op props so old code compiles: `aspectRatio`, `transitionSpeed`, `colorRevealTiming`, `expandedBasis`.

### Drawn scenes

An SVG `viewBox 0 0 100 100`, `preserveAspectRatio="xMidYMid slice"`: a vertical gradient sky (top → bottom), a sun circle r 11 at `cx = 30 + (index mod 4)·13`, cy 38, 95% opacity, then a far ridge (90% opacity) and a near ridge. Four ridge kinds: 0 rolling hills, 1 flat sine waves (sea), 2 jagged peaks, 3 long dunes. Eight palettes `[top, bottom, sun, far, near]`:
1. Hills at sunset, kind 0: `#ffb88c #ff6a88 #fff1c9 #c94b7c #6d2a5a`
2. Bright sea, kind 1: `#7fd3ff #d7f2ff #ffffff #2f8fd8 #0b5aa8`
3. Peaks at dusk, kind 2: `#2a2d6e #ff8f6b #ffe2b8 #43307a #1b1745`
4. Desert dunes, kind 3: `#ffe29f #ffa99f #fffbe8 #e88b4e #b5532a`
5. Green valley, kind 0: `#b1f2c9 #e7fff2 #ffffff #3fae75 #1f7a50`
6. Night ridge, kind 2: `#0b1d4d #5b4bc4 #ffd9fa #24236b #0d0f33`
7. Lilac lake, kind 1: `#ffd1e8 #c3b6ff #fff6fd #8e6ad8 #5c3eb0`
8. Red canyon, kind 3: `#ffcf70 #ff7b54 #fff3d6 #d4472f #8c2414`

Ridges sit around y 50–70 (far) and 70–85 (near), closed to the bottom. Gradient ids must be unique (`useId` with colons stripped, per cell and per layer).

## Layout and look

- Root: column, centred, gap 12, full width. Hint 12px `#6e6e73` (dark `#a1a1a6`).
- Grid: flex column with `gap`, `padding`, background, radius `borderRadius + padding`, and a fixed height `rows × cellMinHeight + (rows − 1) × gap + 2 × padding`. Chunk items into rows of `columns`.
- Rows: flex rows, `flex-basis: 0`, `flex-grow` 1 normally, `hoveredMinHeight / cellMinHeight` for the row holding the open photo, so it grows while the others shrink inside the fixed total.
- Cells: buttons with `flex-basis: 0`, `flex-grow` 1 or `expandedFlex` when open, `min-width: 0`, `overflow: hidden`, radius `borderRadius`. Two stacked layers of the same image (`object-fit: cover`):
  - Grey layer: `filter: grayscale(intensity/100) brightness(0.96)`, or `brightness(0.82)` when another photo is open.
  - Colour layer: full colour, masked by `clip-path: circle(R% at X% Y%)` built with `useMotionTemplate`.
- Hairline inset ring `inset 0 0 0 1px rgba(255,255,255,.18)`.
- Caption: bottom strip, gradient `0deg, rgba(0,0,0,.5) → transparent`, padding 24 12 8, 12px semibold white, left-aligned, truncated, `aria-hidden`.

## Motion

- Bloom origin: on pointerenter set X/Y to the pointer position within the cell in percent; on pointerleave set it to the exit position (so the colour drains toward where you left). On focus, use the centre (50/50).
- Bloom radius `R`: opening animates to 150% with spring stiffness 70, damping 16 (slow, soft bloom); closing animates to 0 with spring 120/22. Stop the previous animation first.
- Both image layers scale to `scaleAmount` when open, 1 otherwise, spring 160/20.
- Cell width (`flexGrow`): spring 200/22. Row height (`flexGrow`): spring 200/24.
- Caption: `opacity 0, y 8` ↔ `opacity 1, y 0`, spring 300/26, 0.08s delay when opening.

## Interaction and states

- Pointer enter on a cell opens it; leaving closes it only if it is still the open one. Leaving the whole grid closes everything. Focus opens, blur closes. Click (or Enter/Space) calls `onSelect(index)`.
- Any pointerenter, pointerdown or keydown on the grid marks it touched and ends the demo.
- Reduced motion: radius, width and height changes are instant (`duration 0`); colour appears/disappears without the bloom.
- Clamp `grayscaleIntensity` to 0–100. Empty image lists render nothing but the hint.

## Autoplay demo

Every 1.3s toggle: open the next photo from the order `[0, 5, 2, 7, 1, 6, 3, 4]` (filtered to existing indices), then close it on the next tick, and so on. While demoing, an opened photo blooms from `X = 20 + (index mod 3)·30%`, `Y = 70%`. Stop for good once the grid is touched.

## Accessibility

- Grid `role="group"` labelled "Photos". Each cell is a native button labelled with its `alt`, `aria-pressed` when open, with a 2px focus ring `#0071e3` (dark `#0a84ff`) offset 2px against `#f5f5f7` (dark black). Images inside use empty `alt` because the button carries the name.

## Acceptance checklist

- At rest all photos are greyscale in a 4×2 grid of equal cells.
- Entering a photo from its bottom-left corner blooms colour out from that corner.
- The open photo widens to about 2.2× its neighbours and its row grows from 128 to 176px while the grid height stays the same.
- Other photos dim slightly; the open one zooms 6% and shows its caption.
- Leaving through the right edge drains colour back toward the right edge.
- Tab focuses photos in order and opens them from the centre; Enter calls `onSelect`.
- Autoplay opens and closes photos every 1.3s until touched.
