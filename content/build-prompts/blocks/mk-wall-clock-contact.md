# Wall Clock Contact

Build a contact section around a turned-aluminium wall clock that runs on the office's time, not the visitor's. The open hours are marked as an arc on the dial, a quartz second hand ticks with a little overshoot, and beside the clock sit "Open now" or "Closed right now", when that changes, an email that copies with one press and a phone number that dials. Next to it is a compose sheet addressed to whoever covers the topic you pick. Send the message and the sheet flies off, the clock's hands sweep forward to the time you will hear back and leave a pip on the dial there, then settle back to now. The page is calm and light; the clock is a physical object and stays pale metal on a dark page too.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 and framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useAnimationControls`, `useInView`, `useMotionValue`, `useSpring`, `useReducedMotion`). Imports `cn` from `@/lib/utils`. No other libraries.
- Icons are six Framework7 Icons (MIT, via Iconify) kept as inline SVG path data: `envelope`, `phone`, `arrow-up-right`, `checkmark-alt`, `doc-on-doc`, `paperplane-fill` (56 x 56 viewBox, `currentColor`). Put a comment crediting Framework7 Icons above them.
- File: `components/blocks/wall-clock-contact.tsx`, named export `WallClockContact`, types `WallClockContactProps`, `WallClockContactPerson` and `WallClockContactMessage`.
- Nothing is sent anywhere. The block never calls `fetch`; it reports the message through `onSend` and shows its own confirmation.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Talk to a person."` | Heading (an `h2`). |
| `subtitle` | `string` | `"A real team reads every message. This is their clock."` | Line under the heading. Empty hides it. |
| `city` | `string` | `"London"` | Printed on the dial (capitals) and in "14:32 in London" and "by 16:30 London time". |
| `timeZone` | `string` | `"Europe/London"` | IANA zone the clock keeps. An unknown zone falls back to UTC. |
| `openHour` | `number` | `9` | Opening hour, 0 to 24, decimals allowed (9.5 is 09:30). |
| `closeHour` | `number` | `18` | Closing hour, 0 to 24, must be later than `openHour` (otherwise 9 to 18 is used). |
| `openDays` | `number[]` | `[1, 2, 3, 4, 5]` | Open days, 0 (Sunday) to 6. Invalid or empty falls back to Monday to Friday. |
| `replyAfterHours` | `number` | `2` | Working hours between sending and the reply. |
| `team` | `WallClockContactPerson[]` | Amara (Sales), Jon (Support), Priya (Partnerships), Theo (Press) | Who answers which topic. The first is selected by default. An empty array uses the default team. |
| `email` | `string` | `"hello@studio.example"` | Address that copies on press. |
| `phone` | `string` | `"+44 20 7946 0321"` | Number that dials (`tel:` with spaces removed). |
| `accent` | `string` | `"#0071e3"` | Accent on the light theme. Also the Send button fill behind white text, so keep it dark enough for that. |
| `accentDark` | `string` | `"#2997ff"` | Accent on the dark theme (text, focus bars, check mark). |
| `onSend` | `(message: WallClockContactMessage) => void` | none | Called with the validated, trimmed message on a real send. Never called by the autoplay demo. |
| `autoplay` | `boolean` | `true` | Writes a message and sends it by itself until the first pointer, key or touch. Off under reduced motion; paused while under 30% in view. |
| `className` | `string` | none | Extra classes on the outer section. |

`WallClockContactPerson` is `{ name: string; topic: string }`. `WallClockContactMessage` is `{ topic, recipient, name, email, message, replyBy }` where `replyBy` is the promised time in the office's time, for example `"by 16:30"`, `"tomorrow by 10:30"` or `"on Monday by 10:00"`.

## Time (hydration-safe)

