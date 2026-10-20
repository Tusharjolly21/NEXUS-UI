<!-- Like Burst: Motion Kit variant brief -->

> The Like Burst page has 2 variants. The original Like Burst source is on the page; this brief rebuilds the Motion Kit Confetti Like variant.

---

<!-- variant: confetti-like -->

# Confetti Like

Build a like button with a heart and a count. Liking squashes the heart, fills it, and throws out an expanding ring and a burst of ten confetti dots; the count goes up by one and only the digits that change roll over (1,300 → 1,301 rolls just the last digit). Unliking deflates the heart quietly with a small squeeze and no burst. The feel is quick and celebratory, like a social app.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"`, keyframe arrays).
- File: `components/like-burst/confetti-like.tsx`. Named export `ConfettiLike`, plus a `DEFAULT_CONFETTI_COLORS` array.

## API

`ConfettiLike` props:

- `count?: number`, default `1300`: the count without your like; liked shows `count + 1`.
- `defaultLiked?: boolean`, default `false`.
- `accent?: string`, default `"#ff375f"`: heart fill/stroke when liked and the ring colour (hex).
- `colors?: string[]`: confetti colours used in turn. Default `#ff375f`, `#ff9f0a`, `#bf5af2`, `#0a84ff`, `#30d158`, `#ffd60a`.
- `onChange?: (liked: boolean, count: number) => void`: called on user toggles with the new state and the displayed count.
- `autoplay?: boolean`, default `false`.
- `className?: string` on the button.

State: `liked` and a `burst` counter used as a key so each like replays the ring and confetti.

## Layout and look

- The whole thing is one `motion.button`: 48px tall, rounded-full, left padding 16px, right padding 20px, 10px gap, 17px semibold, background white (dark `#1c1c1e`), text `#1d1d1f` (dark `#f5f5f7`), shadow `0 0 0 1px rgba(0,0,0,.08), 0 10px 24px -14px rgba(0,0,0,.35)` (dark `0 0 0 1px rgba(255,255,255,.1), 0 10px 24px -14px rgba(0,0,0,.8)`).
- Heart slot: 24×24, relative, flex-centred. Inside, in order:
  - Ring (only while liked): absolutely filling, rounded-full, 2px border in `accent`.
  - Confetti (only while liked): ten 6×6 round dots centred in the slot (`left/top 50%`, margins −3px), colour `colors[k % colors.length]`.
  - Heart: 24×24 SVG, path `M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z`, stroke width 2, round joins.
- Count: the number formatted with `toLocaleString("en-US")` (e.g. "1,300"), tabular numerals, `overflow: hidden`. Each character sits in its own inline slot keyed by its position from the right (`length − i`), so an existing digit keeps its slot when the number grows.

## Motion

- Press: `whileTap: { scale: 0.92 }`.
- Heart: when liked animate `scale: [1, 0.6, 1.3, 1]` and `rotate: [0, -10, 6, 0]`; when unliked `scale: [1, 0.85, 1]`; duration 0.45s.
- Heart path colours: animate `fill` between `accent` (liked) and the same colour at alpha 0, and `stroke` between `accent` and `#1d1d1f` (dark `#f5f5f7`), over 0.2s. `initial={false}` so it does not animate on mount.
- Ring: inside `AnimatePresence`, keyed `ring<burst>`. From `scale 0.4, opacity 1` to `scale 2.4, opacity 0, borderWidth 0` over 0.5s.
- Confetti: dot `k` of 10 at angle `a = (k / 10) · 2π`, keyed `<burst>-<k>`. From `x 0, y 0, scale 1, opacity 1` to `x cos(a)·26, y sin(a)·26, scale 0, opacity 0` over 0.6s with ease `[0.2, 0.8, 0.3, 1]`.
- Digits: each slot holds an `AnimatePresence mode="popLayout" initial={false}`; the character is keyed by its value. Enter from `y −100%, opacity 0`, exit to `y 100%, opacity 0`, spring stiffness 500 damping 30.
- Dark mode is read from the `dark` class on `<html>` with `useSyncExternalStore` and a `MutationObserver` (server snapshot `false`), only for the animated stroke colour.

## Interaction and states

- Click (or Enter/Space, it's a native button) toggles `liked`. Liking increments `burst` so the ring and confetti replay; unliking does not burst.
- `onChange` fires on user toggles only.

## Autoplay demo

With `autoplay`, every 1500ms toggle `liked` and bump `burst` (harmless on unlike since the burst only renders while liked). A `touched` ref is set by a user press; the next tick clears the interval for good. Clear the interval on unmount.

## Accessibility

- Native `<button>` with `aria-pressed={liked}` and `aria-label` "Like, <formatted count> likes". The heart and rolling digits are `aria-hidden`.
- Focus ring: `focus-visible` 2px `#0071e3` (dark `#0a84ff`); no default outline.

## Acceptance checklist

- [ ] Liking squashes and overshoots the heart, fills it, and throws a ring and ten confetti dots.
- [ ] 1,300 → 1,301 rolls only the last digit; 1,999 → 2,000 rolls all four.
- [ ] Unliking gives a small squeeze, the fill fades out and no confetti appears.
- [ ] Liking again replays the burst.
- [ ] `accent` recolours the heart and ring; `colors` recolours the confetti.
- [ ] Autoplay toggles every 1.5s and stops for good on the first press.
- [ ] Dark mode swaps the button surface, text, shadow and the unliked heart outline.
