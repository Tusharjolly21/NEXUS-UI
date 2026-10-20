# Dot Grid Hero

Build a full-height landing-page hero section that sits over a canvas field of short coloured dashes behaving like iron filings round a magnet. Near the pointer every dash swings to point at it, grows, brightens and gets pushed aside, then wobbles back to its own heading on a spring. Clicking empty space sends a ripple rolling outward that kicks and spins the dashes it passes. The copy in front (headline, paragraph, a filled pill and a text link) stays calm and Apple-clean.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`), React `useSyncExternalStore`, a `cn` helper. The field is a single `<canvas>` with a `requestAnimationFrame` loop; no physics library.
- File: `components/dot-grid-hero/dot-grid-hero.tsx`, named export `DotGridHero`, exported types `DotGridHeroProps` and `CTAButton` (`{ label: string; href?: string; onClick?: () => void }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Build interfaces\nthat ship."` | Heading; `\n` becomes `<br>`. |
| `subtitle` | `string` | "A motion-native component library for React. Animated, accessible and production-ready out of the box." | Paragraph; hidden when empty. |
| `primaryCTA` | `CTAButton` | `{ label: "Get started", href: "#" }` | Filled pill. |
| `secondaryCTA` | `CTAButton` | `{ label: "Browse components", href: "#" }` | Text link with chevron. |
| `dotGap` | `number` | `44` | Average dash spacing in px (clamped to at least 18). |
| `interactionRadius` | `number` | `140` | Push radius in px (at least 20). |
| `repulsionStrength` | `number` | `5` | Push force. |
| `springK` | `number` | `0.06` | Return spring per frame. |
| `damping` | `number` | `0.82` | Velocity kept per frame. |
| `colors` | `string[]` | `#0a84ff #5e5ce6 #bf5af2 #ff375f #ff9f0a #30d158` | Dash colours (empty array falls back to these). |
| `background` | `string` | — | Section background; default white / dark black. |
| `textColor` | `string` | — | Heading colour; subtitle uses it at opacity .7. |
| `hint` | `string` | `"Move to steer the field. Click to send a ripple."` | Bottom caption; empty hides it. |
| `autoplay` | `boolean` | `false` | Pretend pointer plus periodic ripples until real input. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- `<section>`: relative, `isolate`, flex centred, `min-height: calc(100svh - 4rem)`, overflow hidden, bg white / dark `#000` unless `background` is set.
- Canvas: absolute inset 0, `-z-10`, pointer-events none, `aria-hidden`, masked by `radial-gradient(ellipse 90% 85% at 50% 50%, #000 55%, transparent)`. Device pixel ratio capped at 2.
- Readability veil behind the copy: `radial-gradient(ellipse 34% 26% at 50% 42%, rgba(255,255,255,.75), transparent)`, dark `rgba(0,0,0,.7)`. Hidden when a custom `background` is passed.
- Copy block: max-width 768px, padding 24px sides, 80px top/bottom, centred text.
- `<h1>`: 40px (64px from `sm`), semibold, line-height 1.02, tracking −0.05em, `text-wrap: balance`, `#1d1d1f` / `#f5f5f7`.
- Subtitle: margin-top 20px, max-width 576px, 16px (18px from `sm`), relaxed leading, `#6e6e73` / `#a1a1a6`.
- CTA row: margin-top 32px, wrap, gap 24px × 12px. Primary: 44px tall pill, padding 0 24px, 15px medium, white on `#0071e3` (hover `#0077ed`, dark `#0a84ff`). Secondary: 15px medium link `#0066cc` / `#2997ff`, underline on hover, 14px chevron (path `M6 3.5 10.5 8 6 12.5`, stroke 2) that nudges 2px right on hover.
- Hint: absolute, bottom 16px, centred, 12px, `#6e6e73` / `#a1a1a6`, pointer-events none.

## Field and dashes

- Build a jittered grid: `cols = ceil(w/gap)+1`, `rows = ceil(h/gap)+1`; each origin is `c·gap + (rand−0.5)·gap·0.9` (same for y). Seed a small deterministic PRNG (mulberry32) with `round(w)·3 + round(h)·7 + gap` so the layout is stable per size. Per dash: rest angle `rand·π`, length 7–15px, width 2–3.4px, a random palette colour, alpha .5–.9.
- Draw each dash as a rounded rectangle (radius = half its width), centred on its position and rotated by its angle. Drawn length is `len · (1 + k·0.9)`; alpha is `min(1, (alpha + k·0.4) × (dark ? 1.1 : 1))`, where `k` is the dash's "facing" amount.
- Rebuild the field on every ResizeObserver resize.

## Motion

- Loop: `dt = min(0.05s, frame time)`, `f = dt·60`. Skip work while off screen (IntersectionObserver).
- Pointer influence: `reach = radius × 1.9`. For dashes within `reach`, `face = (1 − dist/reach)^1.5` and the target heading is the angle from pointer to dash. Inside `radius`, add a push of `((r − dist)/r)² × repulsionStrength × f` along that direction.
- Ripples: radius grows 620px/s, removed past the section diagonal. Dashes within a 36px band get `band = 1 − |dist − r|/36`, falloff `max(0.15, 1 − r/900)`, outward velocity `band·2.4·fall·f` and spin `band·0.09·fall·f`.
- Ease `k` toward `face` at `min(1, 0.2·f)`. Spring to origin: `v += (origin − pos)·springK·f`, then multiply velocity by `damping^f`, `pos += v·f`.
- Rotation: dashes are symmetric, so if the angle error exceeds 90° flip it by 180°. Angular velocity gains `err·0.16·face + restErr·0.025·(1 − face)` per frame (rest error flipped the same way), then decays by `0.86^f`.
- Copy entrance: parent staggers children 0.08s; heading, subtitle and CTA row each go from `opacity 0, y 18` with a spring (stiffness 220, damping 22). Primary pill `whileTap` scale .95.

## Interaction and states

- `pointermove` on the section stores the local pointer and marks it inside; `pointerleave` marks it outside so dashes relax.
- `pointerdown` that is not on a link or button spawns a ripple at that point.
- Theme: follow a `.dark` class on `<html>` via `useSyncExternalStore` plus a MutationObserver (false on the server); the loop reads it from a ref.
- Reduced motion: no loop and no entrance; draw a single still frame and redraw it on resize or theme change.
- Clean up the frame, ResizeObserver and IntersectionObserver on unmount.

## Autoplay demo

While `autoplay` is on and nobody has moved or pressed on the section, drive a pretend pointer along `x = w·(0.5 + 0.38·sin(0.55t))`, `y = h·(0.5 + 0.32·sin(0.9t + 0.6))` and launch a ripple from it every 3.2s. The first real pointer move or press ends the demo for good.

## Accessibility

- Canvas and veil are `aria-hidden`. CTAs are real `<a>` elements with 2px `#0071e3` focus rings (dark `#0a84ff`, offset black on the pill); the chevron is `aria-hidden`.

## Acceptance checklist

- [ ] Dashes near the pointer turn to point at it, lengthen, brighten and get pushed out of a ~140px radius.
- [ ] Moving away lets each dash spring home and wobble back to its own heading.
- [ ] Clicking empty space sends a visible ring of kicked, spinning dashes; clicking a CTA does not.
- [ ] The field is denser or sparser with `dotGap` and fades out toward the edges.
- [ ] Heading, paragraph and buttons rise in one after another.
- [ ] Autoplay sweeps and ripples until the first real interaction.
- [ ] Toggling `.dark` swaps background, text and veil without remounting.
- [ ] Reduced motion shows a static field and no entrance animation.
