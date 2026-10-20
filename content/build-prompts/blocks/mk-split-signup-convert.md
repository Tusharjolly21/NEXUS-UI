# Split Signup Convert

Build a signup section as a rounded two-panel card. The left value panel makes the pitch over a soft coloured wash: a "Free forever plan" pill, a headline, a subhead, three benefits, a green progress line and an avatar social-proof row. The right panel is a short form: Google and GitHub buttons, a work email that confirms itself with a popping check, and a password with a four-segment strength meter whose segments pop in. As the form fills, the benefits on the left tick themselves off and the progress line grows, so the page shows what you are about to get.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[540px]:`, `@[720px]:`, `@[760px]:`), framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`.
- File: `components/split-signup-convert/split-signup-convert.tsx`, named exports `SplitSignup` and `passwordStrength`, types `SplitSignupProps` and `SplitSignupValues` (`{ email: string; password: string }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `headline` | `string` | `"Ship interfaces your team is proud of"` | Left headline. |
| `subhead` | `string` | "Start free. No card, no sales call. Invite your team when you're ready." | Under the headline. |
| `benefits` | `string[]` | "Every component, live and editable", "One-line installs with the CLI", "Light and dark out of the box" | Tick off as the form fills. |
| `badge` | `string` | `"Free forever plan"` | Pill; empty hides it. |
| `proof` | `string` | `"Joined by 12,000 teams this year"` | Avatar row; empty hides it. |
| `submitLabel` | `string` | `"Create workspace"` | Button label. |
| `onSubmit` | `(values) => Promise<void> \| void` | — | After validation, with trimmed email; throw an `Error` to show its message. Without it, simulate 1000ms success. |
| `showSso` | `boolean` | `true` | Show SSO buttons. |
| `onSso` | `(provider: "google" \| "github") => void` | — | SSO click. |
| `onSignIn` | `() => void` | — | Shows "Already have an account? Sign in" when set. |
| `autoplay` | `boolean` | `false` | Types a demo signup on a loop until touched. |
| `className` | `string` | `""` | Root classes. |

`passwordStrength(pw)` returns 0–4: 0 for empty, then +1 each for length ≥8, mixed case, a digit, and a symbol or length ≥14.

## Layout and look

- Root: `@container`, overflow hidden, radius 28px, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`). Columns `1fr 1.1fr` at ≥540px. Ink `#1d1d1f` / `#f5f5f7`; soft `#6e6e73` / `#a1a1a6`; focus ring 2px `#0071e3` / `#0a84ff`.
- Value panel: padding 24px (28px at ≥540px). Wash `radial-gradient(80% 60% at 0% 0%, rgba(90,200,250,.45), transparent 70%), radial-gradient(70% 60% at 100% 100%, rgba(191,90,242,.35), transparent 70%), linear-gradient(180deg, #f5f5f7, #ececf1)`; dark `rgba(10,132,255,.35)`, `rgba(191,90,242,.28)`, `#232326 → #18181a`.
  - Badge: rounded-full, `white/70` (dark `white/10`), 1px `black/5` ring (dark `white/10`), blur, padding 4px 10px, 12px medium, 6px green `#30d158` dot.
  - `<h2>` 16px below: 24px (30px at ≥760px), semibold, line-height 1.08, tracking −0.04em, balanced.
  - Subhead 14px relaxed soft, 10px top; hidden between 540px and 720px containers.
  - Benefits `<ul aria-label="What you get">`, 20px top, 10px apart: a 20px circle (green when done, `rgba(255,255,255,.5)` otherwise) with a 12px check (stroke 2.4, white when done, `#86868b` when not), then 13.5px snug ink text.
  - Progress line: 20px top, 4px tall, rounded, track `black/6` / `white/10`, green fill.
  - Proof: 20px top, four 24px overlapping avatars (−8px overlap, 2px white ring / `#1c1c1e`) with gradients `#ffb38a→#ff375f`, `#5ac8fa→#0071e3`, `#b7f7c5→#0b8f6a`, `#d0b3ff→#7d3cff` at 135°, then 12.5px soft text.
