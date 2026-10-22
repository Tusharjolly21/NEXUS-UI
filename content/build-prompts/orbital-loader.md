Build a ring loader with a comet that laps the ring. In its endless mode the comet speeds up and eases off each lap, and its tail stretches with the speed. Given a `progress` value from 0 to 1, a blue arc fills behind the comet with a live percentage in the middle; at 100% the ring pops, turns green and draws a tick. A status line underneath cycles through messages.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useTransform`, `useReducedMotion`).
- File: `components/orbital-loader/orbital-loader.tsx`. Named export `OrbitalLoader`, type `OrbitalLoaderProps`.

## API

- `size?: number`, default `112`: diameter in px.
- `progress?: number`: 0 to 1. Leave it out for the endless orbit. 
- `messages?: string[]`: default `["Warming up the build", "Fetching your components", "Compiling styles", "Almost there"]`. One message stays fixed; `[]` hides the line.
- `doneMessage?: string`, default `"Done"`: shown once progress reaches 1.
- `color?: string`: arc and comet colour. Default `#0071e3` (dark `#0a84ff`).
- `onComplete?: () => void`: called once each time progress rises to 1.
- `autoplay?: boolean`, default `false`: runs a pretend upload on a loop until the loader is clicked.
- `className?: string` on the root.

## Layout and look

- Root: a flex column, centred, gap 16px, `role="progressbar"`. A relative `size` x `size` box sits above the status line.
- The ring is an SVG, `viewBox="0 0 120 120"`, overflow visible, centre (60, 60), radius 50. Layers, bottom to top:
  - A dotted guide ring: radius 33, stroke 1, `strokeDasharray="1.5 5"`, `#d2d2d7` (dark `#3a3a3c`). It rotates with the comet's free lap angle.
  - The track: radius 50, stroke 6, `#f0f0f3` (dark `#2c2c2e`).
  - The progress arc: same circle, stroke 6, round caps, rotated −90 degrees, drawn with `pathLength`. Opacity 1 when progress is given, 0 otherwise (0.3s).
  - A done ring: the same circle in `#30d158`, opacity 1 when done, 0 otherwise (0.25s).
  - The comet group, in the accent colour with no stroke: nine tail dots, the head (radius 5) and a halo (radius 9, opacity 0.18).
  - The tick: path `M43 61 L55 72 L78 47`, stroke 7, round caps and joins, `#30d158`.
- Percentage: centred over the ring, only when progress is given, semibold, tabular numerals, tracking −0.03em, `#1d1d1f` (dark `#f5f5f7`), font size `max(12, round(size × 0.17))` px, text `{n}%`.
- Status line: a 20px high, `w-56 max-w-full` box, `overflow-hidden`, centred, rendered when there are messages or the loader is done. Text is 13px medium, `#6e6e73` (dark `#a1a1a6`), followed by an ellipsis character; the done message is `#1a7f37` (dark `#30d158`) with no ellipsis.

## Motion

- Comet lap: a `requestAnimationFrame` loop with time `t`. Endless angle is `-pi/2 + 2pi(t/1.7) + 0.75 sin(2pi t/1.7)`, so a lap takes 1.7s with the speed swinging between a quarter and 1.75 times the average. With progress the head sits at `-pi/2 + fill × 2pi`, the end of the arc.
- Tail: dot `k` of 1 to 9 sits `(k/9) × stretch` radians behind the head, radius `4.2 × (1 − k/11)`, opacity `(1 − done) × (1 − k/10) × 0.9`. `stretch` is a spring (stiffness 180, damping 22, start 0.5) that targets the head's angular speed in rad/s times 0.16, clamped to 0.12 to 1.6.
- Fill: a spring (stiffness 70, damping 16) follows the clamped progress, so the arc eases and slightly overshoots. The arc's `pathLength` is that fill, at least 0.001. The percentage follows it.
- Done: a spring `done` (stiffness 260, damping 18) goes 0 to 1 when progress reaches 1. It fades the comet and percentage out, and draws the tick as `pathLength` mapped from `done` 0.35 to 1 (hidden until 0.36). The whole box then pops through scale `[1.12, 1]`, spring stiffness 420, damping 12, and `onComplete` fires once.
- Status text: advances every 1900ms when there are two or more messages and the loader is not done. Each line enters from `y 14, opacity 0, blur 4px` and exits to `y −14` with blur, spring 300/26, using `AnimatePresence mode="popLayout"`. Done swaps in the done message the same way.
- Reduced motion: the comet stays at the top, there is no pop, and text only fades.

