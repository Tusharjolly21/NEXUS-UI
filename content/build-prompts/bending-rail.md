# Bending Rail

Build a horizontal slider whose rail is elastic. Drag the knob along the groove and it behaves like a normal slider. Pull it up or down off the groove and the rail bends into a soft V that follows the knob, while a dashed ghost knob stays on the groove to show the real value. Let go and the knob snaps back and the rail twangs straight like a plucked string. The feel is physical and a bit playful, with a crisp, Apple-like finish.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `useMotionValueEvent`).
- SVG paths whose `d` is computed from motion values every frame; no canvas.
- File: `components/bending-rail/bending-rail.tsx`, named export `BendingRail`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"Volume"` | Shown above the rail and used as the slider's accessible name. |
| `min` | `number` | `0` | Lowest value. |
| `max` | `number` | `100` | Highest value. |
| `defaultValue` | `number` | `40` | Starting value (uncontrolled). |
| `unit` | `string` | `"%"` | Suffix after the value. |
| `accent` | `string` | `"#0071e3"` | Filled run, tether, ghost knob and focus ring. |
| `onChange` | `(v: number) => void` | none | Called whenever the rounded value changes. |
| `autoplay` | `boolean` | `false` | Tugs the knob around by itself until the user grabs it. |

## Geometry

Stage coordinates: width `W = 360`, height `H = 160`, groove at `Y0 = 90`, side padding `PAD = 16` (track from x 16 to 344).

- `toX(v) = PAD + (v − min)/(max − min) × (W − 2·PAD)`.
- Motion values `kx` (starts at `toX(defaultValue)`) and `ky` (starts at `Y0`). `x = clamp(kx, PAD, W − PAD)`.
- Value: `round(min + (x − PAD)/(W − 2·PAD) × (max − min))`. Update state and call `onChange` only when the rounded value changes (watch `kx` with `useMotionValueEvent`).
- **Rail path** (two straight runs meeting at the knob, with a rounded corner). With corner size `c = 18`: `lx = max(PAD, x − c)`, `rx = min(W − PAD, x + c)`, `t1 = (lx − PAD)/max(1, x − PAD)`, `t2 = (W − PAD − rx)/max(1, W − PAD − x)`:
  ```
  M PAD Y0  L lx (Y0 + (y − Y0)·t1)  Q x y  rx (Y0 + (y − Y0)·t2)  L (W − PAD) Y0
  ```
  When `y = Y0` this is a straight line.
- **Filled run**: `M PAD Y0 L x y` (a straight line from the left end to the knob, so it follows the bend).
- **Tether**: `M x Y0 L x y`.

## Layout and look

- Root: centred column, gap 8px.
- Header: 328px wide, baseline-aligned, space-between. Label at 15px medium; value at 22px semibold, tabular-nums, tracking −0.02em, followed by the unit at 14px `#86868b` (dark `#98989d`). Text `#1d1d1f` (dark `#f5f5f7`).
- Stage: 360 × 160px, max-width 100%, relative, `touch-action: none`, no selection. An SVG covers it (`overflow: visible`, `aria-hidden`):
  - rail: 6px stroke `#e8e8ed` (dark `#3a3a3c`), round caps and joins, no fill;
  - filled run: 6px `accent`, round caps;
  - tether: 1.5px `accent`, dash `3 5`;
  - ghost knob: circle r 7 at `(x, Y0)`, fill white (dark `#2c2c2e`), 2px `accent` stroke dashed `3 3`.
  Tether and ghost are visible (opacity 1) only while `|ky − Y0| > 6`, otherwise opacity 0, a hard switch.
- Knob: a 28px white circle positioned at `(x, ky)` (centred with −14px margins), shadow `0 4px 12px rgba(0,0,0,.2), 0 0 0 .5px rgba(0,0,0,.08)` (dark `0 4px 12px rgba(0,0,0,.6), 0 0 0 .5px rgba(255,255,255,.12)`), `cursor-grab` (`grabbing` while active). Focus-visible: 2px ring in `accent`, 2px offset (offset colour black in dark mode).
- Caption: "Pull the knob up or down, then let go." at 13px `#86868b` / `#98989d`, pulled up by a −24px top margin so it sits just under the groove.

## Motion

- **Drag**: on pointer-move, `kx = pointer.x` directly and `ky = Y0 + sign(dy) × min(70, |dy| × 0.75)`, where `dy = pointer.y − Y0`. Vertical pull is resisted (75% of the pointer travel) and capped at 70px either side.
- **Knob scale**: 1.15 while dragging, 1 otherwise (framer's default transition).
- **Twang** on release: `animate(ky, Y0, { type: "spring", stiffness: 520, damping: 9 })`. This spring is strongly underdamped, so the knob and the whole V overshoot through the groove and vibrate several times before settling. `kx` stays where it was released; the value is kept.
- **Keyboard steps**: animate `kx` to `toX(newValue)` with `{ type: "spring", stiffness: 500, damping: 34 }`.
- Pointer coordinates are converted to stage units (scale by 360 and 160 against the bounding box) so the slider still works when narrowed by `max-width`.

## Interaction and states

- Pointer-down on the knob: mark touched, set dragging, capture the pointer on the stage so moves anywhere still count.
- Pointer-up or pointer-cancel on the stage: if dragging, stop and twang.
- Horizontal drags beyond the ends are allowed for `kx`, but everything visible and the value use the clamped `x`, so the knob stops at 16 and 344.
- Keyboard on the focused knob (all with `preventDefault`, all mark touched): ArrowRight/ArrowUp +1, ArrowLeft/ArrowDown −1; hold Shift for ±10; clamped to `min`–`max`.

## Autoplay demo

700ms after mount and every 2600ms after, unless touched: pick a target `toX(15 + random × 70)`, animate `kx` there over 0.8s `easeInOut`, and at the same time animate `ky` through `[Y0, Y0 − 45 − random × 25, Y0 − 50]` over 0.8s `easeInOut` (the knob is lifted off the groove while it travels). When that finishes, twang it back. A press or keystroke on the knob stops the loop.

## Accessibility

- The knob is a `<button type="button">` with `role="slider"`, `aria-label={label}`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow={value}`.
- The SVG is `aria-hidden`; the header shows the value as text.

## Acceptance checklist

- At rest the slider is a straight 6px track, accent-filled up to 40%, with a white knob, and the header reads "40%".
- Dragging sideways moves the value in whole steps and fires `onChange` once per change.
- Pulling the knob 100px up moves it only 70px and bends the rail into a V with rounded corner, the fill following the left arm.
- A dashed ghost knob and tether appear once the knob is more than 6px off the groove.
- Releasing makes the knob and rail vibrate through the groove a few times and settle straight, without changing the value.
- Arrow keys step by 1, Shift+Arrow by 10, with a quick spring.
- With `autoplay`, the knob is plucked to a random spot every 2.6s until grabbed.
