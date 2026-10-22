Build a session-expiry card whose countdown is a real hourglass. Every grain of sand is simulated on a small canvas: the sand piles, slides off slopes and squeezes through the neck at exactly the rate that empties the top as the time runs out. A "Stay signed in" button turns the glass over. The feel is Apple-like and physical: quiet card, warm sand, a heavy spring when the glass flips.

## Stack

React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`). The sand is drawn with the Canvas 2D API and a typed array, with no other libraries. Suggested file: `components/sand-timer/sand-timer.tsx`, named export `SandTimer`, plus an exported `SandTimerProps` interface.

## API

- `seconds?: number`, default `30`. How long a full top bulb takes to empty. The readout counts down from the same value.
- `autoplay?: boolean`, default `false`. Turns the glass over by itself when the top is nearly empty, until the user presses the button.

## Layout and look

- Card: 340px wide (`max-w-full`), flex column, centred items, `rounded-[28px]`, padding `px-6 pb-6 pt-7`. Light: `#fff` with a 1px ring `rgba(0,0,0,.05)` and shadow `0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e` with ring `rgba(255,255,255,.08)` and shadow `0 20px 40px -26px rgba(0,0,0,.8)`.
- Header row (full width, items baseline, space between): left label 14px medium, `#6e6e73` (dark `#a1a1a6`), reading "Session ends in", or "Session expired" when the time is zero. Right: `m:ss` readout, 22px semibold, tabular numbers, tracking -0.02em, `#1d1d1f` (dark `#f5f5f7`); turns `#ff3b30` (dark `#ff453a`) at zero. The readout has `aria-live="polite"`.
- Glass wrapper: `my-6`, width `70*2 + 24 = 164px`, height `120*2 + 28 = 268px`, relative. This is the element that rotates.
  - Top and bottom caps: full width, 10px tall, `rounded-[5px]`, vertical gradients (top cap `#e8e8ed` to `#c7c7cc`, bottom cap `#d2d2d7` to `#aeaeb2`; dark `#48484a` to `#3a3a3c` and `#3a3a3c` to `#2c2c2e`), with small drop shadows.
  - Two side rails: 3px wide, `rounded-full`, 4px in from each edge, from top 8px, height `100% - 16px`, horizontal gradient `#d2d2d7` to `#aeaeb2` (dark `#48484a` to `#3a3a3c`).
  - Canvas: positioned at left 12px, top 14px, intrinsic size 70 by 120 pixels, displayed at 140 by 240 CSS px (2 CSS px per cell, `image-rendering` left default so the grains look soft). CSS `filter: contrast(1.04) saturate(1.05)` and a `clip-path: path()` of the glass outline inset by 0.7 cells.
  - SVG overlay at the same position and size, `pointer-events: none`: the glass outline filled `rgba(160,190,220,.06)` with a 1.4px stroke `rgba(0,0,0,.18)` (dark stroke `rgba(255,255,255,.28)`), plus a highlight path inset by 0.55 cells, 2px round stroke, `rgba(255,255,255,.75)` (dark .5), dash `34 400`, dash offset -18, so it reads as a short glint on the left side.
- Buttons row (full width, gap 8px): "Stay signed in", `h-11`, flex-1, fully rounded, 15px semibold white on `#0071e3` (dark `#0a84ff`); "Sign out", `h-11`, `px-4`, fully rounded, 15px medium, `#1d1d1f` on `#f0f0f3` (dark `#f5f5f7` on `#2c2c2e`). Focus-visible: 2px ring in the blue, 2px offset on the primary button (offset colour `#1c1c1e` in dark).
- After the first flip, a 12px note under the buttons, `mt-3`, `#86868b` (dark `#98989d`): "Turned over N×. The time that had fallen is yours again."

## The glass shape

The glass is symmetric about its middle row. Grid: 70 columns by 120 rows, `MID = 60`, neck width 2 cells. Half-width at row y: let `t = |y + 0.5 - 60| / 60`; `w = 1 + (34 - 1) * t^0.55`; if `t > 0.86`, multiply `w` by `sqrt(max(0, 1 - ((t - 0.86) / 0.16)^2))` to round the ends. A cell (x, y) is inside the glass when `|x + 0.5 - 35| <= w(y)`. The SVG outline is traced from the same function: for y from 0 to 120 take left x = `(35 - (w + 0.5 - inset)) * 2`, then walk back up the right side; clamp the width to at least 0.6.

