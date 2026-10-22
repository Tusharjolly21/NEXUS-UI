# Empty Chart

Build a chart with nothing to show yet that still looks like a chart. A dashed placeholder line breathes on the grid under a "Connect a source" card. Connect one and it syncs, then the same line bends into the real numbers, the area fills in underneath and the total counts up. Hover the chart, or focus it and use the arrow keys, to read any month.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API.
- File: `components/empty-chart/empty-chart.tsx` plus an `index.ts`. Named exports `EmptyChart`, the constants `EMPTY_CHART_DATA`, `EMPTY_CHART_MONTHS`, `EMPTY_CHART_SOURCES`, and the type `EmptyChartProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `data` | `number[]` | 12 monthly values | One value per point, oldest first, at least two. The total is their sum. |
| `labels` | `string[]` | Nov to Oct | One label per point; every second one is shown on the axis and the rest appear on hover. |
| `sources` | `string[]` | `["Payments", "Spreadsheet", "Database"]` | The buttons offered while empty. |
| `title` | `string` | `"Revenue, last 12 months"` | Caption above the total. |
| `prefix` | `string` | `"$"` | Before the total and hover values. |
| `suffix` | `string` | `"k"` | After the total and hover values. |
| `onConnect` | `(source) => void` | none | Called when a source is connected. Not called by autoplay. |
| `onDisconnect` | `() => void` | none | Called on Disconnect. |
| `autoplay` | `boolean` | `false` | Demos connect, hover, disconnect on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Demo data (thousands): 12.4, 13.1, 12.8, 15.2, 16.9, 16.1, 18.7, 21.3, 20.6, 24.2, 27.9, 31.4; months Nov, Dec, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct. The total reads `$244.6k`.

## Layout and look

- Card: width 540px, `max-width: 100%`, radius 28px, white / dark `#1c1c1e`, padding 20px (24px from 640px), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Header: the caption (13px medium, `#6e6e73` / dark `#a1a1a6`) over the total (30px semibold, tracking -0.03em, tabular numerals). Empty it reads `$—` in `#c7c7cc` / dark `#48484a` (hidden from screen readers, which get "No data yet"); live it is `#1d1d1f` / dark `#f5f5f7`. When live a "Disconnect" pill sits on the right (32px tall, 12.5px medium, bg `#f5f5f7` / dark `#2c2c2e`).
- Chart: an SVG with `viewBox 0 0 460 180`, `width: 100%`, `height: auto`, padding 8 inside the viewBox. Four horizontal grid lines evenly spaced (`#f0f0f3` / dark `rgba(255,255,255,.08)`). Points: `x = 8 + i / (N - 1) * 444`, `y = 172 - value / max * 164` where `max = largest value * 1.08`.
- Line: a smooth cubic path through the points (each segment's control points use the neighbours: `c1 = b + (c - a) / 6`, `c2 = c - (e - b) / 6`, with `a`, `b`, `c`, `e` the previous, current, next and next-next points, clamped at the ends), which has the same number of commands for any data so one path can morph into another. Placeholder: dashed `5 7`, 2px, round caps, `#c7c7cc` / dark `#58585a`, drawn from `max * 0.265 + sin(i * 0.9 + phase) * max * 0.047`. Live: solid, 2.6px, `#0071e3` / dark `#0a84ff`, with a 400ms stroke colour transition.
- Area: the live curve closed down to the bottom edge, filled with a vertical gradient from the accent at 18% opacity to 0.
- Axis: below the chart, every second label, 10.5px, `#6e6e73` / dark `#a1a1a6`, spread with `justify-between`.
- Hover: a vertical guide line (black 15% / dark white 25%), a 5px-radius dot (white fill / dark `#1c1c1e`, 2.5px accent stroke) at the point and a tooltip at the top: radius 10px, bg `#1d1d1f` / dark `#2c2c2e`, white text 12px, label at 70% white then the value semibold.
- Empty-state card over the chart while not live: centred, 18% from the top, width 300px (`max-width: 92%`), radius 18px, padding 16px, bg white 90% / dark `#2c2c2e` 90%, backdrop blur, shadow `0 0 0 1px rgba(0,0,0,.06), 0 16px 36px -18px rgba(0,0,0,.35)` (dark ring white 10%). Title 14.5px semibold ("Connect a source", or "Syncing from <source>…"); hint 12.5px `#6e6e73` / dark `#a1a1a6` ("Your numbers show up here in about a minute."); source buttons 32px pills (12.5px medium, bg `#f5f5f7` / dark `#3a3a3c`) wrapping in the middle. While syncing, a 6px tall, 80% wide progress track (`#ececf0` / dark `#3a3a3c`) with an accent fill.

## Motion

- Breathing: while empty, on screen and not reduced, `phase` grows by 0.9 every 1400ms, and the path morphs to it over 1.3s ease-in-out.
- Connect: the card switches to the syncing state for 1.6s (the fill goes from 4% to 100% over 1.5s, `cubic-bezier(.4,0,.2,1)`), then the state is live: the line morphs to the data over 1.1s with `cubic-bezier(.34,1.35,.64,1)` (a slight overshoot), the area fades and scales up in Y from 0.3 over 0.9s after 0.35s, and the total counts from 0 to the sum over 1.4s with `cubic-bezier(.2,0,0,1)`. The empty-state card leaves up 8px, scaling to 0.96.
- Disconnect reverses it: area fades out, line morphs back to the placeholder, total clears.
- Hover dot pops in with a scale from 0; the tooltip rises 4px while fading in.
- Reduced motion: no breathing, no overshoot, 200ms morphs, 500ms sync, the total jumps straight to the sum.

## Interaction and states

- States: `empty`, `sync`, `live`.
- Pressing a source starts the sync. Disconnect returns to `empty`.
- While live, pointer movement over the chart picks the nearest point. The chart is focusable: Left and Right arrows move the point (starting from an end), Escape or blur clears it.
- The empty-state card is inert while syncing.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced. Loop of 8.6s: reset at 0, connect the first source at 1.8s, show the tooltip on the tenth point at 5.6s, hide it at 6.8s, reset at 8.2s. Any pointer press or hover on the live chart stops the loop for good. The demo never calls the callbacks.

## Accessibility

- The SVG is `role="img"` with an `aria-label` that reads the chart summary, or the hovered point ("Mar: $16.9k"); it is focusable while live. A polite `sr-only` `role="status"` region announces "Syncing from <source>" and "Connected. Total ...". The grid, area and axis are decorative.
- Source buttons and Disconnect are real buttons; focus rings are 2px `#0071e3` (dark `#0a84ff`) outlines with 2px offset.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing a source plays `tap` (0.5). When the numbers arrive and the line bends into place it plays `done` (0.55). Disconnect plays `tap` (0.35).
- Autoplay plays the same `tap` and `done` through `play.auto`, which stays silent until the visitor has interacted with the page once. Hover, the breathing line and the count-up are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs with the component.

## Acceptance checklist

- [ ] The dashed line gently changes shape every 1.4s while empty and on screen.
- [ ] A source press shows "Syncing from <source>…" with a filling bar, then the line bends into the data with a small overshoot.
- [ ] The area fades in under the line and the total counts up to `$244.6k`.
- [ ] Hovering, or arrowing with the keyboard, shows a guide, a dot and a tooltip for each month.
- [ ] Disconnect returns to the placeholder.
- [ ] Autoplay connects, reads a month and disconnects on a loop and stops for good on touch.
- [ ] Dark mode uses the dark card, subtle grid and the brighter blue; nothing overflows at 320px.
- [ ] Reduced motion shows every state with no looping or overshoot.
