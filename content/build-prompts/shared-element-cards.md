# Shared Element Cards

Build two story cards side by side that open into a sheet with a shared-element transition, App Store "Today" style. The card itself grows into the sheet, the eyebrow and title travel from the card's top-left into the bottom of the sheet's artwork header, and only then does the body text fade up. Closing reverses it: the sheet shrinks back into its card. It should feel continuous and spatial, two clear beats, with a firm spring and no bounce.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layoutId`).
- File: `components/shared-element-cards/shared-element-cards.tsx`, named export `SharedElementCards`; export `SharedElementCardsProps` and `StoryCard`.

## API

```ts
interface StoryCard { id: string; eyebrow: string; title: string; art: string /* any CSS background */; body: string[] }
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `cards` | `StoryCard[]` | two built-in cards | Cards to show (laid out in a 2-column grid). |
| `autoplay` | `boolean` | `false` | Opens and closes the cards by itself until the user interacts. |

Default cards:
1. id `focus`, eyebrow "Get started", title "Find your focus", art `radial-gradient(120% 90% at 20% 10%, #ffd1e0 0%, rgba(255,209,224,0) 60%), radial-gradient(90% 80% at 90% 90%, #c7d7ff 0%, rgba(199,215,255,0) 60%), #f4ecff`. Body: two short paragraphs explaining that shared-element transitions keep people oriented and that each element carries a `layoutId` animated with a spring.
2. id `night`, eyebrow "Tonight", title "Quiet hours", art `radial-gradient(100% 80% at 80% 20%, #5e5ce6 0%, rgba(94,92,230,0) 60%), radial-gradient(90% 90% at 10% 100%, #0a84ff 0%, rgba(10,132,255,0) 55%), #1c1c3a`. Body: two paragraphs — closing works with the button, Escape or clicking outside; open-only content fades in after the shared elements land.

Text colour depends on the card: the card with id `night` uses light text (eyebrow white/60%, title white); all others use dark text (eyebrow black/45%, title `#1d1d1f`).

## Layout and look

- Root: `position: relative`, 340px tall, full width, max 460px. The sheet opens inside this box (not full screen).
- Grid: 2 columns, 12px gap, full height.
- Card: a `<button>`, radius 24px, `overflow: hidden`, left-aligned, background = `art`, shadow `0 18px 40px -22px rgba(0,0,0,.4)`. Text block at the top-left: 20px padding, 4px gap; eyebrow 12px semibold uppercase, tracking 0.08em; title 24px bold, line-height 1.1, tracking −0.025em.
- Scrim: extends 12px beyond the root on every side, radius 28px, white/60% with `backdrop-blur-md` (dark: black/50%).
- Sheet: fills the root, radius 28px, `overflow: hidden`, vertical flex. White with `0 30px 70px -20px rgba(0,0,0,.45)`; dark `#2c2c2e` with `0 0 0 1px rgba(255,255,255,.08), 0 30px 70px -20px rgba(0,0,0,.8)`.
  - Header: 150px tall, background = `art`. Text block pinned to the bottom-left with the same 20px padding and 4px gap; title grows to 28px.
  - Close button: top-right, 16px inset, 32px circle, black/25% with `backdrop-blur-md`, white 12px × icon (stroke 3.2, round caps).
  - Body: scrollable column, 20px horizontal / 16px vertical padding, 12px gap between paragraphs, 15px, line-height 1.5, `#424245` / dark `#d2d2d7`.

## Motion

- One spring for all shared elements: stiffness 300, damping 32.
- Card ↔ sheet: the card button and the sheet share `layoutId = {ns}-{id}-card`, where `ns` comes from `useId` so multiple instances don't collide. Framer interpolates position, size and corner radius between them.
- Text block: the card's text and the sheet's header text share `layoutId = {ns}-{id}-text`; it travels from top-left of the small card to bottom-left of the header and scales up.
- While a card is open, hide its original with `visibility: hidden` (keep it in the layout so the grid doesn't shift).
- Scrim: fades opacity 0 → 1, and back on close.
- Close button: enters from `opacity 0, scale 0.5` with a 0.2s delay (after the shape lands); exits in 0.1s; `whileTap` scale 0.85.
- Body: enters from `opacity 0, y 16` with delay 0.18s, duration 0.35s; exits fast (opacity 0 in 0.08s) so it's gone before the sheet shrinks.
- Cards: `whileHover` scale 1.02, `whileTap` scale 0.97.
- Wrap the scrim and sheet in one `AnimatePresence` so exit animations play.

## Interaction and states

- Clicking a card opens it (state holds the open id or null).
- Close by the × button, clicking the scrim, or pressing Escape (attach a window `keydown` listener only while open, and remove it on close).
- Any pointer-down within the root marks the component touched.

## Autoplay demo

When `autoplay` is true, every 2600ms toggle: if something is open, close it; otherwise open the next card in order (focus, night, focus, …). Once touched, the interval clears itself on its next tick.

## Accessibility

- Cards are real buttons with `aria-label="Open {title}"` and a 2px `#0071e3` focus-visible outline offset 4px.
- The sheet is `role="dialog"`, `aria-modal="true"`, `aria-label={title}`.
- The close button has `aria-label="Close"` and a white focus-visible outline. Escape closes.

## Acceptance checklist

- [ ] Two gradient cards side by side, each with eyebrow and title at the top-left.
- [ ] Clicking a card grows that card into a sheet covering the whole component, with no crossfade or flash.
- [ ] The title visibly travels and grows from the card into the bottom of the header.
- [ ] The close button and body appear only after the sheet settles.
- [ ] Escape, the × and clicking the blurred scrim all close it, shrinking the sheet back into its card.
- [ ] The grid never reflows while a card is open.
- [ ] The "night" card uses white text; the other uses dark text.
- [ ] With `autoplay`, cards open and close in turn every 2.6s until you interact.
