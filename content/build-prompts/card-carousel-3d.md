Build a 3D product carousel where cards stand round a cylinder. Drag or fling it and it coasts, then clicks into place with the nearest card facing you. Spin it fast and the cards swing outward like a centrifuge and spring back in as it slows, while the whole ring tilts slightly with the spin. Cards turned away dim, the far side shows soft card backs, and the front card's name and price sit underneath with a row of pill dots. Wheel, arrow keys, dots and a tap on any card all work.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`, `useTransform`, `useVelocity`).
- File: `components/card-carousel-3d/card-carousel-3d.tsx`, named export `CardCarousel3D` (also default), exported types `CarouselCard`, `CardCarousel3DProps` and the constant `DEFAULT_CARDS`.

## API

`CarouselCard = { id: string; name: string; price: string; image?: string; color?: string }`. Without `image`, draw an SVG phone in `color` (fallback `#d2d2d7`).

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `CarouselCard[]` | `DEFAULT_CARDS` (below) | The cards. |
| `radius` | `number` | fitted | Cylinder radius. Default `round((itemWidth/2) / tan(π / max(3, n)) · 1.16)`. |
| `itemWidth` | `number` | `168` | Card width px. |
| `itemHeight` | `number` | `220` | Card height px. |
| `perspective` | `number` | `1100` | CSS perspective px. |
| `autoRotate` | `boolean` | `false` | Continuous drift; pauses under the pointer and after interaction. |
| `autoSpeed` | `number` | `1` | Drift speed multiplier. |
| `scrollSpeed` | `number` | `1` | Drag and wheel multiplier. |
| `direction` | `"cw" \| "ccw"` | `"cw"` | Direction for drift and autoplay. |
| `onChange` | `(index: number) => void` | — | Index of the card that settles in front. |
| `hint` | `string` | `"Drag, scroll or use the arrow keys."` | Caption under the dots; `""` hides it. |
| `autoplay` | `boolean` | `false` | Steps to the next card every 2.4s until touched. |
| `className` | `string` | `""` | Root classes. |

`DEFAULT_CARDS`: Lumen Pro Max "From $1,199" `#c9b8a3`; Lumen Pro "From $999" `#3a3a3c`; Lumen Air "From $899" `#a9c7e8`; Lumen "From $799" `#f2a7c3`; Lumen Mini "From $599" `#9fd9b3`; Lumen SE "From $429" `#f5f5f7` (ids pro-max, pro, air, lumen, mini, se).

## Layout and look

- Root: flex column, centred, gap 12px, full width, overflow hidden.
- Stage: `role="region"`, full width, height `itemHeight + 36`, CSS `perspective`, radius 24, cursor grab (grabbing when active), `touch-action: pan-y`, no text selection, focusable with a 2px `#0071e3` ring (dark `#0a84ff`).
- Ring: a 0×0 element centred in the stage with `transform-style: preserve-3d`, `z = −radius` (so the front card sits at the stage plane), `rotateX = tilt`, `rotateY = rot`.
- Each card: absolute, centred with negative margins, `transform: rotateY(i·step deg) translateZ(radius px)`, preserve-3d. Step = 360/n.
  - Front face: a button (tabIndex −1, `aria-hidden`, backface hidden), radius 24, padding 12, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.45)` (dark `rgba(255,255,255,.08)` / `rgba(0,0,0,.9)`). Inside: a flex-1 image well (radius 16, `#f5f5f7` / dark `#2c2c2e`, vertical padding 8) holding a cover image or the phone; then the name (10px top margin, 14px semibold, tracking −0.01em, truncate, `#1d1d1f` / `#f5f5f7`) and price (12px tabular, `#6e6e73` / `#a1a1a6`), both 4px side padding.
  - Scrim over the face: `#f5f5f7` (dark black), opacity mapped from facing 0→1 to 0.5→0.
  - Back face: span rotated 180°, backface hidden, radius 24, `#e8e8ed` (dark `#2c2c2e`), opacity `max(0, −facing)·0.7`.
  - `facing = cos((angle + rot)°)`, rounded to 3 decimals.
