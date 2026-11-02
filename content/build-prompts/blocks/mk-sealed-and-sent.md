# Sealed and Sent

Build a "how it works" section told as a letter being sent. On a linen desk a file falls from above, swaying as paper does, and settles. A light reads down it and each line gets a pencil tick. The file slides into an envelope, the flap folds shut over it and a wax seal presses on. The envelope lifts, leans and flies off the desk, and what is left is a live link with a working Copy button. Beside the desk (under it on narrow containers) three steps tell the same story in words, with the current one highlighted. It is calm and tactile, and it uses a light desk with cream paper in light mode and a dark desk with the same cream paper in dark mode.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 and framer-motion (`motion`, `motionValue`, `animate`, `useInView`, `useReducedMotion`, `useTransform`). `cn` from `@/lib/utils`. No other libraries, no icon package.
- Files: `components/blocks/sealed-and-sent/sealed-and-sent.tsx` and an `index.ts` re-exporting the component and its types. Named export `SealedAndSent`, types `SealedAndSentProps` and `SealedAndSentStep`.
- Icons are three inline Framework7 Icons (MIT, via Iconify) 56x56 path sets: `doc-text` (the file), `checkmark-alt` (completed step, seal, copied) and `doc-on-doc` (copy). Keep a comment line crediting them.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `SealedAndSentStep[]` | three demo steps | The story beside the scene. The scene has three phases, so give it three steps. Extra steps are ignored; fewer stop the story earlier. |
| `title` | `string` | `"From file to shipped, in three steps."` | Heading (also the section's `aria-label`). |
| `fileName` | `string` | `"pricing-update.md"` | Name printed on the file on the desk. Truncates with an ellipsis. |
| `linkText` | `string` | `"launch.example/p/8f3k"` | The live link shown at the end. Copy writes it to the clipboard, prefixing `https://` unless it already has a scheme. |
| `accent` | `string` | `"#0071e3"` | Colour of the ticks, envelope lining, wax seal, file icon, focus rings and Copy button. |
| `accentDark` | `string` | `accent` if set, else `"#2997ff"` | The accent in dark mode. |
| `autoplay` | `boolean` | `true` | Plays the three steps in turn, looping, until the first pointer, key or touch on the block, then holds for good. Off under reduced motion; paused while less than 30% of the block is in view. |
| `className` | `string` | none | Extra classes on the root section. |

`SealedAndSentStep` is `{ title: string; text: string; ms?: number }`. `ms` is how long the step holds in autoplay, never shorter than the scene needs (3000, 5200 and 4200 ms for steps 1 to 3).

Default steps (invented copy):

1. **Drop in your file**: "Drag in a document or paste a link. It lands on your desk, ready to go." (3000 ms)
2. **We read every line**: "Each line is checked and ticked off, then the whole file is sealed with your mark." (5200 ms)
3. **It ships**: "Your page goes live in seconds, and you get a link you can share straight away." (4200 ms)

## Layout and look

- Root `<section>` with `@container`, full width, `overflow-hidden`, padding 16px sides and 56px top and bottom (32px sides and 80px top and bottom from `@2xl`). Background white, ink `#1d1d1f`; dark: black and `#f5f5f7`. The accent is a CSS variable: the root sets `--sas-a` and `--sas-ad` inline and `--a: var(--sas-a)` (`--a: var(--sas-ad)` under `dark:`); everything accent-coloured reads `var(--a)`, so it follows the theme.
- Inner grid: `max-width: 1040px`, centred, gap 32px (row) and 56px (column). One column by default in the order heading, desk, steps. From `@4xl` it is two columns `minmax(0,1fr) minmax(0,1.2fr)`: heading top left (aligned to the bottom of its row), steps below it, and the desk spanning both rows on the right.
- Heading: `clamp(28px, 7cqi, 48px)`, semibold, line height 1.05, tracking -0.035em, `text-wrap: balance`, max width 460px.
- Steps list: an ordered list, max width 560px, 4px between items. Each step is a full-width button, radius 18px, padding 16px 12px, minimum 44px tall, a grid of `2rem 1fr` with a 16px gap. Left: a 32px badge. Right: the title (18px semibold, tracking -0.015em, line height 1.25) over the text (15px, line height 1.5, `#6e6e73`; dark `#98989d`). All three titles and texts are always visible so the story reads without playing it.
  - Badge states: current is filled ink (`#1d1d1f`, white number; dark `#f5f5f7`, black number); done is `#e8e8ed` (dark `#2c2c2e`) with a check icon; upcoming is white with a 1.5px `#d2d2d7` inset ring and a `#6e6e73` number (dark: black, `#3a3a3c` ring, `#98989d`).
  - The current step has a `#f5f5f7` (dark `#1c1c1e`) background; others get a faint hover tint.
  - A 1px rail joins the badges (from 4px under one badge to 8px above the next): `#d2d2d7` (dark `#3a3a3c`), and ink once that step is done. Colours transition over 500ms.
  - While the demo is running by itself the current step shows a 2px progress bar along its bottom edge (inset 16px, track 7% black / 10% white, fill ink) that fills over the step's hold time.
- Desk (stage): relative, `overflow-hidden`, radius 24px (28px from `@2xl`), height `380 * scale`. Light: `radial-gradient(120% 90% at 20% 0%, #fbfbfa, #efeeeb 70%, #e9e8e4)` with inset shadows `0 0 0 1px rgba(0,0,0,.05)` and `0 -30px 60px -40px rgba(60,50,40,.18)`. Dark: `radial-gradient(120% 90% at 20% 0%, #2b2a2a, #212121 70%, #191919)` with inset `0 0 0 1px rgba(255,255,255,.07)` and `0 -30px 60px -40px rgba(0,0,0,.7)`. Over it a linen texture layer (an inline SVG data URI: fractal noise stretched to threads, rotated copy over the first, plus a fine grain), opacity .55 with `mix-blend-mode: multiply` (dark: opacity .14, `screen`).
- Scene: a fixed 420 x 380 px box, horizontally centred in the desk, scaled from the top by `min(1.15, stageWidth / 420)`, tracked with a `ResizeObserver`. The scene is `aria-hidden`. All numbers below are scene pixels.
  - Envelope: x 84, y 196, 252 x 164, radius 5px. Back panel is the lining: `repeating-linear-gradient(135deg, A 0 3px, A 70% mixed with black 3px 4px, A 4px 9px, A 55% mixed with white 9px 10px)` (A is `var(--a)`, mixed with `color-mix(in srgb, ...)`) plus a top-down dark gradient `rgba(0,0,0,.28)` to transparent at 45%; shadow `0 1px 1px rgba(40,30,20,.12), 0 10px 22px -12px rgba(40,30,20,.35)`.
  - Front of the envelope (SVG, z 4): two side flaps and a bottom flap meeting in a V at 56% to 62% of the height, filled with cream gradients (`#f4f2ec` to `#fbfaf7`, bottom `#f3f1eb` to `#fdfcfa`), the bottom flap with a tiny upward drop shadow, and a paper grain pattern (`multiply`, .5) clipped to the front shape. Paper stays cream in dark mode.
  - Top flap: 252 x 96, hinged at its top edge (`transform-origin: 50% 0`, `rotateX` 180 open to 0 closed, `transform-style: preserve-3d`, perspective 900), a triangle clipped to `polygon(0 0, 100% 0, 52% 98%, 48% 98%)`. Outside is cream with grain and a fold line stroke `rgba(60,45,30,.16)`; the back face (visible while open) is the lining. Its z-index is 2 while open (angle above 90) and 5 once closed. A blurred triangle shadow (`rgba(40,30,20,.22)`, blur 4px) fades in under it as it closes.
  - File: 196 x 128, radius 6px, white with grain (.4, `multiply`), padding 14px. Header: the `doc-text` icon in the accent plus the file name, 12px semibold, `#1d1d1f`. Below, four skeleton lines (5px tall, `#e6e5e1`, widths 90, 66, 82 and 54 percent of 82%) each followed by a tick on the right, 10px apart. The reading light is a 30px tall band, transparent to 14% accent at 75% to 70% accent at 97%.
  - Wax seal: 64 px, centred on the flap tip (x 130 from the envelope's left, 60px from its top), z 6. An irregular 22-point blob built from a fixed seeded sequence (so server and client match) filled with a radial gradient (accent 70% mixed with white, accent at 45%, accent 45% mixed with black), a pressed ring (a dark stroke offset down-right and a light stroke offset up-left), a darker inner disc, a soft highlight ellipse and a `checkmark-alt` icon (17px) in a darkened accent with a tiny emboss shadow. Drop shadows `0 2px 2px rgba(20,10,0,.3)` and `0 6px 8px rgba(20,10,0,.18)`.
  - Shadows: the envelope has an ellipse shadow on the desk (`rgba(40,30,20,.28)`, dark `black/60`, blur 10px) that spreads and fades as the envelope lifts; the file's shadow grows soft as it falls and tightens as it lands.
- Live link card: not part of the scaled scene, so its controls keep full size. An overlay centred over the desk (16px side padding, 12px bottom padding, `pointer-events: none`) holds a card of max width 340px (so the default link fits without truncating), radius 18px, padding 16px, white with `0 0 0 1px rgba(0,0,0,.05), 0 24px 40px -24px rgba(40,30,20,.4)` (dark: `#1c1c1e`, ring `rgba(255,255,255,.08)`, deeper shadow). Top row, 13px medium: a green (`#30d158`) dot with a pinging halo, "Live", and on the right "Opened N time(s)" in `#6e6e73` (dark `#98989d`), tabular numbers. Below, 12px down: a 44px tall field (radius 12px, `#f5f5f7`, dark black, 14px, the link text truncating) and a 44px tall Copy button (radius 12px, min width 88px, 14px medium) with the `doc-on-doc` icon. Button: accent background with white text (dark: black text on the lighter accent so contrast holds); once pressed it turns ink (`#1d1d1f` with white text; dark `#f5f5f7` with black) for 1.6s and reads "Copied" with a check.

## The sequence

Three phases, one per step. Every moving value is a framer-motion `motionValue` created once with `useState(createScene)`, so nothing re-renders while the scene plays. Each phase starts from a defined pose set instantly (`poseScene`), so jumping between steps is always clean.

1. **Arrive (step 1).** Pose: file above the desk (y -200, tilted -14 degrees), flap open (180), no seal, ticks empty. A fresh envelope fades in (0.4s) while rising 26px into place (spring 160/20). After 250ms the file falls: y to its rest of 44 with a soft spring (46/12, mass 1.5), x swaying `[112, 134, 98, 116, 112]` and rotating `[-14, 8, -5, 1.5, 0]` over 1.5s (`easeInOut`). Coming back from the last step, the old link fades out over 0.3s and the new envelope waits 250ms.
2. **Read and seal (step 2).** Pose: file at rest. The reading light fades in (0.2s) and travels down the file over 1.8s (`[0.45, 0, 0.55, 1]`) from 30px above the top to the bottom. Ticks draw on at 420ms and every 360ms after (path length 0 to 1, spring 140/18, each tick fading in over the first 12 percent). The light fades out at 1.9s. At 2.15s the file slides down into the envelope (y 212, 0.8s, `[0.65, 0, 0.35, 1]`). At 2.95s the flap folds shut (spring 95/15). At 3.55s the seal appears (fade 0.08s) and presses on: scale `[1.7, 0.84, 1.06, 1]` over 0.62s (`easeIn`, `easeOut`, `easeInOut`), and the whole packet dips `[0, 3, 0]` px over 0.35s after 0.24s as the desk takes the press.
3. **Ship (step 3).** Pose: sealed envelope, all ticks drawn. The packet scales to 1.05 and lifts 14px (spring 220/18). At 420ms it leans back, then goes: x `[0, -18, 560]`, y `[-14, -4, -330]`, rotate `[0, -4, 16]`, opacity `[1, 1, 0]` over 1.0s with keyframe times `[0, .25, 1]` (ease out, then an ease-in curve for the exit). At 1.05s the link card fades in over 0.3s while springing up from 18px (260/20). "Opened N times" counts 1, 2, 3, 4 at 0.7, 1.3, 1.8 and 2.4s after that.

## Interaction and states

- Selecting a step (click, Enter or Space) jumps to it and plays it from its start. Selecting the current step replays it. Selecting a step also ends autoplay for good.
- Copy writes the link to the clipboard (a failure is swallowed and the "Copied" state still shows) and an `sr-only` `role="status"` region announces "Link copied".
- The link card is `visibility: hidden` until it is at least slightly visible, so its button is not focusable or clickable before the link appears.
- Leaving the screen (under 30% in view) cancels every timer, animation and animation frame; coming back replays the current step from its start.
- Unmounting clears all timers, animation frames, the copy timer and the observer.

## Autoplay demo

While `autoplay` is on, the block is at least 30% in view and nothing has touched it, each step holds for its `ms` (at least the scene's length), the progress bar fills, and the next step starts; after the last it loops to the first. The first pointer down or move, touch start or key press anywhere on the block stops it for good: the current step finishes and holds, the progress bar disappears, and selecting a step plays that step. With `autoplay={false}` the first step plays once when the block comes into view and then holds.

## Accessibility

- The section has an `aria-label` of the title. The scene is `aria-hidden`; the story lives in the ordered list, whose items are real buttons with `aria-current="step"` on the current one. Visible 2px focus rings (accent) on steps and Copy (with a 2px offset on Copy).
- Copy and the step buttons are at least 44px tall.
- Text contrast is at least 4.5:1 in both themes (`#6e6e73` on white is 5:1, `#98989d` on black is 7.5:1, white on `#0071e3` and black on `#2997ff` both pass). A custom accent should be checked by the caller.
- Reduced motion (`useReducedMotion`): no autoplay, no pinging halo, and no animation of the scene. The scene shows where the selected step ends (step 1: the file on the desk; step 2: the sealed envelope with every line ticked; step 3: the live link with "Opened 3 times"). Selecting steps still works.

## Acceptance checklist

- [ ] `<SealedAndSent />` renders with no props: a heading, the desk and three steps, and starts playing when 30% is in view.
- [ ] The file falls and sways, lines get ticked as a light passes, the file slides in, the flap closes, the seal presses, the envelope flies off and the link card appears with Copy working.
- [ ] Autoplay walks through the steps with a progress bar, loops, and stops for good on the first pointer, key or touch; selecting a step then plays that step, and selecting it again replays it.
- [ ] Out of view (under 30%) nothing runs; back in view the current step replays.
- [ ] `fileName`, `linkText`, `steps` and `title` change the content; `accent` and `accentDark` recolour the ticks, lining, seal and button.
- [ ] No horizontal scroll at a 320px wide container; one column below `@4xl`, two columns from it, looking deliberate at 390, 768 and 1280.
- [ ] Dark mode: black section, dark desk, cream paper, readable steps and link card.
- [ ] Reduced motion: still states per step, no loops, steps still selectable.
