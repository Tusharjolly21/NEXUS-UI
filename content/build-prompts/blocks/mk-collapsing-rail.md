# Collapsing Rail

Build an app-shell section: a sidebar that springs between 248px and a 76px icon rail with tooltips, a white active pill that slides between items, a Projects list that folds open with a stagger, a storage card, and a page area whose breadcrumb and title crossfade to wherever you are. In a narrow frame the rail stays put and expands over the content instead. It should feel like a polished productivity app: tactile springs, one accent colour, nothing jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`, `layoutId`).
- Icons are inline 18px SVG paths (stroke 1.9, round caps/joins), no icon library.
- File: `collapsing-rail.tsx`, named export `CollapsingRail`, exported `CollapsingRailProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | — | Overrides the accent CSS variable; unset uses `#0071e3` light / `#0a84ff` dark. |
| `workspace` | `string` | `"Northwind"` | Header name, logo letter (first character, uppercased, fallback "N") and breadcrumb. |
| `defaultActive` | `string` | `"analytics"` | Initial item: a nav id or a project name. |
| `onNavigate` | `(id: string) => void` | — | Called when an item is chosen. |
| `onUpgrade` | `() => void` | — | Called by "Upgrade plan". |
| `autoplay` | `boolean` | `false` | Runs a scripted tour until the visitor touches the section. |
| `className` | `string` | — | Appended to the section. |

## Layout and look

- Section: `w-full px-4 sm:px-5`, vertical padding `clamp(40px, 6vw, 56px)`, background `#f5f5f7` (dark `#000`). Accent variable `--mk-a: #0071e3` (dark `#0a84ff`), or the `accent` prop inline.
- Wrap in a `LayoutGroup` with an id from `useId` so two instances don't share the pill.
- Frame: `relative mx-auto flex h-[560px] max-w-[1040px] overflow-hidden rounded-[28px] bg-white` (dark `#1c1c1e`), shadow `0 0 0 1px rgba(0,0,0,.06), 0 30px 60px -36px rgba(0,0,0,.4)` (dark white/8 ring).
- Sidebar (`aside`, `aria-label="Sidebar"`): width 248 ↔ 76, `flex-none flex-col gap-1 p-3`, `border-r border-black/[.06]` (dark `#3a3a3c`), bg `#f5f5f7` (dark `#2c2c2e`). In narrow mode it is `absolute inset-y-0 left-0 z-30` with a 76px spacer in the layout; when open there it casts `12px 0 40px -12px rgba(0,0,0,.35)`.
- Header (`mb-3 px-1`): 32px logo tile `rounded-[10px]` in the accent, white 13px bold letter; fading workspace name 15px semibold; a 40px collapse button (rounded-lg, panel icon with a left chevron) while expanded. Collapsed: a full-width 40px expand button (panel icon, right chevron) below the header.
- Nav (`aria-label="Main"`, gap 2px): Home, Inbox (badge 4), Analytics, Customers, Settings.
- Item: `h-10 w-full rounded-xl px-3 gap-3`, 14px medium; idle `#6e6e73` (dark `#a1a1a6`), active `#1d1d1f` (dark `#f5f5f7`) with the icon in the accent. Active pill (`layoutId`): `bg-white rounded-xl`, `0 0 0 1px rgba(0,0,0,.06), 0 4px 10px -4px rgba(0,0,0,.15)` (dark `#3a3a3c`, no shadow). Label fades with the rail. Badge: accent pill, `px-1.5`, 11px semibold white; collapsed it becomes an 8px accent dot at `right-2 top-2`.
- Tooltip (collapsed, on hover/focus): `absolute left-[calc(100%+10px)] z-40 rounded-lg px-2.5 py-1.5`, 12px medium, `#1d1d1f` bg / white text (dark inverted), `aria-hidden`.
- Projects (`mt-4`): expanded shows a 40px header button, 12px semibold uppercase, tracking 0.08em, `#86868b` (dark `#8e8e93`), with a 10px chevron rotating 0° / −90°. Collapsed shows a centred 32×1px divider (black/10, dark white/15) and always lists projects. Projects: Website relaunch `#0a84ff`, Mobile app `#30d158`, Brand refresh `#ff9f0a`, each an item whose icon is an 8px coloured dot.
- Storage card (expanded only, `mt-auto rounded-2xl bg-white p-3.5`, 1px black/5 ring; dark `#1c1c1e`): "Storage" semibold and "7.2 of 10 GB" muted (12px), a 6px track (`#f0f0f3` / `#3a3a3c`) with an accent fill to 72%, and an accent 12px semibold "Upgrade plan" button (min-height 40px).
- Main (`p-5 sm:p-8`, gap 20px): breadcrumb `{workspace} / {current}` 13px `#86868b`, title `clamp(22px, 3vw, 28px)` semibold, tracking −0.03em; then a `2 → 3` column grid (sm) of six placeholder cards `rounded-2xl bg-[#f5f5f7] p-4` (dark `#2c2c2e`) with two skeleton bars (`h-2`, widths 1/2 and 3/4, `#e0e0e5`/`#e8e8ed`; dark `#48484a`/`#3a3a3c`), all `aria-hidden`.
- Responsive: a ResizeObserver on the frame marks it narrow under 600px. Entering narrow collapses the rail; leaving it expands it again.

