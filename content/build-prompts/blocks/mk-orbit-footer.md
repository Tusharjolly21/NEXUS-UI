# Orbit Footer

Build a complete site footer section in a rounded white card: brand with an orbiting logo mark, a newsletter signup with real states, link columns with small badges, a live status pill and social icons. Under it a giant ghost wordmark of the brand rises from behind the legal bar, and as the pointer runs along it the letters lift and ink in like a wave following the pointer. Calm, Apple-light, with springy detail.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS v4 with container queries (`@container`, `@[480px]:`, `@[560px]:`, `@[720px]:`, `cqw` units), framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`.
- File: `components/orbit-footer/orbit-footer.tsx`, named export `OrbitFooter`, exported types `OrbitFooterProps`, `OrbitFooterColumn` (`{ title; links: OrbitFooterLink[] }`), `OrbitFooterLink` (`{ label; href; badge? }`), `OrbitFooterSocial` (`{ label; href; icon: ReactNode }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Orbit"` | Wordmark top-left and the ghost word. |
| `tagline` | `string` | "Interfaces that move, shipped as code you own." | Line under the brand. |
| `columns` | `OrbitFooterColumn[]` | Product (Components, Templates, Blocks "New", Pricing), Developers (Docs, CLI, Changelog, Status), Company (About, Blog, Careers "3", Contact) | Link columns. |
| `status` | `string \| null` | `"All systems normal"` | Status pill; `null` hides it. |
| `statusHref` | `string` | `"#"` | Status pill link. |
| `onSubscribe` | `(email) => Promise<void> \| void` | — | Called with a valid email; pending while the promise runs, error if it throws. Without it, simulate 900ms then success. |
| `showNewsletter` | `boolean` | `true` | Show the form. |
| `showWordmark` | `boolean` | `true` | Show the ghost word. |
| `socials` | `OrbitFooterSocial[]` | X and GitHub (16px filled SVG marks) | Icon links. |
| `year` | `number` | — | Copyright year; omitted when absent so server and client agree. |
| `legal` | `string` | brand | Text after "©". |
| `autoplay` | `boolean` | `false` | Sweeps a wave through the wordmark until the footer is touched. |
| `className` | `string` | `""` | Extra classes. |

## Layout and look

- `<footer>`: `@container`, relative, full width, overflow hidden, radius 28px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Ink `#1d1d1f` / `#f5f5f7`; soft `#6e6e73` / `#a1a1a6`. Focus rings 2px `#0071e3` / `#0a84ff`.
- Body padding 24px sides, 24px top (40px / 36px at ≥720px).
- Top row: stacked with gap 20px; at ≥560px a row, space-between, gap 32px.
  - Brand block (max-width 280px): logo mark + brand 19px semibold tracking −0.03em, gap 10px; tagline margin-top 12px, 14px relaxed, soft.
  - Logo mark (32px): 1.5px ring at `#1d1d1f/15` (dark `white/20`), a 12px ink centre dot, and a 6px `#0071e3` (dark `#0a84ff`) satellite at the top centre glowing `0 0 8px rgba(0,113,227,.7)`.
  - Newsletter (full width, max 320px at ≥560px): label "Get the monthly changelog" 13px semibold. Field 44px tall pill, `#f0f0f3` / `#2c2c2e`, padding 4px with 16px left, gap 4px, 1px transparent ring that becomes 2px blue on focus-within, red `#ff3b30` in error. Input 14px, placeholder "you@company.com" `#86868b` / `#8e8e93`. Submit 36px tall pill, 13px semibold white, `#0071e3` (hover `#0077ed`, dark `#0a84ff`) with 16px padding; when done it becomes a 36px green `#30d158` circle with a check. Hint below (margin-top 8px, min-height 18px, 12.5px): "One email a month. No spam." soft, errors `#d70015` / `#ff6961`.