- Never read the clock during render. The server and the first client render draw the same rest pose (ten past ten, status "Office hours", a line saying the hours are on the dial). "Now" is set from an effect: a `setTimeout(…, 0)` then a 1s `setInterval` (15s under reduced motion), only while the block is at least 30% in view. Handlers (Send) may call `new Date()`.
- `framer-motion`'s `useReducedMotion` reads the media query on the first client render, so combine it with a hydration flag (`useSyncExternalStore(() => () => {}, () => true, () => false)`) before using it to change markup. Otherwise a reduced-motion visitor gets a hydration mismatch.
- The office's weekday, hour, minute and second come from a cached `Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour, minute, second: numeric, hourCycle: "h23" }).formatToParts`; a thrown `RangeError` (bad zone) falls back to UTC; hour is taken `% 24`.
- Open now: the day is in `openDays` and `openHour <= time < closeHour`. Line under "Open now": "Closes in 3h 28m". Closed: find the next open day; if it opens in under 12 hours, "Opens in 2h 10m", otherwise "Opens tomorrow at 09:00" or "Opens Monday at 09:00". Durations under an hour read "13 min".
- Reply time: start at the office-local time, spend `replyAfterHours` of working time (skipping closed hours and closed days), round up to the next 10 minutes. Label: same day "by 16:30", next day "tomorrow by 10:30", later "on Monday by 10:00". Example (09:00 to 18:00, Monday to Friday, 2h): Monday 16:30 gives "tomorrow by 09:30"; Friday 17:00 gives "on Monday by 10:00"; Monday 07:00 gives "by 11:00".
- Days label: a contiguous run of three or more days reads "Mon to Fri", seven days "Every day", otherwise names joined by commas.

## Layout and look

- Root: a `section` with `@container`, full width, background `#f5f5f7` (dark: black), ink `#1d1d1f` (dark `#f5f5f7`), secondary `#6e6e73` (dark `#98989d`). The accent is passed as CSS variables `--mk-a` and `--mk-ad` on the root, and `--mk-x` is `var(--mk-a)` (dark: `var(--mk-ad)`); use `--mk-x` for text, rings and bars, and `--mk-a` for the always-light dial and the Send fill.
- Inner wrapper: `max-width: 1040px`, centred, padding 20px (32px from `@2xl`), 56px top and bottom (80px from `@2xl`), a grid with 40px gap. From `@4xl` it is two columns (`minmax(0,1fr) minmax(0,1.05fr)`, 56px gap, items start): the clock column on the left and the compose sheet on the right. Below that it is one column, clock column first.
- Heading: `clamp(30px, 6cqi, 48px)`, semibold, line height 1.05, tracking -0.035em. Subtitle 17px / 1.45, secondary, 12px below, max 380px.
- Clock row, 36px below the subtitle: a column (24px gap, left aligned) that becomes a row from `@xl` (32px gap, centred vertically). The clock is on the left; on the right:
  - a status line, 19px semibold: a 10px dot (green `#30d158` with a slow `animate-ping` halo while open and in view, orange `#ff9f0a` when closed, grey before "now" arrives) and "Open now" or "Closed right now" ("Office hours" before "now" arrives);
  - 6px below, 15px secondary: the open/close line;
  - 13.5px secondary: "14:32 in London", then "Mon to Fri, 09:00 to 18:00" (the range is `whitespace-nowrap` so it never splits "09:00 to / 18:00");
  - 16px below, 13.5px ink, max 300px, `aria-live="polite"` (`off` during the demo): "Send a message now and you will hear back by 16:30 London time." After a send it becomes "Amara will reply by 16:30 London time. That is the dot on the dial." with a 6px rise cross-fade (`AnimatePresence mode="popLayout"`).
