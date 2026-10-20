# ASCII Wake

Build a panel filled with a faint grid of characters where your pointer leaves a wake of glyphs: dense right under the pointer, spreading and thinning as the trail ages, gone after 1.4 seconds. A segmented control below switches the glyph set, including a "flow" mode where each character is a line pointing in the direction you moved. The feel is a calm, precise terminal-meets-Apple surface: white card, monospace ink, one accent colour at the head.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (only for the segmented control's sliding pill via `layoutId`). The field is a `<canvas>` drawn with a `requestAnimationFrame` loop.
- File: `components/ascii-wake/ascii-wake.tsx`, named export `AsciiWake`, plus exported types `AsciiWakeProps` and `AsciiWakeMode = "ramp" | "binary" | "blocks" | "flow"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `height` | `number` | `300` | Field height in px; it fills the available width. |
| `accent` | `string` | `"#0071e3"` | Colour of glyphs right under the pointer. |
| `autoplay` | `boolean` | `false` | Draws a looping path by itself while the pointer is away. |

Glyph sets:
- `ramp`: `" .:-=+*#%@"`
- `binary`: `" 0101"`
- `blocks`: `" ░▒▓█"`
- `flow`: `["─", "╲", "│", "╱"]` chosen by angle.

## Layout and look

- Root: column, full width, items centred, 16px gap.
- Field: `relative w-full overflow-hidden`, height `height`, radius 24px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 50px -28px rgba(0,0,0,.3)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 50px -28px rgba(0,0,0,.8)`. The canvas fills it.
- Centred hint over the field (`pointer-events-none`): pill "Move your pointer across the field", 12px medium, padding 12px × 4px, `rgba(255,255,255,.8)` with backdrop blur, text `#6e6e73`. Dark: `#2c2c2e` at 80%, text `#a1a1a6`.
- Segmented control: `role="group"`, `aria-label="Glyph set"`, 4-column grid, radius 12px, 3px padding, background `#e8e8ed` (dark `#3a3a3c`). Buttons 32px tall, 16px side padding, radius 9px, 13px medium, capitalised mode names, `#1d1d1f` (dark `#f5f5f7`). The selected one has a pill behind its label: white with `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)` (dark `#636366`), radius 9px, sharing a `layoutId` (unique per instance from `useId`) so it slides between options on a spring (stiffness 420, damping 32).

## Canvas setup

- Cell grid: 10px wide × 15px tall. Font: `500 13px ui-monospace, 'SF Mono', Menlo, monospace`, centred both ways.
- Device pixel ratio capped at 2. Size the canvas backing store to `w·dpr × h·dpr`, CSS size `w × h`, reset the transform to `dpr` each frame. Track the wrapper width with a `ResizeObserver`.
- Theme: canvas cannot use `dark:`, so watch `document.documentElement` for the `dark` class with a `MutationObserver` and keep a ref. Ink colour `29,29,31` in light, `245,245,247` in dark.

## Motion (the trail maths)

- Trail: array of points `{ x, y, t, a }` (position in field px, timestamp, angle of travel `atan2(y − prevY, x − prevX)`, 0 for the first). Each pointer move pushes one. Each frame drop points older than `LIFE = 1400ms` and keep only the last 90.
- For every cell centre `(cx, cy)`, sum each point's contribution:
  - `age = (now − t) / LIFE` (0..1)
  - `σ = 14 + age·34` (the wake spreads as it ages)
  - skip if squared distance `> 9σ²`
  - `f = exp(−d² / 2σ²) · (1 − age) · 0.55`
  - `v += f`; remember the angle of the point with the largest `f`.
- If `v < 0.04`: draw a resting dot `·` only on cells where `(col + row) % 4 === 0`, at `rgba(ink, 0.08)` (dark 0.12). Otherwise clamp `v` to 1 and pick a glyph:
  - ramp/binary/blocks: `ramp[min(len − 1, floor(v·len))]`
  - flow: fold the angle into `[0, π)`, divide by `π/4`, round, mod 4 → index into the flow set.
- Colour: cells within 26px of the newest point use `accent`; others `rgba(ink, 0.25 + v·0.75)`.
- Clear and redraw the whole field every frame.

## Interaction and states

- `pointermove` on the field converts client coordinates to field px and pushes a trail point, also recording the time of the last real pointer move.
- Mode buttons set the mode; the draw loop reads it from a ref so switching does not restart the loop.
- When the pointer stops, the wake simply fades out over 1.4s.

## Autoplay demo

With `autoplay`, whenever there has been no real pointer move for more than 1800ms, push a synthetic point each frame on a Lissajous-like loop (t in seconds):
- `x = w/2 + sin(1.3t)·w·0.36 + sin(3.1t)·30`
- `y = h/2 + sin(2.1t + 1)·h·0.3`
Real pointer movement takes over immediately and autoplay resumes 1.8s after it stops.

## Accessibility

- The canvas is `aria-hidden`; the hint text describes the interaction.
- Mode buttons are native buttons with `aria-pressed`, focus-visible outline 2px `#0071e3`.

## Acceptance checklist

- [ ] A faint diagonal dot grid shows at rest.
- [ ] Moving the pointer leaves a trail that is densest and accent-coloured at the head.
- [ ] Older parts of the trail widen and fade; everything clears about 1.4s after stopping.
- [ ] Ramp, binary and blocks change the glyphs; flow draws ─ ╲ │ ╱ following the motion direction.
- [ ] The selected-mode pill slides between options.
- [ ] Glyphs are crisp on retina screens and the field resizes with its container.
- [ ] Toggling the `.dark` class on `<html>` switches canvas ink live.
- [ ] Autoplay draws a looping path when idle for 1.8s and yields to the real pointer.
