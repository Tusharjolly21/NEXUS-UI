<!-- Milestone Timeline: Motion Kit variant brief -->

> The Milestone Timeline page has 3 variants. The original Milestone Timeline is a vertical rail of milestones; this brief rebuilds it first, then the two Motion Kit variants: Roadmap Scrubber and Commit Graph Roadmap.

---

<!-- variant: milestone-timeline -->

# Milestone Timeline

Build a vertical roadmap timeline inside a card. When it scrolls into view a glowing bead runs down the rail, drawing each finished milestone's check as it passes, overshoots the milestone in progress a touch and settles on it. Clicking a milestone (or moving with the arrow keys) slides a raised card to it and opens its notes. Calm, Apple-like, crisp and springy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useInView`, `useMotionValue`, `useTransform`, `useReducedMotion`, `layoutId`).
- File: `components/milestone-timeline/milestone-timeline.tsx`. Named export `MilestoneTimeline`, exported types `Milestone` and `MilestoneTimelineProps`.

## API

- `Milestone`: `{ title: string; date?: string; description?: string; status?: "done" | "current" | "upcoming"; tag?: string }`. `tag` is a small pill on the current milestone, e.g. "In progress".
- `milestones?: Milestone[]`: rich milestones; they take priority over `steps`. Default: Research and discovery (Jan 2026, done), Design system v1 (Mar 2026, done), Private beta (Jun 2026, current, tag "In progress"), Public launch (Sep 2026, upcoming), each with a one-sentence description.
- `steps?: string[]`: plain titles; everything before the last is done, the last is current.
- `heading?: string`, default `"Roadmap"`.
- `defaultOpen?: number`: milestone opened first, default the current one.
- `autoplay?: boolean`, default `false`: opens each milestone in turn every 2600ms until someone touches the timeline.
- `className?: string`.
- Missing statuses are derived: with a current milestone the target is its index, otherwise the last done one; items up to the target are done, the rest upcoming.

## Layout and look

- Card: `@container`, full width, radius 28px, padding 24px (32px from 480px container width), white / dark `#1c1c1e`, ink `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`).
- Header: baseline-aligned, space-between. Heading 22px semibold, tracking -0.03em. At the right "<done> of <total> complete", 13px tabular numbers, `#6e6e73` / dark `#a1a1a6`.
- List: `<ol>`, 24px below the header. Each `<li>` is a row with a 12px gap (16px from 420px container width) and 12px bottom padding (none on the last).
- Date column (only from 420px container width, only if the milestone has a date): 68px wide, right aligned, 12px medium tabular numbers, 17px top padding, muted. Below 420px the date sits inside the title row instead.
- Rail column: 24px wide, 12px top padding. A node 24px across over a 2px connector that runs from the node's centre (top 24px) down to the next node (bottom -36px), track `#e5e5ea` / dark `#3a3a3c`, with an accent fill (`#0071e3` / dark `#0a84ff`) on top that scales from the top by progress.
- Nodes: done = 24px white circle (dark `#1c1c1e`) with a 2px `#d2d2d7` (dark `#48484a`) inset ring, covered by a filled `#1d1d1f` (dark `#f5f5f7`) disc whose opacity follows progress, with a 12px check (`M2.5 6.3l2.3 2.2 4.7-5`, stroke 2, round caps, white / dark `#1d1d1f`) whose `pathLength` follows progress. Current = 24px accent circle with a 4px accent halo (alpha .16) and an 8px white dot, plus a pulsing ring (scale 1 to 2, opacity .7 to 0, 1.6s, repeat) behind it. Upcoming = 24px dashed circle, 2px border `#c7c7cc` (dark `#48484a`), white / dark `#1c1c1e` fill.
- Content column: the title button (15px semibold, tracking -0.01em, 16px horizontal and 12px vertical padding, radius 18px, upcoming titles muted), an optional tag pill on the current one (11px semibold white on accent, fully rounded), and the description (13px, relaxed leading, muted, padded 16px sides and 14px bottom).
- Open card: a rounded-18px layer behind the open milestone. Current: accent at 6% (dark 10%) with a 1px accent ring (alpha .18) and a soft accent drop shadow; others: `#f5f5f7` / dark `#2c2c2e`. It is one shared `layoutId` element so it slides between rows.

## Motion

