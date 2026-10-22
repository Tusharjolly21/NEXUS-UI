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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Ticking a task plays `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz); putting a finished task back with Undo plays `off` (a small noise click with a sine falling from 760 to 480 Hz over 70ms); adding a task with Enter plays `pop` (a sine rising from 320 to 980 Hz in 70ms). An empty add and opening the Completed list make no sound. Tasks are never deleted in this component, so there is no remove sound. Each task the autoplay ticks off plays the same `tick`; the autoplay reset that unticks them all at once is silent. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Clicking a task fills the circle, draws the check and strikes the text before the row moves.
- [ ] About 750ms later the row collapses downward with blur and the badge pops.
- [ ] Typing a task and pressing Enter appends it with a drop-in; whitespace-only input adds nothing.
- [ ] Completed button is disabled at 0, toggles a drawer, chevron flips.
- [ ] Undo puts the task back at the end of the open list, unticked.
- [ ] "All clear." appears when every task is done.
- [ ] Autoplay ticks one task every 1.5s, resets when all are done, and stops at the first click or key press.


---

<!-- Todo List: Nexus states variant brief -->

> The Todo List page has a variant. The brief above rebuilds the original; the section below rebuilds the All Caught Up variant. It is a separate component that shares the card look but not the add or Completed drawer features.

---

<!-- variant: all-caught-up -->

# All Caught Up

Build a to-do list that ends somewhere nice. A card titled "Today" with a "n of 4 done" line and a small progress ring in the corner lists four tasks. Tick one and its circle fills green with a drawn check, a line strikes through the text, and about 650ms later the row folds away while the ring fills. Tick the last one and the same ring travels to the middle of the card, grows, closes into a big drawn check with two ripples, and "All caught up" appears with three chips for tomorrow and a Start over button.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), React `useId`, a `cn` class-merge helper, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/todo-list/all-caught-up.tsx`. Named exports `AllCaughtUp`, `AllCaughtUpProps`, `AllCaughtUpTask` and the constants `ALL_CAUGHT_UP_TASKS`, `ALL_CAUGHT_UP_TOMORROW`.

## API

`AllCaughtUpTask`: `{ id: number; title: string; tag: string }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `tasks` | `AllCaughtUpTask[]` | four demo tasks | The list. |
| `tomorrow` | `string[]` | three demo items | Chips on the finished screen. |
| `heading` | `string` | `"Today"` | Card heading. |
| `onTick` | `(task) => void` | none | A task was ticked by hand. |
| `onComplete` | `() => void` | none | The last task was ticked by hand. |
| `autoplay` | `boolean` | `false` | Ticks tasks off and starts over until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Demo tasks: "Reply to Maya about the roadmap" (Inbox), "Approve pricing page copy" (Review), "Ship the onboarding checklist" (Build), "Book the design review" (Calendar). Tomorrow: "Q4 planning", "1:1 with Leo", "Invoice run".

## Layout and look

- Card: width 420px, `max-width: 100%`, radius 28px, padding 20px (24px from 640px), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Header: the heading 20px semibold tracking -0.02em (`#1d1d1f` / dark `#f5f5f7`) over a 13px tabular "n of N done" in `#6e6e73` / dark `#a1a1a6`; a 34px progress ring on the right (4px stroke, track `#ececf0` / dark `#3a3a3c`, progress `#34c759` / dark `#30d158`, round caps, rotated -90 degrees).
- Body: 16px under the header, min-height 340px. Rows are full-width buttons, radius 14px, padding 8px by 12px, 12px gap, hover bg `#fafafa` / dark `#2c2c2e`: a 22px circle (2px border `#c7c7cc` on white; dark `#636366` on `#1c1c1e`), the title (14.5px, truncated, `#1d1d1f` / dark `#f5f5f7`), and a tag pill (11px medium, bg `#f5f5f7` / dark `#2c2c2e`, text `#6e6e73` / dark `#a1a1a6`, 8px by 2px padding).
- Ticked row: circle border and fill `#34c759` (dark `#30d158`) with a 12px white check (3.4 stroke); the title turns `#8e8e93`; a 1px line `#a1a1a6` strikes across it.
- Finished screen: centred column, 16px from the top. An 84px ring (6px stroke, full) with a 34px check inside in the same green (3 stroke), then 20px below it "All caught up" (19px semibold, tracking -0.02em), then "Nothing else due today. Here's what's next:" (13.5px muted), then the chips (12.5px medium, radius full, 12px by 6px padding, bg `#f5f5f7` / dark `#2c2c2e`, a muted "Tomorrow" prefix), then a Start over pill (36px, bg `#1d1d1f` white text; dark bg `#f5f5f7` text `#1d1d1f`).

