# Particle Noise

Build a canvas field of tiny particles laid on a grid and displaced by layered Perlin-style noise, so the grid swells into slow, glowing ridges like terrain seen from above. It is a hero backdrop: quiet, generative and continuously flowing, with no pointer interaction.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS. No animation library: one `<canvas>` with a 2D context (`{ alpha: true }`) and a `requestAnimationFrame` loop.
- File: `components/particle-noise/particle-noise.tsx`, named export `ParticleNoise`, plus exported types `ParticleNoiseSpeed = "slow" | "medium" | "fast" | number` and `ParticleNoiseProps`. Re-export from `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `positionX` | `number` | `0` | Pans the noise (×120 in noise space) and the drawn field (×28 px). |
| `positionY` | `number` | `0` | Same, vertically. |
| `zoom` | `number` | `1` | Noise scale = `0.0045 / max(0.08, zoom)`; higher is broader. |
| `spacing` | `number` | `18` | Grid pitch in px (min 6). |
| `inflation` | `number` | `32` | Displacement strength in px. |
| `particleSize` | `number` | `1.35` | Base radius in px. |
| `particleCount` | `number` | `2600` | Cap on generated particles. |
| `density` | `number` | `1` | Clamped 0.2–2.5; divides the step. |
| `animationEnabled` | `boolean` | `true` | Off draws one frame and stops. |
| `speed` | `ParticleNoiseSpeed` | `"medium"` | `slow 0.00008`, `medium 0.00016`, `fast 0.00028` per ms, or a raw number. |
| `backgroundColor` | `string` | `"transparent"` | Canvas fill. Non-transparent switches blending to additive. |
| `dotColor` | `string` | `"#7AE1FF"` | Main particle colour. |
| `secondaryDotColor` | `string` | `dotColor` | Second colour mixed in by noise. |
| `opacity` | `number` | `0.72` | Overall alpha factor. |
| `blur` | `number` | `0` | Canvas `filter: blur(px)` when above 0. |
| `surfaceBias` | `number` | `0.72` | 0–1: swirl vs. ridge lift. |
| `gridJitter` | `number` | `0` | Random home offset as a fraction of a cell. |
| `className` | `string` | — | Merged onto the root. |

## Layout and look

- Root: `pointer-events-none relative h-full min-h-[360px] w-full overflow-hidden`, inline background = `backgroundColor` unless transparent. As a hero backdrop pass `absolute inset-0 h-full min-h-0`.
- Canvas: `absolute inset-0 h-full w-full`, backing store `floor(width × dpr)` with `dpr = min(devicePixelRatio, 1.75)`, transform set to dpr.
- Grid: `step = spacing × (width < 640 ? 1.35 : 1) / clamp(density, 0.2, 2.5)`. Gutter = `2 × step` on every side; columns/rows = `ceil((size + 2·gutter) / step)`. Each particle: `homeX = x·step − gutter + jitterX`, `homeY` likewise, with jitter `(hash2(x, y) − 0.5) × step × gridJitter` (and `hash2(x + 17.3, y + 41.9)` for Y), plus `seed = hash2(x + 8.8, y + 2.2)`. Stop once the cap is reached.
- Noise helpers: `hash2(x, y) = fract(sin(x·127.1 + y·311.7) × 43758.5453123)`; gradient noise with random unit gradients per lattice corner (angle `hash2 × 2π`), quintic fade `t³(t(6t − 15) + 10)`, bilinear blend, remapped to 0–1 (`× 0.5 + 0.5`).
- Per particle each frame (`nx, ny` = home + position × 120, times noise scale; `t` = time):
  - `field = noise(nx + 1.15t + seed·0.35, ny − 0.55t)`
  - `curl = noise(1.65nx − 0.42t, 1.65ny + 0.68t + seed)`
  - `ridge = noise(0.85nx + 0.35t, 1.15ny − 0.28t)`
  - `pulse = noise(2.6nx + 0.72t, 2.6ny − 0.82t + seed)`
  - `angle = (field·1.55 + curl·0.45) × 2π`; `displacement = inflation × (0.22 + pulse·0.92)`; `flow = (cos, sin)(angle) × displacement`.
  - `surfaceLift = (ridge − 0.5) × inflation × 2.15`.
  - `x = homeX + lerp(flowX, flowX·0.34, bias) + positionX·28`; `y = homeY + lerp(flowY, surfaceLift, bias) + positionY·28`.
  - `ridgeGlow = clamp((ridge − 0.34) / 0.66, 0, 1)`; `alpha = clamp(opacity × (0.16 + pulse·0.28 + ridgeGlow·0.9), 0, 1)`; `radius = particleSize × (0.68 + pulse·0.22 + ridgeGlow·0.72)`.
  - Colour: secondary when `noise(2.2nx + t, 2.2ny − t + seed) > 0.56`, else primary, converted to `rgba(r, g, b, alpha)` (accept `#rgb`, `#rrggbb`, `rgb()`; pass `rgba()` through unchanged).
