# Toggle Pricing

Build a pricing section: a Monthly / Yearly segmented switch above a row of plan cards. The switch knob squashes and stretches with its own speed as it slides, the green saving badge pops when Yearly is chosen, and every price rolls digit by digit, like an odometer, to its new figure with a small overshoot. A line under each price swaps between "Billed monthly" and the yearly total. On narrow containers the cards collapse into compact rows.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[540px]:`), framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useVelocity`, `useTransform`, `useReducedMotion`).
- File: `components/toggle-pricing-pro/toggle-pricing-pro.tsx`, named export `PricingToggle`, exported `DEFAULT_PRICING_PLANS`, types `Billing` (`"monthly" | "annual"`), `PricingPlan`, `PricingToggleProps`.

## API

`PricingPlan`: `{ id: string; name: string; monthly: number; annual: number; description?: string; features?: string[]; cta?: string; featured?: boolean }`. `monthly` and `annual` are both per-month prices. Up to 4 features show. `cta` defaults to "Choose {name}". `featured` adds a ring, a "Popular" badge and a filled button.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `plans` | `PricingPlan[]` | Starter 9/7 "For side projects." (3 projects, Community support, Basic analytics); Pro 39/29 "For growing teams." featured (Unlimited projects, Priority support, Advanced analytics); Scale 119/89 "For companies at scale." (SSO and audit logs, Dedicated manager, 99.99% SLA) | Plans. |
| `defaultBilling` | `Billing` | `"annual"` | Initial period. |
| `onBillingChange` | `(b: Billing) => void` | — | Fired on a real change by the user. |
| `onSelect` | `(planId, billing) => void` | — | Plan button pressed. |
| `currency` | `string` | `"$"` | Symbol before prices. |
| `savingsLabel` | `string` | best saving | Badge text; default `Save N%` where N is the max of `1 − annual/monthly` over plans with monthly > 0, rounded; empty if no saving. |
| `autoplay` | `boolean` | `false` | Flip every 2.6s until touched. |
| `className` | `string` | `""` | Wrapper classes. |

## Layout and look

- Wrapper: `@container`, full width, text `#1d1d1f` / `#f5f5f7`.
- Switch (centred): `role="radiogroup"`, 248×40px, rounded-full, padding 4px, `#e8e8ed` / `#2c2c2e`, two equal columns. Knob: absolute, top 4px, height 32px, width `calc(50% − 4px)`, left `calc(x·50% + 4px)`, white (dark `#636366`), shadow `0 1px 3px rgba(0,0,0,.14), 0 4px 10px -4px rgba(0,0,0,.2)`. Options: 13px semibold, gap 6px; unselected `#6e6e73` / `#a1a1a6` with hover to ink. Labels "Monthly" and "Yearly"; Yearly carries the badge: rounded-full, padding 1px 6px, 10px bold, `#30d158` bg, `#06281b` text.
- Cards grid: margin-top 20px; 1 column with 10px gap; at container ≥540px 3 columns with 12px gap.
- Card: radius 22px, white / `#1c1c1e`. Narrow: a row (items centred, gap 12px, padding 16px). Wide: a column (padding 20px). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`); featured `0 0 0 2px #0071e3, 0 24px 44px -24px rgba(0,113,227,.55)` (dark `#0a84ff` ring, `.9` black shadow).
  - Name `<h3>` 15px semibold tracking −0.01em; featured badge "Popular" rounded-full, padding 2px 8px, 10px semibold white on `#0071e3` / `#0a84ff`. Description 12px grey, 2px top margin.
  - Price block: right-aligned when narrow, left with 16px top margin when wide. Currency 16px grey, 4px from top; digits 34px (40px wide), semibold, line-height 1, tracking −0.04em, tabular; "/mo" 12px medium grey aligned to the bottom. Sub line 16px tall, 11px grey, overflow hidden: "$X,XXX billed yearly" (annual × 12, `en-US` grouping) or "Billed monthly".
  - Features (wide only): margin 16px top, 20px bottom, 12px, gap 6px, each with a 12px green `#30d158` check (`M2.5 6.3l2.3 2.2 4.7-5`, stroke 2).
  - Button: narrow, a 36px circle with a 12px chevron; wide, full-width 36px pill pushed to the bottom with the CTA text, 13px semibold. Featured: `#0071e3` / `#0a84ff` with white (hover `#0077ed`); others `#f0f0f3` / `#2c2c2e` (hover `#e8e8ed` / `#3a3a3c`). `active` scale .97.
- Footer hint: margin-top 12px, centred, 12px `#86868b` / `#a1a1a6`: "Flip the switch; every price rolls to its new figure."

## Motion

- Knob: `x` is a spring (stiffness 420, damping 26) toward 0 (monthly) or 1 (annual). From its velocity: `stretch = 1 + min(0.35, |v|·0.05)` as `scaleX`, `squash = 1/√stretch` as `scaleY`, so it keeps volume.
- Badge: annual `scale 1, opacity 1`; monthly `scale .86, opacity .45`; spring 500/12 (bouncy pop).
- Odometer: pad every price to the widest price's digit count across plans. Each digit is a 1em-tall, 0.6em-wide window holding a column of 0–9 plus a blank slot (10). Animate the column's `y` to `−digit em` with a spring (stiffness 170, damping 14, mass .8). Delay `(lastIndex − i)·0.05s` so the ones digit moves first. Leading blanks render no window.
- Sub line: `AnimatePresence mode="popLayout"` keyed by billing; switching to annual enters from y 14 and exits to y −14 (reverse for monthly), spring 420/30, with opacity.
- Card `whileHover` y −3, spring 400/24.
- Reduced motion: knob jumps, no stretch, digits and badge snap, no sub-line slide, no hover lift.

## Interaction and states

- Clicking an option selects it; re-clicking the current one does nothing and does not fire `onBillingChange`.
- Arrow keys (left/right/up/down) inside the group flip to the other option and move focus to it.
- Any pointer down or button press marks the section touched.

## Autoplay demo

With `autoplay`, flip the billing period every 2600ms until the first pointer down or press, then stop for good. Autoplay flips do not call `onBillingChange`.

## Accessibility

- Radiogroup labelled "Billing period"; options are `role="radio"` with `aria-checked` and roving `tabIndex`.
- The visual price is `aria-hidden`; an `sr-only` sentence reads "$29 per month, billed yearly at $348" or "$39 per month, billed monthly".
- Plan buttons have `aria-label` = CTA text. Focus outlines 2px `#0071e3` / `#0a84ff`.

## Acceptance checklist

- [ ] The knob stretches wide and flattens mid-slide, then settles round.
- [ ] Yearly badge reads "Save 26%" for the default plans and pops when Yearly is selected.
- [ ] Prices roll per digit, ones first, with a slight overshoot (39 → 29, 119 → 89 keeps alignment).
- [ ] The sub line slides to "$348 billed yearly" / "Billed monthly".
- [ ] The featured plan has a 2px blue ring, "Popular" badge and blue button.
- [ ] Below a 540px container, cards become rows with a round chevron button and no features.
- [ ] Arrow keys toggle billing; screen readers hear the full price sentence.
- [ ] Autoplay flips every 2.6s until touched.
