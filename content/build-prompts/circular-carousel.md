Build a carousel of small cards hung round the rim of a big wheel. The active card sits at the top, upright and outlined in its accent; its neighbours tip away down each side of the arc, smaller and fading. Drag or fling the wheel and it coasts to the nearest card, while the cards swing on their pins with the wheel's momentum and settle when it stops. A large counter under the arc rolls to the new number. Arrow buttons, pill dots and keys work too.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`AnimatePresence`, `animate`, `motion`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`, `useTransform`, `useVelocity`).
- File: `components/circular-carousel/circular-carousel.tsx`, named export `CircularCarousel` (also default), types `CircularCarouselProps`, `CarouselItem`.

## API

`CarouselItem = { id: string; title: string; description: string; tag?: string; accent?: string }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `CarouselItem[]` | 6 steps (below) | The cards. |
| `activeIndex` | `number` | — | Controlled active card; the wheel turns the short way to it. |
| `onActiveChange` | `(index: number) => void` | — | New active index. |
| `autoplay` | `boolean` | `false` | Steps forward every interval until touched. |
| `autoPlay` | `boolean` | — | Deprecated alias of `autoplay`. |
| `autoPlayInterval` | `number` | `2600` | ms between steps (minimum 1000). |
| `hint` | `string` | `"Drag the wheel, or use the arrow keys."` | Caption; `""` hides it. |
| `className` | `string` | `""` | Root classes. |

Default items (tag: title, description): Plan: "Shape the brief", "Goals, audience and the one thing to get right."; Sketch: "Rough it out", "Fast frames to find the flow before the polish."; Build: "Make it real", "Components, data and motion wired together."; Test: "Watch people use it", "Five sessions find most of the rough edges."; Ship: "Put it out", "Release, measure and write down what you learned."; Learn: "Loop back", "Feed what you saw into the next brief." Default accents by index: `#0071e3`, `#bf5af2`, `#ff9f0a`, `#30b65a`, `#ff375f`, `#5e5ce6`.

## Layout and look

- Root: flex column, centred, gap 12, full width, overflow hidden.
- Wheel stage: `role="region"`, 214px tall, full width up to 540px, radius 24, cursor grab, `touch-action: pan-y`, no selection, focusable (2px ring `#0071e3`, dark `#0a84ff`). Cards hang from a layer 12px below the top.
- Card: 164×104, absolutely centred horizontally (`left: 50%`, `margin-left: −82px`). A button (tabIndex −1, `aria-hidden`), radius 20, padding 14, white (dark `#1c1c1e`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 18px 34px -22px rgba(0,0,0,.4)` (dark `rgba(255,255,255,.08)` / `rgba(0,0,0,.9)`), column with space-between. Top: tag pill (11px semibold, padding 2×8, accent text on accent+`1a` background). Bottom: title (14px semibold, tight leading, tracking −0.02em, truncate) and description (11px, line-height 1.35, 2-line clamp, `#6e6e73` / `#a1a1a6`). An overlay ring `0 0 0 2px accent` with opacity `max(0, 1 − 2·|offset|)`.
- Counter (bottom of the stage, pointer-events none, `aria-live="polite"`): a 40px-tall overflow-hidden window with the two-digit number at 38px semibold, line-height 40px, tracking −0.05em, tabular; then "/ 06" in 13px `#86868b` (dark `#98989d`).
- Controls row (gap 12): 36px round prev/next buttons (white / dark `#2c2c2e`, ring `0 0 0 1px rgba(0,0,0,.06)`, 16px chevrons stroke 2.4) around pill dots: 24px-tall buttons with 3px side padding, pills 6px tall, width 18 active / 6 inactive, `#1d1d1f` / `#f5f5f7` active, `#d2d2d7` / `#48484a` inactive. Hint 12px `#6e6e73` / `#a1a1a6`.

## Motion

- One motion value `pos` (fractional card index). Each card's offset wraps to the shortest signed distance: `off = wrap(index − pos, n)` where `wrap(o, n) = ((o + n/2) mod n + n) mod n − n/2`.
- Arc geometry (radius 300px, 27° per card), with `θ = off·27°`: `x = 300·sin θ`, `y = 300·(1 − cos θ)`. So the active card is at the top and neighbours slide down a circle.
- `rotate = θ + sway·(1 − min(1, |off|)·0.4)`; `scale = 1 − min(2.5, |off|)·0.07`; `opacity = max(0, 1 − max(0, |off| − 1.2)·1.1)`; `zIndex = 10 − round(2|off|)`. Round outputs to 3 decimals so server and client match.
- Sway (follow-through on the pins): `useSpring(clamp(−7·velocity(pos), −22, 22), { stiffness 120, damping 7, mass 0.6 })` degrees; 0 under reduced motion.
- Settle: spring stiffness 150, damping 18, carrying velocity (reduced motion: duration 0).
- Drag: `pos = start − offset.x/120`. On release, inertia with velocity `−velocity.x/120`, power 0.25, timeConstant 240, `modifyTarget` rounding and clamping to within ±3 cards of where the release happened. Predict the landing card to call `onActiveChange` immediately.
- Counter: `AnimatePresence mode="popLayout" initial={false}` keyed by the number, direction-aware variants: enter from `y = d·30`, exit to `y = −d·30`, opacity 0 ↔ 1, spring 420/30. Direction d is the sign of the wrapped index change.
- Dots spring width 500/30; prev/next `whileTap` scale 0.9.

## Interaction and states

- Active index = `round(pos) mod n`, updated on every change. `onActiveChange` fires once per new settled index.
- `goTo(i)` lands on `round(pos + wrap(i − pos, n))`, the short way round. Step buttons and arrows add ±1 to the rounded position.
- Controlled mode: when `activeIndex` changes, spring (150/18) the short way to it.
- Keys on the stage: ArrowRight next, ArrowLeft previous, Home first, End last.
- Tapping a side card brings it to the top.

## Autoplay demo

Every `autoPlayInterval` (min 1000ms) spring `pos` to the next integer with stiffness 110, damping 14 (a softer swing). The first pointer down anywhere in the root, or a key, stops it permanently.

## Accessibility

- Stage: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Cards"`, `tabIndex 0`. Cards are hidden from assistive tech; the counter region is `aria-live="polite"` and includes a visually hidden "{title}. {description}".
- Prev/next buttons labelled "Previous card" / "Next card"; dots in a group "Choose card", each "Go to {title}" with `aria-current`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. When the visitor turns the wheel by dragging, the arrow, Home or End keys, the previous and next buttons, a dot or a tap on a card, `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 40% volume plays each time a new card comes to the front, never more often than every 40ms, so a fast flick gives a quick run of clicks. A change driven from outside through `activeIndex` makes no sound. The autoplay steps play the same `tick` at 40% for each card that comes to the front, with the same 40ms minimum gap. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Six cards sit on an arc: active at the top with an accent ring, neighbours rotated and lower, far ones faded out.
- Dragging turns the wheel; a fling coasts at most three cards and lands exactly on one.
- Cards visibly swing on their pins while moving and settle after.
- The counter rolls up or down depending on direction.
- Prev/next, dots, arrows, Home/End and tapping a card all work, always the short way round.
- Controlled `activeIndex` turns the wheel to match.
- Reduced motion jumps without sway.
