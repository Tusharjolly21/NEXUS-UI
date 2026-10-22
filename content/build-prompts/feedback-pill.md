# Feedback Pill

Build a small "Feedback" pill that morphs, in one continuous shape, into a note form with a textarea; while sending, the Send label swaps for a spinner; then the shape shrinks into a compact "Thanks, got it." card with a drawn tick before folding back into the pill. One white surface changes size and corner radius on a spring while each stage's content blurs out and in. It should feel like a native popover: compact, quick and smooth.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `layout`).
- File: `components/feedback-pill/feedback-pill.tsx`, named export `FeedbackPill`; export `FeedbackPillProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `label` | `string` | `"Feedback"` | Pill label and form title. |
| `placeholder` | `string` | `"What would make this better?"` | Textarea placeholder. |
| `onSend` | `(message: string) => void \| Promise<void>` | — | Called with the message; the spinner shows until it resolves (minimum 900ms). |
| `accent` | `string` | `"#0071e3"` | Send button, tick circle, textarea focus ring and focus outlines. |
| `autoplay` | `boolean` | `false` | Opens, types and sends a sample message until the user interacts. |

Stages: `closed → open → sending → sent → closed`.

## Layout and look

- Wrapper: full width, 240px tall, content centred.
- Surface: one `motion.div` with `layout`, `overflow: hidden`. Light: white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -20px rgba(0,0,0,.35)`. Dark: `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 18px 40px -20px rgba(0,0,0,.7)`. Border radius 999 when closed, 24 otherwise — set it via `style` so layout animation interpolates it correctly.
- Pill (closed): a button 44px tall, 20px horizontal padding, 8px gap, 15px medium, `#1d1d1f` / `#f5f5f7`, with a 16px speech-bubble icon (stroke 2, round: `M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z`).
- Form (open/sending): 360px wide, 16px padding, 12px gap.
  - Header row: the label as a `<label>` (15px semibold) and a 28px round close button, bg `#f0f0f3` / dark `#3a3a3c`, icon `#6e6e73` / `#a1a1a6` (hover `#1d1d1f` / `#f5f5f7`), 11px × with stroke 3.2.
  - Textarea: 3 rows, no resize, radius 16px, bg `#f5f5f7` / dark `#3a3a3c`, padding 12px × 14px, 15px, `#1d1d1f` / `#f5f5f7`, placeholder `#a1a1a6` (dark `#8e8e93`), no outline; on focus `inset 0 0 0 2px accent`.
  - Footer row: "⌘ Enter to send" 12px `#86868b` / `#98989d`; Send button 36px tall, min width 76px, fully rounded, 16px horizontal padding, accent bg, white 14px medium, `overflow: hidden`, 40% opacity when disabled.
- Sent: 220px wide, 20px padding, centred column, 8px gap: a 40px accent circle with a 20px white tick (`M6 12.5l4 4L18 8.5`, stroke 2.6, round) and "Thanks, got it." 15px semibold.

## Motion

- Shape morph: the surface's `layout` transition is a spring with stiffness 380, damping 32. Width, height and radius all travel together between pill, form and thank-you.
- Content swap: one `AnimatePresence mode="popLayout" initial={false}` holding the three stage views. Each enters from `opacity 0, blur(6px)` to sharp with a short delay (pill 0.1s, form 0.12s, sent 0.1s) and exits to `opacity 0, blur(6px)` in 0.12s. The old content vanishes almost immediately, the shape moves, then the new content resolves.
- Send button contents: `AnimatePresence mode="popLayout" initial={false}`. "Send" enters from `y 12, opacity 0` and exits to `y −12, opacity 0`. The spinner (16px, 2px border white/40% with a white top) scales 0 → 1 and rotates 360° every 0.7s linear, forever; it exits by scaling to 0. `whileTap` scale 0.95.
- Tick: `pathLength 0 → 1` in 0.4s after a 0.25s delay.

## Interaction and states

- Clicking the pill opens the form. When the form opens after user interaction, focus the textarea.
- Submit (button or ⌘/Ctrl + Enter in the textarea): ignore if the trimmed text is empty. Otherwise go to `sending`, await both `onSend(msg)` and a 900ms delay, then `sent`; 1700ms later return to `closed` and clear the text.
- Send is disabled while the text is empty or while sending.
- Close button or Escape in the textarea returns to `closed` (the draft text is kept).
- Keep all timeouts in a ref array so they can be cancelled.

## Autoplay demo

When `autoplay` is true: 900ms after mount, and then every 7600ms, open the form, wait 700ms, type "The dark mode toggle is hard to find." one character at a time with a random 38–78ms gap, and 500ms after the last character send it (this calls `onSend`). The first pointer-down or keydown anywhere in the wrapper takes over: it stops the loop and cancels pending timers; if the form isn't open at that moment it resets to the closed pill with empty text, otherwise it leaves the form open for the user to continue. Clear the interval and timers on unmount.

## Accessibility

- The pill is a `type="button"` with `aria-expanded={false}` and an inset 2px accent focus outline.
- The textarea is labelled by the form's `<label htmlFor>` (id from `useId`).
- Close has `aria-label="Close"`. The thank-you view is `role="status"`. Icons are `aria-hidden`.
- Keyboard: Enter/Space on the pill opens it, ⌘/Ctrl+Enter sends, Escape closes.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Opening the pill plays `pop` at 60% (a quick sine glide from about 320 Hz up to 980 Hz in 70ms). Closing it with the close button or Escape plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss) at 50%. When a message the visitor sent finishes sending and the thanks state appears, `success` (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart, the second ringing out for about 0.3s) plays; if `onSend` rejects, `error` (two short low square-wave bumps, about 220 Hz then 185 Hz, 110ms apart) plays. The autoplay sample plays the same sounds (`pop` at 60% when it opens, `success` when the sample message finishes sending) through the same play function's `auto` variant (`play.auto("pop", 0.6)`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Typing the sample is silent, and so is hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] A 44px pill reading "Feedback" with a bubble icon.
- [ ] Clicking it grows the same surface into a 360px form; the radius eases from pill to 24px; the textarea is focused.
- [ ] Send is dimmed until something is typed.
- [ ] Sending swaps "Send" for a spinning ring for at least 0.9s.
- [ ] The surface shrinks into a small card with a drawn tick and "Thanks, got it.", then folds back into the pill after ~1.7s.
- [ ] Escape and the × close the form without losing the draft.
- [ ] With `autoplay`, it opens, types and sends a sample on a loop until you click or press a key.
- [ ] Dark mode uses the colours above.