- Compositing: `lighter` when a background colour is set (glowing, additive), `source-over` when transparent (so it also works on light pages).

## Motion

- `t = now × speedRate` while animating; when paused, keep the last `t` (or 0.8 on first draw) so the still frame looks the same as a moment of the animation.
- There are no springs or easing: the motion is the noise field scrolling through time, so ridges roll and particles breathe in size and brightness.

## Interaction and states

- No pointer input (`pointer-events-none`).
- Loop runs only when the root is visible (IntersectionObserver, threshold 0.01), the document is visible (`visibilitychange`), animation is enabled and reduced motion is off. Otherwise draw a single frame and stop.
- ResizeObserver rebuilds the grid and redraws. Any prop change re-runs the setup.
- Clean up observers, listeners and the frame on unmount.

## Demo data

The section shows a 560px hero on `#f5f5f7` (dark black) with: positionY 0.45, zoom 0.9, spacing 18, inflation 58, particleSize 1.1, density 0.95, speed `slow`, opacity 0.72, surfaceBias 0.82, gridJitter 0. Palettes (light / dark): Graphite `#1d1d1f` + `#86868b` / `#f5f5f7` + `#8e8e93`; Silver `#6e6e73` + `#c7c7cc` / `#d1d1d6` + `#48484a`; Blue `#0071e3` + `#86868b` / `#2997ff` + `#a1a1a6`. In dark mode the canvas background is `#000000` (additive glow); in light mode it is transparent. A bottom gradient covers 64% of the height. Copy: eyebrow "Strata terrain API", headline "Elevation data for every hillside on Earth.", body "Ten-metre terrain tiles, refreshed monthly and served from the edge with a single request.", buttons "Get an API key" and "Browse the map".

## Accessibility

- Decorative only; the root is `pointer-events-none` and carries no text.
- Honour `prefers-reduced-motion: reduce`: draw one still frame; react to changes of the media query (stop or restart, then redraw).
- Pause when the tab is hidden to save battery.

## Acceptance checklist

- [ ] Particles cover the root edge to edge (with a two-step gutter) and never exceed `particleCount`.
- [ ] The field flows smoothly; ridges brighten and particles on them grow.
- [ ] `surfaceBias` near 1 gives rolling ridges; near 0 gives swirling flow.
- [ ] `speed` presets map to 0.00008 / 0.00016 / 0.00028 per ms; numbers work too.
- [ ] A coloured background blends additively; transparent works on light pages.
- [ ] Hex, short hex, `rgb()` and `rgba()` colours all render.
- [ ] Phones use a 1.35× wider step so the count stays reasonable.
- [ ] `animationEnabled={false}` and reduced motion both show a still frame.
- [ ] The loop pauses off screen and in hidden tabs.
- [ ] DPR is capped at 1.75 and the canvas stays crisp.
