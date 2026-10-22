# Circuit Hero

Build a centred hero on a living circuit board drawn on a canvas. Signals race along PCB-style traces, the traces near the pointer warm to blue and fire their own pulses, and a click sends a burst out through every nearby line. The middle of the board fades to the page colour so the headline always reads. Apple-light, technical, calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useReducedMotion`) for the entrance, a `cn` helper, and the 2D canvas API with `requestAnimationFrame`. No other libraries.
- File: `components/blocks/circuit-hero.tsx`, named export `CircuitHero` and type `CircuitHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Lets a ghost pointer wander over the board, warming and firing traces, until the visitor first moves a pointer over it. Ambient signals run either way. |
| `onAction` | `(label: "primary" \| "secondary") => void` | none | Called with the button that was pressed. Nothing navigates. |
| `className` | `string` | none | Extra classes on the section. |

## Layout and look

- Root `<section>` (`aria-label="Edge network"`): relative, `isolate`, flex centred both ways, full width, `min-height: 560px`, `overflow: hidden`, padding 24px sides and 80px top and bottom, background white / `#000`. It sets `--ch-bg` to `#fff` / dark `#000`.
- Canvas: absolute, fills the section, `z -10`, `aria-hidden`. Above it (still `z -10`) an `aria-hidden` fade layer: `radial-gradient(ellipse 46% 42% at 50% 50%, var(--ch-bg) 30%, color-mix(in srgb, var(--ch-bg) 85%, transparent) 55%, transparent 100%)`.
- Content: max width 620px, centred text.
  - Pill: inline flex, 8px gap, fully rounded, padding 4px 12px, 13px medium, white / `#1c1c1e` fill, ring `rgba(0,0,0,.08)` / `#3a3a3c`, with an 8px green dot (`#34c759`, dark `#30d158`) that has a pinging halo (`animate-ping`, off under reduced motion); text "Edge network · 312 regions".
  - `<h1>` "Every request," break "on the shortest wire.": margin-top 20px, `clamp(40px, 7vw, 68px)`, semibold, line-height 1.02, tracking -0.04em, `#1d1d1f` / `#f5f5f7`.
  - Paragraph: margin-top 20px, max width 460px, 17px / 1.5, `#6e6e73` / `#a1a1a6`: "Your app runs next to your users, so pages answer before they finish clicking."
  - Buttons: margin-top 32px, wrap, centred, gap 12px, real `<button type="button">`s, padding 12px 24px, 15px medium, pill. "Deploy now": `#0071e3` (hover `#0077ed`; dark `#0a84ff`, hover `#409cff`), white text. "See the map": white / `#1c1c1e` fill, ring `rgba(0,0,0,.1)` / `#3a3a3c`, ink text.
- Hint: bottom 16px, centred, 12px, `#86868b` / `#a1a1a6`, "Click anywhere to send a signal", pointer-events none.
- Entrance: each of pill, headline, paragraph, buttons fades and rises (`opacity 0, y 8` for the pill, `y 14` for the rest) with delays 0, 0.08, 0.16, 0.24s. Reduced motion: no entrance transform.

## The board

- Grid pitch `G = 22px`. Traces are built on that grid with a seeded random walk (seed 5, so the same board for the same size): about `cols x rows / 9` traces; each starts at a free cell going in a straight direction (one of four axes), takes 4 to 15 steps, may turn by 45 degrees (probability .28 per step after the second), stops at the edge or at an occupied cell, and diagonals may not cross another diagonal. Traces shorter than 4 cells are dropped. Only the corner points are kept, so each trace is a few straight runs. Cumulative lengths are stored for positioning along the trace.
- Drawing per frame, in CSS pixels (the canvas is scaled by `devicePixelRatio`, capped at 2, and re-scaled when the ratio changes or the section resizes):
  - Base trace: 1.5px, round caps and joins, `#e3e3e8` (dark `#2c2c2e`). Heat overlay: the same path in `rgba(10,132,255, heat x .55)` at width `1.5 + heat`.
  - End nodes: 3px circles filled white (dark black) with a 1.5px ring `#d2d2d7` (dark `#3a3a3c`) that turns blue `rgba(10,132,255, .35 + heat x .65)` when warm.
  - Heat: per trace, distance from the pointer to its nearest segment; target = `max(0, 1 - d / 120)`; heat eases toward the target, fast up (rate 10 per second) and slowly down (1.6 per second).
  - Pulse (comet): a head moving along a trace at 140 to 300 px/s in either direction, drawn as six 2.2px segments over a 46px tail with alpha falling from .9 to 0, plus a 10px radial glow at the head in the pulse colour (`#0a84ff`, `#5e5ce6` or `#30d158`) and a 1.6px white core. A pulse is removed when its tail leaves the trace. At most 140 live pulses.
