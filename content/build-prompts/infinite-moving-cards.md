Build an infinite belt of testimonial cards that cruises sideways forever and fades out softly at both edges. Hover or focus it and the belt eases to a stop so people can read; grab it and fling, and it coasts on your throw, skewing slightly into the speed like it has weight, before gliding back to its steady cruise. Arrow keys push it too. Default cards show stars, a title, a quote, tags and an author row; you can also render your own.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`).
- File: `components/infinite-moving-cards/InfiniteMovingCards.tsx`, named export `InfiniteMovingCards` (generic over the item type), types `InfiniteMovingCardItem`, `InfiniteMovingCardsProps<T>`.
- The belt position is integrated by hand in one `requestAnimationFrame` loop and written to a motion value (`x`); all config is read from a ref so the loop never restarts.

## API

`InfiniteMovingCardItem = { id?: string | number; title?: string; description?: string; image?: string; avatar?: string; name?: string; role?: string; rating?: number; tags?: string[] }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `T[]` | required | Cards. |
| `direction` | `"left" \| "right"` | `"left"` | Cruise direction. |
| `speed` | `"slow" \| "normal" \| "fast"` | `"normal"` | 26, 44 or 74 px/s. |
| `pauseOnHover` | `boolean` | `true` | Ease to a stop while hovered or focused. |
| `className` | `string` | `""` | Root classes. |
| `cardClassName` | `string` | `""` | Each card wrapper (e.g. width). Default card width `min(19rem, 100vw − 4rem)`. |
| `gap` | `number` | `16` | px between cards (right margin). |
| `loop` | `boolean` | `true` | Render the items twice so it never runs out. |
| `showGradientMask` | `boolean` | `true` | Edge fade (a mask, works on any background). |
| `draggable` | `boolean` | `true` | Grab and fling. |
| `renderItem` | `(item: T, index: number) => ReactNode` | — | Custom card (index is the original index). |
| `autoplay` | `boolean` | `false` | Flings back and forth every few seconds until touched. |

## Layout and look

- Root: `relative w-full`. Viewport: `role="region"`, overflow hidden, radius 24, 12px vertical padding, focusable (2px `#0071e3` ring, dark `#0a84ff`); when draggable: cursor grab/grabbing, `touch-action: pan-y`, no selection. Mask: `linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)` on `mask-image` and `-webkit-mask-image`.
- Track: `flex w-max`, `x` and `skewX` from motion values. Duplicate copies are `aria-hidden`.
- Default card (`<article>`): full height, column, radius 22, overflow hidden, white (dark `#1c1c1e`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`).
  - Optional top image 128px tall, cover.
  - Body padding 20. Stars (if rating): five 12px stars, gap 2, filled `#ff9f0a`, empty `#d2d2d7` (dark `#48484a`), rounded 0-5.
  - Title 10px below: 16px semibold, snug, tracking −0.02em. Description 6px below: 14px, line-height 1.5, `#424245` (dark `#d1d1d6`), `text-wrap: pretty`.
  - Tags 12px below: wrap, gap 6, pills 11px medium, padding 2×10, `#f0f0f3` / `#2c2c2e`, `#6e6e73` / `#a1a1a6`.
  - Author row (`mt-auto`, 16px top padding, gap 10): 32px avatar image or initials (11px semibold white) on a 135° gradient chosen by index from `#5ac8fa→#0071e3`, `#ffb340→#ff6b3d`, `#7ee0a1→#1fa463`, `#d6a4ff→#8e44ec`, `#ff8fa3→#ff375f`; name 13px semibold, role 12px `#6e6e73` / `#a1a1a6`, both truncate.

## Motion

- Measure with a ResizeObserver (viewport and track): `set` = half the track's scroll width when looping (one copy), else the full width; `view` = viewport width.
- Each frame (dt capped at 0.05s):
  - Cruise factor eases toward its target (1, or 0 when reduced motion, fewer than 2 items, or held with `pauseOnHover`) by `1 − exp(−4·dt)`, giving a soft slow-down and speed-up.
  - Fling velocity decays by `exp(−2.2·dt)` and snaps to 0 below 4 px/s.
  - `v = dirSign·speedPx·factor + fling` (dirSign −1 for left), `pos += v·dt`.
  - Looping wraps `pos` into `[−set, 0)`: `pos = ((pos mod set) + set) mod set − set`. A right-moving belt starts at `−set`. Without loop, clamp to `[−max(0, set − view), 0]`.
  - Write `x = round(pos, 2)` and the velocity motion value (0 under reduced motion).
- Lean: `skewX = useSpring(map(v, [−2400, 0, 2400] → [5°, 0, −5°], clamped), { stiffness 200, damping 22 })`.

## Interaction and states

- Pointer enter or focus inside holds; leave or focus leaving releases.
- Drag (primary button for mouse): record on pointer down; it only becomes a drag after 5px of horizontal movement, then capture the pointer. While live, the belt follows the pointer delta directly and velocity is tracked as `v = 0.5·v + 0.5·dx/dt` (dt ≥ 8ms). On release, `fling = clamp(v − cruiseVelocity, −5000, 5000)` (skipped under reduced motion). A click right after a fling is swallowed in the capture phase so cards behind the pointer are not activated.
- Arrow keys on the viewport: ArrowLeft adds +900 px/s to the fling, ArrowRight −900.

## Autoplay demo

Every 3400ms set the fling to −1700 then +1300 alternately, so the belt lurches, leans and recovers. Any pointer down or arrow key stops it for good. Disabled under reduced motion. Preview: five testimonials (e.g. "Launch week, sorted" / "We rebuilt the landing page in two days and it still feels hand-made." / Ariana Shaw, Product lead, Orbitstack, 5 stars, tag SaaS) with 290px cards inside a 720px container.

## Accessibility

- Viewport `role="region"`, `aria-roledescription="carousel"`, `aria-label="Moving cards. Arrow keys push the belt."`, `tabIndex 0`. Duplicated cards are `aria-hidden`. Stars are `role="img"` labelled "{k} out of 5 stars". Hover and focus pause the motion; reduced motion stops cruising entirely.

## Acceptance checklist

- The belt cruises left at a steady speed with no visible seam where it loops.
- Cards fade out at both edges on any background.
- Hovering slows the belt smoothly to a stop; leaving brings it back up to speed.
- Dragging moves the belt 1:1; releasing coasts in the throw direction and decays back to cruise.
- The track skews up to 5° into fast motion and springs straight.
- A fling never triggers a click on the card under the pointer.
- Arrow keys nudge the belt; autoplay lurches it until the first touch.
- `direction="right"`, `speed`, `gap`, `renderItem` and `loop={false}` behave as described.
