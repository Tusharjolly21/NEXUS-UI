# Nebula CTA Glow

Build a closing call-to-action section: a dark rounded panel with a twinkling night sky, a gradient headline, a bright white button and a quiet text link. Two coloured nebulae drift after the pointer on lazy springs. As the pointer nears the button they gather around it and brighten, a halo swells behind it and the button leans toward the pointer. Pressing it blooms a ring of light outward. It is dark in both themes.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[560px]:`), framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useTransform`, `useReducedMotion`). Stars are drawn on a `<canvas>`.
- File: `components/nebula-cta-glow/nebula-cta-glow.tsx`, named export `NebulaCtaGlow` (also export `NebulaCta` as an alias), exported types `NebulaCtaGlowProps` and `NebulaCtaAction` (`{ label: string; href?: string; onClick?: () => void }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Ready when you are"` | Small caps line; empty hides it. |
| `title` | `string` | `"Start building faster"` | Headline. |
| `description` | `string` | "Every component, live and editable. Copy the code or install it in one line." | Line under the title; empty hides it. |
| `primaryAction` | `NebulaCtaAction \| null` | `{ label: "Start building" }` | White button; `null` hides it. |
| `secondaryAction` | `NebulaCtaAction \| null` | `{ label: "Browse components" }` | Text link; `null` hides it. |
| `colors` | `[string, string]` | `["#0a84ff", "#bf5af2"]` | Nebula colours as hex (the halo appends alpha). |
| `stars` | `number` | `140` | Star count, max 600. |
| `autoplay` | `boolean` | `false` | Invisible pointer drifts and presses until someone points at the card. |
| `className` | `string` | `""` | Extra classes on the card. |

Actions render as `<a href={href ?? "#"}>`; without `href` the click calls `preventDefault`, then `onClick`.

## Layout and look

- Card `<div>`: `@container`, relative, `isolate`, full width, overflow hidden, radius 28px, bg `#07070c`, centred text, padding 24px / 56px (40px / 64px when the container is at least 560px). Shadow `0 0 0 1px rgba(255,255,255,.06), 0 30px 60px -30px rgba(0,0,0,.6)`.
- Layers behind content (`-z-10`, `aria-hidden`, pointer-events none), bottom to top: star canvas; nebula B `radial-gradient(300px 220px at Bx By, colors[1], transparent 70%)` blurred 28px; nebula A `radial-gradient(240px 200px at Ax Ay, colors[0], transparent 70%)` blurred 18px (both `mix-blend-mode: screen`); vignette `radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,.55))`.
- Eyebrow: 12px semibold uppercase, tracking .16em, `white/70`.
- `<h2>`: margin-top 12px, max-width 560px, 34px (48px at container ≥560px), semibold, line-height 1.02, tracking −0.045em, balanced, text filled with a vertical gradient white → `white/70`.
- Description: margin-top 16px, max-width 420px, 15px relaxed, `white/70`.
- Actions row: margin-top 32px, centred, wrap, gap 20px × 12px.
- Primary: 48px tall pill, padding-left 24px, right 20px, gap 8px, white, `#1d1d1f` 15px semibold, shadow `0 10px 30px -10px rgba(255,255,255,.5)`, hover `#f5f5f7`, 16px arrow (`M3 8h9.5M8.5 4l4 4-4 4`, stroke 2). Behind it a halo extending 20px on all sides, round, `radial-gradient(closest-side, {c0}cc, {c1}55 60%, transparent)`, blur 10px.
- Secondary: rounded-full, padding 4px 8px, 15px medium `white/80`, hover white + underline (offset 4px).
- Focus rings: 2px white, offset 2px `#0b0b12`.
- Stars: seeded PRNG (mulberry32, seed 7). Each has x, y in 0–1; radius 1.3–1.9 for 8% of stars, else 0.4–1.1; depth .2–1; phase; speed .6–2.4. White, alpha `twinkle × (0.35 + depth·0.65)` with `twinkle = 0.55 + 0.45·sin(t_ms·0.001·speed + phase)` (0.8 constant under reduced motion). DPR capped at 2.

## Motion

- Pointer `px, py` in card pixels. Measure the card and the button centre `(bx, by)` with a ResizeObserver; on first measure park the pointer at `(bx, by − 40)` so the glow starts on the button.
- Nearness: `near = max(0, 1 − dist(pointer, button) / max(220, w·0.45))`; `nearS = spring(near, 120/20)`.
- Pull: each nebula aims at `p + (b − p)·min(1, near·pull)`. Nebula A uses pull .9 and a spring stiffness 55, damping 13; nebula B pull .6 and a lazier spring 28/10.
- Nebula opacity maps `nearS` 0→1 to .55→1. Halo opacity .15→.9 and scale .85→1.12.
- Button lean: `x = clamp((px − bx)·0.12·near, ±14)`, `y = clamp((py − by)·0.12·near, ±10)`, each through a spring 300/18 (0 under reduced motion). `whileTap` scale .94 with spring 600/18.
- Star parallax: offset each star by `−(px/w − .5)·14·depth` and `−(py/h − .5)·10·depth`.
- Bloom on press: add a ring (keep at most 3) that is `inset 0`, round, 2px border in `colors[0]`, animating scale 1 → 3.2 and opacity .9 → 0 over .9s, ease `[0.2, 0.8, 0.2, 1]`; remove on complete. Skipped under reduced motion.

## Interaction and states

- `pointermove` on the card updates the pointer and marks the card touched; `pointerdown` marks it touched too.
- `pointerleave` parks the pointer at `(bx, by − 60)` so the glow settles above the button.
- Pressing the primary marks touched, blooms, then runs `onClick`.
- Reduced motion: stars draw once, no lean, no tap scale, no bloom, no autoplay.

## Autoplay demo

Start after 600ms if `autoplay` and not reduced motion. Loop four legs, each tweening the pointer from where it is over 1.8s with ease `[0.45, 0, 0.2, 1]`: to `(w·.14, h·.22)`, to `(bx + 30, by − 6)` and press, to `(w·.86, h·.30)`, to `(bx − 20, by + 4)` and press. Pause 900ms after a press, 300ms otherwise. Stop the moment a real pointer moves or presses on the card.

## Accessibility

- Canvas, nebulae, vignette, halo and rings are `aria-hidden`. Actions are real links with visible white focus rings; the arrow icon is `aria-hidden`. The title is an `<h2>`.

## Acceptance checklist

- [ ] Stars twinkle and shift slightly against the pointer.
- [ ] Two colour clouds trail the pointer at different lags.
- [ ] Approaching the button pulls both clouds onto it, brightens them and swells the halo.
- [ ] The button leans up to 14px toward the pointer and springs back.
- [ ] Pressing it sends a ring expanding to 3.2× and fading.
- [ ] Without `href`, the primary does not navigate but calls `onClick`.
- [ ] Autoplay drifts and presses twice per loop until real input.
- [ ] Layout tightens below a 560px container.
