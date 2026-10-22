# Toast Stack

Build a notification system whose toasts rest in a tidy stack. A new toast drops onto the pile squashed and springs into shape; hover or focus fans the pile out into a readable list; a toast can be flung sideways and it tilts and skids off; the front toast can count itself down and leave. It should feel like a physical pile of cards, not a column of banners.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`).
- File: `components/toast-stack/toast-stack.tsx`. Named exports: `ToastStack` (+ `ToastStackProps`), the `useToastStack` hook, and the types `ToastItem` and `ToastType`.

## API

`ToastItem`: `{ id: string; title: string; description?: string; type?: "success" | "error" | "info" | "warning"; action?: { label: string } }`. `type` defaults to `"info"`.

`ToastStack`:

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `toasts` | `ToastItem[]` | required | In arrival order; the last one is the front. |
| `onDismiss` | `(id: string) => void` | required | Called on swipe, close button, timeout, or Escape/Delete/Backspace on a focused toast. The parent removes the toast. |
| `onAction` | `(toast: ToastItem) => void` | none | Called when a toast's action button is pressed. |
| `position` | `"top" \| "bottom"` | `"bottom"` | Which edge the stack grows from. |
| `expand` | `"hover" \| "always"` | `"hover"` | Fan out on hover or focus, or stay fanned. |
| `max` | `number` | `3` | How many toasts are drawn at once. |
| `width` | `number` | `340` | Toast width in px; `max-width: 100%` so it shrinks in narrow containers. |
| `duration` | `number` | `0` | Auto-dismiss the front toast after this many ms (0 keeps toasts until closed). The countdown waits while the stack is fanned out. |
| `autoplay` | `boolean` | `false` | Fans the stack open and swipes the front toast away on a loop until someone touches it. |
| `className` | `string` | `""` | Extra classes on the wrapper. |

`useToastStack(initial?)` returns `{ toasts, push, dismiss, clear }`. `push(toast)` adds at the front and returns the id (generated when not given).

## Layout and look

- Wrapper: `<section aria-label="Notifications">`, `position: relative`, width as above. Inside, an `<ol>` with `aria-live="polite"` whose height animates to fit: collapsed `64 + (n - 1) * 12`, expanded `n * 64 + (n - 1) * 8` (toast height 64, gap 8, peek 12).
- Each toast is an absolutely positioned `<li>` pinned to the chosen edge, 64px tall, radius 18px, `z-index = max - index`.
- Surface: white / dark `#2c2c2e`, text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 14px 32px -20px rgba(0,0,0,.4)` (dark: ring `rgba(255,255,255,.08)` and shadow alpha .9). 14px horizontal padding, 12px gap, content vertically centred.
- Icon: 22px circle in the tone colour (success `#30d158`, error `#ff3b30`, info `#0a84ff`, warning `#ff9f0a`) with a white 1.9px stroke glyph (check, cross, "i", "!").
- Text: title 14px semibold, tracking -0.01em, single line truncated; description 13px `#6e6e73` / dark `#a1a1a6`, truncated.
- Action button: 28px tall pill, 13px medium, bg `#f0f0f3` / dark `#3a3a3c`, hover `#e6e6ea` / dark `#48484a`. Close button: 24px round, 10px cross glyph in `#86868b` / dark `#a1a1a6`.
- Countdown: when `duration > 0`, the front toast shows a 2px bar along its bottom edge in the tone colour at 70% opacity, scaling from 1 to 0 on the X axis from the left.

## Motion

