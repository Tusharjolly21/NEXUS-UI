# Aspect Crop

Build an aspect-ratio picker for a photo crop where every ratio keeps the same area. Switching from 4:3 to 9:16 should read as re-cropping the same picture, not resizing it: the frame springs to its new shape, the photo stays put underneath, and rule-of-thirds lines flash while the frame moves. Below it sits a segmented control with a sliding pill. The feel is a calm, Apple-like photo editor.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `layoutId`).
- File: `components/aspect-crop/aspect-crop.tsx`. Named export `AspectCrop`, plus the `AspectRatioOption` type and a `DEFAULT_ASPECT_RATIOS` array.

## API

`AspectRatioOption = { id: string; w: number; h: number }` (`id` is the button label).

`AspectCrop` props:

- `ratios?: AspectRatioOption[]`, default `4:3`, `1:1`, `3:4`, `9:16`.
- `src?: string`: a photo to crop. Without it, draw the sunset illustration below.
- `alt?: string`, default `""`.
- `onChange?: (id: string) => void`: called when the user picks a different ratio.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 20px gap.
- Stage: 300×300, flex-centred. In it, the crop frame: `position: relative`, `overflow: hidden`, radius 18px, shadow `0 24px 40px -24px rgba(0,0,0,.45)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 24px 40px -24px rgba(0,0,0,.9)`).
- Frame size: constant area `A = 220 × 220`. For ratio `w:h`: `width = √(A · w / h)`, `height = √(A · h / w)`. So 4:3 ≈ 254×191, 1:1 = 220×220, 3:4 ≈ 191×254, 9:16 = 165×293.
- Photo layer: a 340×340 box centred in the frame (`left/top 50%`, translate −50%/−50%). It never moves or scales; the frame just reveals more or less of it. With `src`, render an `<img>` filling it with `object-fit: cover` (not draggable). Without `src`, draw the sunset:
  - Background: `radial-gradient(30% 22% at 62% 34%, #fff6d8 0%, rgba(255,246,216,0) 70%), linear-gradient(180deg, #ffcf9f 0%, #ff8f7a 38%, #b8506e 58%, #3f2a5c 100%)`.
  - A bottom-aligned SVG, viewBox `0 0 340 150`, full width: far hills path `M0 70 C 60 40, 100 80, 160 55 S 260 30, 340 60 V150 H0Z` fill `#5b2f62`; near hills `M0 100 C 70 80, 130 110, 200 92 S 300 80, 340 96 V150 H0Z` fill `#2c1b3d`; sun circle at (212, 40), r 14, fill `#fff1c1`.
- Thirds overlay: an absolutely filling, non-interactive layer with two vertical 1px lines at 33.33% and 66.67% left and two horizontal 1px lines at the same tops, all `rgba(255,255,255,.7)`.
- Segmented control: `role="radiogroup"`, rounded-full, 4px padding, background `#f0f0f3` (dark `#2c2c2e`). Each button: 36px tall, 14px horizontal padding, rounded-full, 8px gap, 13px medium, tabular numbers. Text `#6e6e73` (dark `#a1a1a6`); selected `#1d1d1f` (dark `#f5f5f7`).
- Each button shows a tiny ratio glyph: a box with a 1.5px `currentColor` border and 3px radius sized `(w / max(w,h)) · 14` by `(h / max(w,h)) · 14` px, then the label.
- Selected pill: an absolutely filling rounded-full span behind the content, white with shadow `0 1px 4px rgba(0,0,0,.14)` (dark `#636366`, shadow alpha .5).

## Motion

- Frame size: animate `width` and `height` with a spring, stiffness 260, damping 26. On first mount the frame grows in from zero size with the same spring.
- Thirds flash: a boolean `moving`. Its layer animates `opacity` to 1 when `moving`, 0 otherwise, over 0.25s. `moving` starts `true` (so the lines show on mount) and is set false 650ms later. Every ratio change sets `moving = true` and restarts a 650ms timer that sets it false. Do this inside the click and autoplay handlers, not in an effect that reacts to the ratio.
- Pill: rendered only inside the selected button with a shared `layoutId` that is unique per instance (e.g. `aspect-pill-${useId()}`), so it slides between buttons with a spring, stiffness 500, damping 34.

## Interaction and states

- Clicking a ratio selects it, flashes the thirds and calls `onChange(id)`. Clicking the already-selected ratio does nothing.
- Each button is a native `<button>` reachable by Tab; Enter/Space selects.
- The photo is not draggable in this control; only the frame shape changes.

## Autoplay demo

With `autoplay`, every 1700ms advance to the next ratio (wrapping) and flash the thirds. A `touched` ref is set on pointer down anywhere on the root or by clicking a ratio; the next tick clears the interval for good. Clear the interval and the flash timer on unmount.

## Accessibility

- The control has `role="radiogroup"`, `aria-label="Aspect ratio"`; each button has `role="radio"` and `aria-checked`.
- Focus ring: `focus-visible` 2px `#0071e3` (dark `#0a84ff`); no default outline.
- The illustration and thirds overlay are `aria-hidden`; a passed `src` uses `alt`.

## Acceptance checklist

- [ ] The frame's area stays at 48,400px² for every ratio; 9:16 is visibly tall and narrow, 4:3 wide and short.
- [ ] Switching ratio springs the frame to its new size while the picture underneath stays fixed in place.
- [ ] Thirds lines fade in when the frame changes and fade out about 0.65s later.
- [ ] The white pill slides between buttons; the ratio glyphs match their ratios.
- [ ] Clicking the current ratio causes no flash and no `onChange`.
- [ ] Passing `src` crops a real photo with `object-fit: cover`.
- [ ] Autoplay cycles ratios every 1.7s and stops for good on the first pointer down.
- [ ] Two instances on a page each animate their own pill.
- [ ] Dark mode swaps the control track, pill, text and shadow; the photo is unchanged.
