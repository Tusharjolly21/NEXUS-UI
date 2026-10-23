# Sound Mark

Build a brand mark that sits under a tray of water with a vibrating rod in it. The rod drives a standing ripple, and the ripple bends the mark and the word beside it the way light bends through water. It is drawn with a WebGL fragment shader over a canvas, with a small Web Audio tone you can switch on.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useSpring`, `useReducedMotion`), WebGL 1, Web Audio, an `IntersectionObserver` and the page visibility API.
- File: `components/sound-mark/sound-mark.tsx` plus an `index.ts`. Named exports: `SoundMark` and the type `SoundMarkProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `word` | `string` | `"sound"` | The word set beside the mark. It is drawn into the water, so keep it short. |
| `autoplay` | `boolean` | `false` | Swells, drops ripples and cycles colours and pitch until someone touches it. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout and look

- A stage up to 880px wide with a wide aspect ratio and large radius. The mark (a small speaker glyph with three cut-out bars) and the word are drawn once to an offscreen canvas and uploaded as a texture; the shader samples it through the water's slope, so the lettering wobbles.
- Four colour takes (Rose, Tide, Neon, Paper), each a background gradient, an ink colour and a swatch. Three notes (Low, Mid, High) that set the ring spacing and the tone frequency (110, 220 and 440 Hz).
- Under the stage: a segmented control for the take (with a sliding highlight that uses `layoutId`), a segmented control for the note, and a pill toggle "Tone on / off". The tone is off until you turn it on.
- A shiny metal rod (a small disc with a highlight) marks the source of the waves, with a soft halo.
- Hint line: "Hold the water to turn the note up, tap to drop a ripple, drag the rod to move it."
- Dark mode: the controls and pills use `#2c2c2e` surfaces and `#f5f5f7` text; the stage keeps its own colours.

## Motion

- Height field: a damped radial wave from the rod, a slow two-axis swell, and up to eight dropped ripples that expand and fade. The amplitude is a spring that rises while you hold and settles when you let go.
- Shading from the surface slope: a soft caustic brightening and a specular highlight.
- Holding Space (or pressing and holding the stage) raises the amplitude and, with the tone on, a sine oscillator whose gain follows it. Tapping drops a ripple at that point; dragging the rod moves the source.
- Autoplay: after a short wait it swells and releases, drops ripples, and steps through the takes and notes until the first touch. It only runs while the component is on screen and the tab is visible, and never under reduced motion.
- Off screen the render loop idles and the tone falls silent.

## Accessibility

- The stage is a focusable region with a clear label. Arrow keys move the rod, Space holds the note. The segmented controls are real buttons with `aria-pressed`. The tone toggle is a button with `aria-pressed`.
- Reduced motion: no autoplay and a calmer surface.
