# Layered Wave Background

Build a hero background of soft, blurred gradient waves stacked from the bottom edge, each drifting sideways on its own slow loop. It is pure SVG and CSS keyframes: no canvas, no JavaScript per frame. It should feel like slow weather: calm, deep and endlessly moving.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS. No animation library; motion is CSS `@keyframes` injected through a `<style>` tag inside the component.
- File: `components/layered-wave-background/layered-wave-background.tsx`, named export `LayeredWaveBackground`, plus exported types `LayeredWaveSpeed = "slow" | "medium" | "fast"`, `LayeredWaveDirection = "left" | "right"` and `LayeredWaveBackgroundProps`. Re-export from `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `gradientColors` | `string[]` | `["#7c3aed", "#06b6d4", "#ec4899"]` | Colours cycled through the layer gradients. Empty array falls back to the default. |
| `backgroundColor` | `string` | `"#020617"` | Root fill. |
| `transparentBackground` | `boolean` | `false` | Root becomes transparent and the top glow is dropped. |
| `waveWidth` | `number` | `1.2` | Clamped to 0.8–2.4; layer width = value × 200%. |
| `waveHeight` | `number` | `1` | Clamped to 0.5–1.8; layer height = value × 72%. |
| `waveLayers` | `number` | `4` | Rounded and clamped to 1–8. |
| `blurIntensity` | `number` | `24` | Blur (px) of the front layer. |
| `opacity` | `number` | `0.72` | Opacity of the front layer. |
| `speed` | `"slow" \| "medium" \| "fast"` | `"medium"` | Base loop duration 38s / 25s / 16s. |
| `direction` | `"left" \| "right"` | `"left"` | Drift direction. |
| `className` | `string` | — | Merged onto the root. |
| `children` | `ReactNode` | — | Rendered above the waves in a `relative z-10 h-full` wrapper (only when present). |

## Layout and look

- Root: `relative isolate min-h-[420px] w-full overflow-hidden`, inline `background-color` = `transparent` or `backgroundColor`. As a hero backdrop pass `absolute inset-0 h-full min-h-0`.
- Top glow (only when not transparent): absolutely filling, `pointer-events-none`, background `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 32%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.16), transparent 34%)`.
- Wave container: `pointer-events-none absolute inset-0 overflow-hidden`. For each layer index `i` from 0:
  - Wrapper div `absolute left-0 will-change-transform`, `bottom: (−14 − i·3)%`, width `clamp(waveWidth, .8, 2.4) × 200%`, height `clamp(waveHeight, .5, 1.8) × 72%`.
  - `opacity = clamp(opacity − i × 0.08, 0.14, 1)`.
  - `filter: blur(max(0, blurIntensity − i × 4)px)`.
  - SVG `viewBox="0 0 2400 600"`, `preserveAspectRatio="none"`, `h-full w-full`, `aria-hidden`.
  - A `linearGradient` (x1 0%, y1 0%, x2 100%, y2 35%) with stops at 0/50/100% using `colors[i]`, `colors[i+1]`, `colors[i+2]` (modulo length). Make the id unique per instance with `useId()` with colons stripped, plus the index.
  - A group translated `(0, 26 + i·7)` holding the layer's path twice: once at x 0 and once translated by 1200, so the 2400-wide strip tiles seamlessly.
- Four path shapes, cycled by `i % 4` (each is a 1200-wide wave closed down to y 600):
  1. `M0 260 C130 215 230 298 360 246 C500 190 620 246 760 224 C900 202 1010 120 1200 176 L1200 600 L0 600 Z`
  2. `M0 310 C150 245 260 362 420 292 C570 226 710 304 850 266 C1000 225 1080 178 1200 226 L1200 600 L0 600 Z`
  3. `M0 340 C125 282 245 318 370 286 C540 242 640 350 820 300 C980 255 1060 298 1200 246 L1200 600 L0 600 Z`
  4. `M0 380 C170 318 280 422 430 356 C570 294 690 385 850 334 C1010 280 1090 332 1200 292 L1200 600 L0 600 Z`
- Bottom shade over everything: `pointer-events-none absolute inset-0`, `linear-gradient(to bottom, rgba(255,255,255,0.06), transparent 32%, rgba(0,0,0,0.18))`.
- Responsive: all sizes are percentages of the root, so the waves fill any hero from phone to desktop; on narrow screens the 2×-wide strip simply shows less of each curve.

## Motion

- Keyframes, injected once per instance:
  - `layered-wave-drift-left`: `translate3d(0,0,0)` → `translate3d(-50%,0,0)`.
  - `layered-wave-drift-right`: `translate3d(-50%,0,0)` → `translate3d(0,0,0)`.
- Each layer: `animation-name` by direction, `animation-duration = base × (1 + i × 0.14)` seconds (base 38 / 25 / 16), `linear`, `infinite`. The initial inline transform matches the first keyframe so there is no jump.
- Because each strip is two identical 1200-unit tiles and moves exactly half its width, the loop is seamless. The staggered durations make the layers slide against each other, which is what reads as depth.

## Interaction and states

- No pointer interaction; the whole effect is `pointer-events-none` so content above stays clickable.
- Prop changes simply re-render the layers; durations and colours update live.

## Demo data

The section shows it as a 560px full-bleed hero with the copy centred vertically on large screens. Theme-aware palettes (light / dark):
- Graphite: `#d2d2d7, #e8e8ed, #b8b8bd` on `#f5f5f7` / `#3a3a3c, #636366, #2c2c2e` on `#000000`.
- Blue (default): `#a8d1ff, #d6e9ff, #6cb4ff` on `#f5f5f7` / `#0071e3, #2997ff, #00346b` on `#000000`.
- Sand: `#eadbc8, #f5ede2, #d6c0a3` on `#f5f5f7` / `#5c4a36, #8a6f50, #2e251b` on `#000000`.
Settings: speed `slow`, direction `left`, 4 layers, width 1.25, height 0.9, blur 28, opacity 0.7. In light mode a child overlay `bg-gradient-to-b from-transparent from-40% to-white/30` lifts the bottom shade. Copy: eyebrow "Halftone Conference · Lisbon · March 12–14", headline "Three days on the craft of calm software.", body "Talks, workshops and long lunches with the people who build the tools you open every day. 400 seats.", buttons "Get a ticket" (`#0071e3` pill) and "See the programme" (grey pill).

## Accessibility

- Every SVG and overlay is `aria-hidden`; the background carries no information.
- Keep text contrast in mind: blurred waves under body copy need the darker palettes or a scrim.
- Reduced motion: the drift is slow and ambient; if you need to honour `prefers-reduced-motion`, set `animation-play-state: paused` on the layers under that media query.

## Acceptance checklist

- [ ] Four blurred gradient waves rise from the bottom edge by default, the front one most opaque.
- [ ] Each layer behind is 0.08 fainter (never below 0.14) and 4px sharper.
- [ ] Waves drift left on a seamless loop with no visible seam or jump.
- [ ] `speed` changes the base loop to 38s, 25s or 16s; deeper layers are 14% slower per step.
- [ ] `direction="right"` reverses the drift.
- [ ] `waveLayers` is clamped to 1–8 and cycles the four path shapes.
- [ ] `transparentBackground` removes the fill and the top glow.
- [ ] Two instances on one page don't share gradient ids.
- [ ] Children render above the waves and stay clickable.
