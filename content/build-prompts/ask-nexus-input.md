Build an "ask anything" question field: a big centred headline over a white pill-shaped input. While the field is empty, sample questions roll through the placeholder, sliding up out of a soft blur. When the user sends a question, the pill gives a tiny springy kick and the typed words break into fine dust that blows off to the right, letter by letter starting from the last character, before the field clears and is ready again. Calm, Apple-light, with one moment of magic.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useSpring`, `useReducedMotion`) and a `cn` class helper. The dust is a plain 2D `<canvas>` driven by `requestAnimationFrame`.
- File: `components/ask-nexus-input/ask-nexus-input.tsx`, named export `AskNexusInput`, exported type `AskNexusInputProps`.
- Dark mode is read from the `dark` class on `<html>` with `useSyncExternalStore` plus a `MutationObserver` on the `class` attribute (server snapshot `false`), because the canvas needs the actual text colour.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Ask anything"` | Headline above the field. |
| `placeholders` | `string[]` | "What makes a landing page convert?", "Explain springs versus easing curves", "Write a haiku about shipping on Friday", "Which stack should a new startup pick?", "How do I make a button feel alive?" | Questions that roll through the placeholder while empty. Sending an empty field asks the one showing. |
| `placeholderInterval` | `number` | `2800` | ms each placeholder stays up. |
| `defaultValue` | `string` | `""` | Initial text. |
| `onSubmit` | `(value: string) => void` | — | Called with the trimmed question the moment it is sent, before the dust starts. |
| `autoplay` | `boolean` | `false` | Types and sends the placeholders in turn until someone touches the component. |
| `className` | `string` | `""` | Extra classes on the root. |

## Layout and look

- Root: full-width flex column, centred, gap 32px, padding 4px horizontal / 24px vertical.
- Headline `<h2>`: `text-balance`, centred, `clamp(28px, 6vw, 44px)`, semibold, line-height 1.05, tracking −0.04em, `#1d1d1f` (dark `#f5f5f7`).
- Form: full width, max 540px.
- Pill: 56px tall, fully rounded, white (dark `#1c1c1e`), padding 20px left / 8px right, gap 8px, items centred. Shadow `0 0 0 1px rgba(0,0,0,.06), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.1), 0 20px 40px -26px rgba(0,0,0,.9)`). On `focus-within`: `0 0 0 1px rgba(0,113,227,.5), 0 0 0 5px rgba(0,113,227,.12), …same drop` (dark uses `rgba(10,132,255,.6)` and `rgba(10,132,255,.18)`), with a shadow transition.
- Search icon: 18px, 20×20 viewBox, circle at (8.5, 8.5) r 5.5 plus a handle from (12.6, 12.6) to (17, 17), stroke 1.8 round, `#86868b` (dark `#98989d`).
- Text area: a `relative` 28px-tall flex-1 box (`min-w-0`). Inside, an `overflow-hidden` absolute layer holds the real `<input>` (absolute inset 0, transparent, 16px, tracking −0.01em, `#1d1d1f` / `#f5f5f7`, no outline, `spellCheck` off, `autoComplete="off"`) and the animated placeholder span (absolute, flex-centred, truncate, same type, `#86868b` / `#8e8e93`, pointer-events none). The dust canvas sits outside the clipping layer (absolute top-left) so it can blow past the right edge.
- Send button: 40×40 circle, `#0071e3` (dark `#0a84ff`), white 16px arrow (`M3 8h9.5M8.5 3.5L13 8l-4.5 4.5`, stroke 2, round caps and joins). Disabled opacity 60%.
- Hint under the form: 13px, `#86868b` (dark `#a1a1a6`), pulled up 16px (`-mt-4`): "Press Enter to ask. Empty asks the one showing."

## Motion

