Build a card that is really a little paper-cut diorama: a sky, a sun, three mountain ridges, a band of pine-topped hills and a frosted glass label. Point at it and the card tilts toward you in 3D while its layers spring apart in depth like a pop-up book opening, overshooting and settling. The layers then drift against the pointer at different rates for real parallax, and a soft sheen follows the pointer. Leave and it all folds flat again.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`, `useMotionTemplate`, `useReducedMotion`). CSS 3D transforms only (no WebGL).
- File: `components/vector-tilt-scene/vector-tilt-scene.tsx`, named export `VectorTiltScene`, exported type `VectorTiltSceneProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `eyebrow` | `string` | `"Scene depth"` | Small caption on the label. |
| `title` | `string` | `"Vector Tilt Scene"` | Label title; also in the accessible name. |
| `description` | `string` | `"Layers that open up as you look closer."` | Line under the title. |
| `children` | `ReactNode` | – | Replaces the glass label, floating on the top layer. |
| `maxTilt` | `number` | `14` | Max tilt in degrees. |
| `depth` | `number` | `26` | Z gap between layers when open, px. |
| `glare` | `boolean` | `true` | Sheen following the pointer. |
| `hint` | `string` | `"Point at the card."` | Under the card; `""` hides. |
| `autoplay` | `boolean` | `false` | Pops open and tilts in a slow figure-eight until touched. |
| `className` | `string` | `""` | Root classes. |

## Layout and look

- Root: column, centred, full width, max 380px, gap 16. Hint 12px `#86868b` (dark `#a1a1a6`).
- Perspective wrapper: `perspective: 1000px`. Card: `aspect-ratio: 4/3`, full width, radius 24, `transform-style: preserve-3d`, focusable, focus ring 2px `#0071e3` (dark `#0a84ff`) with 4px offset on `#f5f5f7` (dark black).
- Layer 0 (sky, z = 0): radius 24, `linear-gradient(180deg, #a9d4ff, #e8f3ff 70%, #fff6ec)`; dark `#070d24, #15204a 70%, #2a2050`. Inner hairline `inset 0 0 0 1px rgba(0,0,0,.06)` (dark white 8%). Its moving drop shadow: `{−sx·12}px {26 + sy·10}px 50px −28px rgba(0,0,0,.45)`.
- Each "plane" is an absolutely positioned, full-size, radius-24, `overflow: hidden`, pointer-events-none layer with its own `z`; inside, an inner box inset −24px that drifts.
- Layer 1 (sun, drift 2): a 56px disc at right 22%, top 22%, `linear-gradient(160deg, #ffe29a, #ffad5a)`, glow `0 0 44px rgba(255,170,80,.65)`; dark moon `#ffffff → #c9d4ee`, glow `rgba(200,215,255,.45)`.
- Layers 2–5: SVGs `viewBox 0 0 360 270`, `preserveAspectRatio="xMidYMax slice"`, anchored to the bottom, top 24px, closed to the bottom edge:
  - drift 4, `#b7cff0` (dark `#2b3b68`): jagged peaks between y≈104 and 168.
  - drift 8, `#86aee0` (dark `#1f2c52`): smooth rolling hills, y≈150–214.
  - drift 13, `#6fbf8e` (dark `#15213d`): broad gentle hills, y≈182–232.
  - drift 19, `#3c875b` (dark `#0c162b`): a low wave around y≈226–242 with two narrow pine spikes rising to about y 208–214.
- Label (top layer): absolute top-left 16px, max 70% wide, radius 16, padding 12×16, white 85% (dark `#1c1c1e` at 85%), shadow `0 10px 30px -14px rgba(0,0,0,.4)`. Eyebrow 11px medium `#0059b3` (dark `#6cb6ff`); title 18px semibold leading tight tracking −0.025em `#1d1d1f` (dark `#f5f5f7`), 2px below; description 12px snug `#6e6e73` (dark `#a1a1a6`), 4px below.
- Glare (if `glare`, not reduced): full card, radius 24, `mix-blend-mode: soft-light`, `radial-gradient(260px circle at gx gy, rgba(255,255,255,.45), transparent 60%)`, on the top layer.

## Motion

- Pointer, normalised: `px`, `py` in −1…1 from the card rect (clamped). Springs `sx`, `sy` = `useSpring(px/py, stiffness 170, damping 16, mass 0.8)`.
- Tilt: `rotateY = sx × maxTilt`, `rotateX = −sy × maxTilt` (top edge comes toward a pointer at the top).
- Pop: `pop = useSpring(0, stiffness 210, damping 11, mass 0.9)`; low damping so the layers overshoot and settle. Layer `z = pop × k × depth` with k = 0 (sky), 1 (sun), 2, 3, 4, 5 (ridges, back to front) and 5.6 for the label and glare.
- Parallax: each plane's inner box moves `x = −sx × drift`, `y = −sy × drift × 0.5` px, so near layers slide more than far ones.
- Glare centre: `gx = 50 + sx × 50%`, `gy = 50 + sy × 50%`; glare opacity maps `pop` 0 → 1 to 0 → 1.
- Shadow offsets follow the tilt as given above.

## Interaction and states

- `pointermove` on the card: mark touched, set `px/py`, `pop` 1. `pointerleave` (only once touched): `px/py` 0 and `pop` 0, so it folds flat and level. `pointerdown` marks touched.
- Keyboard: Arrow keys nudge `px/py` by ±0.25 (clamped) and pop open, with `preventDefault`. Focus pops it open; blur (once touched) folds it.
- Reduced motion: no tilt (rotations forced to 0), no glare, no autoplay. Layers still separate in z and drift, so focus/hover still gives feedback without rotation.
- Custom `children` replace the label and inherit the top-layer z.

## Autoplay demo

With `autoplay` (not reduced): set `pop` to 1 immediately and run a rAF loop setting `px = sin(0.9t) × 0.75`, `py = sin(1.8t) × 0.45` (t in seconds), a slow figure-eight. Stop the loop as soon as the user moves over, presses or uses keys on the card; cancel it on unmount.

## Accessibility

- The card is `role="img"` with the label "{title}. {description}", focusable with a visible ring. All layers and the glare are pointer-events none; decorative SVGs are `aria-hidden`.

## Acceptance checklist

- At rest the card is a flat landscape with a sun and a frosted label.
- Hovering tilts the card up to 14° toward the pointer and the layers pop apart with a visible overshoot.
- Moving the pointer slides the front ridge noticeably more than the back ones.
- A soft white sheen follows the pointer once open; the drop shadow shifts opposite the tilt.
- Leaving folds the scene flat and level again.
- Arrow keys tilt and open it; focus shows a ring.
- Autoplay sways in a figure-eight until touched; dark mode turns it into a moonlit night.
