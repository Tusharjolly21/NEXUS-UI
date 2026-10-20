Build an integrations feature card. In a soft grey dotted panel, five colourful tool tiles (mail, chat, calendar, docs, cloud) ride slowly round a dashed ring that circles your app's dark hub tile. Each tool is wired to the hub by a thin coloured line that carries a small packet dot inward. Bring the pointer near and the tools lean toward it like magnets, growing slightly with a deeper shadow while their line lights up and their packets speed up; move away and they snap back with a wobble. The whole card tilts toward the pointer in 3D. A title and a line of copy sit below.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`).
- File: `components/feature-tools-card/feature-tools-card.tsx`, named export `FeatureToolsCard` (also default), type `FeatureToolsCardProps`.
- One `requestAnimationFrame` loop in the card drives every tool and writes line/packet attributes directly to SVG elements via refs (no React re-render per frame). Each tool registers a per-frame function with the parent.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Connects with your stack"` | Heading. |
| `description` | `string` | `"Mail, chat, calendar, docs and storage, synced the moment they change."` | Copy. |
| `cardBg` | `string` | white / dark `#1c1c1e` | Card background. |
| `icon1`…`icon5` | `ReactNode` | drawn glyphs | Replace a tool's glyph; custom icons sit on a white tile. |
| `hubIcon` | `ReactNode` | crosshair glyph | Hub logo. |
| `enableTilt` | `boolean` | `true` | 3D tilt. |
| `tiltStrength` | `number` | `8` | Max tilt degrees. |
| `enableMagnetic` | `boolean` | `true` | Tools lean to the pointer. |
| `magneticStrength` | `number` | `0.4` | Share of the distance a tool travels (0-1). |
| `magneticRadius` | `number` | `120` | px at which a tool starts to feel the pointer. |
| `enableOrbit` | `boolean` | `true` | Tools ride the ring. |
| `orbitSpeed` | `number` | `36` | Seconds per turn. |
| `orbitColor` | `string` | `#c7c7cc` / dark `#48484a` | Dashed ring colour. |
| `autoplay` | `boolean` | `false` | A virtual pointer sweeps round until touched. |
| `className` | `string` | `""` | Card classes. |

## Layout and look

- Card: 340px wide (max 100%), radius 24, padding 16, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `rgba(0,0,0,.9)`), text `#1d1d1f` / `#f5f5f7`, `transformPerspective: 900`.
- Stage: 228px tall, radius 18, overflow hidden, `#f5f5f7` (dark `#2c2c2e`), dot grid `radial-gradient(circle, rgba(0,0,0,.07) 1px, transparent 1.2px)` at 14×14px.
- An overflow-visible 1×1 SVG at the stage centre holds: the ring (r 84, stroke 1.5, dash `3 7`, round caps); five lines from (0,0) to each tool, stroke in that tool's colour, width 1.5, round caps, base stroke opacity 0.22; five packet circles r 2.6 in the tool colours.
- Tool colours: `#0a84ff`, `#30b65a`, `#ff375f`, `#ff9f0a`, `#bf5af2`. Labels: Mail, Chat, Calendar, Docs, Cloud.
- Tool tile: 46px, radius 13, centred on its position, background `linear-gradient(160deg, {colour}cc, {colour})` with a white 22px glyph (stroke 2, round): mail (rect + V), chat bubble, calendar, document, cloud. With a custom icon: white tile and the icon at 24px. `title` attribute = label.
- Hub (z 20): 64px, radius 20, `#1d1d1f` with white icon (dark `#f5f5f7` / `#1d1d1f`), shadow `0 12px 24px -12px rgba(0,0,0,.6)`. Default glyph: a 3.2-radius circle with four short ticks (28px, stroke 2.2). Behind it a pulse square in `#0071e3`/25% (dark `#0a84ff`/30%).
- Title: 16px below, 4px side padding, 17px semibold, tight leading, tracking −0.02em. Description: 13px, line-height 1.45, `#6e6e73` / `#a1a1a6`.

## Motion

- Ring: the dashed circle rotates 360° linearly every `orbitSpeed` s, forever (if orbit enabled).
- Tool position: start angle `−90° + i·72°`; current angle adds `t·360/orbitSpeed` when orbiting. Base point `(cos a·84, sin a·84)`. Render the resting position on the server too (rounded to 2 decimals).
- Magnetism per frame: `d` from base to pointer (pointer in stage-centre coordinates); `near = max(0, 1 − |d|/magneticRadius)` when live and enabled. Target offset `d·near·strength`, through springs stiffness 260, damping 13 (that's the wobble). `pull = near` through a spring 300/18; `scale = 1 + 0.14·pull`; shadow `0 {8 + 10p}px {18 + 14p}px −10px rgba(0,0,0, 0.35 + 0.15p)`.
- Lines: endpoint = base + sprung offset; stroke opacity `0.22 + 0.78·near`.
- Packets: phase `k = (t·(0.45 + 0.9·near) + 0.21·i) mod 1`; position = endpoint·(1 − k) (travelling inward to the hub); opacity `sin(k·π)·(0.55 + 0.45·near)`.
- Hub pulse: scale 1 → 1.55, opacity 0.6 → 0 over 2.2s easeOut, forever.
- Tilt: `rotateY = (x% − 0.5)·2·tiltStrength`, `rotateX = −(y% − 0.5)·2·tiltStrength`, springs 160/16; reset to 0 on leave.

## Interaction and states

- `pointermove` on the card sets tilt and the live pointer; `pointerleave` resets tilt and marks the pointer not live (tools spring home).
- Reduced motion: time frozen at 0 (no orbit, no ring spin), no magnetism, no tilt, packets hidden, no hub pulse.

## Autoplay demo

Until the first pointer move or press, drive a live virtual pointer: `a = 0.9t`, `x = cos(a)·84·1.05`, `y = sin(1.3a)·84·0.9`, so tools light up one after another.

## Accessibility

- Stage `role="img"` with `aria-label="Connected tools: Mail, Chat, Calendar, Docs, Cloud"`; the SVG, glyphs and pulse are `aria-hidden`. Title is an `<h3>`.

## Acceptance checklist

- Five coloured tiles sit evenly on a dashed ring round a dark hub, each wired by a faint line.
- Tiles and the ring rotate slowly (36s per turn).
- Packets travel along each line toward the hub and fade in and out.
- Pointer near a tile pulls it toward the pointer, grows it, brightens its line and speeds its packet; leaving makes it wobble back.
- The card tilts up to 8° toward the pointer and settles on leave.
- Custom icons render on white tiles.
- Reduced motion shows a still, flat layout.
