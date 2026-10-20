Build an office finder card: a dotted globe drawn on a 2D canvas beside a list of cities, with the selected city's address and email ready to copy. Pick a city (in the list or by tapping its pin) and the globe swings round on a soft spring, overshoots a touch and settles with the city in the middle, where its pin drops in with a bounce and sends out a slow ripple. Drag the globe to spin it and it coasts to a stop. Clean, Apple-light, and calm.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS (container queries via `@container`), framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useReducedMotion`). No 3D library: the sphere is projected by hand on a `<canvas>`.
- File: `components/interactive-globe-explorer/interactive-globe-explorer.tsx`, named export `InteractiveGlobeExplorer` (also default), exported types `GlobeLocation` and `InteractiveGlobeExplorerProps`.
- Dark mode is read from the `dark` class on `<html>` with `useSyncExternalStore` + a `MutationObserver` on its `class` attribute (server snapshot `false`), because the canvas needs the colours in JS.

## API

`GlobeLocation = { id: string; name: string; lat: number; lng: number; address: string; email: string }`

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `locations` | `GlobeLocation[]` | 20 cities | Places to pin. Defaults (ids "1"–"20"): Milan, Cape Town, New York, London, Johannesburg, Tokyo, Paris, Sydney, Dubai, Singapore, Mumbai, Sao Paulo, Toronto, Berlin, Hong Kong, Los Angeles, Barcelona, Amsterdam, Seoul, Istanbul, with real lat/lng, a plausible street address each and one shared placeholder email. |
| `initialLocationId` | `string` | `"4"` (London) | Selected first; falls back to the first location. |
| `onSelect` | `(location) => void` | – | Fires on every selection (keep it in a ref). |
| `title` | `string` | `"Our offices"` | Heading above the list. |
| `autoplay` | `boolean` | `false` | Tours the cities until the user touches anything. |
| `className` | `string` | `""` | Classes on the card; give it a height for the side-by-side layout. |

## Layout and look

- Card: `@container`, flex, `min-height: 420px`, full width, radius 24, `overflow: hidden`, white, text `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, text `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Below 500px container width it stacks (globe stage 250px tall on top); at 500px and up it is a row: stage `flex-1` on the left, a 230px side panel on the right with a left border. Borders are `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`).
- Stage: centred square canvas, size = `max(120, min(stageWidth, stageHeight))`, DPR capped at 2, refit with a ResizeObserver. Hint text "Drag to spin. Tap a pin." at bottom 12px, 12px, `#86868b` (dark `#a1a1a6`), pointer-events none.
- Panel header: padding 16px top, 8px bottom, 20px sides; title 15px semibold tracking −0.01em; count on the right, 12px tabular `#86868b` / `#a1a1a6`.
- List: `role="listbox"`, padding 0 8px 8px, scrolls (`max-height: 180px` when stacked, unbounded side-by-side), thin scrollbar. Rows: full-width buttons, radius 12, padding 8×12, 14px; name on the left (semibold when selected), latitude on the right as `51.5°N` (one decimal, N/S), 11px tabular grey. The selected row has a highlight pill `#f0f0f3` (dark `#2c2c2e`) shared via `layoutId`.
- Detail block (border-top, padding 16): name 17px semibold tracking −0.02em; then address (12px, snug, `#6e6e73` / `#a1a1a6`) and email (12px truncated, `#0059b3` / `#6cb6ff`), each with a 32px round copy button (`#f0f0f3` → hover `#e6e6ea`; dark `#2c2c2e` → `#3a3a3c`) holding a 14px copy icon that swaps to a green `#30d158` check.

### Canvas drawing (every frame)

- Radius `R = size × 0.44`, centre `c = size/2`. Rotate a unit vector by yaw about Y then pitch about X: `x1 = x·cos(yaw) + z·sin(yaw)`, `z1 = −x·sin(yaw) + z·cos(yaw)`, `y2 = y·cos(p) − z1·sin(p)`, `z2 = y·sin(p) + z1·cos(p)`; screen = `(c + x1·R, c − y2·R)`, depth `z2`. `toVec(lat,lng) = [cos(lat)·sin(lng), sin(lat), cos(lat)·cos(lng)]`.
- Sphere: radial gradient from (c − 0.35R, c − 0.4R, r 0.1R) to (c, c, R): `#ffffff → #e4ebf5` (dark `#26304a → #121726`), 1px rim stroke `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`).
- Land dots: build once at module level. Take 12,000 Fibonacci-sphere points (golden angle `π(3 − √5)`, `y = 1 − 2i/(n−1)`), convert to lat/lng and keep those on land according to a coarse 120×60 bitmask of 3° cells (60 hex strings of 30 chars, row 0 at 90°N, column 0 at 180°W, MSB first), traced from a public-domain world map. Draw kept dots with `z > 0.02` as squares of side `max(1.3, size/190)`, alpha `0.22 + z·0.68`, colour `#3d4a5f` (dark `#d5def2`).
- Pins (front side only, alpha `min(1, z·2.2)`), accent `#0071e3` (dark `#0a84ff`): unselected = 3px-radius accent dot at 85% (hovered: 4.5px, full alpha). Selected = white disc r 7.5 with accent disc r 5.5, both scaled by the drop factor, plus a ripple. When drop > 0.6, draw a label pill 22px tall, radius 11, 34px above the pin, clamped 4px inside the canvas, text `600 12px` system font with 8px padding; fill `#1d1d1f` text white (dark: fill `#f5f5f7`, text `#1d1d1f`).

