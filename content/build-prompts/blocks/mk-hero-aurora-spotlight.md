# Aurora Hero Spotlight

Build a dark launch hero section on a slow-moving aurora. A soft coloured spotlight trails the pointer, three blurred ribbons of light drift on their own and lean away from it, and a glass product card under the headline rises in with an overshoot, counts up its numbers, draws its chart and tilts toward the pointer while a glare slides across it. Cinematic but restrained; it is always dark, in both themes.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`, a `cn` helper.
- File: `components/hero-aurora-spotlight/hero-aurora-spotlight.tsx`, named export `HeroAurora`, exported type `HeroAuroraProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Introducing Aurora 2.0"` | Pill text above the headline. |
| `title` | `ReactNode` | `Ship <cinematic> interfaces in an afternoon.` | Headline; the default wraps "cinematic" in a `#7de3ff → white → #e2b8ff` gradient clipped to text. |
| `subtitle` | `string` | "Motion-native components with taste built in. Copy them, own them, launch something people remember." | Supporting line. |
| `primary` | `{ label: string; href: string }` | `{ label: "Start building", href: "#" }` | White pill with arrow. |
| `secondary` | `{ label: string; href: string }` | `{ label: "Watch the film", href: "#" }` | Glass pill with play icon. |
| `spotlight` | `string` | `"rgba(100,210,255,0.22)"` | Colour of the pointer light. |
| `autoplay` | `boolean` | `false` | Moves a pretend pointer until someone moves over it. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- `<section>`: relative, `isolate`, full width, overflow hidden, radius 24px, bg `#06060a`, white text, centred, padding 20px sides / 56px top (32px / 64px from `sm`), no bottom padding (the card bleeds off the bottom). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; under `.dark` `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Background stack (absolute, `-z-10`, `aria-hidden`):
  1. Ribbon 1: left −15%, top −28%, 75% × 62%, ellipse, `#5e5ce6`, opacity .6, blur 90px.
  2. Ribbon 2: right −15%, top −18%, 65% × 50%, `#64d2ff`, opacity .4, blur 100px.
  3. Ribbon 3: bottom 8%, left 25%, 50% × 38%, `#bf5af2`, opacity .35, blur 110px.
  4. 56px line grid in `rgba(255,255,255,.04)` masked by `radial-gradient(ellipse at top, #000 20%, transparent 70%)`.
  5. Spotlight: `radial-gradient(520px circle at X% Y%, spotlight, transparent 60%)`.
- Eyebrow pill: rounded-full, 1px `white/10` border, `white/7%` bg, backdrop blur, padding 4px 12px, 12px medium `white/80`, gap 8px, with a 6px `#64d2ff` dot glowing `0 0 10px #64d2ff`.
- `<h1>`: margin-top 20px, max-width 640px, 34px (46px from `sm`), semibold, line-height 1.02, tracking −0.05em, balanced.
- Subtitle: margin-top 16px, max-width 512px, 15px (16px from `sm`), relaxed, `white/65`.
- CTA row: margin-top 28px, gap 12px, wrap. Both 44px tall, rounded-full, padding 0 20px, 14px, gap 8px. Primary: white bg, `#1d1d1f` semibold, shadow `0 8px 30px -10px rgba(255,255,255,.55)`, 16px arrow (`M3 8h10M9 4l4 4-4 4`, stroke 1.8) that nudges 2px right on hover. Secondary: medium `white/85`, 1px `white/15` border, `white/5%` bg (hover 9%), backdrop blur, 14px filled play triangle.
- Product card: wrapper margin-top 36px, max-width 672px, `perspective: 1200px`. Outer glass: radius 22px top only, 1px `white/10` border without bottom, `white/6%`, backdrop-blur-xl, padding 8px (no bottom). Inner: radius 16px top, `#0c0c12`, padding 12px (16px from `sm`), left-aligned.
  - Toolbar: three 8px dots `#ff5f57`, `#febc2e`, `#28c840` at 80%, then a 20px tall `white/5%` address bar radius 6px, 12px left margin.
  - Three stat tiles (grid, gap 8px, radius 12px, `white/10` border, `white/3%`, padding 10px / 12px): Conversion 4.8% "+0.9", Sessions 128k "+12%", Bounce 31% "-4%". Label 11px `white/55` truncating; value 16px (19px `sm`) semibold tracking −0.02em tabular; delta 11px medium, `#30d158` when up, `#64d2ff` when down.
  - Chart: SVG viewBox 300×60, `preserveAspectRatio="none"`, 64px tall, radius 12px, `white/10` border, `white/2%`. Area `M0 48 C 30 44, 50 30, 80 34 S 130 22, 160 26 S 220 10, 250 14 S 290 6, 300 4 L 300 60 L 0 60 Z` filled with a vertical `#64d2ff` gradient .35 → 0 (unique id via `useId`); line is the same curve, stroke `#64d2ff` 1.6, non-scaling stroke.
  - Glare overlay over the whole glass card.

