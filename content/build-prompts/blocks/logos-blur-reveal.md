# Blur Hover Reveal

Build a logo cloud where monochrome brand lockups rest at half strength. Hovering one pulls it into focus: it brightens and grows slightly while every other mark dims, shrinks a touch and goes soft, like a camera racking focus. It should feel quiet and photographic; nothing moves until you point at it.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`, `Variants`).
- File: `components/blocks/logo-clouds/logo-cloud-blur.tsx`, default export `LogoCloudBlur`.
- The marks come from a sibling `logos.tsx` that exports `LOGOS` and `LogoLockup` (spec below). A `cn()` class-merge helper is assumed.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `className` | `string` | — | Merged onto the outer `<section>`. |

Copy and marks are fixed inside the component.

## Layout and look

- Section: full width, `px-4`, `py-16` (64px), `sm:py-24` (96px), white background, dark `black`.
- Header: `max-w-2xl` (672px), centred text.
  - `h2`: "The teams behind the products you open every morning." 28px, `sm:` 40px, semibold, line-height 1.1, tracking −0.03em, `text-balance`, `#1d1d1f` / dark `#f5f5f7`.
  - `p`: "Hover a name to bring it into focus." 12px top margin, 17px, line-height 1.47, `#6e6e73` / dark `#a1a1a6`.
- Grid (`<ul>`): 48px top margin (`sm:` 56px), `max-w-4xl` (896px), centred; `grid-cols-2`, `sm:grid-cols-3`, `md:grid-cols-4`; `place-items-center`; column gap 24px (`sm:` 40px); row gap 40px (`md:` 48px); text colour `#1d1d1f` / dark `#f5f5f7`. Twelve marks = 4×3 on desktop, 3×4 on tablet, 2×6 on phones.
- Each `<li>` wraps a `motion.div` (`flex items-center cursor-default`) containing `<LogoLockup logo={logo} className="text-[17px] sm:text-[20px]" />`.

## Placeholder marks (`logos.tsx`)

Twelve invented brands, so the section never implies a real company is a customer. `LogoLockup({ logo, tinted = false, className })` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px, with the glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, `currentColor`) then the name in a span with the wordmark classes.

| Name | Wordmark classes | Glyph |
|---|---|---|
| Arcwell | `font-semibold tracking-[-0.03em]` | `M4 18a8 8 0 0 1 16 0`, `M8.5 18a3.5 3.5 0 0 1 7 0`, stroke 2.4, round caps |
| Basalt | `text-[0.78em] font-semibold uppercase tracking-[0.22em]` | `M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z` stroke 2 round join; `M12 12v9.5M12 12l8.2-5M12 12 3.8 7` stroke 1.6 |
| Corvid | `font-serif text-[1.08em] italic tracking-[-0.01em]` | filled `M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z` |
| driftline | `font-medium tracking-[-0.02em]` | y = 7, 12, 17: `M3 {y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`, stroke 2, round caps |
| Emberly | `font-bold tracking-[-0.04em]` | filled `M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z` |
| fieldnote | `font-mono text-[0.9em] font-medium tracking-[-0.04em]` | `M4.5 3.5h10l5 5v12h-15Z` stroke 2; `M14.5 3.5v5h5` stroke 1.6; `M8 13h8M8 16.5h5` stroke 1.8 round |
| Glasshouse | `font-light tracking-[0.02em]` | `M3.5 11 12 3.5l8.5 7.5v9.5h-17Z` stroke 2; `M12 9v11.5M3.5 15h17` stroke 1.6 |
| KESTREL | `text-[0.86em] font-black tracking-[0.08em]` | filled `M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z` |
| Lumora | `font-serif text-[1.08em] tracking-[-0.01em]` | circle r 9 stroke 2; filled `M12 3a9 9 0 0 1 0 18Z` |
| Oakhaven | `font-semibold tracking-[-0.02em]` | `M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z` filled + stroke 1.4 |
| Quill & Co | `font-serif text-[1.06em] italic` | filled `M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z`; `M3.5 20.5h8` stroke 2 round |
| Tidewater | `font-medium tracking-[-0.01em]` | circle r 9 stroke 2; filled `M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z` |

## Motion

- Entrance: a wrapper `motion.div` with `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-80px" }}`, staggering children by 0.05s. Headline, paragraph and every `<li>` use the "rise" variant: hidden `opacity 0, y 16, blur(6px)` → visible `opacity 1, y 0, blur(0px)`, spring stiffness 240, damping 30.
- Focus states on the inner `motion.div` (`initial={false}`, `animate={state}`), spring stiffness 420, damping 34:
  - `rest`: `opacity 0.5, scale 1, blur(0px)` (nothing hovered).
  - `focus`: `opacity 1, scale 1.06, blur(0px)` (this one hovered).
  - `recede`: `opacity 0.2, scale 0.97, blur(2px)` (another one hovered).
- Keep entrance on the `<li>` and hover on the inner element so the two never fight over opacity.

## Interaction and states

- One piece of state: `hovered: number | null`. `onHoverStart` on each inner element sets its index; `onMouseLeave` on the `<ul>` resets to `null`. Moving from one mark to the next passes focus directly without flashing back to rest, because the reset only happens when leaving the whole grid.
- No click or keyboard behaviour; the effect is a pointer enhancement and the marks are plain readable text without it.
- With `prefers-reduced-motion`: the rise variant becomes opacity-only over 0.4s; `focus` keeps scale 1; `recede` keeps scale 1 and no blur, so hover only changes opacity.

## Demo data

The fixed copy above and all twelve placeholder lockups in their listed order.

## Accessibility

- `<section>`, `<h2>`, `<ul>`/`<li>`; each lockup's name is real text, glyph SVGs are `aria-hidden`.
- Resting marks are at 50% of ink; treat them as decorative logos, not body text.
- Reduced motion removes scale and blur.

## Acceptance checklist

- [ ] Twelve marks in 4 columns on desktop, 3 on tablet, 2 on phones, all at 50% opacity at rest.
- [ ] Lockups are 17px on phones and 20px from `sm`, each with its own wordmark style.
- [ ] Scrolling in reveals headline, line and marks with a 50ms stagger, once.
- [ ] Hovering a mark takes it to full opacity and 106% scale on a snappy spring.
- [ ] All other marks drop to 20% opacity, 97% scale and a 2px blur at the same time.
- [ ] Sliding across marks moves focus directly from one to the next.
- [ ] Leaving the grid returns every mark to 50%, unblurred.
- [ ] Reduced motion: hover only changes opacity; entrance is a plain fade.
- [ ] Dark mode: black background, `#f5f5f7` marks and headline, `#a1a1a6` line.
