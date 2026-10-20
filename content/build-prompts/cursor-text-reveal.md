Build a text card with an ink lens that follows the pointer. The card shows a big sentence in dark ink on white; inside a round lens that trails the pointer, the colours invert and a second sentence shows through in exactly the same position. The lens drags a tail of three smaller droplets on looser and looser springs, so fast moves stretch it into a drip that catches up when you stop. Press and hold (or Space) and the ink floods the whole card; let go and it shrinks back with an overshoot. A thin blue ring outlines the lens. An image mode swaps the ink for a photo or a bright gradient.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper (tailwind-merge), framer-motion (`animate`, `motion`, `useMotionTemplate`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`).
- File: `components/cursor-text-reveal/cursor-text-reveal.tsx`, named export `CursorTextReveal` (also default), type `CursorTextRevealProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `baseText` | `string` | required | Visible sentence. |
| `revealText` | `string` | `baseText` | Sentence inside the lens. |
| `backgroundImage` | `string` | — | Optional image behind the base text (cover). |
| `backgroundPosition` | `string` | `"center"` | Its position. |
| `revealImage` | `string` | — | Image inside the lens in image mode. |
| `revealImagePosition` | `string` | `"center"` | Its position. |
| `mode` | `"text" \| "image"` | `"text"` | Ink backdrop or image/gradient backdrop. |
| `maskSize` | `number` | `120` | Lens radius px while hovered. |
| `initialMaskSize` | `number` | `0` | Lens radius at rest (0 hides it). |
| `smoothness` | `number` | `0.18` | Clamped 0.04-0.6; higher drifts more. |
| `baseTextClassName`, `revealTextClassName` | `string` | — | Classes per text layer. |
| `containerClassName` | `string` | — | Card classes. |
| `className` | `string` | — | Classes on both text wrappers. |
| `fontSize` | `string` | `"clamp(2rem, 5.2vw, 3.6rem)"` | Both layers. |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Text alignment. |
| `enableGlow` | `boolean` | `true` | Ring round the lens. |
| `revealBackgroundClassName` | `string` | — | Replaces the lens backdrop. |
| `autoplay` | `boolean` | `false` | Lens traces a figure-eight until a pointer arrives. |
| `showAmbient`, `showGrid` | `boolean` | — | Deprecated, ignored. |

## Layout and look

- Card: `relative isolate flex`, min-height 320px (380px from `sm`), full width, `cursor: none`, `touch-action: pan-y`, overflow hidden, radius 24, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `rgba(0,0,0,.8)`). Focus ring 2px `#0071e3` (dark `#0a84ff`), 2px offset.
- Text wrapper (identical for both layers so the sentences line up): `relative z-10`, centred, max-width 64rem, flex-1 column, justify centre, padding 48px vertical and 24px sides (40px from `sm`); alignment classes `text-left items-start` / `text-center items-center` / `text-right items-end`.
- Sentence `<p>`: max-width 18ch, `text-balance`, semibold, tracking −0.04em, line-height 1.02 (only if the caller did not pass a `leading-*` class), no selection, centred with auto margins (or `ml-auto` when right-aligned). Base colour `#1d1d1f` (dark `#f5f5f7`).
- Reveal layer: absolute inset 0, z 20, pointer-events none, `aria-hidden`, masked. Backdrop: `#1d1d1f` (dark `#f5f5f7`) in text mode with text white (dark `#1d1d1f`). Image mode: the `revealImage` (cover) or `radial-gradient(120% 90% at 30% 20%, #ffd60a 0%, #ff9f0a 24%, #ff375f 48%, #bf5af2 70%, #0a84ff 100%)`, text white with `text-shadow: 0 8px 30px rgba(0,0,0,.25)`.
- Ring (z 30): a circle of diameter `2·radius` centred on the lens, shadow `0 0 0 1px rgba(0,113,227,.35), 0 12px 32px -8px rgba(0,0,0,.35)` (dark `rgba(10,132,255,.45)` / `rgba(0,0,0,.6)`), opacity `min(1, radius/40)` and 0 while flooding.

## Motion

- Pointer target `x, y` (card-local). Lens centre springs: `stiffness = round(95/s)`, `damping = round(22 + 70s)`, `mass = 0.45 + s` with s the clamped smoothness.
- Droplet chain, each spring following the previous one: drop 1 radius `0.6R` (stiffness 170, damping 19), drop 2 `0.4R` (130/17), drop 3 `0.24R` (100/15). Droplet radii are 0 while flooding.
- Mask: four hard circles joined with commas, each `radial-gradient(circle {r}px at {x}px {y}px, #000 calc(100% − 1.5px), transparent 100%)` built with `useMotionTemplate`; set both `mask-image` and `-webkit-mask-image`. Clamp radii to at least 0.01.
- Radius `R` animates with a spring stiffness 260, damping 20, mass 0.8 (reduced motion: instant). Enter grows to `maskSize`; leave shrinks to `initialMaskSize`.
- Flood: on press, R springs to the card diagonal `hypot(w, h)`; on release back to `maskSize`, overshooting naturally.

## Interaction and states

- `pointerenter`/`pointermove` set the target and mark the card touched; enter grows the lens unless flooding. `pointerleave` ends flooding and shrinks. `pointerdown` floods, `pointerup`/`pointercancel` release.
- Keyboard: Space or Enter toggles the flood (prevent default). Focus without a pointer grows the lens at the centre; blur ends a flood.
- The lens is parked at the card centre on mount and on resize (ResizeObserver) until a pointer arrives.

## Autoplay demo

When `autoplay` and motion allowed, grow the lens to `maskSize` and drive the target on rAF along a figure-eight: `x = w/2 + sin(0.9t)·0.32w`, `y = h/2 + sin(1.8t)·0.18h`. Stop as soon as the pointer touches the card. Preview: "The first rule of motion is clarity." revealing "The second rule is feeling.", maskSize 92, fontSize 40px, min-height 280px.

## Accessibility

- Card `role="group"`, `aria-roledescription="reveal card"`, `tabIndex 0`, `aria-label="{baseText} Press Space to reveal: {revealText}"`. The reveal layer, ring and background image are `aria-hidden`.

## Acceptance checklist

- The lens follows the pointer and shows the inverted second sentence aligned with the first.
- Quick moves stretch a tail of three shrinking droplets that catch up when you stop.
- Press and hold floods the card; release springs back with overshoot.
- Space/Enter toggles the flood from the keyboard.
- Leaving the card shrinks the lens to `initialMaskSize`.
- Image mode shows the gradient (or `revealImage`) with white text.
- `smoothness` changes how far the lens lags.
- Autoplay draws a figure-eight until the pointer arrives; reduced motion snaps sizes instantly.
