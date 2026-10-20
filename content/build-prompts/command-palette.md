<!-- Command Palette: Motion Kit variant brief -->

> The Command Palette page has 2 variants. The original Command Palette source is on the page; this brief rebuilds the Motion Kit Command Morph variant.

---

<!-- variant: command-morph -->

# Command Morph

Build an inline ⌘K-style command palette that moves as one object. A highlight slides between rows, the panel springs to the height of its results, and opening a group slides a new page in from the side while a breadcrumb chip pops into the search field. Arrow keys move, Enter runs, Backspace on an empty field goes back. The feel is a calm, Apple-like launcher.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`, `layoutId`).
- File: `components/command-palette/command-morph.tsx`. Named export `CommandMorph`, plus the `CommandItem` type and a `DEFAULT_COMMANDS` array.

## API

`CommandItem = { id: string; label: string; hint?: string; icon: string; crumb?: string; children?: CommandItem[] }`. `icon` is SVG path data for a 24×24 stroked icon; `crumb` is the breadcrumb text (defaults to `label`); items with `children` open a page.

Default commands: "Change theme" (crumb "theme"; children Light, Dark, Match system), "Invite teammates" (hint ⌘I), "Open project" (crumb "project"; children Website relaunch, Mobile app, Brand refresh), "New document" (hint ⌘N), "Log out".

`CommandMorph` props:

- `commands?: CommandItem[]`, default `DEFAULT_COMMANDS`.
- `placeholder?: string`, default `"Type a command…"` (nested pages always show `"Search…"`).
- `onSelect?: (command: CommandItem, path: CommandItem[]) => void`: called when the user runs a leaf command; `path` is the open groups.
- `hotkey?: boolean`, default `false`: opt-in. When true, Cmd/Ctrl+K anywhere focuses and selects the search field. When false there is no window listener at all.
- `autoplay?: boolean`, default `false`.
- `className?: string` on the outer box.

## Layout and look

- Outer box: 330×340 (`max-width: 100%`), content aligned to the top centre, 8px top padding.
- Panel: width 320px (`max-width: 100%`), radius 22px, `overflow: hidden`, white, shadow `0 0 0 1px rgba(0,0,0,.07), 0 30px 60px -28px rgba(0,0,0,.45)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 30px 60px -28px rgba(0,0,0,.9)`.
- Field row: flex, 8px gap, 16px × 12px padding, bottom border `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`).
  - Search glyph 16px, stroke 2.4, round caps, `#86868b` (dark `#98989d`).
  - Breadcrumb chips, one per open group: radius 6px, 8px × 2px padding, `#f0f0f3` (dark `#2c2c2e`), 12px medium, `#1d1d1f` (dark `#f5f5f7`).
  - Input: 28px tall, flexes, transparent, 15px, text `#1d1d1f` (dark `#f5f5f7`), placeholder `#a1a1a6` (dark `#8e8e93`), no outline.
  - A decorative `⌘K` kbd: radius 6px, 6px × 2px padding, `#f0f0f3` (dark `#2c2c2e`), 11px, `#6e6e73` (dark `#a1a1a6`).
- List: 6px padding. Each row: flex, 12px gap, 12px × 10px padding, radius 12px, 14px text `#1d1d1f` (dark `#f5f5f7`); a 16px icon (stroke 2, round caps and joins, `#6e6e73`, dark `#a1a1a6`); the label (flexes, truncates); an optional hint 12px `#86868b` (dark `#98989d`); a `›` for groups in the same grey.
- Highlight: absolutely filling span behind the active row's content, radius 12px, `#f0f0f3` (dark `#2c2c2e`).
- Empty state: "No commands match.", centred, 12px × 24px padding, 13px `#86868b`.
- Ran confirmation: a strip under the list with a top border (same colour as the field border), 16px × 10px padding, 8px gap, 13px `#248a3d` (dark `#30d158`), a 14px check (stroke 3) then the command's label.

## Motion

- Panel: `layout`, spring stiffness 420, damping 34, so its height follows the results. The field row uses `layout="position"`.
- Highlight: rendered only inside the active row with a per-instance `layoutId` (`cmd-hl-${useId()}`), spring stiffness 520, damping 38.
- Pages: one `ul` per page keyed by the open path (`"root"` at the top), inside `AnimatePresence mode="popLayout" initial={false}` with `custom={dir}`. Variants `in: x = dir · 60, opacity 0` and `out: x = dir · −60, opacity 0`, animate to `x 0, opacity 1`, spring stiffness 420, damping 36. `dir` is 1 going in, −1 going back.
- Breadcrumb chips: `AnimatePresence initial={false} mode="popLayout"`, each chip `layout`, enters from `opacity 0, scale 0.6, x 20`, exits to `opacity 0, scale 0.6`.
- Ran strip: `AnimatePresence`, `layout`, height 0 to auto with opacity. It clears after 1400ms (1000ms in the demo); keep the timer in a ref and clear it on unmount.

## Interaction and states

- Typing filters the current page by case-insensitive label match and resets the highlight to the first row. The active index is clamped to the list length at render.
- ArrowDown / ArrowUp move the highlight (no wrap); Enter runs the highlighted row; Backspace on an empty field pops one page; Escape clears the query, or pops a page if it is already empty.
- Running a group pushes it, clears the query and highlights row 0. Running a leaf shows the ran strip and calls `onSelect`.
- Hovering a row highlights it; clicking runs it. Rows use `onMouseDown preventDefault` so focus stays in the input. Clicking a breadcrumb chip goes back one page.
- Keyboard handling lives on the input only; nothing listens on the page unless `hotkey` is true.

## Autoplay demo

With `autoplay`, every 900ms run the next step, looping: highlight 1, highlight 2, open the second group ("Open project"), highlight 1, show the ran strip for its second child ("Mobile app"), back home, type the first 2 then 4 letters of the first group's last word ("th", "them"), open the first group, highlight 1, back home. With no groups it just moves the highlight. `onSelect` is not called. A `touched` ref is set on pointer down anywhere on the outer box, on any key in the input and on typing; the next tick clears the interval for good.

## Accessibility

- Input is `role="combobox"` with `aria-label="Command"`, `aria-expanded="true"`, `aria-autocomplete="list"`, `aria-controls` pointing at the listbox and `aria-activedescendant` at the active option (ids prefixed with `useId`).
- The list wrapper is `role="listbox"`; rows are `role="option"` with `aria-selected`. Chips are native buttons labelled "Back from {crumb}". Focus rings `focus-visible` 2px `#0071e3` (dark `#0a84ff`).
- A persistent visually hidden `role="status"` region announces the command that ran. Icons and the kbd are `aria-hidden`.

## Acceptance checklist

- [ ] The highlight slides between rows instead of jumping, on hover and with the arrow keys.
- [ ] Opening "Open project" slides the page in from the right and pops a "project" chip into the field; Backspace on an empty field slides back from the left and the chip shrinks away.
- [ ] Filtering shrinks the panel with a spring; "No commands match." shows when nothing matches.
- [ ] Running a leaf shows a green check strip that collapses after 1.4s and calls `onSelect(cmd, path)`.
- [ ] Cmd/Ctrl+K does nothing to the page unless `hotkey` is set.
- [ ] Autoplay walks the script every 0.9s and stops for good on the first pointer down or key press.
- [ ] Two instances on a page each animate their own highlight.
- [ ] At 296px wide nothing overflows; long labels truncate.
- [ ] Dark mode swaps panel, chips, highlight, text, borders and shadow.
