Build a before and after comparison slider. Press or drag anywhere and a divider springs to the pointer with some follow-through, the round handle stretches in the direction it travels, and each label chip fades out as the divider reaches it. It works with two images, with any two pieces of content, or with a drawn default scene so it needs no assets.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper (clsx plus tailwind-merge), framer-motion (`motion`, `useSpring`, `useTransform`, `useMotionTemplate`, `useVelocity`, `useReducedMotion`).
- File: `components/compare/compare.tsx`. Named export `Compare`, type `CompareProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `beforeImage` / `afterImage` | `string` | – | Image URLs for the left (before) and right (after) sides. |
| `beforeAlt` / `afterAlt` | `string` | `"Before"` / `"After"` | Alt text. |
| `beforeContent` / `afterContent` | `ReactNode` | – | Any content; if either is set, content mode replaces both images. |
| `beforeLabel` / `afterLabel` | `string` | – | Chips in the top corners; no label means no chip. |
| `initialPosition` | `number` | `50` | Starting divider position, clamped 0 to 100. |
| `mode` | `"drag" \| "hover"` | `"drag"` | Drag: press or drag anywhere. Hover: follows the pointer, returns on leave. |
| `onChange` | `(position: number) => void` | – | Rounded 0 to 100 position when the user moves it. |
| `autoplay` | `boolean` | `false` | Sweeps the divider until touched. |
| `className` | `string` | – | Merged last, so it can change aspect ratio and width. |

## Layout and look

- Root: `relative isolate`, `aspect-[4/3]`, full width, `max-w-[480px]`, `touch-pan-y`, no selection, overflow hidden, radius 22, background `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` and `rgba(0,0,0,.9)`). Cursor is `ew-resize`, or `grabbing` while a drag is held.
- Layers, bottom to top: the after side filling the root; the before side in a pointer-events-none layer clipped with `clip-path: inset(0 <100 - pos>% 0 0)`, so before shows on the left of the divider; the divider line; the handle; the chips.
- Images: absolutely filling, `object-cover`, not draggable. In content mode the after content is wrapped in an `absolute inset-0` div, but the before content is rendered as given, so callers should position it themselves (`absolute inset-0`). If only one content prop is set, the other side is empty.
- Default scene (a 400 by 300 SVG, `xMidYMid slice`, `aria-hidden`): an alpine lake at dusk. Sky gradient `#2a3b78`, `#c36b9a`, `#ffb36b`, `#ffd9a0` over the top 190 units; a soft sun at (262, 150) with a `#fff4d2` core; two mountain ridges `#5d3f7a` and `#3c2b5e` with pale snow caps; a lake gradient `#ffbf80` to `#b8678f` to `#1f2a5c`; three sun-reflection bars; `#1b1533` pines at both edges. With no before image or content, the before side is this same scene with `grayscale(1) contrast(.88) brightness(1.06)`.
- Divider: 2px wide, full height, `white/95`, shadow `0 0 0 .5px rgba(0,0,0,.15), 0 0 12px rgba(0,0,0,.25)`, centred on the position.
- Handle: centred vertically on the divider, `z-10`. Inner circle 44px, `white/90`, text `#1d1d1f`, `backdrop-blur-md`, shadow `0 8px 20px -6px rgba(0,0,0,.45)`, holding a 20px double-chevron icon (stroke 1.9, round caps).
- Chips: 12px from the top and side, pill, `black/45`, `backdrop-blur-md`, padding `4px 10px`, 12px semibold white; before top left, after top right.

## Motion

- Position is a spring: stiffness 320, damping 26, mass 0.7 (reduced motion: 2000 and 120, effectively instant). The divider, handle and clip all read from it.
- Handle stretch: a second spring (stiffness 500, damping 20) follows `min(0.45, |velocity| / 900)` (0 under reduced motion). The handle scales `scaleX = 1 + s` and `scaleY = 1 - 0.35 s`.
- Grab: the handle scales to 1.12 while held, spring 500 and 22.
- Chips: before opacity maps position 6 to 26 onto 0 to 1; after opacity maps 74 to 94 onto 1 to 0.

## Interaction and states

- Drag mode: a primary-button pointer down captures the pointer, jumps the spring to the pointer's percentage of the root width and sets the grabbed state; pointer move updates while held; up or cancel releases. Other buttons are ignored.
- Hover mode: pointer move sets the position; pointer leave goes back to the clamped `initialPosition`.
- Keyboard on the handle: Left or Down minus 5, Right or Up plus 5 (10 with Shift), Home 0, End 100. These do not scroll the page.
- `onChange` gets the rounded value on user input, including the return on hover leave. Autoplay ticks do not call it.

## Autoplay demo

With `autoplay`, every 1800ms set the position to the next of `[28, 74, 40, 62]`, cycling. A `touched` ref is set by a pointer down, a hover-mode move or a key press; the next tick clears the interval for good. 

## Accessibility

- The handle is `role="slider"`, `tabIndex 0`, `aria-label` "Comparison divider", `aria-valuemin` 0, `aria-valuemax` 100, `aria-valuenow` the rounded position, `aria-valuetext` "<n>% <beforeLabel or before>". Focus ring: 2px white, 2px `#0071e3` offset.
- Images carry their alt text.

## Acceptance checklist

- [ ] The default render shows a greyscale lake on the left and the colour lake on the right, split at 50%.
- [ ] Pressing anywhere jumps the divider with slight overshoot.
- [ ] The handle stretches when moving fast and swells when held.
- [ ] Chips fade out as the divider reaches them.
- [ ] Arrow, Shift, Home and End keys work.
- [ ] `mode="hover"` follows the pointer and eases home on leave.
- [ ] Content mode shows any markup on each side.

## Examples on the page

- Photo: `beforeImage="/images/lake-flat.jpg"`, `afterImage="/images/lake-graded.jpg"`, `beforeLabel="Original"`, `afterLabel="Graded"`; drag mode, 50%, 4:3.
- Any content: `beforeLabel="Before"`, `afterLabel="After"`, `className="aspect-[16/10] max-w-[440px]"`, and two `<pre>` elements as `beforeContent` (white, a `for` loop) and `afterContent` (`#1d1d1f` with white text, an `items.reduce(...)` call), each `absolute inset-0 p-5 font-mono text-sm`.
