# Island Morph

Build a black, phone-notch-style pill that morphs between four live states: a small idle pill, a countdown timer, an incoming call and a full music player. The shape springs to each new size first, and the new content blurs and scales in just after it lands. A segmented control underneath switches states. It should feel like iOS: heavy, smooth, slightly springy, never wobbly.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layoutId`).
- File: `components/island-morph/island-morph.tsx`, named export `IslandMorph`; also export `IslandMorphProps` and `type IslandMode = "idle" | "timer" | "call" | "music"`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Cycles through the states by itself until a control is pressed. |

All content (timer, caller, track) is built in; there are no other props.

## Layout and look

- Root: full-width vertical flex, centred, 32px gap.
- Stage: full width, 190px tall, the island pinned to the top centre (it grows downward).
- Island: black background, white text, `overflow: hidden`, `position: relative`. Shadow `0 20px 40px -20px rgba(0,0,0,.5)`; dark mode adds a hairline: `0 0 0 1px rgba(255,255,255,.12), 0 20px 40px -20px rgba(0,0,0,.8)`.
- Sizes (width × height, radius):
  - idle 126 × 37, 22
  - timer 230 × 37, 22
  - call 350 × 76, 40
  - music 370 × 186, 46
- Idle: a 10px "camera" dot at the right (12px right padding), `#1c1c1e` with `inset 0 0 0 2px #2c2c2e`.
- Timer: space-between row, 12px left / 16px right padding. Left: 24px circle `#ff9f0a` at 20% alpha holding a 14px stopwatch icon (orange stroke 2.6, round caps: circle r8 at 12,13 plus `M12 9v4l2 2M10 2h4`). Right: `m:ss` in 17px semibold tabular numbers, `#ff9f0a`.
- Call: row with 12px padding and gap. 52px avatar circle with a 135° gradient `#5e5ce6 → #bf5af2`, initials "AR" 18px semibold. Text column: "Incoming call" 13px at white/55%, "Alex Rivera" 17px semibold, truncated. Then two 44px round buttons: Decline `#ff3b30` (white phone glyph rotated 135°) and Accept `#34c759` (white phone glyph).
- Music: 20px padding, column with space-between. Top row (14px gap): 58px artwork square, radius 14px, conic gradient from 200° through `#ff375f, #ff9f0a, #ffd60a, #30d158, #0a84ff, #bf5af2, #ff375f`; title "Night Drive" 17px semibold; artist "Coastal Lines" 14px white/55%; on the right a 28px-tall equaliser of four 3px bars, 3px apart, bottom-aligned, `#ff375f`, fully rounded. Middle: 5px progress track (white/20%, rounded) with a white fill; below it "0:42" and "-2:51" at 11px tabular, white/45%, space-between, 6px gap. Bottom: centred row, 40px gap: Previous, Play/Pause, Next — 40px round hit areas; prev/next icons 22px white/90% (filled + 1.5px stroke), play/pause 30px white.
- Segmented control: 4-column grid, radius 12px, 3px padding, bg `#e8e8ed` / dark `#3a3a3c`. Buttons 32px tall, 16px horizontal padding, radius 9px, 13px medium, capitalised labels (idle, timer, call, music), `#1d1d1f` / `#f5f5f7`. Active thumb: white / dark `#636366`, radius 9px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`, behind the label.

## Motion

- Morph spring (shape and content): stiffness 380, damping 30, mass 0.9.
- Island: `layout` plus `animate={{ width, height, borderRadius }}` from the size table, `initial={false}`.
- Content swap: `AnimatePresence mode="popLayout" initial={false}`, one absolutely-filling child keyed by mode. Enter from `opacity 0, scale 0.9, blur(10px)` to sharp with the morph spring and a 0.08s delay. Exit to `opacity 0, scale 0.9, blur(10px)` in a quick 0.18s tween. The old content fades fast while the shape moves, and the new content settles after.
- Accept button breathes: scale `[1, 1.08, 1]`, 1.1s, repeating forever.
- Taps: call buttons scale 0.88, play/pause 0.85, prev/next 0.82 (`whileTap`).
- Equaliser while playing: each bar loops its height through its own keyframes — bar 0 `[6,22,8]`, bar 1 `[12,26,6]`, bar 2 `[8,18,24]`, bar 3 `[16,6,20]` px — duration `0.8 + i × 0.12s`, `repeatType: "mirror"`, easeInOut. Paused: all bars go to 4px.
- Progress: fill starts at 18% width and animates linearly to 92% over 40s while playing; while paused, pass no width target.
- Play/pause icon swap: `AnimatePresence mode="popLayout"`; enter from `scale 0.4, opacity 0, rotate −40°`, exit to `scale 0.4, opacity 0, rotate 40°`, spring stiffness 500, damping 22.
- Segment thumb: shared `layoutId` (namespaced with `useId`), spring stiffness 420, damping 32.

## Interaction and states

- Segment buttons set the mode directly.
- Decline returns to idle; Accept switches to the timer.
- Play/pause toggles `playing` (starts true). Previous/Next are visual only.
- The timer always runs in the background: starts at 272 seconds (4:32), drops by 1 every second, and wraps from 0 to 299. Display minutes without padding and seconds padded to two digits.
- Every control press marks the component as touched.

## Autoplay demo

When `autoplay` is true, every 2600ms advance through timer → call → music → idle, looping. Once any control (segment, accept, decline) is pressed, the interval clears itself on its next tick and the island stays where the user put it.

## Accessibility

- The island is `role="status"` with `aria-live="polite"`.
- The segmented control is `role="group"` labelled "Island state"; each button has `aria-pressed` and a 2px `#0071e3` focus-visible outline.
- Icon buttons have `aria-label`s: "Decline", "Accept", "Previous", "Next", and "Pause"/"Play" matching the current state. All SVGs are `aria-hidden`; the equaliser too.

## Acceptance checklist

- [ ] Idle shows a 126×37 black pill with a dot on the right.
- [ ] Each segment morphs the pill to the exact size and radius above with one smooth spring.
- [ ] Old content blurs out quickly; new content blurs in slightly after the shape moves.
- [ ] The timer counts down every second from 4:32, even while another state is showing.
- [ ] Accept pulses; Accept goes to the timer, Decline to idle.
- [ ] In music, the equaliser bounces while playing, flattens on pause, and the icon spins between play and pause.
- [ ] The segment thumb slides between options.
- [ ] With `autoplay`, it cycles every 2.6s and stops after a press.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing a state button (Idle, Timer, Call, Music), or Accept or Decline on the call, plays `whoosh` from `@/lib/ui-sounds` (a soft band of filtered noise sweeping from low to high) at reduced volume as the island changes shape. Pressing the state that is already active makes no sound.
- The autoplay cycle is silent, and so are play/pause and hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
