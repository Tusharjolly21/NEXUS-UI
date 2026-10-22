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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Every card the visitor throws, by dragging it away or pressing the round buttons, plays `swipe` (a soft paper whisk: bandpass noise sweeping from about 3.2 kHz down to 500 Hz in 0.12s) as it leaves. Approving also plays `success` at 60% volume (two soft triangle notes, 1046 Hz then 1318 Hz, 90ms apart, a rising third); flagging plays `off` at 60% (a small noise click with a sine falling from 760 to 480 Hz over 70ms) instead. A card that springs back and "Load more" make no sound. The autoplay throws play the same `swipe` plus `success` or `off` pair, at the same volumes, as a card the visitor throws. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

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

---

<!-- variant: swipe-rows -->

# Swipe Rows

Build an inbox list with iOS-style swipe actions. Swipe a row right and green grows in behind it with an archive icon that jumps forward once you have gone far enough; let go past that point and the row flies off. Swipe left to reveal orange Flag and red Delete; keep going and Delete swallows Flag and takes the row. Removed rows close up and an Undo pill slides in from the bottom.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useMotionValueEvent`, `drag`).
- File: `components/swipe-stack/swipe-rows.tsx`. Named export `SwipeRows`, plus the `SwipeRowItem` and `SwipeAction` types and a `DEFAULT_SWIPE_MAIL` array.

## API

`SwipeRowItem = { id: string | number; from: string; subject: string; time: string; color: string }`. `SwipeAction = "archive" | "delete"`.

Default rows: Maya Chen "Board deck, final version" 9:41 `#ff9f0a`; Stripe "Your payout is on the way" 8:02 `#5e5ce6`; Leo Park "Can we move standup to 10?" Yesterday `#30d158`; Figma "Ana commented on Onboarding" Mon `#ff375f`.

`SwipeRows` props:

- `items?: SwipeRowItem[]`, default `DEFAULT_SWIPE_MAIL`.
- `title?: string`, default `"Inbox"`.
- `onArchive?: (item) => void`, `onDelete?: (item) => void`: called when the user removes a row (not during autoplay).
- `onFlag?: (item) => void`: called when the user taps Flag on a half-open row.
- `onUndo?: (item, action) => void`.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 12px gap, `max-width: 100%`. Under the card: "Swipe a row left or right.", 13px `#86868b` (dark `#98989d`).
- Card: 320×300 (`max-width: 100%`), radius 22px, `overflow: hidden`, white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`. The fourth row is partly cut off by the 300px height; that is intended.
- Header: 16px × 12px padding, bottom border `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`); title 17px semibold, letter-spacing −0.02em, `#1d1d1f` (dark `#f5f5f7`); on the right "{n} unread", 12px `#86868b` (dark `#98989d`).
- Row (`li`): 68px tall, `overflow: hidden`, bottom border as above. Three layers:
  - Archive layer, left-anchored, width = `max(0, x)`, 20px left padding, background `#8fd9a1`, switching to `#30d158` once armed. A 22px archive icon (white stroke 2.2, round caps/joins, path `M3 7h18v4H3zM5 11v9h14v-9M10 15h4`).
  - Action layer, right-anchored, width = `max(0, −x)`, `overflow: hidden`, two buttons side by side: Flag `#ff9f0a` (width 50% of the layer, animating to 0 when Delete is armed), then Delete `#ff3b30` filling the rest. Both 13px semibold white, centred.
  - Foreground: the draggable row, 16px horizontal padding, 12px gap, white (dark `#1c1c1e`); focus-visible background `#f5f5f7` (dark `#2c2c2e`). A 36px avatar circle in the item colour with the first letter (12px semibold white); then a column: name (14px semibold `#1d1d1f` / dark `#f5f5f7`, truncates) with the time on the right (11px `#86868b` / dark `#98989d`), and the subject below (13px `#6e6e73` / dark `#a1a1a6`, truncates). Cursor grab / grabbing.
- Undo pill: absolutely placed 12px from the left, right and bottom; rounded-full; `#1d1d1f` (dark `#3a3a3c`); 13px white; 16px left / 8px right / 8px vertical padding. Text "Archived" or "Deleted" then the subject in curly quotes (first 18 characters plus `…` when longer). Undo button: rounded-full, `rgba(255,255,255,.15)` (hover `.25`), 12px × 4px padding, semibold.

