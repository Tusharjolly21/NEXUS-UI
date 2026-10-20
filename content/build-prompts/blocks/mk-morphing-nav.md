# Morphing Nav

Build a floating, pill-shaped site navigation bar whose single dropdown panel morphs between menus: move across the items and the panel resizes, a caret slides under the active item, and the panel content slides in from the side you came from. Below ~768px of container width it collapses to a menu button that opens an accordion sheet. It should feel calm and Apple-like: soft glass, springy, never jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries via `@container` and `@sm:` / `@md:` / `@3xl:` variants), framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useSpring`, `useTransform`, `useReducedMotion`), and a `cn` class-merging helper.
- File: `components/morphing-nav/morphing-nav.tsx`, named export `MorphingNav`; also export the types `MorphingNavProps`, `MorphingNavMenu` and `MorphingNavLink`.
- Data types: `MorphingNavLink = { title; desc; icon /* SVG path in a 24×24 box */; color /* icon tile tint */ }`. `MorphingNavMenu = { label; width; height /* panel size in px on wide screens */; links?: MorphingNavLink[]; feature?: { title; body } }`. A menu without `links` renders as a plain link.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Lumen"` | Wordmark beside the logo tile. |
| `accent` | `string` | `"#0071e3"` | Logo gradient, Get started button, focus rings, feature card. |
| `accentDark` | `string` | — | Dark-mode accent. If omitted: `#0a84ff` when `accent` is the default, otherwise `accent`. |
| `menus` | `MorphingNavMenu[]` | Product, Solutions, Resources, Pricing | Top-level items. |
| `autoplay` | `boolean` | `true` | Cycles the menus until the visitor interacts. |
| `onNavigate` | `(label: string) => void` | — | Called with the label of any link or button chosen. Links are placeholders (`href="#"`, `preventDefault`). |
| `className` | `string` | — | Extra classes on the root. |

Default menus:
- Product (560×248): Analytics "See what moves your numbers" `#0071e3`; Automations "Workflows that run themselves" `#ff9f0a`; Docs "Write, share and comment" `#30d158`; Security "SSO, audit logs, roles" `#bf5af2`; feature `{ "New in 4.0", "Live dashboards that update as your data changes." }`.
- Solutions (420×212): Startups "Launch with less setup" `#ff375f`; Enterprise "Scale with control" `#0071e3`; Agencies "One login, every client" `#30d158`.
- Resources (480×212): Guides "From setup to scale" `#ff9f0a`; Changelog "Shipped every week" `#bf5af2`; Community "40k builders, one forum" `#0071e3`.
- Pricing (0×0, no links).
Pick simple stroke icons (bar chart, bolt, document, shield, rocket, building, people, book, clock, chat bubble).

## Layout and look

- Set CSS variables on the root: `--mk-accent` = accent, `--mk-accent-dark` = resolved dark accent. Every accent use is `var(--mk-accent)` with a `dark:` variant using `var(--mk-accent-dark)`.
- Root: `@container`, relative, full width, bg `#fbfbfd` / dark `black`, padding 16px sides, 24px top, 40px bottom; at `@3xl` bottom padding 288px so the open panel has room.
- Bar: max-width 1080px, centred, 64px tall, fully rounded, flex space-between, gap 8px, padding 12px (20px left). bg `white/80` / dark `#1c1c1e/80`, `backdrop-blur-xl`. Shadow `0 0 0 1px rgba(0,0,0,.06), 0 12px 30px -18px rgba(0,0,0,.3)`; dark `0 0 0 1px #3a3a3c, 0 12px 30px -18px rgba(0,0,0,.8)`.
- Brand link: min-height 40px, 18px semibold, tracking −0.03em, `#1d1d1f` / `#f5f5f7`, truncates. Logo tile 24×24, radius 8px, `conic-gradient(from 0deg, var(--mk-accent), #5ac8fa, var(--mk-accent))`.
- Desktop items (hidden below `@3xl`): 40px tall pills, padding 0 16px, 14px medium, `#424245` / `#d1d1d6`, 4px gap to a 10px chevron (`M6 9l6 6 6-6`, stroke 3). Active item gets a highlight pill `black/5` / `white/10`.
- Right side: "Sign in" text link (40px, 14px medium, shown from `@md`), "Get started" pill (40px, padding 16px, 20px from `@sm`, 14px medium white on accent), and a 40×40 menu button (hidden from `@3xl`).
- Panel surface: white / `#1c1c1e`, radius 22px, shadow `0 0 0 1px rgba(0,0,0,.06), 0 30px 60px -24px rgba(0,0,0,.35)`; dark `0 0 0 1px #3a3a3c, 0 30px 60px -24px rgba(0,0,0,.9)`. Positioned `absolute`, 12px under the bar, `left: 0` plus an x offset; hidden below `@3xl`.
- Caret: 12×12 square rotated 45°, radius 2px, same fill as the panel, top −6px, shadow `-1px -1px 0 rgba(0,0,0,.06)` / dark `#3a3a3c`.
- Panel content: padding 12px, width = menu width. Links in a grid, 2 columns when more than 3 links, gap 4px. Each link: radius 16px, padding 10px, 12px gap, hover/focus bg `#f5f5f7` / `#2c2c2e`. Icon tile 40×40 radius 12px, background the link colour at 8% (20% in dark) via `color-mix`, icon 18px in the link colour, stroke 2. Title 14px semibold `#1d1d1f` / `#f5f5f7`; desc 12.5px `#6e6e73` / `#a1a1a6`.
- Feature card (if present): margin 0 12px 12px, radius 16px, padding 16px, `linear-gradient(120deg, accent 8%, rgba(90,200,250,.12))` (dark: accent 18%, `rgba(90,200,250,.1)`). Title 12px semibold accent, body 14px medium; a "Learn more →" 13px accent link on the right.
- Mobile sheet: below the bar, 12px margin, max-width 1080px, radius 24px, padding 8px, panel surface. Rows min-height 48px, padding 12px 16px, 18px semibold, tracking −0.02em, a `›` on the right (`#86868b` / `#a1a1a6`). Sign in row (16px medium) under a hairline, only below `@md`.

