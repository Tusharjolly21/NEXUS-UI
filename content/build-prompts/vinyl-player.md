# Vinyl Player

Build a music player card that you play like a turntable. Press play and the tonearm swings onto the record while the platter spins up; pause and it winds down. Grab the record and turn it to scrub the track by exactly as much audio as you rotate, or fling it and let it coast. Skipping slides a new record onto the platter. The feel is a soft, physical, Apple-like object: calm, springy, nothing flashy. It is a visual instrument only and must never produce sound.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useMotionValue`, `useTransform`, `useAnimationFrame`, `useReducedMotion`).
- File: `components/vinyl-player/vinyl-player.tsx`, named export `VinylPlayer`, plus exported `VinylPlayerProps` and `VinylTrack`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `tracks` | `VinylTrack[]` | three sample tracks | Records on the shelf. `VinylTrack` is `{ title, artist, length (seconds), label: [colourA, colourB] }`. An empty array falls back to the defaults. |
| `autoplay` | `boolean` | `false` | Starts the record, scratches now and then and changes records until someone touches the player. Does nothing under `prefers-reduced-motion`. |

Defaults: "Slow Hours / Mira Lune / 214s / #ff9f0a to #ff375f", "Paper Boats / The Quiet Fleet / 187s / #64d2ff to #0071e3", "Night Garden / Oda & Kei / 242s / #30d158 to #0b7a3b".

## Layout and look

- **Card**: width 360px (`max-w-full`), radius 28px, padding 20px. Light: white with `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Dark: `#1c1c1e` with `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.8)`.
- **Deck**: square (`aspect-square`), max width 300px, centred, radius 22px. Light `#f5f5f7` with inset `0 1px 0 rgba(255,255,255,.9)` and `0 -1px 2px rgba(0,0,0,.05)`; dark `#2c2c2e` with inset `0 1px 0 rgba(255,255,255,.06)` and `0 -1px 2px rgba(0,0,0,.4)`.
- **Platter**: a circle 78% of the deck wide at left 7%, top 7%; background `#d2d2d7` (dark `#3a3a3c`), padding 2.5%, shadow `0 10px 24px -10px rgba(0,0,0,.45)`. It is the drag target: `cursor: grab` (grabbing while active), `touch-action: none`.
- **Record** (fills the platter, always near black in both themes): `repeating-radial-gradient(circle, #151517 0 2px, #1a1a1c 2px 4px)` for grooves, plus two faint ring lines (white at 5%) at roughly 47.5% and 66.5% radius. This layer rotates.
- **Label**: centred circle, 36% of the record, `radial-gradient(circle at 35% 30%, labelA, labelB)`. Title 9px semibold uppercase, tracking 0.08em, white, truncated to 80% width; artist 7px white at 75%; a spindle dot 9% wide, `#e8e8ed` with inset shadow `0 1px 1px rgba(0,0,0,.4)`. The label turns with the record.
- **Sheen**: a non-rotating overlay on the record, `conic-gradient(from 20deg, transparent 0, rgba(255,255,255,.16) 28deg, transparent 60deg, transparent 180deg, rgba(255,255,255,.12) 208deg, transparent 240deg)`, masked with `radial-gradient(circle, transparent 18%, #000 19%)` so the centre stays clear. It stays still while the grooves turn under it.
- **Tonearm**: absolutely placed at right 9%, top 8%, 14px wide, 58% of the deck tall, pointer-events none, `transform-origin: 50% 9px`. A 18px pivot knob (gradient `#f5f5f7` to `#a1a1a6`, shadow `0 2px 4px rgba(0,0,0,.3)`), a 4px wide rod from the pivot down (gradient left to right `#e8e8ed` to `#aeaeb2`), and a 10x16px headshell at the bottom, rotated 18deg, radius 3px, gradient top to bottom `#d2d2d7` to `#8e8e93`, shadow `0 2px 4px rgba(0,0,0,.35)`.
- **Speed tag**: bottom 6%, right 8%, "33⅓" 10px medium uppercase, tracking 0.12em, `#86868b` (dark `#8e8e93`), preceded by a 6px dot: `#30d158` while playing, else `#c7c7cc` (dark `#48484a`).
- **Meta row** (16px below the deck): title 17px semibold, tracking -0.02em, `#1d1d1f` (dark `#f5f5f7`); artist 13px `#6e6e73` (dark `#a1a1a6`); both truncate. On the right, `m:ss / m:ss` at 12px tabular numerals, `#86868b` (dark `#8e8e93`).
- **Progress bar**: 8px below, 4px tall, fully rounded, track `#e8e8ed` (dark `#3a3a3c`), fill `#1d1d1f` (dark `#f5f5f7`), width = position / length. No transition; it follows every frame.
- **Controls** (16px below, centred, 24px gap): previous and next are 40px round ghost buttons with 20px skip icons, hover `#f5f5f7` (dark `#2c2c2e`); play/pause is a 56px circle `#1d1d1f` with a white 22px icon (dark: `#f5f5f7` with `#1d1d1f` icon). Focus rings 2px `#0071e3` (dark `#2997ff`), the play button with a 2px offset in the card colour.

