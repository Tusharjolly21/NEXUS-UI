Build a parallax landscape made of paper-cut layers that lives inside its own scroll frame. As the visitor scrolls inside the card, four mountain ridges rise at different speeds, the sun sinks behind them, the sky warms into a sunset and the heading drifts up and fades. When scrolling stops, the layers settle on a soft spring with a small overshoot, so the depth feels like jelly rather than a slideshow. It also accepts custom layers to build any parallax scene.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS (container queries), framer-motion (`motion`, `animate`, `useScroll`, `useSpring`, `useTransform`, `useMotionValue`, `useMotionValueEvent`, `useMotionTemplate`, `useReducedMotion`).
- File: `components/motion-layer-scroller/motion-layer-scroller.tsx`, named export `MotionLayerScroller`, exported types `MotionLayerScrollerProps` and `LayerConfig`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `layers` | `LayerConfig[]` | – | Custom layers. Omit for the built-in landscape; `[]` shows only the heading. |
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Scroll axis. |
| `scrollHeight` | `number` | `420` | Frame height in px. |
| `distance` | `number` | `1.6` | Scroll length in frame heights (or widths). |
| `perspective` | `number` | `1200` | Perspective (px) on the custom-layer wrapper. |
| `backgroundColor` | `string` | – | Replaces the sky gradient; heading turns `#f5f5f7`, description `#c7c7cc`. |
| `showGrid` | `boolean` | `false` | Faint 48px grid over the sky. |
| `showGlow` | `boolean` | `true` | Sun (moon in dark) and its glow; landscape only. |
| `heading` | `string` | `"Motion that moves people"` | Drifts up and fades. |
| `description` | `string` | `"Every layer travels at its own speed."` | Line under the heading. |
| `hint` | `string` | `"Scroll inside the scene."` | Shown until scrolled; `""` hides it. |
| `autoplay` | `boolean` | `false` | Scrolls down and back every few seconds until touched. |
| `className` | `string` | `""` | Classes on the frame. |

`LayerConfig = { id; content?: ReactNode; xRange?, yRange?, scaleRange?, rotateRange?, opacityRange?, blurRange?: [number, number]; zIndex?; className?; width?; height? }`. Each range maps progress 0 → 1 linearly (defaults: x/y/rotate/blur `[0,0]`, scale/opacity `[1,1]`); blur becomes `filter: blur(Npx)`; zIndex defaults to the index. Custom layers are absolutely positioned, `pointer-events: none`.

## Layout and look

