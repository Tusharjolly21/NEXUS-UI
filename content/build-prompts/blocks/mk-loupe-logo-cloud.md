# Loupe Logo Cloud

Build a logo strip with a magnifying glass: a row of wordmarks drifts sideways in soft, slightly blurred grey, and a round glass lens follows the pointer, showing the logos inside it magnified 1.35× and in full brand colour. When the mouse leaves, the lens springs back to the middle. It should feel tactile and precise, like sliding a loupe over a printed sheet; the lens is the cursor.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (uses container queries: `@container`, `@2xl:` and `cqi` units), framer-motion (`motion`, `useAnimationFrame`, `useInView`, `useMotionTemplate`, `useMotionValue`, `useReducedMotion`, `useSpring`).
- File: `components/blocks/motion-kit/loupe-logo-cloud/loupe-logo-cloud.tsx`, named export `LoupeLogoCloud`, plus exported `LoupeLogoCloudProps` and `LoupeLogoCloudBrand` types; an `index.ts` beside it re-exports all three. A `cn()` class-merge helper is assumed.
- All movement runs on motion values (drift offset and lens x), so the component never re-renders while animating.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brands` | `LoupeLogoCloudBrand[]` | eight sample brands | Wordmarks in the strip. |
| `title` | `string` | `"Used by teams that ship every week"` | Headline. |
| `subtitle` | `string` | `"From two-person studios to platform teams of four hundred."` | Line under the headline; falsy hides it. |
| `autoplay` | `boolean` | `true` | Drifts the row sideways on a loop. |
| `className` | `string` | — | Merged onto the outer `<section>`. |

`LoupeLogoCloudBrand = { name: string; cls: string /* Tailwind type classes for the wordmark */; color: string /* colour inside the lens */; colorDark?: string /* lens colour in dark mode, defaults to color */; mark?: string /* optional SVG path in a 24×24 box, drawn before the name */ }`.

## Layout and look

- Section: `@container`, full width, white (dark `black`), 20px side padding, `py-16` (64px), `@2xl:py-20` (80px) once the container is at least 42rem wide.
- Inner: `max-w-[1080px]`, centred, text centred.
  - `h2`: no margin, `font-size: clamp(22px, 3.4cqi, 32px)`, semibold, tracking −0.03em, `#1d1d1f` / dark `#f5f5f7`.
  - Subtitle: 8px top margin, `clamp(15px, 1.8cqi, 16px)`, `#6e6e73` / dark `#a1a1a6`.
- Stage: 32px top margin (`@2xl:` 40px), `relative`, 150px tall, radius 16px, `cursor: none`, `touch-action: pan-y`, no outline; `focus-visible` ring 2px `#0071e3` (dark `#0a84ff`).
- Inside the stage, one `absolute inset-0 overflow-hidden` wrapper with `mask-image` / `-webkit-mask-image` = `linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)`, holding three layers:
  1. Grey row: `absolute inset-0 flex items-center`, `filter: blur(.6px)`; a `flex w-max` motion div (the measured row) translated by the drift `x`, containing the grey `Row`.
  2. Lens content: `absolute inset-0 flex items-center`, `clip-path` (and `-webkit-clip-path`) `circle(70px at {lensX}px 50%)`. Inside, a full-size flex layer with `scale: 1.35` and `transform-origin: {lensX}px 50%`, then a `flex w-max` motion div with the same drift `x`, containing the coloured `Row`. Because the origin tracks the lens, magnification is centred on it.
  3. Glass: `pointer-events-none absolute top-1/2`, `left: lensX`, 140×140, fully round, translated −50%/−50%. Background `radial-gradient(circle at 30% 25%, rgba(255,255,255,.35), transparent 45%)`; shadow `inset 0 0 0 1.5px rgba(255,255,255,.9), inset 0 0 0 3px rgba(0,0,0,.06), inset 0 10px 20px rgba(255,255,255,.6), 0 18px 40px -16px rgba(0,0,0,.35)`. Dark: highlight `rgba(255,255,255,.12)`; shadow `inset 0 0 0 1.5px rgba(255,255,255,.28), inset 0 0 0 3px rgba(0,0,0,.5), inset 0 10px 20px rgba(255,255,255,.08), 0 18px 40px -16px rgba(0,0,0,.95)`.
