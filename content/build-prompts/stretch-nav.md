# Stretch Nav

Build a pill-shaped navigation bar whose dark active capsule moves like something elastic: when you pick another item, the capsule's leading edge shoots toward it first and the trailing edge catches up a moment later, so it stretches across and then snaps back to the target's size. A soft grey hover pill follows the pointer between items. It should feel playful but controlled — rubbery, never sloppy.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`).
- File: `components/stretch-nav/stretch-nav.tsx`, named export `StretchNav`; export `StretchNavProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `string[]` | `["Home", "Work", "Writing", "About", "Contact"]` | Item labels, left to right (also used as keys). |
| `defaultIndex` | `number` | `0` | Item active at first. Uncontrolled after that. |
| `onChange` | `(index: number) => void` | — | Called when the user clicks an item. |
| `autoplay` | `boolean` | `false` | Moves between items by itself until the user interacts. |

## Layout and look

- Container: a `<nav>`, `inline-flex`, items centred, fully rounded, 4px padding, `position: relative`. Light: white, shadow `0 0 0 1px rgba(0,0,0,.06), 0 10px 30px -14px rgba(0,0,0,.25)`. Dark: `#2c2c2e`, shadow `0 0 0 1px rgba(255,255,255,.08), 0 10px 30px -14px rgba(0,0,0,.6)`.
- Items: buttons 36px tall, 16px horizontal padding, fully rounded, 14px medium, stacked above the pills (`z-index`). Inactive text `#1d1d1f` / dark `#f5f5f7`; active text white / dark `#1d1d1f`. Text colour transitions over 200ms; the item becoming active gets an 80ms `transition-delay` so its label flips colour as the capsule arrives.
- Hover pill: absolutely positioned 4px from top and bottom, fully rounded, `#f0f0f3` / dark `#3a3a3c`, behind everything.
- Active capsule: same vertical inset, fully rounded, `#1d1d1f` / dark `#f5f5f7`, above the hover pill, below the labels.
- Both pills are positioned with `left` and `width` in px, measured from each button's `offsetLeft` and `offsetWidth` relative to the nav.

## Motion

The key idea: animate the capsule's **left edge** and **right edge** as two independent motion values with different springs, and derive `width = right − left`.

- Fast spring: stiffness 520, damping 34. Slow spring: stiffness 190, damping 24.
- When the active index changes, measure the target's `[l, r]` edges. If the target is to the right (`l > current left`), animate `right` with the fast spring and `left` with the slow one. If it's to the left, animate `left` fast and `right` slow. The leading edge always arrives first; the trailing edge lags, so the capsule stretches and then contracts.
- `width` is a computed motion value (e.g. `useTransform(() => right.get() − left.get())`) so the element updates without React re-renders.
- On first mount, set `left`/`right` directly (no animation). Do this in a layout effect so it's measured before paint.
- Hover pill: three motion values — `hLeft`, `hWidth`, `hOpacity`.
  - Entering an item while the pill is invisible (opacity < 0.05): jump `hLeft`/`hWidth` to that item instantly, then fade opacity to 1 over 0.15s, so it appears in place rather than sliding in from wherever it last was.
  - Moving to another item while visible: animate `hLeft` and `hWidth` with spring stiffness 420, damping 34, and keep opacity at 1.
  - Leaving the nav: fade opacity to 0 over 0.2s.
- Press: each button `whileTap` scale 0.94.

## Interaction and states

- Pointer enter on an item sets the hover index; pointer leave on the whole nav clears it.
- Click: mark touched, set active, call `onChange(i)`.
- The hover pill can sit under the active capsule; that's fine because the capsule is on top.

## Autoplay demo

When `autoplay` is true, every 1500ms set the active item to the next index in the sequence 3, 1, 4, 0, 2 (each taken modulo `items.length`), repeating. This shows long and short jumps in both directions. A click marks it touched and the interval clears itself on its next tick (hovering alone doesn't stop it). Autoplay doesn't call `onChange`.

## Accessibility

- The container is `<nav aria-label="Main">`; items are real `type="button"` buttons.
- The active item has `aria-current="page"`.
- Both pills are decorative and `aria-hidden`.
- Buttons show a 2px `#0071e3` focus-visible outline with 2px offset; keyboard Enter/Space activate items via native button behaviour.

## Acceptance checklist

- [ ] The dark capsule starts under "Home" without animating on load.
- [ ] Clicking "About" from "Home" stretches the capsule's right edge out first, then the left edge follows and it settles to About's width.
- [ ] Clicking back to the left reverses which edge leads.
- [ ] Longer jumps stretch further than short ones.
- [ ] The active label turns white just as the capsule arrives.
- [ ] Hovering shows a light grey pill that slides between items, appears in place on first entry and fades when the pointer leaves.
- [ ] Item widths of different labels are respected exactly.
- [ ] With `autoplay`, the capsule hops around every 1.5s until you click an item.
- [ ] Dark mode inverts the capsule and text colours as listed.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Selecting a different item plays `tick` from `@/lib/ui-sounds` at 60% volume (a tiny dry high click) as the capsule starts to stretch toward it.
- The autoplay loop plays the same `tick` at the same volume each time it moves to a different item, through the same play function's `auto` variant (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Pressing the item that is already active and hovering are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