## Motion

- Fly-to: yaw target `−lng` in radians, shifted by whole turns to take the short way round (`ty = ty0 + round((cur − ty0)/2π)·2π`); pitch target `lat` clamped to ±1.1 rad. Animate both motion values with framer `animate` and spring stiffness 46, damping 11, mass 1 (visible overshoot). Stop any running flight first. Record `landedAt = now + 450ms`.
- Pin drop: `t = (now − landedAt)/1000`; `drop = t ≤ 0 ? 0 : 1 − e^(−9t)·cos(15t)` (a damped bounce). Ripple: `rp = (t mod 2.2)/1.2`; while `rp < 1`, stroke a 2px accent circle of radius `6 + 22·rp` with alpha `(1 − rp)·0.5·pinAlpha`.
- Drag: rotate by `2.2 / size` radians per pixel (horizontal → yaw, vertical → pitch, pitch clamped ±1.2). Track velocity with smoothing `v = v·0.4 + (delta/dt)·0.6` (dt ≥ 8ms). On release after moving ≥5px, coast: spin clamped ±6 rad/s, tilt ±3, applied each frame with dt ≤ 50ms, decaying `spin·e^(−1.8dt)` and `tilt·e^(−3dt)`, stopping under 0.002.
- Selected row highlight: shared `layoutId` spring 420/34. Detail block: `AnimatePresence mode="popLayout"` keyed by city; enters from `opacity 0, y 10, blur(4px)`, exits to `y −10, blur(4px)`, spring 320/28.
- Copy button: `whileTap` scale 0.9 (spring 500/22); icons pop between copy and check with scale 0.4 ↔ 1 plus opacity (spring 500/18); check reverts after 1.4s.

## Interaction and states

- Canvas pointerdown captures the pointer, stops the flight and any coasting. A release within 5px is a tap: choose the nearest visible pin within 16px of the press point. Hovering (no drag) highlights the nearest pin and sets the cursor to `pointer`, otherwise `grab`. `touch-action: none`, no text selection. Pointerup is listened to on `window`.
- Choosing a city: set it selected, fly, call `onSelect`, and if its row is outside the list's visible area, scroll the list (not the page) to centre it, smooth unless reduced motion.
- Clipboard failures are swallowed; the button still confirms.
- Reduced motion: flights jump instantly, no coasting, pins appear without bounce or ripple, highlight moves without spring, detail block only fades, list scroll is instant.
- Keep live values (dark, selection, locations, reduce, landedAt) in a ref so one rAF loop runs for the component's life; cancel it and disconnect the ResizeObserver on unmount, and stop flights.

## Autoplay demo

With `autoplay` and at least two locations, every 3.2s select the next city in order (wrapping). Any pointer down on the globe or any selection by the user stops the tour for good.

## Accessibility

- Canvas `role="img"` with label "Globe centred on {city}. Drag to spin it, or pick a city from the list."
- List `role="listbox"` labelled "Cities" with `aria-activedescendant`; rows `role="option"`, `aria-selected`, roving tabindex (only the selected row is 0). ArrowDown/ArrowUp select the next/previous city (wrapping) and move focus to it. Inset 2px focus ring `#0071e3` (dark `#0a84ff`).
- Copy buttons are labelled "Copy address" / "Copy email"; a polite live region announces "address copied".

## Acceptance checklist

- The globe shows dotted continents shaded toward the rim and centres London on load.
- Clicking a city swings the globe with a slight overshoot and the pin drops in with a bounce, label and repeating ripple.
- Tapping a pin on the globe selects it; dragging spins the globe and it coasts after release.
- The highlight pill glides between rows; the detail block cross-fades with a blur.
- Copy buttons copy and show a green check for 1.4s.
- Below 500px the layout stacks; side-by-side above.
- Arrow keys move through the list; autoplay stops on first touch.
- Dark mode recolours card, sphere, dots, pins and label.
