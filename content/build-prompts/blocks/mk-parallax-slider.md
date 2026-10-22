# Parallax Slider

Build a full-width photo slider with depth. Drag or flick it and the landscape inside each slide trails behind the frame, so the pictures feel like they sit behind a window. The title rises in letter by letter, a counter rolls, and a segmented bar underneath fills for the current slide while it waits to move on. It should feel Apple-light, calm and tactile, in light and dark mode. Pictures are drawn from CSS gradients and a small inline SVG, so no image files are needed.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`), a `cn` helper and a `useSound` hook that plays short synthesised sounds (Web Audio, no files).
- File: `components/blocks/parallax-slider.tsx`, named export `ParallaxSlider`, types `ParallaxSliderProps` and `ParallaxSlide`, and the demo array `DEFAULT_PARALLAX_SLIDES`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `slides` | `ParallaxSlide[]` | 5 demo slides | `{ title, kicker, sky: [top, bottom], sun, land: [far, near] }`. Use a stable array. |
| `label` | `string` | `"Destinations"` | Accessible name for the section. |
| `intervalMs` | `number` | `4500` | How long each slide waits before moving on when `autoplay` is on. |
| `autoplay` | `boolean` | `false` | Moves to the next slide on its own until the visitor drags, presses a key, uses a button or focuses the slider. Pauses off screen and in a hidden tab. Never runs under reduced motion. |
| `enableSound` | `boolean` | `true` | Soft swipe sound when the slide changes. Follows the site-wide sound switch. |
| `className` | `string` | none | Extra classes on the section. |

Demo slides (title, kicker, sky, sun, land): Lofoten, "Norway · Winter light", `#2c3e66`/`#9db4d6`, `#f8f4e8`, `#3d4f74`/`#1b2640`. Big Sur, "California · Coast road", `#ff9a8b`/`#ffd3a5`, `#fff3d6`, `#b45c74`/`#5c2840`. Atacama, "Chile · High desert", `#fbc2eb`/`#a6c1ee`, `#ffffff`, `#c28f6b`/`#6e4329`. Kyoto, "Japan · Spring", `#e0f2e9`/`#9ed8b5`, `#fffbe6`, `#3f8f5c`/`#1a4d31`. Sahara, "Morocco · Dunes", `#fddb92`/`#f6a96b`, `#fff8e1`, `#d98a47`/`#9a5520`.

## Layout and look

- Root `<section aria-label>`: full width, background white / `#000`, padding 48px vertical and 16px horizontal (64px and 24px from the `sm` breakpoint). Inside, a centred column `max-w-[1200px]`.
- Frame: `position: relative; overflow: hidden`, radius 28px, background `#1d1d1f` (dark `#1c1c1e`), aspect ratio 4/5 on phones and 16/8 from `sm` up. It is focusable (`tabIndex=0`) with `role="group"`, `aria-roledescription="carousel"` and the label "Title, slide N of M".
- Track: absolutely positioned, `display: flex`, width = frame width x slide count; each slide is exactly frame-width and `flex: none`. The track is measured with a `ResizeObserver` and re-snapped to the current slide on resize. Cursor grab (grabbing while pressed), `touch-action: pan-y`.
- Scene (one per slide): a sky layer that is 40% wider than the slide (`-20%` left and right) with `linear-gradient(180deg, sky[0], sky[1])`; on it a sun disc at left 58%, top 24%, height 14%, square, fully round, colour `sun`, glow `0 0 60px sun`. Over it an SVG 140% wide and 55% tall pinned to the bottom (`viewBox="0 0 140 55"`, `preserveAspectRatio="none"`) with two hill paths: far `M0 22 C 20 10, 40 30, 60 18 S 100 8, 140 20 V55 H0Z` filled `land[0]`, near `M0 38 C 30 26, 55 44, 85 32 S 125 36, 140 34 V55 H0Z` filled `land[1]`. A bottom-up `black/45` to transparent gradient sits on top so white text stays readable.
- Caption: bottom of the frame, padding 24px (40px from `sm`), pointer-events none. Kicker 13px medium uppercase, tracking 0.14em, white at 90%. Title below it 8px: `clamp(44px, 9vw, 96px)`, weight 600, line-height 0.95, tracking -0.045em, white, `overflow: hidden`, 0.1em bottom padding so descenders are not clipped, words wrapping as whole words (each word is `inline-flex; white-space: nowrap`, 0.25em gap).
- Counter pill: top 20px right 20px (32px from `sm`), round, `black/45` with backdrop blur, 13px semibold tabular, white: the current number (two digits, in a clipped 1.2em tall window) then `/ 05` in white at 80%.
- Controls row, 16px below the frame, `flex`, gap 12px: a segmented bar (one 6px tall rounded button per slide, `flex: 1`, gap 6px, track `#e5e5ea` dark `#3a3a3c`, fill `#1d1d1f` dark `#f5f5f7`) then two 40px round buttons (previous, next) with a 14px chevron SVG, background `#f5f5f7` hover `#ececf0` (dark `#2c2c2e` hover `#3a3a3c`), ink `#1d1d1f` / `#f5f5f7`.

