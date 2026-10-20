# Seat Ruler Pricing

Build a pricing section driven by team size. A ruler of 48 thin ticks acts as a slider: drag or use the keys and the ticks fill with the accent up to the thumb and swell around it, the tier that fits your team lifts and gets an accent ring, and the monthly total rolls digit by digit. Yearly billing shows a green "You save" line. It should feel tactile and precise, like a physical dial.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container`, `@2xl:`, `cqw` units), framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, `useMotionValue`, `useSpring`, `useTransform`, `useMotionValueEvent`, `useReducedMotion`).
- File: `components/blocks/motion-kit/seat-ruler-pricing/seat-ruler-pricing.tsx`, named export `SeatRulerPricing`. Also export `DEFAULT_SEAT_RULER_TIERS` and the types `SeatRulerTier`, `SeatRulerSelection`, `SeatRulerPricingProps`.

## API

`SeatRulerTier = { name; upTo: number; monthly: number; yearly: number; note }` (prices per seat per month). `SeatRulerSelection = { seats; plan; billing: "monthly" | "yearly"; total }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `tiers` | `SeatRulerTier[]` | 3 tiers | The first tier with `seats <= upTo` is active; the last also covers anything above. |
| `maxSeats` | `number` | `200` | Ruler maximum (rounded, at least 2). |
| `defaultSeats` | `number` | `24` | Initial team size, clamped to 1..max. |
| `defaultBilling` | `"monthly" \| "yearly"` | `"yearly"` | Initial billing period. |
| `eyebrow` | `string` | `"Pricing"` | Accent label above the title. |
| `title` | `string` | `"Pay for the team you have."` | Heading. |
| `description` | `string` | `"The more people you bring, the less each seat costs. Drag to see your price."` | Paragraph. |
| `onStart` | `(selection) => void` | — | Called by the button with the current selection. |
| `accent` | `string` | — | Any CSS colour; empty = `#0071e3`, `#0a84ff` in dark mode. |
| `autoplay` | `boolean` | `false` | Sweeps through team sizes until touched. |
| `className` | `string` | — | On the section. |

## Layout and look

- Section: `@container`, full width, white (dark black), padding 64px×16px (80px×20px from `sm`). CSS variables: `--mk-accent #0071e3`, `--mk-accent-text #0071e3`, `--mk-seat-tick #d2d2d7`; dark `#0a84ff`, `#2997ff`, `#48484a`. A set `accent` overrides both accent variables inline.
- Inner `max-width: 1040px`. Header centred with 16px gaps: eyebrow 14px semibold accent-text; h2 `clamp(32px, 5vw, 54px)` semibold, leading 1.04, tracking −0.04em, max-width 680px, balanced, `#1d1d1f` (dark `#f5f5f7`); paragraph `clamp(16px, 1.6vw, 18px)` leading 1.5, max-width 520px, `#6e6e73` (dark `#a1a1a6`).
- Card: centred, `max-width: 720px`, 40px below the header (48px from `sm`), `#f5f5f7` (dark `#1c1c1e`), radius 28px and 20px padding, 32px and 40px from `sm`.
- Top row (wraps, ends aligned, 16px gap):
  - Left: "Team size" 13px medium muted; below it the number `clamp(36px, 9cqw, 44px)` semibold leading 1 tracking −0.045em plus "people"/"person" 18px medium `#86868b` (dark `#a1a1a6`).
  - Right: billing segmented control, rounded-full white (dark `#2c2c2e`) with 4px padding and a hairline `0 0 0 1px rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). Options 40px tall, 16px padding, 13px medium. Active option has a `#1d1d1f` pill (dark `#f5f5f7`) with white text (dark `#1d1d1f`); inactive text `#424245` (dark `#a1a1a6`).
