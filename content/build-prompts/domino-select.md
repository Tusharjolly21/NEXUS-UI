# Domino Select

Build an email-style list with a "Select all" master checkbox that topples the rows like dominoes. Ticking the master box tips each row forward in a chain, then every row springs back up ticked; unticking runs the chain from the bottom. The feel is a soft Apple-like panel with a physical, slightly overshooting 3D flip.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useAnimationControls`, `useReducedMotion`). The 3D tilt is plain CSS perspective, no WebGL.
- File: `components/domino-select/domino-select.tsx`, named export `DominoSelect`, plus exported `DominoSelectProps` and `DominoMessage` (`{ from: string; subject: string; time: string; color: string }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `messages` | `DominoMessage[]` | seven sample emails | Rows. `color` is the avatar background. Changing the row count resets the selection (remount by key). |
| `onSelectionChange` | `(selected: number[]) => void` | none | Indexes of ticked rows, called after every change (not on mount). During a chain it fires once per row. |
| `autoplay` | `boolean` | `false` | Ticks and unticks the master box by itself until someone interacts. |

Sample rows (from / subject / time / colour): Linear "3 issues assigned to you" 9:41 `#5e5ce6`; Stripe "Payout of $4,210 is on its way" 9:12 `#635bff`; Maya Chen "Re: launch checklist" 8:57 `#ff9f0a`; GitHub "[nexus-ui] PR #482 merged" 8:30 `#1d1d1f`; Figma "Jun commented on Pricing v3" Yesterday `#ff375f`; Vercel "Deployment ready: nexus-ui.com" Yesterday `#000000`; Dodo "Your payout settings were updated" Mon `#30d158`.

## Layout and look

- Panel: 380px wide (`max-w-full`), padding 12px, radius 26px. Light: `#f5f5f7`, ring `0 0 0 1px rgba(0,0,0,.04)`. Dark: `#1c1c1e`, ring `rgba(255,255,255,.08)`.
- Header row: space-between, padding 8px sides, 4px top, 12px bottom. Left is the master button (checkbox role): a 22px box, radius 7px, then "Select all" 14px semibold `#1d1d1f` (dark `#f5f5f7`), 10px gap. Right is a count, 13px tabular numbers, `#6e6e73` (dark `#a1a1a6`): "{n} messages" when nothing is ticked, otherwise "{k} selected".
- Box states: off is white with an inset 1.5px ring `#c7c7cc` (dark: `#1c1c1e` with ring `#636366`); on is `#0071e3` (dark `#0a84ff`) with a white 12px check (stroke 3.6). The master box shows the check when all are ticked, a 10x3px white bar when some are, and is blue in both cases.
- List: `ul`, no bullets, column, 6px gap, `perspective: 700px`, `transform-style: preserve-3d`. Each row is a full-width button, radius 14px, padding 12px / 10px, 12px gap, left aligned, `z-index = rowCount - index` so upper rows sit above the ones they fall onto. Row background white (dark `#2c2c2e`); ticked rows `#eef5ff` (dark `#0a84ff` at 20%). Ring `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.05)` (dark: `0 0 0 1px rgba(255,255,255,.08)`).
- Row content: 22px checkbox, 32px avatar circle in the row colour with the sender's first letter (13px semibold white; in dark mode add a 1px `white/16` ring), then a text column: top line sender (14px semibold, truncated) and time (12px `#86868b`, dark `#8e8e93`) at the right; second line the subject (13px `#6e6e73`, dark `#a1a1a6`, truncated).
- Action bar under the list: 13px "Do something with them" on the left and two pill buttons "Archive" and "Mark read" (32px tall, 12px medium text, white / dark `#2c2c2e`, same ring as rows). It animates height 0 to 48px and opacity 0 to 1 when at least one row is ticked, and is `inert` while hidden.

## Motion

- Chain: rows animate with `rotateX` keyframes `[0, fall, fall, 0]`, times `[0, .28, .5, 1]`, eases `["easeIn", "linear", [0.2, 1.4, 0.4, 1]]` (the last one overshoots, so the row springs back up). Duration is `0.95 + (n - k) * 0.03` seconds, delay `k * 0.075` s, where k is the row's position in the chain.
- Select: order top to bottom, transform origin 100% (bottom edge), fall `-58` degrees, last row `-84`. Deselect: order bottom to top, origin 0% (top edge), fall `+58`, last row `+84`.
- Each row's box state flips at `(delay + 0.55 + (n - k) * 0.03)` seconds, i.e. just as that row stands back up. The check path draws with `pathLength` 0 to 1 in 0.22 s; box colour fades in 150 ms.
- Single row toggle: flips immediately and nods `rotateX [0, -14, 0]` over 0.35 s with origin at the bottom.
- Reduced motion: no tipping; the master box sets all rows at once, autoplay does not run.

## Interaction and states

- The master button ticks everything unless everything is ticked, in which case it unticks everything. It is ignored while a chain is running; single rows are ignored then too.
- `aria-checked` on the master is true, false or "mixed".
- Clearing timers on unmount is required; autoplay also pauses while the panel is off screen or the tab is hidden.

## Autoplay demo

Every 2.6 s alternate between select-all and deselect-all, until the first pointer press or click anywhere in the panel.

## Accessibility

- The master button and each row are `button`s with `role="checkbox"`; rows are named "{sender}: {subject}". The list has a label "Messages". The count is `aria-live="polite"`. Focus rings: 2px `#0071e3` (dark `#2997ff`). Space and Enter toggle (native button).

## Acceptance checklist

- Select all tips rows one after another from the top, each hinged at its bottom edge, and they all end ticked.
- Deselect runs from the bottom up, hinged at the top edge.
- Boxes tick at the moment each row stands back up, not before.
- The master box shows an indeterminate bar when only some rows are ticked.
- A single row nods and toggles; the action bar appears when anything is ticked and hides when empty.
- Starting a second chain mid-flight does nothing.
- Dark mode recolours every surface, text and box; keyboard focus is clearly visible.
