# Typo-catching Signup

Build a newsletter signup card that catches email typos: type "name@gmial.com" and a "Did you mean gmail.com?" suggestion slides out under the field; tap it to fix. Subscribing morphs the button into a tick, flies the envelope away, adds a "You" avatar to the stack and rolls the reader count up by one. It should feel friendly and helpful, with small delightful payoffs.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`).
- File: `components/typo-catching-signup/typo-catching-signup.tsx`, named export `TypoCatchingSignup`, type `TypoCatchingSignupProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | — | Accent. Unset: `#0071e3`, `#0a84ff` in dark. |
| `start` | `number` | `12408` | Reader count before the visitor joins. |
| `title` | `string` | `"One good email, every Sunday."` | Heading. |
| `description` | `string` | `"Five links worth your time and one thing we learned building the product. Nothing else."` | Paragraph. |
| `domains` | `string[]` | gmail.com, outlook.com, icloud.com, yahoo.com, hotmail.com, proton.me | Domains typos are checked against. |
| `onSubmit` | `(email: string) => void` | — | Runs with the trimmed, valid address. Nothing is sent by the block. |
| `autoplay` | `boolean` | `false` | Runs a typing demo until the visitor touches it. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg `#f5f5f7` / black, padding 16px sides (20px `sm`), vertical `clamp(48px, 8vw, 80px)`. `--mk-a` is `#0071e3` / dark `#0a84ff`; `accent` overrides it inline.
- Card: max-width 760px, centred, relative, overflow hidden, radius `clamp(28px, 4vw, 36px)`, padding 48px vertical / 20px sides (56px / 56px from `sm`), centred text, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 40px 80px -50px rgba(0,0,0,.4)` (dark `0 0 0 1px rgba(255,255,255,.08)`).
- Glow: 520×240px ellipse at `top: -96px`, centred, `radial-gradient(closest-side, accent 15%, transparent)` (dark 28%), `blur-3xl`.
- Envelope: 56×56 SVG in the accent — a `rect x6 y14 w44 h30 rx6` filled, plus a white flap stroke `M8 18l20 14 20-14` (width 2.5, round join).
- Heading `<h2>`: 20px top margin, `clamp(28px, 4.4vw, 44px)`, semibold, line-height 1.05, tracking −0.04em, `#1d1d1f` / `#f5f5f7`. Paragraph: max-width 440px, 12px top margin, `clamp(16px, 1.6vw, 17px)`, line-height 1.5, `#6e6e73` / `#a1a1a6`.
- Form: max-width 460px, 32px top margin, `noValidate`. Field row: fully rounded, padding 6px, gap 8px, bg `#f5f5f7` / `#2c2c2e`, `focus-within` 2px accent ring; error ring 2px `#ff3b30` / `#ff453a`. Input 44px tall, 16px text, left-aligned, padding 12px (16px `sm`), placeholder "you@gmail.com" (`#a1a1a6` / `#8e8e93`), stays fully opaque when disabled.
- Button: 44px tall, rounded, 15px medium white. Width 116px with "Subscribe" on the accent; done: 44px wide, `#248a3d` (dark `#30d158` with black icon), an 18px check `M5 12.5l4.5 4.5L19 7.5` (stroke 3).
- Suggestion: a centred button under the field, 8px top margin, min-height 40px, padding 8px 12px, rounded, 14px muted, truncates; hover bg `#f5f5f7` / `#2c2c2e`. Text "Did you mean **outlook.com**?" with the domain semibold in the accent.
- Social row: 32px top margin, centred, wraps, 12px gap. Avatar stack overlapping by 8px: four 32px circles with 2px white / `#1c1c1e` borders, `linear-gradient(140deg, c, c+"99")` for `#ff9f0a`, `#30d158`, `#5e5ce6`, `#ff375f` (z-index descending). On done, a "You" avatar (accent, 10px semibold white) joins at the front. Text 14px muted: "Join **12,408** readers" with the number semibold ink.

## Motion

- Envelope idle: `y [0, −4, 0]` 3s easeInOut forever. Done: `y [0, −10, −160]`, `x [0, 4, 80]`, `rotate [0, −8, 20]`, `opacity [1, 1, 0]` over 1.1s, ease `[0.5, 0, 0.75, 0]`. Reduced motion: plain opacity 0.3s.
- Field row and button use `layout` with spring 400/32; the button animates `width 116 ↔ 44` with spring 400/30; label/check swap with `AnimatePresence mode="popLayout"`: label `opacity/scale .6`, check pops from scale 0 and draws `pathLength 0 → 1`, delay .15s. `whileTap` scale .95.
- Bad email: form `x [0, −9, 8, −5, 3, 0]` over 0.4s.
- Suggestion: `opacity 0, y −8, height 0` ↔ `opacity 1, y 0, height auto`, spring 400/30.
- "You" avatar: `scale 0, x 10` → rest, spring 500/16; existing avatars are `layout` elements so they shift over.
- Count: an odometer. Format with `en-US`; each character slot is keyed by its position from the right and holds `AnimatePresence mode="popLayout"` keyed by the character, new digit from `y −100%`, old to `y 100%`, spring 400/28, slot `overflow: hidden`, tabular numbers.

## Interaction and states

- State: `idle | bad | done`. Submit: ignore when done; trim, cap 254, test `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`. Invalid → `bad` for 700ms (timer cleared on unmount). Valid → store the clean value, `done`, then `onSubmit(clean)`. Input and button are disabled when done.
- Suggestion: take the text after the last "@" (needs at least one char before it), lower-cased; skip if shorter than 4, longer than 64, or already a known domain. Find the known domain with the smallest Levenshtein distance, accepting only distance < 3. Suggest `local@best`. Hidden when done. Clicking it replaces the email.
- Count shown = `start + (done ? 1 : 0)`.

## Autoplay demo

When `autoplay` is on, not reduced, and untouched, loop: wait 900ms; type "maya@gmial.com" one character every 75ms; wait 1500ms (suggestion visible); accept the fix ("maya@gmail.com"); wait 1100ms; set done; wait 2800ms; reset to idle and empty. Cancel all timers on cleanup. The first pointer down, key down or focus inside the section marks it touched, stops the demo and clears the field.

## Accessibility

- Visually hidden label "Email" bound to the input (`useId`); `type="email"`, `inputMode="email"`, `autoComplete="email"`, `aria-invalid` when bad.
- Button `aria-label` "Subscribe" / "Subscribed". A visually hidden `role="status"` announces "Subscribed. Welcome aboard." or "That email doesn't look right."
- Envelope and avatars are `aria-hidden`; the suggestion is a real button with an accent focus ring.

## Acceptance checklist

- [ ] Typing "sam@gmial.com" shows "Did you mean gmail.com?"; clicking it fixes the field.
- [ ] "sam@gmail.com" shows no suggestion; "sam@xyzabc.org" shows none either.
- [ ] Submitting "sam" shakes the form with a red ring for 0.7s.
- [ ] A valid submit shrinks the button to a green tick and flies the envelope off.
- [ ] A "You" avatar springs into the stack and 12,408 rolls to 12,409.
- [ ] `onSubmit` receives the trimmed address.
- [ ] `start={999}` rolls to "1,000" with the new digit slots.
- [ ] `autoplay` types, fixes and subscribes on a loop; touching the card stops it.
- [ ] `accent` recolours envelope, button, focus ring, suggestion, glow and "You".
- [ ] Dark mode swaps card, field and text colours.
