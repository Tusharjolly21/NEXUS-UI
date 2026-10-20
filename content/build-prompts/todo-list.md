# Todo List

Build a compact task list card where ticking a task fills the circle, draws a check and strikes the text, then the row sinks out and a "Completed" counter pops. Quick add at the bottom, a collapsible Completed drawer with Undo. The feel is Apple Reminders: calm, tight springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`).
- File: `components/todo-list/todo-list.tsx`, named export `TodoList`, plus exported `TodoListProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `initial` | `string[]` | `["Reply to design review", "Ship the pricing page", "Book flights for March", "Renew domain"]` | Tasks shown at first, all open. |
| `accent` | `string` | `"#0071e3"` | Fill of the checked circle, the counter badge, Undo text and focus outlines. |
| `autoplay` | `boolean` | `false` | Ticks tasks off by itself until someone interacts. |

Task shape: `{ id, text, done, leaving? }`; ids come from a ref counter.

## Layout and look

- Root: column, `w-full max-w-[380px]`, 12px gap.
- Card: `rounded-[20px]`, `overflow-hidden`, white background, shadow `0 0 0 1px rgba(0,0,0,.05), 0 14px 34px -20px rgba(0,0,0,.3)`. Dark: background `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08)`.
- List: unstyled `ul`, 6px padding. Each row is a clickable `label`: 12px gap, 10px padding, radius 12px, hover `#f5f5f7` (dark `#3a3a3c`).
- Check circle: 22×22, fully round. Unchecked: inset ring `inset 0 0 0 1.5px #c7c7cc` (dark `#636366`), transparent fill. Checked: filled with `accent`, no ring. Inside, a 12×12 SVG (viewBox 24) with path `M5 12.5l4.5 4.5L19 7.5`, white stroke 3.2, round caps and joins.
- Task text: 15px, `#1d1d1f` (dark `#f5f5f7`). When done it turns `#86868b` (dark `#98989d`). Strike line: absolutely positioned at vertical centre, full text width, 1.5px tall, `#86868b`, transform origin left.
- Empty state (no open rows): a centred list item "All clear." in 14px `#86868b` (dark `#98989d`), padding 12px × 20px.
- Add row: a `form` under the list with a 1px top border `#f0f0f3` (dark `#3a3a3c`), padding 16px × 8px, 8px gap. A decorative "+" at 20px, font-light, `#c7c7cc` (dark `#636366`), then a borderless transparent input, 36px tall, 15px, placeholder "Add a task" in `#a1a1a6` (dark `#8e8e93`), no outline.
- Completed button: left-aligned under the card (`self-start`), 36px tall pill, 12px horizontal padding, 8px gap, 13px medium `#6e6e73` (dark `#a1a1a6`), hover background black 5% (dark white 10%). Contents: a count badge (20px tall, min-width 20px, 6px horizontal padding, round, 12px semibold white tabular numbers on `accent`), the word "Completed", and a 10px chevron-down (`M6 9l6 6 6-6`, stroke 3, round caps).
- Completed drawer: plain list, no padding. Rows: flex with space-between, padding 12px × 6px, 14px `#86868b` (dark `#98989d`), text with `line-through`, and an "Undo" text button at 12px medium in `accent`, small 6px radius.

## Motion

Shared spring: `{ type: "spring", stiffness: 420, damping: 34 }`.

1. **Ticking (`complete`)**: set `done: true, leaving: true`; the row stays in the open list while `leaving`. Immediately:
   - circle background animates transparent → `accent` and scale keyframes `[1, 1.2, 1]`, duration 0.3s;
   - check path `pathLength` 0 → 1, duration 0.25s, delay 0.08s;
   - strike line `scaleX` 0 → 1, duration 0.35s, delay 0.1s, ease `[0.65, 0, 0.35, 1]`;
   - text colour change via CSS transition, 200ms with a 150ms delay.
2. **After 750ms**: set `leaving: false`, so the row exits via `AnimatePresence`: `opacity 0, height 0, y 14, scale 0.96, blur(3px)` on the spring, opacity as its own 0.2s tween. Pulse the counter badge (animation controls): scale `[1, 1.25, 1]`, 0.35s.
3. **Rows entering**: from `opacity 0, height 0, y −8` to `height auto` on the spring. Rows use `layout`; `AnimatePresence initial={false}`.
4. **Empty state** fades in from `opacity 0, scale 0.95`.
5. **Chevron** rotates 0 → 180° when the drawer is open.
6. **Drawer** opens and closes from `height 0, opacity 0` to `height auto, opacity 1` on the spring (`AnimatePresence initial={false}`); its rows use `layout`.

## Interaction and states

- Clicking a row completes it; there is no un-ticking from the main list.
- Add: Enter submits the trimmed draft (empty is ignored), appends it and clears the input.
- Undo: moves the task to the end of the list, `done: false`.
- Completed button toggles the drawer; `disabled` (50% opacity) when nothing is done. The drawer renders only when open and non-empty.
- Open list = tasks where `!done || leaving`. Done list = `done && !leaving`. The badge shows the done count.

## Autoplay demo

Every 1500ms complete the first task that is not done (read from a ref mirroring state). When all are done, reset every task to open. Any `pointerdown` or `keydown` inside the root sets `touched`; the next tick clears the interval.

## Accessibility

- Each row holds a real `input type="checkbox"` with `sr-only` and `peer`; the visible circle shows a 2px focus outline in `accent` with 2px offset via `peer-focus-visible`.
- The add input has a visually hidden label "New task" tied with `useId`. The "+" glyph and SVGs are `aria-hidden`; the strike line is `aria-hidden`.
- The Completed button carries `aria-expanded`. All buttons are `type="button"` and show a 2px focus outline in `accent`.

## Acceptance checklist

- [ ] Clicking a task fills the circle, draws the check and strikes the text before the row moves.
- [ ] About 750ms later the row collapses downward with blur and the badge pops.
- [ ] Typing a task and pressing Enter appends it with a drop-in; whitespace-only input adds nothing.
- [ ] Completed button is disabled at 0, toggles a drawer, chevron flips.
- [ ] Undo puts the task back at the end of the open list, unticked.
- [ ] "All clear." appears when every task is done.
- [ ] Autoplay ticks one task every 1.5s, resets when all are done, and stops at the first click or key press.
