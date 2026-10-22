# Origami Pricing

Build a pricing card folded like a paper map. At rest it is a single square cover showing the plan and price. Tap it and it unfolds in two moves: a panel swings out to the right with the feature list, then the bottom half drops down with a customer quote and the call-to-action button. Creases darken while a panel is mid-turn, and folding it back plays the same moves in reverse. The feel is tactile, springy paper: a little overshoot on the way out, a quick firm settle on the way back.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useTransform`, `animate`). The folds themselves are CSS 3D transforms (`perspective`, `preserve-3d`, `backface-visibility`).
- File: `components/origami-pricing/origami-pricing.tsx`, named export `OrigamiPricing`, plus exported `OrigamiPricingProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `planName` | `string` | `"Nexus Pro"` | Plan name on the cover; its first letter (uppercased) fills the logo tile. |
| `price` | `string` | `"$9"` | Price on the cover, with currency symbol. |
| `period` | `string` | `"/mo"` | Small unit after the price. |
| `features` | `string[]` | `["All components", "All templates", "Source + Figma", "Requests first"]` | Rows in the features panel. |
| `quote` | `string` | `"Paid for itself in the first week."` | Quote on the lower-left panel, wrapped in curly quotes. |
| `author` | `string` | `"Maya, Loop"` | Attribution next to a small gradient avatar. |
| `ctaLabel` | `string` | `"Start free trial"` | Button label. |
| `note` | `string` | `"14 days · cancel anytime"` | Small line under the button. |
| `onCtaClick` | `() => void` | none | Called when the button is pressed. The card never navigates or takes payment itself. |
| `caption` | `string` | `"Two folds: out, then down."` | Line under the card; an empty string hides it. |
| `autoplay` | `boolean` | `false` | Folds and unfolds by itself until someone taps the card. Does nothing under reduced motion. |

## Layout and look

- Root: column, items centred, 16px gap. The stage is a 340×340px box (P = 170px per panel, two panels each way) with `perspective: 1100px`.
- Four 170×170px square panels. Closed, only the top-left cover is visible. Open, the layout is a 2×2 grid: cover top-left, features top-right, quote bottom-left, call-to-action bottom-right.
- Group: absolutely positioned 170×170 box with `transform-style: preserve-3d` that holds the cover and the panels. Its `left` is `(1 − a)·85px` and its `top` is `(1 − b)·85px` (a and b are the two fold progress values below), so the closed cover sits in the middle of the stage and the whole card re-centres as it opens.
- Cover: a `button`, fills the group, `transform: translateZ(2px)`, padding 20px, column with space between, text-left. Only the top-left corner is always rounded (18px); the other three corners are 18px when closed and 0 when open, so the cover joins its neighbours. Contents: a 32px logo tile (radius 9px, `#1d1d1f`, white 13px bold letter), and at the bottom the plan name (13px, weight 500, `#6e6e73`), the price (36px, weight 600, line-height 1, tracking −0.04em, `#1d1d1f`) followed by the period (15px, weight 500, tracking normal, `#86868b`), then a hint 12px weight 500 `#0071e3` that reads "Tap to unfold" and "Fold it back" when open. Background white.
- Features panel (top-right, radius 18px on its top-right corner only): white, padding 20px. Heading "Includes" 12px, weight 600, uppercase, tracking 0.1em, `#86868b`. Then a list with 8px gaps; each row has a 14px green check (`#30d158`, stroke 3, round caps) and the text at 13px `#1d1d1f`, 8px apart.
- Quote panel (bottom-left, radius 18px on its bottom-left corner only): `#f5f5f7`, padding 20px, column with space between. Quote 15px, line-height 1.35, tracking −0.01em, `#1d1d1f`. Below it a 24px circle with `linear-gradient(135deg, #ff9f0a, #ff375f)` and the author at 12px `#6e6e73`.
- Call-to-action panel (bottom-right, radius 18px on its bottom-right corner only): `#1d1d1f`, padding 20px, content pushed to the bottom. A full-width 40px-tall pill button, white, text 14px weight 600 `#1d1d1f`; under it, centred, the note at 11px, white at 60% opacity.
- Back of every folded panel (the paper you see mid-turn): `#f1efe8` with `repeating-linear-gradient(135deg, rgba(0,0,0,.025) 0 2px, transparent 2px 6px)`.
- Every face has `overflow: hidden` and `backface-visibility: hidden`; the back face is the same box rotated 180° about Y (or X for the downward folds). Add a 1px inset hairline `rgba(0,0,0,.06)` on faces so white panels read on a white page.
- Dark mode: cover and features panel `#1c1c1e`; quote panel `#2c2c2e`; paper back `#2a2a2c` with stripes `rgba(255,255,255,.03)`; call-to-action panel inverts to `#f5f5f7` with a `#1d1d1f` button and `#f5f5f7` label, note `rgba(0,0,0,.55)`; logo tile `#f5f5f7` with `#1d1d1f` letter; primary text `#f5f5f7`, secondary `#a1a1a6`, tertiary `#8e8e93`; blue hint `#2997ff`; hairline `rgba(255,255,255,.08)`. Green checks and the avatar gradient stay.
- A soft contact shadow ellipse sits under the card: 24px tall, `rgba(0,0,0,.2)` (dark `.6`), `blur-xl`, centred horizontally, width `0.9P + a·P` px and top `1.5P + b·P/2 + 8` px.