- A single motion value `fill` runs from 0 to `target` (the index of the current milestone) when the list first comes into view (`useInView`, once, margin -60px) using a spring: stiffness 38, damping 9, mass 1.1, restDelta .001, delay .2s. The low damping makes the bead overshoot and settle.
- Segment `i` scales its accent fill by `clamp(fill - i, 0, 1)`. A 10px accent bead with a glow (`0 0 0 4px` accent at alpha .2 plus a 14px blur) rides the leading edge while `0.02 < fill - i < 0.98`, hidden otherwise.
- Done node `i`: the disc fades in when `fill >= i - 0.04`; the check draws with `clamp((fill - i + 0.04) * 3, 0, 1)`; the node pops with `1 + sin((d + 0.05) / 0.4 * pi) * 0.22` for `-0.05 < d < 0.35` where `d = fill - i`. The current node pops the same way.
- Open card slides between rows with a spring (stiffness 380, damping 30). The description opens with height spring (stiffness 320, damping 32) and a .18s opacity fade, via `AnimatePresence initial={false}`.

## Interaction and states

- Click a milestone button to open it. Only one is open at a time. The first open is `defaultOpen` or the current milestone.
- Arrow Up and Down, Home and End move focus between the milestone buttons.
- Any pointer press or key press inside the card marks it touched, which stops autoplay for good.

## Autoplay demo

With `autoplay`, once the list is in view and there are two or more milestones, advance the open milestone every 2600ms, wrapping around. The first touch clears the interval. Cleared on unmount.

## Accessibility

- Real `<ol>` and `<button>`s. Each button has `aria-expanded` and `aria-controls` pointing at its region (`role="region"`, `aria-labelledby` the button). Visible focus outline 2px, offset 1px, `#0071e3` (dark `#0a84ff`).
- The decorative card layer, rail and nodes are `aria-hidden`.
- Reduced motion: `fill` is set straight to the target, the bead and pulse are not rendered, the card and the description change without springs.

## Acceptance checklist

- [ ] On scroll-in a bead runs down the rail, each done node fills and its check draws as the bead passes.
- [ ] The bead overshoots the current milestone slightly and settles back on it.
- [ ] Clicking a milestone slides the raised card to it and opens its notes; the old notes close.
- [ ] Arrow keys, Home and End move between milestones.
- [ ] Looks right at 320px (dates move inline) and in dark mode.

---

<!-- variant: roadmap-scrubber -->

# Roadmap Scrubber

Build the roadmap as a video-editor style timeline. Tracks of bars run across a twelve-month ruler. A playhead sweeps from January to today when the chart scrolls in; then you can drag it, or use the arrow keys, and every bar fills up to that day, milestone diamonds tick over as you pass them, and a summary underneath says what is in flight and what is next.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`animate`, `motion`, `AnimatePresence`, `useInView`, `useReducedMotion`).
- File: `components/milestone-timeline/roadmap-scrubber.tsx`. Named export `RoadmapScrubber`, exported types `RoadmapScrubberProps`, `RoadmapScrubberTrack`, `RoadmapScrubberBar`, `RoadmapScrubberMark`.

## API

- `RoadmapScrubberBar`: `{ label: string; start: string; end: string }`. `RoadmapScrubberMark`: `{ label: string; date: string }`. `RoadmapScrubberTrack`: `{ name: string; bars?: RoadmapScrubberBar[]; marks?: RoadmapScrubberMark[] }`. All dates are `YYYY-MM-DD`.
- `tracks?: RoadmapScrubberTrack[]`. Default dataset (2026):
  - Design: Design system 2026-01-01 to 2026-03-26; Motion tokens 2026-04-07 to 2026-06-07; Pro templates 2026-08-01 to 2026-11-01.
  - Engineering: Core library 2026-02-01 to 2026-07-01; Pro blocks 2026-07-13 to 2026-11-19.
  - Launch: Private beta 2026-05-17 to 2026-08-17; marks Public launch 2026-09-16 and v2 2026-12-13.
- `year?: number`, default `2026`: the year the chart spans. Dates outside it clamp to the edges.
- `today?: string`, default `"2026-06-15"`: the date of the red marker and the sweep's end point. The component never reads the real clock, so server and client render the same.
- `title?: string`, default `Roadmap <year>`.
- `autoplay?: boolean`, default `false`: after the opening sweep, glides the playhead to late December and back to today on a loop until touched.
- `className?: string`.

## Layout and look