- Phone SVG (viewBox 120×160, height 100%): an offset shadow body (72×140, rx 16, black 12%, translated 4,4), the body in `color` with a `rgba(0,0,0,.12)` stroke, a diagonal sheen gradient (white .55 → 0 at .45 → black .18), a camera bump (34×34 rx 10, black 14%) with three 6.5px dark lenses and a small white flash dot, and a 9px ring near the bottom.
- Caption (`aria-live="polite"`): active name 15px semibold `#1d1d1f` / `#f5f5f7` over price 12px tabular `#6e6e73` / `#a1a1a6`.
- Dots: gap 4, each a 24px-tall button with 4px side padding; the pill is 7px tall, width 20 active / 7 inactive, `#1d1d1f` / `#f5f5f7` active, `#d2d2d7` / `#48484a` inactive. Hint: 12px `#6e6e73` / `#a1a1a6`.

## Motion

- `rot` is a motion value in degrees. Active index = `mod(round(−rot/step), n)` on every change.
- Centrifugal spread: `spread = useSpring(min(60, |velocity(rot)|·0.05), { stiffness 140, damping 14 })`; radius = base + spread.
- Tilt: `useSpring(−4 + clamp(−velocity·0.01, −6, 6), { stiffness 160, damping 16 })` degrees. Reduced motion: spread 0, tilt fixed −4.
- Snap: spring to a multiple of `step`, stiffness 170 damping 19 (reduced motion 600 / 60), carrying any velocity. `goTo(i)` takes the shortest way round (`delta = mod(want − cur + 180, 360) − 180`). `onChange` fires only when the settled index changes.
- Drag (`onPan`): `rot = startRot + offset.x · 0.32·scrollSpeed`. On release, an inertia animation with velocity `velocity.x · k`, power 0.35, timeConstant 260, `modifyTarget` rounding to the nearest step; predict the landing index as `round(−(rot + v·k·0.5)/step)` to call `onChange`.
- Wheel (non-passive listener): use the larger of deltaX/deltaY, prevent default, `rot −= d·0.18·scrollSpeed`, and 140ms after the last wheel event spring (170/19) to the nearest step.
- Auto-rotate: rAF loop, `rot −= sign·autoSpeed·dt·0.012` per ms (sign +1 for cw). Skip while hovered or dragging, and for 100 frames after any snap/wheel (120 after a drag).
- Dot pill width: spring 500 / 30.

## Interaction and states

- Pointer down stops any running animation and marks the carousel touched. Tapping a card goes to it.
- Keys on the stage: ArrowRight next, ArrowLeft previous, Home first, End last (prevent default).
- One card renders fine; the fitted radius clamps n to at least 3.

## Autoplay demo

Every 2400ms spring (stiffness 120, damping 16) one step in `direction`. Stop permanently on the first pointer down, wheel, key or dot click.

## Accessibility

- Stage: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Products"`, focusable. Cards are hidden from assistive tech; the dots are the accessible controls (`aria-label="Show {name}"`, `aria-current` on the active one) in a group labelled "Choose product". The caption announces the front product.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. When the visitor turns the cylinder by dragging, the wheel, the arrow, Home or End keys, a tap on a card or a dot, `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 40% volume plays each time a new card comes to the front, never more often than every 40ms, so a fast spin gives a quick run of clicks. The autoplay steps and the continuous `autoRotate` drift make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Six cards stand evenly on a ring; the front one is undimmed, the side ones dim, the far ones show grey backs.
- Dragging rotates the ring; a fling coasts and lands exactly on a card.
- Fast spins push cards outward and tilt the ring; both spring back as it slows.
- Wheel scrolls the ring and snaps 140ms after you stop.
- Arrow keys, Home/End, dots and tapping a card all bring the right card to the front by the shortest route.
- `onChange` fires once per new settled card.
- `autoRotate` drifts but pauses under the pointer and briefly after interaction.
- Reduced motion removes spread and tilt and snaps stiffly.
