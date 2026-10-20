# Wallet Stack

Build a stack of payment cards tucked into a leather wallet, each card peeking out a little higher than the one in front of it. Hovering a card lifts it slightly. Pick one and it slides up out of the pocket, grows a touch, the others sink deeper into the wallet, and then the chosen card turns over in 3D to show its back. Pick it again to flip it back and put it away. The feel is a physical, staged sequence with soft springs.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion.button`, spring transitions, `rotateY` with `preserve-3d`).
- File: `components/wallet-stack/wallet-stack.tsx`. Named export `WalletStack`, plus the `WalletCard` type and a `DEFAULT_WALLET_CARDS` array.

## API

`WalletCard = { id: string; name: string; last: string; bg: string; ink: string; brand: string; expires?: string }` (`bg` is any CSS background, `ink` the text colour, `expires` defaults to "08/28").

`WalletStack` props:

- `cards?: WalletCard[]`: back to front. Default:
  - `black`, Everyday, 4021, `linear-gradient(135deg,#2c2c2e,#0b0b0c)`, ink `#f5f5f7`, Northwind
  - `blue`, Travel, 8810, `linear-gradient(135deg,#5ac8fa,#0a4fd6)`, ink `#ffffff`, Wayfare
  - `coral`, Groceries, 1177, `linear-gradient(135deg,#ffb38a,#ff375f)`, ink `#ffffff`, Tally
  - `mint`, Savings, 3390, `linear-gradient(135deg,#b7f7c5,#0b8f6a)`, ink `#06281b`, Tally
- `label?: string`, default `"Wallet"`: stamped on the wallet and used as the group's accessible name.
- `hint?: string`, default `"Pick a card."`; empty string hides it.
- `onSelect?: (id: string | null) => void`: called with the id when a card is taken out, `null` when it is put back (user picks only, not autoplay).
- `autoplay?: boolean`, default `false`.
- `className?: string` on the root.

State: `out` (id or null), `flip` (boolean), `hover` (id or null).

## Layout and look

- Root: column, centred, 12px gap, `max-width: 100%`.
- Stage: 300×330 (max-width 100%), relative, `perspective: 1100px`, `role="group"`.
- Each card is a `motion.button`, 260×164, absolutely placed at top 0, `left: 50%`, `margin-left: −130px`, radius 16px, `transform-style: preserve-3d`. z-index `i + 1`, or 30 when out.
- Card vertical position for index `i` of `n`: `peek = (n − 1 − i) · 26`, `baseY = 150 − peek` (so the back card sits highest). Target `y`:
  - the out card: `−10`
  - any other card while one is out: `baseY + 40`
  - otherwise: `baseY − 16` if hovered, else `baseY`
- Front face (absolute, filling, `backface-visibility: hidden`): background `bg`, colour `ink`, radius 16px, padding 16px, column with `space-between`, shadow `0 10px 24px -12px rgba(0,0,0,.45)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 10px 24px -12px rgba(0,0,0,.8)`).
  - Top row: 12px semibold, 0.04em tracking: brand left, name right at 80% opacity.
  - Chip: 40×28, radius 6px, `linear-gradient(135deg,#f5e7b8,#c9a95a)`.
  - Bottom row: `•••• <last>` in 15px `ui-monospace, Menlo, monospace` with 0.16em tracking; expiry 11px at 80% opacity on the right.
- Back face (absolute, filling, `rotateY(180deg)`, `backface-visibility: hidden`, overflow hidden, radius 16px, same `bg`/`ink`):
  - Magnetic stripe: full width, top 20px, 36px tall, `rgba(0,0,0,.8)`.
  - Signature panel: left/right 16px, top 68px, 32px tall, radius 4px, `rgba(255,255,255,.9)`, right-aligned "CVV •••" in 13px italic monospace, colour `#1d1d1f`, 12px horizontal padding.
  - "Tap to put it back", 11px, 80% opacity, bottom 12px, left 16px.
- Wallet (in front of the cards, z-index 20, `pointer-events: none`): 290×150 (max-width 100%), bottom 0, horizontally centred, radius 22px, overflow hidden, background `linear-gradient(180deg,#8a5a3c,#6b432b)`, shadow `inset 0 2px 0 rgba(255,255,255,.18), 0 20px 40px -18px rgba(0,0,0,.55)` (dark: add `0 0 0 1px rgba(255,255,255,.06)` and use `.9` alpha for the drop).
  - Stitching: inset 8px, radius 16px, 1.5px dashed border `rgba(242,215,182,.45)`.
  - Grain: filling layer at 30% opacity, `radial-gradient(rgba(0,0,0,.25) 1px, transparent 1px)` at 4px × 4px.
  - Label: bottom 20px, centred, 11px semibold uppercase, 0.3em tracking, `rgba(242,215,182,.7)`.
- Hint: 13px, `#86868b` (dark `#a1a1a6`).

## Motion

- `animate={{ y, rotateY: out && flip ? 180 : 0, scale: out ? 1.06 : 1 }}`, `initial={false}`.
- Per-property springs: `y` stiffness 240 damping 24; `rotateY` stiffness 140 damping 18; `scale` stiffness 300 damping 22.
- Staging: taking a card out sets `flip = false`, `out = id`, and 650ms later `flip = true` (it slides out first, then turns). Putting it back sets `flip = false` and 350ms later `out = null` (it turns back first, then drops in).

## Interaction and states

- Click a card: if it is the out card, put it back; otherwise take it out (any previously out card drops back in with the others). Cancel pending stage timers on every pick so quick picks don't flip the wrong card.
- Pointer enter/leave and focus/blur set `hover`, lifting that card 16px when none is out.
- Each card is a native `<button>` with `aria-pressed` (true while out).

## Autoplay demo

With `autoplay`, every 2100ms alternate: take card `k` out (flip after 650ms), then on the next tick flip it back and put it away after 350ms, and move `k` to the next card (wrapping). Track the in/out phase in a local variable, not inside a state updater. A `touched` ref is set on pointer down on the root or any pick; the next tick clears the interval for good. Restart only when the card ids change. Clear the interval and all timeouts on unmount.

## Accessibility

- Card `aria-label`: "<name> card ending <last>", plus ", showing back" while out.
- The wallet is decorative (`aria-hidden`); the stage is `role="group"` labelled with `label`.
- Focus ring: `focus-visible` 2px `#0071e3` (dark `#0a84ff`) with a 2px offset (white in light, transparent in dark); no default outline.

## Acceptance checklist

- [ ] Four cards peek out of the wallet in a 26px staircase, back card highest.
- [ ] Hovering or focusing a card lifts it 16px.
- [ ] Picking a card slides it above the wallet at 1.06× while the rest sink 40px, then it flips to show the stripe and CVV panel.
- [ ] Picking it again flips it back, then it drops into its slot.
- [ ] Rapidly picking different cards never leaves the wrong card flipped.
- [ ] `onSelect` fires with the id on take-out and `null` on put-back.
- [ ] Autoplay walks through every card and stops for good on the first pointer down.
- [ ] No horizontal overflow at 360px wide.
- [ ] Dark mode adjusts card and wallet shadows, hint colour and focus ring; card and leather colours stay the same.
