Build a soft little character whose eyes follow the pointer anywhere on the page. It is a rounded body (squircle, pill or circle) with two eyes that sit on an imagined curved face: as the head turns they slide round the surface and narrow near the edge, like a 3D sphere seen in 2D. It blinks now and then (sometimes twice), widens its eyes and flinches when the pointer comes very close, dozes off with floating "z"s when left alone, and hops with a squash and stretch when poked. Charming, tactile and quiet.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion (`AnimatePresence`, `motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform` including the function form `useTransform(() => …)`).
- File: `components/cursor-buddy/cursor-buddy.tsx`, named export `CursorBuddy`, types `CursorBuddyProps`, `CursorBuddyShape`, `CursorBuddyEyes`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `shape` | `"squircle" \| "pill" \| "circle"` | `"squircle"` | Silhouette. |
| `fill` | `"light" \| "dark" \| string` | `"light"` | Preset body or any CSS colour. |
| `eyes` | `"dots" \| "slits" \| "squares"` | `"dots"` | Eye style. |
| `size` | `number` | `120` | Body height px (pill width is `round(size·1.45)`). |
| `follow` | `number` | `60` | How far the head turns, 0-100. |
| `sleepAfter` | `number` | `9000` | ms without pointer movement before sleeping; 0 never sleeps. |
| `eyeColor` | `string` | auto | Default `#17181a` on light bodies, `#ffffff` on dark. |
| `poke` | `boolean` | `true` | Click, tap, Enter or Space makes it hop. Off = decorative. |
| `onPoke` | `() => void` | — | Called after each poke. |
| `autoplay` | `boolean` | `false` | Looks around and hops until the pointer first moves. |
| `className` | `string` | — | Outer wrapper classes. |

A custom `fill` counts as dark when it is a 3- or 6-digit hex with luminance `0.2126r + 0.7152g + 0.0722b < 140`.

## Layout and look

- Outer: `relative inline-flex`, width × height, radius 30%, no selection, cursor pointer when pokeable; focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset.
- Ground shadow: an ellipse from 12% to 12% inset horizontally, `bottom: −0.1·size`, height `0.12·size`, black, `blur(6px)`.
- Body wrapper: full size, transform origin bottom (`originY: 1`). Body: radius 34% (squircle) or fully round (pill, circle), overflow hidden.
  - Light: white, shadow `0 18px 40px -16px rgba(23,24,26,0.35), 0 2px 6px rgba(23,24,26,0.06), inset 0 -10px 22px rgba(23,24,26,0.06)`; in dark mode `0 18px 40px -14px rgba(0,0,0,0.7), inset 0 -10px 22px rgba(23,24,26,0.08)`.
  - Dark: `#17181a`, `0 18px 40px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 24px rgba(0,0,0,0.45)`, plus a 1px `white/12` ring in dark mode.
  - Custom: that background with `0 18px 40px -16px rgba(23,24,26,0.4), inset 0 -10px 22px rgba(0,0,0,0.12)`.
- Top light: an ellipse inset 12% sides, top 6%, 38% tall, opacity 0.7, `radial-gradient(closest-side, rgba(255,255,255,0.95), transparent)` (0.16 on dark bodies).
- Eyes (sizes as fractions of `size`): dots 0.105 × 0.16 fully round; slits 0.06 × 0.2 fully round; squares 0.13 × 0.13 radius 22%. Centred, then moved.
- Sleep "z"s: top-right (−4px right, −8px top), semibold `#8e8d88`, two letters at `max(10, size·0.11)` and `max(10, size·0.08)` px.

## The 3D eye maths

Eyes sit on a unit sphere at (x, y) = (−0.3, −0.06) and (0.3, −0.06), with `z = sqrt(1 − x² − y²)`. Rotate by yaw then pitch:
`x1 = x·cos(yaw) + z·sin(yaw)`, `z1 = −x·sin(yaw) + z·cos(yaw)`, `y2 = y·cos(pitch) − z1·sin(pitch)`, `z2 = y·sin(pitch) + z1·cos(pitch)`.
Position = `(x1·rx, y2·ry)` where `rx = width/2 · 0.86` (0.78 for pill) and `ry = height/2 · 0.86`. Foreshortening `scaleX = sqrt(max(0.08, 1 − x1²))`, `scaleY = sqrt(max(0.08, 1 − y2²))`; opacity `clamp(z2·4, 0, 1)`. Multiply scaleX by `widen` and scaleY by `lid · widen`.

## Motion

- Pointer tracking on `window` `pointermove` (passive): `dx, dy` from the body centre, `reach = max(220, 2.4·bodyWidth)`, `maxAngle = (follow/100)·1.05` rad. `yaw = maxAngle·tanh(dx/reach)`, `pitch = −0.8·maxAngle·tanh(dy/reach)`. Both go through springs (stiffness 170, damping 18, mass 0.6).
- Startle: when the pointer is within `0.62·height` of the centre, `widen → 1.3` (spring 400/18) and `squashY → 0.88`; back to 1 when it leaves. Skipped under reduced motion.
- Squash: `squashY` spring 380/14; `scaleX = 1 + (1 − squashY)·0.7` to preserve volume.
- Blink: `lid` spring 900/40. Every `2200 + rand·3800` ms close to 0.08 for 110ms; 22% chance of a second blink 160ms later.
- Hop (poke): squashY 0.78 and lid 0.35; at 90ms squashY 1.14 and `hopY → −0.32·size` (spring 260/13, mass 0.7); at 270ms hopY → 0; at 430ms squashY 0.84 and lid 1; at 540ms squashY 1. Ground shadow scale 0.55 → 1 and opacity 0.12 → 0.28 as hopY goes from `−0.3·size` to 0.
- Sleep: after `sleepAfter` ms with no movement, eyes look slightly down (yaw 0, pitch 0.12), lids at 0.1, the body breathes `scale [1, 1.035, 1]` over 3.2s easeInOut forever, and the "z"s float `y 6 → −10`, `x 0 → 6`, opacity `0 → 1 → 0` over 2.6s, repeating, the second delayed 1.3s. Any pointer move wakes it.

## Interaction and states

- Poke via click, Enter or Space (prevent default on Space) calls the hop and `onPoke`.
- Clear all timers (blink, sleep, hop) on unmount.
- Reduced motion: eyes still follow, but no blinks, startle, hop, breathing or "z"s.

## Autoplay demo

Every 1300ms look at the next gaze point (yaw, pitch fractions of the follow range): (−0.8, 0.2), (0.7, −0.4), (0.2, 0.55), (−0.5, −0.5), (0.9, 0.1), (0, 0), with pitch scaled by 0.8; hop on the last one of each round. It never falls asleep while autoplay is waiting. The first real pointer move stops the demo. Demo shows three side by side: a dark pill with slits (64), a light squircle (120), and an `#ff9f0a` circle with squares (68).

## Accessibility

- Pokeable: `role="button"`, `tabIndex 0`, `aria-label="Buddy, press to poke"`. Otherwise the whole thing is `aria-hidden`.

## Acceptance checklist

- Eyes follow the pointer across the whole page, sliding round the face and narrowing near the rim.
- It blinks at random intervals, sometimes twice.
- Bringing the pointer onto it widens the eyes and squashes it slightly.
- Clicking or Enter makes it squash, hop with a stretch, land with a squash and settle; the shadow shrinks mid-air.
- Left alone for 9s it closes its eyes, breathes and shows rising "z"s; moving the pointer wakes it.
- Shapes, eye styles and fills all render; dark or custom dark fills get white eyes.
- Reduced motion keeps only the gaze.
