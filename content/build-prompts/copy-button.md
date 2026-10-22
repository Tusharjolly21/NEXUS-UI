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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. A real press on the chip or the command's Copy button plays `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) at 60% volume once the text is on the clipboard. The autoplay copies play the same `success` at 60% through the same play function's `auto` variant (`play.auto("success", 0.6)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Clicking the chip copies the full `value` to the clipboard, even when `display` is shortened.
- [ ] The icon twists from copy to check and the check draws itself.
- [ ] A faint accent ripple expands from the icon side across the chip and fades.
- [ ] "Copied" pops up above the chip and leaves after 1.6s.
- [ ] Rapid clicks replay the ripple and tooltip each time and keep the copied state alive.
- [ ] The command button turns green and "Copy" rolls up to "Copied", width easing.
- [ ] Clipboard fallback works where `navigator.clipboard` is unavailable.
- [ ] Autoplay alternates the two controls without writing to the clipboard and stops for a control once it is clicked.


---

<!-- Copy Button: Motion Kit variant brief -->

> The Copy Button page now has 3 parts: the original Copy Button (above) plus 2 Motion Kit variants, Selection Copy and API Key Field. The original source is on the page; the briefs below rebuild the two variants.

---

<!-- variant: select-copy -->

# Selection Copy

Build a card of copy fields that show what was copied. Pressing the button sweeps a text selection across the value like a real drag-select, a faint copy of the text lifts off toward the clipboard, and the button flips to a drawn check with a "Copied" label. Apple-light, crisp, snappy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/copy-button/select-copy.tsx`. Named export `SelectCopy`, exported types `SelectCopyProps` and `SelectCopyField`.

## API

- `fields?: { label: string; value: string; mono?: boolean; prefix?: string }[]`. Default: `{ label: "Share link", value: "nexus-ui.com/s/8fK2-motion-kit", mono: false }` and `{ label: "Install", value: "npm i @nexus/motion", prefix: "$" }`. `mono` defaults to true. `prefix` is shown but never copied.
- `onCopy?: (value: string) => void`: called after a real press only.
- `autoplay?: boolean`, default `false`.
- `className?: string` for the card.

## Layout and look

- Card: width 440px, `max-width: 100%`, column, 20px gap, radius 28px, white, padding 20px (24px from 640px up), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark: `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)` and a deeper drop shadow.
- Each field: a label (13px, medium, `#6e6e73`, dark `#a1a1a6`, 6px below) above a row 48px high, radius 14px, `#f5f5f7` (dark `#2c2c2e`), padding-left 16px, padding-right 6px, 8px gap.
- Optional prefix: monospace 14px, muted, `aria-hidden`, flex-none.
- Value: 14.5px, `#1d1d1f` (dark `#f5f5f7`), truncates with an ellipsis, monospace when `mono`. It is wrapped in a relatively positioned inline box so the selection can sit behind it.
- Selection highlight: absolutely positioned behind the text, 2px larger than the text on every side, radius 4px, `#b3d7ff` (dark `#0a84ff` at 45%), transform origin left.
- Lift-off ghost: a copy of the value layered over it, 14.5px, `#0071e3` (dark `#0a84ff`), `aria-hidden`.
- Button: 36px high, flex-none, 6px gap, padding-x 12px, radius 10px, 13px semibold, white with `0 0 0 1px rgba(0,0,0,.08)` ring (dark: `#3a3a3c` with a white 10% ring). Content: a 16px icon slot and a text slot 46px wide, 18px high, `overflow: hidden`, left aligned. Copied state: background `#1d1d1f`, text white (dark: background `#f5f5f7`, text `#1d1d1f`), changing by a 200ms colour transition (CSS classes, not animated hex).
- Idle icon: a 16px "copy" glyph (rounded square 12x12 at 8,8 radius 3 plus an L-shaped back sheet), stroke 2, round. Copied icon: a check `M5 12.5l4.5 4.5L19 7.5`, stroke 2.6, round caps and joins.

## Motion

- States: `idle`, `selecting`, `copied`.
- Press: state `selecting` immediately, `copied` after 380ms, back to `idle` at 2200ms. Pressing again restarts all timers.
- Selection: `scaleX` 0 to 1 over 340ms, ease `[.4,0,.2,1]`, origin left. While `copied`, opacity runs `[1, 1, 0]` at times `[0, .6, 1]` over 1.6s so it fades out after the check lands. Leaving selection fades over 200ms.
- Ghost (only while `copied`): from `y 0, opacity .7, scale 1` to `y -18, opacity 0, scale .94` over 600ms, ease `[.2,0,0,1]`.
- Icon swap: `AnimatePresence mode="popLayout" initial={false}`; both icons enter from `scale .5, opacity 0` and exit to the same. The check path draws `pathLength` 0 to 1 over 250ms.
- Label swap: `Copy` to `Copied`; the entering label comes from `y 14, opacity 0`, the leaving one goes to `y -14`, spring stiffness 500, damping 34, line-height 18px.
- Button press: `whileTap { scale: .94 }`.
- Reduced motion: no ghost, no sweep (the highlight appears instantly), no tap scale, instant icon and label swaps, check shown fully drawn.

## Interaction and states

- A real press writes the full `value` to the clipboard (`navigator.clipboard.writeText`, falling back to a hidden read-only `textarea` plus `execCommand("copy")`), calls `onCopy(value)`, then plays the animation.
- The demo only plays the animation and never touches the clipboard or calls `onCopy`.

## Autoplay demo

- Each field runs its own loop: first visual copy at 900ms (first field) and 3500ms (second field; later fields 2600ms apart), then every 5200ms, so the fields alternate.
- The loop runs only while all of these hold: `autoplay` is true, the card is at least 20% on screen (`IntersectionObserver`), the tab is visible, reduced motion is off, and the visitor has not touched the card. Pointer down or any key down inside the card ends it for good. All timers are cleared when it stops or the component unmounts.

## Accessibility

- Real `button type="button"` with `aria-label="Copy {label lowercased}"`. Visible focus: 2px outline `#0071e3` (dark `#0a84ff`), 2px offset.
- A polite `role="status"` live region per field says "{label} copied" after a real press only, never for the demo.
- Decorative SVGs, ghost, selection and the prefix are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. A real press on Copy plays `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) at 60% volume. The autoplay copies play the same `success` at 60% through the same play function's `auto` variant (`play.auto("success", 0.6)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Pressing Copy sweeps a blue selection across the value left to right in about 340ms.
- [ ] A faint blue copy of the text rises about 18px and fades as the check draws.
- [ ] The button turns dark (light in dark mode) and "Copy" rolls up to "Copied", then returns after about 2.2s.
- [ ] The full value reaches the clipboard on a real press; the demo never writes to it.
- [ ] Autoplay alternates the two fields, pauses off screen and in hidden tabs, and stops for good on the first touch.
- [ ] No horizontal overflow at 320px; long values truncate.
- [ ] Reduced motion: no sweep or lift-off, state changes are instant.
- [ ] Dark mode recolours card, field, selection, button and check.

---

<!-- variant: api-key-field -->

# API Key Field

Build a secret-key row for a settings page. The key is masked with only its prefix and last four characters visible. Reveal decodes the dots into the key one character at a time, copy confirms in place, and rotate asks once inline before scrambling the whole key into a new one. The key is obviously fake demo data and nothing real can leak.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `requestAnimationFrame` for the decode, `cn` from `@/lib/utils`.
- File: `components/copy-button/api-key-field.tsx`. Named export `ApiKeyField`, exported type `ApiKeyFieldProps`.

## API

- `onCopy?: (key: string) => void`: after a real press of copy.
- `onRotate?: (key: string) => void`: after the user confirms a rotation; receives the new fake key.
- `autoplay?: boolean`, default `false`.
- `className?: string`.
- There is deliberately no prop to pass a real key. The initial key is the constant `nx_demo_Fk3pQ9xLm2WdTz7RaB4cYn8H`.

## Layout and look

- Card: width 460px, `max-width: 100%`, radius 28px, padding 20px (24px from 640px up), white with the usual hairline and soft shadow; dark `#1c1c1e` with a white 8% ring.
- Header row: space-between, 12px gap. Left: title "Secret key" (17px semibold, tracking -0.01em) and below it a clipped 18px-high line (13px, `#6e6e73`, dark `#a1a1a6`) reading "{created} · Last used 2 min ago", starting at "Created 3 months ago". Right: a "Live" pill, radius full, `#e9f9ee` background, `#1a7f37` text, 12px semibold, with a 6px `#34c759` dot (dark: 15% green background, `#30d158` text and dot).
- Key row: 16px below, 48px high, radius 14px, `#f5f5f7` (dark `#2c2c2e`), padding-left 16px, padding-right 6px, 4px gap. Contains the key in a `code` element (monospace stack `ui-monospace, 'SF Mono', Menlo, monospace`, 13.5px, tracking 0.02em, truncates), then two 36px icon buttons (radius 10px, `#6e6e73`, hover `black/5`; dark `#a1a1a6`, hover `white/10`).
- Each character is its own span: the 8-character prefix `nx_demo_` is muted grey; mask bullets are `#a1a1a6` (dark `#636366`); the rest is ink.
- Masking: every character from index 8 up to (length minus 4) becomes a bullet. The prefix and the last four stay visible.
- Reveal button: an eye icon with a slash line drawn as a path; the slash animates `pathLength` 1 (hidden key) to 0 (revealed).
- Copy button: 18px copy glyph swaps to a check drawn in `#0071e3` (dark `#0a84ff`). A "Copied" pill pops 32px above it (`#1d1d1f` on white text, 11px semibold; dark inverted). While copied, the key row gets an inset 1.5px ring in `#0071e3` (dark `#0a84ff`) via a CSS shadow transition.
- Footer row (12px below the key row), two states swapped with `AnimatePresence mode="wait"`:
  - Actions: space-between, 13px. Left text "Keep it on the server. Never ship it to a browser." (muted). Right a "Rotate" text button in `#0071e3` (dark `#0a84ff`), medium, underline on hover.
  - Confirm: a panel radius 14px, padding 12px, `#fff4f2` (dark `#ff453a` at 12%), column on narrow widths and a row from 640px up. Red text 13px "The current key stops working immediately. Anything using it will fail." (`#b42318`, dark `#ff6961`), then a 32px "Cancel" pill (white, hairline; dark `#3a3a3c`) and a 32px "Rotate key" pill (`#ff3b30`, dark `#ff453a`, white semibold text).

## Motion

- Decode (`morph(target, scramble = 1)`), driven by `requestAnimationFrame` from a start time `t0`. Per index `i >= 8`, `settle = 160 * scramble + (i - 8) * 26` ms. Before `settle - hold` the character keeps what it showed at the start; between `settle - hold` and `settle` it shows a random character from `abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ0123456789`; at `settle` it locks to the target. Stop when every position has settled. Characters come from a seeded generator, not `Math.random`.
- Reveal and hide both call `morph`; rotate calls `morph(..., 2)` (a longer scramble).
- Rotation: a seeded generator (mulberry32) with seed `1000 + rotation count * 7919` produces 24 characters from the same alphabet after the `nx_demo_` prefix. It runs inside the click handler or demo effect, never during render.
- "Created" line change: `popLayout`, new text in from `y 14, opacity 0`, old out to `y -14`.
- Copy glyph swap: scale `.4`/opacity 0 in and out, check path draws `pathLength` 0 to 1. Copied lasts 1600ms.
- Confirm panel: height 0 to auto and opacity 0 to 1, spring stiffness 380, damping 34; the actions row fades 0 to 1.
- Reduced motion: decode, slash, swaps, pill and panel all become instant; autoplay is off.

## Interaction and states

- State: `key`, displayed characters, `revealed`, `confirm`, `copied`, `created`, `touched`.
- Copy writes the (fake) key via `navigator.clipboard.writeText` with a hidden textarea fallback and calls `onCopy`. The demo only flashes the state.
- "Rotate" opens the confirm panel and moves focus to Cancel. Cancel closes it and returns focus to "Rotate". "Rotate key" generates the new key, sets "Created just now", morphs, calls `onRotate`, and returns focus to "Rotate".
- A rotation keeps the current reveal state: if revealed, the new key decodes in; otherwise it re-masks.

## Autoplay demo

Loop of 9400ms while running: reveal at 900ms; flash copied at 2600ms (no clipboard); open the confirm panel at 4000ms; rotate at 5600ms (no callback); hide at 7600ms; restart at 9400ms. It runs only while `autoplay` is on, the card is on screen, the tab is visible, reduced motion is off and nothing in the card has been pressed or typed in. Any pointer down or key down ends it for good. All timers and the animation frame are cleared on stop and unmount.

## Accessibility

- The visual characters are `aria-hidden`; a screen-reader-only span in the `code` element reads the key when revealed, or "Secret key ending in {last four}" when masked.
- Reveal: `aria-label` "Reveal key" or "Hide key", `aria-pressed`. Copy: `aria-label="Copy key"`. The confirm panel is `role="group"` labelled "Confirm key rotation".
- A polite `role="status"` region announces "Key revealed.", "Key hidden.", "Key copied to clipboard." and "Key rotated. A new demo key was created.".
- Focus ring: 2px outline `#0071e3` (dark `#0a84ff`), offset 2px; the rotate confirm button uses red.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Copy plays `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) at 60% volume. Revealing the key plays `on` and hiding it plays `off` (each a tiny noise click followed by a short sine glide, rising 600 to 900 Hz for on, falling 760 to 480 Hz for off). Confirming the rotation plays `whoosh` at 60% (a short airy noise sweep rising from about 400 to 3200 Hz over roughly 0.25s). Opening and cancelling the rotate prompt are silent. The autoplay loop plays the same sounds at the same beats (`on` when it reveals the key, `success` at 60% when it copies, `whoosh` at 60% when it rotates, `off` when it hides the key) through the same play function's `auto` variant (`play.auto("on")`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Masked by default, showing `nx_demo_` and the last four characters.
- [ ] Reveal decodes left to right with a brief scramble per character; hide folds back to bullets.
- [ ] Copy confirms in place with a drawn check, a "Copied" pill and a blue ring on the row; it resets after 1.6s.
- [ ] Rotate asks once inline; confirming scrambles into a new `nx_demo_` key and the line reads "Created just now".
- [ ] The same rotation count always yields the same key (seeded); nothing calls `Math.random` or the network.
- [ ] Focus lands on Cancel when the panel opens and returns to "Rotate" when it closes.
- [ ] Autoplay pauses off screen and in hidden tabs, and stops for good on the first touch.
- [ ] No overflow at 320px; the key truncates.
- [ ] Dark mode recolours everything, including the red panel.
