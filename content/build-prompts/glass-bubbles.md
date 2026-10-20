Build a panel of four glass orbs hanging on threads from its top edge. When the pointer sweeps through them they swing, bump into each other and spin their icons, then sag back to rest under their anchors. It should feel physical and a little playful: real pendulums, soft glass, nothing scripted.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion.
- File: `components/glass-bubbles/glass-bubbles.tsx`, named export `GlassBubbles`, exported `GlassBubblesProps` and a `GlassBubble` type (`{ ax, len, r, tint, icon, label }`).
- The orbs are DOM elements (so the glass can use CSS gradients, blur and backdrop blur); the threads are one absolutely positioned SVG. Positions are framer-motion `MotionValue`s written from a `requestAnimationFrame` loop, so React never re-renders during the simulation. Create the motion values once (e.g. `motionValue()` inside a `useState` initializer), not by calling hooks in a loop.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Nudges one random bubble every 2.6 s until the user moves the pointer through the panel. |

## Layout and look

- Wrapper: vertical flex, centred, 12px gap. Below the panel a caption, 13px, `#86868b` (dark `#98989d`): "Sweep your pointer through the bubbles."
- Panel: 440 × 300 px, `max-width: 100%`, radius 24px, `overflow: hidden`, `touch-action: none`, relative. Background `radial-gradient(120% 90% at 50% 0%, #ffffff, #e9eef6 70%)`; dark `radial-gradient(120% 90% at 50% 0%, #2c2c2e, #1c1c1e 70%)`. Put the gradient and thread colour in CSS variables so a `.dark` ancestor can swap them.
- The simulation works in a fixed 440 × 300 coordinate space; pointer coordinates are mapped into it from the panel's bounding rect.
- Bubbles (anchor x on the top edge, thread length, radius, tint, label, 24×24 stroke icon):
  - 90, 120, 46, `#5ac8fa`, Search (magnifier)
  - 180, 170, 54, `#bf5af2`, Write (pencil)
  - 270, 110, 42, `#ff9f0a`, Ideas (light bulb)
  - 355, 160, 48, `#30d158`, Code (`< >` chevrons)
- Each orb is a `2r` square centred on its position (negative margins of `r`), pointer-events none, with three layers:
  1. Glow: full-size circle, `radial-gradient(circle at 50% 60%, tint+"55", tint+"10" 60%, transparent 72%)`, `blur(6px)`, shifted down `translateY(10%)`.
  2. Glass body: circle with `overflow: hidden`, `radial-gradient(circle at 32% 28%, rgba(255,255,255,.95), rgba(255,255,255,.25) 26%, rgba(255,255,255,.08) 55%, tint+"33" 80%, tint+"66" 100%)`, box-shadow `inset 0 0 0 1px rgba(255,255,255,.8), inset -6px -10px 18px tint+"55", inset 6px 8px 14px rgba(255,255,255,.7), 0 14px 26px -12px rgba(0,0,0,.25)`, `backdrop-filter: blur(2px)`.
  3. Inside the body: the icon centred at 44% of the orb's size, stroke width 1.8, round caps and joins, coloured with the tint, rotated by the orb's spin value (degrees); plus a specular highlight at left 18%, top 12%, 24% tall, 36% wide, rotated −30°, `white/80`, `blur(2px)`.
- Threads: SVG paths, no fill, stroke 1.2px `rgba(29,29,31,.35)` (dark `rgba(245,245,247,.35)`), drawn beneath the orbs.

## Motion

One rAF loop, `dt = min(0.025, frameDelta seconds)`. State per bubble: `x, y, px, py` (verlet), `rot, vr` (spin). Start at rest: `x = ax`, `y = len`.

1. Integrate (verlet): `vx = (x − px)·0.992`, `vy = (y − py)·0.992`; `px = x`, `py = y`; `x += vx`; `y += vy + 1400·dt²`.
2. Pointer push: for each bubble with distance `d` to the pointer below `r + 22`, move it out by half the overlap along the line (`x += dx·((min − d)/d)·0.5`, same for y) and add spin `vr += pointerVx·0.02·(dy > 0 ? −1 : 1)`. Pointer velocity is the per-move delta in panel units.
3. Repeat 4 relaxation passes of:
   - Thread constraint: if the distance from the anchor `(ax, 0)` exceeds `len`, project the bubble back onto that radius (threads can go slack, they never stretch).
   - Pairwise circle collisions: if two bubbles overlap (`d < rA + rB`), push each apart by half the overlap, and transfer spin `tang = ((xB − pxB) − (xA − pxA))·0.6`; `vrA += tang`, `vrB −= tang`.
   - Walls: clamp `x` to `[r, 440 − r]` and `y` to at most `300 − r`.
4. Spin: `vr *= 0.97`, `rot += vr`.
5. Thread shape: `d` = anchor-to-centre distance, `sag = sqrt(max(0, len² − d²))·0.5`. Path `M ax 0 Q ((ax + x)/2 + 0.3·sag) (y/2 + sag) x (y − r)` — a straight line when taut, a belly when the bubble is pushed up.

## Interaction and states

- Pointer move over the panel sets the pointer and marks the component as touched; pointer leave clears it (bubbles then swing back on their own).
- Keyboard: the panel is focusable; Left/Right arrows send a gust that shifts every bubble's previous x by 9 (verlet impulse of 9 px/frame) in the arrow's direction, and mark the component as touched.

## Autoplay demo

When `autoplay` is on, the user has not interacted and reduced motion is not requested, every 2.6 s pick a random bubble and shift its previous x by ±9 (random sign), so it swings and often knocks a neighbour. It stops for good after the first pointer move or arrow key.

## Accessibility

- Panel: `role="group"`, `tabIndex={0}`, aria-label naming the four bubbles and both ways to play (pointer, arrow keys). Visible focus ring: 2px outline, 4px offset, `#0071e3` (dark `#2997ff`).
- SVG and icons `aria-hidden`.
- Respect `prefers-reduced-motion: reduce` by disabling the autoplay nudges.

## Acceptance checklist

- At rest, four orbs hang straight down at x = 90/180/270/355 with threads of 120/170/110/160 px.
- Sweeping the pointer through pushes orbs away and makes their icons spin in the sweep direction.
- Orbs never overlap each other or leave the panel; threads never stretch beyond their length but can go slack with a visible curve.
- Swinging decays smoothly over a few seconds (0.992 velocity retention per frame); spin decays faster (0.97).
- Autoplay produces a nudge every 2.6 s and stops permanently after interaction.
- Left/Right arrows on the focused panel swing all orbs the matching way.
- Dark mode swaps the panel gradient and thread colour; orbs keep their tinted glass look.
