# Searchable FAQ

Build a help-centre card: a heading, a search field and a segmented topic control on one row, then a list of question rows that filter live as you type or switch topic, with rows gliding into place and answers unfolding inline. A footer offers a way to contact support. It should feel like a native settings sheet: white card on light grey, a sliding segmented thumb, nothing jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"`, `layout`, `layoutId`, `useReducedMotion`), `lucide-react` (`Search`, `Plus`), and a `cn` helper.
- File: `components/blocks/faq-folder-card.tsx`, named export `SearchableFaqSection`. Uses the shared `FaqItem` type `{ question: string; answer: string; tag?: string }`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `FaqItem[]` | six help-centre questions (below) | The questions. Each distinct `tag`, in first-seen order, becomes a topic after "All". |
| `className` | `string` | — | Extra classes on the outer `<section>`. |

## Layout and look

- Outer `<section>`: full width, background `#f5f5f7` (dark black), text `#1d1d1f` (dark `#f5f5f7`). Padding 12px sides with 40px top/bottom; from `sm` 24px sides and 56px top/bottom.
- Card: centred, `max-width: 860px`, radius 28px, white (dark `#1c1c1e`), padding 20px (36px from `sm`). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark `0 0 0 1px rgba(255,255,255,.08)`.
- Heading "Help centre" (`h3`): 32px semibold, line height 1.1, tracking −0.03em. Below it (8px) a 17px paragraph, line height 1.5, max width `2xl`, `#6e6e73` (dark `#a1a1a6`): "Answers about your account, billing and security. Search, or pick a topic."
- Controls row, 28px below: column with 12px gap on phones; from `sm` a row with items centred.
  - Search: flex 1. 44px tall input, radius 12px, background `#f5f5f7` (dark `#2c2c2e`), 40px left padding, 12px right, 15px text, placeholder `#a1a1a6` (dark `#8e8e93`), no outline; on focus a `0 0 0 3px rgba(0,113,227,.35)` ring. A 16px `Search` icon (stroke 1.75, `#86868b` / dark `#98989d`) sits 14px from the left, vertically centred, pointer-events none. `type="search"`, placeholder "Search the help centre".
  - Topic control: full width on phones, auto from `sm`; radius 10px, background `#e8e8ed` (dark `#3a3a3c`), 3px padding. Segments are 38px tall, radius 8px, 12px horizontal padding, 13px medium, equal flex on phones and natural width from `sm`. Label text truncates. Unselected `#6e6e73` (dark `#a1a1a6`) with hover to ink; selected ink.
  - The selected thumb is an absolutely filling span behind the label: white with shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, dark `#636366`.
- List, 24px below: a vertical flex `ul` with an 8px gap.
- Row: radius 16px. Open: background `#f5f5f7` (dark `#2c2c2e`). Closed: transparent, hover `#f5f5f7` at 70% (dark `#2c2c2e` at 60%). 300ms colour transition.
  - Row button: full width, flex, space-between, 16px gap, 16px horizontal and 14px vertical padding, radius 16px. Question 16px semibold, line height 1.4, tracking −0.01em. When the "All" topic is active and the item has a tag, the tag shows under the question at 12px, `#86868b` (dark `#98989d`).
  - Toggle mark on the right: 28px circle with a 16px `Plus` (stroke 2); closed `#e8e8ed`/ink (dark `#3a3a3c`/`#f5f5f7`), open `#0071e3`/white.
  - Answer: 15px, line height 1.6, `#6e6e73` (dark `#a1a1a6`), padding 16px left, 16px bottom, 56px right.
- Empty state: radius 16px, background `#f5f5f7` (dark `#2c2c2e`), 40px vertical padding, centred 15px `#6e6e73` text: No questions match “query” (curly quotes; falls back to the topic name when the search is empty).
- Footer, 28px below, separated by a 1px top border `black/8%` (dark `white/10%`) with 24px top padding: wrapping flex row, space-between, 12px gap. Left: "Still have questions?" 15px semibold, then "Our support team replies within four working hours." 13px secondary. Right: link "Message support ›", 15px medium, `#0066cc` (dark `#2997ff`), underline on hover, `mailto:hello@example.com`.