- `Row`: `flex flex-none items-center`, renders the brand list twice. Each item: side margin 28px (`@2xl:` 36px), flex, items centred, 8px gap, nowrap, 22px (`@2xl:` 26px), plus the brand's `cls`.
  - Grey row colour `#a1a1a6`, dark `#636366`.
  - Coloured row: set CSS variables `--mk-c: color` and `--mk-cd: colorDark ?? color` inline, and use `text-[var(--mk-c)] dark:text-[var(--mk-cd)]`.
  - Mark: 0.92em square SVG, viewBox 24, `fill="currentColor"`, `aria-hidden`, one path.

## Motion

- Drift: in `useAnimationFrame((_, dt) => …)`, when `autoplay` is on, reduced motion is off and the stage is in view (`useInView`): `x -= 28 × min(dt, 64) / 1000` (28px per second, frame delta capped at 64ms so a background tab doesn't jump). Measure `w = row.scrollWidth / 2` (one copy of the list); when `x ≤ −w`, add `w`, which loops seamlessly because the row is doubled.
- Lens: `lensX = useSpring(0, { stiffness: 260, damping: 26 })`. A `centred` ref (starts true) and a `placed` ref (starts false). In the same frame loop, while centred: target is `stage.offsetWidth / 2`; on the very first frame `jump()` there (no sweep on load); afterwards `set()` it whenever it differs by more than 0.5px, which also re-centres after resizes.
- Both the clip circle and the transform origin are `useMotionTemplate` strings of `lensX`.

## Interaction and states

- `onPointerMove` and `onPointerDown` on the stage: `centred = false`, `lensX.set(clamp(clientX − rect.left, 0, rect.width))`. Tap or drag works on touch; vertical scrolling still works thanks to `touch-action: pan-y`.
- `onPointerLeave`: only for `pointerType === "mouse"`, set `centred = true` so the lens springs back to the middle. On touch the lens stays where it was left.
- Keyboard (stage has `tabIndex={0}`): ArrowLeft/ArrowRight move 48px (120px with Shift), clamped to `[35, width − 35]`; Home jumps to 70, End to `width − 70`; Escape re-centres. Prevent default on arrows, Home and End.
- `autoplay={false}` or reduced motion: the row stays still; the lens still works.

## Autoplay demo

On by default: the strip drifts left at 28px/s, pausing whenever it is scrolled out of view. Default brands, in order:

| Name | `cls` | color | colorDark | mark |
|---|---|---|---|---|
| Northwind | `font-serif italic` | `#0b8f6a` | `#30d158` | `M4 20L12 4l8 16z` |
| LUMEN | `tracking-[0.3em] font-semibold` | `#0071e3` | `#2997ff` | — |
| parcel | `font-bold lowercase tracking-[-0.04em]` | `#ff6b4a` | — | `M4 8l8-4 8 4v8l-8 4-8-4z` |
| Orbit | `font-medium` | `#5e5ce6` | `#7d7aff` | `M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z` |
| HALCYON | `font-black tracking-tight` | `#1d1d1f` | `#f5f5f7` | — |
| fieldnote | `font-serif` | `#c2410c` | `#ff9f0a` | — |
| Quanta | `font-semibold italic` | `#bf5af2` | — | `M5 5h14v14H5z` |
| Kettle | `font-bold tracking-[-0.03em]` | `#ff375f` | — | `M6 10h12v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 6h6` |

## Accessibility

- The stage is `role="group"` with `aria-label="Customer logos. Use the left and right arrow keys to move the magnifier."` and a visible focus ring.
- All three visual layers are `aria-hidden`; after the stage, a `sr-only` span lists the brand names joined with ", ", so each is read once.
- Reduced motion stops the drift; the lens only moves in response to the user.

## Acceptance checklist

- [ ] A 150px stage shows a grey, slightly blurred row of wordmarks fading out at both edges.
- [ ] With autoplay the row drifts left at about 28px/s with no visible seam when it loops.
- [ ] A 140px glass lens sits centred on load, without sliding in.
- [ ] Inside the lens the same logos appear 1.35× larger and in brand colour, staying aligned with the drifting row.
- [ ] Moving the mouse moves the lens on a spring; the system cursor is hidden over the stage.
- [ ] Leaving with the mouse springs the lens back to centre; on touch it stays put.
- [ ] Arrow keys move the lens 48px (120px with Shift), Home/End jump near the edges, Escape re-centres.
- [ ] Narrow containers use 22px wordmarks; from 42rem container width they grow to 26px with wider spacing.
- [ ] Dark mode: black background, `#636366` grey row, dark brand colours in the lens, darker glass shadow.
- [ ] Screen readers hear the brand list once; reduced motion or `autoplay={false}` stops the drift.