- Ruler: 32px below, 56px tall, flex with `justify-between`, rounded 12px, `touch-action: none`, no text selection, pointer cursor. 48 ticks, each 3px wide, rounded, height 18–36px.
- Scale labels under it, 8px gap, 12px tabular `#86868b` (dark `#a1a1a6`): `1, 25%, 50%, 75%, 100%` of max, rounded.
- Tiers: 32px below, 8px gap, one column, three columns once the section is at least 42rem wide (`@2xl`). Each tier: radius 16px, 16px padding; active one white (dark `#2c2c2e`), others transparent. Row: name 15px semibold, "up to N" 12px muted. Line: "$9 / seat · note" 13px muted, 4px above. The active ring overlay: `inset 0 0 0 2px var(--mk-accent), 0 16px 30px -18px var(--mk-accent)`.
- Summary: 32px above with a top border `black/8%` (dark `white/10%`) and 32px padding; wraps with 24px gap. Left: "{Tier} plan, billed yearly" 13px medium muted; total line `clamp(40px, 11cqw, 56px)` semibold leading 1 tracking −0.05em: "$" at 0.5em, rolling digits, "/ month" 16px medium muted. Saving line 14px medium `#248a3d` (dark `#30d158`). Button: 48px tall, rounded-full, 24px padding, 15px medium, accent background, white text, label "Start with 24 seats".

## Motion

- Wrap everything in `MotionConfig reducedMotion="user"` and a `LayoutGroup` with a `useId` id.
- Position: a motion value `target` (0..1) feeds `useSpring(target, { stiffness: 420, damping: 38 })`. On every spring change, `seats = clamp(round(x × max), 1, max)`.
- Each tick (position `at = i / 47`): `near = max(0, 1 − min(|at − x|, hover >= 0 ? |at − hover| : 1) × 10)`; height `18 + near × 18`px; background accent when `x >= at`, otherwise the tick colour. So ticks swell around both the thumb and the pointer.
- Rolling numbers: split the string into characters, each in its own clipped slot keyed from the right (`text.length − i`) so units stay put; `AnimatePresence mode="popLayout"`, new char from `y -100%, opacity 0`, old to `y 100%`; spring `{stiffness 420, damping 30}`.
- Billing pill: `layoutId`, spring `{500, 34}`. Tier ring: `layoutId`, spring `{400, 32}`; active tier lifts `y: -4` on spring `{400, 30}`; background colour transitions 300ms.
- Saving line: height and opacity from 0 to auto and back.
- Button: hover `y: -2`, tap `scale 0.97`.

## Interaction and states

- Ruler is a `role="slider"` with `tabIndex 0`. Pointer down captures the pointer, sets touched, starts dragging and jumps to the pointer; pointer move updates the hover position and, while dragging, the target; up ends dragging (and clears hover for non-mouse pointers); cancel and leave clear hover. Minimum value is `1 / max`.
- Keys: Right/Up +1, Left/Down −1, PageUp +10, PageDown −10, Home 1, End max. Prevent default and mark as touched.
- Price: `per = yearly ? tier.yearly : tier.monthly`, `total = per × seats` (formatted `en-US`), `saving = (monthly − yearly) × seats × 12`, shown only on yearly when above 0.
- The button marks as touched and calls `onStart` with seats, plan name, billing and total. Seat word is singular for 1.

## Autoplay demo

When `autoplay` is set (and reduced motion is off and nothing has been touched), every 2200ms move the target to the next of `[24, 6, 48, 140, 72]` (capped at max), looping. Any pointer, key, billing or button press stops it for good.

## Accessibility

- Slider: `aria-label="Team size"`, `aria-valuemin 1`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` like "24 people, Growth plan, $192 a month". Focus ring 2px accent with 4px offset in the card colour.
- Billing control is `role="radiogroup"` "Billing period" with `role="radio"` buttons. The active tier has an `sr-only` " (fits your team)". Scale labels are `aria-hidden`.

## Acceptance checklist

- [ ] 48 ticks fill with accent up to the thumb and swell within about 10% of it.
- [ ] Hovering the ruler swells ticks under the pointer without moving the value.
- [ ] At 24 seats yearly: Growth is ringed, total $192 / month, "You save $576 a year".
- [ ] Crossing 10 and 50 moves the ring between tiers with a spring.
- [ ] Digits roll individually; unchanged digits stay still.
- [ ] Arrow, Page and Home/End keys work and stop autoplay.
- [ ] Tiers sit in three columns in a wide container and stack in a narrow one.
- [ ] A custom `accent` recolours ticks, ring, glow, eyebrow and button.
- [ ] Autoplay cycles 24 → 6 → 48 → 140 → 72 every 2.2s until touched.
