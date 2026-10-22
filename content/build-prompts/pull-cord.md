# Pull Cord

Build a light switch on a real cord. A small pendant lamp hangs on the left of a dark panel; a cord hangs on the right with a bead at the end. Grab the bead, pull it down past the cord's slack and let go, and the panel lights up in warm cream with a cone of light under the lamp (or goes dark again). The cord is a little verlet rope, so it stretches only to its length, swings when released and settles. The light only ever fills this panel, never the page.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`). The rope is plain `requestAnimationFrame` code writing to the DOM.
- File: `components/pull-cord/pull-cord.tsx`. Named export `PullCord` and its `PullCordProps` type.

## API

- `defaultOn?: boolean`, default `false`.
- `onChange?: (on: boolean) => void`: called with the new state when the user toggles it (pull or keyboard), not by autoplay.
- `onText?: string`, default `"Lights on."`; `offText?: string`, default `"Lights off."`; `hint?: string`, default `"Pull the cord."`.
- `className?: string`: extra classes for the outer wrapper.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Outer wrapper: `width: 320px; max-width: 100%`, height `300 · scale`. A `ResizeObserver` sets `scale = min(1, wrapperWidth / 320)`; it starts at 1 so server and client match.
- Panel: exactly 320×300 (`W`, `H`), `position: relative`, `overflow: hidden`, radius 26px, `touch-action: none`, no selection, `transform: scale(scale)` from the top-left when `scale < 1`. Dark mode adds a `0 0 0 1px rgba(255,255,255,.08)` ring; the scene colours themselves don't change with the theme.
- Layers, back to front (all absolutely positioned; lamp parts are centred on x 96 with `translateX(-50%)`):
  1. Room: fills the panel. Off `linear-gradient(180deg,#1b1d24,#2a2d36)`, on `linear-gradient(180deg,#fff7e6,#ffe7c2)`.
  2. Light cone: top 60px, 200×260, non-interactive, `conic-gradient(from 160deg at 50% 0%, transparent 0deg, rgba(255,214,140,.55) 20deg, rgba(255,214,140,.55) 40deg, transparent 60deg)`, `filter: blur(6px)`. Opacity 1 on, 0 off.
  3. Lamp wire: top 0, 2×34, `#3a3a3c`.
  4. Shade: top 32px, 84×38, radius 42px on top and 6px on the bottom. `#44464f` off, `#1d1d1f` on.
  5. Bulb: top 64px, 18×18 circle. Off `#6b6e78` with no shadow; on `#fff3c4` with `box-shadow: 0 0 30px 12px rgba(255,214,140,.9)`.
  6. Text, bottom 24px / left 24px: headline 22px semibold, tracking −0.03em (`onText` / `offText`); under it `hint` at 12px, 70% opacity. Text colour `#f5f5f7` off, `#1d1d1f` on. `aria-live="polite"`.
  7. Cord: a non-interactive SVG the size of the panel with one path, no fill, 1.6px, round caps, stroke `#c7c7cc` off and `#8e8e93` on.
  8. Bead: a 22×26 `<button>` at left/top 0, radius 11px, `background: linear-gradient(180deg,#e5e5ea,#a1a1a6)`, `box-shadow: 0 4px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.7)`, `cursor: grab` (`grabbing` while active). It's moved every frame with `transform: translate(end.x − 11px, end.y − 4px)`.
- Server render: give the path its rest shape (a straight line from (236, 0) down to (236, 108)) and the bead `translate(225px, 104px)` so nothing jumps on the first frame.

## Motion

- Rope: anchor `(AX, AY) = (236, 0)`, `SEG = 12` segments of rest length `LEN = 9` px, so 13 points, each `{ x, y, px, py }` starting in a straight vertical line.
- Every frame:
  1. Verlet integrate points 1..12: `v = (pos − prev) · 0.985`, `prev = pos`, `pos += v`, plus gravity `0.45` on y.
  2. Eight constraint passes. Each pass pins point 0 to the anchor and, while grabbed, pins point 12 to the grab point. For each segment with length `d > LEN` (the cord can go slack but never longer): `diff = (d − LEN) / d`. For the first segment move only the lower point by the full correction; for the others move both ends half each.
  3. `pulled = end.y − (AY + SEG · LEN)` (how far the bead is below its rest length, 108). If grabbed and `pulled > 34`, arm the switch.
  4. Write the polyline `M p0 L p1 … L p12` to the path `d` and move the bead.
- Theme change (all framer-motion `animate`): room background over 0.5s; cone opacity over 0.15s turning on and 0.4s turning off; bulb colour and glow over 0.12s on, 0.4s off; shade and text colour use the default transition.

## Interaction and states

- Pointer down on the bead: mark touched, capture the pointer on the panel, and set the grab point to the pointer in panel coordinates: `((clientX − left) / width) · 320`, `((clientY − top) / height) · 300` from the panel's bounding rect, so it works when scaled.
- Pointer move on the panel while grabbing (and touched): grab point = pointer, x clamped to `236 ± 70`, y clamped to `40..280`.
- Pointer up, cancel or leave while grabbing: release. If the switch was armed, disarm and toggle.
- Keyboard: Enter or Space on the bead (ignore key repeat) does a tug: grab the bead at 46px below its current position, and 220ms later release, disarm and toggle.
- Toggling flips a ref and the state together and calls `onChange(next)` for user toggles only.

## Autoplay demo

With `autoplay`, every 2600ms do a tug (same as the keyboard one, without `onChange`). A `touched` ref set by grabbing the bead or using the keyboard makes the next tick clear the interval for good. Pointer handlers on the panel ignore the autoplay grab until touched. Cancel the frame loop, the interval, the tug timeouts and the `ResizeObserver` on unmount.

## Accessibility

- The bead is a native `<button>` with `role="switch"`, `aria-checked`, `aria-label="Light"`. Focus ring `focus-visible` 2px `#0071e3` (dark `#0a84ff`), no default outline.
- The cord SVG is `aria-hidden`; the headline is `aria-live="polite"`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Each pull the visitor makes (dragging the bead past the slack and letting go, or Enter or Space) plays one click like a light switch: `on` when the light comes on (a tiny noise click with a sine rising from 600 to 900 Hz over 70ms) and `off` when it goes out (a noise click with a sine falling from 760 to 480 Hz over 70ms). A pull that does not reach the switch is silent. The autoplay tugs make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] At rest the cord hangs straight with the bead at about y 108.
- [ ] Dragging the bead stretches the cord only to its length; it goes slack when pushed up.
- [ ] Releasing after pulling more than 34px past rest toggles the light; a smaller pull just swings the cord.
- [ ] On release the cord swings and settles over a second or two.
- [ ] Turning on brightens the panel, lights the bulb with a glow and shows the cone; turning off fades them more slowly.
- [ ] Enter or Space tugs the cord visibly and toggles it.
- [ ] Autoplay tugs every 2.6s and stops for good when someone grabs the bead.
- [ ] At 280px wide the whole scene scales down and dragging still tracks the pointer.
- [ ] Nothing outside the panel changes when the light goes on.
