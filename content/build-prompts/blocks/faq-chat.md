# Chat FAQ

Build an FAQ that plays out as a messaging thread. On the left, a heading and a column of question chips; on the right, a phone-style chat window. Picking a chip sends that question as a blue bubble, a grey typing indicator pulses for a moment, then the answer lands as a grey bubble. It should feel like iMessage: springy bubbles that grow from their corner, a shared blue highlight sliding between chips.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` incl. `mode="popLayout"`, `layoutId`, keyframe arrays, `useReducedMotion`), `lucide-react` (`RotateCcw`), and a `cn` helper.
- File: `components/blocks/faq-folder-card.tsx`, named export `ChatFaqSection`. Uses the shared `FaqItem` type `{ question: string; answer: string; tag?: string }` (tags are ignored here).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `FaqItem[]` | six coffee-subscription questions (below) | Each question becomes a chip; the first is selected on mount. |
| `className` | `string` | — | Extra classes on the outer `<section>`. |

## Layout and look

- Outer `<section>`: full width, `p-3` (12px), `sm:p-6`. White, ink `#1d1d1f`; dark black, ink `#f5f5f7`.
- Panel: centred, `max-width: 1360px`, `min-height: 640px`, radius 32px, background `#f5f5f7` (dark `#1c1c1e`). Padding 20px, 32px from `sm`, 48px from `lg`. Grid with 32px gap; from `lg` two columns `0.9fr 1.1fr` with a 48px gap. Phones and tablets stack the chips above the chat.
- Left column (vertical flex, centred vertically):
  - Heading (`h2`) "Ask before your first box.": max width `md`, 36px (44px from `sm`), semibold, line height 1.08, tracking −0.03em.
  - Paragraph 16px below: max width `md`, 17px, line height 1.5, `#6e6e73` (dark `#a1a1a6`): "Tap a question and the roastery answers. Real replies, usually within minutes."
  - Chips 32px below: vertical flex, left-aligned, 8px gap. Each chip is a fully rounded button, 16px horizontal / 10px vertical padding, 15px medium, line height 1.3, left-aligned text, max width 100% (long questions wrap). Unselected: white, ink text, `0 0 0 1px rgba(0,0,0,.05)` ring, hover `#fafafa`; dark `#2c2c2e`, no ring, hover `#3a3a3c`. Selected: white text over a `#0071e3` pill that fills the chip.
- Chat window (right): relative vertical flex, `min-height: 460px`, `overflow: hidden`, radius 28px, white (dark black). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark `0 0 0 1px rgba(255,255,255,.08)`.
  - Header: flex row, 12px gap, 20px horizontal / 16px vertical padding, bottom border 1px `black/6%` (dark `white/8%`). A 36px round avatar, `#1d1d1f` with a white 14px semibold "H" (dark `#f5f5f7` with `#1d1d1f`). Name "Hearth Roasters" 15px semibold (truncates), subtitle "Usually replies in minutes" 12px `#86868b` (dark `#98989d`). On the right, a 36px round reset button, background `#f5f5f7` (dark `#1c1c1e`), `#6e6e73` icon turning ink on hover, 16px `RotateCcw` at stroke 1.75.
  - Thread: flex 1, vertical flex justified to the bottom, 12px gap, 16px sides (24px from `sm`), 20px top, 24px bottom. First a centred timestamp "Today 10:07", 12px medium `#86868b`.
  - Question bubble: right-aligned (`margin-left: auto`), max width 80%, `#0071e3`, white 16px text, line height 1.4, 16px/10px padding, radius 20px with the bottom-right corner 6px.
  - Answer area: a one-cell grid so the typing bubble and the answer bubble overlap in the same cell (`grid-area: 1/1`).
  - Typing bubble: 36px tall, auto width, 14px horizontal padding, 4px gap, radius 18px with the bottom-left 6px, background `#e9e9eb` (dark `#262628`), three 8px dots in `#8e8e93`.
  - Answer bubble: left-aligned, max width 85%, `#e9e9eb` (dark `#262628`), ink 16px text, line height 1.45, 16px/12px padding, radius 20px with the bottom-left 6px.

