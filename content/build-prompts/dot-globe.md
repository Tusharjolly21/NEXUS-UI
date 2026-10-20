# Dot Globe

Build a dotted globe drawn on a canvas, with glowing flight arcs that draw themselves along great circles between cities. It turns slowly on its own; drag it and it coasts to a stop; tap a city chip and it springs round to face that city with a name tag. Clean, light and precise.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`).
- 2D canvas with a hand-written orthographic projection; no WebGL or 3D library.
- File: `components/dot-globe/dot-globe.tsx`, named export `DotGlobe`. Also export `DotGlobeCity` (`{ id, name, lat, lon }`), `DOT_GLOBE_CITIES` and `DOT_GLOBE_ROUTES`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `size` | `number` | `340` | Canvas width and height in px. |
| `accent` | `string` | `"#0071e3"` | Arcs, pins and the selected chip. |
| `cities` | `DotGlobeCity[]` | `DOT_GLOBE_CITIES` | Cities to pin and list as chips. |
| `routes` | `[string, string][]` | `DOT_GLOBE_ROUTES` | Arcs as pairs of city ids; pairs with an unknown id are skipped. |
| `autoplay` | `boolean` | `false` | Tours the cities until the user interacts. |

Default cities: San Francisco (37.77, −122.42) `sf`, New York (40.71, −74.01) `ny`, São Paulo (−23.55, −46.63) `sp`, London (51.51, −0.13) `ldn`, Cape Town (−33.92, 18.42) `cpt`, Bengaluru (12.97, 77.59) `blr`, Tokyo (35.68, 139.69) `tyo`, Sydney (−33.87, 151.21) `syd`. Default routes: sf–tyo, ny–ldn, ldn–blr, blr–syd, sp–cpt, ny–sp, tyo–syd.

## Geometry

- Lat/lon to unit vector: `[cos(lat)·sin(lon), sin(lat), cos(lat)·cos(lon)]`.
- Surface dots: 1600 points on a Fibonacci lattice (golden angle `π(3 − √5)`, `y` from 1 to −1, ring radius `√(1 − y²)`), computed once at module level.
- Rotation: `yaw` and `pitch` are framer motion values in degrees, starting at −20 and −18. Rotate around Y by yaw, then around X by pitch; screen `x = C + x′·R`, `y = C − y′·R`, keep `z′` for depth. `R = 0.42 × size`, `C = size / 2`.

## Layout and look

- Root: centred column, gap 16px. Canvas at `size × size` CSS px; backing store × DPR (capped at 2). `cursor-grab` (`grabbing` while active), `touch-action: none`, drop-shadow filter `0 30px 40px rgba(0,0,0,.12)` (dark `.6`).
- Each frame, clear and draw in order:
  1. **Body**: a disc of radius R with a radial gradient from `(C − 0.35R, C − 0.4R)`, inner radius `0.1R`, to `(C, C)`, outer radius `1.05R`. Light `#ffffff → #eef1f6`, dark `#3a3a3c → #1c1c1e`.
  2. **Dots**: skip `z < −0.15`. Alpha `0.06` if `z < 0`, else `0.18 + 0.55z`; radius `0.6 + 0.9·max(0, z)`. Ink `rgb(29,29,31)` light, `rgb(245,245,247)` dark.
  3. **Arcs** (below).
  4. **Pins** for front-facing cities (`z ≥ 0`): a pulsing accent halo, then a disc (white, dark `#1c1c1e`) of radius 3.2 (5 when selected), then an accent dot of radius 2.2 (3.6 selected).
  5. **Name tag** above the selected pin: font `600 12px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`; pill width = text width + 16, height 22, radius 11, top at `pinY − 34`; fill `rgba(29,29,31,.9)` light / `rgba(245,245,247,.92)` dark; text centred at `pinY − 23`, `#fff` light / `#1d1d1f` dark.
- Detect dark mode by watching the `dark` class on `document.documentElement` with a `MutationObserver`, since the canvas cannot use Tailwind variants.
- City chips below: wrapping row, max-width 420px, centred, gap 6px. Each is 32px tall, `px-3`, fully rounded, 12px medium, ring `0 0 0 1px rgba(0,0,0,.08)` (dark `rgba(255,255,255,.08)`), `transition-colors 300ms`. Idle: `#ffffff` with `#1d1d1f` text (dark `#2c2c2e` / `#f5f5f7`). Selected: `accent` with white text.

## Motion

- **Idle spin**: while auto-spin is on and nobody is dragging, `yaw += 8°/s`. Auto-spin starts on (regardless of `autoplay`) and turns off permanently on the first drag or city focus.
- **Arcs**: global `phase = ((now − t0)/2600) mod 1`; route k uses `prog = (phase + 0.17k) mod 1`, `head = min(1, 1.6·prog)`, `tail = max(0, 1.6·prog − 0.6)`. Draw the arc as 48 straight segments of a slerp between the two city vectors, each point scaled by `1 + 0.18·sin(πt)` so the arc lifts off the surface. Draw only segments between tail and head; skip a segment when both ends have `z < −0.05`. Segment alpha `0.25 + 0.75·sin(π·(t − tail)/max(0.01, head − tail))`, line width 1.6, round caps, colour `accent`. The visible stroke grows from the origin, then its tail chases the head to the destination.
- **Pin pulse**: `pulse = ((now − t0)/1400) mod 1`; halo radius `3 + pulse × 9` (×18 when selected), alpha `(1 − pulse) × 0.5 × z`.
- **Focus a city**: stop running animations and auto-spin, mark it selected, then spring `yaw` to `−lon` and `pitch` to `lat × 0.85`, both `{ type: "spring", stiffness: 40, damping: 14 }`. Take the shortest way round: `target += round((currentYaw − target)/360) × 360`.
- **Drag**: on pointer down capture the pointer, stop animations and auto-spin. `yaw = startYaw + dx × 0.4`; `pitch = clamp(startPitch + dy × 0.3, −60, 60)`. Track horizontal velocity as `(Δx × 0.4) / max(0.008, Δt seconds)` in degrees per second.
- **Release**: `animate(yaw, yaw.get(), { type: "inertia", velocity, power: 0.6, timeConstant: 700 })`, so the globe coasts and slows. Pitch stays where it was left.
- **Chips**: `whileTap` scale 0.94.

## Interaction and states

- Selection is one id or none; dragging does not clear it. Clicking a chip marks the component touched and focuses that city.
- Redraw every frame; restart the loop when props or the selection change, and cancel it on unmount.

## Autoplay demo

Every 3200ms, focus the city at index `k = (k + 3) mod cities.length` (starting from k = 0, so the first stop is index 3). When the user has dragged or clicked a chip, the interval clears itself and the tour stops.

## Accessibility

- Canvas: `role="img"`, `aria-label` "Globe. Drag to spin." or "Globe, showing {city}. Drag to spin." when one is selected.
- Chips are `<button type="button">` with `aria-pressed`, and a 2px focus-visible outline, offset 2px, `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- The globe shows a shaded disc with denser, brighter dots toward its centre and faint dots near the rim.
- It rotates slowly left to right at load.
- Seven arcs repeatedly draw on and off with staggered timing, arching above the surface and hiding behind the globe.
- Dragging spins it; a quick flick keeps it coasting; tilt stops at ±60°.
- Clicking "Tokyo" springs the globe so Tokyo faces front, with a dark name tag above an enlarged pulsing pin.
- Going from a city at 170° to one at −170° turns the short way.
- Toggling `.dark` on `<html>` repaints the globe in dark tones.
- With `autoplay`, the selection changes every 3.2s until the first drag or click.
