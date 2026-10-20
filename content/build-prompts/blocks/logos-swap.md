# Swap Animation

Build a logo cloud with a fixed row of slots that pages through a longer list of marks. Every few seconds the next page rolls in slot by slot from left to right: the outgoing mark lifts up and blurs away while the incoming one rises from below on a spring. It should feel like a departures board that is quiet about it: tidy, rhythmic, never jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useInView`, `useReducedMotion`).
- File: `components/blocks/logo-clouds/logo-cloud-swap.tsx`, default export `LogoCloudSwap`; also export the `LogoEntry` and `LogoCloudSwapProps` types.
- The default marks come from a sibling `logos.tsx` exporting `LOGOS` and `LogoLockup` (spec below). A `cn()` class-merge helper is assumed.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `logos` | `LogoEntry[]` | twelve placeholder lockups | Marks to page through. `LogoEntry = { icon: ReactNode; name?: string; id?: string }`. |
| `title` | `string` | `"Chosen by teams who sweat the details"` | Headline. |
| `subtitle` | `string` | `"Each of these replaced three tools with one."` | Line under the headline; falsy hides it. |
| `interval` | `number` | `3200` | Milliseconds between page swaps. |
| `stagger` | `number` | `0.08` | Seconds between one slot swapping and the next. |
| `slots` | `number` | `6` | Marks on screen at once. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Default `logos`: `LOGOS` mapped to `{ icon: <LogoLockup logo={l} className="text-[17px] sm:text-[19px]" />, id: l.name }` (no `name`, so no caption).

## Layout and look

- Section: full width, `px-4`, `py-16` (64px), `sm:py-24` (96px), white, dark `black`.
- Header: `max-w-2xl` (672px), centred text.
  - `h2`: 28px, `sm:` 40px, semibold, line-height 1.1, tracking −0.03em, `text-balance`, `#1d1d1f` / dark `#f5f5f7`.
  - Subtitle: 12px top margin, 17px, line-height 1.47, `#6e6e73` / dark `#a1a1a6`.
- Slot grid: 48px top margin (`sm:` 56px), `max-w-5xl` (1024px), centred; `grid-cols-2`, `sm:grid-cols-3`, and `lg:grid-cols-6` only when the slot count is 6 or more; column gap 16px (`sm:` 32px), row gap 16px.
- Slot: `relative`, 64px tall, full cell width, flex centred, `overflow-hidden` (marks clip as they slide in and out), resting opacity 0.55, hover 1 with `transition-opacity 300ms ease-out`.
- Mark: vertical flex, items centred, 6px gap, `cursor-default`, ink `#1d1d1f` / dark `#f5f5f7`. Icon wrapper 32px tall and min-width, centred. Optional caption when `name` is set: 12px, medium, nowrap, `select-none`.

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

- Header entrance: one `motion.div` from `opacity 0, y 16, blur(6px)` to `opacity 1, y 0, blur(0px)` via `whileInView`, `viewport={{ once: true, margin: "-80px" }}`, spring stiffness 240, damping 30. Reduced motion: from `opacity 0` only. Slots have no entrance; they are simply there.
- Swap: each slot wraps its mark in `AnimatePresence mode="popLayout" initial={false}`, keyed `${page}-${id ?? name ?? ""}`, so every page change re-mounts every slot's mark.
  - Enter from `opacity 0, y "100%", blur(6px)` to `opacity 1, y 0, blur(0px)`.
  - Exit to `opacity 0, y "−100%", blur(6px)`.
  - Both on a spring (stiffness 400, damping 32) with `delay = slotIndex × stagger`, so the page rolls left to right.
- Reduced motion: enter from and exit to `opacity 0` only (same spring and delays).

## Interaction and states

- `slotCount = max(1, min(slots, logos.length))`; `pages = max(1, ceil(logos.length / slotCount))`.
- A `page` counter increments every `interval` ms via `setInterval`, only while the slot grid is in view (`useInView` on the grid, margin −80px, not once) and `pages ≥ 2`. Clear on cleanup; changing `interval` restarts it.
- `pageIndex = page % pages`. Slot `i` shows `logos[(pageIndex × slotCount + i) % logos.length]`, so a short last page wraps around to the start rather than leaving gaps.
- Hovering a slot raises it to full opacity. No click behaviour.

## Demo data

Defaults: twelve placeholder lockups in six slots, so two pages (Arcwell to fieldnote, then Glasshouse to Tidewater), swapping every 3.2s with an 80ms stagger.

## Accessibility

- `<section>` and `<h2>`. When an entry has `name`, the mark gets `role="img"` and `aria-label={name}`; default lockups expose their name as text and their SVG is `aria-hidden`.
- Reduced motion keeps the paging but makes it a cross-fade.

## Acceptance checklist

- [ ] Six 64px-tall slots in one row on desktop (`lg`), three columns on tablet, two on phones, at 55% opacity.
- [ ] Headline 28px/40px with a grey 17px subtitle; an empty subtitle renders nothing.
- [ ] Every 3.2s the slots change page one after another, 80ms apart, left to right.
- [ ] Outgoing marks slide up out of the slot and blur; incoming ones rise from below and sharpen, clipped by the slot.
- [ ] `slots={4}` shows four slots, three pages, and no 6-column layout.
- [ ] `slots={5}` with twelve logos fills the last page by wrapping to the first marks.
- [ ] A single page (`slots ≥ logos.length`) never swaps.
- [ ] Swapping pauses while the grid is off screen.
- [ ] Reduced motion turns swaps into fades and the header entrance into a plain fade.
- [ ] Dark mode: black background, `#f5f5f7` marks and headline, `#a1a1a6` subtitle.
