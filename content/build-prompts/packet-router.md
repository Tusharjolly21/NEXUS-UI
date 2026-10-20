# Packet Router

Build a live diagram of an AI request router: glowing packets stream from a "Router" node along curved paths to four model cards. A segmented control switches the routing strategy (Cost, Balanced, Quality) and the traffic re-balances on the fly: packets pick routes by weight, unused routes fade to dashed grey lines, and each model's share and the blended price roll to their new values. The feel is calm, precise and Apple-like, with a steady particle flow.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`), an SVG for the routes and a 2D `<canvas>` for the packets.
- File: `components/packet-router/packet-router.tsx`, named export `PacketRouter`, plus the types `RouterStrategy` (`"Cost" | "Balanced" | "Quality"`) and `RouterModel`.

## API

- `defaultStrategy?: RouterStrategy`, default `"Balanced"`.
- `onStrategyChange?: (strategy: RouterStrategy) => void`: called when the user picks a strategy.
- `autoplay?: boolean`, default `false`.

Data (fixed):

- Models (`id, name, price per 1M tokens, color`): Nano 0.1 `#30d158`, Mini 0.6 `#64d2ff`, Pro 3 `#0071e3`, Ultra 15 `#5e5ce6`.
- Shares (% per model, same order): Cost `[70, 30, 0, 0]`, Balanced `[25, 40, 30, 5]`, Quality `[0, 10, 55, 35]`.
- Blended price = Σ share/100 · price, shown with two decimals (Balanced = $1.92).

## Layout and look

Geometry in a fixed 760×260 box: source `(110, 130)`, destinations at `x = 560`, `y = 44, 104, 164, 224`. Route i is a cubic Bézier: `M 110 130 C 270 130, 360 yᵢ, 560 yᵢ`.

- Root: full-width column, centred, 16px gap. Outer wrapper `max-width 760px`, `overflow-x: auto`; inner box exactly 760×260, relative.
- SVG (760×260, `aria-hidden`) with one path per route, no fill, round caps. Canvas on top, same size, `pointer-events: none`.
- Router node: 96×56 at `left 14, top 102` (right edge touches the source point), radius 16px, `#1d1d1f`, white text, shadow `0 14px 28px -14px rgba(0,0,0,.5)`; dark `#2c2c2e` with a `rgba(255,255,255,.08)` 1px ring. "Router" 12px semibold over the current strategy name, 10px `tabular-nums`, 60% white, in a 16px-tall clipped slot.
- Model cards: 180×44 at `left 566`, vertically centred on each `yᵢ`, radius 12px, padding-x 12px, 10px gap. Light: white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 8px 20px -14px rgba(0,0,0,.35)`; dark `#1c1c1e` with a `rgba(255,255,255,.08)` ring. Contents: a 10px colour dot; the name (13px semibold `#1d1d1f`, dark `#f5f5f7`, flex 1); the share in a 40×16 clipped slot (12px semibold, `tabular-nums`, right aligned, e.g. "40%"); and the served count (40px wide, 11px `tabular-nums`, `#86868b` / dark `#8e8e93`).
- Controls row (wraps, centred, 20px gap):
  - Segmented control: `role="group"`, 3-column grid, radius 12px, padding 3px, `#e8e8ed` (dark `#1c1c1e`). Buttons 32px tall, padding-x 20px, radius 9px, 13px medium, `#1d1d1f` (dark `#f5f5f7`). The active button has a sliding white thumb (dark `#3a3a3c`), shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, shared between buttons via a `layoutId` that is unique per instance (from `useId`).
  - "Blended price $X.XX / 1M tokens": 13px `#6e6e73` (dark `#a1a1a6`), the price 15px semibold `#1d1d1f` (dark `#f5f5f7`) in a 20px-tall clipped slot, baseline aligned.

## Motion

**Routes.** For a route with share s > 0: stroke = model colour, `strokeWidth = 1.5 + s/14`, `strokeOpacity 0.35`, solid (`strokeDasharray "0 0"`). For s = 0: stroke = an idle grey from a CSS variable (`#c7c7cc` light, `#48484a` dark), width 1.2, opacity 0.8, dashed `"3 6"`. Animate width, opacity and dash with framer over 0.5s (`initial={false}`); transition the stroke colour with CSS (`transition: stroke .5s`) so the variable keeps following the theme.

**Packets (canvas, `requestAnimationFrame`).** Size the canvas backing store to `760·dpr × 260·dpr` with `dpr = min(2, devicePixelRatio)` and draw with `setTransform(dpr, 0, 0, dpr, 0, 0)`.

- `dt = min(0.05, frame delta in seconds)`. Accumulate time; every 0.07s spawn a packet (about 14 per second). Pick its route by weighted random choice from the *current* shares (read them through a ref updated in an effect so the loop never restarts): draw `r` in 0…100 and walk the shares subtracting until `r < share`. Speed = `0.55 + random·0.25` path-lengths per second.
- Each frame clear the canvas and, for every packet, advance `t += dt · speed`. When `t ≥ 1`, increment that route's served counter and remove the packet.
- Otherwise get the path's total length `L` and two points with `getPointAtLength`: the head at `t·L` and the tail 18px behind it (clamped at 0). Stroke a 3px round-capped line from tail to head with a linear gradient from the model colour at alpha 0 to the full model colour, then fill a 3px-radius dot at the head in the model colour.
- Every 500ms copy the counters into state to show the served counts.
- Cancel the frame and interval on unmount.

**Model cards.** Animate `opacity 1, x 0` when the share is above zero, `opacity 0.45, x 6` when it is zero (default spring, `initial={false}`).

**Rolling numbers.** The router's strategy label, each share and the blended price use `AnimatePresence mode="popLayout" initial={false}` keyed by the value: the new value enters from below (`y 12 / 14 / 16`, opacity 0) and the old one exits upward by the same amount.

**Segment thumb.** Spring stiffness 420, damping 32.

## Interaction and states

- Clicking a segment sets the strategy and calls `onStrategyChange`. Packets already in flight finish their routes; new packets follow the new weights at once, so the flow visibly shifts.
- Routes and cards with zero share stay visible (dashed, dimmed) so the topology never changes.
- Below 760px wide the diagram scrolls horizontally instead of squashing.

## Autoplay demo

With `autoplay`, every 2800ms switch to the next strategy in the order Cost, Quality, Balanced (repeating). A `pointerdown` or `keydown` anywhere in the component marks it touched; the next tick clears the interval. The packet flow itself always runs.

## Accessibility

- Segments are `<button type="button">` with `aria-pressed`, inside the `role="group"` labelled "Routing strategy". Focus: 2px `#0071e3` outline on `:focus-visible` (dark `#0a84ff`).
- The SVG and canvas are `aria-hidden`; the model names, shares and price are real text.

## Acceptance checklist

- [ ] Packets with short fading tails stream continuously from Router to the models, coloured per model.
- [ ] Under Balanced, all four routes are solid, thicker for bigger shares, and the price reads $1.92.
- [ ] Switching to Cost dashes and greys the Pro and Ultra routes, dims and nudges their cards right, and packets stop going there.
- [ ] Shares, the router label and the price roll vertically to their new values.
- [ ] The segment thumb slides between options with a firm spring.
- [ ] Served counters climb roughly in proportion to the shares and update twice a second.
- [ ] Dark mode uses dark cards, router, control and an idle route grey of `#48484a`; packet tails look clean on both backgrounds.
- [ ] Autoplay cycles strategies every 2.8s and stops after the first interaction.
