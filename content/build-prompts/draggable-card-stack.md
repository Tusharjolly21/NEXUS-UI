Build a messy pile of tall photo cards you can fling. The top card lies flat; the ones under it are slightly smaller and tilted at different angles, like prints tossed on a table. Grab the top card and throw it in any direction: it leans into the throw, flies off, then tucks back under the pile, while the next card pops up to the top with a little overshoot. As you drag, the card underneath swells slightly in anticipation. The arrow keys send the top card away or pull the bottom one back. Images, videos or built-in drawn landscapes all work.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`animate`, `motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`, `useVelocity`, `PanInfo`).
- File: `components/draggable-card-stack/draggable-card-stack.tsx`, named export `DraggableCardStack` (also default), types `StackCard`, `DraggableCardStackProps`.

## API

`StackCard = { id: string; title?: string; subtitle?: string; media?: string; type?: "image" | "video"; bg?: string }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `StackCard[]` | 5 drawn scenes | Top to bottom. |
| `cardWidth` / `cardHeight` | `number` | `220` / `296` | px. |
| `borderRadius` | `number` | `22` | px. |
| `shadowStrength` | `number` | `1` | 0-1. |
| `stackOffset` | `number` | `0` | Extra px down per card. |
| `maxRotation` | `number` | `9` | Largest resting tilt (deg). |
| `depthScale` | `number` | `0.045` | Scale lost per depth. |
| `showOverlay` | `boolean` | `true` | Title/subtitle on the top card. |
| `hoverScale` | `number` | `1.03` | Top card scale on hover. |
| `transitionDuration` | `number` | — | Deprecated, ignored. |
| `onChange` | `(id: string) => void` | — | New top card id. |
| `hint` | `string` | `"Fling the top card. Arrow keys work too."` | `""` hides it. |
| `autoplay` | `boolean` | `false` | Flings left and right in turn until touched. |
| `autoPlay` | `boolean` | — | Deprecated alias. |
| `autoInterval` | `number` | `2400` | ms between flings (min 900). |
| `className` | `string` | `""` | Root classes. |

Default cards: Big Sur "Coast road at dusk", Lofoten "Blue hour over the bay", Kyoto "Lanterns after rain", Madeira "Above the cloud line", Wadi Rum "Sand at first light" (ids "1"-"5").

## Layout and look

- Root: flex column, centred, gap 16, max-width 100%.
- Stage: `cardWidth × cardHeight` (max-width 100%), relative, radius 24, focusable (2px `#0071e3` ring, dark `#0a84ff`, 8px offset on `#f5f5f7` / black).
- Each card: absolute inset 0, z-index `total − depth`. The face: white (dark `#2c2c2e`), overflow hidden, `borderRadius` px, shadow `0 0 0 1px rgba(0,0,0,.04), 0 {10+14s}px {20+30s}px −{10+6s}px rgba(0,0,0, 0.12+0.3s)` (s = shadowStrength), plus an inner `inset 0 0 0 1px rgba(255,255,255,.18)` hairline.
- Art: video (loop, muted, playsInline, preload metadata, cover), image (cover, not draggable), `bg` as a CSS background, or a drawn scene: a vertical sky gradient and an SVG (viewBox 100×140, `xMidYMid slice`) with a sun circle r 13 at cx `30 + (i mod 3)·20`, cy 48 (opacity .92), back hills `M0 92 C 18 78, 32 88, 50 80 S 82 70, 100 82 V140 H0Z` (opacity .85) and front hills `M0 108 C 22 98, 42 110, 64 102 S 90 96, 100 100 V140 H0Z`. Five palettes (sky top/bottom, sun, back/front hills): `#ffd3a5→#fd6585`, `#fff4d6`, `#c2416b`/`#7a1f4b`; `#a1c4fd→#c2e9fb`, white, `#5b8def`/`#2c5ac9`; `#fbc2eb→#a18cd1`, `#fff0fb`, `#7b5bd6`/`#4a2f9c`; `#d4fc79→#96e6a1`, `#fffbe0`, `#2f9e62`/`#1b6b44`; `#fddb92→#f6a04d`, `#fff7e0`, `#d0612d`/`#8f3416`.
- Overlay: bottom gradient `0deg rgba(0,0,0,.55) → transparent`, padding 48px top, 16px sides and bottom, white; title 19px semibold tracking −0.02em, subtitle 12px white/85.
- Under the stage (`aria-live="polite"`): "{position} / {total}" 13px semibold tabular `#1d1d1f` / `#f5f5f7` with the total in regular `#86868b` / `#98989d`; hint 12px `#6e6e73` / `#a1a1a6`.

