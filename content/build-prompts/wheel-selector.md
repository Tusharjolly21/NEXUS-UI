Build a radial selector card: a dial with a ring of round icon nodes that you drag round, fling, scroll or step with the arrow keys. It coasts, snaps to the nearest stop with a little overshoot, and the node at the top swells and fills with its colour while a rim of ticks turns with it, the hub counter rolls (02 / 06) and a side panel swaps to that item with a blur cross-fade. Feels like a precision watch bezel.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS (container queries), framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`, `useReducedMotion`), React `useId`.
- File: `components/wheel-selector/wheel-selector.tsx`. Named exports `WheelSelector`, `DEFAULT_WHEEL_ITEMS`; types `WheelItem`, `WheelSelectorProps`, `WheelVariant`, `WheelContentMode`, `WheelAnimationSpeed`, `WheelIconName`, `WheelTheme`.

## API

`WheelItem = { id; label (hub + a11y); title (panel headline); subtitle? (eyebrow); description?; accentColor?; icon?: WheelIconName; iconImageUrl?; image?; ctaHref?; ctaLabel? }`. Icon names (16, simple 16×16 line glyphs, stroke 1.5, round caps): analytics, boxes, brush, code, compass, cpu, globe, layers, idea, marketing, pen, rocket, search, security, sparkles (fallback), target.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `WheelItem[]` | 6 defaults | Empty → defaults. |
| `variant` | `"responsive" \| "desktop" \| "mobile"` | `"responsive"` | Panel beside the dial at container ≥ 560px / always beside / always stacked. |
| `contentMode` | `"minimal" \| "detailed" \| "hidden"` | `"detailed"` | Title only / + description and image / no panel. |
| `activeIndex` | `number` | – | Controlled; turns the short way. |
| `onActiveChange` | `(i) => void` | – | When the dial settles on a new item. |
| `ringRadius` | `number` | `112` | Clamped 80–220. |
| `tickCount` | `number` | `60` | Clamped 12–120. |
| `showTicks` / `showCounter` | `boolean` | `true` | Rim ticks / hub counter. |
| `showCTA` | `boolean` | `false` | CTA link in the panel. |
| `autoplay` (`autoRotate` alias) | `boolean` | `false` | Turns one stop at a time until touched. |
| `autoRotateInterval` | `number` | `3000` | Clamped 1200–15000 ms. |
| `animationSpeed` | `"slow" \| "medium" \| "fast"` | `"medium"` | Snap spring 110/14, 170/16, 260/20. |
| `accentColor` | `string` | `"#0071e3"` | For items without their own. |
| `theme` | `WheelTheme` | – | Deprecated, ignored (follows dark mode). |
| `className` | `string` | `""` | Section classes. |

Defaults (label, title, subtitle, accent, icon, description): Strategy, "Product strategy", Direction, `#0071e3`, compass, "Positioning, narratives and roadmaps that line teams up around outcomes you can measure."; Design, "Experience design", Craft, `#ff9f0a`, pen, "Clear interfaces and expressive visual systems that make hard products feel easy."; Engineering, "Digital platforms", Build, `#30d158`, code, "Fast, reliable front ends on scalable systems, with motion that earns its place."; Growth, "Launch campaigns", Reach, `#ff375f`, rocket, "Launch moments that turn your product story into attention, and attention into sign-ups."; Insights, "User research", Learn, `#bf5af2`, analytics, "Interviews and analytics that turn what users do into decisions you can defend."; Systems, "Design systems", Scale, `#5ac8fa`, layers, "Components, tokens and docs in one system your teams can extend without asking." All `ctaHref: "#"`.

## Layout and look

