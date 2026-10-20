Build a shared design board card with teammates' cursors moving over it as if live. Arrows glide from spot to spot on springs and lean with their speed; each name tag trails a beat behind on a looser spring and swings when the arrow stops (follow-through); every stop lands as a little click with a ring; now and then someone drops a comment bubble. The visitor's own pointer gets a green "You" tag when it comes over the board. Playful but tidy, Apple-light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useTransform`, `useVelocity`, `useReducedMotion`), and a `cn` class-merge helper.
- File: `components/real-time-cursors/real-time-cursors.tsx`, named export `RealTimeCursors`, exported types `LiveCursor` and `RealTimeCursorsProps`.

## API

`LiveCursor = { name: string; color: string; textColor?: string (default "#ffffff"); path: {x, y}[] (percent of the board, looped); duration?: number (seconds per hop, default 1.1); delay?: number (seconds before starting, default 0); note?: string }`.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `cursors` | `LiveCursor[]` | 3 teammates (below) | People on the board. |
| `title` | `string` | `"Launch board"` | Board name in the header. |
| `showYou` | `boolean` | `true` | "You" tag that follows the visitor's pointer. |
| `youColor` | `string` | `"#30d158"` | Colour of the You tag. |
| `autoplay` | `boolean` | `false` | A demo You cursor tours the board until the visitor's pointer arrives. |
| `showCodePanel` | `boolean` | – | Deprecated no-op kept for compatibility. |
| `className` | `string` | – | Extra classes on the card. |

Default teammates: Ava `#0071e3`, note "Bigger headline?", path (18,30) (40,22) (34,52) (14,62), 1.2s. Noah `#bf5af2`, note "Ship it", path (78,70) (62,44) (86,30) (70,82), 1.05s, delay 0.6. Mira `#ff9f0a`, text `#1d1d1f`, path (52,78) (64,22) (44,66) (88,56), 1.35s, delay 1.2. Demo You path: (30,74) (56,34) (74,58) (46,50).

## Layout and look

- Card: full width, max 620px, radius 24, `overflow: hidden`, white / `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e` / `#f5f5f7`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`.
- Header: padding 12×16, bottom border `rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). Left: title 15px semibold tracking −0.01em; below, 12px `#6e6e73` (dark `#a1a1a6`) with a 6px green `#30d158` presence dot + "{N} here now" (N = teammates + 1 if showYou; tabular). Right: overlapping 32px avatar circles (−8px spacing) in each teammate's colour with their initial, 12px semibold, 2px ring white (dark `#1c1c1e`).
- Board: 260px tall, `overflow: hidden`, `#f5f5f7` with a dot grid `radial-gradient(#d2d2d7 1px, transparent 1px)` at 18px; dark `#141416` with `#3a3a3c` dots. Static content:
  - Hero frame at 7%/12%, 46% wide, radius 16, padding 12, white (dark `#2c2c2e`), soft shadow. Caption "Hero / Desktop" 10px medium `#86868b`; a 72px image block radius 10 with `linear-gradient(135deg, #5ac8fa, #0071e3 55%, #bf5af2)`; a 10px title bar 70% wide `#1d1d1f` (dark `#f5f5f7`); an 8px line 52% `#d2d2d7` (dark `#48484a`); a 24px button pill 38% `#0071e3` (dark `#0a84ff`).
  - Yellow sticky at 60%/14%, 30% wide, rotated 3°, radius 6, padding 12, `#fff1a8`, text `#5c4a00` 12px medium: "Ship on Friday?" + "Ava" (10px, 70%).
  - Green sticky at 58%/56%, 26% wide, rotated −4°, `#c8f5d2`, text `#0d4a1f`: "Pricing looks right" + "Noah".
  - Pill at bottom 10%, left 12%: white (dark `#2c2c2e`), 11px medium grey, 8px orange `#ff9f0a` dot + "3 comments".
- Footer: 12px `#86868b` (dark `#a1a1a6`), centred, padding 10×16: "Move your pointer over the board to join in."
- Cursor: 20px arrow (classic pointer path) filled with the colour, 1.4px white stroke, drop shadow `0 2px 4px rgba(0,0,0,.25)`, positioned with `left/top` as percentages, z 30, pointer-events none.
- Name tag (separately positioned): offset 16px right, 20px down; pill, padding 3×8, 11px semibold, leading 1, background colour, text `textColor`, shadow `0 4px 10px -4px rgba(0,0,0,.35)`. Note bubble below it (gap 4): max 150px, radius 12 with a 4px top-left corner, padding 6×10, 12px snug, white / `#1d1d1f` (dark `#2c2c2e` / `#f5f5f7`), hairline shadow.

## Motion

- Tour per cursor: x/y motion values (percent). After `delay + 0.3s`, animate both to the next point with a spring `{ visualDuration: hop, bounce: 0.18 }`; when both finish, fire a stop callback, wait 420ms, then go to the next point (looping). Cancel timers and animations on unmount.
- Lean: `tilt = spring(map(velocity(x), [−60, 0, 60] → [−16°, 0, 16°]), stiffness 260, damping 18)`, rotation origin (0.15, 0.1).
- Trailing tag: its x/y are `useSpring(x/y, stiffness 170, damping 15)`; it swings with `spring(map(velocity(x), [−60, 0, 60] → [10°, 0, −10°]), stiffness 120, damping 8)`, origin top-left.
- Click at each stop: increment a counter; the arrow re-keys and springs from scale 0.78 to 1 (600/14); a 28px ring (2px border in the cursor colour, centred on the tip at −12px) expands scale 0.2 → 1.5 and fades 0.9 → 0 over 0.55s easeOut.
- Notes: on every third stop (`i mod 3 === 2`) show the note for 1.9s. Enter scale 0.4 → 1 with opacity (spring 500/20, origin top-left); exit scale 0.6, opacity 0 over 0.15s.
- Presence dot pulse: a copy behind it animates scale 1 → 2.4, opacity 0.7 → 0, 1.6s easeOut, infinite.
- Header avatars pop in from `scale 0, y 6`, spring 500/18, delay `0.15 + i × 0.08`.

## Interaction and states

- `pointermove` on the board (mouse/pen only, not touch) converts the pointer to board percentages (rounded to 3 decimals), switches the You tag to live and marks the demo touched. The live You cursor uses those values directly (no tour, no clicks). `pointerleave` hides the live You.
- Without autoplay, the You tag only appears while the pointer is over the board.
- Reduced motion: no tours (teammate cursors stay at their first point), no demo You, no pulse, avatars appear without the pop.

## Autoplay demo

With `autoplay` and `showYou`, a demo You cursor tours its four points (hop 1.25s, delay 1.8s) with clicks. The first pointer move over the board replaces it with the real pointer for good.

## Accessibility

- Avatar row `role="list"` labelled "People on this board", each avatar a `listitem` with the person's name as label and title.
- Board `role="img"` labelled "Shared board. Teammates' cursors move across it." All cursors and tags are pointer-events none and decorative.

## Acceptance checklist

- Three coloured cursors loop around the board with a slight springy settle at each spot.
- Arrows lean in the direction of travel; tags lag behind and swing when the arrow stops.
- Each stop pops the arrow and sends out a ring.
- Ava and Noah show their comment bubble every third stop for about two seconds.
- Moving the mouse over the board shows a green "You" tag that follows it; leaving hides it.
- The header shows the live dot, "4 here now" and three overlapping avatars.
- Reduced motion freezes the cursors; dark mode recolours card, board, frame and bubbles.
