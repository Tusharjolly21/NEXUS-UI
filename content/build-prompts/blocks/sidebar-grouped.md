# Grouped Sidebar

Build an app shell with a frosted sidebar whose navigation is split into a few top-level rows and three disclosure groups (Platform, Workspace, Team) that open and close with a spring, their chevrons rotating. The whole sidebar also folds to a 64px icon rail, at which point every group shows its icons and the group headers become hairlines. A blue selection pill glides between rows and the toolbar title swaps with a blur. It should feel like a native, well-organised workspace sidebar.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (`@container` / `@md:`), framer-motion (`motion`, `AnimatePresence`, `MotionConfig`, `useReducedMotion`, `layoutId`), lucide-react icons.
- File: `grouped-sidebar.tsx`, default export `GroupedSidebar`, exported type `GroupedSidebarProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `defaultCollapsed` | `boolean` | `false` | Start folded to the icon rail. |
| `defaultOpenGroups` | `string[]` | `["platform"]` | Group ids disclosed on mount (`"platform"`, `"workspace"`, `"team"`). |
| `className` | `string` | — | Merged onto the 560px frame. |

## Layout and look

- Wrap in `<MotionConfig reducedMotion="user">`.
- Frame: `relative flex h-[560px] w-full overflow-hidden rounded-[22px]`, `#f5f5f7` (dark `#000`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark white/8 ring).
- Sidebar: width animates 256 ↔ 64; `rounded-[18px] bg-white/70 backdrop-blur-2xl backdrop-saturate-150` (dark `#1c1c1e`/75), `overflow-hidden`. Wide: `relative my-2 ml-2` with a soft `0 8px 24px -14px rgba(0,0,0,.18)` shadow and .5px ring. Compact: `absolute inset-y-2 left-2 z-30` drawer with `0 24px 48px -20px rgba(0,0,0,.35)`.
- Header `pl-[18px] pr-3 pt-3.5 pb-2`: 28px "N" tile (`#1d1d1f`, white text, `rounded-[8px]`; dark inverted) and fading "Nexus Labs" 14px semibold; compact adds a 28px X close button.
- Nav (`aria-label="Main"`): `px-2.5 pb-2`, vertical scroll only, hidden scrollbar.
  - Top rows (`mt-1`, 1px gaps): Home, Inbox ("6"), Notifications ("2").
  - Each group `mt-3`: a header button 24px tall, `rounded-[8px] px-2.5`, 11px semibold `#86868b` (hover `#1d1d1f`; dark `#98989d` / hover `#f5f5f7`), with the fading group label, a fading 16px chevron box (`ChevronDown` 14px, stroke 2) and an absolutely placed 16×1px hairline at `left: 14px` (black/12, dark white/16) that shows when collapsed.
  - Group children: a `ul` (`flex flex-col gap-px overflow-hidden`) inside `AnimatePresence initial={false}`.
- Row: `h-7 w-full rounded-[10px] pl-[14px] pr-2.5 gap-2.5 overflow-hidden`, 13px medium, idle text `#1d1d1f`, hover black/4 (dark white/6). Icon 16px stroke 1.75 `#0071e3` (dark `#2997ff`). Fading label (`whitespace-nowrap`) and badge (12px tabular `#86868b`). Collapsed + badge: 8px dot at the icon's top-right with a 2px ring (white / `#1c1c1e`; on the selected row white with a `#0071e3` ring).
- Selected: white text/icon over a `layoutId` pill `bg-[#0071e3] rounded-[10px]`, shadow `0 1px 2px rgba(0,0,0,.12), inset 0 .5px 0 rgba(255,255,255,.2)`.
- Footer `border-t` (black/6, dark white/8) `p-2`: account button with 32px "AM" monogram (grey gradient), fading "Alex Morgan" / "alex@nexuslabs.io" and fading `ChevronsUpDown`.
- Main: header `h-12 px-4`, 32px round `PanelLeft` toggle, swapping title (15px semibold, 24px clipped box); below it the analytics dashboard (see Demo data).
- Responsive: a ResizeObserver on the frame switches to compact (drawer) under 640px; collapse is ignored there.

