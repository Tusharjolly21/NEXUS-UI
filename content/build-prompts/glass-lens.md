# Glass Lens

Build a round glass puck you drag across a block of content. It magnifies what is under its centre and splits the colour into red and blue fringes toward the rim, like chromatic aberration in a real lens. Do it without shaders: the lens holds three extra copies of the content at slightly different magnifications, two of them tinted and blended. The feel is a heavy, polished piece of glass: it lifts when grabbed, glides with inertia and bounces softly off the edges.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `useMotionTemplate`).
- File: `components/glass-lens/glass-lens.tsx`, named export `GlassLens`, plus exported `GlassLensProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `size` | `number` | `150` | Lens diameter in px. |
| `zoom` | `number` | `1.45` | Magnification at the centre. |
| `width` | `number` | `520` | Width of the content surface in px. |
| `height` | `number` | `300` | Height of the content surface in px. |
| `children` | `ReactNode` | "Field notes" text block | Content under the glass. It is rendered four times, so it should be static. |
| `autoplay` | `boolean` | `false` | Drifts across the content by itself until the user drags it. |

Default content: a full-height column, vertically centred, 12px gap, 32px side padding:
- "Field notes": 13px semibold uppercase, tracking 0.14em, `#86868b` (dark `#8e8e93`).
- "Glass is not a filter you lay on top. It is a material that bends whatever sits behind it.": 30px semibold, line-height 1.12, tracking −0.03em, `#1d1d1f` (dark `#f5f5f7`).
- "Drag the lens across the page. The edges split light into colour, the centre magnifies.": 15px, line-height 1.5, `#6e6e73` (dark `#a1a1a6`).
All paragraphs with zero margin.

## Layout and look

- Surface: `relative overflow-hidden`, `width × height` (max-width 100%), radius 24px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 50px -28px rgba(0,0,0,.3)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 50px -28px rgba(0,0,0,.8)`. It renders `children` once as the page.
- Lens: absolutely at top-left, moved by motion values `x, y` (its top-left corner in surface px), `size × size`, round, `overflow-hidden`, white background (dark `#1c1c1e`). Shadow `0 24px 40px -14px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06)`; dark `0 24px 40px -14px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.14)`. `cursor-grab`, `active:cursor-grabbing`.
- Inside the lens, in this order:
  1. Red layer: content at scale `zoom·1.035`, colour `#ff2d55`.
  2. Blue layer: content at scale `zoom·0.965`, colour `#0a84ff`.
  3. Main layer: content at scale `zoom`, untinted, painted on top.
  Tinted layers use `mix-blend-mode: multiply` (dark: `screen`), opacity 0.55, and force every descendant's text colour to `currentColor` (e.g. `[&_*]:text-current!`), so the fringes are pure tint.
  4. Glass body overlay (`pointer-events-none`, round): `inset 0 0 0 1.5px rgba(255,255,255,.9), inset 0 10px 18px rgba(255,255,255,.7), inset 0 -14px 26px rgba(0,0,0,.10), inset 0 0 30px rgba(0,0,0,.06)`. Dark: `inset 0 0 0 1.5px rgba(255,255,255,.28), inset 0 10px 18px rgba(255,255,255,.12), inset 0 -14px 26px rgba(0,0,0,.45), inset 0 0 30px rgba(0,0,0,.3)`.
  5. Specular highlight: at left 18%, top 10%, 40% × 22%, rotated −24°, round, `linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,0))`, `blur(1px)`; dark opacity 0.4.

## The magnification maths

Each lens layer is a `width × height` box at the lens's top-left, translated by `(−x, −y)` so its content lines up exactly with the page beneath. It is then scaled around the point under the lens centre: `transform-origin: (x + r)px (y + r)px` where `r = size/2`. Build the origin with `useTransform` for each axis and `useMotionTemplate`, and the inner offsets with `useTransform(x, v => −v)`. Because the red copy is 3.5% larger and the blue 3.5% smaller, they line up at the centre and drift apart with distance from it, so fringes grow toward the rim.

Initial lens position: `x = width·0.18`, `y = height·0.3`.

## Motion

- **Drag**: framer `drag` on both axes, constraints `{ left: 0, top: 0, right: width − size, bottom: height − size }`, `dragElastic 0.15`, `dragTransition { power: 0.3, timeConstant: 300, bounceStiffness: 300, bounceDamping: 20 }` (short inertial glide, soft bounce off edges).
- `whileDrag { scale: 1.06 }`, `whileHover { scale: 1.02 }`.
- **Keyboard steps** animate with spring stiffness 300, damping 30.
- **Autoplay drift** animates x and y with a slow spring (stiffness 30, damping 12).

## Interaction and states

- Pointer down on the lens marks touched.
- Keyboard on the focused lens: arrow keys move 24px per press on that axis, clamped to `[0, width − size]` / `[0, height − size]`. Prevent default; mark touched. Other keys are ignored.

## Autoplay demo

With `autoplay`: first drift at 500ms, then every 2600ms, pick a random target inside the bounds and spring to it. Skip once touched. On cleanup clear timers and stop running animations.

## Accessibility

- Lens: `role="img"`, `tabIndex={0}`, `aria-label="Magnifying glass. Drag it, or use the arrow keys, to move it over the text."`. No default outline; focus-visible ring 2px `#0071e3` (dark `#0a84ff`).
- The three lens copies are `aria-hidden` so screen readers read the content once.

## Acceptance checklist

- [ ] The lens shows the text under it magnified by `zoom`, perfectly aligned at the centre.
- [ ] Red and blue fringes are invisible at the centre and widen toward the rim.
- [ ] In dark mode fringes still show (screen blend) on the dark background.
- [ ] Dragging lifts the lens to 1.06, flicks glide briefly, and edges bounce softly.
- [ ] The lens never leaves the surface after settling.
- [ ] Arrow keys move it 24px with a spring and stop at edges.
- [ ] Custom `children` work and are magnified the same way.
- [ ] Autoplay drifts slowly to random spots every 2.6s and stops after the first grab or key press.
