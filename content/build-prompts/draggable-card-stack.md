Build a messy pile of tall photo cards you can fling. The top card lies flat; the ones under it are slightly smaller and tilted at different angles, like prints tossed on a table. Grab the top card and throw it in any direction: it leans into the throw, flies off, then tucks back under the pile, while the next card pops up to the top with a little overshoot. As you drag, the card underneath swells slightly in anticipation. The arrow keys send the top card away or pull the bottom one back. Images, videos or built-in drawn landscapes all work.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`animate`, `motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`, `useVelocity`, `PanInfo`).
- File: `components/draggable-card-stack/draggable-card-stack.tsx`, named export `DraggableCardStack` (also default), types `StackCard`, `DraggableCardStackProps`.

## API

`StackCard = { id: string; title?: string; subtitle?: string; media?: string; type?: "image" | "video"; bg?: string }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `StackCard[]` | 5 drawn scenes | Top to bottom. |
| `cardWidth` / `cardHeight` | `number` | `220` / `296` | px. |
| `borderRadius` | `number` | `22` | px. |
| `shadowStrength` | `number` | `1` | 0-1. |
| `stackOffset` | `number` | `0` | Extra px down per card. |
| `maxRotation` | `number` | `9` | Largest resting tilt (deg). |
| `depthScale` | `number` | `0.045` | Scale lost per depth. |
| `showOverlay` | `boolean` | `true` | Title/subtitle on the top card. |
| `hoverScale` | `number` | `1.03` | Top card scale on hover. |
| `transitionDuration` | `number` | — | Deprecated, ignored. |
| `onChange` | `(id: string) => void` | — | New top card id. |
| `hint` | `string` | `"Fling the top card. Arrow keys work too."` | `""` hides it. |
| `autoplay` | `boolean` | `false` | Flings left and right in turn until touched. |
| `autoPlay` | `boolean` | — | Deprecated alias. |
| `autoInterval` | `number` | `2400` | ms between flings (min 900). |
| `className` | `string` | `""` | Root classes. |

Default cards: Big Sur "Coast road at dusk", Lofoten "Blue hour over the bay", Kyoto "Lanterns after rain", Madeira "Above the cloud line", Wadi Rum "Sand at first light" (ids "1"-"5").

## Layout and look

- Root: flex column, centred, gap 16, max-width 100%.
- Stage: `cardWidth × cardHeight` (max-width 100%), relative, radius 24, focusable (2px `#0071e3` ring, dark `#0a84ff`, 8px offset on `#f5f5f7` / black).
- Each card: absolute inset 0, z-index `total − depth`. The face: white (dark `#2c2c2e`), overflow hidden, `borderRadius` px, shadow `0 0 0 1px rgba(0,0,0,.04), 0 {10+14s}px {20+30s}px −{10+6s}px rgba(0,0,0, 0.12+0.3s)` (s = shadowStrength), plus an inner `inset 0 0 0 1px rgba(255,255,255,.18)` hairline.
- Art: video (loop, muted, playsInline, preload metadata, cover), image (cover, not draggable), `bg` as a CSS background, or a drawn scene: a vertical sky gradient and an SVG (viewBox 100×140, `xMidYMid slice`) with a sun circle r 13 at cx `30 + (i mod 3)·20`, cy 48 (opacity .92), back hills `M0 92 C 18 78, 32 88, 50 80 S 82 70, 100 82 V140 H0Z` (opacity .85) and front hills `M0 108 C 22 98, 42 110, 64 102 S 90 96, 100 100 V140 H0Z`. Five palettes (sky top/bottom, sun, back/front hills): `#ffd3a5→#fd6585`, `#fff4d6`, `#c2416b`/`#7a1f4b`; `#a1c4fd→#c2e9fb`, white, `#5b8def`/`#2c5ac9`; `#fbc2eb→#a18cd1`, `#fff0fb`, `#7b5bd6`/`#4a2f9c`; `#d4fc79→#96e6a1`, `#fffbe0`, `#2f9e62`/`#1b6b44`; `#fddb92→#f6a04d`, `#fff7e0`, `#d0612d`/`#8f3416`.
- Overlay: bottom gradient `0deg rgba(0,0,0,.55) → transparent`, padding 48px top, 16px sides and bottom, white; title 19px semibold tracking −0.02em, subtitle 12px white/85.
- Under the stage (`aria-live="polite"`): "{position} / {total}" 13px semibold tabular `#1d1d1f` / `#f5f5f7` with the total in regular `#86868b` / `#98989d`; hint 12px `#6e6e73` / `#a1a1a6`.

## Motion

- Resting slot per depth d: `scale = 1 − min(d, 4)·depthScale`, `y = min(d, 4)·stackOffset + (d > 0 ? min(d, 3)·4 : 0)`, `rotate = TILT[d mod 6]·maxRotation` with `TILT = [0, −0.6, 0.45, −0.3, 0.7, −0.5]`, opacity 0 beyond depth 4. Spring stiffness 300, damping 15, mass 0.8 (reduced motion 600/60), so the new top card pops with overshoot.
- Drag (top only): `drag` both axes, `dragMomentum={false}`, `dragElastic={1}`, `touch-action: none`. Rotation = `clamp(x/14, −16, 16) + lean`, where lean = `useSpring(clamp(velocity(x)/140, −12, 12), { stiffness 260, damping 18 })` (0 under reduced motion): the card leans into the motion and springs flat.
- Anticipation: a shared `lift` value = `min(1, dragDistance/160)`; the card at depth 1 scales `1 + lift·depthScale`. Spring lift to 0 (300/26) on release.
- Release: a throw if distance > 110px or speed > 650px/s. Direction = velocity if either axis exceeds 200, else the offset. Otherwise spring back (420/26).
- Throw: normalise the direction; spring x and y to `dir·max(w, h)·1.25` (stiffness 110, damping 20, carrying the release velocity). After 230ms (0 under reduced motion) move the card to the back of the order and spring x/y home (170/22) so it slides under the pile.
- Hover: top card face scales to `hoverScale` (spring 400/24). Overlay fades in with `y 8 → 0` when a card becomes top (spring 300/26) and hides otherwise.
- Bring back: the last card moves to the top and slides in from `x = −1.3·width`, `y = −20` (spring 200/20).

## Interaction and states

- Order is an array of ids; reset it during render (not in an effect) when the set of card ids changes.
- Only one throw at a time (busy flag cleared when the card tucks in). `onChange` fires with the new top id after a throw or bring-back.
- Keys: ArrowRight, Space, Enter throw the top card up-right (direction (1, −0.25)); ArrowLeft brings the bottom card back (needs 2+ cards).
- Only the top card's video plays; others pause.

## Autoplay demo

Every `max(900, autoInterval)` ms throw the top card, alternating right (1, −0.25) and left (−1, −0.25). The first pointer down or key stops it permanently.

## Accessibility

- Stage `role="group"`, `aria-roledescription="card stack"`, `tabIndex 0`, `aria-label="Card stack, {title} on top. Right arrow sends it to the back, left arrow brings the last card back."`. Drawn scenes are `aria-hidden`; images have empty alt.

## Acceptance checklist

- Cards underneath are smaller and tilted alternately; the top is flat.
- Dragging tilts the card with its movement and swells the card underneath.
- A short drag snaps back; a long or fast one throws the card off in that direction.
- The thrown card tucks under the pile and the next pops up with overshoot.
- Right arrow throws, left arrow pulls the last card back in from the left.
- Counter and `onChange` follow the top card.
- Video cards play only on top.
- Reduced motion removes lean and overshoot.
