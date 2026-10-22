# Diff Review

Build an inline review for AI edits to a paragraph, the way you would review a teammate's. The card shows a draft. Press "Improve writing" and a blue shimmer passes over the text; then the suggestion appears inline: words to remove are tinted red with a line struck through them, words to add are tinted green and type themselves in. "Accept all" folds the removed words away while the new ones settle into normal text. "Reject" folds the new words away instead and keeps the original. Clicking any single change takes just that one. A small status label in the corner keeps track of where you are.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/diff-review/diff-review.tsx` plus an `index.ts`. Named exports: `DiffReview`, the types `DiffReviewProps`, `DiffPart` and `DiffKind`, and the constant `DIFF_REVIEW_PARTS`.

## API

`DiffPart` is a tuple `[kind, text]` where `kind` is `"same"`, `"del"` or `"ins"`. A `del` followed directly by an `ins` is one replacement; a `del` on its own is a removal. Changed runs are split into words (each with its surrounding spaces) so every word folds on its own.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `parts` | `DiffPart[]` | the demo paragraph | The paragraph as runs. |
| `title` | `string` | "Homepage · Hero copy" | Label above the text box. |
| `width` | `number` | `520` | Card width in px, never wider than the container. |
| `autoplay` | `boolean` | `false` | Improve, accept, back to draft, on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds (see Sound). |
| `className` | `string` | `""` | Extra classes for the card. |

Demo parts: same "Our app helps teams ", del "to ", same "manage ", del "there", ins "their", same " projects", del " more better", ins " faster", same ". ", del "It is very easy to use for everyone.", ins "Anyone can pick it up in minutes.", same " Try it free for 14 days."

## Layout and look

- Card: width 520px, `max-width: 100%`, radius 28px, padding 20px (24px from `sm`), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Header row: the title on the left (13px medium, `#6e6e73` / dark `#a1a1a6`) and the status label on the right (12px medium, same colour). Labels: "Draft", "Rewriting…", "N suggestions" (counts the changes still open; "All changes taken" at zero), "Edits applied", "Kept original".
- Text box: 12px below the header, minimum height 120px, radius 16px, 16px padding, bg `#fafafa` / dark `#2c2c2e`, `overflow: hidden`. The paragraph is 17px at line-height 1.75, text `#1d1d1f` / `#f5f5f7`.
- Changed words are inline-blocks (`white-space: pre`, aligned to the bottom, `overflow: hidden`) holding a button with radius 4px. In review: removed words get bg `rgba(255,59,48,.12)` and text `#c4271b` (dark: bg `rgba(255,69,58,.2)`, text `#ff8a80`), plus a 1.5px line across the middle in the same red; added words get bg `rgba(52,199,89,.16)` and text `#16702f` (dark: bg `rgba(48,209,88,.18)`, text `#6be28a`). Outside review, changed words use the normal text colour with a transparent background.
- Action row: 16px below the box, minimum height 36px. In draft or after a decision: one 36px tall pill, 13px medium, 16px side padding; dark fill `#1d1d1f` with white text (dark theme: `#f5f5f7` fill, `#1d1d1f` text), a 14px pencil icon, label "Improve writing" (or "Back to draft" after accepting or rejecting). In review: the hint "Click a change to take just that one" (12.5px muted) pushed left, then "Reject" (bg `#f5f5f7` / dark `#2c2c2e`, hover `#ececf0` / `#3a3a3c`) and "Accept all" (the dark pill).

## Motion

- Visibility by phase: draft and thinking show `same` and `del` words; review shows everything; accepted shows `same` and `ins`; rejected shows `same` and `del`. In review, a change you took shows only its `ins` side, as plain text.
- Thinking lasts 1100ms (350ms with reduced motion). A gradient bar (transparent, `#0071e3` at 10%, transparent; dark `#0a84ff` at 20%) sweeps across the box from -100% to 100% over 1s ease-in-out and fades out.
- Added words enter from `width 0, opacity 0` to `auto, 1` (width 0.3s, opacity 0.2s), each delayed by `order * 0.04s`, where order counts the changed words on screen from the left. Removed words are present from the start. Exits fold to `width 0, opacity 0` over 0.32s with `cubic-bezier(.4,0,.2,1)`, delayed by `order * 0.02s`.
- Strike line: `scaleX` from the left, 0 to 1 over 0.3s when words become reviewable (delayed `order * 0.03s`), back to 0 when a change is taken.
- Remaining words reflow with `layout="position"` inside a `LayoutGroup`, so the text slides to close gaps.
- Word tint and colour transition over 0.3s. The status label swaps with a short 4px vertical fade (`AnimatePresence mode="wait"`). The action row cross-fades with a 6px rise.
- Reduced motion: no shimmer, no layout glide, no stagger; width and opacity changes take 0.12s.

## Interaction and states

- "Improve writing" clears any taken changes, enters thinking, then review. It is disabled while thinking.
- Each changed word in review is a real button (focusable, `Accept change: remove "to"` / `Accept change: add "their"`). Clicking one takes the whole change (both halves of a replacement). Outside review these buttons are not focusable.
- "Accept all" applies every change; "Reject" keeps the original text. After either, the same slot offers "Back to draft".

## Autoplay demo

With `autoplay`, only while the card is on screen, the tab is visible and motion is not reduced: loop every 8.2s: at 0.9s press Improve writing, at 4.6s accept all, at 7.8s return to the draft. Any pointer press or focus inside stops the loop for good.

## Accessibility

- The status label is a polite `role="status"` region. The strike lines and shimmer are `aria-hidden`.
- Focus rings are 2px `#0071e3` (dark `#0a84ff`); inside the clipped words they are drawn inset so they are not cut off.
- Text and tint pairs meet 4.5:1 in both themes.

## Sound

Prop `enableSound?: boolean` (default `true`), using `useSound` from `@/lib/ui-sounds`.

- Accept all: `success` at volume 0.5.
- Reject: `off` at volume 0.5.
- Taking a single change: `tap` at volume 0.4.
- Improve writing and Back to draft are silent. In autoplay the accept step plays `success` through `play.auto` (silent until the visitor has used the page).

## Acceptance checklist

- [ ] Draft shows the original wording only; Improve writing sweeps a shimmer, then the red and green changes appear with the word-by-word stagger.
- [ ] Accept all folds the red words away and leaves the green as normal text; Reject does the opposite.
- [ ] Clicking one change takes just that change and the counter drops by one.
- [ ] The changed words are keyboard reachable with visible focus rings.
- [ ] Autoplay loops while visible and stops at the first touch.
- [ ] Reduced motion swaps the folds for 0.12s fades with no shimmer.
- [ ] Dark mode uses the colours above; works at 360px wide.
