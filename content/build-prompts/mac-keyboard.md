Build a Mac keyboard drawn entirely in HTML, in silver or space grey. Press a key and it sinks, squashes a touch and springs back while a ring of backlight spreads out from it underneath, showing through the gaps between the caps. It can listen to the real keyboard, plays a recorded mechanical click for each key the instant it goes down (with a synthesised Web Audio click as the fallback), and show what you type in a pill-shaped strip above. Precise, tactile, Apple-like.

## Stack

- React client components (`"use client"`), TypeScript, Tailwind CSS (container query units `cqw`), framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`). Web Audio API for sound: a small recorded sprite (`/sounds/keys.ogg`) plus a synthesised fallback.
- Files in `components/keyboard/`: `keyboard-layout.ts` (key data), `keyboard-key.tsx` (memoised `KeyboardKey`), `use-keyboard-sound.ts` (`useKeyboardSound`, `SoundType`), `keyboard.tsx` (named exports `MacKeyboard`, `usePhysicalKeyboard`, type `KeyboardProps`), and an `index.ts` re-exporting them plus `KeyDef`, `MAC_ROWS`, `COMPACT_ROWS`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `layout` | `"mac" \| "compact"` | `"mac"` | Full layout with Esc/F-key row, or compact without it. |
| `theme` | `"dark" \| "light" \| "auto"` | `"auto"` | Space grey, silver, or follow the page's `dark` class (`dark:` variants). |
| `listen` | `boolean` | `false` | React to the physical keyboard. |
| `showOutput` | `boolean` | `true` | Show the typed-text strip. Return clears it. |
| `placeholder` | `string` | `"Start typing..."` | Strip text before anything is typed. |
| `autoplay` | `boolean` | `false` | Types `autoplayText` on the keys in a loop until a key is pressed. |
| `autoplayText` | `string` | `"hello, nexus"` | What the demo types. |
| `accent` | `string` | `"#0a84ff"` | Backlight ripple colour. |
| `enableSound` | `boolean` | `true` | Key click per press, on the way down (never during autoplay). |
| `soundSrc` | `string` | `"/sounds/keys.ogg"` | Recorded clicks, one slice per key. `""` means always synthesise. |
| `soundType` | `"mechanical" \| "soft" \| "clicky"` | `"mechanical"` | Timbre of the synthesised fallback click. |
| `volume` | `number` | `0.6` | 0 to 1. |
| `showFunctionRow` | `boolean` | `true` | Esc/F-key row (mac layout). |
| `activeKeys` | `string[]` | `[]` | `KeyboardEvent.code` values to show held. |
| `onKeyPress` | `(key: KeyDef) => void` | – | Fires when an on-screen key is pressed. |
| `className` / `keyClassName` | `string` | – | Extra classes on the body / every cap. |

`KeyDef = { id, label, sub?, code, char, width (flex units), kind: "normal"|"modifier"|"space"|"enter"|"delete"|"fn"|"nav", sound: "normal"|"space"|"enter"|"delete"|"modifier", groupGap? }`. `usePhysicalKeyboard()` returns the held codes (keydown/keyup on window, cleared on blur) for `activeKeys`. Map `OSLeft/OSRight` to `MetaLeft/MetaRight`.

### Layout data (each row except fn sums to 15 units)

- Fn row: esc 1.5, F1–F12 at 1 each, with a group gap before F1, F5 and F9.
- `` ` `` 1 … `=` (shift glyphs as `sub`), ⌫ 2. ⇥ 1.5, Q…], `\` 1.5. caps 1.75, A…', return 2.25. ⇧ 2.25, Z…/, ⇧ 2.75. fn 1, control 1.5, option 1.5, ⌘ 1.75, space 5, ⌘ 1.75, option 1.5, ← 1, → 1. Compact = all rows but the first.

## Layout and look

- Wrapper: centred column, max 780px, gap 16, `container-type: inline-size`.
- Output strip: 44px tall, max 420px, fully rounded, padding 0 20px, 15px, tracking −0.01em, `aria-live="polite"`. Light: white, `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 10px 24px -18px rgba(0,0,0,.35)`; dark: `#1c1c1e`, `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 10px 24px -18px rgba(0,0,0,.9)`. Placeholder `#86868b` (dark `#98989d`). Caret 2×20px rounded, `#0071e3` (dark `#0a84ff`). Keep the last 32 characters.
- Body: radius `min(22px, 3cqw)`, padding `min(14px, 1.8cqw)`, `overflow: hidden`. Silver: gradient `#ececef → #d9d9de` (180deg), shadow `inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 1px rgba(0,0,0,.06), 0 24px 44px -28px rgba(0,0,0,.45)`. Space grey: `#2c2c2e → #1d1d1f`, `inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(255,255,255,.06), 0 24px 44px -24px rgba(0,0,0,.9)`.
- Rows and keys gap `max(3px, 0.65cqw)`; fn group gap spacer `max(3px, 0.8cqw)`. Each key `flex: width`, `transform-origin` bottom, radius 0.32em. Height `max(24px, 5.6cqw)`, fn row `max(16px, 3.6cqw)`.
- Caps: silver gradient `#ffffff → #f4f4f6`, text `#1d1d1f`, shadow `0 1px 0 rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.12), inset 0 -1px 0 rgba(0,0,0,.04)`; grey `#3a3a3c → #2f2f31`, `#f5f5f7`, `0 1px 0 rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06)`. Held keys tint their legend `#0071e3` (dark `#0a84ff`), 150ms colour transition.
- Legends: padding 0 0.45em. Letters/symbols centred at `max(9px, 1.9cqw)`; symbol keys stack the `sub` glyph (0.72em, 60% opacity) above the main one. Words and F-keys `max(7px, 1.15cqw)` medium. Modifiers/nav/enter/delete sit bottom-left with 0.45em bottom padding; right-hand ones, return and delete sit bottom-right. Space has no legend.
- Caption under the keyboard, 13px `#86868b` (dark `#a1a1a6`): "Type on your keyboard, or tap the keys." when listening, else "Tap the keys."

