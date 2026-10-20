# Metal Orbs

Build two blobs of liquid chrome floating on a soft card. They are metaballs: when close, their surfaces bulge toward each other and pool into one shape. Each pixel is shaded with a fake chrome environment (bright sky, dark horizon band, warm ground), a sharp highlight, and a faint cool or warm tint by which orb owns that surface. A segmented control switches Joined / Apart / Orbit, and dragging pulls the cool orb around. No WebGL: 2D canvas pixel work only.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (only for the segmented control's sliding pill via `layoutId`).
- File: `components/metal-orbs/metal-orbs.tsx`, named export `MetalOrbs`. Also export the type `MetalOrbsMode = "joined" | "apart" | "orbit"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `width` | `number` | `440` | Canvas width in px. |
| `height` | `number` | `280` | Canvas height in px. |
| `autoplay` | `boolean` | `false` | Cycles Joined, Orbit and Apart by itself until the user interacts. |

## Layout and look

- Root: centred column, gap 16px.
- Card: radius 24px, overflow hidden. Light: `linear-gradient(180deg, #ffffff, #f0f0f3)`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -28px rgba(0,0,0,.3)`. Dark: `linear-gradient(180deg, #2c2c2e, #1c1c1e)`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -28px rgba(0,0,0,.6)`.
- Canvas: `width × height` CSS px, `max-width: 100%`, `display: block`, `cursor-grab`, `touch-action: none`. Backing store × DPR (capped at 2). The canvas is transparent, so the card gradient shows through.
- Segmented control: `grid-cols-3`, radius 12px, padding 3px, `#e8e8ed` (dark `#3a3a3c`). Buttons "joined", "apart", "orbit" (CSS `capitalize`), 32px tall, `px-5`, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`. The active one has a sliding white pill (dark `#636366`), shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, `layoutId` namespaced with `useId`, spring `stiffness 420, damping 32`.
- Caption: "Drag inside to pull the cool orb around." at 13px `#86868b` (dark `#98989d`).

## Rendering (every animation frame)

Render the metal into an offscreen buffer canvas at half resolution (`bw = floor(width/2)`, `bh = floor(height/2)`) and reuse one `ImageData` and one `Float32Array` field buffer.

Orbs: orb 0 ("cool") starts at `(0.32·width, height/2)`, radius 54, tint `rgb(150,190,255)`. Orb 1 ("warm") starts at `(0.68·width, height/2)`, radius 48, tint `rgb(255,170,120)`.

1. **Field**: for each buffer pixel (at full-res position `p = 2·(x, y)`), `f = Σ r² / (|p − orb|² + 1)`.
2. **Mask**: pixels with `f < 0.85` are transparent. Edge alpha `= min(1, (f − 0.85)/0.25) × 255` for a soft anti-aliased rim.
3. **Normal** from central differences: `gx = f(x+1) − f(x−1)`, `gy = f(y+1) − f(y−1)`; `nx = −4.5·gx`, `ny = 4.5·gy` (ny positive means facing up). If `|n| > 1`, normalise it. `nz = √max(0, 1 − nx² − ny²)`. The rim gets steep normals, the top stays flat.
4. **Environment lookup** with `ry = clamp(1.1·ny + 0.05·nz, −1, 1)`:
   - `ry > 0.18` (sky): `k = (ry − 0.18)/0.82`, colour `(205 + 45k, 214 + 38k, 226 + 28k)`.
   - `ry > −0.08` (horizon): `k = (ry + 0.08)/0.26`, `e = k²(3 − 2k)` (smoothstep), colour `(92 + 113e + 8·nx, 98 + 116e, 108 + 118e)`.
   - otherwise (ground): `k = min(1, (−ry − 0.08)/0.7)`, colour `(196 − 70k, 172 − 70k, 140 − 64k)`.
5. **Tint**: `w = f₀ / (f₀ + f₁)` (orb 0's share of the field at that pixel). Mix the two tints by w, then `colour = 0.72·env + 0.28·tint`. Where the orbs merge, the tint blends smoothly across the neck.
6. **Specular**: `spec = max(0, −0.45·nx + 0.55·ny + 0.7·nz)^18 × 255`, added to each channel and clamped to 255 (a light from the upper left).
7. Put the image data into the buffer.

Then on the visible canvas: clear it, draw one **floor shadow** per orb (an ellipse at `(orb.x, height − 30)` with radii `1.2r × 0.25r`, filled with a radial gradient from radius 2 to `1.2r`, `rgba(0,0,0,.18)` to transparent; `.55` in dark mode so it still reads), then draw the buffer scaled up 2× with `imageSmoothingQuality = "high"`. Detect dark mode with a `MutationObserver` watching the `dark` class on `document.documentElement`.

## Motion

Each frame, compute a target for each orb from the mode, with `t = now/1000` seconds and `(cx, cy)` the canvas centre:

- **joined**: `(cx − 30, cy + 6·sin t)` and `(cx + 32, cy − 6·sin t)`, overlapping and gently rocking.
- **apart** (initial mode): `(cx − 120, cy + 10·sin 0.8t)` and `(cx + 120, cy − 10·sin 0.8t)`, separate and bobbing in counter-phase.
- **orbit**: `(cx + 70·cos 1.4t, cy + 38·sin 1.4t)` and the mirror point `(cx − 70·cos 1.4t, cy − 38·sin 1.4t)`, circling each other on an ellipse and merging each time they pass.

While the pointer is held, orb 0's target is the pointer. Each orb eases toward its target with `pos += (target − pos) × 0.08` per frame (exponential follow), so mode changes and drags glide and the orbs visibly stretch into each other in transit. Keep the mode in a ref so the loop reads it without restarting. Restart the loop only when `width` or `height` changes; cancel it and disconnect the observer on unmount.

## Interaction and states

- Pointer-down on the canvas: mark touched, capture the pointer, set its position (canvas px via the bounding box).
- Pointer-move: update the position; for a mouse, only while the primary button is held (`buttons === 1`); touch and pen always update while captured.
- Pointer-up or cancel: clear the pointer; orb 0 eases back to its mode target.
- Clicking a mode button marks touched and sets the mode.

## Autoplay demo

Every 2600ms, set the mode to the next of `joined → orbit → apart`, repeating. The interval clears itself once the user has pressed the canvas or a mode button.

## Accessibility

- Canvas: `role="img"`, `aria-label="Two liquid metal orbs. Move the pointer to drag the left one."`.
- Mode buttons in a `role="group"` with `aria-label="Orb motion"`, each `type="button"` with `aria-pressed` and a 2px focus-visible outline `#0071e3`.

## Acceptance checklist

- At load, two separate chrome spheres bob left and right, each with a soft floor shadow.
- Each is bright on top with a dark middle band, a warm underside and a sharp upper-left highlight; the left reads slightly blue, the right slightly orange.
- Joined fuses them into one peanut-shaped blob with a smooth neck and blended tint.
- Orbit makes them circle and merge on every pass.
- Dragging pulls the left orb toward the pointer with a short lag; releasing lets it drift back.
- The rim is anti-aliased, not stair-stepped, even though the shading runs at half resolution.
- With `autoplay`, the mode changes every 2.6s until the first interaction.
