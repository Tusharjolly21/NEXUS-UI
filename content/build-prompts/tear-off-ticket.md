# Tear-off Ticket

Build an exhibition ticket with a perforated stub you pull off. Dragging it right (or down) opens the perforation from the top, pivoting on the bottom-left corner, its last tooth. Let go early and it snaps back with a wobble; pull through and it tears, hangs and swings for a beat, then drops. Tactile and paper-like, in clean Apple-style card UI.

## Stack

- React 19.2+ client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`). The autoplay loop uses React's `useEffectEvent` for `tear` and `reset` (on older React, keep the latest callbacks in a ref).
- File: `components/tear-off-ticket/tear-off-ticket.tsx`, named export `TearOffTicket`, plus exported `TearOffTicketProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Light & Matter"` | Event name. |
| `venue` | `string` | `"Hall 3 · North Gallery"` | First detail line. |
| `date` | `string` | `"Sat 14 Nov · 11:00"` | Second detail line. |
| `seat` | `string` | `"Row C · Seat 12"` | Seat on the stub. |
| `autoplay` | `boolean` | `false` | Tugs, tears and resets on a loop until someone grabs the stub. |

## Layout and look

- Root: column, full width, items centred, 24px gap.
- Ticket row: 420×180, `max-w-full`, `select-none`, flex row.
- **Main ticket** (flex-1): `overflow-hidden`, left corners 20px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.4)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -24px rgba(0,0,0,.8)`.
  - Art panel: 118px wide, `radial-gradient(90% 70% at 30% 25%, #ffd7b0, rgba(255,215,176,0) 60%), radial-gradient(80% 80% at 80% 90%, #a9c7ff, rgba(169,199,255,0) 60%), #efe7ff`.
  - Text area: 16px padding, column with space-between. Top: "Exhibition" (10px semibold uppercase, tracking 0.16em, `#86868b`, dark `#8e8e93`) above the title (19px semibold, tight leading, tracking −0.02em, `#1d1d1f`, dark `#f5f5f7`), 2px gap. Bottom: venue and date, 12px `#6e6e73` (dark `#a1a1a6`), 2px gap.
  - Perforation: along the right edge, 8px in from top and bottom, 11 notches spaced evenly, each 3×6 with its left side rounded, colour `#f5f5f7` (dark black), so they read as holes against the page background.
- **Stub**: 118px wide, full height, right corners 20px, same white/dark surface and shadow, column centred with 8px gap, `cursor-grab` / `active:cursor-grabbing`, `touch-none`.
  - Matching notches on its left edge (rounded on the right side), whose opacity is tied to tear progress.
  - "Admit one" in the same 10px uppercase style.
  - A 5×5 grid of 7px squares, 2px gap, 1px radius: dark (`#1d1d1f`, dark mode `#f5f5f7`) when `(i·7) % 3 === 0 || i % 6 === 0`, otherwise `#e8e8ed` (dark `#3a3a3c`). Decorative.
  - Seat: 11px medium tabular `#1d1d1f` (dark `#f5f5f7`).
- Footer slot (36px tall): the hint "Pull the stub to the right." (13px `#86868b`, dark `#8e8e93`) or, after the stub has dropped, a "New ticket" pill: 36px, 16px padding, 13px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f`).

## Motion

- **Tear progress** `p` (0..1) is a motion value. `rotate = p·26°` (via `useTransform`) on the stub with transform origin at its bottom-left (`originX 0, originY 1`), so it opens from the top like perforation giving way. Notch opacity maps `p` 0→1 to 1→0.4.
- **Pulling**: `pull = max(0, dx) + max(0, dy)·0.6` from the pointer-down point; `p = min(1, pull / 150)`. At `p = 1` it tears.
- **Early release**: spring `p` back to 0 with stiffness 420, damping 16 (snappy with a wobble).
- **Tear**: set torn, `animate(p, 1, { duration: 0.1 })`, and switch the stub to keyframes `rotate [26, 64, 44, 56, 50]` over 0.65s `easeOut`: it drops open to 64° and swings to rest at 50°, hanging on the last tooth. After 650ms mark it gone.
- **Drop** (exit): `y 420, rotate 110°, opacity 0` over 0.9s with ease `[0.55, 0, 1, 0.45]` (falls, accelerating).
- **Stub enter** (on mount and after reset): from `opacity 0, x 40` with spring 300/26.
- **Footer swap**: `AnimatePresence mode="wait"`; button enters from `opacity 0, y 6`, hint fades.

## Interaction and states

- States: intact (`torn` false), torn (hanging), gone.
- Pointer down on the stub (when not torn): mark touched, capture the pointer, store start position. Move updates `p`. Up: if not torn, spring back.
- Keyboard: Enter or Space on the focused stub tears it immediately.
- "New ticket" resets: clear the drop timer, `gone = false`, `torn = false`, `p = 0`; the stub slides back in.
- While torn, the stub ignores further pointer input.

## Autoplay demo

With `autoplay`, run immediately and then every 5200ms while not touched: reset, wait 900ms, animate `p` to 0.55 (0.7s `easeInOut`), spring back to 0.2 (stiffness 300, damping 14) as if the pull hesitated, then animate to 1 (0.6s `easeIn`) and tear. Each step checks it is still alive and untouched. On cleanup clear timers and stop the running animation.

## Accessibility

- Stub: `role="button"`, `tabIndex={0}`, `aria-label` "Tear off the stub. Drag it right or press Enter." (after tearing: "Stub torn off").
- Focus-visible: 2px ring `#0071e3` (dark `#0a84ff`), no default outline. The reset button has a 2px outline in the same colours with 2px offset.
- Notches and the code grid are `aria-hidden`.

## Acceptance checklist

- [ ] Dragging the stub right rotates it open from the top around its bottom-left corner, up to 26°.
- [ ] Dragging downward also tears, at 60% the rate.
- [ ] Releasing before 150px of pull snaps it back with a small wobble.
- [ ] Pulling through tears it: it swings open to about 64°, settles near 50°, then falls away rotating.
- [ ] The perforation notches fade as the tear progresses.
- [ ] "New ticket" appears after the drop and brings a fresh stub sliding in.
- [ ] Enter or Space tears the focused stub.
- [ ] Autoplay tugs, hesitates, tears and resets every 5.2s, and stops once the stub is grabbed.
