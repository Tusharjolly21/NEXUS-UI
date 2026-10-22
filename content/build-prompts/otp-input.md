<!-- OTP Input: Motion Kit variant brief -->

> The OTP Input page has 3 variants. The original OTP Input brief comes first; the Motion Kit OTP Autofill and Underline OTP variants follow, each after a rule.

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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Each digit typed or pasted plays `tick` (a tiny burst of high-passed noise above about 5 kHz, roughly 12ms) at 45% volume (one tick for a paste). When a code the visitor entered verifies, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays; when it does not match, `error` (two short low square-wave notes, about 220 Hz then 185 Hz, 110ms apart) plays as the row shakes. The autoplay typing, its verification, the Resend code and Replay buttons make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Six 54×66 boxes with a wider gap (22px) between the third and fourth.
- [ ] Typing letters does nothing; pasting "48-29 13" fills 482913.
- [ ] The accent ring slides between boxes rather than jumping.
- [ ] A full code shows a rippling wave and "Checking…" for ~0.9s.
- [ ] A wrong code shakes the row, outlines boxes red, then clears.
- [ ] "482913" sweeps the boxes to accent, collapses them inward and shows a Verified pill whose check draws itself.
- [ ] Replay brings the boxes back with a spring.
- [ ] With `autoplay`, it types and verifies on a loop until you click the field.

---

<!-- variant: otp-autofill -->

# OTP Autofill

Build a one-time-code screen that fills itself the way phones do. A text message banner drops in at the top of the card; pressing Fill lifts each digit out of the message and flies it into its box. The boxes then ripple while the code is checked and slide together into a single green Verified pill. Typing and pasting work as normal, and a wrong code shakes and clears. It should feel like a calm, native iOS moment.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`).
- File: `components/otp-input/otp-autofill.tsx`. Named export `OtpAutofill`, exported `OtpAutofillProps`. Add both to the directory `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `code` | `string` | `"482913"` | The six digit code carried by the pretend message and the only code that verifies. Anything that is not six digits falls back to the default. |
| `autoplay` | `boolean` | `false` | Plays message, Fill, verify and start over on a loop until someone interacts. |
| `onVerified` | `(code: string) => void` | none | Called once the code verifies. |
| `onResend` | `() => void` | none | Called when "Resend code" is pressed. |
| `className` | `string` | `""` | Extra classes for the card. |

## Layout and look

- Card: `position: relative`, `overflow: hidden`, width 380px with `max-width: 100%`, radius 28px, padding 24px (16px at viewport 360px and below) with 28px bottom. Light: white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -30px rgba(0,0,0,.9)`. Ink `#1d1d1f` / `#f5f5f7`, muted `#6e6e73` / `#a1a1a6`.
- Lock tile: absolutely placed, horizontally centred, 28px from the top, 48px square, radius 16px, `#f5f5f7` / `#2c2c2e`, holding a 22px padlock outline icon (stroke 2, round caps). It is `aria-hidden`.
- Heading block: 86px top margin, centred. Title "Check your messages" 21px semibold, tracking -0.02em. Under it, 6px gap, "Enter the code we sent to •• ••• 4821" 14px muted.
- Message banner: absolute, 12px from the top, left and right, z-index 10, row layout with 12px gap, padding 12px, radius 18px, background white at 80% (dark `#2c2c2e` at 85%) with `backdrop-filter: blur(24px)`, shadow `0 10px 30px -12px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06)` (dark: black .8 and a white .1 ring). It has `role="group"` and `aria-label="New text message"`.
  - App icon: 32px square, radius 9px, vertical gradient `#5ef08a` to `#22c55e`, 17px white speech bubble glyph.
  - Text: top line 12px, "Messages" semibold in ink on the left and "now" muted on the right. Body 13px, line height 1.35: "Your Nexus code is" then the six digits in one semibold tabular-nums span (each digit its own span so it can be measured), then ". Don't share it."
  - Fill button: 32px tall, fully rounded, `#0071e3` (dark `#0a84ff`) with white 13px semibold text, 14px horizontal padding, 4px top margin, `whileTap` scale 0.94, disabled while digits are flying.
