# Scratch Reveal

Build a reward scratch card. A pastel card holds a prize and a code under a sheet of brushed silver foil. Rub the foil with the pointer and it wears through where you scratch, shedding flecks of silver dust that fall out of the card. Once most of it is gone, the rest of the foil lifts away on its own with a puff of confetti and the code becomes a button that copies itself to the clipboard. The feel is a polished, slightly playful Apple-style promo.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`AnimatePresence`, `motion`), two `<canvas>` elements.
- File: `components/scratch-reveal/scratch-reveal.tsx`. Named export `ScratchReveal` and its `ScratchRevealProps` type.

## API

- `code?: string`, default `"MOTION20"`.
- `headline?: string`, default `"20% off Pro"`.
- `eyebrow?: string`, default `"You won"`.
- `accent?: string`, default `"#bf5af2"`: eyebrow colour.
- `threshold?: number`, default `0.55`: share of foil that must be cleared before it lifts away.
- `onReveal?: () => void`: called once each time the foil comes off (scratch, keyboard or autoplay).
- `onCopy?: (code: string) => void`: called after a successful clipboard write.
- `className?: string`: extra classes on the root.
- `autoplay?: boolean`, default `false`.

## Layout and look

- Root: column, centred, 12px gap.
- Fit wrapper: `width: 320px; max-width: 100%`, height `190 · scale`. A `ResizeObserver` sets `scale = min(1, wrapperWidth / 320)` (starts at 1). Inside, the card box is exactly 320×190 (`W`, `H`), `position: relative`, `overflow: visible`, `transform: scale(scale)` from the top-left when `scale < 1`.
- Card face (fills the box): radius 22px, `overflow: hidden`, column, centred, 8px gap, centred text. Background `radial-gradient(120% 100% at 20% 0%, #fff3d6, transparent 60%), linear-gradient(135deg, #ffe7f0, #e8e4ff)`; dark `radial-gradient(120% 100% at 20% 0%, rgba(255,214,140,.16), transparent 60%), linear-gradient(135deg, #3a2433, #262140)` plus a `0 0 0 1px rgba(255,255,255,.08)` ring.
  - Eyebrow: 12px semibold uppercase, tracking 0.18em, `accent`.
  - Headline: 30px semibold, tracking −0.03em, `#1d1d1f` (dark `#f5f5f7`).
  - Code button: 4px top margin, rounded-full, 1px dashed border `rgba(29,29,31,.3)` (dark `rgba(255,255,255,.3)`), background `rgba(255,255,255,.7)` (dark `rgba(255,255,255,.1)`), 16px × 8px padding, 8px gap, 15px semibold, tracking 0.12em, `#1d1d1f` (dark `#f5f5f7`), font `ui-monospace, 'SF Mono', Menlo, monospace`. After the code, a label at 11px medium, normal tracking, system font, `#0071e3` (dark `#0a84ff`): "Copy", "Copied", or "Couldn't copy". It's `disabled` until revealed but keeps full opacity.
- Foil canvas: fills the card, radius 22px, `cursor: crosshair`, `touch-action: none`. Backing store `320·dpr × 190·dpr` with `dpr = min(2, devicePixelRatio)`, created with `getContext("2d", { willReadFrequently: true })`, transform scaled by `dpr`. Paint:
  - Linear gradient from (0,0) to (320,190): `#d9dadf` 0, `#f4f5f8` .35, `#b9bbc3` .5, `#eceef2` .7, `#c4c6cd` 1.
  - Grain: 900 random 1×1 black pixels at alpha .08 (random is fine here, it runs in an effect).
  - "SCRATCH HERE" centred at (160, 99), `600 13px -apple-system, BlinkMacSystemFont, sans-serif`, `rgba(29,29,31,.5)`.
  - The foil stays silver in dark mode.
- Dust canvas: non-interactive, at the box's top-left, 320×270 CSS px (80px taller than the card so dust falls out of it), backing store scaled by `dpr`.
- Confetti (only once revealed): 14 squares, 8×8, radius 2px, starting at the card centre, colours cycling `#ff375f`, `#ffd60a`, `#30d158`, `#0a84ff`, `#bf5af2`.
- Status line under the card: 13px, tabular, `#86868b` (dark `#98989d`): "Scratch the foil · {pct}%" or "Revealed. Tap the code to copy it."

## Motion

