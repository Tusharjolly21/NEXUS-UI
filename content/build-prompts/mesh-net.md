# Mesh Net

Build a background that is almost invisible until the cursor comes near. A distorted triangular net is drawn on a canvas; near the pointer the nodes are shoved outward on springs and the edges light up like a torch passing over them, then fade back to nothing with distance. Nodes overshoot a little as they settle.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS and one `<canvas>`. No animation library. `cn` for class merging.
- File: `components/mesh-net/mesh-net.tsx` plus an `index.ts`. Named exports: `MeshNet` and `MeshNetProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `color` | `string` | `"#5b4fe0"` | Colour of the lit edges, as a 6-digit hex. |
| `background` | `string` | `"#000000"` | Colour the canvas is cleared to every frame. |
| `gridSize` | `number` | `64` | Spacing between nodes, in px. |
| `distortion` | `number` | `0.5` | Random offset of each node as a fraction of the spacing (0 to 0.5). |
| `revealRadius` | `number` | `230` | Radius around the pointer where the net shows and reacts, in px. |
| `push` | `number` | `30` | How far nodes are shoved away from the pointer, in px. |
| `autoplay` | `boolean` | `false` | A ghost pointer drifts in a slow loop until a real pointer arrives. |
| `className` | `string` | none | Extra classes for the wrapper. |
| `children` | `ReactNode` | none | Content layered above the net. |

## Layout

- The wrapper is `relative h-full w-full overflow-hidden`; the canvas is `absolute inset-0` and `pointer-events-none`. Children sit in a `relative z-10 h-full` layer. The parent must give it a height.
- A `ResizeObserver` rebuilds the grid on resize. Canvas size is `width x height x min(2, devicePixelRatio)`.

## Motion

- Nodes sit on a triangular lattice: rows are `gridSize * 0.866` apart and odd rows are offset by half a spacing. Each node gets a random offset up to `gridSize * distortion` from a seeded generator, so the net is the same on every load. Build a few rows and columns past the edge.
- Each node has a position, a velocity and a rest position. Every frame: a spring force toward rest (stiffness 90) plus, inside `revealRadius`, an outward push of `push * (1 - d/R)^2 * strength * 90`. Integrate with `v = (v + f*dt) * 0.02^dt`, using a clamped `dt` (max 33ms).
- The light follows the pointer with a lag (`1 - 0.0005^dt` per frame) and its strength eases toward 1 while the pointer is over the box and 0 when it leaves.
- Edges (right, down and one diagonal per node) are drawn only inside `1.2 * R` of the light: alpha `0.95 * (1 - d/(1.2R))^1.6 * strength`, line width `0.7 + lit * 0.5`. Skip edges below alpha 0.015, so outside the light there is only the background.
- Pointer position comes from a `pointermove` listener on `window`, so content on top does not block it. Ignore positions more than 40px outside the box.
- Pauses while off screen (`IntersectionObserver`). Under reduced motion the nodes are not pushed and the ghost pointer never runs.

## Accessibility

- The canvas is `aria-hidden`. It is decoration; keep real content in `children`.
