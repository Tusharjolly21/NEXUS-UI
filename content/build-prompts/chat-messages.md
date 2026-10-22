Build a messaging-app style chat thread. A white card with a header, a scrolling thread of grouped bubbles and a composer. The signature move: while the assistant "types", its typing bubble grows into the reply bubble instead of being swapped for it. In autoplay the conversation plays itself, the user lines typing into the composer and popping out as blue bubbles, and the visitor can take over at any moment and chat with canned replies. Calm, tactile and Apple-light, with a full dark mode.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), the `cn` class helper.
- File: `components/chat-messages/chat-messages.tsx`, named export `ChatMessages`, exported types `ChatMessagesProps` and `ChatMessage`.

## API

`ChatMessage = { id: string; sender: "user" | "assistant"; content: string; timestamp?: string }`. Timestamps show under the last bubble of a group.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `messages` | `ChatMessage[]` | five demo messages (a landing page chat that ends at 9:41) | The conversation. Shown in full unless autoplay is on. |
| `autoplay` | `boolean` | `false` | Plays the conversation and loops it until someone touches the chat. `autoPlay` is a deprecated alias. |
| `autoPlayDelay` | `number` | `900` | Pause after each message during autoplay, ms. |
| `typingDuration` | `number` | `1300` | How long the assistant shows typing dots before a reply, ms. |
| `showReplay` | `boolean` | `true` | Replay button in the header. |
| `interactive` | `boolean` | `true` | Lets the visitor type and send. When false the input is read-only. |
| `reply` | `(text: string) => string \| Promise<string>` | three canned replies in rotation | Produces the assistant's answer to a sent message. |
| `onSend` | `(text: string) => void` | none | Called with the text of every sent message. |
| `title` | `string` | `"Nexus AI"` | Name in the header. |
| `className` | `string` | `""` | Root classes; give it a height such as `h-[480px]` to change the default 440px. |

## Layout and look

- Root: column, `h-[440px] w-full max-w-[400px]`, radius 24px, `overflow: hidden`, white (`#1c1c1e` in dark), ink `#1d1d1f` (`#f5f5f7` dark), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, deeper drop).
- Header: row, 12px gap, `px-4 py-3`, 1px bottom border `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). A 36px round avatar with a 135 degree gradient `#0071e3` to `#bf5af2` and a white four-point sparkle. Beside it the title (15px semibold) and a 16px high status line (12px, `#6e6e73`, dark `#a1a1a6`) that swaps between a 6px green dot with "Online" and "typing..." by sliding 12px up and fading. A 32px round replay icon button on the right.
- Thread: `flex-1`, scrolls vertically, scrollbar hidden, `px-3 py-4`. Bubbles: max width 78%, `px-3.5 py-2`, 14px, line height 1.38. User bubbles right aligned, `#0071e3` (dark `#0a84ff`), white text. Assistant bubbles left aligned, `#e9e9eb` (dark `#2c2c2e`). Corners are 18px, except the last bubble of a run, whose tail corner (bottom right for user, bottom left for assistant) is 6px. 3px between bubbles of a run, 12px between runs. Timestamp 11px tabular, `#86868b`, 4px below the last bubble of a run.
- Typing bubble: assistant style, `px-3 py-2.5`, holding three 7px dots (`#8e8e93`).
- Composer: row, 8px gap, `p-3`, top border like the header. A 36px high pill input (`#f0f0f3`, dark `#2c2c2e`, 14px, placeholder `#86868b`) and a 36px round send button (`#0071e3`, dark `#0a84ff`) with an up arrow.

## Motion

- Bubbles pop from their corner: `layoutId` per message inside a `LayoutGroup`, transform origin at the bottom corner on the sender's side. Spring `{ stiffness: 520, damping: 24, mass: 0.8 }`. Sent user bubbles start at `opacity 0, scale .5, y 14`.
- The typing bubble appears with `scale .4` to 1 on the same spring, and shares its `layoutId` with the reply that replaces it, so the bubble morphs into the reply on the spring `{ stiffness: 380, damping: 30 }`. The reply text fades in 0.25s after a 0.08s delay.
- Typing dots bounce: `y 0, -4, 0` and opacity `.45, 1, .45`, 0.9s forever, 0.14s stagger.
- Send button: scale `.86` and opacity `.45` when the field is empty, 1 when filled; tap scale `.82`.
- Replay button: tap scale `.9` and rotate `-40deg`.
- New content scrolls into view smoothly (instant under reduced motion).