## Motion

- Thresholds use the 320px width `W`: archive armed past `x > 0.42 W` (134.4px); delete armed past `x < −0.55 W` (−176px); actions "open" past `x < −70`.
- Archive icon `scale` maps `x` `[0, 60, 0.42 W] → [0.4, 1, 1.15]`; when armed it animates `x` to 6px (default spring).
- Flag width: spring stiffness 400, damping 32.
- Release (`drag="x"`, `dragMomentum={false}`): if `x > 0.42 W` or velocity > 900 archive; else if `x < −0.55 W` or velocity < −1100 delete; else if `x < −70` spring to −150 (actions open); else spring to 0. Snap spring: stiffness 400, damping 34.
- Finishing: tween `x` to `±W` over 0.22s `easeIn`, then remove the row.
- Rows: `layout`; enter from `opacity 0, height 0` to `opacity 1, height 68`; exit to `opacity 0, height 0` over 0.25s, inside `AnimatePresence initial={false}`.
- Undo pill: enters from `y 60, opacity 0`, exits the same way, spring stiffness 400, damping 30.

## Interaction and states

- Dragging stops any running row animation. Tapping Flag calls `onFlag` and springs the row closed. Tapping Delete finishes a delete.
- Removing a row remembers it with its index; Undo re-inserts it at that index, calls `onUndo(item, action)` and hides the pill.
- Keyboard on a focused row: ArrowRight archives, Delete or Backspace deletes. Flag and Delete are only tabbable while the row is open (and Flag not swallowed).

## Autoplay demo

With `autoplay`, every 1800ms: if 2 or fewer rows remain, reset to `items` and clear the pill; otherwise tell row `k % 2` of the current list to demo (`archive` when `k` is even, `delete` when odd) and increment `k`. A demo drags the row to `0.6 W` (archive) or `−0.7 W` (delete) over 0.6s with ease `[0.3, 0, 0.3, 1]`, then finishes as above. Demo removals do not call callbacks. A `touched` ref is set on pointer down or any key on the root; the next tick clears the interval for good. Stop every running animation on unmount.

## Accessibility

- Each row foreground is focusable (`tabIndex 0`), `role="group"`, labelled "{from}: {subject}. Right arrow archives, Delete removes."
- Flag, Delete and Undo are native buttons; focus rings 2px (white inset on the action buttons, white on Undo). Hidden action buttons are `aria-hidden` and `tabIndex -1`.
- A persistent visually hidden `role="status"` announces "Archived/Deleted {subject}".

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Archiving a row (by swipe, the right arrow key) plays `swipe` (a soft paper whisk: bandpass noise sweeping from about 3.2 kHz down to 500 Hz in 0.12s) followed by `success` at 50% volume (two soft triangle notes, 1046 Hz then 1318 Hz, 90ms apart); deleting it (long swipe, the Delete button, Delete or Backspace) plays the same whisk followed by `off` at 50% (a noise click with a sine falling from 760 to 480 Hz over 70ms). Tapping Flag plays `tap` (a short sine falling from 900 to 620 Hz over 60ms with a faint click) and Undo plays `pop` (a sine rising from 320 to 980 Hz in 70ms). Parking a row half open makes no sound. When the autoplay demo lets a row fly it plays the same `swipe` plus `success` (archive) or `off` (delete) at 50%. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Dragging right grows pale green behind the row; past ~134px it turns saturated green and the icon nudges forward and grows.
- [ ] Releasing short of a threshold springs the row back; a short left swipe parks it open on Flag and Delete.
- [ ] Dragging far left makes Delete swallow Flag; releasing removes the row.
- [ ] A fast flick in either direction completes the action.
- [ ] Rows below close up smoothly and the unread count updates; Undo puts the row back where it was.
- [ ] Callbacks fire for the user's actions only, never for the autoplay demo.
- [ ] Autoplay archives and deletes rows alternately, refills, and stops for good on the first pointer down.
- [ ] At 296px wide nothing overflows; text truncates.
- [ ] Dark mode swaps card, rows, text, borders, pill and shadow; action colours stay.