## Motion

- Resting slot per depth d: `scale = 1 − min(d, 4)·depthScale`, `y = min(d, 4)·stackOffset + (d > 0 ? min(d, 3)·4 : 0)`, `rotate = TILT[d mod 6]·maxRotation` with `TILT = [0, −0.6, 0.45, −0.3, 0.7, −0.5]`, opacity 0 beyond depth 4. Spring stiffness 300, damping 15, mass 0.8 (reduced motion 600/60), so the new top card pops with overshoot.
- Drag (top only): `drag` both axes, `dragMomentum={false}`, `dragElastic={1}`, `touch-action: none`. Rotation = `clamp(x/14, −16, 16) + lean`, where lean = `useSpring(clamp(velocity(x)/140, −12, 12), { stiffness 260, damping 18 })` (0 under reduced motion): the card leans into the motion and springs flat.
- Anticipation: a shared `lift` value = `min(1, dragDistance/160)`; the card at depth 1 scales `1 + lift·depthScale`. Spring lift to 0 (300/26) on release.
- Release: a throw if distance > 110px or speed > 650px/s. Direction = velocity if either axis exceeds 200, else the offset. Otherwise spring back (420/26).
- Throw: normalise the direction; spring x and y to `dir·max(w, h)·1.25` (stiffness 110, damping 20, carrying the release velocity). After 230ms (0 under reduced motion) move the card to the back of the order and spring x/y home (170/22) so it slides under the pile.
- Hover: top card face scales to `hoverScale` (spring 400/24). Overlay fades in with `y 8 → 0` when a card becomes top (spring 300/26) and hides otherwise.
- Bring back: the last card moves to the top and slides in from `x = −1.3·width`, `y = −20` (spring 200/20).

## Interaction and states

- Order is an array of ids; reset it during render (not in an effect) when the set of card ids changes.
- Only one throw at a time (busy flag cleared when the card tucks in). `onChange` fires with the new top id after a throw or bring-back.
- Keys: ArrowRight, Space, Enter throw the top card up-right (direction (1, −0.25)); ArrowLeft brings the bottom card back (needs 2+ cards).
- Only the top card's video plays; others pause.

## Autoplay demo

Every `max(900, autoInterval)` ms throw the top card, alternating right (1, −0.25) and left (−1, −0.25). The first pointer down or key stops it permanently.

## Accessibility

- Stage `role="group"`, `aria-roledescription="card stack"`, `tabIndex 0`, `aria-label="Card stack, {title} on top. Right arrow sends it to the back, left arrow brings the last card back."`. Drawn scenes are `aria-hidden`; images have empty alt.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Grabbing the top card (the moment the drag starts) plays `lift` at 70% volume (a short airy rise: noise sweeping 800 to 2400 Hz over 80ms with a faint sine rising from 300 to 520 Hz). Flinging it away plays `swipe` (a soft paper whisk: bandpass noise sweeping from about 3.2 kHz down to 500 Hz in 0.12s). Letting go short of a fling, so the card settles back onto the pile, plays `drop` at 60% (a sine falling from 380 to 120 Hz over 80ms with a small noise thud). The arrow keys play the whisk. Autoplay flings make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Cards underneath are smaller and tilted alternately; the top is flat.
- Dragging tilts the card with its movement and swells the card underneath.
- A short drag snaps back; a long or fast one throws the card off in that direction.
- The thrown card tucks under the pile and the next pops up with overshoot.
- Right arrow throws, left arrow pulls the last card back in from the left.
- Counter and `onChange` follow the top card.
- Video cards play only on top.
- Reduced motion removes lean and overshoot.

---

<!-- Draggable Card Stack: Motion Kit variant brief -->