- Form panel: padding 24px (28px). `<h3>` "Create your workspace" 19px semibold tracking −0.03em; "Takes about a minute." 13.5px soft.
  - SSO row (16px top, gap 8px): two 40px buttons, radius 12px, white with 1px `black/8` ring (dark `#2c2c2e`, `white/10`), 13.5px medium, 16px Google and GitHub marks. Divider: 14px vertical margin, 1px lines `black/8` / `white/10` around "or" 12px soft.
  - Fields (10px apart): 44px label wrappers, radius 12px, `#f5f5f7` / `#2c2c2e`, padding 0 14px, 1px `black/4` ring (dark `white/6`); focus-within white (light only) with a 2px blue ring. Inputs 14.5px. A valid email shows a 20px green circle with a white check. Password has a "Show"/"Hide" toggle, 12.5px medium `#0066cc` / `#64b5ff`.
  - Meter (8px below): four 6px rounded segments (gap 4px) on `#e8e8ed` / `#3a3a3c`, lit ones in the level colour; a 64px right-aligned 12px medium label: "Strength" when empty, else Too short / Weak / Fair / Good / Strong. Fills `#d2d2d7 #ff3b30 #ff9f0a #0a84ff #30d158`; label colours grey, `#d70015`/`#ff6961`, `#b25000`/`#ffb340`, `#0066cc`/`#64b5ff`, `#248a3d`/`#30d158`.
  - Submit: 16px top, full width, 44px, radius 12px, blue, 15px semibold white, shadow `0 10px 24px -12px rgba(0,113,227,.9)`.
  - Footnote (10px top, centred, 12.5px): the error in red (`role="alert"`), else the sign-in line, else "By continuing you agree to the Terms and Privacy Policy."
  - Done view (`role="status"`, min-height 330px, centred): 56px green circle, shadow `0 12px 30px -10px rgba(48,209,88,.8)`, 28px check; "Your workspace is ready" 20px semibold; "We sent a link to {email} to confirm it's you." 14px soft.

## Motion

- Progress: `email valid ? 0.4 : 0` plus `score × 0.15` (1 when done). Benefit i ticks when progress ≥ `(i+1)/count`. The line width follows a spring (stiffness 140, damping 20).
- Benefit tick: circle colour change with a scale pulse `[1, 1.25, 1]`, .4s, ease `[0.3, 1.6, 0.5, 1]`; check `pathLength 0.001 → 1` and opacity .5 → 1 in .35s.
- Segments: `scaleX 0 → 1` from the left with a bouncy spring (520/17); colour fades .2s.
- Email check: scale 0 → 1, spring 600/16, exits the same way.
- Button label: `AnimatePresence mode="popLayout"`, enter from y 8, exit to y −8. Pending shows three 6px white dots bouncing `y [0, −4, 0]`, .6s, staggered .12s, forever. `whileTap` scale .98.
- Form ↔ done: form in from `opacity 0, scale .97` (spring 320/26); done in from `opacity 0, y 12, scale .96` (320/24); exits to `opacity 0, scale .97`. Done check draws in .45s after .1s.
- Reduced motion: instant swaps, segments and ticks without spring or pulse, no dot bounce, no tap scale.

## Interaction and states

- States `idle | pending | done`; inputs and SSO disabled unless idle. Typing clears the error.
- Validation: email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` ("Enter a valid work email."), then strength ≥2 ("Pick a stronger password: 8+ characters with a mix."). Thrown errors return to idle with `err.message` or "Something went wrong. Try again." Ignore results after unmount.
- Pointer down or key down anywhere marks the section touched.

## Autoplay demo

From 700ms: type "mei@northwind.co" at 50ms per character, pause 300ms, type "Orbit-2026!" at 110ms per character (the meter climbs, benefits tick), +500ms pending, +1000ms done, +2600ms reset to empty, +600ms loop. Skip every step once touched and clear timers on unmount.

## Accessibility

- `sr-only` labels "Work email" and "Password"; the password `aria-describedby` the strength label, which is `aria-live="polite"`. Show toggle has `aria-pressed`. Pending dots carry `aria-label="Creating workspace"`. Benefits append an `sr-only` " (ready)" when ticked. Decorative wash, line, avatars, meter and checks are `aria-hidden`.

## Acceptance checklist

- [ ] A valid email pops a green check and ticks the first benefit.
- [ ] Each strength level pops another segment in the level colour and the label updates.
- [ ] Benefits tick in order and the green line grows smoothly.
- [ ] Weak passwords and bad emails show the right red message.
- [ ] Submit shows bouncing dots, then the "workspace is ready" view with the email.
- [ ] Stacks to one column under 540px; subhead hides between 540px and 720px.
- [ ] Autoplay types and completes a signup in a loop until touched.
