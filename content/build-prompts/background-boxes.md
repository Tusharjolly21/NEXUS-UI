Build an interactive isometric grid background drawn on a single canvas. A huge grid of thin hairline cells is skewed into an isometric plane, with small plus marks at every other intersection, fading out towards the edges. The cell under the pointer pops up like a keyboard key in a bright colour, overshoots and settles, grows little side walls and casts a shadow into the hole it lifted from, while a ripple nudges the two rings of cells around it. Move away and everything drops back flat. Any content passed as children sits on top.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, and framer-motion only for `useReducedMotion`. All drawing is Canvas 2D in one `requestAnimationFrame` loop; there is no DOM per cell.
- File: `components/background-boxes/background-boxes.tsx`, named export `BackgroundBoxes` (also default export) and type `BackgroundBoxesProps`.
- Dark mode is read from the `dark` class on `<html>` via `useSyncExternalStore` + `MutationObserver` (server snapshot `false`). Keep it in a ref so the loop reads it without restarting; mark the canvas dirty when it flips.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `rows` | `number` | `60` | Grid rows (rounded, clamped 2-200). |
| `cols` | `number` | `60` | Grid columns (rounded, clamped 2-200). |
| `boxWidth` | `number` | `64` | Cell width in px before the transform (min 4). |
| `boxHeight` | `number` | `32` | Cell height in px before the transform (min 4). |
| `borderColor` | `string` | theme hairline | Grid line colour. |
| `borderWidth` | `number` | `1` | Grid line width. |
| `showCrosses` | `boolean` | `true` | Plus marks at every other intersection. |
| `crossColor` | `string` | theme grey | Plus mark colour. |
| `hoverColors` | `string[]` | `#0a84ff, #30d158, #ff9f0a, #bf5af2, #ff375f, #64d2ff, #ffd60a` | Colours a popped cell can take (empty array falls back to these). |
| `skewX` | `number` | `-48` | CSS-style skewX in degrees. |
| `skewY` | `number` | `14` | CSS-style skewY in degrees. |
| `scale` | `number` | `0.675` | Grid scale. |
| `rotation` | `number` | `0` | Grid rotation in degrees. |
| `translateX` | `number` | `0` | Pans the grid by % of container width. |
| `translateY` | `number` | `0` | Pans the grid by % of container height. |
| `autoplay` | `boolean` | `false` | A pretend pointer roams the grid until a real pointer moves over it. |
| `children` | `ReactNode` | — | Content above the grid. |
| `className` | `string` | — | Classes on the root (give it a size and background). |

Join `hoverColors` into a string for the effect dependency so an inline array does not restart the loop each render.

## Layout and look

