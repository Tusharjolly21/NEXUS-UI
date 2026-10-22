Build a time-of-day picker drawn as a horizontal ruler you drag or fling under a fixed centre needle. The ruler coasts with inertia and always lands exactly on a snap point; the needle ticks at every interval it crosses and bounces when the ruler lands; the large time readout rolls digit by digit; and a small round sky chip shifts colour from night to dawn to day, swapping a sun for a moon. Compact Apple card.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `useReducedMotion`), and a `cn` class-merge helper.
- File: `components/time-scrubber/time-scrubber.tsx`, named export `TimeScrubber`, exported type `TimeScrubberProps`.

## API

All times are minutes since midnight.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `value` | `number` | – | Controlled value. |
| `defaultValue` | `number` | `570` (9:30) | Uncontrolled start. |
| `onChange` | `(m) => void` | – | Snapped time whenever the user changes it (including while dragging/coasting). |
| `onCommit` | `(m) => void` | – | Once the ruler lands after a user change. |
| `interval` | `number` | `15` | Snap minutes. Max value is `1440 − interval`. |
| `format` | `"12h" \| "24h"` | `"12h"` | Readout and hour labels. |
| `accent` | `string` | `#0071e3` (dark `#0a84ff`) | Needle (`--ts-accent`). |
| `density` | `number` | `1.6` | Px per minute. |
| `label` | `string` | – | Caption above the time, e.g. "Pickup". |
| `hint` | `string` | `"Drag the ruler, or fling it."` | Under the ruler; `""` hides. |
| `autoplay` | `boolean` | `false` | Flings to demo times until touched. |
| `disabled` | `boolean` | `false` | 50% opacity, no input. |
| `className` | `string` | – | Card classes. |

## Layout and look

- Card: `inline-flex` column, 320px (max 100%), radius 24, padding 20 20 16, white / `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e` / `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Header row (gap 12): 36px sky chip (round, inner highlight `inset 0 1px 0 rgba(255,255,255,.35)`) holding a 16px white glyph. Then: optional label 12px medium `#6e6e73` (dark `#a1a1a6`); the time 40px semibold, leading 1, tracking −0.045em; period "AM"/"PM" 15px medium grey, 6px gap, baseline-aligned. 12h shows `9:30`, 24h shows `09:30`.
- Ruler viewport: 16px below, full width, 64px tall, radius 14, `#f5f5f7` (dark `#2c2c2e`), `overflow: hidden`, grab cursor, `touch-action: none`. Focus ring 2px blue. Edges fade via a mask `linear-gradient(to right, transparent, #000 20%, #000 80%, transparent)`.
- Ticks every 5 minutes for the whole day (0–1440), placed at `left = m × density`, top 8px: hour 2×22px `#1d1d1f` (dark `#f5f5f7`); half-hour 1×15px at 45%; minor 1×9px at 20% (dark 22%). Hour labels (0–23) at top 38px, centred under the tick, 11px medium tabular grey: "9 AM" / "12 PM" (or "09:00").
- Needle: centred, top 3px, 3×32px, rounded, accent, `transform-origin: top`, ringed `0 0 0 2px #f5f5f7` (dark `#2c2c2e`) so it cuts through the ticks.
- Hint: 10px below, centred, 12px `#86868b` (dark `#98989d`).

## Motion

