Build a like button that is a pill holding a heart and a count. Liking squashes the heart, fills it with colour, and sends out an expanding ring and a spray of particles; the count goes up by one and each digit that changes rolls vertically like an odometer. Unliking just fades the fill out and rolls the count down. It works controlled or uncontrolled and comes in three sizes. The feel is quick, tactile and light.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `lucide-react` (`Heart`), and the `cn` class-merge helper from `@/lib/utils`.
- File: `components/like-burst/like-burst.tsx`. Named exports `LikeBurst`, `RollingNumber` (`{ value: number; className?: string }`), and types `LikeBurstProps`, `LikeBurstSize`.

## API

`LikeBurst` props:

- `count?: number`: controlled count. `defaultCount?: number`, default `1299`, used when uncontrolled.
- `liked?: boolean`: controlled state. `defaultLiked?: boolean`, default `false`.
- `onChange?: (liked: boolean, count: number) => void`: called on every toggle with the next state and next count.
- `color?: string`, default `"#ff3b5c"`: heart, ring, focus ring and half the particles.
- `size?: "sm" | "md" | "lg"`, default `"md"`.
- `burst?: number`, default `10`: particle count; `0` turns the burst off.
- `label?: string`, default `"Like"`: accessible name prefix.
- `className?: string` on the button.

A toggle computes `nextCount = max(0, count + 1)` when liking and `max(0, count − 1)` when unliking. It only writes its own state for a value that was not passed in, then calls `onChange`. A `burstKey` counter goes up on each like and is used to replay the effect.

## Layout and look

- The whole component is one `motion.button`: `relative inline-flex select-none items-center rounded-full border font-medium outline-none`. Sizes, by `size`:
  - `sm`: `h-8 pl-2.5 pr-3`, 13px text, 15px icon, `gap-1.5`.
  - `md`: `h-10 pl-3 pr-4`, 15px text, 18px icon, `gap-2`.
  - `lg`: `h-12 pl-4 pr-5`, 17px text, 22px icon, `gap-2.5`.
- Light: border `black/7%`, background white, text `#17181a`, shadow `0 1px 2px rgba(16,17,20,.06), 0 4px 14px -6px rgba(16,17,20,.12)`, hover background `neutral-50`. Dark: border `white/10`, background `zinc-900`, text `zinc-50`, shadow `0 1px 2px rgba(0,0,0,.4)`, hover `zinc-800/80`. Colours transition.
- Focus: `focus-visible:ring-2 ring-offset-2`, ring colour is `color` (set through `--tw-ring-color`), offset white (dark `zinc-950`).
- Icon slot: a `grid place-items-center` span, square, side `icon + 4` px. It holds the burst and the heart.
- Heart: lucide `Heart` at the size's icon width/height, `strokeWidth` 2. Unliked: outline in the current text colour, fill transparent. Liked: stroke and fill both `color`. `transition-colors duration-200`.
- Count: `RollingNumber`, formatted with `Intl.NumberFormat("en-US")` (1,299), `inline-flex tabular-nums`, `aria-hidden`. Each digit sits in a slot `relative inline-flex h-[1.2em] w-[1ch] justify-center overflow-hidden`; separators are plain spans with `leading-[1.2em]`. Slot keys are the position from the right (`text.length − i`), so existing digits keep their slot when the number grows.

## Motion

- Press: `whileTap` scale 0.94, spring stiffness 500, damping 26. Off under reduced motion.
- Heart squash (liking only): a wrapper span keyed by `burstKey` animates `scale [1, 0.62, 1.28, 0.94, 1]`, `scaleX [1, 1.18, 0.9, 1.04, 1]`, `scaleY [1, 0.82, 1.12, 0.97, 1]`, 0.55s, `times [0, .18, .48, .74, 1]`, ease out. It is not animated on mount (`initial={false}` while `burstKey` is 0). Unliked or reduced motion: all stay at 1.
- Burst container: absolute, inset 0, `pointer-events-none`, `aria-hidden`. Only rendered while liked, `burst > 0`, `burstKey > 0` and motion is allowed. `radius` is the icon size.
  - Ring: border 2px in `color`, diameter `radius × 1.4`, centred. Scale 0.3 to 1.9 and opacity 0.95 to 0 over 0.55s, ease `[0.2, 0.8, 0.3, 1]`.
  - Particles: particle `i` of `burst` goes at angle `(i / burst) · 2π`, plus 0.18 rad for odd `i` and −0.08 for even. Distance is `radius × 1.65` (odd) or `radius × 2.15` (even). Size is 7px when `i % 3 === 0`, else 5px. Colour is `color` for odd `i`, otherwise `#ff9f1c, #5b8def, #8b5cf6, #22c55e, #ffc94d` picked by `i % 5`. From `x 0, y 0, scale 1, opacity 1` to the target with `scale 0` and opacity `[1, 1, 0]`, 0.7s, ease `[0.15, 0.85, 0.35, 1]`.
- Digits: each slot has `AnimatePresence mode="popLayout" initial={false}`. A digit's key is a version counter that increments whenever its character changes, so a digit returning to an earlier value still rolls. Direction is +1 when the value rose and −1 when it fell. Enter from `y direction·100%`, opacity 0 to `y 0, opacity 1`; exit to `y −direction·100%`, opacity 0. Spring stiffness 420, damping 32. Reduced motion: no vertical travel, opacity only.

## Interaction and states

- Click, Enter or Space (native button) toggles. Liking replays the squash, ring and particles; unliking shows none of them.
- Controlled `liked` and `count` win over internal state. `onChange` receives the clamped count.
- Rising counts roll digits upward, falling counts roll downward.

## Accessibility

- Native `<button type="button">` with `aria-pressed={liked}` and `aria-label` of `"<label>, <formatted count> likes"`, for example "Like, 1,299 likes".
- The burst and rolling digits are `aria-hidden`. Focus is the visible ring above.
- Reduced motion removes the press scale, the squash, the burst and digit travel.

## Acceptance checklist

- [ ] Liking squashes and overshoots the heart, fills it with `color`, and sends one ring and 10 particles.
- [ ] 1,299 becomes 1,300 and rolls the last three digits upward while the leading 1 stays put; unliking rolls them back down.
- [ ] Unliking fades the fill over 0.2s, plays no burst, and never goes below 0.
- [ ] `burst={0}` keeps the squash but shows no ring or particles.
- [ ] `sm`, `md` and `lg` match the heights, paddings and text sizes above.
- [ ] Passing `liked` and `count` makes the button follow the props while `onChange` still fires.
- [ ] Dark mode swaps surface, border, text and shadow; the focus ring uses `color`.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Liking plays `pop` from `@/lib/ui-sounds` (a short rising blip, low to high, like a bubble) as the heart squashes and the burst fires. Unliking plays `off` (a soft latch click that falls slightly in pitch) at about half volume.
- It plays on the press only, never on hover, focus or when a controlled `liked` prop changes from outside.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

> The Like Burst page has 2 variants. The brief above rebuilds the original Like Burst; the section below rebuilds the Motion Kit Confetti Like variant.

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

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Liking plays `pop` from `@/lib/ui-sounds` (a short rising blip, low to high, like a bubble) as the confetti fires. Unliking plays `off` (a soft latch click that falls slightly in pitch) at about half volume.
- The autoplay loop plays the same `pop` when it likes and the quieter `off` when it unlikes, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
