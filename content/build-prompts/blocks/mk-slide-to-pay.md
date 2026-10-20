# Slide to Pay

Build a two-panel checkout section: a bag on the left whose quantities, promo code and totals all animate, and a payment panel on the right with saved demo cards and a dark slide-to-pay track that ends in a receipt. It should feel like a premium Apple Store checkout: every number rolls, nothing jumps, and paying is a deliberate gesture rather than a tap.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`).
- File: `components/slide-to-pay/slide-to-pay.tsx`, named export `SlideToPay`; export `SlideToPayProps` and `SlideToPayItem`.
- No icon library; the arrow and check are inline SVG.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | — (Apple blue `#0071e3`, `#0a84ff` in dark) | Slider fill, card ring, focus rings, "Run it again". Set as CSS variable `--mk-a`. |
| `items` | `SlideToPayItem[]` | two items (below) | `{ id, name, meta, price (dollars), qty, art (CSS background) }`. |
| `promoCode` | `string` | `"MOTION10"` | Code that takes 10% off, case-insensitive. |
| `onPay` | `(d: { total: number; card: string }) => void` | — | Called when the slide completes. Nothing is charged. |
| `autoplay` | `boolean` | `false` | Nudges the slider every 3.2s until the visitor touches the section. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg `#f5f5f7` / dark `#000`, padding `clamp(48px,8vw,80px)` vertical, 16px (20px from `sm`) horizontal.
- Grid: max 1040px centred; one column, two from `lg` at `1.2fr 1fr`; gap 16px (20px from `sm`).
- Panels: radius 28px, white with `0 0 0 1px rgba(0,0,0,.05)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)`. Padding 20px, 32px from `sm`. Ink `#1d1d1f` / `#f5f5f7`; muted `#6e6e73` / `#a1a1a6`; wells `#f5f5f7` / `#2c2c2e`.
- Bag panel: "Your bag" `clamp(22px,3vw,26px)` semibold, tracking −0.03em. List rows (16px vertical padding, bottom hairline `black/6%` / `white/10%`): 56px art tile (64px from `sm`), radius 16px; name 15px (16px `sm`) semibold truncate; "{meta} · ${price}" 13px muted; a stepper pill (well bg, 4px padding) with two 40px white round buttons (dark `#3a3a3c`, 17px "−"/"+", shadow `0 1px 2px rgba(0,0,0,.1)`) around a 20px-wide 14px semibold quantity. Empty: "Your bag is empty." 15px muted.
- Promo form (24px below): input 44px tall, radius 12px, well bg, 16px text (15px from `sm`, avoids iOS zoom), uppercase, placeholder "Promo code (try MOTION10)" in normal case `#a1a1a6`; focus ring 2px accent; invalid ring 2px `#ff3b30` (dark `#ff453a`). Button 44px, radius 12px, 20px padding, 14px medium: "Apply" on `#1d1d1f` white text (dark inverted), "Applied" on `#248a3d` (dark `#30d158` with black text). Max 24 characters.
- Totals (24px below), 15px muted rows with ink values: Subtotal; promo line in green `#248a3d` / `#30d158` "MOTION10 −$x"; Shipping ("Free" or $9.00); Tax.
- Pay panel: flex column, 20px gap. "Total" 13px medium muted over the amount `clamp(36px,6vw,44px)` semibold, leading 1, tracking −0.045em.
- Card radios: two 56px-min rows, radius 16px, well bg, 14px padding: a 48×32 brand tile (radius 6px, 10px bold white text: VISA on `#1a1f71`, MC on `#eb001b`), "Visa •••• 4242" / "Mastercard •••• 8810" 14px semibold, "Saved demo card · Expires 08/28" 12px muted. Selected ring: `inset 0 0 0 2px var(--mk-a)`.
- Slider pinned to the bottom (`mt-auto`): 56px tall full-rounded track `#1d1d1f` (dark `#2c2c2e`); accent fill from the left equal to knob x + 52px; centred white label "Slide to pay $X.XX" (`clamp(13px,3.6vw,15px)` medium, 48px left padding) with a skewed 40px white/50% shine sweeping across; a 48px white knob at 4px inset with a dark 18px arrow (`M5 12h14M13 6l6 6-6 6`, stroke 2.6), shadow `0 4px 12px rgba(0,0,0,.3)`. When the total is 0: a 56px well pill "Add something to pay".
- Footer note 12px centred `#86868b` / `#8e8e93`: "Demo only. No payment is taken."
- Receipt: centred column, 16px gap, 32px vertical padding: 80px circle green `#30d158` at 15% (dark 20%) with a 36px check `#248a3d` / `#30d158`; "Paid $X.XX" 24px semibold; "Paid with {card}. A receipt is on its way and your order ships tomorrow." 15px muted max 260px; "Run it again" 14px medium accent text button.

