# Instant Search FAQ

Build a searchable FAQ where the list filters as you type: matched words get a yellow highlighter mark, the remaining questions slide together, category chips narrow it further, and with no results a small chat bubble with bouncing dots offers to "Ask the team". An optional autoplay types a few searches by itself until someone touches it. It should feel quick and tactile, never jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"`, `LayoutGroup`, `layout`, `layoutId`, `useReducedMotion`). No icon library: the search and chevron icons are inline SVG.
- File: `components/blocks/motion-kit/instant-search-faq/instant-search-faq.tsx`, named export `InstantSearchFaq`, plus exported types `InstantSearchFaqItem` (`{ q: string; a: string; cat: string }`) and `InstantSearchFaqProps`. Re-export them from an `index.ts` in the same folder.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `#0071e3` light / `#0a84ff` dark | Eyebrow, focus rings, search focus ring and the Ask link. Set as the CSS variable `--mk-a`; when passed, it overrides both themes. |
| `faqs` | `InstantSearchFaqItem[]` | seven questions (below) | Questions; each distinct `cat` becomes a chip after "All", in first-seen order. |
| `eyebrow` | `string` | `"FAQ"` | Small label above the heading. |
| `title` | `string` | `"Ask us anything. We probably wrote it down."` | Heading. |
| `description` | `string` | `"Still stuck? Our team replies in a few minutes, most hours of the day."` | Paragraph under the heading. |
| `onAskTeam` | `(query: string) => void` | — | Called from the "Ask the team" link with the trimmed search text. |
| `autoplay` | `boolean` | `false` | Types demo searches on a loop until the visitor interacts. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, white (dark black), horizontal padding 16px (20px from `sm`), vertical padding `clamp(48px, 8vw, 80px)`. Declare `--mk-a: #0071e3` (dark `#0a84ff`); an `accent` prop is applied inline and wins.
- Inner grid: centred, `max-width: 1040px`, one column with a 32px gap (40px from `sm`); from `lg` two columns `1fr 1.5fr`.
- Intro column (vertical flex, 16px gap): eyebrow 14px semibold in the accent; heading `clamp(30px, 5vw, 50px)`, semibold, line height 1.04, tracking −0.04em, ink `#1d1d1f` (dark `#f5f5f7`), no margin; paragraph `clamp(16px, 1.6vw, 17px)`, line height 1.5, muted `#6e6e73` (dark `#a1a1a6`).
- Search column (vertical flex, 16px gap, `min-width: 0`):
  - Search field inside a `label`: 48px tall, radius 16px, background `#f5f5f7` (dark `#1c1c1e`), 44px left / 112px right padding, 16px text, placeholder "Search questions" in `#a1a1a6` (dark `#8e8e93`), no outline, focus ring 2px accent. Hide the WebKit cancel button. `maxLength` 80. A 18px magnifier SVG (stroke 2.4, round caps; path `M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4`) sits 16px from the left in `#86868b` (dark `#8e8e93`).
  - Result count pill (only while the trimmed query is non-empty): 12px from the right, fully rounded, white (dark `#2c2c2e`), 10px/4px padding, 12px medium tabular muted text, ring `0 0 0 1px rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). Reads "1 result" or "N results".
  - Chips: wrapping row, 6px gap. Each chip 40px tall, fully rounded, 16px horizontal padding, 13px medium. Unselected: `#f5f5f7` backing (dark `#1c1c1e`), text `#424245` (dark `#d1d1d6`). Selected: a `#1d1d1f` pill (dark `#f5f5f7`) behind white text (dark `#1d1d1f`).
  - List: vertical flex. Each item has a 1px bottom border `black/7%` (dark `white/10%`). The question button is full width, min height 56px, 16px vertical padding (20px from `sm`), space-between with a 16px gap, radius 8px. Question text `clamp(16px, 1.7vw, 17px)` semibold, tracking −0.015em, ink. A 14px chevron SVG (`M6 9l6 6 6-6`, stroke 2.6, muted) sits on the right. Answer: 15px, line height 1.6, muted, 20px bottom padding.
  - Highlight: the first case-insensitive occurrence of the trimmed query in both question and answer is wrapped in `<mark>`, radius 4px, 2px horizontal padding, background `#ffd60a` at 60% (dark 35%), text inherits.
  - Empty state: vertical flex, left-aligned, 12px gap, 32px vertical padding. Text 15px muted: Nothing about “query” yet. (curly quotes, `break-words`). Then a chat bubble: 12px/16px padding, radius 18px with a 6px bottom-left, background `#f0f0f3` (dark `#2c2c2e`), three 8px dots `#86868b` (dark `#8e8e93`) with an 8px gap. Then the link "Ask the team →", 15px medium, accent, min height 40px.

