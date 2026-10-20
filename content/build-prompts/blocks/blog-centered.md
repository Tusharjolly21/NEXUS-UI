# Blog Content Centered

Build a single-column article page: a centred header (category and date, a large headline, a standfirst, an author row), a wide hero image that settles in with a slow zoom, and a readable body of sections, a numbered list, a pull quote, a captioned figure and a closing link. Header elements rise and unblur in a short stagger; body sections reveal as they scroll in. It should feel like a calm, premium magazine page: generous whitespace, tight headlines, nothing flashy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useReducedMotion`, `Variants`, `Transition`).
- File: `components/blocks/blog-content-sections/blog-content-centered.tsx`, named export `BlogContentCentered` (also export `BlogContentCenteredProps`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"The future of artificial intelligence"` | Headline. |
| `dek` | `string` | "AI is leaving the demo stage…" (see Demo data) | Standfirst under the headline; hidden when empty. |
| `category` | `string` | `"Feature"` | Label before the date. |
| `author` | `string` | `"Ava Sterling"` | Byline; its first two initials fill the monogram. |
| `date` | `string` | `"February 14, 2026"` | Shown in a `time` element after the category. |
| `readingTime` | `string` | `"6 min read"` | Line under the author name. |
| `heroImage` | `string` | a stock photo URL | 16:10 hero image. |
| `secondaryImage` | `string` | a circuit-board photo URL | 3:2 figure in the body. |
| `sectionIdPrefix` | `string` | `"blog-centered"` | Prefix for body section ids: `-introduction`, `-key-areas`, `-ethics`, `-conclusion`. |
| `className` | `string` | — | Merged onto the section (another layout can strip its padding and background). |

## Layout and look

- Section: full width, `min-h-full`, `overflow-y-auto`, bg white / dark `black`, text `#1d1d1f` / dark `#f5f5f7`. Padding 20px × 56px, `sm` 32px horizontal, `lg` 96px vertical.
- Article: centred, `max-w-[860px]`. Header and body columns: centred, `max-w-[680px]`.
- Meta line: 14px semibold `#6e6e73` / dark `#a1a1a6`: category, a `·` with 8px side margins in `#a1a1a6` / dark `#636366`, then the date at normal weight.
- Headline `h1`: 12px below, `text-balance`, 34px / 1.08 (`sm` 48px / 1.05), semibold, -0.03em.
- Dek: 20px below, `text-pretty`, 19px (`sm` 21px), line-height 1.45, `#6e6e73` / dark `#a1a1a6`.
- Author row: 28px below, 12px gap. Monogram: 36px circle, 12px semibold white initials, gradient `#a1a1a6 → #86868b` (dark `#8e8e93 → #636366`). Name 14px semibold, truncated; reading time 14px `#86868b` / dark `#98989d`, 2px below.
- Hero: 40px below (`sm` 48px), `aspect-[16/10]`, radius 24px, `overflow-hidden`, placeholder bg `#f5f5f7` / dark `#1c1c1e`, ring `0 0 0 1px rgba(0,0,0,.05)` / dark `rgba(255,255,255,.08)`. The image is a `background-image` cover, centred, on an absolutely filling layer with `role="img"`.
- Body: 56px below, `space-y-12`, 17px, line-height 1.6, `#1d1d1f` at 85% (dark `#f5f5f7` at 85%). Section headings `h2`: 24px (`sm` 28px), line-height 1.15, semibold, -0.025em, full ink colour, paragraphs 16px below. Sections use `scroll-margin-top: 40px`.
- Numbered list (key areas): 24px below its heading, 24px between items, 16px gap. Number badge: 24px circle, `#f5f5f7` / dark `#1c1c1e`, 13px semibold tabular. Area title semibold; points 15px / 1.5, `#6e6e73` / dark `#a1a1a6`, 6px apart, each with a 4px round bullet `#a1a1a6` / dark `#636366` 9px from the top.
- Pull quote: 40px below the ethics paragraph, top border `rgba(0,0,0,.08)` / dark `rgba(255,255,255,.1)`, 32px top padding. Quote 24px (`sm` 28px), line-height 1.25, semibold, -0.02em, `text-balance`; attribution 14px muted, 16px below.
- Figure: `aspect-[3/2]`, same image frame; caption 13px / 1.45 muted, 12px below.
- Closing link line: 15px muted, 24px below; link medium, `#0066cc` / dark `#2997ff`, underline on hover.

## Motion

- Rise variants: `hidden` `opacity 0, y 16, blur(6px)` → `show` `opacity 1, y 0, blur(0)`, spring stiffness 260, damping 32.
- Header: animates on mount, `staggerChildren 0.07`, `delayChildren 0.05` across meta, headline, dek and author row.
- Hero frame: from `opacity 0, scale 0.97, y 24` to rest, spring stiffness 200, damping 30, delay 0.25s. Inside it the image layer zooms from `scale 1.08` to 1, spring stiffness 60, damping 20, delay 0.25s (a slow settle).
- Body sections: each uses the rise variants with `whileInView`, `viewport { once: true, margin: "-80px" }`.

## Interaction and states

- Static content apart from the link.
- Reduced motion: rise becomes opacity only; the hero frame fades only and the image does not zoom.
- The section scrolls itself (`overflow-y-auto`) when its parent constrains the height, so it works inside a fixed-height preview.

## Demo data

- Dek: "AI is leaving the demo stage and settling into the quiet parts of everyday work. Here is what that shift asks of the people who design it."
- Introduction: "Artificial intelligence is moving from experimental demos into the quiet parts of daily work. It drafts, reviews, summarizes, designs, and helps teams make better decisions with less context switching."
- Key areas of AI development: Machine learning (deep learning for image, text, and audio reasoning; reinforcement systems that improve through feedback; recommendation engines for personalized experiences); Natural language processing (conversation interfaces for support and research; semantic search across private knowledge bases; language translation for global product teams); Computer vision (visual inspection for manufacturing and healthcare; spatial awareness for robotics and mobility; creative tooling for media generation).
- Ethical considerations: "The most useful systems are also the most accountable…" then the quote "The value of AI is not speed alone. It is the quality of judgment it helps people bring to complex work." — Priya Ramesh, head of research at Northfield.
- Figure caption: "Specialised chips now run most inference close to where the data lives."
- Conclusion paragraph, then "For more research notes, visit Northfield Research ›".

## Accessibility

- One `h1`, then `h2` per body section; the list is a real `ol` with nested `ul`s.
- Image layers have `role="img"` with `aria-label` ("Editorial article image", "Circuit board close-up"); the monogram and bullets are `aria-hidden`.
- The date uses `<time>`; the quote is a `blockquote` with a `footer`.
- The link has a visible focus outline (2px `#0071e3`, offset 2px).

## Acceptance checklist

- [ ] Header items rise and unblur one after another on mount.
- [ ] The hero fades up and its image slowly settles from a slight zoom.
- [ ] Body sections reveal individually as they scroll into view.
- [ ] Headline is 34px on phones and 48px from `sm`.
- [ ] An empty `dek` removes the standfirst without leaving a gap.
- [ ] The monogram shows the author's initials (max two).
- [ ] Section ids use `sectionIdPrefix`, so anchor links can target them.
- [ ] Dark mode swaps every colour listed above.
- [ ] Inside a fixed-height parent the section scrolls internally.
- [ ] Reduced motion fades only, with no zoom or movement.
