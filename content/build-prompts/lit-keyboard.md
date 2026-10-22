# Lit Keyboard

Build a small QWERTY keyboard, tilted back in perspective, that lights up under the user's real typing: each key snaps on in a glow colour and fades back over almost a second, leaving a soft trail. A text pill above shows what was typed, and a run can be recorded and replayed with its original timing. Calm, tactile, Apple-like.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/lit-keyboard/lit-keyboard.tsx`, named export `LitKeyboard`. Also export the types `LitKeyboardProps` and `LitKeyboardHit` (`{ key: string; t: number }`, where `t` is a `performance.now()` timestamp).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `glow` | `string` | `"#ff9f0a"` | Colour a key flashes to when pressed. A hex colour; the glow shadow appends alpha `88` to it. Also colours the text caret. |
| `autoplay` | `boolean` | `false` | Plays a sample phrase by itself every few seconds until the user types or uses a button. |

## Layout and look

Root: full-width centred column, gap 20px. Colours are CSS variables on the root, switched with `dark:` (a `.dark` ancestor):

| Variable | Light | Dark |
| --- | --- | --- |
| `--lk-deck` (keyboard plate) | `#e8e8ed` | `#1c1c1e` |
| `--lk-key` | `#ffffff` | `#3a3a3c` |
| `--lk-ink` (legend) | `#1d1d1f` | `#f5f5f7` |
| `--lk-edge` (key side) | `#d2d2d7` | `#0b0b0c` |
| `--lk-edge-on` | `#c7c7cc` | `#2c2c2e` |
| `--lk-hi` (top highlight) | `#ffffff` | `rgba(255,255,255,.08)` |

Inside the root, a focusable typing area (max-width 480px, column, gap 20px, radius 24px, no outline) holds two things:

1. **Text pill**: height 40px, min-width 260px, fully rounded, `px-5`, 17px medium, `tracking-tight`. Light: white background, text `#1d1d1f`, ring `0 0 0 1px rgba(0,0,0,.06)`. Dark: `#2c2c2e`, text `#f5f5f7`, ring `rgba(255,255,255,.08)`. When the typing area has keyboard focus (`group-focus-visible`), the ring becomes 2px `#0071e3` (dark `#0a84ff`). Contents: the typed characters (whitespace preserved), then a caret 2px × 20px, fully rounded, filled with `glow`, 2px left margin. When empty, also show the placeholder "Click here, then type" at 14px regular, `#a1a1a6` (dark `#8e8e93`).
2. **Keyboard plate**: radius 22px, padding 12px, background `--lk-deck`, shadow `inset 0 1px 0 #fff, 0 30px 50px -30px rgba(0,0,0,.45)` (dark: `inset 0 1px 0 rgba(255,255,255,.08), 0 30px 50px -30px rgba(0,0,0,.9)`). Transform `perspective(900px) rotateX(24deg)` with `transform-origin: 50% 100%`, so it leans back from its bottom edge.

Keys: rows `qwertyuiop`, `asdfghjkl`, `zxcvbnm`, stacked with 6px gaps, keys 6px apart, each row centred and given a left padding of `rowIndex × 14px` (0, 14, 28). Below them a space bar 230px wide with no label. Each key is 40 × 40px, radius 9px, 13px medium uppercase legend, centred.

- Idle key: background `--lk-key`, text `--lk-ink`, shadow `0 3px 0 var(--lk-edge), 0 4px 8px -3px rgba(0,0,0,.18), inset 0 1px 0 var(--lk-hi)`.
- Lit key: background `glow`, text `#ffffff`, shadow `0 0px 0 var(--lk-edge-on), 0 0 22px 2px {glow}88, inset 0 1px 0 rgba(255,255,255,.4)`.

Below, two buttons 8px apart, 36px tall, fully rounded, `px-4`, 13px medium:

