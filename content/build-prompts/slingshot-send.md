# Slingshot Send

Build a chat composer whose send button is a slingshot. The user pulls a blue stone back in the sling, the rubber bands stretch, and on release the message flies out along an arc and lands in the conversation with a small squash. The feel is an Apple-like, physical, springy messaging card: playful but tidy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`) and `flushSync` from `react-dom`.
- File: `components/slingshot-send/slingshot-send.tsx`, named export `SlingshotSend`, plus exported `SlingshotSendProps` and `SlingshotMessage` (`{ id: number; me: boolean; text: string; hidden?: boolean }`).
- The component never makes a network request. Its only output is the optional `onSend` callback.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `name` | `string` | `"Maya"` | Header name; its first letter (uppercased) is the avatar. |
| `onSend` | `(text: string) => void` | none | Called with the trimmed text when a message is fired. |
| `autoReply` | `boolean` | `true` | A canned reply arrives 1.1 s after a message lands. |
| `autoplay` | `boolean` | `false` | Types, pulls back and fires by itself until someone touches the card. |

Seed thread: "Are we still on for tonight?" (them), "Yes! Where do you want to go?" (me), "That ramen place on 5th?" (them). The input starts with "See you at 7?". Replies: "Perfect.", "Haha okay", "On my way", "Love that" (by `id % 4`).

## Layout and look

- Card: 360px wide (`max-w-full`), 500px tall, column, `overflow-hidden`, relative, radius 28px. Light: white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e`, ring `rgba(255,255,255,.08)`.
- Header: row, 12px gap, padding 20px / 14px, bottom border black 5% (dark white 10%). Avatar 36px circle `#ff9f0a`, 14px semibold white initial. Name 15px semibold `#1d1d1f` (dark `#f5f5f7`); below it "Online", 12px `#30d158`.
- Thread: `flex-1`, vertical scroll, column, 8px gap, padding 16px. Bubbles: max 75% wide, radius 18px, padding 14px / 8px, 15px text, line-height 1.35. Mine: right aligned, bottom-right radius 6px, `#0071e3` (dark `#0a84ff`), white text. Theirs: left aligned, bottom-left radius 6px, `#f0f0f3` (dark `#2c2c2e`), text `#1d1d1f` (dark `#f5f5f7`).
- Composer: top border as the header, padding 16px sides, 12px top, 20px bottom, 12px gap, items at the bottom. Input: 44px tall pill, `#f5f5f7` (dark `#2c2c2e`), 16px side padding, 15px text, placeholder "Message" `#86868b` (dark `#8e8e93`), focus ring 2px blue. A hint "Pull back and let go" (11px, `#86868b`) sits at the top right while the draft has text.
- Slingshot: a 64x70 box with an overflow-visible SVG. Frame path `M32 70 L32 46 M32 46 Q18 40 14 18 M32 46 Q46 40 50 18`, stroke `#8e8e93`, width 6, round caps. Prong tips at (14,18) and (50,18). Two band lines run from the tips to `(32 + x - 9, 22 + y)` and `(32 + x + 9, 22 + y)`, x and y being the stone's drag offsets; width 2.5, round caps, black (dark white) at opacity `0.35 + 0.4 * stretch`, `stretch = min(1, hypot(x, y) / 70)`.
- Stone: 36px circle at left 14px, top 4px, `#0071e3` (dark `#0a84ff`), shadow `0 6px 14px -6px rgba(0,113,227,.8)`, white 16px up-arrow (stroke 2.6, path `M12 19V5M5 12l7-7 7 7`). Cursor grab, `touch-action: none`.

## Motion

- Drag: both axes, no momentum, elastic 0.6, constraints left -50, right 50, top -10, bottom 70. x and y are shared motion values, so the bands follow with no re-render.
- Release: d = hypot(x, y). If d > 26 and the draft is non-empty, fire with `power = min(1, d / 70)`. The stone always springs home: stiffness 700, damping 12 if fired, 9 if it was a short tug (a wobbly twang).
- Fire: record the stone's centre in card coordinates. Add your message to the thread with opacity 0 (an invisible landing spot), clear the draft, hide the stone (scale to 0 in 0.05 s), scroll the thread to the bottom, then measure the landing spot. Wrap the state change in `flushSync` so the spot exists before measuring.
- Flight: an absolutely positioned bubble copy (landing-spot width, no pointer events, z-index 10, shadow `0 14px 30px -12px rgba(0,113,227,.7)`) follows a quadratic curve sampled at 13 points (t = i/12) from the stone centre to the landing centre. Control point: `cx = fromX - 60 - power*60`, `cy = min(fromY, toY) - 90 - power*90`. Per point: scale `0.4 + (i/12)*0.7` (last point 1), rotate `-30 + (i/12)*30` degrees, scaleY 1 (last point 0.82, the squash). Starts at scale 0.3, rotate -30. Duration `0.75 - power*0.25` s, ease `[0.3, 0.1, 0.45, 1]`.
- Land: reveal the real bubble, remove the copy, bring the stone back after 250 ms (scale 0 to 1), then add the reply after 1100 ms if `autoReply`.
- Thread bubbles use `layout="position"` with a spring (stiffness 500, damping 30). Incoming bubbles enter from opacity 0, scale 0.8, y 8.

## Interaction and states

- Pointer: drag the stone back and release. Any press on the card counts as touched and stops autoplay.
- Keyboard: Enter in the input submits and fires with power 0.6. The stone is focusable (`role="button"`, `tabIndex 0`); Enter or Space pulls it to about (-12, 46) over 0.5 s, releases it, and returns focus to the input. An empty draft fires nothing.
- Reduced motion: no flight; the message appears directly and autoplay is off. Dragging still works.
- Clear all timers on unmount.

## Autoplay demo

Every 3.2 s, while on screen and the tab is visible: set the input to the next of "See you at 7?", "I'll book a table", "Bring the umbrella", pull the stone to (-18, 52) over 0.5 s, then release. After every third line reset the thread to the seed. It stops for good on the first press or drag.

## Accessibility

- Thread: `role="log"`, `aria-live="polite"`, label "Conversation with {name}". Input labelled "Message". Stone labelled "Send message. Drag back and release, or press Enter or Space." with `aria-disabled` while the draft is empty. The flying copy is `aria-hidden`. Visible focus rings on input and stone.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Picking up the stone (starting a drag, or pressing Enter or Space on it) plays `lift` once per pull (a soft rising noise sweep from about 800 to 2400 Hz with a short sine rising from 300 to 520 Hz, 80ms). Letting go past the dead zone with text in the field, or sending with Return, plays `whoosh` as the message leaves (an airy noise sweep rising from 400 to 3200 Hz over about 0.25s). A short tug that just twangs back sends nothing and plays no whoosh. Incoming replies and the autoplay conversation make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Releasing beyond 26px sends; a shorter tug sends nothing and only twangs.
- Bands stay attached to the prong tips, stretching and darkening with the pull.
- The message follows a curved path, grows in, and squashes as it lands exactly on the new bubble.
- Enter in the input, and Enter or Space on the focused stone, also send.
- The stone disappears during flight and returns about 250 ms after landing.
- `onSend` gets the trimmed text once per message; no network request is made.
- A canned reply appears about 1.1 s after landing when `autoReply` is on.
- Dark mode recolours every surface and bubble; the card keeps its 360px width.
