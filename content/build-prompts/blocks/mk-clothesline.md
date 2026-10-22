# Clothesline

Build a testimonials section where four customer quotes hang as small polaroid-style cards from pegs on a washing line. The rope is a real simulated rope: it sags under each card, you can pluck it with the pointer or tug a card down and everything bounces and the cards swing on their pegs. A faint breeze keeps it all moving. Clicking a card opens the full quote in a small dialog. It should feel Apple-light, physical and playful but calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container query `@container`), framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), and a `cn` helper. No physics library: the rope is a hand-written verlet chain driven by `requestAnimationFrame`.
- File: `components/blocks/clothesline.tsx`, named export `Clothesline` and type `ClotheslineProps`. Also export the `ClotheslineTestimonial` type and `DEFAULT_CLOTHESLINE_PEOPLE`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `people` | `ClotheslineTestimonial[]` | 4 demo people | `{ name, role, quote, hue: [colourA, colourB], at?: number }`. `at` is the rope point (1 to 28) the peg clips onto; if omitted, cards are spread evenly. Use a stable array. |
| `hint` | `string` | `"Pluck the line, tug a card, or click one to read it."` | Small line under the line. |
| `closeLabel` | `string` | `"Close"` | Button label inside the opened quote. |
| `autoplay` | `boolean` | `false` | Plucks the rope and sends a gust every 1.8s until the visitor first touches the section. |
| `onAction` | `(action: "open" \| "close", person) => void` | none | Called when a quote opens or closes. Nothing navigates. |
| `className` | `string` | none | Extra classes on the section. |

Demo people: Maya Chen (Design lead, Loop, hue `#ff9f0a` to `#ff375f`, at 4), Arjun Rao (Founder, Tally, `#30d158` to `#0a84ff`, at 11), Lena Ortiz (Engineer, Wayfare, `#bf5af2` to `#5e5ce6`, at 18), Tom Becker (PM, Relay, `#64d2ff` to `#30d158`, at 25). Quotes: "We replaced three libraries with this. Our product finally feels like one thing." / "Shipped our pricing page in an afternoon and people keep asking how we built it." / "The motion is the good kind. It explains things instead of showing off." / "Our onboarding completion went up the week we swapped in the new checklist."

## Layout and look