- Ruler position: motion value `x`; the needle sits at `half` (half the viewport width, measured with a ResizeObserver). `minutesAt(px) = (half − px)/density`; `pxFor(m) = half − m × density`. On resize, jump `x` to keep the same minute.
- On every `x` change compute `snap(minutesAt(x))` (round to interval, clamp). When it differs from the last shown value, update the readout; if a drag or animation is in progress, "tick" the needle (scaleY set to 1.14 and sprung back to 1, stiffness 700, damping 12) and emit `onChange` if the user has touched it.
- Landing: needle kick 1.4 → 1 (same spring), emit, and call `onCommit` for user actions.
- Settle (keys, wheel, slow release, autoplay, controlled changes): spring `x` to `pxFor(target)` with stiffness 200, damping 26, then land.
- Fling: on release with |velocity| ≥ 40px/s run a framer inertia animation: velocity, power 0.35, timeConstant 280, min `pxFor(max)`, max `pxFor(0)`, bounceStiffness 260, bounceDamping 28, restDelta 0.5, and `modifyTarget: t ⇒ pxFor(snap(minutesAt(t)))` so it always comes to rest on a snap point. Land on complete.
- Rolling digits: each digit is a 0.6em × 1em masked window (`transparent → #000 14% … 86% → transparent`) with a 0–9 column whose `y = −digit × 10%` via `useSpring(stiffness 320, damping 24, mass 0.5)`. Key digits from the right; the colon is static, nudged up 0.05em.
- Sky chip: background = `linear-gradient(160deg, top, bottom)` interpolated live from `x` through keyframes (hour: top RGB, bottom RGB): 0 (20,28,58)/(44,52,98); 5 (44,52,98)/(191,90,242); 7 (255,159,10)/(255,214,140); 10 (90,200,250)/(190,232,255); 16 (64,170,250)/(180,222,255); 19 (255,112,67)/(191,90,242); 21 (40,44,92)/(94,60,140); 24 = 0.
- Glyph: daytime is 6:00–18:00. Sun (r 3.4 disc + 8 short rays, stroke 1.3) and crescent moon cross-fade with opacity, scale 0.4 ↔ 1 and rotate (sun out to −90°, moon out to 90°), spring 380/20.

## Interaction and states

- Drag: primary pointer down prevents default, marks touched, focuses (trusted), stops animations. Window move/up. Divide deltas by the viewport's CSS scale. Velocity is smoothed `v = 0.6v + 0.4·instant` (px/s). Rubber-band past either end of the day at 25%. If the pointer was held still more than 90ms before release, velocity is 0.
- Wheel/trackpad (non-passive listener): use the dominant axis, accumulate deltas, and step one interval per 28px, settling from the current target.
- Keys: Arrows ±interval, PageUp/PageDown ±60, Home 0, End max; settle.
- Controlled `value` changes animate to the new time without firing callbacks.
- Reduced motion: no inertia or springs (jump), no needle kicks, digits jump.

## Autoplay demo

Every 2.6s settle (without callbacks) to the next of 13:15, 7:45, 19:30, 22:45, 10:00, snapped. The needle ticks as hours pass and the sky chip sweeps through its colours. Stop on first touch, wheel or key.

## Accessibility

- Viewport `role="slider"`, focusable, label = `label` or "Time", `aria-valuemin 0`, `aria-valuemax` = max minute, `aria-valuenow` minutes, `aria-valuetext` "9:30 AM", `aria-disabled`. Readout, ticks, labels and needle are `aria-hidden`.

## Acceptance checklist

- The card shows 9:30 AM with a blue sky chip and a sun.
- Dragging moves the ruler 1:1; the needle twitches at every 15-minute mark crossed.
- A quick fling coasts and stops exactly on a 15-minute mark, with a bigger needle bounce.
- Digits roll independently; 12h/24h formats are correct, including 12 AM and 12 PM.
- The sky chip moves through night navy, dawn violet, orange, blue day and sunset; the glyph swaps at 6:00 and 18:00.
- Wheel, arrows, Page keys, Home and End all land on snap points.
- Autoplay cycles demo times and stops on first touch; dark mode recolours card, ruler and needle ring.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags, flings, scrolls or uses the keys, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time the ruler crosses a snap interval, at most once every 40 ms. When the ruler comes to rest after the user's action, play one soft `drop` (a low sine thump falling 380 to 120 Hz with a brief noise tap, volume 0.4), together with the needle bounce. Autoplay landings, controlled-value changes and hover are silent. It is silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
