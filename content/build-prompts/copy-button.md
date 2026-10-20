# Copy Button

Build two copy-to-clipboard controls and a small demo that stacks them: an ID chip whose copy icon twists into a drawn check while a tinted ripple washes across it and a "Copied" tooltip pops above, and a dark command-line bar whose "Copy" pill rolls to a green "Copied". The feel is crisp developer-tool UI, Apple-like: snappy springs, short confirmation, back to rest after 1.6s.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/copy-button/copy-button.tsx`. Named exports: `CopyChip`, `CopyCommand`, `CopyDemo`, and the type `CopyChipProps`.

## API

**`CopyChip`**

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `value` | `string` | required | Text written to the clipboard. |
| `display` | `string` | `value` | What the chip shows, e.g. a shortened ID. |
| `label` | `string` | `"Copy"` | Start of the accessible label (`"{label} {value}"`). |
| `accent` | `string` | `"#0071e3"` | Ripple, check and focus colour. |
| `autoplay` | `boolean` | `false` | Copies by itself (visual only) every 3.2s until clicked. |

**`CopyCommand`**: `{ command: string; autoplay?: boolean }` (`autoplay` default `false`).

**`CopyDemo`**: `{ autoplay?: boolean }`. A centred column, full width, 32px gap: `<CopyChip value="inv_3fK9xQ2Lq7" display="inv_3fK9…2Lq7" />` above `<CopyCommand command="npm i framer-motion" />`, both receiving `autoplay`.

Clipboard helper: `navigator.clipboard.writeText(text)`; if that throws, fall back to a temporary `textarea` appended to `body`, `select()`, `document.execCommand("copy")` (ignore errors), then remove it.

Monospace stack used for the value and command: `ui-monospace, 'SF Mono', Menlo, monospace`.

## Layout and look

**CopyChip**
- Wrapper: `relative inline-flex` (positions the tooltip).
- Button: 44px tall, row, 10px gap, radius 12px, `overflow-hidden`, white, padding left 14px / right 10px. Ring shadow `0 0 0 1px rgba(0,0,0,.08)`, on hover `.16`. Dark: `#2c2c2e`, ring `rgba(255,255,255,.1)`, hover `.2`.
- Text: 14px monospace, `#1d1d1f` (dark `#f5f5f7`).
- Icon box: 28×28, radius 8px, background `#f0f0f3` (dark `#3a3a3c`). Icon colour is `--cc-icon` = `#6e6e73` (dark `#a1a1a6`) at rest and `accent` while copied. Icons 14px: copy icon (stroke 2.2: `rect x8 y8 w12 h12 rx2.5` plus `M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2`), check icon (stroke 3: `M5 12.5l4.5 4.5L19 7.5`). Round caps/joins.
- Tooltip: absolutely 40px above the chip, horizontally centred, no wrap, radius 8px, padding 10px × 4px, 12px medium, background `#1d1d1f` with white text (dark: `#f5f5f7` with `#1d1d1f` text), `pointer-events-none`. Text "Copied".

**CopyCommand**
- Bar: 48px tall, `w-full max-w-[360px]`, row, 12px gap, radius 16px, background `#1d1d1f`, white text, padding left 16px / right 6px. Dark: background `#2c2c2e` with ring `0 0 0 1px rgba(255,255,255,.08)`.
- A `$` prompt in white at 40% opacity, then a `code` with the command, 14px monospace, truncated, flex-1.
- Button: 36px tall, radius 12px, 12px horizontal padding, 13px medium, `overflow-hidden`; background `rgba(255,255,255,0.12)` at rest, `#34c759` when copied.

## Motion

**CopyChip on copy** (each copy increments a `burst` key so effects replay even on rapid clicks):
- Ripple: an absolute full-size layer in `accent`, keyed by `burst`, animating `opacity 0.18 → 0` and `clipPath circle(0% at 90% 50%) → circle(140% at 90% 50%)` (it grows out from the icon on the right), 0.7s, ease `[0.16, 1, 0.3, 1]`.
- Icon swap with `AnimatePresence mode="popLayout" initial={false}`:
  - check enters from `scale 0.4, rotate −45°, opacity 0` (spring 600/20) and its path draws `pathLength 0 → 1` in 0.25s after 0.05s; it exits to `scale 0.4, opacity 0`.
  - copy icon enters from `scale 0.4, opacity 0`, exits to `scale 0.4, rotate 45°, opacity 0` (spring 600/22).
- Tooltip keyed by `burst`: enter from `opacity 0, y 8, scale 0.6` on spring 600/22; exit `opacity 0, y −6, scale 0.9` in 0.15s.
- Press: `whileTap { scale: 0.95 }`.
- Reset: copied stays true for 1600ms; each new copy clears and restarts that timer.

**CopyCommand on copy**
- Button background animates to `#34c759` and back; the button has `layout` so its width eases between "Copy" and "Copied".
- Label swap (`popLayout`, `initial={false}`, each label also `layout`): new label from `y 18, opacity 0`; old to `y −18, opacity 0`; spring 520/30.
- Press: `whileTap { scale: 0.94 }`. Copied resets after 1600ms.

## Interaction and states

- Clicking writes to the clipboard, then shows the copied state. Autoplay copies are visual only and never touch the clipboard.
- Clicking marks the control as touched.

## Autoplay demo

- `CopyChip`: interval every 3200ms triggers a visual copy while not touched.
- `CopyCommand`: first visual copy at 1600ms, then every 3200ms, while not touched. So in the demo the two alternate.
- After a real click the ticks do nothing. Clear timers on unmount.

## Accessibility

- Both are native `button type="button"`.
- Chip: `aria-label="{label} {value}"` (full value, not the shortened display). The tooltip carries `role="status"` so "Copied" is announced. Focus: 2px `accent` outline, 2px offset.
- Command button: visible label is its name; focus outline 2px white. `$` is `aria-hidden`; all SVGs `aria-hidden`.

## Acceptance checklist

- [ ] Clicking the chip copies the full `value` to the clipboard, even when `display` is shortened.
- [ ] The icon twists from copy to check and the check draws itself.
- [ ] A faint accent ripple expands from the icon side across the chip and fades.
- [ ] "Copied" pops up above the chip and leaves after 1.6s.
- [ ] Rapid clicks replay the ripple and tooltip each time and keep the copied state alive.
- [ ] The command button turns green and "Copy" rolls up to "Copied", width easing.
- [ ] Clipboard fallback works where `navigator.clipboard` is unavailable.
- [ ] Autoplay alternates the two controls without writing to the clipboard and stops for a control once it is clicked.
