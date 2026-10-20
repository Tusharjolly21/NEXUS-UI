Build an endless horizontal reel of typographic posters bent around the inside of a curve: the cards in the middle sit back, shrink and face you, while the cards toward the edges swing round, grow and come forward like the walls of a curved screen. It drifts slowly on its own; you can grab it, scrub it and fling it so it coasts to a stop.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion.
- File: `components/curved-reel/curved-reel.tsx`, named export `CurvedReel`, exported `CurvedReelProps` and `ReelPoster`.
- One shared `MotionValue<number>` called `offset` drives everything. Each card derives its own transforms from it with `useTransform`, so nothing re-renders while it moves.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `posters` | `ReelPoster[]` | ten built-in posters | `{ bg, fg, big, small, serif? }`: background, text colour, large glyph, caption, italic serif glyph. |
| `autoplay` | `boolean` | `true` | Drifts the reel at 38 px/s; pauses for 2.5 s after any drag or key press. |

Default posters (bg / fg / big / small / serif): `#0040ff #fff "Aa" "04 · Grotesk"`; `#ff4f00 #1d1d1f "17" "Issue · Motion"`; `#1d1d1f #f5f5f7 "Ω" "Ohm Studio" serif`; `#f2efe6 #1d1d1f "Rare" "Type specimen" serif`; `#c8f560 #1d1d1f "↗" "Up & to the right"`; `#ff6482 #fff "03" "Spring · Summer"`; `#5e5ce6 #fff "Iso" "Grid systems"`; `#ffd60a #1d1d1f "!?" "Loud & clear"`; `#0b8f6a #e9fff6 "Fern" "Field notes" serif`; `#e5e5ea #1d1d1f "88" "Studio archive"`.

## Layout and look

- Wrapper: full width, vertical flex, centred, 12px gap; caption under the reel, 13px, `#86868b` (dark `#98989d`): "Drag the reel, or fling it."
- Viewport: full width up to 760px, 300px tall, `overflow: hidden`, radius 18px, `perspective: 900px`, `cursor: grab` (grabbing while active), `touch-action: pan-y`, no text selection. Horizontal edge fade with a mask: `linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)` (also `-webkit-mask-image`). Inside, an absolutely filling layer with `transform-style: preserve-3d`.
- Card: 150 × 210 px, absolutely centred in the viewport (left/top 50%, negative margins of half its size). Radius 14px, padding 16px, `overflow: hidden`, shadow `0 20px 40px -24px rgba(0,0,0,.5)`, background/text from the poster. Content is a column spaced between:
  - Top: "No. 01" (index + 1, zero-padded to 2), 9px, semibold, uppercase, tracking 0.18em, 70% opacity.
  - Middle: the big glyph, line-height 1, tracking −0.04em, 72px (46px when longer than 2 characters); semibold sans, or italic serif when `serif`.
  - Bottom: caption, 11px, medium, 80% opacity.
- Constants: card width CW = 150, gap 16, pitch 166, reference view width VIEW = 760. Track length `total = posters.length · 166`.
- Posters are vivid and need no dark variants.

## Motion

Per card `i`, from `offset`:

- Looping x from the centre: `v = i·166 − offset`, wrap into `[0, total)` with a positive modulo, then subtract `total` if `v > total/2`. Use it as `x`.
- Normalised distance: `d = clamp(x / 380, −1.4, 1.4)`.
- `rotateY = −d·48` degrees (cards on the right turn their face left toward the centre, and vice versa).
- `scale = 0.82 + |d|^1.6 · 0.42` (centre pinched to 0.82, edges grow).
- `z = |d|·90` px (edges come forward).
- `opacity = |d| > 1.25 ? 0 : 1` (hides the wrap seam).
- `filter: brightness(1 − min(0.25, |d|·0.18))`.

Drift: a rAF loop adds `dt·38` to `offset` whenever autoplay is on, no drag is active and the idle deadline has passed.

Drag: on pointer down, stop any running animation, capture the pointer and record the start x, start offset and a velocity tracker. On move, `offset = startOffset + (startX − clientX)` (drag left moves the reel forward) and velocity `= (lastX − clientX) / max(0.008, seconds since last move)`. On pointer up or cancel, clear the drag, set the idle deadline to now + 2.5 s, and start framer-motion inertia on `offset`: `{ type: "inertia", velocity, power: 0.5, timeConstant: 500 }`.

Keyboard: Left/Right arrows stop any running animation, set the idle deadline to now + 2.5 s, and spring `offset` by ∓/± one pitch (166px) with `{ type: "spring", stiffness: 220, damping: 28 }`. Right moves to the next poster.

## Interaction and states

- The reel is infinite in both directions; no snapping after a fling.
- Grabbing during inertia stops it instantly at the current position.
- Stop the inertia animation on unmount.

## Autoplay demo

`autoplay` defaults to `true`: the reel drifts continuously and resumes 2.5 s after the last drag or key press. With `autoplay={false}` it only moves when the user drags or uses the keys.

## Accessibility

- Viewport: `role="region"`, `aria-roledescription="carousel"`, aria-label "Poster reel. Drag to scroll, or use the left and right arrow keys.", `tabIndex={0}`, focus-visible outline 2px, offset 4px, `#0071e3` (dark `#2997ff`).

## Acceptance checklist

- Centre cards are smaller and flat-on; edge cards are larger, rotated up to ~48°, pushed forward and slightly darker.
- The reel loops seamlessly with no visible jump at the wrap point.
- Autoplay drifts at about 38 px/s and pauses 2.5 s after interaction.
- Dragging scrubs 1:1; a fast fling coasts and eases out (time constant 500 ms).
- Arrow keys step exactly one card with a spring.
- Edges fade out via the mask; vertical page scrolling still works on touch.
- Cards with glyphs longer than two characters use 46px, otherwise 72px.
