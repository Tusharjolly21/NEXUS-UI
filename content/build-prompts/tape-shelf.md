# Tape Shelf

Build a shelf of cassette cases seen spine-out in 3D. Hovering a spine slides it up out of the row; picking one swings the case round towards the viewer to show its cover with the reels turning, while the rest of the shelf parts and dims. A caption below rolls to "Now playing". The feel is tactile and nostalgic, with soft, slightly bouncy springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`).
- File: `components/tape-shelf/tape-shelf.tsx`, named export `TapeShelf`, plus the `ShelfTape` type and `DEFAULT_TAPES`.

## API

`ShelfTape = { title: string; artist: string; color: string; ink: string }` (`color` paints the spine and cover label, `ink` is the text colour on them).

- `tapes?: ShelfTape[]`, default (title, artist, color, ink):
  - Night Drive, Coastal Lines, `#ff6b4a`, `#fff`
  - Paper Moons, Hollow Bay, `#ffd60a`, `#1d1d1f`
  - Glass Garden, Mira Vale, `#30d158`, `#0b2814`
  - Static Bloom, Tarn, `#0a84ff`, `#fff`
  - Low Orbit, Kesh, `#bf5af2`, `#fff`
  - Salt & Iron, Wren Atlas, `#e5e5ea`, `#1d1d1f`
  - Afterglow, Juno Park, `#ff375f`, `#fff`
- `onPick?: (index: number | null) => void`: called when the user picks a tape (index) or puts it back (`null`).
- `autoplay?: boolean`, default `false`.

## Layout and look

Constants: spine width `SPINE = 22`, gap `6`, case height `TH = 140`, cover width `CW · 1.6` where `CW = 92` (so 147.2px).

- Root: column, centred, 16px gap.
- Scene: 420×250 (max-width 100%), relative, `perspective: 1000px`.
- Row: absolutely positioned at `top 54px`, horizontally centred (`left 50%`, `margin-left = −rowW/2`), `rowW = n · 28`, height 140, `transform-style: preserve-3d`, `transform: rotateY(−18deg) rotateX(6deg)` so the shelf is seen at a slight angle from above-right.
- Each case is a `motion.button` at `left = i · 28`, 22×140, `transform-style: preserve-3d`, origin x 50%. It holds two faces, both with `backface-visibility: hidden`:
  - **Spine**: fills the button, radius 3px, background `color`, box-shadow `inset 0 0 0 1px rgba(0,0,0,.08), inset 2px 0 0 rgba(255,255,255,.35)`. The title runs vertically (rotated −90°), 10px bold uppercase, tracking 0.12em, colour `ink`, no wrapping.
  - **Cover**: hinged on the spine's left edge: `left 0, top 0`, 147.2×140, `transform-origin: 0% 50%`, `transform: rotateY(90deg)`, radius 6px, background `#1d1d1f`, padding 10px, inset 1px `rgba(255,255,255,.12)`, column with `justify-between`. Inside: a 42px label block (radius 3px, padding-x 8px, background `color`, text `ink`) with the title (11px bold, tight leading) over the artist (9px, 80% opacity); a window 110×46, radius 23px, `#2c2c2e`, inset shadow `0 2px 6px rgba(0,0,0,.6)`, holding a reel, a 30×14 tape strip `#3a2a1c` (radius 3px) and a second reel; and a footer "Side A · 45 min", 8px semibold uppercase, tracking 0.2em, `rgba(255,255,255,.4)`, centred. The cover is a dark illustration surface in both themes.
- **Reel**: 26×26 SVG: circle r 12 `#f5f5f7`, hub r 4 `#1d1d1f`, six spokes (2×5 rects, rx 1, at y 3, rotated every 60° around the centre) `#1d1d1f`.
- Shelf shadow under the row: `left/right 40px`, `top 200px`, 12px tall, `radial-gradient(closest-side, rgba(0,0,0,.18), transparent)`; dark uses `.7` alpha.
- Caption below: 300×40 box, overflow hidden, centred text. Idle: "Pick a tape from the shelf." 13px `#86868b` (dark `#8e8e93`). Picked: title 15px semibold `#1d1d1f` (dark `#f5f5f7`) over "Now playing · {artist}" 12px `#6e6e73` (dark `#a1a1a6`).

## Motion

Every case animates with one spring: `stiffness 160, damping 20`, `initial={false}`.

- **Resting**: `x 0, y 0, z 0, rotateY 0, scale 1, opacity 1`.
- **Hover lift** (only when nothing is picked): `y −18, z 8`.
- **Picked**: `x = rowW/2 − i·28 − 147.2/2` (moves to the middle of the row), `y −16`, `z 150` (towards the viewer), `rotateY −84` (swings so the hinged cover faces you), `scale 1.05`, `opacity 1`. Because the cover sits at `rotateY(90deg)` on the spine's left edge, turning the case by −84° brings the cover almost square to the camera while the spine turns away.
- **Others while one is picked**: shift `x −14` if left of the pick, `+14` if right, `opacity 0.55`, no lift.
- **Reels** on the picked case rotate 360° continuously, 1.6s per turn, linear, infinite. When not picked they return to 0 over 0.4s. Under `prefers-reduced-motion` they do not spin.
- **Caption**: `AnimatePresence mode="popLayout" initial={false}` keyed by the pick. Enter from `y 20, opacity 0, blur(4px)` to `y 0, opacity 1, blur(0)`; exit to `y −20, opacity 0, blur(4px)` (default spring).

## Interaction and states

- `pointerenter` / `focus` on a case sets hover; `pointerleave` / `blur` clears it.
- Click toggles: picking a different case picks it, clicking the picked case puts it back (`null`). Call `onPick` on user picks.
- Escape (anywhere in the component) puts the picked tape back.
- If the picked index is out of range (tapes changed), treat it as nothing picked.

## Autoplay demo

With `autoplay`, every 1800ms step through the sequence `[2, null, 5, null, 0, null]` (each index taken modulo the tape count) and set the pick. Any `pointerdown` or `keydown` inside the component marks it touched; the next tick clears the interval.

## Accessibility

- Each case is a `<button type="button">` with `aria-pressed` (picked) and `aria-label` "{title} by {artist}".
- Focus: no default outline; a 2px `#0071e3` ring on `:focus-visible` (dark `#0a84ff`). Focusing a case lifts it like hover.
- The caption container is `aria-live="polite"`. Reels and the shadow are `aria-hidden`.

## Acceptance checklist

- [ ] Seven coloured spines stand in a row tilted about 18° with vertical titles.
- [ ] Hovering or tabbing to a spine slides it up 18px with a soft spring.
- [ ] Picking a spine swings it to the centre and towards you, revealing a dark cover with the coloured label, two reels and "Side A · 45 min".
- [ ] The reels turn steadily while it is picked (not with reduced motion).
- [ ] The other spines part by 14px either side and dim to 55%.
- [ ] Clicking the picked case or pressing Escape returns it to its slot.
- [ ] The caption blurs and rolls between "Pick a tape from the shelf." and "Now playing · artist".
- [ ] Autoplay pulls out tapes 3, 6 and 1 in turn and stops after the first interaction.
