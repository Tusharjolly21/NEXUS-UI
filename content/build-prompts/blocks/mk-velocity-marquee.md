# Velocity Marquee

Build a social proof section with two belts of short customer reviews running in opposite directions, wired to the page scroll. Scroll down and both belts speed up and lean into the motion; scroll back up and they reverse. Hovering a belt brakes it so you can read; grabbing it lets you drag it. It should feel Apple-light, quick and calm. Under reduced motion nothing moves: the reviews sit in two static, wrapped rows.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useScroll`, `useVelocity`, `useSpring`, `useTransform`, `useMotionValue`, `useAnimationFrame`, `useInView`, `useReducedMotion`), and a `cn` helper.
- File: `components/blocks/velocity-marquee.tsx`, named export `VelocityMarquee`, types `VelocityMarqueeProps` and `VelocityMarqueeReview`, and the demo arrays `DEFAULT_VELOCITY_TOP_ROW` and `DEFAULT_VELOCITY_BOTTOM_ROW`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `heading` | `string` | `"Scroll the page and watch them go."` | Small line above the belts. |
| `staticHeading` | `string` | `"What teams are saying."` | Heading used instead when the visitor prefers reduced motion. |
| `topRow` | `VelocityMarqueeReview[]` | 5 demo reviews | `{ quote, name }`. Belt that runs left. Use a stable array. |
| `bottomRow` | `VelocityMarqueeReview[]` | 5 demo reviews | Belt that runs right. |
| `className` | `string` | none | Extra classes on the section. |

There is no `autoplay` prop: the belts drift on their own by design, can be paused with a button, and stop under reduced motion.

Demo top row: "Shipped our pricing page in an afternoon" (Arjun, Tally), "The motion is the good kind" (Lena, Wayfare), "Visitors play with the hero" (Sara, Orbitly), "Feels expensive. Wasn't." (Dev, indie), "Respects reduced motion out of the box" (Noor, Quadrel). Bottom row: "Copy, paste, ship" (Tom, Relay), "Our onboarding finally feels like us" (Maya, Loop), "Clients ask who built it" (Kai, studio), "Designers and devs stopped arguing" (Eli, Paraleon), "The small details win" (Ana, Velara). These are invented; swap in real, attributed quotes.

## Layout and look

- Root `<section aria-label="Customer reviews">`: full width, `overflow: hidden`, padding 56px vertical, background white / `#000` in dark.
- Header: centred column, 20px below, 16px side padding. A 13px medium line in `#6e6e73` / dark `#a1a1a6`, then (only when motion is allowed) a 28px tall text button "Pause motion" / "Resume motion", 12px medium, `#0071e3` / dark `#0a84ff`, underline on hover.
- Belts sit in a wrapper with a horizontal mask: `linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)`.
- Each belt: `overflow: hidden`, 8px vertical padding. Inside, a `flex` track of `width: max-content`, 12px gap, 12px right padding (so exactly half of the track width is one set of reviews and the loop is seamless), `touch-action: pan-y`, cursor grab (grabbing while pressed). The reviews are rendered twice; the second copy is `aria-hidden`.
- Review pill (`<figure>`): flex, centred, 12px gap, fully rounded, padding 10px 20px 10px 10px, background white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 8px 20px -14px rgba(0,0,0,.35)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 8px 20px -14px rgba(0,0,0,.9)`). Contents: a 36px round avatar with the first letter of the name, 13px bold white, gradient `135deg #0a84ff to #5e5ce6` on the top belt and `135deg #ff9f0a to #ff375f` on the bottom belt; the quote in curly quotes, 15px medium, tracking -0.01em, no wrapping, `#1d1d1f` / `#f5f5f7`; the name, 13px, no wrapping, `#6e6e73` / `#a1a1a6`.
- Reduced motion: no mask, no track. Each belt becomes a centred, wrapping row of the same pills (gap 12px, 16px side padding), the pause button is hidden and the heading switches to `staticHeading`.

## Motion

- Each belt owns a motion value `base` (a percentage). The track's `x` is `wrap(-50, 0, base)` as a percent string, where `wrap` loops the value into `[-50, 0)`.
- Page scroll: `useScroll()` gives `scrollY`; `useVelocity(scrollY)` its speed in px per second; `boost = useSpring(velocity / 120, { stiffness: 80, damping: 30 })`, shared by both belts.
- Lean: `skewX = clamp(boost * -dir * 0.9, -14, 14)` degrees, where `dir` is +1 for the top belt and -1 for the bottom belt.
- Per frame (`useAnimationFrame`, delta clamped to 64 ms): skip when the belt is off screen (`useInView`) or being dragged. Brake spring `slow = useSpring(1, { stiffness: 120, damping: 20 })` is set to 0 while paused, 0.12 while the pointer is over the belt and 1 otherwise. `speed = (2.2 + |boost| * 0.6) * slow`. `sign = boost < -0.5 ? -dir : dir`. `base += sign * -speed * delta / 1000`.
- Drag: pointer down captures the pointer and stores x; each move adds `((clientX - lastX) / (scrollWidth / 2)) * 50` to `base`; release, cancel or leaving the belt ends the drag.

## Interaction and states

- Hover brakes (to 12% speed), leave restores. Drag works with mouse, pen and touch (vertical page scroll still works because of `touch-action: pan-y`).
- The Pause motion button toggles `paused`, which eases both belts to a stop and back.
- Off screen the belts do not advance; a hidden tab stops the animation frame loop by itself.

## Autoplay demo

Not applicable: the drift is the component's resting behaviour. The preview simply renders `<VelocityMarquee />`.

## Accessibility

- Real text for the first copy of each review (`figure`, `blockquote`, `figcaption`); the repeated copy is `aria-hidden`.
- The Pause / Resume motion button is a real button with a visible label and a 2px `#0071e3` (dark `#0a84ff`) focus outline.
- Reduced motion (`useReducedMotion`) stops all movement and shows the static rows. No network calls, nothing navigates.

## Acceptance checklist

- [ ] Both belts drift in opposite directions and loop with no visible jump.
- [ ] Scrolling the page down speeds both belts up and skews them; scrolling up reverses them.
- [ ] Hovering a belt slows it to a crawl; dragging moves it by hand and it carries on from there.
- [ ] Pause motion stops both belts and the label becomes Resume motion.
- [ ] Off screen, the belts do not advance.
- [ ] With reduced motion, two static wrapped rows show and nothing moves.
- [ ] Dark mode swaps the pills, text, shadows and section background to the dark palette.
- [ ] At 320px wide nothing overflows the page horizontally.
