# Tilt Pass

Build a credit-card-sized membership pass that tilts in 3D toward the pointer. A white glare follows the pointer, a holographic rainbow sheen shifts its angle as the card turns, and the drop shadow moves opposite to the tilt as if lit from above. Clicking flips the card over on a soft spring to a dark back with a scannable code. It should feel like a physical, slightly glossy card in your hand: responsive, a little springy, never twitchy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`, `useMotionTemplate`, `useAnimationFrame`).
- File: `components/tilt-pass/tilt-pass.tsx`, named export `TiltPass`; export `TiltPassProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `name` | `string` | `"Alex Rivera"` | Holder's name, front and back. |
| `title` | `string` | `"Founders Pass"` | Pass name on the front. |
| `number` | `string` | `"No. 0042"` | Membership number, front and back. |
| `autoplay` | `boolean` | `false` | Floats gently on its own while the pointer is away. |

## Layout and look

- Wrapper: vertical flex, centred, 20px gap, `perspective: 1100px`. Under the card, a hint: "Move your pointer over it. Click to flip." 13px, `#86868b` / dark `#98989d`.
- Card (tilting element): 350 × 220px, radius 22px, `transform-style: preserve-3d`, pointer cursor. Inside it, a flipper layer (also `preserve-3d`, fills the card) holds two faces with `backface-visibility: hidden`.
- Front (stays light in both themes): radius 22px, `overflow: hidden`, background `linear-gradient(145deg, #ffffff 0%, #eeeef2 45%, #dcdce2 100%)`, dynamic drop shadow (see Motion). Layers bottom to top:
  1. An inset edge: `inset 0 0 0 1px rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,0,0,.06)`.
  2. Holographic sheen with `mix-blend-mode: color-dodge`.
  3. Content at `translateZ(40px)` so it floats above the surface: 24px padding, column with space-between. Top row: "MEMBER" 12px semibold uppercase, tracking 0.14em, `#86868b`, over the `title` at 22px semibold, tracking −0.02em, `#1d1d1f`; at the top right a 34px logo of two overlapping 11px-radius rings (centres x 13 and 21, y 17, 2px `#1d1d1f` stroke, the second at 35% opacity). Middle: a 48 × 36px chip, radius 6px, `linear-gradient(135deg, #d9c48f, #f4e6bd 45%, #c7ad6e)` with `inset 0 0 0 1px rgba(0,0,0,.12)`. Bottom row (aligned to the bottom): `name` 16px medium, tracking −0.01em, `#1d1d1f`; `number` 13px medium tabular, `#6e6e73`.
  4. Glare, non-interactive, `mix-blend-mode: overlay`.
- Back: pre-rotated `rotateY(180deg)`, radius 22px, bg `#1d1d1f` (dark `#2c2c2e`), white text, 24px padding, row with 20px gap. Shadow `0 30px 60px -24px rgba(0,0,0,.45)`; dark adds a hairline: `0 0 0 1px rgba(255,255,255,.08), 0 30px 60px -24px rgba(0,0,0,.7)`. Left: a 120px white square, radius 12px, 10px padding, an 8 × 8 grid with 3px gaps; cell `i` is filled `#1d1d1f` (radius 1px) when `(i·7 + floor(i/8)·3) mod 5 < 2` or `i mod 9 = 0`, otherwise empty. Right column (6px gap): "SCAN AT ENTRY" 12px semibold uppercase, tracking 0.14em, white/50%; `name` 18px semibold, tracking −0.01em; `number` 13px tabular, white/60%.

## Motion

- Pointer position is normalised to `px, py` in 0–1 (start 0.5, 0.5). Smooth both with `useSpring(…, { stiffness: 180, damping: 18 })` → `sx, sy`. Everything below derives from `sx, sy`.
- Tilt: `rotateY` maps `sx` `[0,1] → [−16°, 16°]`; `rotateX` maps `sy` `[0,1] → [12°, −12°]` (the edge under the pointer dips away).
- Glare: `radial-gradient(circle at {sx·100}% {sy·100}%, rgba(255,255,255,.75), rgba(255,255,255,0) 45%)`.
- Sheen: `linear-gradient({angle}deg, rgba(255,0,128,0) 20%, rgba(120,170,255,.28) 40%, rgba(255,220,140,.28) 55%, rgba(170,255,210,.22) 68%, rgba(255,0,128,0) 85%)` where `angle` maps `sx` `[0,1] → [100, 160]`.
- Shadow: `{x}px {y}px 60px -20px rgba(0,0,0,.35)` with `x` mapping `sx` `[0,1] → [24, −24]` and `y` mapping `sy` `[0,1] → [10, 40]`. Build these strings with `useMotionTemplate` so nothing re-renders per frame.
- Flip: the flipper animates `rotateY` 0 ↔ 180° with spring stiffness 120, damping 16 (slow with a gentle overshoot). The tilt keeps working on top of the flip.
- Press: `whileTap` scale 0.98 on the card.
- Float (autoplay): every animation frame, while not hovered, set `px = 0.5 + sin(t / 1400) · 0.28` and `py = 0.5 + cos(t / 1900) · 0.22` (`t` in ms). The different periods trace a slow Lissajous drift.

## Interaction and states

- Pointer move over the card: `px = (clientX − rect.left) / rect.width`, `py = (clientY − rect.top) / rect.height`.
- Pointer enter sets hover; pointer leave clears it and resets `px, py` to 0.5, so the springs ease the card back flat.
- Click toggles the flip. Enter or Space also toggle it (`preventDefault` on Space).

## Autoplay demo

When `autoplay` is true the card floats with the drift above whenever the pointer isn't over it. Hovering pauses the float and gives control to the pointer; leaving resets to centre and the float resumes on the next frame. It does not stop permanently.

## Accessibility

- The card is `role="button"`, `tabIndex={0}`, with `aria-label` "Show back of pass" when showing the front and "Show front of pass" when flipped.
- Focus: no outline; on `:focus-visible` a 2px `#0071e3` ring with 4px offset.
- Decorative SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Moving the pointer to a corner tilts that corner away by up to 16° horizontally and 12° vertically, through a spring.
- [ ] A soft white glare tracks the pointer; a rainbow sheen visibly shifts as you move left to right.
- [ ] The shadow moves to the opposite side and gets longer toward the bottom.
- [ ] The text and chip float above the surface (parallax at an angle).
- [ ] Leaving the card eases it back to flat.
- [ ] Click, Enter or Space flips to the dark back with a code grid; the front never shows through.
- [ ] With `autoplay`, the card drifts on its own until hovered and resumes after.
- [ ] In dark mode the back gets the lighter `#2c2c2e` and a hairline; the front stays light.
