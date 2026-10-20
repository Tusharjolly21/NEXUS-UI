# Flight Tracker

Build a live flight card. A small plane flies along a dotted arc between two airport codes, banking to follow the curve, while the travelled part of the arc fills in solid behind it. The status line and countdown update as it goes ("On time" → "Landing in 42 min" → "Landed"), and a Details button expands the card to show altitude, speed and distance left. It should feel like a calm, precise system widget: dark, quiet, smooth.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useMotionValueEvent`, `useTransform`, `useReducedMotion`, `layout` animations). The SVG path API (`getTotalLength`, `getPointAtLength`) does the path maths.
- File: `components/flight-tracker/flight-tracker.tsx`, named export `FlightTracker` and type `FlightTrackerProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `from` | `string` | `"NYC"` | Departure airport code. |
| `to` | `string` | `"LON"` | Arrival airport code. |
| `flight` | `string` | `"MK 214"` | Flight number, top right. |
| `departs` | `string` | `"8:30 PM"` | Time under the origin code. |
| `arrives` | `string` | `"8:40 AM"` | Time under the destination code. |
| `minutes` | `number` | `410` | Total flight time; drives the countdown. |
| `miles` | `number` | `3459` | Route length; drives the remaining distance. |
| `autoplay` | `boolean` | `true` | Flies the plane on a loop. When false the plane stays at 35% of the route. |

## Layout and look

- Card: 340px wide (`max-width: 100%`), radius 24px, padding 20px, overflow hidden, text white. Light: bg `#1d1d1f`, shadow `0 24px 50px -24px rgba(0,0,0,.55)`. Dark: bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.1), 0 24px 50px -24px rgba(0,0,0,.9)`.
- Header row (space-between): "Track my flight" 13px semibold; flight number 12px, tabular figures, `rgba(255,255,255,.5)`.
- Route area: 12px below, 90px tall, `position: relative`.
  - SVG 300×90 (viewBox the same, `overflow: visible`, `aria-hidden`). Arc path `M 24 70 Q 150 -10 276 70`, drawn twice: a dotted base (stroke `rgba(255,255,255,.25)`, width 2, `stroke-dasharray: 2 6`, round caps) and a solid white progress stroke (width 2, round caps) whose `pathLength` is `min(1, progress)`.
  - Origin dot: r 4 at (24, 70), white. Destination dot: r 4 at (276, 70), `rgba(255,255,255,.4)`, turning `#30d158` once landed.
  - Plane: 22px white airplane glyph (24-unit viewBox, nose pointing right) in an absolutely positioned wrapper at the top-left of the route area, moved with `x`/`y` motion values; the glyph has -11px left/top margins so it's centred on the point, and its `rotate` is a motion value.
  - Codes along the bottom edge: origin left, destination right-aligned; code 22px semibold, tracking -0.02em; time 11px at 50% white.
- Footer row, 16px below (space-between): status on the left (20px tall, overflow hidden, 13px medium, 6px gap) with an 8px status dot; Details button on the right: 32px tall pill, 12px side padding, 12px medium, bg `rgba(255,255,255,.1)` (hover `.2`), label "Details" / "Less" and a 10px chevron (`M6 9l6 6 6-6`, stroke 3). Focus-visible: 2px white outline.
- Details panel: 16px below, 3-column grid, 8px gap, 1px top border `rgba(255,255,255,.1)`, 16px top padding. Each cell: label 11px at 50% white, value 14px semibold tabular figures.

## Motion

- A `progress` motion value starts at 0.35. One `requestAnimationFrame` loop (in an effect, cancelled on unmount) does two things each frame:
  1. If `autoplay`: `progress += dt × 0.045` (dt in seconds, so a full flight takes about 22s). When it passes 1.08, wrap to 0, so the card holds on "Landed" for about 1.8s before the next flight.
  2. Place the plane: `L = path.getTotalLength()`, `t = min(1, progress) × L`, `a = getPointAtLength(t)`, `b = getPointAtLength(min(L, t + 1))`. Set `x = a.x`, `y = a.y`, `rotate = atan2(b.y − a.y, b.x − a.x)` in degrees. The plane climbs nose-up, levels at the apex and descends nose-down.
- Mirror `progress` into React state `p` (via a change listener) for the text.
- Status dot colour animates to `#ff9f0a` while landing, `#30d158` otherwise; it pulses `scale [1, 1.4, 1]` over 1.6s forever (no pulse with reduced motion).
- Status text: `AnimatePresence mode="popLayout" initial={false}`, enters from `y 14, opacity 0`, exits to `y -14, opacity 0`. Key it by the status with digits replaced (`status.replace(/\d+/, "#")`), so the countdown number updates in place and only state changes animate.
- Expand: the card is a `motion.div` with `layout`, spring `stiffness 300, damping 30`; the header, route and footer rows use `layout="position"` so they move without stretching. The details panel (also `layout`) fades in from `opacity 0, y -6` and out the same way, inside `AnimatePresence initial={false}`. The chevron rotates 180° when open.

## Interaction and states

- Status: `p ≥ 1` → "Landed"; `p > 0.85` → "Landing in N min" with `N = max(0, round((1 − p) × minutes))`; otherwise "On time".
- Details (with `q = min(1, p)` and `s = sin(q·π)`): Altitude `round(s × 38000)` ft, Speed `round(320 + s × 240)` mph, Distance `round((1 − q) × miles)` mi, numbers formatted with `toLocaleString("en-US")`. When landed, altitude shows "0 ft" and speed "0 mph".
- The Details button toggles the panel; nothing else is interactive.

## Autoplay demo

`autoplay` defaults to true: the flight loops forever. With `autoplay={false}` the loop still positions the plane, but progress stays at 0.35 ("On time").

## Accessibility

- The toggle is a real `type="button"` with `aria-expanded`. The SVG, plane and chevron are `aria-hidden`.
- Don't put the status in a live region: the countdown changes many times a second.

## Acceptance checklist

- [ ] The plane sits exactly on the arc at every moment and its nose follows the curve.
- [ ] The solid white line ends exactly under the plane.
- [ ] A flight takes about 22s and the card holds on "Landed" (green destination dot) briefly before restarting.
- [ ] After 85% the dot turns orange and the text reads "Landing in N min", counting down without re-animating each minute.
- [ ] Details expands the card smoothly with a spring and shows altitude peaking near 38,000 ft mid-flight.
- [ ] Distance reaches 0 mi on landing.
- [ ] Custom `from`, `to`, times and flight number render in place of the defaults.
- [ ] Dark mode uses `#1c1c1e` with a hairline ring.
