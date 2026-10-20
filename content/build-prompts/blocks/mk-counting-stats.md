# Counting Stats

Build a dark stats band: a big heading and four metrics whose numbers count up the first time they scroll into view, each with a sparkline that draws itself and a dot that pops at "today". With `autoplay` the count replays every few seconds while the band stays on screen. It should feel confident and precise, like a public metrics page.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries: `@container`, `@xl:`, `@5xl:`), framer-motion (`motion`, `MotionConfig`, `animate`, `useInView`, `useMotionValue`, `useTransform`, `useReducedMotion`), and a `cn` helper.
- File: `components/counting-stats/counting-stats.tsx`, named exports `CountingStats` and `DEFAULT_COUNTING_STATS`, types `CountingStatsProps` and `CountingStat = { value; decimals?; prefix?; suffix?; label; trend; spark: number[] }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `stats` | `CountingStat[]` | 4 demo stats | Metrics. `trend` is a short green line; `spark` a handful of points, oldest first. |
| `title` | `string` | `"The numbers, in public."` | Heading. |
| `accent` | `string` | `#0a84ff` | Glow and every other sparkline. |
| `autoplay` | `boolean` | `false` | Replays the count every 7s while visible. |
| `className` | `string` | — | Extra classes on the section. |

Demo stats:
1. 12.4, 1 decimal, suffix "M" — "Events processed a day" — "+32% this quarter" — `[8,10,9,13,12,15,17,16,20,24]`
2. 99.99, 2 decimals, "%" — "Uptime over 12 months" — "4 minutes down all year" — `[20,20,19,20,20,20,20,18,20,20]`
3. 140, "ms" — "Median dashboard load" — "2x faster than last year" — `[24,22,21,18,17,15,13,12,10,9]`
4. 4.9, 1 decimal, "/5" — "Average review score" — "from 2,800 reviews" — `[14,15,15,16,17,17,18,18,19,19]`

## Layout and look

- Wrap in `MotionConfig reducedMotion="user"`.
- Section: `@container`, relative, full width, always black (dark in both themes), padding 16px sides (20px `sm`), 64px vertical (80px `sm`); in dark mode add top and bottom 1px borders `#1c1c1e` so it separates from a black page. `--mk-accent` defaults to `#0a84ff`; an `accent` prop overrides it inline.
- Glow: an `aria-hidden`, overflow-hidden layer; inside it an ellipse 480px tall, `width: min(900px, 100%)`, centred, `top: -160px`, `radial-gradient(closest-side, accent 20%, transparent)` via `color-mix`, `blur-3xl`.
- Content max-width 1120px. `<h2>`: max-width 640px, `clamp(32px, 5vw, 54px)`, semibold, line-height 1.04, tracking −0.04em, balanced, white, margin-bottom 40px (48px `sm`).
- Grid: 1 column, 40px column and row gap; from `@xl` 2 columns with 48px row gap; from `@5xl` 4 columns.
- Stat card: column, gap 16px, top border `white/10`, 24px top padding.
  - Top row: wraps, items aligned to the bottom, space-between, gap 12px. Number: `clamp(40px, 4.6vw, 56px)`, semibold, line-height 1, tracking −0.045em, tabular, white. Sparkline beside it.
  - Label 15px `#d2d2d7`. Trend 13px medium `#30d158`.
- Sparkline: SVG 120×34 (viewBox the same), `max-width: 100%`, overflow visible. Points: x = `i / (n − 1) × 120`; y = `32 − (v − min) / (max − min || 1) × 28 − 2`. Polyline path `M…L…`, stroke 2, round caps/joins, no fill. A 3.5px-radius dot at the last point. Colour: accent for even-indexed stats, `#5ac8fa` for odd ones. Fewer than 2 points → treat as `[0, 0]`.
- Number format: `prefix + n.toLocaleString("en-US", { min/max fraction digits = decimals }) + suffix`.

## Motion

- Easing `[0.16, 1, 0.3, 1]`.
- Card entrance: `opacity 0, y 24` → rest `whileInView`, once, 0.8s, delay `index × 0.08`.
- Count: when the card is first ≥60% in view (`useInView once`), set the motion value to 0 and `animate` it to `value` over 2s with delay `index × 0.1`. The visible text is a `useTransform` of that value (no React re-render per frame).
- Sparkline: `pathLength 0 → 1` over 1.6s, delay .3s. Dot: `scale [0, 1.6, 1]`, 0.5s, delay 1.8s.
- Reduced motion: numbers jump straight to their value; sparkline and dot appear instantly.

## Interaction and states

- No controls. Each card tracks two in-view flags: `seen` (once, 60%) and `visible` (20%, live).
- Replay: when `autoplay` is on, not reduced, `seen` and `visible`, increment a `cycle` counter every 7000ms. Each cycle restarts the count from 0 and remounts the sparkline (key it by the cycle) so it redraws. Stop the interval when the band leaves the screen.
- Keys: `${index}-${label}`.

## Autoplay demo

With `autoplay` on, every 7s while the band is visible, all four numbers count up again from zero and their sparklines redraw with the dot pop, staggered by 0.1s per card.

## Accessibility

- The animated number is `aria-hidden`; a visually hidden span next to it holds the final formatted value, so screen readers read "12.4M" once rather than a ticking number.
- Sparklines are `aria-hidden`.
- Text contrast on black: white numbers, `#d2d2d7` labels, `#30d158` trends.
- `MotionConfig reducedMotion="user"` and the instant fallbacks above.

## Acceptance checklist

- [ ] Black band with a soft accent glow at the top in both light and dark themes.
- [ ] Four stats: 12.4M, 99.99%, 140ms, 4.9/5 with labels and green trends.
- [ ] Numbers count from 0 with an ease-out over 2s, staggered, the first time they're seen.
- [ ] Sparklines draw left to right, then a dot pops at the end.
- [ ] Alternate sparklines use the accent and sky blue.
- [ ] 1 column on phones, 2 on tablets, 4 on wide containers.
- [ ] `autoplay` replays everything every 7s, only while on screen.
- [ ] `accent` changes the glow and the accent sparklines.
- [ ] Screen readers get the final values only.
- [ ] Reduced motion shows final numbers and full sparklines immediately.
