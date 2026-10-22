Build a slider drawn as a row of thin vertical ticks that fill with the accent colour up to the value. Ticks swell in a smooth wave around the pointer (and more gently around the needle), the needle leans into the direction it moves and swings upright when it stops, and the big number above rolls digit by digit like an odometer. Precise and tactile, like a pro audio control.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useVelocity`, `useReducedMotion`), React `useId`, and a `cn` class-merge helper.
- File: `components/tick-slider/tick-slider.tsx`, named export `TickSlider`, exported types `TickSliderProps` and `TickSliderSize` (`"sm" | "md" | "lg"`).
- Every tick reads shared motion values, so dragging never re-renders the ticks.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `value` | `number` | – | Controlled value. |
| `defaultValue` | `number` | `50` | Uncontrolled start. |
| `onChange` | `(v) => void` | – | Snapped value while dragging and on keys. |
| `onCommit` | `(v) => void` | – | Once when a drag ends or a key changes the value. |
| `min` / `max` | `number` | `0` / `100` | Range. |
| `step` | `number` | `1` | Snap multiple; its decimals set the display decimals. |
| `ticks` | `number` | `36` | Tick count (rounded, min 2). |
| `label` | `string` | – | Visible label; also the accessible name. |
| `accent` | `string` | `#0071e3` (dark `#0a84ff`) | Filled ticks and needle (`--tk-on`). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | See sizes. |
| `showValue` | `boolean` | `true` | Rolling number. |
| `unit` | `string` | – | Suffix such as "%". |
| `magnify` | `number` | `0.55` | Wave height; 0 disables. |
| `hint` | `string` | `"Drag across the ticks, or use the arrow keys."` | Caption; `""` hides. |
| `autoplay` | `boolean` | `false` | Sweeps through demo values until touched (uncontrolled only). |
| `disabled` | `boolean` | `false` | 50% opacity, no input. |
| `className` | `string` | – | Root classes. |

Sizes (tick height / tick width / gap / number size): sm 18 / 2 / 4 / 22px; md 26 / 3 / 5 / 30px; lg 34 / 3 / 6 / 36px.

## Layout and look

- Root: `inline-flex` column, gap 12, `max-width: 100%`, text `#1d1d1f` (dark `#f5f5f7`). CSS vars `--tk-off: #d2d2d7` (dark `#48484a`) and `--tk-on`.
- Header row (if label or value): label left, 13px medium `#6e6e73` (dark `#a1a1a6`), 4px bottom padding; number right in an `<output>`, semibold, leading 1, tracking −0.04em, size per variant; unit after it at 0.55em, medium, normal tracking, `#86868b` (dark `#98989d`), 2px gap.
- Track: width `count × tickWidth + (count − 1) × gap`, height `2 × tickHeight`, flex row aligned to the bottom with `gap`, radius 10, `cursor: ew-resize`, `touch-action: none`, no selection. Focus outline 2px blue, offset 6px.
- Tick: `tickWidth × tickHeight`, fully rounded, `transform-origin: bottom`. Colour `--tk-on` if `fill ≥ index/(count − 1)`, else `--tk-off`.
- Needle: absolutely at bottom-left, translated to x = needle centre − 1.5px; a 3px-wide, `1.9 × tickHeight` tall rounded bar in `--tk-on`, origin bottom, with a 10px knob at its top (offset −3.5px left, −5px top), shadow `0 0 0 2.5px #fff, 0 2px 6px rgba(0,0,0,.25)` (dark `0 0 0 2.5px #1c1c1e, 0 2px 6px rgba(0,0,0,.6)`).
- Hint: 12px `#86868b` (dark `#98989d`).

## Motion

- `fill` motion value = `(value − min)/span`. When the value changes: while dragging set it instantly; otherwise spring stiffness 340, damping 30.
- Needle position: `needleF = useSpring(fill, stiffness 520, damping 34)` (trails the fill so it has velocity); `needle = clamp(needleF, 0, 1) × (trackWidth − tickWidth) + tickWidth/2`.
- Lean: `lean = useSpring(clamp(velocity(needle)/90, −16, 16), stiffness 380, damping 14)` degrees, used as the needle's `rotate`. It tips toward travel and swings back past upright when it stops.
- Wave: for each tick with centre `c = index × pitch + tickWidth/2` (pitch = tickWidth + gap): `dp = (pointer − c)/(3.4·pitch)`, `dn = (needle − c)/(2.2·pitch)`; `boost = max(pointerActive ? e^(−dp²) : 0, 0.55·e^(−dn²)) × magnify`. Feed through `useSpring(stiffness 420, damping 26)` and set `scaleY = 1 + boost`. The pointer value is −1000 when inactive.
- Rolling digits: render `|value|.toFixed(decimals)` character by character (leading "−" and "." as plain text). Each digit is a 0.6em × 1em window, overflow hidden, with a vertical mask `linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)`, containing a column 0–9; its `y = −digit × 10%` through `useSpring(stiffness 300, damping 22, mass 0.6)`. Key digits from the right so units stay in place when the number gains a digit. Tabular numbers.

## Interaction and states

- Pointer down (primary button): prevent default, mark touched, focus the track (trusted only, `preventScroll`), start dragging, jump to the value under the pointer, set the pointer x. Track move/up/cancel on `window`; on each move update the pointer x and commit the snapped value if it changed; on release call `onCommit` with the latest value.
- Pointer x is local to the track and divided by its CSS scale (`rect.width / offsetWidth`). Hover (not dragging) also moves the wave; leaving parks it at −1000.
- Value mapping: `snap(min + clamp((x − left)/width, 0, 1) × (max − min))` where snap rounds to the step, clamps and fixes decimals.
- Keys: Arrow Right/Up `+step`, Left/Down `−step`, PageUp/PageDown `± max(step, range/10)`, Home `min`, End `max`; on change call `onChange` then `onCommit`.
- Controlled mode: only call `onChange`; internal state is used only when `value` is undefined.
- Reduced motion: fill set instantly, no wave (magnify 0), no lean, digits jump.

## Autoplay demo

Uncontrolled with `autoplay`: every 1.9s set the value to the next fraction of the range from `[0.78, 0.22, 0.6, 0.94, 0.4]`, snapped to the step. The fill springs, the needle leans and settles, the digits roll. Stop on the first pointer down or key press.

## Accessibility

- Track `role="slider"`, focusable (`tabIndex −1` when disabled), `aria-valuemin/max/now`, `aria-valuetext` = value with fixed decimals + unit, `aria-labelledby` the label (or `aria-label="Value"`), `aria-disabled`. The visual number and the ticks are `aria-hidden`.

## Acceptance checklist

- 36 ticks render; those up to the value are blue, the rest grey.
- Hovering raises a smooth hill of taller ticks under the pointer; a smaller hill always follows the needle.
- Dragging fills ticks instantly and the needle leans toward the drag, then swings upright on stop.
- The number rolls each digit independently; going from 9 to 10 keeps the units digit in place.
- Arrow, Page, Home and End keys work and fire `onCommit`.
- `unit="%"` shows a small grey suffix; `step={0.5}` shows one decimal.
- Autoplay sweeps five values and stops on first touch; dark mode recolours ticks and knob ring.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags or uses the arrow, Page, Home or End keys, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time the value moves onto a different tick mark (keys tick on every change), at most once every 40 ms so a fast drag does not buzz. Nothing plays on hover, on release, or while autoplay sweeps. It is silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