- Scratching: on the foil context set `globalCompositeOperation = "destination-out"`, round caps and joins, line width `BRUSH = 22`, and stroke a line from the last point (or the same point on a fresh stroke) to the current one. Each call also spawns 3 flecks at `x ± 11`, `y ± 4`, `vx ∈ [−1, 1]`, `vy ∈ [−1.5, 0]`, `life 1`.
- Dust loop (`requestAnimationFrame`): clear, drop dead flecks, then for each fleck `vy += 0.25`, move by its velocity, `life −= 0.02`, draw a 2×2 square in `#a1a3ab` at alpha `life`.
- Progress: every 12th scratch call read the foil's pixels and sample the alpha of every 16th pixel; the share with alpha < 40 is the cleared fraction. Store `round(p · 100)` as `pct`; when `p > threshold`, reveal.
- Reveal: the foil canvas unmounts through `AnimatePresence`, exiting to `opacity 0, scale 1.04, filter blur(6px)` over 0.6s.
- Confetti: square `i` animates from `x 0, y 0, opacity 1, rotate 0` to `x cos(i) · (120 + (i mod 3) · 30)`, `y sin(i) · 80 − 30`, `opacity 0`, `rotate 180` over 0.9s `easeOut`. (Deterministic, so no hydration issues.)

## Interaction and states

- Pointer down on the foil: mark touched, capture the pointer, reset the last point and scratch at the pointer. Positions map from the canvas's bounding rect to 320×190 so they work when scaled.
- Pointer move: scratch if a button is down or it's a touch pointer; otherwise reset the last point (so hovering doesn't draw).
- Keyboard: the foil is focusable; Enter or Space reveals it at once.
- Copy: `try { await navigator.clipboard.writeText(code); label "Copied"; onCopy(code) } catch { label "Couldn't copy" }`. Clipboard can be blocked in iframes or insecure contexts, so never claim success without it.
- A ref mirrors the revealed state so scratch calls after reveal do nothing and `onReveal` fires once per reveal.
- When the foil remounts (not revealed) paint a fresh foil in an effect keyed on the revealed state.

## Autoplay demo

With `autoplay`, run a frame counter `t`. For `t < 220`, scratch at `x = 30 + ((sin((t/220) · 9π) + 1) / 2) · 260`, `y = 25 + (t/220) · 140` (a zig-zag down the card). After `t > 380`, reset: `t = 0`, clear the last point and stroke count, un-reveal, `pct 0`, copy label back to "Copy", and repaint the foil if it's still mounted. A `touched` ref set by any pointer down on the root, the foil keyboard reveal or the copy button stops the loop for good. Cancel both frame loops and the `ResizeObserver` on unmount.

## Accessibility

- Foil canvas: `role="button"`, `tabIndex 0`, `aria-label="Scratch card foil. Scratch it off, or press Enter to reveal the code."`, focus ring `focus-visible` 2px `#0071e3` (dark `#0a84ff`) with 2px offset (dark offset `#1c1c1e`).
- Code button: native `<button>`, `aria-label` "Copy code MOTION20" (or "Code MOTION20 copied"), same focus ring.
- A visually hidden `role="status"` announces "Revealed: MOTION20". Dust canvas and confetti are `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. While the visitor scratches the foil, `swipe` plays at 25% volume, at most once every 120ms, so it reads as a quiet repeated rasp (a short filtered-noise sweep falling from about 3200 Hz to 500 Hz, 0.14s each). When the foil comes off, by scratching or by Enter or Space, `success` plays (two soft triangle notes, about 1046 Hz then 1318 Hz, 90ms apart). Pressing the Copy button plays `tap` (a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss). The autoplay scratching and reveal make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] The foil is brushed silver with fine grain and "SCRATCH HERE" in the middle.
- [ ] Dragging across it clears a 22px round-ended line and drops silver dust that falls below the card.
- [ ] Hovering without pressing doesn't scratch; touch scratches without a button.
- [ ] The percentage in the status line climbs as you scratch.
- [ ] Past 55% the rest of the foil blurs, grows slightly and fades out in 0.6s, with a burst of confetti.
- [ ] The code button only works after reveal; a successful copy shows "Copied", a blocked one "Couldn't copy".
- [ ] Enter on the focused foil reveals it.
- [ ] Autoplay zig-zags down the card, reveals, waits, then starts over, and stops for good on first touch.
- [ ] At 280px wide the card scales down and scratching still lands under the pointer.
- [ ] Dark mode swaps the card gradient, text, code chip and status colour; the foil stays silver.
