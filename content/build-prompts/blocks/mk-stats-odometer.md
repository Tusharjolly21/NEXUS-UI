# Stats Odometer

Build a row of stat cards whose numbers count up like an odometer when they scroll into view. Each digit is its own reel; reels that have further to travel settle a beat later. A period switch (30 days, Quarter, Year) sends every reel rolling to the new number, redraws the sparklines and updates the change pills. Apple-light, quick and tidy. Under reduced motion the numbers are simply there.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `LayoutGroup`, `useInView`, `useReducedMotion`), a `cn` helper and the `useSound` hook from `@/lib/ui-sounds`.
- File: `components/blocks/stats-odometer.tsx`, named export `StatsOdometer`, types `StatsOdometerProps` and `OdometerStat`, and the demo constants `DEFAULT_ODOMETER_PERIODS` and `DEFAULT_ODOMETER_STATS`.

## API

`OdometerStat`: `{ label: string; prefix?: string; suffix?: string; values: Record<string, number>; deltas: Record<string, number>; spark: number[] }`, with `values` and `deltas` keyed by period label. Whole numbers are shown with thousands separators, others with two decimals. A delta of 0 shows "Steady".

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `heading` | `string` | `"Built in public. Here's how it's going."` | Section heading (curly apostrophes). |
| `periods` | `string[]` | `["30 days", "Quarter", "Year"]` | The tabs. Every stat needs a value for each. |
| `stats` | `OdometerStat[]` | 4 demo stats | Use a stable array. |
| `defaultPeriod` | `string` | first period | Selected first. |
| `autoplay` | `boolean` | `false` | Steps through the periods by itself until touched. |
| `enableSound` | `boolean` | `true` | Taps when the period switches. |
| `onPeriodChange` | `(period: string) => void` | none | Called when the visitor picks a period. |
| `className` | `string` | none | Extra classes on the section. |

Demo stats: Active teams (2148 / 5930 / 18402; +12 / +31 / +140; spark 3 4 4 5 7 6 8 9 11 12), Components shipped (96 / 268 / 914; +8 / +22 / +64; spark 2 3 5 4 6 7 6 8 9 10), Revenue with prefix "$" and suffix "k" (84 / 241 / 902; +18 / +26 / +210; spark 4 4 5 6 5 7 8 8 10 12), Uptime with suffix "%" (99.98 / 99.97 / 99.95; all Steady; spark 9 9 9 8 9 9 9 9 9 9).

## Layout and look

- Root `<section aria-label="Statistics">`: full width, background `#f5f5f7` / dark `#000`, 48px vertical and 16px side padding. Inside, a centred card, `max-width: 1080px`, radius 28px, white / dark `#1c1c1e`, padding 32px 20px (32px sides from 640px), the same hairline and soft shadow as the other Motion Kit cards.
- Header: wraps, aligned to the bottom, 16px gap. Heading `clamp(26px, 4vw, 36px)` semibold, line-height 1.1, tracking -0.03em, `max-width: 420px`, `#1d1d1f` / `#f5f5f7`. Right: a pill group (`#f5f5f7` / dark `#2c2c2e`, padding 4px, 4px gap) of 32px tall buttons, 14px side padding, 13px medium; the selected one has a white (dark `#48484a`) thumb that slides between tabs (shared layout), spring stiffness 420, damping 34.
- Grid 28px below: 1 column, 2 from 640px, 4 from 1024px, 12px gap. Each card: radius 20px, padding 20px, background `#f5f5f7` / dark `#2c2c2e`. Label 13px secondary (`#6e6e73` / `#a1a1a6`). Number 8px below: 34px semibold, tracking -0.03em, tabular numbers, ink.
- The odometer is one inline flex row of 1em tall boxes: the prefix, one reel per digit (a `1em` tall, `0.62em` wide window with `overflow: hidden`, holding a column of the digits 0 to 9), separators as plain text, then the suffix.
- Under the number, 12px gap row with space between, aligned to the bottom: a change pill (radius full, padding 2px 8px, 11.5px semibold) reading "+12%" in `#1a7f37` on `#e9f9ee` (dark `#30d158` on 15% `#30d158`), or "Steady" in secondary on white (dark `#1c1c1e`); and a sparkline SVG, 96px by 32px, `viewBox 0 0 100 30`, a 2px round-capped polyline in `#0071e3` (dark `#0a84ff`), y = 28 - value / max * 24.

## Motion

- Reel: `y` animates to `-d em`. Spring stiffness 70, damping 15, mass `0.8 + 0.12 * i` where `i` is the digit's index in the number, so later digits are heavier and settle later. Before the card has been seen, every reel sits at 0.
- Trigger: `useInView` on the section, once, amount 0.4. Reels, pills and sparklines all wait for it.
- Pill: on each period change it remounts, fading in from opacity 0 and 4px down after `0.5 + 0.08 * cardIndex` s.
- Sparkline: remounts per period and draws with `pathLength` 0 to 1 over 0.9 s after `0.3 + 0.08 * cardIndex` s.
- If the number of digits changes the reels remount at their final value.
- Reduced motion: reels, pills and sparklines are shown at their final state immediately, with no transitions; the tab thumb moves instantly.

## Interaction and states

- Tabs are buttons in a labelled group with `aria-pressed`. Picking one sets the period, calls `onPeriodChange` and rolls everything.
- Each odometer has `role="img"` with an `aria-label` of the full text ("$84k", "99.98%"); the reels are `aria-hidden`.
- A visually hidden polite live region says "Showing figures for Quarter" on every change.

## Autoplay demo

`autoplay` (default false): once the numbers have rolled in, it moves to the next period every 3.6 s and loops. It stops on the first period the visitor picks, pauses off screen and in a hidden tab, and never runs under reduced motion. The preview passes `autoplay`.

## Accessibility

- Real buttons, 2px `#0071e3` (dark `#0a84ff`) focus outline with 2px offset, text contrast of at least 4.5:1 in both themes.
- Decorative sparklines are `aria-hidden`; change direction is in the pill text, not colour alone.
- No network calls; all figures are demo data.

## Sound

- Period switched by the visitor: `tap`, volume 0.5 (only when the period actually changes). The autoplay demo plays `tap` at 0.4 through the autoplay path, which stays quiet until the visitor has used the page.
- Nothing for the reels settling or for scroll position. Respects the global sound switch and `enableSound`.

## Acceptance checklist

- [ ] Reels sit at 0 until the card is 40% in view, then roll, the further ones settling later.
- [ ] Switching period rolls every reel straight to the new number and redraws all sparklines.
- [ ] Uptime shows "Steady" and two decimals.
- [ ] The number's text is available to screen readers via the `aria-label`.
- [ ] Reduced motion shows final numbers with no rolling or drawing.
- [ ] Dark mode swaps card, pill, thumb, text and sparkline colours.
- [ ] At 360px wide the cards stack and the tab group scrolls rather than overflowing.
