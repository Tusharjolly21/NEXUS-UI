# Streaming Answer

Build an AI answer card that shows its work without making you stare at a spinner. The user's question sits in a bubble on the right. Below it a "Thinking" line shimmers while a short list of steps ticks off one by one; when thinking ends the list folds into a single "Thought for 4s" line you can reopen. Three source cards slide in, then the answer streams in word by word with a blinking cursor, and small numbered citation chips pop in right where each source is cited. Pointing at (or focusing) a chip lights up the matching source card, and the other way round. When the answer is complete, Copy, Good answer and Regenerate appear underneath; Regenerate plays the whole run again.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/streaming-answer/streaming-answer.tsx` plus an `index.ts`. Named exports: `StreamingAnswer`, the types `StreamingAnswerProps` and `StreamingAnswerSource`, and the constants `STREAMING_ANSWER_QUESTION`, `STREAMING_ANSWER_STEPS`, `STREAMING_ANSWER_SOURCES`, `STREAMING_ANSWER_TEXT`.

## API

`StreamingAnswerSource`: `{ n: number; title: string; where: string; c: string; ink?: string; href?: string }`. `n` is the number citation chips refer to, `where` is the small label above the title, `c` is the accent colour, `ink` is the text colour drawn on `c` (default white), `href` makes the card a real link (without it the card only reacts to pointing and focus).

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `question` | `string` | "Why are people dropping off during onboarding?" | The bubble above the answer. |
| `steps` | `string[]` | "Searching 3 sources", "Reading Onboarding funnel, Q3", "Comparing with last quarter" | Thinking steps. |
| `sources` | `StreamingAnswerSource[]` | three demo sources | Cards in a 3-column grid. |
| `answer` | `string` | a four-sentence answer | Plain text; write `{1}`, `{2}`, `{3}` straight after a word to place a citation chip for that source. |
| `thoughtSeconds` | `number` | `4` | The number in "Thought for 4s". |
| `width` | `number` | `520` | Card width in px, never wider than the container. |
| `autoplay` | `boolean` | `false` | Plays the run again every 13s until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds (see Sound). |
| `className` | `string` | `""` | Extra classes for the card. |

Demo sources: 1 "Onboarding funnel, Q3" / Analytics `#0a84ff`; 2 "Support tickets: setup" / Helpdesk `#ff9f0a` (ink `#1d1d1f`); 3 "Interview notes, Oct" / Docs `#30d158` (ink `#1d1d1f`). Demo answer: "Most people leave at the workspace step, not at sign-up. 41% of new accounts stop when asked to invite teammates {1}, and the top setup ticket is about not knowing who to invite yet {2}. Interviews say the same: people want to try it alone first {3}. Making the invite step skippable should recover most of that drop."

## Layout and look

- Card: width 520px, `max-width: 100%`, radius 28px, padding 20px (24px from the `sm` breakpoint), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Question bubble: right-aligned (`margin-left: auto`), `fit-content` width, max 85% of the card, radius 18px, 16px by 10px padding, 14.5px text, bg `#f5f5f7` / dark `#2c2c2e`, text `#1d1d1f` / `#f5f5f7`.
- Thinking block: 16px below the bubble. A pill-shaped text button, 13px medium, `#6e6e73` / dark `#a1a1a6`. While thinking it reads "Thinking" with a shimmer; afterwards "Thought for 4s" followed by a 12px chevron.
- Steps list: 8px below the button, a 2px left border `#ececf0` / dark `#3a3a3c`, 12px left padding. Each step is a row with 4px vertical padding, 8px gap, 13px text in the muted colour, and a 14px status icon at the left: a 12px spinner ring (2px border `#c7c7cc`, top edge `#0071e3`; dark `#48484a` and `#0a84ff`) while it is the current step, a green check (`#34c759`, dark `#30d158`, 3px round stroke) once done.
- Sources: 12px below the thinking block, a 3-column grid with 8px gaps. Each card is a link with radius 14px, 10px padding, bg `#f5f5f7` / dark `#2c2c2e`. Top line: a 16px badge (radius 4px, 9px bold, the source colour with its ink colour) and the `where` label at 11px muted. Below, the title at 12.5px medium, one line, truncated.
- Answer: 16px below, minimum height 110px, 15.5px at line-height 1.6, text `#1d1d1f` / `#f5f5f7`. Words are inline spans with a space after each.
- Citation chip: inline button, 18px tall, min-width 18px, 4px horizontal padding, radius 5px, 10.5px bold, vertically centred and nudged up 1px, 1px side margins. Resting: bg `#ececf0` / dark `#3a3a3c`, text muted. Lit: bg is the source colour, text is its ink colour.
- Cursor: a 7px wide, 1em tall rounded (2px) block in the text colour, shown while the answer is streaming.
- Actions row: 12px below the answer. Two 32px round icon buttons (15px icons, 2px stroke, muted; hover bg `#f5f5f7` / dark `#2c2c2e`): Copy and Good answer. Then a 32px tall pill "Regenerate" with a 13px refresh icon, 12.5px medium, 12px side padding, same colours.

