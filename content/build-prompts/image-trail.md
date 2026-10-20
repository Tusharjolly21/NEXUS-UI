Build a pointer image trail. Move across a white card and it deals out small framed photos along your path, like postcards flicked onto a table. Each one glides in from the previous one, lands with a small springy overshoot, tilted the way you were heading, drifts a little with your speed, then drops away under gravity while blurring and fading. An optional magnetic mode lets the pointer shove photos that are still lying there. Ships with six drawn SVG postcards so it works offline.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion only for `useReducedMotion`. All motion runs in one `requestAnimationFrame` loop that writes `opacity`, `transform` and `filter` straight to a fixed pool of DOM nodes (no React render per frame).
- File: `components/image-trail/image-trail.tsx`, named exports `ImageTrail`, `MagneticImageTrail` (same with `magneticEffect` on), `DEFAULT_TRAIL_IMAGES`, and types `ImageTrailProps`, `ImageTrailImage`, `ImageTrailSettings`, `ImageTrailAppearance`, `ImageTrailAnimation`, `ImageTrailMagneticSettings`.

## API

`ImageTrailImage = { src: string; alt?: string }`. Settings can be passed grouped or as flat aliases (flat wins):

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `images` | `ImageTrailImage[]` | 6 drawn postcards | Dealt in turn. |
| `spacing` / `trailSettings.spacing` | `number` | `48` | px of pointer travel between images (min 4). |
| `duration` / `trailSettings.duration` | `number` | `1000` | ms an image stays before falling (min 120). |
| `smoothness` / `trailSettings.smoothness` | `number` | `0.7` | 0-1; higher glides from the previous image. |
| `imageSize` / `appearance.imageSize` | `number` | `112` | px square (min 20). |
| `cornerRadius` / `appearance.cornerRadius` | `number` | `14` | px. |
| `objectFit` / `appearance.objectFit` | `"cover" \| "contain"` | `"cover"` | Image fit. |
| `fadeInDuration` / `fadeOutDuration` | `number` | `0.25` / `0.5` | Seconds (min 0.05). |
| `fadeInBlur` / `fadeOutBlur` | `number` | `0` / `6` | px. |
| `magneticEffect` | `boolean` | `false` | Pointer shoves lying images. |
| `magneticStrength` / `magneticRadius` | `number` | `0.3` / `110` | 0-1 and px (min 20). |
| `maxTrailImages` | `number` | `16` | Pool size (1-60). |
| `staticPreview` | `boolean` | `false` | Fixed fan, ignores the pointer. |
| `hint` | `string` | `"Move across the canvas."` | Centred when there are no children; `""` hides. |
| `autoplay` | `boolean` | `false` | Ghost pointer loops until a real move. |
| `children` | `ReactNode` | — | Content above the trail (z 10). |
| `className` | `string` | — | Root classes (size). |

Postcards (120×120 SVG data URIs): "Dunes at sunset" (coral-to-peach sky, pale sun, two dune layers), "Ocean swell" (sky over blue sea with three wavy lines), "Pine forest" (mint sky, sun, hill, four dark green triangles), "City at night" (navy-to-violet sky, moon, skyline with amber windows), "Aurora" (dark teal with green and violet ribbons over hills), "Lavender rows" (pink sky, purple field in perspective, sun).

## Layout and look

- Root: `relative`, 320px tall by default, full width, `touch-action: pan-y`, no selection, overflow hidden, radius 24, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`).
- Hint: centred 13px `#86868b` (dark `#a1a1a6`), pointer-events none.
- Trail layer: absolute, pointer-events none, `aria-hidden`. A pool of `maxTrailImages` frames, each `imageSize` square, top-left origin, white padding 3px (dark `#2c2c2e`), radius `cornerRadius`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -14px rgba(0,0,0,.45)` (dark `rgba(255,255,255,.08)` / `.9`), `will-change: transform`, starting at opacity 0. The `<img>` inside fills it with radius `cornerRadius − 3` and the chosen fit; not draggable.
- Static preview fan (x%, y%, rotation): (28, 58, −14°), (40, 46, −6°), (52, 40, 3°), (64, 46, 10°), (76, 56, 16°), centred on each point.

## Motion

- Pointer velocity: on each move, `v = 0.5·v + 0.5·(Δpos/Δt)` (Δt ≥ 8ms); each frame it decays by `exp(−6·dt)`.
- Spawning: when the pointer is at least `spacing` px from the last spawn point, take the next pool slot (round robin), set its image to the next source, and bring it to the front (incrementing z-index). It starts at the previous spawn point (if smoothness > 0) and targets the pointer. Initial drift `0.18·v`; rotation `clamp(0.012·vx, −16, 16) + ((n·37) mod 9) − 4` degrees; spin `clamp(0.02·vx, −40, 40)` deg/s.
- Each frame (dt capped at 0.05) per active slot, with `age` in seconds:
  - Glide: `k = 1 − (0.85·smoothness)^(60·dt)`; target drifts by its velocity, which decays by `exp(−4·dt)`; position moves `k` of the way to the target.
  - Magnet (if on): within `reach`, push the target away from the pointer by `(1 − d/reach)·strength·900·dt` px.
  - `out = max(0, age − duration)/fadeOut`; fall `140·out²` px down; rotation += `spin·dt·(out > 0 ? 1.6 : 0.3)`.
  - Landing pop: `pop = 1 − exp(−11·age)·cos(17·age)` (0 → about 1.12 → 1).
  - `opacity = min(1, age/fadeIn)·(1 − out)`; `blur = fadeInBlur·(1 − inA) + fadeOutBlur·out`; `scale = pop·(1 − 0.18·out)`.
  - Transform: `translate3d(x − size/2, y − size/2 + fall, 0) rotate(rot) scale(scale)`. Deactivate after `duration + fadeOut`.
- Reduced motion: no drift, tilt, spin, fall or pop; images just fade in and out in place.

## Interaction and states

- `pointermove` on the root feeds local coordinates and marks it touched; `pointerleave` clears the pointer and velocity history.
- Children render above the trail; images remain visible underneath.
- Cancel the loop on unmount; `staticPreview` skips the engine.

## Autoplay demo

Until the first real pointer move, feed a ghost pointer each frame along a drifting figure-eight: `x = w·(0.5 + 0.36·sin(1.1t))`, `y = h·(0.5 + 0.26·sin(2.2t + 0.4))`. On touch, call leave and stop. A magnetic variant demo: radius 48 round images at 96px, spacing 36, duration 1600, strength 0.5, over a headline "Summer, collected."

## Accessibility

- The trail is decorative (`aria-hidden`, empty alts). Children stay readable and interactive.

## Acceptance checklist

- Moving deals a new framed photo roughly every 48px, cycling through the images.
- Each photo glides in from the previous one, pops slightly past full size and settles.
- Photos tilt and drift in the direction of movement.
- After about a second each falls, spins a little more, blurs and fades out.
- No more than `maxTrailImages` are visible; newest is always on top.
- Magnetic mode pushes lying photos away from the pointer.
- `staticPreview` shows a fixed fan of five.
- Autoplay loops until the real pointer arrives; reduced motion only fades.
