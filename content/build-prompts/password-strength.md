<!-- Password Strength: Motion Kit variant brief -->

> The Password Strength page has 3 variants. The original Password Strength brief comes first; the Motion Kit Crack-time Meter and Suggested Password variants follow, each after a rule.

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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. There is no sound per keystroke. The first time typing takes the score to the top level (Strong), `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays once at 50% volume; it plays again only after the field has been emptied and the visitor reaches the top level again. The autoplay sample password plays the same single `success` chime at 50% when it first reaches the top level (and again on the next loop after it has been cleared) through the same play function's `auto` variant (`play.auto("success", 0.5)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch. The eye toggle and the rules ticking are silent (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Empty field: grey border, empty meter, "Enter a password" in grey.
- [ ] "abc" scores Weak: one red segment, red border with halo.
- [ ] "Abcdefg1" scores Fair (orange, two segments); "Abcdefg1!" scores Strong (four green segments).
- [ ] Segments fill left to right with a slight stagger and empty right to left.
- [ ] The strength word rolls vertically when it changes; "Good" uses the darker yellow text.
- [ ] Rule circles pop and draw a tick as each rule is met.
- [ ] The eye toggle reveals the password and draws a slash; the pupil grows.
- [ ] With `autoplay`, "Sunset-Drive9" types itself and loops until the field is focused.

---

<!-- variant: crack-time-password -->

# Crack-time Meter

Build a password field whose strength meter says something real: how long a fast guessing rig would take to crack what was typed. The estimate rolls like a counter as you type, and a marker slides along a log scale from "instantly" to "forever", shifting from red through amber to green.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`).
- File: `components/password-strength/crack-time-password.tsx`. Named export `CrackTimePassword`, exported `CrackTimePasswordProps`. Add both to the directory `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Types a few sample passwords by itself, on a loop, until the field is focused. |
| `onChange` | `(value: string, crackSeconds: number) => void` | none | Called on every keystroke with the password and the estimated seconds to crack it. |
| `className` | `string` | `""` | Extra classes for the card. |

## The estimate

- Guess rate: 1e10 guesses per second (an offline attack on a fast GPU rig).
- Empty: 0 seconds. A password that contains any of `password, 123456, qwerty, letmein, admin, welcome, iloveyou, monkey, dragon, abc123` (case-insensitive) takes 0.001 seconds.
- Pool size: +26 for lower case, +26 for upper case, +10 for digits, +33 for anything else.
- Effective length: `min(length, unique + floor((length - unique) / 3))` where `unique` is the number of distinct characters, so repeats count a third.
- Seconds: `pool ^ effectiveLength / 2 / 1e10`.
- Text: under 1 second "Instantly"; over a million centuries "Forever". Otherwise pick the largest unit of second, minute, hour, day, month (30 days), year (365 days), century; value `n = seconds / unit`. If `n >= 1e6` show "N million" and if `n >= 1e3` show "N thousand" (rounded) with the unit pluralised; otherwise the rounded number. "century" pluralises to "centuries"; a value of exactly 1 is singular.
- Marker position: `clamp(log10(max(1, seconds)) / log10(1 million centuries), 0, 1)`. Labels under the track at the positions of 1 second, 1 hour, 1 year, 100 years and 10,000 centuries: "1s", "1h", "1y", "100y", "1M y".
- Tier by position `p`: under .25 "Weak" red `#ff3b30`; under .5 "Fair" orange `#ff9f0a`; under .68 "Good" yellow `#ffcc00`; otherwise "Strong" green `#34c759`. Dark: red `#ff453a`, yellow `#ffd60a`, green `#30d158`. Label text uses the darker `#b38f00` for yellow and `#248a3d` for green in light mode.

## Layout and look

- Card: width 420px with `max-width: 100%`, radius 28px, padding 24px (16px at viewport 360px and below). Light white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -30px rgba(0,0,0,.9)`. Ink `#1d1d1f` / `#f5f5f7`.
- Label "Choose a password": 13px medium, muted `#6e6e73` / `#a1a1a6`, tied to the input with `htmlFor`.
- Field: 8px top margin, 48px tall, radius 14px, `#f5f5f7` / `#2c2c2e`, left padding 16px, right 6px, a 2px action ring on `focus-within` (`#0071e3` / `#0a84ff`). Input: transparent, 16px, tracking 0.02em, placeholder "At least 12 characters" (`#a1a1a6` / `#8e8e93`), `autoComplete="new-password"`, `spellCheck` off.
- Eye button: 36px square, radius 10px, muted icon 18px (stroke 2, round caps): eye outline `M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z`, pupil circle r 3, slash `M4 4l16 16` that is drawn while the password is hidden and erased while it is shown. `aria-label` "Show password" / "Hide password".
- Result block: 24px top margin, `aria-live="polite"`. Line one 13px muted: "Start typing to see how long it would hold up", or "A fast guessing rig would crack it in" once there is text. Under it, 4px gap, a 44px tall row (overflow hidden, items on the baseline, 8px gap) with the number in 36px semibold, tracking -0.04em, line height 44px (30px under 360px viewport), ink colour but red when `p < .25`; and the unit in 17px medium muted.
- Track: 20px top margin, 40px tall. A 6px rounded bar at 9px from the top (`#ececf0` / `#3a3a3c`) with a fill whose width is `p * 100%`. A 18px marker (white, dark `#1c1c1e`, 3px border in the tier colour, grey `#d2d2d7` / `#48484a` when empty, shadow `0 2px 6px rgba(0,0,0,.18)`) centred on `p * 100%`. Tick labels 10.5px tabular at 24px from the top, centred on their positions, `#86868b` / `#8e8e93`.
- Footer row: 4px top margin, space between, 13px: tier label (semibold, tier text colour, empty when no text) on the left and "10 billion guesses a second" on the right.

## Motion

- Fill width and marker position: spring stiffness 160, damping 22. Colours follow through a 300ms CSS colour transition (they are classes, so they follow the theme).
- The number: `AnimatePresence mode="popLayout" initial={false}` keyed by its text. Enter from `y 30, opacity 0, blur(6px)`, exit to `y -30, opacity 0, blur(6px)`; spring stiffness 380, damping 32, blur 0.2s. The unit enters from `y 8, opacity 0` and uses `layout` so it slides when the number's width changes.
- Eye slash: `pathLength` 0 to 1 over 0.25s.
- Reduced motion: no springs, no rolling, no blur; values change instantly.

## Interaction and states

- Typing stores the value, marks the field touched and calls `onChange(value, crackSeconds)`.
- The first focus (if untouched) clears any autoplay text so the visitor starts empty.
- All output derives from the current value on each render. Nothing is stored or sent anywhere.

## Autoplay demo

With `autoplay`, while the card is on screen, the tab is visible and motion is allowed, the demo types these words in turn at 90ms per character, pausing 1300ms after each: "password1", then cleared (500ms), "nexus", "Nexus2026", "Nexus2026!", "Nexus2026!motion"; starting after 600ms, then looping 1800ms after the last. Focusing or typing stops it for good. Leaving the screen or hiding the tab clears pending timers.

## Accessibility

- `<label htmlFor>` on the input (id from `useId`). The result block is `aria-live="polite"`; the track, marker and tick labels are `aria-hidden` because the same information is in the text.
- Eye button is a real button with a visible focus outline and a changing label. SVGs are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. There is no sound per keystroke. The first time typing takes the crack-time estimate into the top tier (Strong), `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays once at 50% volume; it plays again only after the field has been emptied. The autoplay passwords play the same single `success` chime at 50% when a word first reaches the top tier (once per word) through the same play function's `auto` variant (`play.auto("success", 0.5)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch. The eye toggle is silent (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Empty field: "Start typing to see how long it would hold up", empty track, no tier label.
- [ ] "password1" shows "Instantly" in red, marker at the far left.
- [ ] "Nexus2026!motion" shows a very long time in green, marker well to the right, label "Strong".
- [ ] The number rolls vertically when its text changes; the marker slides with a soft spring and recolours.
- [ ] The eye toggles visibility and the slash draws or erases.
- [ ] With `autoplay` the sample passwords type themselves until you focus the field.
- [ ] No horizontal overflow at 320px.
- [ ] Dark mode uses `#1c1c1e`, `#2c2c2e` and the dark tier colours.

---

<!-- variant: suggest-password -->

# Suggested Password

Build a sign-up password field that offers to do the work. Focusing the field slides up a suggested password; taking it decodes the characters into place one by one, turns the field green and labels it "Saved". Typing your own instead shows one line of advice that rewrites itself as you go, with a thin bar filling underneath.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`).
- File: `components/password-strength/suggest-password.tsx`. Named export `SuggestPassword`, exported `SuggestPasswordProps`. Add both to the directory `index.ts`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `email` | `string` | `"maya@orbitly.com"` | Shown in the read-only field above the password. |
| `autoplay` | `boolean` | `false` | Plays the offer, taking it, choosing your own and typing, on a loop, until the field is focused. |
| `onChange` | `(password: string) => void` | none | Called with the new password when the visitor types or takes the suggestion. |
| `onUse` | `(password: string) => void` | none | Called when the suggestion is taken. |
| `onSubmit` | `(password: string) => void` | none | Called with the current password when "Create account" is pressed. Nothing is sent anywhere by the component. |
| `className` | `string` | `""` | Extra classes for the card. |

## The suggestion and the advice

- Alphabet (no look-alikes): `abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789`. A suggestion is 15 characters in three groups of five joined by hyphens (`xxxxx-xxxxx-xxxxx`), drawn with `crypto.getRandomValues` using rejection sampling so every character is equally likely. It is generated on demand (when the offer first opens), never during render, so server and client markup match.
- Advice, from the current text: if empty, "Use 12 or more characters". Otherwise list what is missing in this order: `N more character(s)` when under 12, "a number" when no digit, "upper and lower case" when either case is missing. Text is "Add " plus the list joined with commas and "and". With nothing missing: "Strong password". Score is `max(0, 4 - missing - (length < 8 ? 1 : 0))`, and 4 when nothing is missing. The animation key ignores the running character count, so only a change in the kind of advice animates.
- Bar colour by score: 0 and 1 red, 2 orange, 3 yellow, 4 green (`#ff3b30` / `#ff453a`, `#ff9f0a`, `#ffcc00` / `#ffd60a`, `#34c759` / `#30d158`).

## Layout and look

- Card: width 420px with `max-width: 100%`, radius 28px, padding 24px (16px at viewport 360px and below). Light white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)`. Dark `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -30px rgba(0,0,0,.9)`.
- Title "Create your account" 21px semibold, tracking -0.02em. Email row: 16px top margin, 48px tall, radius 14px, `#f5f5f7` / `#2c2c2e`, 16px padding, 15px muted text (`#6e6e73` / `#a1a1a6`), truncating.
- Password field: 8px top margin, 48px tall, radius 14px, `overflow: hidden`, left padding 16px, right 6px, `#f5f5f7` / `#2c2c2e`; a 2px action ring on `focus-within`. When the suggestion is in use it becomes `#e9f9ee` (dark `#30d158` at 15%) with inset ring `1.5px rgba(52,199,89,.5)`, over 350ms. Input: transparent, 16px, placeholder "Password"; monospace with tracking 0.04em while the suggestion is in use. `autoComplete="new-password"`, `spellCheck` off, `aria-label="Password"`.
  - "Saved" chip (only while in use): small key icon (11px, stroke 2.6) and "Saved", 11px semibold, green on 15% green, fully rounded, enters from `x 10` after 0.5s.
  - Eye button: 36px square, radius 10px, 18px icon, slash drawn while hidden. `aria-label` "Show password" / "Hide password".
- Offer (shown while the field group has focus and the suggestion is not in use): a full-width button, 8px top margin, padding 12px, radius 14px, white (dark `#2c2c2e`), shadow `0 8px 24px -12px rgba(0,0,0,.3), 0 0 0 1px rgba(0,0,0,.06)` (dark: black .8 and a white .1 ring). Row with 12px gap: a 36px key tile (`#1d1d1f` with white icon, dark `#f5f5f7` with dark icon), a text column ("Use suggested password" 14px semibold; the suggestion in 12px monospace, muted, truncating) and "Use" 13px semibold in the action colour.
- Advice area: 12px top margin, minimum 44px tall. Bar: 4px tall rounded track `#ececf0` / `#3a3a3c` with a fill. Under it, 8px gap, a 20px tall clipped line (34px tall under 420px viewport, so long advice can wrap) with the 13px advice text, muted, or semibold green when strong.
- While in use the advice area shows instead: "Strong password, saved for this site" in green (`#1a7f37` / `#30d158`) on the left and a "Choose my own" button (13px medium, action colour) on the right.
- "Create account": 8px top margin, 44px tall, full width, fully rounded, `#0071e3` / `#0a84ff`, white 15px medium.

## Motion

- Offer: wrapper animates `height 0 to auto` with opacity, spring stiffness 380, damping 34; the button itself rises from `y -8`.
- Decode: on take, a requestAnimationFrame loop runs for `120 + length * 38` ms. Each tick shows the target with every character not yet settled replaced by a random alphabet character; character `i` settles once elapsed time passes `120 + i * 38` ms; hyphens are fixed. The loop is cancelled on unmount and when the visitor edits the field. Under reduced motion the text appears at once.
- Field background and ring change over 350ms (CSS transition).
- Advice line: `AnimatePresence mode="popLayout"` keyed by advice kind; enters from `y 14, opacity 0`, exits to `y -12, opacity 0` in 0.12s; spring stiffness 420, damping 32. Bar width `max(8%, score / 4)` (0 when empty), spring stiffness 200, damping 24; colour by 300ms CSS transition.
- Swap between advice and "in use" with `AnimatePresence mode="wait"` fading opacity.
- Reduced motion: springs and rolls become instant.

## Interaction and states

- Focusing the field (first time) clears any autoplay text. Focus opens the offer (generating a suggestion if none yet). The offer stays open while focus is anywhere inside the field group, so a keyboard user can Tab from the input to the offer; it closes when focus leaves the group. Pressing the offer with the mouse does not steal focus from the input; pressing it with the keyboard returns focus to the input.
- Taking the suggestion: set in-use, close the offer, fill the field, reveal the text, run the decode, call `onUse` and `onChange`.
- Typing: leaves "in use", stores what was typed, calls `onChange`.
- "Choose my own": clears the field, hides the text, makes a fresh suggestion and focuses the input.
- "Create account" calls `onSubmit(password)`; it never navigates.

## Autoplay demo

With `autoplay`, while on screen, the tab is visible and motion is allowed, a loop of 9000ms: clear everything; at 700ms open the offer; at 2000ms take the suggestion; at 5200ms choose your own (clear, hide, new suggestion); from 5800ms type "Sunny7" at 130ms per character; at 8600ms clear it; at 9000ms start again. Focusing or typing in the field stops it for good. Leaving the screen or hiding the tab clears all pending timers.

## Accessibility

- A visually hidden `aria-live="polite"` line carries the current advice, or "Suggested password filled in. Strong password." while in use. The input has `aria-describedby` pointing at the advice line.
- Every control is a real button with a visible focus outline; SVGs are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. There is no sound per keystroke. The first time typing reaches the "Strong password" advice, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays once at 50% volume, and pressing the suggested password's Use button plays the same sound at 50% as the characters decode into place. Choosing your own again re-arms it. The autoplay story plays the same `success` at 50% when it takes the suggested password with Use through the same play function's `auto` variant (`play.auto("success", 0.5)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow `enableSound` and the site-wide switch. The eye toggle and Create account are silent (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Focusing the field slides up a card offering a 15 character password such as `k7Rmp-Qx3Nw-d9Tfa`.
- [ ] Pressing Use decodes the characters left to right, the field turns green and shows a "Saved" chip.
- [ ] "Choose my own" clears the field and brings the offer back with a new suggestion.
- [ ] Typing "Sunny7" reads "Add 6 more characters" and the line rolls when the advice kind changes; the bar fills as the score rises.
- [ ] A 12 character password with a number and both cases reads "Strong password" in green.
- [ ] The offer is reachable and usable by keyboard (Tab to it, Enter to take it).
- [ ] With `autoplay` the offer, take, choose my own and typing loop until you focus the field.
- [ ] No horizontal overflow at 320px.
- [ ] Dark mode uses `#1c1c1e` and `#2c2c2e` surfaces.