- Stack position: toast `i` (0 = front) sits at `y = sign * i * (expanded ? 72 : 12)`, where `sign` is -1 for bottom and +1 for top, and scale `1 - i * 0.05` when collapsed (1 when expanded). Toasts at index 3 and beyond fade to 0 when collapsed. Non-front toasts hide their content (opacity 0) when collapsed.
- Arrival: from `opacity 0, y -sign*34, scaleX 1.05, scaleY 0.86` to its slot. The front toast uses a springy landing (stiffness 420, damping 22, mass 0.9); the rest re-fan with stiffness 360, damping 30.
- Swipe: the content layer drags on X only (`dragMomentum: false`), tilts -7..7 degrees across -220..220px and fades toward 0.2 at 260px. Release past 90px or 600px/s dismisses in that direction; otherwise it springs back (stiffness 500, damping 30). Only the front toast (or any toast while fanned) is draggable, and not under reduced motion.
- Exit: a swiped toast flies `dir * (width + 80)` on X, rotates `dir * 9` degrees and fades (spring stiffness 260, damping 30). A close or timeout exit shrinks to 0.9 scale and fades over 180ms. Reduced motion: a 150ms fade.
- Autoplay loop, one beat every 1.5s: open the fan, close it, swipe the front toast right (a 26px nudge, then dismiss after 380ms).

## Interaction and states

- Fan-out on pointer enter and on focus within; collapse on leave and blur. `expand="always"` keeps it open.
- Each toast is focusable (`tabIndex 0`); Escape, Delete or Backspace dismisses it. Action and close buttons stop pointer-down propagation so they never start a drag.
- The auto-dismiss countdown only runs on the front toast while the stack is collapsed and resumes from where it stopped.

## Autoplay demo

With `autoplay`, run the three-beat loop above on a 1.5s interval. A pointer press or focus inside the stack marks it touched, closes the fan and stops the loop for good.

## Accessibility

- Toast role is `alert` for errors and `status` otherwise; each has an `aria-label` of title plus description. The list is `aria-live="polite"`.
- Close buttons are labelled `Dismiss <title>`. Focus rings are 2px `#0071e3` (dark `#0a84ff`).
- Reduced motion: no drag, no squash, fades only.

## Acceptance checklist

- [ ] A pushed toast drops in squashed and springs to shape.
- [ ] With three toasts the stack shows peeking cards 12px apart, scaled down 5% each.
- [ ] Hovering or focusing fans them into a 64px list with 8px gaps and the container height eases to match.
- [ ] Dragging past 90px, or flicking, tilts and skids the toast off; a short drag springs back.
- [ ] `duration` runs a bar along the front toast and pauses while fanned.
- [ ] Escape on a focused toast dismisses it.
- [ ] Autoplay opens, closes and swipes on a loop and stops at first touch.
- [ ] Dark mode matches the colours above.

## Sound

- Prop `enableSound?: boolean` on `ToastStack` (default `true`; `false` silences it). `useToastStack(initial, { enableSound })` takes the same switch.
- Swiping a toast away, pressing its close button or pressing Escape/Delete/Backspace on it plays `swipe` from `@/lib/ui-sounds` (a short airy sweep falling from high to low; the close button and key use it at a lower volume). Pressing a toast's action button plays `tap` (a soft click).
- A toast pushed with `push(toast, { sound: true })`, meaning it answers something the user did, plays on arrival: `ping` (one high clear tone with a long tail) for info and warning, `success` (two rising soft tones) for success, `error` (two low square-wave bumps) for error. Toasts pushed without the option and the auto-dismiss countdown stay silent. In autoplay, the toast that flings itself off plays the same `swipe` through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then.
- Nothing plays on hover, focus, fan-out or drag movement; only on the release that dismisses.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- Toast Stack: Motion Kit variant brief -->

> The Toast Stack page has 2 variants. The brief above rebuilds the original Toast Stack; the sections below rebuild the Motion Kit Undo Toast and Promise Toast variants.

---

<!-- variant: undo-toast -->

# Undo Toast

Build an inbox with a real undo. Archiving a row makes it lift out of the list and shrink into a dark pill toast at the bottom, so you can see where it went. A ring around the Undo button counts down; pressing Undo drops the row back into its old position with a brief blue highlight. Archive several rows and the toast counts them up.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/toast-stack/undo-toast.tsx`. Named exports `UndoToast`, `UndoToastProps`, `UndoToastMail`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `mails` | `UndoToastMail[]` | four demo messages | `{ id: number; from: string; subject: string; time: string; hue: string }`. `hue` is the avatar colour. |
| `holdMs` | `number` | `5000` | How long the toast waits for an Undo. |
| `onArchive` | `(mail) => void` | none | Called when a row is archived. |
| `onUndo` | `(mails) => void` | none | Called with the archived rows when Undo is pressed. |
| `autoplay` | `boolean` | `false` | Archives and undoes on a loop until touched. |
| `className` | `string` | `""` | Extra classes on the card. |

Demo data: Maya Chen "Q3 roadmap, final draft" 9:41 `#ff9f0a`; Stripe "Your payout is on the way" 9:12 `#5e5ce6`; Leo Park "Pricing page feedback" Yesterday `#0a84ff`; Linear "3 issues assigned to you" Yesterday `#30d158`.

