# Tip & Rate

Build a post-delivery feedback card: springy stars with a rolling verdict label, a segmented tip control and a tick slider that stay in sync, toggleable compliment chips, and a send button whose label rolls through states before the card turns into a thank-you. It should feel warm and tactile, like a native iOS sheet.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, `layoutId`, `layout`), lucide-react (`Check`, `Heart`, `Loader2`, `Star`).
- File: `components/checkout-moments/tip-and-rate.tsx`, named export `TipAndRate`, plus `TipAndRateProps`.
- Build the tick slider as a small internal component (see below).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `courier` | `string` | `"Maya Chen"` | Name; first name in the title, up to two initials in the avatar. |
| `detail` | `string` | `"Delivered your order in 18 min"` | Line under the title. |
| `orderTotal` | `number` | `4200` | Order total in cents. |
| `presets` | `number[]` | `[0.1, 0.15, 0.2]` | Tip fractions of the order total. |
| `maxTip` | `number` | `20` | Slider maximum in whole units. |
| `currency` | `string` | `"$"` | Symbol. |
| `compliments` | `string[]` | `["On time","Friendly","Careful packing","Great directions"]` | Toggle chips. |
| `onSubmit` | `(f: { rating; tip; compliments }) => Promise<void> \| void` | waits 1100ms | Resolve → thank-you; reject → back to form. |
| `className` | `string` | — | Extra classes on the card. |

## Layout and look

- Card: `section aria-label="Rate your delivery with {courier}"`, `max-width: 400px`, radius 28px, padding 24px; light `#fff` + `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark `#1c1c1e` + `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -24px rgba(0,0,0,.7)`. Ink `#1d1d1f` / `#f5f5f7`, muted `#6e6e73` / `#a1a1a6`, hairline `black/8%` / `white/10%`.
- Header: 44px avatar circle (bg `#e8e8ed`, 14px semibold `#1d1d1f`; dark `#3a3a3c` / `#f5f5f7`) with initials; title "How was it with {first}?" 17px semibold, tracking −0.02em; detail 13px muted.
- Stars (20px below): five 40px round buttons, 2px gap, each a 28px `Star` (stroke 1.75). Lit (hovered or rated) stars are filled and stroked `#ff9500`; unlit `#d2d2d7` / dark `#48484a`, 150ms colour transition. To the right (8px gap) a 14px medium label: "Tap to rate" (muted) or Not great / Could be better / Good / Great / Perfect for the shown value.
- Tip section: top hairline, 20px above and inside. Row: "Add a tip" 15px semibold left, amount 24px semibold tracking −0.03em right (rolling money).
- Segmented control (12px below): 4 columns — None plus each preset — in a track radius 12px, bg `#e8e8ed` / `#3a3a3c`, 3px padding. Each button 44px tall, radius 9px, 13px semibold; preset buttons show "10%" over a 11px medium "$4". Inactive text `#6e6e73` (hover ink), active ink. Active background is a shared white pill (dark `#636366`) with `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`.
- Tick slider (16px below): label "Custom tip" 13px medium muted above; 58 ticks, each 2px wide × 18px tall, 4px apart, rounded, coloured with the accent `#0071e3`; ticks at or below the value are opaque, the rest 20% opacity. Track height ~34px, `cursor: ew-resize`. No numeric readout.
- Compliments (20px below): wrapping list, 6px gap, of 32px pills, 12px horizontal padding, 13px medium, hairline border; selected = transparent border, bg `#0071e3` at 10% (dark `#2997ff` at 15%), text `#0066cc` / `#2997ff`, with a 14px check (stroke 2.5) sliding in before the text.
- Send button (24px below): full width, 48px, fully rounded, `#0071e3` bg (hover `#0077ed`), white 17px medium, `active:scale(.97)`; disabled bg `#e8e8ed` text `#86868b` (dark `#2c2c2e` / `#98989d`).
- Done state: centred, 24px vertical padding: 64px circle `#ff3b30` at 12% holding a filled 28px red `Heart`; "Thanks for the love" 20px semibold; "{first} gets all {tip} of your tip." or "We’ll pass your note on to {first}." 14px muted, max 280px; ghost "Edit feedback" (link blue, 14px medium) returns to the form with values kept.

## Motion

- Shared UI spring: stiffness 420, damping 34.
- Stars: `whileTap scale .8`; when rated, each filled star pops `scale [1, 1.28, 1]` over 0.38s, ease `[0.22,1,0.36,1]`, delayed `(n − 1) × 0.045s` (a left-to-right ripple).
- Verdict label, tip amount digits, and button label all roll: enter from `y 100%, opacity 0, blur(4px)`, exit to `y −100%`, `AnimatePresence mode="popLayout"`, UI spring (money digits use 460 / 34 with a 0.02s right-to-left stagger).
- Segmented pill: shared `layoutId`, UI spring.
- Ticks: fill fraction animates with spring 380 / 34 (instant while dragging); ticks within ~3 pitches of the pointer grow (Gaussian, `scaleY` up to 1.55) through a spring 420 / 30.
- Chips: `layout` with UI spring, `whileTap scale .95`; the check animates `width 0 → auto`, opacity 0 → 1.
- Form ↔ done: outer `layout` spring 260 / 32; inner swap from `opacity 0, y 12, scale .98, blur(6px)` to `y −10`, spring 380 / 34. Heart springs from `scale .4, rotate −12` with stiffness 380, damping 14 (bouncy).

## Interaction and states

- Rating 0 until a star is clicked; hover previews stars and label, leaving the row resets the preview.
- Tip is in whole units. Initial tip = `round(orderTotal × presets[1] / 100)` ($6 by default). A preset sets `round(orderTotal × p / 100)`; the slider sets any integer 0–`maxTip`; the matching preset highlights whenever the values coincide.
- Button label: "Rate to continue" (disabled) → "Send feedback and $6.00" when tip > 0, "Send feedback" at 0 → spinner + "Sending…" (disabled) while `onSubmit` runs.
- On resolve show done; on reject return to the form.
- Slider keys: arrows ±1, PageUp/Down ±max(1, range/10), Home/End.

## Demo data

Maya Chen, delivered in 18 min, $42.00 order: presets 10% $4, 15% $6, 20% $8; slider to $20; four compliments.

## Accessibility

- Stars are a `role="radiogroup"` labelled "Rating"; each is `role="radio"` with `aria-checked` and "N star(s)". The verdict label is `aria-live="polite"`.
- Presets are a `role="group"` "Tip presets" of buttons with `aria-pressed`.
- Slider: `role="slider"` with `aria-valuemin/max/now`, labelled by "Custom tip".
- Compliments list `aria-label="Compliments"`, each chip `aria-pressed`.
- Every control shows a 2px `#0071e3` focus outline offset 2px. Reduced motion: no pops or blur; rolls become 0.12s fades; tick magnify off.

## Acceptance checklist

- [ ] Hovering stars previews colour and label; clicking 4 ripples the first four stars and shows "Great".
- [ ] Send is disabled reading "Rate to continue" until a rating exists.
- [ ] 15% is preselected and the header reads $6.00.
- [ ] Clicking 20% slides the white pill and rolls the amount to $8.00.
- [ ] Dragging the slider to 8 re-highlights 20%; to 7 un-highlights all presets.
- [ ] Ticks near the pointer grow in a smooth wave.
- [ ] Toggling a chip slides a check in and tints it blue.
- [ ] Sending shows a spinner, then the bouncing heart and "Maya gets all $8.00 of your tip."
- [ ] "Edit feedback" returns with rating, tip and chips intact.
- [ ] Dark mode colours match the spec.
