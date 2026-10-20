# Radio Plan Selector

Build a two-column pricing panel: a feature checklist on one side, a stack of radio-style plan options on the other. Choosing a plan slides an accent ring onto it, ticks features on or off in a quick cascade, fills a progress bar, rolls the big price to the new value and swaps the button label. It should feel calm, precise and Apple-like.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`, `layoutId`), lucide-react (`Check`, `Minus`).
- File: `components/blocks/pricing-section/radio-plan-pricing.tsx`, named export `RadioPlanPricing`. Also export `DEFAULT_PRICING_PLANS`, `DEFAULT_PRICING_FEATURES` and the types `PricingPlan`, `PricingTheme`, `PricingLayout`, `PricingTransitionSpeed`, `RadioPlanPricingProps`.

## API

`PricingPlan = { id; label; subtitle?; price: number; period?; badge?; ctaLabel?; ctaHref?; includedFeatureCount: number }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `plans` | `PricingPlan[]` | 3 demo plans | First 6 are shown. |
| `features` | `string[]` | 8 demo features | First 12 are shown. A plan includes the first `includedFeatureCount`. |
| `plansTitle` / `plansSubtitle` | `string` | `"How you pay"` / `"Same product on every plan. Yearly saves you 19%."` | Plans column header. |
| `featuresTitle` / `featuresSubtitle` | `string` | `"What's included"` / `"Pick a plan to see what it unlocks."` | Features column header. |
| `currency` | `string` | `"$"` | Prefix on every price. |
| `defaultSelectedPlan` | `string` | `"monthly"` | Initial plan id; falls back to the first plan. |
| `layout` | `"responsive" \| "desktop" \| "mobile"` | `"responsive"` | Two columns from `lg`, always two, or always stacked. |
| `theme` | `"ivory" \| "slate" \| "midnight" \| "ember" \| "custom"` | `"ivory"` | Palette (see below). |
| `backgroundColor`, `cardBackgroundColor`, `primaryTextColor`, `secondaryTextColor`, `accentColor`, `ctaTextColor` | `string` | — | Used only with `theme="custom"`. |
| `outerRadius` / `optionRadius` | `number` | `28` / `18` | Panel and option radius (px). |
| `padding` | `number` | `36` | Column padding: `clamp(20px, 3vw, {padding}px)`. |
| `shadowIntensity` | `number` | `0.14` | Panel shadow strength. |
| `showBorder` | `boolean` | `true` | 1px hairline ring on the panel. |
| `transitionSpeed` | `"slow" \| "medium" \| "fast"` | `"medium"` | Spring for UI changes. |
| `priceAnimationDuration` | `number` | `0.7` | Seconds for the price count; `0` = instant. |
| `headingFontFamily`, `priceFontFamily`, `bodyFontFamily` | `string` | — | Inline font-family overrides. |
| `showCTA` / `showPlanBadges` | `boolean` | `true` / `true` | Toggle the button and plan badges. |
| `className` | `string` | — | On the outer section. |

## Layout and look

- Colours are CSS variables set on the section: `--rp-page, --rp-bg, --rp-card, --rp-sel, --rp-ink, --rp-sub, --rp-accent, --rp-cta, --rp-line`.
  - `ivory` (adaptive): light `#f5f5f7, #ffffff, #f5f5f7, #ffffff, #1d1d1f, #6e6e73, #0071e3, #ffffff, rgba(0,0,0,0.08)`; under `.dark`: `#000000, #1c1c1e, #2c2c2e, #2c2c2e, #f5f5f7, #a1a1a6`, accent and cta unchanged, line `rgba(255,255,255,0.1)`.
  - `slate`: the light set, fixed. `midnight`: the dark set, fixed. `ember`: dark set with accent `#ff9500` and cta text `#1d1d1f`.
  - `custom`: start from ivory and override with the given props (`cardBackgroundColor` sets both card and selected).
