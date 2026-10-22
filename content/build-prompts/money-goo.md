# Money Goo

Build a peer-to-peer payment toy. The sender's avatar is a liquid blob holding an amount like "$40". Drag it out and a gooey neck stretches, thins and snaps; drop it on the friend and it pours in, the friend's avatar pulses and both balances roll. Release elsewhere and it springs home. Soft, liquid, satisfying.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `AnimatePresence`).
- The goo comes from an SVG filter (blur plus alpha threshold) applied to a layer of plain coloured circles. No canvas.
- File: `components/money-goo/money-goo.tsx`, named export `MoneyGoo`. Also export the `MoneyGooPerson` type (`{ name: string; initials: string; balance: number }`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `amount` | `number` | `40` | Amount carried by the blob on each send. |
| `from` | `MoneyGooPerson` | `{ name: "You", initials: "ME", balance: 248 }` | Sender and starting balance. |
| `to` | `MoneyGooPerson` | `{ name: "Maya", initials: "MK", balance: 112 }` | Recipient, initials shown in the avatar, starting balance. |
| `accent` | `string` | `"#0071e3"` | Colour of the goo, the blob and the drop-target ring. |
| `autoplay` | `boolean` | `false` | Sends money by itself on a loop until the user drags. |

## Layout and look

Root: centred column, gap 16px. Below the stage a caption "Drag the amount onto {to.name}." at 13px, `#86868b` (dark `#98989d`).

Stage: 420 × 240px (max-width 100%), relative, `touch-action: none`, no text selection. Fixed points in stage coordinates: sender `A = (80, 110)`, recipient `B = (340, 110)`.

Layers, back to front:

1. **Goo filter** (hidden zero-size SVG, id made unique with `useId`): `feGaussianBlur stdDeviation 8`, then `feColorMatrix` with values `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10` (alpha × 24 − 10, which re-sharpens the blurred shapes and fuses nearby ones).
2. **Goo layer** (full stage, filter applied, `aria-hidden`), all circles filled with `accent`:
   - the sender avatar: a 72px circle centred on A;
   - three neck beads, 34px each, at 25%, 50% and 75% of the way from A to the blob;
   - the blob: a 54px circle centred on the drag position `(x, y)`.
3. **People** (no pointer events): a 100px-wide column centred on each point, top at `point.y − 36`. A 72px circle (sender: transparent and empty, since the goo disc is the avatar; recipient: `#1d1d1f`, dark `#3a3a3c`, with initials at 20px semibold white). Below, 12px gap, the name at 14px semibold `#1d1d1f` / `#f5f5f7`, then the balance "$248" in a 20px-tall overflow-hidden slot at 13px tabular-nums `#6e6e73` / `#a1a1a6`.
4. **Amount button**: a 54px circle with no background, centred on `(x, y)` over the blob, label "${amount}" at 15px semibold white, `cursor-grab` (`grabbing` while active). Focus-visible: 2px ring in `accent`, 2px offset (offset colour black in dark mode).
5. **Drop ring**: a 92px circle centred on B, 2px dashed `accent` border, no pointer events.

## Motion

- **Drag position**: `x`, `y` motion values in stage coordinates, starting at A. `dist = hypot(x − A.x, y − A.y)`.
- **Beads**: bead at fraction t sits at `A + (blob − A) × t`, and scales with `dist` through `[0, 60, 150, 175] → [1, 0.75, 0.32, 0]` (clamped). By 175px the neck has vanished: that is the snap.
- **Blob scale**: `dist [0, 30, 200] → [0.6, 1, 0.92]`, so at rest the blob is mostly hidden inside the avatar and swells as it emerges.
- **Holding**: the amount button scales to 1.1 while held. The drop ring fades in over 0.2s, pulses scale `[1, 1.06, 1]` over 1s on repeat, and rotates 360° every 6s linearly. Not holding: opacity 0, scale 0.9.
- **Successful drop** (released within `58 + 30 = 88px` of B): spring `x` and `y` to B (`stiffness 300, damping 22`). When it lands, apply the transfer and snap `x, y` back to A instantly.
- **Missed drop**: spring `x` and `y` back to A with `stiffness 260, damping 16` (a bouncy return; the neck re-forms as it gets close).
- **Transfer**: sender balance −amount, recipient +amount, and a send counter +1. The recipient avatar pulses scale `[1, 1.18, 1]` over 0.45s (re-key it with the counter so it replays every time).
- **Balances**: `AnimatePresence mode="popLayout" initial={false}`, keyed by value. The sender's number rolls down (enter from `y −16`, exit to `y 16`); the recipient's rolls up (enter from `y 16`, exit to `y −16`); opacity 0 → 1.

## Interaction and states

- Pointer-down on the amount button: mark touched, start dragging, set holding, and capture the pointer on the stage so moves outside the button still count.
- Pointer-move on the stage while dragging: convert to stage coordinates (scale by 420 × 240 against the bounding box, so a narrower stage still works) and set `x`, `y` directly.
- Pointer-up or pointer-cancel: run the drop logic above.
- Keyboard: Enter or Space on the button (with `preventDefault`) marks touched and springs `x` to B (`stiffness 200, damping 20`), then applies the transfer and resets `x`.
- Balances are not clamped; repeated sends can take the sender below zero.

## Autoplay demo

900ms after mount and every 4200ms after, unless the user has touched it: animate `x` through `[A.x, A.x + 60, A.x + 150, B.x − 40, B.x]` and `y` through `[A.y, A.y − 40, A.y − 30, A.y]`, both over 1.6s `easeInOut`, so the blob stretches out in an arc and lands on the recipient. Then apply the transfer and reset to A. A press or key on the button stops the loop.

## Accessibility

- The amount is a real `<button type="button">` with `aria-label="Send ${amount} to {to.name}. Drag onto {to.name}, or press Enter."`.
- The goo layer, filter SVG and drop ring are `aria-hidden`. Balances are plain text.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. When the visitor's drag lands on the friend (or Enter or Space sends it) and the money goes across, `paid` plays (three soft triangle notes climbing 1318 Hz, 1568 Hz, 2093 Hz, 65ms apart, the last ringing about 0.3s). Stretching the goo and letting go short of the friend make no sound. Each autoplay send plays the same `paid` when the money goes across. Autoplay uses the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. It is still silent on hover, and it follows `enableSound` and the site-wide switch. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Dragging pulls a blob out with a fused, liquid neck that thins and disappears by about 175px.
- The dashed ring around the recipient appears, pulses and rotates only while holding.
- Dropping within 88px of the recipient snaps the blob in, pulses the avatar and rolls both balances by `amount`.
- Dropping elsewhere springs the blob back with a visible bounce and the neck re-forms.
- Enter on the focused button sends without dragging.
- Works when the stage is scaled down by `max-width: 100%`.
- With `autoplay`, a send plays every 4.2s until the first press.
