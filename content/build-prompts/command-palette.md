Build a dark command palette that opens as a modal. A pill in the middle of a dark stage says "Quick Actions" with a keyboard hint; clicking it or pressing Cmd/Ctrl+K fades in a dimmed backdrop and scales a search panel in from slightly above. The panel has a search field, a filterable list of ten commands with icon boxes, descriptions and action hints, and a footer of key hints. Choosing a command, pressing Escape, clicking the backdrop or clicking the ESC chip closes it. The feel is a quick, restrained launcher.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS (v4 spacing scale), framer-motion (`motion`, `AnimatePresence`), `cmdk` (root and input), `@radix-ui/react-dialog` (`Root`, `Portal`, `Overlay`, `Content`, `Title`), `lucide-react`, the `cn` helper.
- List parts come from the shadcn command wrappers: `CommandList`, `CommandItem`, `CommandEmpty` in `@/components/ui/command`. Plain cmdk `Command.List`, `Command.Item` and `Command.Empty` work too.
- File: `components/command-palette/command-palette.tsx`. Named and default export `CommandPalette`, type `CommandPaletteProps`.

## API

- `className?: string` on the root. Nothing else is configurable; the commands are a constant list in the file.
- The root is `relative h-full w-full bg-[#111111]`, so the parent must give it a height.
- Commands (label, description, action hint, lucide icon, value): Home "Go to homepage" Open Home `home`; Dashboard "View your dashboard" Open LayoutDashboard `dashboard`; Features "Scroll to features" Open Sparkles `features`; Settings "Manage preferences" Open Settings `settings`; Profile "View your profile" Open User `profile`; New Document "Create a new file" Create FilePlus `new-doc`; New Project "Start from scratch" Create FolderPlus `new-project`; Invite Member "Add to your team" Invite UserPlus `invite`; Copy Email "support@nexus-ui.com" Copy Copy `copy-email`; Toggle Dark Mode "Switch appearance" Toggle Moon `dark-mode`.

## Layout and look

- Everything is dark regardless of theme.
- Trigger pill: centred absolutely in the root, inline width 220px, `flex items-center gap-2.5 rounded-full bg-[#1e1e1e] px-4 py-2.5 shadow-lg ring-1 ring-white/10`, hover `bg-[#272727]`. A 15px search icon (`text-gray-500`), "Quick Actions" (`flex-1 text-left text-sm font-medium text-gray-300`), and a `kbd` reading "⌘ K" (`rounded border border-white/10 bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-gray-400`).
- Backdrop: `fixed inset-0 z-50 bg-black/55`.
- Panel wrapper: fixed, centred both ways, `z-50 w-full max-w-135 px-4 sm:px-0` (`max-w-135` is 33.75rem on Tailwind 4; use `max-w-[540px]` otherwise).
- Panel: `overflow-hidden rounded-xl bg-[#1c1c1c] shadow-[0_24px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.07]`.
- Search row: `flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5`. A 16px search icon, a transparent input (`flex-1 text-sm text-white placeholder:text-gray-600`, no outline, placeholder "Search commands..."), and an "ESC" button (`rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-gray-500`, hover `bg-white/10`).
- List: `max-h-[400px] overflow-y-auto py-1`. Empty state "No results found." (`py-10 text-center text-sm text-gray-600`).
- Row: `mx-2 flex items-center gap-3.5 rounded-lg border border-transparent px-3 py-2.5`, 1px gap between rows. Selected: `border-white/[0.08] bg-white/[0.06]`. If you use the shadcn `CommandItem`, make sure its own `data-selected:bg-muted` does not win.
  - Icon box: `size-9 rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]` (selected `bg-white/[0.1]`), 16px icon `text-gray-400` (selected white).
  - Text: label `truncate text-sm font-medium text-gray-200` (selected white), description `truncate text-xs text-gray-600` (selected `text-gray-400`).
  - Action hint at the right: `text-xs text-gray-700` (selected `text-gray-400`); selected rows add a "↵" after it with `ml-1`.
- Footer: `flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5`. Left, 11px `text-gray-600` hints at `gap-4`: "↑↓ Navigate", "↵ Select", "Esc Close", each key in a mono `kbd`. Right, "Command Center" at 11px `text-gray-700`.

## Motion

- Easing `[0.16, 1, 0.3, 1]`.
- Trigger pill: mounts from `opacity 0, y 8` over 0.4s; hover `scale 1.03`, tap `scale 0.97`.
- Backdrop: opacity 0 to 1, exit back, 0.15s.
- Panel: from `opacity 0, scale .96, y -8` to rest, 0.18s; exit reverses. Radix parts use `forceMount` inside `AnimatePresence` so the exit plays.
- Selection has no animation: highlight, icon and text colours switch immediately.
- There is no reduced-motion handling.

## Interaction and states

- Cmd/Ctrl+K on `window` toggles the palette (and prevents default). Clicking the pill opens it. 50ms after opening, the input is focused.
- Typing filters with cmdk's default fuzzy filter, which matches the item `value` slug (for example `new-doc`), not the label or description. No match shows the empty state.
- Arrow keys move the selection and Enter or a click runs it; the first row starts selected. Running any command only closes the palette.
- Escape (also handled on the cmdk root), a backdrop click and the ESC button close it. Radix traps focus while open and restores it afterwards.

## Accessibility

- Radix gives `role="dialog"`, a focus trap and Escape handling; an `sr-only` title "Command Palette"; `aria-describedby` is set to undefined.
- cmdk supplies the listbox and option roles and `aria-selected`.
- The pill is a native button named by its text.

## Acceptance checklist

- [ ] Pill centred on a near-black stage; Cmd/Ctrl+K opens and closes the palette.
- [ ] Panel scales in from 0.96 with a small upward offset and the backdrop fades.
- [ ] Input is focused on open; typing "new" leaves New Document and New Project.
- [ ] Arrows move a subtle highlight; the selected row shows white text and the Enter glyph.
- [ ] "No results found." appears for nonsense input.
- [ ] Enter, Escape, ESC chip and backdrop click all close it, with an exit animation.
- [ ] Panel fits at 320px with 16px side padding.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it) on `CommandPalette`.
- Opening the palette, by clicking the pill or pressing Cmd/Ctrl+K while it is closed, plays `pop` from `@/lib/ui-sounds` at 70% volume (a short blip that rises quickly in pitch). Moving the highlight with Arrow Up/Down, Home or End plays `tick` at 40% (a tiny dry high click), only when the highlight really moved and no more than once every 40ms. Running a command, by Enter or click, plays `tap` (a short soft thump that falls in pitch, with a hint of click).
- Closing (Escape, backdrop, ESC chip, the shortcut again), typing and hovering rows are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

> The Command Palette page has 2 variants. The brief above rebuilds the original Command Palette; the sections below rebuild the Motion Kit Command Morph variant.

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

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it) on `CommandMorph`.
- Running a command, or opening a group page, by Enter or click, plays `tap` from `@/lib/ui-sounds` (a short soft thump that falls in pitch, with a hint of click). Moving the highlight with Arrow Up/Down plays `tick` at 40% (a tiny dry high click), only when the highlight really moved and no more than once every 40ms. Going back a page, with Backspace on an empty field, Escape or the breadcrumb chip, plays `tick` at 40%. With `hotkey` on, Cmd/Ctrl+K plays `pop` at 70% (a short blip that rises quickly in pitch) as the field takes focus.
- The autoplay walkthrough plays the same sounds for its beats (`tick` at 40% when it moves the highlight or goes back a page, `tap` when it opens a group page or runs a command), through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Typing in the field, including the walkthrough's typing, and hovering rows are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
