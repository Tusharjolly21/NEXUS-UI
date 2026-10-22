# Team Clock

Build a team section that also answers "when can we all meet?". Every person gets a card with their local time and whether they are working. Under the heading sits a bar for the UTC day: drag it (or use the arrow keys) to any hour and every clock moves with it, people outside working hours fade back, and the bar is shaded green where most of the team overlaps. Chips filter the team. It should feel Apple-light, calm and precise. The real time fills in after the page loads and ticks once a minute until the visitor takes over.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), a `cn` helper and the `useSound` hook from `@/lib/ui-sounds`.
- File: `components/blocks/team-clock.tsx`, named export `TeamClock`, types `TeamClockProps` and `TeamClockMember`, and the demo array `DEFAULT_TEAM_CLOCK_MEMBERS`.

## API

`TeamClockMember`: `{ name: string; role: string; city: string; offset: number; team: string; hue: string }`. `offset` is hours from UTC (5.5 for Bengaluru). `name` is the key.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"The team"` | Small caps line above the heading. |
| `heading` | `string` | `"Six people, five time zones."` | Section heading. |
| `everyoneLabel` | `string` | `"Everyone"` | Label of the chip that shows all. |
| `members` | `TeamClockMember[]` | 6 demo people | Use a stable array. The other chips are the distinct `team` values in order of first appearance. |
| `workStart` | `number` | `9` | First working hour, local time. |
| `workEnd` | `number` | `18` | Working day ends at this hour. |
| `autoplay` | `boolean` | `false` | Steps through the chips and visits a few meeting hours by itself until touched. |
| `enableSound` | `boolean` | `true` | Taps on a chip press. |
| `className` | `string` | none | Extra classes on the section. |

Demo people (invented): Maya Chen, Design lead, San Francisco, -7, Design, `#ff9f0a`; Leo Park, Engineer, New York, -4, Engineering, `#0a84ff`; Ana Lima, Brand, Lisbon, 1, Design, `#bf5af2`; Noor Haddad, Accessibility, Berlin, 2, Engineering, `#30d158`; Dev Patel, Founder, Bengaluru, 5.5, Leadership, `#ff375f`; Kai Ito, Engineer, Tokyo, 9, Engineering, `#5e5ce6`.

## Layout and look

- Root `<section aria-label="Team and time zones">`: full width, background `#f5f5f7` / dark `#000`, padding 48px vertical, 16px sides. Inside, a centred card, `max-width: 1080px`, radius 28px, background white / dark `#1c1c1e`, padding 32px 20px (32px sides from 640px up), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.3)` (dark: hairline `rgba(255,255,255,.08)` and `rgba(0,0,0,.9)`).
- Header row: wraps, items aligned to the bottom, 16px gap, space between. Left: eyebrow 13px semibold uppercase, tracking 0.14em, `#6e6e73` / dark `#a1a1a6`; heading below with 4px gap, `clamp(26px, 4vw, 36px)` semibold, tracking -0.03em, `#1d1d1f` / `#f5f5f7`. Right: a pill group of chips, background `#f5f5f7` / dark `#2c2c2e`, padding 4px, 4px gap, scrolls sideways if it must. Each chip is a 32px tall button, 14px side padding, 13px medium; the selected chip has a white (dark `#48484a`) pill behind it with shadow `0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04)` (none in dark) and ink text; the others use `#6e6e73` / `#a1a1a6`.
- Scrubber, 24px below: a caption row (12px, `#6e6e73` / `#a1a1a6`, space between, wraps) with "Drag to plan a meeting" on the left and "<b>N of M</b> working at 1:30 pm UTC" on the right (tabular numbers, the bold part in ink). Under it a 40px tall bar, radius 12px, background `#f5f5f7` / dark `#2c2c2e`, `overflow: hidden`, cursor `ew-resize`, `touch-action: pan-y`, no text selection. Inside: 48 equal columns (half hours) whose background is `rgba(52,199,89, overlap * 0.55)` where overlap is the share of the filtered people who are working then; labels 0:00, 6:00, 12:00 and 18:00 at the bottom (10px, same secondary colour, at `left: calc(h/24 * 100% + 4px)`); and a 3px wide marker, full height, rounded, ink (`#1d1d1f` / `#f5f5f7`), centred on `utc / 24 * 100%`.
- Cards: a list in a grid, 1 column on phones, 2 from 640px, 3 from 1024px, 12px gap, 24px below the scrubber. Each card: flex, centred, 12px gap, radius 18px, padding 14px, background `#f5f5f7` / dark `#2c2c2e`. A 48px round avatar in the person's colour with white 15px semibold initials; a 14px status dot at its bottom right with a 3px ring in the card colour, `#34c759` when working, `#c7c7cc` (dark `#636366`) otherwise. A text column that truncates: name 15px semibold, then "Role · City" 12.5px secondary. A right column: local time 14px semibold tabular ("2:30 pm"), then a 11.5px status word: "Working" in `#1a7f37` (dark `#30d158`), otherwise "Asleep" (before 7:00 or from 22:00) or "Off", in secondary colour. Cards of people who are not working sit at 55% opacity.

