# Lenticular Pass

Build an event ticket that behaves like a lenticular print, the ridged cards that change picture as you tilt them. Lean the card one way and it shows a day pass, lean it the other way and it becomes a night pass, with the change sweeping across the card strip by strip while a band of light slides along the ridges. The feel is a physical, glossy, slightly springy object that follows the pointer.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useTransform`, `useMotionValueEvent`, `animate`).
- The artwork is painted with the Canvas 2D API in the browser and exported as JPEG data URLs; no image files.
- File: `components/lenticular-pass/lenticular-pass.tsx`, named export `LenticularPass`, plus exported `LenticularPassProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Rocks the card between the two passes by itself until someone touches it. Does nothing when the user prefers reduced motion. |

## Layout and look

- Root: column, items centred, 16px gap, `perspective: 900px`. Under the card sits a row of controls.
- Card: 300×400px, radius 24px, `overflow: hidden`, `cursor: grab` (`grabbing` while pressed), `touch-action: none`. Shadow `0 30px 60px -30px rgba(20,20,60,.6), 0 0 0 1px rgba(0,0,0,.06)`; in dark mode `0 30px 60px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.1)`. Behind the strips use a vertical placeholder gradient `#7cc4ff → #bfe3ff → #ffd9b0` so the card is never empty before the artwork exists.
- The card is cut into 44 vertical strips, each 300/44 px wide (add 0.5px to the width to avoid seams), absolutely positioned side by side. Every strip is a stack of: the day print as a background (`background-size: 300px 400px`, `background-position: -i·stripWidth px 0`), the night print on top in the same way with a per-strip opacity, a highlight layer, and a 1px right edge line `rgba(0,0,0,.07)`.
- Both prints are painted once at 2x resolution (600×800) and shared by every instance. Put them in CSS custom properties on the card (`--lp-a: url(...)`, `--lp-b: url(...)`) and reference them from the strips with `var()` so the long data URLs are not repeated 88 times in the DOM. On the server there is no canvas, so render the placeholder gradient first and swap the prints in after hydration.
- Day print: vertical sky gradient `#7cc4ff` (0), `#bfe3ff` (0.55), `#ffd9b0` (1); a sun at (206,112), radial gradient radius 70 from `#fff8e0` through `#ffe08a` (0.35) to transparent; three mountain ridges, colours `#8fb4d9`, `#5f8fbd`, `#2f5d86` at bases 250, 290 and 330 with amplitudes 70, 60, 40 and frequencies 0.018, 0.024, 0.03 (height = base − |sin(x·f + base)|·amp − sin(x·f·3.1)·amp·0.15, sampled every 4px).
- Night print: sky `#0b1033`, `#3a2c6e` (0.55), `#7a4a8c`; 90 deterministic stars (x = i·97 mod 300, y = i·53 mod 230, alpha 0.3 + ((i·7) mod 10)/14, 1.2px squares, every ninth 2px); a crescent moon made from a `#f4f1ff` circle (206,112, r30) with a `#3a2c6e` circle (218,104, r26) cut out of it; the same ridges in `#2b2060`, `#1d1648`, `#120e30`; five lit windows `#ffd36e`, 3×4px, at (60,352), (74,356), (210,348), (226,352), (240,350).
- Text drawn on both prints in white, system font: label "DAY PASS" or "NIGHT PASS" (600 13px, 80% alpha) at (24,40); "Nexus Summit" (700 30px) at (24,76); "Talks · 09:00 – 18:00" or "Afterparty · 21:00 – late" (500 13px, 85% alpha) at (24,98).
- Overlay on top of the strips, bottom 20px inset: left, a small column with "Admit one" (11px, uppercase, tracking 0.14em, 75% opacity) above "NXS-0427" (monospace 15px, tracking 0.1em); right, a decorative 5×5 grid of 5px squares with 2px gaps on a white 6px-radius tile with 6px padding. Square k is `#1d1d1f` unless `(k·7) mod 3 === 0`, then white. All white text on the card, and the QR tile, stay the same in dark mode.
- Controls row under the card: 8px gap, 13px text. Two pill buttons, 32px tall, 12px horizontal padding, fully rounded, weight 500: "Day pass" and "Night pass". Selected: `#1d1d1f` background with white text (dark: `#f5f5f7` with `#1d1d1f` text). Unselected: `#f0f0f3` with `#1d1d1f` (dark: `#2c2c2e` with `#f5f5f7`). Then the hint "or tilt it" in `#6e6e73` (dark `#a1a1a6`), hidden below the `sm` breakpoint.

