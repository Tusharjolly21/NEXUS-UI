# Blur Flip Grid

Build a "used by" logo section: a centred headline and subtitle over a quiet grid of monochrome brand lockups. Every few seconds each mark rolls over in place, one after another left to right: the face tips back and blurs away while a fresh copy springs up from below. It should feel calm and mechanical, like a split-flap board made of glass. Only transforms, opacity and filter animate, so nothing around the grid shifts.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useInView`, `useReducedMotion`, `Variants`).
- File: `components/blocks/logo-clouds/logos-blur-flip.tsx`, default export `LogosBlurFlip`; also export the `LogoEntry` and `LogosBlurFlipProps` types.
- The placeholder marks live in a sibling `logos.tsx` that exports `LOGOS` and a `LogoLockup` component (spec below). A `cn()` class-merge helper (clsx + tailwind-merge) is assumed.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `logos` | `LogoEntry[]` | twelve placeholder lockups | Marks in the grid. `LogoEntry = { icon: ReactNode; name?: string; id?: string }`. |
| `title` | `string` | `"Used by teams that ship every week"` | Headline. |
| `subtitle` | `string` | `"From two-person studios to platform teams of four hundred."` | Line under the headline; falsy hides it. |
| `interval` | `number` | `2600` | Milliseconds between flips. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

Default `logos`: every entry of `LOGOS` mapped to `{ icon: <LogoLockup logo={l} className="text-[17px] sm:text-[19px]" />, id: l.name }` (no `name`, so no caption under the default marks).

## Layout and look

- Section: full width, `px-4`, `py-16` (64px), `sm:py-24` (96px). Background white, dark `black`.
- Header block: `max-w-2xl` (672px), centred, text centred.
  - `h2`: 28px, `sm:` 40px, semibold, line-height 1.1, tracking −0.03em, `text-balance`, colour `#1d1d1f` / dark `#f5f5f7`.
  - Subtitle: 12px top margin, 17px, line-height 1.47, `#6e6e73` / dark `#a1a1a6`.
- Grid (`<ul>`): 48px top margin (`sm:` 56px), `max-w-5xl` (1024px), centred. `grid-cols-2`, `sm:grid-cols-3`, `lg:grid-cols-6`, `place-items-center`, column gap 16px (`sm:` 40px), row gap 16px. Twelve marks = 6×2 on desktop, 4×3 on tablet, 2×6 on phones.
- Item (`<li>`): full cell width. Inside, a 64px-tall relative flex box, centred, ink colour `#1d1d1f` / dark `#f5f5f7`, resting opacity 0.55, `transition-opacity 300ms ease-out`, hover opacity 1, and `perspective: 700px` so the rotateX reads as 3D.
- Face: a `motion.span`, vertical flex, items centred, 6px gap, `transform-origin: center`. It holds an icon wrapper (36px tall and min-width, `sm:` 40px, centred) and, only when `name` is set, a caption: 12px, medium, `whitespace-nowrap`, `select-none`.

## Placeholder marks (`logos.tsx`)

Twelve invented brands, so the section never implies a real company is a customer. `LogoLockup({ logo, tinted = false, className })` renders an `inline-flex items-center gap-2 whitespace-nowrap leading-none` span, base 17px, with the glyph (24×24 viewBox SVG, `fill="none"`, `aria-hidden`, `size-[1.35em] shrink-0`, drawn in `currentColor`) then the name in a span carrying the wordmark classes. Each brand also carries an accent colour, unused here.

