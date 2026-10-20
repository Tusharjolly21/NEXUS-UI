# Before / After

Build an image comparison slider: two layers stacked in a rounded 16:9 frame, the "before" layer clipped from the right so a vertical white divider reveals one against the other. The round handle follows the pointer on a soft spring, swells while held, the corner labels fade as the divider approaches them, and a segmented "Before / Split / After" control jumps to fixed positions with a bouncier spring. It should feel smooth and weighted, like a native photo app.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `layoutId`).
- File: `components/before-after/before-after.tsx`, named export `BeforeAfter`; export `BeforeAfterProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `before` | `ReactNode` | required | Content shown left of the divider (usually an `<img>` with `object-cover`, full size). |
| `after` | `ReactNode` | required | Content shown right of the divider. |
| `beforeLabel` | `string` | `"Before"` | Top-left chip text. |
| `afterLabel` | `string` | `"After"` | Top-right chip text. |
| `autoplay` | `boolean` | `false` | Plays a sweep shortly after mount and every few seconds until touched. |
| `className` | `string` | `""` | Extra classes on the outer wrapper. |

## Layout and look

- Wrapper: full-width vertical flex, centred, 20px gap, plus `className`.
- Frame: full width, `aspect-ratio: 16/9`, radius 24px, `overflow: hidden`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -28px rgba(0,0,0,.35)`. Cursor `ew-resize`, `touch-action: none`, `user-select: none`.
- Layers: `after` fills the frame; `before` fills it on top, clipped with `clip-path: inset(0 (100 − p)% 0 0)` where `p` is the position in percent (0 = all after, 100 = all before).
- Chips: 14px from top and the left/right edge, fully rounded, white at 70% with `backdrop-blur-xl` and `backdrop-saturate-150`, padding 6px × 11px, 12px semibold, `#1d1d1f` (same in dark mode, since they sit on imagery).
- Divider: a zero-width container positioned at `left: p%`, spanning full height, non-interactive. Inside: a 2px white line centred on that x (offset −1px) with a faint `0 0 0 .5px rgba(0,0,0,.08)` edge.
- Handle: 46px white circle centred on the divider (offset −23px both ways) at mid-height, `#1d1d1f` icon, shadow `0 8px 20px -6px rgba(0,0,0,.35), 0 0 0 .5px rgba(0,0,0,.08)`, pointer events re-enabled. Icon: 18px, stroke 2.4, round caps, two chevrons `M9 6l-6 6 6 6M15 6l6 6-6 6`.
- Segmented control: 270px wide, 3 columns, radius 12px, 3px padding, bg `#e8e8ed` / dark `#3a3a3c`. Buttons 32px tall, radius 9px, 13px medium, `#1d1d1f` / `#f5f5f7`, 2px `#0071e3` focus-visible outline. Active thumb: white / dark `#636366`, radius 9px, shadow `0 2px 6px rgba(0,0,0,.1), 0 0 0 .5px rgba(0,0,0,.04)`.

## Motion

- Two motion values: a raw `target` (starts at 50) and the displayed `pos = useSpring(target, { stiffness: 380, damping: 34, mass: 0.6 })`. Everything visual (clip, divider `left`, chip opacity) derives from `pos`, so drags feel smooth and slightly trailing, never jittery.
- Chip fades: before-chip opacity maps `pos` `[8, 22] → [0, 1]` (it disappears as the divider reaches the left edge); after-chip opacity maps `[78, 92] → [1, 0]`.
- Handle press: animate `scale` to 1.18 while dragging and back to 1 on release, spring stiffness 500 with damping 22 going up and 12 coming down — so it pops back with a visible wobble.
- Segment jump: `animate(target, value, { type: "spring", stiffness: 160, damping: 18 })` — a slower, bouncier move that then passes through the `pos` spring as well.
- Segment thumb: shared `layoutId` (namespaced with `useId`), spring stiffness 420, damping 32.
- Autoplay sweep: animate `target` through keyframes `[50, 18, 82, 50]` over 2.6s, easeInOut.

## Interaction and states

- Pointer down anywhere in the frame: mark touched, capture the pointer on the event target, start dragging and set `target` straight to the pointer's x — `clamp((clientX − rect.left) / rect.width × 100, 0, 100)`. Clicking somewhere jumps there (through the spring).
- Pointer move while dragging updates `target` the same way; pointer up or cancel ends dragging.
- Segments map Before → 100, Split → 50, After → 0, set the active segment and mark touched. The active segment only changes from these buttons (it starts on Split and is not updated by dragging).
- Positions are always clamped to 0–100.

## Autoplay demo

When `autoplay` is true: run one sweep 600ms after mount and another every 6500ms, but only while untouched. Any pointer-down, arrow key or segment press marks it touched and no further sweeps start.

## Accessibility

- The handle is `role="slider"`, `tabIndex={0}`, `aria-label="Comparison position"`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-valuenow` = rounded target. Left/Right arrow keys move the target by 5 (clamped) and mark touched.
- Handle focus: no outline, a 2px `#0071e3` ring with 2px offset on `:focus-visible`.
- Segmented control is `role="group"` labelled "Jump to". The chevron SVG is `aria-hidden`.

## Acceptance checklist

- [ ] Starts split at 50% with both chips visible.
- [ ] Dragging moves the divider smoothly with a slight lag and no jitter; the handle grows while held and wobbles back on release.
- [ ] Clicking anywhere in the frame glides the divider there.
- [ ] The Before chip fades out as the divider nears the left edge; the After chip as it nears the right.
- [ ] Before / Split / After buttons spring the divider to 100 / 50 / 0 with a bounce, and the thumb slides.
- [ ] Tab to the handle and use arrow keys to step 5% at a time.
- [ ] Works with touch without scrolling the page.
- [ ] With `autoplay`, it sweeps left, right and back every 6.5s until touched.
