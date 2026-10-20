# Particle Mark

Build a word drawn as a few hundred small dots on a rounded card. The dots fly in from a scatter on mount and settle into the letters. When the pointer brushes through them they scatter away from it and spring back home behind it, warming from near-black to an accent colour the further they are pushed. Click anywhere and a circular shockwave throws them outward before they gather again. The feel is lively and elastic, like iron filings on springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS. One 2D `<canvas>` driven by `requestAnimationFrame`; no animation library is needed.
- File: `components/particle-mark/particle-mark.tsx`, named export `ParticleMark`, plus exported `ParticleMarkProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `text` | `string` | `"motion"` | The word drawn in dots; long words are shrunk to fit. |
| `accent` | `string` | `"#0071e3"` | Hex colour (3 or 6 digits) dots warm toward when displaced. |
| `hint` | `string` | `"Brush through the dots. Click for a shockwave."` | Caption under the canvas; empty string hides it. |
| `autoplay` | `boolean` | `false` | Invisible pointer loop with periodic shockwaves until someone points at it. |

## Layout and look

- Root: column, items centred, 12px gap.
- Canvas: logical size 440×240, rendered `width: 440px; max-width: 100%; aspect-ratio: 440 / 240`, radius 24px, white with shadow `0 0 0 1px rgba(0,0,0,.05)` (dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08)`), `cursor: pointer`, `touch-action: none`. Backing store 440×240 × DPR (cap 2), context scaled by DPR. Map pointer positions back into 440×240 using the bounding rect.
- Caption: 13px `#86868b` (dark `#8e8e93`).

## Sampling the word

- Draw `text` on an offscreen 440×240 canvas: black, centred, middle baseline, at `(220, 126)` (6px below centre), font `700 {size}px -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`.
- Start at 150px and shrink by 6px while the measured width exceeds 400px (and size stays above 40).
- Read the pixels; every 5px on both axes where alpha > 128 becomes a particle with home `(hx, hy)`. Its starting position is home plus a random offset in −150…150 on each axis, velocity 0, so the word assembles itself on mount.

## Motion

Each frame (`t += 0.016`), for every particle:

1. **Home spring**: `vx += (hx − x)·0.045`, `vy += (hy − y)·0.045`.
2. **Pointer repulsion**: if the pointer is within 70px, `f = (70 − d)/70` and push along the unit vector away from it: `v += unit·f·6`.
3. **Shockwaves**: each wave is `{ x, y, r }`; `r` grows by 9px per frame and the wave is dropped at 520. A particle whose distance from the wave centre is within 14px of `r` gets `v += unit·9` outward.
4. **Damping**: `v *= 0.82`; then `x += vx`, `y += vy`.
5. **Colour and size**: `away = min(1, distance from home / 40)`. Colour = lerp from the ink to the accent by `away`; radius = `1.9 + away·0.8`. Ink is `rgb(29,29,31)` in light mode and `rgb(245,245,247)` in dark mode. Detect dark mode by checking for a `dark` class on `document.documentElement`, kept current by a `MutationObserver` on its `class` attribute, and read the flag every frame.

Clear the canvas every frame. Rebuild everything when `text`, `accent` or `autoplay` changes; cancel the frame on unmount.

## Interaction and states

- `pointermove`: mark touched, store the pointer.
- `pointerdown`: mark touched, add a wave at the pointer with `r = 0`.
- `pointerleave`: clear the pointer so the dots return home.
- Keyboard: the canvas is focusable; Enter or Space (default prevented) marks touched and fires a wave from the centre.

## Autoplay demo

While `autoplay` is on and nothing has touched the canvas, the pointer follows `x = 220 + cos(t·0.7)·190`, `y = 120 + sin(t·1.4)·105` (a wide figure-eight through the word), and a wave fires from the centre whenever more than 4.5s of `t` has passed since the last one. The first real pointer move, press or key hands over control for good.

## Accessibility

- `role="button"`, `tabIndex={0}`, `aria-label="The word {text} made of dots. Press to send a shockwave through it."`. Focus-visible 2px ring `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] On mount the dots fly in from a scatter and settle into the word in under a second.
- [ ] Brushing through the letters parts the dots around the pointer and they spring back behind it.
- [ ] Displaced dots tint toward the accent and grow slightly; settled dots are near-black (near-white in dark mode).
- [ ] Clicking sends a visible ring that pushes dots outward as it passes, then they regroup.
- [ ] A long word shrinks to fit within 400px.
- [ ] The canvas scales down with its container without stretching, and the pointer still lines up.
- [ ] Enter or Space on the focused canvas fires a shockwave.
- [ ] Autoplay loops a figure-eight with a wave every 4.5s and stops on the first real input.
