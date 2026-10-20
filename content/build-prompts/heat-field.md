# Heat Field

Build a calm grid of small grey dots on a rounded white card that turns into a live heat map under the cursor. Dots near the pointer swell and melt into one another like liquid, shading from yellow through orange and red to violet at the hottest point. Press and hold to leave heat behind that slowly cools after you move on. The feel is warm, gooey and smooth.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS. Two stacked 2D `<canvas>` layers driven by `requestAnimationFrame`, plus an inline SVG filter. No animation library is needed.
- File: `components/heat-field/heat-field.tsx`, named export `HeatField`, plus exported `HeatFieldProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `radius` | `number` | `46` | Spread (px, Gaussian sigma) of heat around the pointer. Held heat uses `radius + 14`. |
| `hint` | `string` | `"Move across the dots. Press and hold to leave heat behind."` | Caption under the field; empty string hides it. |
| `autoplay` | `boolean` | `false` | An invisible hand wanders and occasionally presses until someone points at the field. |

## Layout and look

- Root: column, items centred, 12px gap.
- Field: logical size 440×280. Rendered `width: 440px; max-width: 100%; aspect-ratio: 440 / 280`, radius 24px, `overflow: hidden`, `cursor: crosshair`, `touch-action: none`, white with shadow `0 0 0 1px rgba(0,0,0,.05)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08)`.
- Both canvases fill the field absolutely. Backing store 440×280 × DPR (DPR capped at 2), context scaled by DPR. Map pointer coordinates back to the 440×280 space using the field's bounding rect, so the field still works when shrunk.
- Dot grid: positions from 20 to <440 on x and 20 to <280 on y, step 20 (21×13 dots).
- Base canvas: every dot drawn once as a 2.6px-radius circle in `#d2d2d7` (dark `#3a3a3c`). Detect dark mode from a `dark` class on `document.documentElement` and redraw the base layer whenever that class changes (`MutationObserver` on the `class` attribute).
- Hot canvas: cleared and redrawn every frame; it has CSS `filter: url(#heat-<id>)` where `<id>` is `useId()` with colons removed.
- The SVG goo filter (in a 0×0 absolutely positioned `svg`): `feGaussianBlur stdDeviation 5`, then `feColorMatrix` with values `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9`. This sharpens the blurred alpha back up so neighbouring hot dots fuse into blobs with smooth edges.
- Caption: 13px `#86868b` (dark `#8e8e93`).

## Motion

Per dot keep `h` (current heat 0…1) and `stamp` (held heat). Each frame (`t += 0.016`):

1. Pointer `p` is the real pointer, or the autoplay path, or none.
2. If `p` exists: `dist² = (dx² + dy²)`; `target = exp(−dist² / (2·radius²))`. If the pointer is down, `stamp = max(stamp, exp(−dist² / (2·(radius+14)²)))`.
3. `stamp *= 0.996` every frame (slow cooling, roughly a 3-second half-life at 60fps).
4. `target = max(target, stamp)`.
5. Ease: `h += (target − h) · (target > h ? 0.25 : 0.05)`. Heat rises quickly and fades slowly.
6. Skip the dot when `h < 0.04`; otherwise draw a circle of radius `2.6 + h·10` in `heatColor(h)`.

`heatColor(h)`: linear interpolation across four RGB stops, `t = min(0.999, h)·3`: `[255,214,10]` yellow → `[255,159,10]` orange → `[255,69,58]` red → `[191,90,242]` violet. These colours stay the same in dark mode.

## Interaction and states

- `pointermove`: mark touched, update position, keep the current `down` flag.
- `pointerdown`: mark touched, set position with `down: true`.
- `pointerup`: `down = false`.
- `pointerleave`: pointer becomes none, so live heat fades out while stamped heat keeps cooling.
- Restart the loop when `autoplay` or `radius` changes; cancel the frame and disconnect the observer on unmount.

## Autoplay demo

While `autoplay` is on and the field has not been touched, the pointer follows `x = 220 + sin(t·0.9)·150`, `y = 140 + sin(t·1.7)·80` (a sideways figure-eight), and is "down" whenever `sin(t·0.5) > 0.96`, leaving occasional hot spots. The first real pointer move or press over the field hands control to the user for good.

## Accessibility

- The field is `role="img"` with `aria-label="Dot field that turns into a heat map under the pointer"`; canvases and SVG are presentational.

## Acceptance checklist

- [ ] At rest: an even grid of small grey dots on a rounded card.
- [ ] Hovering makes nearby dots swell and fuse into a single gooey blob, yellow at the rim and violet at the centre.
- [ ] Moving away, the heat fades within about a second.
- [ ] Pressing and holding leaves a hot patch that keeps glowing and cools over several seconds.
- [ ] The field shrinks with its container without stretching, and the pointer still lines up.
- [ ] Toggling the site theme redraws the resting dots in the dark grey.
- [ ] Autoplay wanders in a figure-eight, sometimes stamping heat, and stops on the first real pointer.