## Motion

Time model: one platter revolution equals 60/33.333 = 1.8 seconds of audio. Track position moves by (degrees turned / 360) x 1.8 seconds, clamped to 0..length.

Per-frame loop (dt = frame time in seconds, capped at 0.05; skipped while a drag is active, while the player is off screen, or while the tab is hidden):
- `speed` (0..1) eases toward 1 when playing and 0 when paused: `speed += (target - speed) * min(1, dt * rate)` with rate 2.2 spinning up, 1.4 winding down.
- Angular velocity = `speed * 200 deg/s` plus a free-spin term. The free spin (deg/s, from a fling) decays by `spin *= 0.08^dt` (about 92% lost per second) and snaps to zero below 1 deg/s.
- Rotate the record by velocity x dt, advance the position by the same turn, update the displayed time. If position reaches the length, pause.
- The rotation lives in a motion value (no re-render per degree); the label layer applies it with `transform: rotate(..deg)`.

Tonearm: an animated rotate with spring stiffness 80, damping 16. It rests at -6 degrees (parked off the record) when paused and the platter has nearly stopped (`speed < 0.05`); otherwise it sits at `21 + (time / length) * 14` degrees, so it creeps inward as the track plays.

Record change: `AnimatePresence mode="popLayout"` keyed on the track index; the new record enters from `x: -120%, rotate: -60` to rest, the old one exits to `x: 120%, rotate: 60, opacity: 0`, spring stiffness 160, damping 22. The title block cross-fades with a 8px vertical offset. Play/pause icon swaps with a scale 0 to 1 pop; the play button has `whileTap` scale 0.92.

## Interaction and states

- **Scrub**: pointer down on the platter captures the pointer and stops any coasting. On move, compute the pointer angle around the platter centre (atan2), take the delta from the last angle wrapped into -180..180, rotate the record by it and move the position by the matching amount of audio. Track the instantaneous velocity (delta / elapsed, elapsed floored at 8ms).
- **Fling**: on release, set the free spin to the last velocity clamped to +/-1400 deg/s; it coasts while the record keeps spinning at its normal speed underneath, and scrubbing backwards runs the audio backwards.
- **Keyboard**: the platter is focusable; Left and Right arrows move the position by -5 and +5 seconds and turn the record accordingly.
- **Skip**: previous and next wrap around the list, reset position to 0 and cancel any coasting. Playing state is unchanged.
- **Play**: toggles. If the track has finished, pressing play restarts from 0.
- No sound is ever produced; do not use any audio element.
- Pause all of the above when the player is scrolled off screen (IntersectionObserver) or `document.hidden`.

## Autoplay demo

Unless the user prefers reduced motion: after 700ms start playing; every 4.2s give the record a quick scratch (free spin -900 deg/s, then +600 deg/s after 260ms); every 12.6s skip to the next record. Any pointer press, key press or button press sets a touched flag and all of it stops for good. Intervals and pending timeouts are cleared on unmount, and ticks are skipped off screen.

## Accessibility

- Platter: `role="slider"`, `tabIndex=0`, `aria-label="Scrub {title}"`, `aria-valuemin=0`, `aria-valuemax=length`, `aria-valuenow` rounded seconds, `aria-valuetext="m:ss of m:ss"`.
- Buttons have labels "Previous track", "Next track" and "Play"/"Pause"; icons are `aria-hidden`.

## Acceptance checklist

- Pressing play swings the arm onto the record over about a second and the platter eases up to one turn per 1.8s.
- Pausing winds the platter down smoothly and the arm lifts back to -6 degrees.
- Dragging the record in a circle changes the time by 1.8s per full turn, in both directions.
- Releasing a fast drag keeps the record coasting and the time moving, decaying within a couple of seconds.
- The arm angle grows from 21 to 35 degrees across the track.
- Next/previous slide the old record out and a new one in, with a matching label colour and title.
- Arrow keys on the focused platter move 5 seconds.
- Looks right in light and dark themes; the record stays black in both.
- Nothing animates or burns CPU while off screen, and no audio ever plays.
