# Ripple Field

Build a quiet, full-width grid of small grey dots on a rounded card. Clicking anywhere sends an invisible ring outward from that point; every dot the ring crosses bursts into a random bright colour, gets kicked away from the centre, then springs back home and fades to grey. Dots near the pointer swell slightly. The feel is soft and playful, like dropping a pebble into a pond of confetti.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS. Rendering is a single 2D `<canvas>` driven by `requestAnimationFrame`; no animation library is needed.
- File: `components/ripple-field/ripple-field.tsx`, named export `RippleField`. Also export the default palette as `RIPPLE_FIELD_PALETTE`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `height` | `number` | `300` | Field height in px. Width always fills the container. |
| `gap` | `number` | `18` | Distance between dot centres in px. |
| `colors` | `string[]` | `RIPPLE_FIELD_PALETTE` | Colours a dot can burst into; one is picked at random each time a ring hits it. |
| `autoplay` | `boolean` | `false` | Drops rings at random spots until the user clicks. |

`RIPPLE_FIELD_PALETTE = ["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2"]`.

## Layout and look

- Wrapper: `relative w-full overflow-hidden`, height = `height`, radius 24px, `cursor-crosshair`, no outline. Light: background `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 50px -28px rgba(0,0,0,.3)`. Dark: background `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 50px -28px rgba(0,0,0,.8)`. Focus-visible: 2px ring `#0071e3` (dark `#0a84ff`).
- Canvas: absolutely fills the wrapper. Backing store = CSS size × devicePixelRatio, with DPR capped at 2; draw with `setTransform(dpr,0,0,dpr,0,0)` and clear every frame.
- Dots: a grid starting at `gap / 2` on both axes and stepping by `gap` while inside the width/height. Rebuild the grid (and resize the canvas) with a `ResizeObserver` on the wrapper.
- Resting dot: radius 1.6px, fill `rgba(ink, .18)` where ink is `29,29,31` in light mode and `245,245,247` in dark mode. Because the canvas cannot read Tailwind classes, detect dark mode by checking whether `document.documentElement` has the `dark` class, kept current with a `MutationObserver` on its `class` attribute.

## Motion

Keep a list of rings `{ x, y, t }` (t = `performance.now()` at creation) and per-dot state `{ offset (ox, oy), velocity (vx, vy), energy e, colour c, lastHitRing }`.

Constants: ring speed `SPEED = 340` px/s, band half-width `BAND = 22` px, max radius `MAXR = 230` px, ring lifetime `MAXR / 340 × 1000 + 100` ms (≈776ms); drop expired rings each frame. Frame delta `dt` is in seconds and clamped to `0.033`.

For each dot, each frame:

1. **Ring hits.** For every live ring, `radius = (now − t)/1000 × SPEED`. If `radius < MAXR`, `|dist(dot, ring centre) − radius| < BAND`, and the dot has not already been hit by this ring, register a hit:
   - `strength = 1 − radius / MAXR` (hits weaken with distance);
   - `e = max(e, 0.35 + 0.65 × strength)`;
   - pick a random colour from `colors`;
   - `kick = (60 + random × 120) × strength`, added to the velocity along the unit vector from the ring centre to the dot (guard against division by zero).
2. **Spring home** (semi-implicit Euler):
   ```
   v += −offset × 90 × dt;  v *= 0.02^dt;  offset += v × dt
   ```
   i.e. stiffness 90 with velocity keeping 2% of itself per second.
3. **Colour decay**: `e = max(0, e − 1.1 × dt)`.
4. **Size**: `1.6 + 2.6 × e`. If the pointer is over the field, `hover = max(0, 1 − pointerDistance / 70)` and size grows by `1.2 × hover`.
5. **Draw** a circle at `home + offset`. If `e > 0.02`, fill with the dot's colour at alpha `min(1, 0.25 + e)`. Otherwise fill with ink at alpha `0.22 + 0.4 × hover` when hovered, or `0.18` when not.

Reset `globalAlpha` to 1 after drawing.

## Interaction and states

- Pointer coordinates are converted to field-local px (scale by the wrapper's `clientWidth` and `height` so it stays correct under CSS transforms).
- `pointermove`: store the pointer for the hover swell; `pointerleave`: clear it.
- `pointerdown`: push a ring at the pointer and mark the component as touched.
- Multiple rings can overlap; each dot reacts once per ring.
- Keyboard: Enter or Space (with `preventDefault`) pushes a ring at the exact centre of the field. This does not count as touching, so autoplay keeps going.
- Changing `height`, `gap` or `colors` restarts the loop and rebuilds the grid. Cancel the animation frame and disconnect observers on unmount.

## Autoplay demo

When `autoplay` is true, drop a ring 500ms after mount and then every 1700ms at a random point: x in 15%–85% of the width, y in 20%–80% of the height. Each drop is skipped once the user has pressed a pointer on the field, so the demo stops permanently after the first click.

## Accessibility

- Wrapper: `role="button"`, `tabIndex={0}`, `aria-label="Dot field. Click anywhere to send a ring of colour across it."`, visible focus ring.
- Canvas is `aria-hidden="true"`.

## Acceptance checklist

- At rest the field shows an even grid of faint 1.6px dots, offset by half a gap from the edges.
- A click produces an expanding ring of colour that reaches about 230px and is gone in under a second.
- Dots near the click flash bigger, brighter and travel further than dots near the ring's edge.
- Kicked dots overshoot slightly and settle back to their exact grid positions.
- Colour fades to grey in under a second after a hit.
- Moving the pointer swells and darkens dots within 70px.
- Enter/Space fires a ring from the centre.
- Toggling the `.dark` class on `<html>` switches the resting dots to light ink without a reload.
- With `autoplay`, rings appear every 1.7s until the first click.
