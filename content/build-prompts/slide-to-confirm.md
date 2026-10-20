Build a slide-to-confirm track for payments and other deliberate actions. A white round knob sits at the left of a soft grey pill. Drag it right and it behaves like rubber: it stretches along the track in proportion to how fast you drag and squashes back when it stops. An accent trail fills behind it and the shimmering label fades and slides away as you pull. Release past the threshold and the track floods left-to-right with green while a check draws itself in the knob. Async confirms show a spinner; failures shake and bounce back.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useVelocity`, `useSpring`, `useReducedMotion`), and a `cn` class-merge helper.
- File: `components/slide-to-confirm/slide-to-confirm.tsx`, named export `SlideToConfirm`, exported types `SlideToConfirmProps`, `SlideToConfirmSize` (`"sm" | "md" | "lg"`), `SlideToConfirmStatus` (`"idle" | "confirming" | "success"`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"Slide to confirm"` | Track text before confirming. |
| `successLabel` | `string` | `"Confirmed"` | Text once confirmed. |
| `pendingLabel` | `string` | `"Confirming"` | Text while `onConfirm`'s promise is pending. |
| `onConfirm` | `() => void \| Promise<unknown>` | – | Runs at the end. A promise shows pending; rejection bounces back. |
| `threshold` | `number` | `0.9` | Travel fraction that confirms on release. |
| `resetAfter` | `number` | `2200` | Ms after success before returning to idle; `0` stays confirmed. |
| `accent` | `string` | `#0071e3` (dark `#0a84ff`) | Trail and arrow colour (CSS var `--stc-accent`). |
| `successColor` | `string` | `"#248a3d"` | Flood colour (CSS var `--stc-success`). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | See sizes. |
| `width` | `number` | per size | Track width in px. |
| `autoplay` | `boolean` | `false` | Slides across and confirms itself (no `onConfirm`) until touched. |
| `disabled` | `boolean` | `false` | 50% opacity, ignores input, not focusable. |
| `className` | `string` | – | Extra classes on the track. |

Sizes (height / knob / default width / icon / text): sm 48 / 40 / 260 / 16 / 14px; md 60 / 52 / 300 / 18 / 16px; lg 68 / 60 / 340 / 20 / 17px. Padding `pad = (height − knob)/2`.

## Layout and look

- Track: `inline-flex`, `max-width: 100%`, fully rounded, `overflow: hidden`, `isolation: isolate`, no selection. `#f0f0f3` with `inset 0 1px 2px rgba(0,0,0,.06)`; dark `#2c2c2e` with `inset 0 1px 2px rgba(0,0,0,.4)`. Focus: 2px outline accent blue, 3px offset.
- Travel `max = max(1, min(width, measuredWidth) − knob − 2·pad)`; measure the real width with a ResizeObserver since `max-width` can squeeze it.
- Trail: from the left edge, width `x + knob + 2·pad`, fully rounded, accent background, opacity mapped from progress 0 → 1 to 0.1 → 0.28.
- Success flood: full-size layer in `successColor` revealed with `clip-path: inset(0 100% 0 0 round 999px)` → `inset(0 0% 0 0 round 999px)`.
- Label layer: centred, semibold, tracking −0.01em, left padding `knob + pad`. Idle label is gradient-clipped text: `linear-gradient(100deg, #6e6e73 0–40%, #1d1d1f 50%, #6e6e73 60–100%)` (dark `#a1a1a6` / `#ffffff`), `background-size: 250% 100%`. Pending text `#6e6e73` (dark `#a1a1a6`). Success text white, shifted left by `(knob + pad)/2` so it centres in the whole track.
- Knob: absolutely at `left: pad`, knob-sized, white (dark `#f5f5f7`) circle, shadow `0 1px 2px rgba(0,0,0,.12), 0 6px 14px -4px rgba(0,0,0,.28)`. Icon colour accent (success colour when done). Icons: arrow (shaft + head, stroke 2.2), spinner (r 7 ring at 20% + a quarter arc, stroke 2.4, CSS spin), check (stroke 2.6), icon size +2 for the check.

