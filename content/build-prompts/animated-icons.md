# Animated Icons

Build eight toggle icons with real state changes, shown as a 4×2 grid of rounded tiles, each with a label that rolls to the new state. Each icon animates differently (line morphs, `d` morphs, a fresh burst per like, masks, clip fills, stroke drawing). The feel is iOS system icons: quick, springy, precise.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/animated-icons/animated-icons.tsx`. Named exports: `AnimatedIcons` (the demo grid) and each icon on its own: `MenuIcon`, `PlayIcon`, `HeartIcon`, `BellIcon`, `ThemeIcon`, `BookmarkIcon`, `VolumeIcon`, `LockIcon`.

## API

- Every icon: `{ on: boolean }`. `HeartIcon` also takes `burst: number`; increasing it plays a new burst (0 = none).
- `AnimatedIcons`: `{ autoplay?: boolean }` (default `false`).

Icons are 26×26 SVGs, viewBox 24, `aria-hidden`; stroked ones use `currentColor`, width 2, round caps and joins.

Shared spring: `{ type: "spring", stiffness: 420, damping: 24 }`.

## The eight icons

1. **Menu → Close.** Three lines from x 4 to 20 at y 7, 12, 17. On: top line `rotate 45, y 5`, bottom line `rotate −45, y −5` (shared spring), middle line `opacity 0, scaleX 0` over 0.15s.
2. **Play → Pause.** One filled path whose `d` morphs (spring 300/26); both have matching commands:
   - play: `M7 5 L12.5 8.4 L12.5 15.6 L7 19 Z M12.5 8.4 L18.5 12 L18.5 12 L12.5 15.6 Z`
   - pause: `M6.5 5 L10 5 L10 19 L6.5 19 Z M14 5 L17.5 5 L17.5 19 L14 19 Z`
3. **Like (heart).** Path `M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z`, stroke width 2. Fill animates `rgba(255,55,95,0)` → `#ff375f` and stroke `currentColor` → `#ff375f` over 0.2s. The SVG is keyed by `burst`; when on it plays scale `[1, 0.7, 1.25, 1]` over 0.45s. Particles (only while on) come from a mulberry32-style PRNG seeded with `burst·2654435761`, so SSR matches but each burst differs: count `9 + floor(r·5)`; particle i has angle `(i/n)·2π + r·0.6`, distance `22 + r·16`, colour from `#ff375f #ff9f0a #ffd60a #30d158 #0a84ff #bf5af2`, size `3 + r·4` px, round or square (radius 1.5, rotates to 180°). Each span flies from the centre to `(cos·d, sin·d)` with `scale 0`, 0.7s, ease `[0.16, 1, 0.3, 1]`; exit `opacity 0`.
4. **Bell (alerts off → on).** Bell body `M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z` and clapper `M10 20.5a2 2 0 0 0 4 0` in a group with origin `50% 10%`. On rings it: rotate `[0, −20, 16, −11, 7, −3, 0]` over 0.75s. A slash `M3 3l18 18` shows when off and undraws when on (0.3s). A red dot (`#ff3b30`, r 3 at 18, 5.5) scales in on spring 600/14 after 0.2s.
5. **Theme (light → dark).** A filled centre circle at 12,12 whose radius springs 4.5 → 8.5 (shared spring). Its mask (white rect plus black circle r 7) moves the black circle from `cx 30, cy −6` to `cx 17, cy 7`, biting a crescent. Eight rays (12,2.5 → 12,4.5, every 45°) go to `rotate 90, scale 0, opacity 0`. Mask ids unique per instance (`useId`, sanitised).
6. **Save (bookmark).** Outline path `M6 4h12v17l-6-4-6 4z`, plus a `#0a84ff` copy clipped by a rect whose `y` springs 24 → 0 (260/24), filling bottom-up. The SVG hops `y [0, −4, 0]` over 0.35s. Unique clip id.
7. **Sound → Muted.** Speaker `M4 9.5h3.5L12 5.5v13l-4.5-4H4z` filled. Small wave `M15.5 9.2a4 4 0 0 1 0 5.6` and large wave `M18 6.8a7.5 7.5 0 0 1 0 10.4` undraw (0.2s each; muting: large first, small 0.12s later; unmuting reversed). The × `M16 9.5l5 5M21 9.5l-5 5` draws in over 0.25s after 0.2s.
8. **Locked → Unlocked.** Shackle morphs (spring 380/18) from `M8 11 V8 A4 4 0 0 1 16 8 V11` to `M8 11 V5.5 A4 4 0 0 1 16 5.5 V6.5` (lifts and opens). Body rect x 5, y 11, 14×9.5, rx 2.5; fill `rgba(52,199,89,0)` → `rgba(52,199,89,1)` and stroke `currentColor` → `#34c759`.