## Motion

- Tick: the circle border and fill change colour over 0.3s and the circle pulses `scale 1 -> 1.2 -> 1`; the check path draws (`pathLength 0 -> 1`, 0.25s, 0.05s delay); the strike line scales on X from 0 to 1 from the left (0.3s, 0.1s delay). 650ms after the tick the row is removed.
- Rows: `AnimatePresence` + `layout`; enter `opacity 0, height 0` to auto; exit to the same over 0.3s `cubic-bezier(.4,0,.2,1)`.
- Ring: `pathLength` follows `done / total` with a spring (stiffness 120, damping 20); the header ring and the big ring share one `layoutId` so it travels and grows between them with a spring (stiffness 200, damping 24). A `LayoutGroup` with an id from `useId` keeps two instances on one page from sharing it.
- Finish: the check scales in from .4 (spring stiffness 400, damping 16, 0.35s delay) while its path draws (0.45s delay, 0.35s); two ripple rings (84px, 2px border, same green) scale from 1 to 1.9 and fade from .5 to 0 over 1.1s at 0.4s and 0.65s delays; the heading rises 8px and fades in at 0.5s; the sub line at 0.6s; each chip rises 12px at `0.75 + 0.08 * i` seconds (spring stiffness 400, damping 26); Start over fades in at 1s.
- Reduced motion: no pulses, ripples, layout travel or rise; the ring is not shared (the big one fades in), checks and strikes appear at once, rows fold with a 0.12s fade.

## Interaction and states

- Each row is a button with `aria-pressed` reflecting whether it is ticked; a ticked task cannot be unticked. The count updates immediately; the row leaves after 650ms.
- When no rows are left the finished screen shows. Start over restores every task. `onTick` and `onComplete` fire for hand ticks only.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: reset at 0.1s, tick task `i` at `0.9s + i * 1s`, hold the finished screen for about 4s, reset, and loop. Any pointer or key press inside the card stops it for good.

## Accessibility

- A persistent `sr-only` polite `role="status"` region reads "n of N done" and then "All caught up". Ring, checks, strike and ripples are `aria-hidden`.
- The tomorrow chips are a list. Buttons have a 2px focus outline at 2px offset (`#0071e3`, dark `#0a84ff`).
- All timers (the 650ms folds and the demo) are cleared on unmount.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Ticking a task plays `tick` at 50% (a tiny dry click: a 12ms burst of high-passed noise above 5 kHz). Ticking the last task plays `success` at 60% instead (two rising soft triangle notes, about 1046 Hz then 1318 Hz) as the ring fills, so each press makes exactly one sound. Start over and the row folds are silent.
- The autoplay loop plays the same sounds: `tick` for each task it ticks and `success` for the last, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Hover is silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Ticking draws the check, fills the circle green and strikes the text, then the row folds away about 650ms later.
- [ ] The header ring fills a quarter at a time and the count reads "n of 4 done".
- [ ] The last tick makes the ring travel to the middle, grow to 84px and close into a big check with two ripples.
- [ ] "All caught up", the sub line, three Tomorrow chips and Start over arrive in that order.
- [ ] Start over brings back all four tasks.
- [ ] Autoplay loops and stops for good on touch; it never runs under reduced motion.
- [ ] Reduced motion swaps states with short fades only.
- [ ] Dark mode uses the dark card, `#636366` empty circles and the brighter green.
- [ ] It fits a 320px container.
