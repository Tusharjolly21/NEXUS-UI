# Runaway Button

Build a small "cancel your subscription?" dialog with a cancel button that has opinions. When the pointer comes close, the cancel button slips away to another spot in the dialog with a springy hop and a wobble, and its label gets less sure of itself each time. After four dodges it gives up, sighs back into its corner and lets you click it. Keyboard users always get a normal button. It should feel playful and springy, but never actually block anyone.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useSpring`).
- File: `components/runaway-button/runaway-button.tsx`. Named exports `RunawayButton`, `RunawayButtonProps` and `RUNAWAY_LINES`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `onCancel` | `() => void` | none | Called when the cancel button is finally activated. |
| `onKeep` | `() => void` | none | Called when "Keep my plan" is clicked. |
| `autoplay` | `boolean` | `false` | Hops the cancel button every 1.1s until someone points at it, focuses it or presses a key. |

`RUNAWAY_LINES = ["Yes, cancel", "Are you sure?", "Really?", "Fine.", "Okay, cancel"]`: the label is `RUNAWAY_LINES[min(tries, 4)]`.

## Layout and look

Constants: dialog `W = 320`, `H = 230`; button `BW = 120`, `BH = 40`; home position `x = W - BW - 20 = 180`, `y = H - BH - 20 = 170`; give-up threshold 4 tries.

- Dialog: 320×230px, relative, overflow hidden, radius 24px. Light bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -28px rgba(0,0,0,.4)`; dark bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 48px -28px rgba(0,0,0,.9)`.
- Copy block (padding 20px): heading "Cancel your subscription?" 17px semibold, tracking -0.02em, `#1d1d1f` / dark `#f5f5f7`; body "You'll lose your saved boards at the end of the month." 4px below, 13px, line-height 1.45, `#6e6e73` / dark `#a1a1a6`.
- "Keep my plan": absolute at bottom 20px, left 20px; 40px tall, 16px side padding, fully rounded, 14px medium; bg `#1d1d1f` text white, dark bg `#f5f5f7` text `#1d1d1f`.
- Cancel button: absolute at top-left 0, 120×40px, positioned only through its `x`/`y` motion values; fully rounded, centred 14px medium text; bg `#f0f0f3` text `#d70015`, dark bg `#2c2c2e` text `#ff453a`.
- End screen: fills the dialog, centred column, 12px gap, padding 24px. Message 16px semibold, ink colour: "Good call. Nothing changes." or "Cancelled. Sorry to see you go." Then a "Start over" text button, 13px medium, `#0071e3` / dark `#2997ff`, underlined when focus-visible.
- Focus-visible rings: 2px `#0071e3` (dark `#0a84ff`); "Keep my plan" also gets a 2px offset (offset colour `#1c1c1e` in dark).

## Motion

- `x` and `y` are `useSpring` values starting at home, `stiffness 260, damping 18`. Setting them makes the button spring to its new spot with a slight overshoot.
- Flee from point (px, py), in dialog coordinates: skip if already tired, if the button has keyboard focus, or if less than 260ms passed since the last flee. Sample 24 random spots with `x = 16 + random * (W - BW - 32)` and `y = 92 + random * (H - BH - 108)` (below the copy). Discard spots where `x < 165` and `y + BH > H - 72`, so the button never covers "Keep my plan". Pick the one whose centre is farthest from the point, set `x`/`y`, and increment `tries`.
- Wobble: the button animates `rotate: tired ? 0 : [0, -4, 3, (tries % 2) * 0.001]` over 0.4s. The tiny alternating last keyframe replays it on every dodge without remounting the button (remounting would drop focus).
- Give up: once `tries >= 4`, after 300ms set `x`/`y` back to home, so it springs back into its corner.
- Screen swap: `AnimatePresence mode="wait" initial={false}`. The question screen exits to `opacity 0, scale 0.96`; the end screen enters from `opacity 0, y 10`. "Keep my plan" has `whileTap` scale 0.95.

## Interaction and states

- Pointer move over the dialog (only while the question is showing): mark as touched; if the pointer is within 78px of the button's centre, flee from the pointer.
- Touch: a tap fires no move first, so touch users can simply tap the button.
- Clicking cancel shows the cancelled message and calls `onCancel`; "Keep my plan" shows the kept message and calls `onKeep`.
- "Start over" returns to the question, resets tries to 0 and sends the button home.
- Keep `tries` in state and mirror it in a ref, so timers and the flee function read the current value.

## Autoplay demo

Every 1100ms: if touched, stop for good. If tries have reached 4, send the button home and reset tries to 0. Otherwise flee from the button's own centre, so it hops to a far spot. Pointer moves, key presses in the dialog and focusing the cancel button all mark it as touched.

## Accessibility

- All controls are real `type="button"` elements. The dialog wrapper is `role="group"` labelled "Cancel your subscription?".
- On focus, record whether the cancel button matches `:focus-visible`. If it does, it never flees, and Enter or Space activate it like any button.
- A click with `event.detail === 0` came from the keyboard. Then move focus to "Start over" when the end screen mounts, and back to "Keep my plan" after starting over (use ref callbacks that focus the target once).
- The end message has `role="status"`.

## Sound

`RunawayButton` takes `enableSound?: boolean` (default `true`; `false` silences it). A mouse or pen press that lands on the cancel button while it is still dodging plays `knock` from `@/lib/ui-sounds` at 70% (two dull low thuds about 0.11s apart, a sine near 160 Hz falling to 90 Hz with a short bandpassed noise knock). The final click that actually cancels plays `success` (two soft triangle notes, C6 then E6, the second 90ms later and ringing longer). "Keep my plan" plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz in 60ms plus a faint high hiss) and "Start over" a quieter `tap` (60%). The dodging itself, which is triggered by the pointer coming near, and the autoplay hops are silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Moving the mouse toward "Yes, cancel" makes it spring away with a wobble and change to "Are you sure?".
- [ ] It never lands on top of "Keep my plan" or the copy.
- [ ] After four dodges it reads "Okay, cancel", springs back to the bottom-right and can be clicked.
- [ ] Tabbing to the cancel button and pressing Enter cancels immediately, with no dodging.
- [ ] After a keyboard cancel, focus is on "Start over"; pressing it puts focus on "Keep my plan".
- [ ] With `autoplay`, the button hops every 1.1s and resets after four hops, until you interact.
- [ ] Dark mode uses `#1c1c1e` for the dialog, `#2c2c2e` for the cancel button and `#ff453a` for its text.
