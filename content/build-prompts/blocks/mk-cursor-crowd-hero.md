# Cursor Crowd Hero

Build a centred hero that is already being worked on by teammates. Three named cursors share the section: one selects the last word of the headline and retypes it, one grabs the primary button and tugs it sideways, one drops a comment bubble beside the sub line. A visitor with a mouse gets a fourth cursor of their own. It should feel Apple-light and calm, a little playful, and sell "multiplayer" without saying it. The names are fake demo teammates and the buttons only call optional callbacks.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useInView`, `useReducedMotion`), and a `cn` helper. No other libraries.
- File: `components/blocks/cursor-crowd-hero.tsx`, named export `CursorCrowdHero` and type `CursorCrowdHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `words` | `string[]` | `["faster", "together", "tonight", "better"]` | Words the last word of the headline is retyped through. The first one is shown at rest. Use a stable array. |
| `autoplay` | `boolean` | `false` | Runs the teammates' loop until the visitor first presses a pointer or a key inside the section. Never runs under reduced motion. |
| `onAction` | `(label: "primary" \| "secondary") => void` | none | Called with the button that was pressed. Nothing navigates. |
| `className` | `string` | none | Extra classes on the section. |

Teammates: Maya (`#bf5af2`), Leo (`#0a84ff`), Ari (`#ff9f0a`).

## Layout and look

- Root `div`: relative, full width, `min-height: 540px`, flex column, centred both ways, `overflow: hidden`, padding 24px sides and 64px top and bottom, text centred. Background white / `#000` in dark, with a dot grid: `radial-gradient(var(--cc-dot) 1px, transparent 1px)` at 22 x 22px, `--cc-dot` `rgba(0,0,0,.06)` / dark `rgba(255,255,255,.09)`. While a mouse is inside, the native cursor is hidden (`cursor: none`) because the visitor has their own drawn cursor.
- Presence pill: inline flex, 8px gap, fully rounded, padding 4px 12px 4px 4px, 13px medium, background `#f5f5f7` / `#1c1c1e`, text `#1d1d1f` / `#f5f5f7`. Left: three 24px round initials badges (M, L and A, the first letters of the names) overlapping by 6px (`-space-x-1.5`), each filled with the teammate colour, 10px bold white, with a 2px ring in the pill's background colour. Text: "3 people editing". The badges are `aria-hidden`.
- Headline `<h1>`: margin-top 24px, `clamp(40px, 7vw, 80px)`, semibold, line-height 1.02, tracking -0.045em, `#1d1d1f` / `#f5f5f7`. Visible copy (aria-hidden): "Design together," then a line break, then "ship " then the live word then ".". A visually hidden twin reads "Design together, ship {first word}." for screen readers.
- Live word: inline-block, relative, `min-width: 0.5em`, left aligned. The text sits on top (z 10). While typing, its colour is Maya's purple. A selection box (when the sweep is above 0) is absolutely placed over the word: inset top and bottom 6%, left 0, width = sweep x 100%, radius 4px, fill Maya at 15% alpha (`#bf5af226`), inner border 2px Maya, plus two 6px round handle dots (white / black in dark, 2px Maya ring) at the top-left (-3px, -3px) and bottom-right. While typing, a 3px wide, 80% tall caret sits 4px off the right edge, top 10%, Maya colour, blinking `opacity [1, 0, 1]` over 0.8s forever.
- Sub line: margin-top 20px, max width 460px, 18px, line-height 1.45, `#6e6e73` / `#a1a1a6`: "One canvas for the whole team. Every cursor, comment and change, live."
- Buttons row: margin-top 32px, flex wrap centred, gap 12px. Real `<button type="button">`s, fully rounded, padding 14px 24px, 16px medium. Primary "Start a file": `#1d1d1f` fill, white text (dark: `#f5f5f7` fill, `#1d1d1f` text); it is a `motion.button` that can be pushed sideways, and while Leo holds it, it gets a 3px ring in Leo's blue (`box-shadow: 0 0 0 3px #0a84ff`). Secondary "Watch the demo": `#f0f0f3` fill (dark `#2c2c2e`), `#1d1d1f` text (dark `#f5f5f7`).
- Teammate cursor: absolute at the section's top left, z 30, moved with `x` and `y` motion values. A 20 x 22 arrow, path `M2 2l15 8.2-6.6 1.6L7 18.6z`, filled with the teammate colour, 1.6px white stroke, round joins, `drop-shadow(0 2px 3px rgba(0,0,0,.25))`. Beside it (left 16px, top 20px) a name tag: fully rounded, padding 2px 8px, 11px semibold white on the teammate colour. When "pressed" the arrow scales to 0.85. The visitor's cursor is the same shape in `#1d1d1f` (dark `#f5f5f7` with a black stroke) and a tag reading "You" in the same colours. All cursors are pointer-events none and `aria-hidden`.
- Comment bubble: absolute, z 20, anchored at Ari's cursor (offset -8px left, -40px up). A 32px round avatar with the bottom-left corner square, Ari's orange, "A" in 12px bold white, soft shadow; beside it (8px gap) a rounded 14px card, padding 8px 12px, left-aligned 13px text "This line is perfect." with a second line "Ari · now" in 11px `#86868b` / `#a1a1a6`. Card fill white / `#2c2c2e`, shadow `0 10px 30px -12px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.05)` (dark: `.8` and `#3a3a3c`).

