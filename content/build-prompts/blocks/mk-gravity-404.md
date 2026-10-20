# Gravity 404

Build a full-width not-found page that falls apart on request. It starts as a calm, perfectly usable 404 page: a nav, a huge "404", a headline, a line of text and two buttons. Press "Let it fall" (or knock the big digits) and every piece of the page drops under real gravity. Visitors can bat the pieces about with the cursor and grab and throw them. "Put it back" springs each piece home in a ripple. It should feel playful, but stay Apple-clean.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container`, `@2xl:`, `cqi` units), framer-motion (`motion`, `useReducedMotion`), matter-js (`import Matter from "matter-js"`), the Web Animations API, and a `cn` helper.
- File: `components/blocks/gravity-404.tsx`, named export `Gravity404` and type `Gravity404Props`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `code` | `string` | `"404"` | The big code. Each character falls on its own. |
| `headline` | `string` | `"This page fell apart."` | `h1`. Each word falls on its own. |
| `message` | `string` | "The link might be old, or the page moved. Pick yourself up and try one of these." | Falls as one piece. |
| `brand` | `string` | `"Nexus"` | Wordmark with a 24px rounded square. |
| `navLinks` | `string[]` | `["Product", "Pricing", "Docs"]` | Nav labels. |
| `primaryLabel` | `string` | `"Go home"` | Blue button. |
| `secondaryLabel` | `string` | `"Search the docs"` | Grey button. |
| `fallLabel` / `restoreLabel` | `string` | `"Let it fall"` / `"Put it back"` | Toggle labels. |
| `hint` | `string` | `"Grab, throw, or swipe through them."` | Pill shown while the pieces are loose. |
| `autoplay` | `boolean` | `false` | Drops the page and puts it back on a loop until the visitor touches it. |
| `onAction` | `(action: "primary" \| "secondary" \| "nav", label: string) => void` | none | Links call `preventDefault` and then this. |
| `className` | `string` | none | Extra classes on the root. |

## Layout and look

- Root: `@container`, relative flex column, `min-height: 560px`, overflow hidden, white / dark black.
- Nav: space-between, padding 20px 24px (40px horizontal from `@2xl`). The brand is 15px semibold `#1d1d1f` / `#f5f5f7`, next to a 24px square with radius 7px in the same colour. Links are 13px pills with 12px x 6px padding and a hover background of `#f5f5f7` / `#1c1c1e`.
- The centre column is centred and fills the remaining height, with 24px side padding and 64px bottom padding.
- Code: `clamp(110px, 22cqi, 220px)`, semibold, line-height 0.8, tracking -0.06em, 4px gap, each digit with 8px vertical padding. While the page is intact, the digits have `cursor: pointer` and the title "Knock it over".
- Headline: margin-top 24px, `clamp(26px, 4cqi, 40px)`, semibold, tracking -0.03em, words in a wrapping flex row with a 0.28em gap. Message: margin-top 12px, max-width 440px, 17px/1.45, `#6e6e73` / `#a1a1a6`.
- Buttons: margin-top 28px, gap 12px, padding 12px 20px, 15px medium, rounded-full. Primary is `#0071e3` / `#0a84ff` with white text. Secondary is `#f0f0f3` / `#2c2c2e`.
- Toggle: absolute, bottom 20px, centred, 40px tall, 16px padding, 13px medium, `#1d1d1f` with white text (dark `#f5f5f7` with black text), shadow `0 10px 30px -12px rgba(0,0,0,.6)`, and a 14px down arrow.
- Hint pill: top 16px, centred, 12px, `#f5f5f7` / `#1c1c1e`, grey text.
- Mark every falling element with `data-piece` and give it `inline-block will-change-transform`. That covers the brand, each nav link, each digit, each headline word, the message and both buttons.

## Motion

- `fall(kick?)`: measure the root (W, H) and create an engine with gravity y 1.2. Add four static walls (friction 0.6, 80 thick): a floor at H + 40, sides at -40 and W + 40 (3H tall), and a ceiling at -H - 40. For every piece, cancel its running animations, clear its transform and measure its rect. Then create a rectangle at its centre with chamfer `min(10, h/2 - 0.5)`, restitution 0.25, friction 0.5, frictionAir 0.01 and density 0.0015. Give it angular velocity `((i mod 7) - 3)·0.004`. With a kick point, set its velocity to `(dx/d·9, dy/d·9 - 4)`, where `d = hypot(dx, dy) + 40`.
- Add a static circle of radius 22 for the cursor, parked at (-200, -200).
- The loop steps the engine at a fixed 1000/60 ms using an accumulator. The accumulator is capped at 100 ms per frame, the loop runs at most 4 steps per frame, and any leftover larger than one step is dropped. Each piece gets `translate(x - cx, y - cy) rotate(angle)`.
- Cursor: on pointermove, position the circle at the pointer and set its velocity to `(Δx/dt·16, Δy/dt·16)` with `dt ≥ 8 ms`, so swipes carry momentum. On pointerleave, park it.
- Grab: pointerdown on a piece (`Matter.Query.point`) adds a constraint (stiffness 0.2, damping 0.1, length 0) and captures the pointer.
- `restore()`: stop the loop and clear the engine. For each piece, animate from its current transform to `translate(0,0) rotate(0rad)` over 900ms with a delay of `i·28` ms, easing `cubic-bezier(.2,1.25,.35,1)` and `fill: "backwards"`.
- The toggle arrow rotates to -180° when the page is broken, with a spring (stiffness 300, damping 18). The toggle has `layout` and `whileTap` scale 0.95.

## Interaction and states

- While intact, the page is a normal page: text can be selected, touch scrolls, and links call `onAction`. Only once broken does the root get `touch-none select-none cursor-grab`.
- Pointerdown on the digits drops the page with the kick at the pointer. The toggle drops it with the kick at (W/2, 0.3H), or restores it. The toggle stops pointerdown from propagating.
- When broken, Escape inside the page restores it. A width change (ResizeObserver) restores it as well.
- Pause the loop when the page is off screen or the tab is hidden. On unmount, cancel the rAF, clear the engine, and disconnect the observers.
- Under reduced motion, restoring snaps everything back with no ripple, and the toggle animations are instant.

## Autoplay demo

Every 3.6s, alternate between a drop with the kick at (0.3W, 0.45H) and a restore. Skip ticks while the page is off screen or hidden, stop for good after the first pointerdown or keydown, and never autoplay under reduced motion.

## Accessibility

- The digits form `role="img"` with `aria-label={code}`. The headline contains a visually hidden full sentence, and its word pieces are `aria-hidden`.
- The toggle is a real button and keyboard reachable. Links keep working from the keyboard even after the page has fallen.
- A polite live region says the page fell and how to restore it.
- Focus rings are 2px `#0071e3` / `#0a84ff` with a 2px offset.

## Acceptance checklist

- [ ] On load, the page is a normal, readable 404 and every link works.
- [ ] "Let it fall" drops the brand, nav, digits, words, message and buttons onto the floor.
- [ ] Swiping the cursor bats pieces, and pieces can be grabbed and thrown.
- [ ] "Put it back" springs each piece home in a staggered ripple.
- [ ] Escape and a resize both restore the page.
- [ ] `onAction` receives `"primary"`, `"secondary"` or `"nav"` with the label, and nothing navigates.
- [ ] Autoplay loops until touched and is off under reduced motion.
- [ ] Dark mode inverts every surface.
