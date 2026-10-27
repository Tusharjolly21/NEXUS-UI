# Text Generate Typewriter

Build an assistant-reply card that streams its answer one character at a time with a blue caret, a pulsing green status dot and a status line that flips between "Ready to write", "Writing a reply…" and "Reply ready". It has a Replay button. In this section it answers a blue chat bubble on a light grey stage. It should feel like a real AI reply: quick, steady and calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useInView`, `useReducedMotion`), lucide-react icon (`RotateCcw`).
- File: `components/blocks/text-animations/text-generate-typewriter.tsx`, named export `TextGenerateTypewriter` (also export `TextGenerateTypewriterProps`).
- No sound and no audio files: this component is silent.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `text` | `string` | required | The reply to type. |
| `typingSpeed` | `number` | `22` | Milliseconds per character (one interval tick each). |
| `startOnView` | `boolean` | `true` | Start by itself when scrolled into view. |
| `startOnHover` | `boolean` | `false` | Start when the pointer enters the card. |
| `showCursor` | `boolean` | `true` | Render the caret. |
| `showControls` | `boolean` | `true` | Render the Replay button. |
| `className` | `string` | — | Merged onto the card. |

## Layout and look

Card:
- `div`, relative, `overflow-hidden`, radius 28px, padding 20px (`sm` 24px). Light: white bg, text `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)`. Dark: `#1c1c1e`, text `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.08)`.
- Header row: flex, space-between, 12px gap, 20px margin below.
  - Status dot: 8px circle; `#34c759` once started, else `#d2d2d7` (dark `#48484a`), 300ms colour transition. While typing, an absolutely positioned twin pulses behind it.
  - Status text: 13px medium, line-height 18px, in an 18px-tall clipping box, truncated, `#6e6e73` / dark `#a1a1a6`, 10px left of the dot.
  - Controls (when `showControls`): a Replay button, a 36px tall pill, 14px horizontal padding, 13px medium, 6px gap, `RotateCcw` 14px at stroke 2. Bg `#e8e8ed`, hover `#dcdce1`, dark `#2c2c2e` / hover `#3a3a3c`, focus-visible 2px outline `#0071e3` offset 2px.
- "Start typing" button, shown until started: 44px tall pill, 20px padding, 15px medium, `#0071e3` bg (hover `#0077ed`), white text, 16px margin below.
- Reply text: `p`, `min-height: 9.5rem`, `whitespace-pre-wrap`, `text-pretty`, 19px / 1.5 (`sm` 22px / 1.45), medium, -0.015em, `#1d1d1f` / dark `#f5f5f7`.
- Caret: inline-block, 2px wide, 1.05em tall, `margin-left: 0.08em`, `translateY(0.18em)`, rounded, `#0071e3` / dark `#2997ff`.

Section (the composition this block shows):
- `section`: flex, centred, full width and height, `overflow-hidden`, bg `#f5f5f7` (dark `black`), padding 20px × 48px (`sm` 32px horizontal). Inner column `max-w-2xl`.
- User bubble, right aligned (`ml-auto w-fit max-w-[85%]`): radius 20px with a 6px bottom-right corner, padding 16px × 12px, `#0071e3`, white 15px text: "Why did churn go up last quarter?".
- The card sits 16px below.

## Motion

- Typing: a `setInterval` of `typingSpeed` ms advances the index by one while started, motion is allowed and the index is short of the text length.
- Start on view: `useInView(ref, { once: true, margin: "-80px" })`; 180ms after it becomes true, reset and start. Fallback: if `startOnView` is on and nothing has started after 500ms, start anyway.
- Status dot pulse: from `opacity 0.5, scale 1` to `opacity 0, scale 2.4`, 1.1s, `easeOut`, infinite.
- Status text swap: `AnimatePresence mode="popLayout" initial={false}`, keyed by the label. In from `opacity 0, y 100%, blur(4px)`; out to `opacity 0, y -100%, blur(4px)`; spring stiffness 420, damping 34.
- Caret: solid (0.1s) while typing; blink keyframes `[1, 1, 0, 0, 1]`, times `[0, 0.45, 0.55, 0.9, 1]`, 1.05s, `easeInOut`, infinite when idle.
- Buttons: `whileTap` scale 0.97 (Replay and Start).

## Interaction and states

- Replay: reset the index to 0 and start again.
- Clicking anywhere on the card starts it; button clicks stop propagation.
- Status label: typing → "Writing a reply…"; started and done → "Reply ready"; otherwise "Ready to write".
- Reduced motion: show the whole reply at once, no caret.

## Demo data

- Reply: "Churn rose 1.8 points, almost entirely from annual plans that renewed in August. Most of those accounts never invited a second teammate, so the fastest lever is an invite prompt in week one."
- On the page: `startOnView`, `typingSpeed={40}`, `className="mt-4"`.

## Accessibility

- A `sr-only` paragraph holds the full reply; the visible typed paragraph is `aria-hidden`.
- The status text box is `aria-live="polite"`, so the three states are announced, not every character.
- Real `type="button"` buttons with visible focus outlines.

## Acceptance checklist

- [ ] Scrolling the card into view starts typing ~180ms later at one character per `typingSpeed` ms.
- [ ] The status line flips "Ready to write" → "Writing a reply…" → "Reply ready" with a vertical blur swap.
- [ ] The green dot pulses only while typing.
- [ ] Nothing makes any sound.
- [ ] Replay types the reply again from the start.
- [ ] With `startOnView={false}` a blue "Start typing" button waits for a click.
- [ ] `showControls={false}` hides the Replay button.
- [ ] Reduced motion shows the full reply instantly.