## Layout and look

- Card: `position: relative`, width 400px, `max-width: 100%`, `overflow: hidden`, radius 28px, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`).
- Header: 20px padding (8px bottom), "Inbox" 20px semibold tracking -0.02em on the left, a "Reset" text button (13px medium, `#0071e3` / dark `#0a84ff`) on the right.
- List: min-height 300px, 8px side padding, 96px bottom padding (room for the toast). Rows are radius 14px; each has 12px horizontal and 10px vertical padding and 12px gap: a 36px round avatar in `hue` with the sender's initial (14px semibold white), a text column (sender 14px semibold and time 12px `#6e6e73` / dark `#a1a1a6` on one line, subject 13px muted, truncated), and a 32px round archive icon button (60% opacity, 100% on row hover or focus; hover bg `#f5f5f7` / dark `#3a3a3c`).
- Empty list shows "All caught up", centred, 14px muted.
- Toast: absolutely positioned, centred, 20px above the card bottom, 12px side padding, `max-width: 100%`. A 52px tall pill, bg `#1d1d1f` / dark `#2c2c2e` (dark adds a white 10% ring), white text, 20px left padding and 6px right padding, 12px gap, shadow `0 18px 40px -14px rgba(0,0,0,.6)`. Text 14px: "Archived " then the subject in 60% white truncated to 84px (120px from 420px viewport width). With two or more: a rolling count then "conversations archived". Undo button: 40px tall pill, bg white 10% (15% on hover), 14px semibold, 8px left and 16px right padding, holding a 24px ring icon then the word "Undo".
- Ring icon: a 24px SVG rotated -90 degrees; a faint circle (r 9, stroke white 20%, 2px) with a white 2px round-capped circle drawn over it.

## Motion

- Rows: `AnimatePresence` with `layout`; enter from `opacity 0, height 0`, exit to the same over 250ms `cubic-bezier(.4,0,.2,1)`; otherwise spring stiffness 380, damping 34.
- Flying ghost: on archive, measure the row against the card, then render an absolutely positioned copy (avatar and sender only; white / dark `#2c2c2e`, shadow) that animates over 500ms `cubic-bezier(.3,0,.2,1)` from the row's rect and radius 14 to the toast's rect: width `min(300, cardWidth - 24)`, height 52, radius 26, centred horizontally at `cardHeight - 72`. Its opacity fades to 0 over 200ms starting at 320ms. Remove it on completion.
- Toast: `AnimatePresence`; enter from `y 30, opacity 0, scale .9`, spring stiffness 420, damping 30, delayed 300ms while a ghost is flying; exit to `y 30, opacity 0, scale .95` over 220ms. Layout animation lets the pill resize when the wording changes.
- Count: when it changes, the number rolls vertically (`y: 100% -> 0`, old one to `-100%`, spring stiffness 500, damping 34) inside a clipped 1.3em box. The count is blank for a single item.
- Ring: a `pathLength` animation from 1 to 0 over `holdMs`, linear, restarted whenever a new item is archived. While the toast is hovered or has focus inside, it snaps back to 1 over 200ms and the timeout pauses; on leave it restarts from the full duration.
- Restore: a blue wash on the restored rows (`rgba(0,113,227,.08)`, dark `rgba(10,132,255,.16)`) fades in and out over 600ms, then clears after 900ms.
- Reduced motion: no ghost, no layout animation, short fades.

## Interaction and states

