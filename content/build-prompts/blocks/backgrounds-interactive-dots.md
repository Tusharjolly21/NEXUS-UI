# Interactive Dots

Build a canvas background of evenly spaced dots that scatter away from the pointer and spring back home, optionally joined to their neighbours by faint gradient lines. It sits behind a hero headline and should feel calm at rest and tactile under the cursor: soft, springy, never jittery.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS. No animation library: one `<canvas>` with a 2D context and a `requestAnimationFrame` loop.
- File: `components/interactive-dots/interactive-dots.tsx`, named export `InteractiveDots`, plus exported types `InteractiveDotsMode = "dots" | "lines"` and `InteractiveDotsProps`. Re-export both from an `index.ts`.
- A `cn()` helper (clsx + tailwind-merge) merges the root classes.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `mode` | `"dots" \| "lines"` | `"lines"` | Starting style. Held in local state so the built-in toggle can change it. |
| `dotSize` | `number` | `2.4` | Resting dot radius (px). |
| `dotSpacing` | `number` | `30` | Grid pitch (px). |
| `dotColor` | `string` | `"rgba(148, 163, 184, 0.62)"` | Dot colour at rest. |
| `activeDotColor` | `string` | `"rgba(125, 211, 252, 0.95)"` | Colour and glow of displaced dots; far end of each line gradient. |
| `lineColor` | `string` | `"rgba(125, 211, 252, 0.72)"` | Near end of each line gradient. |
| `backgroundColor` | `string` | `"#05070d"` | Canvas fill and root background. |
| `interactionRadius` | `number` | `120` | Pointer influence radius (px). |
| `repulsionStrength` | `number` | `44` | Max push distance (px) for a dot right under the pointer. |
| `smoothing` | `number` | `0.12` | Spring factor toward the target each frame (min 0.01). |
| `damping` | `number` | `0.82` | Velocity retained each frame, clamped to 0–1. |
| `lineDistance` | `number` | `68` | Max distance (px) at which two dots are joined. |
| `lineWidth` | `number` | `0.8` | Line width; below 1 lines are dashed `[2, 7]`. |
| `lineOpacity` | `number` | `0.36` | Alpha of the shortest lines. |
| `showToggle` | `boolean` | `true` | Shows the mode pill in the top-right corner. |
| `className` | `string` | — | Merged onto the root. |

## Layout and look

- Root: `relative isolate h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950`, with inline `background-color: backgroundColor`. When used as a hero backdrop, pass `absolute inset-0 h-full min-h-0 rounded-none border-0`.
- Canvas: `absolute inset-0 h-full w-full`. Size the backing store to `width × dpr` / `height × dpr` with `dpr = min(devicePixelRatio, 2)`, keep CSS size in px, and `setTransform(dpr, 0, 0, dpr, 0, 0)`.
- Grid: `columns = max(2, ceil(width / spacing) + 1)`, `rows` likewise; centre it with `offsetX = (width − (columns − 1)·spacing) / 2` (same for Y). On rebuild, carry each old dot's position/velocity over by index, easing it 35% toward the new home (`lerp(home, prior, 0.35)`), so resizing doesn't snap.
- Background each frame: clear, fill `backgroundColor`, then a radial glow centred at top-middle (`width/2, 0`), radius `max(width, height) × 0.75`, stops `rgba(56,189,248,.13)` at 0, `rgba(99,102,241,.06)` at 0.4, transparent at 1.
- Lines (lines mode only): for each pair within `lineDistance` (skip early on |dx| or |dy| over the limit), alpha = `(1 − d / lineDistance) × lineOpacity`, stroke a linear gradient `lineColor → activeDotColor` from A to B, round caps.
- Dots: activity = `clamp01(displacement / max(1, repulsionStrength × 0.8))`. Radius `dotSize × (1 + activity × 0.75)`, alpha `0.72 + activity × 0.28`. If activity > 0.05 fill with `activeDotColor` and add `shadowBlur = 12 × activity` in the same colour; otherwise `dotColor`, no shadow.
- Toggle pill: `absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/80 shadow-sm backdrop-blur-md`, hover `bg-white/12 text-white`, focus-visible `ring-2 ring-cyan-300/60`. Label "Dots" or "Dot Lines".
- Inner hairline overlay: `pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5`.
- Responsive: the grid is computed from the root's measured size, so it fills phone, tablet and desktop alike; dot count scales with area.