- Digit row: relative, 24px top margin, 60px tall, content centred. The boxes row is a flex row with 8px gap, `width: 100%`, `max-width: 316px`. Each box: 56px tall, flex 1 with `min-width: 0` and `max-width: 44px`, radius 14px, 26px semibold tabular digits. The fourth box has an extra 12px left margin (the group gap). A 8px wide, 2px tall rounded dash (`#d2d2d7` / `#48484a`) sits at the exact middle of the row.
  - Box colours (classes with a 200ms background and shadow transition): idle `#f5f5f7` / `#2c2c2e`; filled adds ring `0 0 0 1px rgba(0,0,0,.1)` (dark white .16); active adds ring `0 0 0 2px #0071e3` (dark `#0a84ff`); error is `#fff1f0` (dark `#3a1f1e`) with ring `0 0 0 1.5px #ff3b30` (dark `#ff453a`) and red digits.
  - Caret in the active empty box: 2 by 28px rounded bar in the action colour, opacity keyframes `[1,1,0,0]` at times `[0,.5,.5,1]`, 1s, infinite.
- Verified pill: 56px tall, fully rounded, 24px horizontal padding, 8px gap, 17px semibold, `#e9f9ee` with `#1a7f37` text (dark: `#30d158` at 15% with `#30d158` text). A 22px disc (`#34c759`, dark `#30d158`) with a white check (`M7 12.5l3.2 3.2L17 9`, stroke 2.4, round) followed by the word "Verified".
- Status row: 20px tall, 20px top margin, centred, 13px.
- Flying digits: absolutely placed at the card's top-left, 20px square, 13px semibold tabular, ink colour, `pointer-events: none`, z-index 20, `aria-hidden`.

## Motion

State machine, `phase`: `idle`, `banner`, `flying`, `checking`, `merge`, `done`, `error`.

- 900ms after the screen is idle with an empty field, the phase becomes `banner`. The banner enters from `y -90, opacity 0, scale .96` with spring stiffness 380, damping 30, and exits to `y -90, opacity 0` in 0.3s with ease `[0.4, 0, 1, 1]`. The banner stays through `banner` and `flying`.
- The lock tile fades to opacity 0 and scale 0.8 while the banner is up, and comes back after.
- Fill measures every digit span in the banner and every box centre relative to the card, then starts one flying digit per character. Digit `i` animates over 0.55s, delayed `i * 0.08s`, ease `[0.3, 0, 0.2, 1]`: x moves through start, midpoint, end; y goes start, then `min(startY, endY) + 40` (a dip), then end; scale `[1, 1.6, 2]`. The source digit in the message dims to opacity .25 while its copy flies. When digit `i` lands, set the field to the first `i + 1` digits of the code. After the last lands, clear the flyers and check.
- Digit entering a box: from `scale .4, opacity 0, y 6` to rest, spring stiffness 600, damping 26 (`AnimatePresence mode="popLayout"`). Leaving: `opacity 0, y 14`, 0.15s, delayed `(5 - i) * 0.03s`.
- Checking (900ms): each box loops `y: [0, -5, 0]`, 0.5s, easeInOut, infinite, delayed `i * 0.08s`. The status row reads "Checking…".
- Wrong code: phase `error`; the whole row shakes with `x: [0,-10,9,-7,5,-2,0]` over 0.45s; boxes turn red; after 700ms the field clears and returns to `idle`.
- Right code: phase `merge` for 380ms. First measure, for each box, the horizontal distance from its centre to the centre of the digit row. Each box then animates `x` to that distance, `scale .7`, `opacity 0` over 0.36s with ease `[0.5, 0, 0.2, 1]`. Then phase `done` and `onVerified` is called. The boxes row exits (`opacity 0, scale .9`, 0.2s) while the pill enters from `scaleX .35, scaleY .8, opacity 0` with spring stiffness 380, damping 22; the check draws with `pathLength 0 to 1` over 0.35s after 0.25s; the word "Verified" fades in from `x -6` after 0.2s.
- Status text swaps with `AnimatePresence mode="wait"`: "Resend code" (action colour button), "Checking…", the error text "That code didn't match. Try again." in `#ff3b30` / `#ff453a`, and after success a "Start over" button that fades in after 0.4s.

## Interaction and states

- One real `<input>` covers the digit row at opacity 0: `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength` 6, `aria-label="One-time code, 6 digits"`, `aria-invalid` while in error, disabled when done. Clicking the boxes focuses it. Typing or pasting strips non-digits and clamps to six; input is ignored while flying, checking, merging or done. A full code starts checking at once. Typing during `error` returns to `idle`.
- The active box is `min(length, 5)`; the ring and caret show only while the input is focused and the phase is not `checking`.
- "Start over" and "Resend code" both reset: clear every pending timer, empty the field, clear flyers and go to `idle` (so the message arrives again). "Resend code" also calls `onResend`.
- Reduced motion: no flight (Fill puts the code in and checks at once), no bounce, no shake, no merge slide (boxes just fade), springs become instant.
- All timers are tracked in one list and cleared on reset and on unmount.

