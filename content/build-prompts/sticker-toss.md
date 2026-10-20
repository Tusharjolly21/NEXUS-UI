# Sticker Toss

Build a round logo sticker that sits in the header of a small mock web page and can be peeled off and thrown. While it flies it stretches along its direction of travel (squash and stretch driven by real velocity), its ring of text spins faster the faster it moves, and its shadow grows as it lifts off the page. Let go and it springs back into its dashed slot with a wobble. The feel is playful and physical, like slapping a vinyl sticker around.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useVelocity`, `useTransform`, `useSpring`).
- File: `components/sticker-toss/sticker-toss.tsx`. Named export `StickerToss`, props interface `StickerTossProps`.

## API

- `text?: string`. Text that runs around the ring. Default is an uppercase line of the form `"BRAND NAME · MADE TO MOVE · "` (use your brand). End it with a separator so the loop reads cleanly.
- `color?: string`, default unset. Unset means theme ink: sticker `#1d1d1f` with white ring text in light mode, sticker `#f5f5f7` with `#1d1d1f` text in dark mode (do this with CSS variables on the card, e.g. `--st-ink` / `--st-text`, switched by `dark:`). When set, the sticker uses it and the ring text is white.
- `accent?: string`, default `"#c8f560"`. The dot in the middle.
- `autoplay?: boolean`, default `false`. Tosses the sticker by itself until someone grabs it.

## Layout and look

- Root: full-width centred column, 16px gap: card, then a hint "Grab the logo and throw it." (13px `#86868b`, dark `#98989d`).
- Card: `relative`, 440×290px, `max-width: 100%`, `overflow: hidden`, radius 24px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05)` (dark `0 0 0 1px rgba(255,255,255,.08)`).
- Mock header: 74px tall, flex space-between, 20px horizontal padding, bottom border `#f0f0f3` (dark `#2c2c2e`). Left: the empty slot, a 58×58 circle with a 1px dashed `#d2d2d7` border (dark `#48484a`). Right: nav "Work", "Notes", "About", 13px, 16px gap, `#6e6e73` (dark `#a1a1a6`).
- Body skeleton (decorative): column with 8px gap, 20px side padding, 24px top padding: a bar 224×16 `#f0f0f3` (dark `#2c2c2e`), then bars 288×12 and 256×12 `#f5f5f7` (dark `#242426`), all fully rounded.
- Sticker: absolutely positioned at left 20px, top 8px (exactly over the slot), 58×58. Three nested layers:
  1. Outer (draggable): carries `x`, `y`.
  2. Middle: `rotate = angle`, `scaleX = stretch`, `scaleY = squash` (stretch along the travel direction).
  3. Inner disc: `rotate = −angle` (so the art stays upright), fully round, background = sticker colour, `box-shadow` from the lift value.
  Inside the disc: an SVG (viewBox 0 0 100 100, fills the disc) that rotates by `textRot`, containing a circular path `M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0` (unique id from `useId`, stripped of non-alphanumerics) and `<text fontSize="11.5" fontWeight="700" letterSpacing="1.6">` with a `textPath` of the ring text. Then the accent dot at inset 30%, and a gloss highlight: left 20%, top 12%, 40%×22%, rotated −25°, `rgba(255,255,255,.25)`, 1px blur.

## Motion

- `x`, `y`: motion values; `vx`, `vy` = `useVelocity` of each.
- `speed = min(1, hypot(vx, vy) / 2200)`; `angle = atan2(vy, vx)` in degrees.
- `stretch = useSpring(map speed 0→1 to 1→1.45, { stiffness: 400, damping: 22 })`; `squash = 1/√stretch` (area-preserving).
- `lift = min(1, hypot(x, y) / 60)`; shadow = `0 (4 + 22l)px (8 + 30l)px −(4 + 4l)px rgba(0,0,0, 0.18 + 0.12l)`.
- Ring text: a rAF loop adds `dt · (20 + speed·900)` degrees per second to `textRot` (always turning slowly, much faster in flight). Cancel on unmount.
- Drag: `drag` on both axes, `dragElastic 0.9`, `dragSnapToOrigin`, `dragTransition { bounceStiffness: 220, bounceDamping: 12 }` so release springs home with a wobble. `whileDrag` cursor `grabbing`; default cursor `grab`; `touch-action: none`.
- Flick (shared by autoplay and keyboard): pick `tx = ±(120 + rand·60)` (random side) and `ty = 120 + rand·40`. Animate x through keyframes `[0, 0.6tx, tx]` and y through `[0, 0.3ty, ty]`, 0.5s, `easeOut` (an arcing throw down into the page). When y finishes, spring both back to 0 with stiffness 200, damping 12. Velocity drives stretch and text spin automatically.

## Interaction and states

- Pointer down on the sticker marks it touched (stops autoplay) and starts the drag.
- Keyboard: the sticker is focusable; Enter or Space prevents default, marks touched and plays one flick.
- No other state; everything else is motion values, so nothing re-renders per frame.

## Autoplay demo

With `autoplay`: first flick after 900ms, then one every 3200ms. Skip a flick if touched, and if the user touched it during the 0.5s throw, do not run the spring-back (the drag takes over).

## Accessibility

- Sticker: `role="button"`, `tabIndex 0`, `aria-label="Logo sticker. Drag and throw it, or press Enter to toss it."`. Focus-visible: 2px outline `#0071e3` (dark `#0a84ff`), 4px offset, round.
- Ring SVG, slot and skeleton are `aria-hidden`.

## Acceptance checklist

- [ ] The sticker sits exactly over the dashed slot at rest.
- [ ] Dragging fast stretches it up to about 1.45× along the motion direction while it thins across it; standing still it is perfectly round.
- [ ] The artwork and gloss stay upright while the stretch rotates with the direction of travel.
- [ ] The ring text turns slowly at rest and whips around during a throw.
- [ ] The shadow grows and darkens as the sticker moves away from its slot.
- [ ] Releasing springs it home with a visible wobble.
- [ ] Enter/Space tosses it; autoplay tosses every 3.2s and stops after the first grab.
- [ ] In dark mode the default sticker is light with dark text and still clearly visible on the card.
