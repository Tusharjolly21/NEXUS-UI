# Parallax Stack Hero

Build a split hero: copy and an email capture on the left, and on the right a stack of three product UI cards (inbox, meeting, payment) that drift with the pointer at different depths and float gently. The email field shakes on a bad address and turns into a confirmation in place. It should feel calm, layered and tactile.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries: `@container`, `@sm:`, `@lg:`, `@2xl:`, `@4xl:`), framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), and a `cn` helper.
- File: `components/parallax-stack-hero/parallax-stack-hero.tsx`, named export `ParallaxStackHero` and type `ParallaxStackHeroProps`.

## API

Every prop is optional; with none the block renders exactly the copy below. Text props render as plain text.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"2,400 teams joined this month"` | Accent line beside the live dot. |
| `headline` | `string` | `"Run the whole week from one calm inbox."` | The `h1`, split on whitespace into words that rise in one by one. Past 40 words the rest fades in as one span. |
| `highlight` | `string` | `"calm"` | Word(s) tinted in the accent: a headline word is tinted when, lower-cased and stripped of leading/trailing punctuation, it equals one of these words (stripped the same way). Empty tints nothing. |
| `description` | `string` | `"Messages, meetings and payments land in one place, sorted by what needs you first."` | Paragraph under the headline. |
| `ctaLabel` | `string` | `"Join free"` | Submit button label. |
| `pendingLabel` | `string` | `"Joining…"` | Button label while `onSubmit` is pending. |
| `placeholder` | `string` | `"you@company.com"` | Email field placeholder. |
| `note` | `string` | `"Free for 14 days. No card needed."` | Hint before submitting. |
| `successNote` | `string` | `"You're on the list."` | Hint after a successful submit. |
| `errorNote` | `string` | `"That email doesn't look right."` | Hint for an invalid email or a rejected `onSubmit`. |
| `accent` | `string` | `"#5e5ce6"` | Live dot, the highlighted word, buttons, badges and the glow. |
| `accentDark` | `string` | — | Dark accent. If omitted: `#7d7aff` when `accent` is the default, else `accent`. |
| `autoplay` | `boolean` | `true` | Cards float and the live dot pulses. |
| `onSubmit` | `(email: string) => void \| Promise<void>` | — | Receives the trimmed, validated email. Throw/reject to show the error state. Nothing is sent by the block. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Root `<section>`: `@container`, relative, overflow hidden, bg `#fbfbfd` / black, padding 20px sides, 64px vertical (80px from `@2xl`). Sets `--mk-accent` and `--mk-accent-dark`.
- Glow: 560×560 circle at `right: -160px; top: 40px`, `radial-gradient(closest-side, accent 18%, transparent)` (dark 24%), `blur-3xl`, `aria-hidden`.
- Grid: max-width 1120px, single column with 48px gap; from `@4xl` columns `1fr 1.05fr`, gap 56px, items centred.
- Left column: flex column, start-aligned, gap 20px (24px from `@2xl`).
  - Eyebrow: 14px semibold accent, 8px gap, a 8×8 accent dot with a pulsing ring behind it, text `eyebrow` ("2,400 teams joined this month").
  - `<h1>` `headline` ("Run the whole week from one calm inbox."), each word an inline-block with 0.22em gap; `highlight` words ("calm") in the accent. Size `clamp(38px, 7cqi, 76px)` (from `@4xl` `clamp(42px, 6cqi, 76px)`), semibold, line-height 1, tracking −0.05em, `#1d1d1f` / `#f5f5f7`.
  - Paragraph: max-width 480px, `clamp(16px, 2.4cqi, 19px)`, line-height 1.45, `#6e6e73` / `#a1a1a6`: `description`.
  - Form: max-width 460px, `noValidate`. Field row: fully rounded, padding 6px, gap 8px, white / `#1c1c1e`, ring `0 0 0 1px rgba(0,0,0,.08)` / `#3a3a3c`; on error a 2px `#ff3b30` / `#ff453a` ring. Input 44px tall, 16px text (15px from `@sm`), placeholder `placeholder` (`#a1a1a6` / `#6e6e73`). Button 44px, padding 0 20px, 15px medium white on accent: `ctaLabel` / `pendingLabel` while busy (opacity .7 disabled).
  - Hint under the field (13px, 12px top margin, 16px side padding): `note` (`#86868b` / `#a1a1a6`); error `errorNote` (`#d70015` / `#ff6961`); done `successNote`.