> The Draggable Card Stack page has 3 variants. The brief above rebuilds the original Draggable Card Stack; the briefs below rebuild the Motion Kit Spread Deck and Riffle Stack variants.

---

<!-- variant: spread-deck -->

# Spread Deck

Build a photo deck with three states: a messy pile, a grid and a focused photo. Tap the pile and it deals itself out into a grid; tap a photo and it flies to the middle and grows while the rest gather into a little pile in the corner; tap it again to go back, or press Stack to pile it all up. Every move is the same six cards travelling, never a swap. The photos are drawn from CSS gradients and inline SVG, so nothing is fetched.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useReducedMotion`), the `cn` class helper.
- File: `components/draggable-card-stack/spread-deck.tsx`. Named export `SpreadDeck`, exported types `SpreadDeckProps` and `SpreadDeckPhoto`.

## API

`SpreadDeckPhoto = { title: string; sub: string; sky: [string, string]; sun: string; land: [string, string] }`.

- `photos?: SpreadDeckPhoto[]`: defaults to six places: Lofoten (Norway), Big Sur (California), Atacama (Chile), Kyoto (Japan), Patagonia (Argentina), Sahara (Morocco), each with its own sky, sun and hill colours.
- `autoplay?: boolean`, default `false`: walks the states by itself every 2200ms until touched.
- `className?: string`.

## Layout and look

- Root: column, centred, 12px gap, `w-full max-w-[600px]`, ink `#1d1d1f` (dark `#f5f5f7`).
- Stage: `relative`, full width, fixed height 440px, radius 28px, `overflow: hidden`, `#f5f5f7` (dark `#1c1c1e`). The cards are only rendered once the stage width is measured (ResizeObserver), so they never travel from a guessed size.
- Card (a button): 150px by 200px, absolute at top left and positioned with transforms, radius 16px, white (dark `#2c2c2e`), `p-1.5`, shadow `0 2px 4px rgba(0,0,0,.08)` plus `0 18px 30px -18px rgba(0,0,0,.5)` (dark ring `rgba(255,255,255,.08)`). Picture area is the card height minus a 34px caption strip, radius 11px, clipped. Caption: title 12px semibold, sub line 10px `#6e6e73` (dark `#a1a1a6`).
- Picture: a vertical gradient from `sky[0]` to `sky[1]`, a 40px round sun at 58% left and 22% top with a 30px glow in the sun colour, and an SVG (viewBox 150 by 110, stretched to the bottom 55%) with two hills: `M0 50 C 30 30, 60 60, 90 40 S 140 30, 150 45 V110 H0Z` filled `land[0]`, and `M0 75 C 40 55, 70 85, 110 65 S 145 70, 150 72 V110 H0Z` filled `land[1]`.
- Hint text bottom right of the stage, 12px muted: "Tap the pile", "Tap a photo" or "Tap it again to go back".
- Below the stage two pill buttons, 36px high, "Stack" and "Spread": the active one is `#1d1d1f` with white text (dark `#f5f5f7` with ink), the other white with a hairline ring (dark `#2c2c2e`).

## Motion

Let `W` be the stage width and `H = 440`. Every card animates `x, y, rotate, scale` with the spring `{ stiffness: 210, damping: 24 }` (transform origin is the centre, so positions are corrected by `(150 - 150 * scale) / 2` horizontally and `(200 - 200 * scale) / 2` vertically).

- Stack: card `i` of `n` with `k = n - 1 - i`: `x = W/2 - 75 + (i odd ? 4 : -4) * k * 0.5`, `y = H/2 - 100 - k * 3`, rotation from `[-7, 5, -3, 8, -5, 2]`, scale 1 (0.78 under 480px), z index `i`. Cards settle one after another, delay `(n - i) * 0.03` s.
- Grid: 3 columns when `W >= 520`, otherwise 2. Gap 16px. Scale is `min(1, (W - 32 - gaps) / (cols * 150), (440 - 48 - rowGaps) / (rows * 200))`, so the grid always fits. The grid is centred. Cards deal out with delay `i * 0.035` s. Hovering a card in the grid lifts it 6px.
- Focus: the chosen card goes to the centre (`x = W/2 - 75`, `y = H/2 - 110`), scale `min(1.7, (H - 60) / 200)`, z index 50, rotation 0. The others shrink to scale .42 and gather in the bottom left as a fanned pile: for the `k`-th of them `x = 18 - (150 - 63) / 2 + k * 6`, `y = H - 84 - 18 - (200 - 84) / 2 - k * 4`, rotation `-12 + k * 5`. The other cards' sub lines fade out.
- Reduced motion: transitions are instant and hover lift is off.

