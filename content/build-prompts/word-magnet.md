Build a headline whose words behave like fridge magnets. The pointer (or a finger) pushes nearby words away, mostly up and down. Each word tilts in the direction it was shoved, holds its new spot for a beat, then springs home on an under-damped spring so it wobbles before it settles. Whole words move as units and letters never split. Big, bold, playful type on a calm page.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useReducedMotion`), React `useSyncExternalStore`, and a `cn` helper built on tailwind-merge.
- File: `components/word-magnet/word-magnet.tsx`, named export `WordMagnet` (also default), exported type `WordMagnetProps`.
- One rAF loop integrates every word and writes into per-word motion values (x, y, rotate). React never re-renders during the motion.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `text` | `string` | `"Magnetic words react to your cursor and snap back into place"` | Split on whitespace into words. |
| `radius` | `number` | `130` | Influence radius px (min 10). |
| `force` | `number` | `0.45` | Push strength 0–1 (min 0). |
| `damping` | `number` | `28` | Return-spring damping (min 1). Lower wobbles longer. |
| `returnDelay` | `number` | `360` | Ms a pushed word holds before returning (min 0). |
| `disableOnMobile` | `boolean` | `false` | Off when `(max-width: 767px), (pointer: coarse)` matches. |
| `overflow` | `CSSProperties["overflow"]` | `"visible"` | Whether pushed words may spill out. |
| `className` | `string` | – | Container classes. |
| `wordClassName` | `string` | – | Classes for every word. |
| `style` | `CSSProperties` | – | Container inline styles (merged after overflow). |
| `autoplay` | `boolean` | `false` | A ghost pointer drifts through until a real pointer arrives. |

Keep config values in a ref so the loop always reads the latest without restarting.

## Layout and look

- Container: relative, flex-wrap, centred both ways, `max-width: 64rem`, column gap 0.24em, row gap 0.08em, centred text, 40px (52px from `sm`), semibold, tracking −0.035em, `#1d1d1f` (dark `#f5f5f7`), `touch-action: pan-y` (vertical page scroll still works on touch). Line height 1.12, added only if the caller's `className` has no `leading-*` class (tailwind-merge would otherwise drop it when a text size is passed).
- An sr-only copy of the full text; every visible word is `aria-hidden`, `inline-block`, `white-space: nowrap`, `will-change: transform`.
- Ghost pointer (autoplay only): a 20px circle centred on the ghost position, `#0071e3` at 15% fill with a 1.5px ring `rgba(0,113,227,.55)` (dark `#0a84ff` at 20% with `rgba(10,132,255,.7)`), pointer-events none, opacity 1 while the ghost drives and 0 after.

## Motion

Per word keep a body `{ x, y, vx, vy, tx, ty, hold }`. Each frame (dt capped at 33ms, first frame 16ms):

1. Pointer `p` = the real pointer (container-local px) or the ghost.
2. For each word, rest centre = `offsetLeft + offsetWidth/2`, `offsetTop + offsetHeight/2` (layout offsets ignore transforms, so the rest position never drifts). `dx = cx − p.x`, `dy = cy − p.y`, `d = hypot(dx, dy)` (min 1).
3. If `d < radius`: `k = (1 − d/radius)^1.6 × force × 80`; target `tx = (dx/d) × k × 0.55`, `ty = (dy/d) × k`; `hold = now + returnDelay`. The x push is scaled down because words share a line and a sideways shove would just pile them into their neighbours.
4. If `now > hold`, target returns to (0, 0).
5. Spring integration with stiffness 190 and `c = damping × 0.5`: `v += (190·(t − pos) − c·v)·dt`; `pos += v·dt` for both axes.
6. Write `x`, `y` (rounded to 2 decimals) and `rotate = clamp(x × 0.16 + vx × 0.012, −14°, 14°)`, so a word tilts the way it is moving and swings back as it returns.
7. Keep looping while a pointer is present, any word moves (`|x|+|y|+|vx|+|vy| > 0.05`) or is still holding; otherwise stop and reset the clock. Pointer events wake the loop.

With the defaults a word right under the pointer is pushed about 36px vertically, holds about a third of a second after the pointer moves away, then overshoots and wobbles a couple of times before settling.

## Interaction and states

- `pointerenter`, `pointermove` and `pointerdown` on the container set the local pointer (from the container rect), mark it touched and wake the loop. `pointerleave` and `pointercancel` clear the pointer, so words return after their hold.
- Works with mouse, pen and touch (dragging a finger across the words pushes them).
- Off state (reduced motion, or `disableOnMobile` on a narrow/coarse device, tracked with `useSyncExternalStore` over a `matchMedia` listener, server snapshot false): render plain static spans, reset all motion values to 0 and run no loop.
- Changing `text` re-registers words; each word registers its element and motion values with the parent on mount and unregisters on unmount. Cancel the frame on unmount.

## Autoplay demo

While untouched, a ghost pointer travels a Lissajous path over the container: `x = width × (0.5 + 0.46·sin(0.7t))`, `y = height × (0.5 + 0.42·sin(1.3t + 0.6))`, t accumulating dt. The ghost dot is shown at that point and pushes words exactly like a real pointer. The first real pointer event hands control over and hides the dot.

## Accessibility

- Screen readers get the single sr-only sentence; the animated words are `aria-hidden`. Nothing traps focus or blocks vertical scrolling on touch. Reduced motion shows the text perfectly still.

## Acceptance checklist

- The headline wraps and centres like normal text.
- Moving the pointer through it pushes nearby words away, mostly vertically, with words closest to the pointer moving furthest.
- Pushed words tilt toward their motion and hold briefly after the pointer leaves.
- Words then spring home with a visible wobble; `damping={60}` settles almost flat, `damping={12}` wobbles longer.
- Letters never separate; layout never reflows during the effect.
- Touch drags push words while vertical page scrolling still works.
- Autoplay shows a small blue ghost ring weaving through the words until the user's pointer arrives.
- Reduced motion or `disableOnMobile` on a phone renders static text.
