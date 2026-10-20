# Pulse Bento

Build an analytics feature bento with four live tiles: stacked traffic bars that re-stack when you switch range, a revenue line that morphs between timeframes, a team update you can react to with bursting reactions, and a heart-rate readout with a beating icon and a scrolling ECG trace. It should feel like a polished product dashboard teaser: alive but restrained, every change a spring, never a redraw.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `animate`, `useInView`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`).
- File: `components/pulse-bento/pulse-bento.tsx`, named export `PulseBento`, plus `PulseBentoProps`. No icon library; icons are inline SVG paths.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Live everywhere"` | Small accent line above the heading. |
| `title` | `string` | `"Your product's pulse, at a glance."` | Heading. |
| `accent` | `string` | — (`#0071e3`, `#2997ff` in dark) | Eyebrow, focus rings and picked-reaction outline, via CSS variable `--pb-accent`. |
| `autoplay` | `boolean` | `true` | Keeps the heart-rate tile beating and its trace scrolling while on screen. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg `#f5f5f7` / dark `#000`, padding 64px × 20px (80px vertical from `sm`). Content max 1120px.
- Header (40px bottom margin, 48px from `sm`, 12px gap): eyebrow 14px semibold in `var(--pb-accent)`; H2 `clamp(32px,5vw,56px)`, semibold, leading 1.04, tracking −0.04em, max 720px, balanced, `#1d1d1f` / `#f5f5f7`.
- Grid: 1 column, 5 from `md`; gap 16px (20px from `sm`). Order and spans: Traffic 3, Revenue 2, Update 2, Heart rate 3.
- Tile: radius 28px, `overflow: hidden`, flex column; white with `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)`. Top area: flex-1, centred, padding 20px (24px `sm`). Bottom copy: padding 0 20px 24px (28px sides/bottom from `sm`); title 19px semibold, tracking −0.02em; body 4px below, 15px, leading 1.5, `#6e6e73` / `#a1a1a6`.
- Segmented control: pill track `#f0f0f3` / `#2c2c2e`, 2px padding; options 28px tall, 12px horizontal padding, 12px medium; each option's hit area stretched 6px above and below via `::after`. Active thumb: white (dark `#636366`) with `0 1px 4px rgba(0,0,0,.12)`.
- **Traffic** (max 420px): "Traffic" 13px semibold over "Last 24 days" / "Last 12 weeks" 12px `#86868b` / `#a1a1a6`; segmented Day/Week top-right. Total 30px semibold tabular tracking −0.03em plus " visits" 13px muted. Chart 120px tall, columns with 2px gap (3px from `sm`), each a reverse flex column of four 3px-radius segments coloured Search `#0a84ff`, Social `#bf5af2`, Email `#ffd60a`, Referral `#ff375f`; heights are fractions of the tallest column. Legend 11px with 8px dots, wrapping, 12px × 4px gaps.
- **Revenue** (max 320px): value `$58,834.75` 30px semibold tabular; change line 12px medium green `#248a3d` / `#30d158` ("+1,204.60 · 2.1% today"). SVG `viewBox 0 0 300 92`: a 2.5px `#30d158` round-joined line through 12 points (`x = i/11 × 300`, `y = 90 − v`); a 5px-radius end dot with tile-coloured fill and green stroke; a green pulse ring behind it. Segmented 1H / 4H / 1D below (12px gap).
- **Update** (max 300px): 28px orange `#ff9f0a` avatar "MC", "Maya" 13px semibold, "2m" 12px muted; message bubble radius 18px with a 6px top-left corner, bg `#f0f0f3` / `#2c2c2e`, 16px × 10px, 15px: "Shipped the new onboarding flow". Reaction pills (6px gap, wrapping): 36px tall, 12px padding, 13px semibold, a 15px stroked icon in its colour and a count. Unpicked: white with `0 0 0 1px rgba(0,0,0,.08)` (dark `#2c2c2e`, white/10%). Picked: bg `#e8f1fd` (dark `#0a84ff` at 20%) with `inset 0 0 0 1.5px var(--pb-accent)`. Reactions: Shipped (rocket, `#5e5ce6`, 3), Fire (`#ff9f0a`, 2), Love (heart, `#ff375f`, 0 — always shown even at 0; others hide at 0).
- **Heart rate** (max 260px): BPM numeral 44px semibold tabular, leading 1, tracking −0.04em, with " BPM" 14px medium muted; a 24px filled `#ff375f` heart on the right. "Peak 97" and "Low 51" 12px muted, 16px apart. Trace 16px below: a 480×56 SVG of four copies of the beat path `M0 30 H22 L28 22 L34 30 H44 L50 4 L57 52 L63 30 H76 L84 24 L92 30 H120` at x 0/120/240/360, 2px `#ff375f`, inside a clip masked with `linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)`.

