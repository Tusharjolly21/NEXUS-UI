# Auth Morph

Build one auth card that does both sign in and sign up. Switching modes slides a pill, grows or folds the name field, and swaps the heading and button words. Choosing "Magic link" folds the password away; the button then sends, and the card becomes a "Check your inbox" screen with a resend timer. Apple-light, springy and compact. Demo only: no network, the password and name are never read or stored.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), a `cn` helper and the `useSound` hook from `@/lib/ui-sounds`.
- File: `components/blocks/auth-morph.tsx`, named export `AuthMorph`, types `AuthMorphProps` and `AuthMorphMode` (`"signin" | "signup"`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `mark` | `string` | `"N"` | Letter in the badge at the top. |
| `signInTitle` | `string` | `"Welcome back"` | Heading in sign in mode. |
| `signUpTitle` | `string` | `"Create your account"` | Heading in sign up mode. |
| `resendSeconds` | `number` | `30` | Seconds before Resend unlocks. |
| `defaultMode` | `AuthMorphMode` | `"signin"` | Mode it opens in. |
| `autoplay` | `boolean` | `false` | Runs through modes, magic link and the inbox screen on a loop until touched. |
| `enableSound` | `boolean` | `true` | Swipe on mode swap, tap on submit and resend, chime on the inbox screen. |
| `onMagicLink` | `(email: string) => void` | none | Called with the address when the link is "sent". |
| `onPasskey` | `() => void` | none | Called when "Use a passkey" is pressed. |
| `className` | `string` | none | Extra classes on the section. |

## Layout and look

- Root `<section aria-label="Sign in or create an account">`: full width, flex-centred, background `#f5f5f7` / dark `#000`, 48px vertical and 16px side padding.
- Card: `width: 400px; max-width: 100%`, radius 28px, padding 24px, `overflow: hidden`, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: hairline `rgba(255,255,255,.08)`, drop `rgba(0,0,0,.9)`).
- Badge: 44px square, radius 13px, `#1d1d1f` (dark `#f5f5f7`) with a 17px bold white (dark `#1d1d1f`) letter. Heading 16px below: 24px semibold, tracking -0.03em, `#1d1d1f` / `#f5f5f7`.
- Mode switch, 16px below: a two column grid, full-width pill, `#f5f5f7` / dark `#2c2c2e`, padding 4px; two 36px buttons, 13.5px medium; the selected one has a white (dark `#48484a`) thumb with shadow `0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)` (none in dark) that slides between them.
- Fields: 56px tall, radius 14px, `#f5f5f7` / dark `#2c2c2e`, padding 16px sides and 16px top, 15px text, 10px between fields. A floating label (15px, `#6e6e73` / `#a1a1a6`) sits centred and shrinks to 11.5px at 15px from the top when the field is focused or filled. Focus ring: 2px `#0071e3` (dark `#0a84ff`). Sign in shows Email and Password (with a "Forgot?" text button at the right, 12.5px medium, `#0071e3` / dark `#2997ff`); sign up adds "Full name" above Email.
- Primary button, 16px below the fields: 48px tall, full width, fully rounded, `#0071e3`, white 15px medium text. Words: "Sign in", "Create account" or, in magic link mode, "Email me a link".
- Divider "or" (12px secondary) between two 1px lines (`#ececf0` / dark `#3a3a3c`), then a two column grid of 44px secondary buttons (`#f5f5f7` / dark `#2c2c2e`, 13.5px medium): "Magic link" (reads "Use a password" when on) and "Use a passkey".
- Inbox screen (replaces the form, centred text, padding 16px vertical): a 56px round badge (`#eef5ff` / dark 15% `#0a84ff`) with a 24px envelope (stroke `#0071e3` / `#0a84ff`); "Check your inbox" 22px semibold; "We sent a sign-in link to **email**." 14px secondary (falls back to "your email"); a 40px "Resend in 30s" pill button (13px medium, tabular, disabled until the timer ends); a text button "Use a different email" 13px medium.