- Date to position: a position runs 0 (Jan 1) to 12 (end of Dec). `pos = (year diff) * 12 + monthIndex + (day - 1) / daysInMonth`, clamped to 0..12, with UTC date maths. Each month is one equal column. A position back to a label: month `m`, day `min(daysInMonth, floor(frac * daysInMonth + 1e-9) + 1)`, written like "Jun 15".
- Card: full width, `max-w-[860px]`, radius 28px, padding 20px (28px from 640px viewport), white / dark `#1c1c1e`, ink `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.3)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`).
- Header: space-between. Title 20px semibold, tracking -0.02em. "Jump to today" button: 32px tall, pill, 14px side padding, 13px medium, `#f5f5f7` (hover `#ececf0`) / dark `#2c2c2e` (hover `#3a3a3c`).
- Scroller: 20px below the header, `overflow-x: auto`. Inside, a block with `min-width: 640px` and 108px left padding for the track names.
- Month ruler: a 12-column grid, 28px tall, 11px medium labels Jan..Dec, `#6e6e73` / dark `#a1a1a6`, a hairline left border on every column except the first (`#ececf0` / dark `#2c2c2e`).
- Track area: height `tracks * 52px`, `cursor: ew-resize`, `touch-action: pan-y`, no text selection. A column grid of hairlines behind (`#f3f3f5` / dark `#2c2c2e`). Each track is a 52px row with its name at the far left (13px medium muted, vertically centred, sitting in the left padding).
- Bar: absolute, top 10px, 32px tall, radius 10px, `overflow: hidden`, background `#eef1f6` / dark `#2c2c2e`, left and width from the positions. It holds its label twice: once in ink, and once white on accent (`#0071e3` / dark `#0a84ff`) clipped with `clip-path: inset(0 <100 - fill%> 0 0)`, where `fill = clamp((playhead - from) / (to - from))`. Label 12.5px medium, truncated, 12px padding.
- Milestone: an 18px square rotated 45 degrees (radius 4, 2px border) at the date, with its label (12.5px medium) 8px to the right. Not reached: white / dark `#1c1c1e` fill, border `#c7c7cc` / dark `#48484a`, label muted. Reached (playhead at or past it): accent fill and border, ink label. Colours change through CSS classes with a .3s colour transition, never through animated hex strings.
- Playhead: a vertical line (2px, ink `#1d1d1f` / dark `#f5f5f7`) at the playhead position spanning the track area, topped by a date pill above the ruler (11px semibold tabular numbers, pill, ink background with inverse text, soft shadow). Pointer events none.
- Today marker: a 6px red dot (`#ff3b30` / dark `#ff453a`) centred on the bottom edge of the track area at the today position.
- Summary box: 20px below, radius 18px, padding 16px, `#f5f5f7` / dark `#2c2c2e`; from 640px viewport a two-column grid. Left: "In flight" (12px semibold uppercase, tracking .12em, muted) followed by one chip per bar the playhead is inside (`from <= p < to`): white / dark `#1c1c1e` pill, 13px medium, with a percentage badge (12px tabular, `#eef5ff` / dark accent at 20%, accent text) showing the fill. If none: "Nothing this week". Right: "Next: **<label>** in N weeks" where the next item is the earliest bar start (label "<bar> starts") or milestone after the playhead and `N = max(1, round((next - p) * 4.35))` with "week" or "weeks"; or "Year complete".

## Motion

- Opening sweep: when the track area is first 10% in view, animate the playhead from its position to today over 2.2s with ease `[.22, 1, .36, 1]`.
- Jump to today: spring, stiffness 120, damping 22, from the current position.
- Milestone reached: the diamond scales `[1, 1.35, 1]` over .35s.
- In-flight chips enter and leave with `scale .85` and opacity, spring stiffness 420, damping 30, `layout`, `AnimatePresence mode="popLayout"`.
- On narrow screens the chart scrolls sideways; whenever the playhead moves and you are not dragging, centre it in the scroller.

## Interaction and states

- Pressing on the track area jumps the playhead to the pointer and starts a drag (pointer capture; move updates; up, cancel and lost capture end it). The position is `clamp((clientX - left) / width) * 12`.
- The track area is `role="slider"`, focusable: Right/Up +0.25 month (Shift: +1), Left/Down -0.25 (Shift: -1), Home goes to today, End goes to the end of the year.
- Any pointer press, key press or Jump to today stops running animation and marks the chart touched: autoplay never resumes.

