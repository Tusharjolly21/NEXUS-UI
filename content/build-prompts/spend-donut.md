# Spend Donut

Build a monthly budget card with a donut chart and a legend. Point at a slice (or its legend row) and that slice slides outward from the ring and thickens while the centre rolls to its amount; switch month and every slice re-measures itself in one continuous spring sweep instead of jumping. The feel is a clean Apple Wallet / Screen Time card: soft, springy, precise.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS (v4 container queries used once), framer-motion (`motion`, `MotionConfig`, `animate`, `motionValue`, `useMotionValue`, `useSpring`, `useTransform`).
- File: `components/spend-donut/spend-donut.tsx`, named export `SpendDonut`, plus exported `SpendDonutProps` and `SpendCategory` (`{ name: string; color: string }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `thickness` | `number` | `18` | Ring stroke width in viewBox px. The active slice is `thickness + 6`. |
| `gap` | `number` | `4` | Clear space between slices in px; round caps are accounted for. |
| `autoplay` | `boolean` | `false` | Self-demo (see below) until someone interacts. |

## Data

Categories, in order: Housing `#0071e3`, Food `#ff9f0a`, Transport `#30d158`, Fun `#bf5af2`, Savings `#64d2ff`. Months (same order): Aug `[1650, 540, 260, 410, 600]`, Sep `[1650, 610, 320, 280, 750]`, Oct `[1650, 480, 210, 520, 900]`. Default month Oct. Money format: `$` + rounded value with `en-US` thousands separators.

## Layout and look

- Card: `w-[380px] max-w-full`, radius 24px, padding 20px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`). Make it a Tailwind `@container`.
- Header (space-between): "Spending" 14px semibold `#1d1d1f` (dark `#f5f5f7`). Right: segmented control, pill track `#f0f0f3` (dark `#2c2c2e`) with 3px padding; buttons Aug / Sep / Oct, 28px tall, 12px horizontal padding, 12px medium; selected text primary, others `#6e6e73` (dark `#98989d`). The selected thumb is a white (dark `#48484a`) pill with `0 1px 3px rgba(0,0,0,.15)`.
- Donut: 220px wide (max-w-full), 8px top margin, centred. SVG viewBox 220×220, `overflow: visible`. Centre 110, radius 82. A full background ring in `#f0f0f3` (dark `#2c2c2e`) at `thickness`. Five slice circles on top, same centre and radius, round line caps, rotated −90° so 0% is 12 o'clock.
- Centre overlay (pointer-events none): label 12px medium ("Oct total" in secondary, or the category name in its own colour); amount 30px semibold, tracking −0.035em, tabular figures, primary; footnote 11px secondary: "of $4,000 budget" or "N% of spend".
- Legend: 12px top margin, column with 4px gap, one full-width button per category: radius 10px, padding 6px 10px, 13px text, 10px gap. Contents: a 10px dot in the category colour, the name (flex-1, truncate), a 6px-tall mini bar track (`#f0f0f3`, dark `#3a3a3c`) 48px wide, 80px when the card container is at least 300px (`w-12 @[300px]:w-20`), with a fill in the category colour at `value / max(values)` width, and the amount right-aligned in a 56px column, secondary. The active row has a `#f5f5f7` (dark `#2c2c2e`) highlight pill behind it.

## Motion

- **Slice geometry**: each slice has two motion values, `start` and `len`, in percent of the ring, both starting at 0. On mount and on every month change, animate slice i to `start = sum of previous percentages` and `len = value/total·100` with a spring (stiffness 120, damping 20) delayed `i·0.04s`. Stop running animations on cleanup.
- Gap compensation: `g = (gap + thickness) / circumference · 100` (circumference `2π·82`), kept in a motion value so prop changes re-render the dashes. `strokeDasharray = v, C − v` where `v = max(0.01, len − g)/100 · C`; `strokeDashoffset = −(start + g/2)/100 · C`. This leaves `gap` px of clear space between round caps.
- **Slide-out**: the slice's group translates along its mid-angle `a = (start + len/2)/100 · 2π − π/2` by a spring-driven distance `push` (stiffness 420, damping 24), 9px when active, 0 otherwise: `x = cos(a)·push`, `y = sin(a)·push`.
- **Thicken/dim**: active slice `strokeWidth thickness + 6`; when another slice is active, the rest fade to opacity 0.3. Spring stiffness 400, damping 26.
- **Centre amount**: a `useSpring` (stiffness 160, damping 24) chases the total or the active value and is rendered through `useTransform` with the money formatter, so digits roll. The label re-mounts per selection with `opacity 0, y 4 → 1, 0`.
- **Thumbs**: the month thumb and the legend highlight move between items with shared `layoutId`s (springs 500/36 and 500/38). Make the ids unique per instance (`useId`).
- **Mini bars**: width springs (stiffness 160, damping 22) from 0 on mount and between months.
- Wrap in `MotionConfig reducedMotion="user"`.

## Interaction and states

- State: `month` and `active` (category index or null).
- Pointer (mouse, pen, touch) over the donut: convert to viewBox coordinates, and if the distance from the centre is within `thickness/2 + 12` of the radius, compute the angle from 12 o'clock clockwise as a percentage and select the slice whose cumulative range contains it. Leaving the donut clears the selection. The donut area has `touch-action: none` so touch can scrub around the ring.
- Legend rows: pointer enter or focus selects; blur clears. Arrow Down/Right and Up/Left move focus to the next/previous row (wrapping), Home/End to the first/last.
- Clicking a month clears the selection and switches month.

## Autoplay demo

Every 1100ms advance a counter k: when `k % 7 === 6`, clear the selection and step month Oct → Sep → Aug → Oct; otherwise select `(k % 7) − 1` (none when 0). Stop the interval at the first interaction (any pointer down on the card, ring scrub, row hover, month click).

## Accessibility

- SVG `role="img"` with an `aria-label` like "Oct spending $3,760: Housing $1,650, Food $480, …". The visual centre overlay is `aria-hidden`.
- A visually hidden `aria-live="polite"` paragraph announces "Oct total $3,760 of $4,000 budget" or "Food $480, 13% of spend".
- Month switcher: `role="tablist"` labelled "Month", buttons `role="tab"` with `aria-selected`. Focus-visible ring 2px `#0071e3` (dark `#0a84ff`) on all buttons.

## Acceptance checklist

- [ ] On mount the five slices sweep out from 12 o'clock with a slight stagger, separated by even gaps with round caps.
- [ ] Pointing at a slice pushes it 9px outward along its centre angle, thickens it by 6px and dims the others.
- [ ] The centre number rolls to the slice amount and the footnote shows its share of spend.
- [ ] Switching month animates every slice's start and length together, with no jump.
- [ ] Changing `gap` or `thickness` keeps the clear space between caps.
- [ ] Touch-dragging around the ring changes the selection; arrow keys move through the legend.
- [ ] Two instances on one page keep independent thumbs.
- [ ] Dark mode swaps card, track, thumb, highlight and text colours.
