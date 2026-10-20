# Scrub Inputs

Build design-tool number fields: drag a label (or the number) sideways to change the value, Shift for big steps, Alt for fine. While dragging, an accent badge shows the change from the start; on release it becomes a dark "Changed +12px" badge briefly. Plus an inspector demo where radius, rotate and scale fields drive a shape on a spring. Figma's inspector with Apple polish.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/scrub-inputs/scrub-inputs.tsx`. Named exports `ScrubInput` (one field) and `ScrubInputs` (the demo), plus types `ScrubInputProps` and `ScrubInputsProps`.

## API

**`ScrubInput`** (controlled)

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | required | Field name; dragging it changes the value. |
| `value` | `number` | required | Current value. |
| `onChange` | `(v: number) => void` | required | Called with each new value while dragging, typing or using arrow keys. |
| `min` | `number` | required | Lowest allowed value. |
| `max` | `number` | required | Highest allowed value. |
| `step` | `number` | `1` | Change per 2px of drag and per arrow press. |
| `unit` | `string` | `""` | Suffix after the number and in the change badge. |
| `accent` | `string` | `"#0071e3"` | Live badge colour. |

**`ScrubInputs`**

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `"#0071e3"` | Passed to each field; also the start of the shape's gradient. |
| `autoplay` | `boolean` | `false` | Changes the three fields by itself until someone touches them. |

## Layout and look

**Field row**: 44px tall, row, items centred, 12px gap, radius 12px, 12px side padding, white, ring `0 0 0 1px rgba(0,0,0,.07)`. Dark: `#1c1c1e`, ring `rgba(255,255,255,.1)`.
- Label: 64px wide `<label>` tied to the input with `useId`, 13px medium `#6e6e73` (dark `#a1a1a6`), `cursor: ew-resize`, `touch-none`, `select-none`.
- Number: a transparent `<input inputMode="decimal">`, flex-1, 14px medium tabular numbers, `#1d1d1f` (dark `#f5f5f7`), no outline, `cursor: ew-resize` (text cursor when focused). Wrapped in a `relative` box that anchors the badge.
- Unit: 12px `#86868b` (dark `#8e8e93`).
- Badge: absolutely 32px above the number, left aligned, no wrap, radius 6px, padding 6px × 2px, 11px semibold tabular, `pointer-events-none`.
  - Live (dragging): background `accent`, white text, content `+N` / `−N`.
  - Result (after release): background `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f`), content `Changed +N{unit}`.
  - Hidden whenever the delta is 0.

**Demo (`ScrubInputs`)**: row that wraps, centred, `max-w-[460px]`, 32px gap.
- Preview box 180×200 centring a 120×120 shape with `linear-gradient(140deg, {accent}, #5e5ce6)` and shadow `0 24px 40px -18px rgba(0,0,0,.4)`.
- Fields column, 230px wide, 10px gap: Radius (0–60, unit `px`, start 28), Rotate (−180–180, unit `°`, start 0), Scale (50–150, unit `%`, start 100). Caption below with 4px top padding: "Drag a label sideways. Shift for big steps." 12px `#86868b` (dark `#8e8e93`).

## Motion

- **Badge**: keyed `"live"` while dragging and `"done"` after, inside `AnimatePresence`, so releasing swaps one badge for the other. Enter from `opacity 0, y 6, scale 0.8`; exit to `opacity 0, y −4, scale 0.9`; spring stiffness 600, damping 28. The result badge disappears after 1400ms (restart the timer on each release, clear on unmount).
- **Shape**: animates `borderRadius = radius`, `rotate = rotate`, `scale = scale/100` with spring stiffness 300, damping 22, so scrubbing feels fluid and autoplay changes bounce slightly.

## The scrub maths

On pointer down (label or input): capture the pointer, record start x and start value, show a zero delta, clear any result badge. On each move:
- `mult = Shift ? 10 : Alt ? 0.1 : 1`
- `raw = startValue + (dx / 2)·step·mult` (one step per 2px)
- `quantum = step·(Alt ? 0.1 : 1)`
- `v = clamp(round(raw / quantum)·quantum, min, max)`
- call `onChange(Number(v.toFixed(2)))`; `delta = Number((v − startValue).toFixed(2))`.

On pointer up/cancel: if delta ≠ 0, show the result badge with that delta; end the drag.

## Interaction and states

- Typing: the input edits a local text string. On blur parse it; a valid number is clamped and sent to `onChange`, an invalid one reverts to the current value. Enter blurs (commits).
- ArrowUp / ArrowDown: `±step` (×10 with Shift), clamped, prevent default.
- When `value` changes from outside (another drag, autoplay), resync the text. Do this during render by comparing against a `shown` copy in state, not in an effect, so there is no flash of stale text.
- The demo root marks touched on any pointer down.

## Autoplay demo

`ScrubInputs` with `autoplay`: every 1100ms apply the next step of `radius 60, rotate −15, scale 120, radius 6, rotate 12, scale 90, radius 28, rotate 0, scale 100` and loop. Values are set directly (no badges), and the shape springs to each. After the first pointer down the next tick clears the interval.

## Accessibility

- Every number is a real text input with a real `<label>`, so screen readers announce "Radius, 28" and typing works.
- Arrow keys adjust values; Shift for ×10.
- The badge is decorative (`pointer-events-none`); the input value carries the state.

## Acceptance checklist

- [ ] Dragging a label right by 20px raises the value by 10 steps; left lowers it.
- [ ] Shift multiplies speed by 10; Alt gives 0.1 steps; values never leave `[min, max]`.
- [ ] An accent "+N" badge follows the drag and hides at zero delta.
- [ ] On release it swaps to a dark "Changed +N{unit}" badge that leaves after 1.4s.
- [ ] Clicking the number lets you type; Enter or blur commits; garbage reverts.
- [ ] The demo shape's corner radius, rotation and scale follow the fields on a spring.
- [ ] Autoplay walks through the sequence every 1.1s and stops at the first pointer down.