## Motion

- Base spring: stiffness 380, damping 32.
- Panel and caret position: two `useSpring` motion values (`panelX`, `caretX`) with the base spring. Caret left = `caretX − panelX − 6`. On every active change, measure the active button and the bar: `cx` = button centre relative to bar; panel width `w = min(menu.width, bar width)`; `panelX = clamp(cx − w/2, 0, barWidth − w)`. The first open jumps (no animation); later changes spring. Re-measure on window resize.
- Panel enter/exit: `opacity 0, y 8, scale 0.97` ↔ rest, base spring, `transform-origin: top center`.
- Panel size: animate `width`/`height` to the menu's size, spring 380/34.
- Content swap: `AnimatePresence mode="popLayout" initial={false}` keyed by the active index, with direction `dir` (+1 moving right, −1 left, 0 first open). Enter from `x: dir × 80, opacity 0`, exit to `x: dir × −80, opacity 0`, spring 380/34.
- Links stagger in: `opacity 0, y 6` → rest, delay `0.04 × i`.
- Highlight pill: shared `layoutId` inside a `LayoutGroup`, spring 500/38. Chevron rotates 180° when open.
- Logo tile rotates 360° every 8s, linear, infinite (off under reduced motion).
- Get started: `whileHover` scale 1.04, `whileTap` 0.96.
- Menu icon morphs its two paths: `M4 8h16` → `M6 6L18 18` and `M4 16h16` → `M6 18L18 6`.
- Sheet: `opacity 0, y −10, scale 0.98` ↔ rest, base spring. Rows slide from `x −10`, delay `i × 0.05`. Accordion lists animate `height 0 ↔ auto` with opacity, spring 380/36; the `›` rotates 90° when expanded.

## Interaction and states

- Mouse enter on an item opens its menu (or closes the panel for a link-less item). Leaving the whole root with a mouse closes after 120ms; entering the panel cancels that.
- Click toggles a menu; a link-less item calls `onNavigate` and closes. Keyboard focus moves an already-open panel to the focused item; focus caused by a pointer is ignored (track a pointer-down flag).
- Any pick calls `onNavigate(label)`, closes the panel and the sheet.
- Pointer down outside the root closes everything; Escape closes everything and returns focus to the active item if focus was inside.
- Clear the hide timer on unmount.

## Autoplay demo

With `autoplay` (and no reduced motion), every 1500ms step through the menus that have links, then one "closed" step, and repeat. Pointer enter, focus or any click inside marks the nav as touched and stops the cycle for good.

## Accessibility

- Desktop items are real buttons in `<nav aria-label="Main">`, with `aria-expanded` on menus and `aria-controls` pointing at the panel id while open (ids from `useId`).
- Menu button has `aria-label` "Open menu"/"Close menu", `aria-expanded`, `aria-controls` = sheet id. Accordion rows carry `aria-expanded`.
- All decorative SVGs `aria-hidden`. Visible focus rings in the accent on every control.

## Acceptance checklist

- [ ] A 64px rounded glass bar with brand, four items, Sign in and Get started at desktop width.
- [ ] Hovering Product then Solutions resizes the panel 560×248 → 420×212 with a spring, not a cut.
- [ ] The caret stays under the hovered item and the panel never overflows the bar.
- [ ] Content slides in from the right when moving right and from the left when moving left.
- [ ] Hovering Pricing closes the panel; clicking it calls `onNavigate("Pricing")`.
- [ ] Escape and outside clicks close the panel; Escape returns focus to the item.
- [ ] Under 768px container width a menu button opens a sheet with expandable sections.
- [ ] Autoplay cycles menus every 1.5s and stops on first interaction.
- [ ] Changing `accent` recolours the logo, button, focus rings and feature card; dark mode uses `accentDark`.
- [ ] Reduced motion stops the logo spin and the autoplay cycle.