- Nav (`aria-label="Footer"`): margin-top 24px (32px at ≥720px), 2 columns (3 at ≥480px), gap 24px. Column title 12px semibold uppercase tracking .08em soft. List margin-top 10px, 6px between items. Links 14px, tracking −0.01em, ink, gap 6px, with an underline (1px, current colour) that scales in from the left over 300ms on hover. Badge: rounded-full, padding 1px 6px, 11px semibold tabular, `#0071e3/10` with `#0066cc` (dark `#0a84ff/20` with `#64b5ff`).
- Meta row: margin-top 24px, wrap, space-between. Status pill: `#f0f0f3` / `#2c2c2e`, padding 6px 12px 6px 10px, 12.5px medium, an 8px `#30d158` dot. Socials: 36px round icon links, soft, hover `black/5` bg + ink (dark `white/8`).
- Wordmark: margin-top 16px, padding 0 16px, centred, no wrap, `font-size: clamp(72px, 27cqw, 260px)`, semibold, line-height .8, tracking −0.06em, margin-bottom −0.2em so it tucks under the legal bar. Each letter is an inline-block (origin bottom) with two layers: a ghost glyph filled `#1d1d1f/12 → transparent` top to bottom (dark `#f5f5f7/16`), and an overlay glyph filled `#1d1d1f → #1d1d1f/60 → transparent` whose opacity is the ink amount. Spaces become non-breaking.
- Legal bar: relative (sits over the wordmark), 1px top border `black/6` (dark `white/10`), same bg as the card, padding 16px 24px (40px sides at ≥720px), 12.5px soft, space-between: "© {year} {legal}" and Privacy / Terms links (gap 16px, hover ink).

## Motion

- Orbit satellite: rotates 360° every 6s, linear, forever.
- Wordmark wave: one motion value `wave` (x in px within the wordmark; −∞ when idle). For each letter, `d = (wave − letterCentre) / max(40, letterWidth·1.1)`, `near = e^(−d²)`; `lift = spring(near, stiffness 260, damping 14, mass 0.6)`. Letter `y = −lift·18%`, `scaleY = 1 + lift·0.06`, ink opacity `clamp(lift, 0, 1)`. The low damping gives a wobbly settle.
- Newsletter error: the field shakes `x: [0, −7, 6, −4, 3, 0]` over .42s. Button `layout` animated (spring 500/30) as it shrinks to a circle, `whileTap` scale .94. Label swap with `AnimatePresence mode="popLayout"`: "Subscribe" enters from y 6 and exits to y −6; pending shows three 6px white dots bouncing `y: [0, −4, 0]`, .6s, staggered .12s, forever; done draws a check `M3.5 8.5 6.5 11.5 12.5 4.5` (stroke 2.4) via `pathLength 0 → 1` in .35s easeOut.
- Status dot: a ping layer scales 1 → 2.4 while fading .6 → 0, 1.6s easeOut, forever.

## Interaction and states

- Pointer move over the wordmark sets `wave` to the local x; leaving sets it to −∞ so letters settle.
- Form states `idle | pending | done | error`. Submit trims the value and tests `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; invalid shows "Enter a valid email address."; success "You're on the list. Check your inbox."; failure "That didn't go through. Try again." Typing after an error clears it. Input and button are disabled while pending or done. Ignore results after unmount.
- Any pointer down, typing or submit marks the footer touched.
- Reduced motion: no wave, no shake, no layout or tap animation, no dot bounce, no ping.

## Autoplay demo

After 500ms, while untouched, tween `wave` from `−10%` to `110%` of the wordmark's scroll width over 2.6s (ease `[0.42, 0, 0.58, 1]`), wait 900ms, sweep back the other way, and repeat.

## Accessibility

- Visible `<label>` bound to the input via `useId`; `aria-invalid` on error; `aria-describedby` to the hint, which is `role="status"` `aria-live="polite"`. Submit `aria-label` is "Subscribe", "Subscribing" or "Subscribed".
- Social links carry `aria-label`s; icons, logo and wordmark are `aria-hidden`.

## Acceptance checklist

- [ ] The blue satellite orbits the logo every 6s.
- [ ] Moving along the wordmark lifts and darkens the letters nearest the pointer in a smooth bell with a wobbly settle.
- [ ] The wordmark is partly hidden behind the legal bar.
- [ ] An invalid email shakes the field red with a message.
- [ ] A valid email shows bouncing dots, then the button shrinks to a green check.
- [ ] Hovering links draws an underline from the left; badges show beside Blocks and Careers.
- [ ] Columns go 2 → 3 and the top row goes stacked → side by side as the container widens.
- [ ] Autoplay sweeps the wave back and forth until touched.
