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

# Lit Border

Build a wrapper that gives any element a thin border with a band of light that turns to face the pointer and brightens as the pointer gets closer. Put several wrappers inside a shared group and they read as one light moving across a row of cards. It is used here on three pricing cards and a pill-shaped search field. It should feel like a single lamp sweeping past, not like each card reacting on its own.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/glowing-effect-cards/lit-border.tsx`. Named exports `LitBorder`, `LightGroup` and types `LitBorderProps`, `LightGroupProps`. Re-export from the folder's `index.ts`.
- No sound: it is decorative and makes none.

## API

| Prop | On | Type | Default | Meaning |
|---|---|---|---|---|
| `children` | both | `ReactNode` | required | The wrapped element, or the elements sharing the light. |
| `radius` | `LitBorder` | `number` | `24` | Outer corner radius in px (use 999 for pills). |
| `width` | `LitBorder` | `number` | `1.5` | Border thickness in px. |
| `colors` | `LitBorder` | `[string, string, string]` | `["0,113,227", "94,92,230", "48,209,88"]` | RGB triplets for the head, middle and tail of the arc. |
| `className` | both | `string` | none | Extra classes on the outer frame / wrapper. |
| `autoplay` | `LightGroup` | `boolean` | `false` | The light circles the group on its own until a real pointer arrives. |

A `LitBorder` inside a `LightGroup` uses the group's pointer. On its own it tracks the pointer over itself.

## Layout and look

- `LitBorder` outer frame: `motion.div`, `position: relative`, `padding = width`, `border-radius = radius`. The frame's own background is the light, so the padding is the visible border.
- Inner surface: `position: relative`, `height: 100%`, radius `radius - width`, white (dark `#1c1c1e`). The wrapped content goes inside.
- Light: `conic-gradient(from <angle>deg at 50% 50%, rgba(c1,g) 0deg, rgba(c2,g) 40deg, REST 90deg, REST 270deg, rgba(c3,g) 320deg, rgba(c1,g) 360deg)` where `g` is the glow alpha and `REST` is `rgba(0,0,0,.08)` in light mode and `rgba(255,255,255,.16)` in dark mode (switch with two CSS variables on the frame, `--lit-rest` as space-separated RGB and `--lit-rest-a`).
- Demo (in the preview, not the component): a `LightGroup` column, `max-width 720px`, gap 12px, 8px padding: a three-column grid (one column under `sm`) of pricing cards, then a pill search field.
  - Card: 20px padding, name 15px semibold, optional "Popular" chip (11px semibold, `#eef5ff` with `#0062c4` text; dark `#0a84ff` at 20% with `#64b5ff` text), price 32px semibold tracking -0.03em with " /month" 14px in `#6e6e73` (dark `#a1a1a6`), a 13.5px description, and a 40px full-width pill button (`#0071e3` with white text for the popular plan, `#f5f5f7` / dark `#2c2c2e` for the others).
  - Plans: Starter $0, Studio $19 (popular), Scale $49.
  - Search: 48px tall, 20px side padding, 16px search icon, 15px input with an `aria-label`.

## Motion

- Pointer: two motion values `px`, `py` in viewport coordinates, `-9999` when there is no pointer. In a group they live in the group; the group sets them on pointer move and resets them on pointer leave.
- For each border, whenever `px` or `py` changes: take the border's centre, `angle = atan2(dy, dx) in degrees + 90`; distance `out = max(0, |dx| - width/2, |dy| - height/2)`; `glow = max(floor, 1 - out / 260)` where `floor` is 0.12 normally and 1 while focus is inside. The conic gradient is built from these motion values with `useMotionTemplate`, so nothing re-renders.
- Focus: focus anywhere inside a `LitBorder` sets glow to 1 and keeps it there until focus leaves.
- Reduced motion: pointer tracking is direct (no autoplay), so it stays; there is no looping motion.

## Interaction and states

- Mouse and touch drags move the light; leaving the group or the border dims it back to rest.
- Inputs and buttons inside keep their own focus styles (2px outline, `#0071e3`, dark `#0a84ff`).

## Autoplay demo

With `autoplay` on `LightGroup`, only while the group is on screen, the tab is visible and motion is not reduced: every 1.6s move the virtual pointer to `centre + (cos(t * 0.9) * 0.55 * width, sin(t * 0.9) * 0.8 * height)` over 1.6s, ease-in-out (the first step is instant), so the light circles the group. The first real pointer move inside the group stops it for good.

## Accessibility

- The border is purely decorative; wrapped content keeps its own semantics and tab order. The light is never the only focus cue: wrapped controls keep visible outlines.
- Rest and lit colours are non-text decoration; all text sits on the white / `#1c1c1e` inner surface and meets 4.5:1.

## Acceptance checklist

- [ ] Moving across the pricing cards turns each card's light band toward the pointer; the nearest card is brightest.
- [ ] Cards far from the pointer sit at a faint hairline.
- [ ] The search pill (radius 999) lights the same way.
- [ ] A lone `LitBorder` outside any group tracks the pointer over itself.
- [ ] Tabbing into the search field or a button fully lights its border.
- [ ] Dark mode has a `#1c1c1e` interior and a visible hairline at rest.
- [ ] Leaving the group dims the light; autoplay circles it until the first pointer arrives and then never restarts.
