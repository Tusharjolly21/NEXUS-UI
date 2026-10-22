# Pixel Select

Build a mood dropdown whose menu assembles out of small pixels in the current mood colour, sweeping in from the top-left, then resolves into a clean menu. Picking an option dissolves it into a falling, drifting, spinning shower of pixels in the new colour. A crisp Apple-style select with a playful 8-bit transition.

## Stack

- React 19.2+ client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`). The autoplay loop uses React's `useEffectEvent` (on older React, a ref to the latest callback).
- File: `components/pixel-select/pixel-select.tsx`, named export `PixelSelect`, plus exported `PixelSelectProps` and `Mood = { id: string; label: string; color: string }`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `options` | `Mood[]` | six moods | Options; pixels take the selected option's colour. `color` must be a 6-digit hex (an alpha suffix is appended). |
| `onChange` | `(id: string) => void` | – | Called with the option id when the user picks one. |
| `autoplay` | `boolean` | `false` | Opens and picks options by itself until someone interacts. |

Default moods: Calm `#64d2ff`, Focused `#0a84ff`, Happy `#ffcc00`, Energized `#ff9f0a`, Tender `#ff6482`, Dreamy `#bf5af2`. The initial value is the second option (Focused), or the first if there is only one.

## Layout and look

- Root: `relative`, 216×330 (fixed height so the page does not jump).
- Trigger: `motion.button`, full width, 44px tall, radius 12px, 14px side padding, 10px gap, white, 15px medium `#1d1d1f`, ring `0 0 0 1px rgba(0,0,0,.08)`. Dark: `#1c1c1e`, `#f5f5f7`, ring `rgba(255,255,255,.1)`. Contents: 14px swatch with 4px radius whose background animates to the current colour, the label (flex-1, left aligned), a 12px chevron (`M6 9l6 6 6-6`, stroke 3) in `#86868b` (dark `#8e8e93`).
- Menu area: absolutely at top 52px, width `MW = 216`, height `MH = options.length·40 + 12`.
- Pixel grid: cell size 12px; `cols = ceil(MW/12)`, `rows = ceil(MH/12)`. Each pixel is 11×11 (1px gap), radius 2px, at `(c·12, r·12)`, background = the current option colour. Layer is `pointer-events-none`, `aria-hidden`.
- Menu list: fills the menu area, radius 14px, 6px padding, white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 40px -18px rgba(0,0,0,.35)`. Dark: `#2c2c2e`, `0 0 0 1px rgba(255,255,255,.08), 0 24px 40px -18px rgba(0,0,0,.8)`.
- Option row: 40px tall, radius 10px, 10px side padding, 10px gap, 14px medium `#1d1d1f` (dark `#f5f5f7`), pointer cursor, no outline. Contents: 14px swatch (radius 4) in its colour, label, and a 14px check (`M5 12.5l4.5 4.5L19 7.5`, stroke 3) for the selected one. Hover highlight: a shared-layout background in the option's colour at 15% (`color + "26"`).

## Per-pixel randomness

Use a small seeded PRNG (mulberry32 style) seeded with `seed·9973 + 17`, where `seed` is a counter in state bumped on every open and every close, so each transition has fresh jitter without impure renders. For each cell:
- `dist = hypot(c/cols, r/rows)` (0 at top-left)
- `delay = dist·0.22 + rand·0.08` s
- `fall = 40 + rand·140` px, `drift = (rand − 0.5)·60` px, `spin = (rand − 0.5)·180` deg.

## Motion

Phases: `closed → opening → open → closing → closed`.

1. **Opening** (420ms): bump the seed. Pixel layer mounts (keyed by `seed`); each pixel from `scale 0, opacity 0` to keyframes `scale [0, 1.2, 1]`, `opacity [0, 1, 1]`, 0.24s, delay `cell.delay`. The block fills in a diagonal wave from the top-left with a little pop.
2. **Open**: same layer (seed unchanged) animates each pixel to `opacity 0` (scale 1), 0.3s, delay `cell.delay·0.4`, while the menu fades in on top from `opacity 0, blur(6px)` over 0.18s. Option rows enter from `opacity 0, x −6` with delay `i·0.03s`. Hover highlight moves with `layoutId` on spring stiffness 520, damping 38.
3. **Closing** (900ms): set the new value first, bump the seed, so a new layer mounts in the new colour from full opacity. The menu exits (`opacity 0` in 0.08s). Each pixel animates to `y fall, x drift, rotate spin, opacity 0, scale 0.4`, 0.7s, delay `cell.delay·0.6`, ease `[0.4, 0, 1, 1]` (accelerating like it falls).
4. **Closed**: pixel layer unmounts.

Trigger: `whileTap { scale: 0.97 }`; chevron rotates to 180° during opening and open; swatch colour animates to the new mood.

## Interaction and states

- Trigger click: when closed, open; otherwise try to close without a pick (only works while `open`; clicks mid-transition are ignored).
- Option click, or Enter/Space on a focused option: close with that pick, set value, call `onChange`.
- Escape on an option closes without picking.
- Pointer enter or focus on an option sets the hover highlight; leaving the list clears it.
- Pointer down in the root marks touched.

## Autoplay demo

With `autoplay`: run at 700ms, then every 3600ms, only while not touched and closed. A run: bump seed, `opening`, `open` at 420ms; advance an internal counter by 2 and choose `options[counter % n]`; hover it at 900ms; at 1700ms set it as value and start `closing`, then `closed` 900ms later. Autoplay does not call `onChange`. Clear every timer on unmount.

## Accessibility

- Trigger: `aria-haspopup="listbox"`, `aria-expanded` (true only in the open phase), `aria-controls` pointing to the list id (`useId`). Focus-visible outline 2px `#0071e3` (dark `#0a84ff`), 2px offset.
- List: `role="listbox"`, `aria-label="Mood"`. Options: `role="option"`, `aria-selected`, `tabIndex={0}`.
- Pixels and icons are `aria-hidden`.

## Acceptance checklist

- [ ] Clicking the trigger fills the menu area with coloured pixels from the top-left, with a small overshoot.
- [ ] Pixels fade away as the real menu appears, sharp and readable.
- [ ] Hover highlight slides between rows in each option's own tint.
- [ ] Picking an option recolours the trigger swatch and the menu shatters into a shower of pixels in the new colour.
- [ ] Clicks during a transition do nothing.
- [ ] Keyboard: Tab to options, Enter/Space picks, Escape closes.
- [ ] Autoplay opens, highlights, picks and repeats every 3.6s, and stops on the first pointer down.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Opening the menu plays `pop` from `@/lib/ui-sounds` at 70% volume (a short blip that rises quickly in pitch) as the pixels start to build. Choosing an option plays `tap` at 80% (a short soft thump that falls in pitch, with a hint of click) as the pixels scatter.
- Closing without a choice, hovering rows and the autoplay loop are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
