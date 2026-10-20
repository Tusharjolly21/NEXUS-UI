# Questions & Answers FAQ

Build a two-column FAQ section inside one large rounded grey panel: on the left an eyebrow, a big heading, a paragraph and two contact pills (phone and email); on the right a stack of white numbered question cards that open one at a time, with a round plus that turns into a filled blue close mark. It should feel calm and Apple-like: soft grey surfaces, clean type, answers that unfold on a spring with a short blur-in.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, variants), `lucide-react` icons (`Phone`, `Mail`, `Plus`), and a `cn` class-merge helper.
- File: `components/blocks/faq-folder-card.tsx`, named export `FaqFolderCard` (also the default export). Export the `FaqItem` type (`{ question: string; answer: string; tag?: string }`) and `FaqFolderCardProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `FaqItem[]` | four studio questions (below) | The questions and answers. The first one starts open. |
| `eyebrow` | `string` | `"FAQ"` | Small grey label above the heading. |
| `title` | `string` | `"Questions, answered"` | The heading. |
| `description` | `string` | `"The things clients ask before we start. If yours isn't here, call or write and a designer will reply the same day."` | Paragraph under the heading. |
| `phone` | `string` | `"+44 20 7946 0321"` | Text of the phone pill; the `tel:` link strips all whitespace from it. |
| `email` | `string` | `"studio@northfield.design"` | Text of the email pill, linked with `mailto:`. |
| `className` | `string` | — | Extra classes on the outer `<section>`. |

## Layout and look

- Outer `<section>`: full width, `p-3` (12px), `sm:p-6` (24px). Background white, text `#1d1d1f`; dark: background black, text `#f5f5f7`.
- Panel: centred, `max-width: 1360px`, radius 32px, background `#f5f5f7` (dark `#1c1c1e`). Padding 24px, 40px from `sm`, 56px from `lg`. It is a grid with a 40px gap; from `lg` it becomes two columns `0.9fr 1.1fr` with a 56px gap. Below `lg` the intro stacks above the list.
- Left column: vertical flex, content centred vertically, `min-width: 0`.
  - Eyebrow: 17px, semibold, `#86868b` (dark `#98989d`).
  - Heading (`h2`): 8px below, max width `xl` (36rem), 40px (48px from `sm`), semibold, line height 1.05, tracking −0.035em.
  - Description: 20px below, max width `xl`, 17px (19px from `sm`), line height 1.5, `#6e6e73` (dark `#a1a1a6`).
  - Contact pills: 36px below, wrapping flex row, 12px gap. Each pill is a link, 44px tall, fully rounded, 20px horizontal padding, 8px gap, 15px medium, white background with a `0 0 0 1px rgba(0,0,0,.06)` ring shadow, hover background `#fafafa`. Dark: `#2c2c2e` background, no ring, hover `#3a3a3c`. The 16px icon (stroke 1.75) is `#0071e3` (dark `#2997ff`); the text truncates with an ellipsis and the pill never exceeds the column width.
- Right column: vertical flex, 12px gap, one card per item.
- Question card: radius 20px, white (dark `#2c2c2e`). Closed shadow `0 0 0 1px rgba(0,0,0,.05)` (dark none). Open shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.1)`), with a 300ms shadow transition.
- Card header: an `h3` holding a full-width button, flex row, 16px gap, 20px vertical padding, 20px horizontal (24px from `sm`), left-aligned text, radius 20px.
  - Index: 24px-wide column, 13px medium tabular numbers, `#86868b` (dark `#98989d`), two digits with a leading zero ("01", "02"…).
  - Question: flex 1, 17px semibold, line height 1.35, tracking −0.015em.
  - Toggle mark: 28px circle with a 16px `Plus` (stroke 2). Closed: `#e8e8ed` background, `#1d1d1f` icon (dark `#3a3a3c` / `#f5f5f7`). Open: `#0071e3` background, white icon. Colour transitions over 200ms.
- Answer: 15px (16px from `sm`), line height 1.6, `#6e6e73` (dark `#a1a1a6`), bottom padding 24px, right padding 24px, left padding 60px (64px from `sm`) so it lines up with the question text rather than the index.

## Motion

- Entrance (once, when the panel is 80px inside the viewport): the panel is a variants container with `staggerChildren: 0.06` and `delayChildren: 0.04`. The eyebrow, heading, description, pill row and each question card are items rising from `opacity 0, y 16, blur(6px)` to rest on a spring (stiffness 260, damping 30).
- Answer open/close: wrap in `AnimatePresence initial={false}`. The outer panel animates `height 0 → auto` and `opacity 0 → 1` (exit reverses); height uses a spring (stiffness 260, damping 32), opacity a 0.2s tween; it has `overflow: hidden`. An inner wrapper goes from `y -6, blur(4px)` to rest (exit back to that) on a spring (stiffness 420, damping 34).
- Toggle mark rotates 0° → 45° when open (the plus becomes an ×) on the same 420/34 spring.
- Contact pills shrink to `scale 0.97` while pressed.

## Interaction and states

- One open card at a time, stored as an index; the first card (index 0) is open on mount.
- Clicking the open card closes it (index −1); clicking another opens that one and closes the rest.
- Pills are real links: `tel:` with whitespace removed from `phone`, and `mailto:` with `email`.
- Focus: every button and link shows a 2px `#0071e3` outline with a 2px offset on `:focus-visible` only.

## Demo data

- Eyebrow "FAQ", heading "Questions, answered", phone "+44 20 7946 0321", email "studio@northfield.design".
- Questions and answers:
  1. "How long does a typical project take?" — "Most marketing sites ship in four to six weeks. Product work runs in two-week cycles, and you see a working build at the end of each one."
  2. "Do you work alongside in-house teams?" — "Often. We work in your repository and your tools, pair with your designers and engineers, and leave documentation behind so the team can carry it on."
  3. "What does it cost to get started?" — "Discovery is a fixed two-week engagement. After it you get a scoped plan with a price for each milestone, before any build work begins."
  4. "Can you take over an existing codebase?" — "Yes. We start with a short audit of the code, performance and accessibility, then agree with you what to fix first."

## Accessibility

- Each question button has `aria-expanded` and `aria-controls` pointing at its answer panel; build the ids from `useId()` plus the index.
- The question sits inside an `h3` under the section's `h2`.
- The toggle mark and the pill icons are decorative (`aria-hidden`).
- With `prefers-reduced-motion: reduce`: the entrance is a 0.2s opacity fade with no stagger, the answer panel uses a 0.15s fade/height tween with no blur or offset, and the toggle mark switches without rotating animation.

## Acceptance checklist

- [ ] One grey 32px-radius panel; two columns from `lg`, stacked below.
- [ ] The first question is open on load; its mark is a filled blue ×.
- [ ] Opening another question closes the previous one; clicking an open question closes it.
- [ ] Answers unfold with a spring height animation and a short blur-in, and their text lines up with the question text, not the number.
- [ ] Numbers read 01, 02, 03, 04 in tabular figures.
- [ ] The phone pill links to `tel:+442079460321`; the email pill to `mailto:studio@northfield.design`.
- [ ] Long emails truncate inside the pill instead of overflowing on a phone.
- [ ] Content rises in with a staggered blur reveal once, when scrolled into view.
- [ ] Dark mode swaps to black / `#1c1c1e` / `#2c2c2e` surfaces with light text.
- [ ] Keyboard focus shows a blue outline on buttons and pills; reduced motion removes the blur and rotation.
