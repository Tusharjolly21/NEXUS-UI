# OTP Input

Build a one-time-code field of separate digit boxes: a focus ring glides between boxes, digits spring into place, the boxes ripple while the code is checked, the row shakes on a wrong code, and on success the boxes fill with the accent and fold into a "Verified" pill. It should feel calm and Apple-like: crisp and springy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `layoutId`).
- File: `components/otp-input/otp-input.tsx`, named export `OtpInput` (also export the `OtpInputProps` type).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `length` | `number` | `6` | Number of digit boxes. Boxes split into two groups at the middle. |
| `verify` | `(code: string) => boolean \| Promise<boolean>` | `(c) => c === "482913"` | Runs once every box is filled; return true when valid. |
| `onVerified` | `(code: string) => void` | — | Called right after a code verifies. |
| `onResend` | `() => void` | — | Called when "Resend code" is pressed. |
| `autoplay` | `string` | — | If set, the component types this code by itself, on a loop, until the user interacts. |
| `accent` | `string` | `"#0071e3"` | Focus ring, caret, spinner arc, success fill and link colour. |

## Layout and look

- Root: vertical flex, centred, 24px gap. CSS variables (light / dark):
  box `#ffffff` / `#2c2c2e`, ink `#1d1d1f` / `#f5f5f7`, line `#d2d2d7` / `#48484a`, filled line `#aeaeb2` / `#7c7c80`.
- Row: 66px tall, `position: relative`, with an explicit pixel width = sum of (54 + gap after each box), so it keeps its width after the boxes leave and the pill stays centred. Gap after a box is 10px, 22px after the box at index `length/2 − 1`, 0 after the last.
- Box: 54×66px, radius 16px, centred content, background = box variable. Shadow: `inset 0 0 0 1px <line>, 0 1px 2px rgba(0,0,0,.04)`; when filled use the filled-line colour instead. Error: `inset 0 0 0 2px #ff3b30, 0 0 0 5px rgba(255,59,48,.10)`. Background colour transitions over 300ms.
- Digit: 30px, semibold, tight tracking, ink colour (white on success).
- Caret (empty active box): 2×30px rounded bar in accent.
- Focus ring: absolutely filling the active box, radius 16px, `inset 0 0 0 2px accent, 0 0 0 5px accent+"24"` (accent at ~14% alpha).
- Verified pill: absolutely centred in the row, 58px tall, `w-max`, fully rounded, left padding 10px, right 24px, 12px gap, 17px semibold. Light: bg `#1d1d1f`, text white; dark: bg `#f5f5f7`, text `#1d1d1f`. Shadow `0 20px 40px -16px rgba(0,0,0,.35)`. Inside, a 38px accent circle holding a 20px check (`M6 12.5l4 4L18 8.5`, white stroke 2.6, round caps/joins).
- Status line below: 44px tall, centred, 15px, colour `#6e6e73` / dark `#a1a1a6`.

## Motion

- Box enter: from `opacity 0, y 24, scale 0.85` to rest with spring stiffness 500, damping 30. Use `AnimatePresence initial={false}` so boxes don't animate on first mount, only when they come back after a reset.
- Focus ring moves between boxes as a shared `layoutId` element, spring stiffness 520, damping 38.
- Digit in: from `y 18, opacity 0, scale 0.4, blur(6px)` to rest; out: `y -14, opacity 0, scale 0.6, blur(4px)`; spring stiffness 520, damping 24; `AnimatePresence mode="popLayout"`, keyed by digit+index.
- Caret blink: opacity keyframes `[1,1,0,0]` at times `[0,.5,.5,1]`, 1s, infinite.
- Verifying: each box loops `y: [0,-8,0]`, 0.8s, easeInOut, infinite, delayed `i × 0.07s`.
- Error: shake the whole row with `x: [0,-14,12,-9,7,-4,0]` over 0.5s via animation controls.
- Success: box backgrounds turn accent with a CSS `transition-delay` of `i × 50ms` (left-to-right sweep); digits turn white.
- Done (650ms after success): boxes exit toward the centre — `x = (center − i) × 64` where `center = (length−1)/2`, `scale 0.3, opacity 0`, spring stiffness 260, damping 26, delay `|center − i| × 0.03s`. The pill enters from `scale 0.3, opacity 0` with spring stiffness 380, damping 20, delay 0.15s; exits to `scale 0.6, opacity 0`. The check draws via `pathLength 0 → 1`, 0.45s, delay 0.35s, ease `[0.65, 0, 0.35, 1]`.
- Status line swaps with `AnimatePresence mode="wait"`: in from `opacity 0, y 6, blur(4px)`, out to `y -6, blur(4px)`, 0.25s.
- Spinner: 16px circle, 2px border in the line colour with the top border in accent, rotating 360° every 0.7s linear.

## Interaction and states

- A single real `<input>` covers the row, fully transparent (`opacity 0`, transparent text and caret, 16px font so iOS doesn't zoom). `type="text"`, `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength={length}`, so paste and SMS autofill work.
- On change: strip non-digits, clamp to `length`, store. Typing any digit hides a previous error message. Ignore input while verifying/success/done; the input is `disabled` in those states.
- The active box is `min(code.length, length − 1)`; the ring and caret only show while focused, unlocked and not full.
- When full: status `verifying`, wait 900ms, then await `verify`. True → `success`, call `onVerified`, then `done` after 650ms. False → `error`, show the message, shake, and after 600ms clear the code and return to `idle` (message stays until the next digit).
- Status line content: idle — "Didn't get it? **Resend code**" (accent button, medium weight, calls `onResend`); verifying/success — spinner + "Checking…"; error — "That code didn't match. Try again." in `#d70015` / dark `#ff6961`; done — an accent "Replay" button that resets everything (and stops autoplay).
- Clear all pending timeouts on reset and unmount.

## Autoplay demo

With `autoplay` set: 900ms after mount, type the string one character at a time with a random 140–230ms between characters, submit 50ms after the last, then 4200ms later reset and start again after 900ms. The first focus or change on the input marks the component as touched: autoplay stops for good and the field resets to empty.

## Accessibility

- Visually hidden `<label>` "One-time code" tied to the input via `useId`.
- The Verified pill has `role="status"`; the check SVG is `aria-hidden`.
- Resend and Replay are real `type="button"` buttons; Replay shows a visible focus outline.

## Acceptance checklist

- [ ] Six 54×66 boxes with a wider gap (22px) between the third and fourth.
- [ ] Typing letters does nothing; pasting "48-29 13" fills 482913.
- [ ] The accent ring slides between boxes rather than jumping.
- [ ] A full code shows a rippling wave and "Checking…" for ~0.9s.
- [ ] A wrong code shakes the row, outlines boxes red, then clears.
- [ ] "482913" sweeps the boxes to accent, collapses them inward and shows a Verified pill whose check draws itself.
- [ ] Replay brings the boxes back with a spring.
- [ ] With `autoplay`, it types and verifies on a loop until you click the field.
