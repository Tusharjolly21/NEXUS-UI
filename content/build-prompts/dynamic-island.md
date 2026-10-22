Build a phone-style "dynamic island": a black pill at the top of a screen that grows into whatever is happening, a running timer, the song that is playing, or an incoming call. Every change stretches it: the width shoots out first and the height catches up a beat later on a looser spring, with a quick vertical squash, so the pill bulges and settles into its new shape like liquid. Tap it to open live controls; tap again, tap outside or press Escape to tuck it away.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`AnimatePresence`, `animate`, `motion`, `useMotionValue`, `useReducedMotion`, `Transition`).
- File: `components/dynamic-island/dynamic-island.tsx`, named export `DynamicIsland`, types `DynamicIslandProps`, `IslandState = "idle" | "timer" | "music" | "call"`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `state` | `IslandState` | — | Controlled activity. |
| `defaultState` | `IslandState` | `"timer"` | Starting activity when uncontrolled. |
| `onStateChange` | `(state: IslandState) => void` | — | Called when it asks to change (stop, decline, cycle). |
| `timerSeconds` | `number` | `300` | Real countdown length. |
| `accent` | `string` | `"#ff9f0a"` | Timer and music bars colour. |
| `cycle` | `number` | `0` | Uncontrolled: step through `states` every N ms (paused while open). 0 = off. |
| `states` | `IslandState[]` | `["timer", "music", "call"]` | Visited by cycle and autoplay. |
| `track` | `{ title: string; artist: string }` | Midnight Drive / Harbor Lights | Music activity. |
| `caller` | `string` | `"Ava Lin"` | Call activity. |
| `autoplay` | `boolean` | `false` | Uncontrolled: morphs, opens and closes each activity until touched. |
| `className` | `string` | `""` | Outer wrapper classes. |

## Layout and look

- Outer: `relative inline-flex`, centred, max-width 100%, `min-width: min(currentWidth, 352)`.
- Pill: black, white text, overflow hidden, shadow `0 14px 30px -12px rgba(0,0,0,.55)` (dark adds a `0 0 0 1px rgba(255,255,255,.12)` ring and `.9`). Radius 22 compact, 44 open. Sizes (w × h): idle 126×37; compact timer 214×37, music 214×37, call 236×37; open timer 352×88, music 352×164, call 352×88. Idle never opens.
- Compact content (a full-size button, padding 14px sides, space-between):
  - Timer: 24px circle with accent at 18% (`{accent}2e`) and a 14px stopwatch icon in accent; right, "4:59" 15px semibold tabular, tracking −0.02em, accent.
  - Music: 24px square art (radius 7) with `conic-gradient(from 200deg, #ff9f0a, #ff375f, #bf5af2, #0a84ff, #ff9f0a)`; right, equaliser bars in accent.
  - Call: green phone in a 24px circle (`#30d158` on 20% green) plus the caller name 13px medium; right, green bars.
- Bars: five 3px rounded bars, 16px tall, gap 3, heights `0.55, 1, 0.7, 0.9, 0.5`.
- Open timer (padding 20px sides): left, two 44px round buttons gap 10: pause/play (accent at 22% bg, accent icon) and stop (white/15). Right, "Timer" 13px medium accent and the time at 38px light, tabular, tracking −0.03em, accent.
- Open music (padding 20, column, space-between): row with 56px art (radius 14, shadow `0 6px 18px -6px rgba(255,55,95,.7)`), title 15px semibold, artist 13px white/60 (both truncate) and bars; progress row 11px tabular white/60 "1:12", a 4px track white/15 with a white fill, "3:48"; controls row (gap 24): previous, play/pause (24px icon), next, each a 36px button.
- Open call (padding 20, gap 12): 44px avatar with initials (15px semibold) on `linear-gradient(135deg, #0a84ff, #bf5af2)`, "mobile" 12px white/60 over the name 16px semibold; right, Decline (`#ff3b30`, phone icon rotated 135°) and Accept (`#30d158`), 44px each.
- Round buttons: focus ring 2px white/80; `stopPropagation` on click.
- Demo stage: a 400×300 "lock screen", radius 44, gradient `160deg #cfe0ff → #efdcff 55% → #ffe0d2` (dark `#16203d → #22163a → #2d1b19`), status bar "9:41", date and a 64px clock; the island sits 12px from the top.

## Motion

- Size: width spring stiffness 420, damping 30, mass 0.9; height and radius spring stiffness 260, damping 19, mass 0.9 with a 0.04s delay. The mismatch is what makes it stretch. Reduced motion: instant.
- Squash: on every state or open change animate `scaleY` (origin top) through `[0.86, 1]` with spring 520/14 so it bounces past 1. Skip under reduced motion.
- Hover (compact, non-idle): scale 1.04.
- Content swap: `AnimatePresence mode="popLayout" initial={false}`, keyed per view. Enter from `opacity 0, scale 0.9, blur(6px)` to rest with delay 0.1 and spring 320/26; exit to `opacity 0, scale 0.94, blur(6px)` in 0.12s. Reduced motion: opacity only.
- Bars: each animates `scaleY` through `[0.4h, h, 0.55h, 0.9h, 0.4h]` over `0.9 + i·0.13` s, easeInOut, forever; idle `scaleY 0.5h` when paused or reduced.
- Music progress: width 34% → 62% linearly over 40s while playing (0.2s back when paused).
- Buttons `whileTap` scale 0.86, spring 500/22.

## Interaction and states

- The countdown really ticks: compute remaining from an end time every 250ms while the timer state is active and running; at 0 it loops back to the full length. Resetting `timerSeconds` restarts it. Format `m:ss` with `ceil`.
- Tap compact: open. Tap the open pill background: close. Pointer down outside or Escape: close.
- Timer: pause/resume toggles running; Stop resets, closes and requests `idle`. Music: play/pause toggles; previous/next do nothing. Call: Decline requests `idle`; Accept closes.
- Any state change collapses the island (adjust during render). Controlled mode only calls `onStateChange`.

## Autoplay demo

Uncontrolled only. Every 1700ms run a three-beat loop: open, close, then advance to the next state in `states`. Any pointer down or key inside stops it permanently.

## Accessibility

- Pill `role="group"` with a live label: "Timer, 4:59 left", "Now playing {title} by {artist}", "Incoming call from {caller}", or "Dynamic island". The compact button is labelled "{label}. Open controls" with `aria-expanded={false}` and an inset white focus ring.
- Every control has an `aria-label`: Pause timer / Resume timer, Stop timer, Previous track, Pause / Play, Next track, Decline, Accept. Icons are `aria-hidden`.

## Acceptance checklist

- Changing activity stretches the pill width-first, then height, with a small vertical bounce.
- The timer counts down in real time and loops at zero.
- Tapping opens the right controls; tapping again, outside or Escape closes.
- Stop and Decline return to the small idle pill and fire `onStateChange("idle")`.
- Music bars dance while playing and rest when paused.
- `cycle` steps through states when closed; autoplay opens, closes and advances until touched.
- Reduced motion removes the squash, blur and springs.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Tapping the compact pill to open its controls plays `pop` from `@/lib/ui-sounds` (a short rising blip, low to high, like a bubble) at reduced volume; tucking it away again (tap on the island, Escape or a tap outside) plays the same `pop` at a quieter level. Stopping the timer or declining the call, which sends the island back to idle, plays `whoosh` (a soft band of filtered noise sweeping from low to high) at reduced volume.
- Autoplay plays the same `pop` sounds when it opens the pill (the louder one) and tucks it away (the quieter one), through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The automatic morph to the next activity (`cycle` and autoplay) is silent, as are play/pause, accept and hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
