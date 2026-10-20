# Blog Content With TOC

Build a long-read article layout with a sticky "On this page" table of contents beside the centred article. As the reader scrolls, the active entry follows the section nearest the top, and a soft highlight pill with a blue edge bar glides between entries. Clicking an entry smooth-scrolls to its section. It should feel like good documentation: quiet, oriented, always telling you where you are.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (with container queries), framer-motion (`motion`, `useReducedMotion`, `layoutId`).
- File: `components/blocks/blog-content-sections/blog-content-with-toc.tsx`, named export `BlogContentWithToc` (also export `BlogContentWithTocProps`, `BlogTocItem`, `BlogTocSectionId` and `BLOG_TOC_ITEMS`).
- Reuses the centred article component (`BlogContentCentered`) for the body: headline, hero and sections, with its own padding and background stripped.
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

Every prop is optional; with none the block renders exactly the demo below. The article props pass straight through to `BlogContentCentered`, so an omitted one uses that component's default.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"The future of artificial intelligence"` | Article headline. |
| `dek` | `string` | the centred article's standfirst | Standfirst under the headline; empty hides it. |
| `category` | `string` | `"Feature"` | Label before the date. |
| `author` | `string` | `"Ava Sterling"` | Byline; its initials fill the monogram. |
| `date` | `string` | `"February 14, 2026"` | Publish date. |
| `readingTime` | `string` | `"6 min read"` | Line under the author. |
| `tocLabel` | `string` | `"On this page"` | Heading above the contents list. |
| `tocItems` | `BlogTocItem[]` (`{ id: BlogTocSectionId; label: string }`) | `BLOG_TOC_ITEMS` | Contents entries, in order. Ids must be body section ids; others are skipped. |
| `sectionIdPrefix` | `string` | `"blog-with-toc"` | Prefix of the body section ids. Characters other than letters, digits, `-` and `_` are stripped (it goes into `querySelector`); empty falls back to the default. |
| `heroImage` | `string` (URL) | the centred article's photo | Wide image under the header. |
| `secondaryImage` | `string` (URL) | the centred article's photo | Figure inside the body. |
| `className` | `string` | — | Merged onto the outer section. |

`BLOG_TOC_ITEMS`, and the body sections they point at:

| id | label |
|---|---|
| `introduction` | Introduction |
| `key-areas` | Key areas of AI development |
| `ethics` | Ethical considerations |
| `conclusion` | Conclusion |

Section ids in the article are `<sectionIdPrefix>-<id>` (`blog-with-toc-introduction`, ...); the article is rendered with the same `sectionIdPrefix`.

## Layout and look

- Section: a size container (`@container`), full width, `min-h-full`, `overflow-y-auto`, bg white / dark `black`, text `#1d1d1f` / dark `#f5f5f7`.
- Inner grid: centred, `max-w-6xl`, 40px gap, padding 20px × 56px (`sm` 32px horizontal). When the container is at least 64rem (`@5xl`): two columns `220px minmax(0, 760px)`, 64px gap, padding 40px × 96px.
- Aside: hidden below `@5xl`. Inside, the nav is `position: sticky; top: 40px`.
- Nav heading (`tocLabel`, "On this page"): 12px semibold, `#86868b` / dark `#98989d`, 12px horizontal padding.
- List: 8px below, flex column, 2px gap.
- Entry link: block, relative, radius 10px, padding 12px × 6px, 14px, line-height 1.35, 200ms colour transition. Inactive `#6e6e73` (hover `#1d1d1f`); dark `#a1a1a6` (hover `#f5f5f7`). Active: medium weight, `#1d1d1f` / dark `#f5f5f7`.
- Active highlight: absolutely filling the link, radius 10px, bg `#f5f5f7` / dark `#1c1c1e`, with a 3px rounded bar in `#0071e3` on the left edge inset 8px top and bottom. The label sits above it (`relative`).
- Article: the centred article with `min-h-0 overflow-visible bg-transparent p-0` overrides, so it flows in the grid column.

## Motion

- Nav entrance: from `opacity 0, x -12, blur(6px)` to rest, spring stiffness 260, damping 32, delay 0.15s.
- Highlight: one element with a shared `layoutId` (scoped with `useId` so several instances never collide), moving between entries with spring stiffness 480, damping 34.
- Click: `scrollIntoView({ behavior: "smooth", block: "start" })`.
- The article keeps its own header stagger, hero zoom and scroll reveals (springs 260/32, 200/30, 60/20).

## Interaction and states

- Active tracking: on mount, decide the scroll root. If the section itself overflows (`scrollHeight > clientHeight + 1`), observe within it; otherwise use the viewport (`root: null`). Find each target by `[id="<prefix>-<id>"]` inside the section. Re-run when `tocItems` or the prefix change.
- One `IntersectionObserver` with `rootMargin: "-8% 0px -55% 0px"`. Keep a map of id → intersecting; after each batch, the first contents entry (in order) that is intersecting becomes active. Disconnect on unmount.
- Click on an entry: prevent the default jump, set it active immediately, then scroll to the target.
- Links keep a real `href="#<prefix>-<id>"`, so they still work without JavaScript.
- Reduced motion: the nav fades only and clicks jump instantly (`behavior: "auto"`).
- Below `@5xl` there is no TOC; the article reads as the plain centred layout.

## Demo data

The article is the centred AI feature: "The future of artificial intelligence", category "Feature", "February 14, 2026", by Ava Sterling, "6 min read", with sections Introduction, Key areas of AI development, Ethical considerations (with the pull quote), a captioned figure, and Conclusion.

## Accessibility

- The TOC is a `nav` with `aria-label="Table of contents"` and a real list of links.
- The active link carries `aria-current="location"`.
- Focus-visible outline on links: 2px `#0071e3`, offset 2px.
- Section headings stay a proper `h1`/`h2` outline inside the article.
- Respect `prefers-reduced-motion` for both the entrance and the scroll behaviour.

## Acceptance checklist

- [ ] At 1024px container width or more, a 220px TOC sits left of the article and stays pinned 40px from the top.
- [ ] Below that width the TOC is hidden and the article fills the column.
- [ ] Scrolling moves the active entry to the section nearest the top.
- [ ] The highlight pill with its blue edge bar glides between entries instead of jumping.
- [ ] Clicking an entry smooth-scrolls to the section and marks it active immediately.
- [ ] Works both when the page scrolls and when the section is height-constrained and scrolls itself.
- [ ] Two instances on one page do not share a highlight.
- [ ] `aria-current="location"` follows the active entry.
- [ ] Dark mode swaps the pill and text colours.
- [ ] Reduced motion jumps without smooth scrolling.
