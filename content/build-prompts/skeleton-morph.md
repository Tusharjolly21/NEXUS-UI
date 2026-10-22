# Skeleton Morph

Build a content card whose loading skeletons turn into the thing they stood for. Every placeholder is cut to the exact size and position of the content that replaces it, one light sweeps across all of them as if they shared a single glint, and when data arrives each block dissolves into its real content in reading order with nothing shifting. A small button toggles between the two states for demos.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/skeleton-morph/skeleton-morph.tsx`. Named exports `SkeletonMorph`, `SKELETON_MORPH_LINES`, type `SkeletonMorphProps`. A private `Slot` component does the per-block morph.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `ready` | `boolean` | none | Controlled. When given, the toggle button is hidden and this value decides skeleton or content. |
| `defaultReady` | `boolean` | `false` | Starting state when uncontrolled. |
| `onReadyChange` | `(ready: boolean) => void` | none | Called when the button or autoplay changes the state. |
| `author` | `string` | `"Maya Chen"` | Author name. |
| `initials` | `string` | `"MC"` | Avatar initials. |
| `avatarColor` | `string` | `"#ff9f0a"` | Avatar background. |
| `meta` | `string` | `"4 min read"` | Line under the author. |
| `title` | `string` | `"Designing for the empty state"` | Headline. |
| `lines` | `string[]` | `["The first screen people see is usually blank.", "Make it the most helpful one in the product."]` | Body lines, one skeleton each. |
| `autoplay` | `boolean` | `false` | Flips state on a loop until touched (uncontrolled only). |
| `className` | `string` | `""` | Extra classes on the wrapper. |

## Layout and look

- Wrapper: flex column, 16px gap, width 440px with `max-width: 100%`. Inside: the article card, then a centred toggle button (hidden when controlled).
- Card (`<article>`): padding 20px, radius 26px, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Rows, top to bottom: (1) hero image 180px tall, full width, radius 20px: a `linear-gradient(160deg, #a1c4fd, #c2e9fb 45%, #fbc2eb)` with two wave paths in an SVG (`viewBox 0 0 400 180`, preserveAspectRatio none): `#5f7fb8` at 55% and `#33507f` at 75%; (2) 16px below, a row with 12px gap: a 40px round avatar (initials 14px semibold, `#1d1d1f` on the avatar colour) and a column with 6px gap holding the author (14px semibold, line height 20px, `#1d1d1f` / dark `#f5f5f7`) and the meta (12.5px, line height 14px, `#6e6e73` / dark `#a1a1a6`); (3) 16px below, the title, 21px semibold, line height 26px, tracking -0.02em; (4) 12px below, body lines 14.5px, line height 18px, `#6e6e73` / dark `#a1a1a6`, 8px between lines.
- Skeleton blocks: an absolutely positioned layer covering exactly the block box, bg `#ececf0` / dark `#2c2c2e`, radius 8px (20px for the hero, full round for the avatar). The author and meta slots are `width: fit-content` with min-widths 45% and 30% so the skeleton keeps the text's shape.
- Shimmer: inside each skeleton a full-width gradient `transparent -> white 80% -> transparent` (dark: white 9%), parked at `-100%` left.
- Toggle button: 36px tall pill, 16px side padding, 13px medium, bg `#f5f5f7` / dark `#2c2c2e`, hover `#ececf0` / dark `#3a3a3c`; label "Load content" when loading, "Show loading" when ready.

## Motion

- Both layers of a `Slot` occupy the same box: the real content sits in normal flow (so the box is its true size) and the skeleton overlays it.
- Shimmer: every block animates the gradient from `x: 0%` to `300%` over 1.4s, ease-in-out, repeating with 0.3s repeat delay, each with a small start offset by position (0, 0.05, 0.12, 0.12, 0.08, 0.08) so it reads as one light moving through.
- Content in: while loading it is `opacity 0, y 4, blur(3px)`; when ready it goes to `opacity 1, y 0, blur(0)` over 0.4s after a delay of `k * 0.07 + 0.1` s for the block at reading position `k` (hero 0, avatar 1, author 2, meta 3, title 4, lines 5, 6...).
- Skeleton out: on ready it fades to 0 while growing to scale 1.02 and blurring to 4px over 0.35s with the same `k * 0.07` delay. Going back to loading: the skeleton fades in over the default duration and the content snaps to hidden.
- Reduced motion: no shimmer, no stagger, no blur, scale or slide; a 150ms crossfade only.

## Interaction and states

- Uncontrolled: the button toggles; `onReadyChange` fires. Controlled: the parent drives `ready` and no button shows.
- The card has `aria-busy` while loading and an accessible name of "Loading article", then the title. The hidden real content is `aria-hidden` until ready.

## Autoplay demo

Uncontrolled only, while the card is on screen, the tab is visible and motion is not reduced: stay loading 2.6s, show content 4s, repeat. A pointer press anywhere on the component stops the loop for good.

## Accessibility

- A persistent `sr-only` polite `role="status"` region announces "Loading content" and "Content loaded".
- The toggle is a real button with a 2px outline `#0071e3` (dark `#0a84ff`), 2px offset. Skeleton layers are `aria-hidden`.
- Text colours: meta and body use `#6e6e73` on white (5:1) and `#a1a1a6` on `#1c1c1e`.

## Acceptance checklist

- [ ] The card height never changes between loading and ready.
- [ ] Skeletons match the real content's size and position exactly, including the author and meta widths.
- [ ] One light sweeps across all skeletons in sync.
- [ ] On ready, blocks dissolve to content top to bottom, 70ms apart, with blur clearing.
- [ ] `ready` controlled hides the button; uncontrolled toggles it.
- [ ] Autoplay alternates states, pauses off screen and stops at first touch.
- [ ] Reduced motion shows a still skeleton and a plain crossfade.
- [ ] Dark mode matches the colours above.
