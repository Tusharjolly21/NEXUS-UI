Build a cinematic 3D deck of dark poster cards. The front card faces you with a subtle pointer tilt and glare; the cards behind recede into depth, smaller, lower and darker. Advancing makes the front card peel away on its bottom edge, flying up and back like a page torn off a pad, while the next card rises to take its place. The waiting cards lean back while the deck moves and spring upright when it stops. A soft ambient glow in the front card's accent sits behind it. Swipe, fling, wheel, arrow keys, progress pills, or page scroll all drive it.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS (container queries `@container` and `cqw` units), framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useScroll`, `useSpring`, `useTransform`, `useVelocity`).
- File: `components/cinematic-card-deck/cinematic-card-deck.tsx`, named export `CinematicCardDeck` (also default), types `CinematicDeckCard`, `CinematicCardDeckProps`.

## API

`CinematicDeckCard = { title: string; description: string; tag?: string; cardColor?: string; accentColor?: string; imageUrl?: string }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `CinematicDeckCard[]` | 4 samples (below) | Front to back; empty falls back to samples. |
| `intensity` | `"subtle" \| "standard" \| "cinematic"` | `"standard"` | Depth and peel strength. |
| `exitDirection` | `"up" \| "down"` | `"up"` | Which way cards peel (and which way to swipe). |
| `cardWidth` / `cardHeight` | `number` | `340` / `220` | px; deck shrinks keeping the aspect ratio. |
| `borderRadius` | `string` | `"24px"` | Card radius. |
| `smoothing` | `number` | `0.6` | 0 snappy, 1 floaty. |
| `showAccent` | `boolean` | `true` | Accent bar on the front card. |
| `showProgress` | `boolean` | `true` | Progress pills. |
| `progressPosition` | `"bottom" \| "left" \| "right"` | `"bottom"` | Pill placement. |
| `showAmbientGlow` | `boolean` | `true` | Accent light behind the deck. |
| `glowIntensity` | `number` | `0.35` | Glow opacity. |
| `indicatorColor` | `string` | text colour | Pill colour. |
| `backgroundColor` | `string` | `"transparent"` | Root background. |
| `scrollLinked` | `boolean` | `false` | Drive from page scroll with a sticky stage. |
| `sectionHeight` | `number` | `300` | Root height in vh when scroll-linked. |
| `scrollContainerRef` | `RefObject<HTMLElement \| null>` | window | Scroller to track. |
| `viewportHeight` | `string` | `"100vh"` | Sticky stage height. |
| `defaultIndex` | `number` | `0` | First front card (clamped). |
| `onChange` | `(index: number) => void` | — | New front index. |
| `hint` | `string` | `"Swipe, scroll or use the arrow keys."` | Caption (`""` hides; scroll-linked shows "Scroll to deal the deck."). |
| `autoplay` | `boolean` | `false` | Deals every 2.4s until touched (not when scroll-linked). |
| `className` | `string` | `""` | Root classes. |

Samples (title / tag / cardColor / accent): Launch Systems / Foundation / `#16161a` / `#ff6b4a`; Motion Stories / Animation / `#1d1438` / `#b49bff`; Fast Interfaces / Engineering / `#0c2340` / `#4adbff`; Human Details / Experience / `#0f2a1c` / `#5ee38a`, each with a one-line description.

Presets (scaleBack, zBack, rotExit, yBack): subtle 0.92, −120, −42, 12; standard 0.89, −180, −58, 16; cinematic 0.85, −260, −72, 20.

## Layout and look

- Stage: column, gap 16; deck row with pills beside it (left uses `flex-row-reverse`) or below.
- Deck: width `cardWidth`, max 100%, `aspect-ratio`, `perspective: 1400px`, radius 24, bottom margin `yBack·2.2` when pills are at the bottom, `touch-action: none` (auto when scroll-linked), focusable. Inner layer `preserve-3d`.
- Glow: absolute `-inset-10`, rounded, `blur(48px)`, scale 0.75, opacity `glowIntensity`, background animating to the active accent over 0.8s.
- Card (`<article>`): absolute inset 0, overflow hidden, `background: cardColor` (default `#16161a`), z-index `total − index`, transform-origin bottom centre (top centre when exiting down). Text colour by luminance `(r·299 + g·587 + b·114)/1000 > 150`: light cards get `#1d1d1f` / muted `rgba(29,29,31,.72)`, dark ones white / `rgba(255,255,255,.74)`.
- Art: with `(cx, cy)` per index from `[78,22,64,34]` and `[24,70,82,30]` %: radial gradients `60% 75% at cx cy, accent+55 → transparent 70%` and `40% 50%` at the mirrored point with `accent+22`; five concentric 1px circles (r 40 + k·34, stroke opacity 0.22 − k·0.035) in an SVG 340×220 `preserveAspectRatio="none"`; a 1.5px top highlight `rgba(255,255,255,.10)` and a bottom shade `transparent 40% → rgba(0,0,0,.35)`. Optional `imageUrl` at 40% opacity, `mix-blend-mode: luminosity`.
- Content padding `clamp(16px, 6cqw, 26px)`, column, space-between. Top: "01 / 04" (12px semibold tabular, tracking 0.08em, total muted) and the tag pill (11px semibold, padding 4×10, `rgba(255,255,255,.12)` or `rgba(0,0,0,.07)` on light). Bottom: accent bar (36×3, rounded, `box-shadow 0 0 14px accent`), title `clamp(20px, 8cqw, 30px)` semibold, line-height 1.05, tracking −0.035em, description 13px, line-height 1.45, max-width 92%, muted.
- Pills: buttons with 6px padding; pill 7px thick, length 22 (active) → 7, opacity 1 → 0.35 by distance from progress, `#1d1d1f` / `#f5f5f7` or `indicatorColor`.

