# Stagger Menu

Build a "Share" dropdown: a dark pill button whose chevron flips as a frosted menu unfolds from the button's corner, the rows arriving one after another out of a slight blur. A soft highlight glides between rows as you hover or arrow through them, a destructive "Delete" sits in red below a divider that draws itself, and after picking an item the button label rolls to a short confirmation with a green tick before rolling back. It should feel quick, precise and native, like a macOS context menu.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`, `layoutId`).
- File: `components/stagger-menu/stagger-menu.tsx`, named export `StaggerMenu`; export `StaggerMenuProps` and `MenuItem`.

## API

```ts
interface MenuItem { id: string; label: string; icon: ReactNode; danger?: boolean; done?: string }
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `"Share"` | Button label and the menu's accessible name. |
| `items` | `MenuItem[]` | five share actions | Rows. `danger` rows are red and get a divider above; `done` is the confirmation shown in the button (falls back to `label`). |
| `onSelect` | `(id: string) => void` | — | Called with the picked item's id. |
| `autoplay` | `boolean` | `false` | Opens and browses the menu by itself until the user interacts. |

Default items (16px line icons, stroke 1.9, round caps): Copy link → "Link copied" (chain), Send by email → "Draft opened" (envelope), Embed → "Embed copied" (`< >`), Download → "Downloading" (arrow into tray), Delete → "Deleted" (trash, `danger`).

## Layout and look

- Root: `position: relative`, 240 × 290px (room for the open menu).
- Trigger: 40px tall, fully rounded, padding left 16px / right 12px, 8px gap, 14px medium, `overflow: hidden`. Light bg `#1d1d1f` with white text; dark bg `#f5f5f7` with `#1d1d1f` text. Label slot is a flex row with 6px gap. A 12px chevron (`M6 9l6 6 6-6`, stroke 3, round) follows the label.
- Confirmation: a 14px green tick (`M5 12.5l4.5 4.5L19 7.5`, `#34c759`, stroke 3) before the `done` text.
- Menu: absolutely positioned at left 0, top 48px, 220px wide, radius 18px, 6px padding, `backdrop-blur-xl`, `transform-origin: 24px 0` (the button's corner). Light: white/95%, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 50px -18px rgba(0,0,0,.35)`. Dark: `#2c2c2e`/95%, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -18px rgba(0,0,0,.7)`.
- Row: 40px tall, full width, radius 12px, 12px horizontal padding, 12px gap, left-aligned 14px medium, no outline. Normal text `#1d1d1f` / `#f5f5f7`; danger `#ff3b30` / dark `#ff453a`.
- Highlight: fills the row behind icon and text, radius 12px; `#f0f0f3` / dark `#3a3a3c`, or `#ff3b30` at 10% on a danger row.
- Divider before a danger row: 1px tall, 8px horizontal and 4px vertical margin, `#e8e8ed` / dark `#3a3a3c`.

## Motion

- Menu open: from `opacity 0, scale 0.6, y −8, blur(8px)` to rest with spring stiffness 420, damping 30 — it grows out of the button's corner. Close: to `opacity 0, scale 0.85, y −6, blur(6px)` in a quick 0.16s tween. Wrap in `AnimatePresence`.
- Rows: each from `opacity 0, x −10, blur(4px)` to rest with spring stiffness 500, damping 32, delay `0.04 + i × 0.04s`.
- Divider: `scaleX 0 → 1` with delay `0.05 + i × 0.04s` (i = index of the danger row).
- Highlight: a single element with a shared `layoutId` (namespaced via `useId`) rendered inside the hovered row; it glides between rows with spring stiffness 520, damping 38.
- Chevron: rotates 0 ↔ 180° with spring stiffness 400, damping 24; it is `layout` so it slides when the label width changes.
- Button label roll: `AnimatePresence mode="popLayout" initial={false}` keyed by the confirmation text (or a fixed key for the normal label), `layout`; enter from `y 16, opacity 0`, exit to `y −16, opacity 0`, spring stiffness 500, damping 32. The button's `overflow: hidden` clips it. The tick draws `pathLength 0 → 1` in 0.3s.
- Trigger press: `whileTap` scale 0.95.

## Interaction and states

- Clicking the trigger toggles the menu and marks touched.
- Picking a row: close the menu, set the flash text to `done ?? label`, call `onSelect(id)`, clear the flash after 1500ms.
- Hovering or focusing a row moves the highlight there; leaving the menu clears it.
- Outside click: while open, a window `pointerdown` listener closes the menu when the target is outside the root. Remove it on close.
- Keyboard inside the menu: ArrowDown / ArrowUp move focus to the next / previous row, wrapping (`preventDefault`); Escape closes. Enter/Space activate the focused row natively.
- Any pointer-down within the root marks touched.

## Autoplay demo

When `autoplay` is true: 800ms after mount, and every 5200ms after, open the menu, move the highlight across the first four rows at 700, 1080, 1460 and 1840ms, then at 2500ms pick the first item (so "Link copied" rolls into the button and `onSelect` fires). Every step checks touched first; once touched, nothing further runs. Clear all timeouts and the interval on unmount.

## Accessibility

- Trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` pointing to the menu id, and a 2px `#0071e3` focus-visible outline offset 2px.
- Menu: `role="menu"`, `aria-label={label}`; rows `role="menuitem"`, `type="button"`. Focus shows through the gliding highlight (rows have no outline). Icons are `aria-hidden`.

## Acceptance checklist

- [ ] Clicking Share unfolds the menu from the button's top-left corner and flips the chevron.
- [ ] Rows arrive one after another, sliding in from the left out of a blur.
- [ ] The divider above Delete draws itself; Delete is red with a red-tinted highlight.
- [ ] The highlight glides between rows on hover and with the arrow keys, wrapping at the ends.
- [ ] Escape or clicking outside closes the menu with a quick fade.
- [ ] Picking "Embed" closes the menu, rolls the button to a green tick + "Embed copied", and rolls back after 1.5s.
- [ ] With `autoplay`, it opens, browses four rows and picks Copy link on a loop until you click.
- [ ] Dark mode inverts the trigger and uses the dark menu colours.
