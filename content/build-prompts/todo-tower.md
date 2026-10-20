# Todo Tower

Build a to-do list stacked like a pile of bricks on a shelf. Each task is a small white card set slightly off-centre on the one below. Tick a task or drag it out sideways and everything above drops into the gap with a bounce; if a brick is then left hanging too far over the one beneath it, it tips over its edge and falls away. New tasks drop onto the top of the pile. The feel is physical, springy and a little comic.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `PanInfo`).
- File: `components/todo-tower/todo-tower.tsx`, named export `TodoTower`, plus exported `TodoTowerProps`, `TodoTowerTask` (`{ text: string; x: number }`), `TODO_TOWER_TASKS` and `TODO_TOWER_MORE`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `tasks` | `TodoTowerTask[]` | `TODO_TOWER_TASKS` | Starting pile, top to bottom; `x` is the sideways offset in px. |
| `moreTasks` | `string[]` | `TODO_TOWER_MORE` | Labels "Add a task" uses, in turn (wrapping). |
| `overhang` | `number` | `24` | Max px a brick may hang past the one beneath before it tips. |
| `maxBricks` | `number` | `8` | Adding does nothing once the pile has this many. |
| `onComplete` | `(text: string) => void` | none | Called when a task is ticked. |
| `autoplay` | `boolean` | `false` | Plays by itself until someone touches it. |

`TODO_TOWER_TASKS` (top to bottom): "Call the landlord" −18, "Pay the invoice" −4, "Export the icons" 10, "Book the flights" 26, "Renew the domain" 14, "Reply to Nadia" 0. `TODO_TOWER_MORE`: "Water the plants", "Send the estimate", "Book the studio", "Back up the laptop".

## Layout and look

- Root: column, items centred, 16px gap.
- Pile area: 300×340, relative, column, centred, `justify-content: flex-end`, 4px bottom padding, overflow visible.
- Shelf: absolute bottom, 260×3, rounded, `translateY(100%)`, `#d2d2d7` (dark `#3a3a3c`).
- Brick: 190×42, radius 12px, 12px horizontal padding, row with 10px gap, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.04)` (dark `0 0 0 1px rgba(255,255,255,.1), 0 2px 4px rgba(0,0,0,.4)`), `cursor: grab` (grabbing while active).
- Checkbox: 18×18 button, radius 5px, 1.5px border. Unticked: border `#c7c7cc`, fill white (dark `#636366` / `#2c2c2e`). Ticked: border and fill `#30d158` with an 11px white check (`M5 12.5l4.5 4.5L19 7.5`, stroke 3.4, round caps) that draws in with `pathLength` 0→1 over 0.25s.
- Label: 14px `#1d1d1f` (dark `#f5f5f7`), truncated. A 1.5px strike line at mid-height grows from 0% to 100% width over 0.25s when ticked.
- Below the pile: a row with 12px gap: pill button "Add a task" (36px tall, 16px padding, 13px medium, `#1d1d1f` bg / white text; dark `#f5f5f7` / `#1d1d1f`, `whileTap` scale 0.94) and the hint "Tick one, or drag one out sideways." 12px `#86868b` (dark `#8e8e93`).

## Motion

- Each brick is a `motion.div` with `layout="position"` inside `AnimatePresence initial={false}`. Transition: `layout` spring stiffness 300, damping 13 (the bouncy drop); everything else spring stiffness 260, damping 16.
- Animate: `y: 0, opacity: 1, x: brick.x (+ tip·18 when tipping), rotate: tip ? tip·24 : 0`.
- Entry (new bricks only): from `y −300, opacity 0, rotate spin`, where `spin` is a random −5…5° chosen when the brick is created (never during render).
- Tipping: `transform-origin` becomes `0% 100%` for a rightward tip, `100% 100%` for leftward (it pivots on its bottom corner over the edge).
- Exits are chosen per brick and passed through `AnimatePresence custom` as a map id → reason, read by a dynamic `exit` variant:
  - done: `opacity 0, scale 0.8, y −30, blur(6px)`, 0.35s.
  - pulled left/right: `x ∓420, opacity 0, rotate ∓8`, 0.4s.
  - tipped: `x dir·140, y 420, rotate dir·80, opacity 0`, 0.75s, ease `[0.5, 0, 0.75, 0]` (accelerating fall).
- Inner card `whileDrag`: scale 1.04, zIndex 10, shadow `0 18px 30px -14px rgba(0,0,0,.35)`.

## Interaction and states

- State: list of bricks `{ id, text, x, spin, done?, tip? }` top to bottom, plus the exit map. Mirror the list into a ref (set in an effect) for timers.
- Tick: ignore if already done; mark done, call `onComplete`, remove after 380ms with reason "done".
- Drag: inner card `drag="x"`, `dragSnapToOrigin`, `dragElastic 0.6`. On release, if `|offset.x| > 110` or `|velocity.x| > 700`, remove with "pulled-right"/"pulled-left" by the offset sign; otherwise it snaps back. The checkbox stops pointerdown propagation so it never starts a drag.
- Settle: after every removal, wait 420ms, then scan from the second-to-bottom brick upward: `d = x[i] − x[i+1]`. The first brick with `|d| > overhang` and not already tipping gets `tip = sign(d)`; 520ms later it is removed with "tip-right"/"tip-left", which settles again (chains are possible).
- Add: next label from `moreTasks`, random `x` in −15…15 (rounded), prepended to the top; skip if at `maxBricks`.
- Clear pending timeouts on unmount; keep state updaters pure.

## Autoplay demo

Every 1900ms, with a counter `k`: if 2 or fewer bricks remain or `k % 4 === 3`, add a task; otherwise tick the brick at index `min(len − 2, 1 + k % (len − 1))`. Any pointerdown or keydown on the root stops it for good.

## Accessibility

- Checkbox: `button` with `aria-label="Complete {text}"` and `aria-pressed`; 2px focus ring `#0071e3` (dark `#0a84ff`), also on the Add button (2px offset). Shelf is `aria-hidden`.

## Acceptance checklist

- [ ] Six offset bricks sit on a grey shelf; nothing animates on mount.
- [ ] Ticking draws the check, strikes the text, then the brick blurs upward away and the pile drops with a visible bounce.
- [ ] Dragging past 110px (or flicking) throws the brick off sideways; a short drag snaps back.
- [ ] After a removal, a brick overhanging its neighbour by more than 24px pivots on its corner and falls off.
- [ ] "Add a task" drops a new brick from above onto the top; nothing happens at 8 bricks.
- [ ] Autoplay ticks and adds every 1.9s and stops on the first touch or key press.
