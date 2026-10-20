# Password Strength

Build a "Create a password" field with live feedback: a four-segment meter that fills and recolours as the password improves, a strength word that rolls to its new value, a checklist of rules that tick themselves off with a small pop, and a show/hide eye whose pupil grows and slash draws itself. It should feel clean and encouraging, like a modern account sign-up sheet.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/password-strength/password-strength.tsx`. Named exports `PasswordStrength` (and `PasswordStrengthProps`) plus a pure helper `scorePassword(pw: string) => { rules, score }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#0071e3"` | Ticked-rule fill and the eye button's focus outline. |
| `onChange` | `(value: string, score: number) => void` | — | Called on every user keystroke with the password and its 0–4 score. |
| `autoplay` | `boolean` | `false` | Types a sample password by itself until the user clicks in. |

## Scoring

Rules, in this order: "8+ characters" (length ≥ 8), "Upper & lower case" (has `[a-z]` and `[A-Z]`), "A number" (`\d`), "A symbol" (`[^A-Za-z0-9]`). Score = number of rules met, except: empty → 0; shorter than 8 → at most 1.

Levels by score: 0 "Enter a password" `#d2d2d7`, 1 "Weak" `#ff3b30`, 2 "Fair" `#ff9f0a`, 3 "Good" `#ffcc00`, 4 "Strong" `#34c759`.

## Layout and look

- Root: full width, max 420px, vertical flex, 16px gap.
- Label "Create a password": 24px semibold, tracking −0.025em, `#1d1d1f` / dark `#f5f5f7`, tied to the input.
- Field box: 56px tall, radius 16px, white / dark `#2c2c2e`, row layout. Its border is a box-shadow: score 0 → `inset 0 0 0 1px rgba(120,120,128,.36)` and no halo; score > 0 → `inset 0 0 0 1px <level colour>, 0 0 0 4px <level colour>22` (soft ~13% halo).
- Input: transparent, no outline, fills the row, 18px horizontal padding, 17px medium with wide tracking, `#1d1d1f` / `#f5f5f7`. Placeholder "At least 8 characters", normal weight and tracking, `#a1a1a6`. `autoComplete="new-password"`, type `password` or `text`.
- Eye button: 44px square, radius 12px, 6px right margin, `#86868b`; hover bg `#f5f5f7` + text `#1d1d1f` (dark `#3a3a3c` + `#f5f5f7`). 22px icon, stroke 1.8, round caps: eye outline `M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z`, a pupil circle r 3 at the centre, and a diagonal slash `M4 4l16 16`.
- Meter block (10px gap): 4-column grid, 6px gaps; each segment a 6px-tall rounded track `#e8e8ed` / dark `#3a3a3c` with an inner fill (`transform-origin: left`, rounded) in the level colour. Below, a 20px-tall row, `overflow: hidden`, 13px: "Strength" in `#86868b` / `#98989d` on the left and the level word (semibold) on the right, coloured by level — except score 3 uses darker `#b38f00` for legibility and score 0 uses `#86868b`.
- Rules list: 4px top margin, 2-column grid, 16px column gap, 12px row gap. Each item 14px with 10px gap: an 18px circle (unmet: transparent with `inset 0 0 0 1.5px #c7c7cc`, dark `#636366`; met: filled with accent) holding a 10px white tick (`M2.5 6.2l2.3 2.3L9.5 3.8`, stroke 2.2, round). Text `#1d1d1f`/`#f5f5f7` when met, `#86868b`/`#98989d` when not, with a colour transition.

## Motion

- Field border/halo: animate `boxShadow` over 0.3s.
- Meter: segment `i` animates `scaleX` to 1 if `i < score`, else 0, and `backgroundColor` to the level colour; spring stiffness 300, damping 24, `initial={false}`. Filling staggers left to right (`delay i × 0.05s`); emptying staggers right to left (`delay (3 − i) × 0.03s`). All filled segments share one colour, so the whole bar recolours together.
- Strength word: `AnimatePresence mode="popLayout" initial={false}` keyed by label. Enter from `y 16, opacity 0, blur(4px)`; exit to `y −16, opacity 0, blur(4px)`; spring stiffness 420, damping 30 — a vertical roll inside the clipped row.
- Rule check: circle animates `backgroundColor` to accent and `scale` through `[1, 1.25, 1]` when met (0.35s); back to transparent, scale 1, when unmet. The tick draws `pathLength 0 → 1` in 0.3s with 0.1s delay when met, and erases with no delay.
- Eye: pupil scale 1 when shown, 0.6 when hidden (spring stiffness 500, damping 18). Slash animates `pathLength` and `opacity` 0 → 1 when the password is shown (0.3s, ease `[0.65, 0, 0.35, 1]`), `initial={false}`. Button `whileTap` scale 0.85.

## Interaction and states

- Typing: store the value, mark touched, call `onChange(value, score)`.
- Eye toggles between `password` and `text`; the slash appears while the password is visible.
- The first focus on the input (if untouched) marks it touched and clears any autoplay text, so the user starts empty.
- All meter, label and rule state derives from `scorePassword` on each render.

## Autoplay demo

When `autoplay` is true: after 900ms, type "Sunset-Drive9" one character at a time with a random 120–200ms gap, wait 2600ms, clear it, and start again after 900ms. It stops as soon as the input is focused or typed into. Autoplay does not call `onChange`. Clear the pending timeout on unmount.

## Accessibility

- `<label htmlFor>` on the input (id from `useId`); the input has `aria-describedby` pointing at the rules list.
- Each rule includes sr-only text "(met)" or "(not met)".
- Eye button: `aria-label` "Show password" / "Hide password", `type="button"`, 2px accent focus-visible outline. SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Empty field: grey border, empty meter, "Enter a password" in grey.
- [ ] "abc" scores Weak: one red segment, red border with halo.
- [ ] "Abcdefg1" scores Fair (orange, two segments); "Abcdefg1!" scores Strong (four green segments).
- [ ] Segments fill left to right with a slight stagger and empty right to left.
- [ ] The strength word rolls vertically when it changes; "Good" uses the darker yellow text.
- [ ] Rule circles pop and draw a tick as each rule is met.
- [ ] The eye toggle reveals the password and draws a slash; the pupil grows.
- [ ] With `autoplay`, "Sunset-Drive9" types itself and loops until the field is focused.
