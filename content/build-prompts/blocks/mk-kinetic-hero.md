# Kinetic Hero

Build a hero headline you scroll through. The letters of "Build something people love." tumble up into place one by one, the last word then turns like a four-sided drum through its alternatives ("remember.", "share.", "pay for."), and at the end the whole section flips to near-black and the two buttons pop in. Everything is scrubbed by scroll, so scrolling back rewinds it. It should feel physical and deliberate: big type, a real 3D drum, smooth colour change.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries), `gsap` 3.13+ with `gsap/ScrollTrigger` and `gsap/SplitText` (both ship in the npm package; register them once at module scope), `useReducedMotion` from framer-motion (or a `matchMedia` hook), and a `cn` helper.
- File: `components/blocks/kinetic-hero.tsx`, named export `KineticHero` and type `KineticHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `words` | `string[]` | `["love", "remember", "share", "pay for"]` | Drum faces; a "." is appended to each. |
| `lead` | `string` | `"Build something"` | First headline line. |
| `subject` | `string` | `"people"` | Word before the drum on line two. |
| `sub` | `string` | `"The component library for interfaces that feel made, not assembled."` | Paragraph. |
| `primaryLabel` | `string` | `"Start building"` | Blue button. |
| `secondaryLabel` | `string` | `"Browse components"` | Outlined button. |
| `hint` | `string` | `"Scroll"` | Scroll cue at the bottom. |
| `contained` | `boolean` | `false` | Off: 260vh section driven by page scroll. On: its own scroll box (for frames that clip overflow). |
| `height` | `number` | `640` | Scroll box height in contained mode (px, minimum 320). |
| `autoplay` | `boolean` | `false` | Contained mode only: scrolls the box down and back in a loop until touched. |
| `onAction` | `(label: "primary" \| "secondary") => void` | — | Button callback; buttons never navigate. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Structure: `<section>` → track `<div>` → sticky stage `<div>` (top 0, flex column centred, overflow hidden, padding 0 24px, text centred, `@container`).
  - Page mode: track `260vh`; stage `100vh`, min-height 560px.
  - Contained mode: the section itself is the scroll box: `height` px, `overflow-y: auto`, `overscroll-behavior: contain`, hidden scrollbar, `tabIndex=0`, inset 2px focus ring `#0071e3` / dark `#0a84ff`. Track `round(height × 2.6)` px; stage `height` px.
- Colours are three CSS variables on the section: `--bg`, `--fg`, `--sub`, each `color-mix(in srgb, END calc(var(--kh-t) * 100%), START)`, where `--kh-t` goes 0 → 1. Start colours come from classes: light `#f5f5f7` / `#1d1d1f` / `#6e6e73`; dark `#1c1c1e` / `#f5f5f7` / `#a1a1a6`. End colours (both modes): `#0b0b0c` / `#f5f5f7` / `#98989d`. Section background `var(--bg)`. Tweening one number instead of the colours keeps a mid-scroll dark-mode toggle correct.
- Headline `<h2>`: `clamp(40px, 8cqi, 104px)`, semibold, line-height 1.02, tracking −0.05em, colour `var(--fg)`. Line one is `lead` (block). Line two is a centred wrapping flex row (baseline aligned, column gap 0.25em) holding `subject` and the drum.
- Drum: an inline-block wrapper 1.1em tall with `perspective: 800px`. Inside, an invisible "sizer" holding the current word sets the width, and an absolutely filled drum element with `transform-style: preserve-3d`. Each face is absolutely filled, centred, nowrap, `backface-visibility: hidden`, text filled with `linear-gradient(to right, #0071e3, #bf5af2, #ff375f)` via `background-clip: text`, and rotated `rotateX(i × step)`. For n faces: `step = 360 / n`; both drum and faces use `transform-origin: 50% 50% −(0.55 / tan(π / n))em` (0.55em for four faces).
- Sub: margin-top 24px, max-width 520px, 19px, line-height 1.45, colour `var(--sub)`.
- Buttons (margin-top 32px, gap 12px, wrap): pills, padding 14px 24px, 16px medium. Primary `#0071e3`, white text. Secondary transparent with a 1px `currentColor` ring, colour `var(--fg)`.
- Hint: absolute, bottom 32px, centred: 12px label in `var(--sub)` above a 1px × 32px pulsing line.

