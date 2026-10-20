# Blog Hover Image Card

Build a compact, tall blog card: a large image, then the author, a two-line title, a topic pill and a date. On hover (or keyboard focus) the card lifts, the image zooms slightly, the author's portrait rises out of a notch cut into the image's bottom-left corner, and a small blue arrow badge slides in beside the date. It should feel playful but restrained, with every motion a crisp spring.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useReducedMotion`, `Variants`, `Transition`), lucide-react (`ArrowUpRight`).
- File: `components/blocks/blog-content-sections/blog-hover-image-card.tsx`, named exports `BlogHoverImageCard` and `BlogHoverImageCardShowcase` (a three-card grid); also export `BlogHoverImageCardProps`.
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Designing launch pages with reusable UI systems"` | Card headline (two-line clamp); also the link text. |
| `author` | `string` | `"Noah Williams"` | Line above the title; names the portrait. |
| `tag` | `string` | `"Design systems"` | Topic pill. |
| `date` | `string` | `"23 May '26"` | Shown beside the pill. |
| `mainImage` | `string` | a landscape photo URL | Card image. |
| `hoverImage` | `string` | a portrait photo URL | Author portrait revealed on hover. |
| `href` | `string` | `"#"` | Where the card links. |
| `tagClassName` | `string` | — | Extra classes for the pill. |
| `arrowClassName` | `string` | — | Extra classes for the arrow badge. |
| `className` | `string` | — | Merged onto the card. |

## Layout and look

- Card: `motion.article`, relative, flex column, 16px gap, height 425px, full width up to 300px, radius 24px, padding 10px, white bg (dark `#1c1c1e`), text `#1d1d1f` / dark `#f5f5f7`, pointer cursor.
- Image well: flex-1, relative, `overflow-hidden`, radius 18px, placeholder `#f5f5f7` / dark `#2c2c2e`. The image is a cover `background-image` on an absolutely filling layer.
- Portrait notch: absolutely at the bottom-left of the image well, 92px wide × 112px tall, `overflow-hidden`, flex column.
  - At its top-left, a 12px corner SVG (`viewBox 0 0 12 12`, path `M0 12H12C5.373 12 0 6.627 0 0Z`) filled with the card colour (white / dark `#1c1c1e`), so the notch curves smoothly into the image.
  - Below it a 100px-tall row: an 80px-wide block in the card colour with a 16px top-right radius, centring a 60 × 80px portrait (radius 10px, cover background, placeholder `#e8e8ed` / dark `#3a3a3c`); then a 12px-wide strip holding a second corner SVG at `top: 88px` to round the inner join.
- Text block: 8px horizontal and 8px bottom padding, 12px between rows.
  - Author: 13px, `#6e6e73` / dark `#a1a1a6`.
  - Title `h3`: 19px / 1.2, semibold, -0.02em, two-line clamp. The link inside has an `::after` that covers the whole card (`absolute inset-0`, radius 24px), so the full card is clickable.
  - Bottom row: relative flex, 12px gap, 4px top padding. Pill: `max-width: 150px`, truncated, fully rounded, 12px × 4px padding, 12px medium, `#f5f5f7` / dark `#2c2c2e`, muted text. Date: flex-1, truncated, 13px tabular, `#86868b` / dark `#98989d`. Arrow badge: 28px circle, `#0071e3`, white 16px `ArrowUpRight` at stroke 2.
- Card shadow (animated): rest `0 0 0 1px rgba(0,0,0,0.05), 0 12px 32px -24px rgba(0,0,0,0.2)`; hover `0 0 0 1px rgba(0,0,0,0.05), 0 28px 48px -24px rgba(0,0,0,0.32)`.

Showcase (`BlogHoverImageCardShowcase`): section, flex, centred, `min-h-full`, bg `#f5f5f7` / dark `black`, padding 24px. Grid `max-w-5xl`, 24px gap, items centred on phones; 2 columns from `sm` (stretched), 3 from `lg`.

## Motion

- Springs: LIFT stiffness 380 / damping 30 (card); SLIDE 420 / 32 (portrait, arrow); ZOOM 120 / 22 (image).
- Card variants `rest` / `hover`: `y 0 → -4` plus the shadow change.
- Image: `scale 1 → 1.05`.
- Portrait notch: `y 112 → 0` (rises from fully below the well's bottom edge).
- Arrow badge: from `x 10, opacity 0, scale 0.8` to `x 0, opacity 1, scale 1`.
- Children inherit the `rest` / `hover` state from the article through variants.

## Interaction and states

- Hover: `whileHover="hover"` on the article.
- Keyboard: on focus, set a `focused` flag only when the focused element matches `:focus-visible`; while set, animate to `hover`. Clear it on blur. So tabbing to the card shows the full hover reveal, but a mouse click does not latch it.
- Focus ring: `has-[a:focus-visible]` draws a 2px `#0071e3` outline, offset 2px, around the whole card (the link itself has no outline).
- Reduced motion: no lift, no zoom, no slide. The portrait fades from opacity 0 to 1 instead of rising, and the arrow only fades.

## Demo data

The showcase shows three cards:
1. Noah Williams — "Designing launch pages with reusable UI systems" — Design systems — 23 May '26.
2. Ariana Reed — "How animated cards create a stronger editorial rhythm" — Motion — 18 May '26.
3. Theo Banerjee — "A practical guide to product stories that feel premium" — Launch — 14 May '26.

Each pairs a landscape image (~1200px wide) with a portrait (~500px wide).

## Accessibility

- The card is an `article`; the title is an `h3` containing a real link, and the stretched `::after` makes the whole card its hit area without nesting interactive elements.
- The image layer has `role="img"` labelled with the title; the portrait has `role="img"` labelled "<author> portrait".
- The arrow badge and corner SVGs are `aria-hidden`.
- Keyboard focus triggers the same reveal as hover, with a visible outline.

## Acceptance checklist

- [ ] The card is 425px tall and at most 300px wide.
- [ ] Hovering lifts it 4px with a deeper shadow.
- [ ] The image zooms to 1.05 on hover.
- [ ] The portrait rises from the bottom-left notch, with smooth inverted corners joining the image.
- [ ] The blue arrow badge slides in from the right beside the date.
- [ ] Clicking anywhere on the card follows `href`.
- [ ] Tabbing to the card shows the hover state and an outline around the whole card; clicking does not leave it stuck.
- [ ] Long tags truncate at 150px; long titles clamp to two lines.
- [ ] The showcase lays out 1, 2 and 3 columns at phone, `sm` and `lg`.
- [ ] Dark mode swaps card, notch, pill and text colours.
- [ ] Reduced motion fades the portrait and arrow in without movement.
