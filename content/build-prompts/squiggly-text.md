Build text that "boils" like a stop-motion pencil drawing. An SVG turbulence + displacement filter re-rolls its noise seed every few frames so the letter edges wobble in place, and an optional hand-drawn squiggle underline draws itself in. Sweeping the pointer across the text stirs the ink: the wobble jumps with pointer speed, overshoots and settles back on a springy decay. Ship three pieces: a word wrapper, a whole-line wrapper and a ready-made hero headline.

## Stack

- React client components (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useSpring`, `useReducedMotion`), React `useId`, and a `cn` helper built on tailwind-merge.
- File: `components/squiggly-text/squiggly-text.tsx`. Named exports `SquigglyWord`, `SquigglyText`, `SquigglyDrinksHeadline` and types `SquigglyWordProps`, `SquigglyTextProps`, `SquigglyDrinksHeadlineProps`.
- The boil never re-renders React: write `seed` and `scale` straight to the filter elements through refs.

## API

`SquigglyWord`:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | – | Content to boil. |
| `className` | `string` | – | Classes on the wrapper span. |
| `steps` | `number` | `5` | Distinct noise frames cycled (rounded, min 1). |
| `stepDuration` | `number` | `80` | Ms each frame is held (min 16). |
| `scale` | `number \| readonly [number, number]` | `[6, 8]` | Resting displacement px; a pair alternates frame by frame. |
| `baseFrequency` | `number` | `0.02` | Noise frequency (min 0.001). |
| `numOctaves` | `number` | `3` | Noise detail, clamped 1–5. |
| `stir` | `number` | `0.06` | Pointer-speed strength; 0 disables. |
| `underline` | `boolean` | `false` | Hand-drawn squiggle under the text. |
| `underlineColor` | `string` | `#0071e3` (dark `#0a84ff`) | Underline colour. |
| `autoplay` | `boolean` | `false` | Stirs and redraws every 2.8s until pointed at. |

`SquigglyText` takes all of the above except children/className, plus `children?`, `text?` (used when no children), `as?: "span" | "div"` (default `"span"`), `className?` (root) and `textClassName?` (the boiling node). Root: `relative inline-block max-w-full overflow-visible`; it renders one `SquigglyWord` with `inline-block` + `textClassName`.

`SquigglyDrinksHeadline`: `className?`, `headingClassName?`, `steps = 5`, `stepDuration = 90`, `baseFrequency = 0.022`, `numOctaves = 3`, `lead = "Interfaces with"`, `phrase = "a little life"`, `tail = "in every line."`, `autoplay = false`.

## Layout and look

- Filter: a zero-size hidden SVG inside each word holding `<filter>` with a unique id from `useId` (strip non `[A-Za-z0-9_-]` chars), region x −20%, y −30%, width 140%, height 160%, `color-interpolation-filters: sRGB`. Inside: `feTurbulence type="fractalNoise"`, the given frequency/octaves, `seed="1"`, result `noise`; then `feDisplacementMap in="SourceGraphic" in2="noise"`, scale = the first scale value, x channel R, y channel G.
- The text span (relative, inline-block) gets `filter: url(#id)` (and `-webkit-filter`). The underline lives inside the filtered span, so it boils too.
- Underline: an SVG `viewBox 0 0 200 20`, `preserveAspectRatio="none"`, absolute at `bottom: −0.18em`, left 0, full width, `height: 0.28em`, overflow visible. One path drawn with a fixed hand-made curve: `M2 12 C 22 4, 38 18, 58 10 S 96 4, 116 11 S 156 18, 176 9 S 194 8, 198 10`. Stroke 4, round caps, `vector-effect: non-scaling-stroke`, no fill.
- Headline: `<h2>`, centred, `max-width: 14ch`, balanced, 44px (56px from `sm`), semibold, tracking −0.035em, leading 1.06, `#1d1d1f` (dark `#f5f5f7`). The phrase is a `SquigglyWord` with `scale [3, 4.5]`, `underline`, text `#0071e3` (dark `#0a84ff`), passing steps/stepDuration/frequency/octaves/autoplay through. Only add the default `leading-[1.06]` if the caller's classes contain no `leading-*` class (tailwind-merge would otherwise drop it when a text size is passed).

## Motion

- Boil: an interval every `stepDuration` ms advances `frame = (frame + 1) mod steps`, sets the turbulence `seed` to `frame + 1`, then repaints the displacement `scale = (frame odd ? s1 : s0) + |excite|`, rounded to 2 decimals. Paint once on mount.
- Stir: a motion value `excite` (extra px) whose change event also repaints. On pointermove over the word: if the previous sample is within 120ms, `speed = distance / ms` (px/ms); if `speed > 0.05`, pulse with `amount = min(18, speed × 1000 × stir × 0.12)`.
- Pulse: stop the previous animation and run `animate(excite, 0, { type: "spring", stiffness: 140, damping: 9, velocity: amount × 10 })`. Starting at its current value with an impulse makes it jump, swing negative (the absolute value keeps it positive) and calm down.
- Underline draw: `pathLength` from a motion value `draw` through `useSpring(stiffness 90, damping 16)`. 250ms after mount set `draw` to 1 so it draws in with a slight overshoot. Redraw = jump both `draw` and the spring to 0, then set `draw` to 1.
- Pointer enter on the word marks it touched and redraws the underline (if `underline`). Pointer leave clears the speed sample.

## Interaction and states

- Works with mouse, pen and touch moves. No click behaviour; the text stays selectable and readable.
- Reduced motion: no filter applied, no interval, no pulses, underline shown fully drawn from the start.
- Clean up: clear the interval and the 250ms timeout, unsubscribe the change listener and stop the spring on unmount.

## Autoplay demo

With `autoplay` (and motion allowed), every 2.8s pulse with amount 14 and redraw the underline. The first pointer enter stops it for good.

## Accessibility

- The filter SVG and underline SVG are `aria-hidden` and `focusable="false"`. The real text stays in the DOM unchanged, so screen readers read it normally. Use a real heading element for the headline.

## Acceptance checklist

- The headline reads "Interfaces with a little life in every line." with the phrase in blue and underlined.
- Letter edges of the phrase wobble continuously at a stop-motion rate (about 11 fps), cycling five noise frames.
- The underline draws in left-to-right shortly after load with a small overshoot.
- Sweeping the pointer quickly across the phrase makes it wobble much harder, then it settles back within about a second.
- Entering the phrase redraws the underline.
- `SquigglyText` with `scale={[2,3]}` and `stepDuration={140}` looks gentle; `[6,8]` at 70ms looks lively.
- Reduced motion shows crisp, still text with a fully drawn underline.
- No React re-render happens per boil frame.
