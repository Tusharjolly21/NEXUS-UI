# Spotlight Pricing Cards

Build a three-card pricing section where the middle plan is a dark, taller "spotlight" card between two pale ones. A monthly/yearly segmented control swaps prices and periods with a short lift-and-blur, staggered across cards. It should feel bold but restrained, like an Apple product comparison.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, `layoutId`, variants), lucide-react (`Check`).
- File: `components/blocks/pricing-section/billing-pricing-variants.tsx`, named export `SpotlightPricingCards`. It shares the billing toggle, switching text, feature row and section header helpers with the other pricing sections in that file.

## API

Every prop is optional; with none the section renders exactly as described below. Export the props type as `SpotlightPricingCardsProps`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"One assistant, three ways to run it"` | Main heading. |
| `description` | `string` | `"Start on Hobby for free for 14 days. Every plan keeps your history when you move up."` | Paragraph under the heading. |
| `accentColor` | `string` | — | Primary button fill (hover mixes 12% white), focus rings, check icons and highlights (including the pale checks on the dark card). Unset keeps `#0071e3`, with `#2997ff` text/checks in dark mode; only overridden when set. Plain colour values only (hex, `rgb()`, `hsl()`, names). |
| `defaultCycle` | `"monthly" \| "yearly"` | `"monthly"` | Billing period on mount. |
| `savingsNote` | `string` | `"Save about 20% when you pay yearly."` | Small grey line under the toggle; empty string hides it. |
| `showBillingToggle` | `boolean` | `true` | Show the toggle and its note. When `false`, prices stay on `defaultCycle`. |
| `featuresHeading` | `string` | `"Includes"` | Small heading above each feature list; empty string hides it. |
| `plans` | `SpotlightPricingPlan[]` | `DEFAULT_SPOTLIGHT_PRICING_PLANS` | Cards, first 6 used. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Exported plan shape `SpotlightPricingPlan`: `{ label; copy; monthly: string; yearly: string; periodMonthly; periodYearly; action; featured?: boolean; features: string[]; hidePeriod?: boolean }`. `hidePeriod` defaults to `true` when the monthly value is `"Custom"`, so that plan hides its period. Features are capped at 12. The demo data below is exported as `DEFAULT_SPOTLIGHT_PRICING_PLANS`. All text from props renders as plain text.

## Layout and look

- Section: full width/height, centred flex, overflow hidden, background `#ffffff` (dark `#000000`), text `#1d1d1f` (dark `#f5f5f7`), 56px vertical and 16px horizontal padding. Content `max-width: 1000px`.
- Header (centred, `max-width: 36rem`, 40px below):
  - h2 "One assistant, three ways to run it": 32px (40px from `sm`), semibold, leading 1.08, tracking −0.03em, balanced.
  - Paragraph 17px leading 1.5 `#6e6e73` (dark `#a1a1a6`), 12px above: "Start on Hobby for free for 14 days. Every plan keeps your history when you move up."
  - 24px below: billing toggle, then "Save about 20% when you pay yearly." 13px `#86868b` (dark `#98989d`) 8px below it.
- Toggle: radius 10px, 3px padding, `#e8e8ed` (dark `#3a3a3c`), 14px; options 32px tall, min-width 96px, 16px padding, radius 8px, medium; active `#1d1d1f` / `#f5f5f7`, inactive `#6e6e73` / `#a1a1a6`. Sliding pill white (dark `#636366`), radius 8px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`.
- Grid: 16px gap, items stretch, one column, three from `md`.
- Pale card: flex column, `min-height: 460px`, radius 28px, padding 28px, `#f5f5f7` (dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)`).
- Spotlight card: `#1d1d1f` background, `#f5f5f7` text, shadow `0 30px 60px -30px rgba(0,0,0,.5)`. From `md` it gets negative 12px vertical margin and 40px vertical padding so it stands taller than its neighbours. Dark mode: `#2c2c2e` with `0 0 0 1px rgba(255,255,255,.12)`.
- Card content top to bottom:
  - Name 21px semibold tracking −0.02em.
  - Copy 8px below, 14px leading 1.5, min height 42px; muted `#6e6e73` (dark `#a1a1a6`), or `white/60` on the spotlight.
  - Price row 32px below, baseline, 6px gap: amount 44px semibold leading 1 tracking −0.035em tabular; period 14px muted (`white/50` on the spotlight).
  - Button 28px below: 44px tall, full width, rounded-full, 15px medium. Spotlight uses primary `#0071e3` / white (hover `#0077ed`). Pale cards use white with `#1d1d1f` text, hover `white/70` (dark `#2c2c2e`, `#f5f5f7` text, hover `#3a3a3c`). Focus outline 2px `#0071e3`, offset 2px.
  - Divider: 28px margin top and bottom, 1px border `rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`), `white/12` on the spotlight.
  - "Includes" 13px semibold muted (`white/60` on the spotlight), 12px below it the list.
  - List: items 10px apart, 14px leading 1.45, 10px gap, 16px check (stroke 2.25, 2px top offset) in `#0071e3` (dark `#2997ff`); on the spotlight, text `white/80` and checks `#2997ff`.

## Motion

- Entrance once when 80px into view: container stagger 0.07s after 0.04s; header lines and cards from `opacity 0, y 16, blur(6px)`, spring `{stiffness 260, damping 30}`.
- Toggle pill: shared `layoutId` (namespaced with `useId`), spring `{stiffness 420, damping 34}`.
- Price swap: `AnimatePresence mode="popLayout" initial={false}` keyed by the value; enter from `y 100%, opacity 0, blur(6px)`, exit to `y -100%` with the same blur; spring `{stiffness 380, damping 32}`, delay `index × 0.04s`. Period swaps the same way at `index × 0.04 + 0.03s`. "Custom" does not move because its key stays the same.
- Buttons press to `scale 0.97`.
- Reduced motion: opacity-only (0.2s entrance, 0.15s swaps), no stagger, instant pill.

## Interaction and states

- Local billing state, `"monthly"` first. Toggle: `role="radiogroup"` labelled "Billing frequency", two `role="radio"` buttons with `aria-checked`.
- Buttons are `type="button"` with no built-in action.

## Demo data

- Hobby: $199/month, $1,910/year. "For indie makers trying out AI for the first time." Button "Start a free trial". 120 projects per month; Unlimited workspaces; Two model choices; History and export; Email support; 1 member seat.
- Pro (spotlight): $499/month, $4,790/year. "For teams that need more power and flexibility." "Get started". Unlimited projects; Unlimited workspaces; Every model included; History and export; Priority support; 10 member seats.
- Enterprise: Custom. "For large organizations with custom needs." "Contact sales". Everything in Pro; Custom integrations; A named account manager; SSO and SAML; 24/7 phone support; Unlimited member seats.

## Accessibility

- One h2, h3 per plan; check icons `aria-hidden`.
- Muted text on the dark card stays at or above 60% white for legibility.
- Toggle exposes state through `aria-checked`; all buttons have a visible focus outline.

## Acceptance checklist

- [ ] Middle card is near-black and visibly taller than its neighbours from `md` up.
- [ ] On phones the three cards stack with no negative margins.
- [ ] Switching to Yearly rolls $199 → $1,910 and $499 → $4,790, then the periods.
- [ ] Enterprise shows "Custom" with no period and does not animate.
- [ ] "Includes" sits under a divider in each card.
- [ ] The spotlight button is blue; the others are white on the pale cards.
- [ ] Dark mode: black page, `#1c1c1e` pale cards, `#2c2c2e` spotlight with a hairline ring.
- [ ] Reduced motion swaps by fading only.
