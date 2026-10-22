# Agent Run

Build a view of an AI agent working through a task that you can actually follow. A header shows the task, a running clock and a Stop button. Below it the steps appear one at a time. The current step is open and shows what is happening right now: chips for the files being read, test output streaming in line by line, the exact line being changed as a red and green diff. When a step finishes it collapses into a one-line summary with a green tick and its duration, and you can reopen any finished step to read what it did. The run ends with a report card (what changed, how many files, plus and minus counts) and a "Review change" button.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `MotionConfig`, `useReducedMotion`), `requestAnimationFrame` for the clock, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/agent-run/agent-run.tsx` plus an `index.ts`. Named exports: `AgentRun`, the types `AgentRunProps`, `AgentRunStep` and `AgentRunReport`, and the constants `AGENT_RUN_STEPS` and `AGENT_RUN_REPORT`.

## API

`AgentRunStep`: `{ label: string; ms: number; body: (t: number) => ReactNode }`. `body` receives the milliseconds elapsed inside the step while it runs (and the step's full `ms` once it is done), so it can reveal lines or files over time. `AgentRunReport`: `{ title; body; files; added; removed }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `task` | `string` | "Fix the failing checkout test" | The task heading. |
| `steps` | `AgentRunStep[]` | four demo steps (6.3s in total) | The run, in order. |
| `report` | `AgentRunReport` | "Fixed: discount rounding" | The end-of-run card. |
| `onReview` | `() => void` | none | Called by "Review change". |
| `width` | `number` | `520` | Card width in px, never wider than the container. |
| `autoplay` | `boolean` | `false` | Starts the run again 4.5s after it ends, until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds (see Sound). |
| `className` | `string` | `""` | Extra classes for the card. |

Demo steps (label, ms): "Reading the checkout code" 1500, chips checkout.ts, cart.ts, discount.ts, cart.test.ts appearing every 300ms; "Running the tests" 1800, lines every 330ms: `$ npm test cart`, two green passes, a red failure and its detail; "Fixing discount.ts" 1600, lines every 450ms: file and line, a red removed line, a green added line; "Running the tests again" 1400, lines every 600ms: the command and "24 passed (0.8s)". Report: 1 file, +1, -1.

## Layout and look

- Card: width 520px, `max-width: 100%`, radius 28px, padding 20px (24px from `sm`), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Header: task on the left ("Task" at 12px medium muted `#6e6e73` / dark `#a1a1a6`, then the task at 16px semibold, tracking -0.01em, `#1d1d1f` / `#f5f5f7`); on the right the clock (12.5px tabular, one decimal, "3.2s") and a 32px tall pill button, 12.5px medium, bg `#f5f5f7` / dark `#2c2c2e`. While running the button is "Stop" with an 8px rounded square before the label; otherwise it is "Run again".
- Steps: an ordered list 16px below the header. Each row has 32px of left padding. A 21px status circle sits at `left: 0, top: 5px` on a card-coloured backing: a 18px spinner ring (2px border `#d2d2d7`, top edge `#0071e3`; dark `#48484a` and `#0a84ff`) while running, a 21px green check disc (`#34c759`, dark `#30d158`, white check) when done, an empty 18px grey ring (`#c7c7cc`, dark `#48484a`) when stopped. A 1px vertical connector (`#e5e5ea` / dark `#3a3a3c`) runs from below the circle to the bottom of each finished row except the last.
- Row header: a full-width button, 6px vertical padding, label at 14px (current step semibold; stopped step muted with " · stopped"), and on the right the duration (11.5px tabular, muted) for finished steps.
- Step body: an open step shows a panel with 12px radius, 12px padding, bg `#f5f5f7` / dark `#2c2c2e`, 8px below the row. Code is monospace 11.5px at line-height 1.6. File chips: radius 6px, 8px by 4px padding, white with a 1px `rgba(0,0,0,.07)` ring (dark `#3a3a3c`). Muted lines are `#6e6e73` / `#a1a1a6`; passes `#16702f` / `#6be28a`; failures `#c4271b` / `#ff8a80`; the removed diff line has bg `#fff1f0` (dark `rgba(255,69,58,.15)`) and the added line `#e9f9ee` (dark `rgba(48,209,88,.15)`).
- Report: a 16px radius card with a 1px border (`rgba(0,0,0,.07)` / dark `rgba(255,255,255,.08)`), 16px padding, 8px below the list. Title 14px semibold, body 13px at line-height 1.5 muted, then a row with a monospace 12px summary ("1 file · +1 −1", plus green and minus red) and, pushed right, a 32px "Review change" pill (12.5px medium, 14px side padding, dark fill `#1d1d1f` with white text; dark theme `#f5f5f7` with `#1d1d1f`).

