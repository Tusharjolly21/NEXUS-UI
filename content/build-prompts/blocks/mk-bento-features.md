# Bento Features

Build an Apple-style feature grid where every tile shows its feature working, not a picture of it: a chart drawing itself, three devices syncing, a lock closing over hidden text, a gauge dropping to a fast number, switches flipping one after another, two cursors moving over a shared page. A soft spotlight follows the pointer across each tile. Tap a tile and it grows out of the grid into a detail view with a bigger, interactive version of the same demo; Escape or Close folds it back into place. It is light and calm, and it sits on a light panel so it reads the same on a light or a dark page.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 and framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `animate`, `useInView`, `useMotionValue`, `useMotionTemplate`, `useTransform`, `useReducedMotion`). No other libraries.
- File: `components/blocks/bento-features.tsx`, named export `BentoFeatures`, types `BentoFeaturesProps` and `BentoTile`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `tiles` | `BentoTile[]` | the six demo tiles | The tiles to show, in order. |
| `title` | `string` | `"Everything you need. Nothing you don’t."` | Heading above the grid. Empty string hides the heading and subtitle. |
| `subtitle` | `string` | `"Tap any tile to see more."` | Line under the heading. |
| `autoplay` | `boolean` | `true` | Opens and closes tiles by itself until the first interaction. Off under reduced motion. |
| `className` | `string` | none | Extra classes on the outer panel. |

`BentoTile` is `{ id, title, blurb, detail, points: string[], span: string, zoom?: number, demo: (big: boolean, play: boolean) => ReactNode }`. `span` is a Tailwind grid-span class (for example `md:col-span-2 md:row-span-2`). `zoom` is how much the demo is enlarged in the detail view (default 1.6; the chart stays at 1 because it redraws itself larger). `demo` receives `big` (true in the detail view) and `play` (false when the grid is off screen, behind a detail view or under reduced motion; hold a still state then).

Demo tiles (all invented demo content):

1. **Insights that update live** (`md:col-span-2 md:row-span-2`, zoom 1): "See who is visiting right now." Detail: "Every chart updates as people arrive, so you can watch a launch land in real time instead of waiting for a report." Points: Live visitors and conversions, Compare any two ranges, Export to CSV in a click.
2. **Syncs everywhere** (`md:col-span-2`): "Change it on one device, it is already on the others." Detail: edits reach phone, laptop and tablet in under a second and work offline. Points: Under a second across devices, Works offline, Conflict-free merges.
3. **Private by default**: "Encrypted before it leaves." Detail: personal fields are encrypted on your device. Points: End-to-end encryption, No ad tracking, Delete everything any time.
4. **Fast**: "Pages answer in milliseconds." Detail: an edge network serves every request from the nearest region. Points: Served from 30 regions, 18 ms median response, No cold starts.
5. **Automations** (`md:col-span-2`): "When something happens, do the next thing." Points: 40 built-in triggers, Retries and delays, A log for every run.
6. **Made for teams** (`md:col-span-2`): "Work on the same page at the same time." Points: Live cursors, Comments and mentions, Roles for every member.

## Layout and look

- Outer panel: `max-width: 1040px`, full width, background `#f5f5f7`, radius 32px, padding 20px (32px from `md`), a column with 20px gap. Heading block (4px side padding): 24 to 34px (`clamp(24px, 3.2vw, 34px)`) semibold, line height 1.1, tracking -0.03em, `#1d1d1f`; subtitle 14px `#6e6e73`, 6px below. A 12.5px `#6e6e73` hint line under the grid: "Move across a tile, then tap it to open it. Escape closes."
- Grid: one column below 768px, four columns from `md`, 12px gap, rows 214px tall from `md`. Tiles are at least 200px tall on one column.
- Tile: white, radius 24px, padding 20px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Top row: title 16px semibold (tracking -0.01em) over a 13px / 1.4 `#6e6e73` blurb, and on the right a 28px circle (`#f5f5f7`) with a plus that appears on hover and focus. The demo fills the rest, 12px below the text.
- Spotlight: two layers driven by pointer position in motion values. A faint fill `radial-gradient(260px circle, rgba(0,113,227,.08), transparent 70%)` and a 1px edge ring `radial-gradient(220px circle, rgba(0,113,227,.45), transparent 70%)` masked to the border. Leaving the tile moves both off the tile.
- Detail view: covers the whole grid area (`absolute inset-0`), white, radius 28px, padding 24px (32px from `md`), shadow `0 0 0 1px rgba(0,0,0,.06), 0 40px 80px -30px rgba(0,0,0,.45)`. Header: title 26px semibold (tracking -0.025em) with the detail sentence 15px / 1.5 `#6e6e73` below (max 460px), and a "Close" pill (36px tall, `#f5f5f7`, hover `#e8e8ed`) on the right. Body: one column, two from `md` (`1fr 1.5fr`), 24px gap: a list of the points as 14px medium rows (radius 14px, `#f5f5f7`, a 6px blue dot) and a stage (radius 20px, `#fbfbfd`, padding 16px, at least 180px tall) holding the demo scaled by `zoom`.
- Colours: ink `#1d1d1f`, secondary `#6e6e73`, grey fills `#f5f5f7` / `#e8e8ed` / `#d2d2d7`, blue `#0071e3`, green `#30d158`, purple `#bf5af2`, orange `#ff9f0a`.