## Autoplay demo

With `autoplay` and motion allowed, a loop runs while the card is on screen and the tab is visible: 1300ms after the banner appears, press Fill by itself; 2600ms after `done`, reset and start the story again. Any pointer down on the card, focus of the field, Fill, Start over or Resend marks the card as touched and the loop never runs again. Leaving the screen or hiding the tab clears the pending step; coming back schedules it again.

## Accessibility

- A visually hidden `role="status"` `aria-live="polite"` line announces "Checking the code", the error message and "Code verified".
- Fill, Resend and Start over are real buttons with a visible focus outline (`outline-2 outline-offset-2` in `#0071e3`). SVGs and flying digits are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Each digit typed or pasted plays `tick` (a tiny burst of high-passed noise above about 5 kHz, roughly 12ms) at 45% volume (one tick for a paste). Pressing Fill plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss) and each digit that lands in its box plays the same tick at 40%. When a code the visitor typed, pasted or filled verifies, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays as the boxes slide together; when it does not match, `error` (two short low square-wave notes, about 220 Hz then 185 Hz, 110ms apart) plays as the row shakes. The autoplay story (message, Fill, verify, start over), Resend code and Start over make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] About a second after mount a message banner drops in with "Your Nexus code is 482913".
- [ ] Pressing Fill sends six digits arcing from the message into the six boxes, one after another.
- [ ] After the last digit lands the boxes ripple for about 0.9s with "Checking…".
- [ ] The boxes then slide to the middle and become a green Verified pill with a drawn check.
- [ ] Typing "111111" shakes the row, outlines boxes red and clears.
- [ ] Pasting "482-913" fills the code and verifies.
- [ ] Start over brings the message back.
- [ ] With `autoplay` the whole sequence loops until you touch the card.
- [ ] No horizontal overflow at 320px; boxes shrink to fit.
- [ ] Dark mode uses `#1c1c1e` surfaces and the dark palette.

---

<!-- variant: otp-line -->

# Underline OTP

Build a quieter one-time-code field with no boxes: six underlines, each with a small dot waiting on it. Typing turns each dot into its digit, a caret glides to the next slot and the underline under it stretches in. A wrong code drops its digits off the line one by one; the right code pulls the digits together, joins the underlines into one green line and adds a check.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `layoutId`, `useAnimationControls`, `useReducedMotion`).
- File: `components/otp-input/otp-line.tsx`. Named export `OtpLine`, exported `OtpLineProps`. Add both to the directory `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `code` | `string` | `"905172"` | The six digit code that verifies. Anything that is not six digits falls back to the default. |
| `autoplay` | `boolean` | `false` | Types a wrong code and then the right one on a loop until someone interacts. |
| `onVerified` | `(code: string) => void` | none | Called once the right code is entered. |
| `className` | `string` | `""` | Extra classes for the card. |

## Layout and look

- Card: flex column, centred items, width 380px with `max-width: 100%`, radius 28px, padding 36px vertical and 24px horizontal (16px at viewport 360px and below). Light white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -30px rgba(0,0,0,.9)`.
- Title "Two-step verification" 21px semibold, tracking -0.02em, centred. Under it, 6px gap, "Enter the 6-digit code from your authenticator app." 14px, muted `#6e6e73` / `#a1a1a6`, centred.
- Field: relative, 32px top margin, text cursor. Slots in a flex row aligned to the bottom with a 12px gap (2px once done). Each slot: 34px wide (30px under 340px viewport), 54px tall, content centred.
  - Waiting dot: 7px circle, `#d2d2d7` / `#48484a`.
  - Digit: 32px semibold, tabular, tracking -0.02em, ink `#1d1d1f` / `#f5f5f7` (red `#ff3b30` / `#ff453a` in error).
  - Caret: 2px wide rounded bar from 10px below the top to 12px above the bottom, action colour `#0071e3` / `#0a84ff`. It sits at the slot centre while the slot is empty and hugs the right edge (2px in) once the slot holds a digit.
  - Underline: a 2px grey track (`#e5e5ea` / `#3a3a3c`) and over it a 2px coloured line that scales in from the middle: action colour for the active empty slot, ink for a filled slot, red in error. The colour change is a 200ms CSS transition.
