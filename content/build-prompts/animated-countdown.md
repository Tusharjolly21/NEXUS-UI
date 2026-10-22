<!-- Animated Countdown: Motion Kit variant brief -->

> The Animated Countdown page has 4 variants. The original Animated Countdown source is on the page; this brief rebuilds the three Motion Kit variants: Split-Flap Board, Watch Countdown and Fuse Countdown.

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

---

<!-- variant: watch-countdown -->

# Watch Countdown

Build a countdown drawn as four concentric watch rings: days, hours, minutes and seconds each empty around their own track, with a glowing bright head on the tip of every ring. The time in the middle rolls digit by digit. Pointing at a ring (or focusing its readout underneath) dims the other rings and names the one you are on. It sits on a dark card in both light and dark mode.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.span`, `AnimatePresence`, `useInView`, `useReducedMotion`), React `useSyncExternalStore` for the clock. Inline SVG, no other dependencies.
- File: `components/animated-countdown/watch-countdown.tsx`. Named export `WatchCountdown`, exported `WatchCountdownProps`.

## API

- `to?: Date | number`: target moment. Default: 12 days 7 h 43 min 21 s after the clock first reads on the client.
- `title?: string`, default `"Nexus 3.0 ships in"`.
- `className?: string`.
- There is no `autoplay`: the countdown is live by itself.

## Layout and look

- Card: `w-[360px] max-w-full`, column, centred, radius 30px, background `#0b0b0d`, text white, padding 24px (16px sides at viewport 400px or less), top 24px, bottom 28px. Shadow `0 30px 60px -30px rgba(0,0,0,.6)`; in dark mode add a `0 0 0 1px rgba(255,255,255,.08)` ring and use alpha .9.
- Title: 13px medium uppercase, tracking 0.16em, `rgba(255,255,255,.5)`.
- Ring box: 16px below the title, 300 x 300 (`max-width: 100%`), square. An SVG with `viewBox="0 0 300 300"` rotated -90 degrees so progress starts at 12 o'clock. Centre 150,150. Stroke 16, gap 5 between rings. Ring `i` has radius `150 - 8 - i * 21`.
- Rings, outside in: Days `#bf5af2` (max 30), Hours `#5e5ce6` (max 24), Minutes `#0a84ff` (max 60), Seconds `#64d2ff` (max 60). Each ring is a track circle (its colour at stroke-opacity .18) plus a progress circle with round caps and `stroke-dasharray = "<frac * circumference> <circumference>"`, where `frac = min(1, part / max)` and the parts are fractional: days = ms / 86400000, hours = (ms % 86400000) / 3600000, minutes = (ms % 3600000) / 60000, seconds = (ms % 60000) / 1000. So the seconds ring sweeps smoothly.
- Ring head: when `frac > 0.01`, at angle `frac * 2pi` on the ring draw a blurred glow circle (radius 10, ring colour, opacity .9, `feGaussianBlur` stdDeviation 3 via a per-instance filter id from `useId`) and a white core circle (radius 7, opacity .9).
- A transparent circle with stroke width 21 on each ring is the pointer hit area.
- Centre stack (over the rings, `pointer-events: none`): a 11px semibold uppercase label with tracking 0.14em, then the big text 34px semibold, tabular numbers, tracking -0.03em, line height 1.15, then `HH:MM:SS` 15px medium `rgba(255,255,255,.7)`.
- Readout row: 16px below the rings, a 4-column grid with 8px gap. Each cell is a real button: column, centred, radius 12px, 8px vertical padding; the value in 17px semibold tabular numbers in the ring colour (days unpadded, the rest 2 digits) over the unit name in 10px uppercase, tracking 0.12em, `rgba(255,255,255,.45)`.

## Motion

- Digit: a `1.15em x 0.62em` clipped cell. The character is keyed by its value and swapped with `AnimatePresence mode="popLayout" initial={false}`: enters from `y 100%, opacity 0, blur(4px)` to rest, exits to `y -100%, opacity 0, blur(4px)`, spring stiffness 420, damping 32, blur 0.2s.
- Centre label: swapped the same way, enters from `opacity 0, y 4`, exits to `opacity 0, y -4`.
- Idle centre shows label "Remaining" in `rgba(255,255,255,.5)` and the text `<days>d`. Hovering ring `i` shows that ring's name in its colour and its value (days unpadded, others 2 digits).
- Non-hovered rings fade to opacity .35 with a .2s CSS transition.

## Interaction and states

