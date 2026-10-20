# Drift Gallery

Build an endless wall of artwork rendered in WebGL. Drag anywhere and the wall slides with inertia, wrapping forever in every direction; the sheets flex and fringe colour with your speed and the whole wall curves away like a shallow bowl. Hover lifts a piece, clicking opens it in a lightbox, and left alone the wall drifts slowly. It should feel like a calm gallery wall with real weight.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, `three`, `@react-three/fiber` v9 (`Canvas`, `useFrame`, `useThree`), framer-motion (`AnimatePresence`, `motion`, `useReducedMotion`), and a `cn` helper.
- File: `components/blocks/drift-gallery.tsx`, named exports `DriftGallery`, `DEFAULT_DRIFT_GALLERY_WORKS`, types `DriftGalleryProps` and `DriftGalleryWork`.

## API

`DriftGalleryWork = { title: string; by: string; year: string; src?: string; palette?: [shape, paper, ink]; pattern?: number }`

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `works` | `DriftGalleryWork[]` | ten generated posters | Pieces; repeated to fill the grid. Empty falls back to the defaults. |
| `eyebrow` | `string` | `"Spring exhibition"` | Uppercase line. |
| `title` | `string` | `"Ten artists, no edges."` | Heading; also the region's label. |
| `hint` | `string` | `"Drag anywhere · click to open"` | Corner pill. |
| `keyboardHint` | `string` | `"Arrows to move · Enter to open"` | Pill while keyboard-focused. |
| `closeLabel` | `string` | `"Back to the wall"` | Lightbox button. |
| `autoplay` | `boolean` | `true` | Idle drift when nobody drags. |
| `onOpen` | `(work, index) => void` | — | Called when a piece opens. |
| `className` | `string` | — | Extra classes on the wall. |

Default works: titles Low Sun, Tidal, Field Notes, Bloom, Copper Hour, Signal, Undertow, Grid Study, Pulse, Night Shift; artists A. Moreau, K. Tanaka, L. Okafor, S. Lindqvist, R. Mehta, J. Alvarez, E. Novak, M. Haddad, I. Rossi, T. Nguyen; year `2019 + (i % 7)`; `pattern: i`; palettes (shape, paper, ink): `#ff6b4a #ffd6a5 #1d1d1f`, `#0071e3 #a1e3ff #ffffff`, `#30d158 #e8ffe9 #0b3d1a`, `#bf5af2 #ffd1f7 #2a0b3d`, `#ff9f0a #fff1d6 #3d2200`, `#1d1d1f #f5f5f7 #ff375f`, `#64d2ff #003049 #fdf0d5`, `#ffd60a #1d1d1f #ffffff`, `#ff375f #ffe5ec #3d0013`, `#5e5ce6 #e5e4ff #ffd60a`.

## Layout and look

- Wrapper: 600px tall, full width, overflow hidden, `touch-action: none`, no text selection, bg `#f5f5f7` / dark `#000`. Cursor `grab`, `pointer` over a piece, `grabbing` while dragging (set via data attributes, not state).
- Canvas: dpr `[1, 2]`, camera at z 7.4, fov 45, antialias. Clear colour `#f5f5f7` / `#000000`, switched by a MutationObserver on `<html>`'s `dark` class.
- Posters are drawn on a 400×500 canvas: paper fill, then one of ten patterns in the shape colour (0 sun disc r120 at y250 over an ink band from y300; 1 nine sine waves, width 14; 2 a 6×8 dot grid, radii 8/14/20; 3 six-petal flower of 42×90 ellipses at 0.8 alpha; 4 seven concentric half-rings, width 18, fading; 5 a giant "S" at 800 weight 380px; 6 twelve stripes alternating shape/ink; 7 a 40×50 grid with an ink rectangle 160×200; 8 forty bars with length `340·|sin(k·0.45)|`; 9 a triangle and an ink sun), then the title in 700 26px at (26, 450) and `by · year` in 500 15px at 0.7 alpha at (26, 474). With `src`, the image is cover-cropped into the same canvas. Each becomes a `CanvasTexture` (sRGB, anisotropy 4).
- Grid: 8 columns × 6 rows of 1.5 × 1.875 planes (18×18 segments), gap 0.32. Odd rows offset by half a column. Sheet k uses work `k % works.length`.
- Bottom fade: 160px `from-[#f5f5f7]` / `from-black` to transparent. Bottom-left: eyebrow 13px semibold uppercase tracking 0.14em `#6e6e73` / `#a1a1a6`; title `clamp(28px, 4vw, 44px)` semibold, leading 1, tracking −0.035em, `#1d1d1f` / `#f5f5f7`. Bottom-right pill (from `sm`): 12px, white/80 with blur and a 1px `rgba(0,0,0,.06)` ring; dark `#1c1c1e`/80, `#3a3a3c` ring, `#a1a1a6` text.

