# Folder Peek

Build a coloured folder card that tips its front panel open in 3D on hover or focus, so three files tucked inside (a document, a photo and a chart) fan up out of it and show what is there. The feel is a soft, physical macOS-style folder: springy, slightly bouncy, staggered.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`).
- File: `components/folder-peek/folder-peek.tsx`, named export `FolderPeek`, plus exported `FolderPeekProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Brand assets"` | Folder name on the front panel. |
| `meta` | `string` | `"24 files · Updated today"` | Line under the name. |
| `color` | `string` | `"#0071e3"` | Folder colour; the back panel and tab use the same colour with `filter: brightness(.82)`. |
| `autoplay` | `boolean` | `false` | Opens and closes by itself until someone hovers it. |

## Layout and look

- Root: column, items centred, 20px gap, 64px top padding (room for the fanned files). Under the folder a caption "Hover or focus to peek inside." in 13px `#86868b` (dark `#98989d`).
- The folder is a `motion.button`, 210×150, radius 18px, `position: relative`, `perspective: 800px`. Layers in paint order:
  1. **Back panel**: fills the button, radius 18px but square top-left corner, background `color` with `brightness(.82)`.
  2. **Tab**: 80px wide, 24px tall, sitting 12px above the top-left edge (`-top-3 left-0`), top corners 12px, same darker colour.
  3. **Three files**: each 112×120, radius 10px, white, `overflow-hidden`, shadow `0 6px 18px -8px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.05)`. Anchored at top 12px, horizontally centred (`left: 50%; margin-left: -56px`), then offset by motion values.
     - Doc: 12px padding, column with 6px gap; a heading bar 48×8 `#1d1d1f` rounded, then five 6px-tall `#e8e8ed` bars at widths 90%, 75%, 85%, 60%, 80%.
     - Photo: full bleed `radial-gradient(80% 70% at 30% 30%, #ffd1a8, rgba(255,209,168,0) 60%), linear-gradient(160deg, #89b4f8, #c3a6ff)`.
     - Chart: 12px padding, bottom-aligned bars with 6px gap, flex-1 each, `#34c759`, 3px top radius, heights 40%, 65%, 50%, 85%, 70%, opacity `0.45 + i·0.12`.
  4. **Front panel**: bottom-anchored, full width, 118px tall, radius 18px, background `color`, inset highlight `inset 0 1px 0 rgba(255,255,255,.3)`, 16px padding, content at the bottom-left: title 15px semibold white, tracking −0.01em; meta 12px white at 90%. `transform-origin: 50% 100%` (hinges at the bottom edge).

The files' rest positions keep their tops peeking above the front panel.

## Motion

- **File positions** (x, y in px, rotate in degrees):

| File | Rest | Open |
| --- | --- | --- |
| Doc | x −14, y 18, rotate −4 | x −74, y −70, rotate −14 |
| Photo | x 0, y 12, rotate 0 | x 0, y −92, rotate 2 |
| Chart | x 14, y 18, rotate 4 | x 74, y −66, rotate 15 |

  Spring stiffness 260, damping 20 (a little overshoot). Stagger: when opening, delay `i·0.04s` (doc, photo, chart); when closing, delay `(2 − i)·0.03s` (reverse order). `initial={false}`.
- **Front panel**: `rotateX` 0 → −28° and `y` 0 → 2 when open, spring stiffness 260, damping 22. It tips toward the viewer around its bottom hinge.
- **Press**: `whileTap { scale: 0.97 }`.

## Interaction and states

- One boolean `open`.
- Pointer enter: open, mark hovering and touched. Pointer leave: close, clear hovering.
- Focus opens, blur closes (keyboard users get the same peek).
- Click toggles open and marks touched (useful on touch screens where there is no hover).

## Autoplay demo

With `autoplay`, every 1800ms toggle `open`, skipping ticks while the pointer is over the folder or once it has been touched. Hovering it once stops the loop for good (it keeps the interval but every tick returns early). Clear on unmount.

## Accessibility

- Native `button type="button"` with `aria-expanded={open}` and `aria-label="{title}, {meta}"`.
- Focus-visible: 2px `#0071e3` outline with 4px offset.
- File previews are decorative content inside the button.

## Acceptance checklist

- [ ] At rest the folder shows a darker back panel and tab with three file tops peeking over the front.
- [ ] Hovering tips the front panel backward around its bottom edge by 28°.
- [ ] Files fan out up-left, straight up and up-right with the listed offsets and rotations, staggered left to right.
- [ ] Closing reverses the stagger (chart first) and settles with a small bounce.
- [ ] Tabbing to the folder opens it; tabbing away closes it.
- [ ] Clicking toggles it on touch devices.
- [ ] Changing `color` recolours the folder, with the back always a shade darker.
- [ ] Autoplay opens and closes every 1.8s and stops after the first hover.
