# Motion FAQ Disclosure

Build a two-column FAQ section in a rounded card: on the left an eyebrow, heading, intro line and a "Still curious?" support card; on the right an accessible accordion. Opening a question lifts it out of the list into a raised white card with a slight overshoot, spins its plus into a minus, and unfolds the answer one sentence at a time, each sentence sharpening out of a soft blur. Quiet, precise and Apple-light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@min-[480px]:`, `@min-[680px]:`), framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), React `useId`.
- File: `components/motion-faq-disclosure/motion-faq-disclosure.tsx`, named export `MotionFaq`, types `MotionFaqItem` (`{ q: string; a: string }`) and `MotionFaqProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `MotionFaqItem[]` | 5 sample Q&As (client work, App Router, requirements, updates, accessibility) | Questions and answers. |
| `heading` | `string` | `"Questions, answered"` | Left heading. |
| `intro` | `string` | "Everything people ask before they install their first component." | Line under the heading; empty hides it. |
| `defaultOpen` | `number` | `0` | Index open first; `-1` for none. |
| `multiple` | `boolean` | `false` | Allow several open at once. |
| `contact` | `{ label: string; href: string } \| null` | `{ label: "Talk to a human", href: "#" }` | Support card; `null` hides it. |
| `onToggle` | `(index: number, open: boolean) => void` | — | Fired on user toggles. |
| `autoplay` | `boolean` | `false` | Opens each question in turn until touched. |
| `className` | `string` | `""` | Extra classes on the section. |

Default answers (use verbatim): "Can I use the components in client work?" / "Yes. Everything you install is yours to ship in personal and commercial projects, including work you bill clients for. You can't resell the components themselves as a library."; "Does it work with the Next.js App Router?" / "Every component is a typed React client component built for the App Router. Drop it into a server page and it hydrates on its own."; "What do I need installed?" / "React 19, Tailwind CSS v4 and, for most components, framer-motion. The CLI installs whatever a component needs."; "How do updates reach my project?" / "Run the install command again to pull the latest version. The code lives in your repo, so you review every change like any other diff."; "Is it accessible?" / "Keyboard support, visible focus, sensible ARIA and reduced motion are part of every component's definition of done."

## Layout and look

- `<section>`: `@container`, full width, radius 28px, padding 24px (32px at container ≥480px), white / `#1c1c1e`, text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` ring, `.9` shadow).
- Grid: one column, gap 32px; at ≥680px columns `0.8fr 1.2fr`, gap 40px.
- Left column (flex column): eyebrow "FAQ" 12px semibold uppercase, tracking .14em, `#0066cc` / `#64a8ff`. `<h2>` margin-top 8px, 28px semibold, line-height 1.08, tracking −0.035em, balanced. Intro margin-top 10px, max-width 320px, 14px relaxed, `#6e6e73` / `#a1a1a6`.
- Support card link: margin-top 24px (pushed to the bottom with `margin-top: auto` at ≥680px), flex, gap 12px, radius 18px, padding 12px, `#f5f5f7` (hover `#ececf0`), dark `#2c2c2e` (hover `#3a3a3c`). A 40px tile radius 12px, `#1d1d1f` with white icon (dark inverted), holding an 18px speech-bubble outline (stroke 1.6). Text: "Still curious?" 13px semibold; "{label}, replies within a day" 12px grey. A 12px chevron on the right that nudges 2px right on hover.
- Right column: flex column, gap 4px. Each item is relative and contains:
  - A raised card layer (absolute inset 0, radius 18px, white / `#2c2c2e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 18px 34px -20px rgba(0,0,0,.4)`; dark `rgba(255,255,255,.08)` ring, `.9` shadow) visible only when open.
  - A 1px divider above every item but the first (inset 16px sides, 2.5px above, `#e5e5ea` / `#38383a`), hidden when this item or the previous one is open.
  - `<h3>` wrapping a full-width button: radius 18px, padding 14px 16px, gap 20px, space-between. Question 15px medium tracking −0.01em; closed `#3a3a3c` (dark `#d1d1d6`) with hover to ink; open ink.
  - Plus/minus: 28px circle; closed `#f0f0f3` / `#2c2c2e` with grey glyph (hover ink); open `#0071e3` / `#0a84ff` with white glyph, 200ms colour transition. Glyph is a 12×2px horizontal bar plus a 2×12px vertical bar.
  - Answer panel: overflow hidden; paragraph max-width 65ch, padding 0 56px 16px 16px, 14px relaxed, grey.

## Motion

- Raised card: open `opacity 1, scale 1, y 0`; closed `opacity 0, scale .97, y 4`; spring stiffness 340, damping 18 (a small overshoot as it lifts).
- Plus to minus: the vertical bar animates `rotate 0 → 90` and `scaleY 1 → 0`, spring stiffness 380, damping 14.
- Panel height: `AnimatePresence initial={false}`, `height 0 → auto` and back, spring stiffness 300, damping 32.
- Sentences: split the answer with `/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g`. Each sentence is an inline span from `opacity 0, blur(4px)` to `opacity 1, blur(0)`, 0.32s, ease `[0.22, 1, 0.36, 1]`, delay `0.06 + k·0.09`; exit fades.
- Reduced motion: all of the above are instant (duration 0) and sentences appear without blur.

## Interaction and states

- Click toggles a question. Single mode replaces the open set with that index (or empties it); `multiple` adds or removes it. `onToggle(i, nowOpen)` fires.
- Keys on a question button: ArrowDown / ArrowUp move focus to the next / previous question (wrapping), Home to the first, End to the last. Enter/Space toggle natively.
- Any pointer down on the section marks it touched.

## Autoplay demo

If `autoplay` and at least two items, every 3000ms open the next question alone (starting after `defaultOpen`, wrapping). Stop permanently once the section is touched. Autoplay does not call `onToggle`.

## Accessibility

- Each button has `aria-expanded` and `aria-controls` pointing at its panel; panels are `role="region"` with `aria-labelledby` the button. IDs come from `useId` with colons stripped.
- Decorative layers, dividers and icons are `aria-hidden`. Focus outlines 2px `#0071e3` / `#0a84ff`.

## Acceptance checklist

- [ ] The first question starts open on a raised card.
- [ ] Opening another closes the first in single mode; the new one lifts with a slight overshoot.
- [ ] The plus spins flat into a minus and the circle turns blue.
- [ ] Answer sentences unblur one after another about 90ms apart.
- [ ] Dividers vanish next to an open card.
- [ ] Arrow keys, Home and End move between questions.
- [ ] Below a 680px container the layout stacks with the support card under the intro.
- [ ] Autoplay cycles every 3s until the first touch.
