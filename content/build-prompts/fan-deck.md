# Fan Deck

Build a paint-chip swatch deck. Closed, it stands upright as one neat stack of tall chips held by a metal rivet near the bottom. Press "Fan out" and the deck tips onto its side, then the chips swing open one by one around the rivet into a colour-graded half circle. Hovering a chip slides it outward from the fan; clicking it copies its hex and shows a small "copied" pill. The feel is tactile and physical, like handling a real paint fan deck.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- Nested rotations with a shared transform origin at the rivet; no canvas or SVG needed.
- File: `components/fan-deck/fan-deck.tsx`, named export `FanDeck`. Also export the type `FanDeckChip` (`{ name: string; hex: string }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `chips` | `FanDeckChip[]` | 12 chips, Ember to Rosewood | Swatches in the order they fan out, first on the left. |
| `autoplay` | `boolean` | `false` | Fans out and closes by itself until the user interacts. |

Default chips: Ember `#E5484D`, Coral `#F76B4B`, Marigold `#F5A524`, Butter `#F7CE46`, Pistachio `#A3D977`, Fern `#46A758`, Lagoon `#12A594`, Glacier `#3DB9CF`, Cobalt `#0071E3`, Iris `#5B5BD6`, Orchid `#9E4CC4`, Rosewood `#C2298A`. Use the hex as the React key.

## Layout and look

- Root: centred column, gap 16px.
- Stage: 440 × 270px (max-width 100%), relative. The rivet sits at stage point (220, 250).
- Chip size: 46 × 210px. The rivet is 22px above the bottom of each chip, so every rotating element uses `transform-origin: 50% {(210 − 22)/210 × 100}%` (framer `originX: 0.5`, `originY: 188/210`).
- Deck container: absolutely placed at `left 220 − 23 = 197px`, `top 250 − 210 + 22 = 62px`, 46 × 210, that origin. All chips stack inside it at `inset: 0` with `zIndex = i`, so later chips sit on top.
- Chip face (an inner span filling the chip): radius 10px, overflow hidden, white (dark `#2c2c2e`), shadow `0 0 0 1px rgba(0,0,0,.06), 0 6px 14px -6px rgba(0,0,0,.3)` (dark `0 0 0 1px rgba(255,255,255,.08), 0 6px 14px -6px rgba(0,0,0,.7)`).
  - Top 62%: solid swatch in `hex`.
  - Below: the name, centred, 8px top padding, 8px semibold uppercase, tracking 0.08em, `#1d1d1f` (dark `#f5f5f7`), set vertically with `writing-mode: vertical-rl`.
  - Rivet: a 10px circle centred horizontally, 16px from the bottom, `linear-gradient(180deg, #e5e5ea, #8e8e93)` with `inset 0 1px 0 #fff` (dark `linear-gradient(180deg, #aeaeb2, #48484a)` with `inset 0 1px 0 rgba(255,255,255,.5)`).
- Copied pill: centred at top 8px, fully rounded, `py-1.5 pl-1.5 pr-3`, gap 8px, 13px medium, white with `#1d1d1f` text (dark `#2c2c2e` / `#f5f5f7`), shadow `0 0 0 1px rgba(0,0,0,.06), 0 8px 20px -10px rgba(0,0,0,.3)` (dark rgba(255,255,255,.08) ring and .7 shadow). Contents: a 20px dot in the chip colour, then "{hex} copied".
- Toggle button below the stage: 36px tall, `px-5`, fully rounded, 13px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text). Label "Fan out" when closed, "Close deck" when open.

## Motion

- **Deck tip**: the container rotates to −90° when open (lying on its side, chips pointing left) and 0° when closed, with `y: −6px` when closed and 0 when open. Spring `stiffness 160, damping 18`.
- **Fan**: chip i rotates to `i / max(1, n − 1) × 180°` when open, so with the deck's −90° the first chip points left, the middle ones point up and the last points right: a half circle around the rivet. Closed, each chip rotates `i × 0.6°`, a barely visible splay that makes the stack look real. Spring `stiffness 170, damping 19`.
- **Stagger**: opening delay `0.18 + i × 0.045s` (the deck tips first, then the chips peel off left to right); closing delay `(n − i) × 0.02s` (the last chip folds back first).
- **Hover lift**: when open, the hovered (or focused) chip's inner face moves `y: −16px` (outward along its own radius) on a spring `stiffness 500, damping 26`; it drops back when the pointer leaves.
- **Copied pill**: `AnimatePresence`; enter from `opacity 0, y 10, scale 0.9` to `opacity 1, y 0, scale 1`; exit to `opacity 0, y −6` (default transitions). It disappears 1400ms after the last copy (clear only if the copied chip is still the same one).
- **Toggle button**: `whileTap` scale 0.95.
- `initial={false}` on the deck and chips so nothing animates on mount.

## Interaction and states

- State: `open`, `hover` (index or null), `copied` (chip or null).
- Chips are buttons. Pointer enter sets hover, pointer leave clears it, focus sets hover too.
- Click copies `hex` via `navigator.clipboard.writeText`; if the clipboard is blocked, swallow the error and still show the pill.
- Chips are only tabbable when open (`tabIndex` 0 when open, −1 when closed).
- Any pointer-down in the component, or the toggle button, marks it touched.

## Autoplay demo

Open 700ms after mount, then toggle every 3600ms. Both are skipped once the user has pressed anywhere in the component or used the toggle.

## Accessibility

- Toggle: `<button type="button">` with `aria-expanded`, 2px focus-visible outline with 2px offset, `#0071e3` (dark `#0a84ff`).
- Each chip: `aria-label="{name} {hex}. Copy"`, focus-visible 2px ring `#0071e3` (dark `#0a84ff`).
- The copied pill has `role="status"` so the copy is announced.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Clicking a colour chip, which copies its hex, plays `tick` (a tiny dry click, a 12ms burst of high-passed noise above 5 kHz) at 60% volume. Fanning the deck out or closing it makes no sound, and neither does hovering a chip or the autoplay. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Closed, the deck is a single upright chip stack with a rivet near its base and a faint splay.
- Fan out tips the deck left, then chips swing out one after another into a 180° arc above the rivet, red on the left through to magenta on the right.
- Every chip pivots exactly around its rivet; rivets stay on one point throughout.
- Hovering a fanned chip slides it 16px outward with a quick spring.
- Clicking a chip copies its hex and shows "#XXXXXX copied" with a colour dot for about 1.4s.
- Close deck folds the chips back right to left and stands the deck upright.
- Chips cannot be tabbed to while closed.
- With `autoplay`, the deck opens at 0.7s and toggles every 3.6s until the first interaction.
