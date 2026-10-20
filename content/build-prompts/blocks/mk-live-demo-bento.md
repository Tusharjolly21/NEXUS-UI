# Live Demo Bento

Build a five-card feature bento where every card shows a tiny working demo instead of an illustration: a search box that types queries and reveals results, an area chart with a readout riding the line, named cursors wandering over a document, a workflow with data flowing along its connectors, and a security shield with a scanning beam and a checklist. A soft accent light follows the pointer over each card. It should feel like a modern SaaS landing page: busy in a calm, looping way.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useInView`, `useMotionTemplate`, `useMotionValue`, `useTransform`, `useReducedMotion`).
- File: `components/live-demo-bento/live-demo-bento.tsx`, named export `LiveDemoBento`, plus `LiveDemoBentoProps`. Icons are inline SVG.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Everything in one place"` | Small accent line above the heading. |
| `title` | `string` | `"Built for the way your team actually works."` | Heading. |
| `accent` | `string` | — (`#0071e3`, `#2997ff` in dark) | Colour for eyebrow, caret, chart, flow, shield and card light, via `--lb-accent`. |
| `autoplay` | `boolean` | `true` | Runs all five demos on a loop while on screen. |
| `className` | `string` | — | Extra classes on the section. |

Tints use `color-mix(in srgb, var(--lb-accent) N%, transparent)`.

## Layout and look

- Section: bg `#f5f5f7` / dark `#000`, padding 64px × 20px (80px vertical from `sm`), content max 1120px.
- Header (40px bottom margin, 48px `sm`, 12px gap): eyebrow 14px semibold accent; H2 `clamp(32px,5vw,56px)` semibold, leading 1.04, tracking −0.04em, max 720px, balanced, ink `#1d1d1f` / `#f5f5f7`.
- Grid: 1 column; 6 from `md`; gap 16px (20px `sm`). Spans: Search `md:3`; Chart `md:3`; Cursors `md:3 lg:2`; Flow `md:3 lg:2`; Secure `md:6 lg:2`.
- Card: radius 28px, `overflow: hidden`, white with `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`; dark `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)`. Light layer: `radial-gradient(360px circle at X Y, tint(8%), transparent 70%)` built with `useMotionTemplate`, parked at −300,−300 when the pointer leaves; mouse only. Demo area: min 220px tall, centred, padding 20px (24px `sm`). Copy: padding 0 20px 24px (28px from `sm`); title 20px semibold, tracking −0.02em; body 6px below, 15px, leading 1.5, `#6e6e73` / `#a1a1a6`.
- **Search** (max 340px): 44px input-look bar, radius 16px, bg `#f5f5f7` / `#2c2c2e`, 14px text: 16px magnifier (`#86868b`, stroke 2.4), typed text, a 2×16px accent caret, and a "⌘K" keycap (11px, white / `#3a3a3c`, radius 6px, hairline). Results area min 132px: rows radius 12px, 12px × 10px, a 24px rounded square (accent for the first, `#e8e8ed` / `#3a3a3c` otherwise), 13px medium title; first row bg tint(7%).
- **Chart** (max 360px): SVG `viewBox 0 0 320 100`. Grid lines at y 25/50/75 (`#f0f0f3` / `#3a3a3c`). Area under `M0 90 C 30 84, 50 60, 80 64 S 130 30, 160 40 S 210 76, 240 52 S 290 16, 320 22` filled with a vertical gradient from accent at 25% to 0. The line itself 3px accent, round caps. A dashed (3 3) accent guide at 25% opacity at the dot's x; a 6px-radius dot, tile-coloured fill, 3px accent stroke. Readout tooltip: radius 8px, `#1d1d1f` bg white 12px semibold tabular (dark inverted), positioned at the dot, `translate(−50%, −150%)`, text `$` + `round(1200 + (90 − y) × 42)`.
- **Cursors**: a 190px-tall panel (max 320px), radius 16px, bg `#f5f5f7` / `#2c2c2e`, 16px padding, five 10px-tall white (dark `#48484a`) text lines at widths 80/60/90/45/70%, 12px apart. A `#ff375f40` selection bar at left 16px, top 54px. Three 16px arrow cursors (`M4 2l16 9-7 2-3 7z`, white 1.5px stroke) with name pills (11px semibold white, 8px × 2px, 12px left margin): Maya `#ff375f`, Leo `#30d158`, Ana `#ff9f0a`.
- **Flow**: a fixed 320×180 drawing scaled down to fit (never up) with a ResizeObserver. Nodes 100×36, radius 12px, 10px padding, 12px semibold, white with `0 0 0 1px rgba(0,0,0,.08), 0 8px 16px -10px rgba(0,0,0,.3)` (dark `#2c2c2e`), an 8px dot (green `#30d158` for the first, accent otherwise): New signup (30,30), Enrich (190,30), Score (30,120), Notify sales (190,120). Links `M130 48 H190`, `M240 66 C 240 90, 80 90, 80 120`, `M130 138 H190`: a 2px `#e8e8ed` / `#3a3a3c` base plus a 2px accent dashed (4 8) overlay.
- **Secure**: a fixed 280×110 drawing scaled to fit. A 96×110 shield (`M12 1l10 4v8c0 7-4.5 12-10 14C6.5 25 2 20 2 13V5z`, viewBox 0 0 24 28, fill tint(8%), 1.2px accent stroke) and, 24px right, a checklist (10px gap, 13px medium, no wrap) with 16px green checks (`#248a3d` / `#30d158`, stroke 3): "SSO and SCIM", "Audit log", "Encrypted at rest".

