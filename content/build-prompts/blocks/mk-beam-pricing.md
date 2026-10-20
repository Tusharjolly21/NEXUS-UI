# Beam Pricing

Build a three-plan pricing section with a monthly/yearly toggle. Switching rolls each price digit by digit with a slight blur, the yearly saving badge pops, and the featured plan is a dark card with a beam of light running around its border on a loop. It should feel premium and alive without being noisy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container`, `@3xl:`), framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, `useReducedMotion`). Icons are inline SVG.
- File: `components/blocks/motion-kit/beam-pricing/beam-pricing.tsx`, named export `BeamPricing`. Also export `DEFAULT_BEAM_PRICING_PLANS` and the types `BeamPricingPlan`, `BeamPricingBilling`, `BeamPricingProps`.

## API

`BeamPricingPlan = { name; blurb; monthly: number | null; yearly: number | null; features: string[]; cta; featured?: boolean }`. Prices are per user per month; `null` shows "Custom".

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `plans` | `BeamPricingPlan[]` | 3 plans | Cards in order. |
| `eyebrow` | `string` | `"Pricing"` | Accent label above the title. |
| `title` | `string` | `"Simple plans. Cancel any time."` | Heading. |
| `yearlyBadge` | `string` | `"−20%"` | Green badge on the Yearly option. |
| `featuredBadge` | `string` | `"Most popular"` | Badge on the featured card. |
| `defaultBilling` | `"monthly" \| "yearly"` | `"yearly"` | Initial billing. |
| `onSelectPlan` | `(plan, billing) => void` | — | Called by each card's button. |
| `accent` | `string` | — | Any CSS colour; empty = `#0071e3`, `#0a84ff` in dark mode. |
| `autoplay` | `boolean` | `false` | Flips billing every 3.2s until a billing option is clicked. |
| `className` | `string` | — | On the section. |

## Layout and look

- Section: `@container`, full width, white (dark black), padding 64px×16px (80px×20px from `sm`). Variables `--mk-accent #0071e3`, `--mk-accent-text #0071e3`; dark `#0a84ff`, `#2997ff`. A set `accent` overrides both inline.
- Inner `max-width: 1120px`. Header centred, 16px gaps: eyebrow 14px semibold accent-text; h2 `clamp(32px, 5vw, 54px)` semibold, leading 1.04, tracking −0.04em, max-width 700px, balanced, `#1d1d1f` (dark `#f5f5f7`).
- Toggle (16px extra top margin): rounded-full, 4px padding, `#f0f0f3` (dark `#1c1c1e`). Options 40px tall, 16px padding (20px from `sm`), 8px gap, 14px medium; active text `#1d1d1f` (dark `#f5f5f7`), inactive `#6e6e73` (dark `#a1a1a6`). Active pill white with `0 2px 8px rgba(0,0,0,.12)` (dark `#3a3a3c`, no shadow). The Yearly option carries a pill badge: `#248a3d`, white 11px semibold, 8×2px padding.
- Grid: 48px below (56px from `sm`), 20px gap, items stretch. One column capped at 460px and centred; three columns at full width once the container is at least 48rem (`@3xl`).
- Normal card: outer wrapper radius 28px, 1.5px padding, ring `0 0 0 1px rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`); inner panel radius 26.5px, white (dark `#1c1c1e`).
- Featured card: outer wrapper radius 28px, 1.5px padding, overflow hidden, glow `0 40px 80px -40px var(--mk-accent)`. Behind the inner panel, a square twice the card size centred on it with `conic-gradient(from 0deg, transparent 0 70%, var(--mk-accent) 80%, #5ac8fa 88%, transparent 96%)`; only the 1.5px rim shows, so it reads as a beam on the border. Inner panel `#1d1d1f` (dark `#2c2c2e`), white text.
- Inner panel: flex column, full height, 24px gap, 24px padding (28px from `sm`).
  - Row: name 20px semibold tracking −0.02em; featured badge at right, accent background, white 11px semibold, 10×4px padding, rounded-full.
  - Blurb 15px, `#6e6e73` (dark `#a1a1a6`; `#a1a1a6` on featured).
  - Price row (wraps, baseline, 6px gap): "$" at 0.54em with 2px right margin, digits `clamp(44px, 4.6vw, 52px)` semibold leading 1 tracking −0.05em tabular; "Custom" at `clamp(38px, 4vw, 44px)` tracking −0.045em. After a number, "/ user / mo" 15px `#86868b` (dark `#a1a1a6`).
  - Features: 12px apart, 15px, 10px gap, a 16px check (path `M5 12.5l4.5 4.5L19 7.5`, stroke 3, round caps/joins) in accent, or `#5ac8fa` on the featured card.
  - Button at the bottom (`margin-top: auto`): 48px tall, rounded-full, 15px medium. Featured: white (dark `#f5f5f7`) with `#1d1d1f` text. Others: `#f0f0f3` / `#1d1d1f`, hover `#e8e8ed`; dark `#2c2c2e` / `#f5f5f7`, hover `#3a3a3c`. Focus ring 2px accent, offset 2px in the card colour.

