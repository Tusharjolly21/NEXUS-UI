# Swipe Stack

Build a deck of payment cards to review. Drag the top card right to approve or left to flag: it tilts as you pull, a rubber-stamp label ("Approve" or "Flag") fades in, and once thrown it flies off while the next card rises from the deck. Round buttons under the deck do the same with a tap, and a status line reports the last decision. It should feel physical and quick, like sorting real cards.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `PanInfo`).
- File: `components/swipe-stack/swipe-stack.tsx`, named export `SwipeStack`, plus exported types `SwipeStackProps`, `SwipePayment` and the constant `DEFAULT_PAYMENTS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `payments` | `SwipePayment[]` | `DEFAULT_PAYMENTS` | Cards, top first. `SwipePayment = { amount: string; from: string; to: string; note: string; when: string; hue: number }`. "Load more" deals the same list again. |
| `onDecide` | `(payment, approved: boolean) => void` | — | Called after a card has been thrown; `approved` is true for right. |
| `autoplay` | `boolean` | `false` | Throws a card every 1.7s and reloads when empty, until someone touches it. |

`DEFAULT_PAYMENTS`: $4,200 James → Jackson "rent" 3h hue 215; $18.75 Riya → you "tacos" 5h hue 25; $320 Studio Co → you "invoice #118" 1d hue 150; $62.40 you → Maya "concert tickets" 2d hue 285; $1,050 Noor → you "flight split" 3d hue 340.

Internally each card gets a numeric `id` (index on first load, then an incrementing counter on every reload) used as its React key.

## Layout and look

- Root: vertical flex, centred, 20px gap: deck, then controls row.
- Deck: 320×230px, `position: relative`. Render only the first 4 cards.
- Card: absolute, full deck width, `top: 24px`, 180px tall, radius 24px, padding 20px, `touch-action: none`. Light bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.35)`; dark bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -24px rgba(0,0,0,.9)`. z-index 10 for the top card, `10 − i` below it.
  - Top row (space-between, items start): amount 34px semibold, tracking -0.03em, ink `#1d1d1f` / `#f5f5f7`. Two 32px avatar circles overlapping by 8px with a 2px ring in the card colour; gradients `linear-gradient(140deg, hsl(h 90% 65%), hsl(h+30 80% 45%))` and `linear-gradient(140deg, hsl(h+120 70% 60%), hsl(h+160 70% 40%))`.
  - Second row, 24px below, 14px: "**from** paid **to**" (names semibold, ink) and the time on the right in `#86868b` / `#8e8e93`.
  - Note, 4px below: 14px italic, `#6e6e73` / `#a1a1a6`, wrapped in curly quotes.
  - Stamps (top card only, `aria-hidden`): at top-left (20px, 20px) "APPROVE" rotated -12°, at top-right "FLAG" rotated 12°; 3px border, 8px radius, 8px × 2px padding, 15px bold uppercase, wide tracking. Approve `#34c759` (dark `#30d158`), Flag `#ff3b30` (dark `#ff453a`).
- Empty state (absolute, fills the deck, centred column, 12px gap): "All caught up." 17px semibold ink, and a "Load more" pill: 36px tall, 16px side padding, 13px medium, bg `#1d1d1f` text white (dark: bg `#f5f5f7`, text `#1d1d1f`).
- Controls row (12px gap): Flag button, status text, Approve button. Buttons are 48px circles, bg white / dark `#2c2c2e`, shadow `0 0 0 1px rgba(0,0,0,.08)` / `rgba(255,255,255,.1)`; icons 18px stroke `currentColor`: an X (`M6 6l12 12M18 6L6 18`, width 2.6) in red, a check (`M5 12.5l4.5 4.5L19 7.5`, width 2.8) in green. Disabled at 40% opacity when the deck is empty. Status: 150×20px, centred, 13px, `#6e6e73` / `#a1a1a6`, overflow hidden.
- Focus-visible outlines: 2px `#0071e3` (dark `#0a84ff`).

## Motion

- One motion value `x` drives the top card. Derived: `rotate = map(x, [-240, 240] → [-18°, 18°])`, `approveOpacity = map(x, [20, 120] → [0, 1])`, `flagOpacity = map(x, [-120, -20] → [1, 0])` (clamped).
- Deck positions: card `i` animates to `y = −12·i`, `scale = 1 − 0.05·i`, `opacity = i > 2 ? 0 : 1`, spring `stiffness 300, damping 26`. New cards enter from `y -40, scale 0.8, opacity 0`; removed cards exit with `opacity 0` over 0.15s. Wrap the cards in `AnimatePresence initial={false}`. When the top card leaves, everyone springs one slot forward.
- Throw (`fling(dir)`): `await animate(x, dir × 520, { type: "spring", stiffness: 180, damping: 24, velocity: dir × 800 })`, then record the log, remove the top card, reset `x` to 0 and call `onDecide`. Ignore throws while one is in flight (busy flag) or when empty.
- Snap back: spring `x` to 0 with `stiffness 400, damping 26`.
- Buttons: `whileTap` scale 0.9.
- Status text: `AnimatePresence mode="popLayout" initial={false}`, enters from `y 16, opacity 0`, exits to `y -16, opacity 0`; keyed by `amount-ok-remaining`.
- Empty state: from `opacity 0, scale 0.9` to 1; exits with opacity.

## Interaction and states

- Only the top card is draggable: `drag="x"`, `dragMomentum={false}`, its `style` binds `x` and `rotate`. On drag end, throw if `|offset.x| > 110` or `|velocity.x| > 600` (direction from the sign of `offset.x`); otherwise snap back.
- Buttons throw left (flag) or right (approve).
- Status shows "N to review" until the first decision, then "Approved $X" or "Flagged $X".
- "Load more" deals the list again with fresh ids, so cards animate in.
- Read the current cards through a ref synced in an effect, so timers and async throws see fresh data.

## Autoplay demo

Every 1700ms: if touched, stop the interval for good; if the deck is empty, reload it; otherwise throw the top card, right with 65% probability, left otherwise. Pointer down anywhere in the component, or pressing any button, marks it as touched.

## Accessibility

- Buttons are real `type="button"` elements labelled "Flag payment" and "Approve payment"; the status line is `aria-live="polite"`.
- Cards under the top one are `aria-hidden`; stamps and icons are decorative.

## Acceptance checklist

- [ ] Three cards are visible, stacked upward 12px apart and 5% smaller each; a fourth waits invisibly.
- [ ] Pulling right tilts the card clockwise and fades in a green APPROVE stamp; pulling left shows a red FLAG.
- [ ] Releasing under 110px (and slow) springs the card back to centre.
- [ ] A throw flies the card ~520px sideways, then the deck steps forward and a new card fades in at the back.
- [ ] The status line reads "Approved $4,200" after approving the first card.
- [ ] Double-clicking a button throws only one card.
- [ ] After the last card, "All caught up." and "Load more" appear and both buttons are disabled.
- [ ] With `autoplay`, cards throw themselves every 1.7s and the deck reloads, until you touch it.
- [ ] Dark mode swaps the card, text, button and stamp colours listed above.
