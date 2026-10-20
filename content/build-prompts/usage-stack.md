# Usage Stack

Build a usage-based pricing calculator where the usage is physical: every 10,000 requests is a rounded block that drops into a bin, coloured by its pricing tier. Slide the volume up and blocks rain in; slide down and the newest pop away, while the monthly price rolls. Apple-clean and tactile.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useTransform`, `useReducedMotion`), and **matter-js** (`import Matter from "matter-js"`) for the blocks.
- File: `components/usage-stack/usage-stack.tsx`, named export `UsageStack`, plus `UsageStackProps`, `UsageTier`, `USAGE_TIERS` and `usagePrice(n)`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `defaultValue` | `number` | `120000` | Starting requests/month, rounded to 10,000, clamped 0–600,000. |
| `onChange` | `(requests: number, price: number) => void` | – | Fires on every volume change with the monthly price in dollars. |
| `autoplay` | `boolean` | `false` | Steps through sample volumes until first interaction. |

Constants: bin `BW = 340`, `BH = 230` physics units; block `S = 29`; `MAX = 600000`; `PER = 10000`.

Tiers (graduated): Free up to 50,000 at $0/1k, `#64d2ff`; Growth up to 250,000 at $0.25/1k, `#0071e3`; Scale above at $0.15/1k, `#5e5ce6`. Price = sum over tiers of `(requests inside tier / 1000) × rate`. The tier of a value is the first tier whose `upTo ≥ n`.

## Layout and look

- Card: 380px wide (`max-width: 100%`), padding 20px, radius 24px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`. `select-none`.
- Header row: left "Usage pricing" 17px semibold, tracking −0.02em, `#1d1d1f` (dark `#f5f5f7`) and "Each block is 10,000 requests." 13px `#6e6e73` (dark `#a1a1a6`). Right: the price, 28px semibold, `leading-none`, tabular numbers, tracking −0.03em, formatted `$1,234`; under it "per month" 12px `#86868b` (dark `#8e8e93`).
- Bin: 16px below, full width, aspect ratio 340/230, radius 16px, `overflow-hidden`, `#f5f5f7` with `inset 0 2px 6px rgba(0,0,0,.07)` (dark `#2c2c2e`, inset alpha .4), cursor grab, `touch-none`. Inside, a 340×230 layer scaled by `binWidth / 340` (ResizeObserver) from the top-left holds the blocks.
- Legend at top-left (12px inset), pointer-events none: one pill per tier, 6px gap, `bg-white/85` (dark `#1c1c1e/85`) with backdrop blur, 11px medium, padding 2px 8px, an 8px swatch (radius 3px). The current tier's label is `#1d1d1f` (dark `#f5f5f7`), others `#86868b` (dark `#8e8e93`).
- Blocks: 29×29 divs, radius 8px, `linear-gradient(160deg, color, color with RGB × 0.72)`, shadow `inset 0 1px 0 rgba(255,255,255,.35), 0 2px 4px rgba(0,0,0,.12)`. Block i (1-based) takes the colour of `tierOf(i × 10000)`.
- Below: "Requests / month" 13px secondary left, value 15px semibold tabular right (`120,000`).
- Slider 12px below, 24px tall. Track 6px pill `#e8e8ed` (dark `#3a3a3c`); three tier bands laid across it at their share of 0–600k, each clipped from the right with `clipPath: inset(0 X% 0 0)` where X is the unfilled part of that band; animate with a spring (400/40). Thumb: 24px white circle, `0 1px 4px rgba(0,0,0,.3), 0 0 0 .5px rgba(0,0,0,.08)`, centred on `left: frac%`, spring (500/38). Tick labels 0 / 200k / 400k / 600k, 11px tabular, `#86868b`.
- Footer strip: 16px below, radius 14px, `#f5f5f7` (dark `#2c2c2e`), padding 10px 14px. Left: a tier pill (12px semibold white on the tier colour, radius full) followed by "tier". Right, 12px secondary: "First 50k are free" at ≤ 50,000, otherwise the blended rate, e.g. `$0.146 per 1k` at 120k (price ÷ thousands, 3 decimals).

