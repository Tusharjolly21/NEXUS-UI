Build a grainy gradient surface made entirely from SVG filters and CSS: soft glowing pools of indigo, pink, blue and amber under flickering film grain, with the pools leaning gently toward the pointer and a soft sheen following it. Press and hold (or hold Space/Enter) and the surface melts, flowing through an animated displacement map; let go and it snaps back like jelly, overshooting past flat before it settles. A large "Grain." title sits on top.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useMotionTemplate`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`, and a `cn` class-merge helper. No canvas or WebGL.
- File: `components/svg-noise-shader/svg-noise-shader.tsx`, named export `SvgNoise` plus an alias `export const SvgNoiseShader = SvgNoise`, exported type `SvgNoiseProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `colors` | `string[]` | `["#5e5ce6", "#ff375f", "#0a84ff", "#ff9f0a"]` | Up to four pool colours (cycled if fewer). |
| `grain` | `number` | `0.35` | Grain opacity, clamped 0–1. |
| `distortion` | `number` | `90` | Displacement px at full melt. |
| `speed` | `number` | `1` | Turbulence flow speed multiplier. |
| `children` | `ReactNode` | default title | Content over the surface. |
| `hint` | `string` | `"Press and hold to melt it."` | Caption under the default title; `""` hides it. |
| `autoplay` | `boolean` | `false` | Holds and releases every few seconds until touched. |
| `className` | `string` | – | Extra classes. |

## Layout and look

- Surface: a `motion.div`, relative, `isolation: isolate`, flex-centred, 340px tall, full width up to 520px, radius 24, `overflow: hidden`, background `#0b0b12`, white text, `touch-action: none`, no selection, pointer cursor. Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, drop `rgba(0,0,0,.8)`). Focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset on `#f5f5f7` (dark black).
- Hidden zero-size SVG with two filters (ids suffixed with `useId`, colons stripped):
  - `warp`: region −20%/−20%/140%/140%; `feTurbulence fractalNoise baseFrequency "0.009 0.016" numOctaves 2 seed 3` → `feDisplacementMap` on SourceGraphic, scale 0, channels R/G.
  - `grain`: region 0/0/100%/100%; `feTurbulence fractalNoise baseFrequency 0.85 numOctaves 3 stitchTiles stitch` → `feColorMatrix` `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 −0.18` (white specks with thresholded alpha).
- Colour layer (z −20), inset −12% so warping never shows edges, filtered by `warp`:
  - Pools: `background-image` of four radial gradients `radial-gradient(r% (r+8)% at x% y%, colour, transparent 70%)` with spots (x, y, r) = (22, 28, 58), (78, 72, 52), (70, 18, 40), (28, 82, 44). This layer is translated by the lean.
  - Streaks over it: `repeating-linear-gradient(115deg, rgba(255,255,255,.5) 0 2px, transparent 3px 18px)` at 45% opacity, `mix-blend-mode: soft-light`.
- Grain layer (z −10): inset −24px, `mix-blend-mode: overlay`, opacity = `grain`, an SVG `<rect>` filling it with the grain filter; translated by the jitter offsets.
- Sheen (z −10): `radial-gradient(260px circle at px% py%, rgba(255,255,255,.16), transparent 70%)`.
- Vignette (z −10): `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.45))`.
- Default title (pointer-events none, centred, padding 0 24px): eyebrow "SVG noise" 12px medium uppercase, tracking 0.18em, white 75%; "Grain." 56px semibold, leading 1, tracking −0.05em, 8px below; hint 13px white 75%, 12px below.

## Motion

- `melt` motion value (0 rest, 1 fully held). On every change write the displacement `scale = round(melt × distortion, 1 decimal)` straight to the `feDisplacementMap`.
- Press: spring to 1 with stiffness 110, damping 16 (soft melt). Release: spring to 0 with stiffness 320, damping 9 (stiff and loose, so it rings through negative values: the jelly overshoot). Stop the previous animation first.
- Squash: the whole surface scales `1 − clamp(melt, −0.4, 1) × 0.03`, so it shrinks 3% when held and bulges slightly on the rebound.
- Lean: pointer position in percent goes into `useSpring(50, stiffness 90, damping 16)` for x and y; the pools translate by `(p − 50) × 0.25` px and the sheen centres on the springy point.
- One rAF loop (dt capped at 50ms, `t += dt × speed`):
  - While `|melt| > 0.01`, animate the warp turbulence `baseFrequency` to `"fx fy"` with `fx = 0.009 + 0.003·sin(0.9t)`, `fy = 0.016 + 0.004·cos(0.7t)` (5 decimals), so the melt flows.
  - Every 70ms advance a frame counter and hop the grain layer to `x = (frame·37 mod 23) − 11`, `y = (frame·53 mod 19) − 9` px, like film grain flicker.
- Cancel the loop and stop the spring on unmount.

## Interaction and states

- Pointer down: mark touched, capture the pointer, press. Pointer up/cancel: release. Pointer move: update the lean target (also marks touched).
- Keyboard: Space or Enter (not repeat) press with `preventDefault`; keyup releases.
- Reduced motion: no rAF loop (no grain flicker, no flow, no demo); press jumps `melt` to 0.6 and release to 0 instantly.

## Autoplay demo

Inside the loop, while untouched: after 1.6s idle, spring `melt` to 1 (110/16) and aim the lean at (64%, 40%); after 1.4s held, release with the jelly spring (320/9) and aim at (40%, 62%); repeat. Any pointer down, move or key press stops it.

## Accessibility

- The surface is `role="button"`, focusable, labelled "Noise surface. Press and hold to melt it.", with `aria-pressed` reflecting the held state. All decorative layers are `aria-hidden`.

## Acceptance checklist

- Four soft colour pools glow under visible, flickering white grain on a near-black card.
- Moving the pointer slowly shifts the pools and a soft highlight toward it.
- Holding the pointer down warps the colours into a flowing, melting pattern and shrinks the card slightly.
- Releasing snaps the surface flat with a visible wobble past flat before settling.
- Space/Enter hold and release work the same way.
- `grain={0}` removes the grain; custom colours recolour the pools.
- Autoplay melts and releases every ~3s and stops on first interaction.
- Reduced motion shows a static textured surface.
