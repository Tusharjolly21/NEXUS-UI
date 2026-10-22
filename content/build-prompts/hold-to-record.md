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

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. The component makes no audio of its own (the microphone is only read for the waveform), so sound comes only from this prop. Pressing to start recording plays `on` (a tiny noise click then a short sine glide rising from 600 to 900 Hz); letting go to keep the note plays `off` (the same click with a glide falling from 760 to 480 Hz), including a hold that was too short and is ignored. Sliding left or pressing Escape to discard plays `hush` at 70% (a sine sliding down from 520 to 180 Hz over about 0.35s with a faint hiss). Play, pause and delete on the kept note play `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss) at 60%. The autoplay demo plays the same sounds at the same beats (`on` when it starts recording, `off` when it keeps the note, `tap` at 60% when it plays the note and again when it deletes it) through the same play function's `auto` variant (`sfx.auto("on")`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. With `useMicrophone` the start sound can be picked up by the microphone, so set `enableSound={false}` if that matters. Still silent on hover. The sounds follow `enableSound` and the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Holding morphs the pill into a strip with a timer and a scrolling live waveform.
- The halo behind the dot swells and shrinks with the level.
- Sliding left drags the strip, turns the dot into a bin with an opening lid and tints the pill red past 90px.
- Releasing there cancels; releasing normally keeps the note and shows the player.
- The player fills its waveform as it plays and resets after finishing.
- Very short holds show "Hold a little longer".
- Space/Enter hold works from the keyboard; Escape cancels.
- `useMicrophone` drives the bars from the real mic.


---

<!-- Hold To Record: Nexus states variant brief -->

> The Hold To Record page has a variant. The brief above rebuilds the original; the section below rebuilds the Voice Dictation variant. It simulates the voice and the words; no microphone is used.

---

<!-- variant: voice-dictation -->

# Voice Dictation

Build a dictation card that shows it is listening and what it heard. A "New reminder" card has a transcript box, a round mic button and a row of 32 level bars. Tap the mic: a red dot and a running clock appear, the bars dance with a simulated voice, and the words arrive one by one, faint while they are still a guess and firming up once sure. Some words are corrected with more context ("for" becomes "4", "pm" becomes "PM") and visibly swap in place with a blue flash. Stop and the bars settle into a line, the status says "Ready" and a Save button appears. The voice and words are a simulation; the microphone is never used.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), a `cn` class-merge helper, an `IntersectionObserver` and the page visibility API for the demo.
- File: `components/hold-to-record/voice-dictation.tsx`. Named exports `VoiceDictation`, `VoiceDictationProps`, `VoiceDictationWord` and the constant `VOICE_DICTATION_SCRIPT`.

## API

`VoiceDictationWord`: `{ w: string; fix?: string; pause?: number }`: the word as first heard, what it becomes later, and extra ms to wait before it.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `script` | `VoiceDictationWord[]` | a short reminder | The words the demo hears. |
| `title` | `string` | `"New reminder"` | Label top left. |
| `onSave` | `(text: string) => void` | none | Called with the finished text (fixes applied, joined by spaces) when Save is pressed; the card then resets. |
| `autoplay` | `boolean` | `false` | Dictates, rests and repeats until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Default script: Remind, me, to, send, the, deck, to, Leo, by (pause 300), for (fix "4"), pm (fix "PM"), tomorrow.

## Layout and look

- Card: width 480px, `max-width: 100%`, radius 28px, padding 20px (24px from 640px), white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`).
- Status row: 13px. The title on the left (medium, `#6e6e73` / dark `#a1a1a6`). On the right: "Tap the mic and talk" when idle, "Ready" when done (both muted), or while listening a pulsing 8px `#ff3b30` dot and a tabular clock "m:ss" in `#d70015` / dark `#ff453a`, medium.
- Transcript box: 12px under the status, min-height 96px, radius 16px, padding 16px, bg `#f5f5f7` / dark `#2c2c2e`, text 18px, line-height 1.5, tracking -0.01em. Empty it shows "What should I remember?" in `#86868b` / dark `#8e8e93`. Words are inline-blocks with a 0.28em right margin; a word still being guessed is `#8e8e93`, a confirmed one `#1d1d1f` / dark `#f5f5f7` (colour fades over 0.3s). While listening a 2px by 1em blinking cursor (`#0071e3`, dark `#0a84ff`) follows the last word.
- Control row: 16px under the box, 12px gap. Mic button 48px round, bg `#1d1d1f` white icon (dark bg `#f5f5f7`, icon `#1d1d1f`); while listening bg `#ff3b30` with a white 16px rounded-square stop glyph and a pulse ring behind it. The mic glyph is a 20px outline microphone (2 stroke). Then 32 bars filling the remaining width, 48px tall, 3px gaps, fully rounded, minimum height 3px, colour `#d2d2d7` / dark `#48484a` at rest and `#1d1d1f` / dark `#f5f5f7` while listening. After a dictation finishes a Save pill appears on the right (40px tall, 16px padding, 14px medium, bg `#0071e3`, white text).

