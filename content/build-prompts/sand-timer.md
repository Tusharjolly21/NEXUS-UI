Build a session-expiry card whose countdown is a real hourglass. Every grain of sand is simulated on a small canvas: it piles, slides off slopes and squeezes through the neck at exactly the rate that empties the top as the time runs out. A "Stay signed in" button turns the glass over. The feel is Apple-like and physical: quiet card, warm sand, a heavy spring on the flip.

## Stack

React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`). Sand is drawn with Canvas 2D and a typed array. Suggested file: `components/sand-timer/sand-timer.tsx`, named export `SandTimer`, plus an exported `SandTimerProps` interface.

## API

- `seconds?: number`, default `30`. How long a full top bulb takes to empty. The readout counts down from the same value.
- `autoplay?: boolean`, default `false`. Turns the glass over by itself when the top is nearly empty, until the user presses the button.

## Layout and look

- Card: 340px wide (`max-w-full`), flex column, centred items, `rounded-[28px]`, padding `px-6 pb-6 pt-7`. Light: `#fff` with a 1px ring `rgba(0,0,0,.05)` and shadow `0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e` with ring `rgba(255,255,255,.08)` and shadow `0 20px 40px -26px rgba(0,0,0,.8)`.
- Header row (baseline, space between): label 14px medium `#6e6e73` (dark `#a1a1a6`), "Session ends in", or "Session expired" at zero. Right: `m:ss` readout, 22px semibold, tabular numbers, tracking -0.02em, `#1d1d1f` (dark `#f5f5f7`); `#ff3b30` (dark `#ff453a`) at zero.
- Glass wrapper: `my-6`, width `70*2 + 24 = 164px`, height `120*2 + 28 = 268px`, relative. This is the element that rotates.
  - Caps: full width, 10px tall, `rounded-[5px]`, vertical gradients (top `#e8e8ed` to `#c7c7cc`, bottom `#d2d2d7` to `#aeaeb2`; dark `#48484a` to `#3a3a3c` and `#3a3a3c` to `#2c2c2e`), small drop shadows.
  - Two rails: 3px wide, `rounded-full`, 4px in from each edge, top 8px, height `100% - 16px`, gradient `#d2d2d7` to `#aeaeb2` (dark `#48484a` to `#3a3a3c`).
  - Canvas at left 12px, top 14px, 70 by 120 pixels shown at 140 by 240 CSS px, with `filter: contrast(1.04) saturate(1.05)` and a `clip-path: path()` of the glass outline inset 0.7 cells.
  - SVG overlay, same position and size, `pointer-events: none`: the outline filled `rgba(160,190,220,.06)` with a 1.4px stroke `rgba(0,0,0,.18)` (dark `rgba(255,255,255,.28)`), plus a glint path inset 0.55 cells, 2px round stroke `rgba(255,255,255,.75)` (dark .5), dash `34 400`, offset -18.
- Buttons row (full width, gap 8px): "Stay signed in", `h-11`, flex-1, fully rounded, 15px semibold white on `#0071e3` (dark `#0a84ff`); "Sign out", `h-11`, `px-4`, fully rounded, 15px medium, `#1d1d1f` on `#f0f0f3` (dark `#f5f5f7` on `#2c2c2e`). Focus-visible: 2px blue ring, 2px offset.
- After the first flip, a 12px note under the buttons, `mt-3`, `#86868b` (dark `#98989d`): "Turned over N×. The time that had fallen is yours again."

## The glass shape

Grid: 70 columns by 120 rows, `MID = 60`, neck 2 cells. Half-width at row y: `t = |y + 0.5 - 60| / 60`; `w = 1 + 33 * t^0.55`; if `t > 0.86`, multiply by `sqrt(max(0, 1 - ((t - 0.86) / 0.16)^2))`. Cell (x, y) is inside when `|x + 0.5 - 35| <= w(y)`. Trace the SVG outline from the same function: left edge x = `(35 - (w + 0.5 - inset)) * 2` for y 0 to 120, then back up the right side; clamp width to at least 0.6.

## Sand simulation (keep these numbers)

- Sand colours, picked per grain: `0xd9b47c, 0xd6b078, 0xdcb880, 0xd3ac73, 0xdab67e`. Use a seeded generator (mulberry32, fixed seed) created in the effect, so every load is identical; never call `Math.random` during render.
- Initial fill: every inside cell with `9.6 < y < 59` gets a grain; count them as `total`.
- Per frame: `dt = min(0.05, elapsed)`. A token bucket feeds the neck: `tokens = min(4, tokens + dt * total / seconds)`. This is what ties the fall rate to the stated duration.
- Two passes per frame, each scanning rows bottom-up from 118 to 0; column direction alternates by `(y + tick + pass) % 2` to avoid drift. Each grain tries straight down, then diagonal down on a random side, then the other side; the target must be inside the glass and empty. A move out of row 59 (the neck) costs one token and is refused when `tokens < 1`; on success set `flowing = 6`.
- The readout is `ceil(grainsInTop / total * seconds)` where the top is rows 0 to 59, sampled every 200ms.
- Rendering: write pixels into an `ImageData` via a `Uint32Array`. Skip grains in free fall (below the neck, within 3 columns of centre, empty cell beneath) and draw a stream instead. Lighten a grain with empty space above by 26 per channel (blue 26*0.8); darken one with sand 4 rows above by 10. While `flowing > 0`, decrement it and draw one thread, `fillRect(34.25, 59, 1.5, length)` in `rgba(214,176,120,.95)`, ending where the pile below starts.

## Motion: turning the glass

"Stay signed in" runs `flip()`: ignore if already flipping; pause the simulation; spring the glass wrapper's `rotate` to 180 (stiffness 140, damping 16); rotate the grid 180 degrees in memory (cell (x, y) goes to (69 - x, 119 - y)); snap the rotation back to 0 with no animation (the glass is symmetric, so the swap is invisible); resume; increment the counter. The note fades and rises in from `y: 4`. The button scales to 0.96 on tap.

## Lifecycle and performance

- Paint one static frame on mount, then run a `requestAnimationFrame` loop.
- Pause it when the canvas is off screen (IntersectionObserver) or `document.hidden`; on resume reset the last timestamp.
- On unmount cancel the frame and remove the observer and listener; a pending flip does nothing afterwards.
- If `seconds` changes, refill and restart.

## Autoplay demo

With `autoplay`, check every 1500ms: if the top holds less than 45% of the original grains, flip the glass. The check stops permanently once the user presses the button. With `prefers-reduced-motion`, autoplay is disabled, and a manual flip swaps the sand without the rotation animation. The sand itself keeps running, because it is the timer.

## Accessibility

Native buttons with visible focus rings; canvas and SVG are `aria-hidden`; the readout is a polite live region.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Pressing "Stay signed in" plays `tap` as the glass turns (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). When the sand runs out, `done` plays (four soft triangle notes rising as an arpeggio, about C5, E5, G5 and C6, 40ms apart, ringing for about 0.6s), but only if the visitor has pressed the button at least once; a glass that was never touched runs out silently, and so do the autoplay flips. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Sand visibly falls through a thin neck as a single thread, and piles into a cone below.
- A full glass empties in about `seconds` seconds, with the readout reaching 0:00 then and turning red.
- "Stay signed in" rotates the glass 180 degrees with a springy overshoot, and the fallen sand ends up on top with no visible jump.
- Pressing during a flip does nothing.
- The simulation stops using CPU when scrolled off screen or the tab is hidden.
- The first frame looks identical on every reload.
- Light and dark themes both read well; sand colour is the same in both.
- With `autoplay`, the glass turns itself over each time it runs low until a user presses the button.
