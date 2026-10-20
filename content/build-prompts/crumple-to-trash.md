# Crumple to Trash

Build a literal "Move to trash" interaction: a small document page scrunches into a paper ball, gets thrown in an arc into a pedal bin whose lid flips open and slams shut with a wobble, and an Undo button throws it back out and smooths it flat again. The feel is physical and a little playful, with Apple-like greys and type.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useAnimationControls`).
- File: `components/crumple-to-trash/crumple-to-trash.tsx`, named export `CrumpleToTrash`.

## API

- `title?: string`, default `"Draft · Q4 notes"`: heading printed on the page.
- `onTrash?: () => void`: called once the ball has landed in the bin.
- `onRestore?: () => void`: called once Undo has finished smoothing the page.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 16px gap. Define two CSS variables on it for the paper: `--ct-paper` `#ffffff` / `--ct-paper-2` `#ececf0` in light, `#2c2c2e` / `#1f1f21` in dark.
- Scene: 420×250 (max-width 100%), relative, items vertically centred.
- Page slot: 160×200, `margin-left: 24px`. Inside it, a wrapper that carries the motion values `x`, `y`, `rotate`, and inside that the sheet itself (absolute inset 0, overflow hidden). Sheet shadow: light `0 0 0 1px rgba(0,0,0,.06), 0 14px 26px -14px rgba(0,0,0,.35)`; dark `0 0 0 1px rgba(255,255,255,.08), 0 14px 26px -14px rgba(0,0,0,.8)`.
- Sheet content: padding 16px, column, 8px gap. Title 13px semibold `#1d1d1f` (dark `#f5f5f7`). Then eight 5px-tall rounded lines at widths 92, 80, 86, 60, 88, 74, 66, 82 % in `#d2d2d7` (dark `#48484a`).
- Crease overlay: an SVG covering the sheet, `viewBox 0 0 160 200`, `preserveAspectRatio none`, one path `M0 40 L70 90 L160 60 M20 200 L80 110 L150 180 M80 0 L70 90 L80 110 M0 140 L80 110`, stroke `currentColor` at 1.2px, no fill; colour `rgba(0,0,0,.18)` in light, `rgba(255,255,255,.14)` in dark.
- Bin: 76×96, absolutely at `right 32px, bottom 24px`, transform origin bottom. Body from `top 8px` to the bottom, radius 3px top / 14px bottom, gradient `linear-gradient(90deg, #e5e5ea, #f5f5f7 40%, #d1d1d6)` with inset 1px `rgba(0,0,0,.06)`; dark `linear-gradient(90deg, #3a3a3c, #48484a 40%, #2c2c2e)` and inset `rgba(255,255,255,.06)`. Three vertical slats, 3px wide, rounded, from top 16px to bottom 12px at left 18, 38, 58px, `rgba(0,0,0,.1)` (dark `.3`).
- Lid: 88×12 at `top −8px, left −6px`, radius 6px, `#c7c7cc` (dark `#636366`), transform origin left-bottom so it hinges at its left end. Handle: 22×7 centred on top (`top −6px`), top radius 4px, `#aeaeb2` (dark `#8e8e93`).
- Below the scene, a 40px-high row (12px gap): a pill button, 40px tall, 20px horizontal padding, 14px medium, `#1d1d1f` with white text (dark: `#f5f5f7` with `#1d1d1f` text), `whileTap scale 0.94`. Label is "Move to trash" or "Undo". When trashed, a status text "Deleted." (13px, `#6e6e73`, dark `#a1a1a6`) fades in from `x −6` and fades out on undo.

## The crumple effect

Hold a number `c` (0 = flat, 1 = ball) in state. Derived each render:

- sheet `transform: scale(1 − 0.72·c)`
- `border-radius: 8 + 80·c` px (rounds into a ball)
- background `linear-gradient((140 + 40·c)deg, var(--ct-paper), X)` where X is `var(--ct-paper-2)` once `c > 0.1`, else `var(--ct-paper)`
- content opacity `1 − 0.5·c`; crease overlay opacity `c`
- an SVG filter applied with `filter: url(#id)` only while `c > 0.01`: `feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"` feeding `feDisplacementMap` with `scale = 46·c`, channels R and G. The filter region is `x/y −20%`, `width/height 140%`. Put it in a hidden 0×0 SVG; the id comes from `useId()` with every non-alphanumeric character stripped, prefixed with a letter.

## Motion

Landing offset from the page's rest position: `DX = 244`, `DY = 34` (the bin's mouth). A `busy` ref blocks re-entry while either sequence runs.

**Toss:**

1. Animate `c` 0 → 1 over 0.55s, ease `[0.4, 0, 0.2, 1]`.
2. Open the lid: `rotate −70`, spring stiffness 300, damping 14.
3. In parallel over 0.6s: `x` keyframes `[0, DX·0.5, DX]` ease `easeIn`; `y` keyframes `[0, −110, DY]` with per-segment eases `easeOut` then `easeIn` (rise, then fall); `rotate` to 540°.
4. Mark trashed: the page unmounts through `AnimatePresence` with exit `opacity 0, scale 0.6` in 0.12s.
5. Close the lid: `rotate 0`, spring stiffness 500, damping 12 (a snappy slam). Wobble the bin: `rotate [0, −6, 5, −3, 0]` over 0.5s.
6. Call `onTrash`.

**Undo:**

1. Open the lid (spring 300/14) and mark not trashed, so the ball remounts at the bin.
2. In parallel over 0.6s: `x [DX, 120, 0]` ease `easeOut`; `y [DY, −120, 0]` eases `easeOut` then `easeIn`; `rotate` to 0.
3. Close the lid (spring 500/12).
4. Animate `c` 1 → 0 with a spring, stiffness 140, damping 16 (the paper relaxes flat with a small settle).
5. Call `onRestore`.

Keep the trashed flag in both state (for rendering) and a ref (for the async sequences and timers).

## Interaction and states

- The button runs toss when the page is on screen and undo when it is in the bin. Clicks during a running sequence are ignored.
- Two states: page visible (button "Move to trash") and trashed (button "Undo", status "Deleted.").

## Autoplay demo

With `autoplay`, run a toggle 900ms after mount and then every 3000ms: undo if trashed, otherwise toss. The first click on the button marks the component touched and the timers stop acting. Clear timers on unmount.

## Accessibility

- The button is a native `<button type="button">` with a visible focus outline: 2px `#0071e3` (dark `#0a84ff`), 2px offset, on `:focus-visible`.
- "Deleted." has `role="status"` so the change is announced.
- The bin and the filter SVG are `aria-hidden`.

## Acceptance checklist

- [ ] Clicking "Move to trash" scrunches the page into a lumpy, rounded ball about a quarter of its size in about half a second.
- [ ] The ball flies up about 110px and drops into the bin while spinning one and a half turns.
- [ ] The lid flips open before the throw, slams shut after it, and the bin wobbles.
- [ ] The button turns into "Undo" and "Deleted." fades in beside it.
- [ ] Undo throws the ball back along a higher arc and the page springs flat, ending exactly as it started.
- [ ] Double clicks mid-animation do nothing extra.
- [ ] Autoplay alternates toss and undo every 3s and stops after the first click.
- [ ] Dark mode uses the dark paper, lines, bin and an inverted button.
