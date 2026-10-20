# Stock Line

Build a trading-app price chart card. Scrub along it and a dot rides the line, the price rolls digit by digit and the change turns green or red. A 1D/1W/1M/1Y control morphs the line into the next shape instead of redrawing it, and on 1D the last price ticks live. Precise, calm and springy, like Apple Stocks.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `layoutId`).
- File: `components/stock-line/stock-line.tsx`. Named export `StockLine`, plus `StockLineProps`, `StockLineRange` (`"1D" | "1W" | "1M" | "1Y"`) and `StockLineTheme`.

## API

- `theme?: "auto" | "light" | "dark"`, default `"auto"` (auto follows a `.dark` ancestor).
- `symbol?: string`, default `"NXUS"`.
- `smooth?: boolean`, default `true`: cubic curves vs straight segments.
- `fill?: boolean`, default `true`: gradient area under the line.
- `up?: string`, default `"#30d158"`; `down?: string`, default `"#ff453a"`.
- `autoplay?: boolean`, default `false`.

## Data

64 points per range from a seeded random walk, LCG `s = (s·9301 + 49297) mod 233280`, `r = s/233280`. Walk from `start`: each step `v += (end − v)/max(1, 64 − i) + (r − 0.5)·vol`, and force the last point to `end`. All end at 58,708.83. 1D: seed 3, start 57,420, vol 260, labels 9:30 AM–4:00 PM. 1W: seed 8, 55,980, 520, labels Mon–Fri. 1M: seed 21, 60,210, 900, labels Sep 19 – Oct 19 2026. 1Y: seed 42, 41,250, 1,900, labels "Oct 2025"–"Oct 2026". No network, no `Math.random`.

## Layout and look

- Palette in CSS variables. Light / dark: card `#ffffff` / `#1c1c1e`; text `#1d1d1f` / `#f5f5f7`; secondary `#6e6e73` / `#98989d`; grid `#ececf0` / `#2c2c2e`; range track `#f0f0f3` / `#2c2c2e`; selected pill `#ffffff` / `#48484a`; shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` / `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Card: 380px wide (`max-width: 100%`), radius 24px, padding 20px.
- Top row: symbol (13px semibold, secondary); on 1D a "Live" badge (11px medium) with an 8px `up` dot and a pulsing copy.
- Price: 4px below, 34px semibold, tracking −0.035em: "$", the whole part as rolling digits (commas static), then "." and the cents at 20px in secondary.
- Change: 13px medium tabular, `+1,288.83 (+2.24%)` with a true minus `−` when negative, coloured `up`/`down`, then 8px later a regular secondary label: "Today" (1D) / "Past 1W" etc., or the scrubbed point's label.
- Plot: 16px below; SVG viewBox `0 0 340 140`, full width, `overflow: visible`. Normalise prices to 0 (high) … 1 (low); `x = i/63·340`, `y = 8 + n·124`. A dashed (`2 4`) grid line at the first point's y. Smooth path: for each segment a cubic with both control points at the midpoint x and the endpoint ys. Area = line path + `L340 140 L0 140 Z`, filled by a vertical gradient of the current colour from .28 to 0 opacity (gradient id from a sanitised `useId`). Line stroke 2, round caps/joins; colours transition over .25s.
- Dot: a 9px-radius halo in the colour at .18 opacity and a 4.5px circle filled with the card colour, 2.2 stroke in the colour. While scrubbing, a vertical dashed (`3 3`) line at the dot x, secondary at .5 opacity.
- Range control: 16px below, full width, rounded-full, 3px padding; four equal 28px buttons, 12px semibold; pill shadow `0 1px 3px rgba(0,0,0,.15)`.

## Motion

- Rolling digit: each digit is a 1em-tall clipped column of 0–9 whose `y` springs to `−d·10%` (stiffness 260, damping 28). Key characters from the right so columns stay in place when the number gains a digit.
- Morph: keep `from` and `to` arrays of normalised values and a progress motion value. On range change, set `from` to the currently interpolated shape (so mid-morph switches continue smoothly), `to` to the new range, reset progress to 0 and animate it to 1 with a spring, stiffness 120, damping 20. The path is a `useTransform` of progress and a `live` offset: `lerp(from, to, p)`, then add `live` to the last point clamped to 0..1.
- Live tick (1D only): every 1.4s draw a seeded delta `(r − 0.45)·120` dollars, add it to the shown last price, and animate `live` to `−delta/(high − low)` with a spring, stiffness 200, damping 18. Changing range resets the delta and tweens `live` to 0 over 0.3s.
- Dot: raw x/y motion values set from the displayed shape at the scrubbed index (or the last point), smoothed by springs (stiffness 600, damping 40). Re-place it whenever the path changes, so it rides the morph and the live tick.
- Change colour animates over 0.25s. Live pulse: scale 1→2.4, opacity .6→0, 1.4s, repeating. Pill: per-instance `layoutId`, spring 500/36.

## Interaction and states

- Pointer move/down on the plot sets the index `round((x/width)·63)`, clamped; leaving clears it (on touch that is when the finger lifts). `touch-action: none`, crosshair cursor, no selection.
- With an index, the price shows that point and the change is measured from the range's first point; without one, the (live) last price.
- The plot is focusable: Left/Right (Shift for 8 points), Up/Down, Home/End, Escape clears; blur clears.

## Autoplay demo

Every 4.2s switch to the next range; 0.9s later sweep the index from 0 to the end in steps of 2 every 40ms, then clear it. A `touched` ref set by any pointer down, click, scrub or key stops it for good. Clear all intervals and timeouts on unmount.

## Accessibility

- Plot: `role="group"`, `aria-roledescription="chart"`, `aria-label` "NXUS price over 1D: open to last, low …, high …" plus a keyboard hint; the SVG is `aria-hidden`.
- The rolling digits are `aria-hidden`; a visually hidden span holds the plain price.
- A visually hidden `aria-live="polite"` region announces "10:42 AM: $58,120.40, +700.40 (+1.22%)" only after the user interacts.
- Range buttons: `role="tablist"` / `role="tab"` with `aria-selected`; focus ring 2px `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] Scrubbing moves the dot along the line and the price digits roll individually.
- [ ] The change flips to red with a true minus when below the open.
- [ ] Switching range morphs the existing line into the new one; switching mid-morph continues smoothly.
- [ ] On 1D the last point and price tick every 1.4s and the dot follows.
- [ ] `smooth={false}` draws straight segments immediately; `fill={false}` removes the area.
- [ ] Keyboard and touch scrubbing work; the live region announces values.
- [ ] Autoplay cycles ranges with a sweep and stops on the first interaction.