## Autoplay demo

With `autoplay`, not reduced motion, after the opening sweep has finished and while the chart is on screen (`useInView`): wait 1500ms, glide to position 11.6 over 4.2s (ease `[.45, 0, .25, 1]`), wait 900ms, glide back to today over 3.2s, then repeat, until touched. Leaving the screen cancels the loop and entering resumes it from where the playhead is. All timers and animations stop on unmount.

## Accessibility

- Slider: `aria-label="Roadmap date"`, `aria-orientation="horizontal"`, `aria-valuemin=0`, `aria-valuemax=12`, `aria-valuenow`, and `aria-valuetext` the date label (e.g. "Jun 15"). Visible focus outline 2px, offset 2px, `#0071e3` (dark `#0a84ff`).
- The summary box is `aria-live="polite"`. The clipped duplicate bar label is `aria-hidden`.
- Reduced motion: the playhead jumps to today with no sweep, no autoplay, milestone and chip animations are instant.

## Acceptance checklist

- [ ] Server render and first client render are identical (playhead at January, no clock reads).
- [ ] Scrolling it in sweeps the playhead to the today marker; bars fill as it passes.
- [ ] Dragging, arrow keys, Home and End all move the playhead; the summary updates live.
- [ ] Diamonds switch to accent and bounce as the playhead passes them.
- [ ] Changing `today` or the tracks (dates as strings) re-lays the chart; nothing depends on the real date.
- [ ] Usable at 320px (chart scrolls sideways, playhead stays in view) and in dark mode.

---

<!-- variant: commit-graph-roadmap -->

# Commit Graph Roadmap

Build a roadmap drawn as `git log --graph`. Main runs down the left with release tags, feature work forks off on coloured lanes and merges back, and the current HEAD pulses. The graph draws itself when it scrolls in, hovering a commit lights its whole branch, and clicking a commit opens its commit message below.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.line`, `motion.path`, `motion.span`, `motion.button`, `AnimatePresence`, `useInView`, `useReducedMotion`), inline SVG.
- File: `components/milestone-timeline/commit-graph-roadmap.tsx`. Named export `CommitGraphRoadmap`, exported types `CommitGraphRoadmapProps`, `RoadmapCommit`, `RoadmapBranch`.

## API

- `RoadmapCommit`: `{ lane: 0 | 1 | 2; tag?: string; title: string; meta: string; body: string; state: "done" | "head" | "next" }`. Lane 0 is main, 1 feature, 2 lab.
- `RoadmapBranch`: `{ lane: 1 | 2; from: number; to: number; color: string }`: the lane forks from main at row `from` (older, lower) and merges at row `to` (newer, higher). Row 0 is the top.
- `commits?: RoadmapCommit[]`, newest first. Default (top to bottom):
  - lane 0, tag v3.0, "Motion Kit", "Planned · Q1", next
  - lane 0, "Merge charts and sounds", "Planned · Dec", next
  - lane 1, "Charts", "In progress", head
  - lane 2, "Sounds", "Ready · Oct", done
  - lane 1, "Tune panel", "Done · Sep", done
  - lane 0, tag v2.0, "Nexus Pro", "Shipped · Aug", done
  - lane 1, "Origami, vinyl, sand", "Done · Jul", done
  - lane 0, tag v1.4, "Blocks", "Shipped · Jun", done
  Each has a one-sentence `body` (e.g. "Animated bar, line and ring charts that build as they enter.").
- `branches?: RoadmapBranch[]`. Default: `{ lane: 1, from: 7, to: 1, color: "#bf5af2" }` and `{ lane: 2, from: 5, to: 1, color: "#ff9f0a" }`.
- `defaultOpen?: number`: row open first, default the HEAD row.
- `autoplay?: boolean`, default `false`: opens each commit in turn every 2800ms until touched.
- `className?: string`.

## Layout and look

- Constants: row height 64, lane x = 22 + lane * 26, row centre y = 32 + row * 64. Lane colours: main `#0a84ff`, feature `#bf5af2`, lab `#ff9f0a`.
- Card: full width, `max-w-[560px]`, radius 28px, padding 20px (24px from 640px viewport), white / dark `#1c1c1e`, ink `#1d1d1f` / `#f5f5f7`, the usual card shadow (dark: ring `rgba(255,255,255,.08)`). A CSS variable `--surface` is `#ffffff` in light and `#1c1c1e` in dark and is used for the gap ring around dots.
- Header: monospace 14px semibold "git log --graph" followed by "roadmap" in muted (`#6e6e73` / dark `#a1a1a6`); at the right a legend of three 8px dots with names main, feature, lab (11px muted). Wraps on narrow screens.
- Graph: relative, height `rows * 64`. An SVG (width `lane2 x + 14`) holds the lines at stroke 3, round caps: the main line is solid from the bottom up to the HEAD row (or the newest done commit when there is no HEAD), then dashed (`2 6`) up to the top at opacity .7. Each branch path forks out of main at row `from`: `M x0 y0 C x0 (y0 - 35), x1 (y0 - 29), x1 (y0 - 64) L x1 (y1 + 64) C x1 (y1 + 29), x0 (y1 + 35), x0 y1`, where x0 is main's x, x1 the lane's x, y0 and y1 the row centres of `from` and `to`.
- Commit dot: 16px circle centred on its lane at the row centre. Done and head: lane colour fill with a 3px `--surface` ring and a 1.5px halo ring in the lane colour at 20% alpha. Next: `--surface` fill with a 3px lane-colour ring. HEAD also has a 2px ring that expands (scale 1 to 2.3, opacity .8 to 0, 1.5s, repeat, delay 1.4s).
- Row button: absolute, from `lane2 x + 24` to the right edge, `inset-y-1`, radius 14px, padding 12px by 8px, hover `#f5f5f7` / dark `#2c2c2e`. Content: optional tag pill (mono 11px semibold white on main blue, pill), HEAD pill (mono 11px semibold, ink background with inverse text), the title (15px semibold, tracking -0.01em, truncated; muted for `next`), and under it the meta line (12px muted, truncated). A 14px chevron at the right, rotated 90 degrees when open.
- Commit message: below the graph, 12px gap: radius 16px, padding 16px, `#f5f5f7` / dark `#2c2c2e`, monospace 12.5px, line height 1.6. Lines: `commit <hex>` muted, where hex is `(0x9f3a1c + row * 0x2b17).toString(16)` + `e` + row; `branch <name>` with the name in the lane colour (`main`, `feature/<first word of title>` or `lab/<first word>`); then the body in the sans font at 14px.

