# Travelling Tooltip

Build one tooltip for a whole toolbar. The first hover over any button waits a beat, as tooltips should. Once it is showing, moving to the next button makes the same tooltip glide across with no delay, resizing to the new label and showing its keyboard shortcut. Leave the bar and the tooltip fades; a short "warm" window means coming back straight away shows it instantly. Keyboard focus drives it the same way.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/travelling-tooltip/travelling-tooltip.tsx`. Named exports `TravellingTooltip`, `TRAVELLING_TOOLTIP_TOOLS`, types `TravellingTooltipProps` and `TravellingTooltipTool`.

## API

`TravellingTooltipTool`: `{ id: string; label: string; keys: string; d: string }`. `d` is SVG path data for a 24 x 24 stroke icon.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `tools` | `TravellingTooltipTool[]` | six formatting tools | Demo: Bold ⌘B, Italic ⌘I, Add link ⌘K, Bulleted list ⌘⇧8, Comment ⌘⌥M, Rewrite with AI ⌘J. |
| `label` | `string` | `"Formatting"` | Accessible name of the toolbar. |
| `openDelay` | `number` | `450` | Wait before the first tooltip shows, ms. |
| `warmMs` | `number` | `600` | How long it stays warm after the pointer leaves, ms. |
| `hint` | `string` | `"Hover one button, then slide along the bar"` | Caption under the bar; empty hides it. |
| `onSelect` | `(tool) => void` | none | Called when a button is pressed. |
| `autoplay` | `boolean` | `false` | Walks the tooltip along the bar until touched. |
| `className` | `string` | `""` | Extra classes on the wrapper. |

## Layout and look

- Wrapper: flex column, centred, 16px gap, `width: 100%`, 48px top padding (room for the tooltip).
- Bar: `position: relative`, flex row, 2px gap, padding 6px, radius 16px, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -18px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Buttons: 40 x 40px, radius 10px, centred 18px stroke icon (stroke 2, round caps and joins). Resting colour `#6e6e73` / dark `#a1a1a6`; hover and the button the tooltip points at get bg `#f5f5f7` / dark `#2c2c2e` and text `#1d1d1f` / dark `#f5f5f7`.
- Tooltip: absolutely positioned 10px above the bar (`bottom: calc(100% + 10px)`), centred on the active button (`left` = button centre, `x: -50%`), `pointer-events: none`, whitespace nowrap, padding 6px 10px, radius 10px, bg `#1d1d1f` / dark `#3a3a3c` (dark adds a white 10% ring), white text 12.5px medium, 8px gap between label and keycap, shadow `0 8px 20px -8px rgba(0,0,0,.5)`. Keycap: bg white 15%, text white 80%, 11px, padding 1px 6px, radius 5px. A 6px CSS triangle (same colour as the bubble) hangs from the bottom centre.
- Caption: 13px, `#6e6e73` / dark `#a1a1a6`, centred.

## Motion

- The tooltip enters from `opacity 0, y 6, scale .92` and settles to `opacity 1, y 0, scale 1`; `left` animates to the new button centre; all with a spring of stiffness 520, damping 36. `layout="size"` lets the bubble resize smoothly to the new label. Exit: `opacity 0, y 4, scale .96` over 120ms.
- The label and keycap crossfade inside the bubble with `AnimatePresence mode="popLayout"`: opacity 0 -> 1 with a 3px blur clearing over 150ms.
- Show logic: a pointer enter on a button, when cold, starts a `openDelay` timer and then shows the tooltip and marks the bar warm; when warm, it shows at once. Leaving the bar hides the tooltip, cancels a pending timer and clears the warm flag after `warmMs`.
- Reduced motion: the tooltip fades only (no y, scale or blur) and jumps between buttons instead of gliding; no autoplay.

## Interaction and states

- Keyboard: the bar is one tab stop (roving tabindex). Focus shows the tooltip at once (no delay), Arrow Left/Right (and Up/Down), Home and End move between buttons, Escape hides the tooltip. Leaving the bar by blur hides it.
- Pressing a button calls `onSelect`. The tooltip is `aria-hidden`: each button's accessible name already reads `Label (shortcut)`.

## Autoplay demo

Only while the bar is on screen, the tab is visible and motion is not reduced: every 900ms advance to the next button (showing its tooltip and marking the bar warm), then rest with no tooltip for two beats, and repeat. The first pointer enter or press on the bar, or focus in it, stops the loop for good.

## Accessibility

- `role="toolbar"` with `aria-label`; buttons are real buttons with `aria-label` and decorative `aria-hidden` icons.
- Focus rings are 2px `#0071e3` (dark `#0a84ff`), 2px offset. Tooltip text is white on `#1d1d1f` (dark `#3a3a3c`), well above 4.5:1.

## Acceptance checklist

- [ ] The first hover waits `openDelay`; moving to a neighbour is instant.
- [ ] The bubble glides between buttons, resizes to each label and crossfades the text.
- [ ] Leaving the bar fades it; re-entering within `warmMs` shows it with no delay.
- [ ] Keyboard focus and arrow keys move it; Escape hides it; the bar is a single tab stop.
- [ ] Autoplay walks the bar and stops at first touch; reduced motion fades without gliding.
- [ ] Dark mode matches the colours above. No sound (hover only).
