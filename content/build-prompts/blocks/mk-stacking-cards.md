# Stacking Cards

Build cards that stack as you scroll. Each card pins near the top a little lower than the one before, the next slides up over it, and the cards underneath shrink and dim slightly so the pile reads as depth. Scroll back and they lift off in reverse. It should feel Apple-light and calm, in light and dark mode. The frame scrolls on its own (it is a fixed-height scroll box), so it works the same on a full page and inside a small preview.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useScroll`, `useTransform`, `useReducedMotion`) and a `cn` helper. The stacking itself is native `position: sticky`.
- File: `components/blocks/stacking-cards.tsx`, named export `StackingCards`, types `StackingCardsProps` and `StackingCardItem`, and the demo array `DEFAULT_STACKING_CARDS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `cards` | `StackingCardItem[]` | 4 demo cards | `{ tag, title, body, bg, accent, darkBg?, darkAccent? }`. Set the dark pair for tinted fills. |
| `heading` | `string` | `"Four steps to a site that moves"` | Heading above the stack, inside the scrolling content. |
| `hint` | `string` | `"Scroll inside this box."` | Line under the heading. |
| `label` | `string` | `"Steps"` | Accessible name for the section and the scroll region. |
| `height` | `number` | `540` | Height of the scrolling frame in px. |
| `className` | `string` | none | Extra classes on the section. |

Demo cards (tag, title, body, light fill / accent, dark fill / accent): "01" Plan, "Write the brief, pick the pages, set the tone.", `#eef5ff` / `#0071e3`, `#12263f` / `#5eb0ff`. "02" Compose, "Drop in blocks. Every one already moves well.", `#f3ecff` / `#8944ab`, `#2a1c3d` / `#c792ee`. "03" Tune, "Adjust springs and timing live, then copy the code.", `#e9f9ee` / `#1a7f37`, `#12301f` / `#4cd470`. "04" Ship, "One file per component. Nothing to install but Motion.", `#fff4e5` / `#b25e00`, `#38260f` / `#ffb340`.

There is no `autoplay`: the stack is driven by scrolling the frame.

## Layout and look

- Root `<section aria-label>`: full width, background `#f5f5f7` (dark `#000`), padding 48px vertical and 16px horizontal (64px and 24px from `sm`). Inside, a centred `max-w-[1000px]` card: `overflow: hidden`, radius 24px, white (dark `#1c1c1e`), hairline `0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`).
- Scroll frame: `height` px, `overflow-y: auto`, 16px side padding, focusable `region`. At the top a centred heading (padding-top 40px; `clamp(26px, 4vw, 36px)` semibold, tracking -0.03em, `#1d1d1f` / `#f5f5f7`) and hint (15px, `#6e6e73` / `#a1a1a6`, 8px below). Then a stack container 32px below with 160px bottom padding.
- Each card sits in a wrapper: `position: sticky`, `height: 360px`, flex, centred horizontally, items at the top, `top = 24px + index x 14px`. The card is 300px tall, `w-full max-w-[560px]`, radius 28px, padding 28px, transform-origin top, hairline plus a soft upward shadow `0 0 0 1px rgba(0,0,0,.05), 0 -10px 30px -20px rgba(0,0,0,.25)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 -10px 30px -20px rgba(0,0,0,.9)`).
- Card content: tag 13px semibold tabular in the accent colour; title 8px below, 44px semibold, line-height 1, tracking -0.04em, `#1d1d1f` / `#f5f5f7`; body 12px below, 16px / 1.5, max width 320px, `#424245` / dark `#d1d1d6`. Bottom right (28px inset) a 3x3 grid of 20px rounded (6px) squares, gap 6px, in the accent colour: squares up to index `2 x cardIndex + 2` at 85% opacity, the rest at 12%. A black overlay covers the card for dimming.

## Motion

- `useScroll({ container: frame, target: stack, offset: ["start start", "end end"] })` gives `scrollYProgress` for the whole stack. For card `i` of `n`, with `under = n - 1 - i`: scale goes from 1 at progress `i / n` to `1 - under x 0.05` at progress 1; the black overlay opacity goes from 0 to `under x 0.08` over the same range. The last card never shrinks or dims.
- The pinning itself is CSS `sticky` inside the scroll frame, so it needs no JavaScript and reverses automatically when scrolling back.

## Interaction and states

- Scroll the frame by wheel, touch, scrollbar or keyboard. No clickable elements.

## Autoplay demo

Not applicable: it is scroll-driven. The preview renders `<StackingCards />` and the visitor scrolls the frame.

## Accessibility

- The scroll frame is a labelled, focusable `region` so keyboard users can scroll it. Each card is plain text in reading order (tag, title, body); the square grid and the dim overlay are `aria-hidden`.
- Focus outline: 2px `#0071e3` (dark `#0a84ff`), 2px offset. Light accents on their tinted fills and dark accents on their dark fills are at least 4.5:1.
- Reduced motion (`useReducedMotion`): cards still pin and dim as you scroll but do not shrink.

## Acceptance checklist

- [ ] `<StackingCards />` renders with no props at 540px high showing the heading and the first card.
- [ ] Scrolling the frame pins each card 14px lower than the previous; the next card slides over it.
- [ ] Cards underneath shrink slightly and dim; the top card stays full size and bright.
- [ ] Scrolling back up lifts the cards off in reverse.
- [ ] Works inside a small preview tile and on a full page, with no dependence on page scrolling.
- [ ] Dark mode swaps the card, tinted fills, accents and text.
- [ ] Reduced motion: cards do not shrink; nothing else moves by itself.