- Root: `relative overflow-hidden` plus `className`. Canvas: absolute inset 0, full size, `pointer-events-none`, `aria-hidden`, masked with `radial-gradient(ellipse 80% 75% at 50% 50%, #000 45%, transparent)`. Children wrapper (only if children): `relative z-10 h-full`.
- Canvas backing store = CSS size × `min(devicePixelRatio, 2)`, set with `setTransform(dpr,0,0,dpr,0,0)`; re-measure with a `ResizeObserver`.
- Grid lines: one path of `rows+1` horizontal and `cols+1` vertical lines, `borderWidth`, colour `borderColor` or `rgba(0,0,0,0.09)` (dark `rgba(255,255,255,0.09)`).
- Crosses: at every second row and column intersection, ±4px horizontal and vertical strokes, `crossColor` or `rgba(0,0,0,0.2)` (dark `rgba(255,255,255,0.22)`); skip points more than 8px off canvas.
- Typical demo: a 340px-tall card, radius 24, white (dark `#111113`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`, with a centred 30-36px semibold headline "Every cell is a key." (tracking −0.045em) and a 13px `#6e6e73` / `#a1a1a6` hint "Run the pointer across the grid.", pointer-events none.

## The transform (the maths)

Map grid space (u, v) to screen with a 2×2 matrix equal to the CSS list `skewX · skewY · scale · rotate`. With `ax = tan(skewX)`, `ay = tan(skewY)`, `a = (1 + ax·ay)·s`, `b = ax·s`, `c = ay·s`, `d = s`, and rotation r:
`m00 = a·cos r + b·sin r`, `m01 = −a·sin r + b·cos r`, `m10 = c·cos r + d·sin r`, `m11 = −c·sin r + d·cos r`.
Screen point = origin + M·(u − gw/2, v − gh/2), where `gw = cols·boxWidth`, `gh = rows·boxHeight`, origin = canvas centre plus `translateX/Y` percent. Hit testing inverts M with its determinant (fallback 1e−6) to find the column and row under a point; outside the grid returns −1.

## Motion

- Lift height `lift = 9 + boxHeight·scale·0.35` px. Cells are kept in a sparse map with height `h`, velocity `v`, target, energy `e` (0-1) and colour.
- Colours are picked with a seeded Park-Miller generator (`seed = seed·16807 mod 2147483647`, start 7), so they look random but repeat deterministically.
- When the hovered cell changes: the old cell's target goes to 0; the new cell gets `e = 1`, target `lift` and a new colour. Queue kicks for the 5×5 neighbourhood (skip centre and out-of-range): ring 1 gets velocity +70 after 0.07s and energy 0.32; ring 2 gets +34 after 0.14s and energy 0.14.
- Every frame (dt capped at 0.05s), per cell, an underdamped spring: `v += (190·(target − h) − 11·v)·dt; h += v·dt`. Non-hovered cells lose energy at 0.6/s. Delete a cell when target 0, energy 0, `|h| < 0.05` and `|v| < 0.5`.
- Only redraw when cells exist or the canvas is dirty. Pause work while off screen (IntersectionObserver); clean up rAF and observers on unmount.

## Drawing a lifted cell

Draw active cells after the grid in painter's order (sorted by the screen y of their centre, top first). For each, with `up = max(−3, h)` and `k = clamp(h/lift, 0, 1)`:
1. Shadow: the cell's flat quad filled `rgba(0,0,0, 0.14·k)` (dark `0.45·k`).
2. If `up > 0.5`, side walls on each edge whose midpoint is below the cell centre: quad from the edge to the edge raised by `up`, filled in the cell colour at alpha `min(1, e + 0.25)`, then overlaid with `rgba(0,0,0,0.38)` for left-facing walls or `0.2` for right-facing.
3. Top face: the quad shifted up by `up`, cell colour at alpha `min(1, e)`, stroked `rgba(255,255,255, 0.35·e)`.

## Interaction and states

- `pointermove` on the root stores the local position and marks the component touched; `pointerleave` clears "inside", so the hovered cell drops back.
- Reduced motion: draw one static frame (grid and crosses) and redraw it when the theme changes; no loop, no pops.

## Autoplay demo

While the pointer is outside and nobody has moved over it yet, a virtual pointer traces a Lissajous path: `x = w·(0.5 + 0.36·sin(0.8t))`, `y = h·(0.5 + 0.3·sin(1.25t + 1))`. The first real `pointermove` stops it for good.

## Accessibility

- The canvas is `aria-hidden` and pointer-events none; the effect is decorative. Children remain fully interactive and readable above it.

## Acceptance checklist

- The grid appears skewed into an isometric plane with plus marks, fading softly to the edges.
- The cell under the pointer pops up in a bright colour, overshoots and settles, with darker side walls and a shadow below.
- Neighbouring cells bump up briefly in two rings, with the outer ring later and weaker.
- Leaving the root drops every cell back flat; idle frames do no drawing.
- Changing `skewX`, `skewY`, `scale`, `rotation` or translate changes the plane and hit testing still lands on the right cell.
- Dark mode switches line, cross and shadow strengths without remounting.
- Reduced motion shows a static grid only; autoplay roams until the first pointer move.