## Motion

- Position: motion value `x`, `progress = clamp(x/max, 0, 1)`. Label opacity maps progress 0 → 0.45 to 1 → 0; label x 0 → 26px over the full range.
- Squash and stretch: `stretchRaw = min(0.38, |velocity(x)|/2600)` → `useSpring(stiffness 520, damping 18)`; knob `scaleX = 1 + s`, `scaleY = 1 − 0.45s`; transform origin x is 0 when moving right, 1 when moving left. Pressed knob also scales to 0.94 (spring 500/26).
- Snap spring: `animate(x, target, spring stiffness 380, damping 30, carrying release velocity)`.
- Flood: clip-path spring 160/22. Success text enters from `opacity 0, y 10, scale 0.9`, spring 420/22; exits to `y −8`. Pending/idle cross-fade.
- Knob icon swap (`popLayout`, keyed by status): from `opacity 0, scale 0.4, rotate −30°` to rest, spring 520/22. Check draws `pathLength 0 → 1`, spring 220/22, delay 0.08.
- Shimmer: animate `backgroundPositionX` from 100% to −150%, 2.6s linear, infinite, 0.3s repeat delay; paused while dragging.
- Failure: snap to 0 and shake an additive offset `[0, −8, 7, −4, 3, 0]` px over 0.45s.

## Interaction and states

- Pointer down on the knob (primary button, idle and enabled): mark touched, prevent default, focus the track (trusted events, `preventScroll`), stop animations. Track move/up on `window`. Divide pointer deltas by the track's CSS scale (`rect.width / offsetWidth`). Velocity in px/s from the last move.
- Rubber band: below 0 apply ×0.2; beyond `max` add only 15% of the overshoot.
- Release: if `x/max ≥ threshold`, or `> 0.6` with velocity over 900px/s (a flick), spring to `max` then confirm; otherwise spring back to 0 with the release velocity.
- Confirm (only from idle): `navigator.vibrate(12)` if available; call `onConfirm`. Promise → status `confirming` → `success` on resolve, bounce back on reject. Sync → success. On success, schedule a reset after `resetAfter` ms (if > 0), which sets idle and springs to 0. Clear timers and stop animations on unmount.
- Keyboard: Enter or Space (no repeat) slides to the end over `0.8 × remaining fraction` seconds with ease `[0.4, 0, 0.6, 1]` and confirms; releasing early springs back to 0. Arrow Right/Up +25%, Left/Down −25%, Home to 0, End to the end; reaching the end confirms.
- Reduced motion: all springs become instant sets, no stretch, no shake, no shimmer, check appears drawn.

## Autoplay demo

Every 3.6s while untouched and idle, animate `x` to `max` with a slow spring (stiffness 60, damping 14, restDelta 0.5) and on completion show success for 1.5s (without calling `onConfirm`), then reset. Any pointer down or key press stops it.

## Accessibility

- Track `role="slider"`, `aria-roledescription="slide to confirm"`, `aria-label={label}`, `aria-valuemin 0`, `aria-valuemax 100`, `aria-valuenow` = rounded percent, `aria-valuetext` = success label, pending label or "N%". `aria-disabled` when disabled; `tabIndex −1` then. Knob and decorative layers are `aria-hidden`.

## Acceptance checklist

- Dragging fast visibly stretches the knob along the track; it squashes back when you stop.
- The trail grows and darkens behind the knob; the label fades out by about 45% travel.
- Releasing short of 90% springs back; a fast flick past 60% still confirms.
- Confirming floods the track green left-to-right and draws a check, then resets after 2.2s.
- A promise shows the spinner and pending label; a rejection shakes and returns.
- Hold Enter slides across; arrows step by quarters.
- Works when squeezed narrower than its width; dark mode recolours track, label and knob.
