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

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it) on `AnimatedTabs` and on `Switch`; the tabs pass it down to every switch.
- Choosing a different tab plays `tick` from `@/lib/ui-sounds` at about 60% volume (a tiny dry high click). Each switch plays `on` when it turns on (a short latch click with a blip that rises slightly in pitch) and `off` when it turns off (the same click with a blip that falls).
- Clicking the tab that is already selected is silent. The autoplay loop plays the same sounds for its beats (a `tick` when it changes tab, `on` / `off` when it flips a switch), through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Hover is silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- Animated Tabs: Motion Kit variant brief -->

> The Animated Tabs page has 2 variants. The brief above rebuilds the original Animated Tabs; the sections below rebuild the Motion Kit Elastic Tabs and Document Tabs variants.

---

<!-- variant: elastic-tabs -->

# Elastic Tabs

Build a pill-shaped tab bar whose highlight stretches as it travels. When you pick another tab, the edge of the pill in the direction of travel leaps ahead and the trailing edge catches up a beat later, so the pill elongates and then snaps back to the new tab's width like something elastic. The label text under the pill inverts to the opposite colour exactly where the pill covers it. The panel below slides in from the side you moved toward and its frame eases to the new height.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionTemplate`, `useReducedMotion`), `ResizeObserver`.
- File: `components/animated-tabs/elastic-tabs.tsx`. Named exports `ElasticTabs`, `ElasticTabsProps`, `ElasticTabItem`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `tabs` | `ElasticTabItem[]` | four dashboard tabs | `{ id: string; label: string; content: ReactNode }`. |
| `label` | `string` | `"Dashboard"` | Accessible name of the tab list. |
| `onChange` | `(id: string) => void` | none | Called with the tab id when the selection changes. |
| `autoplay` | `boolean` | `false` | Steps through the tabs every 2.4s until touched. |
| `className` | `string` | `""` | Extra classes on the card. |

Built-in tabs: Overview (three stat tiles: Visitors 48.2k +12%, Signups 1,904 +8%, Revenue $31k +21%), Traffic (a card "Last 14 days / Peak 6.1k" with a blue line chart that draws itself and an end dot that pops in), Reports (three file rows with sizes: Weekly summary.pdf 2 MB, Cohorts, October.csv 640 kB, Funnel breakdown.pdf 1.1 MB, sliding in 50ms apart), Alerts (a sentence card about signups dropping more than 20% below the weekly average).

## Layout and look

- Card: width 480px, `max-width: 100%`, radius 28px, white / dark `#1c1c1e`, 16px padding (20px from the `sm` breakpoint), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Tab bar: `position: relative`, `width: fit-content`, `max-width: 100%`, horizontal scroll if it must, fully rounded, bg `#f5f5f7` / dark `#2c2c2e`, 4px padding. Each tab is a 40px tall, fully rounded button with 12px side padding (20px from `sm`), 13px medium (14px from `sm`), colour `#6e6e73` / dark `#a1a1a6`, hover `#1d1d1f` / dark `#f5f5f7`.
- Pill: absolutely positioned, 4px from the top and bottom, fully rounded, `#1d1d1f` / dark `#f5f5f7`; `left` and `width` come from two motion values.
- Inverted label layer: an absolutely positioned flex row with 4px padding on top of the pill, with the same labels and sizes in white / dark `#1d1d1f`, `pointer-events: none`, `aria-hidden`, clipped with `clip-path: inset(0 calc(100% - R) 0 L round 999px)`.
- Panel frame: 16px below the bar, `overflow: hidden`. Tiles and cards inside: bg `#f5f5f7` / dark `#2c2c2e`, radius 16px (rows 14px), 16px padding; stat value 24px semibold tracking -0.03em, delta 12px medium `#1a7f37` / dark `#30d158`; secondary text 12px `#6e6e73` / dark `#a1a1a6`; chart stroke `#0071e3` / dark `#0a84ff`.

## Motion

- Two motion values `L` and `R` hold the left and right edge of the active tab (its `offsetLeft` and `offsetLeft + offsetWidth`). On a change, compare the new right edge to the current `R`: moving forward, `R` is the leading edge. The leading edge animates with a stiff spring (stiffness 520, damping 34); the trailing edge with a loose spring (stiffness 170, damping 22). The first render sets both without animating.
- A `ResizeObserver` on the bar re-snaps `L` and `R` to the active tab when the bar resizes, ignoring its first (initial) callback so it does not cut a running animation.
- Panel: `AnimatePresence mode="popLayout" initial={false}` with a direction `dir` (+1 to a later tab, -1 to an earlier one) passed as `custom` to both. Enter from `x: dir * 40, opacity 0, blur 4px`; show at `x 0, opacity 1, blur 0`; exit to `x: dir * -40, opacity 0, blur 4px`. Spring stiffness 340, damping 32, opacity and blur 200ms.
- Frame height: a second `ResizeObserver` reads the panel's height into state and the frame animates `height` to it with spring stiffness 300, damping 32.
- Reduced motion: the pill jumps to the new tab, the panel only fades, the frame height changes instantly.

