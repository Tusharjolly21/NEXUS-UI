# Magnetic Button

Build a button with pull. As the pointer approaches, the whole button leans toward it and the label leans a little further, so the two layers separate like a magnet tugging a cap. On hover, ink floods into the button from exactly the point where the pointer entered, and when the pointer leaves the ink drains back toward the point where it left. Pressing squashes it. It should feel like a small physical object, not a colour swap, and it must still be an ordinary button by keyboard.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), `cn` from `@/lib/utils`, `useSound` from `@/lib/ui-sounds`.
- File: `components/glow-button/magnetic-button.tsx`. Named export `MagneticButton` plus the exported type `MagneticButtonProps`. Re-export both from the folder's `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `children` | `ReactNode` | "Get started" and a 14px right arrow | The label. Rendered in a flex row with an 8px gap. |
| `variant` | `"solid" \| "outline"` | `"solid"` | Solid ink pill that floods blue, or white outlined pill that floods ink. |
| `strength` | `number` | `0.35` | Lean as a fraction of the distance from the button centre to the pointer. |
| `onClick` | `() => void` | none | Called on press. |
| `aria-label` | `string` | none | Accessible name when the label is not enough. |
| `autoplay` | `boolean` | `false` | Ghost-pointer demo loop until the first real interaction. |
| `enableSound` | `boolean` | `true` | Soft tap on press. |
| `className` | `string` | none | Extra classes on the button. |

## Layout and look

- Outer wrapper: an `inline-flex` span with `padding: 24px`. It is the invisible field that starts the pull before the pointer touches the button. It owns the pointer-move and pointer-leave handlers for the lean.
- Button: `motion.button`, `type="button"`, 48px tall, fully rounded, 28px horizontal padding, 15px font, weight 500, `overflow: hidden`, `isolate`, pointer cursor.
- Solid: background `#1d1d1f`, text white. Dark mode: background `#f5f5f7`, text `#1d1d1f`.
- Outline: background white, text `#1d1d1f`, ring `0 0 0 1px rgba(0,0,0,.1)`. Dark mode: background `#1c1c1e`, text `#f5f5f7`, ring `0 0 0 1px rgba(255,255,255,.14)`.
- Ink: a 300px circle, absolutely positioned inside the button with `z-index: -1` (so it sits above the button's own background but under the label), `pointer-events: none`, `aria-hidden`. Solid: `#0071e3` in both modes. Outline: `#1d1d1f` (dark `#f5f5f7`).
- While ink is filling, the label turns white (outline in dark mode turns `#1d1d1f` so it stays readable on the light ink), with a 200ms colour transition.
- Focus: `focus-visible` outline 2px, offset 2px, `#0071e3` (dark `#0a84ff`).

## Motion

- Lean: two motion values (`mx`, `my`) hold the target offset `(pointer - buttonCentre) * strength`. The button follows them through `useSpring` with stiffness 220, damping 16, mass 0.6. The label's offset is the spring value times 0.5, applied on an inner span.
- On pointer leave of the wrapper the targets return to 0 and the spring settles with a little overshoot.
- Ink enter: on pointer enter of the button, place the circle so its centre is at the entry point (`left = x - 150`, `top = y - 150`, in button coordinates) and scale it from 0 to 1 over 0.45s, ease `[0.2, 0, 0, 1]`.
- Ink leave: on pointer leave, record the exit point and scale to 0 over 0.35s, ease `[0.4, 0, 0.2, 1]`, with `transform-origin` set to the exit point relative to the circle (`exitX - entryX + 150`, `exitY - entryY + 150`), so the ink drains toward where the pointer left. Remove the ink when that animation completes. A new entry replaces any ink still draining (give each ink a unique id as its `key`).
- Press: `whileTap` squashes to `scaleX 1.06, scaleY 0.92`; spring stiffness 500, damping 30.
- Reduced motion: no lean, no ink, no squash. Hover changes the background colour instead (solid goes to `#0071e3` with white text; outline goes to ink with white text, dark mode light with dark text), with the 200ms colour transition.

## Interaction and states

- Real `button` element: Tab focuses, Enter and Space press. Press calls `onClick`.
- Touch: pointer enter/leave still fire, so the ink floods on tap; the lean follows pointer move.

## Autoplay demo

Only while the component is on screen, the tab is visible and motion is not reduced, loop every 4.4s until any real pointer enters the wrapper, the button is focused or pressed:
1. At 0.3s: start ink from 12% of the width, 50% of the height, and lean toward a point `(0.2 * width * strength, -0.25 * height * strength)`.
2. At 1.5s: squash as if pressed (same scale as a real press) and play the tap sound through the `auto` variant of the play function.
3. At 1.75s: release the squash.
4. At 2.5s: drain the ink toward 92% width, 40% height and return the lean to 0.
Do not call `onClick` from the demo.

## Accessibility

- Native button; the label is the accessible name (or `aria-label`). The ink is decorative and `aria-hidden`.
- Visible 2px focus outline in both modes. Colours: solid text on ink is 17:1; on the blue flood white is 4.8:1.
- Honours reduced motion as above.

## Sound

- Prop `enableSound` (default `true`).
- Pressing the button plays `tap` at volume 0.5, once per press. Nothing plays on hover, approach or ink movement.
- Autoplay plays the same `tap` at the demo's press moment through `play.auto`, which stays silent until the visitor has interacted with the page once.
- Sounds follow the site-wide switch and are synthesised in `@/lib/ui-sounds`, so no audio files are needed.

## Acceptance checklist

- [ ] Approaching the button from any side tugs it toward the pointer, and the label tugs further.
- [ ] Entering from the left floods ink from the left; leaving through the bottom drains it toward the bottom.
- [ ] Re-entering while ink drains starts a fresh flood from the new point.
- [ ] Press squashes wide and short, then recovers.
- [ ] Both variants look right on a white page and a black page, and the label stays readable while flooded.
- [ ] Tab shows a focus ring; Enter and Space call `onClick`.
- [ ] Under reduced motion there is no lean or flood, only a colour change on hover.
- [ ] Autoplay demonstrates lean, flood, press and drain, then stops for good once touched.
- [ ] Tap plays once per press and never on hover.