## Interaction and states

- Mode is `stack`, `grid` or `focus(i)`. Tapping a card: stack goes to grid, grid goes to focus on that card, focus on the same card goes back to grid, focus on another card switches to it. Stack and Spread buttons set the mode directly (and report `aria-pressed`). Escape in focus returns to the grid.
- Any press or key marks the deck touched and ends autoplay for good.

## Autoplay demo

Every 2200ms, while on screen and the tab is visible, step through `grid, focus(1), grid, focus(4), stack` and repeat. Stops for good on touch. Never runs under reduced motion.

## Accessibility

- Cards are real buttons with labels: "Spread the photos" in the pile, "Open Kyoto" in the grid, "Kyoto, Japan. Back to the grid" when focused. In the pile only the top card is in the tab order; the buried ones are `aria-hidden` with `tabindex -1`.
- A screen reader only live region announces the state ("Spread. Tap a photo.") once the visitor has interacted. The hint is `aria-hidden`.
- Focus rings: 2px offset outline `#0071e3` (dark `#0a84ff`).

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Each move the visitor makes with the pile, grid or focus controls plays one sound: dealing the pile out into the grid (or going from a focused photo back to the grid) plays `swipe` (a soft paper whisk: bandpass noise sweeping from about 3.2 kHz down to 500 Hz in 0.12s) at 70% volume, opening a photo plays `lift` at 70% (a short airy rise: noise sweeping 800 to 2400 Hz over 80ms with a faint sine rising from 300 to 520 Hz), and gathering everything back into the pile plays `drop` at 70% (a sine falling from 380 to 120 Hz over 80ms with a small noise thud). Escape follows the same rule. The autoplay walk through the states makes no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] The same cards move between pile, grid and focus; nothing swaps or remounts.
- [ ] The grid never clips at any width from 320px up.
- [ ] A focused photo grows large while the others gather bottom left.
- [ ] Escape, Stack and Spread work from the keyboard.
- [ ] Autoplay pauses off screen and stops on touch.
- [ ] Dark mode recolours the stage, polaroid frames, captions and buttons.
- [ ] No network requests; the pictures are gradients and SVG.

---

<!-- variant: riffle-stack -->

# Riffle Stack

Build a feature deck you shuffle like real cards. Riffle splits the deck into two halves that bow apart, then cards fall back in alternately from each side in little clumps and the deck squares itself up. Cut lifts the top half off and slides it under. Whatever lands on top is the feature you see.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useAnimationControls`, `useReducedMotion`), the `cn` class helper.
- File: `components/draggable-card-stack/riffle-stack.tsx`. Named export `RiffleStack`, exported types `RiffleStackProps` and `RiffleCard`.

## API

`RiffleCard = { t: string; d: string; c: [string, string]; icon: string }` (title, one line, two gradient colours, SVG path data on a 24 by 24 grid).

- `cards?: RiffleCard[]`: needs an even count. Defaults to eight: Spring physics, Layout morphs, Gestures, Scroll scenes, Accessible, Copy & own, Dark mode, Tiny bundle, each with its own gradient and icon.
- `autoplay?: boolean`, default `false`: shuffles every 2800ms until a button is pressed.
- `onShuffle?: (top: string) => void`: title of the card on top after each riffle or cut.
- `className?: string`.

## Layout and look

- Root: column, centred, 20px gap, `w-full max-w-[440px]`. The deck is 420px by 340px (card 220 by 300 plus room for the split); a ResizeObserver scales it down with `min(1, rootWidth / 440)` and trims the vertical margins to match, so the whole spread fits at 320px.
- Card: absolute, centred horizontally, 20px from the top, 220 by 300, radius 20px, z index equal to its depth in the deck, shadow `inset 0 1px 0 rgba(255,255,255,.4)`, `0 1px 2px rgba(0,0,0,.12)`, `0 16px 30px -18px rgba(0,0,0,.45)` (dark adds a 1px `rgba(255,255,255,.1)` ring). Face: a 150 degree gradient of the card colours, `p-5`, white text. A 44px rounded icon tile (`rgba(255,255,255,.2)`, backdrop blur) with the icon stroked white, 2px; title 22px semibold, tracking -0.02em; description 13px, white at 80%.
- Controls: row, centred, wrapping, 8px gap: "Riffle" (40px high pill, `#1d1d1f`, white text; dark `#f5f5f7` with ink), "Cut" (white with a hairline ring; dark `#2c2c2e`) and the text "On top: <title>" (13px muted, `#6e6e73`, dark `#a1a1a6`) which swaps with a 6px slide.