- Section: full width/height, `min-height: 550px`, centred flex, page background, padding 12px (24px from `sm`), ink colour.
- Panel: grid, `max-width: 1320px`, `--rp-bg`, overflow hidden, radius `outerRadius`. Shadow: optional `0 0 0 1px var(--rp-line)`, then with `a = clamp(shadowIntensity × 2, 0, 0.6)`: `0 1px 2px rgba(0,0,0,a×0.15), 0 30px 60px -30px rgba(0,0,0,a)`.
- Columns: `0.92fr 1.08fr`. Features column first on desktop with a right border; on mobile the plans come first and features get a top border.
- Column header: h2 `clamp(1.5rem, 2.3vw, 2rem)`, semibold, leading 1.1, tracking −0.03em; subtitle 15px (17px from `sm`), leading 1.5, `--rp-sub`, 8px above. Body starts 24px below (28px from `sm`).
- Feature row: 7px vertical padding, 12px gap, a 22px round chip (accent fill with 14px check, stroke 2.5, in cta colour; or card fill with 14px minus, stroke 2.25, in sub colour), text 15px/16px, leading 1.45, truncated. Rows are separated by 4px.
- Footer of features: "N of M features included" (13px, sub; N semibold ink, tabular), then a 4px rounded track (card colour) with an accent fill sized to `N / M`.
- Plan option: a `<label>`, 16px padding (20×18 from `sm`), 16px gap, radius `optionRadius`. Unselected: card fill + `inset 0 0 0 1px var(--rp-line)`, hover brightness 0.98 (1.1 in dark). Selected: `--rp-sel` + `0 2px 6px rgba(0,0,0,0.06), 0 12px 24px -12px rgba(0,0,0,0.18)` and a 2px inset accent ring overlay.
- Radio dot: 22px circle; unselected `--rp-bg` with `inset 0 0 0 1.5px var(--rp-line)`, selected accent with an 8px inner dot in cta colour.
- Option text: label 17px semibold, tracking −0.015em; badge pill 12px semibold, 8×2px padding, text accent on `color-mix(accent 12%, transparent)`; subtitle 14px sub, truncated. Right side: price 17px semibold tabular (`$10.59`), period 13px sub.
- Summary row: top border, 24px above; on `sm` a row with items at the end. Left: "Label · period" 13px sub, then the rolling price: currency 22px semibold sub, whole part 44px semibold leading 1 tracking −0.035em, ".decimals" 22px. Right: CTA pill 48px tall, 24px padding, 17px medium, accent background, cta text, hover brightness 1.1, focus outline 2px `#0071e3` offset 2px.

## Motion

- Springs by speed: slow `{stiffness 220, damping 30}`, medium `{380, 32}`, fast `{500, 36}`.
- Entrance (once, when 80px into view): container staggers children 0.06s after 0.05s; each item from `opacity 0, y 16, blur(6px)` with spring `{260, 30}`.
- Selection ring: one shared `layoutId` element moving between options on the chosen spring.
- Radio inner dot: scale/opacity 0 ↔ 1, spring `{500, 30}`. Option press: `scale 0.985`.
- Feature chips: `AnimatePresence mode="popLayout"` keyed on/off, from `opacity 0, scale 0.5`; row text opacity 1 or 0.5. Delay `index × 0.025s` for a top-to-bottom cascade.
- Included count rolls: new number from `y 100%, blur(4px)`, old exits to `y -100%`. Progress width animates with spring `{200, 30}`.
- Price: a motion value springs from the old to the new price (`animate(counter, value, { type: "spring", duration, bounce: 0 })`); whole and decimal parts are derived with `toFixed(2)`.
- CTA label swaps like the count (blur 6px) keyed by plan id; press scales to 0.97 with spring `{500, 30}`.
- Reduced motion: opacity-only fades (0.15–0.2s), no stagger, no scale, price set instantly.

## Interaction and states

- A real radio group: hidden `<input type="radio">` per option sharing a `useId` name, inside a `<fieldset>` with a visually hidden legend "Select your pricing plan". Clicking anywhere on the label selects.
- Focus shows on the label via `has-[:focus-visible]` (2px `#0071e3` outline, offset 2px).
- The CTA is a link to the selected plan's `ctaHref` (default `#`) reading its `ctaLabel` or "Get started".
- If there are no plans, render nothing.

## Demo data

Plans: Monthly "Flexible billing" $10.59 /mo, 5 features, "Start monthly"; Yearly "Best value" $8.59 /mo, badge "Save 19%", 7 features, "Start yearly"; Lifetime "Pay once, keep it" $90.59 one-time, 8 features, "Get lifetime access". Features: A finance advisor on call, Unlimited auto tracking, Next-day transaction clearing, Priority customer support, Two-person approval on payouts, 24/7 technical support, Unlimited team accounts, Custom API access.

## Accessibility

- Each feature has a visually hidden " (included)" / " (not included)" suffix; icons are `aria-hidden`.
- The price wrapper is `aria-live="polite"`; the animated digits are `aria-hidden` with a plain `sr-only` copy of the price.
- Respect `prefers-reduced-motion` everywhere as above.

## Acceptance checklist

- [ ] Monthly is selected on load with 5 of 8 features ticked and the bar at 62.5%.
- [ ] Choosing Yearly slides the ring, ticks two more features in a cascade and rolls the price to 8.59.
- [ ] The CTA label rolls to the new plan's label.
- [ ] Arrow keys move between plans like any native radio group, with a visible focus outline.
- [ ] Below `lg` the plans sit above the features; `layout="desktop"` keeps two columns.
- [ ] `theme="midnight"` and `ember` stay dark regardless of page mode; `ivory` follows `.dark`.
- [ ] `theme="custom"` with `accentColor` recolours ring, dot, checks, bar and button.
- [ ] Badges and CTA hide with `showPlanBadges={false}` / `showCTA={false}`.
- [ ] With reduced motion, changes fade without movement and the price jumps.
