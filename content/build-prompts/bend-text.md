# Bend Text

Build a line of type you can pluck like a guitar string. The text runs along a thin horizontal string and drifts slowly along it. Grab anywhere and pull: the string bends to pass through your hand and the words flow round the curve. Let go and it twangs back, overshooting a few times before it lies flat. The feel is playful but clean, on a white Apple-like card.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.path`, `motion.textPath`, `motion.circle`, `useMotionValue`, `useSpring`, `useTransform`, `animate`, `useReducedMotion`).
- File: `components/bend-text/bend-text.tsx`. Named export `BendText`, exported `BendTextProps`.

## API

- `text?: string`, default `"PLUCK THE LINE · MAKE IT SING · "` (one repeat; rendered four times).
- `accent?: string`, default `"#0071e3"`: grab point and focus ring.
- `hint?: string`, default `"Grab the line, pull, and let go."`; empty string hides it.
- `onPluck?: (pull: number) => void`: called on release with the distance of the grab point from rest, in stage units.
- `autoplay?: boolean`, default `false`.
- `className?: string` on the root.

## Layout and look

- Root: column, centred, 12px gap, `max-width: 100%`.
- Stage: a 340×260 box (`width: 340px; max-width: 100%; aspect-ratio: 340/260`), radius 24px, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05)` (dark `0 0 0 1px rgba(255,255,255,.08)`), `overflow: hidden`, `touch-action: none`, no text selection, `cursor: grab` (`grabbing` while active).
- One SVG fills it: `viewBox="0 0 340 260"`, width/height 100%, `aria-hidden`. Constants `W = 340`, `H = 260`, rest height `Y = 130`.
- String: a path `M 10 Y Q (2·x − W/2) (2·y − Y) (W − 10) Y`, where (x, y) is the sprung grab point. Putting the control point there makes the curve pass through (x, y). Stroke 1px `#e5e5ea` (dark `#3a3a3c`), no fill. The path gets an id unique per instance (`bend-${useId()}`).
- Text: `<text>` 22px, weight 700, letter-spacing 1, `dy="-8"` (sits just above the string), fill `#1d1d1f` (dark `#f5f5f7`), `white-space: pre`, containing a `<textPath href="#bend-…">` with `text.repeat(4)`.
- Grab point: circle at the sprung (x, y), r 5, fill `accent`, opacity .85.
- Anchors: circles at (10, Y) and (W − 10, Y), r 3, fill `#c7c7cc` (dark `#48484a`).
- Hint: 13px, `#86868b` (dark `#98989d`).

## Motion

- Target motion values `tx`, `ty` start at (W/2, Y). The drawn point is `cx = useSpring(tx)`, `cy = useSpring(ty)` with stiffness 180, damping 4, mass 0.6: very underdamped, so it overshoots several times.
- Drift: the `textPath`'s `startOffset` (in SVG units) decreases by 11.5 units per second (equal to 0.06% of the path per frame at 60fps), using rAF with frame time capped at 50ms. It wraps by adding the measured length of ONE repeat when it goes below minus that length, so the loop is seamless. Measure it with `getComputedTextLength()` of a hidden `<text>` with the same font settings containing one repeat (fallback 450). No drift when the user prefers reduced motion.
- Pluck (used by autoplay and the keyboard): stop any running pluck, `jump` `tx`/`ty` to the spring's current values, animate `tx` and `ty` to the pull point over 0.5s `easeOut`, then on completion set them back to (W/2, Y) so the springs twang. Stop running animations on unmount.

## Interaction and states

- Pointer down on the stage: capture the pointer, mark touched, stop any pluck, and set (tx, ty) to the pointer position in stage units (`(clientX − left) / width · W`, same for y with H), so it works when the stage is scaled down.
- Pointer move while dragging: set tx clamped to [40, W − 40] and ty clamped to [20, H − 20].
- Pointer up, cancel or lost capture: call `onPluck(hypot(tx − W/2, ty − Y))`, then set (tx, ty) back to rest.
- Keyboard: the stage is focusable (`role="button"`, `tabIndex=0`). Enter, Space or ArrowUp plucks to (W/2, 40); ArrowDown to (W/2, 220); ArrowLeft to (90, 40); ArrowRight to (250, 220). Each also calls `onPluck` with that pull distance.

## Autoplay demo

With `autoplay`, every 2600ms pluck to a random x in [90, 250] and y either 40 or 220 (50/50). A `touched` ref set on pointer down or key pluck makes the next tick clear the interval for good.

## Accessibility

- Stage: `role="button"`, `aria-label="<text trimmed>. Press Enter or the arrow keys to pluck the line."`.
- Focus ring: `focus-visible` 2px in `accent`; no default outline.
- The SVG is `aria-hidden`.

## Acceptance checklist

- [ ] At rest the text sits flat on the string and drifts left with no visible jump when it wraps.
- [ ] Dragging bends the string so it passes under the pointer, with the text following the curve.
- [ ] Releasing makes the string overshoot and wobble several times before settling.
- [ ] The grab dot is clamped 40 units from the sides and 20 from top and bottom.
- [ ] Autoplay plucks every 2.6s and stops for good on first touch.
- [ ] Enter and the arrow keys pluck it; `onPluck` fires on every release.
- [ ] Below 340px wide the stage scales down and dragging still tracks the pointer.
- [ ] Dark mode swaps the card, string, text and anchors.
