# Morph Cursor

Build a small panel with a pointer that has manners, like the one on an iPad. Inside the panel the system cursor is hidden and replaced by a soft dot. When the dot meets something you can press, it melts into that element's shape and sits behind it as a highlight, while the element leans a few pixels toward your hand. Over a text field it becomes a thin caret. The custom pointer exists only inside the panel; the rest of the page keeps its normal cursor.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.div`, `motion.button`, `useMotionValue`, `useSpring`, `useTransform`).
- File: `components/morph-cursor/morph-cursor.tsx`. Named export `MorphCursor`, plus `MorphCursorIcon`, `MorphCursorCard` types and `DEFAULT_MORPH_ICONS`, `DEFAULT_MORPH_CARDS`.

## API

`MorphCursorIcon = { id: string; label: string; path: string }` (path in a 24×24 viewBox). `MorphCursorCard = { id: string; label: string; gradient: string }`.

- `icons?: MorphCursorIcon[]`, default Home `M3 11l9-7 9 7v9H3z`, Search `M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4`, Favourite `M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z`, Record `M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z`.
- `buttonLabel?: string`, default `"Start a project"`.
- `inputLabel?: string`, default `"Project name"`; `defaultInputValue?: string`, default `"Spring launch, website and email"`.
- `cards?: MorphCursorCard[]`, default Wireframes `linear-gradient(135deg,#5ac8fa,#0a4fd6)` and Brand kit `linear-gradient(135deg,#ffb38a,#ff375f)`.
- `accent?: string`, default `"#0071e3"`: caret, text caret colour and focus rings.
- `onAction?: (id: string) => void`: icon id, `"button"` for the pill, or card id.
- `hint?: string`, default `"Move the pointer around."`; empty hides it.
- `autoplay?: boolean`, default `false`. `className?: string` on the panel.

## Layout and look

- Panel: 320×330 (`max-width: 100%`), radius 26px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`), `overflow: hidden`, `position: relative`, `cursor: none` (also on every button and the input). CSS variables: `--mc-dot: rgba(29,29,31,.85)` (dark `rgba(245,245,247,.85)`), `--mc-hl: rgba(0,0,0,.07)` (dark `rgba(255,255,255,.1)`), `--mc-accent: <accent>`.
- Pointer layer: absolutely positioned, `z-index 0`, non-interactive, `aria-hidden`; left/top/width/height/border-radius from springs (below). Background: `var(--mc-accent)` over the field, `var(--mc-hl)` over any other target, `var(--mc-dot)` otherwise; opacity 1 while inside, else 0; CSS `transition: background .2s, opacity .2s`.
- Content, all `z-index 10`, transparent backgrounds, text `#1d1d1f` (dark `#f5f5f7`):
  - Icon row: 24px side padding, 32px top padding, 8px gap. Each icon button 44×44, radius 12px, 20px stroke icon (stroke 2, round caps and joins).
  - Pill button: 20px below, centred, 44px tall, rounded-full, 24px horizontal padding, 15px medium.
  - Text field: 20px below, 24px side margins, 40px tall, full width, transparent, 15px, no outline, `caret-color: accent`.
  - Cards: 12px below, 24px side margins, 12px gap, each a button `flex: 1`, 64px tall, radius 16px, 12px horizontal padding, 12px gap, left aligned: a 36×36 radius-10 swatch with the card gradient and a 13px medium truncated label.
  - Hint: absolutely at the bottom (12px up), centred, 12px, `#86868b` (dark `#98989d`).

## Motion

- Springs `x, y, w, h, r`, all stiffness 420, damping 32, starting at x 160, y 150, w 14, h 14, r 7. `left = x − w/2`, `top = y − h/2`.
- Lean springs `leanX`, `leanY` (stiffness 300, damping 20) follow plain values set below; applied as `x`/`y` only to the element currently under the pointer.
- `update(x, y)` in panel coordinates: find the first `[data-cursor]` element whose rect, grown by 4px each side, contains the point.
  - Field (`caret`): x = pointer x, y = field centre, w 2.5, h 22, r 2, no lean.
  - Icon, pill or card: pad = 6 for card else 4. `dx = (x − cx) / width`, `dy = (y − cy) / height`. Box centre `(cx + dx·6, cy + dy·6)`, size `(width + 2·pad) × (height + 2·pad)`, radius 14 for icons, 22 for cards, half the padded height for the pill. Lean `(dx·6, dy·6)`.
  - Nothing: back to the 14px dot at the pointer, radius 7, no lean.

## Interaction and states

- Pointer move on the panel: mark touched and call `update` with the local point. Pointer enter shows the pointer; pointer leave hides it once touched.
- Keyboard focus (`:focus-visible`) on any target moves the highlight onto it (the field puts the caret 12px in from its right edge) and shows the pointer.
- Clicking an icon, the pill or a card calls `onAction`.

## Autoplay demo

With `autoplay` the pointer starts visible. Every 800ms move to the next stop, computed from the live layout: each icon 14px right of its centre, the pill 10px below its centre, the field 96px from its left and 16px below its centre, then the cards from last to first at 30% of their width and 6px below centre. A `touched` ref set by the first pointer move or keyboard focus clears the interval for good.

## Accessibility

- Every target is a native `<button>` or `<input>`; icon buttons use `aria-label`, the field uses `inputLabel`.
- Focus rings: `focus-visible` 2px in `accent`.
- The pointer layer is `aria-hidden`; the system cursor is hidden only inside the panel.

## Acceptance checklist

- [ ] Outside the panel the normal cursor shows; inside, only the morphing pointer.
- [ ] Over an icon the pointer becomes a 52×52 rounded square behind it, and the icon leans toward the pointer by up to 3px.
- [ ] Over the pill it becomes a matching capsule; over a card a radius-22 rounded rectangle.
- [ ] Over the field it becomes a 2.5×22 accent caret that follows the pointer horizontally.
- [ ] Autoplay tours all targets every 0.8s and stops for good on first touch.
- [ ] Tabbing through the targets moves the highlight with focus.
- [ ] Fits at 296px wide without horizontal overflow.
- [ ] Dark mode swaps the panel, text, dot and highlight colours.