- Archive removes the row, appends it to the batch, restarts the toast timer and calls `onArchive`.
- Undo puts every batched row back in its original order at its original position, clears the batch, highlights the rows and calls `onUndo`.
- When the timer elapses without a pause, the batch clears and the toast leaves (the archive is final). Reset restores the list.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: loop every 6.2s: at 1.4s archive the second row, at 3.6s press Undo. Any pointer press inside the card stops the loop for good.

## Accessibility

- Row archive buttons are labelled `Archive <subject>` and show a focus ring when focused. The toast text is `aria-hidden`; a persistent `sr-only` polite `role="status"` region announces "Archived <subject>" or "<n> conversations archived".
- The toast is a `role="group"` labelled "Archive undo"; Undo is a real button reachable by Tab, and focus inside pauses the countdown. Focus rings are 2px `#0071e3` (dark `#0a84ff`) with 2px offset.

## Acceptance checklist

- [ ] Archiving makes a copy of the row fly into the toast while the row collapses.
- [ ] The Undo ring drains over 5s and pauses on hover or focus.
- [ ] Archiving a second row makes the toast read "2 conversations archived" with the number rolling in.
- [ ] Undo returns rows to their original positions with a blue wash.
- [ ] After 5s untouched the toast leaves and the rows stay archived.
- [ ] The toast never overflows a 320px card.
- [ ] Autoplay archives and undoes on a loop, and stops for good on touch.
- [ ] Dark mode uses the dark card, a raised toast and the brighter blue.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing a row's archive button plays `ping` (one high clear tone with a long tail) as the toast appears. Pressing Undo plays `drop` (a short falling thump with a soft landing) as the row drops back.
- The autoplay archive/undo loop plays the same sounds: `ping` as it archives a row and `drop` as it undoes it, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The countdown, the timeout and Reset are silent, and nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- variant: promise-toast -->

# Promise Toast

Build a toast that follows a promise from start to finish instead of popping up at the end. A dark pill appears while work runs, showing each step in turn with the progress filling behind the words. The pill resizes smoothly as the wording changes and lands on either a success state with the live link and a Visit button, or a failure state with the error and a View logs button. A small "deploy" demo drives it.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/toast-stack/promise-toast.tsx`. Named exports `PromiseToast`, `PromiseToastProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `onVisit` | `() => void` | none | Called when Visit is pressed. Nothing navigates by itself. |
| `onViewLogs` | `() => void` | none | Called when View logs is pressed. |
| `autoplay` | `boolean` | `false` | Runs a good deploy, then a failing one, on a loop until touched. |
| `className` | `string` | `""` | Extra classes on the wrapper. |

## Layout and look

- Wrapper: a column, centred, 24px gap, width 420px, `max-width: 100%`.
- Stage card: full width, 200px tall, radius 28px, `overflow: hidden`, white / dark `#1c1c1e`, 20px padding, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.3)` (dark ring `rgba(255,255,255,.08)`). A caption "nexus-ui / marketing-site" sits top-left (20px from the left, 16px from the top), 12px medium, `#6e6e73` / dark `#a1a1a6`. The toast sits at the bottom centre.
- Toast pill: radius 26px, `overflow: hidden`, bg `#1d1d1f` / dark `#2c2c2e` (dark adds a white 10% ring), white text, `max-width: 100%`, shadow `0 20px 40px -16px rgba(0,0,0,.55)`.
  - Progress fill: an absolutely positioned layer covering the pill, `transform-origin: left`, scaled on X from 0 to the progress value. Colour `rgba(255,255,255,.12)` while running, `rgba(255,69,58,.28)` on failure, `rgba(48,209,88,.24)` on success.
  - Top row: padding 12px top and bottom, 14px left, 20px right, 12px gap. A 24px icon slot, the label (14.5px medium, 20px line, no wrap), and while running a percentage (13px, tabular, 50% white).
  - Result row (only after it finishes): 8px gap, 14px side padding, 12px bottom padding. Success: a truncating chip "marketing.nexus.app" (monospace 12px, 80% white, bg white 10%, fully rounded, 12px by 6px padding) pushed left, and a Visit button (32px tall pill, white bg, `#1d1d1f` text, 13px semibold). Failure: red-pink text "pricing.tsx:42 · Unexpected token" (monospace 12px, `#ff9f9a`) and a View logs button (32px pill, white 10% bg, 13px semibold).
