# Web Sling Button

Build a call-to-action button on a dark stage where your cursor is a web-shooter. Click anywhere on the stage and a line of silk fires out and splats onto the button in a messy burst of flung fibres and glue. Hold and pull: the button is dragged and tilted on a stretching line beaded with glue knots. Let go and the line dangles and swings; pull too far and it snaps and frays. The button stays a real button.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS and one `<canvas>` drawn with the 2D context. No animation library. `cn` for class merging.
- File: `components/web-sling-button/web-sling-button.tsx` plus an `index.ts`. Named exports: `WebSlingButton` and `WebSlingButtonProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `"Get started"` | Text on the button. |
| `onClick` | `() => void` | none | Called when the button itself is clicked. |
| `height` | `number` | `460` | Height of the stage, in px. |
| `snapAt` | `number` | `2.3` | How far a line can be stretched, as a multiple of its resting length, before it snaps. |
| `autoplay` | `boolean` | `false` | A ghost shoots, pulls and snaps lines in a loop until a real pointer arrives. |
| `className` | `string` | none | Extra classes for the stage. |

## Layout

- The stage is a `relative flex w-full items-center justify-center overflow-hidden rounded-[24px]` div with an inline `height`, `touch-none select-none`, a fixed dark background `radial-gradient(90% 80% at 50% 35%, #272c3d 0%, #141722 55%, #0a0b11 100%)` and the system UI font stack. It looks the same in light and dark site themes.
- The button is a real `<button type="button">`, `z-0`, 64px tall, `rounded-full`, `px-10`, 19px semibold white text with `-0.015em` tracking, no border. Background `linear-gradient(180deg, #5b66ff 0%, #3b43e0 55%, #2c31c2 100%)` with an inset 1px white highlight, an inset 2px dark bottom edge, a 1px dark-indigo ring, a long indigo glow below and a short black shadow. `focus-visible` shows a 4px white ring at 40% opacity. `willChange: transform`.
- The canvas is `absolute inset-0 z-10`, full size, `pointer-events-none` and `aria-hidden`, so clicks pass through to the stage and the button.
- A hint sits at the bottom (`absolute inset-x-0 bottom-5`, centred, 13px, white at 45%, `pointer-events-none`): "Click anywhere to shoot a web. Hold and pull. Pull too hard and it snaps."
- All sizes are read as layout sizes (`offsetWidth`, `offsetHeight`, `offsetLeft`, `offsetTop`) and pointer deltas are divided by `rect.width / offsetWidth`, so it works inside a CSS-scaled parent. A `ResizeObserver` on the stage and on the button refits the canvas (`width x height x min(2, devicePixelRatio)`) and re-measures the button's resting centre and size.

## Motion

Everything runs in one `requestAnimationFrame` loop with `dt` clamped to between 1/240 and 33ms. All state lives inside the effect; the effect depends on `autoplay` and `snapAt`.

**Firing.** `pointerdown` on the stage (not on the button, primary mouse button only) captures the pointer and fires a strand from the pointer to the nearest point on the button's stadium outline (a rounded rectangle with radius `height / 2`), a touch inside the edge. The strand is a verlet chain of 22 points; its resting link length is `distance * 1.02 / 21`. For 0.13s it is "flying": the head moves from the shooter to the anchor and the line trails back to the shooter with a sine wobble of up to 6px that dies out. A strand released while still flying keeps flying and lands as a dangling one. At impact: the button is knocked 140 px/s along the line, `hit` is set to 1 (it decays at 5 per second and squashes the button by up to 4%), and 9 short curved flecks of silk fly off for 0.7s under gravity and drag. At most 7 strands exist; past that the oldest dangling one starts to fall and fade.

**States.** `flying`, `held` (end pinned to the pointer), `dangling` (anchored at the button, end free) and `falling` (nothing pinned, alpha drops by 0.9 per second). A dangling strand older than 9s falls. `pointerup` or `pointercancel` anywhere on the window releases the held strand: it becomes dangling and its resting length shrinks by 18% for a small recoil. Brushing a dangling strand's free end (within 12px of the pointer, after 0.4s) while nothing is held makes it stick to the pointer again.

**Verlet.** Per point: velocity is the last step times damping (0.985, or 0.96 while held), plus gravity (700 px/s^2, or 160 while held). Point 0 is pinned to the anchor, which follows the button's pose; the last point is pinned to the pointer while held. 14 constraint passes per frame, pinned ends weighted as immovable. While held, the link length is raised to `max(rest, distance / 21 * 0.995)`, so the line stretches instead of resisting. `stretch = max(1, distance / (rest * 21))`; when it exceeds `snapAt` the strand snaps: it becomes dangling, `rest *= 0.42` (it recoils), and `fray` is set to 1, decaying to 0.35 at 0.4 per second. Non-held strands ease `stretch` back to 1.

**Button pose.** Offset and rotation on springs. Each held strand adds a pull toward the pointer of `min(70, (stretch - 1) * 60)`; the summed pull is clamped to 80px. Offset spring: stiffness 130, damping 11. Target rotation is the summed torque (`(ax * dy - ay * dx) * k * 0.00035`) plus `offset.x * 0.0025`, clamped to +/-0.3 rad; rotation spring: stiffness 110, damping 10. Applied as `translate(...) rotate(...) scale(...)` on the button every frame; the anchor points are transformed through the same pose so lines stay glued to the button.

**Drawing (silk colour `236,238,245`).** For each strand: a faint shadow offset by (4, 10) at 7% black; the splat; then the bundle.
- Splat: 13 fibres flung from the anchor in random directions (6 to 32px long, quadratic curves with a small bend, some with a branch), each with a faint dark under-stroke so it reads on light surfaces, 7 thin cross-threads between neighbouring fibres, a smear of glue along the line direction and a denser irregular glue patch (a radial gradient on a wobbly outline). It grows over the first 0.1s. Fibres rotate with the button.
- Peeling: when `stretch > 1.04`, 5 grip points around the anchor each draw a hair-thin line to a point along the strand (index `2 + round(stretch * 1.5)`) with a tiny glue dot, fading in as tension rises.
- Bundle: a faint 1.8px core line plus 9 fibres (0.3 to 0.9px, varied opacity, about 22% of them "loose" and sagging). Each fibre is offset sideways by an envelope that is zero at the button end, flares along the span, pinches to 25% at 3 to 5 random glue knots, and is zero at the shooter end unless the end is free; offsets wave with time. The bundle's spread shrinks with tension (`2.2 + 3.2 * (1 - tight)`, divided by `sqrt(stretch)`), so a taut line reads as one thin line. A snapped end widens with `fray`. Glue knots are small radial-gradient blobs stretched along the line.
- Reticle: while the pointer is over the stage (or the ghost is active) the system cursor is hidden and a ring (radius 10, or 7 while holding) with four ticks and a centre dot is drawn in white.

**Autoplay ghost.** A 10-second loop through keyframes of `[time, x, y, pressed]` in fractions of the stage: shoot and pull toward the upper left, release, shoot and pull to the top right until it snaps, then shoot and pull along the bottom. Positions are smoothstepped between keys. It runs only while `autoplay` is on, motion is allowed, and either nothing has been touched or the pointer has been away for 4 seconds.

**Lifecycle.** An `IntersectionObserver` stops the loop while the stage is off screen and restarts it on return. Under reduced motion no strand is ever fired and the ghost never runs; the idle stage is the button and the hint. Cleanup cancels the frame, disconnects both observers, removes the stage and window listeners, and clears the button transform and cursor, so it is safe under React StrictMode.

## Accessibility

- The canvas is `aria-hidden`; the effect is decoration. The label is a real button with a visible `focus-visible` ring, reachable and activatable by keyboard, and `onClick` fires for mouse, touch and keyboard.
- Clicks that land on the button never fire a web, so they cannot be swallowed.
- Under `prefers-reduced-motion` nothing moves.
