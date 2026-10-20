# Advanced Pricing Columns

Build a three-column pricing section where each card has a tinted inner "price well" on top (name, badge, price, button) and the feature list below, ending with a "+ Everything in…" line that shows what the plan inherits. A monthly/yearly segmented control swaps the amount and the period with a short lift-and-blur, staggered across columns. It should feel structured, quiet and Apple-like.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, `layoutId`, variants), lucide-react (`Check`, `Plus`).
- File: `components/blocks/pricing-section/billing-pricing-variants.tsx`, named export `AdvancedPricingColumns`. It shares the billing toggle, switching text, feature row and section header helpers with the other pricing sections in that file.

## API

`AdvancedPricingColumns` takes no props; content lives in a `comparisonPlans` constant.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| — | — | — | No props. Edit `comparisonPlans` to change content. |

Internal plan shape: `{ label; monthly: string; yearly: string; badge?: string; features: string[]; inherited: string[] }`. Amounts are digits without the currency symbol.

## Layout and look

- Section: full width/height, centred flex, overflow hidden, background `#f5f5f7` (dark `#000000`), text `#1d1d1f` (dark `#f5f5f7`), 56px vertical and 16px horizontal padding. Content `max-width: 1000px`.
- Header (centred, `max-width: 36rem`, 40px below):
  - h2 "Pay for the questions you ask": 32px (40px from `sm`), semibold, leading 1.08, tracking −0.03em, balanced.
  - Paragraph 17px, leading 1.5, `#6e6e73` (dark `#a1a1a6`), 12px above: "Every plan reads from the same warehouse. Upgrade when you need more seats, history or real-time data."
  - 24px below: the billing toggle, then 8px below it "Save about 20% when you pay yearly." 13px `#86868b` (dark `#98989d`).
- Toggle: radius 10px, 3px padding, `#e8e8ed` (dark `#3a3a3c`), 14px. Options 32px tall, min-width 96px, 16px padding, radius 8px, medium. Active text `#1d1d1f` / `#f5f5f7`, inactive `#6e6e73` / `#a1a1a6` with hover to active. Sliding pill white (dark `#636366`), radius 8px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`.
- Grid: 16px gap, one column, three from `md`.
- Card: flex column, `min-height: 440px`, radius 28px, 8px padding, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.08)`).
- Price well: radius 22px (nested inside the 28px card with 8px padding), 20px padding, `#f5f5f7` (dark `#2c2c2e`).
  - Row: name 17px semibold tracking −0.015em; optional badge pill at the right, 10×2px padding, 12px semibold, `#0066cc` on `#0071e3` at 10% (dark `#2997ff` on `#2997ff` at 15%).
  - Price row 24px below, baseline aligned, 4px gap: "$" 20px semibold `#6e6e73` (dark `#a1a1a6`), amount 44px semibold leading 1 tracking −0.035em tabular, period 14px muted ("/month" or "/year").
  - Button 24px below: 44px tall, full width, rounded-full, 15px medium. The badged plan uses primary (`#0071e3`, white, hover `#0077ed`); others use white (dark `#3a3a3c`, hover `#48484a`) with `#1d1d1f` text (dark `#f5f5f7`). Label "Get {name}". Focus outline 2px `#0071e3`, offset 2px.
- Features: list padded 16px sideways, 24px above, items 10px apart, each 14px leading 1.45 with a 16px check (stroke 2.25, 2px top offset) in `#0071e3` (dark `#2997ff`), 10px gap.
- Inherited block (only when non-empty): 16px side margin, 24px above, top border `rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`), 16px top and bottom padding. Each line 14px medium `#6e6e73` (dark `#a1a1a6`), 10px gap, led by a 16px round chip `#e8e8ed` (dark `#3a3a3c`) holding a 12px plus (stroke 2.5) in ink.

## Motion

- Entrance once when 80px into view: container stagger 0.07s after 0.04s; header lines and each card from `opacity 0, y 16, blur(6px)`, spring `{stiffness 260, damping 30}`.
- Toggle pill: shared `layoutId` (namespaced with `useId`), spring `{stiffness 420, damping 34}`.
- Amount swap: `AnimatePresence mode="popLayout" initial={false}` keyed by value; enter from `y 100%, opacity 0, blur(6px)`, exit to `y -100%`. Spring `{stiffness 380, damping 32}` with delay `index × 0.04s`. The period swaps the same way 0.03s later than its amount.
- Buttons press to `scale 0.97`.
- Reduced motion: opacity-only (0.2s entrance, 0.15s swaps), no stagger, instant pill.

## Interaction and states

- Local billing state, `"monthly"` first. Toggle is `role="radiogroup"` "Billing frequency" with two `role="radio"` buttons and `aria-checked`.
- Buttons are `type="button"` with no built-in action.
- Cards without a badge get the secondary button; the badge marks the recommended plan.

## Demo data

- Hobby: 99 / 950. Access to basic analytics reports; Up to 10,000 data points per month; Email support; Community forum access; Cancel anytime. No inherited line.
- Team (badge "Most teams"): 299 / 2,870. Advanced analytics dashboard; Customizable reports and charts; Real-time data tracking; Integration with third-party tools. Inherited: "Everything in Hobby".
- Scale: 1,490 / 14,300. Unlimited data storage; Customizable dashboards; Advanced data segmentation; Real-time data processing; AI-powered insights and recommendations. Inherited: "Everything in Hobby and Team".

## Accessibility

- One h2, an h3 per plan. Check and plus icons are `aria-hidden`.
- The toggle reports state via `aria-checked`; buttons have visible focus outlines.
- Text in the price well keeps AA contrast in both modes.

## Acceptance checklist

- [ ] Three columns from `md`, stacked below.
- [ ] Each card shows a tinted inner well with 22px corners inside the 28px card.
- [ ] Team has the "Most teams" badge and a blue button; others have white buttons.
- [ ] Switching to Yearly rolls 99 → 950, 299 → 2,870, 1,490 → 14,300 left to right, and "/month" → "/year" just after.
- [ ] Hobby has no inherited block; Team and Scale show "+ Everything in …".
- [ ] The toggle pill slides rather than jumping.
- [ ] Dark mode: black page, `#1c1c1e` cards, `#2c2c2e` wells.
- [ ] Reduced motion swaps by fading only.
