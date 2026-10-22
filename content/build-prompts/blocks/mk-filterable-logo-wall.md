# Filterable Logo Wall

Build a customer wall that visitors can sort by industry to find companies like theirs. Pick a filter pill and the logos that do not match shrink and blur away while the matches glide together into their new places; the big count above rolls to the new total. It should feel Apple-light and snappy. Logos are inline SVG marks plus text wordmarks of invented companies; never use real company logos or names.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), and a `cn` helper.
- File: `components/blocks/filterable-logo-wall.tsx`, named export `FilterableLogoWall`, types `FilterableLogoWallProps` and `FilterableLogo`, and `DEFAULT_FILTERABLE_LOGOS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `logos` | `FilterableLogo[]` | 12 demo logos | `{ name, industry, mark }`. `mark` is inline SVG shapes in a 20 x 20 box using `currentColor`. Filter pills are the distinct industries in order of first appearance, after the all pill. Use a stable array. |
| `heading` | `string` | `"Customers"` | Small line above the count. |
| `allLabel` | `string` | `"All"` | Label of the pill that shows everything. |
| `autoplay` | `boolean` | `false` | Steps through the pills every 2.6 s until the visitor picks one. |
| `onFilterChange` | `(filter: string) => void` | none | Called when the visitor picks a pill. |
| `className` | `string` | none | Extra classes on the section. |

Demo logos (all invented), as name / industry: Quadrel / Fintech, Hexel / Dev tools, Kitefly / Commerce, Orbitly / Media, Meridane / Fintech, Paraleon / Dev tools, Velara / Commerce, Northgale / Media, Duetly / Fintech, Pulsely / Dev tools, Lumora / Commerce, Astrel / Dev tools. Marks are simple geometric shapes (four squares with two faded, solid hexagon, diamond, ring, circle with a line, two verticals joined by a bar, outlined triangle, two waves, two overlapping circles one faded, heartbeat line, dot with rays, asterisk-like crossing lines).

## Layout and look

- Root `<section aria-label="Customer wall">`: full width, centred, padding 48px vertical and 16px horizontal, background `#f5f5f7` / `#000` in dark.
- Card: max width 760px, radius 28px, padding 20px (28px from `sm`), background white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.3)` (dark: `0 0 0 1px #3a3a3c, 0 20px 40px -26px rgba(0,0,0,.9)`).
- Top row: flex, wraps, items aligned to the bottom, space-between, 16px gap. Left: the heading (13px medium, `#6e6e73` / `#a1a1a6`) and under it, 4px down, the count line at 26px semibold, tracking -0.03em, `#1d1d1f` / `#f5f5f7`: the rolling number (tabular figures, clipped to 1.15em height) then "teams" for All or "in <industry in lower case>".
- Right: a pill track, radius full, 4px padding, 4px gap, `#f5f5f7` / `#2c2c2e`, scrolls horizontally when too narrow. Each pill is a 32px tall button, 14px horizontal padding, 13px medium; selected text `#1d1d1f` / `#f5f5f7`, others `#6e6e73` / `#a1a1a6`. A shared thumb (layoutId) sits behind the selected pill: white with shadow `0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)` (dark: `#3a3a3c`, no shadow).
- Wall: 24px below, a grid of 2 columns (4 from `sm`), 8px gap. Each tile is 76px tall, radius 16px, `#f5f5f7` / `#2c2c2e`, a column centring the mark (20px) plus name (16px semibold, tracking -0.02em) on one line and the industry (11px, `#6e6e73` / `#a1a1a6`) under it, 4px gap.

## Motion

- Thumb: shared-layout spring, stiffness 420, damping 34.
- Count: `AnimatePresence mode="popLayout"`, keyed by the number. New number enters from `y 100%, opacity 0`, old one leaves to `y -100%, opacity 0`; spring stiffness 420, damping 32.
- Tiles: `AnimatePresence mode="popLayout"` with `initial={false}`; each tile and the grid carry `layout`. Enter from `opacity 0, scale .85, blur 6px` to rest; exit to the same in 0.18 s; spring stiffness 300, damping 30 (filter 0.25 s, opacity 0.2 s). The grid itself uses a spring of stiffness 300, damping 32.
- Reduced motion: no layout movement, tiles and count only fade (0.15 s), thumb jumps, and the autoplay never runs.

## Interaction and states

- Pills are real buttons with `aria-pressed`. Picking one filters the wall, calls `onFilterChange` and marks the section as touched.
- The number on screen is `aria-hidden`; a screen reader only sentence ("5 in fintech") sits in a polite live region. The live region is switched off while the autoplay is stepping so it does not chatter.
- If the list of filters changes and the current pick disappears, fall back to the all pill.

## Autoplay demo

The preview passes `autoplay`: every 2.6 s the next pill is chosen (All, Fintech, Dev tools, Commerce, Media, then All again). It stops for good on the first pill the visitor presses, does not run when the section is off screen or the tab is hidden, and never runs under reduced motion.

## Accessibility

- Pills in a `role="group"` labelled "Filter by industry"; marks are `aria-hidden`; the wall is a real `<ul>` of `<li>`.
- Focus outline: 2px `#0071e3` (dark `#0a84ff`), drawn inside the pill so the scroll container does not clip it.
- Nothing navigates or submits.

## Acceptance checklist

- [ ] Picking a pill makes non-matching tiles shrink and blur away while the rest glide into their new cells.
- [ ] The count rolls vertically to the new total and the label reads "teams" or "in <industry>".
- [ ] The thumb slides to the chosen pill.
- [ ] With `autoplay`, the pills step every 2.6 s until the first press.
- [ ] Off screen or in a hidden tab the stepping pauses.
- [ ] With reduced motion tiles only fade and nothing steps on its own.
- [ ] Dark mode swaps card, track, thumb, tiles and text to the dark palette.
- [ ] Two columns at 320px, the pill track scrolls sideways inside the card, and the page does not overflow.
- [ ] Only invented company names and hand-drawn marks appear.
