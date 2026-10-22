# Throw Wheel

Build a carousel of cards arranged around a 3D drum that you can grab and throw. While it spins, every card turns edge-on in the direction of travel and blurs with speed; as it slows down the cards straighten one by one on slightly different springs, and the wheel snaps a card dead to the front. The feel is weighty and physical, like flicking a real drum, with Apple-style travel cards.

## Stack

- React 19.2+ client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `useVelocity`). The autoplay throw uses React's `useEffectEvent` (on older React, a ref to the latest callback).
- File: `components/throw-wheel/throw-wheel.tsx`, named export `ThrowWheel`, plus exported `ThrowWheelProps` and `WheelCard = { title: string; sub: string; art: string }` (`art` is any CSS background).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cards` | `WheelCard[]` | ten destinations | Cards on the drum. Titles are used as React keys, so keep them unique. |
| `autoplay` | `boolean` | `false` | Throws the wheel every few seconds until someone grabs it. |

Default cards (title, sub, art):
Kyoto / Temples at dawn / `linear-gradient(160deg,#ffb3c7,#ff6482 60%,#bf5af2)`;
Lisbon / Yellow trams / `linear-gradient(160deg,#ffe58a,#ffcc00 50%,#ff9f0a)`;
Reykjavík / Blue lagoons / `linear-gradient(160deg,#c6f1ff,#64d2ff 50%,#0a84ff)`;
Marrakesh / Spice markets / `linear-gradient(160deg,#ffc9a3,#ff9f0a 50%,#d1495b)`;
Oaxaca / Painted streets / `linear-gradient(160deg,#b7f7c5,#30d158 55%,#0b8f6a)`;
Hokkaido / Powder snow / `linear-gradient(160deg,#f2f2f7,#c7d7ff 55%,#7d8cff)`;
Tbilisi / Balconies / `linear-gradient(160deg,#ffd6e7,#c49bff 60%,#5e5ce6)`;
Cape Town / Table Mountain / `linear-gradient(160deg,#ffe2b8,#ffb36b 50%,#5ac8fa)`;
Hanoi / Lakeside mornings / `linear-gradient(160deg,#d5ffe6,#66d4cf 55%,#0a84ff)`;
Bergen / Fjords / `linear-gradient(160deg,#dbe9ff,#8fb5ff 50%,#30486e)`.

## Geometry

- Card 150×200. `n` cards, `step = 360/n` degrees.
- Drum radius: `round(75 / tan(π/n)) + 40` (cards edge to edge plus 40px breathing room; 271px for ten cards).
- Each card wrapper: centred in the stage (`left/top 50%`, negative half margins), `transform: rotateY(i·step deg) translateZ(radius px)`, `preserve-3d`.
- Drum: an `absolute inset-0` layer with `preserve-3d`, `rotateY = rot` and `z = −radius` (pushes the drum back so the front card sits at the screen plane).

## Layout and look

- Root: column, full width, items centred, 20px gap.
- Stage: 260px tall, `w-full max-w-[720px]`, `overflow-hidden`, `perspective: 1100px`, `touch-pan-y` (vertical page scroll still works), `select-none`, `cursor-grab` / `active:cursor-grabbing`. Edge fade mask: `linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)` (also `-webkit-mask-image`).
- Card face: full size, radius 18px, 14px padding, content at the bottom, `overflow-hidden`, background `art`, shadow `0 18px 30px -16px rgba(0,0,0,.45)`, `backface-visibility: hidden`. Title 17px semibold, tracking −0.02em, white, `text-shadow: 0 1px 8px rgba(0,0,0,.25)`; sub 12px white at 85%.
- Controls row (12px gap): Previous and Next buttons, 36×36 round, white with `#1d1d1f` icon and ring `0 0 0 1px rgba(0,0,0,.08)` (dark `#2c2c2e`, `#f5f5f7`, ring `rgba(255,255,255,.1)`), 14px chevrons (`M15 6l-6 6 6 6` / `M9 6l6 6-6 6`, stroke 2.6, round). Between them the front card's title, 14px medium, min-width 120px, centred, `#1d1d1f` (dark `#f5f5f7`).

## Motion

- `rot` (degrees) is the single source of truth. `vel = useVelocity(rot)` (deg/s).
- **Tilt**: `tilt = clamp(−vel·0.09, −70, 70)` degrees. Each card face rotates on Y by its own `useSpring(tilt, { stiffness: 90 + (i % 3)·40, damping: 18 })`, so cards relax at three different rates and straighten one by one.
- **Speed blur**: `blur = min(6, |vel|·0.006)` px, applied as `filter: blur()` on every face.
- **Depth fade**: per card, angular distance from the front `= |((i·step + rot) mod 360, wrapped to −180..180)|`; opacity maps `[0, 90, 120] → [1, 0.75, 0]`, hiding the back of the drum.
- **Drag**: rotation follows the pointer at 0.28° per px from the grab point. Track release velocity per move: `v = frameDx·0.28 / max(0.008, frameDt seconds)`.
- **Throw and snap**: on release run an inertia animation: `animate(rot, rot.get(), { type: "inertia", velocity: v, power: 0.55, timeConstant: 420, modifyTarget: t => round(t/step)·step })`, so it glides and always lands with a card centred. Pointer cancel settles with velocity 0.
- **Buttons**: `target = round(rot/step)·step − k·step` (Next `k = 1`, Previous `k = −1`), spring stiffness 60, damping 14 (a heavy, slightly overshooting turn that still triggers tilt and blur). `whileTap { scale: 0.9 }`.
- Always stop the running animation before starting a new one, on pointer down, and on unmount.

## Interaction and states

- Front index: `((round(−rot/step) % n) + n) % n`, updated in state via `useMotionValueEvent(rot, "change")`; shown in the title label.
- Pointer down on the stage: mark touched, stop animations, capture the pointer, store start x, start rotation, and timing.

## Autoplay demo

With `autoplay`: a throw at 700ms, then every 3600ms while not touched. Each throw calls the same settle with velocity `(70% chance −1, else +1)·(500 + random·900)` deg/s, so it spins, tilts, blurs and snaps exactly like a human throw. Clear timers on unmount.

## Accessibility

- Stage: `role="region"`, `aria-label="Destinations carousel, showing {front title}"`.
- Title label is `aria-live="polite"`.
- Previous/Next are native buttons with `aria-label`s and a 2px focus outline `#0071e3` (dark `#0a84ff`); they are the keyboard path.

## Acceptance checklist

- [ ] Ten cards sit on a drum; the front card faces you, side cards recede and the back ones are hidden.
- [ ] Dragging rotates the drum 1:1 with the pointer (0.28°/px).
- [ ] A fast flick keeps spinning, cards twist edge-on up to 70° and blur up to 6px.
- [ ] As it slows, cards straighten at visibly different moments.
- [ ] It always comes to rest with one card exactly centred.
- [ ] Next/Previous rotate by one card with a weighty spring; the title updates.
- [ ] Vertical page scrolling still works over the stage on touch devices.
- [ ] Autoplay throws every 3.6s in mostly one direction and stops after the first grab or button press.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). While the user drags or flings the drum, or presses Previous or Next, play `tick` (a ~12 ms high-passed noise click, played quiet at volume 0.4) each time a new card passes the front, at most once every 40 ms, and one soft `drop` (a low sine thump falling 380 to 120 Hz with a brief noise tap, volume 0.5) when it settles on a card after actually turning. The autoplay throws play the same `tick` and `drop` through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Hover is silent. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
