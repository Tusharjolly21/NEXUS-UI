# Pull to Refresh

Build a portfolio balance card inside a phone-like frame that you pull down to refresh. As you drag it down it rubber-bands and stretches slightly while a ring above it draws itself in. Past the line the ring is complete and the label says to release; let go and the card settles a little lower, the ring spins, then the card springs back up with a playful overshoot as the balance rolls to its new digits and the line chart redraws. It should feel physical and elastic, like iOS.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`).
- File: `components/pull-to-refresh/pull-to-refresh.tsx`. Named exports `PullToRefresh`, `PullToRefreshProps` and the helper `RollingDigits`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `initialBalance` | `number` | `58834.75` | Balance shown before the first refresh. |
| `onRefresh` | `(balance: number, delta: number) => void` | none | Called when a refresh commits, with the new balance and the change. |
| `autoplay` | `boolean` | `false` | Pulls and refreshes every 4.2s until someone drags it or uses the keyboard. |

Initial change shown: `+1204.60`.

## Layout and look

- Root: vertical flex, centred, 12px gap: the frame, then a hint "Pull the card down past the line." (13px, `#86868b` / dark `#8e8e93`).
- Frame: 300×330px, radius 28px, padding 12px, overflow hidden, relative. Bg `#f0f0f3` / dark `#1c1c1e`.
- Indicator (behind the card, `aria-hidden`): absolute, centred horizontally, 16px from the top, column with 4px gap. A 28px SVG (viewBox 28) with two r=11 circles at the centre, stroke width 2.5: a track `#d2d2d7` / dark `#3a3a3c`, and a progress arc `#1d1d1f` / dark `#f5f5f7` with round caps, rotated -90° so it starts at 12 o'clock. Under it an 11px medium label `#6e6e73` / dark `#a1a1a6`.
- Card: radius 22px, padding 20px, cursor grab (grabbing while active), `touch-action: none`. Light bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 14px 30px -20px rgba(0,0,0,.35)`; dark bg `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 14px 30px -20px rgba(0,0,0,.9)`. Contents:
  - "Portfolio": 12px medium, `#86868b` / `#8e8e93`.
  - Balance: 4px below, 34px semibold, line-height 1, tracking -0.04em, `#1d1d1f` / `#f5f5f7`: "$" + whole part with en-US thousands separators, then a 20px `#86868b` / `#8e8e93` "." + cents.
  - Change line: 6px below, 12px medium: "▲ $1,204.60 since last refresh" in `#248a3d` (dark `#30d158`), or "▼ …" in `#d70015` (dark `#ff453a`) when negative. Two decimals.
  - Chart: 16px below, full-width SVG viewBox `0 0 260 84`; a polyline path of 24 points, stroke `#30d158` when up and `#ff3b30` when down, width 2.4, round caps and joins, no fill.
  - Range chips: 12px below, 3-column grid with 8px gap, 11px medium centred text `#6e6e73` / `#a1a1a6`, fully rounded, 6px vertical padding: "1H", "4H", "1D"; "1D" is selected with bg `#f0f0f3` and text `#1d1d1f` (dark bg `#3a3a3c`, text `#f5f5f7`).

Chart data: a seeded generator `s = (s * 9301 + 49297) % 233280; r = s / 233280`, starting from `v = 40`, 24 times `v = clamp(v + (r - 0.42) * 14, 8, 72)`. Point i is at `x = i / 23 * 260`, `y = 80 - v`. Seed starts at 7 and grows by 11 per refresh.

## Motion

- One motion value `y` (card offset). `LINE = 90`px.
- Stretch: `scaleY = 1 + max(0, y) / 900`, transform origin top centre.
- Ring progress: `pathLength = clamp(y / 90, 0, 1)`; while loading it is fixed at 0.3. Indicator opacity maps `y` 0→30px to 0→1.
- While loading the SVG rotates to 360° over 0.8s, linear, repeating forever; otherwise it snaps back to 0 with no transition.
- Drag: `drag="y"` (disabled while loading), constraints top 0 and bottom 0, `dragElastic` top 0 and bottom 0.55. That gives the rubber-band resistance.
- Refresh: set phase "loading", spring `y` to 62 (`stiffness 400, damping 30`) and hold for 1300ms. Then pick a change `round2(random * 2400 - 600)`, add it to the balance, bump the seed, spring `y` back to 0 with `stiffness 300, damping 14` (the overshoot) and return to idle.
- Rolling digits: each character is in its own overflow-hidden slot keyed from the right (`text.length - index`); inside, `AnimatePresence mode="popLayout" initial={false}` keyed by the character, entering from `y -100%, opacity 0`, exiting to `y 100%, opacity 0`, spring `stiffness 380, damping 28`, delay `index * 0.03s`. Use tabular numbers.
- Chart redraw: the path is keyed by the seed and animates `pathLength 0 → 1` over 0.9s, ease `[0.16, 1, 0.3, 1]`.

## Interaction and states

- Phases: "idle" ("Pull to refresh"), "ready" when `y >= 90` ("Release to refresh"), "loading" ("Refreshing"). Update idle or ready from a `y` change listener, but never while loading.
- Drag start stops any running `y` animation and marks the component as touched. On drag end, refresh if `y >= 90`; otherwise the drag constraints pull it back.
- Ignore a second refresh while one is in flight, and clear the pending timeout on unmount.
- Keyboard: the card is focusable (`tabIndex 0`). Enter, Space or ArrowDown plays a pull: animate `y` to 120 over 0.7s with ease `[0.3, 0, 0.3, 1]`, then refresh.

## Autoplay demo

Every 4200ms, run that same pull and refresh. A drag or a keyboard pull marks it as touched and the interval stops for good.

## Accessibility

- Card: `role="group"`, `aria-label="Portfolio balance. Press Enter to refresh."`, `aria-busy` while loading, focus-visible ring 2px `#0071e3` (dark `#0a84ff`).
- A visually hidden `aria-live="polite"` region says "Refreshing" while loading. Indicator, chart and icons are `aria-hidden`.

## Acceptance checklist

- [ ] Dragging down resists more the further you go, and the card stretches slightly.
- [ ] The ring draws from 12 o'clock and is complete at 90px; the label then reads "Release to refresh".
- [ ] Releasing short of the line springs the card back with no refresh.
- [ ] Releasing past it parks the card at 62px with a spinning partial ring for 1.3s.
- [ ] The card then bounces back past its rest position and settles; the digits roll and the chart redraws.
- [ ] A negative change shows a red ▼ line and a red chart.
- [ ] Focusing the card and pressing Enter performs the same refresh.
- [ ] With `autoplay`, it refreshes itself every 4.2s until dragged.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- While the user drags the card (or pulls it with the keyboard), crossing the release line plays `tick` from `@/lib/ui-sounds` (a very short, dry high click made of filtered noise) at reduced volume, and crossing back above it plays a quieter tick. When the refresh finishes and the balance rolls, `done` plays (four soft triangle notes in a rising major chord, ringing together).
- The autoplay pull plays the same sounds: `tick` as the card crosses the release line and `done` when the balance rolls, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The hold while refreshing and the spring back are silent; nothing plays on hover or at any other point of the drag.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