- **Record / Stop**: styled like the pill (white / `#2c2c2e`, 1px ring at `.08` alpha), with a leading 10px dot `#ff3b30` (dark `#ff453a`) and 8px gap.
- **Replay**: `#1d1d1f` with white text (dark: `#f5f5f7` with `#1d1d1f` text); 30% opacity when disabled.

## Motion

- **Key on**: background, colour and box-shadow use CSS transitions of `50ms linear`; the key also moves `y: 3px` (framer-motion, duration 0.05s), so it drops onto its 3px side edge.
- **Key off**: the same properties transition over `0.9s cubic-bezier(0.16, 1, 0.3, 1)`, and `y` returns to 0 with duration 0.9 and ease `[0.16, 1, 0.3, 1]`. Switch the transition definition depending on the on/off state so the attack is instant and the release is slow.
- **Flash timing**: a press stores a unique id for that key. After 140ms, clear the key only if its id is unchanged, so repeated presses keep it lit.
- **Typed characters**: each enters from `opacity 0, y 8px, blur(4px)` to `opacity 1, y 0, blur(0)` with framer's default transition (spans keyed by index + character, `AnimatePresence initial={false}`).
- **Caret**: opacity keyframes `[1, 1, 0, 0]` at `times [0, .5, .5, 1]`, 1s, repeating forever (a hard blink).
- **Record dot**: while recording, opacity pulses `[1, 0.2, 1]` over 1s, repeating; otherwise solid.
- **Buttons**: `whileTap` scale 0.94.

## Interaction and states

- The typing area is `tabIndex={0}`; pointer-down on it focuses it. Key handling is on its `onKeyDown`.
- Ignore events with Cmd or Ctrl held. Backspace removes the last character (no flash). Only letters a–z (case-insensitive) and space (the `space` key) are accepted: flash the key, append the lowercase character, keep the last 34 characters, `preventDefault`. Anything else passes through.
- The first keystroke marks the component "touched": cancel all pending timers (stopping demo playback) and clear the text.
- State is `idle | recording | playing`.
  - Record: mark touched, empty the tape, clear the text, enter `recording`, focus the typing area. Each accepted press then pushes `{ key, t: performance.now() }`.
  - Stop: back to `idle`; Replay is available only if the tape has hits.
  - Replay (enabled only with a tape and in `idle`): mark touched, clear the text, enter `playing`, schedule each hit at `hit.t − firstHit.t` ms without recording, and return to `idle` 400ms after the last hit.
- Clear all timers on unmount.

## Autoplay demo

700ms after mount and then every 5200ms, play `"motion is a material"` as a generated tape (each character's time is the running sum of `90 + random × 120` ms). Runs are skipped once the component is touched (keystroke, Record or Replay), so the demo stops for good.

## Accessibility

- Typing area: `role="textbox"`, `aria-label="Type here to light up the keyboard"`, with the 2px focus ring on the pill. Keys are `aria-hidden`.
- Both controls are `<button type="button">` with a 2px focus-visible outline `#0071e3` (dark `#0a84ff`; Replay adds a 2px offset); Replay is truly `disabled` when unavailable.

## Sound

`LitKeyboard` takes `enableSound?: boolean` (default `true`; `false` silences it). Each letter or space the visitor types plays `tap` from `@/lib/ui-sounds` at 50% volume (a short dry click: a sine dropping from 900 to 620 Hz in 60ms plus a faint high hiss), and Backspace plays the same at 40%. Held-key repeats are silent. A replay the visitor starts with the Replay button taps each recorded key with the original timing; the autoplay phrase is silent. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- A letter press lights its key in `glow` within ~50ms, drops it 3px, and fades back over ~0.9s starting 140ms after the last press.
- Space lights the 230px bar; digits, punctuation and Cmd/Ctrl shortcuts do nothing.
- The pill never holds more than 34 characters; Backspace deletes one.
- The plate tilts back 24° around its bottom edge.
- Record, type, Stop, then Replay reproduces the run with the same rhythm, and Replay is disabled during playback.
- With `autoplay`, "motion is a material" types itself after 0.7s and every 5.2s, and stops forever after the first keystroke.