## Interaction and states

- Endless: no `progress`; the arc and percentage are hidden and the comet orbits freely.
- Determinate: any number; the comet rides the arc's end. At or above 1 it is done.
- Autoplay: after 900ms step through `[progress, hold ms]` pairs `[0.08, 500]`, `[0.27, 700]`, `[0.34, 400]`, `[0.62, 800]`, `[0.71, 400]`, `[0.93, 700]`, `[1, 2200]`. Then go endless for 1800ms, reset to 0, wait 600ms and repeat. A pointer down on the loader stops it for good and hands control back to the `progress` prop.

## Accessibility

- Root has `aria-label="Loading"`, `aria-valuemin` 0, `aria-valuemax` 100, and `aria-valuenow` only when progress is given. `aria-valuetext` is the done message when done, `{n}%` when determinate, otherwise the current message.
- The SVG and percentage are `aria-hidden`; the status line is `aria-live="polite"`.

## Examples on the page

- Progress: `OrbitalLoader` with `progress` from the parent, `messages={["Uploading your files"]}` and `doneMessage="All files uploaded"`. The live demo runs it with `autoplay`, size 148, three messages ("Uploading your files", "Checking for duplicates", "Making thumbnails") and done message "All 24 files uploaded".
- Endless: `<OrbitalLoader size={120} />`, with no progress and the default cycling messages.

## Acceptance checklist

- [ ] Endless: the comet speeds up and slows each lap and its tail stretches and shrinks; no arc or percentage shows.
- [ ] With progress, the arc fills with a slight overshoot, the comet rides its end and the percentage counts.
- [ ] At 1 the ring pops, turns green, the comet fades, the tick draws and "Done" (or `doneMessage`) appears.
- [ ] Messages swap every 1.9s with blur and slide.
- [ ] Autoplay loops the pretend upload until a click.
- [ ] Dark mode swaps the track, guide ring, percentage and message colours.

> The Orbital Loader page has 2 variants. The brief above rebuilds the original Orbital Loader; the section below rebuilds the Nexus Essentials Step Loader variant.

---

<!-- variant: step-loader -->

# Step Loader

Build a loader for long jobs that keeps people oriented. A card shows a progress ring with an "n/total" count; under it a vertical reel of steps keeps the current step in the middle, finished steps roll up above it with a green tick, and upcoming steps wait below, faded. Cancel is always available. When the last step finishes the whole reel folds away into a result with a big tick, a heading and a button. The feel is calm and Apple-like.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `@/lib/ui-sounds`, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/orbital-loader/step-loader.tsx`. Named exports `StepLoader`, `STEP_LOADER_STEPS`, type `StepLoaderProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `string[]` | six demo steps | In order. Demo: "Creating your workspace", "Importing 248 customers", "Matching accounts to plans", "Building your first dashboard", "Inviting your team", "Ready". |
| `stepMs` | `number` | `1050` | How long each step stays current. |
| `title` | `string` | `"Set up your workspace"` | Heading before the job starts. |
| `idleText` | `string` | `"This takes about six seconds."` | Line under it. |
| `startLabel` | `string` | `"Start setup"` | Start button label. |
| `doneTitle` | `string` | `"Your workspace is ready"` | Result heading. |
| `doneText` | `string` | `"248 customers imported, dashboard built, 3 invites sent."` | Result line. |
| `actionLabel` | `string` | `"Open workspace"` | Result button label. |
| `onComplete` | `() => void` | none | Called once when the result appears. |
| `onCancel` | `() => void` | none | Called when Cancel is pressed. |
| `onAction` | `() => void` | none | Called when the result button is pressed. |
| `autoplay` | `boolean` | `false` | Runs the job on a loop until the card is touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | `""` | Extra classes on the card. |

## Layout and look

