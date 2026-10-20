# Drawn Timeline

Build a "how it works" timeline: a vertical line draws itself as you scroll, each numbered node fills with the accent as the line reaches it, and the step cards slide in, alternating left and right on wide layouts. With `autoplay` the line draws on a loop instead of following the scroll. It should feel clear and satisfying, like progress you can watch.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries: `@container`, `@3xl:`), framer-motion (`motion`, `MotionConfig`, `animate`, `useInView`, `useMotionValue`, `useScroll`, `useSpring`, `useTransform`, `useReducedMotion`), and a `cn` helper.
- File: `components/drawn-timeline/drawn-timeline.tsx`, named exports `DrawnTimeline` and `DEFAULT_DRAWN_TIMELINE_STEPS`, types `DrawnTimelineProps` and `DrawnTimelineStep = { title; body; meta }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `DrawnTimelineStep[]` | 4 demo steps | Steps in order. |
| `eyebrow` | `string` | `"How it works"` | Accent line above the heading. |
| `title` | `string` | `"Live in an afternoon."` | Heading. |
| `accent` | `string` | — | Any CSS colour. Unset: `#0071e3`, `#0a84ff` in dark (text `#2997ff`). |
| `autoplay` | `boolean` | `false` | Draw on a loop instead of following scroll. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Wrap everything in `MotionConfig reducedMotion="user"`.
- Section: `@container`, full width, bg `#f5f5f7` / black, padding 16px sides (20px from `sm`), 64px vertical (80px `sm`).
- CSS variables on the section (light / dark): `--mk-accent` `#0071e3` / `#0a84ff`; `--mk-accent-text` `#0071e3` / `#2997ff`; `--mk-dt-node` `#ffffff` / `#1c1c1e`; `--mk-dt-num` `#86868b` / `#a1a1a6`; `--mk-dt-hair` `#d2d2d7` / `#3a3a3c`. When `accent` is set, an inline style sets both `--mk-accent` and `--mk-accent-text` to it.
- Inner max-width 1000px. Header: centred column, gap 12px, margin-bottom 40px (56px `sm`). Eyebrow 14px semibold in `--mk-accent-text`. `<h2>` `clamp(32px, 5vw, 54px)`, semibold, line-height 1.04, tracking −0.04em, balanced, `#1d1d1f` / `#f5f5f7`.
- Track: absolute, top to bottom, 2px wide, rounded, `#e0e0e5` / `#3a3a3c`, at `left: 23px` (centre of a 48px node column); from `@3xl` at `left: 50%` with −1px margin. Inside it a fill element scaled on Y from the top by the progress value, background `linear-gradient(var(--mk-accent), #5ac8fa)`.
- Each step is an `<li>` grid: `48px minmax(0,1fr)` with 16px gap; from `@3xl` three columns `minmax(0,1fr) 64px minmax(0,1fr)` with no gap. Even steps (0, 2…) put the card in column 1 (right-aligned text, 40px right padding) and an empty spacer in column 3; odd steps the opposite (40px left padding). The node always sits in the middle column.
- Node: 48×48 circle, 24px top margin, 16px semibold tabular number. Off: background `--mk-dt-node`, number `--mk-dt-num`, ring `0 0 0 1.5px var(--mk-dt-hair)`. On: background accent, number white, ring `0 0 0 8px accent@14%, 0 0 0 1.5px accent`.
- Card (inside a `py-4` wrapper): inline-block, max-width 100%, radius 24px, padding 20px (24px `sm`), white / `#1c1c1e`, left-aligned text, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)`, `.9`). Meta: 12px semibold uppercase, 0.08em tracking, `--mk-accent-text`. Title `<h3>` `clamp(19px, 2.4vw, 22px)` semibold, tracking −0.025em, 8px top margin. Body 15px, line-height 1.55, max-width 380px, `#6e6e73` / `#a1a1a6`.

Demo steps:
1. "Connect your tools" — "Sign in with Google or Microsoft and pick the apps you already use. Lumen imports the last 12 months in the background." — "About 2 minutes"
2. "Choose what matters" — "Pick the numbers you check every week. We suggest a starting set based on teams like yours." — "5 minutes"
3. "Invite your team" — "Everyone gets their own view, with the same live data underneath. Permissions follow your org chart." — "1 minute"
4. "Get your Monday back" — "A short summary lands in your inbox each week, with anything unusual flagged at the top." — "Every week, automatically"

## Motion

- Progress source (one motion value, 0 → 1):
  - Scroll mode: `useScroll` targeting the timeline wrapper with offset `["start 70%", "end 60%"]`, smoothed with `useSpring` stiffness 140, damping 26.
  - Autoplay mode: `animate(value, [0, 1, 1, 0], { duration: 9, times: [0, .62, .9, 1], ease: "easeInOut", repeat: Infinity })`, only while the wrapper is ≥20% in view; stop on cleanup.
  - Reduced motion: a constant 1 (fully drawn).
- Node `i` of `n` turns on at `at = (i + 0.5) / n`: `on = map(progress, [at − 0.08, at] → [0, 1])`. Scale 0.6 → 1 with `on`; the halo spread = `on × 8px`; background, number colour and hairline switch when `on > 0.5`.
- Cards: `initial` `opacity 0, x ∓40 (−40 from the left side, +40 from the right), blur(8px)`, `whileInView` to rest, `viewport { once: true, amount: 0.5 }`, spring stiffness 120, damping 20.

## Interaction and states

- No clickable controls; the section reacts only to scroll (or the loop). Steps keyed by `${index}-${title}`.
- On narrow containers everything stacks on the left rail; from `@3xl` (768px) the cards alternate around a centred line.

## Autoplay demo

With `autoplay`, the line draws down over ~5.6s, holds full for ~2.5s, retracts in ~0.9s and repeats; nodes fill and empty with it. Use this wherever the section can't be scrolled through (previews, short pages).

## Accessibility

- Semantic `<ol>` of steps. Nodes are `aria-hidden`; the meta line starts with a visually hidden "Step N. " so the number is still announced.
- The track is `aria-hidden`.
- `MotionConfig reducedMotion="user"` plus a fully drawn line under reduced motion.

## Acceptance checklist

- [ ] Header centred; four steps along a 2px line.
- [ ] Scrolling down draws the gradient line; scrolling up retracts it.
- [ ] Each node grows from 0.6 to full size and fills with the accent with an 8px halo as the line reaches it.
- [ ] Wide layouts alternate cards left and right of a centred line; narrow ones stack on a left rail.
- [ ] Cards slide in from their own side with a blur, once.
- [ ] `autoplay` loops the line over 9s while in view, no scrolling needed.
- [ ] `accent="#ff375f"` recolours line start, nodes, eyebrow and meta.
- [ ] Dark mode swaps node, hairline and card colours.
- [ ] Reduced motion shows a fully drawn line and all nodes on.