- Ambient signals: spawn at a rate of `width x height / 90000` per second, each on a random trace from a random end.
- Warm traces fire: a trace whose target heat is above .55 fires a pulse at most once per 900ms.
- Burst: pointer press (not on a link or button) fires a blue pulse (`#0a84ff`) from the nearer end of every trace whose nearest end is within 190px, and sets their heat to 1.
- Ghost pointer (only with `autoplay`, before the visitor has moved a pointer in, and not under reduced motion): heat is computed from a point at `(w x (.5 + .36 sin(t / 2300)), h x (.5 + .3 sin(t / 1700 + 1)))` instead of the pointer.

## Loop and lifecycle

- `requestAnimationFrame` loop with `dt = min(.05, elapsed)`. It runs only while the section intersects the viewport (`IntersectionObserver`) AND the tab is visible AND motion is allowed. Becoming hidden or leaving the screen cancels the frame; coming back resets the clock so there is no jump. While paused, the last frame stays drawn (one static frame is drawn on resize, theme change or ratio change).
- Reduced motion: no loop. One still frame is drawn: all traces, and about every sixth trace carries a frozen comet part-way along it. Hovering redraws once per animation frame with the heat set directly to the target (no easing, no pulses). Bursts do nothing.
- Theme: a `MutationObserver` on the root element's class list picks up the `.dark` class and redraws.
- Unmount tears everything down: cancel frames, disconnect the resize, intersection and mutation observers, remove the visibility and pixel-ratio listeners, drop traces and pulses.

## Interaction and states

- Pointer move over the section: pointer position in section coordinates; leave clears it. Touch works through pointer events.
- Keyboard path: pressing a button with the keyboard (a click with `detail === 0`) sends the burst from the centre of that button, then calls `onAction`.
- Buttons call `onAction("primary")` / `onAction("secondary")`; nothing navigates.

## Autoplay demo

Preview with `autoplay`: the ghost pointer drifts over the board in a slow figure of eight, warming traces and firing pulses, until a pointer enters.

## Accessibility

- Canvas and fade layer are `aria-hidden`; the readable content is the pill, `<h1>`, paragraph and two real buttons.
- Focus rings: 2px outline, 2px offset, `#0071e3` (dark `#0a84ff`).
- Reduced motion: still frame, no ping, no entrance movement.

## Acceptance checklist

- [ ] A grid of thin grey traces with small round end nodes fills the section; comets run along them.
- [ ] Hovering warms nearby traces to blue and they fire pulses; cooling is slower than warming.
- [ ] Clicking empty space sends a blue burst through lines within about 190px; clicking a button does not.
- [ ] With `autoplay`, a ghost pointer lights traces until a real pointer enters.
- [ ] The middle of the board fades to the page colour behind the headline.
- [ ] Sharp on a 2x screen; resizing or zooming rebuilds the canvas correctly.
- [ ] Scrolled off screen or in a hidden tab, no animation frames run (check the performance panel).
- [ ] Reduced motion shows a still board with a few frozen comets.
- [ ] Dark mode swaps trace, node and fade colours, and updates live when the theme flips.
- [ ] Unmounting leaves no observers, listeners or frames behind.
