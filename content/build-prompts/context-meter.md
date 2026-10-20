# Context Meter

Build a context-window meter for an AI chat, drawn as a 40×5 grid of dots where each dot is a slice of the token budget, coloured by category. A legend lists the categories; hovering one dims every other dot so only its slice glows. The conversation keeps growing in real time; pressing "Compact chat" makes the conversation's dots drop out of the grid like falling beads, and everything after them reflows to close the gap. The feel is a calm, precise Apple-style card with tactile, bead-like motion.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`).
- File: `components/context-meter/context-meter.tsx`. Named export `ContextMeter`, props `ContextMeterProps`, type `ContextCategory`, default data `DEFAULT_CONTEXT_CATEGORIES`.

## API

- `categories?: ContextCategory[]`, `ContextCategory = { id, label, color, tokens }` with `tokens` in thousands. Read once as initial state. Default, in grid order: System prompt `var(--cm-ink)` 4.2, Tools `#5e5ce6` 12.8, Files `#ff9f0a` 46.1, Conversation `#0071e3` 38.4, Memory `#30d158` 3.9 (ids sys, tools, files, conv, mem).
- `limit?: number`, default `200` (K tokens). The grid always has 200 dots, so one dot = `limit/200` K.
- `growId?: string`, default `"conv"`. The category that keeps growing and that Compact chat clears.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Card: 400px wide (`max-width: 100%`), radius 22px, padding 20px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`). Defines CSS variables `--cm-ink` (`#1d1d1f`, dark `#f5f5f7`) and `--cm-empty` (`#e8e8ed`, dark `#3a3a3c`).
- Header row (baseline aligned, space-between, 4px bottom margin): "Context window" 13px semibold `#1d1d1f` (dark `#f5f5f7`); percentage 12px semibold tabular, coloured by fullness: > 85% `#d70015` (dark `#ff453a`), > 70% `#b25000` (dark `#ff9f0a`), else `#86868b` (dark `#98989d`).
- Total row (12px bottom margin, 4px gap): total like "105.4K" at 28px semibold tabular, tracking −0.03em, primary text colour; then "of 200K tokens" 13px secondary grey.
- Dot grid: CSS grid, 40 equal columns, 3px gap, 5 rows; each dot is a square-aspect, fully round span.
- Legend: list with 2px gaps, 16px top margin. Each row is a full-width button, 32px tall, radius 8px, 8px horizontal padding, 10px gap, 13px text; hover background `#f5f5f7` (dark `#2c2c2e`). Contents: a 10px colour swatch, the label (flex 1), and the token count "46.1K" in tabular `#6e6e73` (dark `#a1a1a6`) inside a 16px-tall clipped box.
- Footer: 12px top margin and padding, top border `#f0f0f3` (dark `#3a3a3c`), space-between: "{limit − total}K left" 12px grey, and a pill button "Compact chat": 32px tall, 14px horizontal padding, 12px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text).

## Dots and data

- Build a dot list: for each category in order, `round(tokens / perDot)` dots keyed `"{id}-{n}"`; cap at 200. Render 200 slots: slot i shows dot i if it exists (key = its id) or an empty dot keyed `"e{i}"`.
- Stable per-dot keys plus `layout="position"` are what make dots slide to new grid cells when earlier categories shrink or grow.
- Background colour is inline style (category colour, or `var(--cm-empty)`), with a 300ms CSS `background-color` transition so theme switches work.

## Motion

- Default dot animation, spring stiffness 500, damping 30: `scale 1, y 0, opacity` 0.18 if a category is hovered and the dot belongs to another category, else 1. New dots mount from `scale 0` (empty slots don't).
- Falling dots (while compacting, dots of `growId`): `y = 26 + (i mod 7)·3`, `opacity 0`, `scale 0.4`, 0.5s `easeIn`, delay `(i mod 40)·0.008s` (a left-to-right ripple across columns).
- Token counts roll: `AnimatePresence mode="popLayout" initial={false}` keyed by the formatted value; enter from `y 12, opacity 0`, exit to `y −12, opacity 0`.
- Compact button: `whileTap scale 0.95`.

## Interaction and states

- Growth: every 380ms, unless compacting, add 2.2K to `growId` while the total is below `limit − 8`.
- Compact: ignore if already compacting. Set `dropping` (dots fall); after 650ms set `growId` to 6.2K and clear `dropping`; the remaining dots reflow left. Clear the timer on unmount. Never trigger side effects from inside a state updater.
- Legend hover/focus sets the highlighted category; leave/blur clears it.

## Autoplay demo

With `autoplay`: every 1000ms, if not touched and total > 90% of `limit`, compact (read the total from a ref kept in sync by an effect). Every 1700ms cycle the highlight through `null → files → tools → growId`. The first pointer enter/down or legend focus marks touched and clears the autoplay highlight. Growth runs regardless of autoplay.

## Accessibility

- The dot grid is `role="meter"` with `aria-label="Context window"`, `aria-valuemin 0`, `aria-valuemax = limit`, `aria-valuenow = total` and `aria-valuetext="105.4K of 200K tokens"`.
- Legend rows and Compact are real buttons; focus-visible 2px outline `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] 200 dots in 5 rows; filled dots are coloured by category in order, the rest are light grey (dark `#3a3a3c`).
- [ ] The conversation adds a dot or so every 380ms and its count rolls up; growth stops 8K short of the limit.
- [ ] Hovering a legend row dims all other dots to 18% opacity.
- [ ] Compact makes the conversation dots drop and fade in a quick ripple, then the following dots slide back into the freed cells.
- [ ] The percentage turns orange above 70% and red above 85%.
- [ ] Autoplay compacts on its own near 90% and cycles highlights, and stops once touched.
- [ ] In dark mode the System prompt dots are near-white and the card is `#1c1c1e`.
