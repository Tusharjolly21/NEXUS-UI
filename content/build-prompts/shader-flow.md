Build a dark hero panel whose background is a real WebGL fragment shader: domain-warped noise in deep blue, violet and peach that drifts slowly like ink in water. Moving the pointer stirs it: the flow swirls around the pointer, which it follows on a lagging spring. When the pointer stops, the swirl swings past zero into a small counter-twist before it calms. A static CSS gradient sits underneath as the fallback where WebGL is missing. A centred title card floats on top.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useReducedMotion`), raw WebGL 1 (no three.js), and a `cn` class-merge helper.
- File: `components/shader-flow/shader-flow.tsx`, named export `ShaderFlow`, exported type `ShaderFlowProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | – | Content over the flow; replaces the title card. |
| `className` | `string` | – | Extra classes (size, radius). |
| `showContent` | `boolean` | `true` | Show the default title card when there are no children. |
| `cursorReactive` | `boolean` | `true` | The pointer stirs the flow. |
| `intensity` | `"low" \| "medium" \| "high"` | `"medium"` | Warp/colour amount `uAmt`: 0.65 / 1 / 1.35. |
| `colors` | `[string, string, string, string]` | `["#05060d", "#1d39d6", "#bf5af2", "#ff9f6a"]` | Base, body, accent, highlight (3- or 6-digit hex; invalid → mid grey). |
| `speed` | `number` | `1` | Drift speed multiplier. |
| `autoplay` | `boolean` | `false` | A pretend pointer stirs the flow until a real one moves over it. |

## Layout and look

- Panel: relative, `isolation: isolate`, flex-centred, `min-height: 420px`, `overflow: hidden`, radius 24, background `#05060d`, white text, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, drop `rgba(0,0,0,.8)`).
- Fallback layer (z −20): `radial-gradient(60% 70% at 25% 30%, body+"aa", transparent 70%), radial-gradient(50% 60% at 80% 70%, accent+"88", transparent 70%), radial-gradient(40% 40% at 60% 20%, highlight+"55", transparent 70%), base`.
- Canvas (z −10), full size, `aria-hidden`. Render at half resolution: backing size `clientSize × min(dpr, 2) × 0.5`; the browser upscale hides it because the flow is soft. ResizeObserver updates size, viewport and `uRes`.
- Title card (default): centred, padding 0 24px. A pill badge "Shader Flow" (12px medium, white 85%, 1px border white 15%, background white 10%, backdrop blur, padding 4×12). Heading 16px below, two lines "Colour that moves / like ink in water.", 34px (44px from `sm`), semibold, leading 1.02, tracking −0.045em, balanced. Caption 12px below, 13px white 70%: "Move to stir it. It twists back when you stop."

## The shader

Full-screen triangle (`[-1,-1, 3,-1, -1,3]`), `mediump` precision. Uniforms: `uRes`, `uTime`, `uMouse` (0–1, y up), `uStir`, `uAmt`, `uC0…uC3` (vec3 colours).

- `hash(p)`: `p = fract(p·(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x·p.y)`. Value `noise` with smoothstep interpolation `f²(3 − 2f)`. `fbm`: 5 octaves, amplitude starting 0.5 and halving, rotating/scaling the domain each octave by `mat2(1.6, 1.2, −1.2, 1.6)`.
- `uv = fragCoord/uRes`; `p = (fragCoord − 0.5·uRes)/uRes.y`; mouse in the same space `m = (uMouse − 0.5)·(aspect, 1)`.
- Swirl: `d = p − m`, `r = |d|`, angle `sw = uStir·exp(−5r²)`; rotate `d` by `sw` and set `p = m + rot(sw)·d`.
- `t = uTime·0.07`. `q = (fbm(1.3p + t), fbm(1.3p + (5.2, 1.3) − t))`. `w = (fbm(1.5p + 3q·uAmt + (1.7, 9.2) + 1.3t), fbm(1.5p + 3q·uAmt + (8.3, 2.8) − t))`. `f = fbm(1.2p + 2.4w·uAmt)`.
- Colour: `mix(C0, C1, smoothstep(.12, .62, f))`; then mix toward C2 by `smoothstep(.45, .9, |q|)·0.8`; toward C3 by `smoothstep(.5, .78, w.x)·0.75·min(uAmt, 1)`; then `mix(C0, col, clamp(.55 + .45·uAmt, 0, 1))`; multiply by `0.85 + 0.8f`; add `C3·f⁴·0.5`; vignette `× smoothstep(1.45, 0.3, |uv − 0.5|·1.3)`; dither `+ (hash(fragCoord + fract(uTime)) − 0.5)·0.03`.
- Context options: `antialias false, premultipliedAlpha false, preserveDrawingBuffer false`. If context, compile or link fails, return early and leave the CSS fallback visible.

## Motion

- Pointer: raw `mx`, `my` (0–1) feed `useSpring(stiffness 60, damping 14)` → `uMouse = (sx, 1 − sy)`, so the swirl centre lags.
- Stir: a raw value `stirRaw` feeds an underdamped `useSpring(stiffness 38, damping 5)` → `uStir`; this is what makes it overshoot into a counter-twist.
- Each frame: `dt = min(0.05, elapsed s)`; `time += dt·speed` (starting at 8); decay `stirRaw *= 0.08^dt`; upload uniforms; draw. Skip work while off screen (IntersectionObserver).
- On `pointermove` (when `cursorReactive`): mark touched; compute x/y in 0–1; speed `v = distance/dt` with `dt = max(8ms, since last move)`; direction sign from the 2D cross product of the movement with the vector to the panel centre: `(x − px)(0.5 − y) − (y − py)(0.5 − x) ≥ 0 ? 1 : −1`. If the last move was under 200ms ago, `stirRaw = clamp(stirRaw + side·min(v, 4)·0.35, −5, 5)`. Set `mx`, `my`.
- Title card enters from `opacity 0, y 14, scale 0.96`, spring 260/18.

## Interaction and states

- Stirring only follows mouse/pen/touch moves over the panel; children receive their own events normally.
- Reduced motion: no loop. Draw one still frame at time 12 (and again on resize), no stirring.
- Cleanup on unmount or dependency change: cancel rAF, disconnect observers, delete buffer, program and shaders, and call `WEBGL_lose_context.loseContext()`. Re-init when palette, intensity, speed, autoplay or cursorReactive change.

## Autoplay demo

With `autoplay` and `cursorReactive`, until the first real pointer move: advance a demo clock by `dt` and set `mx = 0.5 + sin(0.9·demo)·0.3`, `my = 0.5 + sin(1.8·demo)·0.18` (a figure-eight) and `stirRaw = sin(0.45·demo)·3.2`, so it swirls one way, then the other.

## Accessibility

- Canvas and fallback are `aria-hidden`; the title card or children carry the meaning. Don't trap pointer or focus. Colours default to a dark base so white text has contrast.

## Acceptance checklist

- The panel shows slowly drifting, layered ink-like colour in blue, violet and peach, darker at the edges.
- Moving the pointer twists the colour around it; the centre of the twist trails the pointer.
- Stopping produces a visible counter-twist before the flow settles.
- `intensity="low"` looks calmer and closer to the base colour; `"high"` warps more.
- Custom `colors` change both the shader and the fallback gradient.
- With WebGL disabled the gradient fallback and the title still render.
- Reduced motion shows a single still frame; nothing animates off screen.
