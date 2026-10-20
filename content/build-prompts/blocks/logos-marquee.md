# Infinite Marquee

Build a customer band: an eyebrow and headline over two rows of monochrome brand lockups drifting in opposite directions forever. The rows fade out at both edges through a mask, not a painted gradient, so the band sits on any background. It should feel steady and unhurried; hovering a row pauses it so a mark can be read.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`, `Variants`) for the entrance, and `react-fast-marquee` for the loops.
- File: `components/blocks/logo-clouds/logo-cloud-marquee.tsx`, default export `LogoCloudMarquee`.
- The marks come from a sibling `logos.tsx` exporting `LOGOS`, `LogoLockup` and the `Logo` type (spec below). A `cn()` class-merge helper is assumed.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"Customers"` | Small grey label above the headline; empty string hides it (and the headline's 8px top margin). |
| `title` | `string` | `"Running in production at 2,400 teams, from two-person studios to public companies."` | Headline. |
| `speed` | `number` | `34` | Drift speed in px/s for both rows, clamped 5–200. |
| `rows` | `number` | `2` | `2` splits the list in half (first half moves left, second right); `1` puts every mark in one left-moving row. Clamped 1–2. |
| `pauseOnHover` | `boolean` | `true` | Pause a row while the pointer is over it. |
| `fadeEdges` | `boolean` | `true` | Apply the edge mask. |
| `logos` | `Logo[]` | `LOGOS` | Marks from `logos.tsx` (`{ name, Icon, color, wordmark? }`); first 24 used. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Export the props type as `LogoCloudMarqueeProps`. Every prop is optional and the defaults reproduce the section exactly as described below. Text from props renders as plain text.

## Layout and look

- Section: full width, no horizontal padding (the band runs edge to edge), `py-16` (64px), `sm:py-24` (96px), white background, dark `black`.
- Header: `max-w-3xl` (768px), `px-4`, centred text.
  - Eyebrow `p`: "Customers", 17px, semibold, tracking −0.01em, `#6e6e73` / dark `#a1a1a6`.
  - `h2` (8px top margin): "Running in production at 2,400 teams, from two-person studios to public companies." 28px, `sm:` 40px, semibold, line-height 1.1, tracking −0.03em, `text-balance`, `#1d1d1f` / dark `#f5f5f7`.
- Band: 48px top margin (`sm:` 56px), `relative overflow-hidden`, with `mask-image` and `-webkit-mask-image` set to `linear-gradient(to right, transparent, black 12%, black 88%, transparent)`.
- Inside, a vertical flex with 32px gap (`sm:` 40px) holding two marquees.
- Item: horizontal margin 28px (`sm:` 40px), flex centred, colour `#1d1d1f` at 50% (dark `#f5f5f7` at 50%), hover full colour, `transition-colors 300ms ease-out`. Content: `<LogoLockup logo={logo} className="text-[17px] sm:text-[20px]" />`.

## Placeholder marks (`logos.tsx`)

Twelve invented brands. `LogoLockup({ logo, tinted = false, className })` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px: the glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, `currentColor`) then the name in a span with the wordmark classes.

