# Lattice Feature Grid

Build a features section in a rounded card: an eyebrow and heading above a 2×2 grid of feature tiles separated by 1px hairlines. The hairlines catch a soft blue light that follows the pointer, a fainter wash tints the tiles under it, and the tile you point at plays its small illustration: colour swatches fan out, a spring ball drops and settles on a drawn curve, a focus ring hops between two buttons, and a search result climbs to first place.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[520px]:`, `@min-[560px]:`), framer-motion (`motion`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useReducedMotion`, `layout`, `layoutId`, `whileInView`), React `useId`.
- File: `components/lattice-feature-grid/lattice-feature-grid.tsx`, named export `LatticeFeatures`, types `LatticeFeature`, `LatticeFeaturesProps`, `LatticeVisualProps` (`{ active: boolean }`).

## API

`LatticeFeature`: `{ title: string; body: string; icon?: ComponentType<{ className?: string }>; visual?: ReactNode | ComponentType<{ active: boolean }> }`. A visual given as a component receives `active` while its tile is lit; a node is rendered as is. Missing icons fall back to a spark icon.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `LatticeFeature[]` | four illustrated tiles (below) | Tiles; four fit best. |
| `eyebrow` | `string` | `"Why teams switch"` | Label above the heading. |
| `heading` | `string` | `"Everything a design system should have done for you"` | Empty hides the header. |
| `autoplay` | `boolean` | `false` | Wander the light and play tiles in turn until pointed at. |
| `className` | `string` | `""` | Section classes. |

Default tiles: "Tokens, not hex codes" / "Colour, type and spacing come from one set of variables, so a rebrand is a single file." (palette icon, swatches); "Motion with intent" / "Springs tuned to feel physical: quick to respond, calm to settle, never in the way." (wave icon, spring); "Accessible by default" / "Focus you can see, keyboard paths that make sense and reduced motion honoured everywhere." (focus-frame icon, focus ring); "Ready for search" / "Semantic markup, real headings and a fast first paint, so pages rank as well as they look." (magnifier icon, results). Icons are 16-unit outline paths, stroke 1.6, round caps.

## Layout and look

- `<section>`: `@container`, radius 28px, padding 24px (32px at ≥560px), white / `#1c1c1e`, ink `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`).
- Header (max-width 512px): eyebrow 12px semibold uppercase, tracking .12em, `#0066cc` / `#64a8ff`; `<h2>` 8px below, 26px semibold, line-height 1.1, tracking −0.035em, balanced.
- Lattice: 24px below the header, relative, grid with 1px gap and 1px padding, radius 22px, overflow hidden, background `#e5e5ea` / `#38383a` (this shows through as the hairlines). One column, two at ≥520px. CSS vars `--lat-glow: rgba(0,113,227,.85)` and `--lat-wash: rgba(0,113,227,.06)`; dark `rgba(10,132,255,.9)` and `rgba(10,132,255,.1)`.
- Hairline light: an absolute layer behind the tiles with `radial-gradient(280px circle at Xpx Ypx, var(--lat-glow), transparent 70%)`; since tiles are opaque, it only shows in the 1px gaps.
- Tile: relative, flex column, white / `#1c1c1e`, padding 20px, focusable. Inside: a wash layer `radial-gradient(380px circle at Xpx Ypx, var(--lat-wash), transparent 70%)` using the same lattice coordinates; a 64px-min visual area; a row (16px top, gap 8px) with a 28px icon chip, radius 9px (`#f0f0f3` grey icon, or `#0071e3` / `#0a84ff` with white when active, 200ms colour transition) and an `<h3>` 15px semibold tracking −0.01em; body 13px relaxed `#6e6e73` / `#a1a1a6`, 8px top.
- Footer hint 12px `#86868b` / `#a1a1a6`, 12px below: "Move across the grid; each tile plays its idea."

