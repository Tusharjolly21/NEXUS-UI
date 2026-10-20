# Ruler Picker

Build a duration picker you fling like a physical ruler. A horizontal strip of tick marks slides under a fixed orange needle; dragging it glides on with momentum and always comes to rest exactly on a whole unit. A large number above rolls up or down in the direction you moved, values of an hour or more switch to `h:mm hr`, and preset chips spring the ruler into place. It should feel tactile and weighty, like a well-damped iOS picker wheel laid flat.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `drag` with `dragTransition`).
- File: `components/ruler-picker/ruler-picker.tsx`, named export `RulerPicker`; export `RulerPickerProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `min` | `number` | `0` | Smallest value. |
| `max` | `number` | `90` | Largest value. |
| `defaultValue` | `number` | `25` | Starting value. |
| `unit` | `string` | `"min"` | Unit after the number (replaced by "hr" at 60 and above). |
| `presets` | `number[]` | `[5, 15, 30, 60]` | Quick-pick chips under the ruler. |
| `accent` | `string` | `"#ff9f0a"` | Needle and selected-preset colour. |
| `onChange` | `(v: number) => void` | — | Called whenever the whole-unit value under the needle changes (including mid-glide). |
| `autoplay` | `boolean` | `false` | Glides between values by itself until the user interacts. |

## Layout and look

- Root: full-width vertical flex, centred, 24px gap.
- Readout: 64px tall row, baseline-aligned, 4px gap, `aria-live="polite"`. Number: 56px semibold, line-height 1, tracking −0.04em, tabular numbers, `#1d1d1f` / dark `#f5f5f7`. If `floor(value / 60) > 0` show `h:mm` (minutes padded to 2), otherwise the plain value. Unit: 18px medium, normal tracking, `#86868b` / `#98989d`, showing "hr" when hours > 0, else `unit`.
- Ruler window: 380px wide (max 100%), 72px tall, radius 16px, `overflow: hidden`. Light: white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 10px 30px -18px rgba(0,0,0,.3)`. Dark: `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08)`. A horizontal mask fades both ends: `linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)` (set both `mask-image` and `-webkit-mask-image`).
- Track: absolutely at top-left, full height, a flex row with ticks aligned to the bottom, with 190px (half the window) padding on both sides. Constant `STEP = 12px` per unit.
- Ticks: one 12px-wide column per value from `min` to `max`; the first column gets `margin-left: −6px` so its centre sits exactly at the window centre when the track's `x` is 0. Each column shows a 1.5px rounded line with 14px bottom margin: major (value divisible by 5) 26px tall `#1d1d1f` / `#f5f5f7`; minor 14px tall `#c7c7cc` / `#636366`. Every value divisible by 15 also shows a label 10px from the top, 11px medium tabular, `#86868b` / `#98989d`.
- Needle: 3px wide, rounded, in `accent`, centred horizontally, 8px from top and bottom, non-interactive, above the track.
- Presets: row with 8px gap. Chips 36px tall, fully rounded, 16px horizontal padding, 13px medium, shadow `0 0 0 1px rgba(0,0,0,.08)` (dark `rgba(255,255,255,.08)`). Unselected: white / dark `#2c2c2e`, `#1d1d1f` / `#f5f5f7`. Selected (value equals preset): accent background, white text, with a colour transition. Labels: `p ≥ 60` → `"{p/60} hr"`, otherwise `"{p} min"`.

## Motion

- The ruler's position is one motion value `x`, starting at `−(defaultValue − min) × 12`. Value under the needle = `clamp(round(−x / 12) + min, min, max)`. Subscribe to `x` changes; when the rounded value changes, record the direction (+1 increasing, −1 decreasing), update state and call `onChange`.
- Drag: `drag="x"`, constraints `left: −(max − min) × 12`, `right: 0`, `dragElastic: 0.12` (slight rubber-band past the ends).
- Momentum and snap: `dragTransition = { power: 0.25, timeConstant: 260, modifyTarget: t => round(t / 12) × 12, bounceStiffness: 300, bounceDamping: 30 }`. The fling's projected resting point is rounded to the nearest tick, so it always lands precisely on a unit; hitting an end bounces with that spring.
- Programmatic moves (presets, arrow keys, autoplay): `animate(x, −(v − min) × 12, { type: "spring", stiffness: 140, damping: 22 })` — a slow, smooth glide with a slight settle.
- Number roll: `AnimatePresence mode="popLayout" initial={false} custom={dir}`, keyed by value. Variants: enter `y: dir × 30, opacity 0, blur(4px)`; exit `y: dir × −30, opacity 0, blur(4px)`; animate to `y 0, opacity 1, blur(0)`; spring stiffness 600, damping 36. Increasing values come up from below and push the old one up; decreasing reverses. Pass `custom` to both the presence and the child.
- Chip press: `whileTap` scale 0.92.

## Interaction and states

- Drag or fling the ruler with mouse or touch (grab/grabbing cursor).
- Preset click: mark touched and glide to that value.
- The readout and selected-preset state update live as ticks pass the needle.
- Any pointer-down in the root marks touched.

## Autoplay demo

When `autoplay` is true, every 2200ms glide to the next value in 60, 5, 45, 15, 30 (looping). The number rolls through every intermediate value as it goes. Once touched (pointer-down, arrow key or preset), the interval clears itself on its next tick.

## Accessibility

- The ruler window is `role="slider"`, `tabIndex={0}`, `aria-label="Duration"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` = current value. ArrowRight / ArrowLeft glide by ±1 (clamped) and mark touched.
- Focus: no outline; a 2px `#0071e3` ring on `:focus-visible`.
- Preset chips are `type="button"` with a 2px `#0071e3` focus-visible outline, offset 2px.

## Acceptance checklist

- [ ] Starts at 25 min with the 25 tick under the needle.
- [ ] Flinging the ruler glides on and always stops exactly centred on a tick.
- [ ] Dragging past 0 or 90 stretches slightly and bounces back.
- [ ] The big number rolls up when the value increases and down when it decreases.
- [ ] At 60 and above the readout shows "1:00 hr", "1:15 hr", etc.
- [ ] Major ticks every 5, labels every 15, ends fade out.
- [ ] Presets glide the ruler smoothly and turn orange when selected.
- [ ] Arrow keys step by one; with `autoplay`, it glides between values every 2.2s until touched.
