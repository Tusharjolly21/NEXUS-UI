# Morph Menu

Build a pill-shaped navigation bar with a mega menu whose single panel reshapes itself. Move between the menu labels and the one panel stretches to the new content's size while that content slides in from the side you moved toward; a small caret glides under the active label. Leaving the menu closes it after a short grace period. It should feel Apple-light, springy and calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `useSound` from `@/lib/ui-sounds`, and a `cn` helper.
- File: `components/blocks/morph-menu.tsx`, named export `MorphMenu`, types `MorphMenuProps`, `MorphMenuSection`, `MorphMenuEntry` and `MorphMenuFeature`, and the demo constant `DEFAULT_MORPH_MENU_SECTIONS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `sections` | `MorphMenuSection[]` | 3 demo sections | One panel per label: `{ label, width, columns?, entries, feature? }`. Use a stable array. |
| `mark` | `string` | `"N"` | Letter(s) in the logo chip. |
| `ctaLabel` | `string` | `"Get started"` | Call-to-action on the right (hidden below 640px viewport width). |
| `autoplay` | `boolean` | `false` | Opens the menus one after another until the visitor interacts. |
| `enableSound` | `boolean` | `true` | Soft tap when an entry or the call-to-action is chosen. Follows the site-wide sound switch. |
| `onSelect` | `(section: string, entry: string) => void` | none | Called when a panel entry is chosen. |
| `onCta` | `() => void` | none | Called when the call-to-action is pressed. |
| `className` | `string` | none | Extra classes on the section. |

`MorphMenuEntry` is `{ title, desc, color, colorDark?, href? }` (`color` is the tile background, any CSS background; `href` left as `"#"` makes the entry a non-navigating placeholder). `MorphMenuSection.columns` is 1 or 2; `feature` is `{ eyebrow, title, href? }`, a dark card beside the entries that is hidden below 640px.

Demo sections:
- Product (width 520, 2 columns): Components "Over a hundred, one file each." (gradient `#0a84ff` to `#5e5ce6`), Blocks "Whole sections, ready to drop in." (`#30d158` to `#0a84ff`), Templates "Complete sites you can ship today." (`#ff9f0a` to `#ff375f`), Tune panel "Change springs live, copy the result." (`#bf5af2` to `#ff375f`). All gradients at 135deg.
- Solutions (width 300, 1 column): For startups "Launch a site that looks funded." (`#eef5ff`, dark `#12263f`), For agencies "Ship client work faster." (`#f3ecff`, dark `#271a3d`), For product teams "Motion your design system can own." (`#e9f9ee`, dark `#0f2b1a`).
- Resources (width 440, 1 column + feature): Docs "Install and customise." and Changelog "What's new this week." (both `#f5f5f7`, dark `#2c2c2e`); feature card eyebrow "Guide", title "Motion that earns its place".

## Layout and look

- Root: full width, `min-height: 360px`, flex, content centred horizontally, 12px side padding, 16px top padding, background `#fbfbfd` / dark `#000`.
- Inner wrapper: `position: relative; height: fit-content; max-width: 100%`. It holds the bar, the caret and the panel.
- Bar (`<nav aria-label="Main">`): a pill, flex, centred, 4px gap, 6px padding, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 12px 28px -18px rgba(0,0,0,.35)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 12px 28px -18px rgba(0,0,0,.9)`).
- Logo chip: 32px circle, left margin 6px, right margin 8px, 13px bold letter, `#1d1d1f` with white letter (dark: `#f5f5f7` with `#1d1d1f` letter).
- Labels: 36px tall buttons, fully rounded, 13.5px medium, 10px side padding (12px from 640px up), 4px gap to a 10px chevron (stroke 3, round caps) that rotates 180deg when open. Inactive `#6e6e73` -> hover `#1d1d1f` (dark `#a1a1a6` -> `#f5f5f7`); open: background `#f5f5f7` and ink `#1d1d1f` (dark `#2c2c2e` and `#f5f5f7`).
- Call-to-action: 36px tall, fully rounded, `#0071e3`, white 13px medium, 16px side padding, 4px left margin, shown from 640px viewport width.
- Caret: 12px square, 2px radius, rotated 45deg, positioned 5px below the bar (`top: calc(100% + 5px)`), z 20, white / dark `#1c1c1e`, shadow `-1px -1px 0 rgba(0,0,0,.07)` (dark `rgba(255,255,255,.1)`). Its `left` is the active label's centre minus 6px.
- Panel: absolutely positioned, `left: 50%`, translated `-50%`, 10px below the bar, z 10. Surface: 18px radius, 8px padding, white / dark `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 50px -20px rgba(0,0,0,.35)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -20px rgba(0,0,0,.9)`), `overflow: hidden`. The body is `width: section.width`, `max-width: calc(100vw - 48px)`.
- Entry: flex, 12px gap, 12px radius, 10px padding, hover/focus background `#f5f5f7` (dark `#2c2c2e`). A 32px tile with 9px radius sits 2px down; beside it the title (14px semibold, `#1d1d1f` / `#f5f5f7`) over the description (12.5px, line-height 1.4, `#6e6e73` / `#a1a1a6`). Two-column sections use one column below 640px.
- Feature card: 170px wide, flex-none, content aligned to the bottom, 14px radius, 12px padding, white text, background `linear-gradient(160deg, #1d1d1f, #3a3a5e)`, plus a 1px `rgba(255,255,255,.1)` ring in dark mode; eyebrow 11px uppercase with 0.14em tracking in `rgba(255,255,255,.6)`, title 14px semibold with tight leading.