## Motion

- Entrance (once, 80px into view): card is a variants container, `staggerChildren: 0.05`, `delayChildren: 0.04`. Heading, paragraph, controls row, list block and footer each rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30).
- Topic thumb: shared `layoutId` (scope it with `useId`) on a spring (stiffness 420, damping 34).
- List: the `ul` and every `li` use `layout`, transition spring stiffness 260, damping 32. Rows enter from `opacity 0, scale 0.98, blur(4px)` and exit to the same, inside `AnimatePresence mode="popLayout" initial={false}`.
- Empty state fades in and out (`AnimatePresence initial={false}`).
- Answer: height `0 → auto` with a spring (stiffness 260, damping 32) and opacity over 0.2s, `overflow: hidden`; inner text from `y -6, blur(4px)` on a spring (420/34).
- Toggle mark rotates to 45° when open on the 420/34 spring.

## Interaction and states

- State: `open` (the open question's text, starts as the first item's question), `search` (string), `activeTab` (starts "All").
- Filter: trim and lowercase the query; keep items whose tag matches the topic (or the topic is All) and whose question or answer contains the query.
- Clicking a row toggles it; only one row is open at a time. Switching topic or searching never resets which question is open.
- Row keys combine question and tag so identical questions under different tags stay distinct.

## Demo data

1. Account — "How do I invite my team?" — "Open Settings, then Members, and paste their email addresses. Invites expire after seven days and you can resend them from the same screen."
2. Billing — "Can I change plans in the middle of a cycle?" — "Yes. Upgrades apply straight away and we charge the prorated difference. Downgrades take effect at your next renewal."
3. Billing — "Do you offer refunds?" — "Annual plans can be refunded in full within 14 days of purchase. Write to billing@relay.app and we process it within two working days."
4. Account — "How do I export my data?" — "Go to Settings, then Data, and choose CSV or JSON. Large workspaces are emailed to you as a download link."
5. Security — "Is two-factor sign-in available?" — "Every plan includes two-factor sign-in with an authenticator app. Admins can require it for the whole workspace."
6. Security — "Where is my data stored?" — "In the EU or the US, whichever you pick when you create the workspace. Data is encrypted at rest and in transit."

Topics therefore read: All, Account, Billing, Security.

## Accessibility

- A visually hidden `<label>` "Search the help centre" tied to the input by id.
- Topic control: `role="radiogroup"` with `aria-label="Topic"`; each segment is a `button` with `role="radio"` and `aria-checked`.
- A visually hidden `aria-live="polite"` line announces "N questions shown" (singular "question" for one).
- Row buttons carry `aria-expanded` and `aria-controls`; icons are `aria-hidden`.
- Focus-visible outline: 2px `#0071e3`, 2px offset, on segments, rows and the footer link.
- Reduced motion: no layout animation, rows and answers only fade (0.15–0.2s), the thumb jumps, entrance is a 0.2s fade.

## Acceptance checklist

- [ ] White 28px-radius card on a `#f5f5f7` page, max 860px wide.
- [ ] Search and topic control share a row from `sm` and stack on phones.
- [ ] The white thumb slides between All / Account / Billing / Security.
- [ ] Typing "refund" leaves one row and the others collapse away smoothly.
- [ ] Tags show under questions only on the All topic.
- [ ] A query with no matches shows the grey "No questions match" box with the query in curly quotes.
- [ ] The first question starts open; opening another closes it.
- [ ] Screen readers hear the shown-question count change.
- [ ] Footer link reads "Message support ›" in blue and wraps under the text on narrow screens.
- [ ] Dark mode uses `#1c1c1e` card, `#2c2c2e` fields and `#636366` thumb.