- Contact card, 36px below: white (dark `#1c1c1e`), radius 20px, hairline ring `0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`). Two rows, 64px min height, padding 12px 16px, 12px gap, a 40px circle (`#f5f5f7`, dark `white/10`) with a 17px icon, a small 12.5px secondary label over a 15px ink value. Row one is the email (button, copies): label "Email", value truncated; on the right "Copy" (14px icon plus 13px medium text in the accent) that swaps to a green "Copied" (`#1c7c38`, dark `#30d158`) for 1.6s with an 8px vertical swap. Below `@sm` only the icon shows. Row two is the phone link: label "Phone" ("Phone, when we are open" while closed), tabular number, a small arrow-up-right on the right. Hover tint `black/[.025]` (dark `white/[.04]`); focus ring 2px inset in the accent. If the clipboard is blocked, pressing the email row opens `mailto:` instead.

### The clock

- Size `clamp(168px, 48cqi, 224px)`, square, round. The case is a conic gradient in brushed aluminium (`conic-gradient(from 210deg, #d4d4d9, #fbfbfc 12%, #c4c4ca 26%, #f4f4f6 40%, #cfcfd4 55%, #ffffff 68%, #c8c8cd 84%, #d4d4d9)`), padding 4.4% of the width, with fine turned rings (`repeating-radial-gradient(circle, transparent 0 1px, rgba(0,0,0,.035) 1px 2px)`) and a layered drop shadow (light: `0 1px 1px rgba(0,0,0,.18), 0 18px 34px -14px rgba(0,0,0,.35), 0 40px 70px -40px rgba(0,0,0,.3)` plus inner top highlight and bottom shade; dark: a deeper `0 22px 40px -14px rgba(0,0,0,.9)` and a 1px `white/8` ring, so the case still lifts off black). The clock stays light in dark mode.
- Dial: round, `radial-gradient(circle at 50% 40%, #fff, #f6f5f2 62%, #ebe9e4)`, an inset shadow `inset 0 4px 8px rgba(0,0,0,.22)`, and a paper grain (an inline SVG `feTurbulence` data URI at 35% opacity, multiply).
- Drawn in a 200 x 200 SVG: sixty ticks from radius 93 inwards (hour ticks reach radius 80, `#2a2a2c`, stroke 2.2, round caps; quarter ticks stroke 3.4; minute ticks reach 88, `#a8a8ad`, stroke 0.7); the open-hours arc at radius 70, a 9px stroke at 20% accent (10% when closed) with a 1.4px line at 90% (40% closed), round caps, drawn clockwise from `openHour` to `closeHour` on a 12-hour dial (a span of 12 or more draws a full ring). Text: the city in capitals at y 70 (8.5px, 600, letter-spacing 0.16em, `#6e6e73`) and "OPEN" (`#0a6f2b`) or "CLOSED" (`#6e6e73`) at y 138 (8px, 600, letter-spacing 0.18em), shown once "now" is known.
- Hands (each drawn pointing at twelve and turned about the centre with a soft blurred shadow offset down and right, 30% black): hour hand `M97.6 108 L98.6 56 Q100 50 101.4 56 L102.4 108 Q100 110 97.6 108Z`, shadow 3; minute hand `M98.3 110 L99.2 30 Q100 25 100.8 30 L101.7 110 Q100 111.5 98.3 110Z`, shadow 4; both `#1d1d1f`. Second hand in the accent: a 1.1px line from y 124 to y 22, a counterweight dot (r 3.2) at y 116, a hub (r 3.4) with a white centre pin (r 1.3), shadow 5.
- Springs: second hand `stiffness 900, damping 26` (a tick with overshoot); minute `60 / 15 / mass 1.2`; hour `50 / 15 / mass 1.4`. Each hand is a motion value that is only ever turned forward or by the shorter way round (never unwound by a full turn; treat a difference above 359.99 degrees as zero).
- Crystal: two overlay layers, a glare `radial-gradient(120% 70% at 28% 8%, rgba(255,255,255,.75), transparent 42%)` plus a faint diagonal sheen, and an inset ring `inset 0 0 0 1px rgba(255,255,255,.6)`.
- The clock is `role="img"` with a label like "Wall clock set to London time, 14:32. Open Mon to Fri, 09:00 to 18:00."; everything inside is hidden from assistive tech.

