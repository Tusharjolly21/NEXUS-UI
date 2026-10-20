# Bento Grid Skeleton

Build a bento section of loading cards, usable as a "why choose us" grid or a real loading state. Each card has a small placeholder scene above a tag, title and line: a chat thread, a bar chart, a team, a workflow, a calendar or code. One band of light sweeps the whole grid at once, as a single sheet rather than per card, and pointing at a card lifts it and plays its scene: bubbles pop in, bars regrow, faces fan out, steps connect, the free calendar slot hops, and lines type themselves out.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[480px]:`, `@min-[760px]:`), framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useReducedMotion`, `layoutId`), React `useId`.
- File: `components/bento-grid-skeleton/bento-grid-skeleton.tsx`, named exports `BentoGridSkeleton` and `DEFAULT_SKELETON_CARDS`, types `BentoGridSkeletonProps`, `BentoSkeletonCard`, `SkeletonType` (`"chat" | "dashboard" | "avatar" | "workflow" | "calendar" | "code"`).

## API

`BentoSkeletonCard`: `{ id: string; title: string; description: string; tag?: string; span?: "1x1" | "2x1" | "1x2" | "2x2"; skeletonType: SkeletonType }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `cards` | `BentoSkeletonCard[]` | one of each scene (below) | Cards in reading order. |
| `animated` | `boolean` | `true` | Run the sweep and scenes. |
| `autoplay` | `boolean` | `false` | Play each scene in turn until touched. |
| `className` | `string` | `""` | Wrapper classes. |

Defaults (all 1x1): Chat "Live conversations" / "Messages stream in while the thread loads."; Stats "Dashboard" / "Bars settle before the numbers arrive."; People "Your team" / "Faces fan out as profiles resolve."; Automation "Workflows" / "Steps light up as each one connects."; Schedule "Calendar" / "The next free slot hops into place."; Dev "Source" / "Lines type themselves out."

## Layout and look

- Wrapper `@container`. Grid (`role="group"`, `aria-busy="true"`, `aria-label="Loading content"`): gap 12px, 1 column, 2 at ≥480px, 3 at ≥760px. Spans apply from 480px. CSS var `--sk-sheen: rgba(255,255,255,.75)` (dark `rgba(255,255,255,.07)`).
- Placeholder fills: `#ececf0` / `#2c2c2e` (B) and `#e1e1e6` / `#3a3a3c` (B2).
- Card `<article>`: focusable, `aria-label="{title}, loading"`, flex column, radius 22px, overflow hidden, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`). Scene area 132px tall (tall cards: min 300px, flex-1). Text area padding 4px 20px 16px: tag rounded-full, `#0071e3/10` (dark `#0a84ff/15`), 11px semibold `#0066cc` / `#64a8ff`, padding 2px 8px; title 14px semibold tracking −0.01em, 6px top; description 12px relaxed grey.
- Shared sheen: each scene has an overlay with `linear-gradient(105deg, transparent 38%, var(--sk-sheen) 50%, transparent 62%)`, `background-size: {gridW·2}px {gridH}px`, no repeat, and `background-position: calc(var(--sk-x) − {cardLeft}px) {−cardTop}px`, where the card offsets come from `offsetLeft/Top` (ResizeObserver) so every card shows its slice of one band.
- Scenes (padding 20px sides, centred):
  - Chat: three rows (other 58%, me 46% reversed, other 38%), each a 20px B2 dot and a 24px bubble radius 12px (other B with 4px bottom-left; me `#0071e3/20`, dark `#0a84ff/30`, 4px bottom-right), gap 8px; then three 6px B2 typing dots indented 28px.
  - Dashboard: three 32px B tiles radius 10px, then seven bars (64px row, gap 6px, radius 5px) at heights 40 62 48 78 56 88 70%, the tallest tinted `#0071e3/35` (dark `#0a84ff/45`).
  - Avatars: five 44px circles stacked at the centre with a 3px white ring (dark `#1c1c1e`), centre B2 and in front, others B; z-index `5 − |i − 2|`, scale centre 1.1 and others `1 − |i−2|·0.06`; below, 96×10px and 64×8px pills.
  - Workflow: SVG 220×92 (max 110px tall) with three nodes at (30,30), (110,62), (190,30): rect 36×28 radius 9 in B with an 18×5 pill `#d2d2d7` / `#48484a`. Connectors `M a C a.x+40,a.y b.x−40,b.y b` drawn dashed (4 4, B2, width 2) with a blue overlay path.
  - Calendar: 7×4 grid of square B cells (radius 5px, gap 4px, max 220px); the free slot is a `#0071e3/35` fill with a 2px `#0071e3/60` ring at −1px inset, radius 6px (dark `#0a84ff/40`, `/70`).
  - Code: five lines with 9px tabular line numbers `#86868b` / `#636366`; 10px-tall pills at widths 46, 64, 38, 56, 28% with indents 0, 12, 24, 12, 0px; line 2 `#bf5af2/30` (dark /45), line 4 `#30d158/30` (dark /40), others B; a 2×14px blue caret after the last line.

