# Radio Cards

Build a plan picker made of stacked cards backed by real radio inputs. The selection ring glides from card to card, the chosen card grows to reveal chips listing what's included, and the "Continue with …" button rolls its label to the new plan name. It should feel calm, precise and native, like a system settings sheet.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `layout`, `layoutId`).
- File: `components/radio-cards/radio-cards.tsx`, named export `RadioCards`; also export `RadioCardsProps` and `RadioOption`.

## API

```ts
interface RadioOption { id: string; title: string; description: string; meta?: string; features?: string[] }
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `options` | `RadioOption[]` | three plans (below) | Cards to show. `meta` sits on the right; `features` show as chips when selected. |
| `defaultValue` | `string` | second option's id (else first) | Initially selected id. Uncontrolled. |
| `onChange` | `(id: string) => void` | — | Called when the user picks an option (not by autoplay). |
| `autoplay` | `boolean` | `false` | Cycles the selection until someone interacts. |
| `accent` | `string` | `"#0071e3"` | Ring, radio dot fill, check icons, button and focus outline colour. |

Default options: Basic / "For trying things out" / "Free" / [1 project, Community support]; Plus / "For people who ship often" / "$12/mo" / [Unlimited projects, Custom domains, Analytics]; Team / "For teams that build together" / "$36/mo" / [Everything in Plus, Shared workspaces, SSO].

## Layout and look

- Root is a `<fieldset>`: full width, max 440px, vertical flex, 16px gap between the card list and the button. A visually hidden `<legend>` reads "Choose a plan".
- Card list: vertical flex, 8px gap.
- Card (a `<label>`): radius 20px, white background with shadow `0 0 0 1px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)`; dark `#2c2c2e` with `0 0 0 1px rgba(255,255,255,.08)`. Pointer cursor.
- Card header row: 62px tall, horizontal padding 18px, 14px gap: radio circle, text column (flex 1, 2px gap), meta.
- Radio circle: 22px round. Unselected: transparent with `inset 0 0 0 1.5px #c7c7cc` (dark `#636366`). Selected: filled with accent, no inset line; background/shadow transition 200ms. Inner white dot 8px.
- Title 16px semibold, tracking −0.01em, `#1d1d1f` / dark `#f5f5f7`. Description 13px, `#86868b` / dark `#98989d`.
- Meta: 15px medium, tabular numbers; `#1d1d1f`/`#f5f5f7` when selected, the grey `#86868b`/`#98989d` otherwise, with a colour transition.
- Features area: wraps chips with 6px gap, padding bottom 16px, left 54px (aligned with the text), right 18px. Chip: fully rounded, bg `#f5f5f7` / dark `#3a3a3c`, text `#1d1d1f` / `#f5f5f7`, 12.5px medium, padding 5px vertical, 7px left, 10px right, 6px gap, leading 12px check icon (`M5 12.5l4.5 4.5L19 7.5`, accent stroke 3, round caps).
- Selection ring: absolutely fills the selected card, radius 20px, non-interactive, shadow `0 0 0 2px accent, 0 14px 30px -14px accent+"88"` (accent at ~53% alpha, a soft coloured drop shadow).
- Button: full width, 50px tall, fully rounded, accent background, white 16px medium text, 5px gap: "Continue with" followed by the plan title in a 22px-tall clipping box.

## Motion

- Shared spring for layout and features: stiffness 420, damping 34.
- Each card has `layout` so the list reflows smoothly as a card grows or shrinks; its header row uses `layout="position"` so text doesn't stretch.
- Ring: one element with a shared `layoutId`, rendered only inside the selected card; it travels between cards with spring stiffness 380, damping 30. Wrap the list in a `LayoutGroup` with a per-instance id (`useId`) so two pickers on a page don't share the ring.
- Inner radio dot scales 0 → 1 on select (and back to 0), spring stiffness 700, damping 18 — a quick pop with a little overshoot. `initial={false}` so it doesn't animate on mount.
- Features: `AnimatePresence initial={false}`; container animates `height 0 → auto` and `opacity 0 → 1` (exit reverse) with the shared spring, `overflow: hidden`. Each chip enters from `opacity 0, y 8, scale 0.9` with the shared spring, delay `0.06 + i × 0.05s`.
- Press: card `whileTap` scale 0.985. Button `whileHover` scale 1.01, `whileTap` scale 0.97, and `layout`.
- Button label roll: `AnimatePresence mode="popLayout" initial={false}` keyed by option id. New title enters from `y 110%, opacity 0, blur(4px)`; old exits to `y −110%, opacity 0, blur(4px)`; spring stiffness 400, damping 30. The 22px box clips it so it reads as a vertical roll.

## Interaction and states

- Each card wraps a visually hidden native `<input type="radio">` sharing one `name` (from `useId`), `checked` bound to state. Clicking anywhere on the card selects it; arrow keys move selection natively within the group.
- On selection: mark touched, set the value, call `onChange(id)`.
- Only the selected card shows the ring, filled dot and features; the others collapse back to 62px.
- The button has no built-in action; it only reflects the current plan.

## Autoplay demo

When `autoplay` is true, every 2400ms the selection steps through option indices in the order 2, 0, 1, repeating (each index taken modulo `options.length`). Any pointer-down inside the fieldset, or choosing an option, marks it touched and the interval clears itself on its next tick. Autoplay does not call `onChange`.

## Accessibility

- Real radio semantics via the native inputs, grouped in a `<fieldset>` with the sr-only legend.
- Keyboard focus shows on the card: when its inner input is `:focus-visible`, the label gets a 2px accent outline offset 4px (`has-[:focus-visible]:outline …`).
- Button is `type="button"` with a 2px accent focus-visible outline offset 4px. Check icons are `aria-hidden`.

## Acceptance checklist

- [ ] Three cards, "Plus" selected by default, its features visible.
- [ ] Clicking another card slides the ring there instead of fading it.
- [ ] The newly selected card grows smoothly; the old one shrinks; the cards below shift without jumping.
- [ ] Feature chips pop in one after another.
- [ ] The radio dot pops in with a slight overshoot.
- [ ] The button label rolls up to the new plan name.
- [ ] Tab into the group and use arrow keys: selection follows and the focus outline is visible.
- [ ] With `autoplay`, it cycles Team → Basic → Plus every 2.4s and stops after a click.
- [ ] Dark mode colours match the values above.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Choosing a different card, by click or by arrow keys in the group, plays `tick` from `@/lib/ui-sounds` (a tiny dry high click) as the ring moves.
- The autoplay cycle is silent, and so is hover and pressing the card that is already selected.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
