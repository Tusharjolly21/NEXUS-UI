# Cursor Spotlight

Build a partner grid on a raised white panel: twelve monochrome lockups sit dimmed in hairline-divided cells, and a soft circle of light trails the cursor, revealing the same grid at full strength underneath. When the pointer leaves, the light glides back to the middle. It should feel like moving a torch over a dark shelf, smooth and slightly lagging.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useSpring`, `useMotionTemplate`, `useReducedMotion`, `Variants`).
- File: `components/blocks/logo-clouds/logo-cloud-spotlight.tsx`, default export `LogoCloudSpotlight`.
- The marks come from a sibling `logos.tsx` exporting `LOGOS` and `LogoLockup` (spec below). A `cn()` class-merge helper is assumed.
- Pointer position lives in motion values and drives the mask through `useMotionTemplate`, so moving the pointer never re-renders React.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Twelve partners, one integration standard."` | Headline. |
| `subtitle` | `string` | `"Move across the grid to light up each partner."` | Line under the headline; empty string hides it. |
| `spotlightRadius` | `number` | `240` | Radius of the circle of light in px, clamped 80–600. |
| `dimOpacity` | `number` | — (25% ink) | Strength of the dim layer, clamped 0–1. Unset keeps the `/25` text colours; when set, dim cells use full ink and wrap the lockup in an `inline-flex` span with this opacity. |
| `count` | `number` | all logos (12) | How many marks to show, clamped 1–24. |
| `logos` | `Logo[]` | `LOGOS` | Marks from `logos.tsx` (`{ name, Icon, color, wordmark? }`); first 24 used. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Export the props type as `LogoCloudSpotlightProps`. Every prop is optional and the defaults reproduce the section exactly as described below. Both grid layers render the same marks. Text from props renders as plain text.

## Layout and look

- Section: full width, `px-4`, `py-16` (64px), `sm:py-24` (96px), background `#f5f5f7`, dark `black`.
- Header: `max-w-2xl` (672px), centred.
  - `h2`: "Twelve partners, one integration standard." 28px, `sm:` 40px, semibold, line-height 1.1, tracking −0.03em, `text-balance`, `#1d1d1f` / dark `#f5f5f7`.
  - `p`: "Move across the grid to light up each partner." 12px top margin, 17px, line-height 1.47, `#6e6e73` / dark `#a1a1a6`.
- Panel: 48px top margin (`sm:` 56px), `max-w-4xl` (896px), centred, `relative overflow-hidden`, radius 28px, 8px padding, white (dark `#1c1c1e`). Shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`; dark `0 0 0 1px rgba(255,255,255,.08)`.
- Grid (rendered twice, see below): `grid-cols-2`, `sm:grid-cols-3`, `md:grid-cols-4`, 1px gap, `overflow-hidden`, radius 20px, background `black/6%` (dark `white/8%`) so the 1px gaps read as hairlines.
- Cell: 80px tall (`sm:` 96px), flex centred, 12px side padding, white (dark `#1c1c1e`). Content: `<LogoLockup logo={logo} className="text-[15px] sm:text-[18px]" />`.
  - Dim grid text: `#1d1d1f` at 25% (dark `#f5f5f7` at 25%).
  - Lit grid text: full `#1d1d1f` / `#f5f5f7`.
- Lit layer: `absolute inset-0`, same 8px padding, `pointer-events-none`, with `mask-image` and `-webkit-mask-image` = `radial-gradient(circle 240px at {x}px {y}px, black 0%, transparent 72%)`.

## Placeholder marks (`logos.tsx`)

Twelve invented brands. `LogoLockup({ logo, tinted = false, className })` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px: glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, `currentColor`) then the name with its wordmark classes.

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

## Motion

- Entrance: wrapper `motion.div` with `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-80px" }}`, stagger 0.08s. Headline, paragraph and the panel use "rise": hidden `opacity 0, y 16, blur(6px)` → visible `opacity 1, y 0, blur(0px)`, spring stiffness 240, damping 30. Reduced motion: opacity only, 0.4s.
- Light: raw motion values `mouseX`, `mouseY` start at −9999 (light off-canvas). Springs `x = useSpring(mouseX, { stiffness: 260, damping: 30, mass: 0.6 })`, same for `y`, so the light trails the pointer. The mask string is built with `useMotionTemplate` from the springs; radius `spotlightRadius` (240px by default).

## Interaction and states

- `onMouseMove` on the panel: set `mouseX/Y` to the pointer position relative to the panel's bounding rect.
- Rest position: a `rest(instant)` callback sets the raw values to the panel's centre (`clientWidth / 2`, `clientHeight / 2`); when `instant`, also `jump()` both springs there.
- On mount, wait one `requestAnimationFrame` (the masked layer subscribes after the effect) then call `rest(true)`, so the light starts lit in the middle with no sweep; cancel the frame on cleanup.
- `onMouseLeave`: `rest(false)`, so the light glides back to centre on the spring.
- Touch and keyboard users never move it; they see the centre lit.
- Reduced motion changes only the entrance.

## Demo data

The default headline and line above with all twelve placeholder lockups (4×3 on desktop, 3×4 on tablet, 2×6 on phones).

## Accessibility

- `<section>` and `<h2>`. The dim grid is the one exposed to assistive tech; the lit duplicate is `aria-hidden="true"`, so names are read once.
- Glyph SVGs are `aria-hidden`; names are real text.
- The light is decorative; all content is present without it.

## Acceptance checklist

- [ ] A white 28px-radius panel with an 8px inset holds a 20px-radius grid split by 1px hairlines.
- [ ] Cells are 80px tall on phones, 96px from `sm`; 2, 3 and 4 columns at phone, `sm` and `md`.
- [ ] On load the centre of the grid is already lit, without an animated sweep.
- [ ] Moving the pointer drags a 240px soft circle of full-strength marks that lags slightly behind.
- [ ] Outside the circle, marks stay at 25% ink.
- [ ] Leaving the panel glides the light back to the centre.
- [ ] Pointer movement causes no React re-renders.
- [ ] Screen readers hear each partner name once.
- [ ] Section background is `#f5f5f7` in light mode and black in dark, panel `#1c1c1e` in dark.
- [ ] Entrance fades and un-blurs with an 80ms stagger, once; reduced motion makes it a plain fade.
