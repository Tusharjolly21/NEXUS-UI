# Signal Bento Grid

Build a "why choose us" reliability section as a four-tile service-health bento: a wide live latency chart that scrolls in real time, a 30-day uptime bar strip, a request counter with a mini bar chart, and a wide edge-regions tile. Pointing at the chart drops a sprung cursor that rides the line and reads the value under it. Uptime bars spring up when in view and explain any day on hover or with arrow keys; the counter rolls up and keeps ticking; every region pings. Quiet, Apple-light dashboard styling.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[360px]:`, `@min-[540px]:`), framer-motion (`motion`, `animate`, `useInView`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`).
- File: `components/bento-signal-grid/bento-signal-grid.tsx`, named export `BentoSignals`, types `BentoSignalsProps`, `SignalDay` (`"ok" | "degraded" | "down"`), `SignalRegion` (`{ name: string; ms: number; status?: "ok" | "degraded" }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `latency` | `number` | `42` | ms the chart hovers around (min 1). |
| `uptime` | `string` | `"99.98%"` | Uptime figure. |
| `days` | `SignalDay[]` | 30 days, day 11 degraded, day 23 down, rest ok | Oldest first. |
| `requests` | `number` | `12480331` | Rolls up in view, then ticks while live. |
| `regions` | `SignalRegion[]` | Frankfurt 18, Virginia 24, Singapore 61 (degraded), São Paulo 43 | Edge regions. |
| `live` | `boolean` | `true` | Scroll the chart and tick counters. |
| `autoplay` | `boolean` | `false` | Sweep the chart cursor until touched. |
| `className` | `string` | `""` | Grid classes. |

## Layout and look

- `<section aria-label="Service health">`: `@container`, ink `#1d1d1f` / `#f5f5f7`. Grid gap 12px, one column; three columns at ≥540px with Latency and Regions spanning two (order: Latency, Uptime, Requests, Regions).
- Tile: radius 22px, padding 20px, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`). Labels: 12px medium `#6e6e73` / `#a1a1a6` with a 14px outline icon (stroke 1.6). Big numbers: semibold, tabular, tracking −0.04em, ink.
- Latency: label "API latency · p50" (pulse icon); value 36px with a 15px grey "ms". Right: a pill (`#30d158` at 12%, 11px semibold `#1a7f37` / `#30d158`, padding 4px 10px) with a 6px green dot reading "Live" or "Paused". Chart area 12px below, 120px tall, `touch-action: none`: SVG viewBox 320×120 stretched, three gridlines at 25/50/75% (`#f0f0f3` / `#2c2c2e`), area fill with a vertical `#0071e3` gradient .22 → 0, line 2px `#0071e3` / `#0a84ff` round, non-scaling stroke, a 3px head dot at x 318. Cursor group: dashed vertical rule (3 3, `#1d1d1f/20` / `white/25`) and a 4.5px ring dot (white fill, 2px blue stroke; dark fill `#1c1c1e`). Readout pill above the dot: `#1d1d1f` with white 11px semibold tabular "42 ms" (inverted in dark), padding 2px 8px, shadow `0 6px 14px -6px rgba(0,0,0,.5)`, centred on x, clamped 9–91% horizontally, 32px above the dot (min −10px). Caption 12px `#86868b`: "Point at the chart to read any moment."
- Uptime: label "Uptime · 30 days" (shield-check icon); value 28px. Bars 16px below: 44px tall row, gap 1.5px, focusable; each bar flex-1, radius 3px, origin bottom, `#30d158` ok, `#ff9f0a` degraded, `#ff3b30` down. Footer (8px top, 16px tall, 11px tabular grey): "29d ago" … "Today", or for a picked day "{N days ago|Today} · {Operational|Degraded|Outage}" in medium ink.
- Requests: flex column; label "Requests served" (bolt icon); value 28px with `en-US` grouping; "+18% vs last month" 12px (the +18% semibold green). Bottom mini chart (56px, gap 4px, 16px top padding): twelve bars at heights 38 44 41 52 49 58 55 63 60 71 68 82%, radius 4px, `#0071e3/15` (dark `#0a84ff/25`), the last solid blue.
- Regions: label "Edge regions" (globe icon) and "{healthy}/{total} healthy" (count semibold ink). List 12px below, gap 8px, two columns at ≥360px. Item: radius 14px, `#f5f5f7` / `#2c2c2e`, padding 10px 12px; an 8px status dot (green, or orange when degraded), name 13px medium truncating, "{ms} ms" 12px grey; a 4px bar (track `#e8e8ed` / `#3a3a3c`) filled to `ms / (max ms × 1.12)` in the status colour.

## Motion

- Series: `N + 1 = 37` points seeded deterministically (mulberry32, seed 11): `base + sin(i/2.6)·base·.16 + (rand − .5)·base·.16`. Map value to y with `lo = .45·base`, `hi = 1.55·base`: `y = 120 − 12 − k·92` (k clamped 0–1). Step = 320/35.
- Every frame (write path attributes directly via refs, no React render): while running, advance `phase += dt/1100ms`; each time it passes 1, drop the first point and push `prev + (target − prev)·.45 + (rand − .5)·base·.2` with `target = base + sin(t/2600)·base·.16`. Build the line with x `(i − phase)·step`, close the area to the bottom, set the head dot to the value at x 318 and the big number to it (rounded).
- Cursor: target x spring (stiffness 420, damping 34); opacity spring (300/30). Each frame read the spring, linearly interpolate the series at that x (`f = x/step + phase`), and place the dot, rule and readout.
- Tiles enter once in view (40px margin) from `opacity 0, y 18, scale .97`, spring 260/22, delay `i·0.07`.
- Uptime bars: from `scaleY 0` to 1 (ok), .72 (degraded), .5 (down), spring 420/18, staggered 12ms; the picked bar grows to 1.18 and the others fade to .45.
- Requests: spring (stiffness 50, damping 20, restDelta .5) from 0 to `requests` in view; then every 1s add 40–129 while live. Mini bars `scaleY 0 → 1`, spring 300/14, delay `.25 + i·.035`.
- Regions: every 2200ms jitter each `ms` by `sin(j·1.7 + i·2.1)·max(1, ms·.08)`; bars spring (120/16) to the new width, first fill delayed `.3 + i·.07`.
- Pings: live dot scales 1 → 2.6, opacity .6 → 0, 1.4s; region dots 1 → 2.8, .55 → 0, 1.8s, delay `i·.35`; both easeOut forever.
- Reduced motion (or `live` false): chart frozen, no pings, no jitter; under reduced motion everything appears without entrance and the counter jumps.

## Interaction and states

- Chart: pointer enter shows the cursor and marks touched; move sets x to `clamp(4, 316)`; leave hides it.
- Uptime: hovering a bar picks it; leaving or blur clears. Keys: ArrowLeft/Right step (starting from today), Home first, End last.
- Pointer down anywhere marks the section touched.

## Autoplay demo

Unless reduced motion, show the cursor and tween its x between 18% and 88% of the chart width, 3.4s easeInOut, mirrored forever. Poll every 200ms; once touched stop the sweep and hide the cursor unless the pointer is over the chart.

## Accessibility

- Uptime strip: focusable `role="img"` with `aria-label` "30 day history: 28 operational, 1 degraded, 1 with an outage. Use arrow keys to inspect a day."; the footer is `aria-live="polite"`; focus outline 2px blue, offset 4px. Chart, icons and mini bars are `aria-hidden`.

## Acceptance checklist

- [ ] The latency line scrolls left smoothly and the big number tracks its right edge.
- [ ] Pointing at the chart shows a dashed rule, ring dot and "NN ms" pill that glide with a spring.
- [ ] Uptime bars spring up in sequence; the outage bar is the shortest and red.
- [ ] Hovering or arrowing through bars dims the others and names the day.
- [ ] The request count rolls up to 12,480,331 and keeps rising.
- [ ] Regions ping and their bars wobble every 2.2s; Singapore is orange; "3/4 healthy".
- [ ] One column under 540px.
- [ ] Autoplay sweeps the cursor until touched.