Default visuals:
- Swatches: six 28×44px chips, radius 8px, colours `#1d1d1f #0071e3 #bf5af2 #ff375f #ff9f0a #30d158`, gap 6px, origin bottom, shadow `inset 0 0 0 1px rgba(255,255,255,.18), 0 6px 12px -8px rgba(0,0,0,.5)`.
- Spring: a 220×64 SVG with a dashed baseline (`M0 52 H220`, dash 3 4, `#d2d2d7` / `#48484a`) and a blue curve `M4 52 C 40 52, 52 6, 84 10 S 116 34, 136 28 S 166 18, 184 22 S 206 24, 216 24`, stroke 2.5 round; a 16px blue ball top-right with shadow `0 6px 12px -4px rgba(0,113,227,.6)`.
- Focus: "Cancel" (`#f0f0f3` / `#2c2c2e`) and "Confirm" (`#1d1d1f` with white, inverted in dark) buttons, radius 10px, padding 6px 12px, 12px medium, plus a "Tab" keycap (radius 6px, 11px medium grey). The focus ring is a 2px blue ring at −4px inset, radius 13px.
- Search: three 11px result rows (rank 10px semibold tabular grey, title truncating): "Pricing · Northwind" (yours, semibold `#0066cc` / `#64a8ff` on blue 10% / 20%), "Plans and pricing", "Buy Globex". Rows radius 8px, padding 3px 8px.

## Motion

- Light position: motion values (start 120, 80) smoothed by springs (stiffness 120, damping 20). Glow opacity is a spring (200/30) toward 1 while the pointer is in the lattice, 0 when it leaves; both light layers use it.
- Tiles enter once in view from `opacity 0, y 12`, spring 240/24, delay `i·0.07`.
- Icon chip scales to 1.08 when active (spring 340/18).
- Swatches when active: for offset `k = i − 2.5`, `rotate k·9°`, `y |k|·4 − 10`, `x k·4`, spring 340/18, stagger 35ms; back to 0 when inactive.
- Spring tile: on activation the curve redraws `pathLength 0 → 1`, 1.1s, ease `[0.22, 1, 0.36, 1]`; the ball drops with keyframes y `[0, 30, 14, 20, 17]`, scaleY `[1, .7, 1.1, .95, 1]`, scaleX `[1, 1.25, .92, 1.04, 1]`, times `[0, .3, .55, .78, 1]`, 1.1s easeOut (squash on landing). Inactive it rests at y 17.
- Focus tile: while active toggle the focused button every 900ms; the ring moves with a shared `layoutId` (spring 340/18). Inactive it rests on Confirm.
- Search tile: inactive order is Plans, Buy, yours; active order puts yours first; rows reorder with `layout` (spring 260/20).
- Reduced motion: no light layers, no entrance, visuals never activate.

## Interaction and states

- Pointer move over the lattice sets the light to the local position; entering marks touched and shows the glow; leaving hides it and clears the active tile.
- Pointer enter or focus on a tile makes it active; blur clears it if it was that tile.

## Autoplay demo

Unless reduced motion, show the glow and move the light every frame along `x = w·(0.5 + 0.4·sin(0.9t))`, `y = h·(0.5 + 0.38·sin(1.3t + 1))`. Activate tile 0 after 400ms, then the next tile every 2400ms, wrapping. Stop when the pointer enters the lattice or a tile gets focus.

## Accessibility

- Tiles are focusable with a 2px inset blue outline (raised above neighbours). Light layers and default visuals are `aria-hidden`. Headings are `<h2>` and `<h3>`.

## Acceptance checklist

- [ ] The hairlines glow blue in a ~280px circle around the pointer and fade out when it leaves.
- [ ] Tiles fade up in sequence when scrolled into view.
- [ ] Hovering the first tile fans the swatches.
- [ ] Hovering the second redraws the curve and drops the ball with a squash.
- [ ] Hovering the third hops the focus ring between the buttons.
- [ ] Hovering the fourth moves "Pricing · Northwind" to first.
- [ ] Tabbing through tiles plays them too.
- [ ] One column below a 520px container.
