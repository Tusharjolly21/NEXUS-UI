# Streak Counter

Build a habit-streak card: a flame at the top, a big day count, a strip of the last seven days, and a "Log today" button. Each press rolls the number up, slides the week strip along to make room for a freshly filled "today" dot, and makes the flame squash, stretch and burst into embers that fly out and fall back in. The flame, today's dot and the button all burn a little hotter, from orange toward red, with every day logged. The feel is warm, bouncy and rewarding.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `popLayout`, `layout`, `useAnimationControls`).
- File: `components/streak-counter/streak-counter.tsx`, named export `StreakCounter`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `start` | `number` | `11` | Streak length to start from; the flame heats up over the next eight logged days. |
| `autoplay` | `boolean` | `false` | Logs a day by itself every couple of seconds until the user presses. |

## Heat colour

`heat = min(1, (count − start) / 8)`.

- `outer = hsl(30 − 22·heat, 100%, (56 − 4·heat)%)`: orange `hsl(30,100%,56%)` cooling to red-orange `hsl(8,100%,52%)`.
- `inner = hsl(48 − 10·heat, 100%, (66 + 6·heat)%)`: yellow core getting paler and hotter.

`outer` colours the flame body, today's dot, every second ember and the button; `inner` colours the flame core and the other embers.

## Layout and look

**Card**: 320px wide, centred column, gap 20px, radius 28px, padding 28px top, 24px sides and bottom. Light: `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -30px rgba(0,0,0,.8)`.

1. **Flame**: a 96 × 96 box, content centred, holding the embers and an SVG 72 × 84 (viewBox `0 0 24 28`) with `transform-origin` at its bottom. Two paths:
   - body: `M12 1c1 4.5 6 7.5 6 13.5A6 6 0 0 1 12 21a6 6 0 0 1-6-6.5c0-2.6 1.4-4.4 2.6-5.6.2 1.8 1 3 2.4 3.6C10.6 8.6 11 4.5 12 1z`, fill `outer`;
   - core: `M12 11c.6 2.3 3 3.6 3 6.4A3 3 0 0 1 12 21a3 3 0 0 1-3-3.4c0-1.6.9-2.6 1.6-3.2.2 1 .7 1.5 1.2 1.7-.2-1.9-.1-3.5.2-5.1z`, fill `inner`, origin at its bottom.
2. **Count**: a 60px-tall overflow-hidden slot, the number at 56px semibold, `line-height: 1`, tracking −0.04em, tabular-nums, `#1d1d1f` (dark `#f5f5f7`). Below it "day streak" at 14px medium `#86868b` (dark `#8e8e93`).
3. **Week strip**: full width, overflow hidden, a row with `justify-between` showing the last seven day numbers `count − 6 … count` (newest on the right). Each item is a column (gap 6px): the weekday letter `["M","T","W","T","F","S","S"][d mod 7]` at 11px medium grey, then a 32px circle (overflow hidden) with background `#fff1e0` (dark `#3a2a17`) and a 14px check mark (`M5 12.5l4.5 4.5L19 7.5`, stroke 3, round caps/joins) in `#ff9f0a`. For today (`d === count`), an overlay fills the circle with `outer` and the check turns white.
4. **Button** "Log today": full width, 44px tall, fully rounded, 15px semibold, text `#1d1d1f` in both themes, background `outer`.

## Motion

- **Log** (each press): `count + 1`, `burst + 1`, and run the flame controls: `scale [1, 0.75, 1.25, 1]`, `rotate [0, −6°, 4°, 0]` over 0.7s `easeOut`, pivoting at the flame's base: a squash, a stretch, a wobble.
- **Flicker**: the core loops `scaleY [1, 1.08, 0.96, 1]` over 1.2s, `easeInOut`, forever, from its base.
- **Colour**: both fills animate to their new heat colour over 0.5s; the button background animates too (default transition).
- **Embers**: 16 small dots, precomputed. For ember i: angle `a = −π/2 + (i/16 − 0.5)·1.4π` (a 252° fan opening upward), distance `40 + (i mod 4)·14`, target `x = cos a·dist`, `y = sin a·dist − 10`, size `3 + (i mod 3)·2` px, delay `(i mod 5)·0.02s`. Key them by `burst` so every log re-spawns them. They animate `x [0, x, 0.2x]`, `y [10, y, 18]`, `opacity [1, 1, 0]`, `scale [1, 1.2, 0.3]` over 0.9s with `times [0, 0.45, 1]`, `easeOut`: out and up, then falling back into the flame and shrinking. Before the first log they are invisible.
- **Count roll**: `AnimatePresence mode="popLayout" initial={false}` keyed by count. Enter from `y 50, opacity 0, blur(6px)`; exit to `y −50, opacity 0, blur(6px)`; spring `stiffness 300, damping 24`.
- **Week strip**: items keyed by day number inside `AnimatePresence mode="popLayout" initial={false}`, with `layout` on the row and items. A new day enters from `opacity 0, x 30, scale 0.6`; the oldest exits to `opacity 0, x −30, scale 0.6`; the rest slide left. Spring `stiffness 300, damping 26`.
- **Today dot**: scale `[0.6, 1.15, 1]` over 0.45s when it becomes today; the `outer` overlay fades in (opacity 0 → 1, 0.45s), and the previous day's overlay fades out to reveal the pale tint.
- **Button**: `whileTap` scale 0.95.

## Interaction and states

- State: `count` (starts at `start`) and `burst` (starts at 0). There is no limit and no undo.
- Clicking the button marks the component touched and logs a day.
- Heat saturates after eight logs; further logs keep the hottest colour.

## Autoplay demo

Every 2200ms, log a day, unless the user has pressed the button. Once touched, the interval keeps running but does nothing.

## Accessibility

- The count container has `aria-live="polite"`, so the new number is announced.
- Flame, embers and check marks are `aria-hidden`.
- The button is a `<button type="button">` with a 2px focus-visible outline, offset 2px, `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- At load the card shows an orange flame, "11", "day streak", seven checked days with the rightmost filled orange, and an orange button.
- Pressing "Log today" rolls 11 → 12 upward with a blur, and the flame squashes and stretches.
- Sixteen embers fly up and out in a fan and fall back into the flame within about a second.
- The week strip slides left by one, a new filled "today" dot pops in on the right, and the oldest day leaves on the left.
- After eight presses, the flame, today's dot and the button are clearly redder than at the start, and stop changing after that.
- The inner flame flickers continuously.
- With `autoplay`, a day is logged every 2.2s until the button is pressed.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing Log today plays `success` from `@/lib/ui-sounds` (two soft rising triangle-wave notes, a major third apart, the second ringing slightly longer) as the number rolls and the embers fly.
- The autoplay loop that logs a day by itself is silent, and nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