- Success line: a 3px `#34c759` (dark `#30d158`) bar across the full field width at the bottom, origin centre.
- Check badge: 28px green disc, 44px to the right of the field, 12px above the bottom, holding a 15px white check (`M5 12.5l4.5 4.5L19 7.5`, stroke 3, round; dark uses `#1c1c1e`).
- Status line: 20px tall, 24px top margin, 13px. Default "Codes refresh every 30 seconds" muted; checking "Checking…"; error "Wrong code. Try again." red; done "You're in." semibold green (`#1a7f37` / `#30d158`).
- After success and once the visitor has interacted, a "Try again" action button (13px medium, action colour) appears below.

## Motion

State machine, `state`: `typing`, `checking`, `error`, `done`.

- Slots and their row use `layout` with spring stiffness 300, damping 28, inside one `LayoutGroup`, so the gap closing on success glides.
- The caret is one element with a `layoutId` (made unique per instance) that moves between slots with spring stiffness 500, damping 36, and blinks with opacity `[1, 1, .15, 1]` over 1.1s, infinite. It shows while the field is focused or the demo is running, only in `typing`, and only while the code is incomplete.
- Dot to digit uses `AnimatePresence mode="popLayout"`. Digit in: `opacity 0, y 10, scaleY .3, blur(6px)` to rest, spring stiffness 500, damping 28, blur 0.2s. Dot in: `scale 0, opacity 0` to rest; dot out: `scale 2.4, opacity 0`, 0.15s.
- Wrong code: digits exit one by one from the right: `opacity 0, y 34`, rotate `(odd slot ? 1 : -1) * (8 + 3 * i)` degrees, 0.4s, delay `(5 - i) * 0.05s`, ease `[0.5, 0, 1, 1]`. The whole field also shakes with `x: [0,-8,7,-5,3,0]` over 0.4s.
- Timing: a full code goes to `checking` for 700ms. Wrong: `error`; after 650ms clear the digits, then after 500ms return to `typing`. Right: `done`, call `onVerified`.
- Done: the gap shrinks 12 to 2px, the green line scales from `scaleX 0` to 1 with spring stiffness 160, damping 20, delay 0.15s, and the badge pops in from `scale 0, rotate -40deg` with spring stiffness 500, damping 18, delay 0.35s; its check draws over 0.3s after 0.5s.
- Status line swaps with `AnimatePresence mode="wait"` keyed by state: in from `y 5`, out to `y -5`, 0.18s.
- Reduced motion: layout and springs become instant, digits fade instead of dropping, no shake, no blinking caret.

## Interaction and states

- One real `<input>` fills the field at opacity 0 with a visually hidden `<label>` "Authenticator code, 6 digits" (id from `useId`); `inputMode="numeric"`, `autoComplete="one-time-code"`, `aria-invalid` in error. Clicking the field focuses it. Typing or pasting strips non-digits and clamps to six; input is ignored unless the state is `typing`. A full code is submitted at once.
- The first focus or change counts as the visitor taking over: autoplay stops for good and the field clears.
- "Try again" clears the field, returns to `typing` and focuses the input.
- All timers are kept in lists and cleared on unmount.

## Autoplay demo

With `autoplay` and motion allowed, while on screen and the tab visible: 600ms after the loop starts type the wrong code "123450" at 160ms per digit and submit; at 4200ms type the right code ("905172") the same way and submit; at 9000ms start the loop again from an empty field. Interaction stops it for good. Leaving the screen or hiding the tab clears the pending steps; coming back restarts the loop from an empty field.

## Accessibility

- The status line is a `role="status"` `aria-live="polite"` region.
- Dots, caret, success line and badge are `aria-hidden`. "Try again" is a real button with a visible focus outline.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Each digit typed or pasted plays `tick` (a tiny burst of high-passed noise above about 5 kHz, roughly 12ms) at 45% volume (one tick for a paste). When a code the visitor entered is right, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays as the green line draws; when it is wrong, `error` (two short low square-wave notes, about 220 Hz then 185 Hz, 110ms apart) plays as the digits drop. The autoplay demo, which tries a wrong code and then the right one, and the Try again button make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Six underlines with a grey dot on each; no boxes.
- [ ] Each typed digit replaces its dot; the underline under it turns dark and the caret glides on.
- [ ] A wrong six digit code drops the digits off the line right to left with a slight tilt and the field shakes.
- [ ] The right code pulls the slots together, draws one green line and pops a check badge to the right.
- [ ] Pasting "905172" works.
- [ ] With `autoplay` it tries a wrong code then the right one, on a loop, until you focus the field.
- [ ] Keeps its shape at 320px wide; the badge stays inside the card.
- [ ] Dark mode uses light ink, `#48484a` dots and `#30d158` for success.
