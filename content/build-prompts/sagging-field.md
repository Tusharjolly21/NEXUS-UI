# Sagging Field

Build a single-line text field that bends under the weight of what you type. Pinned at the left like a cantilever beam, it droops on a bouncy spring as characters add weight; letters ride and tilt with the curve, and those that run past the right end fall away. "Let it go" drops everything. Playful physics in quiet Apple-style UI.

## Stack

- React 19.2+ client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useMotionValueEvent`). Autoplay uses `useEffectEvent` to see the latest letters and sag (or a ref on older React).
- File: `components/sagging-field/sagging-field.tsx`, named export `SaggingField`, plus exported `SaggingFieldProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"What's weighing on you?"` | Heading above the field; also its `<label>`. |
| `width` | `number` | `400` | Field width in px. |
| `maxChars` | `number` | `34` | Characters needed to reach full sag. |
| `accent` | `string` | `"#0071e3"` | Focused outline, caret and button focus colour. |
| `autoplay` | `boolean` | `false` | Types a heavy sentence and lets it go by itself until someone clicks in. |

Constants: font `500 17px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif`; field height `H = 56`; inner padding `PAD = 18`; usable width `inner = width − 36`.

## The beam maths

- Deflection at normalised position `t` (0 at the pin, 1 at the free end): `curve(t, sag) = sag · t² · (3 − t) · 0.5` (so `curve(1) = sag`).
- Slope: `slope(t) = sag · (6t − 3t²) · 0.5 / width`; letter tilt is `atan(slope)` in degrees.
- Target sag: `weight = min(1, length / maxChars)`; `sag = weight^1.3 · 64` px.
- Drive sag with `useSpring(0, { stiffness: 90, damping: 9, mass: 1.2 })` and mirror it into state (`useMotionValueEvent`) so the SVG and letters re-render.
- Measure characters with a shared offscreen canvas `measureText` in the field font (9px each during SSR). Letter `x` = sum of previous widths.

## Layout and look

- Root: column, full width, items centred, 16px gap. CSS variables: `--sf-edge` `#d2d2d7` (dark `#3a3a3c`), `--sf-fill` `#ffffff` (dark `#1c1c1e`), `--sf-pin` `#aeaeb2` (dark `#636366`), `--sf-shadow` `rgba(0,0,0,.08)` (dark `rgba(0,0,0,.5)`).
- Heading label: 22px semibold, tracking −0.025em, `#1d1d1f` (dark `#f5f5f7`).
- Stage: `relative`, `width × (H + 90)`.
- Field shape: an SVG path (overflow visible, `pointer-events-none`). Top edge = 25 points `(t·width, 8 + curve(t))` for `t = k/24`; bottom edge = the same points reversed with `+H`; closed. Fill `--sf-fill`, stroke `--sf-edge` at 1px, or `accent` at 2px when focused; round joins; `drop-shadow(0 12px 18px var(--sf-shadow))`.
- Pin: circle r 5 at `(0, 8 + H/2)`, fill `--sf-pin`.
- Letters: absolute spans, `white-space: pre`, line-height 22px, `#1d1d1f` (dark `#f5f5f7`), left `PAD + x`; with `t = (PAD + x + w/2) / width`, resting `y = 8 + curve(t) + H/2 − 11`.
- Placeholder "Type it out…" in `#a1a1a6` (dark `#8e8e93`) at `PAD`, vertically centred, only when empty and not focused.
- Caret (only when focused): 2px × 22px, `accent`, rounded. `caretT = min(1, endOfLastLetter / inner)`, `caretX = PAD + caretT·inner`, drawn at left `caretX + 1`, top `8 + curve(caretX/width) + H/2 − 11`. Blinks with opacity keyframes `[1, 1, 0, 0]`, times `[0, .5, .5, 1]`, 1s, infinite.
- Real input: a transparent `<input>` over the field (top 8px, full width, height `H + 50`, same font), transparent text and caret, no outline, `autoComplete="off"`.
- "Let it go" button: 36px tall pill, 16px side padding, 13px medium, `#1d1d1f` background with white text (dark: `#f5f5f7` with `#1d1d1f` text), 30% opacity when disabled (empty), 2px `accent` focus outline with 2px offset.

## Motion

- **Letters** (keyed by index): enter from 11px above, `opacity 0, scale 0.6`. `y` springs 500/30, `rotate` (slope angle) 300/20, others 0.15s.
- **Overflow**: keep characters until cumulative width exceeds `inner`. Each dropped character falls from `x = inner − 6 + k·4`, `y = curve(1)`, spin `±70°`, drift `30..70px`; removed after 1300ms.
- **Let it go**: every letter falls from its `x` with `y = curve(x / inner)`, spin `±80°`, drift `(random − 0.3)·50`; value cleared; removed after 1500ms. The field springs back up.
- **Falling letters** (`AnimatePresence`), positioned at left `PAD + x`, top `8 + y + H/2 − 11`: animate `y 0 → 260` over 1.1s with ease `[0.55, 0, 1, 0.45]` (accelerating like gravity), `x → dx` over 1.1s `easeOut`, `opacity → 0` over 1.1s with ease `[0.8, 0, 1, 1]` (holds then fades late), `rotate → spin` over 1.1s.
- Button: `whileTap { scale: 0.95 }`.

## Interaction and states

- Typing calls `push(next)` (handles overflow) and marks touched; so does any pointer down in the root. Focus toggles outline, caret and placeholder.

## Autoplay demo

From 800ms, type `"deadlines, the move, that unanswered email, taxes, the dentist"` through `push`, one character every `70 + random·60` ms (the end overflows and falls). Then wait 1600ms, let it go, wait 1400ms, repeat. Stop once touched; clear on unmount.

## Accessibility

- The heading is a real `<label htmlFor>` (via `useId`); the SVG and letter layer are `aria-hidden`; the input holds the value.
- The button is native, disabled when empty.

## Acceptance checklist

- [ ] Empty field is straight and pinned on the left with a grey pin.
- [ ] Each typed character makes the right end droop more, overshooting and settling.
- [ ] Letters sit on the curve and tilt with its slope.
- [ ] At about `maxChars` the field reaches its full 64px sag.
- [ ] Characters past the right edge tumble off and fall instead of being typed.
- [ ] "Let it go" drops every letter with random spin and the field springs back up.
- [ ] Focus shows the accent outline and a blinking caret that follows the curve.
- [ ] Autoplay types, overflows, lets go and repeats until the first click or keystroke.
