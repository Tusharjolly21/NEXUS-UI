# Typewriter Heading

Build a large hero headline that types itself out one character at a time behind a thin rounded caret, then lets a supporting paragraph blur up into place underneath. The final size of the headline is reserved before typing begins, so nothing below it moves. The section around it is a changelog hero: an eyebrow, the typing headline, two pill buttons, and a column of recent release notes on wide screens. It should feel calm and deliberate, like a person typing rather than a ticker.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useReducedMotion`).
- File: `components/blocks/text-animations/typewriter-heading.tsx`, named export `TypewriterHeading` (also export `TypewriterHeadingProps`). A default export of the same component is fine.
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `text` | `string` | required | The headline to type. Changing it restarts typing from the first letter. |
| `description` | `string` | — | Paragraph under the headline. Hidden when empty. |
| `typingSpeed` | `number` | `82` | Base milliseconds per character. |
| `startDelay` | `number` | `350` | Milliseconds before the first character, and before each pass when looping. |
| `cursorColor` | `string` | — | Any CSS colour for the caret. Unset: `#0071e3`, `#2997ff` in dark mode. |
| `loop` | `boolean` | `false` | Hold the finished line, clear it, type it again. |
| `showCursor` | `boolean` | `true` | Render the caret. |
| `className` | `string` | — | Merged onto the outer wrapper. |

## Layout and look

Component:
- Wrapper: `div`, `w-full max-w-4xl`, plus `className`.
- Headline: `h1`, `display: grid`, `max-w-4xl`, left aligned. Type: 44px, `sm` 60px (`text-6xl`), `lg` 72px (`text-7xl`); semibold, line-height 1.05, letter-spacing -0.035em. Colour `#1d1d1f`, dark `#f5f5f7`.
- Inside the `h1`, two spans stacked in the same grid cell (`col-start-1 row-start-1`):
  1. A ghost: `invisible select-none`, `aria-hidden`, containing the full `text` plus a non-blinking caret when `showCursor` is on. This reserves the final height and wrap.
  2. The live span, `aria-hidden`, containing the typed slice plus the caret.
- Caret: inline-block, height 0.82em, width 0.06em with `min-width: 3px`, `margin-left: 0.05em`, `translateY(0.1em)`, fully rounded. Background is `cursorColor` (inline style) or `#0071e3` / dark `#2997ff`.
- Description: `p`, margin-top 20px, `max-w-2xl`, `text-pretty`, left aligned, 17px / line-height 1.5, `sm` 21px / 1.45. Colour `#6e6e73`, dark `#a1a1a6`.

Section (the composition this block shows):
- `section`, grid, full width and height, `overflow-hidden`, background `#f5f5f7` (dark `black`), text `#1d1d1f` (dark `#f5f5f7`). Padding 20px × 40px, `sm` 32px horizontal, `lg` 56px all round with two columns `1.1fr 0.9fr` and a 40px gap.
- Left column, vertically centred: eyebrow "Changelog" (13px, medium, `#6e6e73` / dark `#a1a1a6`); the headline 12px below; then a row 32px below with two 44px-tall pill buttons, 20px horizontal padding, 15px medium, 12px gap: "Read the latest" (`#0071e3` bg, white text) and "Subscribe by email" (`#e8e8ed` bg, `#1d1d1f` text; dark `#2c2c2e` / `#f5f5f7`).
- Right column, only at `lg`: an ordered list, 8px gap, vertically centred. Each item: grid `64px 1fr`, 16px gap, 16px padding, radius 20px, white bg with `0 0 0 1px rgba(0,0,0,.05)` ring (dark `#1c1c1e`, ring `rgba(255,255,255,.08)`). Date in 12.5px tabular numerals `#86868b` / dark `#98989d`; title 15px semibold, -0.01em; copy 13.5px, line-height 20px, `#6e6e73` / dark `#a1a1a6`, 4px under the title.

## Motion

- Typing: each tick waits `typingSpeed + (index % 4) * 8 + (char === " " ? 24 : 0)` ms, then reveals one more character. The modulo pattern gives a small, natural unevenness; spaces linger slightly.
- Start: after `startDelay` ms, set `started` and `revealed` together.
- Loop: when the line is complete and `loop` is on, wait 2000ms, reset the index to 0 and `started` to false; the start-delay timer then runs again.
- Caret: solid (opacity 1, 0.1s) while typing; once the line is done it blinks with opacity keyframes `[1, 1, 0, 0, 1]` at times `[0, 0.45, 0.55, 0.9, 1]`, 1.05s, `easeInOut`, infinite.
- Description: from `opacity 0, y 10, blur(6px)` to `opacity 1, y 0, blur(0)` once `revealed`, spring stiffness 240, damping 30, delay 0.2s.

## Interaction and states

- Not interactive; purely timed.
- Reset on new text: track the previous `text` in state and, during render, when it differs set the index to 0 and `started` to false (no effect needed).
- Before the start delay the caret is hidden; it appears with the first character.
- Clear every timeout on unmount and whenever the dependencies change.
- Reduced motion: show the full text at once, no start delay, caret visible but not blinking, description fades in with opacity only.

## Demo data

- `text`: "Release notes people read."
- `description`: "Ship a headline that types itself out, then let the summary settle in underneath. The layout is reserved up front, so nothing below it jumps."
- On the page: `typingSpeed={78}`, `startDelay={300}`, `cursorColor="#0071e3"`, `className="mt-3"`.
- Notes list: "Oct 14 / Branch previews / Every pull request gets its own URL, torn down on merge."; "Oct 07 / Faster cold starts / Median boot fell from 410 ms to 160 ms on the new runtime."; "Sep 30 / Audit log export / Stream every workspace event to your own bucket as JSONL."; "Sep 22 / Keyboard-first search / Press / anywhere to jump to a project, page, or teammate."

## Accessibility

- The `h1` carries `aria-label={text}` so screen readers get the full headline at once; both visual spans are `aria-hidden`.
- The caret elements are `aria-hidden`.
- The description is plain text and readable from the start (it only animates its opacity and position).
- Respect `prefers-reduced-motion` through `useReducedMotion`.

## Acceptance checklist

- [ ] The headline types left to right with slightly uneven timing; spaces pause a touch longer.
- [ ] Content below the headline never moves while typing (ghost copy reserves the space).
- [ ] The caret is solid while typing and blinks softly once the line is complete.
- [ ] `cursorColor` recolours the caret; without it the caret is `#0071e3` in light and `#2997ff` in dark.
- [ ] The description blurs and rises into place shortly after typing begins.
- [ ] Changing `text` restarts typing from the first character.
- [ ] With `loop`, the line holds ~2s, clears, waits `startDelay`, and types again.
- [ ] `showCursor={false}` removes the caret from both the ghost and the live line.
- [ ] Screen readers announce the whole headline once, not character by character.
- [ ] Reduced motion shows the finished headline and description immediately.
- [ ] At `lg` the notes column appears beside the hero; below `lg` it is hidden.
