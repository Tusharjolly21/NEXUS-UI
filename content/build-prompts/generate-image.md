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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Pressing Generate (or Enter in the prompt field) plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss), and when the picture finishes resolving from a run the visitor started, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays. The autoplay scenes play the same sounds (`tap` as each scene starts generating, `success` when its picture has resolved) through the same play function's `auto` variant (`play.auto("tap")`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] At rest a grey well says "Your image appears here".
- [ ] Generate shows blocky pixels that get finer over about 2.6s, with grain fading to zero.
- [ ] A light band sweeps across a glass sheet and the chip counts 10% → 100%.
- [ ] The final image is smooth and the glass fades away.
- [ ] Each press shows the next of four landscapes with the sun in a different spot.
- [ ] The button fills with progress and cannot be pressed mid-generation.
- [ ] No network requests are made.
- [ ] Autoplay cycles prompts and scenes and stops on the first interaction.


---

<!-- Generate Image: Nexus states variant brief -->

> The Generate Image page has a variant. The brief above rebuilds the original; the section below rebuilds the Image Generating variant. Nothing is fetched: the pictures are painted on a canvas.

---

<!-- variant: image-generating -->

# Image Generating

Build an image-generation state that looks like the picture is actually forming. A card holds a prompt line with a step counter, a hairline progress bar, a framed picture that starts as pure static, becomes a blocky blurred guess, sharpens in 30 steps while the grain fades, and finally lands with a tiny settle. Three action pills slide up under it. Everything is painted locally on a canvas; nothing is fetched.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), a `cn` class-merge helper, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/generate-image/image-generating.tsx`. Named exports `ImageGenerating`, `ImageGeneratingProps`, `ImageGeneratingAction` and the constant `IMAGE_GENERATING_PROMPTS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `prompts` | `string[]` | two demo prompts | Shown in turn, one per run (`run % prompts.length`). |
| `steps` | `number` | `30` | Denoising steps in a run. |
| `onAction` | `(action, prompt) => void` | none | Called when Variations, Upscale or Download is pressed (`action` is one of those three strings). |
| `autoplay` | `boolean` | `false` | Starts a new run every 7s until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Demo prompts: "A quiet harbour at dusk, soft film grain" and "Desert dunes under a pale morning moon".

## Layout and look

- Card: width 520px, `max-width: 100%`, radius 28px, padding 16px (20px from 640px viewport width), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Top row (4px side padding, 12px gap): the prompt on the left, 14px, truncated, the word "Prompt · " in `#6e6e73` / dark `#a1a1a6` then the prompt in `#1d1d1f` / dark `#f5f5f7`. On the right a 12px tabular counter in the muted colour: "Step n of 30" while running, then "Done in x.ys" using the measured time (just "Done" under reduced motion).
- Progress line: 8px under the top row, 2px tall, fully rounded, track `#f0f0f3` / dark `#3a3a3c`, bar `#1d1d1f` / dark `#f5f5f7`.
- Picture frame: 12px under the line, radius 18px, `overflow: hidden`, bg `#1d1d1f` / dark `#2c2c2e`, holding a 480 by 320 canvas drawn at `width: 100%; height: auto`. While running a "Generating" chip sits 12px from the top left: radius full, bg black 45% with a backdrop blur, white 11.5px medium text, 10px by 4px padding, with a 6px white dot.
- Action row: 12px under the frame, 36px tall, 8px gap. Variations and Upscale are 36px pills with 16px side padding, 13px medium, bg `#f5f5f7` text `#1d1d1f` (hover `#ececf0`); dark bg `#2c2c2e`, text `#f5f5f7`, hover `#3a3a3c`. Download is pushed right, bg `#1d1d1f` text white; dark bg `#f5f5f7` text `#1d1d1f`.
- The painted result alternates by run: even runs are a dusk harbour (a navy to rose to amber sky, a pale sun, two plum ridges, a sea gradient from salmon to indigo with 40 short glints under the sun, two dark boats with a mast), odd runs are a desert (a grey-blue to sand sky, a small white moon, three dune ridges `#e2b98b`, `#d39d6a`, `#b97d4e`). Ridges are sums of two sines; glint widths use a seeded generator so a seed always paints the same picture.

## Motion

- A frame is drawn every 105ms (never faster) from a `requestAnimationFrame` loop. At step `k` of `steps`, `t = k / steps`: draw the target into a small canvas of width `max(4, round(t^1.6 * 480))` (height from the 3:2 ratio, minimum 3), scale it up smoothed onto the main canvas, then add noise of amplitude `(1 - t)^1.4 * 255` per pixel (red x1, green x0.9, blue x1.1; skipped once the amplitude is 2 or less). For the first 4 steps the picture is replaced by pure grey static (128 plus noise). After the last step the exact target is drawn.
- The progress bar width follows `step / steps` (0.1s); when done it fades out after a 0.3s delay.
- On landing the frame scales `1 -> 1.012 -> 1` over 0.5s. The "Generating" chip fades in and out; its dot pulses opacity 1 to .3 to 1 every 1s.
- The three buttons enter in turn: `opacity 0, y 8` to rest, delay `0.15 + 0.06 * i` seconds; they fade on exit.
- Reduced motion: no coarse-to-fine animation. The finished picture is drawn at once, the counter says "Done", the buttons just fade in.

## Interaction and states

- On mount a run starts immediately (silent). When it finishes the three actions appear.
- Variations calls `onAction` and starts the next run (next prompt, next picture, step back to 0, actions leave). Upscale and Download only call `onAction`.
- The canvas has `role="img"`; its label is "Image generating" and then "Generated image: <prompt>".

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: every 7s start the next run, as if Variations had been pressed. A pointer press or key press inside the card stops it for good.

## Accessibility

- A persistent `sr-only` polite `role="status"` region reads "Generating image" and then "Image ready: <prompt>"; the visible counter and chip are `aria-hidden`.
- Actions are real buttons with a 2px focus outline at 2px offset (`#0071e3`, dark `#0a84ff`).
- No timers, observers or frames are left running after unmount.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing Variations plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). When the picture of a run you started finishes forming, `chime` plays at 50% (a soft bell: three sine partials at about 880, 2430 and 4750 Hz with different tails). The first picture on mount is silent.
- The autoplay loop plays the same sounds: `tap` at 40% when it starts a run and `chime` when the picture lands, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The grain, the steps, hover and the other two buttons are silent. Under reduced motion the run has no animation, so only the tap plays.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] It opens on pure static and sharpens in about 3 seconds, the counter reading "Step n of 30".
- [ ] Early frames are blocky and blurry, the grain fades to nothing, the last frame is crisp.
- [ ] The picture settles with a 1.2% pulse and the counter changes to "Done in x.ys".
- [ ] Variations, Upscale and Download slide up one after another; Download is on the right.
- [ ] Variations starts the next prompt with the other landscape.
- [ ] Autoplay starts a run every 7s and stops for good on touch; it never runs under reduced motion.
- [ ] Reduced motion shows the finished picture straight away.
- [ ] Nothing is fetched. Dark mode uses the dark card, `#2c2c2e` frame and the inverted Download pill.
- [ ] It fits a 320px container.
