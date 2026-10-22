Build a range slider with no thumb: a row of 56 thin vertical bars. The bars up to the value are coloured, the rest are grey. When you drag across it, the bars you sweep past spring up in a wake behind your hand, taller the faster you move, and then ripple back down into a flat row. It should feel like running a finger through water: loose, springy and immediate.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS. No animation library: one `requestAnimationFrame` loop writes bar heights straight to the DOM.
- File: `components/wake-slider/wake-slider.tsx`, named export `WakeSlider`, exported `WakeSliderProps`.
- Keep per-bar spring state (`{ h, v }` for 56 bars), the current value (0–1), the last pointer sample, the drag flag and a "touched" flag in refs. Only the rounded display value (0–100) is React state.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"Brightness"` | Label above the bars and the slider's accessible name. |
| `defaultValue` | `number` | `40` | Starting value, 0–100 (clamp it). |
| `accent` | `string` | `"#ff9f0a"` | Colour of the bars at or below the value. |
| `onValueChange` | `(value: number) => void` | – | Called with the rounded value, only when it changes. Keep the latest callback in a ref. |
| `autoplay` | `boolean` | `false` | Sweeps by itself until the user interacts. |

## Layout and look

- Root: vertical flex, 300px wide, 12px gap. Define a CSS variable for the unlit bar colour on the root: `#d2d2d7` light, `#3a3a3c` dark (`dark:` variant on a `.dark` ancestor).
- Header row: `justify-between`, `items-baseline`. Label 15px medium `#1d1d1f` (dark `#f5f5f7`). Value 22px semibold, tabular numbers, tracking −0.02em, same colours.
- Track: 300 × 64px, flex row, `items-end`, `justify-between`, 16px bottom padding, radius 12px, `touch-action: none`, pointer cursor. It contains 56 spans, each 2px wide, fully rounded, initial height 14px.
- Hint under the track: "Drag fast across the bars.", 12px, `#86868b` (dark `#8e8e93`).
- Focus: no outline; `focus-visible` 2px ring `#0071e3` (dark `#2997ff`) with a 4px transparent offset.

## Motion

Internally the track is 300 units wide (W = 300) and the bar index for a position x is `round(x / W · 55)`.

Every animation frame, for each bar i:

```
nb = (h[i-1] + h[i+1]) / 2        // missing neighbours count as 0
v += -h·0.12 + (nb - h)·0.05      // spring to zero + coupling to neighbours
v *= 0.82                         // damping
h += v
```

Then set the bar's height to `14 + max(-6, h)` px and its background to `accent` if `i / 55 <= value`, otherwise `var(--unlit)`. The coupling term is what makes a disturbance ripple sideways. Run the loop from mount; restart it when `accent` changes; cancel on unmount.

A **kick** at position x with speed s (units per second) adds `min(9, s·0.012) · (1 − |k|·0.3)` to the velocity of bars `index + k` for k = −2…2 (so the centre bar gets 100%, neighbours 70%, outer 40%).

**Setting the value** from x: `value = clamp(x / W, 0, 1)`; if `round(value·100)` differs from the last emitted value, update state and call `onValueChange`.

## Interaction and states

- Pointer down on the track: mark touched, start dragging, capture the pointer, clear the last sample, set the value from the pointer x and kick there with speed 400.
- Pointer move: convert clientX to track units (`(clientX − rect.left) / rect.width · W`). While dragging, speed = `|x − lastX| / max(1, now − lastT) · 1000`; kick with that speed and set the value. Always store `{ x, t }` as the last sample.
- Pointer up or cancel: stop dragging.
- Keyboard: ArrowRight/ArrowUp +0.05, ArrowLeft/ArrowDown −0.05, Home → 0, End → 1. Prevent default, mark touched, set the value, then kick at the new value position with speed 500.
- The colour boundary follows the value immediately; only bar heights animate.

## Autoplay demo

When `autoplay` is true, run a second rAF loop. With t in seconds since start:

```
x = W/2 + sin(1.3t) · sin(0.4t) · W · 0.48
```

Each frame kick at x with speed `|x − previousX| · 60`, then set the value from x. As soon as the touched flag is set (pointer down or a handled key), the loop cancels itself.

## Accessibility

- The track is `role="slider"`, `tabIndex={0}`, `aria-label={label}`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` = rounded value.
- Fully operable with arrows, Home and End.

## Acceptance checklist

- 56 bars, 2px wide, spread across 300px; bars at or below the value use the accent, others are grey (`#3a3a3c` in dark mode).
- A slow drag barely lifts the bars; a fast swipe throws a tall wake that ripples outward and settles within about a second.
- Bars can dip at most 6px below their 14px rest height.
- Clicking anywhere jumps the value there with a small bump.
- Arrow keys step by 5, Home/End go to 0/100, each with a visible kick.
- `onValueChange` fires only when the rounded value changes.
- Autoplay sweeps in an irregular back-and-forth and stops for good after the first interaction.
- Changing `accent` recolours immediately without resetting the springs.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags across the bars, clicks, or uses the keys, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time the coloured edge moves onto a different bar, at most once every 40 ms. Autoplay sweeps and hover are silent. It is silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