## Motion

- Wrapping: each frame, `x = ((c·SX + rowOffset + panX) mod TW) − TW/2 + SX/2` (positive modulo), same for y with SY and TH, where `SX = 1.82`, `SY = 2.195`, `TW = 8·SX`, `TH = 6·SY`.
- Vertex shader: world z −= `d² × 0.03` (d = distance from centre, the bowl), plus `sin(uv.x·π)·velX·−0.9 + sin(uv.y·π)·velY·0.9` (flex).
- Fragment shader: rounded corners by discarding outside a 0.06 rounded rectangle; uv zoom `/(1 + hover·0.06)`; RGB split, red sampled at `uv + vel·0.02`, blue at `uv − vel·0.02`; include `colorspace_fragment`.
- Smoothed velocity uniform: lerp towards the raw velocity by 0.12 per frame. Hover uniform eases by 0.12 per frame; the sheet scales `1 + hover·0.05`.
- Drag: velocity = pointer delta × 0.011 (y inverted), added straight to pan.
- Release and idle: per frame with `dt` clamped to 0.1s, `k = 0.04^dt`, `vel = vel·k + drift·(1 − k)`, `pan += vel·dt·60`; drift is `(0.0016, 0.0009)` with autoplay, `(0, 0)` without.
- Lightbox: backdrop `#f5f5f7`/70 (dark black/70) with `backdrop-blur-md`, fades. Figure springs in from `scale 0.85, y 30, rotateX 25` (stiffness 260, damping 24, perspective 900) and out to `scale 0.9, y 20, opacity 0`. Image `min(420px, 60vh)` tall, 4:5, radius 14px, shadow `0 30px 60px -24px rgba(0,0,0,.5)`. Caption title 28px semibold, `by · year` 15px; button 36px tall pill, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f`).

## Interaction and states

- Pointer down/move/up/cancel/leave on the wrapper drives the drag. R3F hover sets the lifted sheet; a click with `delta < 6` opens it.
- Keyboard (wrapper `tabIndex=0`): arrows set the velocity to ±0.1 (left → +x, right → −x, up → −y, down → +y) so the wall coasts about one column; Enter or Space opens the sheet nearest the centre (tracked each frame); while keyboard-focused that sheet lifts as if hovered and the keyboard pill replaces the pointer pill. Escape (a document listener while open) closes and returns focus to the wall. Clicking the backdrop closes too.
- Pause: `frameloop` is `"never"` while the wrapper is off screen (IntersectionObserver) or the tab is hidden, `"always"` otherwise.
- Dispose materials, geometry and textures on unmount.

## Autoplay demo

`autoplay` is the idle drift: whenever nobody is dragging, velocity eases towards the drift so the wall wanders diagonally and resumes after every release. Reduced motion turns the drift off and fades the lightbox instead of springing it; dragging and inertia still work.

## Accessibility

- Wrapper `role="region"`, `aria-roledescription="gallery"`, `aria-label={title}`, described by a visually hidden line explaining arrows, Enter and Escape; inset 2px focus ring `#0071e3` / `#0a84ff`. The canvas is `aria-hidden`.
- Lightbox `role="dialog"`, `aria-modal`, labelled "Title by Artist"; the close button takes focus.

## Acceptance checklist

- [ ] Dragging slides the wall, a fling coasts and slows, and it wraps without seams in all directions.
- [ ] Sheets bend and show colour fringes while moving; edges of the wall curve away.
- [ ] Hovering lifts and zooms a piece; clicking opens a springy lightbox; clicking outside closes it.
- [ ] Left alone, it drifts diagonally; with reduced motion it stays still.
- [ ] Arrows move the wall, Enter opens the centred piece, Escape closes it and focus returns.
- [ ] Dark mode switches the clear colour, fade, pills, text and lightbox.
- [ ] Nothing renders while off screen or in a hidden tab.
- [ ] Custom `works` with `src` images appear cropped to 4:5.
