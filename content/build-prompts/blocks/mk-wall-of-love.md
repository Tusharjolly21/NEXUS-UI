# Wall of Love

Build a testimonials wall: quote cards in columns that scroll endlessly, neighbouring columns at different speeds and in opposite directions, with soft fades at the top and bottom. Hover a column (or tap it on touch screens) and it eases to a stop so it can be read; a pause button stops the whole wall. It should feel abundant and calm, never frantic.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries: `@container`, `@2xl:`, `@5xl:`), framer-motion (`motion`, `useAnimationFrame`, `useMotionValue`, `useSpring`, `useReducedMotion`), and a `cn` helper.
- File: `components/wall-of-love/wall-of-love.tsx`, named exports `WallOfLove` and `DEFAULT_WALL_OF_LOVE_QUOTES`, types `WallOfLoveProps` and `WallOfLoveQuote = { text; name; role; color }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `quotes` | `WallOfLoveQuote[]` | 9 demo quotes | Testimonials; `color` tints the initials avatar. |
| `eyebrow` | `string` | `"Wall of love"` | Accent line above the heading. |
| `title` | `string` | `"Teams switch, then tell their friends."` | Heading. |
| `accent` | `string` | — | Eyebrow and focus ring. Unset: `#0071e3`, `#2997ff` in dark. |
| `autoplay` | `boolean` | `true` | Scrolls the columns; `false` starts paused with a Play button. |
| `className` | `string` | — | Extra classes on the section. |

Demo quotes (invented; mark them as placeholders to replace with real, attributed quotes):
1. "We replaced three tools and a weekly spreadsheet ritual. Monday mornings are quiet now." — Avery Lin, COO, logistics startup, `#ff9f0a`
2. "The live charts are the first dashboard our sales team actually opens." — Jordan Reyes, Head of Sales, B2B software, `#0a84ff`
3. "Setup took one afternoon. I kept waiting for the catch." — Sam Okafor, Founder, design studio, `#30d158`
4. "Our board deck builds itself now. I just add the commentary." — Priya Shah, CFO, retail group, `#bf5af2`
5. "Permissions that follow the org chart saved our IT team weeks." — Noah Berg, IT Lead, 400-person company, `#ff375f`
6. "Support replied in four minutes on a Sunday. Four." — Lena Fischer, Ops Manager, marketplace, `#5e5ce6`
7. "It's the only tool everyone on the team agreed on in the first week." — Marco Silva, Engineering Manager, fintech, `#30b0c7`
8. "The weekly summary email is genuinely the best email I get." — Hana Mori, CEO, travel app, `#ff6b4a`
9. "We spotted a churn spike two weeks earlier than we would have." — Theo Grant, Head of CS, subscription box, `#0b8f6a`

## Layout and look

- Section: `@container`, full width, bg `#f5f5f7` / black, padding 16px sides (20px `sm`), 64px vertical (80px `sm`). `--mk-accent-text` `#0071e3` / dark `#2997ff`; `accent` overrides it inline.
- Inner max-width 1120px. Header: centred column, gap 12px, margin-bottom 40px (48px `sm`). Eyebrow 14px semibold accent. `<h2>` max-width 700px, `clamp(32px, 5vw, 54px)`, semibold, line-height 1.04, tracking −0.04em, balanced, `#1d1d1f` / `#f5f5f7`.
- Wall: grid, gap 16px, height 560px; from `@2xl` 640px tall and 2 columns; from `@5xl` 3 columns. Mask `linear-gradient(transparent, #000 12%, #000 88%, transparent)` (with `-webkit-` prefix).
- Columns by width (render all, hide with container classes):
  - Narrow: 1 column with all quotes, speed 34.
  - `@2xl` to `@5xl`: 2 columns — even-indexed quotes at speed 34, odd-indexed at −26.
  - `@5xl`+: 3 columns — `i % 3 === 0` at 34, `=== 1` at −26, `=== 2` at 40.
  (Speed in px per second; positive moves up, negative moves down.)
- Quote card (`<figure>`): margin-bottom 16px, column with 20px gap, radius 24px, padding 20px (24px `sm`), white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 18px 36px -28px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)`, `.9`).
  - Five 14px stars, `#ff9f0a`, 2px gap.
  - `<blockquote>` 16px, line-height 1.5, tracking −0.01em, `#1d1d1f` / `#f5f5f7`.
  - `<figcaption>`: 36px circle avatar with up to two uppercase initials, 12px semibold white, background `linear-gradient(140deg, color, color-mix(in srgb, color 66%, transparent))`; name 14px semibold; role 12px `#6e6e73` / `#a1a1a6`.
- Pause button (24px below, centred): 40px tall pill, padding 0 16px, 8px gap, 13px medium, white / `#1c1c1e`, ring `rgba(0,0,0,.06)` / `rgba(255,255,255,.1)`, hover `#fafafa` / `#2c2c2e`. 12px icon: pause bars or a play triangle. Text "Pause wall" / "Play wall".

## Motion

- Each column renders its quotes twice (the second copy `aria-hidden`) inside a track translated on Y by a motion value.
- `useAnimationFrame`: `half = track.scrollHeight / 2`; `next = y − speed × rate × min(delta, 64) / 1000`; wrap with `if (next <= −half) next += half; if (next > 0) next −= half`. Skip when `half` is 0 or `rate < 0.001`.
- `rate` is a `useSpring` (stiffness 60, damping 18) between 0 and 1, so stopping and starting ease rather than cut.
- No other animation; keep it render-free (motion values only).

## Interaction and states

- Mouse enter on a column sets rate 0 for that column; leave sets it back to 1 unless the column is stopped.
- Touch: `pointerup` with a non-mouse pointer toggles a per-column `held` flag (tap to stop, tap to resume).
- Global pause: `userPaused` starts `null`; effective `paused = userPaused ?? !autoplay`. The button toggles it. A column is stopped when `paused || held`.
- Reduced motion: columns don't animate; each becomes a vertically scrollable list (`overflow-y: auto`, `overscroll-behavior: contain`, hidden scrollbar, 12% vertical padding) without the duplicate copy, and the pause button is not rendered.
- Keys: `${i}-${name}` and `copy-${i}-${name}`.

## Autoplay demo

With `autoplay` (default) the wall scrolls immediately: on wide containers the middle column runs down while the outer ones run up at slightly different speeds. With `autoplay={false}` it starts still and shows "Play wall".

## Accessibility

- Cards are `<figure>/<blockquote>/<figcaption>`. Stars are a `role="img"` group labelled "Rated 5 out of 5"; avatar initials are `aria-hidden`.
- Duplicate copies are `aria-hidden` so each quote is read once.
- The pause button uses `aria-pressed` and shows a 2px accent focus ring; it satisfies "pause moving content".
- Reduced motion swaps the marquee for manual scrolling.

## Acceptance checklist

- [ ] 1 column on phones, 2 from ~672px, 3 from ~1024px container width.
- [ ] Columns loop seamlessly with no jump at the wrap point.
- [ ] Neighbouring columns move in opposite directions at different speeds.
- [ ] Top and bottom edges fade out.
- [ ] Hovering a column eases it to a stop; leaving eases it back.
- [ ] Tapping a column on touch toggles it.
- [ ] "Pause wall" stops everything and becomes "Play wall".
- [ ] `autoplay={false}` starts paused.
- [ ] Initials are derived from up to two words of the name.
- [ ] Reduced motion: static, manually scrollable columns and no pause button.
