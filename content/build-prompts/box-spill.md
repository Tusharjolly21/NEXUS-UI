Build a cardboard box drawn on a canvas with a single button under it. Press "Open the box" and the flaps spring back while a few dozen little coloured pieces (some with faces) burst out, tumble, knock into each other and pile up on the floor. Press "Pack it up" and they all shrink and fly back in before the flaps close. It should feel like a toy: bouncy, a bit chaotic, quick to reset.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (only `animate` for the flap spring and `motion.button` for the press effect).
- File: `components/box-spill/box-spill.tsx`, named export `BoxSpill`, exported `BoxSpillProps`.
- All drawing and physics run in one `requestAnimationFrame` loop on a 2D canvas. Keep pieces, flap progress (0 closed → 1 open) and mode (`"idle" | "free" | "home"`) in refs; only the open/closed flag is React state (for the button label and aria-label).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `count` | `number` | `30` | How many pieces burst out; read each time the box opens. |
| `autoplay` | `boolean` | `false` | Opens and packs the box on a timer until the user presses the button. |

## Layout and look

- Wrapper: vertical flex, centred, 16px gap.
- Canvas: CSS size 440 × 300 px (`max-width: 100%`), backing store `440·dpr × 300·dpr` with `dpr = min(2, devicePixelRatio)`, `setTransform(dpr,0,0,dpr,0,0)` every frame. Radius 24px; background `linear-gradient(180deg, #ffffff, #f1f1f4)` with a hairline ring `0 0 0 1px rgba(0,0,0,.05)`; dark: `linear-gradient(180deg, #2c2c2e, #1c1c1e)` and ring `rgba(255,255,255,.08)`. These are CSS classes on the canvas element, not drawn.
- Geometry: box centre x = 220, width 150, height 92, floor y = 278, so the box top is y = 186.
- Draw order each frame: clear → floor shadow → box back → pieces → box front.
  - Floor shadow: radial gradient centred at (220, 278), radii 10 → 160, `rgba(0,0,0,.12)` → transparent (use `.45` in dark mode; read `html.dark` with a MutationObserver into a ref). Fill a full-width band from y = 268, 30px tall.
  - Box back: inner back wall `#8a6233`, full box width, 14px tall at the top edge. Flaps `#c9955a`, swing angle `ang = flap·2.3` rad, clamped to 2.6. Left flap: translate to the top-left corner, rotate `−ang`, fill rect `(0, −2, 75, 6 + 30·sin(min(ang, π/2)))`. Right flap mirrors it from the top-right corner (rotate `+ang`, rect starts at x = −75).
  - Box front: rounded rect radius 4 filled with a vertical gradient `#d9a768` → `#c08a4c`; a 28px tape strip down the centre, `rgba(255,255,255,.35)`; the text "FRAGILE · THIS SIDE UP", `600 10px` system sans, `rgba(0,0,0,.18)`, centred at y = floor − 14. While `flap < 0.05`, draw the closed lid: a `#b47f45` strip, full width, 6px tall at y = top − 4.
  - Pieces: colours cycle `#ff375f #ff9f0a #ffd60a #30d158 #64d2ff #0a84ff #bf5af2 #ff6482`. Every third piece (`i % 3 === 0`) is a circle of radius r with two eyes (`#1d1d1f`, radius 0.13r at x = ±0.3r); the others are rounded rects `2r × 1.6r` with corner radius 0.6r. Each gets a gloss dot `rgba(255,255,255,.45)`, radius 0.28r at (−0.35r, −0.35r). Draw rotated by the piece angle.
- Button: 40px tall, fully rounded, 20px horizontal padding, 14px medium; `#1d1d1f` with white text (dark: `#f5f5f7` with `#1d1d1f` text). Press: `whileTap` scale 0.94. Label "Open the box" / "Pack it up".

## Motion

- Open: set open; animate flap 0 → 1 with a spring (stiffness 200, damping 12 — it overshoots and wobbles). Spawn `count` pieces: x = 220 ± 40, y = top + 10…40, vx = ±260 random, vy = −380…−800, r = 9…17, angle random, angular velocity ±4 rad/s. Mode `free`.
- Free physics (`dt = min(0.025, frame seconds)`): `vy += 1300·dt`, integrate position and angle. Floor hit: clamp to `floor − r`, `vy *= −0.35`, `vx *= 0.88`, and set angular velocity to `vx / r` so pieces roll. Side walls: clamp and `vx *= −0.5`. No ceiling. Then 3 passes of pairwise collisions: separate overlapping pieces by half the overlap each along the normal; if the relative normal velocity `rv` is negative, apply an impulse of `0.6·(−rv)` to both (equal masses, opposite directions).
- Pack: mode `home`; every frame each piece moves 14% of the way to (220, top + 20) and its radius shrinks by 1.5%. After 650 ms, animate flap 1 → 0 with a spring (stiffness 260, damping 22) and set closed; 400 ms later, if still `home`, clear pieces and go `idle`.
- Stop any running flap spring before starting a new one; clear pending timers and the spring on unmount.

## Interaction and states

- One button toggles open/pack and marks the component as touched.
- Idle: closed box with lid strip. Free: flaps open, pieces settle into a pile in front of and around the box. Home: pieces stream into the box, then flaps close.

## Autoplay demo

With `autoplay`, the first toggle happens after 700 ms, then every 3.6 s, alternating open and pack. Once the user presses the button, the timer does nothing further.

## Accessibility

- Canvas `role="img"` with aria-label "A closed cardboard box." or "The box is open and its contents are spilled on the floor."
- Native button; focus-visible outline 2px, offset 2px, `#0071e3` (dark `#2997ff`).

## Acceptance checklist

- Closed box shows a lid strip; opening swings both flaps back with a visible overshoot.
- `count` pieces burst upward, fall under gravity, bounce low (35%) and roll to rest without overlapping.
- Pieces bounce off both side walls of the canvas.
- Every third piece is a round face with two eyes; the rest are pills.
- Packing pulls all pieces into the box while shrinking, then the flaps close after ~650 ms.
- Button label and canvas aria-label follow the open state.
- Autoplay alternates every 3.6 s and stops after a button press.
- Dark mode changes only the background, ring and shadow strength.