## Motion

- Tiles enter once at 25% visibility: `opacity 0, y 30` → rest over 0.8s, ease `[0.16,1,0.3,1]`.
- Segmented thumb: shared `layoutId`, spring 500 / 34. Wrap the section in a `LayoutGroup` with a per-instance id, and each tile's control in its own `LayoutGroup` ("range", "tf") so the two thumbs don't fight.
- Counters (`useCount`): animate a motion value to the new target over 0.9s with the same ease; render with `toLocaleString` and fixed decimals (0 for visits, 2 for revenue).
- Traffic: switching range remounts the bars (keyed by range + index); each segment grows `height 0 → n%` with spring 220 / 22, delay `i × 0.018 + k × 0.03s`.
- Revenue: the path animates its `d` attribute and the end dot animates `cx/cy`, spring 120 / 18. The change line swaps with `y ±6` fades (`mode="popLayout"`). Pulse ring: `scale [1, 2.6]`, `opacity [.5, 0]`, 1.4s, infinite (off under reduced motion).
- Update: pills `layout`; `whileTap scale .88`; the icon pops `scale [1, 1.45, 1]` over 0.35s on each tap (re-keyed); when adding a reaction, six 4px dots in its colour burst to radius 15px at angles `k` radians (`x = cos(k)·15`, `y = sin(k)·15`) and fade over 0.5s. Counts roll `y 14 → 0 → −14`.
- Heart rate (only when `autoplay` and not reduced, and in view): BPM random-walks every 1400ms by up to ±3 within 58–97 using a seeded generator (`s = (s × 9301 + 49297) % 233280`, seed 11); the heart beats `scale [1, 1.25, 1, 1.12, 1]` with duration `60 / bpm` s, infinite; the trace translates `x 0 → −120` over 1.6s linear, infinite.

## Interaction and states

- Traffic: Day shows 24 columns and 24,182 visits; Week shows 12 columns and 151,904.
- Revenue: 1H `$58,212.40` "+212.40 · 0.4%"; 4H `$58,560.10` "+560.10 · 1.0%"; 1D (default) `$58,834.75` "+1,204.60 · 2.1%".
- Reactions toggle: tapping adds one and marks it yours; tapping again removes it.

## Demo data

- Traffic series are seeded so server and client match: `r()` uses the same LCG with seed 7 (Day, 24 columns) or 3 (Week, 12); each value = `(0.4 + r()) × weight × (0.7 + sin(i/3) × 0.3)` with weights Search 1.3, Social 0.8, Email 0.8, Referral 0.4.
- Revenue shapes (12 points each): 1H `40,42,39,45,44,50,48,53,52,58,56,60`; 4H `30,36,33,41,38,35,44,49,46,54,58,63`; 1D `20,26,24,31,37,34,42,47,45,56,61,68`.
- Tile copy: "Traffic by source" / "Switch the range and every bar re-stacks itself."; "Revenue, live" / "Timeframes morph instead of redrawing."; "Updates people react to" / "Wins get noticed. Tap a reaction to add yours."; "Always on" / "Health checks every second, so you hear about problems before customers do."

## Autoplay demo

With `autoplay` (default), the heart-rate tile beats and its trace scrolls continuously while visible; the rest of the tiles wait for interaction. With `autoplay={false}` or reduced motion the BPM stays at 69 and the trace is still.

## Accessibility

- Segmented controls are `role="radiogroup"` (labels "Range", "Timeframe") of `role="radio"` buttons with `aria-checked`.
- Reaction pills have `aria-pressed` and `aria-label="{label}, {count}"`.
- Charts, trace and icons are `aria-hidden`. Focus rings are 2px `var(--pb-accent)`.

## Acceptance checklist

- [ ] 3/2 then 2/3 column split from `md`; single column on phones.
- [ ] Day ↔ Week slides the thumb, counts the total and re-grows every bar in a left-to-right wave.
- [ ] 1H/4H/1D morph the line and dot smoothly; the value counts with two decimals.
- [ ] The end dot emits a repeating pulse.
- [ ] Tapping Love adds it, outlines it in the accent and bursts six dots; tapping again removes it.
- [ ] Heart rate wobbles between 58 and 97 and the ECG scrolls endlessly.
- [ ] `accent="#ff375f"` recolours the eyebrow and picked reaction outline.
- [ ] `autoplay={false}` freezes the heart tile.
- [ ] Server and client render identical bars (no hydration warning).