- Clock: `useSyncExternalStore` over a module-level cached timestamp. The server snapshot is `null`, so the server render and the hydration pass show `--` placeholders and empty rings; no `Date.now()` runs during render. While the card is on screen (`useInView`, amount .1) the store ticks every animation frame; off screen, or under reduced motion, it ticks four times a second and skips ticks while the tab is hidden. The cached value is reset when the last subscriber leaves.
- With no `to`, the default target is set once from the first real clock reading (a guarded set-state during render), so it is stable for the life of the card.
- Remaining time is `max(0, to - now)`. Under reduced motion `now` is floored to whole seconds.
- Hover (pointer enter and leave on a ring group or a readout button) and focus and blur on a readout button set the highlighted ring.
- At zero everything reads 0 and the rings are empty.

## Autoplay demo

None. The seconds ring and the rolling digits are the live demo.

## Accessibility

- The ring SVG and the centre text are `aria-hidden`.
- The readout buttons carry `aria-label="<value> <unit>"` and show a visible outline (`outline-2`, offset 2, `#0a84ff`).
- An `sr-only` element with `role="timer"` and `aria-live="polite"` says "<d> days <h> hours <m> minutes left"; it changes once a minute.
- Reduced motion: seconds tick once a second, digits swap without rolling, and the ring fade has no transition.

## Acceptance checklist

- [ ] Four concentric rings, outermost Days, innermost Seconds, each with a glowing head.
- [ ] The seconds ring sweeps smoothly; the others creep.
- [ ] Digits roll up on change; the centre shows `<n>d` over `HH:MM:SS`.
- [ ] Pointing at a ring, or tabbing to a readout, dims the other rings and shows that ring's name and value.
- [ ] No hydration warning; placeholders show until the clock starts.
- [ ] Fits at 320px viewport width without overflow.
- [ ] Looks right in light and dark mode (the card stays dark).

---

<!-- variant: fuse-countdown -->

# Fuse Countdown

Build a launch countdown on a lit fuse. A spark eats along a curling rope fuse at exactly the pace of the clock, spitting sparks and leaving a grey ash line behind it. When it reaches the rocket, the rocket shoots off the top of the card and bursts into fireworks, and the footer announces the launch. A button lights a fresh fuse.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.g`, `motion.path`, `motion.span`, `AnimatePresence`, `useReducedMotion`), inline SVG, `requestAnimationFrame` and `IntersectionObserver`.
- File: `components/animated-countdown/fuse-countdown.tsx`. Named export `FuseCountdown`, exported `FuseCountdownProps`.

## API

- `seconds?: number`, default `24`: how long the fuse burns.
- `title?: string`, default `"Doors open in"`.
- `launchMessage?: string`, default `"Nexus 3.0 is out. Go look."`.
- `onLaunch?: () => void`: called once each time the fuse reaches the rocket.
- `autoplay?: boolean`, default `false`: 4.2 seconds after each launch, relights the fuse by itself, until the Relight button or the card is pressed.
- `className?: string`.

## Layout and look

- Card: `w-[400px] max-w-full`, `overflow: hidden`, radius 28px. Light: white, ink `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, ink `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Header row: baseline-aligned, space-between, 24px side padding and 24px top (16px at viewport 400px or less). Left: the title, 14px medium, `#6e6e73` / dark `#a1a1a6`, or "We're live" after launch. Right: `MM:SS` 30px semibold tabular numbers, tracking -0.03em, followed by `.CC` hundredths in 18px `#6e6e73` / dark `#a1a1a6`.
- Scene: an SVG `viewBox="0 0 380 230"`, full width, auto height, `role="img"`.
- Fuse path: `M 22 168 C 70 168, 60 96, 112 104 S 160 196, 214 170 S 262 110, 300 182`.
- Ash: the same path, stroke `#8e8e93` at opacity .45, width 2, round caps, `stroke-dasharray = "<burnt> <length>"`.
- Rope: the same path, width 5, round caps, stroke a 6x6 diagonal-stripe pattern (rotate 45, rects `#c9a36b` and `#b38a52` half width), `stroke-dasharray = "0 <burnt> <length>"` so only the unburnt part shows.
- Spark head (until launch): a radius-14 radial-gradient glow (`#fff7d1`, `#ffd60a` at .4, `#ff9f0a` to transparent) and a radius-3 `#fffbe6` core, at the burnt point of the path.
- Rocket: group at `translate(318 186)`. Body 16 x 60, radius 4, horizontal gradient `#d2d2d7`, `#ffffff` at .38, `#c7c7cc`, bottom at y 0. Blue band `#0a84ff` 16 x 5 at y -24. Nose cone `M -8 -58 Q -7 -74 0 -84 Q 7 -74 8 -58 Z` and two fins `M -8 -12 L -15 1 L -8 -1 Z` and its mirror, all filled `#1d1d1f` (`#f5f5f7` in dark mode). A launch pad: 44 x 6 rounded rect at y 190, `#e8e8ed` (dark `#3a3a3c`), hidden after launch.
- Sparks and burst particles are rendered from pools of pre-made `<circle>` elements (192 for sparks, 90 for the burst) that are repositioned imperatively each frame; unused circles have radius 0. No HTML strings are injected.
- Footer: row, space-between, 24px side padding and 24px bottom. Left: before launch "The fuse burns at the speed of the clock." 13px `#6e6e73` / dark `#a1a1a6`; after launch the launch message, 15px semibold. The right button: 36px tall, pill, 16px side padding, 13px medium, background `#1d1d1f` with white text (dark: `#f5f5f7` with `#1d1d1f` text), label "Relight" or "Light another" after a launch. Focus: 2px outline offset 2, `#0071e3` (dark `#0a84ff`).
- Per-instance ids from `useId` for the pattern and gradients.

