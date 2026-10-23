# Morphing Text

Build a keyword that melts into the next one. Two copies of the word sit on top of each other; the outgoing one blurs out while the incoming one sharpens, and an SVG alpha threshold turns the overlapping blur into one liquid shape, so letters flow into new letters instead of cross-fading.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion.button` with `whileTap`) and an inline SVG filter. `cn` for class merging.
- File: `components/morphing-text/morphing-text.tsx` plus an `index.ts`. Named exports: `MorphingText` and `MorphingTextProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `lead` | `string` | `"Interfaces that feel"` | Static line above the word. An empty string hides it. |
| `words` | `string[]` | `["alive.", "tactile.", "physical.", "inevitable.", "yours."]` | The words to cycle. |
| `morphTime` | `number` | `1.1` | Seconds each morph takes. |
| `holdTime` | `number` | `1.6` | Seconds each word rests. |
| `align` | `"left" \| "center" \| "right"` | `"center"` | Alignment of the lead and the word. |
| `color` | `string` | none | Colour of the morphing word. Leave it out for the house blue (`#0a84ff`, readable on light and dark fills); `"currentColor"` inherits. |
| `autoplay` | `boolean` | `false` | Starts cycling on its own. Off, it rests on the first word until Play is pressed. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout and look

- A column with a 24px gap. The heading is `clamp(34px, 3.6vw, 60px)`, weight 600, line-height 1.02, tracking -0.045em, ink inherited from the parent (`text-inherit`, so the wrapper decides: near-black on light fills, near-white on dark ones). The lead is its own block line; the word sits inline under it.
- The word box is `relative inline-block`. An invisible copy of the longest word reserves the width so nothing reflows. Two absolutely positioned spans (`inset-0`) hold the outgoing and incoming words in the chosen colour.
- Below, a 44px pill button, a translucent fill and hairline ring drawn from `currentColor` (`bg-current/10`, `ring-current/15`) with inherited text, so it reads on any fill, with a pause or play glyph and the label "Pause" or "Play" (`aria-pressed`).

## Motion

- Hidden SVG: `<filter>` with `feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"`. Apply it to the word box (`filter: url(#id)`) only while a morph runs, and remove it afterwards so resting text stays crisp. Give the filter a unique id (`useId`).
- One `requestAnimationFrame` loop drives two phases: hold (`holdTime`) then morph (`morphTime`). For fraction `f` of a morph: incoming blur `min(8 / f - 8, 100)` px and opacity `f^0.4`; outgoing blur `min(8 / (1 - f) - 8, 100)` px and opacity `(1 - f)^0.4`. Clamp `f` away from 0.
- When `f` reaches 1 the incoming copy becomes the resting one: write the new words into both spans, clear the filters and opacities, and bump the index.
- Write styles straight to the DOM nodes from the loop, so React does not re-render every frame. Keep the current word in state only for the screen-reader text.
- The loop idles while paused (in the hold phase) and while off screen. Under reduced motion skip the blur and threshold and cross-fade opacity only.

## Accessibility

- The box is `aria-live="polite"` with an `sr-only` span holding the current word; the animated copies are `aria-hidden`. The pause button is a real button with `aria-pressed`.