| Name | Wordmark classes | Glyph (strokes use `currentColor`) |
|---|---|---|
| Arcwell | `font-semibold tracking-[-0.03em]` | `M4 18a8 8 0 0 1 16 0` and `M8.5 18a3.5 3.5 0 0 1 7 0`, stroke 2.4, round caps |
| Basalt | `text-[0.78em] font-semibold uppercase tracking-[0.22em]` | `M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z` stroke 2 round join; `M12 12v9.5M12 12l8.2-5M12 12 3.8 7` stroke 1.6 |
| Corvid | `font-serif text-[1.08em] italic tracking-[-0.01em]` | filled `M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z` |
| driftline | `font-medium tracking-[-0.02em]` | for y in 7, 12, 17: `M3 {y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`, stroke 2, round caps |
| Emberly | `font-bold tracking-[-0.04em]` | filled `M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z` |
| fieldnote | `font-mono text-[0.9em] font-medium tracking-[-0.04em]` | `M4.5 3.5h10l5 5v12h-15Z` stroke 2 round join; `M14.5 3.5v5h5` stroke 1.6; `M8 13h8M8 16.5h5` stroke 1.8 round caps |
| Glasshouse | `font-light tracking-[0.02em]` | `M3.5 11 12 3.5l8.5 7.5v9.5h-17Z` stroke 2 round join; `M12 9v11.5M3.5 15h17` stroke 1.6 |
| KESTREL | `text-[0.86em] font-black tracking-[0.08em]` | filled `M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z` |
| Lumora | `font-serif text-[1.08em] tracking-[-0.01em]` | circle r 9 at 12,12 stroke 2; filled `M12 3a9 9 0 0 1 0 18Z` |
| Oakhaven | `font-semibold tracking-[-0.02em]` | `M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z` filled + stroke 1.4 round join |
| Quill & Co | `font-serif text-[1.06em] italic` | filled `M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z`; `M3.5 20.5h8` stroke 2 round cap |
| Tidewater | `font-medium tracking-[-0.01em]` | circle r 9 stroke 2; filled `M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z` |

## Motion

- Entrance: the content wrapper uses `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-80px" }}` and staggers children by 0.04s. Headline, subtitle and each `<li>` use the shared "rise" variant: hidden `opacity 0, y 16, blur(6px)` → visible `opacity 1, y 0, blur(0px)` on a spring (stiffness 240, damping 30).
- Flip cycle: a `cycle` counter increments on `setInterval(interval)`. The face is keyed by `cycle` inside `AnimatePresence mode="popLayout" initial={false}`, so the old face exits while the new one enters in the same spot.
  - Enter: from `opacity 0, rotateX 80, y "45%", blur(8px)` to `opacity 1, rotateX 0, y 0, blur(0px)`.
  - Exit: to `opacity 0, rotateX −80, y "−45%", blur(8px)`.
  - Both use a spring (stiffness 300, damping 26) delayed by `index × 0.05s`, which gives the left-to-right roll.
- The `<li>` owns the entrance; the inner box owns resting opacity and hover, so the two animations never fight.

## Interaction and states

- The flip timer runs only while the grid is in view (`useInView` on the `<ul>`, margin −80px, not once) and reduced motion is off. Clear the interval on cleanup; changing `interval` restarts it.
- Hovering a cell raises it from 0.55 to full opacity (CSS transition). No click behaviour.
- With `prefers-reduced-motion`: the rise variant becomes opacity-only (0.4s), the flip never runs, and the face transitions are opacity-only (exit 0.2s).

## Demo data

Defaults only: the headline, subtitle and twelve placeholder lockups above, flipping every 2600ms.

## Accessibility

- Semantic `<section>`, `<h2>`, `<ul>`/`<li>`.
- When a `LogoEntry` has a `name`, its `<li>` gets `role="img"` and `aria-label={name}`. The default lockups render their name as text, so they read without a label; glyph SVGs are `aria-hidden`.
- Flips swap identical content, so nothing new is announced; reduced motion stops them entirely.

## Acceptance checklist

- [ ] Twelve marks sit in 6 columns on desktop, 3 on tablet, 2 on phones, each in a 64px-tall cell at 55% opacity.
- [ ] Headline is 28px on phones and 40px from `sm`, with a grey 17px subtitle; an empty subtitle renders nothing.
- [ ] Scrolling the section in fades and un-blurs headline, subtitle and marks in a short stagger, once.
- [ ] Every 2.6s each mark tips back and blurs out while a copy springs up from below, 50ms after its neighbour.
- [ ] The surrounding layout never moves during a flip.
- [ ] Hovering a mark brings it to full opacity.
- [ ] Scrolling the grid out of view pauses flipping; scrolling back resumes it.
- [ ] Passing `interval={5000}` slows the cycle; passing custom `logos` with `name` shows a 12px caption under each icon.
- [ ] With reduced motion on, nothing flips and the entrance is a plain fade.
- [ ] Dark mode: black background, `#f5f5f7` ink, `#a1a1a6` subtitle.
