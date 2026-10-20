# Page Curl

Build a paper page you can peel from its bottom-right corner. Drag the corner and the fold is computed live from the pointer: the page is cut along it, and the flap shows the paper's back with shading and a drop shadow, revealing a hidden card underneath. Let go near the corner and it lies back down; drag far enough and it peels off. A convincing flat-paper fold from 2D geometry, no WebGL.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`).
- Shapes are CSS `clip-path: polygon(...)` computed with plain geometry (half-plane clipping and reflection).
- File: `components/page-curl/page-curl.tsx`, named export `PageCurl`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `width` | `number` | `400` | Page width in px. |
| `height` | `number` | `260` | Page height in px. |
| `front` | `ReactNode` | sample letter | Content of the page you peel. |
| `back` | `ReactNode` | hidden discount card | What is revealed underneath. |
| `autoplay` | `boolean` | `false` | Peeks the corner by itself until the user grabs it. |

Default front (padding 28px, column, space-between): "Letter No. 7" (11px semibold uppercase, tracking 0.16em, `#86868b` / dark `#8e8e93`), "Peel back the corner." (26px semibold, line-height 1.1, tracking −0.03em, `#1d1d1f` / `#f5f5f7`), a one-sentence instruction to grab the corner and drag (14px, line-height 1.5, max-width 260px, `#6e6e73` / `#a1a1a6`), and at the bottom "— turn over" (13px italic grey).

Default back (centred column, gap 8px, padding 28px), background `radial-gradient(90% 70% at 30% 20%, #ffe1c2, rgba(255,225,194,0) 60%), linear-gradient(160deg, #e7f0ff, #c9d8ff 60%, #b9a8ff)`: "You found it" (11px semibold uppercase, tracking 0.16em, `#5e5ce6`), "20% off, today only" (24px semibold, tracking −0.03em, `#1d1d1f`), and a pill "PEEL20" (white at 80%, `px-3 py-1`, 13px semibold, tracking 0.1em).

## Geometry

Corner `C = (width, height)`. Pointer motion values `px`, `py` start at C. On every change of either:

- `d = C − P`, `len = |d|`. If `len < 1`, show the full page and no flap.
- Fold normal `n = d / len`; fold point `m = (C + P)/2`. The fold line is the perpendicular bisector of C and P, which is exactly how a real corner folds onto the pointer.
- **Page polygon**: the page rectangle clipped to the half-plane `(q − m)·n ≤ 0` (the side away from the corner), using a single-edge Sutherland–Hodgman clip.
- **Flap polygon**: the rectangle clipped to the other half-plane, with every vertex reflected across the fold line: `q′ = q − 2((q − m)·n)·n`.
- **Crease shadow**: from the page polygon, keep the part with `(q − m′)·n ≥ 0` where `m′ = m − 14n`, a 14px strip on the page side of the fold.
- Flap shading angle `θ = atan2(n.y, n.x)` in degrees.
- Format as `polygon(x1px y1px, ...)` (one decimal; empty → `polygon(0 0)`), stored in state.

## Layout and look

Root: centred column, gap 16px. Theme variables (light / dark via `dark:` on a `.dark` ancestor): `--pc-flap-a` `#f4efe4` / `#2c2c2e`, `--pc-flap-b` `#ffffff` / `#48484a`, `--pc-flap-c` `#e9e2d3` / `#262628`, `--pc-shade` `rgba(0,0,0,.08)` / `rgba(0,0,0,.35)`, `--pc-drop` `rgba(0,0,0,.22)` / `rgba(0,0,0,.6)`.

Stage (`width × height`, relative, `touch-action: none`, no selection), layers back to front:

1. **Underneath**: radius 18px, overflow hidden, inset hairline `inset 0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`), containing `back`.
2. **Page**: radius 18px, overflow hidden, background `#fffdf8` (dark `#1c1c1e`), hairline ring, `clip-path` = page polygon, containing `front` plus an overlay clipped to the crease shadow and filled with `--pc-shade`.
3. **Flap**: a no-pointer-events wrapper with `filter: drop-shadow(-6px 8px 10px var(--pc-drop))`, holding a full-size div clipped to the flap polygon with `linear-gradient({θ + 90}deg, var(--pc-flap-a), var(--pc-flap-b) 45%, var(--pc-flap-c))`, so the paper's back is lit in the middle and darker toward both edges.
4. **Grab handle**: an invisible 56px round button whose top-left sits at `(px − 40, py − 40)`, so it covers the corner and travels with it. `cursor-grab` (`grabbing` while active), focus-visible 2px ring `#0071e3` (dark `#0a84ff`). Removed once the page has peeled off.

Below the stage, a "Put it back" button: 36px tall, `px-4`, fully rounded, 13px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text), focus-visible outline with 2px offset. Disabled and at opacity 0.35 until the page has peeled off, then opacity 1.

## Motion

- **Drag**: pointer moves set `px = min(width, x)` and `py = min(height, y)` directly, in stage coordinates (scaled against the bounding box). The corner can be pulled anywhere up and left, but never past its own edges.
- **Release** (`settle`): if `|C − P| > 0.6 × √(width² + height²)`, peel off; otherwise spring both values back to C with `{ type: "spring", stiffness: 300, damping: 24 }`, so the page snaps flat.
- **Peel off**: mark peeled and spring `px` to `−1.1 × width`, `py` to `−0.9 × height` (`stiffness 60, damping 16`); the fold sweeps past the top-left and the page vanishes.
- **Put it back**: clear peeled and spring both to C (`stiffness 120, damping 20`).
- **Button opacity**: animates between 0.35 and 1.

## Interaction and states

- Pointer-down on the handle marks touched, starts dragging, and captures the pointer on the stage; pointer-up or cancel settles.
- Enter or Space on the handle (`preventDefault`) marks touched and peels the page off at once.

## Autoplay demo

700ms after mount and every 3600ms after, unless touched: animate `px` through `[width, width − 120, width − 70, width]` and `py` through `[height, height − 90, height − 50, height]` over 2s `easeInOut`. The corner lifts, hints at the card underneath, and lies back down. Grabbing the handle (or pressing Enter, or Put it back) stops the loop.

## Accessibility

- Handle: `<button type="button">` with `aria-label="Peel the corner. Press Enter to peel it off."`.
- "Put it back" is truly `disabled` until peeled. `front` and `back` stay real DOM text.

## Acceptance checklist

- Dragging the corner toward the centre cuts the page along a straight fold; the folded flap lands exactly where the pointer is.
- The flap is paper-coloured with a gradient across the fold, casts a soft shadow, and the page darkens slightly along the crease.
- Releasing close to the corner snaps the page back flat.
- Releasing beyond 60% of the diagonal sends the page off past the top-left and enables "Put it back".
- "Put it back" springs the page back into place and restores the handle.
- Enter on the focused corner peels the page off.
- With `autoplay`, the corner peeks every 3.6s until the user grabs it.