## Interaction and states

- State: list of items (message plus how it arrived: static, typed or sent), the id of the message currently being typed, the draft, and the demo draft.
- Sending: appends a user bubble, calls `onSend`, shows the typing bubble after 350ms, then resolves `reply` (or the next canned line) and swaps in the reply once at least `typingDuration + 350` ms have passed since sending.
- The first touch (pointer down, focus or typing) during the demo cancels every timer, clears the demo draft and shows the whole conversation so the visitor can join in.
- Replay clears the thread and plays the demo again.

## Autoplay demo

Starts 450ms after mount. For each message: assistant lines show typing dots for `typingDuration` and then the reply; user lines type into the composer at 24ms per character, wait 260ms, clear the field and pop out as a bubble. After each message wait `autoPlayDelay`. When the last message is shown wait 3200ms, clear the thread and loop. Stops for good on the first touch. Reduced motion types instantly.

## Accessibility

- The thread is `role="log"` with `aria-live="polite"` and a label. The typing bubble has `role="status"` and a label. The input has a screen reader label.
- Send is a real submit button; Enter sends. Visible focus rings (2px `#0071e3`, dark `#0a84ff`).
- Reduced motion removes the pop-in, bounce and smooth scrolling.

## Acceptance checklist

- [ ] The typing bubble grows into the reply instead of disappearing.
- [ ] User lines type into the composer in autoplay and pop out as blue bubbles.
- [ ] The visitor can interrupt the demo and send their own message and gets a reply.
- [ ] Timestamps appear only under the last bubble of a run.
- [ ] `onSend` fires with the text of each sent message.
- [ ] Dark mode recolours the card, bubbles and header.
- [ ] No horizontal overflow at 320px.

---

<!-- Chat Messages: Motion Kit variant brief -->

> The Chat Messages page has 3 variants. The brief above rebuilds the original Chat Messages; the briefs below rebuild the Motion Kit Composer Morph Chat and Chat Head variants.

---

<!-- variant: composer-morph-chat -->

# Composer Morph Chat

Build an AI chat where your message does not just appear: the text in the composer lifts out of the field and morphs into the sent bubble on its way up the thread. The reply starts as a shimmering "Thinking" pill, then streams in word by word, each word sharpening out of a blur, and the first reply carries a small code card. All replies are canned demo text; nothing touches the network.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), the `cn` class helper.
- File: `components/chat-messages/composer-morph-chat.tsx`. Named export `ComposerMorphChat`, exported type `ComposerMorphChatProps`.

## API

- `autoplay?: boolean`, default `false`: types two scripted questions into the composer and sends them, once, until someone touches the chat.
- `onSend?: (text: string) => void`: called with the text of every sent message.
- `className?: string`: root classes.

## Layout and look

