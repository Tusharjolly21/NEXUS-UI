# Workbench Sidebar

Build the sidebar section of an app shell: a white rounded panel with a workspace switcher, a search that filters the list as you type, main navigation with a grey highlight that springs between rows, a projects list, a usage meter card and the signed-in user with a collapse button. Collapsing springs the width down to a 64px icon rail while the labels slide and blur out; expanding brings them back one row at a time so the column ripples.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useSpring`, `useTransform`, `useReducedMotion`), lucide-react icons (LayoutDashboard, Inbox, Library, BarChart3, CreditCard, Settings, ChevronsUpDown, Check, Search, X, Plus, PanelLeftClose, PanelLeftOpen), React `useId`.
- File: `components/workbench-sidebar/workbench-sidebar.tsx`, named export `WorkbenchSidebar`, types `WorkbenchSidebarProps`, `WorkbenchNavItem` (`{ id; label; icon: ComponentType<{ className? }>; count?: number }`), `WorkbenchProject` (`{ id; label; color }`), `WorkbenchWorkspace` (`{ name; plan?; color? }`, `color` is any CSS background).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `workspace` | `WorkbenchWorkspace` | Northwind, "Pro plan", `linear-gradient(135deg,#5ac8fa,#0071e3)` | Initial workspace. |
| `workspaces` | `WorkbenchWorkspace[]` | Northwind; Side quests, "Free plan", `linear-gradient(135deg,#ffd60a,#ff9f0a)` | Switcher menu (current matched by name). |
| `onWorkspaceChange` | `(w) => void` | — | Picked workspace. |
| `items` | `WorkbenchNavItem[]` | Overview, Inbox (count 4), Library, Analytics, Billing, Settings | Main nav. |
| `projects` | `WorkbenchProject[]` | Autumn launch `#ff9f0a`, Design system `#bf5af2`, Mobile app `#30d158` | Projects. |
| `onNewProject` | `() => void` | — | The + button. |
| `user` | `{ name; email }` | Ada Park, ada@northwind.co | Footer user. |
| `usage` | `number \| null` | `0.68` | Meter 0–1; `null` hides it; orange from .9. |
| `usageLabel` | `string` | `"Builds this month"` | Meter caption. |
| `usageNote` | `string` | `"Resets in 9 days"` | Under the meter. |
| `activeId` | `string` | — | Controlled active row. |
| `defaultActiveId` | `string` | `"overview"` | Uncontrolled initial. |
| `onNavigate` | `(id) => void` | — | Item or project chosen. |
| `defaultCollapsed` | `boolean` | `false` | Start as a rail. |
| `onCollapsedChange` | `(collapsed) => void` | — | Fold toggled by the user. |
| `autoplay` | `boolean` | `false` | Demo tour until touched. |
| `className` | `string` | `""` | Aside classes. |

## Layout and look

- `<aside aria-label="Sidebar">`: flex column, full height, width 248px (64px collapsed), radius 22px, padding 8px, white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark ring `rgba(255,255,255,.08)`, `.9`). Ink `#1d1d1f` / `#f5f5f7`; soft `#6e6e73` / `#a1a1a6`; focus ring 2px `#0071e3` / `#0a84ff`.
- Switcher button: 44px tall, radius 12px, padding 0 6px, gap 10px, hover `black/4` / `white/6`. A 32px badge radius 9px with the workspace background, white 13px semibold initial, `inset 0 1px 0 rgba(255,255,255,.3)`; name 13.5px semibold and plan 11.5px soft; a 14px up-down chevron. Menu below (4px gap, z 20, origin top): radius 14px, padding 4px, white / `#2c2c2e`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 18px 36px -16px rgba(0,0,0,.35)`; items radius 10px, padding 6px 8px, 13px medium, a 20px swatch radius 6px, blue check on the current one.
- Search (6px below): 32px tall, radius 10px, `#f0f0f3` / `#2c2c2e`, padding 0 10px, 16px search icon, 13px input "Search", focus-within 2px blue ring. Right side: a `⌘K` keycap (white / `#3a3a3c`, radius 5px, 10.5px medium, hairline ring) or a clear X when there is text. Collapsed: an icon-only 32px button.
- Scroll area (8px below, flex-1, hidden scrollbar, bottom 16px fade mask). Rows: 32px tall, radius 10px, padding 0 10px, gap 10px, 13.5px medium tracking −0.01em; active ink with a blue 16px icon, others soft with hover to ink. Count badge: 18px min, rounded-full, blue, white 11px semibold tabular. Collapsed rows with a count show an 8px blue dot at top 6px right 12px with a 2px white (dark `#1c1c1e`) ring.
- Projects (16px gap above): header 28px, "Projects" 11.5px semibold uppercase tracking .08em `#6e6e73` / `#98989d`, and a 24px + button radius 7px (hidden collapsed). Project rows use the row style in regular weight with a 10px square swatch radius 3.5px.
- Empty search: "Nothing matches “{query}”." 12.5px soft, `role="status"`.
- Footer (8px top, 6px gap): usage card radius 14px, `#f5f5f7` / `#2c2c2e`, padding 12px: label 12px medium ink and percent soft tabular; 6px meter `#e8e8ed` / `#3a3a3c` with blue fill (orange `#ff9f0a` at ≥.9); note 11.5px soft. User row (padding 4px, gap 10px; stacked vertically when collapsed): 32px avatar `linear-gradient(135deg,#ffb38a,#ff375f)` with white initials, name 13px medium, email 11.5px soft, and a 32px collapse button radius 9px.

