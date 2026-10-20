# Four Tier Billing Switch

Build a centred pricing section with a monthly/yearly segmented control above four plan cards. Flipping the switch slides a white pill under the active option and swaps every price with a short lift-and-blur, staggered across the cards. The third card is highlighted as the popular choice. It should feel light, tidy and Apple-like.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, `layoutId`, variants), lucide-react (`Check`).
- File: `components/blocks/pricing-section/billing-pricing-variants.tsx`, named export `PricingPlanGrid`. The billing toggle, switching text and feature row are small internal helpers in the same file.

## API

`PricingPlanGrid` takes no props; the copy and plans are constants in the file.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| — | — | — | No props. Edit the `gridPlans` array to change content. |

Internal plan shape: `{ label; monthly: string; yearly: string; copy; features: string[]; action; featured?: boolean }`. Prices are display strings, so "Let's talk" works too.

## Layout and look

- Section: full width/height, centred flex, overflow hidden, background `#f5f5f7` (dark `#000000`), text `#1d1d1f` (dark `#f5f5f7`), padding 56px vertical, 16px horizontal (32px from `sm`). Content `max-width: 1120px`.
- Header (centred, `max-width: 36rem`, 40px below):
  - h2 "Plans that grow with your audience": 32px (40px from `sm`), semibold, leading 1.08, tracking −0.03em, balanced wrapping.
  - Paragraph 17px, leading 1.5, `#6e6e73` (dark `#a1a1a6`), 12px above, pretty wrapping: "Start on the plan that fits the channels you run today. Switch tiers whenever you like and we prorate the difference."
  - 24px below: the toggle, then 8px under it a note "Save about 20% when you pay yearly." in 13px `#86868b` (dark `#98989d`).
- Toggle: inline-flex, radius 10px, 3px padding, background `#e8e8ed` (dark `#3a3a3c`), 14px text. Each option 32px tall, min-width 96px, 16px padding, radius 8px, medium weight. Active text `#1d1d1f` (dark `#f5f5f7`); inactive `#6e6e73` (dark `#a1a1a6`), hover to active colour. The pill: white (dark `#636366`), radius 8px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`.
- Grid: 16px gap; 1 column, 2 from `sm`, 4 from `lg`.
- Card: flex column, `min-height: 420px`, radius 24px, padding 24px, white (dark `#1c1c1e`). Normal shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark: `0 0 0 1px rgba(255,255,255,.08)`). Featured: `0 0 0 2px #0071e3, 0 20px 40px -24px rgba(0,0,0,.25)`.
- Card header row: name 17px semibold tracking −0.015em; on the featured card "Most popular" at the right, 12px semibold `#0071e3` (dark `#2997ff`).
- Price: 16px below, 40px min height, 32px semibold, tracking −0.03em, tabular numbers.
- Copy: 8px below, 14px leading 1.5, `#6e6e73` (dark `#a1a1a6`), min height 42px so cards align.
- Features: 24px above, a top border `rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`) with 20px above the list, items 10px apart, 28px below. Each item: 14px leading 1.45, 10px gap, a 16px check (stroke 2.25, 2px top offset) in `#0071e3` (dark `#2997ff`).
- Button pinned to the bottom (`margin-top: auto`): 44px tall, full width, fully rounded, 20px padding, 15px medium. Featured uses primary (`#0071e3`, white text, hover `#0077ed`); others secondary (`#e8e8ed` / `#1d1d1f`, hover `#dcdce1`; dark `#2c2c2e` / `#f5f5f7`, hover `#3a3a3c`). Focus: 2px `#0071e3` outline, offset 2px.

## Motion

- Entrance once when 80px into view: container staggers 0.07s after 0.04s; header lines and each card rise from `opacity 0, y 16, blur(6px)` on a spring `{stiffness 260, damping 30}`.
- Toggle pill: shared `layoutId` (namespaced with `useId`), spring `{stiffness 420, damping 34}`.
- Price swap: `AnimatePresence mode="popLayout" initial={false}`, keyed by the visible string. New from `y 100%, opacity 0, blur(6px)`; old exits to `y -100%`, same blur. Spring `{stiffness 380, damping 32}` with delay `cardIndex × 0.04s`, giving a left-to-right ripple. Keep the text on one line.
- Buttons press to `scale 0.97`.
- Reduced motion: entrance and price swaps become opacity-only (0.2s / 0.15s), no stagger, pill moves instantly.

## Interaction and states

- Billing state is local (`"monthly"` initially). The toggle is a `role="radiogroup"` labelled "Billing frequency" with two `role="radio"` buttons and `aria-checked`.
- Prices whose monthly and yearly strings are equal (e.g. "Let's talk") do not animate, since the key does not change.
- Buttons are plain `type="button"`; wire your own handlers.

## Demo data

- Starter: $4/mo, $38/yr. "For a first channel and a weekly upload rhythm." Manage up to 2 channels, Basic video upload support, Email support within 48 hours, Access to community forum, Monthly performance reports. Button "Start free for 14 days".
- Growth: $8/mo, $76/yr. "For creators between 10k and 100k subscribers." Everything in Starter, plus; Manage up to 5 channels; Priority video upload support; Email support within 24 hours; Access to exclusive webinars; Advanced analytics reports. "Choose Growth".
- Studio (featured): $12/mo, $114/yr. "For established creators with a small team." Everything in Growth, plus; Manage up to 10 channels; Priority video upload support; Email support within 12 hours; Access to private creator community; Monthly strategy sessions; Advanced analytics and insights. "Choose Studio".
- Network: Let's talk / Let's talk. "For networks and agencies running many channels." Everything in Studio, plus; Manage unlimited channels; 24/7 priority support; Access to VIP creator community; Weekly strategy sessions; Custom branding and design services. "Talk to sales".

## Accessibility

- Heading hierarchy: one h2 for the section, an h3 per card.
- Check icons are `aria-hidden`; the toggle exposes its state through `aria-checked`.
- All buttons have visible focus outlines; colour contrast holds in both modes.

## Acceptance checklist

- [ ] Four cards in a row on desktop, two on tablet, one on phone.
- [ ] Studio has a 2px blue ring and "Most popular".
- [ ] Clicking Yearly slides the pill and every numeric price rolls in, left card first.
- [ ] "Let's talk" stays still when switching.
- [ ] Buttons sit on the same baseline at the bottom of every card.
- [ ] Copy blocks align across cards thanks to the 42px min height.
- [ ] Dark mode uses black page, `#1c1c1e` cards and `#2997ff` checks.
- [ ] With reduced motion, swaps fade with no vertical movement.