- Root `<section aria-label="Customer testimonials">`: `@container`, full width, flex column, centred, gap 8px, padding 48px vertical and 16px horizontal, background white / `#000` in dark.
- Stage: relative, `max-width: 640px`, full width, `aspect-ratio: 600 / 380`, `overflow: hidden`, `touch-action: none`, `user-select: none`. Everything inside is drawn in a fixed 600 x 380 coordinate space, wrapped in a div at `transform: scale(k)` with origin top-left, where `k = stage width / 600`, kept current with a `ResizeObserver`.
- Posts: two 10px wide rounded (4px) rects at x = 20 and x = 580, from y = 56 down to the bottom of the stage, fill `#d2d2d7` / dark `#3a3a3c`.
- Rope: SVG path, no fill, stroke `#a1846a` (dark `#b99a7e`), width 2.6, round caps, drawn as quadratic curves through the midpoints of the 30 rope points.
- Card: 112 x 150px button, radius 6px, padding 8px (10px bottom), background `#fdfcf9` / dark `#2c2c2e`, transform-origin top centre, shadow `0 2px 3px rgba(0,0,0,.08), 0 14px 24px -14px rgba(0,0,0,.45)` (dark `.4` and `.9`). Inside: a 64px tall photo block (radius 3px, `linear-gradient(140deg, hueA, hueB)`, the person's initials bottom-left in white, 26px semibold, padding 8px); then the quote in curly quotes, 10.5px, line-height 1.3, clamped to three lines, `#3a3a3c` / `#d1d1d6`, 8px below the block; then the name pinned to the bottom, 10px semibold, `#1d1d1f` / `#f5f5f7`.
- Peg: an SVG group per card, drawn above the card, rotated to the rope's local slope: a rounded wooden rect 26 x 10 (radius 3, fill `#d9b48a`, stroke `#b08a60` .8) turned 90 degrees, with a 3 x 10 grey metal band (`#9a9aa0`).
- Hint: 12px, centred, `#6e6e73` / `#a1a1a6`.
- Opened quote: a scrim over the whole stage (`white/60`, dark `black/60`, `backdrop-blur-sm`, 24px padding, content centred) holding a 380px max-width card, radius 20px, padding 24px, white / `#1c1c1e`, shadow `0 30px 60px -24px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05)` (dark: `.9` and `#3a3a3c`). The quote is 19px, line-height 1.4, tracking -0.01em; below it a row with a 36px round gradient avatar, the name (14px semibold) over the role (13px, `#6e6e73` / `#a1a1a6`), and a pill Close button pushed right (32px tall, 12px medium, `#f0f0f3` / `#2c2c2e` fill).

## Motion

The rope is a verlet chain of 30 points evenly spaced from x = 20 to x = 580 at y = 70. The first and last points are pinned. Each point stores its position and previous position. Segment rest length = 560 / 29 x 1.035 (a little slack so it sags).

Physics runs at a fixed 60 Hz step (accumulate real time, run up to four steps per frame, so behaviour is the same at any refresh rate). Per step:
1. `breeze = 0.05 sin(0.9 t) + 0.03 sin(2.3 t) + gust`, with t in seconds; then `gust *= 0.96`.
2. For each free point: velocity = (position - previous) x 0.985; add velocity, plus `breeze x 0.3` to x, plus gravity to y: 0.22 per step, or 0.55 for points that carry a card peg.
3. If a point is being dragged, snap it to the pointer.
4. Eight constraint iterations over every segment: push both ends toward the rest length by half the error each; a pinned or dragged end takes none, so the other end takes all of it.

Each card is a pendulum hanging from its peg point. Per step: `v += -0.012 sin(a) - 0.035 v - 0.05 (dvx) + breeze x 0.006`, then `a += v`, where `dvx` is the change in the peg point's horizontal velocity since the last step. The card is placed at `translate(pegX - 56, pegY + 12)` and `rotate(a rad)`. The peg rotates to the angle between the rope points either side of it.

On load the rope starts flat and visibly sags into place. The loop runs only while the section is on screen (IntersectionObserver) and the tab is visible, and is cancelled on unmount.

Opened quote: scrim fades in. The card springs from `y -40, rotate -4deg, scale .9` to rest (stiffness 320, damping 22) and exits to `y 20, opacity 0`. Reduced motion: opacity fades only, 0.15s.

## Interaction and states

- Pressing within 26 units of a free rope point grabs the nearest one and drags it to the pointer (y clamped 10 to 360); releasing lets go and the rope whips back. Pointer capture keeps the drag going outside the stage.
- Pressing a card grabs its peg point. Until the pointer has moved more than 5px it is a click: releasing opens the quote. After that it is a tug: the peg point follows the pointer (x clamped 40 to 560, y clamped 20 to 220, pointer y minus 30).
- Escape, the Close button, or clicking the scrim closes the quote. The card behind it is `inert` while open, focus moves to Close, and returns to the card that opened it.
- Reduced motion: no breeze, no autoplay plucks, and the rope starts already settled. Dragging and tugging still work, and the loop stops again once things settle.

## Autoplay demo

With `autoplay`, every 1.8s (only while on screen, tab visible and motion allowed): set the gust to a random sign x (0.25 to 0.5) and yank a random interior rope point (index 3 to 26) up 9 units to pluck it. Use a seeded generator so it is the same each run. It stops permanently on the first pointer press on the stage.

## Accessibility

- Each card is a real `<button>` with `aria-haspopup="dialog"` and an `aria-label` of "Name, Role: quote"; the visual contents are `aria-hidden`. Enter or Space opens it (a click with `detail === 0` opens it directly).
- The opened note is `role="dialog"`, `aria-modal`, labelled by the person's name.
- Focus rings: 2px `#0071e3` (dark `#0a84ff`).
- Posts, rope and pegs are `aria-hidden`.

## Acceptance checklist

- [ ] The rope sags under each card on load and settles with a gentle, ongoing sway.
- [ ] Dragging the rope pulls it and it springs back, rippling along the line.
- [ ] Tugging a card down stretches the rope; releasing makes the cards swing on their pegs.
- [ ] A press-and-release on a card without moving opens its quote; moving more than 5px does not.
- [ ] Tab reaches each card; Enter opens it, focus lands on Close, Escape closes and focus returns to the card.
- [ ] With `autoplay`, the line is plucked about every 1.8s until the first touch.
- [ ] Off screen or in a hidden tab the animation loop is not running.
- [ ] With reduced motion, nothing moves on its own but dragging still works.
- [ ] Dark mode swaps cards, scrim, dialog and posts to the dark palette.
