# Particle Reveal

Build a headline made of thousands of dots. They start scattered across the stage, gather into the letters on springs with a slight delay each, and the cursor pushes them aside and combs them into streaks. Click to blow the word apart and watch it form again.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion.button` with `whileTap`) and one `<canvas>`. `cn` for class merging.
- File: `components/particle-reveal/particle-reveal.tsx` plus an `index.ts`. Named exports: `ParticleReveal` and `ParticleRevealProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `text` | `string` | `"Reveal"` | The word to draw. Short words read best. |
| `color` | `string` | `"#3a3a3c"` | Colour of the dots. |
| `particleSize` | `number` | `1` | Radius of each dot in px. |
| `density` | `number` | `3.2` | Sampling step in px; lower is denser (clamped 2 to 8). |
| `dispersion` | `number` | `1` | How far the dots start from the letters, as a fraction of the stage. |
| `hoverRadius` | `number` | `70` | Radius around the cursor that pushes dots, in px. |
| `hoverForce` | `number` | `1` | Strength of the push. |
| `autoplay` | `boolean` | `false` | A ghost cursor combs the word and it bursts and re-forms every few seconds, until a real pointer arrives. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout and look

- A column: a 300px-tall stage button (`w-full`, radius 24px, white, a hairline ring and a soft shadow, `cursor-crosshair`) and a 12px caption below ("Sweep the cursor through the word. Click to blow it apart." then "Watch it gather again.").
- The stage is a real `<button>` with an `aria-label` that describes the action, and the word in an `sr-only` span so assistive tech and search engines still read it.

## How it works

- Sample the word: draw it in an offscreen canvas at weight 500 in the system sans, sized to `min(height * 0.5, width * 0.9 / (letters * 0.55))` and shrunk to fit 88% of the width, read the pixels and keep every `density` px where alpha > 128. Each kept point is a target.
- Each particle has a position, velocity, target and a wake time. Scatter places each at a random angle and distance (0.25 to 1 of `max(w, h) * 0.6 * dispersion`) from the centre and sets its wake time to `clock + random(0.9s)`, so they set off a moment apart.
- Every frame: after its wake time a particle is pulled to its target (stiffness 60). Within `hoverRadius` the cursor pushes it away with `(1 - d/R) * 5200 * hoverForce`, plus the cursor's smoothed velocity times `(1 - d/R) * 9`, so dots are swept along the stroke. Integrate with `v = (v + f*dt) * 0.004^dt`.
- Click: add a velocity burst away from the centre to every dot and reset the wake times.
- Draw every dot as a small square with `fillRect` in one pass. Use typed arrays, no React state per particle.
- Autoplay: after 2.2s a ghost cursor sweeps left and right through the word, and every 6s the word bursts and re-forms. A real pointer ends it.
- Pause while off screen. Under reduced motion draw the finished word and skip the scatter.

## Accessibility

- Focus ring on the stage button. Reduced motion shows the word at rest.
