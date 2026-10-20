# Blog Content Editorial

Build an editorial feature layout: on wide containers the headline column pins on the left (issue label, a big headline, a standfirst, a three-stat strip and the author) while the story scrolls on the right (a large image, a section, a grid of four principle cards and a pull quote). On narrow containers everything stacks. The header rises in a short stagger, the image floats up, and the story pieces reveal as they scroll in. It should feel like a printed magazine spread: confident type, quiet colour, one accent.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries), framer-motion (`motion`, `useReducedMotion`, `Variants`, `Transition`), lucide-react icons (`Eye`, `SlidersHorizontal`, `UserCheck`, `Undo2`).
- File: `components/blocks/blog-content-sections/blog-content-editorial.tsx`, named export `BlogContentEditorial` (also export `BlogContentEditorialProps`, `BlogEditorialStat`, `BlogEditorialPrinciple`, `BLOG_EDITORIAL_STATS` and `BLOG_EDITORIAL_PRINCIPLES`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

Every prop is optional; the defaults are the Demo data below, so with no props the block renders exactly that. Text props render as plain text.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Field notes, issue 14"` | Issue label above the headline. |
| `title` | `string` | `"Designing AI products people can actually trust."` | The pinned `h1`. |
| `description` | `string` | the standfirst below | Standfirst; empty hides it. |
| `author` | `string` | `"Lena Okafor"` | Byline name; its first two initials (upper-cased) fill the monogram. |
| `authorRole` | `string` | `"Design lead, Fieldwork"` | Line under the name. |
| `ctaLabel` | `string` | `"Read the full issue ›"` | Link beside the byline; empty hides it. |
| `ctaHref` | `string` | `"#"` | Link target (empty falls back to `#`). |
| `sectionTitle` | `string` | `"Start with clarity, not magic."` | Story section `h2`. |
| `sectionBody` | `string` | the paragraph below | Paragraph under it. |
| `quote` | `string` | the quote below, without quote marks | Pull quote, wrapped in “ ”; empty hides the whole blockquote. |
| `quoteAttribution` | `string` | `author` | Name under the quote; empty hides it. |
| `stats` | `BlogEditorialStat[]` (`{ value, label }`) | `BLOG_EDITORIAL_STATS` | Stat strip; the first 3 are shown. |
| `principles` | `BlogEditorialPrinciple[]` (`{ title, text, icon: LucideIcon }`) | `BLOG_EDITORIAL_PRINCIPLES` | Principle cards. |
| `image` | `string` (URL) | the Unsplash dashboard photo | Story image, set as `background-image: url("<JSON-escaped url>")`; empty falls back to the default. |
| `imageAlt` | `string` | `"Analytics dashboard and product research"` | `aria-label` of the image layer. |
| `className` | `string` | — | Merged onto the outer section. |

## Layout and look

- Section: a size container (`@container`), full width, `min-h-full`, `overflow-y-auto`, bg white / dark `black`, text `#1d1d1f` / dark `#f5f5f7`. Padding 20px × 48px; `sm` 32px horizontal; `lg` 40px × 80px.
- Article: centred grid, `max-w-7xl`, 40px gap. At `@5xl` (64rem container): columns `0.85fr 1.15fr`, 56px gap.
- Header column: flex column. At `@5xl`: `position: sticky; top: 40px`, `align-self: start`, 24px top padding.
  - Issue label: 15px semibold, `#6e6e73` / dark `#a1a1a6`.
  - Headline `h1`: 16px below, `text-balance`, 40px / 1.05, -0.035em, semibold; `@xl` 52px; `@5xl` 60px / 1.03.
  - Standfirst: 24px below, `max-w-lg`, `text-pretty`, 19px / 1.45 (`@xl` 21px), `#6e6e73` / dark `#a1a1a6`.
  - Stats: 40px below, `max-w-md`, three equal columns divided by hairlines (`rgba(0,0,0,.08)` / dark `rgba(255,255,255,.1)`), with hairlines top and bottom. Each cell: 16px padding (first cell no left padding), a `dl` pair rendered value-first: value 24px semibold, line-height 1, -0.025em; label 13px muted, 4px below.
  - Author row: 32px below, wrapping flex, 24px × 12px gaps. Monogram (author initials, "LO"): 36px circle, gradient `#a1a1a6 → #86868b` (dark `#8e8e93 → #636366`), 12px semibold white. Name 14px semibold; role 14px `#86868b` / dark `#98989d`. Link "Read the full issue ›": 15px medium, `#0066cc` / dark `#2997ff`, underline on hover.
- Story column (`min-w-0`):
  - Image frame: relative, `aspect-[4/3]` (`@xl` 16:10), radius 28px, `overflow-hidden`, placeholder `#f5f5f7` / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark ring `rgba(255,255,255,.08)`). Image as a cover `background-image` on a filling layer.
  - Story stack: 48px below, `space-y-12`, 8px horizontal padding at `@5xl`.
  - Section heading `h2`: 28px (`@xl` 32px), line-height 1.12, -0.025em, semibold; paragraph 16px below, 17px / 1.6, ink at 85%.
  - Principle grid: 12px gap, two columns from `@xl`. Card: radius 20px, padding 20px, bg `#f5f5f7` / dark `#1c1c1e`. Icon 20px, stroke 1.75, `#0071e3` / dark `#2997ff`; title 17px semibold, -0.01em, 16px below; text 15px / 1.5 muted, 6px below.
  - Quote: top hairline, 32px top padding; 26px (`@xl` 30px), line-height 1.22, -0.025em, semibold, `text-balance`; attribution 14px muted, 16px below.

