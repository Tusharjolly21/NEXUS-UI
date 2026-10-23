# Black Hole Delete

Build an inbox where deleting a message is a cosmic event. Swipe a message sideways (or press its close button) and a black hole opens: the whole list bends around it like a gravitational lens, the message is stretched into a thin streak and spirals in, then the hole collapses with a flash and a shockwave that ripples through the remaining messages while they slide up to close the gap. A Restore button runs it backwards with a white hole that spits the deleted messages back out into their places.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, two `<canvas>` elements and a small raw WebGL shader. No animation library. `cn` for class merging.
- File: `components/black-hole-delete/black-hole-delete.tsx` plus an `index.ts`. Named exports: `BlackHoleDelete`, `BlackHoleDeleteProps` and `BlackHoleMessage`.
- The component is split in two: `BlackHoleDelete` (public) renders an inner `BlackHoleStage` with `key = autoplay + JSON.stringify(messages)`, so changing the messages or `autoplay` remounts the scene instead of patching a running one.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `messages` | `BlackHoleMessage[]` | six sample messages | The inbox. Each one also gets a real delete button for keyboard and screen reader users. |
| `height` | `number` | `540` | Height of the stage in px. About `76 + 69 * count + 40` fits the list and the hint line. |
| `autoplay` | `boolean` | `false` | A ghost pointer swipes a few messages away and restores them, until a real pointer arrives. |
| `className` | `string` | none | Extra classes for the stage. |

`BlackHoleMessage` is `{ title: string; body: string; time: string; color: string }`. `color` is the avatar colour, the avatar shows the initials of `title` (first letter of up to two words).

## Layout

- The stage is `relative w-full touch-none select-none overflow-hidden rounded-[24px] bg-[#06070a]` with an inline `height` and a system-ui font stack. It is always dark, whatever the site theme.
- Two canvases fill it (`absolute inset-0`, `aria-hidden`): the UI canvas (2D) and the GL canvas on top. When WebGL links, the UI canvas is hidden and used only as the texture source; if WebGL is unavailable the UI canvas is shown and the hole is drawn as a plain black (or white) disc.
- Both canvases are sized `layout width x layout height x min(2, devicePixelRatio)`, using `offsetWidth` / `offsetHeight` (not the on-screen rect) so a CSS-scaled preview does not shrink the scene. A `ResizeObserver` refits them. Pointer positions are `(client - rect) / (rect size / layout size)` for the same reason.
- Cards are 460px wide at most (`min(460, width - 48)`), centred, 60px tall with a 9px gap, starting 76px from the top. Header over the canvases: "Inbox" (20px semibold) with a count pill, and a Restore pill button on the right, both inside a `max-w-[460px]` row (`pointer-events-none` wrapper, `pointer-events-auto` row). Restore is disabled while nothing is deleted. A hint line "Swipe a message away, or hover and press its close button." sits 20px from the bottom in `white/45`.
- A visually hidden `<ul class="sr-only">` lists the live messages, each with a button "Delete message from {title}". Deleting through it takes the same black hole path as a swipe.

## Motion

The scene is simulated in layout pixels and redrawn every frame (`dt` clamped to 1/240..33ms).

