# Venom Button

Build a glossy black pill button that behaves like a symbiote looking for a host. When the cursor comes near, the surface swells toward it and pseudopods ooze out and feel about in its direction. Get closer and they lunge and wrap the fingers of a cartoon glove that replaces the cursor. Pull away and the strands stretch thin, snap and melt back into the body, which wobbles and throws up a few spikes that sink again.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, Framer Motion (`motion.button` and `useReducedMotion` only), one WebGL canvas and two 2D canvases. `cn` for class merging.
- File: `components/venom-button/venom-button.tsx` plus an `index.ts`. Named exports: `VenomButton` and `VenomButtonProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `"let’s collaborate"` | Text on the button. |
| `onClick` | `() => void` | none | Click handler. It is a real `<button type="button">`. |
| `strands` | `number` | `7` | Thick strands, clamped to 2 to 7. About as many fine hairs are added between them (`2n - 1` strands in all, every second one a hair). |
| `sense` | `number` | `290` | Distance from the pill edge, in px, at which the goo notices the cursor and starts reaching. |
| `reach` | `number` | `140` | Distance from the edge, in px, at which the strands lunge and grab the fingers. |
| `release` | `number` | `215` | Distance from the edge, in px, at which they snap. Keep it above `reach`. |
| `cursor` | `"glove" \| "native"` | `"glove"` | `"glove"` draws the cartoon hand and hides the system pointer inside the stage; `"native"` keeps the system pointer and the strands gather round its hotspot. |
| `height` | `number` | `420` | Stage height in px. |
| `autoplay` | `boolean` | `false` | A ghost glove plays with the button until a real pointer arrives, and again after the pointer has been away for 2.5 seconds. |
| `className` | `string` | none | Extra classes for the stage (merged after the defaults). |

## Layout

- The stage is `relative flex w-full items-center justify-center overflow-hidden rounded-[24px]` with inline `height`, a fixed light background `linear-gradient(180deg,#f5f4f6 0%,#efeef1 55%,#e4e3e6 100%)` and an Apple system font stack. It does not change with the site theme.
- Layers inside it, bottom to top: the WebGL canvas (`z-10`), the button (`z-20`), a 2D "fx" canvas for fine hairs and web threads (`z-[25]`), a 2D "hand" canvas for the glove (`z-30`). All three canvases are `absolute inset-0 h-full w-full`, `pointer-events-none` and `aria-hidden`.
- The button is `h-[64px] rounded-full px-9`, 20px bold, `tracking-[-0.02em]`, text `#f4f4f4` with a thin dark text shadow, transparent background (the shader paints the pill under it), `whileTap` scale 0.96 on a spring (stiffness 420, damping 18), and a `focus-visible:ring-4 ring-black/25` ring.
- Canvas size is layout size times `min(2, devicePixelRatio)`. A `ResizeObserver` on the stage refits them. All sizes come from `offsetWidth/offsetHeight`, and pointer and button rects are divided by `k = rect.width / offsetWidth`, so it works inside a parent that is CSS-scaled.

## Motion

- Rendering: one fragment shader draws a single signed distance field with a smooth minimum (`smin` over `(distance, thickness)` pairs). It joins the pill (a stadium, thickness = half its height), a mound pulled toward the hand (a tapered capsule, union `k = 14`), up to 7 strands of 12 points each (hard union of tapered capsules per strand, strands melted together with `k = 3.5`), up to 8 spikes and 6 droplets, and finally everything into the body with `k = 11`. Limits are baked in as `MS = 7`, `NP = 12`, `MSPK = 8`, `MDROP = 6`.
- Shading: near-black lacquer. Normals come from the field gradient and a per-part circular height profile (a pillow for the pill, a tube for a strand). The colour reflects a simple studio: a softbox above, a window on the left, a fill on the right, a pale floor below, plus two sharp glints. A faint contact shadow is cast down and a little right. Output is premultiplied alpha, and only a bounding box around the goo (plus 34px of padding) is shaded each frame.
- Pointer: a `pointermove` listener on `window` stores the position in stage coordinates. The distance `D` is measured from the middle of the hand to the pill edge (over the button it counts as 0). With `autoplay` and no real pointer, a ghost hand follows a looping Catmull-Rom path of 12 waypoints (fractions of the stage, 0.55 to 1.4 seconds per leg).
- State machine: `idle` to `seek` when the hand is within `sense`; `seek` to `grow` when within `reach`; `grow` (0.3 seconds of lunging, with a coil that tightens around each finger) to `hold`; `grow`/`hold` to `snap` past `release` or when the pointer leaves; `seek` to `snap` (gentle) past `sense + 25`; a gentle `snap` goes back to `seek` if the hand returns. A violent snap kicks the mound back (`moundV -= 90`), spawns up to 8 spikes at the strand roots and a few droplets that fall and shrink. The state returns to `idle` once every strand has reeled in.
- Strands are verlet ropes: root pinned just inside the pill edge and sliding along the outline toward the hand (the pill outline is parametrised by arc length), damping 0.92 (0.86 while snapping), gravity, a slow sine wobble, 14 distance-constraint passes and 2 bending-smoothing passes. While seeking, each tip eases part of the way toward its finger (`reachK` 0.55 to 0.95, a darting pulse and a sideways sway). While holding, the tip is pinned to its grip point on the glove. Radius tapers from `width * 3` at the root to `width * 1.1` at the tip, thins by up to 50 percent as the strand stretches, and a pulse travels from the body toward the hand.
- The mound is a damped spring (stiffness 150, damping 9) whose target grows with how hard it is reaching, so it wobbles when the strands let go. A `lean` value shifts the reflections toward the side the hand is on.
- Glove: a 32 x 36 path drawn at scale 1.55 with its fingertip at the pointer, with eight grip points (index tip, three knuckles, thumb, index joint, palm, cuff). Each caught finger grows black glossy skin, clipped to the glove, that creeps toward the palm at 0.5 per second and recedes at 1.4 per second. The last stretch of each strand is redrawn over the glove so it looks wrapped.
- Fine hairs and a few web threads between neighbouring strands are drawn on the 2D fx canvas while holding or snapping.
- The animation loop pauses while the stage is off screen (`IntersectionObserver`). Under reduced motion there is no loop: the goo never moves, the glove is not used, the system pointer stays, the tap scale is off, and the pill is drawn once by the shader (and again on resize). If WebGL is unavailable, the shader fails to build or the context is lost, the button paints its own glossy dark pill with CSS instead.
- On unmount cancel the frame, disconnect both observers, remove the listeners, restore the cursor styles and delete the shader program, shaders and buffer. It is safe to mount twice (React Strict Mode).

## Accessibility

- It is a native `<button>`: focusable, activated by Enter and Space, with a visible focus ring. The goo only reacts to the pointer; keyboard users get a plain pill.
- The canvases are `aria-hidden`. The label is the accessible name.
- In glove mode the system cursor is hidden only while the pointer is inside the stage; use `cursor="native"` if that is a problem. Reduced motion forces the system pointer.
