# Split Contact Glass

Build a contact page section as a rounded two-pane card. The left pane is a softly lit glass panel: heading, intro, a card showing the team's local time on a small analog clock whose second hand ticks with a springy overshoot, a one-tap copyable email card, and a reply-time note. The right pane is a short form: name and email, topic chips with a sliding selection, a message box with a filling character ring, and a Send button whose paper plane takes off when the message goes. On success the form swaps for a thank-you.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[560px]:`, `@[760px]:`), framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`, `Intl.DateTimeFormat`, `navigator.clipboard`.
- File: `components/split-contact-glass/split-contact-glass.tsx`, named export `SplitContact`, types `SplitContactProps` and `SplitContactValues` (`{ name; email; topic; message }`, all strings).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `heading` | `string` | `"Let's build something good"` | Left heading. |
| `intro` | `string` | "Tell us what you're making. A designer and an engineer read every message." | Empty hides it. |
| `email` | `string` | `"hello@studio.dev"` | Copied on click. |
| `location` | `string` | `"Lisbon, Portugal"` | Above the time. |
| `timeZone` | `string` | `"Europe/Lisbon"` | IANA zone; invalid zones fall back to local. |
| `replyTime` | `string` | `"Replies within a day"` | Note and thank-you text. |
| `topics` | `string[]` | Custom work, Partnership, Support, Press | Chips; first selected. |
| `onSubmit` | `(values) => Promise<void> \| void` | — | Called with trimmed values after validation; throw an `Error` to show its message. Without it, simulate 1000ms. |
| `maxLength` | `number` | `500` | Message limit. |
| `autoplay` | `boolean` | `false` | Types and sends a demo on a loop until touched. |
| `className` | `string` | `""` | Section classes. |

## Layout and look

- `<section aria-labelledby={heading id}>`: `@container`, overflow hidden, radius 28px, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`). Two equal columns at ≥560px. Ink `#1d1d1f` / `#f5f5f7`; soft `#6e6e73` / `#a1a1a6`; focus ring 2px `#0071e3` / `#0a84ff`.
- Left pane: padding 24px (28px at ≥560px), background layer `radial-gradient(70% 60% at 100% 0%, rgba(255,159,10,.32), transparent 70%), radial-gradient(80% 70% at 0% 100%, rgba(90,200,250,.4), transparent 70%), #f5f5f7`; dark `rgba(255,159,10,.22)`, `rgba(10,132,255,.3)`, `#232326`. `<h2>` 26px semibold, line-height 1.08, tracking −0.04em, balanced. Intro 14px relaxed soft, 10px top. Cards (20px top, 8px apart): radius 16px, padding 10px, gap 12px, `white/70` with 1px `white/80` ring and `backdrop-blur-md` (dark `white/6`, ring `white/10`).
  - Time card: clock + location (12px soft) + "{h:mm AM}" 15px semibold tabular with " local time" 12px soft ("--:--" before mount).
  - Clock: 44px white circle (dark `#2c2c2e`), shadow `0 0 0 1px rgba(0,0,0,.08), 0 4px 10px -4px rgba(0,0,0,.25)`; twelve 1×3px `#86868b` ticks 3px from the edge; hour hand 2.5×11px and minute hand 2×16px in ink, rounded; second hand 1×18px `#ff9f0a`; 5px orange hub. Hands rotate from their bottom centre.
  - Email card (button, hover white / `white/10`): 44px blue circle with an 18px envelope; "Email us" (or "Copied to clipboard") 12px soft, email 15px semibold truncating; a 16px copy icon that swaps to a green check (`#248a3d` / `#30d158`).
  - Reply note: 12.5px soft with a 6px green dot.
