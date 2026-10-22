# Marker Annotations

Build a paragraph that gets marked up by hand as it scrolls into view: a yellow highlighter pass that follows the text across line breaks, a scribbled underline, a loose circle round one word and a red strike-through for the old way. The marks play in reading order, one after another, and a "Draw again" button plays them again. It should feel hand-drawn, with wobbly paths rather than clean geometry.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useInView`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/hover-highlight-text/marker-annotations.tsx`. Named exports `MarkerAnnotations`, the constant `MARKER_SEGMENTS`, and types `MarkerAnnotationsProps`, `MarkerKind`, `MarkerSegment`. Re-export from the folder's `index.ts` (and from a sibling `hover-highlight-text.tsx` barrel if one exists).
- No sound: the component is decorative and makes none.

## API

`MarkerKind` is `"highlight" | "underline" | "circle" | "strike"`. `MarkerSegment` is a plain string or `{ text: string; kind: MarkerKind; color?: string; darkColor?: string; delay?: number }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `segments` | `MarkerSegment[]` | `MARKER_SEGMENTS` | The paragraph, strings between marked-up objects. |
| `showReplay` | `boolean` | `true` | Show the replay button. |
| `replayLabel` | `string` | `"Draw again"` | Button label. |
| `autoplay` | `boolean` | `false` | Replay the marks every 7s while on screen until touched. |
| `className` | `string` | none | Extra classes on the paragraph. |

Demo `MARKER_SEGMENTS`: "Stop " + strike("hand-tuning", delay 0.1) + " every animation. This kit gives you " + highlight("springs that already feel right", 0.5) + ", components you can " + underline("copy in one click", 1.3) + ", and a design that respects " + circle("everyone", 1.9) + ".". When a segment has no `delay`, use its index times 0.4s.

Default colours (light / dark): strike `#ff3b30` / `#ff453a`; highlight `#ffd60a` / `rgba(255,214,10,.42)` (a dimmer yellow so light text stays readable on it); underline `#0071e3` / `#0a84ff`; circle `#34c759` / `#30d158`.

## Layout and look

- Root: a column, `gap 24px`, `max-width 640px`, full width, 8px horizontal padding, items aligned to the start.
- Paragraph: zero margin, `font-size: clamp(22px, 3.4vw, 30px)`, weight 600, line-height 1.45, tracking -0.02em, ink `#1d1d1f` (dark `#f5f5f7`).
- Highlight: a `<mark>` with 3px radius, 2px horizontal padding, `box-decoration-break: clone` so each wrapped line gets its own stroke, transparent background colour, text colour inherited. Its background image is `linear-gradient(104deg, transparent 0.6%, C 2.4%, C at 80% opacity 95%, transparent 98%)` where `C` is the mark colour. `background-position: 0 60%`, `background-repeat: no-repeat`, `background-size` animates from `0% 72%` to `100% 72%`.
- Underline, circle, strike: the words sit in an `inline-block`, `whitespace-nowrap` span (the strike uses a `<del>` with its default line removed, so assistive tech still hears "deleted"). An absolutely positioned SVG with `viewBox="0 0 100 20"`, `preserveAspectRatio="none"`, `overflow: visible`, `aria-hidden`, stretches to the words:
  - underline: `inset-x-0`, `bottom: -38%`, height 60%. Path `M 2 15 C 20 18, 40 12, 60 15 S 90 17, 98 13`, stroke width 2.4.
  - strike: `inset-x-0`, `top: 25%`, height 50%. Path `M 0 11 C 25 9, 60 12, 100 9`, stroke width 2.4.
  - circle: `left: -10%`, `top: -30%`, height 160%, width 120%. Path `M 50 2 C 80 1, 99 6, 98 11 C 97 17, 70 20, 46 19 C 18 18, 1 15, 2 9 C 3 4, 24 1, 56 2`, stroke width 1.6.
  - All strokes use `stroke-linecap: round`, `fill: none`, and the mark colour (light or dark) through a CSS variable switched with `dark:`.
- Replay button: 36px tall pill, 16px horizontal padding, 13px medium text, a 13px circular-arrow icon and 6px gap; background `#f5f5f7` (hover `#ececf0`), text `#1d1d1f`; dark `#2c2c2e` (hover `#3a3a3c`), text `#f5f5f7`. Focus outline 2px, offset 2px, `#0071e3` (dark `#0a84ff`).

## Motion

- The whole paragraph decides when to start: `useInView(paragraph, { once: true, amount: 0.6 })`. Until it is true every mark is in its hidden state.
- Highlight: `background-size` from `0% 72%` to `100% 72%` over 0.7s, ease `[0.5, 0, 0.2, 1]`, after its delay.
- Underline and strike: `pathLength` 0 to 1 and opacity 0 to 1 over 0.5s, ease `[0.6, 0, 0.3, 1]`. Circle: the same over 0.8s.
- Replay: increment a counter used as the paragraph's `key`, which remounts it and replays every mark from hidden.
- Reduced motion: no drawing. Each mark simply fades in over 0.25s with no delay; the highlight is fully drawn from the start.

## Interaction and states

- Marks are decorative overlays: they never take pointer events and never change the text.
- "Draw again" replays instantly (it is available once the paragraph has been seen).

## Autoplay demo

Only while the component is on screen, the tab is visible and motion is not reduced: every 7s, replay the marks. Any pointer press inside the component (including the replay button) stops the loop for good.

## Accessibility

- The paragraph reads as normal text. The highlight is a real `<mark>`; the strike is a real `<del>`; the SVG strokes are `aria-hidden`.
- Replay is a real button with a visible focus outline.
- Highlight in dark mode uses a translucent yellow so `#f5f5f7` text keeps contrast above 4.5:1.

## Acceptance checklist

- [ ] Scrolling the paragraph about 60% into view starts the sequence: strike, highlighter, underline, circle, in that order.
- [ ] The highlighter follows the text across a wrapped line break, each line getting its own stroke.
- [ ] Narrowing to 360px keeps everything inside the container with no horizontal scroll.
- [ ] Draw again replays the whole sequence.
- [ ] Custom `segments` with other colours and delays work.
- [ ] Dark mode shows brighter strokes and a dim yellow highlight with readable text.
- [ ] Under reduced motion the marks fade in with no drawing.
- [ ] Autoplay replays about every 7s and stops for good after a press.