## Interaction and states

- Click a tab to select it. Arrow Left/Right move to the previous/next tab (wrapping) and focus it; Home and End jump to the ends.
- Roving tabindex: only the selected tab is in the tab order.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: advance to the next tab every 2.4s, wrapping. A pointer press or focus inside the card stops it for good.

## Accessibility

- `role="tablist"` with an `aria-label`; each tab has `role="tab"`, an id, `aria-selected` and `aria-controls` the panel; the panel is `role="tabpanel"` with `aria-labelledby` the active tab. Ids come from `useId`, so several instances can share a page.
- The pill and the inverted label layer are `aria-hidden`; the inverted labels are plain spans, not focusable.
- Focus ring: 2px `#0071e3` (dark `#0a84ff`) outline with 2px offset.

## Acceptance checklist

- [ ] Moving right, the right edge leaps ahead while the left edge lags, then catches up; moving left is mirrored.
- [ ] The pill is clipped exactly to the label text inversion; no seam or double text.
- [ ] The panel slides in from the side of travel, and the frame eases to the new height without a jump.
- [ ] Resizing the window keeps the pill on the active tab.
- [ ] Arrow keys, Home and End work; Tab leaves the tab list.
- [ ] Autoplay steps every 2.4s and stops at first touch.
- [ ] Dark mode inverts to a light pill with dark labels.
- [ ] No horizontal overflow at 320px.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Choosing a different tab, by click, arrow keys, Home or End, plays `tick` from `@/lib/ui-sounds` at about 60% volume (a tiny dry high click).
- Choosing the tab that is already selected is silent, and so is hover. Each autoplay step to the next tab plays the same `tick` at the same volume, through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- variant: document-tabs -->

# Document Tabs

Build a document tab strip for editors and dashboards, in a small window. Tabs can be dragged to reorder (the others slide out of the way), closed (neighbours close the gap), and added with a plus button (the new tab grows in from the plus). The active tab flows into the page below it with small curved feet. The address bar and the page content follow whichever tab is active.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `Reorder.Group`, `Reorder.Item`, `useReducedMotion`), `ResizeObserver`.
- File: `components/animated-tabs/document-tabs.tsx`. Named exports `DocumentTabs`, `DocumentTabsProps`, `DocumentTab`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `initialTabs` | `DocumentTab[]` | three demo tabs | `{ id: number; title: string; url: string; color: string; letter: string }`. Closing the last tab brings these back. |
| `onActiveChange` | `(id: number) => void` | none | Called when the active tab changes (not on mount). |
| `autoplay` | `boolean` | `false` | Opens, switches, reorders and closes on a loop until touched. |
| `className` | `string` | `""` | Extra classes on the window. |

Demo tabs: Roadmap `nexus.app/roadmap` `#0a84ff` R; Pricing page draft `nexus.app/pricing` `#bf5af2` P (active at the start); Analytics `nexus.app/analytics` `#30d158` A. New tabs cycle through Docs `#ff9f0a` D, Changelog `#ff375f` C, Settings `#5e5ce6` S (new ids start at 10, picked by `id % 3`). At most 6 tabs; the plus button disables at 6.

## Layout and look

