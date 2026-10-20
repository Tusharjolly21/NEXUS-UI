Build a headline card where one phrase has a hyperdrive. The phrase sits inside a thin "selection box" with four little corner handles, like a design-tool selection. Hover, focus or tap it and a starfield inside its box spools up on a spring: the box darkens to deep space, stars stretch into streaks as speed builds and overshoot into the jump, the text turns white, and the phrase squashes and stretches with the kick. Let go and it drops out of warp with a sideways jolt. Ship two pieces: the card and the phrase trigger.

## Stack

- React client components (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), a 2D `<canvas>`, and a `cn` class-merge helper.
- File: `components/warp-speed-card/warp-speed-card.tsx`, named exports `WarpSpeedCard` and `WarpTextTrigger`, types `WarpSpeedCardProps` and `WarpTextTriggerProps`.

## API

`WarpSpeedCard`: `children: ReactNode` (usually a heading containing a trigger), `className?` (card), `contentClassName?` (inner relative wrapper).

`WarpTextTrigger`:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | – | The phrase. |
| `className` | `string` | – | Classes for the phrase box. |
| `beamColor` | `string` | `"255,255,255"` | Star colour as an "r,g,b" triplet. |
| `onWarpChange` | `(warping: boolean) => void` | – | `true` when the jump starts, `false` when it drops out. |
| `autoplay` | `boolean` | `false` | Jumps every few seconds until the phrase is hovered, focused or tapped. |

Usage: a centred `<h2>` "Build amazing websites<br/>at <WarpTextTrigger>warp speed</WarpTextTrigger>" inside the card with padding 56px × 24px, 36px (40px from `sm`), semibold, leading 1.14, tracking −0.035em.

## Layout and look

- Card: relative, `overflow: hidden`, radius 24, white, text `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e`, `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Trigger: a span, `inline-block`, baseline-aligned, `white-space: nowrap`, no selection, default cursor, focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset (dark offset colour `#1c1c1e`).
- Space layer (behind the text, aria-hidden): extends 8px left/right and 4px up/down, radius 6, `overflow: hidden`. Contains a background `radial-gradient(120% 120% at 50% 50%, #1c1c3a 0%, #05050a 70%)` with opacity = `space`, and the canvas filling it.
- Text: the phrase in its normal colour, plus an absolutely stacked white copy (aria-hidden) whose opacity = `space`, so the phrase cross-fades to white as the box goes dark.
- Selection frame (on top, same −8/−4 inset, aria-hidden): a 1px border at 60% opacity, radius 6, and four 7×7 handles at the corners (offset −4px), radius 2, 1.5px border, filled white (dark `#1c1c1e`). The border and handle colour interpolate from `#0071e3` at rest to `#8e8e93` while warping.

## Motion

- Engagement: `target` 0/1 → `speed = useSpring(target, stiffness 70, damping 11, mass 1)` (it overshoots past 1 on the way in and dips below 0 on the way out). `space = clamp(speed × 2.2, 0, 1)`, so the box goes dark quickly at the start of the spool.
- Kick on engage: `animate(scaleX, 1, spring 420/11, velocity 2.2)` and `animate(scaleY, 1, spring 420/11, velocity −2.2)`. The phrase stretches wide and flat and wobbles back.
- Drop out: `animate(jolt, 0, spring 500/9, velocity −140)` on the phrase's x. It lurches left and shakes back.
- Starfield: 140 stars with deterministic positions from a seeded Park–Miller generator (`seed = seed × 16807 mod 2147483647`, start 11): x, y in −1…1, z in 0.1…1. Canvas sized to the box with DPR ≤ 2 (ResizeObserver). Each frame (dt ≤ 50ms):
  - `v = max(0, speed)`, focal `f = max(w, h) × 0.5`, centre (w/2, h/2).
  - Advance `z −= (0.08 + v × 2.6) × dt` (× 0.4 instead of 2.6 under reduced motion). When `z ≤ 0.02`, respawn at a new random x, y with z = 1 and skip drawing it this frame.
  - Head: `(cx + x/z × f × 0.5, cy + y/z × f × 0.5)`. Tail: same with `tail = min(z_previous + v × 0.22, 1.2)` in place of z. Higher speed means longer streaks.
  - Alpha `min(1, (1 − z) × 1.4) × min(1, 0.35 + v)`, line width `max(0.6, (1 − z) × 1.8)`, round caps, stroke `rgba(beamColor, alpha)`.
  - Keep looping while engaged or `|v| > 0.002`; otherwise clear and sleep. Engaging wakes the loop.

## Interaction and states

- Mouse: pointerenter engages, pointerleave disengages. Touch/pen: pointerdown toggles. Focus engages, blur disengages. Enter/Space toggles (with `preventDefault`). Any of these marks the trigger touched (ends autoplay).
- Engaging when already in that state does nothing. On change, update `aria-pressed` directly on the element and call `onWarpChange`.
- Reduced motion: no squash/stretch or jolt; stars drift slowly; the dark box and white text still fade in so the state is visible.
- Clean up the ResizeObserver, frame and timers on unmount.

## Autoplay demo

800ms after mount, engage; disengage 1.7s later. Repeat every 4s. Stop as soon as the user hovers, focuses or taps the phrase.

## Accessibility

- The trigger is `role="button"`, `tabIndex 0`, `aria-pressed` reflecting warp state. Space layer, canvas, the white duplicate and the selection frame are `aria-hidden`, so the phrase is read once.

## Acceptance checklist

- At rest "warp speed" sits in a blue hairline box with four white corner handles.
- Hovering darkens the box to deep space, turns the text white and stretches stars into streaks from the centre outward.
- The phrase visibly squashes and stretches on engage; leaving makes it jolt sideways as the stars slow down and fade.
- Speed overshoots: streaks briefly get longer than their resting warp length right after the jump.
- Tapping toggles on touch; Enter/Space toggle on keyboard; `onWarpChange` fires both ways.
- The canvas loop stops when idle.
- Autoplay jumps every 4s until first interaction; dark mode recolours the card and handles.
