# Single Row Lift

Build the most restrained logo strip: a small grey line of copy over one row of six monochrome brand lockups that settle in with a light stagger. Hovering a mark lifts it a few pixels and enlarges it slightly on a spring while the rest of the row recedes. It should feel understated, the kind of band that sits under a hero without competing with it.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`, `Variants`).
- File: `components/blocks/logo-clouds/logo-cloud-single-row.tsx`, default export `LogoCloudSingleRow`.
- The marks come from a sibling `logos.tsx` exporting `LOGOS` and `LogoLockup` (spec below). A `cn()` class-merge helper is assumed.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Product teams at these companies plan their week with us."` | Small grey line above the row; empty string hides it (and the row's 36px top margin). |
| `count` | `number` | `6` | How many marks to show from the start of `logos`, clamped 1–12. |
| `restOpacity` | `number` | `0.55` | Opacity of every mark while nothing is hovered, clamped 0.1–1. |
| `recedeOpacity` | `number` | `0.22` | Opacity of the other marks while one is hovered, clamped 0–1. |
| `lift` | `number` | `4` | How far the hovered mark rises, in px, clamped 0–16. |
| `hoverScale` | `number` | `1.06` | Scale of the hovered mark, clamped 1–1.3. |
| `logos` | `Logo[]` | `LOGOS` | Marks from `logos.tsx` (`{ name, Icon, color, wordmark? }`). |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Export the props type as `LogoCloudSingleRowProps`. Every prop is optional and the defaults reproduce the section exactly as described below; the hover numbers in "Motion" are these defaults. Text from props renders as plain text.

## Layout and look

- Section: full width, `px-4`, `py-14` (56px), `sm:py-20` (80px), white, dark `black`.
- Container: `max-w-5xl` (1024px), centred.
- `h2`: "Product teams at these companies plan their week with us." centred, 15px, medium, tracking −0.01em, `#6e6e73` / dark `#a1a1a6`. It is deliberately small; the marks carry the section.
- List (`<ul>`): 36px top margin.
  - Phones: `grid-cols-2`, `place-items-center`, column gap 24px, row gap 32px (3 rows of 2).
  - From `sm` (640px): `flex flex-wrap justify-center`, column gap 48px, row gap 32px, so the six marks sit in one centred row when there is room and wrap evenly when not.
- Item: `<li>` wrapping a `motion.div` (`flex items-center cursor-default`, ink `#1d1d1f` / dark `#f5f5f7`) with `<LogoLockup logo={logo} className="text-[16px] sm:text-[18px]" />`.
- Marks: the first six of `LOGOS` (Arcwell, Basalt, Corvid, driftline, Emberly, fieldnote).

## Placeholder marks (`logos.tsx`)

Twelve invented brands (only the first six are used here). `LogoLockup({ logo, tinted = false, className })` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px: glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, `currentColor`) then the name with its wordmark classes.

| Name | Wordmark classes | Glyph |
|---|---|---|
| Arcwell | `font-semibold tracking-[-0.03em]` | `M4 18a8 8 0 0 1 16 0`, `M8.5 18a3.5 3.5 0 0 1 7 0`, stroke 2.4, round caps |
| Basalt | `text-[0.78em] font-semibold uppercase tracking-[0.22em]` | `M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z` stroke 2 round join; `M12 12v9.5M12 12l8.2-5M12 12 3.8 7` stroke 1.6 |
| Corvid | `font-serif text-[1.08em] italic tracking-[-0.01em]` | filled `M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z` |
| driftline | `font-medium tracking-[-0.02em]` | for y = 7, 12, 17: `M3 {y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`, stroke 2, round caps |
| Emberly | `font-bold tracking-[-0.04em]` | filled `M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z` |
| fieldnote | `font-mono text-[0.9em] font-medium tracking-[-0.04em]` | `M4.5 3.5h10l5 5v12h-15Z` stroke 2 round join; `M14.5 3.5v5h5` stroke 1.6; `M8 13h8M8 16.5h5` stroke 1.8 round caps |

(The remaining six, Glasshouse, KESTREL, Lumora, Oakhaven, Quill & Co and Tidewater, belong to the shared list but do not appear in this section.)

## Motion

- Entrance: the container is a `motion.div` with `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-80px" }}`, staggering children by 0.06s. The headline and every `<li>` use "rise": hidden `opacity 0, y 12, blur(6px)` → visible `opacity 1, y 0, blur(0px)`, spring stiffness 240, damping 30. (Note the shorter 12px travel than other logo sections.)
- Hover, on the inner `motion.div` with `initial={false}` and a spring (stiffness 420, damping 30):
  - Nothing hovered: `opacity 0.55, y 0, scale 1`.
  - This mark hovered: `opacity 1, y −4, scale 1.06`.
  - Another mark hovered: `opacity 0.22, y 0, scale 1`.
- The outer `<li>` takes the entrance and the inner element owns hover, so the two never fight over opacity.

## Interaction and states

- State: `hovered: number | null`. Each inner element's `onHoverStart` sets its index; `onMouseLeave` on the `<ul>` clears it. Moving between marks hands the lift straight to the next one.
- No click or keyboard behaviour; hover is a pointer enhancement.
- With `prefers-reduced-motion`: rise becomes opacity-only over 0.4s, and the hovered mark keeps `y 0, scale 1`, so hover changes opacity only.

## Demo data

The default line above and the first six placeholder lockups.

## Accessibility

- `<section>`, `<h2>`, `<ul>`/`<li>`. Names are real text; glyph SVGs are `aria-hidden`.
- Resting marks at 55% are decorative logos, not body copy.
- Reduced motion removes lift and scale.

## Acceptance checklist

- [ ] A centred 15px grey line sits 36px above six marks.
- [ ] From `sm` the marks sit in one centred row 48px apart; on phones they form a 2×3 grid.
- [ ] Marks are 16px on phones and 18px from `sm`, each with its own wordmark style, at 55% opacity.
- [ ] Scrolling in reveals the line then the marks with a 60ms stagger, rising 12px and un-blurring, once.
- [ ] Hovering a mark lifts it 4px, scales it to 106% and brings it to full opacity.
- [ ] The other five drop to 22% opacity at the same time.
- [ ] Leaving the row returns all marks to 55%.
- [ ] Reduced motion: hover only changes opacity; entrance is a plain fade.
- [ ] Dark mode: black background, `#f5f5f7` marks, `#a1a1a6` line.