## Motion

Split both text lines with SplitText (`type: "words,chars"`, words class kept `inline-block` + `nowrap`, `aria: "none"`), set `perspective: 600` on the h2. One timeline, `defaults: { ease: "none" }`, ScrollTrigger `scrub: 0.6`, `end: "bottom bottom"` on the track:
- Page mode: `start: "top 75%"`. Contained: `scroller` = the section, `start: "top top"`.

Timeline positions (seconds of timeline, not real time):
- 0: chars `from { yPercent: 130, rotationX: −100, z: −120, opacity: 0, transformOrigin: "50% 100% -20px" }`, stagger 0.025, duration 0.6, `back.out(1.6)`.
- 0.2: hint to opacity 0 over 0.2.
- 0.45: drum `from { opacity: 0, yPercent: 60 }`, 0.3, `power2.out`.
- For each face i ≥ 1 at `0.9 + (i − 1) × 0.55`: drum `rotationX: −step × i` and sizer width to face i's word width, both 0.4, `power2.inOut`. Measure widths after splitting and store them in em (px ÷ font size) so they follow the headline size.
- `end = 0.9 + (n − 1) × 0.55`: `--kh-t` 0 → 1 over 0.45; at `end + 0.1` the buttons `from { y: 40, opacity: 0, scale: 0.9 }`, stagger 0.08, 0.35, `back.out(2)`; then 0.3 of empty hold.

Wrap everything in `gsap.context(…, section)`; return `split.revert()` from it and call `ctx.revert()` on unmount (this kills the ScrollTrigger). Call `ScrollTrigger.refresh()` on the next frame after setup and, via a ResizeObserver on the section (rAF-throttled), whenever it resizes. Rebuild when the copy, words, `contained` or reduced motion change; key the split spans by their text so React never edits split DOM.

## Interaction and states

- Scrolling (page or box) scrubs forward and back. Buttons `preventDefault` and call `onAction("primary" | "secondary")`.
- Reduced motion: no timeline and no tall track. Render the final state statically: `--kh-t: 1` (dark), the drum turned to the last face, the sizer holding the last word, buttons visible, no hint.

## Autoplay demo

Contained, `autoplay`, not reduced: after 0.8s, a repeating GSAP timeline tweens a 0–1 proxy that sets `scrollTop = p × (scrollHeight − clientHeight)`: down over 6.5s (`sine.inOut`), hold 1.6s, back up over 4s, hold 1s. The first `wheel`, `touchstart`, `pointerdown` or `keydown` on the box kills it for good (remember that in a ref). Pause it while the box is off screen (IntersectionObserver) or the tab is hidden.

## Accessibility

- A visually hidden span in the h2 reads `"{lead} {subject} {first word}."` (last word under reduced motion); the split lines are `aria-hidden`.
- Section `aria-label="Hero"`; the contained box is focusable so the keyboard can scroll it.
- Primary focus ring 2px `#0071e3` with 2px offset in `var(--bg)`; secondary ring thickens to 2px.

## Acceptance checklist

- [ ] Letters rise and rotate into place one by one as you scroll, and rewind when you scroll back.
- [ ] The last word turns like a drum through each alternative, with its slot width easing between words.
- [ ] Near the end the section flips to `#0b0b0c` with light text, then the two buttons pop in.
- [ ] Dark mode starts on `#1c1c1e` and still ends on `#0b0b0c`; toggling mid-scroll stays correct.
- [ ] In contained mode it works inside an `overflow: hidden` parent, scrolling its own box.
- [ ] Autoplay scrolls down and back in a loop and stops for good on the first wheel, touch, click or key.
- [ ] Reduced motion shows the dark final state with the last word and no scroll track.
- [ ] Unmounting leaves no ScrollTrigger or split DOM behind; resizing keeps the scrub range right.
- [ ] Buttons never navigate; `onAction` gets the label.
