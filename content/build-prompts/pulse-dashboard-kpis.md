Build a row of KPI cards with a segmented period switcher (7d / 30d / 90d). Switching period morphs every sparkline into its new shape on a spring, rolls each big figure to its new value digit by digit, and flips the delta chips up or down. The chips know when a drop is good news (latency, churn). Calm, legible, Apple-dashboard light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS (container queries), framer-motion (`motion`, `AnimatePresence`, `animate`, `useReducedMotion`), React `useId`.
- File: `components/pulse-dashboard-kpis/pulse-dashboard-kpis.tsx`, named export `KpiStrip`, exported types `Kpi` and `KpiStripProps`.

## API

`Kpi = { label: string; value: string; delta?: string; lowerIsBetter?: boolean; trend?: number[] }`. A delta starting with "-" is a drop; `good = lowerIsBetter ? drop : !drop`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `kpis` | `Kpi[]` | – | Static metrics. Ignored when `periods` is set. |
| `periods` | `Record<string, Kpi[]>` | built-in data when `kpis` is not passed | Named periods; adds the switcher. |
| `defaultPeriod` | `string` | first key | Period selected first. |
| `onPeriodChange` | `(period: string) => void` | – | User switched period. |
| `title` | `string` | `"This week at a glance"` | Heading. |
| `autoplay` | `boolean` | `false` | Cycles periods every 2.8s until touched. |
| `className` | `string` | `""` | Classes on the section. |

Built-in data (label, value, delta, trend):
- 7d: Activation 64.2% +4.1% [48,52,50,55,58,61,64]; Net revenue $48.9k +12.4% [31,34,33,39,41,45,49]; p95 latency 182ms −9.6% (lowerIsBetter) [240,228,215,220,201,190,182].
- 30d: Activation 61.8% +2.7% [52,55,53,57,56,59,58,60,62,61,63,62]; Net revenue $196k +18.2% [120,128,131,140,138,151,160,166,170,181,188,196]; p95 latency 201ms +3.1% (lowerIsBetter) [190,188,195,192,199,205,198,203,207,200,204,201].
- 90d: Activation 58.4% +9.3% [44,46,47,49,50,52,53,55,56,57,58,58]; Net revenue $542k +41.0% [300,320,345,360,390,410,430,455,480,500,520,542]; p95 latency 214ms −22.5% (lowerIsBetter) [290,280,270,262,255,248,240,233,228,221,218,214].

## Layout and look

- Section: `@container`, full width, radius 28, padding 12, `#f5f5f7`, text `#1d1d1f`, ring `0 0 0 1px rgba(0,0,0,.05)`; dark `#111113`, `#f5f5f7`, ring `rgba(255,255,255,.08)`.
- Header (padding 8 12 12, wraps, gap 12): title 16px semibold tracking −0.02em. Switcher (only with 2+ periods): pill track `#e8e8ed` (dark `#2c2c2e`), padding 2, gap 2; segments 28px tall, 12px horizontal padding, 12px semibold tabular. Active text `#1d1d1f` (dark `#f5f5f7`) over a white thumb with `0 1px 3px rgba(0,0,0,.12)` (dark `#48484a`); inactive `#6e6e73` (dark `#a1a1a6`), darkening on hover.
- Grid: one column, three columns at container width ≥ 540px, gap 8, `aria-live="polite"`.
- Card: radius 22, padding 16, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
  - Top row: label 12px medium `#6e6e73` (dark `#a1a1a6`); delta chip on the right inside a 20px-tall clipping box: pill, padding 0 6px, 11px semibold tabular, a 10px diagonal arrow (up-right or down-right, stroke 1.8) then the delta without its sign. Good: bg `#30d158` at 12%, text `#1a7f37` (dark `#30d158`). Bad: bg `#ff3b30` at 10%, text `#c9271d` (dark `#ff6961`).
  - Value 8px below: 28px semibold, leading 1, tracking −0.04em, tabular.
  - Sparkline 12px below: SVG viewBox 200×56, 56px tall, full width, `preserveAspectRatio="none"`, overflow visible. Line 2px, round caps/joins, `vector-effect: non-scaling-stroke`; area under it filled with a vertical gradient (colour at 22% → 0); end dot r 3.5 at x 200 with a 2px white stroke (dark `#1c1c1e`). Colour `#30d158` when good, `#ff3b30` when not, with 0.4s transitions on stroke, fill and stop colour. Gradient ids from `useId` (colons stripped).
