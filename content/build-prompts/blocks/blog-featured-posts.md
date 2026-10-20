# Blog Header Featured Posts

Build a journal index page: a header (eyebrow, big headline, description), one large featured story with its text laid over the image on wide containers, then a segmented category filter and a "Sort by" select above a grid of article cards that re-flows with a soft blur when filtered or sorted, and a pill pagination bar. Cards zoom their image and nudge an arrow on hover. It should feel like a premium editorial index: crisp, tactile, and quiet.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries), framer-motion (`motion`, `AnimatePresence`, `MotionConfig`, `useReducedMotion`, `layoutId`, `layout`), lucide-react icons (`ArrowUpRight`, `ChevronDown`, `ChevronLeft`, `ChevronRight`).
- File: `components/blocks/blog-content-sections/blog-header-featured-posts.tsx`, named export `BlogHeaderFeaturedPosts` (also export `BlogHeaderFeaturedPostsProps`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"The Northfield journal"` | Line above the headline. |
| `title` | `string` | `"Design notes for faster launches"` | Page headline. |
| `description` | `string` | "Practical writing on component systems, considered motion, frontend craft, and launch-ready product pages." | Paragraph under the headline. |
| `className` | `string` | — | Merged onto the section. |

Article shape: `{ id, title, summary, category, thumbnailUrl, publishedAt, readingTime, likes, views, author: { name, initials, avatarUrl }, tags: string[] }`.

## Layout and look

- Wrap everything in `MotionConfig reducedMotion="user"`.
- Section: size container, full width, `min-h-full`, `overflow-y-auto`, bg white / dark `black`, ink `#1d1d1f` / dark `#f5f5f7`. Padding 20px × 56px; `sm` 32px horizontal; `lg` 40px × 80px. Inner `max-w-7xl`, centred.
- Header (`max-w-3xl`): eyebrow 17px semibold `#6e6e73` / dark `#a1a1a6`; `h1` 8px below, `text-balance`, 40px / 1.05, -0.035em, `@xl` 52px, `@5xl` 64px / 1.03; description 20px below, `max-w-2xl`, 19px / 1.45 (`@xl` 21px), muted.
- Featured story (48px below), a link card:
  - Below `@3xl` (48rem): image block `aspect-[4/3]`, radius 24px, then the text under it (24px gap).
  - From `@3xl`: relative card, radius 28px, `min-height: 540px` (`@5xl` 620px), `overflow-hidden`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`. The image fills it; a gradient `to top, rgba(0,0,0,.72), rgba(0,0,0,.18) 45%, transparent 70%` covers it; the text sits at the bottom with 40px padding (`@5xl` 48px) in white.
  - Meta: 14px semibold (category · date at normal weight), muted, `@3xl` white at 75%.
  - Title `h2`: 28px / 1.08, -0.03em (`@xl` 34px, `@3xl` 44px, `@5xl` 52px / 1.04), `text-balance`, `max-w-3xl`. From `@3xl` a 44px frosted circle (white at 15%, `backdrop-blur-md`) with an `ArrowUpRight` sits beside it.
  - Summary: 16px below, 17px / 1.5 (`@3xl` 19px, white at 80%).
  - Footer row: 24px below: 36px avatar, name 14px semibold, reading time; then tag pills (12px medium, 12px × 4px padding, `#f5f5f7` / dark `#1c1c1e`, muted; from `@3xl` frosted white at 15% with white text).
- Toolbar (64px below): stacked with 16px gap; from `@3xl` a row, space-between.
  - Segmented filter: `role="group"`, inline-flex, radius 10px, 3px padding, track `#e8e8ed` / dark `#3a3a3c`. Buttons 32px tall, 14px horizontal padding, radius 8px, 13px medium; inactive `#6e6e73` (hover ink), dark `#a1a1a6`. Selected thumb: white with `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, dark `#636366`. On phones the filter scrolls horizontally with a hidden scrollbar.
  - Sort: label "Sort by" 13px muted, then a native `select` 36px tall, radius 10px, `#e8e8ed` (hover `#dedee3`), dark `#2c2c2e` (hover `#3a3a3c`), 13px medium, 12px left / 36px right padding, with a 14px `ChevronDown` overlaid at the right.
- Grid (40px below): 1 column; `@3xl` 2; `@5xl` 3; gaps 32px × 56px.
  - Card link: image `aspect-[3/2]`, radius 20px, ring `0 0 0 1px rgba(0,0,0,.05)` / dark `rgba(255,255,255,.08)`. Then (20px below, 4px side padding) category 13px semibold muted; title `h3` 21px / 1.2, -0.02em with an `ArrowUpRight` (20px, stroke 1.75) to its right; summary 15px / 1.5, two-line clamp; author row 20px below (36px avatar, name, "date · reading time" 13px `#86868b`); tags 16px below (12px pills).
- Avatar: 36px circle, cover background image, `#e8e8ed` placeholder, ring `rgba(0,0,0,.06)`.
- Pagination (64px below, top hairline, 24px top padding): space-between. Previous: pill 36px tall, 16px padding, 14px medium, `#e8e8ed` / dark `#2c2c2e`. Pages (from `sm`): 36px circles, 14px tabular; current filled `#1d1d1f` with white text (dark `#f5f5f7` / `#1d1d1f`), an ellipsis before the last page. Next: pill in `#0071e3` (hover `#0077ed`), white. Disabled pills drop to 40% opacity.

## Motion

- Springs: SNAP stiffness 500 / damping 36; SOFT 260 / 30; ZOOM 120 / 22.
- Header: rise variants (`opacity 0, y 16, blur(6px)` → rest, SOFT), `staggerChildren 0.07`, `delayChildren 0.05`, on mount.
- Featured: from `opacity 0, y 28, scale 0.985`, spring 200 / 30, delay 0.25s. Hover: image scale 1.03 (ZOOM); arrow circle moves `x 3, y -3` (SNAP).
- Filter thumb and current page dot: shared `layoutId` scoped by `useId`, SNAP. Filter buttons `whileTap` scale 0.97.
- Grid: wrapper rises in view (`once`, margin -80px). Items in `AnimatePresence mode="popLayout" initial={false}`, each `layout`, entering from `opacity 0, scale 0.96, blur(6px)` and exiting to the same, SOFT.
- Card hover: image scale 1.04 (ZOOM); arrow from `opacity 0.5` to 1 and `x 2, y -2` (SNAP).

## Interaction and states

- Filter tabs: View all, Systems, Motion, Frontend, Launch. Non-"all" filters match `category` case-insensitively.
- Sort: "Most recent" (source order), "Most popular" (likes descending), "Most viewed" (views descending). Memoise filtered + sorted list.
- Pagination is local demo state over pages 1, 2, 3, 8: Previous from 8 goes to 3, Next from 3 goes to 8; Previous disabled on 1, Next on 8.
- All links are `href="#"` placeholders; focus-visible outline 2px `#0071e3`, offset 2px.
- Reduced motion: entrances are opacity only; `MotionConfig` disables transforms for the rest.

## Demo data

- Featured: "Design systems that make launches feel effortless", Systems, 22 May 2026, 10 min read, Ariana Reed (AR), tags Systems / Components / Launch, summary "How reusable sections, motion rules, and a clean visual language let small teams ship polished product pages without rebuilding the same pieces every quarter."
- Grid (title, category, date, read time, author, likes, views): "A field guide to reusable hero sections", Systems, 21 May, 7 min, Nina Kapoor, 412, 9,800; "Motion rules for calm, premium interfaces", Motion, 20 May, 9 min, Ishan Mehta, 688, 12,400; "Shipping components with better props", Frontend, 19 May, 8 min, Theo Banerjee, 530, 15,100; "The landing page audit checklist", Launch, 18 May, 6 min, Maya Sen, 297, 7,200; "Designing bento grids that do real work", Systems, 17 May, 7 min, Rhea Thomas, 741, 10,900; "Making docs pages feel like product", Frontend, 16 May, 5 min, Dev Arora, 356, 8,300.
- Images are landscape stock photos (thumbnails ~900px wide, featured ~1800px) and square portraits for avatars.

## Accessibility

- Filter buttons use `aria-pressed`; the group is labelled "Filter by category".
- The select has a real `<label>`; the chevron is `aria-hidden`.
- Tag lists are `ul` with `aria-label="Topics"`. Image layers have `role="img"` labelled with the article title; avatars are decorative.
- Pagination is a `nav` "Pagination"; page buttons have `aria-label="Page n"` and the current one `aria-current="page"`.

## Acceptance checklist

- [ ] Headline steps 40 → 52 → 64px at `@xl` and `@5xl`.
- [ ] From `@3xl` the featured story overlays white text on a dark gradient; below it, text sits under the image.
- [ ] Clicking a filter slides the white thumb and re-flows the grid with a blur fade.
- [ ] "Most popular" orders by likes, "Most viewed" by views.
- [ ] Grid shows 1, 2, then 3 columns as the container widens.
- [ ] Hovering a card zooms its image and lifts the arrow to full opacity.
- [ ] The page dot slides between numbers; Previous/Next skip the 3 ↔ 8 gap.
- [ ] Previous is disabled on page 1, Next on page 8.
- [ ] Dark mode swaps the track, thumb, pills and text.
- [ ] Reduced motion keeps the layout but removes the movement.
