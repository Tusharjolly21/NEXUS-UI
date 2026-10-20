<!-- Emoji Reactions: Motion Kit variant brief -->

> The Emoji Reactions page has 2 variants. The original Emoji Reactions source is on the page; this brief rebuilds the Motion Kit Spark Reactions variant.

---

<!-- variant: spark-reactions -->

# Spark Reactions

Build a row of message reactions under a chat bubble. Tap a reaction pill to add or remove yours: the pill tints blue, the count rolls up or down, and the icon pops with a ring of tiny sparks in its own colour. A smiley button at the end opens a picker of six icons; choosing a new one makes it slide into the row while the others make room, and a reaction whose count reaches zero shrinks away. The feel is light and snappy, with stiff springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`layout`, `AnimatePresence` with `mode="popLayout"`, keyframe arrays).
- File: `components/emoji-reactions/spark-reactions.tsx`. Named export `SparkReactions`, plus the `SparkReaction` and `SparkReactionOption` types and `DEFAULT_SPARK_OPTIONS` / `DEFAULT_SPARK_REACTIONS` arrays.

## API

`SparkReactionOption = { id: string; label: string; d: string; color: string; darkColor?: string }` (`d` is path data on a 24×24 grid drawn as a stroke; `darkColor` replaces `color` in dark mode).

`SparkReaction = { id: string; count: number; mine: boolean }`.

`SparkReactions` props:

- `message?: string`, default `"Shipped the new onboarding flow"`.
- `reactions?: SparkReaction[]`: starting row. Default rocket 3, fire 2, both not mine.
- `options?: SparkReactionOption[]`: the picker and icon set. Default:
  - `rocket`, "Rocket", `#5e5ce6`, `M12 2c3 2 5 6 4 11l-2 3h-4l-2-3C7 8 9 4 12 2zM9 16l-3 3 1-4M15 16l3 3-1-4M12 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z`
  - `fire`, "Fire", `#ff9f0a`, `M12 22c4 0 7-3 7-7 0-4-3-6-4-10-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 7-4 13 0 4 3 7 7 7zM12 22c-2 0-3-1.5-3-3.5S11 15 12 13c1 2 3 3.5 3 5.5S14 22 12 22z`
  - `heart`, "Heart", `#ff375f`, `M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z`
  - `eyes`, "Eyes", `#1d1d1f` (dark `#f5f5f7`), `M7 12a3 4 0 1 0 0 .01M17 12a3 4 0 1 0 0 .01M2 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7zM12 12c0-4 2-7 5-7s5 3 5 7-2 7-5 7-5-3-5-7z`
  - `check`, "Done", `#30d158`, `M5 12.5l4.5 4.5L19 7.5`
  - `party`, "Party", `#bf5af2`, `M3 21l5-14 9 9zM14 3v3M19 5l-2 2M21 10h-3M8 7l9 9`
- `onChange?: (reactions: SparkReaction[]) => void`: called with the new row after a user toggle (not autoplay).
- `autoplay?: boolean`, default `false`.
- `className?: string` on the root.

Toggle rule (pure function): if the id is not in the row, append `{ id, count: 1, mine: true }`; otherwise flip `mine` and add 1 (if it wasn't mine) or subtract 1 (if it was), then drop entries with count 0.

## Layout and look

- Root: column, items start, 8px gap, width 300px (max-width 100%).
- Bubble: radius 20px with a 6px bottom-left corner, padding 10px × 16px, 15px text, background `#f0f0f3` (dark `#2c2c2e`), text `#1d1d1f` (dark `#f5f5f7`).
- Row: a `layout` motion div, relative, flex-wrap, 6px gap.
- Pill: 32px tall, rounded-full, 10px horizontal padding, 6px gap, 13px semibold, text `#1d1d1f` (dark `#f5f5f7`). Background animated: mine `#e8f1fd` (dark `#0f2c4d`), not mine `#ffffff` (dark `#1c1c1e`). Shadow: mine `inset 0 0 0 1.5px #0071e3` (dark `#0a84ff`), not mine `0 0 0 1px rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`). Contents: 16px icon (2px round stroke, no fill, `color`), then the count.
- Count: 20px tall, min-width 10px, `overflow: hidden`, tabular numerals.
- Add button: 32×32 rounded-full, white (dark `#1c1c1e`), icon `#6e6e73` (dark `#a1a1a6`), shadow `0 0 0 1px rgba(0,0,0,.08)` (dark `rgba(255,255,255,.1)`), 16px smiley `M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01`.
- Picker: absolute at left 0, top 40px, z-index 10, rounded-full, padding 6px, 4px gap, white (dark `#2c2c2e`), shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -12px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 14px 30px -12px rgba(0,0,0,.8)`), transform origin left top. Each item: 32×32 rounded-full with an 18px icon, hover background `#f5f5f7` (dark `#3a3a3c`).