## Sand simulation (keep these numbers)

- Sand colours: pick per grain from `0xd9b47c, 0xd6b078, 0xdcb880, 0xd3ac73, 0xdab67e` (a narrow warm palette). Use a small seeded random generator (mulberry32, fixed seed) created in the effect, so the first frame is identical every load; never call `Math.random` during render.
- Initial fill: every inside cell with row `y < 59` and `y > 120 * 0.08` gets a grain. Count them as `total`.
- Per frame: `dt = min(0.05, elapsed)`. A token bucket feeds the neck: `tokens = min(4, tokens + dt * total / seconds)`. This is what ties the fall rate to the stated duration.
- Run two passes per frame. In each pass scan rows bottom-up from row 118 to 0; the column direction alternates by `(y + tick + pass) % 2` (left to right or right to left) to avoid drift bias. For each grain try, in order: straight down; diagonal down on a random side; diagonal down on the other side. A move needs the target to be inside the glass and empty. Any move out of row 59 (the neck row) costs one token and is refused when `tokens < 1`; on success also set a `flowing = 6` counter.
- The readout is `ceil(grainsInTop / total * seconds)` where the top is rows 0 to 59, sampled every 200ms.
- Rendering: write pixels into an `ImageData` through a `Uint32Array`. Skip grains in free fall (below the neck, within 3 columns of the centre, with an empty cell beneath) and draw them as a stream instead. Shade: a grain with empty space above is lightened by +26 on each channel (blue +26*0.8); a grain with sand 4 rows above is darkened by -10. While `flowing > 0`, decrement it and draw one thread with `fillRect(34.25, 59, 1.5, length)` in `rgba(214,176,120,.95)`, ending where the pile below starts.

## Motion: turning the glass

Pressing "Stay signed in" calls `flip()`: ignore if already flipping; pause the simulation; animate the glass wrapper's `rotate` to 180 with a spring (stiffness 140, damping 16); then rotate the grid by 180 degrees in memory (cell (x, y) moves to (69 - x, 119 - y)), set the wrapper's rotation back to 0 with no animation (the glass is symmetric, so the swap is invisible), resume the simulation, and increment the flip counter. The note under the buttons fades and rises in from `y: 4`. The primary button scales to 0.96 on tap.

## Lifecycle and performance

- Paint one static frame on mount, then run a `requestAnimationFrame` loop.
- Pause the loop when the canvas is off screen (IntersectionObserver) and when `document.hidden` is true; resume by resetting the last timestamp so no time jump occurs.
- Cancel the frame, disconnect the observer and remove the listener on unmount. If the component unmounts while a flip is awaiting, do nothing afterwards.
- If `seconds` changes, refill the glass and restart.

## Autoplay demo

With `autoplay`, check every 1500ms: if the top holds less than 45% of the original grains, flip the glass. The check stops permanently once the user presses the button. With `prefers-reduced-motion`, autoplay is disabled, and a manual flip swaps the sand without the rotation animation. The sand itself keeps running, because it is the timer.

## Accessibility

Both buttons are native buttons with visible focus rings. The canvas and SVG are `aria-hidden`. The readout is a polite live region.

## Acceptance checklist

- Sand visibly falls through a thin neck as a single thread, and piles into a cone below.
- A full glass takes about `seconds` seconds to empty, and the readout reaches 0:00 at about the same time.
- The readout turns red and says "Session expired" at zero.
- "Stay signed in" rotates the glass 180 degrees with a springy overshoot, and the fallen sand ends up on top with no visible jump.
- Pressing during a flip does nothing.
- The simulation stops using CPU when scrolled off screen or the tab is hidden.
- The first frame looks identical on every reload.
- Light and dark themes both read well; the sand colour is the same in both.
- With `autoplay`, the glass turns itself over each time it runs low until a user presses the button.
