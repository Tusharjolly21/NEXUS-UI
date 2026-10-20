Build a profile card with the whole team orbiting it on a tilted, dashed elliptical ring. Drag the ring, use the arrows or tap a face, and the ring spins that person round to the front; the card slides over to them and their avatar drops in with a little bounce. People at the back of the ring are smaller, fainter and pass under the card. It has a Connect toggle per person. Light, friendly, Apple-clean.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`, `useReducedMotion`).
- File: `components/profile-orbit/profile-orbit.tsx`, named export `ProfileOrbit` (also default), exported types `ProfilePerson` and `ProfileOrbitProps`.

## API

`ProfilePerson = { seed: number; name: string; role: string; email: string; avatar?: string }` (seed is the key and picks the monogram colour).

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `people` | `ProfilePerson[]` | 6 people | Jordan Lee (Head of Product), Alex Chen (Lead Designer), Maya Patel (Engineering Lead), Sam Rivera (Marketing Director), Chris Morgan (Head of Sales), Noa Berg (Research Lead); seeds 10–60; emails `firstname@example.com`. |
| `autoRotateInterval` | `number` | `2800` | Ms between autoplay steps (minimum 1200). |
| `onConnect` | `(person, connected: boolean) => void` | – | Fires when Connect toggles. |
| `onChange` | `(index: number) => void` | – | Fires with the index now in the card. |
| `hint` | `string` | `"Drag the ring or tap a face."` | Caption below; `""` hides it. |
| `autoplay` | `boolean` | `false` | Turns to the next person until touched. |
| `className` | `string` | `""` | Classes on the root. |

## Layout and look

- Root: column, centred, gap 8, full width, `overflow: hidden`. Hint 12px `#6e6e73` (dark `#a1a1a6`).
- Stage: 330px tall, max 560px wide, radius 24, `touch-action: pan-y`, no selection.
- Ring: an SVG ellipse centred in the stage, rx 228, ry 126, no fill, stroke 1.5px `#d2d2d7` (dark `#3a3a3c`), dash `2 6`, round caps.
- Avatars: circle with `linear-gradient(140deg, a, b)` where the palette index is `round(seed/10) mod 6`: `#64d2ff/#0a84ff`, `#ffb3e6/#bf5af2`, `#ffd60a/#ff9f0a`, `#7ee3a1/#30b65a`, `#ff9fb0/#ff375f`, `#b4b2ff/#5e5ce6`. White semibold initials (first letter of up to two words, uppercase) at 0.36 × size, tracking −0.02em; a photo covers it when `avatar` is set.
- Satellites: 52px avatars with a ring shadow `0 0 0 3px #fff, 0 8px 18px -8px rgba(0,0,0,.45)` (dark `0 0 0 3px #1c1c1e, 0 8px 18px -8px rgba(0,0,0,.9)`), centred on the stage centre (margin −26px) and offset by the orbit maths. A selection ring 5px outside, 2px `#0071e3` (dark `#0a84ff`).
- Card: centred over the stage, z 20, 248px wide (max `100% − 32px`), radius 24, padding 20 16 16, centred text, white / `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -26px rgba(0,0,0,.45)`; dark `#1c1c1e` / `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 24px 48px -26px rgba(0,0,0,.9)`.
  - 56px avatar (no ring), name 17px semibold leading tight, tracking −0.02em, 10px below; role 13px `#6e6e73` (dark `#a1a1a6`); email 12px `#86868b` (dark `#98989d`). All truncate.
  - Button row (12px below, gap 8): 36px round prev/next buttons `#f0f0f3` (dark `#2c2c2e`) with 15px chevrons (stroke 2.4); between them a flex-1, 36px pill Connect button, 13px semibold. Off: `#0071e3` (dark `#0a84ff`) / white, "Connect". On: `#f0f0f3` / `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`), a 13px check (stroke 3) + "Connected". Colour transition.

## Motion

- One motion value `rot` (a float person index). For satellite `i` of `n`: `off = wrap(i − rot, n)` where `wrap(o, n) = ((o + n/2) mod n + n) mod n − n/2` (range −n/2…n/2).
- Angle `a = 90° + off × 360/n` (the front of the ring is straight down). `x = cos(a) × 228`, `y = sin(a) × 126`, `depth = sin(a)`.
- From depth: `scale = 0.62 + ((depth+1)/2) × 0.42`, `opacity = 0.55 + ((depth+1)/2) × 0.45`, `zIndex = depth > 0.05 ? 30 : 5` (so back-half faces pass under the card at z 20). Selection ring opacity `max(0, 1 − |off| × 2)`. Round values to 3 decimals.
- Active person = `round(rot) mod n`, updated from a `rot` change listener, which also sets the slide direction (`+1` if `wrap(new − old, n) ≥ 0`, else `−1`) and calls `onChange`.
- Spin to a target: framer `animate(rot, target, spring stiffness 120, damping 15, carrying velocity)`, stopping any previous animation. Go-to-person takes the shortest way: `round(r + wrap(i − r, n))`. Steps: `round(rot) ± 1`.
- Drag: `onPanStart` stores `rot`; `onPan` sets `rot = start − offset.x / 90`. `onPanEnd` runs an inertia animation with velocity `−velocity.x / 90`, power 0.25, timeConstant 220, and `modifyTarget` that rounds to a whole person and clamps within ±3 of the current value, so it always lands on someone.
- Card content: `AnimatePresence mode="popLayout"` keyed by seed with a direction `custom`: enter from `x = dir × 36, opacity 0`, exit to `x = −dir × 36`; spring 380/32. The 56px avatar inside drops in from `scale 0.55, y 18` with spring 520/14 and a 0.06s delay (the bounce).
- Satellites `whileHover` scale 1.08, `whileTap` 0.92. Prev/next `whileTap` 0.9; Connect `whileTap` 0.95. Connect label swaps with `popLayout`: in from `y 10`, out to `y −10`, opacity, spring 500/30.

## Interaction and states

- Pointer down on the stage marks it touched and stops any spin. Tapping a satellite spins it to the front. Prev/next buttons step by one. Connect toggles a per-seed connected map and calls `onConnect`.
- Arrow Left/Right on the focused stage step by one (only when the stage itself has focus).
- Reduced motion: spins become instant (`duration 0`) and the avatar drop is skipped; the card still cross-slides.
- Stop the running animation on unmount.

## Autoplay demo

Every `max(1200, autoRotateInterval)` ms, animate `rot` to `round(rot) + 1` with a softer spring (stiffness 90, damping 14). The first pointer down, key press, button press or face tap stops it for good.

## Accessibility

- Stage: `role="region"`, `aria-roledescription="carousel"`, label "Team", focusable, 2px focus ring `#0071e3` (dark `#0a84ff`).
- Satellite buttons are `aria-hidden` and `tabIndex −1` (the card is the accessible view). A polite live region announces "{name}, {role}".
- Prev/next labelled "Previous person"/"Next person"; Connect uses `aria-pressed`; all have visible focus rings (Connect with a 2px offset).

## Acceptance checklist

- Six coloured monogram faces sit on a dashed ellipse; the front one is largest with a blue ring.
- Faces at the back are smaller, fainter and pass behind the card.
- Dragging spins the ring and it always settles on a person.
- Tapping a face, arrows or keys rotate the shortest way round.
- The card content slides in the direction of travel and the avatar bounces in.
- Connect toggles to "Connected" with a check and remembers per person.
- Autoplay advances every 2.8s and stops on first interaction.
- Dark mode recolours ring, card, buttons and avatar outlines.