## Motion

- Pointer as normalised motion values `nx` (rest .5) and `ny` (rest .35). Smoothed `sx`, `sy` via `useSpring` stiffness 110, damping 20 drive the spotlight centre.
- Card tilt (looser so it lags and swings): `rotateX = spring((0.5 − ny) × 14)`, `rotateY = spring((nx − 0.5) × 18)`, stiffness 140, damping 12.
- Glare: position `g = sx × 140 − 20` %, background `linear-gradient(105deg, transparent calc(g − 18%), rgba(255,255,255,.14) g, transparent calc(g + 18%))`.
- Ribbons: a `drift` clock (seconds, advanced in a rAF loop with dt capped at 50ms). Ribbon 1 `x = sin(0.21t)·70 − (sx − .5)·60`, `rotate = −12 + sin(0.11t)·6`; ribbon 2 `x = cos(0.17t)·60 + (sx − .5)·40`, `rotate = 14 + cos(0.09t)·6`; ribbon 3 `y = sin(0.13t + 1)·40 − (sy − .5)·30`.
- Entrance springs: eyebrow `opacity 0, y 10` (stiffness 260, damping 22); headline, subtitle, CTA row `opacity 0, y 14` (220/22) with delays 0.06, 0.12, 0.18s. Card `opacity 0, y 70, rotateX 18` → rest, spring stiffness 120, damping 11 (visible overshoot), delay .25.
- Count-up: each stat animates 0 → value with a spring (stiffness 60, damping 16), delay `0.5 + i × 0.12`, formatted with its decimals.
- Chart line draws `pathLength 0 → 1`, 1.4s, delay .7, ease `[0.22, 1, 0.36, 1]`.
- Both CTAs `whileTap` scale .95.

## Interaction and states

- `pointermove` on the section sets `nx`, `ny` from the pointer; `pointerleave` returns them to (.5, .35) so everything springs home.
- Reduced motion: no rAF loop, no entrance, no tilt; numbers and chart render final values.

## Autoplay demo

While `autoplay` is on and the section has not received a pointer move, jump the pointer every 1.9s through (.28, .72), (.74, .58), (.52, .86), (.82, .30), looping; the springs turn each jump into a glide.

## Accessibility

- Background layers and the whole product card are `aria-hidden`. CTAs are real links with 2px `#0a84ff` focus rings (offset `#06060a` on the primary). Icons are `aria-hidden`.

## Acceptance checklist

- [ ] A 520px light follows the pointer with a soft lag.
- [ ] Ribbons drift continuously and lean against the pointer.
- [ ] The card rises with a noticeable overshoot, then tilts toward the pointer.
- [ ] A glare band slides across the card as the pointer moves left to right.
- [ ] Stats count up to 4.8%, 128k and 31% in sequence; the chart line draws.
- [ ] Leaving the hero recentres light and tilt.
- [ ] Autoplay glides through four positions until the first real pointer move.
- [ ] Reduced motion shows a static, fully filled hero.
