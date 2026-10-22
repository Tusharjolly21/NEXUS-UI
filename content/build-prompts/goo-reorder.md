# Goo Reorder

Build a drag-to-reorder list made of ink. Each row is a dark pill; when you drag one, it stays joined to its neighbours by a liquid neck that stretches as it leaves and pinches off as it lands. The goo comes from one SVG filter on the whole list, and the text and badges are composited back on top so they stay crisp. The feel is tactile and fluid, with tight, quick springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`Reorder.Group`, `Reorder.Item`).
- File: `components/goo-reorder/goo-reorder.tsx`. Named export `GooReorder`, plus the `GooReorderItem` type and a `DEFAULT_GOO_ITEMS` array.

## API

`GooReorderItem = { id: string; label: string; color: string }` (`color` tints the numbered badge).

`GooReorder` props:

- `items?: GooReorderItem[]`: starting order. Default:
  - Draft the brief, `#ff9f0a`
  - Review with design, `#5ac8fa`
  - Ship to beta, `#30d158`
  - Write the changelog, `#bf5af2`
  - Announce it, `#ff375f`
- `onReorder?: (items: GooReorderItem[]) => void`: called with the new order after a drag or a keyboard move (not for autoplay shuffles).
- `autoplay?: boolean`, default `false`.

The list keeps its own order in state, seeded from `items`.

## Layout and look

- Root: column, centred, 12px gap.
- Filter: a zero-size, absolutely positioned SVG holding a `<filter>` with a per-instance id (`useId`, colons stripped):
  1. `feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur"`
  2. `feColorMatrix in="blur"` matrix `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8`, `result="goo"` (alpha × 20 − 8: the blur is thresholded into a hard-edged blob, so rows close together merge)
  3. `feComposite in="SourceGraphic" in2="goo" operator="atop"`, which paints the sharp original only where the goo exists, keeping text crisp.
- List (`Reorder.Group`, `axis="y"`): a 280px-wide flex column with a 10px gap, no list style, no margin or padding, `style={{ filter: url(#id) }}`.
- Row (`Reorder.Item`): 48px tall, radius 24px (a full pill), 16px horizontal padding, 12px gap, 14px medium white text, `user-select: none`, `cursor: grab` (`grabbing` while active). Background `#1d1d1f`; in dark mode `#3a3a3c` so it reads on a black page.
- Row content, left to right:
  - Badge: a 24×24 circle filled with the item colour showing its 1-based position, 11px bold `#1d1d1f`.
  - Label, filling the remaining space and truncating.
  - Grip: a 14×14 icon (viewBox 24) of six dots, r 1.6, at x 9 and 15 and y 6, 12 and 18, `currentColor` at 50% opacity.
- Hint under the list: "Drag a row up or down.", 13px, `#86868b` (dark `#98989d`).

## Motion

- Reordering uses framer-motion's `Reorder`: while you drag a row past a neighbour, the list order updates and the other rows animate to their new slots.
- Every row uses a spring with stiffness 420 and damping 30 for its layout moves.
- The dragged row scales to 1.06 (`whileDrag`).
- The goo neck is not animated directly. It comes from the filter: with a 10px gap and blur 7, rows that are still or far apart stay separate pills, but a row that is moving across a gap passes close enough to its neighbours that their blurred alpha overlaps above the threshold, so a liquid bridge forms, stretches and then pinches off when the distance grows. Keep the gap, blur and matrix values exact, or the effect either never shows or merges everything.
- Badge numbers come from the current index, so they renumber as rows move.

## Interaction and states

- Pointer: press and drag a row vertically; release to drop. `onReorder` from `Reorder.Group` sets the new order and calls the `onReorder` prop.
- Keyboard: each row has `tabIndex 0`. With a row focused, ArrowUp moves it up one place and ArrowDown moves it down one place (ignored at the ends), preventing the default scroll. Focus stays on the moved row because it keeps its key. Call `onReorder` with the new order.
- Focus ring: `focus-visible` 2px **inset** ring `#0a84ff`, no outline. It must be inset, because anything drawn outside the row is clipped by the goo filter.

## Autoplay demo

With `autoplay`, every 1600ms swap two random rows: draw two random numbers before calling the state setter (keep the updater pure), pick `a = floor(r1 · n)`, `b = floor(r2 · n)`, and if `b === a` use `b = (a + 2) mod n`. Skip lists shorter than 2. The rows travel past each other through the goo, showing the neck. Pointer down anywhere on the root or a keyboard move sets a `touched` ref; the next tick clears the interval for good. Clear it on unmount.

## Accessibility

- The group has `aria-label="Reorderable list"`.
- Each row has `aria-label` = `"{label}, position {i + 1} of {n}. Use the up and down arrow keys to move."`.
- The filter SVG and grip icon are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Picking a row up plays `lift` at 70% volume (a short airy rise: noise sweeping 800 to 2400 Hz over 80ms with a faint sine rising from 300 to 520 Hz) and letting it go plays `drop` at 70% (a sine falling from 380 to 120 Hz over 80ms with a small noise thud). Each time the dragged row passes a neighbour and the order changes it plays `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 40% volume. Moving a row with the up and down arrow keys plays `drop` at 60%. The autoplay swaps make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Five dark pills, 280px wide and 48px tall, with 10px gaps and coloured numbered badges.
- [ ] At rest the pills look separate with crisp text and edges.
- [ ] Dragging a row scales it to 1.06, and liquid necks connect it to nearby rows, stretch and snap as it moves.
- [ ] Other rows spring into place quickly (stiffness 420, damping 30) and badges renumber.
- [ ] Text, badges and grip stay sharp throughout; only the silhouettes go gooey.
- [ ] ArrowUp and ArrowDown move the focused row and keep focus on it; the focus ring is visible inside the pill.
- [ ] `onReorder` fires after drags and keyboard moves, not for autoplay swaps.
- [ ] Autoplay swaps two rows every 1.6s and stops for good on the first pointer down or key move.
- [ ] In dark mode the rows are `#3a3a3c` and the hint is `#98989d`.
