Build an onboarding checklist card that keeps score with marbles. On the left is a list of setup steps with round checkboxes; on the right a tall, narrow canvas holds three zig-zag ramps above a glass jar. Ticking a step drops a glossy marble of that step's colour in at the top; it rattles down the ramps and settles in the jar. Unticking pops that marble. When every step is done the jar glows green and a "You're all set." note slides in. Calm, Apple-light, quietly physical.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`) and **matter-js** for the marble physics (`import Matter from "matter-js"`), drawn to a 2D canvas.
- File: `components/marble-progress/marble-progress.tsx`, named export `MarbleProgress`, exported `MarbleProgressProps` and `MarbleStep`.
- `done: boolean[]` is state mirrored in a ref; marbles (`{ body, step, color, pop? }`), engine, `full` and dark flags live in refs.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `steps` | `MarbleStep[]` (`{ label: string; color: string }`) | Create your workspace `#0071e3`, Verify your email `#30d158`, Invite a teammate `#ff9f0a`, Connect a repository `#bf5af2`, Ship your first deploy `#ff375f` | Labels must be unique; colours are 6-digit hex. |
| `autoplay` | `boolean` | `false` | Ticks and clears steps on a timer until the user clicks one. Disabled under reduced motion. |

## Layout and look

- Card: 380px wide (`max-width: 100%`), radius 24, padding 20, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e` with ring `rgba(255,255,255,.08)`.
- Header (baseline-aligned): "Get set up" 17px semibold, tracking −0.02em, `#1d1d1f` (dark `#f5f5f7`). Right: "{count} of {total}" 13px tabular `#6e6e73` (dark `#a1a1a6`), with the count semibold `#1d1d1f` (dark `#f5f5f7`).
- Body, 16px below: a row with 12px gap. Left a list (4px gap); right the canvas, 120px wide, aspect 120/300.
- Each step is a full-width button: radius 12, padding 8, 10px gap, hover `#f5f5f7` (dark `#2c2c2e`). Checkbox 22px circle: unticked shows a 1.5px inset ring `#c7c7cc` (dark `#636366`) on transparent; ticked fills with the step colour and the ring fades out. A white 12px check path (stroke 3.4) draws on. Label 14px, tight leading, `#1d1d1f` (dark `#f5f5f7`), with a 1.5px strike line `#86868b` (dark `#8e8e93`) across its middle when done.
- Completion note: radius 12, padding 8×12, 13px medium, `#30d158` at 10% background with `#1a7f37` text (dark: 15% background, `#30d158` text).
- Canvas: logical 120×300, backing store ×`min(2, devicePixelRatio)`. Draw each frame: clear; glow (if any); ramps; jar; marbles.
  - Glow: radial gradient centred (60, 260), radius 4 → 80, `rgba(48,209,88, 0.35·glow)` (0.42 in dark) to transparent, filling the bottom 130px.
  - Ramps: 6px-thick rounded rects (radius 3), fill `#d2d2d7` (dark `#48484a`).
  - Jar: an open U from y 238 down to a rounded bottom (corner radius 12) at y 298, 2px stroke `rgba(0,0,0,.14)` (dark `rgba(255,255,255,.18)`), plus a 3×40 glass highlight at (9, 244), `rgba(255,255,255,.55)` (dark `.14`).
  - Marble (radius 9): radial gradient from (x − 0.35r, y − 0.4r) radius 0.1r to the centre radius r: white → colour at 0.25 → colour × 0.55 at 1. Then, clipped to the marble and rotated by the body angle, a 3.2px band `rgba(255,255,255,.35)` across it so you can see it roll.
- Watch `html.dark` with a MutationObserver into a ref so canvas colours follow the theme.

## Motion

- Engine gravity (0, 1). Fixed-step loop: accumulate `min(100, frame ms)`, up to 4 `Engine.update(engine, 1000/60)` steps per frame, drop leftover above one step.
- Static parts (friction 0.02, restitution 0.3). Ramps (6px thick, chamfer 3): (46, 66) w 92 angle 0.24; (76, 124) w 92 angle −0.24; (40, 178) w 76 angle 0.24. Each leaves a marble-wide gap at its low end. Jar: floor (60, 296) 120×8; walls (4, 270) and (116, 270) 8×60; outer bounds (−4, 150) and (124, 150) 8×600.
- Drop: circle radius 9 at x = 14 + random 0–10, y = −18, restitution 0.45, friction 0.005, frictionAir 0.004, density 0.004, initial velocity (1.2, 0).
- Pop: remove that step's live (not already popping) marble from the world, then over 220ms grow it to 1.6× radius while fading to 0, then forget it.
- Glow eases toward 1 when all are done (0 otherwise) by 6% per frame.
- Checkbox: background and scale `[1, 1.25, 1]` over 0.35s; check path `pathLength` 0 → 1 over 0.25s with 0.1s delay when ticking. Strike line width 0 → 100% with a spring (260/30). Counter digit swaps with `AnimatePresence mode="popLayout"`: new enters from y −10, old exits to y 10. Note enters from y 8 with fade.
- Run the loop only while the canvas is on screen (IntersectionObserver) and `!document.hidden`; reset the clock on resume. On unmount cancel the frame, disconnect observers and clear the engine and world.

## Interaction and states

- Clicking a step toggles it: ticking drops a marble; unticking pops one marble of that step.
- `full` (all ticked) lights the jar and shows the note; unticking any step removes it.

## Autoplay demo

Every 1.4s, on a cycle of `steps.length + 3` ticks: tick each step in order, wait two ticks, then untick every done step at once (all those marbles pop), and repeat. Stops for good the moment the user clicks a step. Off when the user prefers reduced motion.

## Accessibility

- Each step is a `button` with `role="checkbox"` and `aria-checked`; focus ring 2px `#0071e3` (dark `#0a84ff`).
- The counter is `aria-live="polite"`; the canvas is `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Ticking a step plays `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 60% volume; unticking it plays `off` at 60% (a small noise click with a sine falling from 760 to 480 Hz over 70ms). Ticking the last open step also plays `done` at 80% (four soft triangle notes, C5 E5 G5 C6, 40ms apart, ringing for about 0.6s) on top of the tick. The marbles rattling down make no sound. The autoplay ticking plays the same `tick` at 60% (plus `done` at 80% on the last step); when the autoplay clears the list it plays a single `off` at 60% for the whole reset, not one per step. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Ticking a step drops a marble that zig-zags down all three ramps and settles in the jar without getting stuck.
- Unticking pops that step's marble with a quick grow-and-fade.
- The counter animates and reads "n of N".
- Ticking everything makes the jar glow and shows "You're all set."
- Autoplay fills and empties the jar on a loop and stops on the first click.
- Physics pauses off screen and in hidden tabs; nothing keeps running after unmount.
- Dark mode recolours card, text, checkbox rings, ramps, jar glass and highlight.
