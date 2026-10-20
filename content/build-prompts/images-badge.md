Build an avatar stack badge: a white pill holding a few overlapping faces, slightly tilted like they were placed by hand, a "+N" chip, and an optional label such as "Editing now". Hover or focus it and the pill lifts 2px while the stack fans open along a gentle arc, each face springing into place a beat after the last, extra faces appearing from behind, and the +N count rolling down. A small dark name tag glides from face to face under the pointer (or the arrow keys), with the hovered face lifting and growing. Faces without a picture show initials on a colour picked from the name.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion (`AnimatePresence`, `motion`, `useReducedMotion`, `useSpring`, `useTransform`).
- File: `components/images-badge/images-badge.tsx`, named export `ImagesBadge`, types `ImagesBadgeProps`, `BadgeImage = { src?: string; alt: string; color?: string }`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `images` | `BadgeImage[]` | Ava Chen, Noah Park, Mira Shah, Leo Grant, Zoe Ito, Kai Moss, Sam Reyes | Front first. `alt` is the alt text, tag and initials source. |
| `maxVisible` | `number` | `3` | Faces shown closed (min 1). |
| `revealCount` | `number` | `2` | Extra faces that fan out when open; the rest are counted in +N. |
| `label` | `string` | — | Text after the stack. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Face size and pill height. |
| `shape` | `"circle" \| "rounded" \| "square"` | `"circle"` | Radius 9999px, 32% or 18%. |
| `autoplay` | `boolean` | `false` | Opens and walks the tag along the faces until hovered or focused. |
| `className` | `string` | `""` | Pill classes. |
| `imageClassName` | `string` | `""` | Classes on each face. |
| `onClick` | `() => void` | — | Makes the whole badge a button. |

Sizes (face px, open gap, text, pill): sm 30, 6, 12px, 40px tall with padding 6px left / 14px right and gap 10; md 38, 8, 13px, 48px tall, 5px / 16px, gap 12; lg 50, 10, 15px, 62px tall, 6px / 20px, gap 14.

## Layout and look

- Pill: `inline-flex`, items centred, fully round, white (dark `#1c1c1e`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`), focus ring 2px `#0071e3` (dark `#0a84ff`) with 2px offset; pointer cursor when clickable.
- Face strip: relative, height = face size, animated width. Faces are absolutely positioned at the left, `size × size`, with the shape radius, overflow hidden, a 2.5px white ring (dark `#1c1c1e`). z-index: front face highest (`count − i`), active face 50.
- Images: cover. Initials: up to two capitals, semibold white at `0.36·size`, on `linear-gradient(140deg, c, color-mix(in srgb, c 70%, #000))` where c = `color` or a palette colour from a string hash (`h = h·31 + charCode`, unsigned) over `#0071e3, #bf5af2, #ff9f0a, #30d158, #ff375f, #5ac8fa, #ffd60a, #64d2ff`.
- +N chip: same size and shape, `#f0f0f3` (dark `#2c2c2e`), semibold tabular in the size's text class, same ring, z 0 (behind faces).
- Name tag: dark pill (`#1d1d1f` white text; dark `#f5f5f7` / `#1d1d1f`), padding 4×10, 11px medium, shadow `0 6px 14px -6px rgba(0,0,0,.5)`, centred over the active face.
- Label: medium, tracking −0.01em, nowrap.

## Geometry

- `peek = round(0.5·size)` (closed overlap step). Shown list = first `maxVisible + revealCount`. Hidden-now = total − visible; overflow = total − shown.
- Available room = `innerWidth − 32 − (labelWidth + 16) − 40` (measured on mount and resize). `slots = shown − 1 + (overflow > 0 ? 1 : 0)`. Open step `= max(peek, min(size + gap, floor((room − size)/slots)))` so it squeezes on narrow screens.
- Closed width `size + (visible − 1)·peek + (hiddenNow > 0 ? peek + 6 : 0)`; open width `size + slots·step`.
- Face i: x = `i·step` when open; closed, visible faces at `i·peek` and extra faces tucked at `(visible − 1)·peek`. Arc when open: `y = ((i − mid)/mid)²·size·0.07` (edges dip). Closed tilts by index: 0, −4, 3, −5, 4, −3, 4, −4 degrees.
- Chip x: `shown·step` open, `visible·peek + 6` closed. Count = overflow open, hidden-now closed.

## Motion

- Fan spring: stiffness 340, damping 19, mass 0.8, for the pill lift (y −2 open), strip width, faces and chip.
- Face delays: opening `0.035·i` (front first); closing `0.02·(shown − i)` (back first).
- Extra faces closed: scale 0.6, opacity 0. Active face: lifts `−0.22·size`, scale 1.12.
- Chip hides (scale 0.5, opacity 0) when open with no overflow. The count text is `+{round(n)}` from a spring (200/24), so it rolls between values.
- Tag: enters from `opacity 0, y 6, scale 0.8` to `y = −0.62·size − 14`, spring 420/26, with x following the active face so it glides; exits in 0.12s. The name cross-fades from `blur(3px)` in 0.18s (delay 0.06) on each change.
- Reduced motion: no lift, tilt, arc delay or width change (stays closed width), faces snap.

## Interaction and states

- Mouse/pen enter opens, leave closes and clears the tag. Touch pointer down toggles. Focus opens, blur closes.
- Hovering a face while open makes it active.
- Keys: ArrowRight/ArrowLeft open and move the active face (starting at first/last, clamped); Escape closes; with `onClick`, Enter/Space call it.

## Autoplay demo

Every 650ms step through a cycle of `shown + 3` beats: open; activate each face in turn; clear the tag; close. Hover, focus or touch stops it for good. Demo: eight people, `maxVisible 3`, `revealCount 3`, "Editing now", size lg; plus a second sm rounded badge "12k builders".

## Accessibility

- Root `role="group"` (or `button` with `onClick`), `tabIndex 0`, `aria-expanded`, `aria-label="{label}. {all names}"`. Images have alt text; initials are `role="img"` with the name. The chip and tag are decorative.

## Acceptance checklist

- Closed: three tilted overlapping faces and a +N chip behind them.
- Hover fans faces out along a slight arc, one after another, and lifts the pill.
- Extra faces appear and the +N counts down to the true overflow (or vanishes at zero).
- A name tag follows the hovered face, which lifts and grows.
- Arrow keys walk the tag; Escape closes.
- On narrow screens the fan squeezes instead of overflowing.
- Faces without `src` show coloured initials.
