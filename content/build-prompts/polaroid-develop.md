# Polaroid Develop

Build an instant photo you develop by shaking it. The print starts as a grey, hazy, washed-out square; grab it and shake, and the faster you move it the quicker the haze clears and the colour, contrast and sharpness come through. The card swings on its own weight while you drag and snaps back to centre when you let go. Once it is fully developed, a handwritten caption writes itself along the bottom margin. It also develops very slowly on its own, like the real thing. The feel is tactile and a little playful, with a loose, swinging spring.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`drag`, `useMotionValue`, `useVelocity`, `useTransform`, `useSpring`, `useMotionValueEvent`, `animate`, `AnimatePresence`, `useReducedMotion`).
- File: `components/polaroid-develop/polaroid-develop.tsx`. Named export `PolaroidDevelop`, plus the `PolaroidScene` type and a `DEFAULT_POLAROID_SCENES` array.

## API

`PolaroidScene = { sky: [string, string]; sea: string; sun: string; land: string; caption: string }`.

`PolaroidDevelop` props:

- `src?: string`: a real photo to develop. Without it, draw the scenes below.
- `alt?: string`, default `""`.
- `caption?: string`: caption written under `src` once developed (no caption if omitted). Drawn scenes use their own `caption`.
- `scenes?: PolaroidScene[]`: drawn scenes cycled by "New photo". Default:
  - sky `#ffb38a` → `#ff6f91`, sea `#5b6fd6`, sun `#fff3c4`, land `#3d2a5c`, "Lisbon, at six"
  - sky `#a1e3ff` → `#e9f7ff`, sea `#2fa4b8`, sun `#ffffff`, land `#2f6b4f`, "Lagoon, day two"
  - sky `#ffd36e` → `#ff9f6b`, sea `#c2410c`, sun `#fff8e1`, land `#5d3a1a`, "Desert road"
- `onDeveloped?: (caption: string) => void`: called once when development reaches 100% (with the caption, or `alt` if there is none).
- `autoplay?: boolean`, default `false`.
- `className?: string` on the root.

State: a scene index `k` (scene = `scenes[k % scenes.length]`), a motion value `dev` from 0 to 1, and a boolean `done`.

## Layout and look

- Root: column, centred, 16px gap, `max-width: 100%`.
- Print (the draggable element): radius 6px, background `#fdfcf8` (dark `#2c2c2e`), padding 12px with 48px at the bottom, shadow `0 2px 4px rgba(0,0,0,.08), 0 24px 40px -18px rgba(0,0,0,.45)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 24px 40px -18px rgba(0,0,0,.9)`). `cursor: grab` (grabbing while active), `touch-action: none`, no text selection.
- Photo window: 200×180, `overflow: hidden`, background `#2a2622`. Three stacked layers:
  1. The image layer (absolute, filling) with motion-driven `filter` and `opacity`. With `src`, an `<img>` filling it with `object-fit: cover`, not draggable. Otherwise an SVG scene, viewBox `0 0 200 180`, filling the window:
     - Vertical linear gradient `sky[0]` → `sky[1]` on a 200×180 rect (gradient id unique per instance via `useId`).
     - Sun: circle at (132, 70), r 22, fill `sun`.
     - Sea: rect at y 100, 200×80, fill `sea`.
     - Three glints for i = 0..2: rect x `110 − 6i`, y `104 + 8i`, width `44 + 12i`, height 2, rx 1, fill `sun`, opacity `0.6 − 0.15i`.
     - Land: path `M0 120 C 30 96, 60 104, 86 118 S 130 140, 200 128 V180 H0Z`, fill `land`.
  2. Haze: absolute, filling, `linear-gradient(160deg,#5b5450,#2e2a27)`, opacity `1 − dev`.
  3. Vignette: absolute, filling, `box-shadow: inset 0 0 20px rgba(0,0,0,.25)`.
