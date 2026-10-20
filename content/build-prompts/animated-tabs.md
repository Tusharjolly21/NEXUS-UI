# Animated Tabs

Build a settings panel with a segmented tab control on top and a card of toggle rows below. The tab thumb slides between options, the rows slide in from the side you moved toward (and out the other way), the card smoothly resizes to fit the new number of rows, and each row has an iOS-style switch whose knob stretches while pressed and springs across. It should feel exactly like a native iOS settings screen.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`, `layoutId`, variants with `custom`).
- File: `components/animated-tabs/animated-tabs.tsx`. Named exports: `AnimatedTabs` (+ `AnimatedTabsProps`) and a reusable `Switch` (+ `SwitchProps`).

## API

`AnimatedTabs`:

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#34c759"` | Colour of a switch that is on. |
| `autoplay` | `boolean` | `false` | Flips switches and changes tabs by itself until the user interacts. |

`Switch` (controlled):

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `checked` | `boolean` | required | On/off. |
| `onChange` | `(v: boolean) => void` | required | Called with the new value on click. |
| `label` | `string` | required | Accessible name. |
| `accent` | `string` | `"#34c759"` | On colour. |

Built-in content (label / hint / initial value):
- **General**: Automatic updates / Install updates overnight / on; Reduce motion / Use simpler transitions / off; Show previews / Display content in lists / on.
- **Notifications**: Mentions / When someone tags you / on; Weekly digest / A summary every Monday / off.
- **Privacy**: Share analytics / Help improve the product / off; Personalized tips / Based on how you work / on; Location access / Only while using the app / off; Read receipts / Let others see when you've read / on.

Keep switch values per tab in state so they survive tab changes.

## Layout and look

- Root: full width, max 420px, vertical flex, 16px gap.
- Segmented control: 3-column grid, radius 12px, 3px padding, bg `#e8e8ed` / dark `#3a3a3c`. Tabs 32px tall, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`. Thumb: white / dark `#636366`, radius 9px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, behind the label.
- Panel card: radius 20px, `overflow: hidden`, white with `0 0 0 1px rgba(0,0,0,.05), 0 10px 30px -18px rgba(0,0,0,.25)`; dark `#2c2c2e` with `0 0 0 1px rgba(255,255,255,.08)`.
- Rows: a list with 1px dividers `#e8e8ed` / dark `#3a3a3c`. Each row: 18px horizontal, 12px vertical padding, 16px gap. Label 15px medium, tracking −0.01em, `#1d1d1f` / `#f5f5f7`; hint 13px `#86868b` / `#98989d`.
- Switch: 51 × 31px, fully rounded, 2px padding. Off track `#e9e9eb` (dark `#39393d`), on track = accent, 200ms colour transition. Knob: 27px tall white pill, 27px wide (34px while pressed), shadow `0 3px 8px rgba(0,0,0,.15), 0 3px 1px rgba(0,0,0,.06)`. Position the knob by switching the track's `justify-content` between `flex-start` and `flex-end`.

## Motion

- Tab thumb: shared `layoutId` (namespaced with `useId`), spring stiffness 420, damping 32.
- Panel height: the card is `layout` with spring stiffness 300, damping 30, so it grows/shrinks to the new row count.
- Panel content: `AnimatePresence mode="popLayout" initial={false} custom={dir}` with one `<ul>` keyed by tab id. `dir` is +1 when moving to a higher index, −1 when lower. Variants: enter `x: dir × 60, opacity 0, blur(4px)`; center `x 0, opacity 1, blur(0)`; exit `x: dir × −60, opacity 0, blur(4px)`. Spring stiffness 320, damping 32. Pass `custom` to both `AnimatePresence` and the child so the exiting list uses the current direction.
- Rows: each fades up from `opacity 0, y 6` with delay `0.05 + rowIndex × 0.04s` (default transition).
- Switch knob: `layout` animation driven by the justify change, plus `width` 27 ↔ 34 while pressed, spring stiffness 700, damping 35. Because the knob is anchored to the side it sits on, the stretch extends toward the centre, and on release it springs to the other side.

## Interaction and states

- Clicking a tab sets the direction then the index.
- Switch: pointer down sets pressed (knob stretches), pointer up/leave clears it; click toggles via `onChange(!checked)`.
- Any pointer-down within the component marks it touched.

## Autoplay demo

When `autoplay` is true, run a 1600ms interval that restarts every time the tab changes: on the first tick it flips the switch at row `1 % rowCount` (the second row) of the current tab; on the second tick it moves to the next tab (direction +1, wrapping Privacy → General). So each tab shows one switch flip and then advances. Once touched, the interval clears itself on its next tick.

## Accessibility

- `role="tablist"` with `aria-label="Settings"`; each tab `role="tab"`, `aria-selected`, an id, and `aria-controls` pointing at the panel; the panel is `role="tabpanel"` with that id.
- Each switch is a `<button type="button" role="switch">` with `aria-checked` and `aria-label` equal to the row label.
- Tabs and switches show a 2px `#0071e3` focus-visible outline (switch offset 2px).

## Acceptance checklist

- [ ] The tab thumb slides between General, Notifications and Privacy.
- [ ] Going right, the new rows come in from the right and the old ones leave to the left; going left is mirrored.
- [ ] The card height animates between 3, 2 and 4 rows without a jump.
- [ ] Rows fade up in sequence.
- [ ] Pressing and holding a switch stretches its knob toward the middle; releasing springs it across and the track turns green.
- [ ] Switch values persist when you leave a tab and return.
- [ ] With `autoplay`, a switch flips and then the tab advances, every 1.6s, until you touch it.
- [ ] Dark mode matches the colours above.
