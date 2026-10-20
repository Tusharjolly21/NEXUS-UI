# Hop Labels

Build a small form of outlined text fields whose label works as the placeholder until you focus. On focus the label lifts up into the top border, shrinks, and a little hop runs along its letters one after another, while the outline opens a gap (a notch) just wide enough for it. The email field checks itself when you leave it: a quick shake and a red message if it is wrong, a green tick that pops in if it is right. It should feel crisp and Apple-like, with snappy springs and nothing heavy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/hop-labels/hop-labels.tsx`. Named exports `HopLabels` (the demo form) and `HopField` (one field), plus `HopLabelsProps` and `HopFieldProps`.

## API

`HopLabels`

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#0071e3"` | Outline and label colour while a field is focused. |
| `autoplay` | `boolean` | `false` | Types a name and an email into the form by itself, until someone touches it. |

`HopField`

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | required | Label text. |
| `type` | `string` | `"text"` | Input type. |
| `validate` | `(value: string) => boolean` | none | Runs once the field has a value. |
| `errorMessage` | `string` | `"That doesn't look like an email."` | Shown under the field when `validate` fails. |
| `accent` | `string` | `"#0071e3"` | Focus colour. |
| `demo` | `string` | none | When set, the field focuses itself and types this text one letter at a time. |

`HopLabels` renders three fields: "Full name"; "Email address" (`type="email"`, validated with `/^\S+@\S+\.\S+$/`); "Company (optional)".

## Layout and look

- Form card: 300px wide, vertical flex with 24px gap, padding 24px, radius 24px. Light: bg `#ffffff`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark (`.dark` ancestor): bg `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`. `onSubmit` prevents default.
- Field wrapper: `position: relative`. Define CSS variables on it so colours follow the theme: `--hl-err` `#d70015` / dark `#ff453a`, `--hl-idle` `#c7c7cc` / dark `#48484a`, `--hl-muted` `#86868b` / dark `#8e8e93`.
- Outline: an absolutely positioned `<fieldset>` filling the field (`aria-hidden`, `pointer-events: none`, margin 0, radius 14px, horizontal padding 12px). Border is `1.5px solid` idle, `2px solid` focused; colour is `var(--hl-err)` when invalid, the accent when focused, otherwise `var(--hl-idle)`. CSS transition on `border-color, border-width` 200ms.
- Notch: a `<legend>` inside the fieldset with height 0, padding 0, overflow hidden, 12px font. Its width animates (see Motion); a legend with width cuts a gap in the top border.
- Input: 56px tall, full width, radius 14px, transparent bg, padding 16px sides and 4px top, 16px text, `#1d1d1f` / dark `#f5f5f7`, no outline.
- Label: absolute at `left: 16px; top: 50%`, `transform-origin: left`, pointer-events none, 16px text. Colour: `var(--hl-err)` invalid, accent focused, `var(--hl-muted)` otherwise, with a 200ms CSS colour transition. Inside it, a span (measured, see below) holding one inline-block `white-space: pre` span per character.
- Tick: 20px circle `#30d158` at right 16px, vertically centred, with an 11px white check (`M5 12.5l4.5 4.5L19 7.5`, stroke width 3.4, round caps and joins).
- Error text: absolute at `bottom: -20px; left: 16px`, 12px, `var(--hl-err)`.

## Motion

- Measure the label span's `offsetWidth` with a `ResizeObserver` (re-measures when fonts load) and store it as `lw`.
- `up` = focused or has a value. Label animates `y: up ? -38 : -10`, `x: up ? -4 : 0`, `scale: up ? 0.78 : 1`, spring `stiffness 520, damping 32`, `initial={false}`.
- Notch width: `up ? lw * 0.78 + 8 : 0`, spring `stiffness 500, damping 36`, `initial={false}`.
- Letter hop: each letter span is keyed by `` `${index}-${up}` `` so it remounts whenever `up` flips, then animates `y: [0, up ? -7 : 5, 0]` over 0.32s, `easeOut`, delay `index * 0.022s`. Going up the letters hop up; going down they dip.
- Shake: the field wrapper animates `x: [0, -6, 5, -3, 0]` over 0.35s when invalid, else `x: 0`.
- Tick: inside `AnimatePresence`, scale 0 → 1 → 0 on exit, spring `stiffness 600, damping 18`; its path draws `pathLength 0 → 1`.
- Error text: inside `AnimatePresence`, from `opacity 0, y -4` to `opacity 1, y 0`; exits to opacity 0.

## Interaction and states

- Controlled input. `ok = validate ? (value ? validate(value) : null) : null`. Invalid (`bad`) means `ok === false` and the field is not focused, so errors only show after blur, and disappear while you edit.
- Fields without `validate` never show a tick or error.
- Demo typing (`demo` prop): set focus to true (on a 0ms timeout), then every 70ms append the next character; after the last character wait 500ms and set focus back to false. Clear all timers on cleanup. This is a visual focus only; it does not move real focus.

## Autoplay demo

With `autoplay`, `HopLabels` sets the name field's demo to "Ada Lovelace" at 600ms and the email field's to "ada@engine.co" at 2200ms. Any pointer down or key down inside the form marks it as touched and stops further demo steps.

## Accessibility

- Each input gets an id from `useId` and the label is a real `<label htmlFor>`.
- Invalid fields set `aria-invalid` and `aria-describedby` pointing at the error text.
- The fieldset outline and the tick are decorative (`aria-hidden`).

## Acceptance checklist

- [ ] Empty fields show the label in grey, centred like a placeholder.
- [ ] Focusing a field lifts and shrinks the label into the border and a hop ripples left to right through its letters.
- [ ] The outline opens a gap exactly under the lifted label and closes again when an empty field blurs.
- [ ] A field with text keeps its label up after blur.
- [ ] Typing "abc" in the email field and tabbing away shakes it, turns outline and label red and shows "That doesn't look like an email."
- [ ] A valid email shows a green tick that pops in and draws its check.
- [ ] With `autoplay`, the name and then the email type themselves, and clicking the form stops it.
- [ ] Dark mode uses the `#1c1c1e` card, `#f5f5f7` text and the dark idle, muted and error colours.
