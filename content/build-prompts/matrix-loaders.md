# Matrix Loaders

Build a set of six 5×5 dot-matrix loading indicators, shown as a 3×2 grid of small tiles, each with a pulsing label ("Indexing…", "Thinking…"). Every dot in every loader runs the same pulse; only the phase offset per dot changes, and that alone turns the grid into a diagonal wave, a ripple from the centre, a spiral, rain, a sweep or a checkerboard. It should feel crisp and calm, like system status lights.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`).
- File: `components/matrix-loaders/matrix-loaders.tsx`. Named exports: `MatrixLoaders` (the showcase grid), `MatrixLoader` (one loader), `MATRIX_PATTERNS` (the pattern names in order), and types `MatrixLoadersProps`, `MatrixLoaderProps`, `MatrixPatternName`.

## API

`MatrixLoaders`:

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `size` | `number` | `64` | Grid size of each loader in px. Tiles are `size + 68` px square (132px by default). |
| `color` | `string` | — | One dot colour for every loader; defaults to each pattern's own colour. |
| `showLabels` | `boolean` | `true` | Show the pulsing label under each loader. |

`MatrixLoader`:

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `pattern` | `"wave" \| "ripple" \| "spiral" \| "rain" \| "halogen" \| "checker" \| number` | `0` | Which pattern, by name or index (index wraps modulo 6; an unknown name falls back to wave). |
| `size` | `number` | `64` | Width and height of the grid in px. |
| `color` | `string` | pattern colour | Dot colour. |
| `label` | `string` | pattern label | Accessible label. |

There is no `autoplay` prop: the loaders loop forever on their own.

## Patterns

Cells are `{ r, c }` with rows and columns 0–4; `center = 2`. Each pattern has a label, colour, pulse duration and a delay formula:

| Name | Label | Colour (light / dark) | Duration | Delay for a cell |
|---|---|---|---|---|
| wave | Indexing | `#0071e3` / `#0a84ff` | 1.2s | `(c + r) × 0.08` |
| ripple | Thinking | `#bf5af2` | 1.4s | `hypot(c − 2, r − 2) × 0.16` |
| spiral | Searching | `#ff9f0a` | 1.6s | `((atan2(r − 2, c − 2) + π) / 2π) × 1.2 + hypot(c − 2, r − 2) × 0.05` |
| rain | Syncing | `#30d158` | 1.0s | `r × 0.12 + ((c × 37) mod 5) × 0.11` |
| halogen | Recording | `#ff3b30` | 1.0s | `c × 0.14` |
| checker | Building | `#1d1d1f` / `#f5f5f7` | 0.9s | `0.45` if `(c + r)` is odd, else `0` |

The final delay is `delay mod duration`, so every dot is already mid-cycle on mount (nothing waits to start). Rain uses `(c × 37) mod 5` as a fixed pseudo-random column offset; keep it deterministic so server and client render the same.

## Layout and look

- `MatrixLoader`: a CSS grid of `size × size` px with 5 equal columns. Each cell is `size / 5` square and centres a round dot `0.62 × size/5` in diameter (about 7.9px at size 64) filled with the colour.
- The two colours that change with the theme are CSS variables set on the loader: `--mk-blue: #0071e3` and `--mk-ink: #1d1d1f`, overridden under `.dark` to `#0a84ff` and `#f5f5f7`; wave uses `var(--mk-blue)`, checker `var(--mk-ink)`. The other colours are the same in both themes.
- `MatrixLoaders`: a 3-column grid with 16px gaps. Each tile is a centred column with 12px gap, radius 22px. Light: bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 10px 24px -18px rgba(0,0,0,.35)`. Dark: bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08)`. At the default size the whole grid is 428px wide.
- Label: 12px, weight 500, `#6e6e73` / dark `#a1a1a6`, the pattern label plus an ellipsis character ("Indexing…").

## Motion

- Dot pulse, identical for every dot: keyframes `scale [0.45, 1, 0.45]` and `opacity [0.18, 1, 0.18]`, the pattern's duration, `ease: "easeInOut"`, `repeat: Infinity`, plus the cell's delay. Scale animates from the dot's centre.
- Label: `opacity [0.5, 1, 0.5]` over 2s, repeating forever, delayed `i × 0.2s` for tile `i`, so the labels shimmer out of step.
- Reduced motion (`prefers-reduced-motion: reduce`): dots stop scaling (fixed at 0.8) and only fade `opacity [0.35, 1, 0.35]`, at twice the duration; labels stay at full opacity.

## Interaction and states

- No interaction. The loaders render statically on the server and start looping on mount.
- `color` on `MatrixLoaders` is passed to every `MatrixLoader`.

## Accessibility

- Each `MatrixLoader` is `role="status"` with `aria-label` set to its label (or the `label` prop).
- In `MatrixLoaders`, the visible text label is `aria-hidden` because the loader already announces it.

## Acceptance checklist

- [ ] Six tiles in a 3×2 grid, 132px each with 16px gaps at the default size.
- [ ] Wave sweeps diagonally from top-left to bottom-right; ripple expands from the centre dot.
- [ ] Spiral sweeps around the centre and slightly outward; rain falls down rows with uneven columns; halogen sweeps left to right; checker alternates two interleaved sets.
- [ ] No pattern shows a frozen "waiting" dot on first paint.
- [ ] `<MatrixLoader pattern="ripple" size={28} />` works on its own, inline.
- [ ] Changing `size` rescales the dots and the tiles together.
- [ ] In dark mode the wave turns `#0a84ff`, the checker turns light, and the tiles turn `#1c1c1e`.
- [ ] With reduced motion, the dots only fade and the labels stop pulsing.
