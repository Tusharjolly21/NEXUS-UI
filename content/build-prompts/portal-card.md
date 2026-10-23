# Portal Card

Build a dark card where you hold the pointer down and draw a circle, and a ring of molten sparks tears open where you drew it. Through the hole you see another world, which shifts slightly against the pointer like a view through a window. Click inside to step through (the portal swallows the whole card); click outside, or press Escape, and it collapses in a shower of embers.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS and one `<canvas>` (2D). No animation library. `cn` for class merging.
- File: `components/portal-card/portal-card.tsx` plus an `index.ts`. Named exports: `PortalCard` and `PortalCardProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `children` | `ReactNode` | a dusk valley | What waits on the other side. Real DOM, clipped to the portal. |
| `height` | `number` | `460` | Height of the card, in px. It is always as wide as its parent. |
| `autoplay` | `boolean` | `false` | A ghost hand draws a circle, opens the portal, steps through and returns, until a real pointer arrives. |
| `className` | `string` | none | Extra classes for the card. |

## Layout

- The card is `relative w-full touch-none select-none overflow-hidden rounded-[24px]` with an inline `height` and a dark radial background (`#1a1420` to `#050407`). A 22px strip at the bottom is the "floor" that sparks bounce on.
- Layers, bottom to top: the other side (`absolute inset-0`, clipped), the effects canvas (`absolute inset-0`, `pointer-events-none`, `aria-hidden`), a hint pill "Hold and draw a circle" near the bottom (visible only while closed), and a visually hidden "Open portal" button at the top left that appears on focus.
- The default other side is a dusk gradient (violet to orange) with 40 stars, a sun, three layered SVG hills and a centred headline "The other side." Each layer reads CSS variables `--px` and `--py` (-1 to 1) and moves by a different amount, which gives the parallax. Custom children replace it all.
- While stepped through, a "Close portal" pill sits at the top right of the other side.
- A `ResizeObserver` keeps the canvas at layout `offsetWidth x offsetHeight x min(2, devicePixelRatio)`. Pointer coordinates are `(clientX - rect.left) / k` with `k = rect.width / offsetWidth`, so the card also works inside a CSS-scaled parent.

## Motion

- Drawing: pointerdown on the card (not on a button) captures the pointer and starts a path; points closer than 6px to the last one are skipped. Track the summed turning angle between segments and the path length. When the turn exceeds 0.8 of a full circle and the length is over 220px, fit a circle to the points (least squares, Kasa's method: centre from the covariance of the mean-centred points, radius from the mean squared distance) and open it there. Radius is clamped to between 70px and 0.44 of the smaller card side. The spin direction follows the drawing direction. A glowing orange trail follows the path while drawing, with a few sparks thrown from the pointer. Releasing early cancels.
- Opening: a burst of 260 sparks, then the radius springs from 4px to the target with `v += ((R - r) * 70 - v * 7.5) * dt`, so it overshoots and settles within about a second.
- The opening is a `clip-path: polygon()` of 72 points whose radius is `r * (1 + 0.028 sin(5a + 7t) + 0.018 sin(11a - 13t) + 0.01 sin(23a + 29t))`, so the rim burns raggedly. When stepped through it becomes a plain `circle()`. The rim also gets a darkening radial gradient on the canvas so the far world dims toward the edge.
- Stepping through: click inside the open portal and the radius eases (smoothstep, 0.75s) to cover the whole card from the farthest corner plus 60px. Closing eases back to 0 (0.5s, or 0.85s from fully stepped through) and ends with a 180-spark ember burst.
- Sparks: two pools, 5000 flung sparks and 7000 rim sparks, in typed arrays with ring-buffer heads. The rim emits up to about 5200 short curved streaks per second (angular speed `(520 to 1140) / radius`, drifting outward) plus up to 1400 flung tangential sparks per second. Some flung sparks are "heavy" molten drips (more likely from the lower rim): gravity 900, drag, and a bounce on the floor with 0.32 restitution. Light sparks have drag and a faint gravity.
- Drawing sparks and streaks use additive blending (`lighter`), batched into five colour buckets by remaining life: `#fff7d6`, `#ffd56e`, `#ff9b2f`, `#ff5b16`, `#b8290c`. Also an orange ambient glow around the ring, a squashed oval of light on the floor, a blurred orange ring stroke, a thin pale ring and three arcs of light chasing round the rim.
- Parallax: the far side shifts opposite the pointer (or the ghost), normalised by half the card size and clamped to -1..1.
- Autoplay: a white dot (the ghost hand) rests on the right of a circle (radius 0.3 of the smaller side, centred at 47% height), draws it in 1.3s, follows the portal, steps through at about 3.6s, closes 1.6s after arriving, then repeats. It yields as soon as a real pointer touches the card and returns after the pointer has been away for 4s. It never takes over a portal the visitor opened.
- The loop pauses while the card is off screen (`IntersectionObserver`) and the clock is clamped to 33ms per frame.
- Reduced motion: the portal opens, steps through and closes instantly, with no sparks, ember bursts, flicker, spin or parallax; the ring and glow are drawn as a still frame and the autoplay ghost never runs. The closed card is simply the dark card with its hint.

## Accessibility

- The canvas is `aria-hidden`. The other side is `aria-hidden` and `inert` while the portal is closed, so its content cannot be tabbed to.
- Keyboard: Tab to the "Open portal" button (shown on focus). Enter opens the portal, then the label becomes "Step through", then "Close portal". Escape closes it at any time. The "Close portal" pill is a real button.
- The card uses `touch-action: none` so drawing works on touch; place it where that does not trap page scroll.
