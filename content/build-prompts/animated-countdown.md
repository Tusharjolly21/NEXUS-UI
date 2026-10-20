<!-- Animated Countdown: Motion Kit variant brief -->

> The Animated Countdown page has 2 variants. The original Animated Countdown source is on the page; this brief rebuilds the Motion Kit Split-Flap Board variant.

---

<!-- variant: split-flap-board -->

# Split-Flap Board

Build a station-style split-flap board used as a launch countdown. Each tile flips through its characters one at a time until it lands on its target, so a change ripples across the row with a clatter. Under the countdown sits a status line on the same kind of tiles. The board is a dark slab with a live dot, like a departures board.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.span`, `useReducedMotion`), React `useSyncExternalStore` for the clock.
- File: `components/animated-countdown/split-flap-board.tsx`. Named export `SplitFlapBoard`, exported `SplitFlapBoardProps`.

## API

- `to?: Date | number`: target moment. Default: 2 days 14 h 37 min 9 s after mount.
- `label?: string`, default `"Launch · MK 4.0"`. `liveLabel?: string`, default `"Live"`. `statusLabel?: string`, default `"Status"`.
- `statuses?: string[]`, default `["BOARDING", "ON TIME", "GATE B12", "FINAL CALL"]`. `status?: string`: shown instead (controlled).
- `onComplete?: () => void`: called once when it reaches zero.
- `autoplay?: boolean`, default `false`: rotates the status line. The countdown always runs.
- `className?: string`.

## Layout and look

- Board: column, 16px gap, radius 24px, `#111113`, 20px padding, shadow `0 24px 48px -26px rgba(0,0,0,.6)` (dark adds a `0 0 0 1px rgba(255,255,255,.08)` ring and alpha .9), `max-width: 100%`. Tile size via CSS variables: `--fw: 26px`, `--fh: 40px`, `--ffs: 24px`; at viewport ≤400px `21px`, `34px`, `20px` and 16px padding.
- Header row: space-between, 10px semibold uppercase, tracking 0.2em, `#8e8e93`. Left: `label`. Right: a 6px `#30d158` dot pulsing opacity 1 → 0.3 → 1 over 1.2s forever, 6px gap, `liveLabel`.
- Countdown row: items aligned to the bottom, 8px gap. Four groups (Days, Hrs, Min, Sec): a 2-tile row (more tiles if days exceed 99) above a 9px semibold uppercase label, tracking 0.18em, `#636366`, 6px gap. Between groups a `:` 20px semibold `#48484a` with 26px bottom margin.
- Status block: 1px top border `rgba(255,255,255,.1)`, 16px top padding, 8px gap: caption (same style as the header) and a 10-tile row.
- Tile rows: 3px gap. Tile: `--fw × --fh`, `perspective: 200px`. Halves: each half `--fh / 2` tall, `overflow: hidden`. Top half `linear-gradient(#2c2c2e,#232325)`, radius `5px 5px 0 0`; bottom half `linear-gradient(#202022,#29292b)`, radius `0 0 5px 5px`. Each half holds a full-height glyph box (top: offset 0, bottom: offset `−fh/2`) centring the character, `--ffs`, semibold, `#f5f5f7`, `ui-monospace, 'SF Mono', Menlo, monospace`. A 1px `rgba(0,0,0,.7)` hinge line across the middle.

## Motion

- A flap holds `{ cur, old, n }`, starting `" "`. While `cur !== target`, after `speed` ms set `old = cur`, `cur =` the next character in its set (wrapping) and increment `n`. Countdown digits use set `" 0123456789"` at 60ms; the status uses `" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:"` at 40ms. A target not in the set, or reduced motion, lands in one step.
- Static layers: top half shows `cur`, bottom half shows `old`.
- Falling leaf (keyed by `n`): top half of `old`, origin `50% 100%`, `rotateX` 0 → −90 over `0.9·speed` ms easeIn, backface hidden.
- Rising leaf (keyed by `n`): bottom half of `cur`, origin `50% 0%`, `rotateX` 90 → 0 over `0.9·speed` ms easeOut, delayed `0.45·speed` ms.
- Text is upper-cased, padded with spaces to the row length and cut to it.

## Interaction and states

- Clock: `useSyncExternalStore` returning the current whole second (polled every 250ms), with a server snapshot of `null`. While `null` (server and hydration), every tile targets a space, so nothing mismatches; then the tiles clatter to the digits.
- Remaining = `max(0, floor(to/1000) − now)`, split into days, hours, minutes, seconds, each padded to 2 digits.
- When it reaches 0, call `onComplete` once (again only if `to` moves into the future and back).

## Autoplay demo

With `autoplay` and at least two statuses, advance the status every 4200ms. Pointer down on the board sets `touched`; the next tick clears the interval for good. Without autoplay the first status shows.

## Accessibility

- The countdown row has `role="timer"` and `aria-label="<d> days <h> hours <m> minutes <s> seconds remaining"` ("Countdown" before the clock starts). The tiles and labels are `aria-hidden`.
- The status text is repeated in an `sr-only` `aria-live="polite"` span.
- Reduced motion: tiles land in one flip and the live dot stops pulsing.

## Acceptance checklist

- [ ] Each second, the seconds tiles flip through the digits up to the new value; a change from 59 to 00 rolls through the wrap.
- [ ] Each flip shows the old top half falling and the new bottom half rising after it.
- [ ] Status changes ripple across 10 tiles letter by letter.
- [ ] No hydration warning; tiles start blank and clatter in after mount.
- [ ] `onComplete` fires once at zero.
- [ ] Fits without horizontal overflow at 360px viewport width.
- [ ] In dark mode the board keeps its colours and gains a faint ring.
