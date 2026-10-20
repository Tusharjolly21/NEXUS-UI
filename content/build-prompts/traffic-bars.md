# Traffic Bars

Build a stacked bar chart card of website visits by source over 28 days. Run a pointer along it and the column under you gets a thin ring, every other column dims, the big total counts to that column's value, and a dark tooltip glides beside it with the per-source breakdown. A Day/Week segmented control regroups the chart: every day's slices fly across and stack inside their week's bar, so you can see where each weekly total came from. The feel is a calm, Apple-like analytics widget with springy, physical motion.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useSpring`, `useMotionValue`, `useTransform`, `layoutId`).
- File: `components/traffic-bars/traffic-bars.tsx`. Named export `TrafficBars`, plus `TrafficBarsProps` and `TrafficBarsTheme`.

## API

- `theme?: "auto" | "light" | "dark"`, default `"auto"`. Auto follows a `.dark` class on an ancestor; light/dark pin the palette.
- `colors?: string[]`, default `["#0071e3", "#64d2ff", "#bf5af2"]`: fills for Direct, Search, Referral (bottom to top).
- `radius?: number`, default `2`: corner radius of every slice in SVG units (capped at half the slice width).
- `stagger?: number`, default `12`: ms between neighbouring days when slices regroup.
- `autoplay?: boolean`, default `false`.

## Data

Local, deterministic demo data: 28 days × 3 series from a seeded LCG `s = (s·9301 + 49297) mod 233280`, `r = s/233280`, seed 11. For day `d`: `weekend = 0.62` when `d % 7` is 5 or 6, else 1; `trend = 1 + d/60`; Direct `round((300 + r·260)·weekend·trend)`, Search `round((200 + r·220)·…)`, Referral `round((60 + r·120)·…)` (call `r()` in that order). Day 0 is Sep 22, 2026; labels use `en-US` "Sep 22". Week totals are the sums of days 0–6, 7–13, 14–20, 21–27.

## Layout and look

- Palette lives in CSS variables on the root so SVG and inline styles follow the theme. Light / dark: card `#ffffff` / `#1c1c1e`; text `#1d1d1f` / `#f5f5f7`; secondary `#6e6e73` / `#98989d`; grid `#ececf0` / `#2c2c2e`; segment track `#f0f0f3` / `#2c2c2e`; selected pill `#ffffff` / `#48484a`; tooltip bg `#1d1d1f` / `#f5f5f7`; tooltip text `#ffffff` / `#1d1d1f`; tooltip labels `rgba(255,255,255,.6)` / `rgba(29,29,31,.6)`; ring `#1d1d1f` / `#f5f5f7`; card shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` / `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Card: 380px wide (`max-width: 100%`), radius 24px, padding 20px, `transition-colors 300ms`.
- Header row: left "Traffic" (14px semibold) over a 12px secondary line ("Last 28 days", or the highlighted day/week label). Right: segmented control, rounded-full, 3px padding; buttons 28px tall, 12px horizontal padding, 12px medium, capitalised "day" / "week"; selected text primary, other secondary; selected pill has shadow `0 1px 3px rgba(0,0,0,.15)`.
- Total: 12px below, 30px semibold, tabular numbers, tracking −0.03em, followed by "visits" in 13px regular secondary.
- Plot: 16px below. SVG viewBox `0 0 336 150`, full width, height auto, `overflow: visible`. Dashed grid lines (`2 4`) at 25/50/75% height, a solid baseline at y 150.5.
- Day mode: 28 columns, 4-unit gap, bar width `(336 − 4·27)/28`. Week mode: 4 columns, 18-unit gap. Vertical scale `yk = (150 − 6) / (max column total · 1.08)` for the current mode.
- Stacking: Day mode stacks a day's three slices from the baseline. Week mode puts each day's slice inside its week's band for that series: series bands stack from the baseline, and inside a band day k sits above days 0…k−1 of that week. In Week mode slices get a 0.6 stroke in the card colour so the day seams show.
- Ring: rounded rect from x −3, y −4, width `bw + 6`, height 158, radius `min(8, bw/2 + 3)`, no fill, stroke ring colour at .5 opacity, 1.2 wide.
- Tooltip: absolutely positioned at top 0, min-width 136px, radius 12px, padding 8×12px, 11px text, shadow `0 10px 30px -10px rgba(0,0,0,.5)`. A semibold label, then three rows: 6px colour dot + series name (tooltip-label colour) on the left, formatted value on the right.
- Under the plot: first and last date (11px, tabular, secondary) at either end, then a legend of 8px dots + names, 12px secondary, 16px gap.

## Motion

- Every slice is a `motion.rect` animating `x`, `y`, `width` (min 0.5), `height` and `opacity` with a spring, stiffness 210, damping 26, `initial={false}`. Delay into Week: `(d % 7)·stagger/1000 + series·0.02` s; back to Day: `(6 − d % 7)·stagger/1000` s. Opacity uses its own 0.15s tween, no delay. Dimmed columns go to opacity .32.
- Ring: a motion value springs to `col·(bw + gap)` with stiffness 420, damping 34. The first highlight after none jumps there instantly (both raw and spring); later moves glide. The ring group fades in on mount.
- Tooltip `left` is derived from the ring spring: scale by plot width / 336, place 10px to the right of the column; if it would overflow the right edge by more than 12px, flip to 10px left of the column; clamp to [−12, plotWidth + 12 − 140]. Track plot width with a ResizeObserver into a motion value. It enters with opacity 0→1, scale .92→1, spring 500/32.
- Total counter: a `useSpring` (stiffness 140, damping 22) set to the new value, rendered through `useTransform` as an `en-US` rounded integer.
- Segment pill: shared `layoutId` unique per instance (`useId`), spring 500/36.

## Interaction and states

- Pointer move/down over the plot picks `floor((x + gap/2)/(bw + gap))` in viewBox units, clamped. Leaving with a mouse clears it; touch keeps the last column. The plot uses `touch-action: none` and no text selection.
- Switching mode clears the highlight. A highlight index outside the current column count is treated as none (derive it; don't fix it in an effect).
- The plot is focusable: Right/Up next column (from none → first), Left/Down previous (from none → last), Home/End, Escape clears; blur clears.

## Autoplay demo

Every 260ms advance the highlight one column (wrapping); on every 26th tick clear it and flip Day/Week. A `touched` ref set on any pointer down in the card, on clicks, scrubbing or keys stops it for good.

## Accessibility

- Plot: `role="group"`, `aria-roledescription="chart"`, `aria-label` with grouping, date range, total and a keyboard hint. SVG and tooltip are `aria-hidden`.
- A visually hidden `aria-live="polite"` region reads "Sep 25: 1,234 visits. Direct …, Search …, Referral …" — only after the user has interacted, so autoplay stays silent.
- A visually hidden table lists every day (or week) with each series and the total.
- Segmented control: `role="tablist"` with `role="tab"` buttons and `aria-selected`; focus ring 2px `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] Data is identical on every load; there is no `Math.random`.
- [ ] Hovering a column rings it, dims the rest to .32 and counts the total to that column.
- [ ] The tooltip follows the ring, flips near the right edge and never leaves the card.
- [ ] Day → Week: each day's slices fly into their week bar with a visible left-to-right stagger and seams between days.
- [ ] Week → Day reverses with the stagger running the other way.
- [ ] Arrow keys, Home, End and Escape scrub the chart; the live region announces values.
- [ ] Touch scrubbing works and the page does not scroll while scrubbing.
- [ ] `theme="auto"` follows `.dark`; light/dark pin the palette.
- [ ] Autoplay sweeps and flips modes, then stops on the first interaction.
