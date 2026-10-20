# Text Animation Blur Fade In

Build a paragraph that reveals itself piece by piece (by word, by line or by character) as it scrolls into view: each piece rises a little, sharpens out of a blur and fades in, in a soft stagger. It can optionally repeat: hold the finished paragraph, blur the words away upward, then run the reveal again. In this section it is a large founders' note on a plain white (black in dark mode) stage with a small byline. It should feel quiet and editorial, with no bounce.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useInView`, `useReducedMotion`, `Variants`).
- File: `components/blocks/text-animations/text-animation-blur-fade-in.tsx`, named export `TextAnimationBlurFadeIn` (also export `TextAnimationBlurFadeInProps`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `text` | `string` | required | The paragraph. Line breaks are kept. |
| `by` | `"word" \| "line" \| "character"` | `"word"` | What each animated piece is. |
| `delay` | `number` | `0` | Seconds before the first piece. |
| `stagger` | `number` | `0.035` | Seconds between pieces. |
| `duration` | `number` | `0.55` | Seconds each piece takes to settle. |
| `once` | `boolean` | `true` | Reveal only the first time it enters the viewport. Off: hides when it leaves. |
| `repeat` | `boolean` | `false` | Loop the reveal while in view. |
| `repeatDelay` | `number` | `1800` | Milliseconds the finished paragraph is held before repeating. |
| `highlight` | `string` | — | Word or phrase inside `text` set in the accent colour (word and line modes). |
| `className` | `string` | — | Merged onto the paragraph. |

## Layout and look

Component:
- Root: `p`, `max-w-3xl`, `text-pretty`, 28px (`sm` 36px), semibold, line-height 1.15, letter-spacing -0.025em, `#1d1d1f` / dark `#f5f5f7`.
- Splitting: `line` splits on one or more newlines (dropping empties); `character` uses `Array.from(text)`; `word` splits on `/(\s+)/` keeping the whitespace runs as separate entries.
- Whitespace entries render as plain text, or as one `<br>` per newline they contain, so typed line breaks survive.
- Each visible piece is a `motion.span`, `inline-block`, `will-change: transform`; in line mode also `display: block`.
- Accent: `#0071e3` / dark `#2997ff`. Highlight matching normalises both sides (lowercase, strip anything that is not a letter, number or space, trim). Word mode: a word is accented when its normalised form is one of the normalised highlight words. Line mode: a line is accented when it contains the normalised phrase. Character mode: no highlight.

Section (the composition this block shows):
- `section`: flex, centred, full width and height, `overflow-hidden`, background white (dark `black`), text `#1d1d1f` (dark `#f5f5f7`), padding 20px × 48px (`sm` 32px horizontal). Inner column `max-w-3xl`.
- Eyebrow "From the founders": 13px, medium, `#6e6e73` / dark `#a1a1a6`.
- Paragraph: 20px below, `className` sets 30px (`sm` 48px), semibold, line-height 1.15, -0.03em.
- Byline "Ana Ruiz and Tom Becker, co-founders": 32px below, 14px, `#6e6e73` / dark `#a1a1a6`.

## Motion

Piece variants:
- `hidden`: `opacity 0`, `y: "0.35em"`, `blur(8px)`, duration 0 (an instant snap).
- `visible`: `opacity 1`, `y 0`, `blur(0px)`, spring with `duration` and `bounce: 0`.
- `out`: `opacity 0`, `y: "-0.2em"`, `blur(6px)`, 0.28s, ease `[0.4, 0, 1, 1]`.

Parent variants on the `motion.p`:
- `hidden`: `staggerChildren: 0`.
- `visible`: `delayChildren: delay`, `staggerChildren: stagger`.
- `out`: `staggerChildren: min(0.012, stagger)`.

In-view: `useInView(ref, { once, margin: "-80px" })`. The paragraph animates to `hidden` when not in view, otherwise to the current phase.

Repeat cycle (only with `repeat`, in view and motion allowed), phases `in → out → reset → in`:
- Hold `in` for `delay*1000 + visibleCount*stagger*1000 + duration*1000 + repeatDelay` ms (`visibleCount` = non-whitespace pieces).
- Hold `out` for `min(visibleCount*12, 360) + 320` ms.
- Hold `reset` (animate to `hidden`, instant) for 40ms, then back to `in`.
- Never remount the paragraph between passes, so the in-view observer keeps the same node.

## Interaction and states

- Not interactive.
- Memoise the split pieces on `text` and `by`, and the highlight word set on `highlight`.
- Use one timeout per phase, cleared on change and unmount.
- Reduced motion: render a plain `p` with the same classes plus `whitespace-pre-line` and the raw text; no pieces, no animation, no highlight.

## Demo data

- `text`: "We built the tool we kept wishing for.\nIt does fewer things than the others.\nEach of them, properly." (three lines).
- On the page: `by="word"`, `stagger={0.045}`, `once={false}`, `repeat`.

## Accessibility

- The text is real text in a single paragraph, so it reads normally; the per-word spans do not change the reading order.
- While a pass is hidden the words have opacity 0 but stay in the accessibility tree, so screen readers still read the full sentence.
- Respect `prefers-reduced-motion` through `useReducedMotion`.
- Accent colours keep AA contrast on white and black at these sizes.

## Acceptance checklist

- [ ] Scrolling the paragraph into view reveals it word by word: rise 0.35em, unblur 8px, fade in.
- [ ] The reveal has no overshoot (bounce 0).
- [ ] `by="line"` reveals whole lines split on the newlines; `by="character"` reveals letter by letter.
- [ ] Line breaks written in `text` appear in word and character modes.
- [ ] `highlight="properly"` turns that word blue in word mode, even with the trailing full stop.
- [ ] With `repeat`, the paragraph holds, blurs away upward in a quick sweep, then reveals again.
- [ ] `once={false}` hides the paragraph when it leaves the viewport and replays on return.
- [ ] Changing `stagger` and `duration` visibly changes the pace.
- [ ] Reduced motion shows the plain paragraph with its line breaks, unanimated.
- [ ] No layout shift during the reveal: pieces only transform, never resize.
