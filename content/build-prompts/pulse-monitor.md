# Pulse Monitor

Build a heart-rate card: a big live BPM number, a bedside-monitor ECG trace that sweeps left to right and erases a band ahead of the pen, a heart icon that thumps on every spike, and a row of 24 hourly range bars you can scrub to read any hour. A "Start workout" button makes the rate climb, the beats close up and every accent warm from pink-red to orange. The feel is a calm, precise Apple Health widget with physical, springy details.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useReducedMotion`), one 2D `<canvas>`.
- File: `components/pulse-monitor/pulse-monitor.tsx`, named export `PulseMonitor`, plus exported `PulseMonitorProps` and `HourRange` (`{ lo: number; hi: number }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `bpm` | `number` | `68` | Resting heart rate. Also seeds the day's hourly ranges. A workout targets `max(bpm + 50, 120)`. |
| `color` | `string` | `"#ff375f"` | Trace, heart and bar colour at rest. |
| `workoutColor` | `string` | `"#ff9f0a"` | Colour all of those switch to during a workout; also the button's fill. |
| `autoplay` | `boolean` | `false` | Self-demo (see below) until someone interacts. |

## Layout and look

- Card: `w-[380px] max-w-full`, radius 24px, padding 20px, white (dark `#1c1c1e`). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`. `transition-colors 300ms`.
- Header row (space-between, items-start): left a 20×20 heart SVG (viewBox 24, path `M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z`) plus "Heart rate" 14px semibold `#1d1d1f` (dark `#f5f5f7`), 8px gap. Right: a pill button, height 28px, padding 0 12px, 12px semibold, background `#f0f0f3` (dark `#2c2c2e`), text "Start workout" / "End workout".
- Number row (8px top margin, baseline-aligned, 6px gap): the BPM in a 44px-tall, overflow-hidden box, 44px semibold, line-height 1, tracking −0.04em, tabular figures; then "BPM" 14px medium secondary.
- Under it: "Peak N" and "Min N", 11px medium uppercase, tracking 0.06em, 16px gap, secondary.
- Secondary text colour: `#6e6e73` (dark `#98989d`).
- Canvas: 12px top margin, full width, aspect ratio 340/92, radius 10px. Its CSS background is a 17px grid: two `linear-gradient`s (horizontal and 90deg) of a 1px line in `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.07)`), `background-position: -1px -1px`. Put the grid colour in a CSS variable set by a class with a `dark:` override.
- Readout row (16px top margin, 11px, space-between): left "Today" or "HH:00"; right "min–peak BPM" in secondary, or "lo–hi BPM" in primary text when an hour is selected.
- Bars: 8px top margin, 70px tall flex row, 3px gap, `cursor-crosshair`, `touch-action: none`. Each of 24 columns is a full-height pill track `#f0f0f3` (dark `#2c2c2e`) with an absolutely positioned pill inside, coloured with the current tone, spanning from `range(lo)%` from the bottom to `range(hi)%`, where `range(v) = (v − (min − 4)) / ((peak + 4) − (min − 4)) · 100`.
- Axis labels below (6px margin, 10px, secondary, space-between): `12 AM`, `6`, `12 PM`, `6`, `11`.

## Data

- Hourly data is deterministic: a linear congruential generator `s = (s·9301 + 49297) mod 233280`, `r = s/233280`, seeded with 5. For each hour h: `sleep = −12` if h < 6, `−8` if h > 22, else 0; `active = 34` at 8 and 18, `14` at 13, else 0; `mid = bpm + sleep + 0.6·active + (r − 0.5)·8`; `lo = round(mid − 6 − 6r)`, `hi = round(mid + 6 + 0.5·active + 8r)` (each `r` a fresh draw). Peak is the max `hi`, Min the min `lo`. Memoise on `bpm`.

## Motion