## Motion

All cursor movement is `animate(motionValue, target, { duration, ease: [0.45, 0, 0.2, 1] })` on `x` and `y` separately. Positions are in the section's own pixels, measured from `getBoundingClientRect` of the target elements relative to the section.

Loop (only while active), starting 600ms after it begins and repeating forever:
1. Maya and the other two cursors: Leo and Ari wander to seeded random spots (40 + r x (width - 120), 40 + r x (height - 100), 1.6s). Maya glides 0.9s to just left of the live word (word x - 4, word y + 55% of its height).
2. Maya "presses" (cursor scales down) and glides right 0.7s, easeInOut, to the word's right edge + 2px; the selection width follows her x, from 0 to 100%. She releases, 350ms later typing starts: the selection clears and the word turns purple.
3. Typing: delete the current word one letter at a time every 35ms, then type the next word in the list one letter every 85ms. After the last letter wait 500ms, then typing ends and the colour returns.
4. Maya wanders off. Leo glides 0.9s to the button (60% across, 50% down), presses (ring on the button), then both Leo and the button move +46px right over 0.45s. Wait 200ms, release, and the button springs back (stiffness 500, damping 14). Wait 400ms.
5. Leo wanders. Ari glides 0.9s to the right end of the sub line (x = sub right + 10, clamped so the bubble stays inside the section; y = sub top - 6), presses, and the comment bubble pops in (spring stiffness 420, damping 24, from scale .5, opacity 0). After 180ms she releases; the bubble stays 2.2s, exits (scale .8, opacity 0), wait 300ms, back to step 1 with the next word.

Wandering uses a seeded generator so every run is the same. The visitor's cursor follows `pointermove` instantly (no smoothing) and only exists for mouse pointers (`pointerenter` with `pointerType === "mouse"`).

## Interaction and states

- Rest (autoplay off, reduced motion, off screen, hidden tab, or after the visitor interacts): a still frame. Word is the first of `words`, fully selected with the sweep at 100%, Maya's cursor at the right edge of the word, Leo's on the primary button, Ari's at the end of the sub line with her comment open. Positions are measured in a layout effect and re-measured by a `ResizeObserver` when the section resizes. Until the first client render the cursors are hidden so nothing flashes at the wrong place.
- Autoplay is active only when `autoplay` is true, motion is allowed, the visitor has not pressed a pointer or key inside the section, the section is at least 20% in view (`useInView`), and the tab is visible. Leaving any of those stops all animations, clears timers, and returns to the still frame.
- The primary and secondary buttons call `onAction("primary")` / `onAction("secondary")`. Nothing navigates or submits.

## Autoplay demo

Preview with `autoplay`. The loop above is the demo. Hovering with a mouse adds the visitor's cursor but does not stop it; the first pointer press or key press does, for good.

## Accessibility

- Headline has a visually hidden static sentence; the animated copy is `aria-hidden`.
- Cursors, selection, comment bubble and presence badges are decorative and `aria-hidden`.
- Both buttons are real buttons with visible focus: 2px outline, 2px offset, `#0071e3` (dark `#0a84ff`).
- Reduced motion: nothing moves on its own; the comment bubble appears without a pop.

## Acceptance checklist

- [ ] At rest the word "faster" is selected, three named cursors sit on the word, the button and the sub line, and a comment is open.
- [ ] With `autoplay`, Maya selects and retypes the word through the list, Leo tugs the button and it springs back, Ari drops a comment, on a loop.
- [ ] The first click or key press inside the section ends the loop for good and parks the crowd.
- [ ] Moving a mouse in shows a "You" cursor and hides the system cursor; touch shows none.
- [ ] Off screen or in a hidden tab no timers or animations keep running.
- [ ] Reduced motion shows the still frame only.
- [ ] At 320px wide nothing overflows and the comment bubble stays inside the section.
- [ ] Dark mode swaps background, dot grid, pill, text, buttons, selection handles and the comment card.
- [ ] Buttons call `onAction` and never navigate.