| Name | Wordmark classes | Glyph |
|---|---|---|
| Arcwell | `font-semibold tracking-[-0.03em]` | `M4 18a8 8 0 0 1 16 0`, `M8.5 18a3.5 3.5 0 0 1 7 0`, stroke 2.4, round caps |
| Basalt | `text-[0.78em] font-semibold uppercase tracking-[0.22em]` | `M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z` stroke 2; `M12 12v9.5M12 12l8.2-5M12 12 3.8 7` stroke 1.6 |
| Corvid | `font-serif text-[1.08em] italic tracking-[-0.01em]` | filled `M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z` |
| driftline | `font-medium tracking-[-0.02em]` | y = 7, 12, 17: `M3 {y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`, stroke 2 |
| Emberly | `font-bold tracking-[-0.04em]` | filled `M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z` |
| fieldnote | `font-mono text-[0.9em] font-medium tracking-[-0.04em]` | `M4.5 3.5h10l5 5v12h-15Z` stroke 2; `M14.5 3.5v5h5` stroke 1.6; `M8 13h8M8 16.5h5` stroke 1.8 |
| Glasshouse | `font-light tracking-[0.02em]` | `M3.5 11 12 3.5l8.5 7.5v9.5h-17Z` stroke 2; `M12 9v11.5M3.5 15h17` stroke 1.6 |
| KESTREL | `text-[0.86em] font-black tracking-[0.08em]` | filled `M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z` |
| Lumora | `font-serif text-[1.08em] tracking-[-0.01em]` | circle r 9 stroke 2; filled `M12 3a9 9 0 0 1 0 18Z` |
| Oakhaven | `font-semibold tracking-[-0.02em]` | `M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z` filled + stroke 1.4 |
| Quill & Co | `font-serif text-[1.06em] italic` | filled `M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z`; `M3.5 20.5h8` stroke 2 |
| Tidewater | `font-medium tracking-[-0.01em]` | circle r 9 stroke 2; filled `M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z` |

Row one is `LOGOS.slice(0, 6)` (Arcwell to fieldnote), row two `LOGOS.slice(6, 12)` (Glasshouse to Tidewater).

## Motion

- Entrance: a wrapper `motion.div` with `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-80px" }}`, staggering children 0.08s. Eyebrow, headline and the band each use the "rise" variant: hidden `opacity 0, y 16, blur(6px)` → visible `opacity 1, y 0, blur(0px)`, spring stiffness 240, damping 30. Reduced motion: opacity only, 0.4s.
- Loops: `<Marquee speed={speed} gradient={false} pauseOnHover={pauseOnHover}>` (34px/s by default) for row one (moves left, the default) and the same with `direction="right"` for row two (left out when `rows` is 1 or the second half is empty). Each row renders its marks twice (`[...row, ...row]`, keys `${name}-${i}`) so the strip is always longer than the viewport and never shows a gap.
- Hover colour change is a CSS transition (300ms ease-out), independent of the loop.

## Interaction and states

- Hovering a row pauses that row only; hovering a mark brings it from 50% to full ink.
- Reduced motion: besides the opacity-only entrance, pause the library's CSS animation with an arbitrary variant on the band: `motion-reduce:[&_.rfm-marquee]:![animation-play-state:paused]`. The rows then sit still, fully readable.
- No click behaviour.

## Demo data

The default eyebrow and headline above, and the twelve placeholder lockups split into two rows of six, at 34px/s.

## Accessibility

- `<section>`, eyebrow `<p>`, `<h2>`. Lockup names are real text; glyph SVGs are `aria-hidden`.
- The loop duplicates its children (and the marquee library clones them again), so assistive tech meets each name several times. If you need a clean reading order, mark the band `aria-hidden` and add a visually hidden list of the twelve names; that is an optional improvement, not part of the reference build.
- Reduced motion fully stops movement; pause-on-hover gives a manual stop.

## Acceptance checklist

- [ ] Eyebrow "Customers" in grey above a 28px/40px balanced headline.
- [ ] Two full-bleed rows of six marks each, top row drifting left, bottom row drifting right, at the same slow speed.
- [ ] No seam or gap ever appears in either loop.
- [ ] Both edges fade to transparent over 12% of the width, with no coloured overlay.
- [ ] Marks sit at 50% ink and go to full ink on hover over 300ms.
- [ ] Hovering a row pauses it; leaving resumes it.
- [ ] Rows are 32px apart on phones and 40px from `sm`; marks 17px/20px with 28px/40px side margins.
- [ ] The section fades and un-blurs in with an 80ms stagger, once.
- [ ] With reduced motion on, both rows are still.
- [ ] Dark mode: black background, `#f5f5f7` ink at 50%, `#a1a1a6` eyebrow.
