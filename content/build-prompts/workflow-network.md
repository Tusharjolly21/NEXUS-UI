# Workflow Network

Build a trigger-to-targets diagram on a dark dotted canvas. One source fans out along curved wires to its targets. Light runs out of the source along every wire at once, fills each one up to its target, holds, then drains and starts again. Hover or focus a target to isolate its route.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion.div` for the cards) and one SVG layer. `cn` for class merging.
- File: `components/workflow-network/workflow-network.tsx` plus an `index.ts`. Named exports: `WorkflowNetwork`, `WorkflowNetworkProps` and `FlowNode`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `source` | `FlowNode` | an "Error Trigger" node | Where the wires start. |
| `targets` | `FlowNode[]` | Mattermost, Twilio, Kafka | Where the wires end. |
| `beamColor` | `string` | `"#3b6cf6"` | Colour of the light and the dot. |
| `cycle` | `number` | `2.6` | Seconds for one fill, hold and drain. |
| `dots` | `boolean` | `true` | Rides a dot on the front of each beam. |
| `mode` | `"loop" \| "once"` | `"loop"` | Loop forever, or fill once and stay lit. |
| `autoplay` | `boolean` | `false` | Runs the beams. Off, the wires rest filled. |
| `className` | `string` | none | Extra classes for the canvas. |

`FlowNode` is `{ title: string; sub: string; color: string; icon: ReactNode }`; the icon can be an inline SVG or an `<img>` of a logo.

## Layout and look

- A 400px-tall canvas, radius 24px, background `#0b0b0c` with a 16px dot grid (`radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)`), content centred in a row with a gap of `clamp(48px, 12%, 140px)`.
- Cards: 150px wide (168px from `sm`), radius 10px, `#18181b`, a 1px border `rgba(255,255,255,.08)`, padding 10px 14px. A 24px icon in the node's colour, a 13px semibold title and an 11.5px muted subtitle, both truncating.
- Targets stack in a column with a 40px gap; the middle one is nudged 56px to the right so the wires do not fan out symmetrically.
- An absolutely positioned SVG sits under the cards. Each wire is two paths: a faint base (`rgba(255,255,255,.13)`, 1.25px) and a beam (the beam colour, 2px, round caps, a soft drop shadow) with `pathLength={1}`, plus a 2.6px white dot with a glow.

## Motion

- Measure from the real cards in a `requestAnimationFrame` loop: read the source's right-middle and each target's left-middle relative to the canvas, and set each path to `M a C a+dx b-dx b` with `dx = max(30, (bx - ax) * 0.55)`. Wires therefore stay attached at any width and while cards animate.
- One progress value `p = (t / cycle) % 1` drives everything. The head eases out over the first 55%, holds until 75%, then the tail eases out to the end (cubic ease-out). With `pathLength = 1`, set `strokeDasharray = "${head - tail} 2"` and `strokeDashoffset = -tail`, so the lit segment is a fraction of the wire. The dot sits at `getPointAtLength(head * length)` and is hidden at both ends.
- `mode="once"` fills over `cycle` and stays lit. With `autoplay` off, draw a fixed filled frame.
- Hover or focus a target: its card gets a blue border and a faint ring, the others dim to 50% and their beams to 12%. This must not restart the cycle.
- Write attributes to the SVG nodes straight from the loop, with no React re-render per frame. Pause while off screen.

## Accessibility

- Target cards are focusable (`tabIndex={0}`) and respond to focus the same as hover. The SVG is `aria-hidden`; the diagram is illustrative, so put the real meaning in surrounding copy.