## Motion

- Price: `useSpring(price, { stiffness: 140, damping: 22 })`, rendered rounded through `useTransform`.
- Tier pill swaps with `AnimatePresence mode="popLayout"`: enter from y 10 / opacity 0, exit to y −10 / opacity 0.
- Physics: matter engine with gravity y 1. Static walls (friction 0.6): floor centred at `(170, 260)` 680×60; left `(−30, −35)` 60×530; right `(370, −35)` 60×530; ceiling `(170, −330)` 680×60. Blocks: `chamfer radius 7`, restitution 0.2, friction 0.5, density 0.002, random initial angle ±0.4 rad.
- Fixed-step loop: accumulate `min(100, elapsed ms)` and run `Engine.update(e, 1000/60)` up to 4 times per frame; if more than one step remains, drop it. Each frame write each block's `translate(x−14.5, y−14.5) rotate(angle) scale(s)`.
- Spawning: when the volume rises, create the missing blocks but queue them. Each frame release up to 6 queued blocks: try 4 random spots `x = 30 + rand·280`, `y = −40 − rand·220` and place the block at the first spot where `Query.region` (±29 around it) hits no other dynamic body; stop for this frame if none is free. This keeps big jumps from stacking blocks above the ceiling.
- Removing: when the volume drops, remove the newest live blocks from the world and pop them: `g += 1/14` per frame, `scale = 1 + g·0.5`, `opacity = 1 − g`, delete the element at 0. Queued blocks are removed at once.

## Interaction and states

- Slider pointer: capture on down, map x to 0–600k snapped to 10k, follow while dragging, stop on up/cancel.
- Keys on the slider: ArrowRight/ArrowUp +10k, ArrowLeft/ArrowDown −10k, PageUp +50k, PageDown −50k, Home 0, End 600k, clamped; prevent default.
- Bin pointer: find a live block under the pointer (`Query.point`), capture the pointer and attach a `Constraint` (stiffness 0.15, damping 0.1, length 0, offset from the grab point) whose `pointA` follows the pointer in bin units; remove it on up/cancel. Any slider or bin interaction marks the component as touched.
- Pause the loop when the card is off screen (IntersectionObserver) or the tab is hidden; reset the clock on resume. On unmount cancel the frame, disconnect observers, clear the world and engine, and remove the block elements.

## Autoplay demo

Every 2600ms set the volume to the next of 260k, 480k, 90k, 340k, 600k, 150k (looping). Stops permanently once touched; skips ticks while paused off screen; disabled entirely under `prefers-reduced-motion`.

## Accessibility

- Slider: `role="slider"`, `tabIndex 0`, `aria-label="Requests per month"`, `aria-valuemin 0`, `aria-valuemax 600000`, `aria-valuenow`, `aria-valuetext="120,000 requests, Growth tier, $18 per month"` so the price is announced. Focus ring 2px `#0071e3` (dark `#0a84ff`) with 2px offset.
- Bin: `role="img"`, `aria-label="120,000 requests: 12 blocks"`.

## Acceptance checklist

- [ ] Starts at 120,000 with 12 blocks, $18 per month, Growth tier.
- [ ] Jumping from 0 to 600k ends with all 60 blocks inside the bin.
- [ ] Lowering the volume pops the newest blocks with a grow-and-fade.
- [ ] Price rolls with a spring; the blended rate reads correctly (e.g. 600k → $103 and $0.171 per 1k).
- [ ] Blocks can be grabbed and flung, and settle again.
- [ ] Arrow, Page and Home/End keys work and the screen reader hears the price.
- [ ] Autoplay cycles until touched; no autoplay with reduced motion.
- [ ] Loop pauses off screen and on hidden tabs; nothing leaks after unmount.