## Motion

- Position: motion value `x` (px) = `-index * frameWidth`. Changing slide runs `animate(x, -index * width, spring 220/32)`.
- Parallax: for slide `k`, the sky layer's x is `(x + k * width) * -0.35` and the hills' x is `(x + k * width) * -0.15`, so the picture trails the slide, and the hills move less than the sky.
- Drag: `drag="x"` on the track, constraints `left = -(count - 1) * width`, `right = 0`, elastic 0.12. On release compute `shift = offset.x + velocity.x * 0.2`; if `shift < -width * 0.18` go next, if `> width * 0.18` go previous, otherwise snap back.
- Title: each letter is its own span rising from `y: 100%, opacity: 0` to rest with a spring (stiffness 300, damping 26) delayed `0.2s + letterIndex * 0.035s`. Kicker fades up from `y: 10` with a 0.15s delay. When the slide changes the caption exits with a 0.2s fade up 10px (`AnimatePresence mode="wait"`).
- Counter: the number slides up out and the new one up in (`y: 100%` to 0, exit `-100%`, spring 400/30, `popLayout`).
- Segments: the active segment's fill scales from 0 to 1 with `origin-left`. While autoplay is running it takes `intervalMs` linearly; otherwise 0.3s. Earlier segments are full, later ones empty.
- Autoplay: a timeout of `intervalMs` per slide advances to the next one and wraps from the last to the first. Previous/next buttons and arrow keys also wrap.

## Interaction and states

- Drag or flick the frame; arrow Left/Right move one slide, Home/End jump to the ends; the segments jump to any slide; the chevron buttons step with wrap-around.
- Any pointer press, drag, key, button or focus inside the section marks it touched and stops autoplay for good.
- Autoplay (`autoplay` true): runs only while the section is on screen (`IntersectionObserver`) and the tab is visible (`document.hidden`), and never under reduced motion.
- Responsive: works at 360px; the frame switches to the 4/5 shape on phones and the title shrinks with `clamp`.

## Autoplay demo

The preview renders `<ParallaxSlider autoplay />`: it advances every 4.5s with the active segment filling, until the first interaction, and pauses off screen or in a hidden tab.

## Accessibility

- Frame is `role="group"` with `aria-roledescription="carousel"` and a label that always names the current slide and position. The moving track is `aria-hidden` (the pictures are decorative); the title has a screen-reader copy and the per-letter spans are `aria-hidden`.
- A visually hidden live region announces "Title, slide N of M" politely, and is switched off while autoplay is running so it does not chatter.
- All controls are real buttons with labels ("Go to Kyoto", "Previous slide", "Next slide", `aria-current` on the active segment). Focus outline: 2px `#0071e3`, dark `#0a84ff`, 2px offset.
- Reduced motion (`useReducedMotion`): no autoplay, slides change instantly, titles and kickers fade instead of rising, the counter cross-fades, segments fill instantly. Every slide stays reachable.

## Sound

- `swipe` at volume 0.4 when the slide actually changes, whether by drag, arrow key, Home/End, segment or button. One sound per action.
- When `autoplay` advances the slide it uses `play.auto("swipe", 0.4)`, which is silent until the visitor has used the page. No sound on hover, on the segment fill or on drag movement.

## Acceptance checklist

- [ ] `<ParallaxSlider />` renders with no props and shows "Lofoten" 01 / 05.
- [ ] Dragging moves the slide and the picture inside lags it; releasing past 18% of the width (or a quick flick) changes slide, otherwise it snaps back.
- [ ] Titles rise in letter by letter and never break mid-word; the counter rolls.
- [ ] Arrow keys, Home, End, segments and chevrons all change slide and wrap correctly.
- [ ] With `autoplay`, it advances every 4.5s, the active segment fills, and the first interaction stops it for good; it pauses off screen.
- [ ] Resizing the window keeps the current slide aligned.
- [ ] Dark mode swaps section, frame, segments and buttons to the dark palette.
- [ ] Reduced motion: nothing moves by itself and changes are instant or fades.
- [ ] A swipe sound plays once per user-driven change and never on hover.
