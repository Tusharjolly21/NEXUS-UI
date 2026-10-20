# Shooting Stars Grid Hero

Build a hero section set on a faint blueprint grid where shooting stars run along the grid lines. At each node they cross they may turn a corner, and every node they pass flashes, pops slightly larger and fades. Move over the section and a soft spotlight follows the pointer while the stars steer toward you at each node. Light mode is airy blue-on-white; dark mode is white and sky blue on deep navy. A centred default hero (badge, heading, paragraph, two buttons, hint) sits on top and can be replaced with your own content.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`), React `useSyncExternalStore`, a `cn` helper. Everything moving is drawn on one `<canvas>` in a `requestAnimationFrame` loop.
- File: `components/shooting-stars-grid/shooting-stars-grid.tsx`, named export `ShootingStarsGrid`, exported type `ShootingStarsGridProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `children` | `ReactNode` | default hero | Content over the grid. |
| `starCount` | `number` | `48` | Twinkling background stars (0–160). |
| `shootingStarCount` | `number` | `6` | Runners at once (0–14). |
| `gridSize` | `number` | `44` | Cell size in px (at least 16). |
| `speed` | `"slow" \| "normal" \| "fast" \| number` | `"normal"` | Duration multiplier; presets 1.3 / 1 / 0.7, numbers clamped to at least 0.35. Higher is slower. |
| `glow` | `boolean` | `true` | Glows round heads, lit nodes and the spotlight. |
| `showGrid` | `boolean` | `true` | Draw grid lines. |
| `showStaticStars` | `boolean` | `true` | Draw twinkling stars. |
| `reducedMotionFallback` | `boolean` | `true` | Under reduced motion, draw one still frame. |
| `interactive` | `boolean` | `true` | Spotlight and steering. |
| `autoplay` | `boolean` | `false` | Steer round a pretend pointer until someone moves over the grid. |
| `className` | `string` | — | Section classes. |
| `contentClassName` | `string` | — | Content wrapper classes. |

## Layout and look

- `<section>`: relative, `isolate`, min-height 480px, full width, overflow hidden, radius 24px, text `#1d1d1f` / `#f5f5f7`. Background `radial-gradient(120% 80% at 50% 0%, #ffffff 0%, #f3f7fd 55%, #eaf1fb 100%)`; dark `#0d1324 → #080b14 → #05070c`. Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Canvas: absolute inset 0, `-z-10`, `aria-hidden`, DPR capped at 2, masked by `radial-gradient(ellipse 85% 80% at 50% 45%, #000 40%, transparent)`.
- Content wrapper: z-10, flex centred, `min-height: inherit`, padding 24px / 64px (40px sides from `sm`).
- Ink colour: light `rgb(0,113,227)`, dark `rgb(125,211,252)`.
- Grid lines: 1px at every multiple of `gridSize`, snapped to half pixels; `rgba(0,113,227,.1)` / `rgba(255,255,255,.07)`.
- Static stars: random positions, radius 0.5–1.6, alpha `0.2 + 0.45·(0.5 + 0.5·sin(t·s + p))` with per-star speed 0.6–2; dark white, light `rgba(29,29,31, a·0.4)`.
- Spotlight: radial gradient radius 200px at the target, ink at .12 (dark .16) to 0.
- Node flash with energy `e` (1 → 0): `pop = 1 + sin((1 − e)·π)·0.6`; glow radial of radius `14·pop`, ink at `e·0.55`; core dot radius `1.6·pop`, light ink / dark white at alpha `e`.
- Runner trail: walk back along recorded points up to `len` px, each segment alpha `k·0.9` and width `1 + k·0.8` where `k = 1 − dist/len`, round caps. Head: 12px glow (ink .6) and a 1.8px dot, `#0071e3` / `#fff`.
- Default hero (max-width 672px, centred): badge (rounded-full, padding 4px 12px, 12px medium, white with `0 0 0 1px rgba(0,0,0,.06)`; dark `white/10` with `rgba(255,255,255,.1)`; 6px dot `#0071e3` / `#64d2ff`) "Motion background"; `<h2>` "Build interfaces that feel alive." 34px (52px `sm`) semibold, line-height 1.03, tracking −0.045em, balanced, margin-top 20px; paragraph "Animated components and templates for modern React apps. Copy them, own them." 15px `#6e6e73` / `#a1a1a6`, max-width 448px; buttons (margin-top 28px, gap 12px, 44px pills, padding 0 20px, 14px): "Browse components" `#0071e3` / `#0a84ff` white semibold, "View templates" white with hairline ring (dark `white/10`); hint "Move over the grid. The stars turn toward you." 12px grey, margin-top 24px.

## Motion

- Loop: `dt = min(0.05s)`; skip work when off screen.
- Seed a mulberry32 PRNG with `stars·31 + runners·997 + gridSize`.
- Spawn: axis horizontal with 62% chance, else vertical; a random interior line; random direction; length 90–210px; start 10px outside the edge; speed `(230 + rand·170)/scale` px/s; wait `rand·3·scale` s on first spawn, `(1.2 + rand·3.8)·scale` s after. Respawn once fully off the far edge (`len + 20` past it).
- Each frame advance `pos += v·dir·dt`. When the head crosses a grid line onto an interior node: flash that node (energy 1, decays 1.1/s) and decide a turn.
  - No target: turn with 22% chance, random new direction.
  - With target: let `across` be the target offset perpendicular to travel, `along` parallel. Turn toward `sign(across)` if `|across| > 0.6g` and `|across| > 0.8|along|` (75% chance); else turn if the target is behind (`|along| > g`, opposite sign) and `|across| > 0.5g`; otherwise go straight.
  - On a turn record the node in the trail, switch axis, and carry the overshoot past the node into the new direction.
- Trail keeps the last 60 points.
- Default hero entrance: `opacity 0, y 16` → rest, spring stiffness 220, damping 22. Buttons `whileTap` scale .95.

## Interaction and states

- `pointermove` sets the target to the local pointer; `pointerleave` clears it (stars wander randomly again).
- Theme follows a `.dark` class on `<html>` via `useSyncExternalStore` + MutationObserver; the loop reads it from a ref.
- Reduced motion with `reducedMotionFallback`: draw a single still frame (no runners visible yet) and redraw on resize or theme change.

## Autoplay demo

With `autoplay`, `interactive` on, and no pointer move yet, the target follows `x = w·(0.5 + 0.32·sin(0.5t))`, `y = h·(0.5 + 0.28·sin(0.8t + 1))`, so the spotlight drifts and the stars chase it. The first real pointer move ends it.

## Accessibility

- Canvas is `aria-hidden`. Default buttons are real links with 2px focus rings (`#0071e3`, dark `#0a84ff`). The default heading is an `<h2>` so a page can keep its own `<h1>`.

## Acceptance checklist

- [ ] Grid is visible but faint and fades to the edges.
- [ ] Several stars run along lines with fading trails and glowing heads.
- [ ] Nodes flash, pop and fade as stars cross them.
- [ ] Some stars turn corners; with the pointer present, most turn toward it.
- [ ] A 200px spotlight follows the pointer.
- [ ] `speed="fast"` is visibly quicker than `"slow"`.
- [ ] Theme switch recolours canvas and surface live.
- [ ] Reduced motion shows a still grid.
