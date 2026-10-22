# Elastic Stepper

Build a pill-shaped number stepper (minus, value, plus) where the digit rolls in the direction you pressed, a row of dots below tracks the value, and pushing past either limit makes the whole pill give a little and pull back like a rubber band. The feel is physical and Apple-like: tight springs, a soft blur on the rolling digit.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`).
- File: `components/elastic-stepper/elastic-stepper.tsx`, named export `ElasticStepper`, plus exported `ElasticStepperProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"Guests"` | What is counted; used in the group label, button labels and caption. |
| `min` | `number` | `1` | Lowest value. |
| `max` | `number` | `8` | Highest value. |
| `defaultValue` | `number` | `2` | Starting value (uncontrolled). |
| `onChange` | `(v: number) => void` | – | Called with the new value after each successful step. |
| `accent` | `string` | `"#0071e3"` | Filled dots and focus outline. |
| `autoplay` | `boolean` | `false` | Counts up and down by itself until someone interacts. |

## Layout and look

- Root: column, items centred, 16px gap. Define `--es-off` `#d2d2d7` (dark `#48484a`).
- Pill: row, items centred, 20px gap, fully rounded, 6px padding, white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -16px rgba(0,0,0,.3)`. Dark: `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08)`. It has `role="group"` and `aria-label={label}`.
- Buttons: 44×44 circles, background `#f0f0f3` (hover `#e8e8ed`), icon `#1d1d1f`. Dark: `#3a3a3c` (hover `#48484a`), icon `#f5f5f7`. 16px icon, stroke 2.6, round caps: minus `M5 12h14`, plus `M12 5v14M5 12h14`.
- Value window: 48px wide, 44px tall, `overflow-hidden`, centred; 28px semibold, tabular numbers, letter-spacing −0.03em, `#1d1d1f` (dark `#f5f5f7`).
- Dots: row with 6px gap, one per value from `min` to `max`. Each is 6px tall and fully rounded. Width 18px for the current value, 6px otherwise. Colour `accent` for values ≤ current, `var(--es-off)` above it (200ms CSS colour transition). Decorative (`aria-hidden`).
- Caption: 13px `#86868b` (dark `#98989d`): `"{label}, between {min} and {max}. Push past either end."`

## Motion

- **Digit roll**: the number is a `motion.span` keyed by value inside `AnimatePresence mode="popLayout" initial={false} custom={dir}` where `dir` is `+1` for plus and `−1` for minus. Variants:
  - `enter(d)`: `y = d·28, opacity 0, scale 0.6, blur(4px)`
  - `center`: `y 0, opacity 1, scale 1, blur(0)`
  - `exit(d)`: `y = −d·28, opacity 0, scale 0.6, blur(4px)`
  Spring stiffness 520, damping 30. So pressing plus brings the new number up from below while the old one leaves upward; minus is the reverse. Pass `custom` to both the presence and the child so the exiting element uses the latest direction.
- **Rubber band at a limit**: when `value + d` would leave `[min, max]`, do not change the value; instead run on the pill (via animation controls) `x: [0, d·9, d·−3, 0]` and `scaleX: [1, 1.04, 0.99, 1]`, duration 0.45s, `easeOut`. It leans 9px toward the pressed side, rebounds 3px, settles.
- **Dots**: width springs (stiffness 500, damping 30), `initial={false}`.
- **Buttons**: `whileTap { scale: 0.85 }`; opacity animates to 0.35 when at their limit, 1 otherwise.

## Interaction and states

- Keep the value in state and mirror it in a ref; `step(d)` reads the ref so repeated fast calls (autoplay, rapid clicks) never use a stale value. On a valid step update the ref, set `dir`, set the value, call `onChange`.
- The limit buttons look dimmed but stay enabled, so pressing them still triggers the rubber band. That is the point of the component; do not use `disabled`.
- Clicks mark the component as touched.

## Autoplay demo

With `autoplay`, every 520ms step through the sequence `+1 ×7, −1 ×8` and repeat. With the defaults (start 2, range 1–8) it climbs to 8, bumps the top limit once, falls to 1, bumps the bottom limit, and loops. Once a button is clicked the next tick clears the interval.

## Accessibility

- Buttons are native `button type="button"` with `aria-label` "Add one {label lowercased}" / "Remove one {label lowercased}" (e.g. "Add one guests").
- The value window is `aria-live="polite"` so changes are announced.
- Focus-visible: 2px `accent` outline, 2px offset. Space/Enter work via the native buttons.

## Acceptance checklist

- [ ] Plus rolls the new number in from below with blur; minus rolls it in from above.
- [ ] Rapid clicks never skip or double-count.
- [ ] At `max`, plus dims to 35% opacity; pressing it shakes the pill right and back without changing the value. Same leftward at `min`.
- [ ] The current dot widens to 18px; dots at or below the value are accent-coloured.
- [ ] `onChange` fires only on real changes.
- [ ] Caption reads with the given label and range.
- [ ] Autoplay climbs, bumps, descends, bumps, and stops after the first click.
- [ ] Dark mode colours match the values above.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing plus plays `tap` from `@/lib/ui-sounds` at 60% volume (a short soft thump that falls in pitch, with a hint of click). Pressing minus plays `tick` at 50% (a tiny dry high click), so up and down sound a little different. Only a press that changes the number plays: pushing past the min or max, where the stepper rubber-bands, is silent.
- The autoplay count plays the same sounds for each step it takes (`tap` going up, `tick` going down, same volumes; the rubber-band at the limits stays silent), through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Hover is silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