### The compose sheet

- White (dark `#1c1c1e`), radius 24px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 2px 4px rgba(0,0,0,.04), 0 40px 70px -44px rgba(0,0,0,.45)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 40px 70px -40px rgba(0,0,0,.9)`). The wrapper has `min-height: 500px`, `perspective: 1200px`, and fades in once when it first enters view (0.5s).
- Header: "New message" 15px semibold left, a `0/600` counter right (12.5px, tabular, secondary).
- Rows are separated by a 1px hairline (`black/[.06]`, dark `white/10`), padding 0 20px, 12px gap, label column 56px wide (14px secondary). Each row has a 3px left bar that is transparent, turns the accent on `focus-within` and red `#ff3b30` when the field is invalid (this doubles as the visible focus indicator along with the row).
  1. **To**: a `radiogroup` of topic chips (36px tall, 44px on coarse pointers, 14px side padding, 13.5px medium, radius full, 4px gap, wrapping; the label aligns to the first line). The selected chip has a sliding pill (`layoutId`, spring 420/32) filled with the accent at 13% and a 1px inset line at 38%, ink text; others are secondary text. Arrow keys, Home and End move the selection and focus (roving tabindex).
  2. **Name**: 15px input, placeholder "Your name", `autocomplete="name"`.
  3. **Email**: `type="email"`, placeholder "you@company.com", `autocomplete="email"`.
  4. **Message**: no label column; a 7-row textarea, 15.5px / 1.55, no resize, placeholder "Hi Amara, tell us what you need." (the selected person's name), max 600 characters.
- Footer (hairline above, padding 16px 20px, wrapping): left a 12.5px secondary line "Amara replies by 16:30 London time." (before "now" is known: "Amara replies during open hours."), right the Send button: 44px tall, full radius, padding 0 20px, fill `--mk-a` with white 15px medium text, a paper-plane icon, shadow `inset 0 1px 0 rgba(255,255,255,.22), 0 8px 16px -10px var(--mk-a)`, 2px accent focus ring with a 2px offset.
- Placeholder colour `#767680` (dark `#8e8e93`); error text `#c4001a` (dark `#ff6961`).

## Validation

Validate on submit only, then keep re-validating a field live once it has an error.

- Name: at least 2 characters after trim, otherwise "Add your name so we know who to answer."
- Email: empty gives "Add an email we can reply to."; not matching `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` gives "That email address looks incomplete."
- Message: at least 10 characters after trim, otherwise "Write a few more words so we know how to help."
- Each message sits directly under its row (12.5px, 20px side padding, height and opacity animate in), linked with `aria-describedby`, and the field gets `aria-invalid`. All invalid fields show at once; focus moves to the first invalid one and the sheet shakes (`x: [0, -9, 8, -6, 4, -2, 0]` over 0.45s, skipped under reduced motion).

## Interaction and states

- **Send** (valid): `onSend` is called (not by the demo). The form flies up and away (`y -90, scale .86, rotateX 14, opacity 0`, 0.55s, ease `[.55, 0, .75, .2]`, `AnimatePresence mode="popLayout"`) while a confirmation card rises in 0.35s later (spring 180/22): a 64px ring drawn with `pathLength` (0.7s, delayed 0.5s) and a check drawn with a spring (delayed 1.05s) in the accent, "Sent to Amara." (26px semibold), "Expect a reply at you@company.com by 16:30 London time. We marked it on the clock." (15px secondary) and a "Write another" text button (44px tall). The reply time is computed at the moment of sending and kept.
- **The sweep:** 350ms after sending the hour and minute hands spring forward (never backward) to the reply time, and a pip (white dot r 5.5 with an accent ring, a r 2 accent centre, springs 500/14 delayed 1.2s and 1.3s) pops onto the arc at that time. At 3.4s the hands travel back to the current time (by the shorter way round); the pip stays until "Write another". Under reduced motion the hands jump (no springs) and the second hand is not drawn.
- **Narrow layouts:** the clock sits above the sheet, so after a real send, if the clock is not fully in the viewport it is scrolled to the centre (smoothly, instantly under reduced motion).
- **Focus:** after a real send focus moves to "Sent to Amara." (`tabIndex -1`, `preventScroll`); after "Write another" it moves to the textarea (which starts empty, name and email kept). The confirmation card is `role="status"` (not during the demo). Nothing moves focus during the demo.
- **Copy:** pressing the email row copies and announces "Email address copied" in a visually hidden `role="status"`.

## Autoplay demo

While `autoplay` is on, the block is at least 30% in view and nothing has touched it, it loops: pick the next topic (900ms in), fill "Rowan Ellis" / "rowan@example.com" (800ms later), type "Hi <name>, we are planning a rollout for forty seats next month and would like a walkthrough." a word every 95ms, send 700ms after the last word (a demo send: no `onSend`), hold the confirmation while the hands sweep and return (5.2s), clear the form, wait 1.2s and go again with the next topic. The first pointer move or press, key press or touch (listened for on the section) stops it for good and wipes the demo text; leaving the viewport pauses it and wipes it too. All timers are cleared on unmount, when the block leaves the screen and when a person takes over.

## Accessibility

- A `section` labelled by the heading. Real `label` elements for Name and Email, an `sr-only` label for Message, `aria-invalid` and `aria-describedby` for errors, a labelled `radiogroup` with `role="radio"` chips and arrow-key support.
- Visible focus: the row bar plus a 2px accent ring on chips, Send, the contact rows (inset) and "Write another".
- Contrast of at least 4.5:1 in both themes: secondary text `#6e6e73` on white and `#f5f5f7`, `#98989d` on `#1c1c1e` and black; the caption under the clock is ink (not accent) because `#0071e3` on `#f5f5f7` is below 4.5:1.
- Touch targets: Send, "Write another" and the contact rows are at least 44px; topic chips are 44px on coarse pointers.
- Reduced motion (`useReducedMotion`, applied after hydration): no autoplay, no second hand, no spring on the hands (they jump), no shake, no ping halo, no layout slide on the topic pill, the send is a short cross-fade; typing, sending, copying and the sweep still work.
- No emojis anywhere.

## Acceptance checklist

- [ ] `<WallClockContact />` renders with no props: heading, clock, status, contact card, compose sheet; no hydration warning with motion on or reduced.
- [ ] The server markup and the first client render match: the clock shows ten past ten until "now" arrives, then the hands sweep to the office's time.
- [ ] Open hours show as an arc from 9 round the top to 6; "Open now" and "Closes in …" or "Closed right now" and "Opens in …" are right for the office's zone, not the visitor's.
- [ ] Changing `timeZone`, `openHour`, `closeHour` and `openDays` moves the arc and the status; an invalid zone does not throw.
- [ ] Reply times follow working hours: Monday 16:30 gives "tomorrow by 09:30", Friday 17:00 gives "on Monday by 10:00".
- [ ] Empty Send shows three inline messages, focuses the name and shakes; fixing a field clears its message.
- [ ] A valid Send calls `onSend` once with the trimmed values and `replyBy`, flies the sheet off, sweeps the hands to the reply time, leaves a pip, and returns the hands to now; "Write another" brings the sheet back with focus in the message.
- [ ] No network request is made by the block.
- [ ] Email copies (and falls back to `mailto:` if the clipboard is blocked); the phone number dials.
- [ ] Autoplay writes and sends a message until the first touch, never calls `onSend`, and wipes its text when stopped.
- [ ] One column with no horizontal scroll at 320px wide; two columns from a 896px wide container; chips wrap without colliding with the label.
- [ ] Dark page: the panel is black, the sheet and card are `#1c1c1e`, the clock stays light and lifts off the background.
- [ ] Reduced motion: no autoplay, no ticking second hand, hands jump to the reply time.