- Right pane: padding 24px (28px), 12px vertical rhythm.
  - Fields: radius 12px, `#f5f5f7` / `#2c2c2e`, padding 0 14px, 14.5px, 1px `black/4` ring (dark `white/6`); focus turns white with a 2px blue ring. Name and Email 44px tall, side by side at ≥760px (gap 10px).
  - Topic chips (`role="radiogroup"`, gap 6px): rounded-full, padding 6px 12px, 13px medium; off `#f5f5f7` / `#2c2c2e` soft; on white over a shared `layoutId` pill `#1d1d1f` (dark `#0a84ff`).
  - Message: 3 rows, no resize, padding 12px (48px right). Count ring bottom-right 10px: 20px SVG rotated −90°, track r 8 stroke 2.4 `#e8e8ed` / `#3a3a3c`, round-capped progress, dasharray 50.27, blue, orange `#ff9f0a` past 90%.
  - Footer row: "N characters left" 12.5px soft, or the error in `#d70015` / `#ff6961` (`role="alert"`); Send 44px pill (padding 20px / 16px), 14.5px semibold white on blue (hover `#0077ed`), shadow `0 10px 24px -12px rgba(0,113,227,.9)`, overflow visible, "Send" / "Sending", 16px paper plane (`M17.5 2.5 9 11M17.5 2.5l-5 15-3.5-6.5L2.5 7.5l15-5Z`).
  - Sent view (`role="status"`, min-height 320px, centred): 56px `#30d158` circle, shadow `0 12px 30px -10px rgba(48,209,88,.8)`, 28px check; "Message sent" 20px semibold; "Thanks, {first name}. {replyTime}." 14px soft; "Send another" text button `#0066cc` / `#64b5ff`.

## Motion

- Clock: read the zone time every second in an effect (never on the server). Angles: second `s·6`, minute `m·6 + s·0.1`, hour `(h mod 12)·30 + m·0.5`, each plus an accumulated base that adds a full lap (360·60, 360·24, 720) when the time wraps, so hands never spin backwards. Second hand spring stiffness 380, damping 14 (visible tick overshoot); minute and hour 120/20. Jump on the first reading.
- Ring: spring 200/22 toward `min(1, length/maxLength)`; `strokeDashoffset = (1 − v)·50.27`.
- Chips: shared `layoutId` pill, spring 500/30.
- Copy icon swap: `AnimatePresence mode="popLayout"`, scale .4 ↔ 1 with opacity, spring 600/22. "Copied" reverts after 1600ms.
- Plane on send: keyframes x `[0, −4, 70]`, y `[0, 2, −46]`, rotate `[0, −10, −24]`, opacity `[1, 1, 0]`, scale `[1, 1.1, .6]`, 0.75s, times `[0, .25, 1]`, eases easeOut then easeIn (a wind-up, then launch). Resets instantly.
- Form ↔ sent: `AnimatePresence mode="popLayout"`. Form in from `opacity 0, scale .97` (spring 300/26); sent in from `opacity 0, y 14, scale .96` (spring 300/24); exits fade to scale .97. Check draws `pathLength 0 → 1`, .45s, delay .1.
- Send `whileTap` scale .95.
- Reduced motion: clock second spring 2000/200, no plane flight, instant swaps and chip slide, no tap scale.

## Interaction and states

- Phases `idle | sending | sent`. Inputs, chips and Send are disabled unless idle. Name and email are capped at 200 characters, message at `maxLength`. Typing clears the error.
- Validation in order: name required ("Add your name so we know who to reply to."), email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` ("Add an email we can reply to."), message ≥10 trimmed characters ("Tell us a little more (10+ characters)."). On a thrown error return to idle and show `err.message` or "That didn't send. Try again in a moment."
- "Send another" resets values and phase. Clipboard failures are ignored (still shows "Copied"). Ignore async results after unmount.
- Any pointer down or key down in the section marks it touched.

## Autoplay demo

Starting at 600ms, schedule: type "Jonah Reyes" (45ms per char), "jonah@kitefly.co" (35ms per char), select the first three topics 450ms apart, type "We're building a travel app and would love your help with the motion system." two characters at a time every 28ms; +500ms start sending (plane flies), +1000ms sent, +2600ms reset, +500ms loop. Every step is skipped once touched; clear timers on unmount.

## Accessibility

- `sr-only` labels for fields; textarea `aria-describedby` an `sr-only` "N of 500 characters". Topic chips are `role="radio"` with `aria-checked`. Email card `aria-label="Copy {email}"`, its status line `aria-live="polite"`. Clock and icons are `aria-hidden`.

## Acceptance checklist

- [ ] The clock shows the zone's time and the second hand ticks with a small overshoot each second.
- [ ] Clicking the email card copies it and shows a green check for 1.6s.
- [ ] The ring fills as you type and turns orange past 90%.
- [ ] Invalid input shows the matching message in red.
- [ ] Sending launches the plane up and right, then shows "Message sent" with a drawn check and the first name.
- [ ] Layout is one column under a 560px container.
- [ ] Autoplay types, sends and resets in a loop until touched.