## Motion

- Marker: a spring on `left`, stiffness 500, damping 40. Overlap columns animate their colour over 0.4 s.
- Chip thumb: a shared-layout pill (`layoutId`) with a spring, stiffness 420, damping 34.
- Cards: `layout` with `AnimatePresence mode="popLayout"`. Enter from opacity 0 and scale 0.92, exit the same way; spring stiffness 300, damping 30 with opacity over 0.3 s; the opacity moves between 1 and 0.55 as the person starts or stops working.
- Under reduced motion: no springs and no scale; the marker, thumb and cards move instantly and cards fade only.

## Interaction and states

- Time state is `utc` (hours, 0 to 24) and starts as `null`. Server and first paint render a stable placeholder: times read "–:–– –", the caption reads "– of N working at –:–– – UTC", statuses are blank and the dots grey. Right after mount (a zero-delay timeout, not a synchronous set in the effect) the real UTC time fills in, then a 60 s interval refreshes it until the visitor drags, presses a key on the bar, or the autoplay demo runs.
- Pointer: pressing the bar captures the pointer and sets the time from the x position (clamped 0 to 23.99); moving while held keeps setting it; release or cancel ends the drag.
- Keyboard: the bar is `role="slider"`, focusable, with `aria-valuemin` 0, `aria-valuemax` 24, `aria-valuenow` and `aria-valuetext` ("1:30 pm UTC, 4 of 6 working"). Arrow keys move 30 minutes, Page Up and Page Down 3 hours, Home and End jump to 0:00 and 23:30.
- Chips are buttons with `aria-pressed`. The list filters to that team; the shading and the "N of M" count follow the filtered people.
- A visually hidden polite live region says "Showing N people" (plus the team) on every filter change.

## Autoplay demo

`autoplay` (default false): every 3 s it moves to the next chip and sets the bar to the next of 13:00, 9:00, 15:30 and 4:00 UTC. It stops for good on the first pointer or key interaction, pauses off screen (IntersectionObserver) and in a hidden tab, and never runs under reduced motion. The preview passes `autoplay`.

## Accessibility

- Chips and the scrubber are real controls with a 2px `#0071e3` (dark `#0a84ff`) focus outline, 2px offset.
- Decorative shading, labels, marker, avatars and dots are `aria-hidden`; the slider carries the meaning through its value text.
- Secondary text meets 4.5:1 on its surface in both themes. Cards use no colour alone: the word Working / Asleep / Off is always present.
- Reduced motion handled as above. No network calls.

## Sound

- Chip pressed: `tap`, volume 0.5. In the autoplay demo the same chip step plays `tap` at 0.4 through the autoplay path (quiet until the visitor has used the page).
- Nothing on dragging, keys or the minute tick. Respects the global sound switch and the `enableSound` prop.

## Acceptance checklist

- [ ] First paint shows placeholders, then real times; no hydration warning.
- [ ] Dragging or arrowing the bar moves every clock, status, dot and the "N of M" count together.
- [ ] People outside 9:00 to 18:00 fade to 55% and show Asleep or Off.
- [ ] Each chip filters the cards with the layout animation and re-shades the bar.
- [ ] The minute tick stops once you have taken over.
- [ ] With reduced motion nothing springs or scales, and every state is still reachable.
- [ ] Dark mode swaps every surface, the thumb, the marker and the status colours.
- [ ] At 360px wide the cards stack in one column and nothing overflows.
