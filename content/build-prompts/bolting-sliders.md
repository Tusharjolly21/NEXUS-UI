# Bolting Sliders

Build a small settings panel of range sliders where clicking a track does not slide the knob: the knob leaps to the clicked spot in a ballistic arc, drops a fading dotted trail behind it, keeps reading out its value while in the air, then lands in the groove with a squash. Dragging the knob still works normally. The feel is a clean, Apple-like control panel with a playful, physical knob.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useReducedMotion`).
- File: `components/bolting-sliders/bolting-sliders.tsx`. Named export `BoltingSliders`, plus the `BoltSetting` type and a `DEFAULT_BOLT_SETTINGS` array.

## API

`BoltSetting = { id: string; label: string; min: number; max: number; unit: string; value: number }` (`unit` is appended to the read-out, `value` is the starting value).

`BoltingSliders` props:

- `settings?: BoltSetting[]`, default:
  - Exposure, −2 to 2, unit `" EV"`, starts 0.4
  - Bloom, 0 to 100, `"%"`, starts 35
  - Field of view, 30 to 110, `"°"`, starts 72
  - Samples, 8 to 256, `""`, starts 64
- `title?: string`, default `"Render settings"`.
- `hint?: string`, default `"Click a track and watch the knob jump."`.
- `accent?: string`, default `"#0071e3"`: filled track, trail dots and focus ring.
- `autoplay?: boolean`, default `false`.

Value formatting: if `max − min ≤ 4` show one decimal, otherwise round to an integer. Prefix `+` when the value is positive and `min < 0`. Then append the unit (e.g. `+0.4 EV`, `35%`, `72°`, `64`).

## Layout and look

- Panel: column, 20px gap, padding 24px vertical / 28px horizontal, radius 24px. Light: white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Title: 12px, semibold, uppercase, tracking 0.1em, `#86868b` (dark `#8e8e93`). Hint line at the bottom: 12px, same colours.
- Each slider: a 300px-wide column, 8px gap. Header row, `justify-between`, 13px: label medium `#1d1d1f` (dark `#f5f5f7`); value `tabular-nums` `#6e6e73` (dark `#a1a1a6`).
- Track area: 24px tall, relative, `cursor-pointer`, `touch-action: none`. The track is exactly 300px wide in logic units (call it `TW = 300`); position `x` runs 0…300.
- Groove: 3px tall, full width, vertically centred, fully rounded, `#e8e8ed` (dark `#3a3a3c`).
- Fill: same shape from the left, width bound to the knob's `x` motion value, background `accent`.
- Knob: an 18×18 white circle, `margin-left: −9px; margin-top: −9px` at `left 0, top 50%`, translated by motion values `x`, `y`, and `scaleY` with transform origin at the bottom (`originY: 1`). Shadow `0 2px 8px rgba(0,0,0,.25), 0 0 0 .5px rgba(0,0,0,.1)` (dark: `.6` and `.4` alphas). The knob stays white in dark mode. `cursor: grab`, `grabbing` while active.
- Trail dots: 6×6 accent circles, absolutely placed at `left 0, top 50%` and translated to `(px − 3, py − 3)`, `pointer-events: none`.

## Motion

**Leap (click on the track).** Target `tx` = pointer x relative to the track, clamped to 0…300. Read the current `x0 = x`, `y0 = y`.

- `dist = |tx − x0|`
- `peak = −min(90, 30 + dist · 0.45)` (px, negative = up)
- `duration = 0.35 + min(0.45, dist / 600)` seconds
- Animate a progress `t` from 0 to 1 with **linear** easing over that duration. Every frame:
  - `x = x0 + (tx − x0) · t`
  - `y = y0 · (1 − t) + 4 · peak · t · (1 − t)` (a parabola; `y0` is normally 0, the term only matters when re-targeting mid-flight)
  - the displayed value is `min + (x / 300) · (max − min)`, so the read-out rolls continuously while flying.
- Trail: keep a list of points for this flight. Push the current `(x, y)` when the list is empty or the distance to the last point is more than 9px, giving each point an incrementing id, and render the list. Each dot mounts at `opacity 0.9, scale 1` and animates to `opacity 0, scale 0.4` over 0.8s with `delay = index · 0.01s`.
- On landing: animate `scaleY` through keyframes `[0.6, 1.15, 1]` over 0.35s (squash then overshoot), and clear the trail 500ms later (cancel any pending clear first).
- Starting a new leap stops the flight in progress. Stop flights and clear timers on unmount.

**Reduced motion** (`prefers-reduced-motion`): skip the arc, trail and squash; set `x` to the target, `y` to 0 and the value immediately.

## Interaction and states

- `pointerdown` on the track (but not on the knob; mark the knob with `data-knob` and ignore events whose target has it) starts a leap to that spot.
- `pointerdown` on the knob: stop any flight, set `y` to 0, set dragging, and call `setPointerCapture` on the track element. While dragging, `pointermove` on the track sets `x` directly (clamped) and updates the value. `pointerup` and `pointercancel` end dragging.
- Keyboard on the knob: step = `(max − min) / 20`. ArrowRight/ArrowUp leap to `min(max, value + step)`, ArrowLeft/ArrowDown to `max(min, value − step)`, Home to `min`, End to `max`. Keys leap with the same arc. Prevent default for handled keys.
- Values are not snapped; only the display is rounded.

## Autoplay demo

With `autoplay`, every 1100ms throw the next slider in order (wrapping) to a random value between its `min` and `max`, using the same leap. A `pointerdown` or `keydown` anywhere on the panel marks it as touched; the next tick clears the interval. Implement this by having each slider register its leap function with the parent (store them in a ref) so the interval can call it directly, rather than pushing values through props and effects.

## Accessibility

- The knob is a `<button type="button" role="slider">` with `aria-label` = setting label, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (value rounded to one decimal) and `aria-valuetext` = the formatted read-out.
- Focus ring: `focus-visible` 2px ring in the accent colour (set `--tw-ring-color` inline) with 2px offset; offset colour `#1c1c1e` in dark mode. No default outline.
- Trail dots are decorative.

## Acceptance checklist

- [ ] Clicking far along a track makes the knob arc up to about 90px high and land on the clicked spot; short hops arc lower (at least 30px) and are quicker.
- [ ] The value read-out changes continuously during the flight, formatted as `+0.4 EV`, `35%`, `72°`, `64`.
- [ ] A dotted accent trail appears along the arc, each dot fading and shrinking, and disappears about half a second after landing.
- [ ] The knob squashes vertically from its bottom edge on landing, then springs back.
- [ ] Dragging the knob follows the pointer with no arc, and the fill tracks the knob.
- [ ] Arrow keys, Home and End move the focused knob with the same leap.
- [ ] With reduced motion enabled the knob jumps straight to the target.
- [ ] Autoplay throws one knob after another every 1.1s and stops for good on the first pointer or key press.
- [ ] Dark mode swaps the panel, groove and text colours; the knob stays white.
