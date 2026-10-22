# Sign & Seal

Build a small membership card with a signature line. The user signs it with the pointer in smooth ink; after a short pause a clear plastic sleeve drops over the card, lands on a soft spring, the card squeezes slightly and a glint sweeps across. Clear lifts the sleeve and wipes the ink. Tactile and a little ceremonial.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- The ink is drawn on a 2D canvas; the sleeve and glint are DOM layers.
- File: `components/sign-and-seal/sign-and-seal.tsx`, named export `SignAndSeal`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `name` | `string` | `"Alex Rivera"` | Name printed on the card. |
| `title` | `string` | `"Founding member"` | Small label above the name. |
| `ink` | `string` | theme ink | Ink colour. Defaults to `#1d1d1f`, or `#f5f5f7` in dark mode. |
| `autoplay` | `boolean` | `false` | Signs itself on a loop until the user draws. |

## Layout and look

- Root: centred column, gap 16px.
- Stage: 300 × 230px (card height + 40px headroom for the sleeve), relative.
- **Card**: 300 × 190px at the bottom of the stage, radius 18px, overflow hidden. Light: `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 40px -24px rgba(0,0,0,.4)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 40px -24px rgba(0,0,0,.8)`. Contents (all non-interactive except the canvas):
  - Header at top 16px, inset 20px left and right, space-between: `title` (10px semibold uppercase, tracking 0.16em, `#86868b` / `#8e8e93`) above `name` (17px semibold, tracking −0.02em, `#1d1d1f` / `#f5f5f7`); on the right a badge "No. 0042" (radius 6px, `px-1.5 py-0.5`, 10px semibold tabular-nums, `#f0f0f3` with `#6e6e73` text; dark `#2c2c2e` / `#a1a1a6`).
  - Signature line: 1px dashed bottom border `#d2d2d7` (dark `#48484a`), inset 20px, 40px above the bottom.
  - Caption at bottom 16px, left 20px, 11px grey: "Sign here", or "Signature" once there is ink.
  - Canvas covering the card, `cursor-crosshair`, `touch-action: none`, backing store × DPR (capped at 2).
- **Sleeve** (present only when sealed): 316 × 206px, placed at left −8px, bottom −8px (8px larger than the card on every side), radius 22px, overflow hidden, no pointer events, `backdrop-filter: saturate(1.1)`. Light: `linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.12))` with shadows `inset 0 0 0 1.5px rgba(255,255,255,.9), inset 0 0 0 2.5px rgba(0,0,0,.06), 0 18px 30px -18px rgba(0,0,0,.35)`. Dark: `rgba(255,255,255,.14) → rgba(255,255,255,.04)` with `inset 0 0 0 1.5px rgba(255,255,255,.32), inset 0 0 0 2.5px rgba(0,0,0,.4), 0 18px 30px -18px rgba(0,0,0,.8)`.
  - Lanyard slot: centred at top 10px, 56 × 8px, fully rounded, `#1d1d1f` at 10% (dark black at 40%), `inset 0 1px 2px rgba(0,0,0,.2)` (dark `.5`).
  - Glint: a band half the sleeve's width and its full height, starting at left −50%, rotated 12°, `linear-gradient(100deg, transparent, rgba(255,255,255,.75), transparent)` (dark `.3`).
- **Status row** (36px tall, gap 12px): a message plus a Clear button. Message "Sign, then pause." (13px `#86868b` / `#8e8e93`) or, when sealed, "Signed and sealed." (13px medium `#1d1d1f` / `#f5f5f7`). Clear: 36px tall, `px-4`, fully rounded, 13px medium, white with `#1d1d1f` text and ring `0 0 0 1px rgba(0,0,0,.08)` (dark `#2c2c2e` / `#f5f5f7`, ring `rgba(255,255,255,.1)`).

## Ink

- Keep strokes as arrays of points in card coordinates (convert pointer positions using the canvas bounding box, scaled to 300 × 190).
- Redraw everything on each change: clear, then for each stroke with at least 2 points, `moveTo` the first point and, for each inner point i, `quadraticCurveTo(p[i], midpoint(p[i], p[i+1]))`. This midpoint smoothing gives continuous curves. Line width 2.4, round caps and joins, colour = `ink` or the theme ink.
- Theme ink follows the `dark` class on `document.documentElement` via `useSyncExternalStore` with a `MutationObserver` subscription (server snapshot: light). Repaint when the colour changes.

## Motion

- **Seal trigger**: on every pointer-up, (re)start a 900ms idle timer. Starting a new stroke cancels it. When it fires, seal only if at least one stroke has more than 6 points (so a tap does not seal).
- **Sleeve in**: from `y −250px` (`−(190 + 60)`), opacity 0.6, to `y 0`, opacity 1, spring `stiffness 150, damping 18` (a slight bounce as it lands).
- **Card squeeze**: when sealed, the card animates scale `[1, 0.985, 1]` over 0.4s after a 0.35s delay, timed to the sleeve landing.
- **Glint**: `x` from −40% to 380% of its own width over 1.1s, `easeInOut`, after a 0.45s delay. It runs once per seal.
- **Sleeve out** (on Clear): exit to `y −250px`, opacity 0, over 0.35s.
- **Status message**: `AnimatePresence mode="wait" initial={false}`. The sealed message enters from `opacity 0, y 6`; the hint just fades; both exit by fading.

## Interaction and states

- Pointer-down on the canvas (ignored while sealed): mark touched, capture the pointer, cancel the idle timer, start a new stroke, set `inked`.
- Pointer-move while drawing: append a point and redraw.
- Pointer-up: stop drawing and arm the seal. Pointer-cancel: stop drawing only.
- Clear (marks touched): cancel the timer, empty the strokes, reset `inked` and `sealed`, redraw.
- Clear the idle timer on unmount.

## Autoplay demo

700ms after mount and every 5200ms after, unless touched: clear, then draw a demo signature as one stroke, adding 3 points per animation frame, then arm the seal so the sleeve drops 900ms later. The demo stroke is 141 points, for `t = i/140`:

```
x = 40 + 210t + 9·cos(18t)
y = 120 + 14·sin(18t)·(1 − 0.4t) − 10·sin(5t) + (t > 0.85 ? 120·(t − 0.85) : 0)
```

a looping cursive scribble with a flick down at the end. Stop the demo (and cancel its animation frame) as soon as the user draws or presses Clear.

## Accessibility

- Canvas: `role="img"`, `aria-label="Signature pad. Draw your signature."`.
- Clear is a `<button type="button">` with a 2px focus-visible outline `#0071e3` (dark `#0a84ff`).
- The status message is plain text next to the button.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Drawing and Clear are silent. When the visitor pauses and the sleeve slides down, `knock` plays as it lands, about 0.35s after the pause is detected (two low thuds 0.11s apart: a sine falling from 160 to 90 Hz with a short band-passed noise burst each), then `success` plays about 0.45s later as the glint runs across (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart). Clearing before they play cancels them. The autoplay signature and seal make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Drawing leaves smooth, round-capped 2.4px ink with no visible corners.
- Releasing and waiting about 0.9s drops the sleeve over the card with a small bounce; the card squeezes slightly and a glint crosses once.
- A single tap without a real stroke does not seal.
- Starting another stroke within 0.9s postpones the seal.
- While sealed, drawing does nothing and the message reads "Signed and sealed."
- Clear lifts the sleeve off upward, wipes the ink and restores "Sign here".
- Switching to dark mode repaints existing ink in near-white (unless `ink` is set).
- With `autoplay`, the card signs and seals itself every 5.2s until the user draws.