- Footer note: 12px `#86868b` (dark `#a1a1a6`), padding 12 12 4: "Switch the period; every line morphs to its new shape."

## Motion

- Sparkline resampling: every trend is resampled to 32 points with Catmull-Rom so any two shapes can morph point for point. For output j, `x = j/31 × (L−1)`, segment `i = min(L−2, floor(x))`, `t = x − i`, using p0…p3 with clamped neighbours: `v = 0.5·(2p1 + (−p0+p2)t + (2p0−5p1+4p2−p3)t² + (−p0+3p1−3p2+p3)t³)`. Normalise with the series min/max: `y = 56 − 7 − (v − lo)/span × (56 − 16)`. Path: `M/L` to `(j/31 × 200, y)`, rounded to 2 decimals; area = line + `L200,56 L0,56 Z`.
- Morph: on trend change animate `t` 0 → 1 with spring stiffness 170, damping 17 and, on each update, write the interpolated `d` for line and area and the dot's `cy` straight to the DOM (refs, no re-render). The overshoot is intentional. Start from the currently shown shape so interrupted morphs continue smoothly.
- Rolling value: split the string into prefix, number and suffix (`/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/`), keep the decimal count and comma grouping. Animate from the previous number to the new one with spring 120/20, writing formatted text into the span each frame. The first render shows the raw string.
- Delta chip: `AnimatePresence mode="popLayout"` keyed by the delta text. A drop enters from `y −14` and exits to `y 14`; a rise enters from `y 14` and exits to `y −14`; opacity 0 ↔ 1; spring 420/26 with a stagger `delay = cardIndex × 0.04`.
- Period thumb: shared `layoutId` (prefixed with the `useId`), spring 520/30.
- Card hover: `y −3`, spring 400/26.

## Interaction and states

- Clicking a segment selects the period, marks touched and calls `onPeriodChange`. Any pointer down on the section marks it touched.
- With only `kpis` (no periods), no switcher is shown and nothing morphs unless the props change.
- Trends with fewer than two points render no sparkline; values that don't parse as a number just swap.
- Reduced motion: sparklines and values jump to the new state, chips swap without sliding, thumb moves instantly, no hover lift.

## Autoplay demo

With `autoplay` and at least two periods, step to the next period (wrapping) every 2.8s. Stop for good after the first pointer down or selection.

## Accessibility

- Switcher `role="radiogroup"` labelled "Period"; segments `role="radio"` with `aria-checked` and roving tabindex. Arrow Right/Down and Left/Up move and focus the next/previous period (wrapping). 2px focus outline `#0071e3` (dark `#0a84ff`), offset 1.
- The animated number and the sparkline are `aria-hidden`; an sr-only string reads "{value}, down 9.6%, good" or "up 3.1%, needs attention".

## Acceptance checklist

- Three cards show in one row on wide containers and stack on narrow ones.
- Switching period morphs each sparkline with a slight overshoot rather than redrawing.
- Figures count to their new values keeping their prefix, suffix and decimals.
- Delta chips slide in the direction of change; latency going down is green, going up is red.
- Line, fill and dot colours fade when a metric changes between good and bad.
- The period thumb slides between segments; arrow keys work.
- Autoplay cycles 7d → 30d → 90d and stops on first touch.
- Dark mode recolours section, cards, chips and dot outlines.
