# Waitlist CTA

Build a waitlist call to action that makes joining feel like something happened. The visitor enters an email; the button shrinks into a spinner; then the whole form folds into their place in line: the count ticks over by one, their avatar pops onto the front of an overlapping crowd, and a referral link appears to move them up. A bad address shakes the form. Apple-light, soft and confident. Nothing is stored or sent.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `animate`, `useReducedMotion`), a `cn` helper and the `useSound` hook from `@/lib/ui-sounds`.
- File: `components/blocks/waitlist-cta.tsx`, named export `WaitlistCta`, types `WaitlistCtaProps` and `WaitlistCtaMember`, and the demo array `DEFAULT_WAITLIST_CROWD`.

## API

`WaitlistCtaMember`: `{ initials: string; hue: string }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `heading` | `string` | `"Get Nexus Pro before everyone else."` | Big heading. |
| `description` | `string` | `"Early members get every block, every template, and a say in what we build next."` | Line under the heading. |
| `buttonLabel` | `string` | `"Join waitlist"` | Join button text. |
| `placeholder` | `string` | `"you@company.com"` | Email placeholder. |
| `crowd` | `WaitlistCtaMember[]` | MC `#ff9f0a`, LP `#0a84ff`, AL `#bf5af2`, NH `#30d158`, KI `#5e5ce6` | Avatars already on the list. |
| `baseCount` | `number` | `1283` | Count before the visitor joins; they become `baseCount + 1`. |
| `referralBase` | `string` | `"nexus-ui.com/pro"` | Host and path of the referral link; `?ref=<handle>42` is added. |
| `autoplay` | `boolean` | `false` | Types an address and joins by itself on a loop until touched. |
| `enableSound` | `boolean` | `true` | Taps on Join and chimes when the place appears. |
| `onJoin` | `(email: string) => void` | none | Called with a valid address. The block itself stores and sends nothing. |
| `className` | `string` | none | Extra classes on the section. |

## Layout and look

- Root `<section aria-label="Join the waitlist">`: full width, background white / dark `#000`, 48px vertical and 16px side padding. Inside, a centred card, `max-width: 1080px`, radius 28px, `overflow: hidden`, background `#f5f5f7` / dark `#1c1c1e`, padding 48px 24px (64px vertical from 640px), text centred. A decorative dot grid fills the card: `radial-gradient(rgba(0,0,0,.08) 1px, transparent 1px)` (dark `rgba(255,255,255,.1)`) on an 18px grid, 60% opacity, masked by an ellipse (60% by 60% at 50% 40%) fading to transparent, `aria-hidden`.
- Content column `max-width: 560px`, centred. Heading `clamp(30px, 5vw, 48px)` semibold, line-height 1.05, tracking -0.04em, `#1d1d1f` / `#f5f5f7`. Description 16px below, 17px / 1.5, `max-width: 420px`, `#6e6e73` / `#a1a1a6`.
- Crowd row, 28px below, centred, wraps, 12px gap: avatars 36px round, 11px semibold white initials, -8px overlap (the first has none), a 3px ring in the card colour, descending z-index; then "**1,283** on the list" 14px, tabular, number in ink.
- Form area, 28px below, `max-width: 440px`, centred. Idle: a 56px tall pill, white / dark `#2c2c2e`, padding 6px 6px 6px 20px, shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -18px rgba(0,0,0,.35)` (dark: hairline `rgba(255,255,255,.08)` and a heavier drop). A borderless 16px email input fills it; a 44px tall, 132px wide pill button, 15px medium, background `#1d1d1f` (dark `#f5f5f7`) with white (dark `#1d1d1f`) text.
- Joined: the same box becomes a card, radius 26px, padding 20px, left aligned. A row "You're in." 17px semibold and "Place **#1,284**" 14px tabular on the right; "Invite 3 friends and skip 500 places." 13.5px secondary; a 44px tall link row (radius 12px, `#f5f5f7` / dark `#1c1c1e`) holding the link text, 13.5px truncated, and a 36px "Copy link" button (radius 9px, 13px semibold, white / dark `#48484a`); a progress row of three 6px high pills (`#ececf0` / dark `#3a3a3c`) with "0/3" 11.5px secondary.

## Motion

- Box morph: the form and the joined card share a `layoutId`; `AnimatePresence mode="popLayout"` swaps them with a spring, stiffness 300, damping 30.
- Busy: the button width springs from 132px to 44px (stiffness 400, damping 30) and shows a 16px spinner (2px ring, 30% white with a white top, rotating 360 degrees every 0.7 s). The input is disabled.
- After 900 ms the box becomes the joined card. The card's content fades up 6px after 0.2 s. The count animates from `baseCount` to `baseCount + 1` over 0.8 s after a 0.3 s delay (rounded, tabular). The visitor's avatar (two letters of the address before the "@", uppercase, ink background with a light-on-dark swap) is added at the front of the crowd after 0.35 s, scaling in from 0 and 10px left (spring stiffness 500, damping 22), and the others shift along.
- Bad address: the form shakes on x, `[0, -10, 9, -5, 0]` over 0.4 s, and an `aria-invalid` flag clears after 450 ms.
- Copy link writes the full URL to the clipboard, and the button reads "Copied" for 1.5 s.
- Reduced motion: no shake, no spinner (the button reads "Joining" for 400 ms), no layout morph, no spring on avatars (opacity only), the count changes at once.

## Interaction and states

- Form is `noValidate`; submit checks `^\S+@\S+\.\S+$`. Invalid: shake, no state change. Valid: calls `onJoin`, enters busy, then joined. There is no way back from joined except a remount.
- The handle is the part before "@" with non letters and digits removed, up to 12 characters; the referral link is `referralBase + "?ref=" + handle.toLowerCase() + "42"`. The address is not stored anywhere.
- A visually hidden polite status says "Enter a valid email address.", "You are in. Place number 1,284." or "Link copied.".
- All timers and the count animation are cleared on unmount.

## Autoplay demo

`autoplay` (default false), 8 s loop: reset; at 0.9 s type `sam@studio.co` one character per 60 ms; at 2.0 s press Join; the joined card shows (after the 0.9 s busy beat); at 7.6 s reset. It stops on the visitor's first pointer or key interaction (a demo caught half way is cleared so the form is ready), pauses off screen and in a hidden tab, and never runs under reduced motion. The preview passes `autoplay`.

## Accessibility

- Real form, labelled input (`aria-label="Email address"`), real buttons, 2px `#0071e3` (dark `#0a84ff`) focus outline with 2px offset. Placeholder and secondary text at 4.5:1 or better in both themes.
- The avatar row, dot grid and progress pills are `aria-hidden` or labelled as images ("0 of 3 friends joined").
- No network calls.

## Sound

- Join pressed (button or Enter): `tap`, volume 0.5.
- The place appears: `success`, volume 0.6, once.
- Nothing for the shake, copying, the count or typing. In autoplay the same two sounds play through the autoplay path (silent until the visitor has used the page). Respects the global sound switch and `enableSound`.

## Acceptance checklist

- [ ] Idle shows the form, crowd and "1,283 on the list".
- [ ] A bad address shakes the form and announces an error.
- [ ] A valid address shrinks the button to a spinner, then morphs into the joined card; the count reads 1,284 and the visitor's avatar leads the crowd.
- [ ] Copy link shows "Copied" for 1.5 s.
- [ ] Autoplay loops and hands over cleanly on first touch.
- [ ] Reduced motion removes the shake, spinner and morph.
- [ ] Dark mode swaps the card, box, button, ring and dot grid colours.
- [ ] At 360px wide the crowd row wraps and nothing overflows.
