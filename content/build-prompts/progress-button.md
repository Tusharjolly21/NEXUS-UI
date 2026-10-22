# Progress Button

Build a pill button that becomes its own progress bar: on click it stretches wider and slimmer, a fill sweeps across it with a live percentage, then it settles into a green done state with a drawn check and a new label. The feel is Apple-like and physical: the pill's width and height spring, labels slide vertically with a soft blur.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionValueEvent`, `useTransform`).
- File: `components/progress-button/progress-button.tsx`, named export `ProgressButton`, plus exported `ProgressButtonProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `label` | `string` | `"Download"` | Resting label. |
| `doneLabel` | `string` | `"Open file"` | Label once finished. |
| `accent` | `string` | `"#0071e3"` | Resting background, progress fill and focus outline. |
| `task` | `(onProgress: (p: number) => void) => Promise<void>` | simulated | Runs the work, reports progress 0..1, resolves when finished. |
| `autoplay` | `boolean` | `false` | Runs itself on a loop until someone interacts. |

Simulated task: every 90ms add `random·0.09 + 0.02` to progress (capped at 1), report it, resolve at 1.

## Layout and look

- Root: column, items centred, 20px gap. Under the button a caption, 13px `#86868b` (dark `#98989d`): "The button becomes its own progress bar." normally, "Click again to reset." in the done stage.
- Button: fully rounded, `overflow-hidden`, row centred, 16px semibold white text. Define `--pb-track` `#e8e8ed` (dark `#3a3a3c`) and `--pb-ink` `#1d1d1f` (dark `#f5f5f7`).
- Three stages with animated size and background:

| Stage | Width | Height | Background |
| --- | --- | --- | --- |
| idle | 152px | 52px | `accent` |
| loading | 260px | 44px | `var(--pb-track)` |
| done | 156px | 52px | `#34c759` |

  Background colour changes with a 300ms CSS `transition-colors`.
- Idle content: 17px download icon (stroke 2.4, round, path `M12 4v11M7 10l5 5 5-5M5 20h14`) + label, 8px gap, no wrapping.
- Loading content: a fill span absolutely positioned at the left, full height, fully rounded, background `accent`, width `progress·100%`. Centred over it the percentage in 14px tabular numbers, white when the percentage is above 52, otherwise `var(--pb-ink)` (so it stays readable as the fill passes under it).
- Done content: 17px check (`M5 12.5l4.5 4.5L19 7.5`, white, stroke 2.8, round) + `doneLabel`.

## Motion

- **Size morph**: animate `width` and `height` with spring stiffness 300, damping 28. `initial={false}`.
- **Press**: `whileTap { scale: 0.95 }` in idle and done; no tap scale while loading.
- **Progress**: keep progress in a motion value. Each `onProgress(p)` calls `animate(progress, p, { type: "spring", stiffness: 120, damping: 20 })`, so steps glide. Map it to the fill width with `useTransform` (`p => p*100 + "%"`). Subscribe with `useMotionValueEvent("change")` to set the rounded percentage in state for the label.
- **Finish**: when the task resolves, `animate(progress, 1, { duration: 0.2 })`, then after 350ms switch to done. The fill span exits with `opacity 0` (`AnimatePresence`).
- **Content swap**: one `motion.span` keyed by stage inside `AnimatePresence mode="popLayout" initial={false}`. Enter from `y 20, opacity 0, blur(4px)`; exit to `y −20, opacity 0, blur(4px)`; spring stiffness 420, damping 30.
- **Done check** draws `pathLength 0 → 1` over 0.35s with 0.15s delay.

## Interaction and states

- `idle` → click → `loading`: reset progress to 0, set stage, await `task`.
- Clicking while `loading` does nothing (`run` returns unless stage is idle).
- `done` → click → back to `idle` with progress reset to 0.
- Every click marks the component as touched.

## Autoplay demo

With `autoplay`: 900ms after mount start a run (unless touched). An interval every 6000ms, if not touched, resets to idle with progress 0 and starts another run 900ms later. Keep the latest `run` in a ref updated every render so the timers never call a stale closure. Once touched by a click, the loop does nothing further. Clear timers on unmount.

## Accessibility

- Native `button type="button"` with `aria-live="polite"` (stage changes and percentage are announced) and `aria-busy` true while loading.
- Focus-visible: 2px outline in `accent` with 4px offset.
- Icons `aria-hidden`; visible text is the accessible name.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Pressing the button to start the download plays `tap` (a short dry click: a sine dropping from 900 to 620 Hz over 60ms plus a faint high hiss); pressing it again on the finished state to reset plays the same tap. When the task completes and the button turns into the green "Open file" state, `done` (a soft four-note rising triangle arpeggio, C5 E5 G5 C6, 40ms apart, ringing out for about 0.6s) plays (only for a run the visitor started). The progress itself is silent, so is the autoplay loop. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Idle pill is 152×52 in the accent colour with icon and label.
- [ ] Clicking stretches it to 260×44 with a springy morph and a grey track.
- [ ] The fill grows smoothly left to right; percentage text flips from dark to white past 52%.
- [ ] At completion the fill reaches 100%, fades, and the pill shrinks to 156×52 and turns green.
- [ ] Labels slide up and out with blur and new ones slide in from below.
- [ ] The check draws itself after a short delay.
- [ ] Clicks during loading are ignored; clicking in done resets.
- [ ] Autoplay starts after 0.9s and repeats every 6s until clicked.
- [ ] A custom `task` that reports progress drives the bar.