## Motion

- Entrance (once, 80px into view): panel is a variants container, `staggerChildren: 0.05`, `delayChildren: 0.04`. Heading, paragraph, each chip and the chat window rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30).
- Chip highlight: shared `layoutId` (scoped with `useId`), spring stiffness 380, damping 32. Chips press to `scale 0.97`; the reset button to `0.92`.
- Question bubble: keyed by the active index in `AnimatePresence mode="popLayout" initial={false}`. Enters from `opacity 0, scale 0.6, y 12`; exits to `opacity 0, y -12, blur(6px)`; spring stiffness 420, damping 30; `transform-origin: 100% 100%` so it grows from its tail.
- Typing bubble: keyed by index, `AnimatePresence initial={false}`. Starts `opacity 0, scale 0.6`, then keyframes `opacity [0, 1, 1, 0]` and `scale [0.6, 1, 1, 0.9]` at times `[0, 0.2, 0.85, 1]` over 1.05s (`typing 0.9 + 0.15`) after a 0.15s delay; origin `0% 100%`. Each dot loops `opacity [0.35, 1, 0.35]` over 0.9s, infinite, staggered by 0.15s.
- Answer bubble: keyed by index, `mode="popLayout"`. Enters from `opacity 0, scale 0.85, y 10, blur(6px)`; exits to `opacity 0, y -10, blur(6px)`; spring stiffness 340, damping 30 with a delay of 1.05s (typing 0.9 + 0.15) so it lands as the dots fade. Origin `0% 100%`.

## Interaction and states

- One piece of state: the active index, starting at 0. If it points past the list, fall back to the first item (or the built-in first question).
- Clicking a chip sets it active; re-clicking the active chip replays nothing (same key).
- The reset button returns to index 0.
- The thread always shows exactly one question and one answer; switching swaps both with the exit/enter animations above.

## Demo data

1. "When will my first box ship?" — "Orders placed before noon leave the roastery the same day. Most addresses get them in two to three days, and you'll get a tracking link by email."
2. "Can I pause my subscription?" — "Any time, from your account page. Pause for a week or a few months; we email you three days before the next roast so nothing arrives by surprise."
3. "Which grind should I choose?" — "Tell us how you brew and we grind for it: fine for espresso, medium for pour-over, coarse for a French press. Or take whole beans and grind at home."
4. "What if I don't like a coffee?" — "Tell us within 14 days and we send a different one free. Your notes also tune what we pick for your next box."
5. "Do you ship outside the country?" — "We ship to the EU, the UK and Canada. Duties are included in the price you see at checkout."
6. "Is the packaging recyclable?" — "The bags are compostable and the box is recycled cardboard. The one-way valve is the only part to take off first."

## Accessibility

- Chips: a `role="radiogroup"` container labelled "Questions"; each chip is a `button` with `role="radio"` and `aria-checked`.
- The thread container is `aria-live="polite"` so the new question and answer are announced.
- The typing bubble is `aria-hidden`; the highlight pill too.
- Reset button: `aria-label="Reset chat FAQ"`.
- Focus-visible outline: 2px `#0071e3`, 2px offset.
- Reduced motion: no typing bubble (typing time 0), bubbles only fade (answer 0.2s), no press scaling, highlight jumps, entrance is a 0.2s fade.

## Acceptance checklist

- [ ] Two columns from `lg`; chips stack above the chat on smaller screens.
- [ ] On load the first chip is blue and the chat shows its question and answer without animating.
- [ ] Picking another chip slides the blue highlight to it.
- [ ] The question bubble pops from its bottom-right corner; the old one floats up and blurs out.
- [ ] Three pulsing dots show for about a second before the answer bubble lands.
- [ ] Bubble tails: blue bottom-right corner 6px, grey bottom-left 6px.
- [ ] The reset button returns to the first question.
- [ ] Long chips wrap rather than overflow on a 360px screen.
- [ ] Dark mode: black chat window, `#262628` grey bubbles, `#1c1c1e` panel.
- [ ] Reduced motion removes the typing delay and all scale/blur effects.