## Motion

- Key press: animate to `y 1.5, scaleY 0.94, scaleX 0.985` while held (and `whileTap`), back to rest otherwise; spring stiffness 700, damping 26, mass 0.5. `initial={false}`.
- Backlight ripple: on each strike, add a ripple at the key's centre relative to the body (keep at most 6). Each is an 80px circle centred there, background `radial-gradient(circle, transparent 38%, accent 52%, transparent 70%)`, layered under the caps. Animate scale 0.2 → 9 (spring stiffness 40, damping 16) and opacity 0.95 → 0 (1.1s easeOut); remove on complete.
- Glow: for the latest ripple only, a 60px accent disc with `blur-md`, opacity 0.8 → 0 and scale 0.6 → 1.4 over 0.6s easeOut, re-keyed per ripple.
- Typed characters: each enters from `y 8, opacity 0, scale 0.7`, spring 700/22. On Return the whole line (keyed by a send counter, `AnimatePresence mode="popLayout"`) exits upward: `y −26, opacity 0, scale 0.96`, spring 300/24.
- Caret blink: opacity `[1,1,0,0]`, times `[0,.5,.5,1]`, 1s, infinite.
- On-screen taps show the held state for 130ms (timeouts tracked and cleared on unmount).

## Sound

### Recorded clicks (default)

A shared module `components/key-sound/` (`key-sound.ts`, `key-sound-slices.ts`, `use-key-sound.ts`, `index.ts`) plays one recorded Cherry MX Black click per key from a single 18 s OGG sprite, `/sounds/keys.ogg` (about 200 KB). `KEY_SOUND_SLICES` maps every `KeyboardEvent.code` the layout uses to `[offsetMs, lengthMs]`; each slice starts within 5 ms of the click's attack, so the sound lands with the press. Unknown codes use `KeyA`.

- After mount, fetch the file once in `requestIdleCallback` (fallback `setTimeout` 1.2 s). Cache the bytes and the decoded buffer per URL at module level so several keyboards share them.
- On the keyboard's `pointerenter` and `focus` (and on mount when `listen` is on), decode with an `OfflineAudioContext(2, 1, 44100)`: decoding needs no user gesture, so the first press is already in time.
- Play from the press handler itself: create or resume one shared `AudioContext({ latencyHint: "interactive" })`, then a `BufferSource` through a gain of `volume`, `start(0, offset/1000, length/1000)`, with `playbackRate` 0.97 to 1.03 per hit so fast typing does not loop. If the buffer is not ready (or the file 404s), return false and play the synthesised click below instead.
- Touch screens only allow audio to start on finger up, so `pointerup` on the keyboard also creates or resumes the context.
- Keys press on `pointerdown` (primary button only), not `click`, so the cap, the letter and the sound all start together; `click` with `detail === 0` still handles Enter or Space on a focused key.

