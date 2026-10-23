# Ripple Now Playing

Build a music player card whose cover art sits under water. Every beat of the track drops a ring that spreads through the artwork, so the cover pulses in time. Pause and the water goes still; scrub the bar and a ring follows your finger; skip and the new cover slides in.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), and an SVG filter (`feImage` ring map, `feDisplacementMap`).
- File: `components/ripple-now-playing/ripple-now-playing.tsx` plus an `index.ts`. Named exports: `RippleNowPlaying` and `RippleNowPlayingProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Starts playing and skips a track every seven seconds until touched. |
| `className` | `string` | none | Extra classes for the card. |

## Layout and look

- Card: 340px wide, `max-width: 100%`, radius 24px, padding 20px, white / dark `#1c1c1e`, a hairline ring and a soft shadow.
- Cover: a square with a 20px radius made from the track's three colours and a soft shape, with the track title overlaid. Three demo tracks (Low Tide, Glass Floor, Night Swim) with their own gradients and tempos (96, 118 and 84 bpm).
- Under it: the title (20px semibold) and artist (14px muted) on the left and a pill with the tempo on the right.
- A 6px progress bar with the elapsed and total time under it; the thumb-less bar is scrubbed by pointer drag or the arrow keys.
- Controls: previous, a 56px round play/pause button (ink on light, inverted in dark), and next, each at least 44px.
- Footnote: "Every beat ripples the cover. Scrub the bar to stir it."

## Motion

- The cover's displacement filter reads a radial ring map drawn once on a canvas. A pulse expands the ring (scale and strength spring) while the displacement fades, so each beat sends a ring outward from the point it started.
- While playing, the clock advances and a pulse fires on every beat; strong beats on the bar's first beat. Pressing the cover sends a pulse from the point you touched. Pause eases the energy to zero.
- Skipping slides the new cover in from the side of travel (`AnimatePresence` with a direction) and resets the time.
- Autoplay only runs on screen with the tab visible and never under reduced motion; the first touch stops it.

## Accessibility

- Play/pause and skip are labelled buttons. The progress bar is a slider (`role="slider"`, value text as the elapsed time) with Left/Right, Home/End and Space to play or pause.
- Reduced motion: beats stop pulsing and the card is static until you act.
