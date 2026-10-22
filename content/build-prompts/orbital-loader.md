Build a ring loader with a comet that laps the ring. In its endless mode the comet speeds up and eases off each lap, and its tail stretches with the speed. Given a `progress` value from 0 to 1, a blue arc fills behind the comet with a live percentage in the middle; at 100% the ring pops, turns green and draws a tick. A status line underneath cycles through messages.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `useReducedMotion`).
- File: `components/orbital-loader/orbital-loader.tsx`. Named export `OrbitalLoader`, type `OrbitalLoaderProps`.

## API

- `size?: number`, default `112`: diameter in px.
- `progress?: number`: 0 to 1. Leave it out for the endless orbit. 
- `messages?: string[]`: default `["Warming up the build", "Fetching your components", "Compiling styles", "Almost there"]`. One message stays fixed; `[]` hides the line.
- `doneMessage?: string`, default `"Done"`: shown once progress reaches 1.
- `color?: string`: arc and comet colour. Default `#0071e3` (dark `#0a84ff`).
- `onComplete?: () => void`: called once each time progress rises to 1.
- `autoplay?: boolean`, default `false`: runs a pretend upload on a loop until the loader is clicked.
- `className?: string` on the root.

## Layout and look

- Root: a flex column, centred, gap 16px, `role="progressbar"`. A relative `size` x `size` box sits above the status line.
- The ring is an SVG, `viewBox="0 0 120 120"`, overflow visible, centre (60, 60), radius 50. Layers, bottom to top:
  - A dotted guide ring: radius 33, stroke 1, `strokeDasharray="1.5 5"`, `#d2d2d7` (dark `#3a3a3c`). It rotates with the comet's free lap angle.
  - The track: radius 50, stroke 6, `#f0f0f3` (dark `#2c2c2e`).
  - The progress arc: same circle, stroke 6, round caps, rotated −90 degrees, drawn with `pathLength`. Opacity 1 when progress is given, 0 otherwise (0.3s).
  - A done ring: the same circle in `#30d158`, opacity 1 when done, 0 otherwise (0.25s).
  - The comet group, in the accent colour with no stroke: nine tail dots, the head (radius 5) and a halo (radius 9, opacity 0.18).
  - The tick: path `M43 61 L55 72 L78 47`, stroke 7, round caps and joins, `#30d158`.
- Percentage: centred over the ring, only when progress is given, semibold, tabular numerals, tracking −0.03em, `#1d1d1f` (dark `#f5f5f7`), font size `max(12, round(size × 0.17))` px, text `{n}%`.
- Status line: a 20px high, `w-56 max-w-full` box, `overflow-hidden`, centred, rendered when there are messages or the loader is done. Text is 13px medium, `#6e6e73` (dark `#a1a1a6`), followed by an ellipsis character; the done message is `#1a7f37` (dark `#30d158`) with no ellipsis.

## Motion

- Comet lap: a `requestAnimationFrame` loop with time `t`. Endless angle is `-pi/2 + 2pi(t/1.7) + 0.75 sin(2pi t/1.7)`, so a lap takes 1.7s with the speed swinging between a quarter and 1.75 times the average. With progress the head sits at `-pi/2 + fill × 2pi`, the end of the arc.
- Tail: dot `k` of 1 to 9 sits `(k/9) × stretch` radians behind the head, radius `4.2 × (1 − k/11)`, opacity `(1 − done) × (1 − k/10) × 0.9`. `stretch` is a spring (stiffness 180, damping 22, start 0.5) that targets the head's angular speed in rad/s times 0.16, clamped to 0.12 to 1.6.
- Fill: a spring (stiffness 70, damping 16) follows the clamped progress, so the arc eases and slightly overshoots. The arc's `pathLength` is that fill, at least 0.001. The percentage follows it.
- Done: a spring `done` (stiffness 260, damping 18) goes 0 to 1 when progress reaches 1. It fades the comet and percentage out, and draws the tick as `pathLength` mapped from `done` 0.35 to 1 (hidden until 0.36). The whole box then pops through scale `[1.12, 1]`, spring stiffness 420, damping 12, and `onComplete` fires once.
- Status text: advances every 1900ms when there are two or more messages and the loader is not done. Each line enters from `y 14, opacity 0, blur 4px` and exits to `y −14` with blur, spring 300/26, using `AnimatePresence mode="popLayout"`. Done swaps in the done message the same way.
- Reduced motion: the comet stays at the top, there is no pop, and text only fades.

## Interaction and states

- Endless: no `progress`; the arc and percentage are hidden and the comet orbits freely.
- Determinate: any number; the comet rides the arc's end. At or above 1 it is done.
- Autoplay: after 900ms step through `[progress, hold ms]` pairs `[0.08, 500]`, `[0.27, 700]`, `[0.34, 400]`, `[0.62, 800]`, `[0.71, 400]`, `[0.93, 700]`, `[1, 2200]`. Then go endless for 1800ms, reset to 0, wait 600ms and repeat. A pointer down on the loader stops it for good and hands control back to the `progress` prop.

## Accessibility

- Root has `aria-label="Loading"`, `aria-valuemin` 0, `aria-valuemax` 100, and `aria-valuenow` only when progress is given. `aria-valuetext` is the done message when done, `{n}%` when determinate, otherwise the current message.
- The SVG and percentage are `aria-hidden`; the status line is `aria-live="polite"`.

## Examples on the page

- Progress: `OrbitalLoader` with `progress` from the parent, `messages={["Uploading your files"]}` and `doneMessage="All files uploaded"`. The live demo runs it with `autoplay`, size 148, three messages ("Uploading your files", "Checking for duplicates", "Making thumbnails") and done message "All 24 files uploaded".
- Endless: `<OrbitalLoader size={120} />`, with no progress and the default cycling messages.

## Acceptance checklist

- [ ] Endless: the comet speeds up and slows each lap and its tail stretches and shrinks; no arc or percentage shows.
- [ ] With progress, the arc fills with a slight overshoot, the comet rides its end and the percentage counts.
- [ ] At 1 the ring pops, turns green, the comet fades, the tick draws and "Done" (or `doneMessage`) appears.
- [ ] Messages swap every 1.9s with blur and slide.
- [ ] Autoplay loops the pretend upload until a click.
- [ ] Dark mode swaps the track, guide ring, percentage and message colours.
