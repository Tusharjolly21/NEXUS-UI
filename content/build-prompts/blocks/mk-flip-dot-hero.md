# Flip-dot Hero

Build a hero around a flip-dot sign like an old railway departure board. A board of round dots shows a word in a 5 x 7 dot font. When the word changes, the dots that change flip over in a ripple from left to right, each spinning on its own axis with a little overshoot. Drag across the board to flip dots by hand (they flip back after a moment), or type your own word. Apple-light page, black sign with yellow dots.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useInView`, `useReducedMotion`) and a `cn` helper. The flip itself is plain CSS 3D transforms and transitions.
- File: `components/blocks/flip-dot-hero.tsx`, named export `FlipDotHero` and type `FlipDotHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `words` | `string[]` | `["HELLO", "BUILD", "SHIP IT", "NEXUS"]` | Words the sign cycles through. Each is upper-cased, stripped of accents, reduced to the characters the dot font has (A to Z, 0 to 9, space, `!`, `?`) and cut to 7 characters. Use a stable array. |
| `autoplay` | `boolean` | `false` | Cycles the sign every 2.8s until the visitor first presses the board, types or presses a key. Never runs under reduced motion. |
| `className` | `string` | none | Extra classes on the section. |

## The dot font

5 x 7 glyphs, each a 35 character string of `0` and `1` read row by row (5 columns per row). Supported: A to Z, 0 to 9, `!`, `?` and space (all zeros). Typed text goes through one `sanitize` function (used for `words`, the input and the bitmap): slice the raw input to 200 characters, normalise to NFD and remove combining marks, upper-case, drop every character the font does not have, and stop at 7 characters. There is no HTML injection anywhere; the text is only ever turned into dot bits.

Board: `MAX = 7` characters, `COLS = 7 x 6 - 1 + 4 = 45`, `ROWS = 11`. A word is centred horizontally (width = `chars x 6 - 1`) and drawn from row 2, so glyph row r lands on board row `2 + r`.

## Layout and look

- Root `<section>` (`aria-label="Flip-dot sign"`): full width, flex column, centred, text centred, padding 56px vertical and 20px sides (40px sides from `sm`), background white / `#000`.
- Eyebrow: "Platform 4 · Departing now", 13px semibold, uppercase, tracking .16em, `#86868b` / `#a1a1a6`.
- Sign housing: margin-top 24px, full width up to 760px, radius 22px, background `#111113` (dark `#131315`), padding 12px (20px from `sm`), shadow `0 1px 0 rgba(255,255,255,.08) inset, 0 30px 60px -30px rgba(0,0,0,.6)` (dark adds a `#2c2c2e` 1px ring so it separates from the black page).
- Board: a CSS grid of 45 columns (`repeat(45, minmax(0, 1fr))`), gap 2px (3px from `sm`), `cursor: crosshair`, `touch-action: none`, `user-select: none`, `role="img"` with `aria-label="Flip-dot sign showing <text>"`. 495 cells, each a square (`aspect-ratio: 1`) with `perspective: 80px` holding a `preserve-3d` disc.
  - Each disc has two faces with `backface-visibility: hidden`, both inset 6% and round: front (off) `#232326` with `inset 0 -1px 1px rgba(255,255,255,.05)`; back (on) `radial-gradient(circle at 35% 30%, #fff6b0, #ffd60a 55%, #e0a800)` with `0 0 6px rgba(255,214,10,.35)`, pre-rotated 180 degrees about Y.
  - A cell is "on" when `rotateY(180deg)`, off at `rotateY(0)`.
- Headline `<h1>` "Headlines with a little clack.": margin-top 40px, `clamp(34px, 6vw, 56px)`, semibold, line-height 1.05, tracking -0.035em, `#1d1d1f` / `#f5f5f7`. It fades up once when it first scrolls into view (`opacity 0, y 12`); no transform under reduced motion.
- Paragraph: margin-top 16px, max width 480px, 17px / 1.5, `#6e6e73` / `#a1a1a6`: "Drag across the board to flip dots by hand, or make it say something."
- Word input pill: a `<label>`, margin-top 28px, full width up to 360px, flex, 8px gap, fully rounded, padding 6px 6px 6px 20px, fill `#f5f5f7` / `#1c1c1e`. Visually hidden label "Your word"; the input is flexible, transparent, mono 15px, uppercase, tracking .12em, placeholder "Your word" (normal case, normal tracking, `#86868b` / `#a1a1a6`). Right: a 36px tall "Reset" button, pill, 13px medium, `#1d1d1f` fill with white text (dark `#f5f5f7` / `#1d1d1f`). A visually hidden description tied by `aria-describedby`: "Up to 7 characters: letters, numbers, spaces, exclamation and question marks."
- The pill shows a 2px focus outline (offset 2px, `#0071e3`, dark `#0a84ff`) when the input is focused; Reset has the same outline on keyboard focus.

## Motion

- Flip: `transition: transform 380ms cubic-bezier(.3, 1.5, .5, 1) <delay>ms` on the disc. The overshoot in the curve gives the little bounce.
- Ripple: when the shown text changes, compare the new bitmap with the previous one; only cells whose bit changed get a delay of `col x 16 + row x 9` ms, so the wave sweeps from the top-left across the change. Unchanged cells (and cells changed by hand-flipping) have delay 0. The previous bitmap is kept in state and compared during render (derived state), not read from a ref.
- Hand flips: a pointer press or a mouse drag with the button held (`buttons !== 0`) flips the cell under the pointer (XOR with its bit). Each hand-flipped cell flips back after 1400ms. The set of cells is state; timers are tracked in a map and cleared on unmount. Touch drags work through pointer events with `touch-action: none`.
- Reduced motion: transitions are `none`, the heading appears without movement, and autoplay never runs.

## Interaction and states

- Shown text = the input text if it has any non-space characters, otherwise the current cycling word. The board label always names the shown text.
- Typing sanitises on every change: lower-case becomes upper-case, unsupported characters vanish, input is capped at 7 characters. Reset clears the input and returns to the cycling word.
- Keyboard path: the input and Reset are the way to change the sign from the keyboard; hand-flipping is a pointer-only extra.

## Autoplay demo

With `autoplay` (motion allowed, section at least 20% in view, tab visible, at least two usable words, visitor not yet interacted), advance to the next word every 2800ms with the ripple. The first pointer press, key press or typing inside the section stops it for good, leaving the current word on the board.

## Accessibility

- Board is a labelled image; the dots are decorative.
- The input has a real (visually hidden) label and a description; Reset is a real button.
- No `dangerouslySetInnerHTML`; only sanitised glyphs ever reach the board.

## Acceptance checklist

- [ ] The board shows "HELLO" in yellow dots on a black sign, centred.
- [ ] With `autoplay`, words change every 2.8s with a left-to-right clack; only changed dots flip.
- [ ] Dragging across the board flips dots and they return after about 1.4s.
- [ ] Typing "ship it" shows SHIP IT; typing 12 characters stops at 7; `<b>` or emoji never appears on the board.
- [ ] Reset returns to the cycling word; focus rings are visible on the input pill and Reset.
- [ ] Off screen or in a hidden tab the word timer is not running; pressing the board stops autoplay for good.
- [ ] Reduced motion: dots change instantly and nothing cycles.
- [ ] At 320px wide the sign fits with no horizontal scroll.
- [ ] Dark mode: black page, sign still readable with a hairline edge, light input pill and button.
