Build an assignee picker: a white pill button that opens a multi-select menu of people. When you tick someone, their avatar flies from its row in the menu into the pill, which grows smoothly to hold it. Past three people the avatars overlap into a stack with a "+N" chip, and the label reads naturally: one first name, "A and B", or "N people". It should feel tidy and springy, like a polished task app.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`).
- File: `components/assign-picker/assign-picker.tsx`, named export `AssignPicker`, plus exported `AssignPickerProps`, `AssignPerson` and an `AssignFace` avatar component.
- Avatars are gradient circles with initials. No images are loaded.

## API

`AssignPerson = { id: string; name: string; role: string; colors: [string, string] }`

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `people` | `AssignPerson[]` | five sample people | Menu entries. |
| `defaultValue` | `string[]` | `[]` | Ids selected initially. |
| `onChange` | `(ids: string[]) => void` | – | Selected ids in pick order. |
| `autoplay` | `boolean` | `false` | Demo loop until the user clicks. |

Sample people: Adam Marsh (Design, `#ff6fd8`→`#ff9f0a`), Priya Raman (Research, `#5ac8fa`→`#5e5ce6`), Nora Wilder (Engineering, `#30d158`→`#0b8f6a`), Marco Bellini (Product, `#ff375f`→`#bf5af2`), June Kato (Marketing, `#ffd60a`→`#ff9f0a`).

## Layout and look

- Root: 300 × 330px, vertical flex, items at the start (top-left anchored).
- Avatar (`AssignFace`): default 28px circle, 2px border white (dark `#1c1c1e`), white 10px semibold initials (first letters of each word, max two), background `linear-gradient(140deg, from, to)`.
- Pill button: 44px tall, fully rounded, 8px left / 14px right padding, 8px gap, 14px medium. Light: white, text `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.08), 0 8px 20px -12px rgba(0,0,0,.3)`. Dark: `#1c1c1e`, text `#f5f5f7`, ring `rgba(255,255,255,.1)`, shadow alpha .8. Focus-visible 2px ring `#0071e3` (dark `#2997ff`).
  - Avatar row: flex with −10px overlap (`-space-x-2.5`). Empty state: a 28px dashed circle (1.5px, `#a1a1a6` / dark `#636366`) with a 12px plus icon (stroke 3, `#86868b` / dark `#8e8e93`).
  - Up to three avatars, z-index `10 − index` so the first is on top. A fourth slot "+N" chip: 28px, 2px border like avatars, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text), 10px semibold.
  - Label: no-wrap. Chevron: 10px, path `M6 9l6 6 6-6`, stroke 3, `#86868b` / dark `#8e8e93`.
- Menu: 280px wide, 8px below the pill, radius 20px, 6px padding, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 40px -24px rgba(0,0,0,.4)` (dark ring `rgba(255,255,255,.08)`, alpha .8), transform origin top left.
  - Rows: full-width buttons, radius 12px, padding 8px 10px, 12px gap, hover/focus `#f5f5f7` / dark `#2c2c2e`. A 30px avatar, then name (14px medium, `#1d1d1f` / `#f5f5f7`) over role (12px, `#86868b` / `#8e8e93`), then a 20px checkbox, radius 6px.
  - Checkbox off: white with inset 1.5px `#c7c7cc` (dark `#1c1c1e` with `#48484a`). On: filled and ringed `#1d1d1f` (dark `#f5f5f7`) with an 11px check (path `M5 12.5l4.5 4.5L19 7.5`, stroke 3.4, round caps/joins) in white (dark `#1d1d1f`). Transition background and shadow with CSS over 300ms so theme changes apply.

## Motion

- Pill: `layout` with spring stiffness 420, damping 32, so its width springs as content changes. The avatar row is `layout`; label and chevron are `layout="position"`.
- Avatar row children live in `AnimatePresence initial={false} mode="popLayout"`. Plus icon and "+N" chip scale 0 → 1 in and 1 → 0 out.
- Fly-in: when ticking a person, measure their row avatar and the pill with `getBoundingClientRect` and store an offset `x = row.left − pill.left − 10 − min(currentCount, 3) · 18`, `y = row.top − pill.top − 6` in state keyed by id. The new pill avatar starts at that offset with scale 1.15 and animates to x 0, y 0, scale 1 (spring stiffness 300, damping 22). Without a stored offset it scales in from 0. Exit: scale 0, opacity 0. Mirror the selection in a ref so the count used for the offset is never stale.
- Chevron rotates 0 → 180° when open.
- Menu: enters from opacity 0, y −6, scale 0.97 and exits the same way; spring stiffness 420, damping 30. Rows enter from opacity 0, x −6 with delay `index · 0.03s`.
- Check path draws with `pathLength` 0 → 1 when ticked.

## Interaction and states

- Pill toggles the menu. Rows toggle selection; order of `chosen` is pick order.
- Label: 0 → "Assign", 1 → first name, 2 → "First and First", 3+ → "N people".
- Escape closes the menu and returns focus to the pill.
- Any pointer down inside the root marks it touched.

## Autoplay demo

Every 900ms run the next step of: open → tick people[1] → people[3] → people[0] → people[4] → close → clear selection, then loop. Once touched, the interval clears itself.

## Accessibility

- Pill: `aria-haspopup="listbox"`, `aria-expanded`, `aria-label` "Assign people" or "Assigned: names".
- Menu `role="listbox"`, `aria-multiselectable`, `aria-label="People"`; rows `role="option"` with `aria-selected`. Avatars are `aria-hidden`.

## Acceptance checklist

- Empty pill shows a dashed plus and "Assign".
- Ticking a row sends its avatar flying from the row into the next slot while the pill widens.
- Two picks read "Priya and Marco"; three or more read "N people".
- A fourth pick adds a "+1" chip instead of a fourth avatar.
- Unticking scales the avatar out and the pill shrinks back.
- Checkbox fills and the check draws on.
- Escape closes the menu.
- Autoplay loops and stops after the first click.
- Dark mode uses `#1c1c1e` surfaces and borders, `#f5f5f7` text.
