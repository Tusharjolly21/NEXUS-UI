Build an onboarding "What are you into?" card where the interest tags are real physical objects. The tags fall into a soft grey tray as rounded pills that tumble, stack and slide. The user can grab and throw any pill, press Shake to toss them all into the air, and tap a pill to pick it: it hops up and fills with the accent colour. A row of picked chips and a Continue button sit underneath. Apple-light, with real weight.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`) and **matter-js** for the rigid-body physics (`import Matter from "matter-js"`).
- File: `components/tag-pit/tag-pit.tsx`, named export `TagPit`, exported `TagPitProps`.
- Pills are DOM `<button>`s positioned every frame from matter-js bodies (no canvas). Engine, bodies, drag constraint and picks live in refs; `picked: number[]` is also state.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `tags` | `string[]` | 16 interests: Design, Motion, Typography, 3D, Photography, AI, Music, Startups, Travel, Coffee, Gaming, Writing, Code, Film, Architecture, Fitness | One pill per tag, sized to its label. |
| `min` | `number` | `3` | Picks needed to enable Continue. |
| `accent` | `string` | `"#0071e3"` | 6-digit hex for picked pills, chips and Continue. |
| `autoplay` | `boolean` | `false` | Demo picks and shakes until the user touches anything. |

Rebuild the world only when the tag contents change (key the effect on `tags.join("\u0000")`).

## Layout and look

- Card: 380px wide (`max-width: 100%`), radius 24, padding 20, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, ring `rgba(255,255,255,.08)`. `user-select: none`.
- Header row: title "What are you into?" 17px semibold, tracking −0.02em, `#1d1d1f` (dark `#f5f5f7`); subtitle "Pick {min} or more. Throw the rest around." 13px `#6e6e73` (dark `#a1a1a6`). Right: Shake button, 32px tall, fully rounded, 12px horizontal padding, 12px medium, `#f0f0f3` / `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`), with a 13px two-wave icon (second wave at 40% opacity).
- Tray: 16px below, full width, aspect ratio 340 / 260, radius 18, `#f5f5f7`, inset shadow `inset 0 2px 6px rgba(0,0,0,.08), inset 0 -1px 0 rgba(255,255,255,.8)`; dark `#000` with `inset 0 2px 6px rgba(0,0,0,.6), inset 0 -1px 0 rgba(255,255,255,.06)`. `overflow: hidden`, `touch-action: none`. Inside, a fixed 340×260 layer scaled by `trayWidth / 340` (ResizeObserver, `transform-origin: top left`), so physics always runs in 340×260 units.
- Pills: 36px tall, fully rounded, 14px semibold, width = measured label width (canvas `measureText` with `600 14px` system font) + 34px. Off: white, `#1d1d1f`, shadow `0 1px 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.06)`; dark `#2c2c2e`, `#f5f5f7`, `0 1px 2px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)` (use CSS variables since these are inline styles). On: accent fill, white text, shadow `0 6px 16px -6px {accent}aa, inset 0 1px 0 rgba(255,255,255,.25)`, and a 12px check icon before the label. 200ms transition on background, colour and shadow. Cursor grab / grabbing.
- Footer (16px below): left, the last 4 picks as chips (12px medium, padding 4×10, rounded, text accent, background accent at 8%; dark: accent at 24% and text mixed 55% accent / 45% white), then "+N" in `#86868b` if more than 4; "Nothing picked yet" (13px `#86868b`, dark `#8e8e93`) when empty. Right: Continue, 36px tall, 16px padding, 13px semibold, rounded; disabled `#e8e8ed` / `#86868b` (dark `#2c2c2e` / `#8e8e93`) showing "{count}/{min}"; enabled accent / white showing "Continue", 300ms colour transition.

## Motion

- Engine gravity (0, 1.1). Fixed-step loop: accumulate `min(100, frame ms)`, run up to 4 `Engine.update(engine, 1000/60)` steps per frame, drop leftover above one step. Each frame set each pill's `width` and `transform: translate(x − w/2, y − 18) rotate(angle rad)`.
- Static walls (friction 0.4, restitution 0.2): floor at (170, 290) 680×60; left at (−30, −70) and right at (370, −70), both 60×660; ceiling at (170, −350) 680×60.
- Pill bodies: rectangle w×36, chamfer radius 17.5, restitution 0.35, friction 0.3, frictionAir 0.012, density 0.002. Start x = `w/2 + 4 + ((i·97) mod (340 − w − 8))`, y = `−40 − i·16`, angle `((i mod 5) − 2)·0.2`. They rain in and settle on load.
- Tap/pick: velocity (random ±1.5, −6.5) when picking, (±1.5, −2.5) when unpicking; angular velocity random ±0.15.
- Shake: framer animates the tray `x: [0,−10,9,−7,5,−2,0]`, `rotate: [0,−1.2,1,−0.6,0.4,0]` over 0.6s; every body gets velocity (random ±3.5, −3 to −7.5) and angular velocity ±0.2.
- Drag: on pointer down add a constraint from the pointer (tray units) to the grabbed point on the body, stiffness 0.12, damping 0.08, length 0; move `pointA` with the pointer; remove on up. Releasing while moving throws the pill.
- Chips: `AnimatePresence mode="popLayout"`, `layout`, enter from y −14 scale 0.6, exit to y 10 scale 0.6, spring 500/26. Shake button `whileTap` scale 0.92 rotate −8; Continue `whileTap` scale 0.95 when enabled.
- Run the loop only while the tray is on screen (IntersectionObserver) and `!document.hidden`; reset the clock on resume. On unmount cancel the frame, disconnect observers and clear the engine and world.

## Interaction and states

- Pointer down on a pill captures the pointer and grabs it. If the pointer moved less than 5px before release, it's a tap: toggle the pick. Otherwise it's a throw only.
- Keyboard/assistive clicks (`event.detail === 0`) toggle directly.
- Reduced motion: Shake skips the tray wobble (the bodies still get thrown, as the user asked).

## Autoplay demo

Every 1.5s step through: pick #1, #3, #0, shake, #5, unpick #1, shake, repeating. Stop for good once the user presses a pill or Shake. Under reduced motion the demo still toggles picks but without hops and skips the shakes.

## Accessibility

- Tray `role="group"` labelled "Interests". Every pill is a native button with `aria-pressed`; focus ring 2px with 2px offset.
- Shake and Continue are native buttons with visible focus rings (`#0071e3`, dark `#0a84ff`); Continue is `disabled` until `min` picks.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Picking a pill (by tap, or Enter or Space on it) plays `pop` at 60% volume (a sine rising from 320 to 980 Hz in 70ms); putting a picked pill back plays `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 50% volume. Dragging and throwing pills and the Shake button make no sound. The autoplay picks play the same `pop` at 60% (and `tick` at 50% when it puts a pill back); the autoplay shaking is silent, like the Shake button. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Pills fall in and settle without overlap when the card scrolls into view.
- Pills can be dragged and thrown and stay in the tray.
- A tap picks a pill: it hops, fills with the accent and shows a check; tapping again unpicks it with a smaller hop.
- Shake wobbles the tray and tosses every pill.
- The chip row shows the last four picks plus "+N"; Continue enables at `min` picks.
- Physics pauses off screen and in hidden tabs; no loops survive unmount.
- Dark mode recolours card, tray, pills, chips and buttons.
