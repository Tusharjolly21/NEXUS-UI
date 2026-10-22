# Slingshot Send

Build a chat composer whose send button is a slingshot. The user pulls a blue stone back in the sling, the rubber bands stretch, and on release the message flies out along an arc and lands in the conversation with a small squash. The feel is an Apple-like, physical, springy messaging card: playful but tidy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`) and `flushSync` from `react-dom`.
- File: `components/slingshot-send/slingshot-send.tsx`, named export `SlingshotSend`, plus exported `SlingshotSendProps` and `SlingshotMessage` (`{ id: number; me: boolean; text: string; hidden?: boolean }`).
- The component must never make a network request. Its only output is the optional `onSend` callback.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `name` | `string` | `"Maya"` | Name in the header; its first letter (uppercased) is the avatar. |
| `onSend` | `(text: string) => void` | none | Called with the trimmed text at the moment a message is fired. |
| `autoReply` | `boolean` | `true` | After a message lands, the other person answers with a canned line about 1.1 s later. |
| `autoplay` | `boolean` | `false` | Types, pulls back and fires messages by itself until someone touches the component. |

Seed thread: "Are we still on for tonight?" (them), "Yes! Where do you want to go?" (me), "That ramen place on 5th?" (them). The input starts with "See you at 7?". Canned replies: "Perfect.", "Haha okay", "On my way", "Love that" (pick by `id % 4`).

## Layout and look

- Card: 360px wide (`max-w-full`), 500px tall, column flex, `overflow-hidden`, radius 28px, `position: relative`. Light: white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- Header: row, 12px gap, padding 20px / 14px, bottom border `black/5` (dark `white/10`). Avatar 36px circle `#ff9f0a`, white 14px semibold initial. Name 15px semibold `#1d1d1f` (dark `#f5f5f7`); under it "Online" 12px `#30d158`.
- Thread: `flex-1`, scrolls vertically, column, 8px gap, padding 16px. Bubbles: max width 75%, radius 18px, padding 14px / 8px, 15px text, line-height 1.35. Mine: `self-end`, bottom-right corner 6px, `#0071e3` (dark `#0a84ff`), white text. Theirs: `self-start`, bottom-left corner 6px, `#f0f0f3` (dark `#2c2c2e`), text `#1d1d1f` (dark `#f5f5f7`).
- Composer: top border like the header, padding 16px sides, 12px top, 20px bottom, items at the bottom, 12px gap. Text input: 44px tall, full pill, `#f5f5f7` (dark `#2c2c2e`), 16px side padding, 15px text, placeholder "Message" in `#86868b` (dark `#8e8e93`), focus ring 2px `#0071e3` (dark `#0a84ff`).
- A hint "Pull back and let go" (11px, `#86868b`, dark `#8e8e93`) sits at the composer's top right (`-top-1 right-4`), only while the draft has text.
- Slingshot: a 64x70 box right of the input. An SVG of the same size (overflow visible): the frame is a single path `M32 70 L32 46 M32 46 Q18 40 14 18 M32 46 Q46 40 50 18`, stroke `#8e8e93`, width 6, round caps, no fill. The prong tips are (14,18) and (50,18).
- Two band lines run from each prong tip to the stone: left to `(32 + x - 9, 22 + y)`, right to `(32 + x + 9, 22 + y)`, where x, y are the stone's drag offsets. Stroke width 2.5, round caps, stroke black in light and white in dark, opacity `0.35 + 0.4 * stretch`, where `stretch = min(1, hypot(x, y) / 70)`.
- Stone: 36px circle at `left 14px; top 4px` inside the slingshot box, `#0071e3` (dark `#0a84ff`), shadow `0 6px 14px -6px rgba(0,113,227,.8)`, a white 16px up-arrow icon (stroke 2.6, path `M12 19V5M5 12l7-7 7 7`). Cursor grab, grabbing while active, `touch-action: none`.

## Motion

- Dragging: the stone is draggable in both axes, no momentum, elastic 0.6, constraints left -50, right 50, top -10, bottom 70. x and y are motion values shared with the bands, so the bands follow without re-rendering.
- Release: let d = hypot(x, y). If d > 26 and the draft is non-empty, fire with `power = min(1, d / 70)`. Either way the stone springs home: stiffness 700, damping 12 if it fired, 9 if it was a short tug (so a short tug twangs and wobbles back).
- Firing: measure the stone's centre in card coordinates. Append your message to the thread immediately with opacity 0 (an invisible landing spot), clear the draft, hide the stone (scale to 0 in 0.05 s), scroll the thread to the bottom, then measure the landing spot's box. Use `flushSync` around the state change so the landing spot exists before measuring.
- Flight: an absolutely positioned copy of the bubble (same width as the landing spot, `pointer-events: none`, z-index 10, shadow `0 14px 30px -12px rgba(0,113,227,.7)`) follows a quadratic curve sampled at 13 points (t = i/12) from the stone centre to the landing spot's centre. Control point: `cx = fromX - 60 - power*60`, `cy = min(fromY, toY) - 90 - power*90`. Keyframes per point: scale `0.4 + (i/12)*0.7` (final point 1), rotate `-30 + (i/12)*30` degrees, scaleY 1 (final point 0.82, the squash). It starts at scale 0.3, rotate -30. Duration `0.75 - power*0.25` s, ease `[0.3, 0.1, 0.45, 1]`.
- Landing: when the flight completes, reveal the real bubble (opacity 0 to 1), remove the flight copy, bring the stone back 250 ms later (scale 0 to 1), and if `autoReply` add the reply after 1100 ms.
- Thread bubbles use `layout="position"` and a spring (stiffness 500, damping 30). Incoming (theirs) bubbles enter from opacity 0, scale 0.8, y 8.

## Interaction and states

- Pointer: drag the stone back and release. Any pointer down on the card marks it as touched (stops autoplay).
- Keyboard: Enter in the input submits the form and fires with power 0.6. The stone itself is focusable (`role="button"`, `tabIndex 0`); Enter or Space pulls it to about (-12, 46) over 0.5 s and releases, then returns focus to the input. With an empty draft nothing is fired.
- Reduced motion: no flight; the message appears in the thread directly, and autoplay does not run. Dragging still works.
- Cancel timers on unmount.

## Autoplay demo

Every 3.2 s, if the card is on screen and the tab is visible: put the next line from "See you at 7?", "I'll book a table", "Bring the umbrella" in the input, animate the stone to (-18, 52) over 0.5 s, then release (which fires it). After every third line, reset the thread to the seed messages. Stops permanently as soon as anyone presses or drags on the card.

## Accessibility

- Thread: `role="log"`, `aria-live="polite"`, label "Conversation with {name}". Input labelled "Message". Stone labelled "Send message. Drag back and release, or press Enter or Space." with `aria-disabled` while the draft is empty. The flying copy is `aria-hidden`.
- Visible focus rings on the input and the stone (2px blue, with an offset on the stone).

## Acceptance checklist

- Pulling the stone further than 26px and releasing sends the message; a shorter tug sends nothing and only twangs.
- The bands visibly stretch and darken with the pull and stay attached to the prong tips.
- The message travels along a curved path, shrinks in then grows to full size, and squashes slightly on landing exactly over the new bubble.
- Pressing Enter in the input sends the message too; Enter or Space on the focused stone does as well.
- The stone vanishes while the message is in flight and pops back about 250 ms after landing.
- `onSend` receives the trimmed text once per message and no network request is made.
- A canned reply appears about 1.1 s after landing when `autoReply` is true.
- Dark mode switches every surface, text and bubble colour; the card never leaves its 360px width.