- Window: width 600px, `max-width: 100%`, `overflow: hidden`, radius 22px, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.07), 0 30px 60px -32px rgba(0,0,0,.4)` (dark ring `rgba(255,255,255,.1)`).
- Strip: flex, items at the bottom, bg `#e9e9ee` / dark `#000`, 8px side padding, 8px top padding. It holds a `Reorder.Group` (axis X, `min-width: 0`, `overflow-x: clip`, `role="tablist"`) and then the plus button (28px round, 8px left margin, 6px bottom margin, a 12px plus glyph, hover bg black 5% / dark white 10%).
- Tab (`Reorder.Item`): 40px tall, no wrap, `z-index` 10 when active else 1. Surface: absolutely filling, radius 12px on the top corners; active is white / dark `#1c1c1e`, inactive is transparent with a white 50% (dark white 10%) hover. The active tab has two 10px quarter-circle "feet" SVGs outside its bottom corners in the same fill (the left foot path `M10 0v10H0a10 10 0 0010-10z`, the right `M0 0v10h10A10 10 0 010 0z`). An inactive tab not followed by the active one shows a 1px by 16px divider on its right edge (`#c7c7cc` / dark `#48484a`).
- Tab content: 16px icon square (radius 4px, the tab's colour, 10px bold white letter), then the title (13px, truncated; active is medium `#1d1d1f` / dark `#f5f5f7`, inactive `#6e6e73` / dark `#a1a1a6`), then a 20px round close button (9px cross glyph, hover bg black 10% / dark white 15%). Padding: 12px left when the title shows, 6px right.
- Widths: `room = stripWidth - 52`; `activeW = min(190, max(min(150, room * 0.45), room / n))`; `otherW = max(32, min(190, (room - activeW) / (n - 1)))` (or `activeW` with one tab). Below `otherW` 96px an inactive tab drops to just its icon and no close button; otherwise its close button shows on hover.
- Toolbar: 12px side and 8px vertical padding, bottom border black 5% / dark white 10%, holding an address field: 32px tall, fully rounded, bg `#f5f5f7` / dark `#2c2c2e`, 14px side padding, 13px text, a 11px lock icon in muted grey, then the URL.
- Page: 220px tall, `overflow: hidden`, 20px padding. Header row: a 40px rounded-12 icon in the tab colour with a 16px bold white letter, then the title (18px semibold tracking -0.02em) over "Edited 4 minutes ago" (12px muted). Below, four 12px tall bars at 92, 78, 85 and 60% width with 10px gap; the first is the tab colour at 20% alpha, the others `#f0f0f3` / dark `#2c2c2e`.

## Motion

- Tab widths animate with spring stiffness 420, damping 36. A new tab enters from `width 0, opacity 0`; a closed one exits to the same over 200ms `cubic-bezier(.4,0,.2,1)`. While dragged: scale 1.03, a soft shadow and radius 12.
- Reordering is `Reorder.Group`'s: dragging past a neighbour swaps them and the others glide.
- The plus button has `layout` so it follows the strip as tabs come and go, and `whileTap` scale .9.
- Address: `AnimatePresence mode="popLayout"`; the new URL rises in from `y 12` while the old one leaves to `y -12`, 200ms. Page: the content cross-fades with a 10px rise over 250ms (popLayout); the four bars scale in from X .6 with 50ms stagger.
- Reduced motion: widths use a 120ms tween and the plus button does not animate.

## Interaction and states

- Pointer down on a tab makes it active (even when it begins a drag). The close button stops propagation, closes that tab, and if it was active the neighbour at the same index (or the last) becomes active. Closing the final tab restores `initialTabs` and activates the first.
- Plus adds the next demo tab at the end and activates it; ignored at 6 tabs.
- Keyboard: only the active tab is in the tab order (roving tabindex). Arrow Left/Right focus and activate the neighbour, Home/End the ends, Enter or Space activates, Delete or Backspace closes, Alt+Arrow Left/Right moves the tab and keeps focus on it.

## Autoplay demo

Only while the window is on screen, the tab is visible and motion is not reduced: every 1.6s run the next step of a four-step script: add a tab; activate the second tab; swap the first two tabs; close the newest added tab (id 10 or above). The step index persists across pauses. A pointer press inside the window stops it for good.

## Accessibility

- `role="tablist"` labelled "Open documents" and described by a hidden hint ("Arrow keys switch tabs. Alt with an arrow key moves the tab. Delete closes it."). Each tab is `role="tab"` with `aria-selected`, `aria-controls` the page, and `aria-keyshortcuts="Delete"`; the page is `role="tabpanel"` labelled by the active tab. Ids come from `useId`.
- Close buttons are real buttons labelled `Close <title>`, removed from the tab order (Delete is the keyboard path). Icon-only tabs keep their title as `sr-only` text.
- Focus ring on the active tab: a 2px `#0071e3` (dark `#0a84ff`) outline inset on the tab surface.

## Acceptance checklist

- [ ] Dragging a tab sideways lifts it slightly and the neighbours slide aside; releasing drops it in the new slot.
- [ ] Closing a tab collapses its width and the others expand into the gap; closing the active tab selects its neighbour.
- [ ] Plus grows a new tab in at the end and activates it; at 6 tabs the plus is disabled.
- [ ] The active tab visibly joins the toolbar and page through its curved feet in both light and dark mode.
- [ ] The URL rolls and the page cross-fades when switching tabs.
- [ ] With many tabs the inactive ones shrink to icons without overflowing the strip.
- [ ] Keyboard: arrows, Home/End, Enter/Space, Delete and Alt+Arrow all work.
- [ ] Autoplay loops add, switch, swap, close and stops at first touch.
- [ ] No horizontal overflow at 320px.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Switching to another tab, by pointer press or by keyboard (arrows, Home, End, Enter, Space), plays `tick` from `@/lib/ui-sounds` at about 60% volume (a tiny dry high click). The `+` button plays `pop` at 60% (a short blip that rises quickly in pitch) as the new tab grows in. Closing a tab, with its close button or Delete, plays `swipe` at 40% (a short breath of filtered noise that sweeps from bright to dull). Letting go of a tab after dragging it plays `drop` at 50% (a soft low thud that falls in pitch with a brief landing noise).
- Pressing the tab that is already active, moving a tab with Alt+Arrow and hover are silent. The autoplay loop plays the same sounds for its beats (`pop` when it adds a tab, `tick` when it switches tab, `drop` when it reorders, `swipe` when it closes the new tab), through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