Use `initial={false}` so nothing animates on mount.

## Grid layout and look

- Grid: 4 columns, 12px gap. Each cell is a column, centred, 8px gap.
- Tile: `motion.button`, 72×72, radius 20px, white, text `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 8px 20px -12px rgba(0,0,0,.3)`. Dark: `#2c2c2e`, text `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.08)`.
- Tile motion: `whileHover { y: −2 }`, `whileTap { scale: 0.88 }`.
- Label: a 16px-tall, 80px-wide clipped box, 12px text `#86868b` (dark `#98989d`), centred. Labels (off / on): Menu/Close, Play/Pause, Like/Liked, Alerts off/Alerts on, Light/Dark, Save/Saved, Sound/Muted, Locked/Unlocked.
- Label swap: `AnimatePresence mode="popLayout" initial={false}`, keyed by state. New label enters from `y 12, opacity 0`, old exits to `y −12, opacity 0`, spring 500/32.

## Interaction and states

- Clicking a tile toggles its key (all start `false`). Liking also increments `burst`; unliking removes particles.

## Autoplay demo

Every 700ms toggle the next icon in order, wrapping. A `pointerdown` on the grid marks touched; the next tick clears the interval.

## Accessibility

- Tiles: `type="button"`, `aria-pressed`, `aria-label` = off-state label.
- Focus-visible: 2px `#0071e3` outline, 2px offset. Particles `pointer-events-none`.

## Sound

`AnimatedIcons` takes `enableSound?: boolean` (default `true`; `false` silences it). Clicking a tile plays one short sound from `@/lib/ui-sounds` for the direction it turns, chosen per icon (volume in brackets):
- Menu: `on` when it opens, `off` when it closes (a tiny noise click with a short rising or falling blip).
- Play: `tap` both ways (a dry click, a sine dropping from 900 to 620 Hz in 60ms).
- Like: `pop` when it fills (a sine gliding up from 320 to 980 Hz in 70ms), a quiet `tick` (0.5) when unliked.
- Bell: `ping` (0.8) when alerts turn on (a soft high sine, long decay), `off` (0.8) when they turn off.
- Theme: `off` going to dark, `on` going back to light.
- Save: `tick` (0.8) when saved, `tick` (0.4) when removed (a very short high-passed noise click).
- Sound: `tick` (0.6) both ways.
- Lock: `off` when it unlocks, `on` when it locks again.
The standalone icons are silent; only the grid plays sound. The autoplay cycle plays the same sound for each tile it turns (through the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then), and stops when a pointer touches the grid. Silent on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Menu lines cross into an X; middle line vanishes.
- [ ] Play triangle morphs smoothly into two pause bars and back.
- [ ] Each like fills red, squashes and pops, and throws a different 9–13 particle burst.
- [ ] Bell swings with decaying wobble; slash disappears; red dot pops in after a beat.
- [ ] Sun shrinks and rays spin away as a crescent bite slides in.
- [ ] Bookmark fills blue from the bottom and hops.
- [ ] Waves undraw in sequence and the × draws in; reverses on unmute.
- [ ] Shackle lifts open with a little overshoot; body fills green.
- [ ] Labels roll up to the new state; tiles lift on hover and shrink on press.
- [ ] Autoplay cycles every 0.7s and stops on first pointer down.