- Root: `relative`, column, `h-[520px] w-[380px] max-w-full`, radius 28px, `overflow: hidden`, white (dark `#1c1c1e`), ring shadow `0 0 0 1px rgba(0,0,0,.05)` plus `0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, drop alpha .9).
- Header: `px-5 py-4`, 12px gap. 36px round avatar filled with `conic-gradient(from 200deg, #0a84ff, #bf5af2, #ff375f, #ff9f0a, #0a84ff)` and a 14px white dot in the middle (dark `#1c1c1e`). "Nexus" 15px semibold and "Design assistant" 12px `#6e6e73` (dark `#a1a1a6`).
- Thread: `flex-1`, column, 12px gap, scrolls vertically, `px-4 pb-4`. User bubbles: right aligned, max width 82%, `#0071e3` (dark `#0a84ff`), white text, `px-4 py-2.5`, radius 20px with a 6px bottom right corner, 15px text, line height 1.45. Assistant messages: left aligned, no bubble, plain text, same size.
- Thinking pill: left aligned, full radius, `#f5f5f7` (dark `#2c2c2e`), `px-4 py-2`, 13px medium, the word "Thinking" filled with a moving gradient: grey `#6e6e73` (dark `#a1a1a6`) with a lighter-to-ink band `#1d1d1f` (dark `#f5f5f7`) at 50%, `background-size: 200% 100%`, clipped to the text, background position `100% 0` to `-100% 0` over 1.4s linear forever.
- Code card (under the first reply): 12px top margin, radius 16px, 1px border `rgba(0,0,0,.07)`, `#f5f5f7` (dark `#2c2c2e`, border `rgba(255,255,255,.1)`). Title bar: `px-3 py-2`, 11px medium muted, "hero.tsx" on the left and a small "Copy" pill button on the right (white, `#0071e3` text; dark `#1c1c1e` and `#0a84ff`). The Copy button writes the snippet to the clipboard and reads "Copied" for 1.4s; clipboard failures are ignored. Body: monospace 11.5px, line height 1.55, `px-3 py-2.5`, showing a three-line `<motion.h1 initial=... animate=... />` snippet.
- Composer: top border `rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`), `p-3`, 8px gap. Input: 44px high pill, `#f5f5f7` (dark `#2c2c2e`), `px-4`, 15px, placeholder "Ask Nexus..." in `#86868b`. Send button: 44px circle, `#0071e3` (dark `#0a84ff`), white up arrow.

## Motion

- The flight. On send, measure the input rectangle and record the text. Append the user bubble hidden (`opacity: 0`) so layout settles, scroll the thread to the bottom, measure the hidden bubble's rectangle (both relative to the root), and put a copy of the text on an absolutely positioned overlay that animates from the input rectangle to the bubble rectangle: `x, y, width, height` on the spring `{ stiffness: 260, damping: 26 }`, corner radius 22 to 20. The overlay has two layers sharing the text: a blue layer with white text underneath, and a composer-coloured layer (`#f5f5f7` / dark `#2c2c2e`, ink text) on top whose opacity goes 1 to 0 on the same spring, so the colour follows the theme without animating hex values. Both layers use `px-4 pt-2.5`. When the overlay finishes, reveal the real bubble, remove the overlay and start the reply.
- The field clears the moment the message is sent.
- Reply: after the bubble lands the Thinking pill enters (opacity 0, scale .8 from the left, to 1) and leaves (scale .9, fade). 1400ms later it is replaced by the reply.
- Streaming: each word is an inline block that goes from `opacity 0, blur(6px), y 3` to `opacity 1, blur(0), y 0` over .35s, delayed by `index * 0.055` s.
- The code card enters at `opacity 0, y 10, scale .97` to rest on the spring `{ stiffness: 300, damping: 26 }`, delayed until the last word starts: `wordCount * 0.055 + 0.1` s.
- The send button animates to scale 1 and opacity 1 when there is text, scale .85 and opacity .4 when empty; tap scale .9.

## Interaction and states

- State: messages `{ id, me, text, hidden?, card? }`, the draft, a thinking flag, the flight `{ id, text, from, to }`. A ref tracks whether a flight is in progress; sending is ignored while it is.
- Scripted replies: turn 0 answers with the first scripted reply and the code card, turn 1 with the second scripted reply (no card), later turns cycle two canned lines. The script applies to visitor messages too.
- Any pointer down, focus or typing marks the chat as touched and cancels the autoplay timers.
- Reduced motion: no flight (the bubble appears at once), words and card appear without animation, the pill does not scale, the shimmer stops.

## Autoplay demo

When the chat is on screen, 900ms later type "Make the hero feel less static" into the composer at 45ms per character, wait 400ms and send it; 6200ms after the start do the same with "Nice. Shorter copy?". Not started under reduced motion or after a touch. Waits while the chat is off screen or the tab is hidden before beginning.

## Accessibility

- The input has a label; send is a real submit button (`aria-disabled` while empty). The thread is `role="log"` with a label and is announced politely once the visitor has interacted. The thinking pill has `role="status"`. The flight overlay is `aria-hidden`.
- Focus rings: ring on the input, 2px offset outline on buttons, `#0071e3` (dark `#0a84ff`).
- Reduced motion respected as above.

## Acceptance checklist