## Motion

- Money: each character keyed from the right in its own slot; enter from `y −100%`, exit to `y 100%`, spring 420 / 30, `mode="popLayout"`.
- Rows: `layout`, enter `height 0 → auto`, exit `height 0, x −40, opacity 0`, spring 300 / 30. Quantity number: in from `y −14`, out to `y 14`. Steppers `whileTap scale .85`.
- Promo: wrong code shakes the form `x: [0,−8,7,−5,3,0]` over 0.4s and shows the red ring for 900ms. Promo line expands `height 0 → auto`.
- Card ring: shared `layoutId`, spring 500 / 34, inside a `LayoutGroup` with a per-instance id.
- Slider: label opacity maps 1 → 0 over the first half of travel. Release past 85% springs to the end (400 / 30) and finishes after 250ms; otherwise springs home (500 / 30). Enter/Space on the knob finishes with spring 300 / 30 and a 300ms delay. Knob `whileTap scale .94`; drag elastic 0.02, no momentum. Shine: `x −60 → 220` over 1.8s, repeat delay 0.6s.
- Autoplay hint: every 3.2s, if idle at 0, knob animates `[0, 64, 0]` over 1.1s, times `[0,.45,1]`, ease `[0.32,0.72,0,1]`.
- Pay → receipt: `AnimatePresence mode="wait"`; pay view exits `opacity 0, scale .96, blur(6px)`; receipt springs in from `scale .9` (260 / 22); the circle pops from 0 (400 / 14); check draws `pathLength 0 → 1` over 0.5s after 0.25s.

## Interaction and states

- Quantity clamps 0–9; reaching 0 removes the row.
- Totals: `sub = Σ price × qty`, `off = 10%` when promo applied, `ship = 0` if `sub − off > 100` or the bag is empty else 9, `tax = (sub − off) × 0.08`, `total = sub − off + ship + tax`.
- Promo matches `trim().toUpperCase()`; once applied, input and button disable.
- Finishing the slide shows the receipt and calls `onPay({ total (2 dp), card: "Visa •••• 4242" })`. "Run it again" returns to pay; bag state is kept.
- Any pointer-down or key-down on the section stops autoplay for good. The track width comes from a ResizeObserver (`offsetWidth − 56`).

## Autoplay demo

With `autoplay`, the knob peeks 64px right and springs back every 3.2s while untouched, inviting the slide. Disabled under reduced motion.

## Demo data

Studio Headphones, Graphite, $249 × 1, art `linear-gradient(140deg,#3a3a3c,#1d1d1f)`; Leather Case, Sand, $39 × 2, art `linear-gradient(140deg,#f2e6d0,#c9a77c)`. Subtotal $327, free shipping, tax $26.16, total $353.16.

## Accessibility

- Promo input has a visually hidden label and `aria-invalid` on a bad code.
- Cards are `role="radiogroup"` "Payment method" with `role="radio"` / `aria-checked`.
- Knob is a real button: `aria-label="Slide to pay $X. Press Enter to pay."`; keyboard pays without dragging. Quantity numbers are `aria-live="polite"`.
- Receipt has `role="status"`. Decorative SVGs are `aria-hidden`. Focus rings are 2px in the accent (white on the knob).

## Acceptance checklist

- [ ] Two columns from `lg`, stacked below, no horizontal scroll at 360px.
- [ ] "+" on the case rolls quantity, subtotal, tax and total.
- [ ] Dropping a row to 0 collapses and slides it out.
- [ ] A wrong promo shakes red; MOTION10 adds a green discount line and "Applied".
- [ ] Switching cards slides the accent ring.
- [ ] A short drag springs back; past 85% fills and shows the receipt with a drawing check.
- [ ] Enter on the focused knob pays.
- [ ] `accent="#ff375f"` recolours fill, ring and link.
- [ ] Autoplay nudges stop after the first interaction.