## Motion

- Category pill: shared `layoutId` inside a `LayoutGroup` whose id is unique per instance (`useId`), spring stiffness 500, damping 34.
- List container: `layout`. Items: `layout`, enter from `opacity 0, y 10`, exit to `opacity 0, scale 0.96, blur(4px)`; spring stiffness 380, damping 32, with the filter on a 0.35s tween. `AnimatePresence initial={false} mode="popLayout"`.
- Chevron rotates 0° → 180° when open, spring stiffness 400, damping 24.
- Answer: `height 0 → auto`, `opacity 0 → 1` (and back) on a spring (stiffness 300, damping 30), `overflow: hidden`.
- Result pill: in from `opacity 0, scale 0.8`, out the same.
- Empty state: in from `opacity 0, y 10`, out to `opacity 0`. Dots loop `y [0, -4, 0]` and `opacity [0.4, 1, 0.4]` over 0.9s, infinite, staggered 0.15s. The Ask link nudges `x: 3` on hover.

## Interaction and states

- State: query `q`, category `cat` (starts "All"), `open` (question text; starts as the first FAQ's question), `touched`.
- Filter: trim and lowercase the query; keep items in the chosen category (or All) whose question + space + answer contains it.
- Clicking a question toggles it; one open at a time. The answer stays open across filtering if still listed.
- Clicking "Ask the team" prevents the default `#` navigation and calls `onAskTeam(trimmedQuery)`.
- Any pointer down or key down on the section, or focusing the input, marks it touched; if autoplay was on, the query is cleared at that moment. Autoplay never restarts.

## Autoplay demo

Runs only while `autoplay && !touched && !reducedMotion`. Wait 900ms, then loop over `["refund", "sso", "pizza", "offline"]`: type the word one character every 110ms; open the first match across all categories (if any); hold 2400ms; erase one character every 45ms; wait 700ms; next word. "pizza" deliberately shows the empty state. Cancel the loop and clear the pending timeout on cleanup.

## Demo data

| cat | q | a |
| --- | --- | --- |
| Billing | Can I switch plans later? | Yes, any time. Upgrades apply straight away and we credit the unused part of your old plan. |
| Billing | Do you offer refunds? | If it isn't working for you in the first 30 days, write to us and we'll refund the full amount. |
| Billing | Is there a discount for non-profits? | Registered non-profits and schools get 50% off any plan. Send us your details from the billing page. |
| Product | Does it work offline? | The desktop and mobile apps keep your recent work offline and sync when you reconnect. |
| Product | Can I import from another tool? | One-click imports cover the most common tools, and there's a CSV importer for everything else. |
| Security | Where is my data stored? | In the region you choose when you sign up: US, EU or Australia. It never leaves that region. |
| Security | Do you support SSO? | SAML SSO and SCIM provisioning are included on the Scale plan. |

## Accessibility

- The search input has a visually hidden label "Search questions"; the result count is `aria-live="polite"`.
- Chips: `role="radiogroup"` labelled "Category", each a `button` with `role="radio"` and `aria-checked`.
- Question buttons carry `aria-expanded`; SVG icons and the dots bubble are `aria-hidden`.
- Every control shows a 2px accent ring on `:focus-visible`; tap targets are at least 40px tall.
- Reduced motion disables autoplay and holds the dots still at 0.7 opacity.

## Acceptance checklist

- [ ] Two columns from `lg`, one column below, max 1040px wide.
- [ ] Typing "sso" leaves one question with "SSO" highlighted in yellow and shows "1 result".
- [ ] Removed questions blur out and the rest slide up to close the gap.
- [ ] The dark chip pill slides between All / Billing / Product / Security.
- [ ] "pizza" shows the empty message, bouncing dots and "Ask the team →", which calls `onAskTeam("pizza")`.
- [ ] The first question is open on load; its chevron points up.
- [ ] With `autoplay`, the four searches type and erase on a loop.
- [ ] Clicking anywhere in the section stops autoplay for good and clears the field.
- [ ] Passing `accent="#ff375f"` recolours the eyebrow, focus rings and Ask link in both themes.
- [ ] Dark mode: black section, `#1c1c1e` field and chips, light chip pill with dark text.
