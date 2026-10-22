# Card Rail

Build a horizontal rail of tall gradient cards that feels physical. Swipe, scroll or use the arrows (it snaps), cards ease up to full size as they reach the front, a bar underneath tracks where you are, and opening a card grows it into a detail panel that shrinks back into its slot when you close it. It should feel Apple-light, quick and calm, in light and dark mode.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, `useScroll`, `useSpring`, `useReducedMotion`), a `cn` helper and a `useSound` hook that plays short synthesised sounds (Web Audio, no files).
- File: `components/blocks/card-rail.tsx`, named export `CardRail`, types `CardRailProps` and `CardRailCard`, and the demo array `DEFAULT_CARD_RAIL_CARDS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `cards` | `CardRailCard[]` | 6 demo cards | `{ id, kicker, title, body, colors: [from, to] }`. Keep both gradient colours dark enough for white text. Use a stable array. |
| `label` | `string` | `"Features"` | Accessible name for the section. |
| `autoplay` | `boolean` | `false` | Scrolls the rail and opens then closes cards on a loop until the visitor touches the section. Pauses off screen and in a hidden tab. Never runs under reduced motion. |
| `enableSound` | `boolean` | `true` | Lift when a card opens, drop when it closes. Follows the site-wide sound switch. |
| `className` | `string` | none | Extra classes on the section. |

Demo cards (kicker, title, gradient): Motion, "Springs that feel right", `#0a6fe0` to `#5e5ce6`. Layout, "Things travel, never jump", `#1a7f37` to `#0a6fe0`. Gestures, "Drag, fling, pinch", `#b84f08` to `#c4264a`. Access, "Respects reduced motion", `#0a7ea4` to `#1a7f37`. Code, "One file, yours to edit", `#8e3cc0` to `#c4264a`. Themes, "Light and dark", `#1d1d1f` to `#5e5ce6`. Bodies are one or two sentences each, for example "Every component ships with tuned springs. Change one number to make it heavier or snappier."

## Layout and look

- Root `<section aria-label>`: full width, white / `#000`, padding 48px vertical and 16px horizontal (64px and 24px from `sm`). Inside, a `relative` column `max-w-[1100px]`.
- Rail: a `<ul>` that is a flex row, gap 14px, `overflow-x: auto`, `scroll-snap-type: x mandatory`, native smooth scrolling, padding 4px sides, 4px top, 8px bottom, scrollbar hidden. Each `<li>` is `flex: none; scroll-snap-align: start`.
- Card: a `<button>` 260px x 340px, radius 26px, padding 20px, text left, white text, background `linear-gradient(160deg, from, to)`, hairline `0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.1)`). Top: the kicker, 12px semibold uppercase, tracking 0.14em, white at 90%; below it 8px, the title 26px semibold, line-height 1.1, tracking -0.03em. Bottom right (20px inset): a 36px round `white/20` badge with backdrop blur and a 14px plus icon.
- Panel (opened card): absolutely positioned over the rail at top 4px, horizontally centred, `max-w-[520px]`, 8px side inset, height 340px, radius 26px, padding 24px, same gradient. Kicker the same, title 30px, body 16px / 1.5, white at 90%, max width 380px, 16px below the title. A 36px round `white/20` close button at top 20px right 20px with a 12px cross.
- Scrim: covers the whole rail block (radius 28px), `white/70` (dark `black/60`) with a small backdrop blur.
- Controls under the rail, 16px gap above, 4px side padding, `flex`, gap 12px: a 4px tall rounded progress track (`#e5e5ea`, dark `#3a3a3c`) filled `#1d1d1f` (dark `#f5f5f7`) with `origin-left`, then two 40px round chevron buttons (`#f5f5f7` hover `#ececf0`; dark `#2c2c2e` hover `#3a3a3c`).

## Motion

- Front-of-rail focus: on scroll and resize (throttled to one animation frame) measure each card against the rail's left edge: `d = |cardLeft - railLeft - 4| / cardWidth`, `focus = max(0, 1 - d * 0.6)`. Each card animates to `scale = 0.9 + focus * 0.1` and `opacity = 0.55 + focus * 0.45` with a spring (300/30). Press scale is 0.97.
- Progress: `useScroll({ container: rail })` gives `scrollXProgress`; the bar's `scaleX` is `useSpring(scrollXProgress, { stiffness: 200, damping: 30 })`.
- Open/close: the card, its kicker and its title have `layoutId`s (`rail-<id>`, `rail-k-<id>`, `rail-t-<id>`) shared with the panel inside one `LayoutGroup`, so the card grows into the panel and shrinks back into its slot (panel spring 320/32). The body fades up 10px with a 0.15s delay; the close button fades in rotating from -45 degrees; the scrim fades.
- Arrows scroll the rail by one card width plus the 14px gap, smoothly.
- Autoplay loop (about 5.4s per card): bring card N to the front by scrolling the rail, open it after 1.1s, close it at 3.9s, then continue with the next card, wrapping around.

## Interaction and states

- Click or press Enter/Space on a card to open it. Close with the close button, the scrim or Escape.
- While a panel the visitor opened is up, the rail and arrows are `inert` and the close button receives focus; on close, focus returns to the card that was opened. A panel opened by autoplay does not steal focus and does not make the page inert.
- Any pointer press, key press or wheel inside the section marks it touched and stops autoplay for good.
- Responsive: the rail simply scrolls; the panel is at most 520px wide and centres on wide screens.

## Autoplay demo

The preview renders `<CardRail autoplay />`: the rail scrolls to each card in turn, opens it into the panel, closes it, and moves on, until the first interaction.

## Accessibility

- Each card is a real button labelled "<title>. Open details" with `aria-haspopup="dialog"`, inside a list. The panel is `role="dialog"` named by the card title, `aria-modal` when the visitor opened it. Decorative badge, icons and scrim are `aria-hidden`. The progress bar is `aria-hidden` (the arrows and native scrolling are the controls).
- Focus outline on cards and arrows: 2px `#0071e3` (dark `#0a84ff`), 2px offset. Escape works from anywhere while the panel is open. White text on every default gradient is at least 4.5:1.
- Reduced motion (`MotionConfig reducedMotion="user"` plus `useReducedMotion`): no autoplay, the panel appears without the grow animation, rail scrolling is not smoothed. Everything is still reachable.

## Sound

- `lift` at volume 0.5 when the visitor opens a card; `drop` at 0.5 when they close the panel (button, scrim or Escape). One sound per action.
- Autoplay uses `play.auto("lift", 0.5)` and `play.auto("drop", 0.5)` at the same moments; these stay silent until the visitor has used the page. No sound for scrolling, arrows or hover.

## Acceptance checklist

- [ ] `<CardRail />` renders six cards with no props; the card at the front is full size and the others are slightly smaller and dimmer.
- [ ] Swiping, wheel and arrow buttons scroll the rail with snapping; the bar tracks progress.
- [ ] Opening a card grows it into the panel (same colours, kicker and title travelling); closing shrinks it back into its slot.
- [ ] Escape, the close button and the scrim all close it, and focus returns to the card.
- [ ] While the panel is open the cards behind cannot be tabbed to.
- [ ] With `autoplay` it demos itself and stops on the first touch; it pauses off screen.
- [ ] Dark mode swaps section, bar, arrows and scrim.
- [ ] Reduced motion: no autoplay and no grow animation, same content.
- [ ] Lift and drop sounds play once per open and close by the visitor.
