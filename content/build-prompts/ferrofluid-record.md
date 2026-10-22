# Ferrofluid Record

Build a voice-note record button drawn as a glossy drop of black ferrofluid on a canvas. A magnet seems to follow your cursor: the drop leans toward it and grows soft spikes pointing at it. Press the drop to "record" and the whole surface bristles in time with a simulated voice; press again and the spikes melt back into a smooth bead and a small voice-note pill drops into a list. The feel is liquid, magnetic and tactile, on an otherwise clean Apple-like page.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`) for the button, pills and icon swaps, and a plain 2D `<canvas>` for the drop (no canvas library).
- File: `components/ferrofluid-record/ferrofluid-record.tsx`, named export `FerrofluidRecord`, plus exported `FerrofluidRecordProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `autoplay` | `boolean` | `false` | Moves a pretend magnet around the drop and records a few short notes until someone touches it. Does nothing under `prefers-reduced-motion`. |

The microphone is never opened; the "voice" is a mathematical signal.

## Layout and look

- Root: column, centred, width 340px (`max-w-full`).
- **Stage**: a 300x300 box (`touch-action: none`) holding the canvas (absolute, fills the box, `aria-hidden`) at device pixel ratio capped at 2, and the record button centred on top.
- **Record button**: 92px circle, transparent, centred with `x: -50%, y: -50%` motion values. Idle shows a microphone icon (26px, white, 2px stroke, round caps: a filled 6x11 rounded capsule at x9 y3, an arc below it and a stem). While recording it shows a 20px rounded square (radius 5px) in `#ff453a`. Focus ring 2px `#0071e3` (dark `#2997ff`), 4px offset (white in light, black in dark).
- **Status line**: 24px tall, 14px tabular numerals. Idle: "Tap the drop to record." in `#6e6e73` (dark `#a1a1a6`). Recording: a pulsing 8px `#ff453a` dot and "Recording 0:SS" in `#1d1d1f` (dark `#f5f5f7`). `aria-live="polite"`.
- **Note list**: 12px below, min height 44px, column with 8px gap, at most 3 pills, newest on top. Each pill: full width, fully rounded, padding 8px 16px 8px 12px, gap 12px, background `#f5f5f7` (dark `#2c2c2e`); a 28px round play badge (`#1d1d1f`, dark `#f5f5f7`) with a 10px triangle in the inverse colour; 28 waveform bars, 3px wide, 2px gap, 24px tall row, colour `#1d1d1f` at 70% (dark `#f5f5f7` at 70%); and the duration "0:SS" in 12px tabular `#6e6e73` (dark `#a1a1a6`).
- **Drop drawing** (canvas units, centre C = 150, base radius R = 46 at rest, 54 while recording). The drop is black in both themes. Fill: radial gradient from (cx - 0.35R, cy - 0.45R) with stops `#3a3a3e` at 0, `#121214` at 0.45, `#000` at 1 (outer radius 1.6R). Clipped to the shape, add a window reflection (radial white at 55% fading to 0, radius 0.55R at (cx - 0.42R, cy - 0.5R)) and a rim light (radial from 0.7R to 2.2R, transparent to `rgba(160,175,200,.35)`). Outline 1px white at 8%. Floor shadow: a flattened ellipse (vertical scale 0.22) centred 34px below the bottom of the drop, radial from `rgba(0,0,0,.28)` to 0.
- **Theme**: watch the `dark` class on `<html>` with a MutationObserver. In dark mode the floor shadow becomes a faint light glow (white 7%), the rim light rises to 50% and the outline to 22% so the black drop still reads on a black page.

## Motion

Simulation advances in fixed 60 Hz steps (accumulate frame time, cap 4 steps per frame) so it behaves the same on 60 and 120 Hz screens; drawing happens once per frame.

