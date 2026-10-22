# Magnet Select

Build a status picker where the selection is a liquid orb, not a highlight. Seven round options sit on a ring with one in the centre. Point at an option and a bead of the orb reaches toward it; pick it and the orb slides over, pushing options out of its way, while a slower tail stretches a liquid bridge that snaps off. Gooey and magnetic, but calm and precise like an Apple control.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useSpring`, `useTransform`).
- File: `components/magnet-select/magnet-select.tsx`. Named export `MagnetSelect`, plus the `MagnetOption` type and a `DEFAULT_MAGNET_OPTIONS` array.

## API

`MagnetOption = { id: string; label: string; d: string }` where `d` is SVG path data for a 24×24 stroked icon.

`MagnetSelect` props:

- `options?: MagnetOption[]`, default, in order: Focusing, In a meeting, At lunch, Travelling, Off sick, Away, Available (simple line icons: rings, camera, cutlery, plane, heart with cross, moon, check). The last sits in the centre.
- `defaultValue?: string`: id selected at first; defaults to the last (centre) option.
- `onChange?: (id: string) => void`: called when the user picks an option.
- `label?: string`, default `"Status"`: accessible name of the radio group.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 12px gap. Below the stage a label line shows the selected option's label, 14px medium, `#1d1d1f` (dark `#f5f5f7`).
- Stage: 300×300, `position: relative`. Centre `C = 150`, ring radius `R = 82`.
- Positions: with `n` options, the last one is at `(C, C)`; option `i < n − 1` is at angle `θ = (i / (n − 1)) · 2π − π/2` (starting at 12 o'clock, clockwise), so `(C + cos θ · R, C + sin θ · R)`.
- An absolutely filling SVG (300×300) draws, in order:
  - A well for each option: circle r 26, fill `#f0f0f3` (dark `#2c2c2e`).
  - A group with a goo filter and a gradient fill containing three circles: the orb (r 30), the tail (r 16) and the probe (r 13).
- Goo filter: `feGaussianBlur stdDeviation 9`, then `feColorMatrix` matrix `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10` (alpha × 24 − 10), which melts nearby circles into one blob.
- Gradient: linear, top-left to bottom-right, `#ff6fd8` → `#7b61ff` (50%) → `#30d158`. It stays the same in dark mode. Make the filter and gradient ids unique per instance (`useId`, colons stripped).
- Over the SVG, one 52×52 round button per option, absolutely placed at `(x − 26, y − 26)`. Inside, a 20×20 icon (viewBox 24, no fill, stroke width 2, round caps and joins). Stroke `#6e6e73` (dark `#a1a1a6`), white when selected, with `transition: stroke .2s`.

## Motion

Six springs, all starting at the selected position:

- Orb `(ox, oy)`: stiffness 140, damping 16.
- Tail `(tx, ty)`: stiffness 95, damping 15. Slower, so it trails the orb and stretches the goo into a bridge that pinches off.
- Probe `(px, py)`: stiffness 220, damping 20.

On selection change, retarget the orb and tail to the new centre.

**Reach.** Whenever `hover` or the selection changes: let `s` be the selected centre and `t` the hovered centre (or `s` if nothing is hovered or the hovered option is the selected one). Set the probe target to `s + (t − s) · 0.55`. The probe stretches toward the hovered option and snaps back on leave.

**Repulsion.** Each option button is offset by `x`/`y` motion values derived from the orb position every frame:

```
dx = p.x − ox; dy = p.y − oy; d = hypot(dx, dy)
if d < 1 or option is selected → 0
f = max(0, 1 − d / 95) · 14
offset = (dx / d · f, dy / d · f)
```

Options within 95px are pushed up to 14px away from the passing orb.

**Hover scale.** A hovered, unselected button animates `scale` to 1.08 (framer default spring), else 1.

**Label.** The label is keyed by the selected index and enters from `opacity 0, y 6` to `opacity 1, y 0`.

## Interaction and states

- Pointer enter or focus sets `hover`; pointer leave or blur clears it. Click picks the option and calls `onChange(id)`.
- Arrow keys on a focused option: Right/Down select the next option, Left/Up the previous (wrapping), move focus to it and call `onChange`. Use a roving tabindex: only the selected option has `tabIndex 0`, the others −1.

## Autoplay demo

With `autoplay`, the order is `[0, 2, 4, 1, 6, 3, 5]` (indices beyond the option count are dropped). Every 1700ms set `hover` to the next index, then 650ms later select it and clear `hover`, so you see the reach first and the slide second. A `touched` ref is set on pointer down, pointer enter or key down anywhere on the root; the next tick clears the interval and a pending pick is skipped. Clear the interval and the pending timeout on unmount.

## Accessibility

- The stage has `role="radiogroup"` and `aria-label={label}`. Each button has `role="radio"`, `aria-checked`, and `aria-label` = option label. The SVG is `aria-hidden`.
- Focus ring: `focus-visible` 2px `#0071e3` ring with 2px offset (dark: `#0a84ff`, black offset).
- The label line is `aria-live="polite"` so changes are announced.

## Acceptance checklist

- [ ] Six options sit evenly on an 82px ring starting at 12 o'clock, with "Available" selected in the centre.
- [ ] Hovering another option makes a small bead stretch about halfway toward it, joined to the orb by goo.
- [ ] Clicking an option slides the orb there with a slight overshoot while a slower tail leaves a stretching bridge that pinches off.
- [ ] Options near the orb's path shift up to 14px away from it and settle back.
- [ ] The selected icon turns white; the label below swaps with a small rise.
- [ ] Arrow keys move the selection around the group and focus follows.
- [ ] Autoplay previews (reach) then picks an option every 1.7s and stops for good on the first pointer or key interaction.
- [ ] Dark mode changes the wells, icon strokes and label; the orb gradient is unchanged.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Choosing a different option, by click or by arrow keys, plays `tick` from `@/lib/ui-sounds` at 60% volume (a tiny dry high click) as the orb sets off toward it.
- The autoplay loop plays the same `tick` at the same volume each time it picks a different option, through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Pointing at an option (the reach of the liquid, including the loop's ghost reach) and clicking the option that is already selected are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
