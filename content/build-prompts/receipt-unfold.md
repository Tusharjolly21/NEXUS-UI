# Receipt Unfold

Build a settings-style row labelled "Get invoice". Press it and a folded paper slip rises out from behind the row, then unfolds upward panel by panel like a real receipt: first the line items, then the header. Once it is fully open, the total gets circled by hand in red. Press again and it folds back up in reverse and sinks behind the row. The feel is papery and physical, with springy 3D hinges.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `pathLength`).
- Real CSS 3D: `perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden`, nested hinged panels.
- File: `components/receipt-unfold/receipt-unfold.tsx`, named export `ReceiptUnfold`. Also export the type `ReceiptLine` (`{ label: string; amount: string }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `lines` | `ReceiptLine[]` | 4 sample items | Line items on the middle panel. |
| `total` | `string` | `"$49.68"` | Total on the bottom panel; circled once the slip is fully open. |
| `autoplay` | `boolean` | `false` | Opens and folds by itself until the user presses the row. |

Default lines: "Pro plan · October" $18.00, "Extra seats × 3" $24.00, "Storage add-on" $4.00, "Tax" $3.68.

## Layout and look

Root: centred column with `perspective: 1200px`. It contains the slip area (280px wide, `3 × 104 + 10 = 322px` tall, relative) and, directly below, the row button.

**Panel** (shared style): 280 × 104px, absolutely filling its parent, overflow hidden, `px-5`, background `#fffdf8` (dark `#2c2c2e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 14px 24px -14px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.07), 0 14px 24px -14px rgba(0,0,0,.7)`), `backface-visibility: hidden`.

**Slip structure** (all `preserve-3d`):

1. **Slip root / bottom panel**, pinned to the bottom of the slip area. Bottom corners radius 6px, 1px dashed top border `#e3dccb` (dark `#48484a`), content vertically centred with 6px gap:
   - Row: "Total" and `{total}` (tabular-nums), 13px semibold, `#1d1d1f` / `#f5f5f7`, space-between.
   - "Paid with Visa ending 4242 · Oct 19" at 11px `#86868b` (dark `#8e8e93`).
   - Over the total, a 76 × 34 SVG offset −12px left, −10px top, `overflow: visible`, path `M8 18 C 6 6, 64 2, 70 14 C 75 26, 20 34, 6 24 C 0 19, 10 10, 22 9`, stroke `#ff3b30` (dark `#ff453a`), width 1.8, round caps, no fill: a loose hand-drawn loop that overshoots its start.
2. **Middle panel**, a child of the bottom panel, positioned `bottom: 104px` with `transform-origin` at its bottom edge (`originY: 1`), so its hinge is the top edge of the bottom panel. Content: the lines, vertically centred with 8px gap, each a space-between row at 12px, `#424245` (dark `#a1a1a6`), amounts tabular-nums. Behind it, a back face `#f1ece0` (dark `#3a3a3c`) with `transform: rotateX(180deg)` and hidden backface, so the folded panel shows the paper's back.
3. **Top panel**, a child of the middle panel, positioned and hinged the same way on the middle panel's top edge. Top corners radius 6px. Content bottom-aligned, `pb-3`, gap 4px: "Invoice #2026-1019" (10px semibold uppercase, tracking 0.16em, grey), "Northwind Studio" (18px semibold, tracking −0.02em, `#1d1d1f` / `#f5f5f7`), "Billed to Alex Rivera" (11px grey). Same back face, with top corners rounded.

**Row button**: `z-index` above the slip, 320 × 56px, radius 16px, white (dark `#1c1c1e`), `px-4`, gap 12px, shadow `0 0 0 1px rgba(0,0,0,.06), 0 10px 30px -18px rgba(0,0,0,.3)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 10px 30px -18px rgba(0,0,0,.8)`). Contents: a 32px green tile (radius 8px, `#34c759`, dark `#30d158`) with a white 16px receipt icon (stroke 2.2); the label at 15px medium filling the space; a 14px grey chevron (stroke 2.6, `#86868b` / `#8e8e93`).

## Motion

The animation is a four-step sequence on a `stage` number: 0 closed, 1 risen, 2 first fold open, 3 fully open.

- **Opening**: stage 1 immediately, 2 at 380ms, 3 at 760ms.
- **Closing**: stage 2 immediately, 1 at 260ms, 0 at 520ms.
- Each new run clears the previous run's timers first, so rapid presses never desync.

Per stage:

- **Rise**: the slip root is at `y: −6px, opacity 1` for stage ≥ 1, otherwise `y: 114px, opacity 0` (hidden below, behind the row). Spring `stiffness 220, damping 24`.
- **Middle hinge**: `rotateX: 0` for stage ≥ 2, otherwise `−178°` (folded down flat onto the bottom panel; 178 rather than 180 keeps the fold direction unambiguous). Spring `stiffness 140, damping 17`.
- **Top hinge**: `rotateX: 0` for stage 3, otherwise `−178°`, same spring. Because it is nested in the middle panel, it rides along while the middle unfolds, then unfolds itself.
- **Hand circle**: at stage 3, `pathLength 0 → 1` and opacity 0 → 1 over 0.6s with ease `[0.65, 0, 0.35, 1]` after a 0.45s delay; leaving stage 3 it erases immediately (no delay).
- **Row label**: `AnimatePresence mode="popLayout" initial={false}`, keyed by open state, swaps "Get invoice" / "Hide invoice": enter from `y 12, opacity 0`, exit to `y −12, opacity 0`.
- **Chevron**: rotates to −90° (pointing up) when open.
- **Row press**: `whileTap` scale 0.98.
- `initial={false}` on the slip and hinges.

## Interaction and states

- `open` boolean plus `stage`. The row toggles `open` and runs the sequence; it also marks the component touched.
- Clear pending timers on unmount.

## Autoplay demo

Open 800ms after mount, then toggle every 4200ms. Both are skipped once the user has pressed the row.

## Accessibility

- The row is a `<button type="button">` with `aria-expanded`, a 2px focus-visible outline with 2px offset, `#0071e3` (dark `#0a84ff`).
- Decorative SVGs (icon, chevron, circle) are `aria-hidden`. All receipt text is real text.

## Acceptance checklist

- Closed, only the row is visible.
- Pressing it raises a single folded slip from behind the row, then the line items swing up on a hinge, then the invoice header swings up on top.
- While a panel is mid-fold, its back shows a slightly darker paper colour.
- After the header lands, a red hand-drawn loop draws around the total.
- Pressing again erases the loop, folds the header then the items back down, and the slip sinks behind the row.
- The row label rolls between "Get invoice" and "Hide invoice" and the chevron turns up.
- Double-clicking quickly never leaves panels in a mismatched state.
- With `autoplay`, it opens at 0.8s and toggles every 4.2s until the row is pressed.
