# Pressure Text

Build a headline that responds to pressure. Letters near the pointer swell taller and heavier and take the accent colour, falling away smoothly on either side, so the word bulges wherever you hover. With autoplay it breathes by itself, a bulge sweeping back and forth along the word. It relies on a variable font's weight axis.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.span`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`).
- File: `components/pressure-text/pressure-text.tsx`. Named export `PressureText`, exported `PressureTextProps`.

## API

- `text?: string`, default `"Feel every word"`.
- `accent?: string`, default `"#0071e3"`.
- `hint?: string`, default `"Move along the word."`; empty string hides it.
- `spread?: number`, default `1 / 5.5` (≈ 0.18): how far, as a share of the word's width, a letter can be from the pointer and still swell.
- `autoplay?: boolean`, default `false`.
- `className?: string` on the root.

## Layout and look

- Root: column, centred, 16px gap, `max-width: 100%`. It defines `--pt-ink: #1d1d1f` (dark `#f5f5f7`) and `--pt-accent: <accent>`.
- Headline box: `white-space: nowrap`, 16px horizontal and 24px vertical padding, font size `clamp(30px, 7vw, 56px)`, line-height 1, letter-spacing −0.03em, colour `#1d1d1f` (dark `#f5f5f7`), default cursor, no selection.
- Inside: an `sr-only` copy of the text, then an `aria-hidden` span with one `Letter` per character (`Array.from(text)`).
- A space renders as an inline-block `0.28em` wide gap. Every other character is an inline-block `motion.span` with `transform-origin: bottom`.
- Hint: 13px, `#86868b` (dark `#98989d`).

## Motion

- One motion value `px`: the pointer's x as a fraction of the headline box width; `-1` means nowhere (all letters rest).
- Per letter `i` of `n`: centre `at = (i + 0.5) / n`; `near = max(0, 1 − |px − at| · falloff)` with `falloff = 1 / max(0.02, spread)` (5.5 by default); `s = useSpring(near, { stiffness: 260, damping: 20 })`.
- From `s`: `fontWeight = round(250 + s · 650)` (250 to 900) and `fontVariationSettings = "wght" <that>`; `scaleY = 1 + s · 0.28`; `y = −s · 4` px; `color = s > 0.55 ? var(--pt-accent) : var(--pt-ink)` (a hard switch, not a blend).

## Interaction and states

- Pointer move over the headline: mark touched and set `px = (clientX − left) / width`.
- Pointer leave or cancel: `px = −1`, so the letters spring back to weight 250.

## Autoplay demo

With `autoplay` (and no reduced-motion preference), a rAF loop sets `px = 0.5 + sin(t · 0.9) · 0.55` where `t` is seconds since start, so the bulge sweeps slightly past both ends. The first pointer move marks touched and the loop stops for good. Cancel the frame on unmount.

## Accessibility

- The real text is in an `sr-only` span; the animated letters are `aria-hidden`.
- No focusable parts; it is a decorative headline.

## Acceptance checklist

- [ ] Letters under the pointer reach weight 900, 28% taller, lifted 4px and in the accent colour.
- [ ] The swell falls off over roughly a fifth of the word on each side.
- [ ] Leaving the headline relaxes every letter back to weight 250 in the ink colour.
- [ ] Autoplay sweeps the bulge back and forth and stops for good on first hover.
- [ ] Reduced motion disables the autoplay sweep.
- [ ] Fits on one line at 360px viewport width.
- [ ] Dark mode switches the ink to `#f5f5f7` while the accent stays.