## The demos

- **Insights:** a "Visitors" total that rolls to the new number with a spring (60/18) and a Week / Month switch (radiogroup, sliding white pill with `layoutId`). The line (smooth cubic path, 2.5px blue, `pathLength` 0 to 1 over 1.1s) draws, then the soft fill fades in at 0.75s. Moving across the chart shows a vertical hairline, a dot and a read-out: "Day 4: 1,924 visitors". Playing, it flips between Week and Month every 3.2s. In a grid tile the switch is `inert` (the tile itself is the button); in the detail view it is live and the chart is taller.
- **Syncs everywhere:** a dashed line with three devices (phone, laptop, tablet, drawn with divs). A blue dot travels along the line (spring 120/14); each device it reaches lights blue with a tick and hops 4px (spring 500/14). Steps every 0.9s.
- **Private by default:** a padlock whose shackle lifts and tilts on unlock (spring 520/14) beside three rows ("Maya Chen", "maya@inbox.co", "4417 1234 5678"). Locked, the rows are dots; unlocked, they blur-swap to the text (`AnimatePresence mode="popLayout"`, 0.3s, 60ms stagger). Toggles every 2.2s.
- **Fast:** a half-circle gauge with a needle and a green arc. A spring (40/9) drives milliseconds from 240 down to 18, holds 1.4s, then eases back; the number, arc length and needle angle all come from one motion value.
- **Automations:** three rows (When a payment fails / Then email the customer / Then retry in 3 days), each with a switch that flips green in turn, 0.8s apart, then all reset.
- **Made for teams:** a mock page of skeleton lines with a highlight bar that grows and shrinks, two coloured cursors with name labels drifting over it, and three avatars bottom right.

## Interaction and states

- Click, Enter or Space on a tile opens it. The tile is a `motion.div` with `layoutId`, so the same element expands into the detail view and back (spring 260/26). The grid behind fades to 35%, blurs 2px and scales to 98.5%, and is `inert` while a tile is open.
- The detail view is `role="dialog"` with `aria-modal` and an `aria-label` of the tile title. Opening by a person moves focus to Close; closing returns focus to the tile. Escape closes. Clicking Close closes.
- The demo content inside the detail view fades in with the points sliding in 10px from the left, 60ms apart.
- Hovering a tile lifts it 3px.

## Autoplay demo

While `autoplay` is on and the block is at least 30% in view, every 3.6s it opens the next of three tiles (Insights, Fast, Syncs everywhere) and the next tick closes it. The first pointer, key or touch on the block stops it for good. Nothing moves focus during the demo.

## Accessibility

- Tiles are focusable `role="button"` elements with an `aria-label` of "<title>. Open details." and `aria-haspopup="dialog"`; visible 2px `#0071e3` focus rings on tiles, Close and the range switch.
- Demos are `aria-hidden`, except the Insights chart which is an `img` with a label and a live region that reads out the hovered day. The meaning lives in the titles, blurbs and points.
- Text on white is at least 4.5:1 (`#6e6e73` on white is 5:1).
- Reduced motion (`useReducedMotion`): no autoplay, demos hold a still state (`play` is false), loops and drifting cursors stop; the open and close still happen on a click.

## Acceptance checklist

- [ ] `<BentoFeatures />` renders with no props: a heading and six tiles, each with a live demo.
- [ ] The Insights chart draws in, the total rolls, and moving over the chart reads out a day.
- [ ] Hovering a tile shows the blue spotlight and edge ring following the pointer.
- [ ] Clicking a tile grows it into the detail view and Escape or Close folds it back; focus returns to the tile.
- [ ] Autoplay opens and closes tiles until the first touch, then stops.
- [ ] One column with no horizontal scroll at 390px wide.
- [ ] Dark page: the panel stays light and readable.
- [ ] Reduced motion: no autoplay and no looping demos.
