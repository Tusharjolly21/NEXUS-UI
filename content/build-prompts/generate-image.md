# Generate Image

Build an image-generation card: a square picture well above a pill-shaped prompt field with a Generate button. Pressing Generate makes the picture arrive the way a diffusion model's output does: big blocks of colour first, then finer and finer, with grain fading away, under a sheet of glass with a band of light sweeping across it and a "Denoising n%" counter. The "image" is a landscape painted locally on a canvas; nothing is fetched. The feel is calm, polished and a little magical.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/generate-image/generate-image.tsx`, named export `GenerateImage`, plus exported `GenerateImageProps` and `GENERATE_IMAGE_PROMPTS`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `prompt` | `string` | `"Pink dusk over soft hills"` | Text the prompt field starts with. |
| `onGenerate` | `(prompt: string) => void` | none | Called with the prompt when the user presses Generate. |
| `autoplay` | `boolean` | `false` | Generates a new scene every 5.2s, cycling the sample prompts, until someone interacts. |

`GENERATE_IMAGE_PROMPTS`: "Pink dusk over soft hills", "Morning valley, mint and sky", "Moonlit ridge, deep teal", "Desert at golden hour".

## Layout and look

- Card: 320px wide, column, 12px gap, 10px padding, radius 26px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -30px rgba(0,0,0,.4)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 48px -30px rgba(0,0,0,.8)`.
- Picture well: 300×300, radius 18px, `overflow: hidden`, background `#f0f0f3` (dark `#2c2c2e`). Inside, a 300×300 canvas (no DPR scaling) filling it. Before the first generation, a centred caption "Your image appears here", 13px `#86868b` (dark `#8e8e93`).
- Form: pill, `#f5f5f7` (dark `#2c2c2e`), 4px padding, 14px left padding, row with 8px gap. Borderless transparent input, 36px tall, 14px `#1d1d1f` (dark `#f5f5f7`), with an `sr-only` label "Prompt" linked by a `useId`-based id. Button: 36px pill, 16px padding, 13px medium, `#1d1d1f` / white (dark `#f5f5f7` / `#1d1d1f`), `whileTap` scale 0.94, `opacity .8` while disabled.

## The scene painter

`paint(ctx, k)` on an offscreen 300×300 canvas, palette `k % 4`:

| k | sky top → bottom | sun | hills (back → front) |
| --- | --- | --- | --- |
| 0 | `#ffb38a` → `#ff6f91` | `#fff1c1` | `#c44569`, `#7d3c98`, `#3d1e6d` |
| 1 | `#a1c4fd` → `#c2e9fb` | `#ffffff` | `#6dd3a0`, `#2f9e8f`, `#1b5e5a` |
| 2 | `#0f2027` → `#2c5364` | `#f5f7a8` | `#3a6073`, `#203a43`, `#0f2027` |
| 3 | `#fceabb` → `#f8b500` | `#fff8e1` | `#e17055`, `#a0522d`, `#5d3a1a` |

1. Vertical linear gradient for the sky.
2. Sun centre `sx = 80 + (k·53) % 140`, `sy = 90 + (k·31) % 40`; a radial glow of radius 90 (sun colour at 0, sun + `cc` alpha at 0.3, transparent at 1), then a solid disc of radius 26.
3. Three hills, `i = 0..2`, baseline `170 + i·42`: a polygon from the bottom-left, along `x` in 6px steps at `y = base + sin(x/(40 + i·18) + k·1.7 + i)·(22 − i·4) + sin(x/13 + i)·3`, closed along the bottom.

## Motion

- **Progressive reveal**: resolutions `[5, 8, 12, 18, 28, 44, 70, 110, 170, 300]`. For pass `i`: draw the painted scene into a tiny `res×res` canvas, then draw that back up to 300×300 on the visible canvas, with `imageSmoothingEnabled` off (hard pixel blocks) until the last two passes, when it is on.
- **Noise**: `noise = 1 − i/9`; when above 0, add the same random offset `(rand − 0.5)·90·noise` to the R, G and B of every pixel (monochrome grain). The final pass is clean.
- **Timing**: first pass immediately, then pass `i` after `170 + i·25` ms (about 2.65s in all). Update a `step` counter (1–10) after each pass; `pct = round(step/10·100)`.
- **Glass overlay** (only while busy, via `AnimatePresence`): fades in, fades out over 0.6s. Background `linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04))`, `backdrop-filter: saturate(1.2)`, inset 1px `rgba(255,255,255,.35)` border. Inside: a 96px-wide band skewed −12°, gradient transparent → white/40 → transparent, animating `x` from −120 to 360 over 1.3s, ease-in-out, repeating forever; and a bottom-left chip "Denoising {pct}%", 11px medium tabular white on `black/40` with backdrop blur, 10×4 padding.
- **Button progress**: while busy, a `white/20` fill (dark `black/15`) inside the button animates its width to `pct%`; the label reads "Generating".

## Interaction and states

- State: scene seed `k`, `prompt`, `busy`, `step`.
- Submit: prevent default; ignore while busy; `k + 1` becomes the new seed, call `onGenerate(prompt)`, run the reveal.
- The prompt text does not change the scene; scenes cycle by seed.
- Clear the pass timer on unmount and before starting a new run.

## Autoplay demo

600ms after mount, and then every 5200ms: if untouched, set the prompt to `GENERATE_IMAGE_PROMPTS[n % 4]`, set the seed to `n` and run the reveal, incrementing `n`. Any pointerdown or keydown on the card stops it.

## Accessibility

- The canvas is `role="img"` with `aria-label` "No image yet", "Generating image" while busy, then the prompt. The button is disabled while busy.

## Acceptance checklist

- [ ] At rest a grey well says "Your image appears here".
- [ ] Generate shows blocky pixels that get finer over about 2.6s, with grain fading to zero.
- [ ] A light band sweeps across a glass sheet and the chip counts 10% → 100%.
- [ ] The final image is smooth and the glass fades away.
- [ ] Each press shows the next of four landscapes with the sun in a different spot.
- [ ] The button fills with progress and cannot be pressed mid-generation.
- [ ] No network requests are made.
- [ ] Autoplay cycles prompts and scenes and stops on the first interaction.
