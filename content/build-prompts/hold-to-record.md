Build a press-and-hold voice note recorder, like a messaging app. At rest it is a white pill with a red mic button and "Hold to record". Press and hold: the pill morphs into a recording strip with a pulsing red dot whose soft halo swells with your voice, a running timer, and a live waveform scrolling in from the right. Slide left and the strip drags toward the dot, which shrinks into a trash bin whose lid swings open; let go past the threshold to throw the note away (the pill tints red). Release normally to keep it: the strip morphs into a compact player with a play button, a static waveform that fills as it plays, the duration, and a delete button.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, a `cn` helper, framer-motion (`AnimatePresence`, `animate`, `motion`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`, `useTransform`). Optional Web Audio (`getUserMedia` + `AnalyserNode`).
- File: `components/hold-to-record/hold-to-record.tsx`, named export `HoldToRecord`, types `HoldToRecordProps`, `HoldToRecordResult = { durationMs: number; levels: number[] }` (levels 0-1, about 12 per second).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `onRecorded` | `(result) => void` | — | A recording was kept. |
| `onCancel` | `() => void` | — | Cancelled by sliding or Escape. |
| `onDelete` | `() => void` | — | Kept note deleted. |
| `maxDuration` | `number` | `60000` | Auto-stops (keeps) after this many ms. |
| `minDuration` | `number` | `400` | Shorter holds are ignored. |
| `useMicrophone` | `boolean` | `false` | Real mic levels; simulated otherwise. |
| `cancelDistance` | `number` | `90` | px to slide left to cancel. |
| `label` | `string` | `"Hold to record"` | Button text. |
| `accent` | `string` | `"#ff3b30"` | Mic button, dot, halo, live bars. |
| `autoplay` | `boolean` | `false` | Records, plays and deletes a demo note on a loop (no callbacks) until touched. |
| `className` | `string` | — | Wrapper classes. |

## Layout and look

- Wrapper: `inline-flex` column, centred, max-width 100%. CSS variables `--htr-ink: #1d1d1f` / `--htr-dim: #d2d2d7` (dark `#f5f5f7` / `#48484a`).
- Shell: fully rounded (radius 999), overflow hidden, white (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)` / `.9`); while "cancelling" it becomes `#fff1f0` (dark `#3a1715`) with a 200ms colour transition. Uses `layout` with a spring 420/32 so it resizes between states.
- Idle button: 56px tall, padding 8px left / 20px right, gap 12, 15px semibold, tracking −0.01em, `#1d1d1f` / `#f5f5f7`, `touch-action: none`. A 40px accent circle with `inset 0 1px 0 rgba(255,255,255,.25)` holding an 18px white mic glyph.
- Recording strip: 330px wide (max 100%), 56px tall, padding 12px left / 16px right, gap 12.
  - 32px dot slot: an accent halo circle (inset 0) and a 12px accent dot; over it the trash icon (18px: lid `M3 5h12M7 5V3.4h4V5`, can `M4.6 7.2 5.4 15.6h7.2l.8-8.4`, stroke 1.6) in `#6e6e73` / `#a1a1a6`, red `#d70015` / `#ff6961` when cancelling.
  - Moving strip: timer `m:ss` (36px wide, 15px semibold tabular), then 22 live bars right-aligned in a 26px-tall clipped row, 3px wide, gap 3, accent with opacity rising `0.3 + 0.7·i/22` towards the newest, 75ms transform transition. The bar row dims to 0.25 while cancelling.
  - Right: "Slide to cancel" 12px `#6e6e73` / `#a1a1a6`, or "Release to cancel" semibold red.
- Player: 316px wide, 56px tall, padding 8, gap 12. 40px play/pause (`#1d1d1f` with white icon; dark inverted). 30 bars (3px, gap 3) in a 28px row, height `4 + level·20`, coloured `--htr-ink` once playback passes them, else `--htr-dim`. Time 13px medium tabular `#6e6e73` right-aligned in 36px. A 32px round delete × (10px, stroke 1.6), hover `#f0f0f3` / `#2c2c2e`.
- Hint under the shell (absolute, 10px below, 12px `#6e6e73` / `#a1a1a6`): "Recording discarded" or "Hold a little longer", only while idle.

## Motion

- Sampling every 80ms: push a level to the session and to a rolling 22-sample window; write bar transforms straight to the DOM (`scaleY((4 + level·22)/26)`) to avoid re-renders; update the level motion value and the seconds counter; stop at `maxDuration`.
- Simulated voice: advance `p += 0.18`; `syllable = |sin(2.3p)|·(0.5 + 0.5·|sin(0.7p)|)`; pause factor 0.2 when `sin(0.37p) > 0.9`; level `min(1, 0.1 + 0.8·syllable·pause + 0.15·rand)`. Mic: analyser `fftSize 512`, RMS of the time-domain data × 4.5, capped at 1; fall back to simulated on error; stop tracks and close the context on finish.
- Halo: level through a spring 300/16; scale `1 + 0.7·level` (1 under reduced motion), opacity `0.18 + 0.3·level`.
- Slide: `dx = min(0, x − startX)`, through a spring 500/36; the strip moves `0.35·dx`. `lidOpen = clamp(−dx/cancelDistance, 0, 1)`: dot scale `1 − 0.7·lidOpen`, dot opacity `1 − lidOpen`, trash opacity `lidOpen`, lid rotates 0 → −38° and lifts 2px about (3, 5).
- Morphs: `AnimatePresence mode="popLayout" initial={false}`, each view fades in; idle and player exit in 0.1s; the recording strip exits `opacity 0, scale 0.9` in 0.14s. Idle `whileTap` 0.96.
- Player bars grow from 3px with spring 420/18, staggered 0.012s. Playback animates progress 0 → 1 linearly over the remaining duration; on completion it springs back to 0 (120/20) after 0.5s. Play/pause icons swap with `scale 0.4 ↔ 1`, spring 600/26.
- Note bars: resample the levels into 30 buckets (max per bucket) normalised by `max(0.2, peak)`.

## Interaction and states

- Phases `idle`, `recording`, `recorded`. Primary-button pointer down starts recording (prevent default). `pointermove`/`pointerup`/`pointercancel`/`keydown` listen on `window` during a session.
- Release: keep unless slid past `cancelDistance`. Escape cancels. Too-short holds show "Hold a little longer". Cancel shows "Recording discarded" and calls `onCancel`.
- Keyboard: Space or Enter (no repeat) starts; releasing that same key keeps.
- Clean up timers, listeners, streams and playback on unmount.

## Autoplay demo

Loop: start a demo session at 900ms (no listeners), keep it at 3700ms, play at 4400ms, delete at 9200ms, restart at 10200ms. Pointer down or a key inside (capture phase) stops it and discards any demo session; demo runs never fire callbacks.

## Accessibility

- Idle button `aria-label="{label}. Hold Space to record, slide left or press Escape to cancel."`, focus ring 2px `#0071e3` (dark `#0a84ff`) offset 2px.
- Recording strip `role="status"` labelled "Recording, 0:03" or "Release to cancel". Player buttons "Play voice note" / "Pause voice note" and "Delete voice note". A hidden polite live region says "Recording", "Voice note recorded" or the hint.

## Acceptance checklist

- Holding morphs the pill into a strip with a timer and a scrolling live waveform.
- The halo behind the dot swells and shrinks with the level.
- Sliding left drags the strip, turns the dot into a bin with an opening lid and tints the pill red past 90px.
- Releasing there cancels; releasing normally keeps the note and shows the player.
- The player fills its waveform as it plays and resets after finishing.
- Very short holds show "Hold a little longer".
- Space/Enter hold works from the keyboard; Escape cancels.
- `useMicrophone` drives the bars from the real mic.
