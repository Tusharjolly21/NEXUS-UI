# Slosh Slider

Build a horizontal slider whose value has mass. The handle is a rigid white bar that stays exactly under your finger, but the liquid fill behind it lags, leans with the speed you drag at, and sloshes back and forth before it settles. Drag fast and let go, and the fill overshoots and wobbles like water in a tank. The look is a clean Apple-style control; all the personality is in the physics.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `useVelocity`).
- File: `components/slosh-slider/slosh-slider.tsx`. Named export `SloshSlider`.

## API

- `label?: string`, default `"Volume"`: shown above the track and used as the accessible name.
- `defaultValue?: number`, default `55`: starting value, clamped to 0–100.
- `accent?: string`, default `"#0071e3"`: liquid colour and focus ring.
- `onChange?: (value: number) => void`: called with the rounded value 0–100, only when the rounded value changes.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: a 300px-wide column with 12px gap.
- Header row (`justify-between`, baseline aligned): label 15px medium; value 22px semibold, tabular numbers, tracking −0.02em, followed by a `%` at 13px in `#86868b` (dark `#98989d`). Label and value `#1d1d1f` (dark `#f5f5f7`).
- Track: exactly 300×46 px (`W = 300`, `H = 46`), radius 14px, `overflow: hidden`, background `#f0f0f3` (dark `#2c2c2e`), `cursor: pointer`, `touch-action: none`.
- Fill: an SVG the size of the track holding one path, filled with a vertical linear gradient of the accent from 75% opacity at the top to full at the bottom. Give the gradient a unique id per instance (`useId`, colons stripped).
- Handle: a 4×30 px white bar, fully rounded, vertically centred, its `left` bound to the handle position and translated −50% on both axes. Shadow `0 0 0 1px rgba(0,0,0,.15), 0 2px 6px rgba(0,0,0,.25)`. `pointer-events: none`. It stays white in dark mode.
- Hint under the track: "Drag fast and let go.", 12px, `#86868b` (dark `#98989d`).

## Motion

All in track pixels (0…300):

1. `hx`: a plain motion value for the handle position. This is the real value; the handle is drawn at `hx` with no smoothing.
2. `level = useSpring(hx, { stiffness: 70, damping: 7, mass: 1.2 })`: the liquid level. Very under-damped, so it lags and overshoots.
3. `vel = useVelocity(level)`: the level's speed in px/s.
4. `lean = clamp(vel · 0.05, −26, 26)`, then `tilt = useSpring(lean, { stiffness: 160, damping: 9 })`: the surface tilt, with its own wobble.
5. The fill path, recomputed from `level` and `tilt` every frame:

```
top = clamp(level + tilt, 0, W); bot = clamp(level − tilt, 0, W)
d = `M0 0 H${top} C ${top} ${H·0.35}, ${bot} ${H·0.65}, ${bot} ${H} H0 Z`
```

So the right edge of the liquid is an S-curve from `top` at the top edge to `bot` at the bottom edge. Moving right makes the top run ahead and the bottom trail; when it stops, the tilt swings back past zero and settles, which is the slosh.

The readout is `round(hx / W · 100)`, driven by a `change` listener on `hx`, so it follows the handle, not the liquid.

## Interaction and states

- `pointerdown` on the track: mark touched and dragging, `setPointerCapture`, stop any running animation on `hx`, and set `hx` to the pointer's x relative to the track (scaled to 0…300 and clamped).
- `pointermove` while dragging: same update. `pointerup` and `pointercancel` end dragging. Tapping the track jumps the handle there instantly; only the liquid travels.
- Keys on the focused track: step = `W / 20` (5%). ArrowRight/ArrowUp add a step, ArrowLeft/ArrowDown subtract one, Home goes to 0, End to 300. Each animates `hx` over 0.2s (default ease) and prevents the default. Clamp to 0…300.
- The value is continuous; only the display and `onChange` are rounded.

## Autoplay demo

With `autoplay`, every 1700ms animate `hx` to the next of `[0.92, 0.18, 0.7, 0.35, 0.86] × W` (cycling) over 0.35s with ease `[0.3, 0, 0.2, 1]`. These quick throws make the liquid slosh visibly. Pointer down or a handled key sets a `touched` ref; the next tick clears the interval for good. Clear it on unmount.

## Accessibility

- The track is the control: `role="slider"`, `tabIndex 0`, `aria-label={label}`, `aria-valuemin 0`, `aria-valuemax 100`, `aria-valuenow` = rounded value, `aria-valuetext` = `"{value}%"`.
- Focus ring: `focus-visible` 2px ring in the accent colour (pass it through a CSS variable) with 2px offset (black offset in dark mode); no default outline.
- The SVG and handle are decorative.

## Acceptance checklist

- [ ] The handle follows the pointer exactly with no lag, and the number above updates with it.
- [ ] The liquid trails the handle, overshoots and oscillates a few times before resting under it.
- [ ] While moving, the liquid's right edge leans: top ahead, bottom behind, by up to 26px.
- [ ] After a fast drag and release, the surface visibly rocks back and forth.
- [ ] Clicking anywhere on the track jumps the handle there and the liquid flows over.
- [ ] Arrow keys move 5% per press, Home and End jump to the ends.
- [ ] `onChange` fires only when the rounded value changes.
- [ ] Autoplay throws the handle every 1.7s and stops for good on the first pointer or key input.
- [ ] Dark mode swaps the track and text colours; the handle stays white and the liquid keeps the accent.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags, clicks the track or uses the keys, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time the value crosses a multiple of 5 (twenty detents), at most once every 40 ms; the liquid sloshing afterwards is silent. Autoplay throws tick too (volume 0.3, at most once every 150 ms); hover is silent. Autoplay plays these same sounds through the same play function's `auto` variant (`play.auto(name, volume)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and still follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
