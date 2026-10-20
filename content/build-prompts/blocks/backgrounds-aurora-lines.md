# Aurora Wavy Lines

Build a full-bleed WebGL background of sixteen glowing, plasma-like lines that weave across a dark two-tone gradient, thickening in the middle of the screen and thinning toward the edges, with small light beads riding along them. Shown behind a short caption with a vignette, it should feel like an aurora or a live signal: fluid, luminous and unhurried.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, raw WebGL 1 (no three.js, no animation library).
- File: `components/wavy-lines/wavy-lines.tsx`, named export `WavyLines` (also a default export) and exported type `WavyLinesProps`. Re-export from `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `lineColor` | `string` | `"#22d3ee"` | Colour of the lines and beads. |
| `backgroundColorStart` | `string` | `"#062525"` | Left end of the horizontal background gradient. |
| `backgroundColorEnd` | `string` | `"#0f3f2d"` | Right end. |
| `speed` | `number` | `1.2` | Multiplier for every time-based speed in the shader. |
| `radius` | `number` | `24` | Canvas `border-radius` in px. |
| `className` | `string` | — | Merged onto the canvas (`block h-full min-h-[320px] w-full`). |
| `style` | `CSSProperties` | — | Merged after the radius. |

## Layout and look

- The component is just a `<canvas>`: `block h-full min-h-[320px] w-full`, inline `borderRadius: radius`.
- WebGL context: `{ antialias: true, alpha: false, powerPreference: "high-performance" }`. One full-screen quad (`TRIANGLE_STRIP` of `-1,-1, 1,-1, -1,1, 1,1`).
- Backing size: `offsetWidth/Height × min(devicePixelRatio, 2)`, viewport updated on resize (ResizeObserver on the canvas).
- Colours: convert any CSS colour to normalised RGB by painting it into a 1×1 2D canvas and reading the pixel; pass as `vec3` uniforms.
- Fragment shader (precision highp). Constants: `gridSmoothWidth 0.015`, `minLineWidth 0.01`, `maxLineWidth 0.2`, `lineAmplitude 1.0`, `lineFrequency 0.2`, `warpFrequency 0.5`, `warpAmplitude 1.0`, `offsetFrequency 0.5`, `minOffsetSpread 0.6`, `maxOffsetSpread 2.0`, `scale 5.0`, `linesPerGroup 16`.
  - `random(t) = (cos t + cos(1.3t + 1.3) + cos(1.4t + 1.4)) / 3`.
  - `uv = fragCoord / resolution`; `space = (fragCoord − res/2) / res.x × 2 × scale`.
  - Speeds: `lineSpeed = 0.2·uSpeed`, `warpSpeed = 0.04·uSpeed`, `offsetSpeed = 0.266·uSpeed`.
  - Fades: `hFade = 1 − (cos(uv.x·2π)·0.5 + 0.5)`, `vFade` the same on y (both peak in the middle).
  - Warp: `space.y += random(space.x·warpFreq + t·warpSpeed) × warpAmp × (0.5 + hFade)`; `space.x += random(space.y·warpFreq + t·warpSpeed + 2) × warpAmp × hFade`.
  - For each of 16 lines `l` (`nIdx = l/16`): `offsetPos = l + space.x·offsetFreq`; `rand = random(offsetPos + t·offsetSpeed)·0.5 + 0.5`; `halfWidth = mix(minW, maxW, rand·hFade) / 2`; `offset = random(offsetPos + t·offsetSpeed·(1 + nIdx)) × mix(minSpread, maxSpread, hFade)`; `linePos = random(space.x·lineFreq + t·lineSpeed) × hFade × amp + offset`.
  - Line = `smoothstep(halfWidth, 0, |linePos − y|)/2 + smoothstep(halfWidth·0.15 + smooth, halfWidth·0.15, |linePos − y|)` (soft glow plus crisp core).
  - Bead: `circleX = mod(l + t·lineSpeed, 25) − 12`, positioned on the same curve; `smoothstep(0.01 + smooth, 0.01, distance) × 4`.
  - Accumulate `(line + circle) × vec4(lineColor, 1) × rand`.
  - Background: `mix(bg1, bg2, uv.x) × vFade`, alpha 1, plus the lines.
- Responsive: the shader is resolution independent; scale is relative to width, so phones show fewer, larger waves.

## Motion

- Time is seconds since mount, fed to `iTime` each frame; there is no easing, only the shader's continuous functions.
- Colours and speed are read from a ref every frame, so prop changes apply instantly without recreating the GL program.

## Interaction and states

- No pointer input.
- Setup runs once: compile both shaders (log and bail on errors), link, create the buffer, look up uniforms, start the loop.
- Cleanup: cancel the frame, disconnect the observer, delete buffer and program.
- If WebGL is unavailable, render the bare canvas (no crash).

## Demo data

The section composition: a 560–640px tall wrapper `relative overflow-hidden bg-[#050b18]` holding `WavyLines` with `lineColor="#2997ff"`, `backgroundColorStart="#050b18"`, `backgroundColorEnd="#0b1f3a"`, `speed={1.2}`, `radius={12}`, filling the wrapper. Over it, a vignette `radial-gradient(circle at 48% 42%, transparent 0%, rgba(0,0,0,.2) 46%, rgba(0,0,0,.7) 100%)`, and bottom-left (40px inset, `max-w-md`) a caption: 14px medium `#a1a1a6` "Tidal, ocean sensor network"; 40px semibold headline, leading 1.05, tracking −0.035em, `#f5f5f7`, "Readings from 4,000 buoys, live."; 16px `#a1a1a6` body "Swell, temperature and salinity, streamed every ninety seconds." Both overlays are `pointer-events-none`.

## Accessibility

- The canvas is decorative; put meaningful text in the DOM (as in the caption) and keep contrast high with the vignette.
- For `prefers-reduced-motion: reduce`, consider passing `speed={0}` (the field then stays still but keeps its look).
- Lines never flash: brightness changes are continuous and slow.

## Acceptance checklist

- [ ] Sixteen glowing lines weave across the canvas, thickest and most spread in the horizontal middle, converging toward the edges.
- [ ] Each line has a soft halo and a crisp bright core.
- [ ] Small beads travel along the lines.
- [ ] Background blends left-to-right between the two colours and darkens toward top and bottom.
- [ ] `speed` scales every motion; `0` freezes it.
- [ ] Changing `lineColor` or the background colours updates on the next frame without remounting.
- [ ] Canvas is sharp on retina (DPR capped at 2) and resizes with its container.
- [ ] Corner radius follows `radius`.
- [ ] Unmount frees the GL buffer and program and stops the loop.
