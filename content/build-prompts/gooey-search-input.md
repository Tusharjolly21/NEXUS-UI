Build a gooey search input. At rest it is a solid dark pill reading "Search" with a magnifier. Click it and the shapes behave like liquid: the pill stretches wider with a springy overshoot while the magnifier swells, necks and pinches off to the left as its own round bubble, all melted together by an SVG goo filter. Type, and up to four matching suggestions drip out of the underside of the field through the same goo, with the matched letters in bold and a highlight that slides between rows. Escape or blurring an empty field pours it back into the pill.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion (`motion`, `useReducedMotion`, `useSpring`, `useTransform`).
- File: `components/gooey-input/gooey-input.tsx`, named export `GooeyInput`, type `GooeyInputProps`.
- The goo comes from an inline zero-size SVG filter (unique id from `useId`, colons stripped): `feGaussianBlur stdDeviation={gooeyBlur}` → `feColorMatrix` with values `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10` → `feComposite in="SourceGraphic" operator="atop"`; filter region x/y −50%, 200% size, `color-interpolation-filters="sRGB"`. Only the solid shapes go through the filter; text and icons sit in a separate crisp layer driven by the same motion values.

## API

`GooeyInputProps` extends the native input props (minus `size`, `value`, `defaultValue`, `width`, `onSelect`), which are spread onto the input:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `placeholder` | `string` | `"Type to search..."` | Open field placeholder. |
| `collapsedLabel` | `string` | `"Search"` | Pill label. |
| `collapsedWidth` | `number` | `115` | Pill width px. |
| `expandedWidth` | `number` | `200` | Open field width px. |
| `expandedOffset` | `number` | `56` | Room left of the field for the bubble px. |
| `gooeyBlur` | `number` | `5` | Goo blur. |
| `value` / `defaultValue` | `string` | — / `""` | Controlled / initial value. |
| `onValueChange` | `(value: string) => void` | — | Text changes (and `""` on close). |
| `onOpenChange` | `(open: boolean) => void` | — | Open/close. |
| `suggestions` | `string[]` | — | Case-insensitive substring matches, first 4 shown. |
| `onSelect` | `(value: string) => void` | — | Suggestion picked by click or Enter. |
| `autoplay` | `boolean` | `false` | Opens, types "motion", moves the highlight and closes on a loop until touched. |
| `disabled` | `boolean` | `false` | 50% opacity, ignores input. |
| `className`, `id`, `onChange`, `onKeyDown`, `onBlur`, `onFocus` | — | — | Passed through / chained. |

## Layout and look

- Root: flex, centred, plus `className`. Stage: `W = expandedOffset + expandedWidth` wide, 44px tall (`H`), relative.
- Colours: shapes `#1d1d1f` (dark `#f5f5f7`); content white (dark `#1d1d1f`). The goo layer also gets `drop-shadow(0 10px 14px rgba(0,0,0,.22))` (dark `.6`), applied after the goo filter in the same `filter` string.
- Goo shapes (absolute, pointer-events none, `aria-hidden`):
  1. Pill: top 0, height 44, fully round, `left = pillLeft`, `width = pillWidth`.
  2. Bubble: 44×44 circle at left 0, translated by `bubbleX`, scaled by `bubbleScale`.
  3. Panel: radius 20, same left/width as the pill, top `44 + 8`, height `panelHeight`, y `panelY`.
- Content: a 44px bubble icon layer riding `bubbleX`/`bubbleScale` with the 17px magnifier (circle r 7 at 11,11 and handle `m20 20-3.6-3.6`, stroke 2.2); the pill area holds, when closed, a full-size button (15px semibold, tracking −0.01em, magnifier + label, gap 8), and always the input (`type="search"`, padding 16px sides, 15px, placeholder white/55 (dark `#1d1d1f`/50), cancel button hidden, transparent, no border).
- Suggestions list (`role="listbox"`): same left/width/top as the panel, height `panelHeight`, overflow hidden, 6px vertical padding. Rows 36px tall, 6px side margin, padding 10px, radius 14, gap 10, 14px text white/70 (dark `#1d1d1f`/70) with a 13px magnifier at 60% opacity; the matched slice in semibold full white (dark `#1d1d1f`). Active row highlight: white/12 (dark black/8), shared `layoutId`, spring 600/40.

## Motion

- `open` spring 0 → 1: stiffness 240, damping 17, mass 0.9 (reduced motion 1000/100). `panel` spring to `matches·36 + 12` when the list shows, else 0: stiffness 260, damping 20.
- With `collapsedLeft = max(0, (W − collapsedWidth)/2)` (pill centred when closed):
  - `pillLeft = collapsedLeft + (expandedOffset − collapsedLeft)·o`
  - `pillWidth = max(44, collapsedWidth + (expandedWidth − collapsedWidth)·o)`
  - `bubbleX = (collapsedLeft + 2)·(1 − o)` (starts inside the pill's left end, ends at 0)
  - `bubbleScale = 0.55 + 0.45·clamp(o, 0, 1)`
  - Pill label opacity: o 0 → 0.35 maps 1 → 0. Field opacity: o 0.45 → 0.9 maps 0 → 1. Bubble icon opacity: o 0.4 → 0.8 maps 0 → 1.
  Because `o` overshoots past 1, the pill stretches beyond its target and the neck between bubble and pill stretches then snaps in the goo.
- Panel: `y = −8` until the height exceeds 1 (so it emerges from inside the pill), then 0; list opacity maps height 0 → 30 to 0 → 1, so suggestions drip out.

## Interaction and states

- Click the pill: open, focus the input on the next frame (`preventScroll`). Opening/closing calls `onOpenChange`; closing clears the text and resets the highlight.
- Typing updates the value (controlled or not) and resets the highlight to 0.
- Blur with empty text closes. Escape closes and blurs.
- With the list showing: ArrowDown/ArrowUp wrap the highlight; Enter picks it. Rows: pointer down prevents default (keeps focus), hover moves the highlight, click picks. Picking fills the field and calls `onSelect`.
- Input is disabled and `tabIndex −1` while closed.

## Autoplay demo

Loop: at 700ms open (without firing callbacks), type "motion" one letter every 120ms starting at 1300ms, highlight row 1 at 2700ms and row 2 at 3200ms, close at 4600ms, restart at 6200ms. Any pointer down or key in the root (capture phase) stops it. Demo: `collapsedWidth 128`, `expandedWidth 248`, `expandedOffset 56`, suggestions "Motion presets", "Motion values", "Spring motion", "Layout animation", "Scroll reveal", "Magnetic button", "Gooey filter".

## Accessibility

- Closed pill is a button with `aria-expanded={false}` and `aria-controls` the input; focus ring 2px `#0071e3` (dark `#0a84ff`), 2px offset on `#f5f5f7` (dark black).
- With suggestions the input is a `combobox` (`aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`), label "Search" unless one is passed. Options have `role="option"` and `aria-selected`. All goo shapes are `aria-hidden`.

## Acceptance checklist

- Clicking the pill stretches it with overshoot while the icon pinches off into a separate bubble, joined by a gooey neck that snaps.
- Text and icons stay crisp; only the dark shapes are gooey.
- Typing shows up to four matches dripping out below, with the match in bold.
- Arrows move a sliding highlight; Enter or click picks and calls `onSelect`.
- Escape or blurring empty pours it back into the "Search" pill.
- `gooeyBlur` changes how much shapes melt together.
- Autoplay loops until touched; reduced motion makes the transitions near-instant.
