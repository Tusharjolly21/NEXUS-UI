Build a card with a light inside it. When the pointer is inside, a soft spotlight trails it on a spring and the hairline border glows wherever the light is closest. When the pointer leaves, the light slides out to the nearest edge and keeps running laps around the border like a comet tracing the outline, until the pointer comes back. The default content is a "Pro" pricing tier. Calm, premium, Apple-light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useTransform`, `useReducedMotion`).
- File: `components/tracing-spotlight-panel/tracing-spotlight-panel.tsx`, named export `TracingSpotlightPanel`, plus an alias `export const TracingSpotlight = TracingSpotlightPanel`; exported type `TracingSpotlightPanelProps`.
- Dark mode is read in JS (the light colour needs it) via `useSyncExternalStore` + a `MutationObserver` on `<html>`'s `class` (server snapshot `false`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | pricing tier | Panel content. |
| `color` | `string` | `#0071e3` (dark `#0a84ff`) | Light colour. Alpha variants are derived only from `#rrggbb`; other formats are used as-is. |
| `size` | `number` | `260` | Inner spotlight radius in px. |
| `trace` | `boolean` | `true` | Run laps around the border when idle. |
| `lap` | `number` | `5` | Seconds per lap (min 1). |
| `autoplay` | `boolean` | `false` | Sweeps the spotlight through the panel now and then until someone points. |
| `className` | `string` | `""` | Root classes. |

## Layout and look

- Root: relative, full width, max 340px, radius 24, padding 1.5px (that padding is the border).
- Layers, bottom to top:
  1. Hairline: full-size, radius 24, `rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`).
  2. Rim light: full-size, radius 24, `radial-gradient(150px circle at x y, accent, transparent 70%)`, opacity 1 when idle and 0.85 when the pointer is inside. Only the 1.5px gap around the inner card shows it, so it reads as a lit section of border.
  3. Halo (skipped under reduced motion): inset −12px, radius 30, `blur-xl`, `radial-gradient(90px circle at x y, accent at 35% alpha (dark 50%), transparent 70%)`, pointer-events none. A soft bloom spilling outside the border.
  4. Inner card: radius 22.5, `overflow: hidden`, padding 24, white, shadow `0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e`, `0 20px 40px -26px rgba(0,0,0,.9)`. Inside, a glow layer `radial-gradient(size px circle at x y, accent at 14% alpha (dark 24%), transparent 70%)` with opacity = the "inside" spring, then the content.
- Default pricing tier:
  - Row: "Pro" 13px semibold `#1d1d1f` (dark `#f5f5f7`); badge "Most popular" 11px semibold, padding 2×10, pill, background `#0071e3` at 10%, text `#0059b3` (dark: `#0a84ff` at 20%, `#6cb6ff`).
  - Price 12px below: "$24" 40px semibold, leading 1, tracking −0.04em, tabular; "per month" 13px `#6e6e73` (dark `#a1a1a6`), 4px gap, baseline.
  - Features 16px below, gap 8, 13px: "Unlimited projects", "Version history for 90 days", "Priority support", each with a 16px check icon: circle r 7 at 16% opacity in `#28a745` (dark `#30d158`) and a check stroke 1.7 in `#1a7f37` (dark `#30d158`).
  - Button 20px below: full width, 40px tall, pill, `#0071e3` (dark `#0a84ff`), 14px medium white, "Start free trial", `whileTap` scale 0.96 (spring 500/24), focus ring with 2px offset.

## Motion

- Light position: target motion values `tx`, `ty` (px within the panel) → `useSpring(stiffness 140, damping 17, mass 0.7)` → `x`, `y`, used by all three gradients via `useMotionTemplate`.
- Inside amount: `useSpring(0, stiffness 160, damping 22)`, set to 1 inside and 0 outside; drives the inner glow opacity and maps 0 → 1 to the rim opacity 1 → 0.85.
- Border lap: `onBorder(d, w, h)` returns the point `d` px along the rectangle's perimeter, clockwise from the top-left corner (top edge → right edge → bottom edge right-to-left → left edge bottom-to-top), with `d` wrapped by the perimeter `2(w + h)`. Each frame in trace mode, `along += perimeter / lap × dt` (dt ≤ 50ms) and set the target to that point. The spring makes corners round off softly, so it looks like a comet.
- Panel size `w`, `h` comes from `offsetWidth/Height` via a ResizeObserver.
- Start: put the light 30% along the top edge and `jump` both targets and springs there, so the first frame doesn't fly in from the corner.

## Interaction and states

- Modes: `trace`, `pointer`, `demo`.
- `pointermove` on the root: mode pointer, target = pointer position relative to the root, inside 1, mark touched.
- `pointerleave`: mode trace, inside 0, and resume the lap from the border point nearest to where the pointer left. Clamp the last target into the box, find the closest side (top, right, bottom, left) and convert to a perimeter distance: top `px`, right `w + py`, bottom `w + h + (w − px)`, left `2w + h + (h − py)`. The light slides out to that edge and carries on.
- Keyboard: focus within the panel moves the light to the centre of the focused element (mode pointer, inside 1); blur leaving the panel acts like pointerleave.
- `trace={false}`: the light rests where it was left.
- Reduced motion: no laps, no demo, no halo; the spotlight still follows the pointer.
- One rAF loop for the component's life, cancelled on unmount. Keep props in a ref so the loop reads the latest values.

## Autoplay demo

While untouched, not reduced and not in pointer mode: 2.2s after start switch to demo mode for 2.6s with inside 1, sweeping the target along `x = w(0.5 + 0.34·sin(2πt))`, `y = h(0.5 + 0.3·sin(4πt + 0.6))` with `t` going 0 → 1 (a figure-of-eight). Then return to trace mode with inside 0, and repeat 3.4s later. Any pointer move stops it for good.

## Accessibility

- All light layers are `aria-hidden` and pointer-events none, so content stays fully interactive. The default button is a native button with a visible focus ring. Keyboard focus also positions the light, so keyboard users get the same effect.

## Acceptance checklist

- With no pointer, a bright segment of border travels clockwise around the card once every 5s, rounding the corners smoothly, with a soft halo outside.
- Moving inside fades in a soft blue spotlight that trails the pointer; the border lights up nearest the pointer.
- Leaving through the right edge makes the light continue its lap from the right edge, not jump.
- Tabbing to the button moves the light over it.
- `color="#bf5af2"` turns everything purple with matching translucent glows.
- Autoplay sweeps a figure-eight through the card every ~6s until touched.
- Dark mode uses the brighter blue and stronger glow on a `#1c1c1e` card.