- Placeholder roll: `AnimatePresence mode="popLayout" initial={false}` keyed by the placeholder index. Enter from `y 18, opacity 0, blur(4px)` to rest; exit to `y −18, opacity 0, blur(4px)`; spring stiffness 300, damping 26. Advance the index every `placeholderInterval` with `setInterval`, only while idle, empty and with more than one placeholder.
- Submit kick: a `useSpring(1, { stiffness: 520, damping: 13 })` drives the pill's `scale`. On send call `kick.jump(0.965)` then `kick.set(1)` so it snaps in and wobbles back.
- Send button: `whileHover` scale 1.06, `whileTap` scale 0.86, spring 520 / 18.
- Dust (the core effect), canvas width = text box width + 110px overhang, height = box height, scaled for `devicePixelRatio` capped at 2:
  1. Capture the input's computed `font` at submit time. Draw the text with that font, `textBaseline: "middle"` at x 0, y H/2, in `rgb(29,29,31)` (dark `rgb(245,245,247)`).
  2. Measure each character cumulatively to get right-edge bounds; binary-search a pixel's x to its letter index.
  3. Read pixels over the original box width, stepping `round(dpr)` px. Every pixel with alpha ≥ 110 becomes a grain at its CSS-pixel position. Per grain: angle `a = (rand − 0.6)·π·0.7`, speed `sp = 0.25 + rand·0.7`, `vx = cos(a)·sp + 0.18`, `vy = sin(a)·sp·0.7 − 0.08`, `delay = (lettersFromEnd)·42ms + rand·24`, `life = 520 + rand·380` ms, size 1px (65%), 1.4px (27%) or 1.9px (8%). Clear the canvas.
  4. Each frame: grains still waiting are drawn at their origin; in the last 80ms before their delay they shiver by up to ±0.3px scaled by `k = 1 − remaining/80`. Released grains with `t = elapsed − delay`, `n = t/life`, `m = t/16`:
     `x = ox + vx·m·(1 − 0.35n) + sin((oy + m)·0.3)·0.5n`, `y = oy + vy·m − 4n²`, alpha `cos(n·π/2)`. Skip grains past their life.
  5. When no grain is alive, stop and call done: clear the snapshot and value, return to idle, run any queued autoplay callback, and refocus the input on the next frame if the user has interacted.
- While dissolving, the real input is `opacity-0` and `readOnly`, so only the canvas shows.

## Interaction and states

- Phases: `idle` and `dissolving`. Submitting (Enter or the button) prevents default, marks the component as touched, and asks `value || currentPlaceholder`. Empty after trim or not idle: do nothing.
- Ask: call `onSubmit(trimmed)`, store the snapshot and font, kick, switch to `dissolving`.
- Reduced motion: no kick, no dust; the value clears immediately and the phase stays `idle`.
- The placeholder only shows when idle and the value is empty.
- Any pointer down on the root, focusing, or typing sets `touched`, which stops autoplay for good.

## Autoplay demo

After 1400ms, start a cycle with placeholder index `k` (starting at 1, incrementing, wrapping): type the question one character every 42ms, wait 600ms after the last character, then snapshot it, kick and dissolve. When the dust finishes, wait 1500ms and run the next cycle. Every timeout checks `touched` before acting; clear all timeouts on unmount or when `placeholders` change (key on `placeholders.join("\u0000")`).

## Accessibility

- The input has a visually hidden `<label>` "Ask a question" linked by a `useId`-based id (strip colons).
- Send is a native submit button with `aria-label="Ask"`, focus ring 2px `#0071e3` (dark `#0a84ff`) with 2px offset (dark offset colour `#1c1c1e`), disabled while dissolving.
- The rolling placeholder and the canvas are `aria-hidden`. A visually hidden `aria-live="polite"` span announces "Asked: {question}".

## Acceptance checklist

- Placeholders slide up out of a blur every 2.8s while the field is empty and stop rolling once you type.
- Enter on an empty field asks the placeholder that is showing.
- `onSubmit` receives the trimmed text immediately on send.
- The pill dips to ~96.5% and springs back on send.
- The text dissolves into grains from the last letter towards the first, drifting right and up and fading, and may spill past the pill's right edge.
- The field clears and refocuses once the last grain fades; the button is disabled during the effect.
- Reduced motion clears instantly with no dust or kick.
- Autoplay types and sends questions in a loop and stops for good on the first touch.
- Dark mode recolours the headline, pill, icon, button and dust.