## Motion

- Rail width: spring stiffness 300, damping 32.
- Active pill: spring stiffness 500, damping 36.
- Labels, tooltip: `opacity 0, x −6` (tooltip `x −4`) ↔ rest; workspace name fades.
- Projects list: `height 0 → auto`, `opacity 0 → 1`, spring 320/32; each project from `opacity 0, x −8`, delay `i × 0.05`. Chevron rotates with the default spring.
- Storage card: from `opacity 0, y 10`; bar `width 0 → 72%` over 1.2s, ease `[0.16, 1, 0.3, 1]`.
- Scrim (narrow + open): a button `absolute inset-0 z-20 bg-black/20` (dark `/50`), fades.
- Page header: `AnimatePresence mode="popLayout" initial={false}` keyed by item; in from `opacity 0, y 10, blur(6px)`, out to `y −10, blur(6px)`, spring 300/30 with blur 0.35s. Cards re-key per item and pop in from `opacity 0, scale 0.96`, delay `i × 0.04`; the grid has `layout`.

## Interaction and states

- Choosing an item sets it active, calls `onNavigate`, and in narrow mode closes the overlay.
- The scrim (`aria-label="Close sidebar"`, `tabIndex -1`) and Escape close the overlay.
- Projects header toggles the list (`aria-expanded`).
- Any pointerdown or keydown in the section marks it touched (stops autoplay).

## Autoplay demo

While `autoplay`, untouched, and reduced motion is off, every 1.9s run the next step of: go inbox → go customers → fold → go settings → go "Mobile app" → unfold → go "Brand refresh" → go analytics, looping. Fold steps are skipped in a narrow frame.

## Accessibility

- Items are buttons with `aria-current="page"` when active and `aria-label` = label while collapsed; badges include a screen-reader-only " unread".
- Collapse/Expand buttons have `aria-label`s; Expand has `aria-expanded={false}`.
- Focus ring: `ring-2` in the accent on every control. Icons, dots, tooltips and skeletons are `aria-hidden`.
- Autoplay never runs with reduced motion and stops at first interaction.

## Acceptance checklist

- [ ] The rail springs between 248px and 76px; labels and the storage card fade out.
- [ ] Hovering or focusing a collapsed item shows a dark tooltip to its right.
- [ ] The white active pill slides between nav items and projects.
- [ ] Inbox's 4 badge becomes an accent dot when collapsed.
- [ ] Projects fold open with a staggered entrance; collapsed, they always show as dots.
- [ ] Breadcrumb and title crossfade with a blur; cards pop in again on every change.
- [ ] Under 600px frame width the rail overlays the content with a scrim; Escape closes it.
- [ ] `workspace` updates the logo letter, header and breadcrumb.
- [ ] `accent` recolours logo, badges, icons, storage bar and focus rings.
- [ ] With `autoplay` the tour loops every 1.9s and stops on first touch.