## Motion

- Cards enter once at 30% visibility: `opacity 0, y 30` → rest, 0.8s, ease `[0.16,1,0.3,1]`.
- Search: types one character every 90ms; when complete holds 2600ms, then moves to the next query and clears. Caret blinks `opacity [1,0,1]` every 0.9s. Results appear only when a query is complete, entering from `opacity 0, y 8`, spring 400 / 30, staggered 0.07s; exit 0.1s fade (`mode="popLayout"`).
- Chart: the line draws `pathLength 0 → 1` once in view over 1.6s with the same ease. The dot rides the path with `getPointAtLength`, animating progress 0 → 1 over 3.2s easeInOut, repeating in reverse forever; the guide, dot and tooltip follow through motion values (no re-renders).
- Cursors: each cursor loops through four keyframe points — `x [40+70i, 180−30i, 90+40i, 40+70i]`, `y [30+40i, 120−20i, 60+30i, 30+40i]` — over `7 + 1.5i` s, easeInOut, infinite. The selection bar animates `width [0, 48%, 48%, 0]` over 6s at times `[0, .3, .8, 1]`, infinite.
- Flow: the dashed overlays scroll `strokeDashoffset 0 → −24` every 0.8s linear; each node's accent ring pulses `opacity [0,1,0]` over 2.4s, delayed `i × 0.6s`.
- Secure: a 32px band `linear-gradient(transparent, tint(33%), transparent)` sweeps `y −30 → 110` over 1.8s easeInOut, infinite. Checklist items slide in from `x −8` once in view with delay `0.3 + i × 0.25s`; their checks draw over 0.4s at `0.5 + i × 0.25s`.

## Interaction and states

- `live = autoplay && !reducedMotion`. Each looping demo also waits until it is in view.
- Not live: search shows the first query fully typed with its results and a solid caret; the chart dot rests at the end (320, 22) reading `$4,056`; cursors and selection sit at their first frame/48%; flow and shield are still; checklist entrance still plays once.
- Only the card light reacts to the pointer; the demos are not interactive.

## Demo data

- Queries: "q3 revenue" → "Q3 revenue report", "Revenue by region, Q3", "Board deck: Q3"; "onboarding" → "Onboarding checklist", "New hire onboarding", "Customer onboarding flow".
- Card copy: "Find anything in a keystroke" / "Docs, people, numbers and threads, ranked by what you touch most."; "Numbers that update themselves" / "Every chart is live. Hover any point to see exactly where it came from."; "Work on it together" / "See who's looking at what, and edit at the same time."; "Automate the busywork" / "Chain steps together and let them run in the background."; "Secure from day one" / "Enterprise controls on every plan."

## Autoplay demo

With `autoplay` (default) all five demos loop as described while visible. `autoplay={false}` shows the resting frames above.

## Accessibility

- Every demo drawing is `aria-hidden`; the card titles and bodies carry the meaning.
- The SVG gradient id is derived from `useId()` (sanitised) so multiple instances don't clash.
- Reduced motion disables every loop and the card light still works.

## Acceptance checklist

- [ ] Desktop: two wide cards, then three equal cards; tablet: 2+2 then a full-width Secure card; phone: single column.
- [ ] Search types "q3 revenue", shows three results with the first tinted, then switches to "onboarding".
- [ ] The chart line draws in, then a dot with a dollar readout glides back and forth along it.
- [ ] Three named cursors drift independently; a pink selection grows and shrinks.
- [ ] Dashes flow along all three workflow links; nodes pulse in sequence.
- [ ] A light band sweeps the shield; checks draw one after another.
- [ ] A soft accent glow follows the mouse over each card.
- [ ] `accent="#30d158"` recolours eyebrow, caret, chart, flow and shield.
- [ ] Flow and Secure scale down without overflow on narrow cards.
- [ ] `autoplay={false}` shows a complete, static frame for each demo.
