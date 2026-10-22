Build a search control that starts as a round magnifier button and opens into a full search field as one object: the pill springs wider to the left, the magnifier turns a quarter and shrinks a little, the input and an "esc" key cap fade in, and a card of suggestions drops in underneath and filters as you type. Escape, or leaving it empty, folds everything back. It should feel calm, Apple-like and physical.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/seek-search/seek-search.tsx`, named export `SeekSearch`, exported `SeekSearchProps`.
- State: `open` (boolean) and `q` (string). Refs: the input element and a "touched" flag. Suggestions are local data only; never fetch.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `suggestions` | `string[]` | `["Quarterly report", "Design review notes", "Onboarding checklist", "Brand colours", "Hiring plan"]` | Local list shown under the field. |
| `placeholder` | `string` | `"Search files"` | Placeholder and the input's aria-label. |
| `maxLength` | `number` | `64` | Longest query; enforce with `maxLength` and by slicing in `onChange`. |
| `onSelect` | `(suggestion: string) => void` | – | Called when a suggestion is clicked. |
| `autoplay` | `boolean` | `false` | Runs a typing demo on a loop until the user interacts. |

Filtering uses `term = q.trim().slice(0, maxLength)`; a suggestion matches if it contains `term`, case-insensitively.

## Layout and look

- Root: 320 × 300px vertical flex, items centred, 24px top padding. Inside, a 300px-wide row with `justify-end` holds the pill, so it grows leftwards from the right edge.
- Pill: 48px tall, fully rounded, `overflow: hidden`, 44px left padding, 12px right padding, flex row. Light: white, shadow `0 0 0 1px rgba(0,0,0,.08), 0 12px 28px -16px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.1), 0 12px 28px -16px rgba(0,0,0,.8)`.
- Magnifier button: absolutely positioned 14px from the left, vertically centred, 24 × 24, colour `#1d1d1f` (dark `#f5f5f7`). Icon: 20px, 24-unit viewBox, stroke 2.2, round caps, path `M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4`. Focus-visible 2px ring `#0071e3` (dark `#2997ff`).
- Input: fills remaining width, transparent, 15px, text `#1d1d1f` / dark `#f5f5f7`, placeholder `#a1a1a6` / dark `#8e8e93`, no outline.
- Key cap: `<kbd>` "esc", 11px, radius 6px, padding 2px 6px, background `#f0f0f3` / dark `#2c2c2e`, text `#6e6e73` / dark `#a1a1a6`.
- Suggestion card: 300px wide, 8px below the pill, radius 20px, 6px padding, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 20px 40px -24px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, shadow alpha .8).
  - Header row: 11px semibold uppercase, tracking 0.08em, `#86868b` / dark `#8e8e93`, padding 8px 12px 4px. Text "Recent" when the term is empty, otherwise "N results".
  - Rows: full-width buttons, radius 12px, padding 10px 12px, 12px gap, 14px text. Hover and focus-visible background `#f5f5f7` / dark `#2c2c2e`. A 14px document icon (path `M6 2h9l5 5v15H6zM14 2v6h6`, stroke 2, `#86868b` / dark `#8e8e93`). When a term exists, wrap the first matched run in semibold.

## Motion

- Pill width: animate 48 → 300 (open) and back, spring stiffness 300, damping 30. Use `initial={false}`.
- Magnifier icon: rotate 0 → 90°, scale 1 → 0.85, spring stiffness 300, damping 18.
- Input (inside `AnimatePresence`): enters from opacity 0, x −10 to opacity 1, x 0 with a 0.12s delay; exits to opacity 0, x −10 over 0.1s.
- Key cap: fades in with a 0.2s delay, fades out on close.
- Suggestion card: enters from opacity 0, y −8, scale 0.98; exits the same way; spring stiffness 380, damping 30.
- Rows: inner `AnimatePresence` with `initial={false}` and `mode="popLayout"`, each row `layout`, keyed by its text. Enter from opacity 0, x −8 with delay `0.04 · index`; exit opacity 0 over 0.12s. Remaining rows slide up into place as others leave.

## Interaction and states

- Click the magnifier: if closed, open; if open, focus the input. When the component opens after user interaction, focus the input (an effect on `open` that checks the touched flag, so the autoplay demo never steals focus).
- Typing filters live. Blur with an empty (trimmed) query closes and clears.
- Escape anywhere inside the root closes and clears the query.
- Any pointer down or key down inside the root marks it touched.
- Clicking a suggestion calls `onSelect`.

## Autoplay demo

A cycle runs immediately and then every 5s: open at 300ms; type "design" one letter at a time starting at 1100ms, 110ms apart; clear at 3000ms; close at 3600ms. Every timer checks the touched flag first and does nothing once the user has interacted. Clear all timers and the interval on unmount.

## Accessibility

- Magnifier button: `aria-label` "Open search" when closed, "Search" when open; `aria-expanded`.
- Input `aria-label` = placeholder. The results header can be `aria-live="polite"`.
- Suggestions are real buttons, reachable with Tab.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Clicking a suggestion plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). Opening and closing the field, typing and the autoplay loop are silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Closed: a 48px white circle with a magnifier, right-aligned in a 300px row.
- Opening widens the pill to the left with a soft spring while the icon turns 90° and shrinks to 85%.
- Input and "esc" fade in slightly after the width starts moving.
- The list drops in with all five suggestions under "Recent".
- Typing "des" shows "1 results" with "Des" bold in "Design review notes"; other rows fade out and the rest reflow.
- Leading/trailing spaces do not affect filtering; the query never exceeds `maxLength`.
- Escape or blurring an empty field closes everything and clears the text.
- Autoplay loops every 5s and stops after the first pointer or key press.
- Dark mode swaps surfaces to `#1c1c1e`/`#2c2c2e` and text to `#f5f5f7`.