- [ ] The text lifts out of the field and lands as a blue bubble without a jump.
- [ ] The colour change follows light and dark mode.
- [ ] The Thinking text shimmers; the reply streams in word by word out of a blur.
- [ ] The first reply shows a code card with a working Copy button.
- [ ] Autoplay sends both scripted questions and stops for good on the first touch.
- [ ] Sending while a message is still flying is ignored.
- [ ] No timers left running after unmount.
- [ ] No horizontal overflow at 320px.

---

<!-- variant: chat-head -->

# Chat Head

Build a chat that lives in a floating head, like the bubbles on a phone. Drag the head anywhere and it flings to the nearest edge; drop it on the target at the bottom to dismiss it. New messages make it bounce and peek a preview beside it. Tap it and the conversation springs out of the bubble. It works inside its own bounded stage, so it can be placed in any container, and is fully keyboard operable.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useMotionTemplate`, `useReducedMotion`), the `cn` class helper.
- File: `components/chat-messages/chat-head.tsx`. Named export `ChatHead`, exported type `ChatHeadProps`.

## API

- `autoplay?: boolean`, default `false`: bounces the head, peeks messages and drifts it between edges until someone touches the stage.
- `name?: string`, default `"Maya"`: shown on the head (first letter), the peek and the panel header.
- `onReply?: (text: string) => void`: called with a quick reply when tapped.
- `onDismiss?: () => void`: called when the head is dropped on the target or dismissed with Delete.
- `className?: string`: stage classes.

## Layout and look

- Stage: `relative`, `h-[540px] w-[360px] max-w-full`, radius 28px, `overflow: hidden`, white (dark `#000`), ring `0 0 0 1px rgba(0,0,0,.06)` plus `0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.1)`). Everything is positioned inside it, never against the viewport.
- A quiet stand-in page: absolute `inset-x-6 top-6`, 12px gap, all `aria-hidden`: a nav row (a 64px by 12px bar `#e8e8ed` and three 32px by 8px bars `#f0f0f3`), two headline bars (20px high, 70% and 48%, `#ececf0`), a 10px sub line (80%, `#f3f3f5`), two 96px cards and a two-column row of 80px cards (`#f5f5f7`, radius 18px). Dark: bars `#3a3a3c` / `#2c2c2e` / `#232325`, cards `#1c1c1e`.
- The head: 60px round button, 135 degree gradient `#ff9f0a` to `#ff375f`, shadow `0 10px 24px -8px rgba(255,55,95,.7)` plus an inset `0 -3px 6px rgba(0,0,0,.15)`, the name's first letter in white at 22px semibold. Docked 14px from the edge. Starts at `x = width - 60 - 14`, `y = 120`.
- Unread badge: top right corner offset -4px, min 24px, full radius, `#ff3b30` (dark `#ff453a`), white 12px bold count, 2px ring in the stage colour.
- Peek: a 200px wide row at the head's height, content aligned towards the head, holding a white bubble (dark `#2c2c2e`), radius 16px, `px-3.5 py-2`, 13px, with the name in 11px semibold muted above the text, shadow `0 10px 30px -12px rgba(0,0,0,.4)`. It sits 12px to the left of a right-docked head (`head.x - 212`) or 10px to the right of a left-docked head (`head.x + 70`).
- Panel: absolute `inset-x-3 bottom-3 top-[84px]`, radius 26px, white (dark `#1c1c1e`), shadow `0 20px 50px -20px rgba(0,0,0,.45)`, column. Header: avatar circle 32px with the same gradient and the name (15px semibold) with a bottom hairline. Thread: scrolls, 8px gap, `p-4`; incoming bubbles `#f0f0f3` (dark `#2c2c2e`), outgoing `#0071e3` (dark `#0a84ff`) white text, 14px, radius 18px, max width 78%. Footer: top hairline, `p-3`, wrapping row of quick reply chips "On it", "Give me 5", "Yes!" (32px high pills).
- Dismiss target: 64px circle, centred horizontally, 40px from the bottom, `rgba(0,0,0,.55)` (dark `rgba(255,255,255,.2)`) with a white cross. A red layer (`#ff3b30`, dark `#ff453a`) fades in over it when the head is close.
- "Bring Maya back" button: centred 32px above the bottom, 40px high pill, `#1d1d1f` with white text (dark `#f5f5f7` with ink).