- Below the card, two buttons centred with 8px gap and wrapping: Deploy (40px tall pill, `#1d1d1f` bg and white text; dark `#f5f5f7` and `#1d1d1f`) and Deploy with a bug (white bg, `#1d1d1f` text, hairline ring; dark `#2c2c2e` and `#f5f5f7`). 14px medium, 20px side padding.

## Motion

- Steps (label, progress target, time before the next step): "Installing dependencies" 0.22 / 900ms, "Building 48 pages" 0.64 / 1500ms, "Uploading to the edge" 0.92 / 1000ms. A run starts at progress 0.04 with the first label, enters step `i` after 120ms plus the earlier step times, then resolves when the last step finishes. A failing run skips the third step and resolves one step earlier.
- Resolve: success sets progress to 1 and the label "Deployed to production"; failure holds progress and sets "Build failed with 2 errors". The toast leaves 4.2s after resolving.
- Toast: enter from `y 40, opacity 0, scale .9`, spring stiffness 380, damping 30; exit to `y 24, opacity 0, scale .95` with a 4px blur over 250ms. On failure it shakes on X (`0, -8, 7, -4, 0` over 400ms). The pill uses `layout` so it resizes when the label changes, and the top row uses `layout="position"`.
- Label: rolls like a slot: new text enters from `y 16, blur 4px, opacity 0`, the old one leaves to `y -16`, spring stiffness 420, damping 34, in a clipped 20px box.
- Progress fill: spring stiffness 60, damping 20 on `scaleX`. On resolve it fills to 1 then dims to 50% opacity over 1.2s.
- Icon (24px slot): running is a spinner (a faint 22px ring with a white quarter arc, 0.9s per turn, linear); success is a `#30d158` disc with a white check that draws in (pop with spring stiffness 500, damping 18, stroke delay 120ms); failure is a `#ff453a` disc with a white cross drawn the same way.
- Result row fades and slides in from `y -6` after a 150ms delay.
- Reduced motion: fades only, no shake, no slot roll, no layout animation.

## Interaction and states

- State machine: `idle` (no toast) -> `running` (step 0..2) -> `ok` or `fail` -> `idle`. Starting a new run clears the old timers and replaces the toast.
- Deploy runs the success path; Deploy with a bug runs the failing path. Visit and View logs only call their callbacks.

## Autoplay demo

Only while the component is on screen, the tab is visible and motion is not reduced: start a run 0.7s after mounting, then every 8.2s, alternating success and failure. Any pointer press inside the component stops it for good.

## Accessibility

- A persistent `sr-only` polite `role="status"` region carries the current label; the visible animated label and percentage are `aria-hidden`. The toast itself is a `role="group"` labelled "Deploy progress". The icon is decorative.
- Deploy, Deploy with a bug, Visit and View logs are real buttons with a 2px focus ring (`#0071e3`, dark `#0a84ff`; white 70% inside the dark pill) at 2px offset.

## Acceptance checklist

- [ ] The pill shows "Installing dependencies", "Building 48 pages", "Uploading to the edge" in turn, each rolling in.
- [ ] The percentage and the fill behind the words climb together.
- [ ] The pill grows and shrinks smoothly as the label width changes.
- [ ] Success ends with a green check, "Deployed to production", the domain chip and Visit.
- [ ] Failure shakes, shows the red cross, "Build failed with 2 errors", the error line and View logs.
- [ ] The toast leaves about 4s after finishing.
- [ ] Nothing navigates; the callbacks fire.
- [ ] Autoplay alternates success and failure and stops for good on touch.
- [ ] Fits a 320px container without horizontal overflow.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing Deploy or Deploy with a bug plays `ping` (one high clear tone with a long tail) as the pill appears. When that run finishes, success plays `success` (two rising soft triangle tones) and failure plays `error` (two low square-wave bumps), timed with the icon change.
- The autoplay loop plays the same sounds: `ping` as each run starts and `success` or `error` when it lands, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The step changes, Visit and View logs are silent; nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
