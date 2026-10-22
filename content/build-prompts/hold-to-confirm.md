# Hold to Confirm

Build a destructive "Hold to Delete" pill you must press and hold. A fill sweeps left to right while you hold, revealing a white "Keep holding…" label; letting go early springs it back. Finishing collapses the pill into a circle with a drawn tick and a particle burst, and an undo toast with a countdown ring slides up. It should feel deliberate and physical: linear while you commit, springy when you let go.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`).
- File: `components/hold-to-confirm/hold-to-confirm.tsx`, named export `HoldToConfirm`; export `HoldToConfirmProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `"Hold to Delete"` | Resting label (also the button's `aria-label`). |
| `holdingLabel` | `string` | `"Keep holding…"` | Label revealed by the fill. |
| `doneLabel` | `string` | `"Project deleted"` | Toast text after confirming. |
| `holdMs` | `number` | `1500` | Time a full hold takes, in ms. |
| `color` | `string` | `"#ff3b30"` | Fill, resting text, done background, focus outline and particle colour. |
| `onConfirm` | `() => void` | — | Called once a hold completes. |
| `onUndo` | `() => void` | — | Called when Undo is pressed before the countdown runs out. |
| `autoplay` | `boolean` | `false` | Shows a short hold-and-release tease until someone interacts. |

## Layout and look

- Root: vertical flex, centred, 24px gap. CSS variables: track `#e8e8ed` / dark `#3a3a3c`; ink `#1d1d1f` / dark `#f5f5f7`.
- Button row: 58px tall, centred, `position: relative` (particles are positioned in it).
- Button: 58px tall, 300px wide (58px when done), fully rounded, `overflow: hidden`, 17px semibold, tracking −0.01em, text in `color`. Background = track variable, switching to `color` when done with a 0.35s CSS background transition. `touch-action: none`, `user-select: none`.
- Fill: absolute full-size span in `color`, `transform-origin: left`, `scaleX = progress` (0–1).
- Labels: two absolutely stacked, centred rows with 8px gap and a 17px trash icon (2px stroke, round caps: `M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3`). Top: icon + `label` in `color`. Over it: icon + `holdingLabel` in white, clipped with `clip-path: inset(0 R% 0 0)` where `R = (1 − clamp(progress, 0, 1)) × 100` — so white text appears exactly where the fill is.
- Done tick: centred 24px check `M5 12.5l4.5 4.5L19 7.5`, white, stroke 2.8, round caps and joins.
- Particles: 14 dots, 8px, centred on the button. Dot i: angle `(i/14)·2π + 0.2`, radius `60 + (i mod 3)·18` px, target `(cos·r, sin·r)`. Every third dot (i mod 3 = 0) uses the ink colour, the rest use `color`.
- Below: a 52px-tall centred slot. Idle hint: "Press and hold. Let go early to cancel." 13px, `#86868b` / dark `#98989d`.
- Toast: 52px tall, fully rounded, bg `#1d1d1f` / dark `#3a3a3c`, white 15px medium, padding left 20px, right 8px, 14px gap, shadow `0 18px 40px -18px rgba(0,0,0,.45)`. Inside: the text and an Undo button — 38px tall, fully rounded, white/15% (hover 25%), padding left 8px right 14px, semibold, 8px gap, with a 22px countdown ring (circle r 8, stroke 2.2; track white/25%, progress white with round cap; SVG rotated −90° so it starts at 12 o'clock).

## Motion

- Hold: animate the `progress` motion value toward 1 with **linear** easing and duration `(1 − current) × holdMs`, so re-pressing mid-way continues at the same speed.
- Release early: stop the tween and spring `progress` to 0 (stiffness 260, damping 22). The overshoot can dip below 0; the clip formula clamps it.
- Resting label opacity is mapped from progress `[0, 0.03] → [1, 0]` — it vanishes the instant the fill starts.
- Press feedback: `whileTap` scale 0.97 (not when done).
- Complete: width 300 → 58 with spring stiffness 260, damping 24; background fades to `color`. The label group exits to `opacity 0, scale 0.8` in 0.15s.
- Tick: scales 0.4 → 1, spring stiffness 500, damping 16, delay 0.15s; its path draws `pathLength 0 → 1` in 0.4s after 0.25s.
- Particles: from `x 0, y 0, opacity 1, scale 1.2` to their target, `opacity 0, scale 0.2`, 0.85s, ease `[0.16, 1, 0.3, 1]`, delay 0.15s.
- Hint ↔ toast: `AnimatePresence mode="wait"`. Toast enters from `y 24, opacity 0, scale 0.9` with spring stiffness 320, damping 24, delay 0.25s; exits to `y 12, opacity 0, scale 0.95`. Hint simply fades.
- Countdown ring: `pathLength` animates to `left / 5` over 1s linear each second (starting at 1), so it drains smoothly.

## Interaction and states

- Pointer down with the primary button starts the hold; pointer up, leave or cancel releases. Block the context menu (long-press on touch).
- Keyboard: Space or Enter keydown starts the hold (`preventDefault`, ignore auto-repeat); keyup releases.
- Completion fires only if still holding when the tween finishes: set done, reset the countdown to 5, call `onConfirm`. Pressing while done does nothing.
- Countdown: while done, decrement `left` once per second down to 0. At 0 the toast reads "Deleted for good" and the button reads "Replay".
- Undo/Replay: if `left > 0` call `onUndo`; then clear done and set progress to 0, which springs the pill back to 300px and brings the hint back.

## Autoplay demo

When `autoplay` is true: after 1200ms, and then every 4200ms, run a tease — animate progress linearly to 0.6 (same speed as a real hold) and, 1100ms later, release it so it springs back. A tease never confirms. A real press stops all future teases; if it lands mid-tease it takes over from the current progress and continues to 1.

## Accessibility

- Native `<button type="button">` with `aria-label={label}`, 2px focus-visible outline in `color`, offset 4px.
- Toast has `role="status"`; Undo has a white focus-visible outline. Icons and particles are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Starting a real hold plays `charge` at 70% volume (one soft triangle sweep rising from 220 to 880 Hz over about half a second). Completing the hold plays `done` (a soft four-note rising triangle arpeggio, C5 E5 G5 C6, 40ms apart, ringing out for about 0.6s). Letting go early, after the fill has passed about 10%, plays `hush` at 70% (a sine sliding down from 520 to 180 Hz over about 0.35s with a faint low-passed hiss); a release before that is silent. Pressing Undo or Replay plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). The autoplay tease is silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Holding for 1.5s fills the pill left to right at constant speed, revealing white "Keep holding…".
- [ ] Releasing at half springs the fill back with a slight overshoot; pressing again resumes from where it is.
- [ ] Space/Enter hold works the same as the mouse.
- [ ] Completion shrinks the pill to a 58px red circle, draws a tick and bursts 14 dots outward.
- [ ] A toast slides up with "Project deleted" and an Undo ring that drains over 5 seconds.
- [ ] Undo calls `onUndo` and restores the pill; after 5s it says "Deleted for good" / "Replay" and Replay doesn't call `onUndo`.
- [ ] With `autoplay`, the fill teases to 60% and back every 4.2s and never confirms.