## Motion

- Drag: `drag` on both axes, no momentum, no elastic. On drag start show the target (fades in from `y 30`) and hide the peek. On release, if the head centre is within 60px of the target centre (`width / 2`, `height - 70`) it flies in over .2s and the chat is dismissed (the head scales to 0 over .25s). Otherwise it snaps to the nearest edge using the release velocity: `x` spring `{ stiffness: 380, damping: 26, velocity }` to 14px from the left or right edge (a point projected by `velocity * 0.15` decides the side), `y` spring `{ stiffness: 380, damping: 30 }` clamped between 54px and `height - 60 - 110`.
- The target scales from .6 to 1 as the head's `y` goes from `height - 260` to `height - 120`.
- New message while closed: the head bounces, scale keyframes `[1, 1.22, 0.92, 1.05, 1]` over .6s, the unread count goes up (badge pops in on a spring `{ stiffness: 600, damping: 18 }`), and the peek scales in from .6 on a spring `{ stiffness: 400, damping: 26 }` and leaves after 2.4s.
- Open: the head springs (`{ stiffness: 300, damping: 26 }`) to the top right (`y = 14`), the unread count clears, and the panel grows from the head: `scale .1, opacity 0, radius 60` to `scale 1, opacity 1, radius 26` on `{ stiffness: 320, damping: 28 }`, with its transform origin following the head centre. Bubbles pop in staggered (`delay 0.15 + index * 0.05`, spring `{ stiffness: 420, damping: 28 }`). Close reverses it.
- Reduced motion: moves are instant, the panel only fades, no bounce.

## Interaction and states

- State: open, dragging, over target, gone, unread (starts at 1), peek text, messages (starts with "Hey! Got a sec?"), side (left or right), touched.
- A click that follows a drag is ignored (a flag set on drag start and cleared shortly after the drag ends); otherwise click toggles the panel.
- Quick replies append an outgoing bubble.
- When dismissed the head and panel are removed and "Bring Maya back" appears and takes focus; pressing it restores the head to its start position and returns focus to it.
- A ResizeObserver keeps a right-docked head on the right edge when the stage narrows.

## Keyboard

- The head is a real button: Enter or Space open and close the panel. Escape closes the panel (from anywhere inside the stage) and returns focus to the head.
- Arrow Left and Right dock the head to the left or right edge, Arrow Up and Down move it 48px, Delete or Backspace dismisses it. A screen reader description explains these keys.
- Tab goes from the head into the panel's quick replies.

## Autoplay demo

Every 1900ms, while the stage is on screen and the tab is visible: tick 1 of each three brings a message from the list ("Lunch at 1?", "Sent you the deck", "Did the build go out?", "Look at this animation", "Free for a quick call?") with the bounce and peek; tick 2 drifts the head to the other edge on a slower spring (`{ stiffness: 160, damping: 18 }`) at a new height `90 + (k * 70) mod 220`. Stops for good on the first pointer or focus interaction. Not run under reduced motion.

## Accessibility

- Head label: "Open chat with Maya, 2 unread" or "Close chat with Maya", with `aria-expanded` and `aria-controls`. The panel is a labelled region, its thread a polite log. Incoming previews are mirrored into a polite screen-reader-only live region once the visitor has interacted.
- The target, badge, peek and stand-in page are `aria-hidden`. Focus rings: 2px offset outline `#0071e3` (dark `#0a84ff`).

## Acceptance checklist

- [ ] The stage is a bounded box; nothing escapes it or depends on the viewport.
- [ ] Dragging flings the head to the nearest edge; dropping on the target dismisses it and offers "Bring Maya back".
- [ ] New messages bounce the head, raise the badge and peek beside the head without a gap.
- [ ] Tapping opens the panel from the head; Enter and Space do the same; Escape closes.
- [ ] A drag never also toggles the panel.
- [ ] Arrow keys move the head and Delete dismisses it.
- [ ] Dark mode recolours the stage, panel, bubbles and target.
- [ ] Autoplay stops on touch, pauses off screen, and leaves no timers after unmount.
- [ ] Fits at 320px wide.