- Right column: relative stage 420px tall (460px from `@lg`), max-width 520px, centred, `aria-hidden`. Card surface: radius 22px, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -30px rgba(0,0,0,.35)` (dark `#3a3a3c`, `.9`).
  1. Inbox (depth 0.6): `left 0, top 2%, width 88%`; from `@lg` `left 6%, top 4%, width 78%`. Padding 16px (20px `@lg`). Header "Inbox" 13px semibold + "12 new" accent badge (11px). Rows with a top hairline, 10px vertical padding: 32px initials avatars — Maya Chen "Q3 board deck, final" `#ff9f0a`; Leo Park "Can we move standup?" `#30d158`; Billing "Invoice #2041 paid" `#0a84ff`. Name 13px semibold, line 12px grey, both truncate.
  2. Meeting (depth 1.2, float 10): `right 0, top 46%, width 64%`; from `@lg` `top 44%, width 58%`. "Today, 2:30 PM" 12px grey, "Design review" 16px semibold, four overlapping 28px avatars (`#ff375f`, `#5e5ce6`, `#30d158`, `#ff9f0a`, 2px white / `#1c1c1e` border, −8px overlap), then "Join" (accent) and "Later" (`#f5f5f7` / `#2c2c2e`) pills, 12px semibold.
  3. Payment (depth 1.8, float 6): `left 0, top 72%, width 64%`; from `@lg` `top 66%, width 50%`. A 40px green circle (`#30d158` at 15%/20%, icon `#248a3d` / `#30d158`, up arrow) beside "Payment received" (12px grey) and "$4,200.00" (18px semibold, tabular).

## Motion

- Easing `[0.16, 1, 0.3, 1]`.
- Pointer parallax: on mouse `pointermove`, raw x/y = (pointer fraction − 0.5) × 30; both pass through `useSpring` stiffness 80, damping 18. Each card layer translates by `value × depth`. Reset to 0 on leave. Disabled under reduced motion.
- Each card has three nested layers: parallax offset → entrance (`opacity 0, y 40, scale .92` → rest, 1s, delays 0.3 / 0.5 / 0.7) → float loop (`y: [0, −float, 0]`, duration `5 + depth` s, easeInOut, infinite, delay `entrance delay + 1`; float defaults to 8px). When still, y = 0.
- Inbox rows: `opacity 0, x −10` → rest, delay `1 + k × 0.12`. Meeting avatars pop from scale 0, spring 500/15, delay `1.3 + k × 0.08`.
- Live dot ring: `scale [1, 2.4]`, `opacity [.6, 0]`, 1.6s, infinite.
- Headline words: `opacity 0, y 30, blur(10px)` → rest, 0.9s, delay `0.1 + k × 0.06`. Eyebrow 0.7s; paragraph delay .45; form delay .6.
- Bad email: form `x: [0, −10, 9, −6, 4, 0]` over 0.45s. Field row is a `layout` element with spring 400/32.
- Done: field content exits to `opacity 0, blur(6px)` (`AnimatePresence mode="popLayout"`); confirmation enters `opacity 0, scale .9` with spring 400/24; a 32px `#30d158` check circle pops (spring 500/14, delay .1) and its check `M5 12.5l4.5 4.5L19 7.5` draws `pathLength 0 → 1` 0.4s delay .25. Text: "Check **{email}** for your invite."

## Interaction and states

- States: `idle | bad | busy | done`. Submit ignores while busy or done. Trim and cap at 254 chars, test `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`. Invalid → `bad`, back to `idle` after 600ms. Valid → `busy`, await `onSubmit`, then `done`; a throw goes to `bad`.
- Guard state updates after unmount; clear the timer on unmount.

## Autoplay demo

`autoplay` controls only ambience: floating cards and the pulsing dot. With it off (or reduced motion) the cards hold still and the dot is solid; the pointer parallax stays unless reduced motion is on.

## Accessibility

- Visually hidden label "Work email" tied to the input via `useId`; `type="email"`, `inputMode="email"`, `autoComplete="email"`, `aria-invalid` on error, `aria-describedby` → the hint, which is `aria-live="polite"`.
- The card stack is decorative (`aria-hidden`).
- Submit button focus ring: 2px accent, 2px offset.

## Acceptance checklist

- [ ] Two columns from ~896px container width, stacked below.
- [ ] Three cards enter one after another and float at different rates.
- [ ] Moving the mouse shifts the payment card most and the inbox least.
- [ ] "calm" is in the accent; changing `accent` recolours dot, badges, buttons and glow; changing `highlight` moves the tint.
- [ ] Submitting "abc" shakes the form, shows a red ring and the error hint, then clears after 0.6s.
- [ ] A valid email shows "Joining…", then morphs into the green check confirmation.
- [ ] A rejecting `onSubmit` shows the error state instead.
- [ ] `autoplay={false}` stops floating and pulsing.
- [ ] Reduced motion removes parallax and loops.
- [ ] Dark mode swaps surfaces and uses `#7d7aff` for the default accent.
