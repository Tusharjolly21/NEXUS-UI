# Scramble Heading

Build a text-animation section whose headline decodes out of random glyphs when it scrolls into view, left to right, like a terminal resolving. The second line is an accent-coloured phrase that keeps re-decoding into the next phrase every few seconds, with a hand-drawn marker stroke drawing in under it. Below sits a three-cell feature strip whose mono titles re-scramble whenever you point at them. It should feel technical but precise: fast churn, zero layout jitter.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useInView`, `useReducedMotion`).
- File: `components/blocks/motion-kit/scramble-heading/scramble-heading.tsx`, named export `ScrambleHeading`; also export the `ScrambleHeadingProps` and `ScrambleHeadingFeature` types (re-export from an `index.ts`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Deploys, rethought"` | Mono line above the headline; it decodes too. |
| `lead` | `string` | `"Push code."` | First headline line. |
| `words` | `string[]` | `["ship faster.", "sleep better.", "break nothing."]` | Phrases the second line cycles through. Trimmed, empties dropped. |
| `features` | `ScrambleHeadingFeature[]` | three deploy features | `{ k: string; title: string; body: string }`. |
| `accent` | `string` | — | Any CSS colour. Unset: `#0071e3`, `#2997ff` in dark mode. |
| `autoplay` | `boolean` | `true` | Keep cycling the phrase while the section is on screen. |
| `className` | `string` | — | Merged onto the section. |

## Layout and look

- Section: full width, padding 20px horizontal, 80px vertical (`sm` 96px), bg white / dark `black`. The accent lives in a CSS variable `--sh-accent`: set inline from `accent` when given, else via classes `[--sh-accent:#0071e3] dark:[--sh-accent:#2997ff]`.
- Inner column: centred, `max-w-[1040px]`.
- Eyebrow: mono, 12px (`sm` 13px), medium, uppercase, letter-spacing 0.18em, `var(--sh-accent)`.
- Headline `h2`: 20px below, `font-size: clamp(36px, 7.5vw, 84px)`, semibold, line-height 1.02, letter-spacing -0.05em, `#1d1d1f` / dark `#f5f5f7`. The lead line, a `<br>`, then the phrase in an inline-block, `whitespace-nowrap`, accent-coloured span.
- Marker stroke: absolutely positioned SVG under the phrase (`bottom: -12px`, left 0, full width, 16px tall, `overflow: visible`), `viewBox="0 0 300 16"`, `preserveAspectRatio="none"`. Path `M4 10 C 60 2, 140 14, 200 7 S 280 6, 296 9`, no fill, `stroke: currentColor` at opacity 0.35, width 6, round caps.
- Feature strip: 56px below (`sm` 64px). Grid, 1 column, `md` 3 columns, 1px gaps over a hairline background (`rgba(0,0,0,.07)`, dark `rgba(255,255,255,.1)`) so the gaps read as dividers; radius 24px, `overflow-hidden`.
- Feature cell: flex column, 12px gap, padding 24px (`sm` 28px), white bg (hover `#fbfbfd`), dark `#1c1c1e` (hover `#2c2c2e`), colour transition. Index `k` in mono 13px `#86868b` / dark `#a1a1a6`; title in mono 18px (`sm` 19px), semibold, -0.01em, ink colour; body 15px, line-height 1.55, `#6e6e73` / dark `#a1a1a6`.

## Motion

Scramble primitive (`text`, `run`, `speed`, `enabled`):
- Glyph set: `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/`.
- On each new `run` (when > 0 and enabled), drive a `requestAnimationFrame` loop throttled to one step per `speed` ms. Total steps = `text.length + 12`. At step `n`, each character is: a space if it is a space; the real character if `i < n - 8`; a random glyph if `i < n`; otherwise a space. After the last step, show the real text.
- Randomness comes from a seeded LCG, seeded with `(run*7919 + text.length*104729) % 233280` and advanced as `seed = (seed*9301 + 49297) % 233280`, so render stays pure.
- Store each frame with a key of `run|text`, so a stale frame never shows for new text. Before the first frame of a run, show the text with every non-space replaced by a non-breaking space.
- Layout: an invisible copy of the final text reserves the width; the churning frame is absolutely positioned on top with `overflow-x: clip`.

Speeds: eyebrow 28ms, lead 34ms, phrase 30ms, feature titles 22ms.

Timeline:
- `useInView(ref, { once: true, amount: 0.5 })` on the inner column. When seen, eyebrow, lead and feature titles run once (`run = 1`).
- With `autoplay`, more than one phrase and motion allowed, a 3200ms interval increments a tick; the phrase becomes `words[tick % length]` and its run is `1 + tick`.
- Marker stroke: keyed by the phrase run so it redraws each cycle; `pathLength` 0 → 1 over 0.8s, delay 0.5s, ease `[0.16, 1, 0.3, 1]`.

## Interaction and states

- Pointer enter on a feature cell increments that cell's hover counter; the title's run is `hover + base`, so each entry re-scrambles it (taps count on touch).
- No click behaviour.
- Reduced motion: scrambles are disabled (final text shows at once), the phrase does not cycle, and the stroke is drawn fully from the start.

## Autoplay demo

The section ships with `autoplay` on: once half of it is visible, the phrase cycles "ship faster." → "sleep better." → "break nothing." every 3.2s, each change re-decoding and redrawing the marker.

Default features: `01` "Preview every branch" / "A live URL for every pull request, gone when it merges."; `02` "Roll back in one click" / "Every deploy is kept. Pick one and it's live in seconds."; `03` "Watch it in real time" / "Logs, errors and traces stream in as users hit the page."

## Accessibility

- Every scrambled string renders its real text in a `sr-only` span; the animated copy is `aria-hidden`, so screen readers never hear glyph noise.
- The marker SVG is `aria-hidden`.
- The headline is a real `h2`; the feature strip is plain content.
- Respect `prefers-reduced-motion` through `useReducedMotion`.

## Acceptance checklist

- [ ] On scroll-in, eyebrow, lead and feature titles decode left to right out of glyph noise.
- [ ] No text reflows while decoding; the final text reserves the width.
- [ ] The accent phrase changes every 3.2s, re-decoding each time.
- [ ] The marker stroke draws under the phrase after a 0.5s delay on every change.
- [ ] Hovering a feature cell re-scrambles its title.
- [ ] `accent="#ff375f"` recolours the eyebrow, phrase and stroke.
- [ ] `autoplay={false}` leaves the first phrase in place after its decode.
- [ ] A single-item `words` list does not cycle.
- [ ] Feature cells stack on phones and form three columns from `md`.
- [ ] Screen readers read the clean text only.
- [ ] Reduced motion shows final text with the stroke drawn and nothing moving.