## Motion

- Rise: `opacity 0, y 16, blur(6px)` → rest, spring stiffness 260, damping 32.
- Header: on mount, `staggerChildren 0.07`, `delayChildren 0.05` over label, headline, standfirst, stats and author row.
- Image frame: from `opacity 0, y 28, scale 0.98` to rest, spring stiffness 200, damping 30, delay 0.2s. On hover the image layer scales to 1.03 (spring stiffness 120, damping 24).
- Story stack: `whileInView` with `viewport { once: true, margin: "-80px" }`, `staggerChildren 0.07` over the section, the card grid and the quote.

## Interaction and states

- Only the image hover zoom and the link are interactive.
- Reduced motion: rises become opacity only; the image frame fades without moving; the hover zoom stays at 1.
- The section scrolls itself in a height-constrained parent; inside it the sticky header pins to the section's own scroll.

## Demo data

- Label: "Field notes, issue 14". Headline: "Designing AI products people can actually trust." Standfirst: "What a year of interviews with product teams taught us about explaining, steering, and correcting machine output."
- Stats: "8 min" Read time; "Field" Research; "2026" Edition.
- Author: Lena Okafor, "Design lead, Fieldwork".
- Image label: "Analytics dashboard and product research".
- Section: "Start with clarity, not magic." / "Teams adopt AI fastest when the interface explains what happened, what changed, and how a person can correct the outcome. The best systems feel powerful without becoming mysterious."
- Principles: Readable outputs (Eye) "Structure generated responses so people can scan, verify, and act."; Visible controls (SlidersHorizontal) "Let people steer tone, depth, data sources, and confidence."; Human checkpoints (UserCheck) "Build moments where review feels natural instead of disruptive."; Calm recovery (Undo2) "When the model is wrong, make correcting it the easy path."
- Quote: "Trust is designed in layers: source, control, explanation, and a graceful way back when the output misses." — Lena Okafor.

## Accessibility

- One `h1`; `h2` for the story section; `h3` for each principle.
- Stats use `dl`/`dt`/`dd` (visually reversed with `flex-col-reverse`, so the DOM order stays label then value).
- The image layer has `role="img"` and an `aria-label`; icons and the monogram are `aria-hidden`.
- The link has a 2px `#0071e3` focus-visible outline, offset 2px.

## Acceptance checklist

- [ ] At a 1024px container or wider, the header column pins while the story scrolls beside it.
- [ ] Narrower than that, the layout stacks: header, image, story.
- [ ] Headline steps 40px → 52px (`@xl`) → 60px (`@5xl`).
- [ ] The three stats sit in hairline-divided cells, value above label.
- [ ] Header items rise in a 70ms stagger on mount; the image floats up 0.2s later.
- [ ] Hovering the image zooms it gently to 1.03.
- [ ] Principle cards form two columns from `@xl` and reveal on scroll.
- [ ] Dark mode swaps every surface, hairline and text colour.
- [ ] Reduced motion fades only, with no movement or zoom.