## Motion

- Panel enter/exit: opacity 0 -> 1, y -6 -> 0, scale 0.97 -> 1 with a spring `{ stiffness: 420, damping: 32 }`; exit takes 0.15s.
- Size: the surface uses `layout` with a spring `{ stiffness: 380, damping: 34 }`, so it stretches to the new content's size.
- Content swap: `AnimatePresence mode="popLayout"` keyed by the open index, with `custom = dir` (+1 moving right, -1 moving left, 0 on first open). Enter from `x = dir * 60` and opacity 0, exit to `x = dir * -60` and opacity 0, spring `{ stiffness: 380, damping: 34 }` with opacity at 0.15s.
- Caret: fades in at the active label and animates `left` with the 420/32 spring as the active label changes.
- Chevron rotates with the default transition.
- Closing: leaving the wrapper with a mouse schedules a close after 180ms; entering the wrapper or the panel cancels it. The timer is cleared on unmount.

## Interaction and states

- Mouse: hovering a label opens its panel (mouse only, so a touch tap does not open and then immediately close it); clicking a label toggles it. Touch: tap toggles.
- Keyboard: Enter, Space or Down on a label opens its panel and moves focus to the first entry; Left and Right move focus between labels (and the open panel follows); Escape closes and returns focus to the label; Tab out of the menu closes it. A press outside also closes it.
- Choosing an entry (or the call-to-action) calls `onSelect` / `onCta` and closes the panel. Entries with the default `href` of `"#"` do not navigate.
- Only one panel is open at a time; `aria-expanded` and `aria-controls` mirror the state.

## Autoplay demo

With `autoplay`, once the component is on screen and the tab is visible, every 1300ms it steps through the sections (opening Product, Solutions, Resources) and then rests closed for two beats, looping. The first real interaction (pointer entering the menu, focus or a click) stops it for good. It never runs under reduced motion and pauses off screen or in a hidden tab. The preview sets `autoplay`.

## Accessibility

- Labels are real buttons with `aria-expanded`; entries are real links; the panel is a `role="group"` named by its section label; logo chip and caret are `aria-hidden`.
- 2px focus outline offset 2px, `#0071e3` (dark `#0a84ff`), on every control; Escape closes; no keyboard traps.
- Reduced motion (`useReducedMotion`): the panel, caret and content swap become plain fades (no slide or scale), the size change is instant, and autoplay is off.
- Text contrast is at least 4.5:1 in both themes.

## Sound

- Prop `enableSound?: boolean` (default `true`).
- Choosing a panel entry or pressing the call-to-action plays `tap` from `@/lib/ui-sounds` at volume 0.5 (a soft click). Hovering, opening, moving between menus (mouse or keyboard) and autoplay are silent, so autoplay uses no `play.auto` calls.
- The sound follows the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: it is Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] Hovering Product, Solutions and Resources in turn: one panel stretches between sizes and its content slides in from the direction you moved; the caret glides under the label.
- [ ] Leaving the menu closes it after a short pause; moving onto the panel keeps it open.
- [ ] A tap on touch toggles a menu and does not flicker.
- [ ] Keyboard: Enter/Down opens and focuses the first entry, arrows move along the bar, Escape closes and restores focus, Tab out closes.
- [ ] Choosing an entry closes the menu and plays one soft tap.
- [ ] Autoplay cycles the menus until the first interaction, stops off screen and under reduced motion.
- [ ] Dark mode swaps the bar, labels, panel, tiles and caret to the dark palette.
- [ ] At 360px wide the bar and panel stay inside the screen.
