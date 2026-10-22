# Ghost Autocomplete

Build inline AI autocomplete for a text box. You write an email; pause for a moment and a grey suggestion fades in right after your cursor, with a small "Tab" key badge on its end. Press Tab and the suggestion inks in from left to right as if it were being typed, then becomes normal text. Keep typing the same words as the suggestion and it shrinks to follow you. Type something else and the ghost letters tip over and fall away. Escape dismisses a suggestion. The box is a real textarea with a real caret; the grey text is drawn on a layer underneath.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/ghost-autocomplete/ghost-autocomplete.tsx` plus an `index.ts`. Named exports: `GhostAutocomplete`, the types `GhostAutocompleteProps` and `GhostRule`, and the constants `GHOST_AUTOCOMPLETE_RULES` and `GHOST_AUTOCOMPLETE_START`.

## API

`GhostRule` is a tuple `[pattern: RegExp, suggestion: string]`. When the whole text ends with the pattern (use a regex anchored with `$`, without the `g` flag), the suggestion is offered.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `rules` | `GhostRule[]` | four demo rules | What to suggest after which endings. |
| `defaultValue` | `string` | "Hi Leo,\n\nThanks for " | The starting text. |
| `to` | `string` | "leo@fieldnotes.example" | The recipient line. |
| `onAccept` | `(suggestion: string) => void` | none | Called when Tab accepts. |
| `width` | `number` | `480` | Card width in px, never wider than the container. |
| `autoplay` | `boolean` | `false` | Types a script by itself until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds (see Sound). |
| `className` | `string` | `""` | Extra classes for the card. |

Demo rules: ending "As discussed, " suggests "I'll send the revised proposal by Friday."; "Let me know if " suggests "anything looks off before then."; "\n\nBest,\n" (or "\n\nBest,") suggests "\nMaya"; "Thanks for " suggests "the call today."

## Layout and look

- Card: width 480px, `max-width: 100%`, radius 28px, padding 20px (24px from `sm`), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Header: "To: <address>" at 13px medium muted (`#6e6e73` / dark `#a1a1a6`), truncating, and on the right a `Tab` key cap (radius 5px, bg `#f5f5f7` / dark `#2c2c2e`, 11px semibold, a 1px bottom shadow) followed by "to accept".
- Text box: 12px below the header, radius 16px, minimum height 190px, bg `#f5f5f7` / dark `#2c2c2e`. When focused it gets a 2px outline `#0071e3` (dark `#0a84ff`).
- Two layers share exactly the same type: `white-space: pre-wrap`, `break-words`, 16px horizontal and 14px vertical padding, 16px text at line-height 1.6. The display layer is in normal flow (it sizes the box, so long text grows the card) and is `aria-hidden`; it ends with a zero-width space so a trailing newline still takes a line. The real `<textarea>` sits over it (absolute, inset 0, no resize, no scrollbars), with transparent text and a caret in `#0071e3` (dark `#0a84ff`).
- Ghost text: `#86868b` / dark `#8e8e93`, followed by a 6px-left-margin inline key badge "Tab" (radius 5px, 10.5px semibold, bg white / dark `#3a3a3c`, text muted, 1px ring in light).
- Hint line: 12px below the box, minimum height 20px, 12.5px muted: "Pause typing for a suggestion", or `Suggestion: "<text>"` with the quoted text in the main text colour.

## Motion

- Offer: 650ms after the last change (and only while the caret is at the end of the text and the suggestion has not been dismissed for this text), the matching rule's suggestion fades in over 0.35s.
- Accept (Tab): the typed text becomes the old text plus the suggestion; each accepted character fades from 42% opacity to full, delayed by `index * 12ms`, 0.25s each, so the ink runs left to right.
- Follow: typing the next character of the suggestion removes it from the front of the ghost, so the grey text shrinks as you type.
- Drop: typing anything else clears the ghost and animates each of its letters (as separate inline-blocks) to `opacity 0, y 10, rotate +-10 degrees` (alternating signs) over 0.35s, delayed by `index * 8ms`; they are removed after 450ms.
- Dismiss: ghost fades out in 0.1s. The hint line cross-fades.
- Reduced motion: no ink stagger, no dropping letters (the ghost just fades), 0.1s fades.

## Interaction and states

- Tab with a visible suggestion accepts it and keeps focus in the box; without one, Tab moves focus as usual (no keyboard trap). Shift+Tab is never intercepted.
- Escape with a visible suggestion dismisses it and it does not come back until the text changes.
- The suggestion only shows while the caret is at the very end of the text (selection events clear it otherwise), because that is where it would be inserted.
- The component is uncontrolled; it keeps its own text starting from `defaultValue`.

## Autoplay demo

With `autoplay`, only while the card is on screen, the tab is visible and motion is not reduced, the component types into itself on a loop: accept "the call today." (1.4s); type " As discussed, " (from 2.3s, 60ms per character) and accept the suggestion (4.3s); type " Let me know if " (from 5.0s); type "a", then "ny" (the suggestion follows); type "way" (it does not match, the ghost drops); reset the text at 10.6s and loop at 10.8s. The script is written for the default rules and text. Focus, typing or a pointer press stops it for good.

## Accessibility

- The textarea has `aria-label="Email body"` and is described by the hint line. A polite `sr-only` `role="status"` region announces `Suggestion: <text>. Press Tab to accept or Escape to dismiss.` whenever one appears.
- Because the drawn layer is `aria-hidden`, the real textarea is the only thing read; the ghost colour is intentionally low emphasis, and the same text appears at full contrast in the hint line.
- Focus ring: 2px `#0071e3` (dark `#0a84ff`) around the box. Key caps are decorative text.

## Sound

Prop `enableSound?: boolean` (default `true`), using `useSound` from `@/lib/ui-sounds`.

- `tick` (volume 0.4) once when Tab accepts a suggestion.
- Typing, following a suggestion, dropping and dismissing are silent.
- In autoplay the accept steps play the same `tick` through `play.auto` (silent until the visitor has used the page).

## Acceptance checklist

- [ ] After 650ms of silence following "Thanks for " the grey "the call today." appears with a Tab badge.
- [ ] Tab inks it in left to right and the caret ends after it.
- [ ] Typing the next letters of a suggestion shrinks it; any other letter drops it away.
- [ ] Escape dismisses and it does not reappear until the text changes; moving the caret away hides it.
- [ ] Long text grows the card and the ghost never drifts out of line with the caret.
- [ ] Tab with no suggestion moves focus on normally.
- [ ] Autoplay runs the scripted loop while visible and stops at the first touch.
- [ ] Reduced motion fades instead of staggering or dropping; dark mode follows the colours above; works at 360px wide.