## Motion

- Sweep: animate `--sk-x` from `−gridW·2` to `gridW·0.6` px over 2.4s, ease `[0.45, 0, 0.25, 1]`, repeat forever with .5s delay; re-measure grid size with a ResizeObserver.
- Card entrance: `opacity 0, y 16, scale .97` → rest, spring stiffness 300, damping 24, delay `i·0.06`. Active card lifts `y −4` (no delay).
- A shared `beat` counter increments on each activation and every 2200ms while a card is active; scenes key their animations on it so they replay.
- Chat: rows pop from `opacity 0, scale .6` (origin bottom-left, or bottom-right for "me"), spring 320/20, delay `i·0.35`; typing dots bounce `y [0, −4, 0]`, .6s, repeat with .25s pause, delay `1.1 + d·0.12`.
- Dashboard: bar heights switch to the next set (`64 44 80 52 90 60 74`, `52 76 60 42 70 50 92`, cycling) with spring 260/14, delay `i·0.04`.
- Avatars: spacing widens from 22px to 34px (`x = (i−2)·spacing`), spring 300/16, delay `|i−2|·0.05`.
- Workflow: connectors draw `pathLength 0 → 1`, .55s, ease `[0.4, 0, 0.2, 1]`, delay `.15 + i·.6`; nodes pulse scale `[1, 1.18, 1]`, .45s, delay `i·.6 + .1`.
- Calendar: slot hops through cells 9, 17, 12, 24, 4, 19 via a shared `layoutId` (spring 380/22).
- Code: lines grow `scaleX 0 → 1` from the left, .38s, ease `[0.3, 0, 0.2, 1]`, delay `i·0.32`; caret blinks `[1, 0, 1]` every 1s linear (rests at .6).
- Reduced motion or `animated` false: no sweep, no entrance, scenes static.

## Interaction and states

- Pointer enter or focus on a card: mark touched, bump `beat` if it was not already active, make it active. Leave or blur clears it.
- Pointer down on the grid marks it touched.

## Autoplay demo

Unless still: after 700ms activate the first card and bump `beat`, then every 2400ms the next, cycling, until touched.

## Accessibility

- The grid announces itself as busy loading content; each card is focusable with a "{title}, loading" label and a 2px `#0071e3` / `#0a84ff` outline. Sheen and workflow SVG are `aria-hidden`.

## Acceptance checklist

- [ ] One diagonal band of light crosses all cards in a single continuous sweep.
- [ ] Cards rise in one after another.
- [ ] Hovering Chat pops bubbles in turn, then the typing dots bounce.
- [ ] Hovering Dashboard regrows the bars to new heights with a bounce.
- [ ] Avatars fan out, workflow connectors draw node to node, the calendar slot hops, code lines type out.
- [ ] Scenes replay every 2.2s while hovered.
- [ ] Grid goes 1 → 2 → 3 columns by container width.
- [ ] Autoplay walks the cards every 2.4s until touched.
