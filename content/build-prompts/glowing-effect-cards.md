Build a set of feature cards with pointer-reactive glowing rims. Each card has a hairline border that lights up with a short multicolour arc on the side nearest the pointer, plus a soft blurred bloom outside it. The lit arc chases the pointer round the edge on a loose spring, so it swings past and settles; neighbouring cards catch the light as the pointer approaches them, and pressing a card flares it. Ship three layers: a generic wrapper, a ready-made feature card, and a five-card 2-1-2 grid.

## Stack

- React client components (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[480px]:`), framer-motion (`animate`, `motion`, `useMotionTemplate`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`, `useTransform`).
- Folder `components/glowing-effect-cards/`: `GlowingEffect.tsx` (`GlowingEffect`, `GlowingEffectProps`, `GlowPointerContext`), `GlowingCard.tsx` (`GlowingCard`, `GlowingCardProps`), `GlowingCardsLayout.tsx` (`GlowingCardsLayout`, `GlowingCardsLayoutProps`, `DEFAULT_GLOW_CARDS`), `index.ts` re-exporting all.

## API

`GlowingEffect`:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `children` | `ReactNode` | required | Content. |
| `className` | `string` | `""` | Wrapper classes. |
| `glowColor` | `string` | — | Replaces only the first colour. |
| `colors` | `string[]` | `#5ac8fa, #0a84ff, #bf5af2, #ff375f, #ff9f0a` | Arc colours tail to head. |
| `borderRadius` | `string` | `"22px"` | Radius. |
| `disabled` | `boolean` | `false` | No light. |
| `intensity` | `number` | `1` | Clamped 0.5-2; rim thickness = 1.5px × intensity. |
| `blur` | `number` | `18` | Bloom blur px. |
| `spread` | `number` | `90` | Arc width degrees (clamped 20-300). |
| `proximity` | `number` | `72` | px outside the card that still lights it. |

`GlowingCard`: `title: string`, `description: string`, `icon?: ReactNode`, `accent?: string` (default `#0071e3`), `className?`, `tall?: boolean` (default false), `cta?: string`, `href?: string` (whole card becomes a link), `glow?` (GlowingEffect props without children/className).

`GlowingCardsLayout`: `cards?: GlowingCardProps[]` (default `DEFAULT_GLOW_CARDS`), `autoplay?: boolean` (false), `hint?: string` (`"Move across the cards."`, `""` hides), `className?`.

`DEFAULT_GLOW_CARDS` (title, description, accent, cta, 18px stroke icon): Interface polish / "Borders that answer the cursor." / `#0071e3` / Components / sparkle; Live metrics / "Every signal on one card." / `#bf5af2` / Dashboard / bar chart; Control rail / "A tall card that keeps the key actions in reach." / `#ff9f0a` / Manage flow / tall / two nodes and a path; Secure by default / "Trust, shown plainly." / `#30b65a` / Policy / shield; Composable / "Mix blocks across pages." / `#ff375f` / Templates / two squares.

## Layout and look

- GlowingEffect (relative, radius): three layers under the content.
  1. Bloom: absolute `-inset-px`, the conic gradient, `filter: blur({blur}px)`, opacity `glow·0.7`.
  2. Surface: white (dark `#1c1c1e`).
  3. Rim (z 2, above the content): the same gradient with padding `1.5·intensity` px, masked to a ring with `mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)` and `-webkit-mask` + `-webkit-mask-composite: xor`; opacity `glow`.
  - Content wrapper (z 1, full height) with shadow `0 0 0 1px rgba(0,0,0,.06), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`). Disabled: just the surface.
- Gradient: `conic-gradient(from {angle − spread/2}deg at 50% 50%, transparent 0deg, c1 s1deg, c2 s2deg, …, transparent {spread}deg, transparent 360deg)` with stop i at `round((i + 1)/(n + 1)·spread)`.
- GlowingCard body: padding 16, column (space-between when tall). Icon tile 36px, radius 10, accent at 12% (`{accent}1f`) with accent icon, 10px below. Title 16px semibold, tight, tracking −0.02em, `#1d1d1f` / `#f5f5f7`. Description 4px below, 13px, line-height 1.4, `#6e6e73` / `#a1a1a6`. CTA 8px below: 13px semibold in accent with a 12px arrow that slides 4px right on hover (300ms, `cubic-bezier(.34,1.56,.64,1)`). Link variant: focus ring 2px `#0071e3` (dark `#0a84ff`), 2px offset, radius 22.
- Layout: `@container`, centred, max-width 72rem. Hint above (12px, `#6e6e73` / `#a1a1a6`, centred, 12px gap). Grid gap 12, one column; from container width 480px: columns `1fr 0.85fr 1fr`, two rows; card 1 at col 1 row 1, card 2 col 1 row 2, card 3 (forced tall) col 2 spanning both rows, cards 4 and 5 in col 3 rows 1 and 2.

## Motion

- Every GlowingEffect listens to `window` `pointermove` (passive, rAF-throttled). For the pointer relative to its rect: `outside = max(0, left − x, x − right, top − y, y − bottom)`; `near = 1 − clamp(outside/proximity, 0, 1)`. Set lit target to `near` (0 if disabled). If near > 0, aim: `a = atan2(dx, −dy)` in degrees (0 = top, clockwise), unwrapped against the current target so it always turns the short way: `target += ((a − cur) mod 360 + 540) mod 360 − 180`.
- Angle spring: stiffness 110, damping 13, mass 0.9 (swings past and settles); reduced motion 1000/100. Lit spring: 140/22. Leaving the document sets lit to 0.
- Flare on pointer down: set flare to 0.7 then spring it to 0 (stiffness 70, damping 16). `glow = clamp(lit + flare, 0, 1.6)`. Skipped when disabled or reduced motion.
- Because every card computes its own distance, light hands off naturally between neighbours.

## Interaction and states

- Works for mouse, pen and touch moves. Tall card spreads content top and bottom.
- `GlowPointerContext` provides an optional shared virtual pointer `{ x, y }` (client coordinates); when present, each effect also aims at it on change.

## Autoplay demo

`GlowingCardsLayout` with `autoplay` provides the context and drives a figure-eight across the grid on rAF: `y = top + h·(0.5 + 0.42·sin(1.1t))`, `x = left + w·(0.5 + 0.48·sin(0.55t))`. A mouse/pen move or any pointer down over the section stops it for good.

## Accessibility

- All glow layers are `aria-hidden` and pointer-events none. Titles are `<h3>`. Icons `aria-hidden`. With `href` the whole card is one focusable link.

## Acceptance checklist

- Each card's rim lights a short rainbow arc on the side facing the pointer, with a soft bloom outside.
- Moving round a card makes the arc swing after the pointer and overshoot slightly.
- Nearby cards (within 72px) light faintly; far ones are dark.
- Pressing flares the rim briefly.
- The grid is 2-1-2 from 480px container width and a single column below.
- `colors`, `spread`, `intensity`, `blur` and `proximity` visibly change the effect.
- Autoplay sweeps light across every card until the pointer arrives.
- Reduced motion snaps the arc without swing or flare.