## Motion

- Two target motion values, `tx` and `ty`, each in −1…1. Smooth them with springs: stiffness 170, damping 18 (`sx`, `sy`). Everything below reads the smoothed values.
- Tilt: `rotateY = map(sx, −1…1 → −22°…22°)`, `rotateX = map(sy, −1…1 → 14°…−14°)` (moving down tips the top away).
- Mix (0 = day, 1 = night): `mix = clamp(map(sx, −0.6…0.6 → 0…1))`. Strip i has opacity for the night print `smoothstep(clamp((mix + phase − 0.5)·5 + 0.5))` where `phase = (i/43 − 0.5)·0.35` and smoothstep is `t²(3 − 2t)`. Because the phase differs per strip, the switch sweeps across the card instead of fading as one.
- Glint: `glint = map(sx, −1…1 → 0.1…0.9)`. Each strip paints `linear-gradient(90deg, transparent glint·100−30%, rgba(255,255,255,.22) glint·100%, transparent glint·100+30%)`, so a soft bright band travels across the ridges as the card turns.
- Sheen over the whole card: `linear-gradient((105 + sx·20)deg, transparent 30%, rgba(255,255,255, 0.12 + |sx|·0.12) 50%, transparent 70%)`, pointer-events none.
- `night` state flips true when `mix > 0.5` and only drives the aria-label and which button looks selected.

## Interaction and states

- Pointer move over the card sets `tx = (x/width)·2 − 1` and `ty = (y/height)·2 − 1` from the pointer position inside the card, and marks the card as touched. For touch pointers ignore moves with no contact (`buttons === 0`), so only dragging tilts it; mouse and pen tilt on hover.
- Pointer leave: `tx` goes to +0.75 if it was positive, otherwise −0.75 (it rests leaning to the side it was on, still showing a pass), and `ty` goes to 0.
- "Day pass" sets `tx = −0.85`, "Night pass" sets `tx = 0.85`; both mark touched. The springs carry the card there.
- Reduced motion: autoplay is skipped; pointer and button interaction still work.

## Autoplay demo

With `autoplay`, every 2200ms toggle between two poses with `animate` on the raw values, 1.6s `easeInOut`: odd ticks `tx 0.85, ty −0.3`, even ticks `tx −0.85, ty 0.25`. The first tick goes to the night side. Skip ticks while the card is off screen or the tab is hidden. As soon as the card has been touched (pointer move, drag or a button), stop the loop for good. Clear the timer and observer on unmount.

## Accessibility

- The card has `role="img"` and an `aria-label` that follows the state: "Nexus Summit day pass, talks 09:00 to 18:00" or "Nexus Summit night pass, Afterparty from 21:00".
- The two pills are real `button type="button"` elements with `aria-pressed`, so keyboard users can switch passes. Focus-visible: 2px ring `#0071e3` (dark `#2997ff`).
- The QR tile is `aria-hidden`.

## Acceptance checklist

- [ ] The card shows the day scene at rest on the left and the night scene when the pointer is on the right.
- [ ] The picture changes as a sweep across the strips, not a uniform fade, and the strip seams are invisible.
- [ ] The card tilts up to about 22° around Y and 14° around X and settles with a small spring overshoot.
- [ ] A white highlight band moves along the ridges as the card turns.
- [ ] Leaving the card with the mouse leaves it resting on the side it was on, not centred.
- [ ] On a touch screen, dragging tilts the card and scrolling is not triggered; simply touching down without moving does nothing odd.
- [ ] "Day pass" and "Night pass" switch the picture and update the selected state and the label.
- [ ] With `autoplay`, the card rocks every 2.2s until touched, and stays still under reduced motion.
- [ ] Light and dark pages both look right: pills and hint recolour, the card artwork does not change.
