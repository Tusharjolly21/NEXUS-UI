# Morphing Dialog

Build dialogs that grow out of the button that opened them and shrink back into it when they close, so you always know where they came from. The demo is a small project header with Share and Delete buttons over a grid of placeholder tiles. Share opens a link panel with a Copy button. Delete opens a careful confirm that asks for the project name to be typed before the red button wakes up; confirming turns the header into "Project deleted" with a Restore button.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`) using shared `layoutId`s, `@/lib/ui-sounds`, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/morphing-dialog/morphing-dialog.tsx`. Named exports `MorphingDialog`, type `MorphingDialogProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `projectName` | `string` | `"orbitly-site"` | Project name; must be typed to confirm delete. |
| `pageCount` | `number` | `14` | Pages the delete text says will be removed. |
| `shareBase` | `string` | `"nexus.app/p"` | Host and path of the share link, followed by `/` and the project name. |
| `onDelete` | `() => void` | none | Called on confirm. |
| `onRestore` | `() => void` | none | Called when Restore is pressed. |
| `autoplay` | `boolean` | `false` | Demonstrates both dialogs on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | `""` | Extra classes on the frame. |

## Layout and look

- Frame: `position: relative`, flex column, height 420px, `width: 100%`, `max-width: 560px`, radius 28px, `overflow: hidden`, bg `#f5f5f7` / dark `#000` (dark adds a `rgba(255,255,255,.08)` ring). The dialogs live inside this frame, not on the page.
- Header: padding 16px, 12px gap, bg white / dark `#1c1c1e`, bottom hairline `0 1px 0 rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). A 40px logo tile (radius 12px, `#0071e3`, the first letter of the project name 15px bold white), a text column (name 15px semibold truncated, `#1d1d1f` / dark `#f5f5f7`; below it 12.5px `#6e6e73` / dark `#a1a1a6`: "Edited 3 minutes ago"), then two 36px tall pill buttons with 16px side padding, 13px medium:
  - Share: bg `#f5f5f7` / dark `#2c2c2e`, text `#1d1d1f` / dark `#f5f5f7`.
  - Delete: bg `#fff1f0` / dark `#ff453a` at 16%, text `#c4271b` / dark `#ff6961`.
- After delete the header reads "Project deleted" / "Restorable for 30 days", the two buttons are replaced by a 36px "Restore" pill (`#1d1d1f` with white text / dark `#f5f5f7` with `#1d1d1f` text).
- Body: 3-column grid of six rounded tiles (radius 14px, white / dark `#1c1c1e`), 8px gap, 16px padding, `aria-hidden`.
- Backdrop: covers the frame, `rgba(0,0,0,.25)` with a 2px backdrop blur (dark `rgba(0,0,0,.55)`).
- Dialog layer: absolute, covers the frame, centres the dialog with 16px padding. Dialog: `width: 100%`, `max-width: 400px`, padding 20px, radius 24px, white / dark `#2c2c2e`, shadow `0 30px 60px -20px rgba(0,0,0,.45)` (dark adds a white 8% ring).
- Share dialog: title "Share" (18px semibold), "Anyone with the link can view." (13.5px muted, 4px below), a 44px tall link row (radius 12px, bg `#f5f5f7` / dark `#1c1c1e`, 14px left and 4px right padding) with the URL (13.5px, truncated) and a 36px Copy button (radius 9px, white with a `rgba(0,0,0,.08)` ring / dark `#3a3a3c`, 13px semibold; shows "Copied" for 1.4s), then a right-aligned "Done" ghost pill 16px below.
- Delete dialog: title "Delete project?"; text "This removes the site and its 14 pages. Type <name in mono semibold> to confirm." (13.5px, line height 1.45, muted); a 44px input (radius 12px, mono 14px, bg `#f5f5f7` / dark `#1c1c1e`, red 2px outline on focus); right-aligned Cancel (ghost pill) and "Delete forever" (36px pill, 13px semibold, white on `#d70015`; disabled `#ffb3ae` / dark `#5c2a28` until the typed text equals the project name exactly).

## Motion

- The Share and Delete buttons, and their dialogs, share `layoutId`s (one for the container, one for the label), namespaced by a `useId` string inside a `LayoutGroup`. While a dialog is open its button is replaced by an invisible, same-sized spacer so the header does not shift. The dialog container morphs from the button's rect and radius to the dialog's with a spring: stiffness 380, damping 32; the title morphs from the button's label.
- The dialog body (everything under the title) fades in from `y 8` with a 0.12s delay and fades out over 0.08s on close.
- Backdrop: opacity 0 -> 1 and back.
- Delete forever: when the name matches, it pulses scale 1 -> 1.06 -> 1 over 0.25s and its colour changes.
- Reduced motion: no shared-layout morph; dialogs and the backdrop fade in 150ms, no pulse, no autoplay.

## Interaction and states

- Click opens a dialog and sends focus into it (Copy for Share, the input for Delete). Escape, a backdrop click, Done and Cancel close it; focus then returns to the button that opened it. Closing resets the typed text.
- While a dialog is open the header and tiles are `inert`, and Tab/Shift+Tab cycle inside the dialog.
- Copy writes the share URL to the clipboard (when available) and shows "Copied".
- Delete forever (enabled only on a match) closes the dialog, switches the header to the deleted state and calls `onDelete`. Restore switches back and calls `onRestore`.

## Autoplay demo

Only while the frame is on screen, the tab is visible and motion is not reduced, one loop of 11.8s: 0.5s reset; 1.4s open Share; 3.4s close it; 4.6s open Delete; from 5.6s type the name one character per 90ms; 7.2s confirm; 10s restore. The demo never takes keyboard focus and never copies. Any pointer press inside the frame, or typing, stops it for good.

## Accessibility

- Share is `role="dialog"`, Delete is `role="alertdialog"` with `aria-describedby` on its text; both `aria-modal="true"` and `aria-labelledby` the title. Opener buttons have `aria-haspopup="dialog"`.
- The input has `aria-label="Project name"`, no autocomplete, no spell check. A polite `sr-only` status region says "Link copied".
- Focus rings are 2px `#0071e3` (dark `#0a84ff`), red actions use `#d70015` (dark `#ff453a`).

## Sound

- Prop `enableSound?: boolean` (default `true`).
- Opening either dialog plays `lift` at 0.5 volume. Closing one with Done, Cancel, the backdrop or Escape plays `drop` at 0.5. Confirming Delete forever plays `tap` at 0.5 (and no `drop`, so one sound per action).
- Copy, Restore, typing and hovering are silent.
- The autoplay loop makes the same sounds through `play.auto` (lift on each open, drop on closing Share, tap on the confirm), which stays silent until the visitor has interacted with the page once.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Share and Delete visibly grow out of their own buttons and shrink back into them; the header does not shift.
- [ ] Escape, backdrop, Done and Cancel close; focus returns to the opener.
- [ ] Tab stays inside an open dialog; the page behind is inert.
- [ ] Delete forever is disabled until the exact project name is typed, then pulses.
- [ ] Confirming shows "Project deleted" with Restore; Restore brings the buttons back.
- [ ] Sounds: lift on open, drop on close, tap on confirm, nothing else.
- [ ] Autoplay runs the whole story, stops at first touch and does not grab focus.
- [ ] Reduced motion fades instead of morphing. Dark mode matches the colours above.
