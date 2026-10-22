# Lenticular Pass

Build an event ticket that behaves like a lenticular print: lean it one way and it shows a day pass, lean it the other way and it becomes a night pass, the change sweeping across the card strip by strip while a band of light slides along the ridges. The feel is a glossy, slightly springy physical object that follows the pointer.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`useMotionValue`, `useSpring`, `useTransform`, `useMotionValueEvent`, `animate`). Artwork is painted with Canvas 2D in the browser; no image files.
- File: `components/lenticular-pass/lenticular-pass.tsx`, named export `LenticularPass`, plus `LenticularPassProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Rocks the card between the passes until someone touches it. Skipped under reduced motion. |

## Layout and look

- Root: column, centred, 16px gap, `perspective: 900px`; controls row under the card.
- Card: 300×400px, radius 24px, `overflow: hidden`, `cursor: grab`, `touch-action: none`. Shadow `0 30px 60px -30px rgba(20,20,60,.6), 0 0 0 1px rgba(0,0,0,.06)` (dark: `0 30px 60px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.1)`). Behind it, a placeholder gradient `#7cc4ff → #bfe3ff → #ffd9b0`.
- 44 vertical strips, each 300/44 px wide (+0.5px to hide seams). Each stacks: the day print (`background-size: 300px 400px`, `background-position: -i·stripWidth 0`), the night print above it with per-strip opacity, a highlight layer, and a 1px right edge `rgba(0,0,0,.07)`.
- Paint both prints once at 2x (600×800), share them across instances, and expose them as CSS custom properties on the card (`--lp-a`, `--lp-b`) that the strips read with `var()`, so the data URLs are not repeated 88 times. There is no canvas on the server: render the placeholder first, swap prints in after hydration.
- Day print: sky gradient `#7cc4ff` 0, `#bfe3ff` 0.55, `#ffd9b0` 1; sun at (206,112), radial gradient r70 `#fff8e0`, `#ffe08a` at 0.35, transparent; three ridges `#8fb4d9`, `#5f8fbd`, `#2f5d86` with bases 250/290/330, amplitudes 70/60/40, frequencies 0.018/0.024/0.03: y = base − |sin(x·f + base)|·amp − sin(3.1·x·f)·amp·0.15, sampled every 4px.
- Night print: sky `#0b1033`, `#3a2c6e` 0.55, `#7a4a8c`; 90 deterministic stars (x = 97i mod 300, y = 53i mod 230, alpha 0.3 + ((7i) mod 10)/14, 1.2px squares, every ninth 2px); crescent moon from a `#f4f1ff` circle (206,112,r30) minus a `#3a2c6e` circle (218,104,r26); ridges `#2b2060`, `#1d1648`, `#120e30`; five `#ffd36e` 3×4px windows near the bottom.
- White system-font text on both prints: "DAY PASS"/"NIGHT PASS" (600 13px, 80%) at (24,40); "Nexus Summit" (700 30px) at (24,76); "Talks · 09:00 – 18:00"/"Afterparty · 21:00 – late" (500 13px, 85%) at (24,98).
- Overlay 20px from the bottom corners: left "Admit one" (11px uppercase, tracking 0.14em, 75%) over "NXS-0427" (mono 15px, tracking 0.1em); right a decorative 5×5 grid of 5px squares, 2px gaps, on a white 6px-radius tile with 6px padding; square k is `#1d1d1f` unless `(7k) mod 3 = 0`, then white.
- Controls: 8px gap, 13px. Two 32px-tall pill buttons ("Day pass", "Night pass"), 12px side padding, weight 500. Selected `#1d1d1f` / white text (dark `#f5f5f7` / `#1d1d1f`); unselected `#f0f0f3` / `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`). Then "or tilt it" in `#6e6e73` (dark `#a1a1a6`), hidden below `sm`.

## Motion

- Targets `tx`, `ty` in −1…1, smoothed by springs (stiffness 170, damping 18) into `sx`, `sy`.
- `rotateY` = sx mapped −1…1 → −22°…22°; `rotateX` = sy mapped −1…1 → 14°…−14°.
- `mix` (0 day, 1 night) = sx mapped −0.6…0.6 → 0…1, clamped. Strip i's night opacity = smoothstep(clamp((mix + phase − 0.5)·5 + 0.5)) with `phase = (i/43 − 0.5)·0.35`, smoothstep t²(3−2t). The per-strip phase makes the switch sweep.
- `glint` = sx mapped −1…1 → 0.1…0.9; each strip paints `linear-gradient(90deg, transparent g·100−30%, rgba(255,255,255,.22) g·100%, transparent g·100+30%)`.
- Whole-card sheen: `linear-gradient((105 + sx·20)deg, transparent 30%, rgba(255,255,255, .12 + |sx|·.12) 50%, transparent 70%)`, pointer-events none.
- `night` state is `mix > 0.5`; it drives only the label and the selected pill.

## Interaction and states

- Pointer move over the card: `tx = (x/width)·2 − 1`, `ty = (y/height)·2 − 1`, and mark touched. Touch pointers with no contact (`buttons === 0`) are ignored, so touch tilts only while dragging; mouse and pen tilt on hover.
- Pointer leave: `tx` becomes +0.75 if it was positive, else −0.75; `ty` becomes 0.
- "Day pass" sets `tx = −0.85`, "Night pass" `tx = 0.85`, both mark touched.

## Autoplay demo

Every 2200ms, `animate` the raw values over 1.6s `easeInOut`: odd ticks `tx 0.85, ty −0.3`, even ticks `tx −0.85, ty 0.25`. Skip ticks when off screen or the tab is hidden; stop for good once touched; skip entirely under reduced motion. Clean up on unmount.

## Accessibility

- Card is `role="img"` with a state-driven label: "Nexus Summit day pass, talks 09:00 to 18:00" / "Nexus Summit night pass, Afterparty from 21:00".
- Pills are `button type="button"` with `aria-pressed`; focus ring 2px `#0071e3` (dark `#2997ff`). QR tile `aria-hidden`.

## Acceptance checklist

- [ ] Pointer on the left shows the day scene, on the right the night scene.
- [ ] The picture changes as a sweep over strips, not a uniform fade, with no visible seams.
- [ ] Tilt reaches about 22° (Y) and 14° (X) and settles with a small overshoot.
- [ ] A white highlight band travels along the ridges as the card turns.
- [ ] Leaving with the mouse leaves the card resting on the side it was on.
- [ ] Touch dragging tilts the card without scrolling the page.
- [ ] The pills switch passes and update the selected state and label.
- [ ] `autoplay` rocks every 2.2s until touched and stays still under reduced motion.
- [ ] Dark pages recolour the pills and hint; the artwork is unchanged.
