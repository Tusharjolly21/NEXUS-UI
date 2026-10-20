# Scrolling Testimonials

Build a "wall of love" testimonials section: a small header above a fixed-height wall of quote cards in up to three columns, each scrolling endlessly at its own speed (the middle one downward), faded at the top and bottom. Hovering eases the wall to a stop rather than freezing it, and the card under the pointer stays lit while the rest dim. Wheel, drag or arrow keys push the columns like a flywheel: they speed up, lean with the speed, and coast back to cruising.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[340px]:`, `@min-[400px]:`, `@min-[560px]:`) and a named group (`group/wall`), framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`). One `requestAnimationFrame` loop drives all columns.
- File: `components/scrolling-testimonials/scrolling-testimonials.tsx`, named export `ScrollingTestimonials`, exported `DEFAULT_SCROLLING_TESTIMONIALS`, types `Testimonial` and `ScrollingTestimonialsProps`.

## API

`Testimonial`: `{ id: string; quote: string; name: string; role: string; company?: string; avatar?: string; rating?: number }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `testimonials` | `Testimonial[]` | 9 samples (Lena Moritz, Design lead, Halcyon: "Shipped the whole marketing site in a weekend. Nobody believes the animations were copy-paste." … all rated 5) | Cards. |
| `columns` | `1 \| 2 \| 3` | `3` | Column count (clamped). |
| `speed` | `number` | `32000` | ms for column 0 to loop once. |
| `columnSpeeds` | `number[]` | — | Per-column loop ms. |
| `reverseColumns` | `boolean[]` | `[false, true, false]` | `true` scrolls downward. |
| `pauseOnHover` | `boolean` | `true` | Ease to a stop on hover. |
| `showHeader` | `boolean` | `true` | Show header. |
| `badge` / `title` / `subtitle` | `string` | "Wall of love" / "Trusted by product teams" / "Designers and engineers ship faster with it." | Header text. |
| `height` | `number` | `420` | Wall height px. |
| `backgroundColor`, `cardBackground`, `borderColor`, `textColor`, `mutedTextColor` | `string` | — | Optional overrides (inline styles); otherwise light/dark tokens. |
| `avatarSize` | `number` | `32` | Avatar px. |
| `showStars` | `boolean` | `true` | Draw ratings. |
| `fadeMask` | `boolean` | `true` | Fade top/bottom. |
| `autoplay` | `boolean` | `false` | Fling up and down until touched. |
| `className` | `string` | `""` | Section classes. |

## Layout and look

- `<section>`: `@container`, full width, `aria-label` = title or "Testimonials".
- Header (margin-bottom 24px, centred): badge 12px medium `#6e6e73` / `#a1a1a6`; `<h2>` 26px semibold, tight leading, tracking −0.03em, `#1d1d1f` / `#f5f5f7`, 4px top margin; subtitle 14px grey, 6px top margin.
- Wall: relative, flex, gap 12px, padding 0 4px, overflow hidden, radius 24px, `select-none`, given `height`. Mask `linear-gradient(to bottom, transparent, #000 14%, #000 86%, transparent)` when `fadeMask`.
- Distribute testimonials round-robin into columns; avatar gradient tones also cycle by index: `#5ac8fa→#0071e3`, `#ffb340→#ff6b3d`, `#7ee0a1→#1fa463`, `#d6a4ff→#8e44ec`, `#ff8fa3→#ff375f`.
- Narrow containers hide later columns: column 2 shows from 400px (from 340px when only 2 columns), column 3 from 560px.
- Each column: flex-1, a motion wrapper (`y` and `skewY`) holding the list twice (second copy `aria-hidden`), each list a column with 12px gap and 12px bottom padding.
- Card `<figure>`: radius 22px, padding 20px, white / `#1c1c1e`, text ink, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, shadow `.9`). While the wall is hovered all cards drop to opacity .55; the hovered card stays at 1 and lifts 2px (300ms transition).
  - Stars: five 12px stars (path `M6 .8 7.6 4l3.5.5-2.6 2.4.7 3.5L6 8.7 2.8 10.4l.7-3.5L.9 4.5 4.4 4Z`), filled `#ff9f0a` up to the rating, rest `#d2d2d7` / `#48484a`, gap 2px.
  - Quote `<blockquote>` 14px, line-height 1.5, tracking −0.01em, `text-wrap: pretty`, 10px below stars.
  - Caption (16px top, gap 10px): avatar image (round, cover) or initials (first letters of up to two words) in white semibold at `0.36 × size` on the tone gradient at 135°. Name 13px semibold truncating; "role, company" 12px grey truncating.
- Pause button: absolute bottom/right 12px, 32px circle, `white/90` (dark `#2c2c2e/90`), backdrop blur, shadow `0 0 0 1px rgba(0,0,0,.06), 0 6px 16px -8px rgba(0,0,0,.35)`, with a 10×12 pause (two 3px rounded bars) or play glyph. Hidden under reduced motion.

## Motion

- Per frame (`dt` capped at 50ms): a speed `factor` eases toward 1 or 0 with `factor += (want − factor)·(1 − e^(−5·dt))`. `want` is 0 if reduced motion, paused, or (`pauseOnHover` and hovered and not dragging).
- `push` (px/s) decays like a flywheel: `push·e^(−2.6·dt)`, snapping to 0 below 2.
- Column i: loop duration `max(2000, columnSpeeds[i] ?? speed·(1 + 0.22i))`; direction −1 (up) or +1 (down). `pos += (dir·(listHeight / durSeconds)·factor + push·(0.8 + 0.15i))·dt`, then wrap into `[−h, 0)` with `((pos mod h) + h) mod h − h`, rounded to 0.01px.
- Lean: `skewY` maps push −1800 → 0 → 1800 to −3° → 0 → 3° (clamped), through a spring stiffness 220, damping 24, shared by all columns.

## Interaction and states

- Wheel: `push = clamp(push − deltaY·6, ±4000)` (not under reduced motion).
- Mouse drag (left button, not on a button): capture the pointer; on move, `v = Δy / max(8ms, Δt)`; `push = push·0.6 + clamp(v, ±4000)·0.4`. Release, cancel or leave ends the drag. While dragging, hover does not pause.
- ArrowDown adds −900 to push, ArrowUp adds +900.
- Pause button toggles playing (eases to a stop / back to speed).
- Any wheel, pointer down, key or button press marks the wall touched.
- Reduced motion: factor targets 0 and pushes are ignored, so the wall stays still.

## Autoplay demo

Unless reduced motion, every 3200ms set push alternately to −1500 and +1100 so the wall flings and coasts, until the first touch.

## Accessibility

- The wall is focusable (`tabIndex 0`), `role="region"`, `aria-roledescription="scrolling testimonials"`, `aria-label="Testimonials wall. Arrow keys push it."`, with a 2px `#0071e3` / `#0a84ff` focus ring. Stars are `role="img"` labelled "N out of 5 stars". Duplicate cards are `aria-hidden`. The pause button labels itself "Pause testimonials" / "Play testimonials".

## Acceptance checklist

- [ ] Three columns scroll seamlessly; the middle goes down and each runs at a different speed.
- [ ] Hover glides the wall to a stop over about half a second; the pointed card stays bright while others dim.
- [ ] A wheel flick speeds the columns and they lean up to 3°, then coast back.
- [ ] Mouse drag throws the wall in the drag direction.
- [ ] Arrow keys push it while focused.
- [ ] Narrow containers show 1 or 2 columns.
- [ ] The pause button stops and resumes smoothly.
- [ ] Autoplay flings alternately every 3.2s until touched.
