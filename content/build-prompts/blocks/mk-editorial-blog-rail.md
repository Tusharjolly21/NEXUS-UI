# Editorial Blog Rail

Build a magazine-style blog section in a rounded card: a heading with "View all", a featured story with generated gradient cover art on the left, and a numbered list of recent posts on the right. Pointing at or focusing a post turns the featured slot into its preview: the cover blooms into that post's colours, the category tag and the title block slide and unblur in, and the lines and light on the cover drift with the pointer in parallax. A grey highlight glides between list rows.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[520px]:`, `@min-[600px]:`), framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`, shared `layoutId`), React `useId`.
- File: `components/editorial-blog-rail/editorial-blog-rail.tsx`, named export `EditorialRail`, types `EditorialPost` and `EditorialRailProps`.

## API

`EditorialPost`: `{ title: string; category: string; date: string; readTime: string; href?: string; excerpt?: string; author?: { name: string; role?: string }; cover?: [string, string] }`.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `heading` | `string` | `"From the journal"` | Section heading. |
| `allHref` | `string` | `"#"` | "View all" link. |
| `featured` | `EditorialPost` | "Designing scroll choreography that people actually feel", Guide, Oct 14, 12 min read, excerpt "Pacing, anchors and the three-beat rule: how we stage scroll-linked motion so it explains the product instead of decorating it.", author Mara Okafor (Design engineer), cover `#0071e3`/`#bf5af2` | Featured story. |
| `posts` | `EditorialPost[]` | 4 posts (below) | Numbered rail. |
| `autoplay` | `boolean` | `false` | Preview each post in turn until touched. |
| `className` | `string` | `""` | Section classes. |

Default posts: "Springs, not curves: tuning motion by feel" (Craft, Oct 09, 7 min); "Shipping a design system in six weeks" (Case study, Oct 02, 9 min); "The quiet power of a 1px hairline" (Details, Sep 26, 4 min); "Reduced motion is a design brief, not a toggle" (Accessibility, Sep 18, 6 min), each with a one-line excerpt. Posts without `cover` use palette index `i mod 5`: `#ff9f0a/#ff375f`, `#30d158/#0071e3`, `#5e5ce6/#64d2ff`, `#bf5af2/#ff9f0a`, `#ff375f/#5e5ce6`.

## Layout and look

- `<section>`: `@container`, flex column, full width, radius 28px, padding 20px (28px at container ≥520px), white / `#1c1c1e`, text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`).
- Header: row, items at the bottom, space-between. `<h2>` 22px semibold tracking −0.03em. "View all" 13px medium `#0066cc` / `#64a8ff`, underline on hover, with a 12px north-east arrow (`M3.5 8.5l5-5M4.5 3.5h4v4`, stroke 1.7) that nudges up-right 1px on hover.
- Body: margin-top 20px, grid gap 20px; at ≥600px columns `1.1fr 1fr`.
- Featured link: flex column, radius 22px, overflow hidden, `#f5f5f7` / `#2c2c2e`.
  - Cover (`aria-hidden`): 16:9, `#0b0b10`. Background layer `radial-gradient(110% 90% at 18% 22%, A 0%, transparent 58%), radial-gradient(90% 90% at 88% 82%, B 0%, transparent 62%), #0b0b10`. Over it an SVG (inset −24px so it can drift, viewBox 400×225, stretched, opacity .4, `mix-blend-mode: overlay`) with nine white 1px curves `M −20 {40+22i} C 120 {10+22i}, 260 {90+18i}, 420 {30+24i}`. A 64px `white/25` blurred orb at right 14%, top 22%. Category tag top-left 12px: rounded-full, `white/90`, backdrop blur, padding 4px 10px, 11px semibold `#1d1d1f`.
  - Text block: relative, min-height 124px, padding 16px, overflow hidden. `<h3>` 18px semibold, snug, tracking −0.02em, balanced. Excerpt 13px relaxed grey, two-line clamp, 6px top. Meta row pushed to the bottom (12px top padding, 12px grey, gap 8px × 4px, no wrap per item): 24px avatar circle with white 10px semibold initials on `linear-gradient(135deg, A, B)`, author name medium in ink, "·", date (tabular), "·", read time.
- List `<ol>`: flex column; each `<li>` flex-1 and relative. Highlight: absolute inset 0, radius 16px, `#f5f5f7` / `#2c2c2e`. Row link: flex, items start, gap 12px, radius 16px, padding 12px. Number "01"… 20px wide, 12px semibold tabular `#86868b` / `#8e8e93`. Category line 11px semibold uppercase tracking .08em grey with a 6px dot in the post's first cover colour. Title 14px medium snug, 4px top. Meta "date · readTime" 12px grey tabular. A 14px arrow at the right `#aeaeb2` / `#636366`, ink on hover.

## Motion

- Cover swap: `AnimatePresence` keyed by the colour pair; new layer from `opacity 0, scale 1.12` to rest (opacity .45s tween, scale spring 120/20), old layer fades out.
- Category tag: `mode="popLayout"`, keyed by category, enter from `y −8`, exit to `y 8`, with opacity; spring 320/30.
- Text block: `mode="popLayout"`, keyed by title, enter from `opacity 0, y 14, blur(6px)`, exit to `opacity 0, y −10, blur(6px)`; spring 320/30.
- Parallax: pointer over the featured card as `(x/w − .5, y/h − .5)`, each smoothed by a spring 120/18. Lines move `x·10`, `y·6`; the orb moves the opposite way `x·−18`, `y·−10`. Leaving resets to 0.
- Highlight: shared `layoutId` (unique via `useId`) so it glides between rows, spring 420/32.
- Active row: dot scales to 1.5 (spring 500/15); arrow moves x 2, y −2 (spring 500/18).
- Reduced motion: no parallax, instant swaps and highlight, no arrow nudge.

## Interaction and states

- State `shown`: −1 is the featured story; 0..n−1 previews a post. The featured link always points at the shown post's `href`.
- Pointer enter on a row shows it; leaving the whole list returns to −1. Focus on a row shows it; blur returns to −1 if it was that row.
- Pointer entering the list, focusing a row or any pointer down marks the section touched.

## Autoplay demo

Every 2600ms advance `shown` through 0, 1, …, n−1, then back to −1 (featured), repeating until touched.

## Accessibility

- Real links for "View all", the featured card and every row, with 2px `#0071e3` / `#0a84ff` focus outlines. Cover art, highlight, avatar, separators and arrows are `aria-hidden`. The list is an ordered list.

## Acceptance checklist

- [ ] Hovering a row slides the grey highlight to it and swaps the featured slot to that post.
- [ ] The cover blooms from a slight zoom into the post's two colours.
- [ ] Title and excerpt rise and unblur in while the old ones lift away.
- [ ] Moving over the cover drifts the lines and the orb in opposite directions.
- [ ] Leaving the list returns to the featured story.
- [ ] Tabbing through rows previews each one.
- [ ] Below a 600px container the list stacks under the featured card.
- [ ] Autoplay cycles every 2.6s until touched.