## Motion

- Width: spring stiffness 340, damping 24.
- Labels (Trail): collapsed `opacity 0, x −10, blur(2px)`; expanded `opacity 1, x 0, blur(0)`; spring 420/30; when expanding, delay `0.05 + i·0.025` with i increasing down the column (workspace 0, items 1…, Projects header, projects, user last), so rows ripple in.
- Active highlight: shared `layoutId` across items and projects (inside a `LayoutGroup`), spring 520/34. The active icon pulses scale `[1, 1.22, 1]`, .38s, ease `[0.3, 1.6, 0.5, 1]`.
- Filtering: rows in `AnimatePresence mode="popLayout"` with `layout="position"`, enter/exit `opacity 0, scale .96`, spring 520/34.
- Rail dot: scale 0 → 1, spring 600/14, delay .15.
- Menu: `opacity 0, y −6, scale .96` in; exit `y −4, scale .97`; spring 500/32.
- Usage card: height and opacity collapse with the width spring. Meter bar width and percent text share one spring (stiffness 90, damping 16) from 0 to `usage`.
- Reduced motion: everything instant; meter jumps.

## Interaction and states

- Clicking a row sets the internal active id and calls `onNavigate`.
- Search filters items and projects by case-insensitive substring; Escape clears it. ⌘K / Ctrl+K anywhere, or "/" when not typing in a field, expands the sidebar and focuses search.
- ArrowDown/ArrowUp inside the nav move focus between rows, wrapping.
- Switcher: collapsed it just expands; otherwise toggles the menu. The menu closes on Escape or a pointer down outside. Collapsing also closes it.
- Collapsed search icon expands and focuses search.
- Pointer down anywhere, typing or navigating marks the sidebar touched.

## Autoplay demo

Every 1300ms step through: select inbox, analytics; search "a", "an", ""; collapse; expand; select launch, overview; repeat. Stop once touched.

## Accessibility

- Menu button `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`; menu `role="menu"` labelled "Switch workspace" with `menuitemradio` items and `aria-checked`. Rows use `aria-current="page"`; collapsed rows get `aria-label` (with ", 4 new" for counts) and `title`. Hidden labels are `aria-hidden`. Search input labelled "Search the sidebar". Meter `role="meter"` with 0–100 values. Collapse button labels "Collapse sidebar" / "Expand sidebar" with `aria-expanded`.

## Acceptance checklist

- [ ] The grey highlight springs between nav and project rows.
- [ ] Typing filters rows, which pop out and close up smoothly; no match shows the message.
- [ ] ⌘K or "/" focuses search, expanding first if needed.
- [ ] Collapse springs to 64px; labels blur away; Inbox shows a blue dot.
- [ ] Expand ripples labels back in top to bottom.
- [ ] The switcher menu opens, swaps workspace and closes on outside click or Escape.
- [ ] The meter fills to 68% with a matching counter.
- [ ] Autoplay tours until touched.