## Motion

- The loop runs on `requestAnimationFrame`. Each frame: `dt = min(0.05, frame delta)`, `elapsed += dt` (capped at `seconds`), `t = elapsed / seconds`. The burnt length is `t * pathLength`; the tip is `path.getPointAtLength(burnt)`; the clock shows `seconds - elapsed`.
- While `t < 1` spawn about 180 sparks per second at the tip: angle `-90deg +/- 75deg`, speed 40 to 150, life .35 to .75s, colour `#ffd60a` (60%) or `#ff9f0a` (40%).
- Particles: position += velocity * dt; `vy += 160 * dt`; `vx *= 0.98`; `life -= dt`. Drawn radius = base (1.6 sparks, 2.6 burst) * `min(1, life * 2)`; opacity `min(1, life * 2)`.
- When `t` reaches 1: set launched and call `onLaunch`. The rocket group animates `y: 0 -> -260` over .75s with cubic-bezier `[.5, 0, .9, .6]`; a flame path `M -5 4 Q 0 60 5 4 Z` in `#ff9f0a` loops `scaleY [.6, 1.2, .8, 1.1]` over .4s.
- .65s after launch (counted in loop time), 90 burst particles fire from (318, 46) at evenly spaced angles, speed 70 to 160, life 1 to 1.6s, colours cycling `#ff375f, #ffd60a, #30d158, #0a84ff, #bf5af2`.
- Launch message enters from `opacity 0, y 8, scale .9` with a .7s delay; footer text swaps with `AnimatePresence mode="wait"`.
- When the burst has died the loop cancels itself until the next relight.

## Interaction and states

- Because time only advances in frames the card draws, the fuse is paused while the tab is hidden. An `IntersectionObserver` (threshold .2) starts the loop when the card is on screen and cancels it when it leaves, so the fuse lights when the card scrolls into view and holds off screen.
- Relight (the button): clears launched, burnt, tip and the clock, bumps a `run` counter that restarts the effect and sets all particle circles to radius 0.
- Pointer down anywhere on the card, or pressing the button, marks the card touched.
- Reduced motion: no sparks, no burst, no flame; the rocket jumps off without flying; the fuse and the clock step once a second; the message appears at once; autoplay is off.

## Autoplay demo

With `autoplay` (and not reduced motion): once launched, wait 4200ms, then relight, unless touched. A relight lights the next fuse, which launches, waits and relights again, indefinitely, until the visitor presses the card or the button. The timer is cleared on unmount.

## Accessibility

- The scene SVG has `role="img"` and an `aria-label` that is "N seconds left on the fuse" and then "The rocket has launched". The big clock is `aria-hidden`.
- The footer message sits in an `aria-live="polite"` region so the launch is announced.
- The button is a real `<button type="button">` with a visible focus outline.

## Acceptance checklist

- [ ] The spark moves along the whole curling fuse in exactly `seconds` seconds and the ash line grows behind it.
- [ ] Sparks fly up and fall from the tip; the rope ahead of the spark is untouched.
- [ ] At zero the rocket flies off the top, then a five-colour burst fires; the footer announces the launch.
- [ ] Relight / Light another restarts a full fuse with clean particles.
- [ ] Scrolling away holds the fuse; scrolling back resumes it.
- [ ] Rocket nose and fins stay visible in dark mode.
- [ ] Fits at 320px viewport width without overflow.
