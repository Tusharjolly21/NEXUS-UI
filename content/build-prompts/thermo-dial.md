# Thermo Dial

Build a thermostat ring. Drag round it (or use the arrow keys) and the ticks light up to the set point in a colour that runs from cool blue through lavender to amber and red, a soft glow behind the dial warms with them, the big number rolls up or down, and a small label says whether it's heating, cooling or holding against the room's current temperature. The look is a dark, glossy smart-home dial on a light page.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`AnimatePresence`, `animate`, `motion`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`).
- File: `components/thermo-dial/thermo-dial.tsx`. Named export `ThermoDial` and its `ThermoDialProps` type.

## API

- `room?: number`, default `19.5`: current room temperature.
- `defaultValue?: number`, default `21`: starting target.
- `min?: number`, default `10`; `max?: number`, default `30`: the range the 270° arc covers.
- `step?: number`, default `0.5`: increment for dragging and keys. Quantise every value as `round(v / step) · step`, then `toFixed(4)` back to a number to drop float noise, then clamp to `min..max`.
- `onChange?: (value: number) => void`: called with the new target when the user changes it (drag or keys), only when it differs.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 12px gap.
- Dial: a 260×260 element (`S = 260`, centre `C = 130`), rounded-full, `role="slider"`, `cursor: pointer`, `touch-action: none`, no text selection.
- Arc geometry: `START = 135°`, `SWEEP = 270°`, angles measured clockwise from 3 o'clock (screen coordinates), so the arc runs from bottom-left over the top to bottom-right with a 90° gap at the bottom. A value `v` sits at angle `135 + ((v − min) / (max − min)) · 270`.
- Colour ramp for a fraction `k` (0..1): for `k < 0.5` mix `rgb(10,132,255)` → `rgb(191,160,255)` by `k · 2`; otherwise mix `rgb(255,179,64)` → `rgb(255,69,58)` by `(k − 0.5) · 2`. Round each channel.
- Glow: an absolutely positioned, non-interactive circle extending 24px beyond the dial on every side, background `radial-gradient(circle, rgba(<ramp colour>, .33) 0%, transparent 65%)`, driven by the smoothed value.
- Body: a circle inset 34px (192px across), `#1d1d1f`, shadow `inset 0 2px 0 rgba(255,255,255,.12), 0 24px 40px -18px rgba(0,0,0,.6)` (dark: add `0 0 0 1px rgba(255,255,255,.08)` and raise the drop shadow alpha to .9).
- Ticks: an SVG the size of the dial with 54 lines, tick `i` at angle `135 + (i / 53) · 270`, from radius 116 to 126, 2.2px wide, round caps.
  - A tick is "on" when `min + (i / 53) · (max − min) ≤ displayed temp`; on ticks are stroked with the ramp colour at `i / 53`, off ticks `#d2d2d7` (dark `#48484a`).
  - The room tick, index `round(((room − min) / (max − min)) · 53)`, starts at radius 112 instead, is 3px wide and is `#1d1d1f` (dark `#f5f5f7`).
  - Every tick has `transition: stroke .15s`.
- Knob: an 18×18 white circle, shadow `0 2px 8px rgba(0,0,0,.4)`, positioned at radius 104 on the current angle (`left/top` from the smoothed value, translated −50%/−50%).
- Centre readout (non-interactive, white, column, centred):
  - Mode label: "Heating" when `temp > room + 0.4`, "Cooling" when `temp < room − 0.4`, otherwise "Holding". 11px semibold uppercase, tracking 0.18em, coloured with the ramp at the current temp.
  - Number: 54px semibold, line-height 1, tracking −0.05em, tabular. The whole part sits in an `overflow: hidden` inline-flex box; then the decimal and degree sign, `.5°`, at 22px, 4px top margin, `rgba(255,255,255,.7)`.
  - "Room 19.5°" (one decimal) at 11px in `rgba(255,255,255,.55)`.
- Hint under the dial: "Drag round the ring.", 13px, `#86868b` (dark `#98989d`).

## Motion

- `set`: a motion value holding the target. `smooth = useSpring(set, { stiffness: 220, damping: 26 })` drives the knob position, the glow and (via `useMotionValueEvent`) a quantised `temp` state used for ticks, the number and the label.
- Number roll: the whole-degrees `motion.span` is keyed by its text, so it remounts on each change and animates from `y: "45%", opacity: 0.3` to `y: 0, opacity: 1` with a spring, stiffness 520, damping 32. Don't use `AnimatePresence` here: the value can change every frame while dragging.
- Mode label: `AnimatePresence mode="popLayout" initial={false}`, keyed by mode, entering from `opacity 0, y −6` and exiting to `opacity 0, y 6` (default transition).

## Interaction and states

- Pointer down on the dial: mark touched, start dragging, capture the pointer, stop any running animation on `set`, and set from the pointer. While dragging, every move sets from the pointer. Pointer up or cancel ends the drag.
- From pointer: `a = atan2(dy, dx)` in degrees relative to the dial centre, then `a = (a − 135 + 360) mod 360`. If `a > 270` (in the bottom gap) snap to whichever end is nearer: `a > 315 → 0`, else `270`. Value = `min + (a / 270) · (max − min)`, quantised and clamped.
- Keys: ArrowUp/ArrowRight `+step`, ArrowDown/ArrowLeft `−step`, Home `min`, End `max`; prevent default and mark touched.
- `onChange` fires only for user changes and only when the quantised value differs from the current target.

## Autoplay demo

With `autoplay`, every 2400ms animate `set` to the next of the fractions `[0.725, 0.35, 0.85, 0.55]` of the range (24.5°, 17°, 27°, 21° on the default dial), quantised, with `{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }`. A `touched` ref set by pointer down or a key press makes the next tick clear the interval for good. Stop the interval and any running animation on unmount.

## Accessibility

- The dial is `role="slider"`, `tabIndex 0`, `aria-label="Target temperature"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (the displayed temp) and `aria-valuetext="21 degrees, holding"`.
- Focus: no default outline; `focus-visible` shows a 2px outline `#0071e3` (dark `#0a84ff`) offset 4px, so it follows the round shape.
- Tick SVG is `aria-hidden`.

## Acceptance checklist

- [ ] The arc runs bottom-left → top → bottom-right; the bottom 90° is a dead zone that snaps to the nearer end.
- [ ] Ticks up to the set point light in a blue → lavender → amber → red ramp; the rest are grey; the room tick is longer, thicker and dark.
- [ ] The glow behind the dial visibly changes from blue to orange as the value rises.
- [ ] The whole-degree digits roll up into place each time they change; the half digit just updates.
- [ ] The label switches between Heating, Cooling and Holding with a short vertical cross-fade.
- [ ] Arrow keys step by 0.5, Home and End jump to the ends.
- [ ] Autoplay turns to 24.5, 17, 27, 21 every 2.4s and stops for good on first touch.
- [ ] Passing `min={50} max={86} step={1}` works for Fahrenheit.
- [ ] Dark mode swaps the off ticks, room tick, hint and focus colour; the dial body stays dark.