State: 26 spikes at angles `i/26 * 2pi` (plus a tiny sine jitter) each with a height `h[i]` and velocity `hv[i]`; drop radius `R` with velocity `Rv`; centre `(cx, cy)`; time `t`; voice `level`.

Per step:
- Voice (only while recording): `phrase = sin(2.1t) * 0.5 + 0.5`; `syllable = 0.45 + 0.55 * |sin(9.7t) * sin(5.3t)|`; `voice = max(0, phrase) * syllable`. `level += (voice - level) * 0.25`.
- Radius spring: `Rv += (targetR - R) * 0.08 - Rv * 0.25; R += Rv`.
- Magnet pull: with pointer at distance `md` from centre, `pull = clamp(1 - (md - R) / 170, 0, 1)` (0 when the pointer is outside the stage). The centre eases toward `C + unit-vector-to-magnet * 7 * pull` at 10% per step.
- For each spike: `align = max(0, cos(angle difference to the magnet direction))^3`; `noise = 0.5 sin(3t + 2.17i) + 0.5 sin(7.1t + 0.73i)`; `target = align^1.5 * pull * 64 + level * (24 + 14 * noise) + (recording ? 7 : 0)`; then a damped spring `hv += (target - h) * 0.12 - hv * 0.22; h += hv`.

Shape: sample 360 points around the circle; the radius at angle phi is `R + sum over spikes of max(0, h[i]) * (1 - d/W)^2.4` where `d` is the angular distance to spike `i` and `W = (2pi / 26) * 1.6` (only when `d < W`). Join the points into a closed path and fill.

Other motion: the button has `whileTap` scale 0.9; the mic and stop icons swap with a scale pop (stop also rotates from -45 to 0); new pills enter from `y: -12, scale: 0.9, opacity: 0` and the list uses `layout`; each waveform bar animates its height from 2px to `4 + |sin(1.7k + seconds)| * 16` px with a spring (stiffness 400, damping 20) and a delay of 12ms per bar.

## Interaction and states

- Pointer moving over the stage sets the magnet to the pointer position (scaled into 300x300 canvas space) and marks the component as touched; leaving the stage switches the magnet off so the spikes relax.
- Clicking the button toggles recording. Starting resets the timer to 0 and counts seconds with a 1s interval. Stopping stores a note with `max(1, seconds)` and keeps only the latest 3, each with a stable incrementing id.
- Keyboard: the button is focusable and works with Enter/Space; spikes then respond only to the recording voice.
- Off screen (IntersectionObserver) or hidden tab (`visibilitychange`): cancel the animation frame; resume when visible again, resetting the frame clock so there is no jump. Cancel everything on unmount.

## Autoplay demo

Unless the user prefers reduced motion, every 50ms increment a counter k: the magnet orbits at `(150 + cos(0.35k) * 110, 150 + sin(0.455k) * 90)`, switched on for k mod 60 < 40; recording starts at k mod 60 = 40 and stops at 58, adding a "0:01" pill. Any pointer movement over the stage or a button click stops the demo for good. Ticks are skipped while off screen.

## Accessibility

- Button: `aria-pressed={recording}`, `aria-label` "Record a voice note" or "Stop recording".
- Canvas and waveform bars are `aria-hidden`; the status line is a polite live region.

## Acceptance checklist

- At rest the drop is a smooth black bead with a window reflection and a soft shadow below it.
- Moving the cursor near it grows spikes toward the cursor and nudges the bead a few pixels that way; moving away relaxes them smoothly with a slight wobble.
- Pressing the button swells the drop slightly and makes all spikes bristle irregularly, in bursts, like speech.
- Pressing again melts the spikes smoothly, shows the mic icon again and adds a pill with a waveform and duration.
- Never more than 3 pills; the newest is on top and animates in.
- Simulation speed is identical on 60 Hz and 120 Hz displays.
- The canvas stops drawing off screen and in a hidden tab.
- Readable in light and dark themes; the drop stays black and the microphone is never requested.
