# Pay & Confirm

Build a compact checkout card that is paid by sliding: a stepper and two delivery options update a total whose digits roll, a slide-to-confirm track runs the payment, and the card cross-fades into a receipt while a toast confirms it below. It should feel like an Apple Pay sheet: quiet, precise, springy, never flashy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, `layoutId`, `layout`), lucide-react icons (`CreditCard`, `Lock`, `Minus`, `Plus`, `RotateCcw`).
- File: `components/checkout-moments/pay-and-confirm.tsx`, named export `PayAndConfirm`; also export `PayAndConfirmProps`, `CheckoutProduct` and `ShippingOption`.
- Two helper controls live alongside it (build them as small components): a slide-to-confirm track and a toast stack with a `useToastStack()` hook (`push`, `dismiss`, `clear`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `merchant` | `string` | `"Studio Supply"` | Shop name in the header; its first letter fills the badge. |
| `product` | `CheckoutProduct` | Ceramic Pour-Over Set, "Sand · 2 cups", 6400, gradient swatch | `{ name, variant?, price (cents), swatch?, image? }`. |
| `shipping` | `ShippingOption[]` | Standard "3–5 days" 0; Express "Tomorrow" 1200 | `{ id, label, eta, price (cents) }`. |
| `taxRate` | `number` | `0.08` | Fraction applied to the subtotal. |
| `cardLast4` | `string` | `"4242"` | Saved card digits. |
| `currency` | `string` | `"$"` | Symbol before amounts. |
| `onPay` | `(totalCents) => Promise<void> \| void` | waits 1400ms | Runs when the slider completes. Reject to let the visitor retry. |
| `receiptEmail` | `string` | `"you@studio.co"` | Named in the success toast. |
| `className` | `string` | — | Extra classes on the outer column. |

Default swatch: `linear-gradient(135deg,#f3e3cf 0%,#d9b99b 55%,#b98b6a 100%)`.

## Layout and look

- Outer column: flex column, centred, `max-width: 400px`, full width, 16px gap (card above, toast stack below).
- Card: `section` with `aria-label="Checkout with {merchant}"`, radius 28px, padding 24px, `overflow: hidden`. Light bg `#fff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -24px rgba(0,0,0,.7)`. Ink `#1d1d1f` / `#f5f5f7`, muted `#6e6e73` / `#a1a1a6`, hairlines `black/8%` / `white/10%`.
- Header: 32px round badge (bg `#1d1d1f`, white 13px semibold initial; dark inverted `#f5f5f7` with `#1d1d1f` text), merchant 14px semibold over "Checkout" 12.5px muted; right side a 14px `Lock` icon + "Secure" in 12.5px muted.
- Product row (24px below): 56px thumbnail, radius 14px, inset hairline `inset 0 0 0 1px rgba(0,0,0,.06)`, background = image (cover) or swatch. Name 15px semibold truncate, variant 13px muted. Quantity pill on the right: bg `#f5f5f7` / dark `#2c2c2e`, 2px padding, two 28px round icon buttons (14px `Minus`/`Plus`, hover bg white / dark `#3a3a3c`, `active:scale-90`, disabled at 30% opacity) around a 24px-wide 14px semibold tabular number.
- Delivery (`fieldset`, 20px below): legend "Delivery" 12.5px medium muted; a 2-column grid, 8px gap, of `label` cards: radius 16px, 12px padding, hairline border; label 13.5px semibold, "{eta} · {price or Free}" 12.5px muted. Active card: transparent border, bg `#0071e3` at 4% (dark `#2997ff` at 8%), plus a ring element `inset 0 0 0 2px #0071e3` at `-1px` inset. Hidden real radio inputs (`sr-only`); a focused radio shows a 2px `#0071e3` outline on its label via `:has(:focus-visible)`.
- Totals (`dl`, 20px below, top hairline, 16px padding-top, 8px row gap): Subtotal, Shipping (or "Free"), Tax rows in 14px (term muted, value tabular). Total row: "Total" 15px semibold, amount 28px semibold, tracking −0.03em, using the rolling money component.
- Card row: rounded 16px well (`#f5f5f7` / `#2c2c2e`), 14px × 10px padding, `CreditCard` 16px muted + "Card •••• {last4}" 13.5px, "Default" 12.5px muted on the right.
- Slider slot (16px below), full card width, measured with a ResizeObserver (fallback 352px) and passed as the track width.
- Paid state: centred column, 16px vertical padding: success mark (56px disc, `#34c759` at 15% alpha, 28px check `M5 12.5l4.5 4.5L19 7.5`, stroke 2.6, round caps), "Payment complete" 20px semibold, "{total} to {merchant} · Receipt #NNNNNN" 14px muted, a 16px-radius well (bordered hairline, bg `#f5f5f7` / `#2c2c2e`, 16px padding) listing product × qty and "Arrives {eta}", then a ghost button (`RotateCcw` + "Start a new order", 14px medium, link blue `#0066cc` / `#2997ff`, hover tint 8%/12%).
- Slide track: height 56px, knob 48px, padding 4px, full rounded, white with inset hairline shadow (dark `white/7%`), knob bg `#0071e3` with white arrow; the trail behind the knob is accent at 7% opacity; the success wash is `#34c759`.
- Toasts: 64px tall, radius 18px, width `min(352, slotWidth)`, max 2 visible, white with hairline border (dark zinc-900), success icon emerald.

## Motion

- Rolling money: each character after the symbol is its own overflow-hidden slot, keyed from the right; changes enter from `y: 100%, blur(4px)` and exit to `y: -100%`, spring stiffness 460, damping 34, delay `(len − 1 − i) × 0.02s` (rightmost first).
- Quantity number: same roll, spring 500 / 34, `AnimatePresence mode="popLayout"`.
- Delivery ring: shared `layoutId` element, spring 420 / 34.
- Step swap (order ↔ paid): an outer `motion.div layout` (spring 260 / 32) wraps `AnimatePresence mode="popLayout"`; enter from `opacity 0, y 12, scale .98, blur(6px)`, exit to `y −10`, spring 380 / 34.
- Success mark: disc springs from `scale .5` (420 / 18); check draws `pathLength 0 → 1`, spring 200 / 26, delay 0.12s.
- Slider: knob follows the pointer with rubber-banding past the ends (×0.2 before 0, ×0.15 past max); release springs (420 / 34) back, or to the end if past 90% or a >900px/s flick past 60%. Label fades out over the first 38% of travel and drifts 18px right; idle label has a shimmer gradient sweeping `backgroundPositionX 100% → −150%` over 2.4s, repeat delay 0.4s. Knob scales to 0.94 while dragging. Icons (arrow → spinner → check) swap with spring 520 / 26 from `scale .4, rotate −40`. Success wash fades in over 0.35s.
- Toasts enter from `y +28, scale .94` and stack with 11px peeks, scaling `1 − i × 0.05`; spring 420 / 34.

## Interaction and states

- Quantity 1–9; minus disabled at 1, plus at 9. Total = `price × qty + shipping + round(subtotal × taxRate)`.
- Slider label: "Slide to pay {total}", pending "Processing…", success "Paid"; never auto-resets.
- On complete: await `onPay(total)`; then after 700ms set the paid state with a random 6-digit receipt and push a success toast "Payment received" / "Receipt #… sent to {email}" with a "View" action. If `onPay` rejects, the knob springs back and shakes `[0,−7,6,−4,3,0]` over 0.42s.
- "Start a new order" returns to the order and clears toasts. Toasts can be swiped away (>90px or >600px/s) or closed.

## Demo data

Defaults only: Studio Supply, one Ceramic Pour-Over Set at $64.00, Standard free / Express $12, 8% tax, card 4242; total starts at $69.12.

## Accessibility

- Quantity is a `role="group"` labelled "Quantity"; buttons "Remove one" / "Add one"; the number is `aria-live="polite"`.
- Delivery uses real radio inputs in a `fieldset` with a legend.
- Slider is `role="slider"` with `aria-valuenow` 0–100 and `aria-valuetext` (percent, pending, success); Enter/Space holds-to-slide (0.85s across), arrows step 25%, Home/End.
- Money exposes the full amount as `aria-label`; animated digits are `aria-hidden`.
- With reduced motion, all rolls/blurs become 0.12s fades and springs jump.

## Acceptance checklist

- [ ] Card is 400px max, radius 28px, correct in light and dark.
- [ ] Plus/minus rolls the quantity and every affected amount; plus stops at 9.
- [ ] Choosing Express slides the blue ring across and adds $12.00.
- [ ] Total digits roll right-to-left with a slight blur.
- [ ] Dragging the knob less than 90% springs it back; past 90% shows "Processing…".
- [ ] About 0.7s after payment the card morphs height into "Payment complete" with a drawing check.
- [ ] A success toast appears under the card naming the receipt and email.
- [ ] "Start a new order" restores the form and removes toasts.
- [ ] The slider is fully operable with the keyboard.
- [ ] Reduced motion removes roll, blur and shimmer effects.
