# Voice Note Contact

Build a contact section with two ways in: write a message while a small blue face with googly eyes follows your pointer (and looks down while you type), or switch to a "Voice note" tab, hold a button to record, and play the clip back on a waveform. Sending morphs the submit button into a green "Sent. Talk soon." confirmation. The recorder is simulated and never touches the microphone. It should feel friendly and tactile.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"`, `LayoutGroup`, `layout`, `layoutId`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`). Icons are inline SVG.
- File: `components/blocks/motion-kit/voice-note-contact/voice-note-contact.tsx`, named export `VoiceNoteContact`, plus exported types `VoiceNoteContactProps` and `VoiceNoteContactSubmission` (`{ kind: "message"; name; email; message } | { kind: "voice"; seconds: number }`). Re-export them from an `index.ts` in the folder.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` | `#0071e3` light / `#0a84ff` dark | Eyebrow, face, icons, focus rings, live and played waveform. Set as CSS variable `--mk-a`; when passed, it wins in both themes. |
| `contactEmail` | `string` | `"hello@northwind.studio"` | First contact row. |
| `hours` | `string` | `"Mon to Fri, 9 to 6 CET"` | Second contact row. |
| `onSubmit` | `(data: VoiceNoteContactSubmission) => void` | — | Called with the validated, trimmed submission. Nothing is sent otherwise. |
| `autoplay` | `boolean` | `false` | Types a message, then records and plays a note, on a loop until touched. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

Ink `#1d1d1f` / dark `#f5f5f7`; muted `#6e6e73` / `#a1a1a6`.

