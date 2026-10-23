# Swap Animation

Build a logo band with ten slots that pages through a longer list of brands. Every few seconds the next page slides through from the right, slot by slot: each outgoing lockup slides left and blurs out while the incoming one arrives from the right. Hover the grid and it holds still.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useInView`, `useReducedMotion`). A `cn()` class-merge helper is assumed.
- File: `components/blocks/logo-clouds/logo-cloud-swap.tsx`, default export `LogoCloudSwap`; also export `LogoCloudSwapProps`.
- Marks and helpers come from a sibling `logos.tsx` (spec below).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `logos` | `Logo[]` | the twenty placeholder brands | Brands to show. |
| `title` | `string` | `Chosen by teams who sweat the details` | Headline. |
| `subtitle` | `string` | `Each of these replaced three tools with one.` | Line under the headline; empty hides it. |
| `interval` | `number` | `3000` | Milliseconds between page swaps. |
| `stagger` | `number` | `0.05` | Seconds between one slot swapping and the next. |
| `className` | `string` | none | Merged onto the outer `<section>`. |

## Layout and look

- Section: full width, `px-4`, `py-16` (64px), `sm:py-24` (96px), white, dark `black`; `className` merges onto it.
- Header: `LogoHeading`.
- Grid: 48px below the header (`sm:` 56px), `max-w-4xl` (896px), centred, `grid-cols-2` (`sm:grid-cols-5`), column gap 16px, row gap 20px. Ten slots.
- Slot: `relative`, 56px tall, flex centred, ink colour, opacity 0.8 and 1 on hover. Lockup 17px (`sm:` 19px).

## Motion

- Each slot wraps its lockup in `AnimatePresence mode="popLayout" initial={false}`, keyed `${page}-${name}`.
- Enter from `opacity 0, x 40, blur(8px)` to rest; exit to `opacity 0, x −40, blur(8px)`. Both on `SPRING` with `delay = slotIndex × stagger`, so the page rolls left to right.
- Reduced motion: plain opacity changes, and the pager never runs.

## Interaction and states

- `usePager(logos, 10, interval, inView && !held && !reduced)`: with twenty brands there are two pages. `held` is true while the pointer is over the grid.
- `inView` is `useInView` on the grid with a −80px margin, so swapping pauses off screen.

## Shared helpers (also in `logos.tsx`)

- `SPRING = { type: "spring", stiffness: 340, damping: 30 }`; `INK = "text-[#1d1d1f] dark:text-[#f5f5f7]"`; `EDGE = "linear-gradient(to right, transparent, black 12%, black 88%, transparent)"` (a mask).
- `LogoHeading({ eyebrow?, eyebrowClassName?, title, subtitle? })`: a `max-w-2xl` centred block that rises once into view (`whileInView`, `viewport={{ once: true, margin: "-80px" }}`) from `opacity 0, y 16, blur(6px)` to rest on a spring (stiffness 240, damping 30); under reduced motion it only fades. The optional eyebrow is a 15px semibold `#6e6e73` / dark `#a1a1a6` line with 4px below it. The `h2` is 28px (`sm:` 40px), semibold, line-height 1.1, tracking −0.03em, `text-balance`, `#1d1d1f` / dark `#f5f5f7`. The subtitle is 12px below, 17px, line-height 1.47, `#6e6e73` / dark `#a1a1a6`.
- `usePager(logos, slots, ms, run)`: a page counter that ticks every `ms` while `run` is true and there is more than one page; returns `{ page, items }`, where `items[i] = logos[(page × slots + i) % logos.length]`, so a short last page wraps to the start.
- `Track({ items, speed, reverse, render, gap, active, pauseOnHover })`: a `flex w-max` row of the items twice over, translated by a motion value that a `requestAnimationFrame` loop moves by `speed × throttle × dt` px (dt capped at 64ms) and wraps at half the row width. `reverse` runs it rightwards (starting a quarter-width in). `throttle` is a spring (stiffness 120, damping 24) that eases to 0 while the pointer is over the row (if `pauseOnHover`) and back to 1 after. It does nothing while `active` is false or under reduced motion.

## Placeholder marks (`logos.tsx`)

Twenty invented brands, so a page built from the block never implies a real customer. Export `type Logo = { name: string; Icon: ComponentType<{ className?: string; style?: CSSProperties }>; color: string; wordmark?: string }`, the array `LOGOS: Logo[]`, and `LogoLockup({ logo, tinted = false, className })`.

`LogoLockup` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px: the glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, drawn in `currentColor`, with a 300ms colour transition and the brand `color` applied only when `tinted`), then the name with its wordmark classes. The wordmark stays ink, so a row of lockups reads as one quiet band. Strokes use round caps and joins.

