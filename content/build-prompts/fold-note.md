Build a printed paper credit note, 300 × 150px, that folds on its centre crease. Grab the right half and drag it left: it turns over in 3D around the crease, darkening as it passes edge-on, and reveals a patterned back with a single word. Let go past halfway and it snaps shut with a bouncy spring; tap it to swing it open again. It should feel tactile, like real paper with a little too much spring in it.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, pan and tap gestures).
- File: `components/fold-note/fold-note.tsx`, named export `FoldNote`, exported `FoldNoteProps`.
- One motion value `angle` in degrees: 0 = open, −180 = folded shut. Everything else derives from it.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Store Credit"` | Small caps heading, top left. |
| `amount` | `string` | `"50"` | Denomination, top right and bottom right. |
| `serial` | `string` | `"NOT LEGAL TENDER · SC 000042"` | Fine print along the bottom. |
| `backLabel` | `string` | `"Thanks"` | Word on the back of the folding half. |
| `onFoldChange` | `(folded: boolean) => void` | – | Called when a settle targets the other state (≤ −90 means folded). |
| `autoplay` | `boolean` | `false` | Folds/unfolds every 2s until the user touches it. |

## Layout and look

- Root: vertical flex, centred, 16px gap. Under the note a hint: "Drag the right half over, or tap it.", 13px, `#86868b` (dark `#8e8e93`).
- Note container: 300 × 150, `position: relative`, `perspective: 900px`, its `y` bound to a lift transform.
- Shadow layer: absolute at left 0, full height, radius 12px, `box-shadow` and `width` bound to transforms (below).
- Left half: absolute, 150px wide. Right half (the flap): absolute at left 150, 150px wide, `transform-origin: 0% 50%`, `transform-style: preserve-3d`, `rotateY = angle`, `touch-action: none`, grab cursor (grabbing while active).
- Each half clips a full 300px-wide print: the left half shows its left side, the right half offsets the print by −150px. Both faces use `backface-visibility: hidden`; corners 12px on the outer side only (`12px 0 0 12px` left, `0 12px 12px 0` right).
- Face background: `radial-gradient(circle at 20% 50%, rgba(255,255,255,.55) 0 18%, transparent 19%), repeating-radial-gradient(circle at 80% 50%, rgba(13,92,74,.10) 0 2px, transparent 2px 7px), linear-gradient(135deg, #d9f0e3, #b7e0c9 55%, #9fd3b8)`.
- Print (all ink `#0d5c4a`):
  - Inner frame inset 8px, radius 8px, 1px border at 30% opacity.
  - Title at left 16, top 12: 11px semibold uppercase, tracking 0.2em.
  - Amount at right 16, top 8: 34px bold, line-height 1, tracking −0.04em.
  - Serial at left 16, bottom 12: 10px, tracking 0.18em, 80% opacity.
  - Seal at left 44, top 42: 64px circle, 2px border at 40%, centred "✦" at 26px.
  - Small amount at right 16, bottom 12: 26px bold, 70% opacity.
- Back face (inside the flap, `rotateY(180deg)`, backface hidden, radius `12px 0 0 12px`): `repeating-linear-gradient(45deg, rgba(13,92,74,.08) 0 2px, transparent 2px 9px), linear-gradient(135deg, #c8e8d6, #a9d9bf)` with the back label centred, 13px semibold uppercase, tracking 0.3em, ink at 70%.
- Shade overlay on the flap: black, radius `0 12px 12px 0`, pointer-events none, opacity bound to a transform.
- Crease: a 1px line at 50%, inset 6px top and bottom, ink at 20%.
- The note is an illustration: keep its greens in dark mode; only the hint text changes.

## Motion

Derived values (linear interpolation over `angle`):

- shade opacity: `[0, −90, −180] → [0, 0.35, 0.1]`
- lift y (px): `[0, −90, −180] → [0, −14, −4]`
- shadow: `[0, −90, −180] → ["0 20px 30px -18px rgba(0,0,0,.35)", "0 40px 50px -24px rgba(0,0,0,.45)", "0 14px 20px -12px rgba(0,0,0,.35)"]`
- shadow width: `[0, −180] → [300, 150]`

Settle: stop any running animation, then `animate(angle, target, { type: "spring", stiffness: 220, damping: 15 })`. This is underdamped, so it overshoots past flat and bounces before resting. Stop the animation on unmount.

Drag: on pan start, remember the current angle. On pan, `angle = clamp(start + (offset.x / 150) · 180 · 0.9, −180, 0)`. On pan end, settle to −180 if `angle < −90` or `velocity.x < −400`, else to 0.

## Interaction and states

- Pointer down on the flap: mark touched, reset a "moved" flag, stop any running spring (so you can catch it mid-bounce).
- Pan sets "moved"; a tap only toggles if nothing moved. Toggle = settle to 0 if `angle < −90`, otherwise to −180.
- Framer's tap gesture already fires on Enter for a focused element, so handle only Space in `onKeyDown` (prevent default, mark touched, toggle). Handling Enter as well would toggle twice.
- Track the folded state in a ref and call `onFoldChange` only when it flips.

## Autoplay demo

Every 2s, alternate settling to −180 and 0, starting with fold. When touched, the interval clears itself.

## Accessibility

- The flap is `role="button"`, `tabIndex={0}`, `aria-label="Fold or unfold the note"`, with a focus-visible 2px ring `#0071e3` (dark `#2997ff`).

## Acceptance checklist

- At rest the note looks like one continuous printed bill with a faint crease.
- Dragging left turns the right half around the crease in perspective; it darkens most when edge-on.
- The note lifts up to 14px at 90° and its shadow deepens, then narrows to half width when shut.
- When folded, the patterned back with the label sits over the left half.
- Releasing past halfway, or flicking left faster than 400px/s, snaps shut with a visible bounce; otherwise it springs open.
- Tapping toggles; dragging does not also toggle.
- Space and Enter each toggle exactly once.
- Autoplay folds and unfolds every 2s and stops after the first touch.
