# Tank Recorder

Build a voice memo button over a glass tank seen from the side. While you hold to record, your (simulated) voice shakes a pin in the water and the surface carries it as real waves that bounce off the glass. The timer sits behind the water, so the part below the line wobbles with the voice. Let go and the memo drops into a list with its waveform.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), inline SVG with a 1D wave simulation stepped in `requestAnimationFrame`.
- File: `components/tank-recorder/tank-recorder.tsx` plus an `index.ts`. Named exports: `TankRecorder` and `TankRecorderProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Records a short simulated take, saves it and repeats until the button is touched. |
| `className` | `string` | none | Extra classes for the card. |

## Layout and look

- Card: 340px wide, `max-width: 100%`, radius 24px, padding 20px, white / dark `#1c1c1e`.
- Tank: radius 18px, background `#f5f5f7` / dark `#2c2c2e`, an inset ring. The SVG draws the water body in the accent colour, the timer digits (large, tight tracking) clipped so they read crisp above the line and tinted below it, and a pin hanging from the top that dips into the water. The wave surface is a clipped path rebuilt every frame from the simulation.
- A round record button (white with a ring, a red dot that turns into a rounded square while recording) below the tank.
- The take list (`aria-label="Voice memos"`): rows with a name, the duration and a small waveform of the recorded levels, newest first, at most three rows. It starts with one saved memo, "Chorus idea" (12s), and new takes are named "Memo 2", "Memo 3" and so on.
- Footnote: "Hold the button and talk. The water carries your voice."

## Motion

- A 1D wave equation over a row of columns with damping and reflecting walls. The pin pushes the column under it by the current (simulated) mic level, which is a smoothed random signal while recording.
- The level also nudges the digits' displacement below the waterline, and the water height rises while recording.
- Holding Space or Enter records too. On release the take is added to the list with its sampled levels and the list items animate in.
- The loop only runs while the card is on screen, or while recording. Autoplay records, saves and repeats; it only runs on screen and never under reduced motion.

## Accessibility

- The record button is a real button with `aria-pressed` and a label that changes with the state; it works with pointer, Space and Enter. The tank SVG is a `role="img"` with a label that changes between "Water tank, still" and "Recording. The water surface moves with your voice."; the button label changes to "Recording. Release to save."