## Motion

Two progress values drive everything: `a` (the right fold, 0 closed to 1 open) and `b` (the downward fold).

- Right panel: positioned at `left: 170, top: 0` inside the group with `transform-origin: 0 50%` (its left edge, which is the cover's right edge). Transform `rotateY(180·(1 − a)deg) translateZ((1 − a)px)`. At a = 0 it is flipped 180° so it lies behind the cover with its paper back showing through hidden backface; at a = 1 it lies flat. The small translateZ nudges it away from the cover's plane to stop z-fighting.
- Bottom-left panel: positioned at `left: 0, top: 170` with `transform-origin: 50% 0` (top edge). Transform `rotateX(−180·(1 − b)deg) translateZ(2·(1 − b)px)`.
- Bottom-right panel: a child of the right panel at `left: 0, top: 170`, same origin and transform as the bottom-left, so it folds down from the right panel's bottom edge and rides along while that panel is still turning.
- Opacity of each folded group is 0 while its progress is below 0.02 and 1 otherwise, so their edges cannot peek around the cover's rounded corners when closed.
- Crease shading: each face has a black-to-transparent overlay (`bg-gradient-to-br from-black/30 to-black/5`) whose opacity is `sin(π·v)·0.9 + (1 − v)·0.3`, where v is the progress of that fold. It is darkest mid-turn and still slightly shaded while folded.
- Opening: `animate(a, 1)` as a spring with stiffness 120 and damping 15, and when it resolves `animate(b, 1)` with stiffness 110 and damping 14. Both overshoot slightly.
- Closing: first `animate(b, 0)` then `animate(a, 0)`, each spring stiffness 160, damping 22 (quick, little overshoot).
- A toggle is ignored while a previous one is still running.

## Interaction and states

- `open` state flips immediately on click of the cover; the visuals follow the two sequenced springs. The cover radius changes with `open`.
- While closed, the call-to-action button is `disabled` so it cannot be focused or clicked; folded panels have `aria-hidden` while closed.
- The call-to-action button calls `onCtaClick` if given and does nothing else.
- Tapping the cover again folds everything away.

## Autoplay demo

With `autoplay`, toggle the card every 2600ms (the timer restarts after each toggle), skipping ticks while the card is off screen or the tab is hidden. Once the user has tapped the cover, stop the loop for good. Skip entirely under reduced motion. Clear the timer and observer on unmount.

## Accessibility

- The cover is a native `button type="button"` with `aria-expanded={open}` and `aria-label` "Unfold the {planName} plan card" or "Fold the {planName} plan card". Enter and Space toggle it.
- Focus-visible: 2px ring `#0071e3` (dark `#2997ff`) on the cover and `#0071e3`/`#0a84ff` on the call-to-action button.
- The check icons are `aria-hidden`.

## Acceptance checklist

- [ ] Closed, only the white cover is visible, centred in a 340px stage, with a soft shadow under it.
- [ ] Tapping it swings the features panel out from the cover's right edge, then drops the bottom row down from the top edge, with visible overshoot.
- [ ] Mid-turn panels show the striped paper back and a darker crease shade that fades as they flatten.
- [ ] The cover's corners square off when open so the four panels read as one sheet; the card re-centres as it opens.
- [ ] Folding back reverses the order (bottom row first, then the right panel) with a quicker settle.
- [ ] No panel edges peek out around the closed cover.
- [ ] The call-to-action button cannot be focused while closed and calls `onCtaClick` when open; nothing navigates.
- [ ] Dark mode keeps every panel legible, with the call-to-action panel inverted to light.
- [ ] With `autoplay` the card folds and unfolds on its own until tapped and stays still under reduced motion.
