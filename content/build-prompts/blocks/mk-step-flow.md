# Step Flow

Build a "how it works" process section in a rounded card: a vertical list of numbered steps beside a stacked deck of cards. Picking a step by hover, click or arrow keys slides a grey highlight to it on a spring, unfolds its description, and deals its card to the front of the deck; the card it replaces drops, tilts and tucks under the back. The deck leans gently toward the pointer in 3D. With autoplay, a thin accent progress bar fills under the active step before advancing.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[560px]:`), framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useReducedMotion`, `layoutId`), React `useId`.
- File: `components/step-flow/step-flow.tsx`, named export `StepFlow` (also the default export), types `StepFlowItem` and `StepFlowProps`.

## API

`StepFlowItem`: `{ id?: string; serial?: string; title: string; description?: string; image?: string; imageAlt?: string; accent?: string }`. `serial` defaults to "01", "02"…; `accent` defaults by index to `#0071e3 #bf5af2 #ff9f0a #30d158 #ff375f #5ac8fa`. Without `image`, the card is drawn art in the accent.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `StepFlowItem[]` | 4 steps (below); empty array also falls back | Steps. |
| `defaultStep` | `number` | `0` | Initial step (clamped). |
| `onStepChange` | `(index: number) => void` | — | Fired when the user changes step. |
| `highlightColor` | `string` | — | Highlight background; default `#f5f5f7` / `#2c2c2e`. |
| `autoplay` | `boolean` | `false` | Advance with a progress bar until touched. |
| `autoPlay` | `boolean` | `false` | Older alias. |
| `autoPlayInterval` | `number` | `3200` | ms per step (min 1200). |
| `className` | `string` | `""` | Section classes. |
| `textClassName` | `string` | `""` | Step list column. |
| `imageClassName` | `string` | `""` | Deck column. |

Default steps: 01 "Map the system" / "Turn scattered product ideas into a clear structure your team can build from."; 02 "Shape the interface" / "Compose layouts, components and states in one visual language."; 03 "Refine the motion" / "Add transitions that make every interaction feel responsive and calm."; 04 "Ship the page" / "Package it as reusable React code that is ready for production."

## Layout and look

- `<section>`: `@container`, radius 28px, padding 12px, white / `#1c1c1e`, ink `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`).
- Grid gap 12px. Narrow: deck first, list second. At ≥560px: list left, deck right, columns `minmax(0,1fr) minmax(0,1.05fr)`, stretched.
- Step list (`role="tablist"`, vertical): centred column, gap 4px, padding 4px. Each step button: full width, radius 18px, padding 12px 16px, left-aligned. Row: serial 12px semibold tabular (accent when active, else `#86868b` / `#8e8e93`) and title 19px (22px at ≥560px) semibold, tight leading, tracking −0.025em (grey `#6e6e73` / `#a1a1a6` when inactive), gap 12px, baseline aligned. Active description: indented 34px, 6px top, 13px relaxed grey. Under the list a hint "Hover a step, or use the arrow keys." 12px `#86868b`, padding 0 16px.
- Highlight: absolute, radius 18px, overflow hidden. While autoplaying, a progress track inside it at bottom 8px, inset 16px sides, 3px tall, `black/6` / `white/10`, with an accent fill scaled from the left.
- Deck panel (`role="tabpanel"`): relative, centred, overflow hidden, radius 22px, `#f5f5f7` / `#2c2c2e`, padding 40px top, 24px sides and bottom, min-height 220px (340px at ≥560px), `perspective: 900px`. Deck: 3:2, max-width 320px, `transform-style: preserve-3d`.
- Card: absolute fill, radius 18px, overflow hidden, shadow `0 18px 36px -20px rgba(0,0,0,.55)`, background `linear-gradient(150deg, accent 0%, #1d1d1f 135%)`, origin top centre, z-index `n − depth`. Image (cover) or art. Caption at the bottom over `from-black/45` gradient, padding 16px (40px top): "Step 01" 11px semibold uppercase tracking .14em `white/75`, title 17px semibold tracking −0.02em white.
- Art (SVG 240×160, slice), motif by index mod 4: concentric rings r 70/52/34/16 at (176, 58), stroke white 1.5 with opacity .18 + .12i; a 4×3 grid of 18px rounded squares at x 128 + 24col, y 18 + 24row, white .18 (the sixth .85); six white curves `M100 {30+14i} C 140 {10+14i}, 180 {54+12i}, 250 {24+14i}` at .15 + .1i; five bars (heights 34 56 44 78 96, width 14, x 124 + 22i, bottom at 110), white .22 (last .85). Plus an accent circle r 60 at (40 + 6·motif, 128), opacity .35.

## Motion

- Deck positions by depth `d = (i − active + n) mod n`: `y = −min(d,3)·16`, `scale = 1 − min(d,3)·0.06`, `opacity = d > 2 ? 0 : 1 − d·0.18`, spring stiffness 420, damping 32.
- The previously active card, now at the back (`d = n − 1`), plays keyframes instead: y `[0, 46, target]`, scale `[1, .96, target]`, rotate `[0, −3, 0]`, opacity `[1, 1, target]`, .7s, times `[0, .45, 1]`, ease `[0.3, 0, 0.2, 1]` (drops below, tilts, then tucks behind).
- Highlight moves with a shared `layoutId`, spring stiffness 380, damping 26, mass .9.
- Description: `height 0 → auto` (spring 300/30) with opacity .2s; collapses on exit.
- Deck lean: pointer over the panel sets `rotateY = (x/w − .5)·12°` and `rotateX = −(y/h − .5)·10°`, springs 160/18; leaving resets to 0.
- Autoplay progress: animate 0 → 1 linearly over the interval for each step.
- Reduced motion: instant moves, no leaving keyframes, no lean, no autoplay.

## Interaction and states

- Click a step, or move a real mouse over an inactive step (ignore pointer moves with zero movement so layout shifts under a resting cursor don't select), to select it.
- Keys in the tablist: ArrowDown/ArrowRight next, ArrowUp/ArrowLeft previous (wrapping), Home first, End last; focus follows.
- Any user selection stops autoplay for good. `onStepChange` fires only when the index actually changes.

## Autoplay demo

With `autoplay` (or `autoPlay`), at least two steps and no reduced motion: fill the progress bar over `max(1200, autoPlayInterval)` ms, then advance to the next step (wrapping) and repeat until the user selects a step.

## Accessibility

- Steps are `role="tab"` with `aria-selected`, `aria-controls` the panel and roving `tabIndex`; the panel is `role="tabpanel"`, `aria-labelledby` the active tab, `aria-live="polite"`, with an `sr-only` "Step 2 of 4: Shape the interface". Non-front cards are `aria-hidden`; only the front image gets alt text. Focus outline 2px `#0071e3` / `#0a84ff`.

## Acceptance checklist

- [ ] Hovering a step slides the grey highlight to it and opens its description.
- [ ] The step's card springs to the front; the old front card drops, tilts and tucks to the back.
- [ ] Up to three cards are visible, each 16px higher and 6% smaller.
- [ ] The deck leans toward the pointer.
- [ ] Arrow keys, Home and End change steps and move focus.
- [ ] Autoplay fills an accent bar under the active step, then advances; any user selection stops it.
- [ ] Below a 560px container the deck sits above the list.
