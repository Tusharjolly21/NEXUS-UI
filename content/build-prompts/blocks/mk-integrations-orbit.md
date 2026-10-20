# Integrations Orbit

Build an integrations section: copy on the left, and on the right a square stage where app tiles orbit a central brand mark on three dashed rings, each ring at its own speed and direction. Hover, focus or tap a tile to freeze every ring and show its name; tap again to let it spin on. It should feel alive but unhurried, like a small solar system of the apps you already use.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries and `cqw` units: `@container`, `@sm:`, `@4xl:`), framer-motion (`motion`, `AnimatePresence`, `useAnimationFrame`, `useMotionValue`, `useTransform`, `useReducedMotion`), and a `cn` helper.
- File: `components/integrations-orbit/integrations-orbit.tsx`, named exports `IntegrationsOrbit` and `DEFAULT_INTEGRATIONS_ORBIT_RINGS`, types `IntegrationsOrbitProps`, `IntegrationsOrbitRing = { radius; speed; apps }`, `IntegrationsOrbitApp = { name; color; glyph; ink? }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `rings` | `IntegrationsOrbitRing[]` | 3 demo rings | `radius` in units of a 560-unit square stage; `speed` in degrees per second (negative = counter-clockwise). |
| `brand` | `string` | `"L"` | One or two characters in the centre mark. |
| `eyebrow` | `string` | `"Integrations"` | Accent line above the heading. |
| `title` | `string` | `"Plays well with the 120 apps you already pay for."` | Heading. |
| `description` | `string` | "Two-way sync, not imports. Change something in one place and it's changed everywhere, usually within a second." | Paragraph. |
| `linkLabel` | `string` | `"Browse all integrations"` | Link text. |
| `onBrowse` | `() => void` | — | Link press; it never navigates on its own. |
| `accent` | `string` | — | Any CSS colour. Unset: `#0071e3`, `#0a84ff` in dark (text `#2997ff`). |
| `autoplay` | `boolean` | `true` | Spins the rings. |
| `className` | `string` | — | Extra classes on the section. |

Demo rings (radius, speed, apps as name / colour / glyph):
- 96, +14°/s: Mail `#0a84ff` "M"; Calendar `#ff3b30` "31"; Chat `#30d158` "C".
- 168, −9°/s: Drive `#ff9f0a` "D"; Billing `#5e5ce6` "$"; Issues `var(--mk-orbit-ink-tile)` "#"; Design `#ff375f` "F"; Notes `#ffd60a` "N" with ink `#1d1d1f`.
- 236, +6°/s: CRM `#00a3e0` "S"; Analytics `#bf5af2` "A"; Docs `#30b0c7` "≡"; Support `#ff6b4a` "?"; Deploys `#0b8f6a` "▲"; Storage `#8e8e93` "S3".

## Layout and look

