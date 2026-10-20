# Component Layers

Build a "how it's made" view of a small music-player card. In its assembled state it is just the finished card. Switch to Explode and the card tips back into an isometric view and peels apart into four stacked sheets (surface, spacing, layout, content), each with a thin leader line and a label. Switch back and the sheets drop together and the card turns face-on again. The feel is a calm, springy design-tool diagram.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `layoutId`). Real CSS 3D (`perspective`, `transform-style: preserve-3d`, translateZ); no canvas or 3D library.
- File: `components/component-layers/component-layers.tsx`, named export `ComponentLayers`. Also export the `ComponentLayer` type (`{ name, note, render: (accent) => ReactNode, card?: boolean }`) and the `COMPONENT_LAYERS` array.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `"#0071e3"` | Used in the cover-art gradient and for the hovered layer's outline and leader line. |
| `autoplay` | `boolean` | `false` | Explodes and assembles on a loop until the user uses the toggle. |

## Layout and look

Root: centred column, gap 24px. Theme variables on the root (light / dark via `dark:` on a `.dark` ancestor): `--cl-line` `#aeaeb2` / `#636366`, `--cl-ring` `rgba(0,0,0,.12)` / `rgba(255,255,255,.18)`, `--cl-sheet` `rgba(255,255,255,.55)` / `rgba(44,44,46,.55)`.

Stage: 440 × 330px (max-width 100%), content centred, `perspective: 1400px`. Inside, a 260 × 168px group with `preserve-3d`, holding four absolutely stacked layers (each also `preserve-3d`), bottom to top:

1. **Surface** (note "radius 20 · shadow", the base card): radius 20px, `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 30px 40px -20px rgba(0,0,0,.35)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08), 0 30px 40px -20px rgba(0,0,0,.8)`.
2. **Spacing** ("padding 16 · gap 12"): hatched bands using `repeating-linear-gradient(45deg, rgba(255,55,95,.22) 0 2px, transparent 2px 6px)`: a 16px band along the top and bottom, 16px bands on left and right between them, and a 12 × 56px band at left 72px, top 16px (the gap beside the art). Labels "16" at (18px, 4px) and "12" at (70px, 78px), 8px semibold `#ff375f`.
3. **Layout** ("auto layout · 3 rows"): the player's structure as dashed boxes (`rounded-md`, 1px dashed `#0071e3` at 60% with `#0071e3` at 6% fill; dark `#0a84ff` at 70% / 12%). Padding 16px, column with space-between: top row (gap 12px) a 56 × 56 box plus a column (gap 6px) of 112 × 16 and 80 × 12 boxes; bottom (gap 6px) a full-width 8px bar, then a row of 28 × 12, 96 × 20, 28 × 12 boxes, spaced between.
4. **Content** ("type · art · controls"), the real player at padding 16px: a 56px cover (radius 12px, `linear-gradient(140deg, #ff9f0a, #ff375f 55%, accent)`), then "Night Drive" 15px semibold, tracking −0.01em, `#1d1d1f` / `#f5f5f7`, and "Coastal Lines" 12px `#86868b` / `#98989d`. At the bottom, a 4px progress track `#e8e8ed` / `#3a3a3c` filled 42% with `#1d1d1f` / `#f5f5f7`; below it "1:24" and "-2:51" at 10px tabular-nums grey, with previous (16px), pause (20px) and next (16px) icons between them, 16px apart.

Each layer's content sits inside a 20px-radius sheet with `transition: background-color, box-shadow 300ms ease-out`. When exploded, every layer except Surface gets background `--cl-sheet` and a 1px ring of `--cl-ring` (or `accent` while hovered). When assembled, sheets are transparent with no ring.

Labels: attached at the layer's top-right (`left: 100%, top: 0`), no pointer events. A 40px × 1px leader line (`--cl-line`, `accent` when hovered), then 6px later a card: radius 8px, `px-2 py-1`, white (dark `#2c2c2e`), ring 1px `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`), with the name at 11px semibold and the note at 9px grey, no wrapping.

Toggle below the stage: a segmented control, `grid-cols-2`, radius 12px, padding 3px, background `#e8e8ed` (dark `#3a3a3c`). Buttons "Assemble" and "Explode": 32px tall, `px-5`, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`. The selected one has a sliding white pill (dark `#636366`) with shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, shared via `layoutId` (namespace it with `useId` so several instances don't collide).

## Motion

- **Group tilt**: exploded `rotateX 58°, rotateZ −38°, y 34px`; assembled all 0. Spring `stiffness 120, damping 18`.
- **Layer separation**: layer i moves to `z = i × 62px` when exploded, 0 when assembled. Spring `stiffness 140, damping 18`. Delay when exploding `0.15 + i × 0.07s` (bottom first, after the tilt starts); when assembling `(4 − i) × 0.04s` (top layer first).
- **Layer opacity**: Surface and Content are always 1. Spacing and Layout are 1 only when exploded, 0 when assembled, on the same spring and delay, so the assembled card shows only the finished design.
- **Labels**: opacity 0 → 1 and `x −10 → 0` when exploding, with delay `0.45 + i × 0.07s` and framer's default transition; they hide immediately (no delay) when assembling.
- **Hover**: outline and leader line colour cross-fade to `accent` over 300ms.
- **Segment pill**: `layoutId` spring `stiffness 420, damping 32`.
- Use `initial={false}` everywhere so nothing animates on mount.

## Interaction and states

- State: `open` (boolean) and `hover` (layer index or null). Pointer enter/leave on each layer sets and clears the hover.
- Clicking a toggle button marks the component touched and sets `open` to that button's value; clicking the active one does nothing visible.

## Autoplay demo

When `autoplay` is true, explode 900ms after mount, then toggle `open` every 3400ms. Both are skipped once the user has clicked a toggle button.

## Accessibility

- Toggle wrapper: `role="group"`, `aria-label="View"`. Each button is `type="button"` with `aria-pressed` and a 2px focus-visible outline `#0071e3` (dark `#0a84ff`).
- Decorative SVG icons are `aria-hidden`.

## Acceptance checklist

- Assembled, the component looks like a single finished player card with no outlines or hatching.
- Explode tilts the card into an isometric view and four sheets rise 62px apart, bottom first.
- Each sheet's label and leader line fade and slide in after the sheet has moved.
- Hovering a sheet turns its outline and leader line `accent`.
- Assemble collapses the stack top-down and the labels vanish at once.
- The segmented pill slides between Assemble and Explode.
- Changing `accent` updates the cover gradient and hover colour.
- With `autoplay`, it alternates every 3.4s until the toggle is used.
