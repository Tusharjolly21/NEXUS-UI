# Layout Switch

Build a small photo gallery where the same six photos glide between four arrangements: Grid, Row, Feature and Pile. Nothing fades or cuts: every photo springs from its old box to its new one, resizing and rotating on the way, with a tiny stagger so the motion ripples. Clicking a photo grows it to fill the whole frame while the others dim; clicking it again (or pressing Escape) puts it back. The feel is smooth and confident, like a native photos app.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layoutId` for the segmented control).
- Photos are absolutely positioned and animated explicitly (x, y, width, height, rotate); do not use framer's `layout` prop for them.
- File: `components/layout-switch/layout-switch.tsx`, named export `LayoutSwitch`. Also export the type `LayoutSwitchLayout = "grid" | "row" | "feature" | "pile"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Changes layouts by itself until the user interacts. |

## Content

Six photos, each a CSS gradient "art" plus a title (gradients are `radial-gradient(...)` over `linear-gradient(...)`):

1. Salt flats: `radial-gradient(80% 60% at 30% 25%, #fff3d6, rgba(255,243,214,0) 60%), linear-gradient(180deg,#9ec9ff,#e8f1ff 55%,#f5e9dd)`
2. Red canyon: `radial-gradient(70% 60% at 70% 20%, #ffd2a6, rgba(255,210,166,0) 60%), linear-gradient(160deg,#ff9f6b,#c4553d 60%,#5b2a2a)`
3. Pine ridge: `radial-gradient(60% 50% at 50% 15%, #e7fff1, rgba(231,255,241,0) 60%), linear-gradient(180deg,#bfe3d0,#3f8f6b 60%,#173d2e)`
4. Night pier: `radial-gradient(40% 30% at 70% 30%, #fff6c7, rgba(255,246,199,0) 60%), linear-gradient(180deg,#1b2140,#3a3f78 60%,#0c0f22)`
5. Lavender: `radial-gradient(70% 60% at 30% 30%, #fff, rgba(255,255,255,0) 55%), linear-gradient(170deg,#e4d4ff,#a98bf0 55%,#5e4bb3)`
6. Low tide: `radial-gradient(70% 50% at 60% 20%, #fffbe8, rgba(255,251,232,0) 60%), linear-gradient(180deg,#a7e3f2,#5fb6c9 55%,#d9c7a8)`

## Layout and look

- Root: full-width centred column, gap 20px. Order: segmented control, stage, caption "Switch layouts, or click a photo to open it." (13px `#86868b`, dark `#98989d`).
- Segmented control: `grid-cols-4`, radius 12px, padding 3px, `#e8e8ed` (dark `#3a3a3c`). Buttons grid / row / feature / pile (CSS `capitalize`), 32px tall, `px-5`, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`. Active: sliding white pill (dark `#636366`), shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, `layoutId` namespaced with `useId`, spring `stiffness 420, damping 32`.
- Stage: full width, max 640px, 320px tall, overflow hidden. Inside, a fixed 640 × 320 coordinate box centred horizontally (left 50%, margin-left −320px), so narrower containers clip the sides rather than scale.

Boxes for photo i of n = 6 (stage `W = 640`, `H = 320`, gap `G = 10`), as `{ x, y, w, h, rotate, z }`:

- **grid**: 3 × 2. `w = (W − 2G)/3`, `h = (H − G)/2`; `x = (i mod 3)(w + G)`, `y = floor(i/3)(h + G)`.
- **row**: one line. `w = (W − G(n − 1))/n`, `h = 170`; `x = i(w + G)`, `y = (H − h)/2`.
- **feature**: photo 0 is `420 × 320` at (0, 0). The others stack on the right at `x = 430`, `w = W − 430`, `h = (H − G(n − 2))/(n − 1)`, `y = (i − 1)(h + G)`.
- **pile**: all `240 × 170`, `x = W/2 − 120 + (i − n/2)·14`, `y = H/2 − 85 + |i − n/2|·4`, rotations `[−9, 6, −4, 10, −2, 3]°`, `z = i + 1` (later photos on top).
- **open** photo: `0, 0, 640, 320`, rotate 0, z 50.

Photo tiles are `<button>`s, absolutely positioned at top-left, overflow hidden, background = art. Radius 16px (24px when open). Shadow `0 18px 40px -16px rgba(0,0,0,.45)` in pile layout or when open, otherwise a hairline `0 0 0 1px rgba(0,0,0,.04)`. Title at bottom 12px, left 14px: 14px semibold white with `text-shadow: 0 1px 8px rgba(0,0,0,.35)`. Same visuals in light and dark (the art is self-coloured).

## Motion

- Every tile animates `x, y, width, height, rotate, borderRadius, opacity, zIndex` with `{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }`. `zIndex` changes instantly (`duration: 0`) so stacking is correct from the first frame.
- Stagger: delay `i × 0.025s` when changing layout; no delay while a photo is opening or closing.
- Opening: the chosen tile grows to the full stage; every other tile fades to opacity 0.25 (and back to 1 on close).
- Hover: `whileHover` scale 1.02, disabled (scale 1) while any photo is open.
- Titles: visible when the tile is open, or when nothing is open and the layout is not `row` (row tiles are too narrow). Enter from `opacity 0, y 8` to `opacity 1, y 0`; exit to opacity 0 (`AnimatePresence`, default transitions).
- `initial={false}` on tiles so the first render does not animate.

## Interaction and states

- State: `layout` (starts `grid`) and `open` (photo id or null).
- Clicking a tile toggles it open or closed. Clicking another tile while one is open opens that one instead.
- Choosing a layout closes any open photo and switches.
- Escape (window keydown listener, only while a photo is open) closes it.
- Any pointer-down inside the component marks it touched.

## Autoplay demo

Every 2300ms, switch to the next of `feature → pile → row → grid`, repeating. The interval clears itself once the user has pressed anywhere in the component or clicked a layout button.

## Accessibility

- Segmented control: `role="group"`, `aria-label="Layout"`, buttons `type="button"` with `aria-pressed` and a 2px focus-visible outline `#0071e3`.
- Tiles: `aria-label` "Open {title}" or "Close {title}", focus-visible 2px ring `#0071e3` (dark `#0a84ff`) with 2px offset (black offset in dark mode).
- Escape closes an open photo.

## Acceptance checklist

- Grid shows a 3 × 2 mosaic with 10px gaps, each tile titled.
- Switching to Row, Feature or Pile moves every photo continuously from its current box, never fading or jumping.
- Feature gives the first photo a large 420px panel and stacks five slim tiles on the right.
- Pile stacks tilted 240 × 170 cards in the centre with drop shadows, later cards on top.
- Titles are hidden in Row.
- Clicking a photo fills the stage with it at 24px radius while the others dim to 25%; clicking again or Escape restores it.
- A slight left-to-right stagger is visible on layout changes.
- With `autoplay`, layouts cycle every 2.3s until the first interaction.