### Synthesised fallback


Each press layers three Web Audio voices straight to the destination. Two noise bursts (white noise with exponential decay constant `dcy`, length `max(6.5·dcy, 14ms)`, through a bandpass, gain ramping to 0.0001) and one sine "body" tone sweeping from `1.35·bodyHz` to `0.52·bodyHz` over 65ms with gain decaying over 85ms. The thud and body start `tdOff` after the click. Frequencies are jittered ×(0.92–1.08) per hit. Per-variant params (click Hz/Q/decay/gain, thud Hz/Q/decay/gain/offset, body Hz/gain):
- normal 5400/4.2/0.0042/0.50, 400/1.1/0.022/0.82/0.007, 280/0.22
- space 2200/2.2/0.010/0.28, 148/0.8/0.048/1.05/0.012, 118/0.30
- enter 3700/3.4/0.006/0.43, 275/1.0/0.032/0.92/0.009, 205/0.26
- delete 6100/4.8/0.0034/0.55, 510/1.3/0.017/0.73/0.005, 345/0.18
- modifier 3000/2.7/0.005/0.28, 210/0.9/0.019/0.60/0.007, 158/0.15

Type multipliers (click gain, thud gain, body gain, click Q): mechanical 1/1/1/1, soft 0.28/0.75/0.6/0.5, clicky 1.55/0.85/0.55/1.9. Create the AudioContext lazily on first press, resume if suspended, swallow errors, close it on unmount.

`MacKeyboard` plays this only while `enableSound` (default `true`) is on and the site-wide sound switch is on: the hook checks `getSoundsEnabled()` from `@/lib/ui-sounds` (default on in installed apps, `setSoundsEnabled` turns it off) before it creates or resumes the audio context. Only real presses (a tap on a cap, or the physical keyboard when `listen` is set) make sound; the autoplay typing and hover are silent. The recorded clicks (`useKeySound`) follow the same switch: while it is off, `play` returns true without a sound, so the synthesised fallback does not fire either. `@/lib/ui-sounds` is imported only for the switch.

## Interaction and states

- Pressing a cap (pointerdown): mark touched, play the sound first, show held for 130ms, ripple, update text, call `onKeyPress`.
- Listening: keydown on window (ignored when focus is in an input/textarea/contenteditable or with Cmd/Ctrl) strikes once (not on repeat) and holds the key until keyup; blur clears held. `preventDefault` on Space, Backspace, Tab, Quote and Slash.
- Text rules: Backspace deletes one char; Return clears and sends; Tab/newline insert nothing; modifiers insert nothing.
- Active set = `activeKeys` ∪ held.
- Reduced motion: no press spring, no ripples, characters appear without the pop, the sent line only fades.

## Autoplay demo

Map each lowercase character of `autoplayText` to its key, then Return. Start after 700ms; each step taps the key silently. Gap after a key: 1700ms after Return, 210ms after space, otherwise `120 + (i·37 mod 90)` ms. Stop as soon as the user presses any key.

## Accessibility

- Body `role="group"` labelled "Mac keyboard". Caps are buttons with `aria-pressed`, named by label or a readable name (Delete, Tab, Shift, Command, Left/Right arrow, Space, Return, Caps Lock, Escape). 2px focus ring `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- Every row lines up at both edges; F-keys form groups of four.
- Clicking a key sinks it and a ring of accent light spreads out through the gaps.
- Characters pop into the strip; Return lifts the line away; Backspace deletes.
- With `listen`, physical keys hold and release in sync; Cmd shortcuts are ignored.
- Each key plays its own recorded click the instant it goes down, in step with the cap; with `soundSrc=""` each synthesised sound type is audibly different; no sound in autoplay.
- Autoplay types the phrase repeatedly and stops on first press.
- Silver, space grey and auto themes render correctly; compact hides the fn row.