## Motion

- Clock: one `requestAnimationFrame` loop adds the frame delta (capped at 100ms) to an elapsed counter, committed to state at most every 50ms, stopping at the total. The current step is the first whose cumulative end is after the elapsed time.
- A new row slides in from `y: 6, opacity 0`. A check scales from 0.4 with a spring (stiffness 500, damping 18). The spinner rotates 360 degrees in 0.8s, linear, repeating.
- Step panels open and close with height and opacity over a spring (stiffness 340, damping 34). Lines slide in from `x: -4`; chips pop from `y: 4, scale .9`.
- Report card: from `opacity 0, y 10, scale .98` with a spring (stiffness 340, damping 28).
- Reduced motion: wrap the card in `MotionConfig reducedMotion="user"` (transform and layout animation turns off, opacity stays), no spinner rotation, panels use a 0.15s fade. The run still advances in real time.

## Interaction and states

- States: running, stopped, finished. The run starts on mount (for `autoplay`, once the card is on screen).
- Stop freezes the clock where it is, marks the current step "· stopped" with the empty ring, and swaps Stop for Run again. Run again restarts from zero, closes any reopened steps and hides the report.
- Reopening a finished step: its header toggles the panel (`aria-expanded`); the live step cannot be closed.
- The report appears only when the run finishes without being stopped.

## Autoplay demo

With `autoplay`, only while the card is on screen, the tab is visible and motion is not reduced: 4.5 seconds after a run finishes, start it again. The clock pauses while the card is off screen. Any pointer press or focus inside stops the loop for good.

## Accessibility

- The steps are an `ol`. A polite `sr-only` `role="status"` region announces "Running: <step>", "Run finished" or "Run stopped". Status icons are `aria-hidden`.
- Every step header is a button with `aria-expanded`. Focus rings are 2px `#0071e3` (dark `#0a84ff`) with 2px offset.
- Muted text uses `#6e6e73` / `#a1a1a6` so it passes 4.5:1 on both card colours.

## Sound

Prop `enableSound?: boolean` (default `true`), using `useSound` from `@/lib/ui-sounds`.

- `tick` (volume 0.35) after the 1st and 3rd steps finish (every other step; the last step has its own sound).
- `success` (volume 0.5) when the run finishes.
- `off` (volume 0.5) when Stop is pressed.
- The first run on mount is silent unless `autoplay` is on; runs started with Run again use `play`; autoplay runs use `play.auto`.

## Acceptance checklist

- [ ] Steps appear in order, each open while live, with output streaming at the cadence above, then collapse with a tick and duration.
- [ ] The clock counts to 6.3s in tenths and stops at the end.
- [ ] Stop halts everything and marks the step stopped; Run again restarts cleanly.
- [ ] Finished steps can be reopened and closed; the live step cannot.
- [ ] The report card springs in only after a full run and Review change calls `onReview`.
- [ ] Autoplay restarts 4.5s after the end, pauses off screen, stops at first touch.
- [ ] Reduced motion keeps real-time progress with no spin, slide or scale.
- [ ] Dark mode follows the colours above; works at 360px wide.
