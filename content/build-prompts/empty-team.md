# Empty Team

Build an empty team page that gets you to invite people. A row of seats shows yours filled and the rest as dotted circles. Type an email, or tap a suggested teammate from your domain, and their avatar lifts out of the field, arcs through the air and drops into the next free seat, marked pending. The headline and the send button keep count.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API.
- File: `components/empty-team/empty-team.tsx` plus an `index.ts`. Named exports `EmptyTeam`, `EMPTY_TEAM_PEOPLE`, and the type `EmptyTeamProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `seats` | `number` | `6` | Total seats, including yours. |
| `suggestions` | `string[]` | three people on `domain` | One-tap chips under the field. |
| `domain` | `string` | `"orbitly.com"` | Shown in "From <domain>" and used for the default suggestions. |
| `placeholder` | `string` | `"name@company.com"` | Placeholder of the email field. |
| `onAdd` | `(email) => void` | none | Called when an avatar lands in a seat. Not called by autoplay. |
| `onSend` | `(emails) => void` | none | Called with all pending emails on Send invites. Not called by autoplay. |
| `autoplay` | `boolean` | `false` | Demos the whole flow on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

`EMPTY_TEAM_PEOPLE` is `["leo.park", "ana.lima", "kai"]`, turned into emails on `domain`.

An email is valid if it matches `/^\S+@\S+\.\S+$/`, is not already added and a seat is free (seats minus yours). Emails are lowercased. Initials come from the part before the `@` split on `.`, `_` or `-` (first letters of the first two parts, upper case); avatar colour is picked from six hues by the sum of the character codes: `#0071e3`, `#8944ab`, `#c93400`, `#248a3d`, `#d70015`, `#5e5ce6` (deep enough for white initials).

## Layout and look

- Card: `position: relative`, width 480px, `max-width: 100%`, radius 28px, white / dark `#1c1c1e`, padding 20px (24px from 640px), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Seats: a centred row, 8px from the top, gap 6px (12px from 640px). Each seat is a square that grows to at most 40px (56px from 640px) and shrinks evenly (`flex: 1; min-width: 0`) when there are many seats, with a 2px dashed circle (`#d2d2d7` / dark `#48484a`) and a faint `+` (18px, `#c7c7cc` / dark `#58585a`) when empty. A filled seat has a solid avatar with a 3px ring in the card colour: yours is `#1d1d1f` with white "You" (dark: `#f5f5f7` with `#1d1d1f`), others use their hue with white initials (12px, 14px from 640px, semibold). Below each invited avatar a pill straddles the bottom edge (8.5px, 9.5px from 640px, semibold, 2px card-coloured ring): "Pending" `#fff4e5` on `#b25e00` (dark `#3a2a10` on `#ffb340`), then "Sent" `#e9f9ee` on `#1a7f37` (dark `#12301b` on `#4ade80`).
- Headline: centred, 24px below, 19px semibold, tracking -0.02em. "It's just you for now" with no invites, "Looking good" while some are pending, "Invites are on their way" once sent. Under it a 13.5px tabular line in `#6e6e73` / dark `#a1a1a6`: "Teams that invite in the first week stick around." or "<n> of <seats> seats filled".
- Field: 20px below, 48px tall, radius 14px, bg `#f5f5f7` / dark `#2c2c2e`, 16px left and 6px right padding. A transparent email input (15px, placeholder `#6e6e73` / dark `#a1a1a6`) and an "Add" button (36px tall, radius 10px, 13px semibold, white with a hairline ring; dark `#3a3a3c`).
- Suggestions: 12px below, wrapping, 6px gap, min-height 30px. A leading "From <domain>" (12px, `#6e6e73` / dark `#a1a1a6`), then chips: 30px pills, white with a hairline ring (dark `#2c2c2e`), 4px left and 10px right padding, a 22px avatar in the person's hue with initials (9.5px) and the capitalised first name (12.5px).
- Send button: 16px below, full width, 44px tall, fully rounded, bg `#0071e3`, white 15px medium; 40% opacity when disabled. Text: "Send invites", "Send <n> invite(s)", "Invites sent".

## Motion

- Flight: when an email is added, measure the field and the target seat against the card, clear the field and render a 48px avatar (hue, white initials 14px semibold, shadow `0 10px 24px -8px rgba(0,0,0,.4)`) that starts at the field's left, 20px in, at scale 0.5 and moves over 600ms with `cubic-bezier(.3,0,.2,1)` through three keyframes: x from the field to the midpoint to the seat; y from the field up to 60px above the higher of the two points and down to the seat; scale 0.5, 1.1, 1. When it completes, the seat's avatar mounts (spring stiffness 500, damping 16, from scale 0.6) and the Pending pill fades in after 150ms.
- Headline cross-fades with `AnimatePresence mode="wait"` (6px up and down). Chips scale and fade (0.8 in, 0.6 out) and the rest re-flow with `layout`.
- An invalid add shakes the field on X (`0, -8, 7, -4, 0` over 350ms).
- Reduced motion: no flight (the avatar appears in its seat), no shake, no pop or layout animation, 120ms fades.

## Interaction and states

- Enter or Add submits the field; a chip adds that person. One flight at a time; presses during a flight are ignored.
- A bad, duplicate or surplus email shakes the field and is announced.
- "Send invites" marks every pending seat "Sent" and locks the button. Adding someone after sending unlocks it again.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced. Loop of 8.6s: reset at 0, type `maya.chen@<domain>` at 55ms per character from 0.9s, add it at 2.3s, add the first suggestion at 3.4s, the second at 4.3s, send at 5.6s, reset at 8.2s. Any pointer press, focus or typing in the field stops the loop for good. The demo never calls the callbacks.

## Accessibility

- The seat row is a list labelled "Team seats"; each seat is a list item labelled like "Seat 2: ana@orbitly.com, pending" or "Seat 4: empty". The decorative avatars and pills are `aria-hidden`. The count line is `aria-live="polite"`; a polite `sr-only` status reports invalid input.
- The input is labelled "Teammate's email" and marked `aria-invalid` after a bad entry. Chips are labelled `Add <email>`. Focus rings are 2px `#0071e3` (dark `#0a84ff`) outlines with 2px offset, and the field shows one on focus within.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- When an avatar lands in a seat it plays `drop` (0.55). Send invites plays `tap` (0.5). A bad, duplicate or surplus email plays `error` at 0.3 with the shake. Pressing Add or a chip is otherwise silent so one add makes one sound.
- Autoplay plays the same `drop` and `tap` through `play.auto`, which stays silent until the visitor has interacted with the page once. Typing and hover are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs with the component.

## Acceptance checklist

- [ ] Six seats show, the first holding "You", the rest dotted.
- [ ] Adding an email sends its avatar on an arc from the field into the next seat, and the count line updates.
- [ ] A suggestion chip does the same and disappears from the row.
- [ ] An invalid or duplicate email shakes the field.
- [ ] Send invites turns every Pending pill into Sent and the button into "Invites sent".
- [ ] Eight or more seats still fit the card at 320px (the seats shrink evenly).
- [ ] Autoplay types, adds three people, sends and resets on a loop and stops for good on touch.
- [ ] Dark mode uses the dark card, raised fields and readable pills; reduced motion drops the flight.
