# Blog with Contents

Build a long-read layout with a contents rail that keeps up with the reader. The active heading slides a marker down the rail, the thin line beside each entry fills as that section is read, a bar at the top of the reader tracks the whole article, and the "min left" counter ticks down. On narrow screens the rail becomes a floating pill that opens into the contents. The article scrolls inside its own fixed-height box so the block works inside a tile or a page. Apple-light and calm. This block is scroll-linked and has no autoplay and no sound.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useScroll`, `useSpring`, `useReducedMotion`) and a `cn` helper.
- File: `components/blocks/blog-with-contents.tsx`, named export `BlogWithContents`, types `BlogWithContentsProps` and `BlogSection`, and the demo array `DEFAULT_BLOG_SECTIONS`.

## API

`BlogSection`: `{ id: string; title: string; paragraphs: string[] }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Notes on motion that earns its place"` | Article title. |
| `category` | `string` | `"Essay"` | Small line above the title. |
| `readMinutes` | `number` | `4` | Shown as "Essay · 4 min read" and counted down in the rail. |
| `sections` | `BlogSection[]` | 5 demo sections | Use a stable array. |
| `height` | `number` | `560` | Height of the scrolling reader in px. |
| `className` | `string` | none | Extra classes on the section. |

Demo sections (invented copy): Why motion matters, Springs over durations, Let layout do the work, Restraint, Shipping it, each with two short paragraphs about interface motion.

There is no `autoplay` prop and no `enableSound`: the block is driven only by the visitor's scrolling.

## Layout and look

- Root `<section aria-label="Article">`: full width, background `#f5f5f7` / dark `#000`, 48px vertical and 16px side padding. Inside, a centred card, `max-width: 1080px`, radius 24px, white / dark `#1c1c1e`, `overflow: hidden`, the usual hairline and soft shadow.
- The card holds a 3px progress bar pinned to its top (`#0071e3` / dark `#0a84ff`, `transform-origin: left`) and the scroll box: `overflow-y: auto`, `overscroll-behavior: contain`, height `height` px, focusable (`role="region"`, `aria-label="Article"`).
- Inside the box a centred grid, `max-width: 980px`, 40px gap, padding 40px 20px (32px sides from 768px). From 768px two columns: a 220px rail and the article. Below 768px the rail is hidden.
- Rail (a `<nav aria-label="Contents">`, sticky at `top: 24px`): header row "Contents" 12px semibold uppercase tracking 0.12em secondary (`#6e6e73` / `#a1a1a6`) on the left, "3 min left" 12px tabular on the right, 12px below it. Then an ordered list, 4px gap. Each row is a full-width button, radius 10px, padding 6px 8px 6px 16px, 13.5px, text "1. Why motion matters". Active row: semibold ink (`#1d1d1f` / `#f5f5f7`) on a `#f5f5f7` / dark `#2c2c2e` rounded marker; others secondary. A 2px wide line sits on the row's left edge (top and bottom inset 4px, track `#e5e5ea` / dark `#3a3a3c`) and a fill (`#1d1d1f` / `#f5f5f7`, origin top) scales from 0 to 1 as that section is read.
- Article: category line 13px semibold `#0071e3` (dark `#2997ff`) "Essay · 4 min read"; title 8px below, `clamp(30px, 4.5vw, 44px)` semibold, line-height 1.08, tracking -0.035em. Each section has 40px top padding, an h2 22px semibold tracking -0.02em, paragraphs 16.5px / 1.7 in `#424245` (dark `#d1d1d6`) with 12px between, and a decorative 120px tall placeholder block (radius 18px, `#f5f5f7` / dark `#2c2c2e`, `aria-hidden`) 20px below. A 160px spacer ends the article so the last section can reach the active line.
- Mobile pill: absolutely positioned 16px from the card's bottom, centred, hidden from 768px. A rounded 22px container, white at 90% (dark `#2c2c2e` at 90%) with backdrop blur and a lifted shadow. Closed it hugs its content: a 44px high button with "3/5", the active title truncated at 180px, and a 12px chevron. Open it is 300px wide (max the card width minus 32px) and shows the same rail above the button; the chevron rotates 180 degrees.

## Motion

- Reading progress: `useScroll({ container })` on the scroll box, fed through `useSpring` (stiffness 200, damping 30) into the top bar's `scaleX`.
- On every scroll (passive listener), resize (ResizeObserver) and once after mount (in a requestAnimationFrame callback), measure each section: reading point = `scrollTop + clientHeight * 0.3`; section progress = clamp((point - top) / height, 0 to 1); the active section is the last one whose top is at or above the point; at the very bottom of the box the last section is active and all progress is 1.
- Marker: a shared-layout pill (`layoutId`, separate `LayoutGroup` ids for the side rail and the pill) with a spring, stiffness 380, damping 32. Fill lines: spring on `scaleY`, stiffness 300, damping 40.
- Minutes left = `max(1, round(readMinutes * (1 - average section progress)))`.
- Pill: width and layout spring, stiffness 380, damping 32; contents fade in and out over 0.2 s.
- Clicking a row smooth-scrolls the box to the section top minus 12px and closes the pill.
- Reduced motion: the top bar follows scroll directly without the spring, all springs become instant, jumps use instant scrolling, chevron and fades have zero duration.

## Interaction and states

- Rows are real buttons with `aria-current="true"` on the active one. The scroll box is keyboard focusable so arrow keys, Page Up and Page Down scroll the article.
- The pill button has `aria-expanded`, `aria-controls` and a label ("Contents, section 2 of 5: Springs over durations"); Escape closes it.
- Section anchors use ids built from `useId`, so several instances can sit on one page.

## Autoplay demo

Not applicable: scroll-linked blocks do not play themselves. The preview renders `<BlogWithContents />` and the visitor scrolls the reader.

## Accessibility

- Landmarks: region, nav, article with real headings (h1 title, h2 sections). Decorative placeholders, progress bars and marker are `aria-hidden`.
- 2px `#0071e3` (dark `#0a84ff`) focus outline on every control and the scroll region; text at 4.5:1 or better in both themes.
- Reduced motion handled as above. No network calls.

## Acceptance checklist

- [ ] Scrolling the reader moves the marker down the rail, fills each section's line and advances the top bar.
- [ ] "N min left" counts down and never shows less than 1.
- [ ] Clicking a rail row scrolls there; at the bottom the last row is active.
- [ ] Below 768px the rail is replaced by the pill, which opens, lists sections, jumps, and closes on Escape.
- [ ] Two instances on one page do not interfere.
- [ ] Reduced motion removes springs and smooth scrolling.
- [ ] Dark mode swaps the card, rail, text, marker, bars and pill.
- [ ] At 360px wide nothing overflows horizontally.
