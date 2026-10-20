# Collapsible Sidebar

Build an app shell whose frosted sidebar folds from 248px down to a 64px icon rail on a spring. Labels blur out quickly on collapse and fade back a beat late on expand, section titles turn into short hairlines, and unread badges become dots on the icons. A blue selection pill glides between rows and the toolbar title swaps with a blur. In a narrow frame it becomes a slide-over drawer. It should feel native and calm, like a macOS sidebar.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (`@container` / `@md:`), framer-motion (`motion`, `AnimatePresence`, `MotionConfig`, `useReducedMotion`, `layoutId`), lucide-react icons.
- File: `collapsible-sidebar.tsx`, default export `CollapsibleSidebar`, exported type `CollapsibleSidebarProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `defaultCollapsed` | `boolean` | `false` | Start folded to the icon rail. |
| `className` | `string` | — | Merged onto the 560px frame. |

## Layout and look

- Wrap in `<MotionConfig reducedMotion="user">`.
- Frame: `relative flex h-[560px] w-full overflow-hidden rounded-[22px]`, `#f5f5f7` (dark `#000`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark white/8 ring).
- Sidebar (`aside`, `aria-label="Sidebar"`): width animates between 248 (expanded) and 64 (collapsed); `overflow-hidden rounded-[18px] bg-white/70 backdrop-blur-2xl backdrop-saturate-150` (dark `#1c1c1e`/75). Wide: `relative my-2 ml-2` with `0 0 0 .5px rgba(0,0,0,.08), 0 8px 24px -14px rgba(0,0,0,.18)`. Compact: `absolute inset-y-2 left-2 z-30` with a deeper `0 24px 48px -20px rgba(0,0,0,.35)` shadow.
- Header `pl-[18px] pr-3 pt-3.5 pb-2`, gap 10px: 28px "N" tile (`#1d1d1f`, white 12px semibold, `rounded-[8px]`; dark inverted), then "Nexus Labs" 14px semibold in a fading label (`whitespace-nowrap`). Compact only: 28px round close button with X.
- Nav (`aria-label="Main"`): `px-2.5 pb-2`, vertical scroll, no horizontal overflow, hidden scrollbar. Sections `mt-1` then `mt-3`.
- Section header: 24px tall row, `px-2.5`; title 11px semibold `#86868b` (dark `#98989d`) as a fading label; plus an absolutely placed 16×1px hairline at `left: 14px`, vertically centred, `black/12` (dark white/16) that appears when collapsed.
- Row: `h-7 w-full rounded-[10px] pl-[14px] pr-2.5 gap-2.5 overflow-hidden`, 13px medium. The 14px left padding keeps icons fixed in place so they line up in the 64px rail. Icon 16px, stroke 1.75, `#0071e3` (dark `#2997ff`). Label and badge (12px tabular `#86868b`) are fading labels. When collapsed and the item has a badge, an 8px dot shows at the icon's top-right (`-right-1 -top-1`), `#0071e3` with a 2px white ring (dark `#2997ff`, ring `#1c1c1e`; on a selected row white with a `#0071e3` ring).
- Selected: white text and icon, `layoutId` pill `bg-[#0071e3] rounded-[10px]` with `0 1px 2px rgba(0,0,0,.12), inset 0 .5px 0 rgba(255,255,255,.2)`.
- Footer: `border-t` black/6 (dark white/8), `p-2`; account button with 32px monogram "AM" (grey gradient), fading name/email block ("Alex Morgan", "alex@nexuslabs.io") and a fading `ChevronsUpDown`.
- Main: header `h-12 px-4` with a 32px round `PanelLeft` (18px) toggle, then the swapping title (15px semibold). Below, the same analytics dashboard canvas as the other sidebars (see Demo data).
- Responsive: a ResizeObserver on the frame flips to compact under 640px. In compact mode collapse is ignored and the sidebar is a full-width (248px) drawer.

## Motion