## Motion

- Run timeline (ms, from the start of a run): step `i` (0-based) completes at `700 + i * 800` (so 700, 1500, 2300). Thinking ends at `700 + steps * 800 + 200` (3300 with three steps). Word `i` appears at `start + 400 + i * 55`, plus 180 extra for a word that follows one ending in a full stop, plus `floor(i / 12) * 60`. The run ends when the last word is in.
- Shimmer on "Thinking": a 100%-wide gradient bar (transparent, white 90%, transparent; dark uses the card colour) sliding from -100% to 100% over 1.2s, linear, repeating.
- Steps list: `AnimatePresence`, height and opacity from 0 to auto over a spring (stiffness 300, damping 32). Each new step slides in from `x: -6, opacity 0`. The spinner rotates 360 degrees over 0.8s linear, repeating. A check draws with `pathLength` 0 to 1.
- Sources: hidden while thinking (`opacity 0, y 10`); when thinking ends they rise to `opacity 1, y 0` with a spring (stiffness 400, damping 28), staggered at `0.1s + i * 0.08s`. When lit (pointer or focus on the card or its chip) the card scales to 1.04 and gets a 2px ring in its colour, with no stagger delay.
- Words: fade in from `opacity 0` and `blur(4px)` to sharp over 0.3s. A citation chip pops from scale 0 with a spring (stiffness 600, damping 18).
- Cursor: opacity 1, 0.2, 1 over 0.8s, repeating.
- Actions row: fades and rises 6px in when the answer completes.
- Reduced motion: no shimmer, spinner rotation, blur, scale, stagger or cursor blink; fades are 0.15s. The run is compressed: after a 450ms beat the steps are all ticked and the whole answer is shown at once. Regenerate does the same.

## Interaction and states

- The run starts on mount (for `autoplay`, once the card is on screen). Regenerate starts another run from the top and resets the thinking list.
- The thinking button toggles the step list once thinking has ended (`aria-expanded`); during thinking it does nothing.
- Pointer enter, focus and leave on a source card or a citation chip set the lit source; both light up together.
- Sources are inert (not focusable) while thinking.

## Autoplay demo

With `autoplay`, nothing starts until the card is on screen and the tab is visible. Then the run plays and repeats every 13 seconds. Any pointer press or focus inside the card marks it touched and the loop stops for good; the run in progress finishes. Leaving the screen pauses it and it restarts from the top on return. Never under reduced motion.

## Accessibility

- The answer paragraph is not a live region while streaming (`aria-busy` is true until the end); a separate `sr-only` `role="status"` region announces "Answer ready" once.
- Each thinking row carries an `sr-only` "Done:" or "In progress:" prefix. Icons and the shimmer are `aria-hidden`.
- Citation chips are buttons labelled "Source 1: Onboarding funnel, Q3". Action buttons have `aria-label`s. Focus rings are 2px `#0071e3` (dark `#0a84ff`) with 2px offset.
- Text contrast is at least 4.5:1 in both themes; lit chips use dark ink on the amber and green sources.

## Sound

Prop `enableSound?: boolean` (default `true`), using `useSound` from `@/lib/ui-sounds`.

- `tick` (volume 0.35) as each of the thinking steps completes.
- `done` (volume 0.5) once, when the last word has streamed in. Nothing per word.
- The first run on mount is silent unless `autoplay` is on. Runs started by Regenerate use `play`; autoplay runs use `play.auto` (silent until the visitor has used the page).

## Acceptance checklist

- [ ] Steps tick off at 0.7s, 1.5s and 2.3s, then fold into "Thought for 4s" with a rotating chevron that reopens the list.
- [ ] Sources fade up in order after thinking; the answer streams word by word with a blinking cursor and pauses slightly after full stops.
- [ ] Citation chips pop in at the right words; pointing at or focusing a chip or card lights both with the source colour.
- [ ] Copy, Good answer and Regenerate appear when the answer ends; Regenerate replays from the top.
- [ ] Autoplay replays every 13s while visible and stops at the first touch.
- [ ] Reduced motion shows the finished answer after a short beat with no blur, scale or loops.
- [ ] Dark mode follows the colours above and every text pair passes 4.5:1.
- [ ] Works at 360px wide, with source titles truncating cleanly.
