# Ink Theme Switch

Build a theme toggle that floods. A small settings screen sits in a rounded panel with a round sun button in its top-right corner. Turn dark mode on and the dark version of the same screen pours out of the button as a growing circle of ink, easing in and out, until it covers the panel; turn it off and the ink drains back into the button. On the way the sun pulls in its rays, swells and is bitten into a crescent moon. It themes only its own panel: it never changes the site theme or touches `document` classes.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`).
- File: `components/ink-theme-switch/ink-theme-switch.tsx`. Named export `InkThemeSwitch` and its `InkThemeSwitchProps` type.

## API

- `defaultDark?: boolean`, default `false`: start with the panel dark (ink already covering it).
- `onChange?: (dark: boolean) => void`: called with the new value when the user flips the switch (not during autoplay).
- `autoplay?: boolean`, default `false`.
- `className?: string`: extra classes on the panel.

## Layout and look

- Root panel: `position: relative`, `overflow: hidden`, width 320px (`max-width: 100%`), height 300px, radius 26px, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 48px -28px rgba(0,0,0,.4)` (site dark mode: `0 0 0 1px rgba(255,255,255,.08), 0 24px 48px -28px rgba(0,0,0,.9)`). The panel's own colours come only from its internal light/dark state, never from the site theme.
- Two copies of the same screen stacked absolutely (`inset: 0`): the light one underneath, the dark one on top inside a layer whose `clip-path` is the ink circle.
- Screen palettes:
  - Light: background `#f5f5f7`, cards `#ffffff`, text `#1d1d1f`, secondary `#6e6e73`, divider `rgba(0,0,0,.06)`, accent `#0071e3`, off-switch track `#e5e5ea`.
  - Dark: background `#111113`, cards `#1c1c1e`, text `#f5f5f7`, secondary `#a1a1a6`, divider `rgba(255,255,255,.08)`, accent `#0a84ff`, off-switch track `#3a3a3c`.
- Screen content: column, 16px padding, 12px gap.
  - Header row 36px tall: "Settings", 17px semibold, letter-spacing −0.02em.
  - Card (radius 16px, 12px padding) with three rows, 8px vertical padding each, 1px divider above rows 2 and 3: "Notifications" (on), "Auto-update" (off), "Share analytics" (on), 14px text. Each row ends in a decorative mini switch: 38×22, rounded-full, 2px padding, track `#30d158` when on, knob 18×18 white with a small shadow, pushed to the end when on and the start when off.
  - Profile card (radius 16px, 12px padding, 12px gap): a 40px circle filled `linear-gradient(140deg, accent, #bf5af2)`, then "Sam Alvarez" (14px medium) over "Pro plan · renews in 12 days" (12px secondary). Both lines truncate.
- Toggle button: 36×36 circle whose centre is 38px from the panel's right edge and 34px from the top (so `right: 20px; top: 16px`). Background `#ffffff` with ring shadow `0 0 0 1px rgba(0,0,0,.08)` when light; `#2c2c2e` with `0 0 0 1px rgba(255,255,255,.12)` when dark (animated by framer, no animation on mount).
- Icon: 20×20 SVG, viewBox 24.
  - Core: circle at (12,12), fill `#ff9f0a` (light) or `#ffd60a` (dark), masked by a mask (unique id per instance via `useId`) that is a white 24×24 rect with a black r=7 circle. The black circle sits off-icon at (30, −6) when light and at (16, 8) when dark, which bites the crescent.
  - Rays: 8 lines in a group, stroke `#ff9f0a`, width 2, round caps, from radius 8 to radius 10.5 at angles `i/8 · 2π` around (12,12). Round the coordinates to 3 decimals so server and client render identical strings.

## Motion

- Ink radius is a motion value `r`; the clip is `circle(${r}px at calc(100% - 38px) 34px)` (set both `clip-path` and `-webkit-clip-path`). Using `calc(100% - 38px)` keeps the circle centred on the toggle even when the panel is narrower than 320px.
- Full radius `MAX_R = hypot(320 − 38, 300 − 34) + 20` ≈ 407.6px. `r` starts at `MAX_R` when `defaultDark`, otherwise 0.
- Flooding to dark: `animate(r, MAX_R, { duration: 0.9, ease: [0.65, 0, 0.35, 1] })`. Draining to light: `animate(r, 0, { duration: 0.7, ease: [0.5, 0, 0.75, 0] })`. Keep the returned controls in a ref and stop them on unmount.
- Mask circle `cx/cy`: spring stiffness 260, damping 22. Core radius 5 (light) to 8 (dark): spring stiffness 260, damping 18. Rays group: `scale 1→0`, `rotate 0→−90`, `opacity 1→0` going dark, spring stiffness 260, damping 20, origin at (12px, 12px). All with `initial={false}`.
- Button press: `whileTap` scale 0.88.

## Interaction and states

- Clicking the button flips `dark`, runs the ink animation and calls `onChange(next)`.
- Only internal state changes; nothing outside the component is read or written.

## Autoplay demo

With `autoplay`, every 2200ms flip the panel (starting from `defaultDark`) with the same ink animation; `onChange` is not called. A `touched` ref is set by pointer down anywhere on the panel or by clicking the switch; the next tick clears the interval for good. Clear it on unmount.

## Accessibility

- The toggle is a native `<button>` with `role="switch"`, `aria-checked`, `aria-label="Dark mode"`.
- Focus ring: `focus-visible` 2px, `#0071e3` while the panel is light and `#0a84ff` while it is dark; no default outline.
- The covered copy of the screen is `aria-hidden` (light copy hidden while dark, dark copy hidden while light). The icon SVG is `aria-hidden`.

## Sound

A prop `enableSound?: boolean` (default `true`; `false` silences it) plays interface sounds from `@/lib/ui-sounds`. Flipping the switch plays `on` when the panel goes dark (a tiny noise click with a sine rising from 600 to 900 Hz over 70ms) and `off` when it goes back to light (a noise click with a sine falling from 760 to 480 Hz over 70ms). The autoplay flips make no sound. Silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Turning dark mode on grows a dark circle from the toggle's centre that covers the whole panel in 0.9s with an ease-in-out; turning it off shrinks it back into the toggle in 0.7s.
- [ ] Mid-flood, the boundary cleanly splits light and dark versions of the same screen.
- [ ] The sun loses its rays (they spin −90° and shrink), the core swells and becomes a yellow crescent.
- [ ] The site's own theme and `<html>` classes never change.
- [ ] `defaultDark` renders fully dark on first paint with no animation.
- [ ] At 296px wide the circle still starts at the toggle and covers the panel.
- [ ] Autoplay flips every 2.2s and stops for good on the first pointer down.
- [ ] Two instances on a page each use their own mask id.