- Caption slot: a zero-height relative box under the window. The caption is absolutely placed at left 4px, top 12px, no wrapping, 18px, colour `#3a3a3c` (dark `#d1d1d6`), font-family `'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive` (system fonts only, nothing loaded).
- Footer row: 12px gap. A status text, 13px, `#86868b` (dark `#a1a1a6`): "Grab it and shake." or "Developed.". A "New photo" button: rounded-full, background `#f0f0f3` (dark `#2c2c2e`), padding 6px × 12px, 12px medium, text `#1d1d1f` (dark `#f5f5f7`).

## Motion

- Development mapping from `dev = d`:
  - image `filter: saturate(0.2 + 0.8d) contrast(0.7 + 0.3d) blur((1 − d) · 3px) brightness(1.25 − 0.25d)`
  - image opacity `0.15 + 0.85d`
  - haze opacity `1 − d`
- Drag: free 2D `drag`, `dragSnapToOrigin`, `dragElastic: 0.5`, `dragTransition: { bounceStiffness: 260, bounceDamping: 14 }`, `whileDrag: { scale: 1.04 }`. Position is driven by motion values `x`, `y`.
- Swing: `vx = useVelocity(x)`, `vy = useVelocity(y)`. Rotation = `useSpring(clamp(vx / 60, −14, 14), { stiffness: 200, damping: 14 })` degrees.
- Shake to develop: on every change of `vx`, compute `speed = hypot(vx, vy)`. If `speed > 300` and `dev < 1`, add `speed / 90000` to `dev` (capped at 1).
- Passive development: every 100ms add 0.004 to `dev` while below 1 (about 25s to full).
- When `dev` reaches 1 and `done` is false: set `done`, call `onDeveloped`.
- Caption: inside `AnimatePresence`, keyed by `k`, rendered when `done` and there is caption text. Enter by animating `clipPath` from `inset(0 100% 0 0)` to `inset(0 0% 0 0)` over 1.2s easeInOut (it writes left to right); exit to opacity 0.
- Shake keyframes (autoplay and keyboard): `animate(x, [-40, 36, -32, 30, -26, 22, -16, 10, 0], { duration: 1.6, ease: "easeInOut" })`. The resulting velocity both swings and develops the print.

## Interaction and states

- Drag and shake the print with mouse or touch. Starting a drag marks the component as touched and stops any running keyboard shake.
- "New photo": advance `k`, reset `dev` to 0 and `done` to false (with `src`, it re-develops the same photo).
- Keyboard: the print is focusable (`tabIndex 0`, `role="button"`). Enter or Space plays the shake keyframes (with reduced motion, adds 0.25 to `dev` instead). Does nothing once developed.

## Autoplay demo

With `autoplay`, every 2000ms: if `dev >= 1`, after 1600ms advance to a new photo (reset `dev` and `done`); otherwise play the shake keyframes (with reduced motion, add 0.25 to `dev` instead). A `touched` ref is set by drag start, the keyboard shake and "New photo"; the next tick clears the interval for good. Clear the interval, the pending timeout and the running animation on unmount.

## Accessibility

- Print `aria-label`: undeveloped "Undeveloped instant photo. Drag and shake it to develop, or press Enter to shake it."; developed "Developed photo: <caption or alt>".
- The status text is `aria-live="polite"`. The SVG scene and the drawn caption are `aria-hidden` (the label carries them).
- Focus rings: `focus-visible` 2px `#0071e3` (dark `#0a84ff`) on the print and the button; no default outline.

## Acceptance checklist

- [ ] The print starts grey and hazy; shaking it fast clears it in a few seconds, slow movement barely does.
- [ ] Left alone it still develops fully in about 25 seconds.
- [ ] Dragging swings the print up to ±14° and it springs back to centre on release.
- [ ] When fully developed the caption writes itself in left to right and the status reads "Developed.".
- [ ] "New photo" cycles the three scenes and resets the haze.
- [ ] Passing `src` develops a real photo with `object-fit: cover`.
- [ ] Enter/Space on the focused print shakes it.
- [ ] Autoplay shakes, waits, swaps photo, and stops for good once someone drags or presses anything.
- [ ] Two instances on a page use distinct gradient ids.
- [ ] Dark mode swaps the paper, caption, footer text, button and shadows; the photo is unchanged.