- Width and drawer `x`: spring stiffness 260, damping 30. The drawer hides at `x = −(248 + 24)`. Use `{ duration: 0 }` until one rAF after the first measurement.
- Fading labels: animate `opacity` 1↔0 and `filter` `blur(0px)` ↔ `blur(4px)` (no blur with reduced motion). Collapse: 0.12s, ease `[0.4, 0, 1, 1]`. Expand: 0.28s, delay 0.08s, ease `[0, 0, 0.2, 1]`.
- Hairline: `opacity 0 → 1`, `scaleX 0.3 → 1`; badge dot `opacity 0 → 1`, `scale 0.4 → 1`; both spring 420/34.
- Selection pill: spring 500/32, mass 0.9. Row tap `scale 0.97`; toggle and close `0.92`; account `0.98`.
- Title swap: `popLayout`, in from `y 100%, blur(6px)`, out to `y −100%, blur(6px)`, spring 420/34.
- Scrim: opacity 0.2s. Dashboard bars: `scaleY 0 → 1` on first view, spring 260/30, stagger 0.03s.

## Interaction and states

- Toggle button: wide → flips collapsed (`aria-label` "Collapse sidebar"/"Expand sidebar", `aria-expanded` = not collapsed); compact → opens the drawer ("Show sidebar", `aria-expanded` = open).
- When collapsed, rows and the account button get a native `title` tooltip with their label.
- Selecting a row updates the title and closes the drawer. Escape on the frame, the scrim, or X closes the drawer. Hidden drawer is `inert`.
- Initial selection: Home. Initial collapsed state from `defaultCollapsed`.

## Demo data

- Workspace: Home (active), Inbox ("4"), Dashboard, Analytics, Projects, Team, Calendar, Starred, Settings. Resources: Documentation, API reference, Changelog, Support, Sponsor. Icons: Home, Inbox, LayoutDashboard, BarChart2, Zap, Users, Calendar, Star, Settings, BookOpen, Code2, FileText, LifeBuoy, CircleDollarSign.
- Dashboard (`@container`, `px-4 pb-4`, gap 12px): "Tuesday, 14 October" / "Good morning, Alex" (22px semibold) / "Last 12 months" chip; stat cards Revenue $48,295 +12.4%, Active users 3,842 +4.1%, Conversion 5.27% −0.3% (green `#34c759` / red `#ff3b30` trend icons); "Monthly revenue" bars 38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81 with "$81k in December" (last bar `#0071e3`); "Top pages" /pricing 38%, / 27%, /docs/install 16%, /changelog 9% (from `@md`); "Recent sign-ups" Maya Chen (Team plan), Jonas Weber (Pro trial), Ines Duarte (Team plan, from `@md`). Cards `rounded-[18px]` white with a 1px black/5 ring (dark `#1c1c1e`, white/8).

## Accessibility

- Rows: buttons with `aria-current="page"` when selected; badges include a screen-reader-only " unread" (the collapsed dot is `aria-hidden`).
- Labels stay in the DOM when collapsed (only visually faded), so screen readers still read them.
- Focus ring: 2px outline, 2px offset, `#0071e3`. Icons, hairlines and the scrim are `aria-hidden`.
- Reduced motion: no blur on labels or title; transitions resolve quickly via `MotionConfig`.

## Acceptance checklist

- [ ] The PanelLeft button folds the sidebar to a 64px rail and back on a spring.
- [ ] Icons stay perfectly still while the width changes.
- [ ] Labels blur out fast on collapse and fade in slightly late on expand.
- [ ] Section titles become short hairlines when collapsed.
- [ ] Inbox's "4" becomes a small dot on its icon when collapsed.
- [ ] Hovering a collapsed row shows its label as a tooltip.
- [ ] The blue pill slides between rows; the title swaps with a blur.
- [ ] `defaultCollapsed` starts it folded with no animation on mount.
- [ ] Under 640px frame width it becomes a drawer with scrim, X and Escape to close.
- [ ] Dark mode swaps all surfaces and rings.
