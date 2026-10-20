# Scroll-read Manifesto

Build a manifesto paragraph that reads itself as you scroll: the section pins in place while each word, in order, sharpens from faint grey and blurred to solid ink, with a few key words landing in the accent colour and a thin progress bar filling underneath. Where it cannot be scrolled through (a clipped preview, a page too short to scroll) it lays out flat and reads itself once on a timer. It should feel like reading along with someone, slow and steady, ending fully legible.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `animate`, `useInView`, `useMotionValue`, `useTransform`, `useReducedMotion`, `MotionValue`).
- File: `components/blocks/motion-kit/scroll-read-manifesto/scroll-read-manifesto.tsx`, named export `ScrollReadManifesto`; also export `ScrollReadManifestoProps` (re-export from an `index.ts`).
- A `cn()` class-merging helper (clsx + tailwind-merge).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `eyebrow` | `string` | `"What we believe"` | Small line above the paragraph. |
| `text` | `string` | the manifesto below | Split on whitespace into words. |
| `hot` | `string[]` | `["calm.", "never", "honest"]` | Words matched exactly (punctuation included) that land in the accent colour. |
| `accent` | `string` | — | Any CSS colour. Unset: `#0071e3`, `#2997ff` in dark mode. |
| `autoplay` | `boolean` | `false` | Skip pinning; read once on a timer when in view and stay fully read. |
| `className` | `string` | — | Merged onto the section. |

## Layout and look

- Section: relative, full width, bg `#fbfbfd` / dark `black`. Accent in a CSS variable `--sr-accent`: inline from `accent`, else `[--sr-accent:#0071e3] dark:[--sr-accent:#2997ff]`.
- Two layouts:
  - **pin** (scroll-driven): the section is `220vh` tall; its child is `position: sticky; top: 0`, `h-screen`, `max-height: 900px`, flex, vertically centred.
  - **flat** (timed or reduced motion): normal height with padding 80px vertical (`sm` 112px); the child is a plain flex row.
- Child padding 20px horizontal; inner column centred, `max-w-[1000px]`.
- Eyebrow: 14px, semibold, `var(--sr-accent)`.
- Paragraph: 24px below, `font-size: clamp(28px, 4.6vw, 58px)`, semibold, line-height 1.12, letter-spacing -0.035em, `#1d1d1f` / dark `#f5f5f7`. Each word is an inline-block span with `margin-right: 0.24em`; hot words use `var(--sr-accent)`.
- Progress bar: 40px below, 3px tall, 160px wide, rounded, track `rgba(0,0,0,.08)` / dark `rgba(255,255,255,.14)`; fill full height, rounded, accent, `transform-origin: left`, `scaleX` bound to progress.

## Motion

- One motion value `p` from 0 to 1 drives everything.
- Word `i` of `n` maps over `[i/n, (i+1)/n]`: opacity `0.14 → 1`, `y 6 → 0` (px), filter `blur(3px) → blur(0px)` via `useTransform`. Words therefore sharpen strictly in sequence.
- The bar's `scaleX` is `p` directly.
- Scroll-driven (`pin`): find the sticky container (nearest ancestor below `body` with `overflow` auto, scroll or hidden on either axis). Use it as the scroller if it scrolls, else the window. On scroll (window listener with `capture: true`, passive, so ancestor scrolls are caught) and resize, throttle to one `requestAnimationFrame`:
  - `range = sectionHeight - viewportHeight`; `raw = range > 0 ? (viewportTop - sectionTop) / range : 1`.
  - `p = clamp((raw - 0.05) / 0.8, 0, 1)`, so reading starts slightly after pinning and finishes before release.
- Timed (autoplay or fallback): once 40% in view (`useInView(ref, { once: true, amount: 0.4 })`), `animate(p, [0, 1])` with duration `min(5, max(2.4, words * 0.11))` seconds, linear, delay 0.2s. Stop it on cleanup.

## Interaction and states

- Fallback to the flat timed read when: the sticky container clips without scrolling (pinning cannot work there), or nothing can scroll (`scrollHeight <= clientHeight + 1`).
- `autoplay` requests the flat timed read up front, which is right for previews and galleries.
- Reduced motion: set `p` to 1, use the flat layout, render words as plain spans (hot words still accented), and fill the bar fully.
- Remove listeners and cancel frames on cleanup.

## Autoplay demo

Preview with `autoplay`: as the section comes into view the words sharpen in order over about 3.5 seconds (32 words × 0.11s), the bar fills in step, and the paragraph stays fully legible afterwards.

Default text: "We think software should feel calm. Fast enough that you never wait, quiet enough that you never notice it, and honest enough that you always know what it's doing with your work."

## Accessibility

- The paragraph is real text in a single `p`; the faint words are still present for screen readers, which read the whole paragraph normally.
- The progress bar is decorative and `aria-hidden`.
- The final state is always fully legible: the timed read ends at 1 and stays there.
- Respect `prefers-reduced-motion` through `useReducedMotion`; under reduced motion nothing animates or pins.

## Acceptance checklist

- [ ] On a scrolling page the section pins and words sharpen from faint to ink in order as you scroll.
- [ ] Words also rise 6px and unblur 3px as they read.
- [ ] Hot words land in the accent colour.
- [ ] The progress bar fills in step with the reading and reaches the end before the section unpins.
- [ ] Inside a clipped, non-scrolling box it lays out flat and reads itself once.
- [ ] `autoplay` reads once on a timer with no pinning and ends fully read.
- [ ] `accent` recolours the eyebrow, hot words and bar.
- [ ] Scrolling inside a scrollable ancestor (not just the window) also drives the reading.
- [ ] Changing `text` re-splits the words; each word keeps its own slice of the progress.
- [ ] Reduced motion shows the full paragraph legible and static.