| Name | Colour | Wordmark classes | Glyph |
|---|---|---|---|
| Arcwell | `#3b5bdb` | `font-semibold tracking-[-0.03em]` | `M4 18a8 8 0 0 1 16 0` (stroke 2.4); `M8.5 18a3.5 3.5 0 0 1 7 0` (stroke 2.4) |
| BASALT | `#868e96` | `text-[0.78em] font-semibold tracking-[0.22em]` | `M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z` (stroke 2); `M12 12v9.5M12 12l8.2-5M12 12 3.8 7` (stroke 1.6) |
| Corvid | `#7048e8` | `font-serif text-[1.08em] italic` | `M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z` (filled) |
| driftline | `#0c8599` | `font-medium tracking-[-0.02em]` | `M3 {y} c2.2-2 4.3-2 6.5 0 s4.3 2 6.5 0 3.7-1.6 5 0 (three waves, y = 7, 12, 17)` (stroke 2) |
| Emberly | `#e8590c` | `font-bold tracking-[-0.04em]` | `M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z` (filled) |
| fieldnote | `#2b8a3e` | `font-mono text-[0.9em] font-medium tracking-[-0.04em]` | `M4.5 3.5h10l5 5v12h-15Z` (stroke 2); `M8 13h8M8 16.5h5` (stroke 1.8) |
| Glasshouse | `#1971c2` | `font-light tracking-[0.02em]` | `M3.5 11 12 3.5l8.5 7.5v9.5h-17Z` (stroke 2); `M12 9v11.5M3.5 15h17` (stroke 1.6) |
| KESTREL | `#e03131` | `text-[0.86em] font-black tracking-[0.08em]` | `M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z` (filled) |
| Lumora | `#f08c00` | `font-serif text-[1.08em]` | circle (12, 12) r 9 (stroke 2); `M12 3a9 9 0 0 1 0 18Z` (filled) |
| Oakhaven | `#5c940d` | `font-semibold tracking-[-0.02em]` | `M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z` (filled, stroke 1.4) |
| Quill & Co | `#ae3ec9` | `font-serif text-[1.06em] italic` | `M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z` (filled); `M3.5 20.5h8` (stroke 2) |
| Tidewater | `#1c7ed6` | `font-medium tracking-[-0.01em]` | circle (12, 12) r 9 (stroke 2); `M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z` (filled) |
| MONOLITH | `#868e96` | `text-[0.82em] font-bold tracking-[0.18em]` | rect x 8 y 2.5 8×19 r 1.5 (filled); `M4 21.5h16` (stroke 2) |
| brightloop | `#f59f00` | `font-semibold tracking-[-0.04em]` | `M12 12c-2.2-3.2-6.5-3.2-6.5 0s4.3 3.2 6.5 0Zm0 0c2.2 3.2 6.5 3.2 6.5 0s-4.3-3.2-6.5 0Z` (stroke 2.2); circle (12, 4) r 1.6 (filled) |
| Sablewood | `#2f9e44` | `font-serif text-[1.06em]` | `M12 2.5 19 14H5Z` (filled); `M12 8.5 20.5 21h-17Z` (filled) at .55 opacity |
| VANTAGE | `#4263eb` | `text-[0.84em] font-extrabold tracking-[0.12em]` | `M3 4.5h5.5L12 13l3.5-8.5H21L13.5 20h-3Z` (filled) |
| Pinecrest | `#099268` | `font-medium tracking-[-0.02em]` | `M12 2.5 6 11h3.2L5 17.5h14L14.8 11H18Z` (filled); `M12 17.5v4` (stroke 2.2) |
| cobalt | `#1864ab` | `font-bold tracking-[-0.05em]` | circle (8, 8) r 4.5 (filled); circle (16, 16) r 4.5 (filled) at .55 opacity; circle (16, 8) r 2.4 (filled) |
| Ridgeway | `#d9480f` | `font-light tracking-[0.01em]` | `M2.5 19 9 8l3.5 5.5L15 10l6.5 9Z` (filled); circle (17.5, 5.5) r 2 (filled) |
| Halyard | `#0b7285` | `font-serif text-[1.06em] italic` | `M12 3v15.5M5 13.5c0 4 3.1 7 7 7s7-3 7-7M7.5 7.5h9` (stroke 2.2); circle (12, 3.5) r 1.8 (filled) |

## Accessibility

- `<section>`, `<h2>`; each lockup is `role="img"` with `aria-label={name}`; glyph SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Ten slots, five per row from `sm`, two per row on phones.
- [ ] Every 3s the page changes, 50ms apart per slot, left to right.
- [ ] Marks slide out to the left blurring and the next arrive from the right sharpening.
- [ ] Hovering the grid holds the page; leaving resumes it.
- [ ] Swapping pauses off screen; reduced motion turns it into fades.
- [ ] Dark mode: black background, `#f5f5f7` marks.
