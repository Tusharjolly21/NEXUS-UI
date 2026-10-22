# Origami Pricing

Build a pricing card folded like a paper map. At rest it is one square cover showing plan and price. Tap it and it unfolds in two moves: a panel swings out to the right with the features, then the bottom half drops down with a customer quote and the call-to-action button. Creases darken mid-turn, and folding back plays the moves in reverse. The feel is tactile, springy paper: overshoot on the way out, a quick firm settle on the way back.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`useMotionValue`, `useTransform`, `animate`). The folds are CSS 3D (`perspective`, `preserve-3d`, `backface-visibility`).
- File: `components/origami-pricing/origami-pricing.tsx`, named export `OrigamiPricing`, plus `OrigamiPricingProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `planName` | `string` | `"Nexus Pro"` | Plan name; its uppercased first letter fills the logo tile. |
| `price` | `string` | `"$9"` | Price with currency symbol. |
| `period` | `string` | `"/mo"` | Small unit after the price. |
| `features` | `string[]` | `["All components", "All templates", "Source + Figma", "Requests first"]` | Rows in the features panel. |
| `quote` | `string` | `"Paid for itself in the first week."` | Quote, wrapped in curly quotes. |
| `author` | `string` | `"Maya, Loop"` | Attribution beside a gradient avatar. |
| `ctaLabel` | `string` | `"Start free trial"` | Button label. |
| `note` | `string` | `"14 days · cancel anytime"` | Line under the button. |
| `onCtaClick` | `() => void` | none | Called on button press; the card never navigates or charges. |
| `caption` | `string` | `"Two folds: out, then down."` | Line under the card; empty hides it. |
| `autoplay` | `boolean` | `false` | Folds and unfolds by itself until tapped. Skipped under reduced motion. |

## Layout and look

- Root: column, centred, 16px gap. Stage 340×340px (panel size P = 170) with `perspective: 1100px`.
- Four 170px square panels in a 2×2 grid when open: cover top-left, features top-right, quote bottom-left, call to action bottom-right. Closed, only the cover shows.
- A 170px group with `transform-style: preserve-3d` holds them; its `left` = (1−a)·85px and `top` = (1−b)·85px (a, b are the fold progress values below), so the card re-centres as it opens.
- Cover: a `button`, `translateZ(2px)`, padding 20px, column, space-between, left-aligned, white. Top-left radius always 18px; the other corners are 18px closed, 0 open. Contents: 32px logo tile (radius 9px, `#1d1d1f`, white 13px bold letter); at the bottom the plan name (13px/500, `#6e6e73`), price (36px/600, line-height 1, tracking −0.04em, `#1d1d1f`) with the period (15px/500, `#86868b`), and a hint (12px/500, `#0071e3`): "Tap to unfold" / "Fold it back".
- Features panel (top-right radius 18px): white, padding 20px. "Includes" 12px/600 uppercase, tracking 0.1em, `#86868b`; rows 8px apart, each a 14px green check (`#30d158`, stroke 3, round caps) plus 13px `#1d1d1f` text.
- Quote panel (bottom-left radius 18px): `#f5f5f7`, padding 20px, space-between. Quote 15px, line-height 1.35, tracking −0.01em; below, a 24px circle `linear-gradient(135deg, #ff9f0a, #ff375f)` and the author 12px `#6e6e73`.
- Call-to-action panel (bottom-right radius 18px): `#1d1d1f`, padding 20px, content at the bottom: a full-width 40px white pill button (14px/600, `#1d1d1f`), then the note centred at 11px, white 60%.
- Panel backs (seen mid-turn): `#f1efe8` with `repeating-linear-gradient(135deg, rgba(0,0,0,.025) 0 2px, transparent 2px 6px)`. Faces use `overflow: hidden`, `backface-visibility: hidden`, and a 1px inset hairline `rgba(0,0,0,.06)`; the back face is the same box rotated 180°.
- Contact shadow: 24px-tall ellipse, `rgba(0,0,0,.2)` blurred (`blur-xl`), centred, width 0.9P + a·P, top 1.5P + b·P/2 + 8.
- Dark mode: cover and features `#1c1c1e`; quote `#2c2c2e`; paper back `#2a2a2c` with `rgba(255,255,255,.03)` stripes; the call-to-action panel inverts to `#f5f5f7` with a `#1d1d1f` button, `#f5f5f7` label and note `rgba(0,0,0,.55)`; logo tile `#f5f5f7`/`#1d1d1f`; text `#f5f5f7`, secondary `#a1a1a6`, tertiary `#8e8e93`; hint `#2997ff`; hairline `rgba(255,255,255,.08)`; shadow `rgba(0,0,0,.6)`.

## Motion

Two progress values: `a` (right fold, 0 to 1) and `b` (downward fold).

- Right panel at `left: 170, top: 0`, `transform-origin: 0 50%`, transform `rotateY(180·(1−a)deg) translateZ((1−a)px)`: flipped behind the cover when closed, flat when open.
- Bottom-left panel at `left: 0, top: 170`, `transform-origin: 50% 0`, transform `rotateX(−180·(1−b)deg) translateZ(2·(1−b)px)`.
- Bottom-right panel is a child of the right panel (same position, origin and transform), so it rides along.
- Each folded group has opacity 0 while its progress < 0.02, else 1, so edges never peek round the cover.
- Crease shade: overlay `from-black/30 to-black/5` diagonal gradient with opacity `sin(π·v)·0.9 + (1−v)·0.3`.
- Open: `animate(a, 1)` spring stiffness 120, damping 15; then `animate(b, 1)` stiffness 110, damping 14. Close: `b` to 0, then `a` to 0, both stiffness 160, damping 22.
- Toggles are ignored while a sequence is running.

## Interaction and states

- Clicking the cover flips `open` immediately; visuals follow the springs.
- While closed, the call-to-action button is `disabled` and folded panels are `aria-hidden`.
- The button calls `onCtaClick` if given and does nothing else.

## Autoplay demo

Toggle every 2600ms (timer restarts after each toggle). Skip ticks when off screen or the tab is hidden; stop for good once tapped; skip entirely under reduced motion. Clean up on unmount.

## Accessibility

- Cover is a native `button` with `aria-expanded` and label "Unfold the {planName} plan card" / "Fold the {planName} plan card".
- Focus ring 2px `#0071e3` (dark `#2997ff`; button `#0a84ff`). Check icons `aria-hidden`.

## Acceptance checklist

- [ ] Closed, only the white cover shows, centred, with a soft shadow.
- [ ] Tapping swings the features out from the right edge, then drops the bottom row, with visible overshoot.
- [ ] Mid-turn panels show the striped paper back and a crease shade that fades as they flatten.
- [ ] Cover corners square off when open so four panels read as one sheet.
- [ ] Folding back runs bottom row first, then the right panel, settling faster.
- [ ] No edges peek around the closed cover.
- [ ] The button is unfocusable while closed and calls `onCtaClick` when open.
- [ ] Dark mode stays legible, with the call-to-action panel inverted.
- [ ] `autoplay` folds and unfolds until tapped; still under reduced motion.