- **Card drawing.** Rounded card (radius 16, `#18191f`, hover `#1f2029`, 1px `white/7%` stroke), a 34px avatar circle with initials, title (600 14px), body in `#8e8e93` cut with an ellipsis to fit, and the time on the right. On hover the time becomes a round close button (circle `white/10%` with an X). The background is a radial gradient `#13141c` to `#06070a` plus 140 fixed small stars so the lens has something to bend.
- **Items.** Each message is `live`, `dying`, `dead` or `restoring`, with spring state: `y` (springs to its slot, stiffness 220, damping 22), horizontal drag offset `dx` (springs back to 0, 260 / 24), and a tidal offset `ox, oy` (150 / 10). The slot is `76 + (number of live or restoring messages before it) * 69`.
- **Swipe.** Pointer down on a card captures the pointer and drags it horizontally; it tilts by `dx / width * 0.12` and fades up to 40%. On release it is thrown away if `|dx| > 28%` of the card width or the release speed is above 900 px/s; otherwise it springs back with the release speed. Pressing within 13px of the close button deletes straight away. `pointercancel` ends a drag like `pointerup`.
- **Hole lifecycle** (one at a time): `grow` (0.3s, radius eases to target 30px for a swipe, 38px for the close button, 20px for restore), `eat` (radius wobbles by 6% at 18 rad/s while any message is dying or restoring, minimum 0.2s), `collapse` (0.22s linear to 0). A swipe opens the hole beside the card (`18%` of the card width away, clamped 40px from the edges); the close button opens it right on the card; restore opens a white hole at the middle of the list.
- **Falling in.** A dying card advances `u` 0 to 1 over 1s and is drawn at `angle = start angle + u^1.5 * 2.2 PI`, `distance = start distance * (1 - u^1.5)^1.3`, rotated along the orbit, scaled `sc * (1 - 0.6u)` across and `sc * (1 + 2.5u)` along it (spaghettification), alpha down to 40%. A card swallowed in place (close button) twists up (`u^2 * 2.8 PI`) and shrinks instead. Glowing additive dust particles are shed along the way and spiral inward, dying at distance 4. Restore plays the same path backwards over 0.9s per card, staggered by 0.14s after a 0.25s wait.
- **Tidal pull.** While a black hole is open the remaining cards lean and slide toward it (`min(30, rs^2 * k / max(distance, 40))`, `k` 0.9, or 1.5 for the close button) on the tidal spring.
- **Collapse.** The hole ends with a flash (decays at 3 per second), a ripple (radius grows 520 px/s, amplitude 9 or 12 decaying at `exp(-2.6t)`) and an impulse shoving every live card away from the centre (`420 / (1 + d / 90)`), which then settles. A white-hole collapse also commits the restored messages to the visible count.
- **Lens shader.** One full-screen quad. For each pixel: apply the ripple displacement (a Gaussian ring of width 22 with a sine inside); bend the lookup toward the hole by `rs^2 * 2.4 / r` (away from it for a white hole); twist it around the hole by `swirl * rs^2 / (r^2 + 0.6 rs^2)` (swirl 0.6 for a swipe, `0.8 + 2.4 * progress^0.8` for the close button, -0.8 for white). Sample the UI texture there. Black hole: shadow disc inside `1.02 rs`, a tilted accretion disk (`y` squashed by 0.3, band from 1.25 to 4.4 radii, orange to cream, 3-arm swirl turning with time, brighter on one side), the far side of the disk arced over the top at `1.32 rs`, and a thin photon ring at `1.05 rs`. White hole: a white core `exp(-r / 0.55rs)`, a cool blue ring at `1.6 rs` and a soft halo. A warm flash is added around the hole after a collapse.
- **Autoplay.** Until the user touches the stage (or has been idle outside it for 4s) a ghost cursor runs a script: swipe the second message right, press the close button on the first, swipe the third left (the number of steps is `min(3, count - 2)` so two messages always remain), then wait 1.6s and press Restore, wait 2.2s and start again. The ghost is a white dot with a ring. If the user takes over mid-swipe the ghost's grab is released.
- Pauses while off screen (`IntersectionObserver`). Under reduced motion the ghost never runs; the idle frame is the static inbox, and swiping or pressing the buttons still works.
- Cleanup on unmount: cancel the frame, disconnect both observers, remove the pointer listeners (`pointerdown` on the stage, `pointermove`, `pointerup`, `pointercancel` on `window`), delete the GL texture, buffer, program and shaders. Do not force-lose the context (StrictMode remounts on the same canvas).

## Accessibility

- Both canvases are `aria-hidden`. Every message has a real button in the `sr-only` list, so deleting works from the keyboard and with a screen reader; the Restore button is a normal focusable button with a visible focus ring.
- The ghost never runs under `prefers-reduced-motion`, and the scene is still when nothing is happening.
