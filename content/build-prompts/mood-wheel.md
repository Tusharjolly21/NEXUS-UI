# Mood Wheel

Build a mood picker where feelings sit along the rim of a large invisible wheel. You drag, scroll or arrow through them; the words roll past on a curve, the one in the centre gets bracketed, the sentence below ("Today I feel calm.") updates, and a soft orb beside the wheel melts into that mood's colours. It should feel calm, tactile and Apple-like: the wheel coasts and snaps with real inertia, never jumps.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`, `useReducedMotion`).
- File: `components/mood-wheel/mood-wheel.tsx`, named export `MoodWheel`, plus exported types `MoodWheelProps`, `Mood` and the constant `DEFAULT_MOODS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `moods` | `Mood[]` | `DEFAULT_MOODS` | Words on the wheel, top to bottom. `Mood = { word: string; a: string; b: string }`: `a` is the main orb colour, `b` the light one. |
| `autoplay` | `boolean` | `false` | Spins to a random mood every 2 s until the user drags, scrolls or presses a key. |

`DEFAULT_MOODS` (word, a, b): Calm `#8ec5ff` `#d7f0ff`; Curious `#7ee0c3` `#e3fff4`; Hopeful `#ffd36e` `#fff4d1`; Playful `#ff9fd0` `#ffe6f3`; Proud `#ffb057` `#ffeacc`; Restless `#ff7a6b` `#ffe0db`; Tired `#a7a3d9` `#ebe9ff`; Tender `#f6a6b2` `#ffe9ec`; Focused `#5aa7ff` `#dceeff`; Grateful `#9fd36b` `#eefcd9`.

## Layout and look

- Root: vertical flex, centred, 16px gap: the wheel card, then the caption.
- Card: 420×280px, `max-width: 100%`, radius 24px, `overflow: hidden`, `touch-action: none`, no text selection, `cursor: grab` (grabbing while pressed). Light bg `#ffffff` with `0 0 0 1px rgba(0,0,0,.05)`; dark bg `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08)`. Focus-visible: 2px ring `#0071e3` (dark `#0a84ff`) with 2px offset.
- Words: each absolutely placed at `left: 68px; top: 50%; margin-top: -14px`, `transform-origin: left`, no wrapping, 20px, weight 500, tracking -0.01em, colour `#1d1d1f` / dark `#f5f5f7`.
- Brackets around the centre slot: two 8×44px spans at `top: 50%; margin-top: -22px`, one at `left: 50px` (2px border on top, bottom and left, left corners rounded 6px), one at `left: 196px` (top, bottom, right, right corners rounded). Border `#1d1d1f` / dark `#f5f5f7`. Pointer events off.
- Orb: 150px circle, `right: 32px`, vertically centred. Background `radial-gradient(circle at 35% 30%, #ffffff 0%, b 30%, a 72%, a 100%)`, box shadow `0 30px 60px -20px a`, using the current mood's colours. A second circle of the same size sits on top with `mix-blend-mode: overlay` and `conic-gradient(from 0deg, rgba(255,255,255,.5), rgba(255,255,255,0) 40%, rgba(255,255,255,.4) 70%, rgba(255,255,255,0))` as a sheen.
- Caption: a paragraph, flex with `align-items: baseline`, 6px gap, 17px, colour `#6e6e73` / dark `#a1a1a6`: "Today I feel" followed by a 24px-tall, overflow-hidden, semibold span in the ink colour holding the current word lowercased plus a full stop ("hopeful.").

## Motion

- State is one motion value `pos`: a float index into `moods`, starting at 2. For word `i`, derive the angle `a = (i − pos) × 0.32` radians, then:
  - `x = cos(a)·220 − 220`, `y = sin(a)·220` (a wheel of radius 220 whose centre sits 220px to the left, so the centre word is at its rest spot),
  - `rotate = a` in degrees,
  - `opacity = max(0, 1 − |a| / 1.25)`,
  - `scale = 1 + max(0, 0.45 − 1.2·|a|)` (the centre word is 1.45×, shrinking to 1 as it leaves).
  Use `useTransform` so nothing re-renders while the wheel moves.
- The selected index is `clamp(round(pos), 0, n−1)`, updated from a `change` listener on `pos`.
- Release / settle: `animate(pos, pos.get(), { type: "inertia", velocity, power: 0.4, timeConstant: 260, modifyTarget: t => clamp(round(t), 0, n−1), min: 0, max: n−1, bounceStiffness: 300, bounceDamping: 30 })`. It coasts and always lands exactly on a word.
- Jump to an index (keys, autoplay): spring `stiffness 140, damping 20`.
- Orb colours: animate `background` and `boxShadow` to the new mood over 0.8s. The sheen layer rotates 360° every 14s, linear, forever.
- Caption word: `AnimatePresence mode="popLayout" initial={false}` keyed by word; enters from `y 22, opacity 0, blur(4px)`, exits to `y -22, opacity 0, blur(4px)`, framer's default transitions.

## Interaction and states

- Drag (pointer events with pointer capture): on down store start Y, start `pos`, velocity 0, last Y and timestamp. On move: `pos = startPos + (startY − clientY) / 40` (40px per word; dragging up moves to later words). Velocity in words per second: `((lastY − clientY) / 40) / max(0.008, dt_seconds)`. On up: settle with that velocity. On cancel: settle with 0.
- Wheel: `pos += deltaY × 0.004`, clamped to `[-0.4, n − 0.6]` so it can overshoot a little; debounce 120ms after the last wheel event, then settle with velocity 0. Clear the timeout on unmount.
- Keys (on the focused card, `preventDefault`): ArrowDown / ArrowRight next word, ArrowUp / ArrowLeft previous, Home first, End last; all clamp and use the spring.
- Any pointer down, wheel or key marks the component as touched.

## Autoplay demo

When `autoplay` is true, every 2000ms (if not touched) spring `pos` to a random index. Once touched it never resumes.

## Accessibility

- The card is `role="slider"`, `tabIndex={0}`, `aria-label="Mood"`, `aria-orientation="vertical"`, `aria-valuemin={0}`, `aria-valuemax={n−1}`, `aria-valuenow={index}`, `aria-valuetext={word}`.
- Wheel words, brackets and the orb are decorative (`aria-hidden`). The caption is `aria-live="polite"`.
- With `prefers-reduced-motion`, the sheen layer stays still.

## Sound

`MoodWheel` takes `enableSound?: boolean` (default `true`; `false` silences it). Each time a new word reaches the centre slot while the visitor drags, scrolls, flicks or uses the arrow keys (including while the wheel coasts to rest), `tick` plays from `@/lib/ui-sounds` at 50% volume: a very short, dry high-passed noise click (about 12ms, centred above 5 kHz). Ticks are throttled to one per 40ms. The autoplay spinning is silent until the visitor first touches the wheel. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Ten words curve along an arc to the right of the brackets; the centre word is largest and fully opaque, words fade out about four slots away.
- [ ] Dragging 40px moves exactly one word; a quick flick coasts several words and snaps onto one.
- [ ] The wheel never rests between words and can't settle past the first or last word.
- [ ] Scrolling over the card rolls the wheel and snaps 120ms after scrolling stops.
- [ ] Arrow keys, Home and End move the selection with a spring.
- [ ] The orb cross-fades to the new mood's gradient and coloured shadow over 0.8s.
- [ ] The caption word slides up and out with a blur and the new one slides in from below.
- [ ] With `autoplay`, it hops to random moods every 2s until you touch it.
- [ ] Dark mode swaps the card, words, brackets and caption colours listed above.
