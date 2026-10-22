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

# Zoom Lens

Build a magnifier for images and maps. A round lens follows the pointer on a spring and shows the picture at much higher magnification, so tiny labels that are unreadable in the overview become clear. Scroll over the picture, drag a slider or press plus and minus to change the zoom; leave the picture and the lens shrinks away. The demo picture is a drawn map of an invented harbour district whose street names are deliberately too small to read without the lens.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/glass-lens/zoom-lens.tsx`. Named export `ZoomLens` plus `ZoomLensProps`. Re-export from the folder's `index.ts`.
- No sound: it is pointer-driven and makes none.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `image` | `string` | drawn demo map | Picture to magnify (URL or data URI). |
| `darkImage` | `string` | dark demo map, or `image` | Picture for dark mode. |
| `aspectRatio` | `number` | `1800 / 1100` | Width divided by height. |
| `label` | `string` | "Map of the harbour district. Use the lens to read street names." | Accessible description. |
| `defaultZoom` | `number` | `2.6` | Starting magnification. |
| `minZoom` / `maxZoom` | `number` | `1.5` / `4` | Zoom range. |
| `lensSize` | `number` | `164` | Lens diameter in px. |
| `showControl` | `boolean` | `true` | Show the zoom slider. |
| `autoplay` | `boolean` | `false` | The lens wanders over the picture until touched. |
| `className` | `string` | none | Extra classes on the wrapper. |

## Layout and look

- Wrapper: a column, full width, `max-width 640px`, gap 12px.
- Picture frame: `relative`, full width, `aspect-ratio` from the prop, radius 22px, `overflow: hidden`, `cursor: none`, `touch-action: none`, `user-select: none`, `tabindex=0`, `role="group"` with the label plus "Arrow keys move the lens, plus and minus change the zoom." Background `#f4f1ea` (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). Focus outline 2px, offset 2px, `#0071e3` (dark `#0a84ff`).
- Picture: a div filling the frame with `background-size: 100% 100%`; a second div for dark mode shown only with `dark:`. If only `image` is given, one div serves both modes.
- Demo map, drawn as an SVG data URI at 1800 by 1100 (no canvas and no DOM access, so it is identical on server and client): a grid of city blocks every 150 by 120 (each 122 by 92, radius 8, inset 14), colours `#ebe6dc #e6e0d4 #efeae1` chosen by `(x + y) mod 3`, with six 30px window squares at 5% black; every seventh block (when `(x/150 + y/120) mod 7 = 3`) is a park `#cfe8c6` with five `#a9d39c` trees (r 7). A river `#a9cbe8`, 46px wide, round caps, along `M-40 820 C 500 640, 900 1040, 1840 700`. White avenues 16px wide at y=360, y=600, x=600, x=1200, and a 4px `#ffd36b` centre line on y=360 and x=600. Forty street names (Linden St, Harbour Rd, Mill Ln, Quay Ave, Orchard Way, Elm Row, Kiln St, Bridge St) at 11px semibold `#6b6b70`, positioned at `x = 30 + (i * 263) mod 1680`, `y = 66 + floor(i / 8) * 240`. An italic "River Ash" label at (820, 870) in `#3b6ea5`. Three pins (r 9) with bold 12px labels: Studio (640, 330) `#ff3b30`, Cafe Lumen (1230, 580) `#0a84ff`, Park gate (420, 610) `#34c759`.
- Dark map: background `#1c1c1e`, blocks `#27272b #2b2b30 #242428`, windows 5% white, parks `#1f3a28` with `#2f5a3b` trees, river `#1f4263`, avenues `#3d3d42`, centre line `#8c6f1f`, street labels `#a1a1a6`, river label `#7db4e6`, pin labels `#f5f5f7`.
- Lens: absolutely positioned at the frame's top-left, `lensSize` square, fully round, `overflow: hidden`, moved with `x`/`y` and `translate(-R, -R)` where `R = lensSize / 2`. Shadow `0 0 0 3px #fff, 0 0 0 4px rgba(0,0,0,.12), 0 18px 40px -10px rgba(0,0,0,.45)`; dark `0 0 0 3px #2c2c2e, 0 0 0 4px rgba(255,255,255,.16), 0 18px 40px -10px rgba(0,0,0,.85)`. Inside, the same picture layers with `background-size = frameWidth * zoom by frameHeight * zoom` and `background-position = -(x * zoom - R)px -(y * zoom - R)px`, plus a glass highlight `radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), transparent 45%)` (dark .14). Measure the frame with a `ResizeObserver` for the sizes.
- Zoom row: label "Zoom" 12.5px `#6e6e73` (dark `#a1a1a6`), a native range input (`accent-color #1d1d1f`, dark `#f5f5f7`, 1.5 to 4, step 0.1), and the value like "2.6x" in a 36px right-aligned tabular box, `#1d1d1f` (dark `#f5f5f7`).

## Motion

- Pointer: `mx`, `my` are the pointer in frame coordinates; the lens position springs after them (stiffness 260, damping 28). The first time the frame is measured, park the lens in the middle with no animation.
- Lens appear and disappear: scale 0 to 1 and opacity 0 to 1, spring stiffness 400, damping 26. It shows on entering the frame, on focus and on key presses, and hides on pointer leave once the pointer has been used.
- Wheel over the frame changes the zoom by `-deltaY * 0.004` within the range; attach it as a non-passive listener and `preventDefault` so the page does not scroll.
- Reduced motion: the lens follows the pointer exactly and fades in and out instead of scaling.

## Interaction and states

- Pointer move anywhere in the frame (touch drag included) drives the lens. Wheel, the slider and `+` / `=` (zoom in by 0.2) and `-` (zoom out by 0.2) change the zoom.
- Arrow keys (when the frame is focused) move the lens 40px and keep it inside the frame.

## Autoplay demo

Only while the component is on screen, the tab is visible and motion is not reduced: every 1.7s animate the lens to a new point, `x = width * (0.2 + 0.6 * frac(step * 0.37))` and `y = height * (0.25 + 0.5 * frac(step * 0.61))`, over 1.6s ease-in-out. The first pointer move, wheel, key press or slider change stops it for good.

## Accessibility

- The frame is a focusable group with a label that explains the keys; the pictures and lens are `aria-hidden` because the overview and the zoomed view show the same image.
- The slider is a native range input inside a label. All focus outlines are 2px.
- Note for authors: put any text that matters outside the image too; the lens is a visual aid.

## Acceptance checklist

- [ ] At rest, the street names are unreadable; under the lens they are clear.
- [ ] The lens lags the pointer slightly on a spring and pops in and out.
- [ ] Wheel, slider, plus and minus change the zoom; the readout updates; the page does not scroll while wheeling over the picture.
- [ ] Tab focuses the picture and the arrow keys move the lens.
- [ ] Works at 360px wide; the lens never leaves the frame when moved by keys.
- [ ] Dark mode swaps to the dark map and a dark lens rim.
- [ ] Custom `image` / `darkImage` / `aspectRatio` work.
- [ ] Autoplay wanders until the first touch and never restarts; reduced motion disables it.
