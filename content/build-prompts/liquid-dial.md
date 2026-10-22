# Liquid Dial

Build a floating "new" button whose actions bud out of it like liquid along an arc. Everything sits under an SVG goo filter, so blobs stay joined as they leave and merge back on return. The highlight is two blobs on different springs, stretching into a thread between actions. Soft and organic, with crisp icons on top.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`).
- File: `components/liquid-dial/liquid-dial.tsx`, named export `LiquidDial`, plus exported types `LiquidDialProps` and `LiquidDialAction = { id: string; label: string; d: string }` (`d` is SVG path data in a 24×24 box, drawn with a 1.9 stroke).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `actions` | `LiquidDialAction[]` | Photo, Note, Voice memo, Link | Up to four actions on the arc. |
| `color` | `string` | `var(--ld-blob)` = `#1d1d1f` (dark `#3a3a3c`) | Blob colour. |
| `accent` | `string` | `var(--ld-accent)` = `#0071e3` (dark `#0a84ff`) | Highlight blob and focus ring colour. |
| `onSelect` | `(id: string) => void` | – | Called with the action id when picked. |
| `autoplay` | `boolean` | `false` | Opens and browses by itself until the user interacts. |

Default icon paths:
- photo: `M4 8h3l2-3h6l2 3h3v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z`
- note: `M6 4h9l4 4v12H6zM14 4v5h5M9 13h7M9 17h5`
- voice: `M12 4a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3`
- link: `M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1`

## Geometry

Stage 360×300, `relative select-none`. Button centre `(180, 240)`. Actions sit on a circle of radius 112 around it at angles −160°, −118°, −62°, −20°: `x = 180 + cos(a)·112`, `y = 240 + sin(a)·112`.

## Layout and look

- **Goo filter** (unique id from `useId`, inside a 0×0 SVG): `feGaussianBlur stdDeviation 9` → `feColorMatrix` with alpha row `0 0 0 22 −9` (identity on RGB) → `feComposite in=SourceGraphic in2=goo operator=atop`.
- **Liquid layer** (full stage, filtered, `aria-hidden`): a 52px `color` blob per action (centred via −26px offsets, moved by `x, y`); two 2px `accent` dots positioned by `lead` and `tail` and scaled by `hlR` (31 → 62px); the 64px main blob at the centre.
- **Icon layer** (not filtered): one 52px round `motion.button` per action, white 20px icon (stroke 1.9, round caps/joins), at the same positions as its blob.
- **Hover label**: 12px medium `#6e6e73` (dark `#a1a1a6`), no wrap, centred 54px above the hovered action.
- **Main button**: 64px round, white 24px plus icon (`M12 5v14M5 12h14`, stroke 2.4, round), sitting on the main blob.
- **Toast**: "New {label lowercased}" centred, 32px from the top, pill with padding 14px × 6px, 13px medium, white with `#1d1d1f` text, shadow `0 0 0 1px rgba(0,0,0,.06), 0 8px 20px -10px rgba(0,0,0,.3)`. Dark: `#2c2c2e`, `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.1), 0 8px 20px -10px rgba(0,0,0,.8)`.

## Motion

- **Action blobs and icons**: open → their point, scale 1 (icons also opacity 1, and scale 1.1 while hovered), spring stiffness 260, damping 16 (wobbly), delay `i·0.05s` for blobs and `i·0.05 + 0.04s` for icons. Closed → centre, scale 0.4 (icons opacity 0), spring stiffness 380, damping 28, blob delay `(n − i)·0.03s` (last one first), icons no delay. `initial={false}`.
- **Main blob**: scale 1.04 when open.
- **Plus icon**: rotates to 135° when open (becomes ×), spring 400/20. Main button `whileTap { scale: 0.9 }`.
- **Highlight**: whenever `hover` or `open` changes, target = hovered action's point if open and hovering, otherwise the centre. Animate `lead` x/y with a fast spring (stiffness 520, damping 30) and `tail` x/y with a slow one (stiffness 140, damping 18). The goo filter joins the two dots into a stretched thread while the tail catches up. Animate `hlR` to 31 when highlighting, 0 otherwise (spring 400/26).
- **Hover label**: enters from `opacity 0, y 6`.
- **Toast**: enter from `opacity 0, y 10, scale 0.9`; exit `opacity 0, y −6`; visible for 1400ms (restart the timer on each pick; clear on unmount).

## Interaction and states

- State: `open`, `hover` (index or null), `picked` (label or null).
- Main button toggles `open` and clears `hover`.
- Action buttons: pointer enter or focus sets `hover`; click picks: set `picked`, call `onSelect(id)`, close, clear hover.
- Leaving the stage clears hover; pointer down marks touched. Closed action buttons get `tabIndex -1`, `pointer-events: none`.

## Autoplay demo

With `autoplay`: run at 700ms, then every 5200ms, while not touched. A run opens the dial, hovers actions `0, 1, 2, 3, 1` at `650 + k·420ms`, and at 3000ms picks `actions[1]` (showing the toast). Keep the latest `choose` and `actions` in a ref so timers never go stale. Clear every timer on unmount.

## Accessibility

- Main button: `aria-expanded`, `aria-label` "New" when closed, "Close actions" when open.
- Action buttons: `aria-label` = action label.
- Focus-visible: 2px ring in the accent with 2px offset (dark offset black); no default outline.
- Toast has `role="status"`. Liquid layer and filter are `aria-hidden`.

## Acceptance checklist

- [ ] Opening makes four blobs stretch out of the button, connected by liquid necks, then pop free with a wobble.
- [ ] Closing pulls them back in reverse order and they merge into the button.
- [ ] The plus rotates into an ×.
- [ ] Hovering an action grows an accent blob around it; moving to the next stretches it into a thread first.
- [ ] Picking an action closes the dial, calls `onSelect`, and shows "New photo" style toast for 1.4s.
- [ ] Tab reaches action buttons only when open.
- [ ] Autoplay opens, browses, picks Note and repeats every 5.2s until first pointer down.

## Sound

Add an `enableSound` prop (boolean, default `true`; `false` silences it). When the user clicks an action, play one `tap` (a short 900 to 620 Hz sine blip with a faint high click, volume 0.8). Opening and closing the dial, hovering and focusing actions, and the autoplay pick are silent. It is silent in autoplay and on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps), and no audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
