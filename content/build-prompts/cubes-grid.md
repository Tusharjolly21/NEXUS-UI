# Cubes Grid

Build a field of 3D cubes that ripples under the cursor. Moving the pointer lifts cubes into a travelling wave that spreads, bounces off the edges and settles on its own. Offer two looks: a flat, light isometric floor whose crests reveal their side faces and catch a soft light, and a dark grid on a tilted plane that fades into fog, with glowing crests.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS only for the wrapper. No animation library and no WebGL: everything is drawn on one 2D `<canvas>` inside one `requestAnimationFrame` loop. React must not re-render while the loop runs.
- File: `components/cubes-grid/cubes-grid.tsx` plus an `index.ts`. Named exports: `CubesGrid` and `CubesGridProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `variant` | `"isometric" \| "perspective"` | `"isometric"` | The flat light floor, or the tilted dark grid. |
| `autoplay` | `boolean` | none | Drops random ripples while the pointer is idle. Same as `idleRipples`, and wins over it when set. |
| `idleRipples` | `boolean` | `true` | Drops random ripples when the pointer stops. |
| `idleDelay` | `number` | `1.5` | Seconds of stillness before random ripples start. |
| `amplitude` | `number` | `0.7` isometric, `0.9` perspective | Wave height: in tiles (isometric) or cube sizes (perspective). |
| `glow` | `number` | `0.5` isometric, `0.9` perspective | Strength of the light on the crests. `0` turns it off. |
| `speed` | `number` | `7` isometric, `9` perspective | Wave speed, in cubes per second. |
| `damping` | `number` | `0.08` isometric, `0.1` perspective | Wave energy kept per second (0 to 1). Lower settles faster. |
| `gap` | `number` | `0.025` isometric, `0.16` perspective | Seam between cubes: a fraction of a tile, or world units. |
| `cellSize` | `number` | `150` | Isometric: on-screen width of one tile in px (minimum 24). |
| `topColor`, `leftColor`, `rightColor` | `string` (hex) | `#fafaf9`, `#e7e5e4`, `#d6d3d1` | Isometric: face colours. |
| `glowColor` | `string` (hex) | `#a8a29e` | Isometric: colour of the light that follows the ripple. |
| `gridSize` | `number` | `40` | Perspective: cubes per side. |
| `baseColor` | `string` (hex) | `#2a2a30` | Perspective: cube colour at rest. |
| `waveColor` | `string` (hex) | `#ff6a2b` | Perspective: colour of the crests. |
| `backgroundColor` | `string` (hex) | `#0b0b0d` | Perspective: scene background and fog colour. |
| `tilt` | `number` | `0.7` | Perspective: camera tilt away from top-down, in radians. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout

- The component renders a wrapper `div` (`pointer-events-none absolute inset-0`, `aria-hidden`) holding one canvas that fills it. It fills its nearest positioned parent, so the consumer puts it in a `relative` box and layers content above it.
- The canvas is sized to the wrapper with a `ResizeObserver` and scaled by `devicePixelRatio` (capped at 2).
- Because the wrapper ignores pointer events, content on top keeps working. Pointer input is read from `window` listeners instead and ignored when the pointer is outside the wrapper's box.

## The simulation

- A square lattice of heights `h` and velocities `v` obeys the 2D wave equation: each cell accelerates by `c² × (sum of four neighbours − 4h)` minus a small restoring term (`5 × h`) that pulls every cube back to the floor, then velocity is multiplied by `keep^dt` (`keep` is the `damping` value) and heights integrate velocity. Edges are clamped, so waves reflect.
- Sub-step so that `speed × dt / steps ≤ 0.45`, with `dt` capped at 50ms.
- `poke(x, y, strength, radius)` adds `strength × exp(−d² / radius²)` to the velocity around a point.
- Pointer move: convert the pointer to a lattice cell; if it moved at least 0.15 cells, poke with `min(1, 0.45 + moved × 0.3) × speed × (0.8 isometric / 0.6 perspective)`, radius 1.1 / 1.3. Pointer down: a bigger poke, `1.3 × speed`, radius 1.6 / 2.
- Idle: when `idleRipples` is on and the pointer has been still for `idleDelay` seconds, poke a random cell in the middle band of the lattice with `0.9 × speed` every 1.1 to 2 seconds.

## Drawing

- Isometric: a 2:1 diamond lattice large enough to cover the wrapper (cells are `cellSize` wide). Draw cells back to front. Each cube has a top face, and a left and right face whose height grows with the cell's height, so a lowered cube reads as a hole and a raised one as a block. Faces use `topColor`, `leftColor`, `rightColor`. Where the cell is high, mix the top towards `glowColor` by `glow × height`.
- Perspective: a `gridSize × gridSize` lattice of cubes projected through a camera tilted by `tilt`, zoomed so the far rows span the full width, with the near rows running off the sides. Draw far rows first and, inside a row, outer cubes first so inner side faces land on top. Each cube has a top face (with a lighter rim), a front face and one side face towards the centre of view. Colours mix from `baseColor` to `waveColor` by height × `glow`, and fade towards `backgroundColor` with distance.
- Fill the canvas with `backgroundColor` first in perspective mode. In isometric mode leave it transparent so the parent's colour shows through.

## Behaviour

- Pause the loop when the wrapper is off screen (`IntersectionObserver`, 100px margin).
- Reduced motion: draw one still frame, attach no pointer listeners and start no loop.
- All settings live in a ref updated every render, so changing a prop never restarts the loop. The lattice is rebuilt only when its size changes.
- Clean up the observers, listeners and the animation frame on unmount.

## Accessibility

- Purely decorative: `aria-hidden`, no focusable content, no motion under reduced motion.

## Acceptance checklist

- [ ] Moving the pointer across the box raises a ring that spreads, reflects off the edges and settles flat within a few seconds.
- [ ] Isometric: light floor, side faces appear on raised cubes and holes read as holes, soft highlight on crests.
- [ ] Perspective: dark tilted grid, glowing orange crests, far rows fade into the background.
- [ ] Content layered above stays clickable.
- [ ] With the pointer still for 1.5s, random ripples start; `idleRipples={false}` stops them.
- [ ] The loop idles off screen; reduced motion shows one still frame.
- [ ] Resizing the box redraws correctly without a re-mount.
