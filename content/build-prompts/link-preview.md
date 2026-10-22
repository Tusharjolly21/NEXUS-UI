# Cursor Card

Build a project list with a preview card that follows the cursor. The card trails a little behind the pointer on a spring, leans into the direction you move, and swaps its picture as you pass from row to row without ever disappearing in between. Rows you are not on fade back so the one you are on reads as the target. On touch, tapping a row pins the card beside it.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useVelocity`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/link-preview/cursor-card.tsx`. Named exports `CursorCard`, the constant `CURSOR_CARD_ITEMS`, and types `CursorCardProps`, `CursorCardItem`. Re-export from the folder's `index.ts`.
- No sound: it is hover-driven and makes none.

## API

`CursorCardItem`: `{ title: string; kind: string; year: string; colors: [string, string]; href?: string }`. A row with no `href` (or `"#"`) only drives the card.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `CursorCardItem[]` | `CURSOR_CARD_ITEMS` | The rows. |
| `ctaLabel` | `string` | `"View case study"` | Call to action at the foot of the card. |
| `autoplay` | `boolean` | `false` | The card visits each row in turn until touched. |
| `className` | `string` | none | Extra classes on the wrapper. |

Demo items (title, kind, year, gradient): Orbitly, Brand and site, 2026, `#0a84ff` to `#5e5ce6`; Wayfolk, Booking app, 2025, `#ff9f0a` to `#ff375f`; Tallyford, Pricing page, 2025, `#30d158` to `#0a84ff`; Velaworks, Design system, 2024, `#bf5af2` to `#ff375f`; Quadrille, Dashboard, 2024, `#64d2ff` to `#30d158`; Relaymint, Onboarding, 2023, `#1d1d1f` to `#5e5ce6`.

## Layout and look

- Wrapper: `relative`, full width, `max-width 620px`. Inside, a zero-margin, unstyled `<ul>` of `<li><a>` rows.
- Row: flex, items on the baseline, space between, `gap 16px`, `padding 20px 0`, bottom border 1px `rgba(0,0,0,.07)` (dark `rgba(255,255,255,.1)`), no underline. Title: `clamp(26px, 5vw, 40px)`, weight 600, tracking -0.035em, `#1d1d1f` (dark `#f5f5f7`). Right label: 13px, `kind · year`, `#6e6e73` (dark `#a1a1a6`), `flex: none`.
- A row that is not the hot one, while some row is hot, dims its title to `#c7c7cc` (dark `#48484a`) with a 200ms colour transition.
- Card: absolutely positioned at the wrapper's top-left and moved with `x`/`y` motion values, `translate(-50%, -50%)`, 200px wide, radius 18px, 8px padding, white (dark `#2c2c2e`), shadow `0 24px 50px -18px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.05)` (dark: alpha .9 and ring `rgba(255,255,255,.08)`), `pointer-events: none`, `aria-hidden`, `z-index: 10`.
- Card cover: 120px tall, radius 12px, `overflow: hidden`; a gradient `linear-gradient(150deg, from, to)` with the title at the bottom-left (12px in), 22px semibold, tracking -0.03em, white.
- Card footer: flex, space between, 12px text, padding `8px 6px 4px`; the label in medium `#1d1d1f` (dark `#f5f5f7`) and a right arrow in `#0071e3` (dark `#0a84ff`).
- Focus: 2px outline, offset 2px, `#0071e3` (dark `#0a84ff`), radius 8px.

## Motion

- Position: pointer-move (mouse only) sets `mx`, `my` to the pointer position relative to the wrapper, clamping `x` so the card's centre stays at least half the card width (or half the wrapper) from the sides. The card follows through `useSpring`, stiffness 300, damping 28, mass 0.6.
- Lean: `rotate = clamp(velocity(x) / 90, -12, 12)` degrees.
- Appear and disappear: scale 0.6 to 1 and opacity 0 to 1 with spring stiffness 400, damping 26; exit reverses. It appears when a row becomes hot and disappears when the pointer leaves the list.
- Cover swap: `AnimatePresence initial={false}`; the new gradient enters from `y: 100%` to 0 with spring stiffness 300, damping 30 while the old one exits to `y: -40%` and opacity 0.4, so the picture slides like a reel.
- Hot row title shifts right 10px (spring stiffness 300, damping 26).
- Reduced motion: no spring (the card is exactly under the pointer), no lean, no title shift; the card and cover only fade (150ms).

## Interaction and states

- Hover (mouse): entering a row makes it hot; leaving the list clears it.
- Keyboard: focusing a row's link makes it hot and pins the card at 62% of the wrapper width, at the row's vertical centre. Focus leaving the wrapper clears it.
- Touch: the first tap on a row pins the card there (the tap does not navigate). If the row has a real `href`, a second tap on the same row follows the link; rows without one never navigate. Mouse clicks on rows with a real `href` navigate normally.

## Autoplay demo

Only while the component is on screen, the tab is visible and motion is not reduced: every 1.1s move to the next row (wrapping), setting it hot and animating the card to that row's vertical centre and to about `45% + 30% * sin(step)` of the width over 0.7s, ease-in-out. A real mouse move over the list, a click or a focus stops it for good.

## Accessibility

- Rows are real links in a list; the card is decorative (`aria-hidden`) because the same information is in the rows.
- Keyboard focus reveals the card; focus outline is visible. The dimmed titles are a transient hover treatment, never the only cue.
- Honours reduced motion as above.

## Acceptance checklist

- [ ] Moving the mouse down the list drags the card with a soft lag and a lean into the motion.
- [ ] Crossing a row swaps the picture with a slide; the card never flickers out between rows.
- [ ] Other rows dim while one is hot; leaving the list removes the card.
- [ ] The card never pokes outside the list at 360px wide.
- [ ] Tab moves the card row by row; blur removes it.
- [ ] On touch, a tap pins the card; a second tap follows a real link.
- [ ] Dark mode has a dark card, light ink and readable labels.
- [ ] Under reduced motion the card only fades and tracks the pointer exactly.
- [ ] Autoplay walks the rows and stops for good on touch.