## Motion

- The card has `layout` with a spring, stiffness 340, damping 32, so its height follows the content.
- Form to inbox: `AnimatePresence mode="wait"`; the form exits with opacity and scale 0.97 over 0.15 s; the inbox enters from opacity 0 and scale 0.97.
- Heading swap: exits up 8px with a 4px blur, enters from 8px below, 0.2 s.
- Fields grow and fold: height 0 to 56px, margin-top 0 to 10px and opacity, spring stiffness 380, damping 34. Thumb: shared layout spring, stiffness 420, damping 34.
- Button label swaps with a 6px vertical fade, 0.15 s; while sending it shows a 16px spinner (2px ring, 30% white with a white top, 0.7 s per turn).
- Sending takes 900 ms. The inbox envelope badge springs in from scale 0.5 and -20 degrees (stiffness 400, damping 16) and the envelope flap draws with `pathLength` 0 to 1 after 0.25 s over 0.4 s.
- Reduced motion: every spring and fade is instant, headings swap without blur or movement, the spinner becomes the word "Sending", sending lasts 300 ms.

## Interaction and states

- Mode buttons use `aria-pressed`. "Magic link" toggles magic mode (`aria-pressed`) and hides the password field.
- Submit in magic mode: sending, then the inbox screen; the address is kept in component state only to show it on screen and to pass to `onMagicLink`. Submit in password mode does nothing but give feedback sound, as the block has no backend.
- The name and password inputs are uncontrolled and never read. Autocomplete attributes are set (`name`, `email`, `current-password` or `new-password`).
- Inbox: a 1 s interval counts down from `resendSeconds`; Resend is disabled until 0. Pressing Resend shows "Sending" for 900 ms and restarts the timer. "Use a different email" returns to the form with magic mode off.
- All timers and intervals are cleared on unmount.

## Autoplay demo

`autoplay` (default false), a 10.2 s loop: reset; at 1.2 s switch to Sign up; at 2.8 s back to Sign in; at 3.8 s turn Magic link on; at 4.4 s fill `maya@orbitly.com`; at 5.2 s send, with the inbox screen after 0.9 s; at 9.8 s return to the form. It stops for good on the first pointer or key interaction, pauses off screen and in a hidden tab, and never runs under reduced motion. The preview passes `autoplay`.

## Accessibility

- Real form, buttons and inputs with labels (`aria-label` plus the visual floating label, which is `aria-hidden`). 2px `#0071e3` (dark `#0a84ff`) focus outlines with 2px offset on all buttons.
- The inbox screen is `role="status"`, so the arrival is announced. Disabled Resend keeps 4.5:1 text contrast.
- Text and links meet 4.5:1 in both themes (dark links use `#2997ff` on the field surface). No network calls.

## Sound

- Mode swap by the visitor: `swipe`, volume 0.4 (only when the mode actually changes).
- Submit pressed (any mode): `tap`, volume 0.5. Resend pressed: `tap`, 0.5.
- Inbox screen appears: `success`, volume 0.6, once per send.
- Nothing for typing, toggling Magic link, the countdown or hover. Autoplay plays the same sounds at the same moments through the autoplay path, silent until the visitor has used the page. Respects the global sound switch and `enableSound`.

## Acceptance checklist

- [ ] Sign up grows a Full name field and swaps the heading and button; Sign in folds it away.
- [ ] Magic link folds the password away and changes the button to "Email me a link".
- [ ] Sending shows a spinner for about 0.9 s, then "Check your inbox" with the typed address.
- [ ] Resend unlocks after 30 s and restarts the timer when used.
- [ ] No password or name value is read, stored or logged anywhere.
- [ ] Autoplay loops and stops on first touch; reduced motion makes everything instant.
- [ ] Dark mode swaps the card, fields, thumb, badge and link colours.
- [ ] At 360px wide the card shrinks to fit with no horizontal scroll.
