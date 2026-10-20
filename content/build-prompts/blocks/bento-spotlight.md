# Spotlight Bento Grid

Build a product-family bento on a 3-column grid where hovering or focusing a tile brings it forward: it spans the full row, its photo zooms slightly, a stat and description fade in beside a side scrim, and the other tiles reflow around it and dim. On phones it becomes a simple stack. It should feel like an Apple product lineup page: big photos, quiet type, smooth layout springs.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `LayoutGroup`, `AnimatePresence`, `useReducedMotion`, variants, `layout`), Next.js `next/image` with `fill` (allow your image host in the Next config).
- File: `components/blocks/spotlight-bento-grid.tsx`, default export `SpotlightBentoGrid`, plus `SpotlightBentoGridProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Find the one that fits."` | Headline. Empty string hides the whole header. |
| `description` | `string` | `"Four devices, one family. Hover a tile to bring it forward."` | Line under the headline; empty hides it. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg `#f5f5f7` / dark `#000`, padding 56px × 16px, 80px × 24px from `sm`. Content max 64rem (`max-w-5xl`) centred.
- Header (32px bottom margin, 40px from `sm`): H2 32px (44px from `sm`), semibold, leading 1.07, tracking −0.035em, `#1d1d1f` / `#f5f5f7`, balanced. Description 12px below, 17px, leading 1.47, `#6e6e73` / `#a1a1a6`, max 32rem.
- Desktop grid (from `md`): `repeat(3, minmax(0,1fr))`, 16px gap. Each tile sets `grid-column: span N` and CSS `order` from a layout table.
- Default layout (nothing active), by card index: `[span 2, order 0]`, `[1, 1]`, `[1, 2]`, `[2, 3]` → row one: wide + narrow; row two: narrow + wide.
- Active layouts (the active card spans 3; others span 1):
  - card 0 active: spans `[3,1,1,1]`, orders `[0,3,1,2]`
  - card 1 active: spans `[1,3,1,1]`, orders `[1,0,2,3]`
  - card 2 active: spans `[1,1,3,1]`, orders `[0,1,3,2]`
  - card 3 active: spans `[1,1,1,3]`, orders `[1,2,0,3]`
- Desktop tile: height 280px (300px from `lg`), radius 28px, `overflow: hidden`, white with `0 0 0 1px rgba(0,0,0,.05)` (dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08)`). Active adds `0 30px 60px -30px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.12), 0 30px 60px -30px rgba(0,0,0,.9)`); shadow transitions 500ms. Non-active tiles while another is active drop to 55% opacity (500ms).
- Photo layer: absolute fill with placeholder bg `#e8e8ed` / `#2c2c2e`; the image is `object-cover`, `sizes="(max-width: 768px) 100vw, 60vw"`, and fades from 0 to 1 over 700ms once loaded.
- Scrims, both fading from the tile colour (`white` / `#1c1c1e`) over 500ms:
  - Top scrim (visible when not active): top 68% height, `from-white via-white/85 to-transparent`.
  - Side scrim (visible when active): left 72% width, `from-white via-white/90 to-transparent`.
- Copy block, absolute top, padding 24px (28px from `lg`): tag 13px medium muted; title 4px below, 24px semibold, leading 1.1, tracking −0.025em. When active, a detail block (max 44% wide) adds, 20px below, a stat line — value 40px semibold tabular, unit 20px, label 13px regular muted, baseline-aligned, tracking −0.04em — and 16px below a 15px, leading 1.47 muted description.
- Mobile (below `md`): a 12px-gap column of 360px-tall tiles, radius 28px, with the photo, a top scrim covering 78% (`via-white/90`), and the full copy always visible (stat 16px below the title, description 12px below the stat).

## Motion

- Section: `whileInView` once (margin −80px), header and both grids stagger children 0.07s. Rise: from `opacity 0, y 16, blur(6px)`, spring 240 / 30; reduced: 0.4s fade.
- Layout spring: stiffness 230, damping 30, used for each tile's `layout` reflow, the photo layer's `layout`, the photo zoom (`scale 1.04` when active), and the copy block's `layout="position"`.
- Set `borderRadius: 28` in the tile's inline style so framer-motion corrects corner distortion during layout animation.
- Detail block: enters from `opacity 0, y 10, blur(6px)` with spring 420 / 34 after 0.08s; exits to `y 6, blur(4px)` in 0.15s.
- Wrap the desktop grid in a `LayoutGroup` with a per-instance id so several grids on a page don't interfere.

## Interaction and states

- `activeIdx: number | null`. Hover start or focus on a tile sets it; hover end or blur clears it only if it is still that tile; leaving the whole grid clears it.
- With reduced motion, the layout never changes (default layout always), the zoom is skipped, and the detail block simply fades.

## Demo data

| Tag | Title | Stat | Description | Alt |
|---|---|---|---|---|
| Laptop | Atlas 16 | 22 hrs battery life | "A 16-inch workstation with a silent fan curve and a display calibrated for colour work." | "A 16-inch laptop on a desk" |
| Phone | Pocket Pro | 48 MP main camera | "Brushed aluminium and a three-lens camera that holds detail from midday sun to candlelight." | "A phone held in one hand" |
| Laptop | Atlas Air 13 | 11 mm thin | "No fan at all, and a battery that lasts a full working day with change to spare." | "A thin laptop, half open" |
| Tablet | Slate 11 | 9 ms pen latency | "A matte, paper-like screen and a stylus that charges when it snaps to the side." | "A tablet with a stylus" |

Use four product photos (a pro laptop, a phone in hand, a thin laptop, a tablet with stylus).

## Accessibility

- Desktop tiles are `tabIndex={0}`, `role="group"`, `aria-label="{title}, {tag lowercased}"`, with a 2px `#0071e3` focus outline offset 2px; focusing a tile spotlights it exactly like hover.
- Images carry meaningful `alt`; scrims are `aria-hidden` and `pointer-events: none`.
- The mobile stack uses `article` elements with all content visible, so nothing depends on hover.

## Acceptance checklist

- [ ] Default desktop layout: wide + narrow on row one, narrow + wide on row two.
- [ ] Hovering any tile makes it span all three columns while the others reflow smoothly beneath or above it.
- [ ] The active photo zooms to 1.04 and the top scrim swaps for a left scrim.
- [ ] The stat and description fade up with a short blur after ~80ms.
- [ ] Other tiles dim to 55% while one is active.
- [ ] Tabbing through tiles drives the same spotlight.
- [ ] Leaving the grid returns to the default layout.
- [ ] Below `md`, tiles stack at 360px tall with all copy visible.
- [ ] Empty `title` removes the header entirely.
- [ ] Reduced motion keeps the default layout and avoids zoom/blur.
