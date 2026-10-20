# Step Player

Build an onboarding step player in a small card. The text for the current step sits on top; below it, a row of dots in a pill and a round play/pause button. The current step's dot stretches into a bar that fills from left to right while the step plays; when it's full, the bar eases over to the next dot, the text swaps with a soft blurred slide, and a small wave runs through the dots still ahead. You can pause, resume, or tap any dot to jump. It should feel calm and precise, like a system onboarding screen.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useTransform`).
- File: `components/step-player/step-player.tsx`. Named export `StepPlayer`, plus `StepPlayerProps`, the `StepPlayerStep` type and the `DEFAULT_STEPS` constant.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#0071e3"` | Colour of the filling bar, finished dots and the "Step n of m" line. |
| `steps` | `StepPlayerStep[]` (`{ t: string; b: string }`) | `DEFAULT_STEPS` | Title and one-line body per step. |
| `stepDuration` | `number` | `3.2` | Seconds each step plays. |
| `autoplay` | `boolean` | `true` | Starts playing on mount; `false` starts paused. |

`DEFAULT_STEPS`: "Connect your calendar" / "We only read busy times, never the details."; "Pick your working hours" / "Meetings outside them need your say-so."; "Share your link" / "People choose a slot that suits you both."; "Get a summary each morning" / "Your day, in one short message at 8am."

Render nothing if `steps` is empty, and clamp the current index if the list shrinks.

## Layout and look

- Card: 320px wide, vertical flex, 24px gap, padding 24px, radius 26px. Light bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Text area: 64px tall, relative, overflow hidden. "Step {n} of {count}": 12px semibold, tabular numbers, accent colour. Title: 2px below, 17px semibold, tracking -0.02em, `#1d1d1f` / dark `#f5f5f7`. Body: 13px, `#6e6e73` / dark `#a1a1a6`.
- Bottom row: space-between, items centred.
- Dot pill: inline flex with 6px gap, padding 10px, fully rounded, bg `#f0f0f3` / dark `#2c2c2e`.
- Dots: buttons 8px tall, fully rounded, overflow hidden. Width 52px for the current dot, 8px otherwise. Colours: finished dots (index < current) use the accent (inline style); the current dot's track is `#d2d2d7` / dark `#48484a`; dots ahead are `#c7c7cc` / dark `#3a3a3c`. Background colour transitions with CSS over 300ms. Inside the current dot, an absolutely positioned rounded span at the left, full height, accent background, whose width is the progress as a percentage.
- Play button: 40px circle, bg `#1d1d1f` with white icon; dark bg `#f5f5f7` with `#1d1d1f` icon. 14px icon, a single path filled with `currentColor`.
- Focus-visible rings: 2px `#0071e3` (dark `#0a84ff`); the play button also has a 2px offset (offset colour `#1c1c1e` in dark).

## Motion

- Progress is a motion value `prog` from 0 to 1; the fill width is `useTransform(prog, p => p * 100 + "%")`.
- A `requestAnimationFrame` loop runs per step: each frame, if playing, `prog += dt / stepDuration` (dt in seconds from the frame timestamps, capped at 1). When `prog` reaches 1, advance to `(i + 1) % count`, bump a `wave` counter and stop the loop. The effect depends on the index and the wave counter, so it restarts (and resets `prog` to 0) for every step, including a single-step list. Read "playing" from a ref synced in an effect so pausing doesn't restart the loop.
- Dot width: spring `stiffness 300, damping 26`, `initial={false}`. The bar visibly slides from one dot to the next because the old one shrinks while the new one grows.
- Wave: dots ahead of the current one animate `y: [0, -5, (wave % 2) * 0.001]` over 0.42s with delay `(k - i) * 0.07s`; the others go to `y: 0`. The tiny alternating last keyframe forces the keyframes to replay on every advance.
- Text swap: `AnimatePresence mode="popLayout" initial={false}`, keyed by the index. Enter from `y 24, opacity 0, blur(6px)` to `y 0, opacity 1, blur(0)`; exit to `y -24, opacity 0, blur(6px)`. Duration 0.45s, ease `[0.16, 1, 0.3, 1]`.
- Play icon: animate the path's `d` between pause `M6 5h4v14H6zM14 5h4v14h-4z` and play `M7 5l12 7-12 7z`, spring `stiffness 400, damping 30`. Button `whileTap` scale 0.9.

## Interaction and states

- Clicking a dot sets it as current and resets `prog` to 0 (clicking the current dot restarts it).
- Play/pause toggles playing; progress freezes in place while paused and continues from there.
- After the last step it loops to the first; the wave then runs through all the other dots.

## Autoplay demo

The player is its own demo: with the default `autoplay={true}` it plays through the steps on a loop. With `autoplay={false}` it starts paused on step 1 until the play button is pressed.

## Accessibility

- The dot pill is `role="tablist"` with `aria-label="Steps"`; each dot is a `type="button"` with `role="tab"`, `aria-selected` for the current one and `aria-label` set to the step title.
- The play button's `aria-label` is "Pause" while playing and "Play" while paused; the icon is `aria-hidden`.

## Acceptance checklist

- [ ] The first dot is a 52px bar that fills with the accent over 3.2s.
- [ ] When full, the bar slides to the next dot, the previous dot turns solid accent and the text slides up with a blur.
- [ ] The dots ahead do a small staggered hop after each advance.
- [ ] Pause freezes the fill and morphs the icon to a play triangle; Play resumes from the same point.
- [ ] Clicking the third dot jumps there with an empty bar.
- [ ] After step 4 it returns to step 1 with all other dots grey again.
- [ ] `stepDuration={5}` makes each step take five seconds.
- [ ] In dark mode the card is `#1c1c1e`, the pill `#2c2c2e` and the play button light.
