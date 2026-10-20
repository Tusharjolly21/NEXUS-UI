# Standing Calendar

Build a GitHub-style contribution grid that can stand up into a 3D field of columns. Flat, it is an ordinary grid of rounded squares. Switch to Standing and the grid tips back into an isometric view while every day grows into a box as tall as its count, rising in a wave from the first week to the last. Hovering a day highlights its top in orange and rolls its details into the header. The feel is a tidy data toy: precise, springy, slightly playful.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layoutId`).
- Real CSS 3D: `perspective`, `transform-style: preserve-3d`, per-face rotations and translateZ. No canvas or 3D library. Every cell is three DOM faces.
- File: `components/standing-calendar/standing-calendar.tsx`, named export `StandingCalendar`. Also export `STANDING_CALENDAR_LEVELS`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `weeks` | `number` | `30` | Weeks of sample data to generate. Ignored when `data` is passed. |
| `data` | `number[][]` | sample data | One array of 7 counts (Mon to Sun) per week. |
| `levels` | `string[]` | `STANDING_CALENDAR_LEVELS` | Five colours from no activity to busiest. |
| `autoplay` | `boolean` | `false` | Stands up and lies down on a loop until the user interacts. |

`STANDING_CALENDAR_LEVELS = ["var(--sc-empty)", "#c6e2ff", "#7db8ff", "#2f8cff", "#0060df"]`.

Level of a count v: 0 if `v = 0`, 1 if `v < 3`, 2 if `v < 6`, 3 if `v < 9`, else 4.

Sample data must be deterministic (same on server and client): a linear congruential generator `seed = (seed × 9301 + 49297) mod 233280`, starting at seed 7, returning `seed / 233280`. For week w and day d: `weekend = d ≥ 5 ? 0.4 : 1`, `season = 0.55 + 0.45·sin((w / weeks)·1.6π + 0.6)`, `count = max(0, round(rnd() × 12 × weekend × season − 1.5))`. Memoise it on `weeks`.

## Layout and look

Root: full-width centred column, gap 20px. Theme variables (light / dark via `dark:` on a `.dark` ancestor): `--sc-empty` `#ebedf0` / `#2c2c2e`, `--sc-empty-side` `#e2e4e8` / `#242426`, `--sc-empty-front` `#d9dce1` / `#1c1c1e`.

- **Header**: max-width 640px, `px-1`, baseline-aligned, space-between. Left: "{total} contributions" (total of all counts, `toLocaleString("en-US")`), 15px semibold, `#1d1d1f` / `#f5f5f7`. Right: a 20px-tall, min 160px wide, right-aligned, overflow-hidden slot at 13px tabular-nums, `#6e6e73` / `#a1a1a6`, showing "Week {w+1}, {Mon…Sun}: {count}" for the hovered cell or "Hover a day".
- **Stage**: full width, 250px tall, content centred, `perspective: 1600px`. Inside, the grid group (`preserve-3d`) sized `weeks × 18` by `7 × 18` px.
- **Cells**: 14 × 14px with a 4px gap (pitch 18px). Week w is the column (`left = w × 18`), day d the row (`top = d × 18`). Each cell (`preserve-3d`) holds three faces:
  - **Top**: fills the cell, background = level colour (`#ff9f0a` while hovered), radius 3px flat / 1px standing, translated by `z = height`.
  - **Front**: pinned to the bottom edge, full width, `transform-origin: bottom`, `rotateX(−90deg)`, its height = column height. Colour `color-mix(in oklab, {top} 72%, #001a40)`, or `--sc-empty-front` for level 0.
  - **Side**: pinned to the right edge, full height, `transform-origin: right`, `rotateY(90deg)`, its width = column height. Colour `color-mix(in oklab, {top} 84%, #001a40)`, or `--sc-empty-side` for level 0.
  Column height is `3 + count × 6` px when standing and 0 when flat, so even empty days become a 3px slab.
- **Footer row** (gap 16px):
  - Segmented control "Flat" / "Standing": `grid-cols-2`, radius 12px, padding 3px, `#e8e8ed` (dark `#3a3a3c`). Buttons 32px tall, `px-5`, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`. The active one has a sliding white pill (dark `#636366`), shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, shared via a `layoutId` namespaced with `useId`.
  - Legend: "Less", five 10px squares (radius 2px) in the `levels` colours, "More"; 11px `#86868b` / `#98989d`, gap 4px.

## Motion

- **Grid tilt**: standing `rotateX 58°, rotateZ −32°, scale 0.92, y 20px`; flat all neutral. Spring `stiffness 90, damping 18`.
- **Columns**: front height, side width, top `z` and top radius all animate on one spring, `stiffness 160, damping 16`, with a per-cell delay:
  - standing up: `0.25 + w × 0.025 + d × 0.01` s (after the tilt begins, a wave across the weeks with a small ripple down each week);
  - lying down: `(weeks − w) × 0.01` s (the last week collapses first).
  The springs overshoot slightly so columns bounce at their peak.
- **Header readout**: `AnimatePresence mode="popLayout" initial={false}`, keyed by the hovered cell. Enter from `y 14, opacity 0` to `y 0, opacity 1`; exit to `y −14, opacity 0` (default transition). Values roll upward as you sweep across cells.
- **Segment pill**: `layoutId` spring `stiffness 420, damping 32`.
- Use `initial={false}` on all animated faces so nothing animates on mount.

## Interaction and states

- `standing` boolean and `hover` (`{ w, d, v }` or null).
- Pointer enter on a cell sets the hover; leaving the grid group clears it. Hover works in both flat and standing views.
- Clicking Flat or Standing sets the state. Any pointer-down anywhere in the component marks it touched.
- Passing `data` overrides `weeks`; the grid width follows `data.length`.

## Autoplay demo

When `autoplay` is true, stand up 800ms after mount, then toggle every 3800ms. Both are skipped once the user has pressed a pointer anywhere in the component.

## Accessibility

- Toggle wrapper: `role="group"`, `aria-label="View"`; buttons are `type="button"` with `aria-pressed` and a 2px focus-visible outline `#0071e3` (dark `#0a84ff`).
- The legend is `aria-hidden`. The hovered-day readout is plain text in the header.

## Acceptance checklist

- Flat view: a 30 × 7 grid of 14px rounded squares in five shades of blue, with empty days in light grey (dark grey in dark mode).
- The header total equals the sum of all counts, comma-formatted.
- Standing tilts the grid back and to the side while columns rise left to right, each `3 + 6 × count` px tall.
- Every column shows a lighter side face and a darker front face, mixed toward deep navy.
- Flat collapses the columns right to left and returns the grid to face-on.
- Hovering any day turns its top `#ff9f0a` and rolls "Week n, Day: count" into the header.
- The sample data is identical on every render and between server and client.
- With `autoplay`, it alternates every 3.8s until the first pointer-down.
