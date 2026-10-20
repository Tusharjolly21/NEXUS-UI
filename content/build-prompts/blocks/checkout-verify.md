# Verify Payment

Build a 3-D Secure style approval card: a one-time-code field with a resend countdown, a running count of wrong attempts, a locked state after too many misses, and an approved receipt with a draining progress bar. It should feel calm and trustworthy, like a bank sheet that slides into place, with small springy feedback on every keystroke.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`), lucide-react (`ShieldCheck`, `RotateCcw`, `Check`).
- File: `components/checkout-moments/verify-payment.tsx`, named export `VerifyPayment`, plus `VerifyPaymentProps`.
- Build the code field as its own small component (`OneTimeCode`) used inside the card.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `destination` | `string` | `"•••• 42"` | Masked destination of the code. |
| `merchant` | `string` | `"Studio Supply"` | Shown in the amount pill and success copy. |
| `amount` | `number` | `12840` | Amount in cents. |
| `currency` | `string` | `"$"` | Symbol before amounts. |
| `length` | `number` | `6` | Digits in the code. |
| `verify` | `(code) => Promise<boolean> \| boolean` | waits 900ms, accepts `"424242"` | Resolve `true` to approve. |
| `onResend` | `() => void` | — | Called on Resend code. |
| `resendAfter` | `number` | `30` | Seconds before resend unlocks. |
| `maxAttempts` | `number` | `3` | Wrong codes before locking. |
| `hint` | `string` | — | One line under the field. |
| `onApproved` | `() => void` | — | Called when approved shows. |
| `onCancel` | `() => void` | — | Cancel button. |
| `className` | `string` | — | Extra classes on the card. |

## Layout and look

- Card: `section aria-label="Confirm your payment"`, `max-width: 400px`, radius 28px, padding 24px. Light `#fff` with `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -24px rgba(0,0,0,.7)`. Ink `#1d1d1f` / `#f5f5f7`; muted `#6e6e73` / `#a1a1a6`.
- Top row: a 44px tile, radius 14px, with a 20px `ShieldCheck` (stroke 1.75): blue `#0071e3` on 10% blue (dark `#2997ff` on 15%); red `#ff3b30` on 10% red when locked (300ms colour transition). Right: pill `{amount} · {merchant}`, 12.5px medium tabular, bg `#f5f5f7` / `#2c2c2e`, 12px × 4px padding.
- Title (20px below) 20px semibold, tracking −0.02em: "Confirm it’s you" or "Too many tries". Body 14px muted, relaxed leading: "Enter the {length}-digit code we sent to {destination}." or "For your safety this code no longer works. Ask for a new one to continue."
- Code field centred, 24px below; locked state dims it to 40% and disables pointer events.
- Code cells: 44px wide (48px from `sm`), 56px tall, radius 14px, 1px border `black/9%` (dark `white/10%`), bg white / `#17171d`, 22px semibold tabular, shadow `0 1px 2px rgba(16,17,20,.06), 0 4px 12px -6px rgba(16,17,20,.12)`. 8px gap; with 6 digits a 6px grey dot (`neutral-300` / `neutral-600`) separates groups of three. Active cell: transparent border, `0 0 0 2px #0071e3, 0 10px 22px -10px rgba(16,17,20,.35)`. Error: `red-400` border and red text over a 10% red fill. Success: `green-600` fill sweeping in, white digits, then a 28px green check badge pops 40px to the right.
- Status line: 20px tall, 12px below, centred 13px: red "That code didn’t match. {n} tries left." (singular "try") after a miss, otherwise the muted hint.
- Footer: top hairline, 16px padding-top, 20px above. Left a ghost "Cancel" (link blue `#0066cc` / `#2997ff`, 14px medium, 36px tall). Right either "Resend code in 0:SS" (13px muted tabular) or a ghost "Resend code"; when locked that button becomes a filled `#0071e3` pill with white text.
- Approved: centred column, 24px vertical padding: success mark (56px disc of `#34c759` at 15%, 28px drawn check), "Payment approved" 20px semibold, "{amount} to {merchant}. You can close this window." 14px muted, a 160×4px track (`#e8e8ed` / `#3a3a3c`) filling with `#34c759`, "Returning you to {merchant}…" 12.5px muted, and a ghost "Try again" with `RotateCcw`.

## Motion

- Step swap between entry/locked/approved: outer `layout` spring 260 / 32; inner `AnimatePresence mode="popLayout"` entering from `opacity 0, y 12, scale .98, blur(6px)`, exiting to `y −10`, spring 380 / 34.
- Shield shake on every wrong attempt (re-keyed by the attempt count): `x: [0,−6,6,−4,4,0]` over 0.4s.
- Cells: active cell lifts `y −3` (spring 500 / 30). Digits enter from `y −14, scale .7` (spring 600 / 26) and exit to `y 10, scale .8` in 0.12s. Caret: 2×24px bar in the accent, opacity `[1,1,0,0]` at `[0,.5,.55,1]` over 1.05s, infinite.
- Pending: a light gradient sheen sweeps each cell `x −100% → 100%`, 0.9s easeInOut, infinite, delayed `i × 0.07s`.
- Error: the row shakes `[0,−10,9,−7,6,−3,2,0]` over 0.5s, then clears after 900ms.
- Success: each cell's green fill fades in over 0.25s, delayed `i × 0.06s`; the check badge springs from `scale 0, rotate −45` (500 / 20) after `length × 0.06s`.
- Status message: in from `opacity 0, y 6, blur(4px)`, spring 420 / 34, `AnimatePresence mode="wait"`.
- Approved bar: width 0 → 100% over 2.4s linear. Success check draws with spring 200 / 26, delay 0.12s.

## Interaction and states

- States: `entry`, `locked`, `approved`. A `round` counter remounts the code field after a resend.
- When the field fills, call `verify`. True: after 650ms show approved and call `onApproved`. False: increment attempts; at `maxAttempts`, lock after 500ms.
- Countdown starts at `resendAfter`, ticks every second; Resend calls `onResend`, restarts the countdown, zeroes attempts, remounts the field and returns to entry.
- Field: one transparent real `<input>` over the cells (`inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength=length`); digits only; arrows/Home/End move the active cell, Backspace/Delete edit in place; paste and autofill work. Read-only while pending or verified.

## Demo data

Hint "Demo code: 424242". The correct code is 424242; any other six digits count as wrong. Amount $128.40 to Studio Supply, code sent to "•••• 42".

## Accessibility

- The input carries `aria-label="Verification code sent to {destination}"` and `aria-invalid` on error; a visually hidden live region says "Checking code", "That code didn't work" or "Code verified".
- The attempts/hint line is `aria-live="polite"`. Icons are `aria-hidden`.
- All buttons are real `type="button"` with a 2px `#0071e3` focus outline offset 2px.
- Reduced motion: shakes and lifts are skipped, swaps become 0.12s fades, the progress bar fills instantly.

## Acceptance checklist

- [ ] Six cells in two groups of three with a dot between.
- [ ] Letters are ignored; pasting "42 42 42" fills the field.
- [ ] A wrong code shakes the row and the shield and shows "2 tries left."
- [ ] Three wrong codes turn the shield red, dim the field and show a filled Resend button.
- [ ] Resend restores a fresh field and restarts the 0:30 countdown.
- [ ] 424242 sweeps the cells green, pops a check, then morphs into "Payment approved".
- [ ] The approved bar fills over 2.4s; "Try again" returns to entry.
- [ ] Dark mode uses `#1c1c1e` card, `#17171d` cells and `#2997ff` shield.
- [ ] Keyboard alone can enter, correct and submit a code.