## Motion

- Wrap in `MotionConfig reducedMotion="user"` and a `LayoutGroup` with a `useId` id.
- Toggle pill: `layoutId`, spring `{stiffness 500, damping 34}`. Yearly badge: on becoming yearly, `scale [1, 1.2, 1]` over 0.4s.
- Price digits: `AnimatePresence mode="popLayout" initial={false}` inside a clipped inline box; key each digit by `length-index-digit` so only changed digits move. Enter from `y -110%, opacity 0, blur(4px)`, exit to `y 110%`; spring `{stiffness 380, damping 28}` with delay `index × 0.05s`; blur transitions over 0.35s.
- Cards enter once in view from `opacity 0, y 30` on spring `{stiffness 140, damping 20}`, delay `index × 0.08s`; hover lifts `y: -6`.
- Features enter once in view from `opacity 0, x -8`, delay `0.2 + index × 0.06s`.
- Beam: rotate 0 → 360 in 4s, linear, infinite; off under reduced motion.
- Buttons: hover `y: -2`, tap `scale 0.97`.

## Interaction and states

- Toggle: `role="radiogroup"` "Billing period", two `role="radio"` buttons with `aria-checked`. Clicking marks the section as touched.
- Each card's button calls `onSelectPlan(plan, billing)`.
- A plan with `null` for the current billing shows "Custom" and hides the unit.

## Autoplay demo

With `autoplay` (reduced motion off, not yet touched), toggle billing every 3200ms, so prices roll back and forth and the badge pops. Clicking either billing option stops it for good.

## Demo data

- Starter: "For individuals getting organised." $0 / $0. 3 dashboards; 7 days of history; Email support. "Start free".
- Team (featured): "For teams that run on numbers." $24 monthly, $19 yearly. Unlimited dashboards; Full history; Live sync, every app; Priority support. "Start 14-day trial".
- Enterprise: "For orgs with more to manage." Custom. SSO and SCIM; Audit logs; Custom contracts; Dedicated success manager. "Talk to sales".

## Accessibility

- The price includes an `sr-only` copy of the number; the animated digits are `aria-hidden`. Check icons and the beam layer are `aria-hidden`.
- Headings: one h2, an h3 per plan. All controls are real buttons with visible accent focus rings.
- Reduced motion stops the beam and autoplay.

## Acceptance checklist

- [ ] Yearly is selected on load with a green "−20%" badge.
- [ ] Switching to Monthly rolls Team from 19 to 24, digit by digit with a stagger.
- [ ] Starter's $0 does not animate when billing changes.
- [ ] Enterprise reads "Custom" with no "/ user / mo".
- [ ] A coloured beam circles the featured card's border every 4s, and the card has an accent glow.
- [ ] Cards stack in a 460px column in a narrow container and sit in three columns in a wide one.
- [ ] A custom `accent` recolours beam, glow, eyebrow, badge and checks.
- [ ] Autoplay flips billing every 3.2s until a billing option is clicked.
- [ ] With reduced motion the beam is still and autoplay does not run.
