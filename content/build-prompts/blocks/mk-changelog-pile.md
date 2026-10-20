# Changelog Pile

Build a changelog section whose release notes land as a pile of real, physical cards in a soft grey tray. Visitors can pick the cards up and throw them, filter by New / Improved / Fixed (the cards that don't match drop through the floor), or switch to List, where every card glides into tidy masonry columns. Clicking a card opens the full note in a small dialog. It should feel Apple-light, tactile and calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container`, `@xl:`, `@4xl:`), framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), matter-js (`import Matter from "matter-js"`), and a `cn` helper.
- File: `components/blocks/changelog-pile.tsx`, named export `ChangelogPile` and type `ChangelogPileProps`. Also export the `ChangelogEntry` type and `DEFAULT_CHANGELOG_ENTRIES`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `entries` | `ChangelogEntry[]` | 9 demo entries | `{ kind: "New" \| "Improved" \| "Fixed", version, date, title, body, more }`, newest first. Use a stable array. |
| `eyebrow` | `string` | `"Changelog"` | Small blue line above the title. |
| `title` | `string` | `"What's new"` | Heading (`h2`). |
| `description` | `string` | "Everything we shipped since September. Pick the cards up and throw them, or switch to the list to read." | Paragraph. |
| `updatesLabel` | `string` | `"Get updates"` | Subscribe link. |
| `docsLabel` | `string` | `"Read the docs"` | Link in the opened note. |
| `autoplay` | `boolean` | `false` | Cycles the filter in Pile view until the visitor touches the section. |
| `onAction` | `(action: "updates" \| "docs", entry?) => void` | none | Links call `preventDefault` and then this. |
| `className` | `string` | none | Extra classes on the section. |

Demo entries span versions 3.2 (Oct 14), 3.1 (Sep 30) and 3.0 (Sep 12), one New, one Improved and one Fixed each: Command palette, Faster search, Calendar time zones, Dark mode, Bulk edit, CSV export, Shared views, Mobile uploads, Notification badges.

## Layout and look

- `<section>`: `@container`, white / dark black. Inner grid max-width 1240px, centred, one column, gap 24px, padding 20px (32px from `@xl`). From `@4xl` there are two columns `280px 1fr`, the gap is 40px and the padding is 40px.
- Left column (gap 20px): eyebrow 13px semibold `#0071e3` / `#0a84ff`; title `clamp(28px, 3.4cqi, 38px)`, semibold, line-height 1.05, tracking -0.035em, `#1d1d1f` / `#f5f5f7`; description 15px/1.45 `#6e6e73` / `#a1a1a6`.
- Filter pills (All, New, Improved, Fixed, each followed by its count in tabular numbers): 32px tall, 12px horizontal padding, 13px medium. The active pill has a sliding `#1d1d1f` background (dark `#f5f5f7`) with white text (dark black), and the count at 60% opacity. Inactive pills get a `#f5f5f7` / `#1c1c1e` hover background.
- The view switch is a `#f0f0f3` / `#1c1c1e` capsule with 3px padding and two 32px buttons ("Pile", "List", 16px padding). The active button has a sliding white background with `0 1px 3px rgba(0,0,0,.15)` (dark `#3a3a3c`). Beside it is a blue 36px "Get updates" link with a 14px RSS icon.
- Tray: 580px tall (TH), radius 24px, `#f5f5f7` / `#1c1c1e`, `inset 0 2px 8px rgba(0,0,0,.06)`, overflow hidden. Height changes animate with `height .5s cubic-bezier(.2,.8,.2,1)`.
- Card: width 230px (when the tray is under 520px wide: `min(250, trayWidth - 40)`), radius 16px, padding 16px, gap 8px, white / `#2c2c2e`, shadow `0 1px 2px rgba(0,0,0,.06), 0 10px 24px -14px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.04)` (dark: ring `#3a3a3c`). Contents: a kind badge and "v3.2 · Oct 14" at 11px; the title at 15px semibold, tracking -0.01em; the body at 13px/1.4 in grey.
- Badges are rounded-full with 8px x 2px padding, semibold. New `#e8f1fd` on `#0062c4`, Improved `#f3eafd` on `#8a3fd1`, Fixed `#e6f8ec` on `#1a7f37`. In dark mode use translucent tints with lighter text (`#64b5ff`, `#d9a0ff`, `#4cd96e`).
- Note dialog: an overlay covering the tray (`#f5f5f7` at 70% / black at 60%, backdrop blur) holding a 420px card with radius 22px and padding 24px. It shows the badge and "Version 3.2 · Oct 14" at 12px, the title at 24px semibold, then the body and `more` at 15px/1.5, a black "Close" pill and a blue docs link.

## Motion

- Matter engine with gravity y 1.1, stepped at a fixed 1000/60 ms using an accumulator. The accumulator is capped at 100 ms per frame, the loop runs at most 4 steps per frame, and any leftover larger than one step is dropped.
- Static walls (friction 0.5, category FLOOR): a 4000×60 floor centred at y = TH + 30, and side walls 60 wide and TH + 400 tall at x = -30 and x = W + 30. Move the right wall when the tray resizes.
- Each card is a rectangle with chamfer 14, restitution 0.15, friction 0.45, frictionAir 0.015 and density 0.0012. Spawn it at x = `w/2 + 10 + (i·131 mod (W - w - 20))`, y = `-120 - i·90`, angle `((i mod 5) - 2)·0.12`. Each frame, apply `translate(x - w/2, y - h/2) rotate(angle)` to the card.
- Dragging uses a pointer constraint (stiffness 0.1, damping 0.08, length 0). If the pointer moves less than 6px, the release counts as a click and opens the note.
- Filter: matching cards collide with CARD | FLOOR, and the rest get mask 0 so they fall through with a downward velocity of at least 2. Hidden cards are parked at y = TH + 400. Matching cards that were below the tray respawn at a random x, y between -120 and -320, with a random angle of ±0.3 rad.
- List view: stop stepping the engine and lerp each card to its slot (position factor 0.16 per step, angle multiplied by 0.84). The layout is masonry with 1–3 columns of card width plus a 14px gap, centred, filled shortest column first, starting at y 20. The tray grows to fit the tallest column plus 6px. Hidden cards target 300px below the tray.
- Back to Pile: visible cards that sit below `TH - h/2` drop in again from above, and every visible card gets a random angular velocity of ±0.03.
- Filter and view highlights slide with a shared layout spring (stiffness 500, damping 36). The note enters from y 30, scale 0.94, rotate -2° with a spring (stiffness 380, damping 28) and exits to y 20, scale 0.96, opacity 0.

## Interaction and states

- On a narrow tray (< 520px) or with reduced motion, start in List. Under reduced motion, list slots snap into place and the dialog and highlights only fade.
- In Pile view the tray is `touch-none select-none`. In List view it is not, so the page still scrolls on touch.
- In List view, a plain click opens a card. Keyboard activation (`detail === 0`) opens a card in either view.
- Pause the loop when the tray is off screen (IntersectionObserver) or the tab is hidden. On unmount, cancel the rAF, clear the engine and world, and disconnect the observers.

## Autoplay demo

Every 3.2s, while the section is in Pile view, visible, with no note open, cycle the filter New → Improved → Fixed → All. Stop for good after the first pointerdown or keydown inside the section. Autoplay is off under reduced motion.

## Accessibility

- Cards are `<button aria-haspopup="dialog">` inside `<li>` items of a `<ul>`. The label reads "Kind, version X, Date: Title. Body". Filtered-out items are `inert` and `aria-hidden`.
- Filter and view controls are `aria-pressed` buttons in labelled groups. A polite live region announces "Showing 3 Fixed entries" or "List view" only when the user changes them.
- When the dialog opens, Close gets focus and Tab is trapped between Close and the docs link. Escape or a backdrop click closes the dialog and returns focus to the card.
- Focus rings are 2px `#0071e3` / `#0a84ff`, and all text meets 4.5:1 contrast.

## Acceptance checklist

- [ ] Nine cards rain into the tray and settle in a tilted pile.
- [ ] Dragging and throwing a card works, and a click without movement opens its note.
- [ ] "Fixed" drops six cards through the floor, and "All" rains them back in.
- [ ] "List" glides the cards into up to three columns and the tray grows to fit.
- [ ] Narrow widths and reduced motion start in List.
- [ ] Enter on a card opens the note, Escape closes it, and focus returns to the card.
- [ ] `onAction("docs", entry)` and `onAction("updates")` fire, and nothing navigates.
- [ ] Dark mode swaps every surface and keeps the badges readable.
