# Squiggly text (`SquigglyText`)

Stepped **SVG `feTurbulence` + `feDisplacementMap`** on live text — same **control surface** described for the reference component ([Aceternity Squiggly Text](https://ui.aceternity.com/components/squiggly-text): `steps`, `stepDuration`, `scale`, `baseFrequency`, `numOctaves`, `as`). This repo’s code is written from scratch (not a source copy).

## Behaviour

- Builds **`steps`** separate `<filter>` definitions; each uses `feTurbulence` with a different **`seed`**, then displaces **`SourceGraphic`** (your glyphs).
- Every **`stepDuration`** ms, the wrapper’s `filter` URL advances to the next filter (full loop ≈ `steps * stepDuration`).
- **`scale`**: a number (constant displacement) or a **two-number tuple** — displacement magnitude alternates `scale[frame % 2]` per frame index, matching the documented tuple behaviour.
- **`useReducedMotion`**: cycling stops; frame `0` stays active.

## Headline preset

`SquigglyDrinksHeadline` renders the two-line demo copy:

**“How many drinks”** / **“are too many drinks?”** with defaults `steps={5}`, `stepDuration={80}`, `scale={[6, 8]}`, `baseFrequency={0.02}`, `numOctaves={3}`.

## Usage

```tsx
import { SquigglyDrinksHeadline, SquigglyText } from "@/components/squiggly-text";

// Preset lines + defaults
<SquigglyDrinksHeadline className="text-center" textClassName="text-white" />

// Custom lines
<SquigglyText as="div" steps={5} stepDuration={80} scale={[6, 8]} baseFrequency={0.02} numOctaves={3}>
  <span className="block">Line one</span>
  <span className="block">Line two</span>
</SquigglyText>
```

Live demo: **`/demos/squiggly-text`**.

## Installation

Copy `src/components/squiggly-text/` and depend on **`framer-motion`** (for `useReducedMotion` only), **Tailwind**, and **`cn`** from `@/lib/utils`. Or install from the generated registry item `squiggly-text` after `npm run registry:build`.