## Motion

Card order is an array whose first entry is the top. A phase machine drives positions: `idle`, `split`, `fall`, `cut`. In `idle` card at depth `d` (0 at the bottom) sits at `y = -d * 2`, with no rotation. Cards use `initial={false}` and a spring `{ stiffness: 300, damping: 26 }` unless noted.

- Riffle: set `split` and wait 520ms. In `split` the top half goes to `x = -105`, the bottom half to `x = +105`, `y = -(position within its half * 2) - 6`, `rotate = half * 7`, `rotateY = half * -18` (half is -1 or 1), with delay `position within half * 0.02`. Then interleave the halves: pick a random side, pop 1 card (or 2 with 35% chance) from it, put them on top of the output, switch side, repeat until both are empty. Set `fall`: each card tweens (0.32s, ease `[0.3, 0, 0.3, 1]`) `x` to 0, `y` through -30 to its idle height, rotation to 0, delayed `(n - 1 - position) * 0.07` s. After `70 * n + 350` ms squash the whole deck, `scaleY [1, .94, 1.02, 1]` over .35s, and go back to `idle`.
- Cut: set `cut` and wait 420ms. In `cut` the top half goes to `x = 120`, `y = -60 - depth * 2`, `rotate = 6`. Then move the top half under the bottom half and return to `idle`; wait another 450ms before another action is accepted.
- Only one shuffle runs at a time. Reduced motion: the order changes at once with no travel.

## Interaction and states

- State: order, phase. Buttons are ignored while a shuffle runs. All waits are tracked timers cleared on unmount, and nothing runs after unmount.
- Any button press marks the deck touched and ends autoplay for good.

## Autoplay demo

Every 2800ms, while on screen and the tab is visible: riffle, riffle, cut, repeat. Stops for good on a button press. Never runs under reduced motion.

## Accessibility

- The deck is `role="img"` labelled "Top card: <title>. <description>"; the individual cards are `aria-hidden`. Riffle and Cut are real buttons with 2px offset focus outlines (`#0071e3`, dark `#0a84ff`). The visible "On top" text is `aria-hidden`; a screen reader only live region repeats it, announced only after the visitor has interacted.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Pressing Riffle plays `lift` at 70% volume as the halves split (a short airy rise: noise sweeping 800 to 2400 Hz over 80ms with a faint sine rising from 300 to 520 Hz), `swipe` (a soft paper whisk: bandpass noise sweeping from about 3.2 kHz down to 500 Hz in 0.12s) at 70% as the cards fall back in, and `drop` at 70% when the deck squares up (a sine falling from 380 to 120 Hz over 80ms with a small noise thud). Pressing Cut plays `lift` as the top half slides off and `drop` when it lands underneath. With reduced motion each press plays just the `drop`. The autoplay shuffles make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] The deck bows apart into two halves, then cards fall back alternately in clumps of one or two.
- [ ] Cut slides the top half off to the right and under the rest.
- [ ] The "On top" label always matches the top card.
- [ ] Rapid presses never overlap two shuffles.
- [ ] Autoplay runs riffle, riffle, cut; pauses off screen; stops on press.
- [ ] Fits at 320px wide without horizontal scroll.
- [ ] Dark mode recolours buttons and card edges.
- [ ] No timers left running after unmount.
