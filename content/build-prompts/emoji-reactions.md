Build a message bubble with a row of emoji reaction chips under it. Tapping a chip adds or removes your reaction: it tints with an accent colour, the emoji pops with sparks, and the count rolls its digits. A smiley-plus button ends the row and opens a pill picker of emojis; choosing one adds a chip (or joins an existing one) and the others make room. A chip whose count reaches zero shrinks away. The feel is snappy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), `lucide-react` (`SmilePlus`), `cn`.
- File: `components/emoji-reactions/emoji-reactions.tsx`. Named export `EmojiReactions` and types `EmojiReactionsProps`, `Reaction`.

## API

`Reaction = { emoji: string; count: number; reacted?: boolean }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `message` | `ReactNode` | "Shipped the new onboarding flow" | Bubble content; `null` hides it. |
| `reactions` | `Reaction[]` | rocket 3, fire 2 | Starting reactions (state is internal). |
| `emojis` | `string[]` | thumbs up, red heart, face with tears of joy, party popper, fire, rocket, eyes, folded hands | Emojis in the picker. |
| `onChange` | `(reactions: Reaction[]) => void` | none | Called with the new list after every change (tap or pick). |
| `accent` | `string` | `"#5b8def"` | Tint, ring and spark colour. |
| `className` | `string` | none | Extra classes on the root. |

## Layout and look

- Root: `inline-flex flex-col items-start gap-2.5`. Bubble: `rounded-[20px] rounded-bl-md border border-black/[0.06] bg-white px-4 py-2.5 text-[15px] leading-snug text-[#17181a]`, shadow `0 1px 2px rgba(16,17,20,.05), 0 8px 24px -12px rgba(16,17,20,.18)`. Dark: `border-white/10 bg-zinc-900 text-zinc-50`.
- Row: `relative flex flex-wrap items-center gap-1.5`, `role="group"` labelled "Reactions".
- Chip: `h-8 rounded-full border pl-2 pr-2.5 text-[13px] font-medium gap-1.5`, colours transition 200ms. An 18px slot holds the 16px emoji, then the count.
  - Off: `border-black/[0.07] bg-white text-[#3c3b37]`, shadow `0 1px 2px rgba(16,17,20,.05)`, hover `bg-neutral-50`. Dark: `border-white/10 bg-zinc-900 text-zinc-300`, hover `bg-zinc-800`.
  - On: text `#17181a` (dark `zinc-50`), border `color-mix(in srgb, accent 55%, transparent)`, background `color-mix(... 12% ...)`, extra shadow `0 0 0 1px color-mix(... 30% ...)`.
  - Focus: 2px ring in `accent` (`--tw-ring-color`) with 2px offset (white, dark `zinc-950`).
- Add button: `size-8 rounded-full border`, `SmilePlus` 17px stroke 1.8, `text-[#73726d]`, hover `text-[#17181a] bg-neutral-50`, open `bg-neutral-100 text-[#17181a]`. Dark: `border-white/10 bg-zinc-900 text-zinc-400`, hover and open `bg-zinc-800 text-zinc-100`. Same focus ring as chips.
- Picker: absolute under the button, `right-0 top-[calc(100%+8px)] z-20`, `flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white p-1`, shadow `0 2px 6px rgba(16,17,20,.06), 0 16px 36px -12px rgba(16,17,20,.28)` (dark `border-white/10 bg-zinc-900`). Options are `size-9 rounded-full` with a 20px emoji, hover and focus `bg-neutral-100` (dark `bg-zinc-800`).

## Motion

- Chip and layout spring: `{ stiffness: 520, damping: 32 }`.
- Chips use `layout` inside `AnimatePresence initial={false} mode="popLayout"`: enter from and exit to `opacity 0, scale .6`, tap `scale .92`. The row and the add-button wrapper also have `layout`, so the button slides as chips come and go.
- Emoji pop: on each add the emoji remounts from `scale .4, rotate -12` on spring `{ stiffness: 600, damping: 14 }`; not on first render.
- Sparks: six 4px dots at angles `i/6 * 2pi - pi/2`, moving 15px out while fading to 0 and shrinking to `scale .4`, 0.5s ease-out. Odd dots use `accent`, even dots `#ffc94d`. Only when adding.
- Count: each digit is its own slot (`h-[1.25em] w-[1ch]`, overflow hidden), keyed by position from the right so a new leading digit does not shift others. A changed digit rolls: going up, the new one enters from `y 100%` and the old exits to `y -100%`; going down, the reverse. Spring `{ stiffness: 460, damping: 34 }`, opacity 0 at the edges. A digit returning to an earlier value still rolls.
- Picker: from `opacity 0, scale .6, y -8` on spring `{ stiffness: 520, damping: 30 }`, exit to `opacity 0, scale .7, y -6`, origin `calc(100% - 16px) 0%`. Options drop in from `opacity 0, y -6` with a `0.02s * index` delay on spring `{ stiffness: 600, damping: 30 }`; hover `scale 1.35, y -4`, tap `scale .9`.
- Reduced motion: chips and picker only fade; no pop, sparks, digit travel, stagger, hover or tap scale.

## Interaction and states

- Tapping a chip: not yours, count +1 and `reacted` true; yours, count -1 and `reacted` false, and a chip at 0 is removed.
- Picking a new emoji appends a chip (count 1, reacted); picking an existing one that is not yours adds your reaction; picking one already yours only closes the picker.
- The picker closes on a pick, an outside pointer press or Escape (focus returns to the button).

## Accessibility

- Chips are buttons with `aria-pressed` and a label of emoji, count and "reaction(s)", plus ", including yours" when on; the rolling digits are `aria-hidden`.
- The add button has `aria-label="Add reaction"`, `aria-haspopup`, `aria-expanded` and `aria-controls`. Enter, Space or ArrowDown (which also opens it) set keyboard mode: the first option is focused on open and focus returns to the button after a pick.
- The picker is `role="menu"` ("Pick a reaction"); options are `role="menuitem"` labelled "React with <emoji>"; Tab moves between them.

## Acceptance checklist

- [ ] Tapping an unreacted chip tints it, pops the emoji with six sparks and rolls the count up.
- [ ] Tapping again rolls down and clears the tint.
- [ ] A count at 0 shrinks the chip away while the others slide.
- [ ] The picker springs open from the button's right; options drop in one by one and swell on hover.
- [ ] A new emoji appends a chip and the add button slides over.
- [ ] Outside press and Escape close the picker.
- [ ] `accent` recolours tint, ring and sparks; `message={null}` shows only the row.
- [ ] Dark mode swaps bubble, chip and picker surfaces.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Adding a reaction, either by picking an emoji from the picker or by tapping a chip you have not reacted with, plays `pop` from `@/lib/ui-sounds` (a short rising blip, low to high, like a bubble) as the sparks fire. Removing yours by tapping the chip again plays `off` (a soft latch click that falls slightly in pitch) at about half volume.
- Opening the picker and hovering over emojis are silent, and so is a pick of an emoji you have already reacted with (nothing changes).
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

> The Emoji Reactions page has 2 variants. The brief above rebuilds the original Emoji Reactions; the sections below rebuild the Motion Kit Spark Reactions variant.

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

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Adding a reaction, from the picker or by tapping a pill that is not yours yet, plays `pop` from `@/lib/ui-sounds` (a short rising blip, low to high, like a bubble) as the icon pops and sparks. Removing yours by tapping your pill plays `off` (a soft latch click that falls slightly in pitch) at about half volume.
- The autoplay loop plays the same `pop` and quieter `off` as it adds and removes reactions, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Opening the picker is silent; nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