## Motion

- Pills: `layout`, inside `AnimatePresence initial={false} mode="popLayout"`. Enter from `scale 0, opacity 0`; exit to the same; `whileTap: { scale: 0.88 }`; one spring for everything including the background colour: stiffness 500, damping 28.
- Icon pop: the icon wrapper animates `scale: [1, 1.5, 1]`, `rotate: [0, -12, 0]` over 0.4s. It is keyed so it replays on each toggle: `pop` state `{ id, n }` with `n` incremented per toggle; the wrapper key is `<id>-<n>` for the popped reaction, plain `<id>` otherwise.
- Sparks (popped reaction only): six 4×4 round dots in the icon's colour, centred, dot `k` moving from `0,0, opacity 1` to `x cos(k/6 · 6.28)·16, y sin(k/6 · 6.28)·16, opacity 0` over 0.5s.
- Count roll: `AnimatePresence mode="popLayout" initial={false}` keyed by the number; enter from `y 14, opacity 0`, exit to `y −14, opacity 0`, spring stiffness 500 damping 30.
- Add button: `layout`, `whileTap: { scale: 0.88 }`.
- Picker: enters from `opacity 0, y 8, scale 0.9`, exits the same, spring stiffness 500 damping 30. Items stagger in from `scale 0` with delay `k · 0.03`s, spring stiffness 600 damping 20; `whileHover: { scale: 1.3, y: -3 }`.
- Dark mode is read from the `dark` class on `<html>` with `useSyncExternalStore` and a `MutationObserver` (server snapshot `false`), for the animated pill background and icon/spark colours.

## Interaction and states

- Click a pill: toggle yours on that reaction, pop it, call `onChange`.
- Click the smiley: open/close the picker. Click a picker icon: toggle that reaction (new ones are appended to the row) and close the picker.
- Escape while the picker is open closes it and returns focus to the smiley.

## Autoplay demo

With `autoplay`, every 1300ms run the next step, looping: toggle rocket; open the picker; close it and toggle heart; toggle fire; toggle heart; toggle rocket; toggle fire. Autoplay steps use functional state updates and do not call `onChange`. A `touched` ref is set on pointer down or key down anywhere on the root; the next tick clears the interval for good. Clear the interval on unmount.

## Accessibility

- Pills are native buttons with `aria-pressed={mine}` and `aria-label` "<label>, <count>".
- The smiley has `aria-label="Add reaction"` and `aria-expanded`. The picker is `role="group"` labelled "Pick a reaction"; each item is a button labelled with the option's label.
- Focus rings: `focus-visible` 2px `#0071e3` (dark `#0a84ff`) on every button; no default outline.

## Acceptance checklist

- [ ] Tapping a pill tints it blue, rolls the count up and pops the icon with six sparks; tapping again reverses it.
- [ ] A reaction that drops to 0 shrinks out and the row closes the gap smoothly.
- [ ] Picking a new icon from the picker slides a new pill in before the smiley.
- [ ] The picker staggers its icons in and they lift on hover.
- [ ] Escape closes the picker.
- [ ] `onChange` reports the full row after each user toggle.
- [ ] Autoplay runs the seven-step loop and stops for good on the first interaction.
- [ ] Dark mode swaps the bubble, pills, smiley, picker and the near-black Eyes icon.
