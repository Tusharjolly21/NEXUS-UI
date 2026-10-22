Build a syntax-highlighted code block with a title bar, language badge, line numbers and a copy button. A soft bar glides between lines as the pointer moves, chosen lines are marked with an accent bar, and copying turns the icon into a tick that draws itself.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, inline styles, framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useReducedMotion`).
- File: `components/code-block/code-block.tsx`. Named exports `CodeBlock` (also default), `DEFAULT_HEADER`, `DEFAULT_CODE_AREA`, `DEFAULT_BORDER`, and the matching prop types.

## API

`CodeBlock` props: `code` (a short `PricingCard` sample), `language` (`"plain" | "js" | "ts" | "jsx" | "tsx" | "css" | "json" | "html"`, default `"tsx"`), `theme` (`"dark" | "light" | "auto" | "custom"`, default `"dark"`), `header`, `codeArea`, `border`, `highlightLines` (1-based numbers), `hoverHighlight` (default `true`), `autoplay` (default `false`), `className`, `style`.

- `HeaderProps`: `enabled`, `showDots`, `background`, `title`, `font`, `titleColor`, `copy`. Default `{ enabled: true, showDots: true, title: "pricing-card.tsx", copy: { enabled: true, label: "Copy", copiedLabel: "Copied", copiedDurationMs: 1400 } }`. Passing `header` replaces the whole default, so the bar needs `enabled: true`, dots `showDots: true` and the button `copy.enabled: true`.
- `CopyProps`: `enabled`, `label`, `copiedLabel`, `copiedDurationMs` (floor 300), `color`, `accentColor`.
- `CodeAreaProps`: `showLineNumbers` (true), `wrap` (false), `padding` (18), `background`, `selectionColor`, `textColor`, `subtleTextColor` (line numbers), `font`.
- `BorderProps`: `color`, `width` (0; 1 when `theme` is `custom`), `radius` ("22px").

Palettes, dark / light: frame and code `#1c1c1e` / `#ffffff`; header `#232325` / `#f5f5f7`; title and copy `#a1a1a6` / `#6e6e73`; copied `#30d158` / `#248a3d`; text `#e5e5ea` / `#1d1d1f`; line numbers `#636366` / `#aeaeb2`; selection `rgba(10,132,255,.35)` / `rgba(0,113,227,.18)`; glide `rgba(255,255,255,.06)` / `rgba(0,0,0,.04)`; mark `rgba(10,132,255,.14)` / `rgba(0,113,227,.08)`; mark bar `#0a84ff` / `#0071e3`; border `rgba(255,255,255,.08)` / `rgba(0,0,0,.06)`.

Token colours, dark / light: keyword, boolean, nullish `#ff7ab2` / `#9b2393`; function `#67b7a4` / `#326d74`; class, tag `#5dd8ff` / `#0b4f79`; string, attribute value `#ff8170` / `#c41a16`; number `#d9c97c` / `#1c00cf`; attribute name `#d9c97c` / `#815f03`; comment (italic) `#7f8c98` / `#5d6c79`; operator `#a1a1a6` / `#3c3c43`; punctuation `#c7c7cc` / `#3c3c43`.

## Layout and look

- The root fills its parent (100% by 100%, flex column, overflow hidden), so the parent needs a height. Radius `border.radius`, frame background, a ring shadow (`border.width` px in `border.color`, else 1px in the palette border) plus `0 20px 40px -26px rgba(0,0,0,.6)` (light `.3`).
- Title bar: 44px, left padding 16, right 8, gap 12, 12.5px text, 1px bottom border. Dots: three 12px circles `#ff5f57`, `#febc2e`, `#28c840`, gap 7. Language badge: `TXT`, `JS`, `TS`, `JSX`, `TSX`, `CSS`, `JSON` or `HTML`, 10px semibold, tracking 0.04em, radius 6, `white/7%` (light `black/5%`) background, then the title, truncated.
- Copy button (right): 32px tall pill, padding-x 12, 16px icon, gap 6. Idle uses the copy colour on transparent; copied uses the accent on `rgba(48,209,88,.12)` (light `rgba(36,138,61,.08)`).
- Code area: scrolls with the scrollbar hidden (sideways too unless `wrap`), padding `codeArea.padding`, 24 extra at the bottom. Text is 13px `var(--font-mono)` with a system monospace fallback, line height `1.65em`, tab size 2. A 36px fade to the code background covers the bottom edge at 85%.
- Each line is a flex row with a 14px gap and `data-ln`. The gutter is `max(2, digits)ch` wide, right-aligned, tabular, unselectable. Marked lines get the mark background across the full width, an inset 3px bar in the mark-bar colour, and a number in that colour.

## Motion

- Glide bar: full width, `y` and height are springs (stiffness 520, damping 38, mass 0.7; reduced motion 2000 and 100), opacity a spring (380 and 40). The first hover jumps, later moves glide.
- Copy icon: two sheets swap for a tick, spring 600 and 22. The tick scales from 0.3 and rotates from -30deg while its path draws over 0.28s ease-out (pre-drawn under reduced motion). The label rolls in from `y 12` and out to `y -12`. Press scale 0.92.

## Interaction and states

- Pointer move finds the nearest `[data-ln]` row and glides the bar there; leaving hides it (unless `autoplay`). Nothing happens if `hoverHighlight` is false.
- Copy writes the text (CRLF to LF) with `navigator.clipboard`, falling back to a hidden textarea and `execCommand`; failures are ignored. Copied clears after `max(300, copiedDurationMs)` ms.
- `auto` follows the `dark` class on `<html>` via a `MutationObserver` (light on the server). `custom` takes `codeArea.background` (default `#1c1c1e`), picks the dark or light palette as base by luminance (`0.299R + 0.587G + 0.114B` under 0.5; non hex or rgb counts as dark), then overrides from `header`, `codeArea` and `border`.
- Tokenizing is per line. A word followed by `(` is a function, a capitalised word a class, `true` or `false` boolean, `null` or `undefined` nullish. JS, TS, JSX and TSX share a keyword list and both comment styles; JSON highlights `true`, `false`, `null`; CSS has block comments only; HTML colours tag names, attribute names and quoted values; `plain` is uncoloured.

## Autoplay demo

Every 900ms glide the bar to the next stop, looping through `highlightLines` or, if none, every non-blank line. A pointer move over the code (needs `hoverHighlight`) stops it for good.

## Accessibility

- The `pre` is labelled "Code block (<language>)". Dots, gutter numbers and the glide bar are `aria-hidden`; the copy button is labelled with its current text, with a 2px `#0a84ff` focus ring.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Only the Copy button makes sound: when the code has been copied, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays at 60% volume. The glide bar, hover and the autoplay walk are silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Dark by default with badge, title, line numbers and a Copy button.
- [ ] Hovering glides a bar between lines; leaving fades it.
- [ ] Marked lines show the tinted band, left bar and coloured number.
- [ ] Copying draws the tick and flips the label.
- [ ] `wrap` wraps long lines; otherwise they scroll sideways.
- [ ] `auto` flips with the page's `dark` class.

## Examples on the page

- Dark with marked lines: a 200px-tall wrapper, a three-line `Badge` component, `language="tsx"`, `theme="dark"`, `highlightLines={[2]}`, `header={{ enabled: true, showDots: true, title: "badge.tsx", copy: { enabled: true } }}`.
- Follows the page theme: a 320px-tall wrapper, `theme="auto"`, `language="tsx"`, `code` from a prop, no `highlightLines`, and `header={{ enabled: true, title: "badge.tsx", copy: { enabled: true } }}`, so no window dots.
