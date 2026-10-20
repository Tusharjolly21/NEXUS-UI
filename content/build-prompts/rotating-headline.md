# Rotating Headline

Build a large hero headline whose fixed lead words rise one at a time out of a blur, ending on an accent-coloured word that keeps rolling up to the next word every couple of seconds. A grey subline follows word by word, and a dark pill button with a travelling shine replays the whole reveal. It should feel editorial and Apple-keynote-like: slow, soft entrances with a long ease-out, and a crisp spring on the rotating word.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`).
- File: `components/rotating-headline/rotating-headline.tsx`, named export `RotatingHeadline`; export `RotatingHeadlineProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `lead` | `string` | `"Built to"` | Words that stay put (split on spaces, each animated). |
| `words` | `string[]` | `["move.", "delight.", "last.", "ship."]` | Words that take turns at the end. |
| `sub` | `string` | `"Every word arrives on its own beat. The last one keeps changing."` | Subline under the headline. |
| `accent` | `string` | `"#0071e3"` | Colour of the rotating word. |
| `interval` | `number` | `2000` | Milliseconds between word changes. |

There is no `autoplay` prop: the word rotation always runs.

## Layout and look

- Root: full-width vertical flex, centred, 24px gap, centred text.
- Headline `<h2>`: no margin, wrapping flex row, centred, baseline-aligned, horizontal gap 0.25em. 56px semibold, line-height 1.05, tracking −0.035em, `#1d1d1f` / dark `#f5f5f7`. Each lead word is an `inline-block` span.
- Rotating slot: `inline-flex`, `position: relative`, `overflow: hidden`, bottom padding 0.08em (so descenders aren't clipped), coloured with `accent`. Inside it, the current word as an `inline-block`.
- Subline `<p>`: no margin, max 360px, 17px, line-height 1.45, tracking −0.01em, `#6e6e73` / dark `#a1a1a6`. Each word is an `inline-block` span with `white-space: pre`, carrying its trailing space (except the last word) so spacing survives the inline-block split.
- Replay button: fully rounded, padding 10px × 20px, 14px medium; light bg `#1d1d1f` with white text, dark bg `#f5f5f7` with `#1d1d1f` text; `overflow: hidden`. Label "Replay reveal" sits above a shine strip: absolutely positioned, full height, half the button wide, starting at −50% left, `linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)`.

## Motion

- Shared ease for reveals: `[0.16, 1, 0.3, 1]` (a long ease-out).
- Lead words: from `opacity 0, y 24, blur(12px)` to rest, 0.9s, delay `0.1 + k × 0.12s` for word `k`.
- Rotating word: `AnimatePresence mode="popLayout" initial={false}`, keyed by the word. Enter from `y 100%, opacity 0, blur(8px)`; exit to `y −100%, opacity 0, blur(8px)`; spring stiffness 260, damping 26. The slot clips it, so the old word rolls up and out while the new one rolls up in.
- Slot width: the slot is `layout` with spring stiffness 300, damping 30, so it widens or narrows smoothly to fit each word and the headline re-centres without jumping.
- Subline words: from `opacity 0, blur(6px)` to sharp, 0.6s, same ease, delay `0.6 + k × 0.035s` — starts after the headline is mostly in.
- Replay button: `whileHover` scale 1.03, `whileTap` scale 0.95. Shine animates `x` from 0% to 400% of its own width over 1.6s, easeInOut, repeating forever with a 1.4s pause between passes.

## Interaction and states

- An interval advances the word index every `interval` ms, wrapping around `words.length`. Recreate it when `words.length` or `interval` changes; clear it on unmount.
- Replay increments a `run` counter used as the `key` of both the `<h2>` and the `<p>`. Remounting them restarts the lead-word and subline reveals. The rotating word is not re-revealed on replay (its `AnimatePresence` has `initial={false}`), it simply appears and keeps rotating from the current index.

## Autoplay demo

Not applicable as a prop: on mount the lead words and subline reveal once, and the final word rotates continuously for as long as the component is mounted. The Replay button re-runs the reveal at any time.

## Accessibility

- The headline is a real `<h2>` and the subline a `<p>`, so the text is readable as normal content.
- The shine strip is `aria-hidden`.
- The Replay button is `type="button"` with a 2px `#0071e3` focus-visible outline, offset 2px.

## Acceptance checklist

- [ ] "Built to" appears word by word, each rising out of a blur.
- [ ] The blue word changes every 2s, rolling upward inside a clipped slot.
- [ ] When the word length changes, the headline re-centres smoothly instead of snapping.
- [ ] Descenders on the rotating word aren't clipped.
- [ ] The subline fades in word by word after the headline, with normal spacing.
- [ ] A soft light sweeps across the Replay button every few seconds.
- [ ] Replay restarts the headline and subline reveals while rotation continues.
- [ ] Changing `interval` changes the rotation speed; dark mode inverts the colours listed above.
