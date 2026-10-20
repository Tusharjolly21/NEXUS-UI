# Weather Puck

Build a "time of day" card. The top half is a small landscape: a gradient sky, a sun or moon, stars and two mountain ridges. The bottom half is a field of dots with a soft glowing puck on it. Drag the puck and nearby dots lift and warm in its light while the landscape relights continuously from before dawn to night, with the hour's name and a clock in the corner. Serene and tactile, like dragging a lamp across a table.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `useMotionValueEvent`, `AnimatePresence`, `drag`).
- The dot field is a 2D canvas redrawn every animation frame; the landscape is DOM + inline SVG driven by motion values (no React re-render per frame).
- File: `components/weather-puck/weather-puck.tsx`, named export `WeatherPuck`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Sweeps the light across the day until the user drags it. |

## Layout and look

Root: centred column, gap 12px; below the card a caption "Drag the light across the dots." at 13px `#86868b` (dark `#98989d`).

Card: 440px wide (max-width 100%), radius 24px, overflow hidden. Light: `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -28px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -28px rgba(0,0,0,.6)`.

**Scene** (180px tall, overflow hidden, `aria-hidden`):

- Background `linear-gradient(180deg, skyTop, skyBottom)`.
- Stars: 24 white 2px dots, star i at `left (i × 37) mod 100 %`, `top (i × 23) mod 55 %`, opacity `0.5 + ((i × 7) mod 5)/10`, all inside one layer whose opacity is driven by time.
- Sun: a 44px circle centred on `(sunX, sunY)`, filled with the glow colour, `box-shadow: 0 0 40px 12px {glow}`.
- Ridges: an SVG 440 × 110 pinned to the bottom with two polygons. Far: `M0 60 L60 30 L120 55 L190 15 L260 50 L330 25 L440 55 L440 110 L0 110 Z`. Near (on top): `M0 85 L80 55 L150 80 L230 50 L300 78 L370 60 L440 80 L440 110 L0 110 Z`.
- Readout at left 16px, top 12px: the hour name (15px semibold white, in a 20px-tall overflow-hidden slot) and the clock below (12px medium tabular-nums, white at 85%), both with `text-shadow: 0 1px 6px rgba(0,0,0,.25)`.

**Field** (130px tall): a canvas covering it, plus the puck. The puck is a 44px circle centred on its position with `radial-gradient(circle at 35% 30%, #fff, rgba(255,255,255,.6) 45%, rgba(255,255,255,0) 70%)` and `box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 0 30px 6px {glow}`, `cursor-grab` (`grabbing` while active), focus-visible 2px ring `#0071e3` (dark `#0a84ff`).

## Colour and position mapping

Puck position: motion values `px` (start `0.45 × 440 = 198`) and `py` (start 65). Time `t = map(px, [22, 418] → [0, 1])`, clamped.

Interpolate these with `useTransform(t, STOPS, colours)` where `STOPS = [0, 0.2, 0.45, 0.7, 0.85, 1]` and the hour names are Before dawn, Sunrise, Midday, Golden hour, Dusk, Night:

| | 0 | 0.2 | 0.45 | 0.7 | 0.85 | 1 |
| --- | --- | --- | --- | --- | --- | --- |
| sky top | `#1b2a4a` | `#f2a77c` | `#6fa8e6` | `#e98a52` | `#4a3b6b` | `#0b1530` |
| sky bottom | `#3b4d7a` | `#ffe3c4` | `#d8ecff` | `#ffd29a` | `#c77d8f` | `#1d2a4d` |
| far ridge | `#3a4466` | `#b9a5b5` | `#8fb0cf` | `#c48a7a` | `#5b4a6e` | `#141c33` |
| near ridge | `#262c45` | `#7d6f86` | `#5f86a8` | `#8a5a5e` | `#3a2f4f` | `#0b1022` |
| glow | `#c7d2ff` | `#ffc48a` | `#fff3c2` | `#ffad5c` | `#ff9fb3` | `#e3e7ff` |

- `sunX = map(t, [0, 1] → [30, 410])`.
- `sunY = 150 − sin(π · clamp((t − 0.08)/0.8, 0, 1)) × 115`: the sun rises from behind the ridges, arcs to 35px from the top at midday and sets again; at the extremes it sits low as a pale moon.
- Stars opacity: `t [0, 0.15, 0.8, 0.95] → [1, 0, 0, 1]`.
- Hour name: the label of the stop nearest to t. Clock: `minutes = round(270 + t × 1140)` (04:30 to 23:30), shown as zero-padded `HH:MM`. Update both from a `useMotionValueEvent(t, "change")`; before the first change they read "Midday" and "12:00".

## Motion

- **Dot field** (each frame): dots on a 14px grid starting at 7px. For a dot at distance d from the puck, `f = exp(−d² / (2 × 46²))` (Gaussian falloff, σ = 46px). Draw it raised by `10f` px with radius `1.5 + 2.6f`. If `f > 0.08`, fill with the current glow colour at alpha `0.35 + 0.65f`; otherwise use ink `#1d1d1f` at alpha 0.16 (dark: `#f5f5f7` at 0.2). Canvas backing store at DPR capped to 2. Detect dark mode with a `MutationObserver` watching the `dark` class on `document.documentElement`.
- **Hour name**: `AnimatePresence mode="popLayout" initial={false}` keyed by the label; enter from `y 18, opacity 0, blur(4px)`, exit to `y −18, opacity 0, blur(4px)`, default transition.
- **Puck drag**: framer `drag` bound to `px`/`py`, `dragMomentum={false}`, `dragElastic 0.05`, constraints `left 22, right 418, top 22, bottom 108`, `whileDrag` scale 1.15. The puck stays exactly under the pointer and stops dead on release.
- Everything else (sky, ridges, sun, stars, glows) follows the motion values instantly, so the scene is continuous with no steps.

## Interaction and states

- Pointer-down on the puck marks the component touched.
- Keyboard on the focused puck: ArrowRight / ArrowLeft animate `px` by ±30px (framer's default transition), clamped to 22–418, and mark touched. Vertical position has no keys.

## Autoplay demo

600ms after mount and every 8000ms after, unless touched: animate `px` through `[current, 410, 30, 0.62 × 440]` and `py` through `[current, 39, 91, 65]`, each over 7s `easeInOut`. One sweep runs dawn to night, back to dawn, and settles in the afternoon. Stop any running sweep on unmount.

## Accessibility

- Puck: `role="slider"`, `tabIndex={0}`, `aria-label="Time of day"`, `aria-valuetext="{hour name}, {clock}"`.
- Scene and canvas are `aria-hidden`.

## Acceptance checklist

- At load the scene shows a blue midday sky with the sun high and the puck slightly left of centre.
- Dragging left turns the sky deep navy with stars; dragging right goes through orange golden hour, purple dusk, then night with stars.
- The sun follows a smooth arc and sinks behind the ridges near both ends.
- Dots within roughly 100px of the puck rise, grow and tint with the glow; farther dots stay grey.
- The hour name rolls with a blur when crossing between stops, and the clock updates continuously.
- The puck cannot leave the field and does not coast after release.
- Arrow keys move the light in 30px steps.
- With `autoplay`, a 7s sweep repeats every 8s until the puck is touched.