- Card: `position: relative`, flex column, centred both ways, height 420px, width 440px with `max-width: 100%`, padding 24px, radius 28px, `overflow: hidden`, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Running view, top to bottom, centred: a 56px progress ring (SVG viewBox 56, circle r 24, stroke 4, rotated -90 degrees; track `#ececf0` / dark `#3a3a3c`, arc `#0071e3` / dark `#0a84ff`, round caps) with "n/total" centred inside (13px semibold, tabular numbers, `#1d1d1f` / dark `#f5f5f7`); 24px gap; the reel; 16px gap; a Cancel button.
- Reel: full width, height 220px (5 rows of 44px), `overflow: hidden`, masked with `linear-gradient(transparent, #000 30%, #000 70%, transparent)` so the ends fade. Each row is 44px tall, content centred, 10px gap: a 20px icon box then the label (16px). The current row is semibold in `#1d1d1f` / dark `#f5f5f7`; others are regular `#6e6e73` / dark `#a1a1a6`.
- Row icons: finished = 18px green disc (`#34c759` / dark `#30d158`) with a white 2.6px round tick; current = 16px spinner, 2px border `#d2d2d7` / dark `#48484a` with the top edge `#0071e3` / dark `#0a84ff`; upcoming = 8px dot `#d2d2d7` / dark `#48484a`.
- Cancel: 36px tall pill, 16px side padding, 13px medium, bg `#f5f5f7` / dark `#2c2c2e`, hover `#ececf0` / dark `#3a3a3c`.
- Idle and cancelled view: centred heading 20px semibold, tracking -0.02em; line 14px `#6e6e73` / dark `#a1a1a6` with 4px gap; a 40px tall pill button 20px side padding, 14px medium, white on `#0071e3`, 20px above it. Idle says the title and `idleText` with "Start setup"; cancelled says "Setup cancelled", "Nothing was changed. Start again any time." and "Start again".
- Done view: a 56px green disc (white 2.2px tick) , 16px below it a 22px semibold heading (tracking -0.02em), a 14px muted line, then a 40px pill button, 20px above, `#1d1d1f` with white text / dark `#f5f5f7` with `#1d1d1f` text.

## Motion

- Step timing: step `k` becomes current at `k * stepMs`. The result appears `stepMs + 200` ms after the last step becomes current.
- Ring: the arc is a `pathLength` of `max(0.03, i / (total - 1))`, spring stiffness 80, damping 20.
- Reel: the list translates to `y = 88 - i * 44` px with spring stiffness 200, damping 26, so the current row sits in the middle (third) slot. Row opacity is 1 current, 0.45 finished, 0.3 upcoming; row scale is 1 current, 0.92 others.
- Tick: when a row finishes, its tick path draws from `pathLength 0` to 1. Spinner: rotates 360 degrees in 0.8s, linear, forever.
- View swaps use `AnimatePresence mode="wait"`: running fades and scales from 0.97; done fades in from `y 10`, the big tick pops from scale 0.4 with a spring (stiffness 400, damping 15) and its path draws after 0.15s.
- Reduced motion: no spinner rotation (a still partial ring), reel and ring jump instantly, no scale or slide, short fades only; the whole sequence is still reachable.

## Interaction and states

- States: `idle` -> `running` -> `done`, or `running` -> `cancelled`. Start begins at step 0. Cancel stops the timers, plays no further steps and shows the cancelled view. Start again restarts.
- Focus follows the action: after Start the Cancel button takes focus, after Cancel the Start again button does.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: from idle wait 900ms and start the job; when the result shows wait 3.2s and start again. Leaving the screen pauses a running demo job where it is and returning resumes it. Any pointer press or focus inside the card stops the loop for good.

## Accessibility

- The reel is `aria-hidden`; a persistent `sr-only` polite `role="status"` region announces "Step n of total: label", "Your workspace is ready" and "Setup cancelled". The ring is decorative.
- Start, Cancel and the result button are real buttons with 2px outlines `#0071e3` (dark `#0a84ff`), 2px offset.

## Sound

- Prop `enableSound?: boolean` (default `true`).
- Each time a step finishes and the next becomes current, `tick` from `@/lib/ui-sounds` plays at 0.4 volume. When `stepMs` is under 800 it plays only after every second step so fast runs stay sparse.
- When the result appears, `done` plays at 0.6. Pressing Cancel plays `off` at 0.5.
- The autoplay job makes the same sounds through `play.auto`, which stays silent until the visitor has interacted with the page once. Starting the job is silent. Nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] The current step is always in the middle of the reel, finished steps above with ticks, upcoming ones below faded, edges masked.
- [ ] The ring fills with a spring and the count reads "n/total".
- [ ] After the last step the reel folds into the result with a popping tick.
- [ ] Cancel shows the cancelled view and Start again restarts; focus lands on the next button.
- [ ] Ticks play per finished step (every second step when `stepMs` < 800), `done` at the end, `off` on Cancel.
- [ ] Autoplay loops, pauses off screen and stops at first touch; reduced motion shows no loop.
- [ ] Dark mode matches the colours above.
