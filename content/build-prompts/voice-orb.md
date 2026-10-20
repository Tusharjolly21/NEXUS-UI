# Voice Orb

Build one living shape for a voice assistant's four states. Hold to talk: a dotted ring becomes a glowing, breathing gradient; release and it shrinks to a dark glossy thinking sphere with a shimmer, then churns while speaking and settles back to the ring. Parameters spring between states; the outline is rebuilt each frame from layered sine noise. Calm and premium.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`). The outline is an SVG path string written to a motion value from a `requestAnimationFrame` loop.
- File: `components/voice-orb/voice-orb.tsx`, named export `VoiceOrb`, plus exported `VoiceOrbProps` and `OrbState = "idle" | "listening" | "thinking" | "speaking"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `"#0071e3"` | Glow colour and middle stop of the listening/speaking gradient. |
| `autoplay` | `boolean` | `false` | Walks through listening, thinking and speaking by itself until pressed. |

## State parameters

Seven motion values, one target set per state:

| State | r | amp | speed | fill | ring | glow | dark |
| --- | --- | --- | --- | --- | --- | --- | --- |
| idle | 58 | 0 | 0.4 | 0 | 1 | 0 | 0 |
| listening | 64 | 3 | 1.2 | 1 | 0 | 1 | 0 |
| thinking | 50 | 0.6 | 0.6 | 1 | 0 | 0.2 | 1 |
| speaking | 62 | 9 | 3.2 | 1 | 0 | 0.7 | 0 |

On every state change, animate each value to its target with a spring (stiffness 120, damping 16). `r` is the base radius, `amp` the wobble amplitude, `speed` the noise phase speed, and `fill / ring / glow / dark` are layer opacities.

## Layout and look

- Root: column, items centred, 24px gap.
- Orb button: 200×200, round, `touch-none`. Inside, a 200×200 SVG (viewBox `0 0 200 200`, `overflow-visible`, `aria-hidden`). All layers share the same animated path `d`, centred at (100, 100). Paint order:
  1. **Glow**: fill `accent`, Gaussian blur `stdDeviation 16` (filter region −50%/200%), opacity = `glow`.
  2. **Colour body**: radial gradient (cx 38%, cy 32%, r 75%): `#ffffff` at 0%, `accent` at 45% with stop-opacity 0.85, `#5e5ce6` at 100%. Opacity = `fill`.
  3. **Dark body**: radial gradient (cx 35%, cy 30%, r 80%): stops `#6e6e73` / `#1d1d1f` (55%) / `#000` in light; `#aeaeb2` / `#48484a` / `#2c2c2e` in dark mode (set `stop-color` via classes with `dark:` so it still reads on black). Opacity = `dark`.
  4. **Thinking shimmer** (only rendered while thinking): ellipse at centre, rx 38, ry 10, `rgba(255,255,255,.18)`, rotating 360° every 1.6s, linear, forever.
  5. **Idle ring**: same path, no fill, stroke `#1d1d1f` (dark `#f5f5f7`), width 2, dash `3 7`, round caps, opacity = `ring`, rotating 360° every 18s, linear, forever.
  Gradient and filter ids must be unique per instance (`useId` with non-alphanumerics stripped).
- State switcher below: `role="group"`, `aria-label="Orb state"`, 4-column grid, radius 12px, 3px padding, `#e8e8ed` (dark `#3a3a3c`). Buttons 32px tall, 14px side padding, radius 9px, 13px medium, capitalised state names, `#1d1d1f` (dark `#f5f5f7`). The active one has a sliding pill behind it (shared `layoutId`, spring 420/32): white with `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, dark `#636366`.
- Caption: "Press and hold the orb to talk." 13px `#86868b` (dark `#98989d`).

## Motion (per-frame outline)

Each frame (`dt` in seconds):
- `phase += dt · speed`.
- Fake voice level: target `= 0.4 + 0.6·|sin(now/130)·sin(now/410)|` while listening or speaking, else 0; `level += (target − level)·0.2` (syllable-like bursts, smoothed).
- `a0 = amp · (0.5 + level)`; `r0 = r + level · (listening ? 6 : 2)`.
- Sample 72 points around the circle (`i = 0..72`, angle `a = i/72·2π`). Noise: `n = 0.5·sin(3a + 2.1·phase) + 0.3·sin(5a − 2.9·phase) + 0.2·sin(7a + 3.7·phase)`. Radius `rr = r0 + n·a0`. Point `(100 + cos a·rr, 100 + sin a·rr)`. Join with `M … L … Z` (2 decimals) and set the path motion value.

Press feedback: `whileTap { scale: 0.96 }`.

## Interaction and states

- **Press** (pointer down, or Space/Enter key down without repeat): mark touched, cancel pending timers, go to `listening`.
- **Release** (pointer up, or Space/Enter key up): only if currently `listening`, go to `thinking`, then `speaking` after 1400ms, then `idle` at 4200ms.
- Prevent default for Space/Enter so the page does not scroll or click twice.
- Clicking a switcher button marks touched, cancels timers and jumps straight to that state.

## Autoplay demo

With `autoplay`: run a flow at 700ms and then every 7400ms while not touched: `listening` → `thinking` at 1800ms → `speaking` at 3300ms → `idle` at 6200ms. Each flow cancels the previous flow's timers. Clear everything on unmount.

## Accessibility

- Orb: native `button type="button"`, `aria-label="Hold to talk"`. Hold-to-talk works with Space or Enter.
- Focus-visible: 2px ring `#0071e3` (dark `#0a84ff`) with 4px offset (dark offset black); no default outline.
- Switcher buttons use `aria-pressed` and a 2px `#0071e3` focus outline.

## Acceptance checklist

- [ ] Idle shows only a dashed ring, slowly rotating, perfectly round.
- [ ] Holding the orb grows it to a glowing gradient blob that breathes with bursty "voice" pulses.
- [ ] Releasing shrinks it into a dark glossy sphere with a rotating shimmer.
- [ ] After 1.4s it churns visibly while speaking, then returns to the ring at 4.2s.
- [ ] All transitions between states are smooth springs, never jumps.
- [ ] Space or Enter held on the focused orb behaves like holding the pointer.
- [ ] The thinking sphere stays visible on a black background in dark mode.
- [ ] Switcher pill slides to the active state, including during autoplay.
- [ ] Autoplay cycles every 7.4s and stops at the first press or switcher click.