## Motion

Per frame, for every dot:

1. Target = home. If the pointer is active and the home point is within `interactionRadius`, `force = (1 − d / radius)²`; push the target along the angle from pointer to home by `repulsionStrength × force`.
2. Spring: `vx = (vx + (targetX − x) × smoothing) × damping`, same for y; `x += vx`, `y += vy`.
3. Draw background, lines, dots.

There are no tweens: the push and the settle are both this one spring integrator. With the defaults the dots overshoot slightly and settle in well under a second.

## Interaction and states

- `pointermove` on the canvas (passive) stores the pointer in canvas coordinates, marks it active and starts the loop; `pointerleave` deactivates it so dots spring home.
- The loop runs only while the root is on screen (IntersectionObserver, threshold 0.02); off screen it stops. If reduced motion is on, the tick draws a single static frame and stops.
- A ResizeObserver on the root rebuilds the grid. Changing any visual prop re-runs the setup effect.
- The toggle flips local mode between "dots" and "lines"; a separate effect stores the mode in a ref, redraws and restarts the loop.
- Clean up observers, listeners and the pending frame on unmount.

## Demo data

The section shows it as a full-bleed hero, 560px tall, `bg-[#f5f5f7]` (dark `bg-black`), with `showToggle={false}`, `dotSize 2`, `dotSpacing 30`, `interactionRadius 130`, `repulsionStrength 48`, `lineDistance 64`, `lineOpacity 0.3`, and theme-aware colours (Graphite): light `dotColor rgba(29,29,31,.22)`, `activeDotColor #1d1d1f`, `lineColor rgba(29,29,31,.55)`, `backgroundColor #f5f5f7`; dark `rgba(245,245,247,.24)`, `#ffffff`, `rgba(245,245,247,.6)`, `#000000`. Other swatches: Silver and Blue (`#0071e3` light / `#2997ff` dark actives). A bottom gradient (62% tall, page colour to transparent) sits over the canvas, and the copy reads: eyebrow "Fieldwork 2.0", headline "See where your users actually look.", body "Fieldwork maps attention across every page, then tells you which part of the layout is doing the work.", buttons "Start free trial" (`#0071e3`, white text, 44px tall pill) and "Watch the demo" (`#e8e8ed`/85 pill). The headline is 36/48/56px semibold, `tracking-[-0.035em]`, and the copy staggers in (0.07s) from `y 16, blur(6px)` with spring stiffness 240, damping 30.

## Accessibility

- The canvas is decorative; keep real content in the DOM above it.
- The toggle is a real `type="button"` with visible focus and a text label naming the current mode.
- Honour `prefers-reduced-motion: reduce`: no loop, dots at home. Listen for changes: on switching to reduce, stop, reset every dot to home with zero velocity and redraw.

## Acceptance checklist

- [ ] A centred grid of dots fills the root at any size, 30px apart by default.
- [ ] Moving the pointer pushes nearby dots away with a quadratic falloff; they grow, brighten and glow.
- [ ] Leaving the canvas lets every dot spring back to its home point.
- [ ] In lines mode, neighbours closer than 68px are joined by gradient lines that fade with distance; lines under 1px wide are dashed.
- [ ] The corner pill switches between "Dots" and "Dot Lines" without remounting.
- [ ] A soft cyan glow sits at the top centre of the background.
- [ ] Resizing keeps dots near their old positions instead of snapping.
- [ ] Animation pauses when scrolled off screen and does not run with reduced motion.
- [ ] Canvas stays sharp on retina (DPR capped at 2).
- [ ] All observers and listeners are removed on unmount.