## Motion

- Sidebar width and drawer `x` (hidden at `−(256 + 24)`): spring stiffness 260, damping 30; `{ duration: 0 }` until one rAF after the first measurement.
- Group disclosure: children `height 0 → auto`, `opacity 0 → 1` (height spring stiffness 380, damping 36; opacity 0.2s); exit reverses. Chevron rotates `0°` (open) ↔ `−90°` (closed) with the same 380/36 spring.
- Fading labels: opacity and `blur(4px)` (no blur with reduced motion). Collapse 0.12s ease `[0.4, 0, 1, 1]`; expand 0.28s, delay 0.08s, ease `[0, 0, 0.2, 1]`.
- Hairline `opacity`/`scaleX 0.3 → 1` and badge dot `opacity`/`scale 0.4 → 1`: spring 420/34.
- Selection pill: spring 500/32, mass 0.9. Row tap `scale 0.97`; toggle/close `0.92`; account `0.98`.
- Title swap: `AnimatePresence mode="popLayout"`, in from `y 100%, blur(6px)`, out to `y −100%, blur(6px)`, spring 420/34.
- Dashboard bars grow `scaleY 0 → 1` on first view, spring 260/30, stagger 0.03s.

## Interaction and states

- Group header toggles that group's id in a `Set` (multiple groups may be open). `aria-expanded` and `aria-controls` (via `useId`) on the header.
- When the sidebar is collapsed every group shows its children, the header buttons are `disabled` and `tabIndex={-1}`, and rows get a native `title` tooltip.
- PanelLeft: wide → toggle collapsed ("Collapse sidebar"/"Expand sidebar"); compact → open the drawer ("Show sidebar").
- Selecting any row sets the title and closes the drawer. Escape, scrim or X close it; the hidden drawer is `inert`.
- Initial selection: Analytics.

## Demo data

- Top: Home (Home icon), Inbox "6" (Inbox), Notifications "2" (Bell).
- Platform: Dashboard (LayoutDashboard), Analytics (BarChart2, active), Reports (Table2), Automation (Zap).
- Workspace: Projects (FileText), Calendar (Calendar), Archives (Archive), Documents (BookOpen).
- Team: Members (UserSquare2), Roles and permissions (Shield), Support (LifeBuoy), Billing (CreditCard).
- Dashboard (`@container`, `px-4 pb-4`, gap 12px): "Tuesday, 14 October", "Good morning, Alex", "Last 12 months" chip; stats Revenue $48,295 +12.4%, Active users 3,842 +4.1%, Conversion 5.27% −0.3%; "Monthly revenue" bars 38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81 ("$81k in December", last bar `#0071e3`); "Top pages" /pricing 38%, / 27%, /docs/install 16%, /changelog 9% (from `@md`); "Recent sign-ups" Maya Chen, Jonas Weber, Ines Duarte. Cards `rounded-[18px]` white, 1px black/5 ring (dark `#1c1c1e`, white/8).

## Accessibility

- Rows are buttons with `aria-current="page"` when selected; badges add a screen-reader-only " unread".
- Group headers are real buttons with `aria-expanded`/`aria-controls`.
- Focus ring: 2px outline, 2px offset, `#0071e3`. Decorative icons, dots, hairlines and the scrim are `aria-hidden`.
- Reduced motion: labels and title fade without blur.

## Acceptance checklist

- [ ] Platform starts open with Analytics selected; Workspace and Team start closed.
- [ ] Clicking a group header opens/closes it with a height spring and a rotating chevron.
- [ ] Several groups can be open at once.
- [ ] Collapsing to 64px shows every group's icons and turns headers into hairlines.
- [ ] Badges on Inbox and Notifications become dots in the rail.
- [ ] The blue pill slides between rows across groups.
- [ ] The title swaps with a blur on each selection.
- [ ] `defaultCollapsed` and `defaultOpenGroups` set the starting state without animating.
- [ ] Under 640px frame width it becomes a drawer closable by scrim, X or Escape.
- [ ] Dark mode swaps all surfaces and rings.