## Motion

- When the card is 30% in view (once), draw bottom to top. The main solid line draws `pathLength 0 -> 1` over 1.1s easeInOut; the dashed part fades in after 1.1s. Each branch path draws over 1s easeInOut with delay `(rows - 1 - from) * 0.12 + 0.2`.
- Dots scale in with a spring (stiffness 500, damping 22) delayed `(rows - 1 - row) * 0.12 + 0.15`. Row buttons fade and slide in from `x -10` with delay `(rows - 1 - row) * 0.12 + 0.25`.
- Hover or focus on a row sets the active lane: everything on other lanes fades (dots .3, lines .2 to .25, buttons .35). Leaving the graph clears it.
- The commit message swaps with `AnimatePresence mode="wait"`: height 0 to auto and opacity over .25s.

## Interaction and states

- Click a row to open it; click the open row to close it. Only one is open. The first open row is `defaultOpen` or the HEAD row.
- Pointer enter on a row (or focus on its button) highlights its lane; blur clears.
- Any pointer press or click marks the card touched, which stops autoplay for good.

## Autoplay demo

With `autoplay`, not reduced motion, once the graph has drawn in and while the card is on screen: advance the open row every 2800ms, wrapping; the first touch clears the interval. Cleared on unmount.

## Accessibility

- Each row is a real `<button>` with `aria-expanded` and `aria-controls` pointing at the message panel. The panel is a `role="region"` with `aria-label="Commit message"` and `aria-live="polite"`. The SVG is `aria-hidden`.
- Visible focus outline 2px, offset 1px, `#0071e3` (dark `#0a84ff`).
- Reduced motion: no draw-in delays or springs (everything appears at once), no HEAD pulse, no autoplay.

## Acceptance checklist

- [ ] On scroll-in main and both branches draw from the bottom up, with the dots popping in behind them.
- [ ] Main is solid below HEAD and dashed above it.
- [ ] HEAD pulses; hovering any commit dims the other lanes.
- [ ] Clicking a commit opens its message with a hash, branch and body; clicking again closes it.
- [ ] Dots keep their gap ring colour on both light and dark cards.
- [ ] Fits at 320px viewport width without overflow.
