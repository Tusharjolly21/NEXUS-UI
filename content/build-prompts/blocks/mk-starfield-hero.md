# Starfield Hero

Build a dark, full-height hero section set inside a deep 3D starfield drawn on canvas. Stars drift slowly toward the viewer, the vanishing point leans toward the pointer, and stars near the pointer brighten and swell. Press and hold anywhere (or the "Hold to warp" button) to jump to warp: stars stretch into streaks and whiten. On release the field brakes past a standstill, drifts backward for a beat, and settles to cruising speed. Left-aligned copy keeps the section usable as a real landing hero.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`), a `cn` helper. The starfield is a single `<canvas>` with a `requestAnimationFrame` loop.
- File: `components/starfield-hero/starfield-hero.tsx`, named export `InteractiveStarfieldHero`, exported types `InteractiveStarfieldHeroProps` and `CTAConfig` (`{ label: string; href?: string; onClick?: () => void }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Ship faster.\nBuild better."` | Heading; `\n` breaks lines and every line after the first is dimmed. |
| `subtitle` | `string` | "A motion-native component library for React. Animated, accessible and production-ready." | Paragraph; hidden when empty. |
| `primaryCTA` | `CTAConfig` | `{ label: "Get started", href: "#" }` | White pill. |
| `secondaryCTA` | `CTAConfig` | `{ label: "View components", href: "#" }` | Glass pill. |
| `particleCount` | `number` | `300` | Stars, clamped 20–1200. |
| `interactionRadius` | `number` | `140` | Pointer brighten radius in px (at least 10). |
| `particleColor` | `string` | `"#9fc6ff"` | Resting star colour, any CSS colour. |
| `activeColor` | `string` | `"#ffffff"` | Colour near the pointer and at full warp. |
| `speed` | `number` | `0.5` | Snappiness 0.1–1 (clamped). |
| `warpLabel` | `string` | `"Hold to warp"` | Button label; empty hides the button. |
| `autoplay` | `boolean` | `false` | Periodic warp until someone touches the hero. |
| `children` | `ReactNode` | — | Replaces the default copy block. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- `<section>`: relative, `isolate`, flex with items centred vertically, `min-height: calc(100svh - 4rem)`, `select-none`, overflow hidden, radius 24px, bg `#030409`, white text. Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; under `.dark` `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`. It stays dark in both themes.
- Canvas: absolute inset 0, `-z-10`, `aria-hidden`, pointer-events none, DPR capped at 2.
- Vignette: `radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(3,4,9,.9) 100%)`. Left scrim over 2/3 of the width: `linear-gradient(90deg, rgba(3,4,9,.7), transparent)` so the copy reads.
- Content wrapper: full width, padding 24px / 64px vertical (48px sides from `sm`, 64px from `lg`). Copy column max-width 576px, left-aligned.
- `<h1>`: 40px (60px from `sm`), semibold, line-height 1.02, tracking −0.05em; lines after the first in `white/50`.
- Subtitle: margin-top 20px, max-width 448px, 15px, relaxed, `white/65`.
- CTA row: margin-top 32px, gap 12px, wrap. Both 44px tall, rounded-full, padding 0 20px, 14px. Primary: white bg, `#1d1d1f` semibold. Secondary: medium `white/85`, 1px `white/15` border, `white/6%` bg (hover 10%).
- Warp button: absolute bottom 16px right 16px, z above content, 36px tall, rounded-full, padding 0 14px, gap 8px, 12px medium `white/85`, 1px `white/15` border, `white/8%` bg, backdrop blur, `touch-action: none`. 14px burst icon (eight short rays, stroke 1.6, round caps). Label switches to "Warping" while held.

## Stars and projection

- Stars are seeded from a deterministic PRNG (mulberry32, seed `count·13 + 5`): `x, y` in −1..1, depth `z` in 0.05..1, twinkle phase 0..2π.
- Resolve `particleColor` and `activeColor` to RGB by applying them to a hidden span and reading the computed colour (fallbacks `[159,198,255]` and `[255,255,255]`), then mix linearly between them.
- Projection: vanishing point `(w·vx, h·vy)`, focal `f = max(w, h) × 0.55`, screen position `c + (x/z)·f`. Skip stars more than 40px off screen.
- Per star: `near = 1 − z`; `glow = (1 − d/radius)²` within the radius of the pointer; twinkle `0.75 + 0.25·sin(2t + phase)`; alpha `min(1, (0.4 + near·0.75)·twinkle + glow·0.6)`; radius `0.55 + near·1.9 + glow·1.2`; colour mixed by `max(warpK, glow)` where `warpK = clamp((v − 0.045)/(1.7 − 0.045))`.
- Streaks: compute where the star was a moment ago, `z0 = min(1.2, z + |v|·max(dt, 0.016)·4.5)`. If that point is more than `1.5·r` away, stroke a round-capped line from it to the star with width `1.4·r`; otherwise fill a dot.

## Motion

- Loop with `dt = min(0.05s, frame)`; pause work when off screen (IntersectionObserver).
- Velocity: cruising `0.045`, warp `1.7` depth units/s. A spring drives it: `k = 5 + speed·22`, `c = 2·√k·0.42` (underdamped, so release overshoots below zero). `vel += (k·(target − v) − c·vel)·dt`, `v = max(−0.35, v + vel·dt)`.
- Move stars `z −= v·dt`; when `z ≤ 0.03` respawn at `z + 0.97` with new random x, y; when `z > 1` (reversing) subtract 0.95.
- Steering: target vanishing point is `0.5 + (pointer − 0.5)·0.45` on each axis (centre when the pointer is outside); ease toward it with `lean = 1 − e^(−dt·(1.5 + speed·4))`.
- Copy entrance: stagger 0.08s; heading, subtitle and CTA row from `opacity 0, y 18`, spring stiffness 220, damping 22. CTAs `whileTap` scale .95. Warp button animates scale .94 while held, spring 500/15.

## Interaction and states

- `pointermove` stores normalised and pixel pointer positions; `pointerleave` clears them and ends any warp.
- `pointerdown` on the section (not on a link or button) starts warp; `pointerup` ends it.
- Warp button: captures the pointer on down; up, cancel and blur end warp. Space or Enter (ignoring key repeat) holds warp until key up.
- Reduced motion: no loop, no twinkle, no entrance; draw one still frame and redraw it on resize.

## Autoplay demo

While `autoplay` is on and nobody has moved, pressed or used the button, run a 4.6s cycle: warp is on between 2.6s and 4.0s of each cycle, and the vanishing point wanders to `0.5 + sin(0.4t)·0.12`, `0.5 + cos(0.3t)·0.08`. Any real interaction ends the demo.

## Accessibility

- Canvas and gradients are `aria-hidden`. The warp control is a real `<button>` with `aria-label` = `warpLabel` and `aria-pressed` reflecting the hold. All controls show a 2px `#0a84ff` focus ring (offset `#030409` on the primary).

## Acceptance checklist

- [ ] Stars drift toward the viewer and twinkle; nearer stars are bigger and brighter.
- [ ] Moving the pointer leans the vanishing point toward it and brightens stars within ~140px.
- [ ] Holding anywhere stretches stars into white streaks; the button reads "Warping".
- [ ] Releasing brakes past zero, drifts backward briefly, then settles.
- [ ] `speed` 1 feels snappy, 0.1 dreamy.
- [ ] Keyboard Space/Enter on the button holds and releases warp.
- [ ] Autoplay warps every 4.6s until first interaction.
- [ ] Reduced motion renders a static field.