- Section: `@container`, full width, radius 28, padding 20, white / `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e` / `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`. Inner flex, centred, gap 24.
- Dial column: dial + caption "Drag the dial, or fling it." 12px `#86868b` (dark `#a1a1a6`), gap 8.
- Dial: square `S = 2(R + 42)`, round, grab cursor, `touch-action: none`. Inner disc inset 14px, `#f5f5f7` with `inset 0 1px 2px rgba(0,0,0,.06)` (dark `#2c2c2e`, `rgba(0,0,0,.5)`). Ring circle radius R, 1px `#e5e5ea` (dark `#3a3a3c`).
- Ticks (rotate with the dial): from radius `S/2 − 9` (major `S/2 − 12`) to `S/2 − 4`; major every `round(ticks/n)`, 1.6px `#aeaeb2` (dark `#636366`); minor 1px `#d2d2d7` (dark `#48484a`); round caps.
- Pointer: a small downward triangle at the top centre (12px wide, 9px tall) filled with the active accent, 0.3s fill transition.
- Nodes: 52px circles placed at angle `i × 360/n` on radius R (top = index 0), counter-rotated so icons stay upright. Inactive: white, `#6e6e73`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 8px 18px -12px rgba(0,0,0,.4)`, hover darker text; dark `#2c2c2e`, `#a1a1a6`. Active: accent background, white icon, `0 10px 22px -10px rgba(0,0,0,.55)`. 200ms colour/shadow transitions. 22px icon.
- Hub: 96px white circle (dark `#1c1c1e`), centred, shadow `0 0 0 1px rgba(0,0,0,.05), 0 14px 28px -16px rgba(0,0,0,.45)`. Counter 26px semibold tracking −0.04em tabular: "02" in a 26px clipping window + "/06" 12px medium `#86868b` (dark `#8e8e93`). Label below, 11px semibold in accent, max 80px truncated.
- Panel (min-height 150, `aria-live="polite"`): eyebrow 12px semibold uppercase tracking 0.14em in accent; title 6px below, 28px semibold leading 1.08 tracking −0.035em, balanced; description (detailed) 10px below, 14px relaxed, max 34ch, `#6e6e73` (dark `#a1a1a6`); image (detailed) 16:9, max 280px, radius 16; CTA (showCTA) 36px pill in accent, 13px semibold white, "Learn more" + arrow, active scale 0.97. Below: progress dots, gap 6, 6px tall, active 22px wide in accent, others 6px `rgba(142,142,147,.35)`, spring 420/30.

## Motion

- One motion value `rot` (degrees). Item `i` sits at `i × step` (`step = 360/n`); the selected index is `wrap(round(−rot/step), n)`, updated from a change listener (so nodes light up as they pass the top mid-spin). Nodes counter-rotate by `−rot`.
- Node swell: `a = wrap(θ + rot + 180, 360) − 180`; `near = max(0, 1 − |a|/step)`; `scale = 0.86 + near × 0.34`.
- Snap: `animate(rot, target, spring per speed, velocity)`, then report `onActiveChange` once when it settles on a new index.
- Drag: pointer angle via `atan2` from the dial centre; add the wrapped delta (−180…180) to `rot`; smooth velocity `v = 0.6v + 0.4·(delta/dt)·1000` °/s; accumulate distance moved. On release: if moved < 3° and the press started on a node, go to that node. Otherwise clamp v to ±1400, project `rot + v × 0.22`, round to a stop and snap carrying v. That gives coast plus overshoot.
- Go to index the short way: `diff = wrap(−i·step − rot + 180, 360) − 180`, target `round((rot + diff)/step) × step`.
- Counter: `AnimatePresence mode="popLayout"` keyed by index; new number from `y 100%`, old to `y −100%`, opacity; spring 500/32.
- Panel: keyed by item; enter `opacity 0, y 14, blur(6px)`, exit `y −10, blur(6px)`, spring 300/28.

## Interaction and states

- Pointer capture on the dial. Scroll wheel (non-passive, ignore |delta| < 4, throttle 260ms) steps one stop in the delta's direction. Keys: Right/Down next, Left/Up previous, Home first, End last.
- Controlled `activeIndex` animates the short way without calling back.
- Any pointer, wheel or key marks the dial touched (stops autoplay).
- Reduced motion: snaps are instant, counter and panel swap without motion.

## Autoplay demo

Every `autoRotateInterval` ms (n ≥ 2), spring `rot` one step forward (`round(rot/step)·step − step`). Stop for good on first interaction.

## Accessibility

- Section `aria-roledescription="carousel"`, label "Wheel selector". Dial `role="slider"`, focusable, label "Choose an item", `aria-valuemin 1`, `aria-valuemax n`, `aria-valuenow active + 1`, `aria-valuetext "Design, 2 of 6"`; 2px focus outline offset 4. Decorative SVG, dots and icons are `aria-hidden`; image `alt=""`.

## Acceptance checklist

- Six coloured services sit on the ring; the top node is filled and larger, with a matching pointer triangle.
- Dragging spins nodes and ticks; nodes swell as they pass the top and icons stay upright.
- A fling coasts and lands exactly on a stop with a small overshoot.
- Clicking a node turns it to the top the short way.
- The hub counter rolls and the panel blurs between items; dots stretch for the active one.
- Wheel and arrow keys step one item; `onActiveChange` fires once per settle.
- Below 560px container width the panel stacks under the dial (responsive).

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags, flings, scrolls, clicks a node or uses the keys, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time a new item passes the top marker, at most once every 40 ms, and one soft `drop` (a low sine thump falling 380 to 120 Hz with a brief noise tap, volume 0.5) when the dial settles after actually turning. Autoplay turns, controlled-value changes and hover are silent. It is silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
