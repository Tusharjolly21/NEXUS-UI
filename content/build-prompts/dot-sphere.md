Build a turning sphere made of a few hundred dots, drawn on a canvas. It spins slowly on its own with a slight forward tilt; front dots are larger and solid, back dots small and faint, which sells the depth. The pointer parts the dots as it passes, like a hand through beads. Drag to spin it in any direction and let go to watch it coast back to its idle turn while the tilt springs back. Tap and a ripple rolls out from that exact spot over the surface, swelling the dots and lighting them in the accent as it wraps round to the far side. A soft shadow sits underneath.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion only for `useReducedMotion`. Everything else is Canvas 2D and a `requestAnimationFrame` loop.
- File: `components/dot-sphere/dot-sphere.tsx`, named export `DotSphere`, type `DotSphereProps`.
- Dark mode via `useSyncExternalStore` watching the `dark` class on `<html>` (server snapshot light). Colours live in a ref so a theme change does not rebuild the scene.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `dots` | `number` | `420` | Dot count (clamped 24-2400). |
| `radius` | `number` | `130` | Sphere radius px. |
| `color` | `string` | `#1d1d1f` / dark `#f5f5f7` | Dot colour. |
| `accent` | `string` | `#0071e3` / dark `#0a84ff` | Ripple colour. |
| `repel` | `number` | `55` | Pointer push strength 0-100. |
| `speed` | `number` | `30` | Idle spin 0-100. |
| `interactive` | `boolean` | `true` | Pointer push, drag spin, tap ripples, keyboard. |
| `dotSize` | `number` | `3.4` | Base dot diameter px. |
| `hint` | `string` | `"Drag to spin. Tap for a ripple."` | Caption (only when interactive); `""` hides it. |
| `autoplay` | `boolean` | `false` | Ripples and flicks until touched. |
| `className` | `string` | `""` | Root classes. |

## Layout and look

- Root: flex column, centred, gap 8.
- Frame: `pad = round(0.34·radius)`, `box = 2·radius + 2·pad` (396px by default). Width `box`, `max-width: 100%`, `aspect-ratio: 1`, fully round, focusable with a 2px `#0071e3` ring (dark `#0a84ff`).
- Shadow: centred at 86% from the top, 62% wide, 12% tall, elliptical, `radial-gradient(closest-side, rgba(0,0,0,.14), transparent)`; dark mode a blue glow `rgba(10,132,255,.22)`.
- Canvas: fills the frame, `touch-action: none`, no selection, cursor grab / grabbing when interactive. Backing store `box·dpr` (dpr capped at 2); drawing happens in box units, and pointer positions are scaled from the rendered size back to box units.
- Hint: 12px `#86868b` (dark `#a1a1a6`).

## Geometry and drawing

- Points: a Fibonacci sphere. For i in 0..n−1: `y = 1 − 2i/(n−1)`, `r = sqrt(1 − y²)`, `θ = i·π(3 − √5)`, point `(cos θ·r, y, sin θ·r)`. Each dot also has a 2D offset `(ox, oy)` and velocity for the repel effect.
- Rotation: yaw about y, then pitch about x. `x1 = x·cos(yaw) + z·sin(yaw)`, `z1 = −x·sin(yaw) + z·cos(yaw)`, `y2 = y·cos(pitch) − z1·sin(pitch)`, `z2 = y·sin(pitch) + z1·cos(pitch)`. Screen = centre + (x1, y2)·radius·lift.
- Sort back to front by z2 each frame. With `depth = (z2 + 1)/2` and ripple amplitude `amp`: alpha `min(1, 0.14 + 0.86·depth + 0.3·amp)`, radius `(dotSize/2)·(0.4 + 0.7·depth)·(1 + 0.9·amp)`, colour accent when `amp > 0.12`, else the dot colour. Draw at `(sx + ox, sy + oy)`.

## Motion

- Start yaw 0.6, rest pitch −0.32. Idle spin `baseSpin = (speed/100)·0.9` rad/s. dt capped at 0.05s.
- When not dragging: `spin` eases back to `baseSpin` at rate 1.4/s; `tilt` (pitch velocity) decays at 2.5/s, then `pitch += tilt·dt` and `tilt += (−0.32 − pitch)·14·dt` (a soft spring back to rest). Always `yaw += spin·dt`, pitch clamped ±1.25.
- Ripples (max 4): picked by un-projecting the tap onto the front hemisphere (undo pitch then yaw). Each frame, for each dot, angular distance `ang = acos(dot · origin)`; front `= t·2.1` rad/s; width 0.34; life `(π + 0.68)/2.1` s; contribution `exp(−((ang − front)/0.34)²)·(1 − t/life)`, summed and capped at 1. `lift = 1 + 0.14·amp` pushes dots outward.
- Repel (not while dragging): `push = (repel/100)·radius·0.5`, `reach = 0.56·radius`. For dots within reach and `z2 > −0.35`, force away from the pointer `k = (1 − d/reach)²·push·120`. A spring pulls offsets home with force `−55·offset`. Integrate `v = (v + f·dt)·0.86`, `offset += v·dt·8`.
- Drag: each move adds `dx/radius·1.1` to yaw and subtracts `dy/radius·0.9` from pitch; track velocities blended 40% old / 60% new (per second, using event timestamps, min 8ms). On release: `spin = clamp(vx, −8, 8)`, `tilt = clamp(vy, −5, 5)` so it coasts and settles.
- A press that moves less than 6px and lasts under 400ms is a tap: add a ripple there.
- Loop only while on screen (IntersectionObserver) and the tab is visible; clean up all listeners on unmount. Pointer up is listened on `window`; capture the pointer on down (ignore capture errors).

## Interaction and states

- Keyboard on the frame: arrows nudge (`spin += dx`, `tilt += dy`): Left −1.6, Right 1.6, Up +1.2, Down −1.2. Enter or Space sends a ripple from the centre.
- `interactive={false}`: no listeners, no focus, no hint.
- Reduced motion: draw a single static frame; no ripples; drags and key nudges rotate it directly (nudges by 0.3× the amount) and redraw.

## Autoplay demo

Every 2400ms send a ripple from the next of (−0.35, −0.3), (0.42, 0.18), (−0.1, 0.45), (0.25, −0.42) (fractions of radius from the centre); on odd ticks also flick it with spin +2.6 or −2.2 alternately and tilt +0.8. Stops for good on the first pointer down or key.

## Accessibility

- Frame `role="img"` with `aria-label="A sphere of dots. Drag to spin it, tap to send a ripple; arrow keys spin it and Enter sends a ripple."`, focusable when interactive. Shadow `aria-hidden`.

## Acceptance checklist

- Dots are evenly spread; front dots bigger and darker, back dots faint.
- The sphere turns slowly with a slight tilt.
- Moving the pointer over it parts the dots, which spring back.
- Dragging spins it in any direction; release coasts and returns to idle speed and tilt.
- A tap sends an accent ripple that swells dots and wraps round the far side.
- Arrows and Enter work from the keyboard.
- The loop pauses off screen and in hidden tabs.
- Reduced motion shows a still sphere.
