# Peek Login

Build a compact sign-in card topped by a little rounded face that watches you. Its eyes follow the pointer anywhere on the page and the head turns and tilts toward it; while you type your email the eyes read along the text; when you focus the password it covers its eyes with two paws, and if you press Show it lifts one paw to peek. The feel is cute and alive but restrained: quick springs, small movements.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`).
- File: `components/peek-login/peek-login.tsx`, named export `PeekLogin`, plus exported `PeekLoginProps` and `PeekLoginValues` (`{ email: string; password: string }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `"#0071e3"` | Face colour, focus-ring colour and Show/Hide text colour. |
| `onSubmit` | `(values: PeekLoginValues) => void` | none | Called with the typed values on submit. |
| `autoplay` | `boolean` | `false` | Scripted typing demo on a loop until someone interacts. |

The component must never send data anywhere itself. On submit it calls `onSubmit` and plays a purely local state: button reads "Signing in…" for 900ms, then "Signed in" until 2600ms after submit, then "Sign in" again. Ignore submits while not idle.

## Layout and look

- Card (`form`): 290px wide, column, 12px gap, 20px padding (24px top), radius 26px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Face: 96×78, centred, 4px bottom margin, `overflow: hidden`, radius `40px 40px 32px 32px`, background `accent`, `aria-hidden`.
  - Two eyes in a row with 12px gap. Each eye: 18×22 white pill, `overflow: hidden`, holding a 10×10 `#1d1d1f` pupil.
  - Mouth: absolute, 14px from the bottom, 14×6, bottom-rounded, `#0b2a4a` at 40%.
  - Two paws: 34×34 circles `#5ac8fa` with `inset 0 -4px 0 rgba(0,0,0,.1)`, absolute at left 10px and right 10px, hidden below the face by default.
- Fields: label column with 4px gap; label 12px medium `#6e6e73` (dark `#a1a1a6`). Input 44px tall, radius 12px, `#f5f5f7` bg (dark `#2c2c2e`), 14px horizontal padding, 15px text `#1d1d1f` (dark `#f5f5f7`), placeholder `#a1a1a6` (dark `#8e8e93`), no outline, 2px ring in `accent` on focus. Placeholders: "you@company.com" and "••••••••".
- Password input has 64px right padding; inside it, right 8px, a "Show"/"Hide" text button, 12px semibold in `accent`, 8px radius, 8×4 padding.
- Submit: 44px tall, 4px top margin, radius 12px, 15px medium, `#1d1d1f` bg / white text (dark `#f5f5f7` / `#1d1d1f`), `whileTap` scale 0.97.

## Motion

- Gaze: raw motion values `tx, ty`, each smoothed by `useSpring` (stiffness 300, damping 22) into `x, y`. Pupils use `x, y` directly as translation.
- Head: `rotate = x·1.6` degrees and `translateX = x·1.2` px, both derived from the smoothed `x`.
- Turning away: each eye's scale = `1 − max(0, −side·x)·0.07` (left eye side −1, right eye +1), so the eye on the far side shrinks slightly.
- Pointer tracking (window `pointermove`, skipped while the email field is active): `dx, dy` from the face centre, `d = hypot || 1`, `k = min(1, d/160)`; `tx = dx/d·4·k`, `ty = dy/d·5·k`. The eyes reach full deflection 160px away.
- Reading: while the email field is active, `tx = −4 + min(len, 24)/3`, `ty = 5` (eyes look down and drift right as you type).
- Blink: every 3200ms close for 140ms. Closed = eye `scaleY 0.1`, 0.12s; eyes also close while covering.
- Mouth: `scaleX 1.3` while the email field is active or after a successful sign-in, otherwise 1.
- Paws (spring stiffness 400, damping 24; right paw delayed 0.04s):
  - Rest: both `y 60` (hidden).
  - Covering (password active, hidden): left `y 0, x 6`; right `y 0, x −6`.
  - Peeking (password active, shown): left `y 18, x 0` (lowered, one eye visible); right stays `y 0, x −6`.

## Interaction and states

- `field`: "none" | "email" | "pw", set on focus and reset to "none" on blur.
- Show/Hide toggles the password input between `password` and `text`; its `mousedown` is prevented so the input keeps focus.
- Autofill: `autoComplete="off"` on the form and both inputs, no `name` attributes, email is `type="text"` with `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`; add `data-1p-ignore`, `data-lpignore`, `data-bwignore`, `data-form-type="other"`. `noValidate` on the form.
- Clean up all intervals and timeouts on unmount.

## Autoplay demo

A timeline replayed every 7600ms: 400ms focus email; from 600ms type "sam@studio.com" one character per 90ms; 2200ms switch to password; from 2500ms type "hunter22" at 90ms per character; 3600ms Show; 4800ms Hide; 5600ms field none; 7000ms clear both values. Every step is skipped once the user has pressed a pointer or key inside the card; the loop then stops.

## Accessibility

- Real `label` elements wrap each input. The face is `aria-hidden`.
- Show/Hide: `aria-label` "Show password"/"Hide password", `aria-pressed`. Submit carries `aria-busy` while signing in, and an `sr-only` `role="status"` says "Signed in".

## Acceptance checklist

- [ ] Moving the pointer around the page moves both pupils and tilts the head toward it.
- [ ] Focusing email makes the eyes look down; typing moves them right, character by character.
- [ ] Focusing password brings both paws up over the eyes and the eyes close.
- [ ] Pressing Show lowers the left paw halfway so it peeks; Hide covers again.
- [ ] The face blinks every few seconds.
- [ ] Submitting shows "Signing in…", then "Signed in", then resets; no network request is made.
- [ ] Browsers and password managers do not offer to autofill or save.
- [ ] Autoplay runs the typing script on a loop and stops on the first interaction.
