# Ripple Toast

Build notifications that arrive like a drop hitting water. Each toast falls in as a small bead, splashes flat into a pill with an overshoot, sends out a ring, and its text resolves out of the ripples. Newer toasts push the stack down; dismissed ones lift back up as a drop. Up to three stay on screen.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`), and an SVG filter per toast (`feTurbulence` with `feDisplacementMap`).
- File: `components/ripple-toast/ripple-toast.tsx` plus an `index.ts`. Named exports: `RippleToast` and `RippleToastProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Sends a notification every ~1.7s and dismisses one now and then, until a button is pressed. |
| `className` | `string` | none | Extra classes for the wrapper. |

## Layout and look

- Wrapper: 360px wide, `max-width: 100%`. A tray 262px tall, radius 24px, padding 12px, background `#e8e8ed` / dark `#1c1c1e` with an inset hairline. An ordered list (`aria-live="polite"`, label "Notifications") holds the toasts with an 8px gap. "No notifications" shows when it is empty.
- Toast: radius 22px, white / dark `#2c2c2e`, padding 12px with 8px on the right, a soft ring and shadow. A 36px round icon in the kind's colour (Done `#30d158` with a check, Message `#0071e3` with a bubble, Heads up `#ff9f0a` with an exclamation), then the title (14px semibold) over the body (13px muted), both truncating, then a 44px dismiss button.
- Below the tray: three pill buttons (Done, Message, Heads up), each with a coloured dot, and the line "Send one. It lands like a drop and the ripples settle out of the text."

## Motion

- Enter: starts as a small bead above (`y: -90`, `scaleX: 0.16`, `scaleY: 0.5`, radius 999), springs down, then widens to 1.08 and settles to 1 over 0.6s, radius to 22px.
- After 260ms the text's filter hits a displacement of 26 and a spring brings it to 0 with overshoot (stiffness 120, damping 9); the turbulence frequency follows the displacement, so the letters wobble and settle. A 2px ring in the toast's colour expands 1 to 1.14 and fades over 0.9s.
- Exit: lifts and squeezes back into a bead (`y: -40`, `scaleX: 0.16`) while fading over 0.35s. Layout animation moves the others.
- The newest toast goes on top, and only three are kept.
- Autoplay only runs while on screen and never under reduced motion; the first press stops it.

## Accessibility

- Each toast is `role="status"`. The dismiss button is labelled with the title. Reduced motion: no autoplay.