- Section: full width, `#f5f5f7` (dark black), 16px sides (20px from `sm`), vertical padding `clamp(48px, 8vw, 80px)`. `--mk-a: #0071e3` (dark `#0a84ff`).
- Grid: centred, `max-width: 1040px`, one column with a 40px gap, items centred; from `lg` two columns `1fr 1.1fr` with a 48px gap.
- Intro (vertical flex, 20px gap): eyebrow "Contact" 14px semibold accent; heading "Talk to a human. Or leave us a voice note." at `clamp(30px, 5vw, 52px)`, semibold, line height 1.04, tracking −0.04em; paragraph (max 420px) `clamp(16px, 1.6vw, 17px)`, line height 1.5, muted: "We reply within a working day, usually much faster. Voice notes go straight to the person who can help." Then two 15px rows (8px apart): a 32px round white icon chip (dark `#1c1c1e`, ring `0 0 0 1px rgba(0,0,0,.06)` / `rgba(255,255,255,.08)`) with a 15px accent stroke icon (envelope `M4 6h16v12H4zM4 7l8 6 8-6`; clock `M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2`), then the text, which breaks long words.
- Form card: vertical flex, 16px gap, radius 28px, white (dark `#1c1c1e`), padding 20px (28px from `sm`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -36px rgba(0,0,0,.4)` (dark `0 0 0 1px rgba(255,255,255,.08)`). `noValidate`.
- Top row: space-between. Tabs: a pill track `#f0f0f3` (dark `#2c2c2e`), 4px padding; two 40px tabs, 16px padding, 13px medium, "Write" / "Voice note"; selected ink over a white thumb with `0 1px 4px rgba(0,0,0,.12)` (dark `#48484a`), unselected muted. Face on the right: 56×44px, radius 18px, accent fill, two 13×16px white rounded eyes 6px apart, each with a 7px `#1d1d1f` pupil.
- Field style: radius 12px, `#f5f5f7` (dark `#2c2c2e`), 14px padding, 16px text (15px from `sm`), placeholder `#a1a1a6` (dark `#8e8e93`), focus ring 2px accent.
- Write tab: Name and Email (44px tall) in one column, two from `sm`, 12px gap; a 4-row textarea "What are you working on?"; a 12px row with the error on the left (`#d70015` / dark `#ff6961`) and a tabular "N / 500" counter (`#86868b` / `#8e8e93`) on the right.
- Voice tab, idle/recording: centred column, 16px gap, 16px vertical padding. A 48px-tall row of 22 bars, 4px wide, 3px gap, rounded: idle 6px tall `#d2d2d7` (dark `#48484a`); recording accent. Record button: 48px, fully rounded, 24px padding, 15px medium, 8px gap, 16px mic icon (`rect x9 y3 w6 h11 rx3` + `M5 11a7 7 0 0 0 14 0M12 18v3`); idle `#1d1d1f`/white (dark `#f5f5f7`/`#1d1d1f`), recording `#ff3b30` (dark `#ff453a`) white. Label "Hold to record", or "Recording 0:03" / "Tap to stop 0:03" (latched). Hint 12px `#86868b`: "Hold, or tap to start and stop. Up to 60 seconds. Demo recorder: the microphone is never used."
- Voice tab, clip: a row, 12px gap, radius 16px, `#f5f5f7` (dark `#2c2c2e`), 12px padding. 40px accent play button (14px play `M8 5l11 7-11 7z` / pause bars). Waveform 32px tall: 28 seeded bars (3px gap, flex 1, heights 25–100%) in `#c7c7cc` (dark `#48484a`) with an accent copy on top clipped by progress. Duration "m:ss", 13px tabular muted, 36px wide. 40px round delete (×) button, muted, hover `black/5%` (dark `white/10%`).
- Submit: 48px, fully rounded, 15px medium; `#1d1d1f`/white (dark `#f5f5f7`/`#1d1d1f`); sent `#248a3d`/white (dark `#30d158`/black). Labels: "Send message", "Record a note first" (disabled, 60% opacity), "Send voice note", and sent "Sent. Talk soon." preceded by a 16px drawn check (`M5 12.5l4.5 4.5L19 7.5`, stroke 3).

## Motion

- Face eyes: pupils follow the pointer via springs (stiffness 300, damping 22): offset = unit vector to the pointer × 4px × `min(1, distance/140)`. While typing, pupils sit at (0, 4) (looking down). Blink every 3s: eyes `scaleY 0.1` for 130ms, 0.1s tween.
- Tab thumb: `layoutId` in a per-instance `LayoutGroup`, spring 500/34. Panels swap in `AnimatePresence mode="popLayout" initial={false}`: Write from/to `x −20`, Voice from/to `x 20`, with opacity.
- Form card and submit button use `layout` (spring 300/30). Submit presses to 0.97; its label swaps in from `y 16`, out to `y −16`; the check draws via `pathLength`.
- Recording: bars loop height `[8, 12 + (i×7 mod 30), 8]` over `0.5 + (i mod 5) × 0.1` s, infinite. Button scales to 1.06; a ring pulses `box-shadow 0 0 0 0 rgba(255,59,48,.5) → 0 0 0 16px rgba(255,59,48,0)`, 1.2s, infinite.
- Clip row enters from `opacity 0, scale 0.9`. Playback animates progress 0 → 1 linearly over the clip length; clip-path `inset(0 (100 − p×100)% 0 0)`.

## Interaction and states

- Recorder: pointer down starts; release before 350ms latches (keeps recording until the next press); a longer hold stops on release. Space/Enter do the same (ignore key repeats). A bare click (assistive tech, `detail === 0`, not within 400ms of a key) toggles. Pointer cancel ends unless latched. Stop at 60s. Clip length = rounded seconds, minimum 1. Play toggles play/pause; delete discards. Timer ticks every 100ms.
- Write validation on send: trim name (max 80), email (max 254), message (max 500). Email must match `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` else "Add an email so we can reply."; empty message → "Write a few words first." Voice sends `{ kind: "voice", seconds }` only with a clip.
- On send: call `onSubmit`, show sent for 2600ms, then clear the message and clip and remount the recorder. Ignore sends while sent. Switching tabs clears the error. Focusing any field sets the face to "typing".

## Autoplay demo

Only while `autoplay && !touched && !reducedMotion`. Write tab: wait 700ms, face looks down, type "Hi! We're planning a site relaunch in March and would love some help." at 38ms per character, hold 1100ms, look up, wait 700ms, clear, switch to Voice. Voice tab: wait 900ms, start recording, stop after 3300ms, wait 800ms, play 3s, wait 4200ms, discard, wait 500ms, back to Write. Any pointer down, key down or focus inside the section stops it for good and clears the typed message.

## Accessibility

- Tabs: `role="tablist"` labelled "How to contact us", each `role="tab"` with `aria-selected`.
- Inputs have `aria-label`s (Name, Email, Message); error span is `role="alert"`; sent label `role="status"`.
- Record button: `aria-pressed`, `aria-label` "Record a voice note" or "Recording, 0:04. Press again to stop."; play/delete have labels ("Play voice note" / "Pause voice note", "Delete voice note"). Face, bars and waveforms are `aria-hidden`.
- Focus ring 2px accent with a 2px offset on filled buttons.

## Acceptance checklist

- [ ] Two columns from `lg`, stacked below, max 1040px.
- [ ] The face's pupils follow the pointer, look down while typing, and blink every 3s.
- [ ] The tab thumb slides between Write and Voice note; panels slide sideways.
- [ ] A bad email shows "Add an email so we can reply." in red.
- [ ] Holding the record button counts up and animates red; a quick tap latches until tapped again.
- [ ] A clip shows a 28-bar waveform that fills with the accent while playing.
- [ ] Sending turns the button green with a drawn check for 2.6s, then resets.
- [ ] `onSubmit` receives the trimmed message or `{ kind: "voice", seconds }`.
- [ ] With `autoplay`, it types, records and plays on a loop until touched.
- [ ] No microphone permission is ever requested.