## Motion

- `target` motion value (card index) feeds `progress = useSpring(target, { stiffness: 260 − 170s, damping: 22 − 8s, mass 0.9 })` (reduced motion 1000/100). Per card `depth = progress − index`.
- Mappings on depth: scale `[-3,-2,-1,0,0.5,1] → [sb−0.12, sb−0.06, sb, 1, 1.02, 0.94]`; y `[-3,-2,-1,0,1] → [3yb, 2yb, yb, 0, dir·260]` (dir −1 up, +1 down); z `[-3,-1,0,0.5,1] → [1.6zb, 0.5zb, 0, 90, 160]`; opacity `[-3.6,-3,-1,0,0.55,0.95] → [0,0.6,1,1,1,0]`; peel `[0,1] → [0, rotExit]` (negated for down); black scrim `[-3,-1,0,1] → [0.55,0.3,0,0.2]`; shadow `0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -24px rgba(0,0,0,a)` with a 0.18 behind, 0.1 leaving, 0.42 front.
- `near = depth [-1,0,1] → [0,1,0]`, `behind = min(1, −depth)` when negative. `rotateX = peel + lean·behind + tiltX·near`, `rotateY = tiltY·near`.
- Lean: `useSpring(clamp(velocity(progress)·5, −16, 16), { 180, 14 })`, sign flipped for down; 0 under reduced motion.
- Tilt (mouse only): tiltY = (x% − 0.5)·10°, tiltX = −(y% − 0.5)·8°, springs 150/18; leave resets. Glare: `radial-gradient(60% 60% at {50 + 4·tiltY}% {50 − 4·tiltX}%, rgba(255,255,255,.14), transparent 70%)` at opacity `near`. Accent bar opacity and `scaleX` follow `near` from the left.

## Interaction and states

- Pan: step = `cardHeight·0.7` (negative for up). `target = clamp(start + offset.y/step, −0.3, last + 0.3)`. On end, inertia with velocity `velocity.y/step`, power 0.2, timeConstant 180, bounce 300/30, `modifyTarget` rounding within ±2 cards of the start and clamped to range.
- Wheel (non-passive, off when scroll-linked): use the dominant axis; at either end let the page scroll; else prevent default, `target += d/320`, snap to the nearest card 120ms after the last event.
- Keys: ArrowDown/Right/PageDown/Space next; ArrowUp/Left/PageUp previous; Home/End.
- Scroll-linked: root `sectionHeight`vh with a sticky top stage of `viewportHeight` (overflow hidden, 16px side padding); `useScroll` offset `["start start", "end end"]` sets `target = progress·last`. Pan, wheel and keys are ignored.
- `onChange` fires when `round(progress)` changes.

## Autoplay demo

Every 2400ms advance one card, wrapping to the first. Any pointer down, pill press or key stops it for good.

## Accessibility

- Deck `role="region"`, `aria-roledescription="card deck"`, `aria-label="Card deck"`, focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset. Non-front cards `aria-hidden`. Polite live region "Card {n} of {total}: {title}". Pills in a group "Choose card", each "Show {title}".

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. When the visitor moves the deck by dragging, using the mouse wheel over it, pressing the arrow, Page, Home or End keys, or picking a progress pill, `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 40% volume plays each time a new card comes to the front, never more often than every 40ms, so a fast flick gives a quick run of clicks. The autoplay deal and scroll-linked mode (page scroll) make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Back cards recede smaller, lower and darker; the front card tilts and glints under the mouse.
- Advancing peels the front card up and away while the next rises smoothly.
- The stack leans back during motion and springs upright after.
- Flings deal at most two cards; wheel snaps 120ms after stopping and releases the page at the ends.
- Pills stretch for the active card; keys, Home and End work.
- The glow cross-fades to each card's accent.
- `scrollLinked` deals the deck while a sticky stage scrolls past.
- Reduced motion removes lean and peel overshoot.