- **ECG trace** (requestAnimationFrame, canvas at `devicePixelRatio` capped at 2, drawn in a 340×92 coordinate space). Pen speed 95 px/s; `dt` capped at 0.05s. The live rate eases toward the target each frame: `live += (target − live) · min(1, dt·0.9)`. Split each frame into `max(1, round(dt·95))` sub-steps; per step advance `phase += sdt·live/60`, wrapping at 1. Beat shape: `ecg(p)` is a sum of Gaussians `a·exp(−((p − c)/w)²)` with (c, w, a) = (0.12, 0.035, 0.12) P wave, (0.27, 0.012, −0.14) Q, (0.30, 0.014, 1) R, (0.335, 0.014, −0.28) S, (0.55, 0.06, 0.22) T. `y = 92/2 + 6 − ecg(phase)·92·0.42`. Before each segment, `clearRect` an 18px band ahead of the pen (wrapping to the left edge when it passes 340), then stroke a 2px round-capped line from the last point in the current tone. Wrap `x` to 0 at 340. Read the tone through a ref so colour changes apply mid-sweep.
- **Beat**: once per cycle, when phase crosses 0.3 (the R spike), animate the heart's scale through `[1, 1.28, 0.94, 1]` over 0.42s with times `[0, .25, .6, 1]`, and set the shown number to `round(live + (random − 0.5)·2)`.
- **Number roll**: `AnimatePresence mode="popLayout" initial={false}` keyed by the value; enter from `y: 60%, opacity 0`, exit to `y: −60%, opacity 0`, spring stiffness 420, damping 30.
- **Heart fill** animates to the tone over 0.6s. **Workout button**: `whileTap scale 0.94`; a `workoutColor` layer fades in over 0.3s behind the label; label is always `#1d1d1f` when active.
- **Bars**: each pill mounts from a zero-height line at 50% and springs (stiffness 300, damping 26) to its range with a stagger of `i·0.015s` (only when no hour is selected). The selected bar gets `scaleX 1.35`; others drop to opacity 0.35.
- **Workout**: target becomes `max(bpm + 50, 120)`; the rate, spacing of beats and number climb smoothly through the easing above.
- **Reduced motion**: skip the heart scale pulse and roll the number with opacity only.

## Interaction and states

- Pointer down/move over the bars selects `floor(x / width · 24)` clamped to 0–23; pointer leave clears it. Touch works the same because the bars have `touch-action: none`.
- Keyboard on the focusable bars: ArrowRight/ArrowUp next hour (from none → 0), ArrowLeft/ArrowDown previous (from none → 23), Home 0, End 23, Escape clears; blur clears.
- The workout button toggles the state. Any pointer down on the card marks it "touched".

## Autoplay demo

Every 5200ms: on odd ticks toggle the workout, then sweep the selected hour from 0 to 23 every 70ms and clear it at the end. Stop everything as soon as the card is touched (pointer down, scrub, button or keys). Clear both intervals on unmount.

## Accessibility

- Bars: `role="slider"`, `tabIndex=0`, `aria-valuemin 0`, `aria-valuemax 23`, `aria-valuenow` the hour, `aria-valuetext` like "09:00, 70 to 104 BPM" (or "Today, 52 to 118 BPM"), and an `aria-label` summarising the day's range and the arrow-key hint. Visible focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset.
- A visually hidden `aria-live="polite"` paragraph carries the same readout. Canvas, heart and axis labels are `aria-hidden`. Do not make the per-beat number a live region.
- Button: `aria-pressed={workout}`, focus ring `#0071e3`.

## Acceptance checklist

- [ ] The trace draws a recognisable P-QRS-T beat and erases an 18px band just ahead of the pen.
- [ ] The heart pulses and the number rolls exactly once per R spike.
- [ ] Starting a workout raises the rate smoothly (not instantly) to at least 120 and turns trace, heart and bars orange.
- [ ] The 24 bars rise from the middle with a left-to-right stagger.
- [ ] Scrubbing or arrow keys highlight one bar (wider), dim the others and update the readout.
- [ ] Same `bpm` always produces the same bars; Peak/Min match them.
- [ ] Dark mode swaps card, text, tracks and grid colours.
- [ ] Autoplay stops at the first interaction.
