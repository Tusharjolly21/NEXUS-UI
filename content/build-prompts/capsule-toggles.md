# Capsule Toggles

Build a toggle switch that looks like a ball sealed in a glass capsule, plus a settings panel that uses it. Flipped, the ball shoots to the other end, stretching into a pill mid-flight, and takes on the row's colour with a glow as it lands; each row's status dot lights in the same colour. Glassy, quick and springy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`).
- File: `components/capsule-toggles/capsule-toggles.tsx`, with two named exports: `CapsuleToggle` (the switch) and `CapsuleToggles` (the panel). Also export the types `CapsuleToggleProps`, `CapsuleTogglesProps` and `CapsuleToggleRow`.

## API

**`CapsuleToggle`** (controlled):

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `checked` | `boolean` | required | Whether the switch is on. |
| `onChange` | `(v: boolean) => void` | required | Called with the new value when pressed. |
| `label` | `string` | required | Accessible name of the switch. |
| `onColor` | `string` | `"#34c759"` | Ball colour and glow when on. Use a hex colour; the glow appends alpha `88`. |
| `offColor` | `string` | theme grey | Ball colour when off; defaults to `#c7c7cc` (dark `#636366`). |

**`CapsuleToggles`** (owns its own state):

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `rows` | `CapsuleToggleRow[]` | Wi-Fi, Bluetooth, Focus, Low Power | Rows as `{ id, label, hint, color, on }`; `hint` shows while on, `on` is the initial state. |
| `title` | `string` | `"Controls"` | Small heading above the list. |
| `autoplay` | `boolean` | `false` | Flips the rows one after another until the user touches the panel. |

Default rows: Wi-Fi "Home network" `#0a84ff` on; Bluetooth "2 devices" `#5e5ce6` off; Focus "Until 6 PM" `#bf5af2` on; Low Power "Battery saver" `#ff9f0a` off.

## Layout and look

**Capsule (track)**: a `<button>` 74 × 38px, fully rounded, `flex-none`. Light: background `linear-gradient(180deg, rgba(255,255,255,.65), rgba(235,235,240,.5))`, shadow `inset 0 1px 1px rgba(255,255,255,.9), inset 0 -2px 4px rgba(0,0,0,.06), inset 0 0 0 1px rgba(0,0,0,.08), 0 6px 14px -8px rgba(0,0,0,.25)`. Dark: `linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04))`, shadow `inset 0 1px 1px rgba(255,255,255,.14), inset 0 -2px 4px rgba(0,0,0,.3), inset 0 0 0 1px rgba(255,255,255,.1), 0 6px 14px -8px rgba(0,0,0,.7)`. Define the off grey as a CSS variable on the button (`--ct-off: #c7c7cc`, dark `#636366`) so the `dark:` variant on a `.dark` ancestor switches it.

**Ball**: absolutely positioned, top 5px, 28px tall, fully rounded, overflow hidden, background `offColor` (or `--ct-off`). Resting `left` is 5px (off) or 41px (on), width 28px. Inside it, an overlay filled with `onColor` whose opacity is 1 when on and 0 when off, with `inset 0 1px 2px rgba(255,255,255,.7)`. The ball's own shadow is `inset 0 1px 2px rgba(255,255,255,.7)` plus, when on, an outer glow `0 0 14px 2px {onColor}88` (when off the glow is `0 0 0 0 rgba(0,0,0,0)` so it can animate).

**Glass highlight**: above the ball, a no-pointer-events strip inset 8px left and right, top 3px, 11px tall, fully rounded, `linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,0))` (dark `.28` to 0). The ball slides under it, which sells the "sealed in glass" look.

**Panel**: 320px wide, radius 22px, overflow hidden. Light `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.

- Heading (`h3`, no margin): `px-5`, 16px top, 4px bottom, 13px semibold uppercase, tracking 0.08em, `#86868b` (dark `#8e8e93`).
- List (`ul`, no bullets or padding) with 1px dividers `#f0f0f3` (dark `#2c2c2e`). Each row: `px-5 py-3`, gap 12px, items centred:
  - status dot: 10px circle, base `#d2d2d7` (dark `#48484a`), with an overlay in the row colour at opacity 1 when on, 0 when off;
  - text column (flex 1): label 15px medium `#1d1d1f` / `#f5f5f7`; below it 12px `#86868b` / `#8e8e93` showing `hint` when on, "Off" when off;
  - a `CapsuleToggle` with `onColor = row.color`.

## Motion

- **Ball travel**: `left`, `width`, `x` and `boxShadow` animate on one spring, `stiffness 520, damping 30`.
- **Stretch**: whenever `checked` changes (from a click or from the parent), set a `flying` flag for 260ms. Detect the change during render by comparing with the previous `checked` (derived state), so it also fires for external changes. While flying, width is 44px; when travelling to on, also apply `x: −16px`, so the pill's right edge leads toward the right end while its left edge trails; when travelling to off, `x` stays 0 and the pill stretches from the left end. After 260ms, width returns to 28 and `x` to 0, so the pill contracts into a ball at its destination.
  ```
  left = checked ? 41 : 5;  width = flying ? 44 : 28;  x = flying && checked ? −16 : 0
  ```
- **Colour wash**: the `onColor` overlay fades in or out over 0.35s with a 0.08s delay, so the colour changes as the ball arrives rather than as it leaves. The glow animates with the spring.
- **Status dot**: the colour overlay fades over 0.35s; when a row turns on, the dot pulses scale `[1, 1.5, 1]` over 0.35s.
- `initial={false}` on the ball and overlays so nothing animates on mount.

## Interaction and states

- `CapsuleToggle` calls `onChange(!checked)` on click. Space and Enter work through the native button.
- `CapsuleToggles` keeps a map `id → boolean`, initialised from each row's `on`.
- Any pointer-down or key-down inside the panel marks it touched.

## Autoplay demo

Every 900ms, flip the next row in order (wrapping around), reading the latest `rows` from a ref. As soon as the panel has been touched, the interval clears itself. With an empty `rows` array it does nothing.

## Accessibility

- Switch: `<button type="button" role="switch">` with `aria-checked` and `aria-label={label}`; focus-visible 2px ring `#0071e3` with 2px offset (dark ring `#0a84ff`, offset colour `#1c1c1e`).
- Panel: `role="group"` with `aria-labelledby` pointing at the heading (id generated with `useId`).
- Status-dot overlays are `aria-hidden`; the on/off sub-label is real text.

## Acceptance checklist

- Clicking an off switch makes the grey ball stretch into a 44px pill toward the right, then settle as a 28px ball at the right end, turning the row colour with a soft glow.
- The colour change visibly lags the start of the travel by a beat.
- Turning it off reverses the motion and the glow disappears.
- The stretch also happens when `checked` is changed by the parent.
- Each row's dot lights and pulses in its colour, and the sub-label swaps between the hint and "Off".
- Tab focuses each switch with a visible ring; Space toggles it.
- With `autoplay`, rows flip one by one every 0.9s until the panel is touched.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it) on both `CapsuleToggles` and `CapsuleToggle`; the panel passes it down to every switch.
- Turning a switch on by clicking or pressing Space plays `on` from `@/lib/ui-sounds` (a short latch click followed by a quick blip that rises slightly in pitch). Turning it off plays `off` (a slightly softer click and a blip that falls in pitch).
- The switch's own click plays a sound. The autoplay flips play the same `on` / `off` sounds through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. A parent changing `checked` is silent, and so is hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