## Motion

- Timeline when the mic is pressed: starting at 500ms, each word arrives `230 + pause` ms after the previous one; 520ms after arriving it is confirmed (turns dark); a corrected word swaps to its fix 900ms after arriving; 1500ms after the last word arrives the dictation ends by itself.
- Word arrival: `opacity 0, y 6, blur 4px` to rest over 0.28s. A correction replaces the word in place (the old one exits to `y 10`, blur, the new one enters from `y -10`) with a `#0071e3` 15% (dark `#0a84ff` 30%) wash behind it that fades out over 0.9s after 0.3s.
- Bars: a new level is pushed every frame (the row scrolls one place); level = `0.35 + 0.55 * |sin(phase * .35)| * (0.6 + rand * 0.4)` times `(0.5 + rand * 0.7)`, clamped to 0.08 to 1, phase += .18 per frame. Heights spring (stiffness 500, damping 30). When not listening all bars return to 8%. The bars update in their own component so the transcript does not re-render at frame rate.
- Dot and cursor blink every 1s; the button pulse ring scales 1 to 1.5 and fades .35 to 0 every 1.3s; the mic/stop icons swap with a scale pop; the button scales to .92 while pressed; Save grows in from width 0.
- Reduced motion: the bars stay flat, the dot and cursor are solid, no pulse ring or press scale, words fade in with no blur or slide; the clock still runs and every state is reachable.

## Interaction and states

- Idle -> listening (mic pressed) -> done. Pressing the mic while listening stops at once and fills in the whole text with all corrections applied. Pressing it when done starts a fresh dictation. Save calls `onSave` with the final text and returns to idle.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced: 1.2s after idle start listening, let the script finish, rest 3.6s on "Ready", return to idle and repeat. A pointer or key press inside the card stops it for good.

## Accessibility

- The mic button is a real button labelled "Start dictation" / "Stop dictation". The transcript is a labelled group (not a live region, so words are not read one by one); a separate `sr-only` polite `role="status"` region says "Listening" and then "Dictation ready: <full text>". Dot, clock, bars, flash and cursor are `aria-hidden`.
- Buttons have a 2px focus outline at 2px offset (`#0071e3`, dark `#0a84ff`).
- Every timer, interval and frame is cleared on unmount.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Starting to listen plays `on` at 50% (a tiny noise click then a short sine glide rising from 600 to 900 Hz). When listening stops, whether you press stop or the dictation finishes by itself, `off` plays at 50% (the same click with a glide falling from 760 to 480 Hz). The level bars, the words, corrections and Save are silent.
- The autoplay loop plays the same two sounds at the same moments through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Hover is silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Pressing the mic shows the red dot, the clock and bars that move; the words arrive faint then firm up.
- [ ] "for" becomes "4" and "pm" becomes "PM" with a blue flash, in place.
- [ ] The dictation ends by itself with the status "Ready", flat bars and a Save button.
- [ ] Stopping early completes the text with corrections applied.
- [ ] Save calls `onSave` and returns the card to its start.
- [ ] No microphone permission is ever requested.
- [ ] Autoplay loops and stops for good on touch; it never runs under reduced motion.
- [ ] Reduced motion keeps bars flat and fades words in.
- [ ] Dark mode uses the dark card, `#2c2c2e` transcript box and light bars.
- [ ] It fits a 320px container.
