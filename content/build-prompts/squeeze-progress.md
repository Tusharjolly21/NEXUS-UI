Build a full-colour progress panel for something like a video export: a big percentage at the top, a thin white line filling left to right through the middle, and a round pause/resume button at the bottom. When paused, the last stretch of the line bunches up into a springy squiggle and the tip pulls back, while the whole panel warms from blue to burnt orange. On resume the squiggle stretches out, the colour cools back and the line carries on. It should feel tactile and elastic.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`useMotionValue`, `useSpring`, `useTransform`, `useMotionValueEvent`, `AnimatePresence`, `motion`).
- File: `components/squeeze-progress/squeeze-progress.tsx`, named export `SqueezeProgress`, exported `SqueezeProgressProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `"#0071e3"` | Panel colour while running. |
| `paused` | `string` | `"#c2410c"` | Panel colour while paused. |
| `autoplay` | `boolean` | `false` | Toggles pause/resume every 2.2 s until the user presses the button. |

## Layout and look

- Panel: 440 × 260 px, `max-width: 100%`, radius 24px, `overflow: hidden`, background is a motion value blending between `accent` and `paused`. All content is white, so the panel looks the same on light and dark pages; no `dark:` styles are needed.
- Percentage: centred, 40px from the top, 44px semibold, tabular numbers, tracking −0.03em, white; followed by a "%" at 22px, 70% opacity, nudged 8px down.
- Line (SVG covering the panel, `aria-hidden`), baseline y = 130, horizontal inset 24px each side:
  - Track: line from x 24 to 416, stroke `rgba(255,255,255,.22)`, 4px, round caps.
  - Progress: path, white, 4px, round caps and joins, no fill.
  - Tip dot: white circle, radius 6, at the tip x, y = 130.
- Bottom group, 32px from the bottom, centred column with 8px gap:
  - Button: 48 × 48 circle, white icon, 2px ring `rgba(255,255,255,.8)`, no fill. `whileTap` scale 0.88. Icon 20 × 20 filled: pause bars (`M7 5h3.5v14H7zM13.5 5H17v14h-3.5z`) while running, play triangle (`M7 4.5v15l12.5-7.5z`) while paused.
  - Status: 13px medium, white at 85%: "Exporting video" or "Paused".

## Motion

- `progress` motion value starts at 0.08. A rAF loop adds `dt·0.06` per second while running (about 16.7 s for a full pass) and wraps to 0 when it reaches 1. The percentage shows `floor(progress·100)`, updated through `useMotionValueEvent` on change.
- `squeeze` is `useSpring(0, { stiffness: 260, damping: 11 })`, set to 1 when paused and 0 when running. The low damping makes it overshoot, so the squiggle wobbles in and out.
- Path, rebuilt from both values (`useTransform(() => …)`):
  - `tip = 24 + progress·392`; bunching length L = 70; `start = max(24, tip − 70)`; `bunchedTip = tip − squeeze·34`.
  - Straight segment `M 24 130 L start 130`, then 40 line segments for `t = i/40`: `x = start + (bunchedTip − start)·t`, `y = 130 + sin(t·9π)·16·squeeze·sin(πt)`. The `sin(πt)` envelope keeps both ends of the squiggle on the baseline.
- Tip dot x = `24 + progress·392 − squeeze·34`, so it pulls back with the bunching.
- Panel colour: `useTransform(squeeze, [0, 1], [accent, paused])`, so it rides the same spring (and briefly overshoots with it).
- Icon swap: `AnimatePresence mode="popLayout"` with no initial animation, keyed by state; enter from `scale 0.4, rotate −60°, opacity 0` to `scale 1, rotate 0, opacity 1`; exit to `scale 0.4, rotate 60°, opacity 0`.

## Interaction and states

- Running: line advances, panel at `accent`, pause icon, "Exporting video".
- Paused: progress frozen, squiggle at full amplitude, tip pulled back 34px, panel at `paused`, play icon, "Paused".
- The button toggles the state and marks the component as touched.
- Near the start (tip less than 70px from x = 24) the squiggle is shorter because `start` clamps to 24.

## Autoplay demo

With `autoplay`, flip running/paused every 2.2 s until the user presses the button; after that the timer does nothing.

## Accessibility

- The percentage element is a `role="progressbar"` with `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow` the shown percentage, and aria-label "Exporting video" or "Export paused".
- The button has aria-label "Pause" or "Resume"; focus-visible outline 2px white with a 4px offset.

## Acceptance checklist

- The line grows left to right from 8% at about 6% per second and loops at 100%.
- Pausing bunches the last 70px of line into roughly four and a half waves, 16px tall, with a visible spring wobble.
- The tip dot and the end of the line pull back 34px while paused and return on resume.
- The panel blends smoothly between `accent` and `paused` on the same spring.
- The percentage freezes while paused and is always an integer.
- Icons swap with a rotate-and-scale pop.
- Autoplay alternates every 2.2 s and stops after a click.