- Section: `@container`, full width, bg white / black, padding 16px sides (20px `sm`), 64px vertical (80px `sm`). Variables (light / dark): `--mk-accent` `#0071e3` / `#0a84ff`, `--mk-accent-text` `#0071e3` / `#2997ff`, `--mk-orbit-ink-tile` `#1d1d1f` / `#3a3a3c`. When `accent` is set, an inline style sets `--mk-accent` and `--mk-accent-text`.
- Grid: max-width 1120px, one column, gap 32px; from `@4xl` columns `minmax(0,1fr) minmax(0,1.2fr)`, gap 40px, items centred.
- Copy column: start-aligned, gap 20px. Eyebrow 14px semibold `--mk-accent-text`. `<h2>` `clamp(32px, 5vw, 54px)` semibold, line-height 1.04, tracking −0.04em, balanced, `#1d1d1f` / `#f5f5f7`. Paragraph max-width 460px, `clamp(16px, 1.6vw, 18px)`, line-height 1.5, `#6e6e73` / `#a1a1a6`. Link: min-height 40px, 16px medium, accent text, then a non-breaking space and "→".
- Stage wrapper: `overflow-x: clip`, 24px vertical padding. Stage: its own `@container`, relative, square (`aspect-ratio 1`), full width, max 560px, centred.
- Ring guide: centred circle with diameter `radius × 2 / 560` as a percentage, 1px dashed border `black/9` / `white/14`.
- Tile: a button absolutely centred on the stage (`left/top 50%`, negative margins of half its size), 40×40, radius 14px, 13px bold; from `@sm` 48×48, radius 16px, 14px. Background = app colour, text = `ink` or white. Shadow `0 10px 24px -10px rgba(0,0,0,.45)`; dark adds `0 0 0 1px rgba(255,255,255,.08)`. Its x/y are expressed in `cqw` so the orbit scales with the stage: `units / 560 × 100` cqw.
- Label: above the tile (`top: -36px`), pill, padding 4px 10px, 12px semibold, `#1d1d1f` bg / white text (dark: `#f5f5f7` bg / `#1d1d1f` text), nowrap. The labelled tile gets `z-index: 20`.
- Centre mark: square `clamp(60px, 16.4cqw, 92px)`, radius 30%, `linear-gradient(140deg, #5ac8fa, var(--mk-accent))`, shadow `0 20px 50px -14px var(--mk-accent)`, white bold glyph `clamp(26px, 6.8cqw, 38px)`. Behind it a pulse of the same shape in the accent.

## Motion

- Each ring owns one angle motion value, starting at `START[i % 3] + i × 11` with `START = [20, 75, 140]`. `useAnimationFrame` adds `speed × min(delta, 64) / 1000` degrees per frame while running.
- Tile `j` of `k` on a ring sits at base angle `j / k × 360`. Position: `x = cos((angle + base)·π/180) × radius`, `y = sin(…) × radius`, both mapped to cqw strings with `useTransform` (no React re-renders while spinning).
- Tile `whileHover` scale 1.25, `whileTap` 1.15.
- Label enter/exit: `opacity 0, y 6, scale .9` ↔ rest via `AnimatePresence`.
- Centre pulse: `scale 1 → 1.55`, `opacity .35 → 0`, 2s, easeOut, infinite (omitted under reduced motion).
- Link `whileHover` x 4.

## Interaction and states

- `hover` (mouse enter/leave and focus/blur) and `pinned` (click toggles) names. Label shown = `hover ?? pinned`.
- Rings run only when `autoplay` is on, reduced motion is off, and no label is showing. So hovering or focusing any tile freezes every ring; clicking pins it until clicked again.
- Escape anywhere in the section clears the pin.
- Link `preventDefault` then `onBrowse`.

## Autoplay demo

With `autoplay` the three rings spin continuously at +14, −9 and +6 degrees per second (inner fastest, middle reversed) and the centre mark pulses. With `autoplay={false}` the tiles stay at their start angles but hover labels and pinning still work.

## Accessibility

- Stage is `role="group"` with `aria-label="Connected apps"`. Each tile is a `<button>` with `aria-label` = app name and `aria-pressed` = pinned; glyph and floating label are `aria-hidden`.
- Tiles are reachable by Tab; focus shows the label and stops the orbit. Focus ring 2px accent with 2px offset (white / black).
- Ring guides and the centre mark are decorative.

## Acceptance checklist

- [ ] 14 tiles on three dashed rings around a gradient brand mark.
- [ ] Inner ring clockwise fastest, middle counter-clockwise, outer slowest.
- [ ] The stage scales down on phones and the orbit stays proportional.
- [ ] Hovering a tile stops all rings, enlarges the tile and shows its name.
- [ ] Clicking a tile pins it; clicking again or Escape resumes.
- [ ] Tabbing through tiles shows each name.
- [ ] Two columns from ~896px container width, stacked below.
- [ ] `accent` recolours eyebrow, link, mark gradient, glow and pulse.
- [ ] "Issues" tile is near-black in light and `#3a3a3c` in dark.
- [ ] Reduced motion: rings still, no pulse.
