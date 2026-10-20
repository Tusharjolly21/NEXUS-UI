# Lanyard Badge

Build a conference badge on a strap that you can grab and throw. Let go and it swings back as a damped pendulum; the strap sags when slack, the badge's angle lags and overshoots, and it twists in 3D with sideways speed. Physical and playful, but tidy: an Apple-event badge.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `useMotionValue`, `useTransform`). Physics is a custom `requestAnimationFrame` loop writing motion values; no framer drag.
- File: `components/lanyard-badge/lanyard-badge.tsx`, named export `LanyardBadge`, plus exported `LanyardBadgeProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `name` | `string` | `"Alex Rivera"` | Attendee name; the avatar shows the first letter of each word. |
| `role` | `string` | `"Design Engineer"` | Line under the name. |
| `event` | `string` | `"Motion Summit"` | Printed at the top, followed by " 2026". |
| `tag` | `string` | `"Speaker"` | Label on the coloured band at the bottom. |
| `strap` | `string` | `"#0071e3"` | Strap, band and avatar gradient start colour. |
| `autoplay` | `boolean` | `false` | Nudges the badge every few seconds until someone grabs it. |

Constants: stage 420×420, strap length `L = 150`, badge 168×228.

## Layout and look

- Stage: `relative`, 420×420, `max-width: 100%`, `perspective: 900px`, `touch-none select-none`. Physics uses stage units; convert pointers with `(clientX − rect.left) / rect.width · 420` (same for y).
- Anchor at `(210, 0)`. A small clip at the top centre: 32×12, bottom radius 6px, `#d2d2d7` (dark `#48484a`).
- Strap: a full-stage SVG (`pointer-events-none`) with two paths sharing the same `d`: the strap, stroke `strap`, width 12, round caps; and a stitch line on top, `rgba(255,255,255,.35)`, width 2, dash `2 7`, round caps.
- Badge wrapper (the draggable element): positioned by motion values `x = px − 84`, `y = py`, `rotate`, `rotateY`, transform origin top centre (`originX 0.5, originY 0`), size 168 × 246 (badge height + 18px for the clip), `transform-style: preserve-3d`, radius 18px, `cursor-grab` / `active:cursor-grabbing`.
  - Metal clip at top centre: 26×22, radius 6px, `linear-gradient(180deg, #e5e5ea, #aeaeb2)`, shadow `inset 0 1px 0 #fff, 0 2px 4px rgba(0,0,0,.2)`.
  - Card: bottom-anchored, 228px tall, radius 18px, `overflow-hidden`, white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 30px 50px -24px rgba(0,0,0,.45)`. Dark: `#1c1c1e`, shadow `0 0 0 1px rgba(255,255,255,.1), 0 30px 50px -24px rgba(0,0,0,.9)`.
    - Slot: 48×8 pill, centred, 12px from top, `#e8e8ed` (dark `#3a3a3c`).
    - Body: column, centred, 8px gap, 16px side padding, 16px top padding. Event line `"{event} 2026"` 10px semibold uppercase, tracking 0.16em, `#86868b` (dark `#8e8e93`). Avatar 64px circle, `linear-gradient(135deg, {strap}, #5e5ce6)`, initials 22px semibold white. Name 18px semibold, tight leading, tracking −0.02em, `#1d1d1f` (dark `#f5f5f7`). Role 12px `#6e6e73` (dark `#a1a1a6`).
    - Band: 36px tall, background `strap`, `tag` in 12px semibold uppercase white, tracking 0.18em.

## Motion (physics loop)

Keep state in a ref: position `x, y`, velocity `vx, vy`, angle `r` and angular velocity `vr`, `dragging`, drag target `tx, ty`, grab offset `ox, oy`, `touched`. Start at `(210, 150)`, at rest. Each frame `dt = min(0.032, elapsed seconds)`.

**While dragging**: move 45% of the way toward the target each frame (`x += (tx − x)·0.45`), and set velocity to that frame's displacement / dt (so release carries the throw). Clamp distance from the anchor to `1.35·L` (the strap stretches a bit, then stops).

**While free**:
- gravity `vy += 2200·dt`;
- air drag on both axes `v *= 0.35^dt` (frame-rate independent);
- integrate `x += vx·dt`, `y += vy·dt`;
- if distance `d > L`: pull the badge back to `L + (d − L)·0.6` along the strap direction (a stiff, slightly elastic rope), and if the radial (outward) velocity is positive remove 90% of it. Inside `L` the strap is slack and the badge falls freely.

**Badge angle**: target `= −atan2(x − 210, y − 0)` in degrees (the strap's angle). Spring it: `vr += ((target − r)·180 − vr·14)·dt; r += vr·dt`. This makes it lag and overshoot.

**3D twist**: `rotateY = clamp(vx·0.05, −55, 55)` degrees.

**Strap curve**: quadratic from anchor to badge: `M 210 0 Q mx my x y` where `mx` is the midpoint x and `my = midpoint y + sqrt(max(0, L² − d²))·0.7` (it sags when slack, straight when taut).

Write `px, py, rot, twist` and the path into motion values each frame; cancel on unmount.

## Interaction and states

- Pointer down: capture, set dragging and touched, store the grab offset (no jump), target = position. Move: target = pointer − offset. Up/cancel: stop dragging; physics continues with the current velocity.
- Keyboard on the focused badge: ArrowLeft/ArrowRight add `∓900 / +900` to `vx` and −200 to `vy`; Enter or Space add −900 to `vy` (tosses it up). Prevent default for these keys; all mark touched.

## Autoplay demo

With `autoplay`: a nudge at 600ms, then every 4200ms. A nudge adds `±(700 + random·500)` to `vx` (random side) and −200 to `vy`. Skip when touched or dragging. Clear timers on unmount.

## Accessibility

- Badge wrapper: `role="img"`, `tabIndex={0}`, `aria-label="{event} badge for {name}, {role}. Drag to swing it, or use the arrow keys."`.
- Focus-visible: 2px ring `#0071e3` (dark `#0a84ff`) with 4px offset (dark offset colour black); no default outline.
- Strap SVG and anchor clip are `aria-hidden`.

## Acceptance checklist

- [ ] At rest the badge hangs straight down 150px below the anchor with a straight strap.
- [ ] Dragging follows the pointer smoothly from the grab point and can stretch the strap to about 1.35× before stopping.
- [ ] A throw keeps its momentum, then swings and settles; pushed up, the strap sags while it falls.
- [ ] The badge rotation trails the strap and overshoots slightly.
- [ ] Fast sideways motion twists the badge in 3D up to 55°.
- [ ] Arrow keys flick it sideways; Enter/Space toss it up.
- [ ] Autoplay nudges it at 0.6s and every 4.2s until first grab or key press.
