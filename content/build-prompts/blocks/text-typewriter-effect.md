# Text Animation Typewriter Effect

Build an inline typewriter that cycles through a list of short claims: it types one, holds it, deletes it, and types the next, with a thin blue caret that stays solid while keys move and blinks only when the line is at rest. In this section it sits under a fixed first line on a black hero, so the copy reads "Push to main. / Preview every branch." and keeps rotating. It should feel quick and confident, never jittery: the line reserves its height so nothing below it shifts.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useReducedMotion`).
- File: `components/blocks/text-animations/text-animation-typewriter-effect.tsx`, named export `TextAnimationTypewriterEffect` (also export `TextAnimationTypewriterEffectProps`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `texts` | `string \| string[]` | required | One line or a list to cycle through. Empty strings are dropped. |
| `typingSpeed` | `number` | `46` | Milliseconds per typed character. |
| `deletingSpeed` | `number` | `24` | Milliseconds per deleted character. |
| `delay` | `number` | `1200` | Milliseconds before the first line starts, and how long a finished line is held before deleting. |
| `loop` | `boolean` | `true` | Keep cycling. Off: stop once the last line is typed (or after the only line). |
| `showCursor` | `boolean` | `true` | Render the caret. |
| `cursor` | `string` | `"\|"` | `"\|"` draws a rounded bar; any other string is rendered as text. |
| `className` | `string` | — | Merged onto the root span. |

## Layout and look

Component:
- Root: `span`, `inline-block`, `min-height: 1.1em`, `whitespace-pre-wrap`. Default type 30px (`text-3xl`), `sm` 36px (`text-4xl`), semibold, line-height 1.1, letter-spacing -0.03em, colour `#1d1d1f` / dark `#f5f5f7`. `className` overrides size and colour.
- Children: a screen-reader-only span with all lines joined by spaces; an `aria-hidden` span with the current slice; then the caret.
- Bar caret (`cursor === "|"`): inline-block, height 0.9em, width 0.07em with `min-width: 2px`, `margin-left: 0.06em`, `translateY(0.12em)`, fully rounded, `#0071e3` / dark `#2997ff`.
- Text caret (any other string): inline-block, `margin-left: 4px`, coloured `#0071e3` / dark `#2997ff`.

Section (the composition this block shows):
- `section`: flex, centred both ways, full width and height, `overflow-hidden`, background `black`, text `#f5f5f7`, padding 20px × 48px (`sm` 32px horizontal). Inner column `max-w-3xl`.
- Eyebrow "Hosting for small teams": 13px, medium, `#a1a1a6`.
- Fixed line `h3` "Push to main.": 12px below, 34px (`sm` 48px), semibold, line-height 1.05, -0.035em.
- Typewriter wrapper: 8px below, `min-height: 2.6em`, 34px (`sm` 48px), line-height 1.05. The typewriter gets `className="text-[34px] text-[#86868b] sm:text-5xl"` so the rotating line is a softer grey than the fixed line.
- Body copy: 32px below, `max-w-xl`, 16px, line-height 28px, `#a1a1a6`, `text-pretty`.

## Motion

State machine with four steps, each one a single `setTimeout` cleared on every change:
1. Not ready: wait `delay` ms, then mark ready (ready starts true if `delay <= 0`).
2. Typing: while `charIndex < current.length`, add one character every `typingSpeed` ms.
3. Holding: at full length, wait `delay` ms, then start deleting. Skip this (stop) when there is one line and `loop` is off, or when on the last line and `loop` is off.
4. Deleting: remove one character every `deletingSpeed` ms; at zero, on the next tick (0ms) stop deleting and advance `textIndex` modulo the list length.

Caret:
- "Busy" means ready, motion allowed, and either deleting or not yet at full length. Busy: opacity 1 with a 0.1s transition.
- At rest: opacity keyframes `[1, 1, 0, 0, 1]`, times `[0, 0.45, 0.55, 0.9, 1]`, 1.05s, `easeInOut`, infinite.

## Interaction and states

- Not interactive.
- Memoise the normalised list (`Array.isArray(texts) ? texts : [texts]`, filtered for truthy values).
- An empty list renders nothing animated and schedules no timers.
- Reduced motion: no typing or deleting; the first line stands alone and the caret is not rendered.
- The rotating line keeps its height through `min-height` on the root and the section wrapper, so the paragraph below never jumps when a line is deleted to nothing.

## Demo data

- `texts`: `["Preview every branch.", "Roll back in one click.", "Sleep through deploys."]`
- On the page the typewriter uses `delay={500}`; the other values are the defaults.
- Body copy: "Cycles through short claims, typing and deleting each one. The line keeps its height, so the copy below never shifts."

## Accessibility

- Screen readers get every line at once from the `sr-only` span; the animated slice and caret are `aria-hidden`.
- No live region: rotating marketing copy should not be announced on every change.
- Respect `prefers-reduced-motion` through `useReducedMotion`.
- Grey `#86868b` on black passes AA for large text at these sizes.

## Acceptance checklist

- [ ] After the start delay, "Preview every branch." types out one character every ~46ms.
- [ ] A finished line holds for `delay` ms, then deletes faster than it typed.
- [ ] Lines cycle in order and wrap back to the first.
- [ ] The caret is solid while typing or deleting and blinks while a line rests.
- [ ] `loop={false}` stops on the last line with a blinking caret.
- [ ] `cursor="_"` renders an underscore in the accent blue instead of the bar.
- [ ] `showCursor={false}` removes the caret entirely.
- [ ] The paragraph under the typewriter never moves, even when the line is empty.
- [ ] Screen readers read all three claims once.
- [ ] Reduced motion shows "Preview every branch." statically with no caret.