- Frame: `@container`, full width, height `scrollHeight`, radius 24, `overflow: hidden`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`).
- Two stacked layers: the scene (`pointer-events: none`, `aria-hidden`) and on top an invisible native scroller (`absolute inset-0`, hidden scrollbar, `overscroll-behavior: contain`) whose only child is a spacer `scrollHeight × (1 + distance)` tall (horizontal: `(1 + distance) × 100%` wide). The scroller receives every wheel and swipe; the scene is driven from its progress.
- Sky: `linear-gradient(180deg, #9fd0ff 0%, #d7ecff 55%, #f6f3ee 100%)`; dark `#050a1c 0%, #0d1838 60%, #1a2550 100%`.
- Sunset overlay on top of the sky: `#ffb38a 0%, #ffd6a8 50%, #fff1e0 100%`; dark `#02030b 0%, #0b0f2a 60%, #24163f 100%`.
- Stars (dark only): 18 fixed white dots, 1–2px, opacity 0.4–0.9, scattered across the top 45% (e.g. 6%/12% 2px .9, 14%/30% 1.5px .6, 22%/8%, 31%/22%, 38%/6% …).
- Grid: 1px lines `rgba(0,0,0,.05)` (dark `rgba(255,255,255,.06)`) every 48px.
- Sun at left 70%, top 34%: a 64px disc `linear-gradient(160deg, #ffe29a, #ffad5a)`, shadow `0 0 40px rgba(255,170,80,.6)`; glow extending 64px beyond it, `radial-gradient(circle, rgba(255,196,110,.55), transparent 65%)`. Dark moon: `#ffffff → #c9d4ee`, shadow `0 0 40px rgba(200,215,255,.45)`, glow `rgba(200,215,255,.28)`.
- Cloud (light only) at left 10%, top 40%: a 112×24 pill and a 64×32 pill overlapping above it (offset 32px right, −36px up), white at 80%, 1px blur.
- Four ridges, each an SVG `viewBox 0 0 600 400`, `preserveAspectRatio="xMidYMin slice"`, full width (160% wide when horizontal), full height, the ridge line along the top and solid below:
  1. top 50%, speed k 0.1, `#b9d3ee` (dark `#25365f`): jagged zigzag peaks between y≈18 and 70.
  2. top 59%, k 0.25, `#8fb3dd` (dark `#1c2a4d`): smooth rolling cubic hills, y≈20–86.
  3. top 69%, k 0.45, `#86c59c` (dark `#14203a`): broader smooth hills, y≈10–84.
  4. top 81%, k 0.66, `#3f8a5e` (dark `#0b1426`): gentle wave with three thin pointed spikes (pine trees) rising to y≈6–18.
- Heading block at top 14%, centred, padding 0 24px: heading `clamp(22px, 6.4cqw, 38px)`, semibold, leading 1.05, tracking −0.035em, `#1d1d1f` (dark `#f5f5f7`); description 14px, max 34ch, 8px gap, `#424245` (dark `#c7c7cc`).
- Progress rail: 4×64px pill at right 12px, vertically centred (horizontal: 64×4 at bottom 12px, centred), `rgba(0,0,0,.1)` (dark `rgba(255,255,255,.15)`), filled with `#1d1d1f` at 70% (dark `#f5f5f7` at 80%).
- Hint: bottom 16px, centred, pill, padding 4×12, 12px medium, white 90% with backdrop blur, shadow `0 6px 16px -8px rgba(0,0,0,.35)`; dark `#2c2c2e` at 90%, `#f5f5f7`.

## Motion

- Read `scrollYProgress` (or `scrollXProgress`) from `useScroll({ container })` and mirror it into a plain motion value `raw` via `useMotionValueEvent` so all transforms run in JS. `p = useSpring(raw, { stiffness: 85, damping: 11, mass: 0.8 })` (the jelly overshoot); under reduced motion `p = raw`.
- `travel = scrollHeight × 0.3`. Each ridge moves by `−p × k × travel` on y (x when horizontal), so nearer ridges rise faster.
- Heading: y `−p × 1.5 × travel`; opacity maps `p` 0 → 0.55 to 1 → 0.
- Sun: y `+p × scrollHeight × 0.4` (it sinks). Cloud: x `p × 60`.
- Sunset overlay opacity = `raw` (0 → 1); stars opacity `raw` 0 → 1 mapped to 0.55 → 1.
- Hint opacity: `raw` 0 → 0.06 maps 1 → 0. Rail fill scale `raw` 0 → 1 maps 0.08 → 1, origin at the start.
- Custom layers use `p` for all their ranges.

## Interaction and states

- Wheel, touch, pointer and keys all go to the real scroller, so native momentum and keyboard scrolling work. Any wheel, pointerdown, touchstart or keydown on it marks the scene as touched.
- Reduced motion: no spring, `travel` and sun movement become 0 (ridges, heading and sun stay put); colour fades, hint and rail still follow scroll.

## Autoplay demo

Every 3s (until touched), alternately animate the scroller's `scrollTop` (or `scrollLeft`) to 92% of its maximum and back to 0, over 1.5s with ease `[0.45, 0, 0.2, 1]`, writing the value in `onUpdate` only while untouched. On touch, clear the interval; on unmount stop the animation.

## Accessibility

- The scroller is focusable (`tabIndex 0`), `role="region"`, label "{heading}. Scroll to move through it." (or "Layered scene…"), inset 2px focus ring `#0071e3` (dark `#0a84ff`). The visual scene, rail and hint are `aria-hidden`.

## Acceptance checklist

- Scrolling inside the card moves ridges at four distinct speeds; the page itself does not scroll while inside.
- On stopping, layers overshoot slightly and settle.
- The sun sinks, the sky blends into the sunset palette and the heading fades out by about 55% progress.
- The hint disappears as soon as scrolling starts; the rail fills with progress.
- Dark mode shows a moon, stars and navy ridges.
- Horizontal direction scrolls sideways with wider ridges.
- Custom `layers` replace the landscape and animate from their ranges.
- Autoplay sweeps down and back, stopping on first touch.
