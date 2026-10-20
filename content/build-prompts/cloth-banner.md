# Cloth Banner

Build an announcement banner printed on real cloth, hung from a metal rail by five pins. It sways in a light breeze; grab any part and it drapes and folds under your hand. Yank it down hard and the pins pop one by one until the banner drops away, which is how it gets dismissed. Calm, physical, a little playful.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`). The cloth is a hand-written verlet simulation drawn on a 2D canvas; no physics library.
- File: `components/cloth-banner/cloth-banner.tsx`, named export `ClothBanner`, plus `ClothBannerProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Launch Week"` | Big line printed on the cloth. |
| `subtitle` | `string` | `"Oct 27–31 · five drops, one a day"` | Smaller line under it. |
| `from` | `string` | `"#0071e3"` | Cloth gradient start (top left). |
| `to` | `string` | `"#5e5ce6"` | Cloth gradient end (bottom right). |
| `onDismiss` | `() => void` | – | Fires once the banner has fully dropped, by yank or button. |
| `autoplay` | `boolean` | `false` | Gusts of wind until someone interacts. |

Constants: stage `SW = 360`, `SH = 300`; grid `COLS = 15`, `ROWS = 9`, spacing `GAP = 19`; origin `OX = (360 − 14·19) / 2 = 47`, `OY = 46`; pinned columns `[0, 4, 7, 10, 14]` of the top row.

## Layout and look

- Root: column, centred, 12px gap, 380px wide, `max-width: 100%`.
- Canvas: full width, `aspect-ratio 360/300`, backing store `360·dpr × 300·dpr` with `dpr = min(2, devicePixelRatio)`, cursor grab / grabbing, `touch-none`. Map pointers into stage units with the canvas rect.
- Texture (painted once per prop change on an offscreen canvas of `266×152` at 2× scale): linear gradient `from → to` corner to corner; a woven grid of 1px white lines every 3px at 6% alpha; a dashed hem (dash 4/3, `rgba(255,255,255,.45)`, 1px) inset 7px; centred white title `700 30px` system/SF Pro Display at `y = h/2 − 12`; subtitle `500 12.5px` at 85% alpha at `y = h/2 + 20`.
- Each grid cell is drawn as two triangles; each triangle affine-maps its texture triangle onto the cloth triangle (solve the 2D affine transform from the three point pairs, clip to the triangle grown 0.9px outward from its centroid to hide seams, `ctx.transform`, `drawImage`).
- Fold shading per cell: `area` = cross-product area of the cell ÷ 19², `lean = (b.y − a.y) / 19`, `shade = clamp((1 − area)·0.6 + lean·0.18, −0.25, 0.35)`. If `|shade| > 0.02` fill the quad with black at `shade` or white at `−shade`.
- Rail: rounded rect at `(OX − 16, OY − 9)`, width `14·19 + 32`, height 6, radius 3, vertical gradient `#e8e8ed → #a1a1a6` (dark `#636366 → #3a3a3c`).
- Pins: 3.2px circles at `(x, y − 2)` in `#1d1d1f` (dark `#d1d1d6`) with a 1px highlight at `(x − 1, y − 3)`, `rgba(255,255,255,.6)` (dark `.9`). Watch `html.dark` with a MutationObserver and redraw on change.
- Footer: row, space-between, 8px side padding. Left status 13px `#86868b` (dark `#8e8e93`). Right: two 32px pill buttons, 12px medium, padding 0 12px, `#f0f0f3` / `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`), disabled at 40% opacity: "Breeze" (scales to 0.94 while pressed) and "Dismiss".
- Dismissed overlay over the canvas, fading in from y 10: "Announcement dismissed." 14px `#6e6e73` (dark `#a1a1a6`) and a 36px pill "Hang it back up", 13px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text).

## Motion (verlet loop, one step per animation frame)

- Build: point `(i, j)` at `x = OX + i·19`, `y = OY + j·19 − (j > 0 ? 30 : 0)` (lower rows start bunched up so it drops into place), previous = current; top-row pins fixed. Links between horizontal and vertical neighbours, rest length 19.
- `t += 1/60`. Wind `= sin(1.3t)·0.05 + sin(3.1t)·0.03 + gust`; then `gust *= 0.97`.
- For each free point: velocity `= (pos − prev)·0.985`; prev = pos; `x += vx + wind·(0.6 + sin(0.05y + 2t)·0.4)`; `y += vy + 0.32`.
- A grabbed point is set to the pointer each frame.
- 5 constraint iterations over all links: `diff = (d − len)/d · 0.5`; move both ends by half when both free; if one end is pinned or grabbed, move the other by the full correction.
- A pin pops when the point below it is more than `19·2.1` away: unpin it and nudge `prev.y −= 3`.
- Dismissed when no pins remain and every point is below `SH + 20`; then stop simulating until it is hung back up.

## Interaction and states

- Pointer down: pick the nearest unpinned point within 34 units, capture the pointer, grab it; move updates the target; up/cancel releases.
- Breeze: `gust = 0.9`. Dismiss: unpin every point so the banner falls.
- Status text: "Pull it down hard to dismiss." with all pins, then "3 pins left…" / "1 pin left…", empty once dismissed (`aria-live="polite"`).
- When dismissed, call `onDismiss` once, show the overlay and move focus to "Hang it back up"; that rebuilds the cloth and returns focus to Dismiss.
- Pause the loop off screen (IntersectionObserver) and while the tab is hidden; on unmount cancel the frame and disconnect all observers.
- Reduced motion: no ambient sway term; gravity, grabbing, Breeze and Dismiss still work.

## Autoplay demo

Every 2200ms set `gust = ±(0.35 + rand·0.3)` (random side). Stops for good on any grab or button press; skipped while off screen; disabled under reduced motion.

## Accessibility

- Canvas: `role="img"`, `aria-label="Announcement banner: {title}. {subtitle}"`.
- Dismiss is a real button (`aria-label="Dismiss announcement"`), so the banner can be dismissed from the keyboard. Focus rings 2px `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] On mount the cloth drops into place and hangs from five pins, gently swaying.
- [ ] Text and gradient deform with folds; creases darken, stretched rises lighten.
- [ ] Dragging drapes the cloth; pulling down hard pops pins one at a time and the status counts down.
- [ ] Once all pins pop it falls away, `onDismiss` fires once and "Hang it back up" appears and takes focus.
- [ ] Tab to Dismiss and press Enter: the same fall and callback.
- [ ] Breeze blows it sideways and the gust fades.
- [ ] Rail and pins switch colour when the site toggles dark mode.
- [ ] No ambient sway or autoplay gusts with reduced motion.
