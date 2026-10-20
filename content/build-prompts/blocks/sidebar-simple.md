# Simple Sidebar with Hover

Build an app shell with a frosted, floating sidebar on the left and a small analytics dashboard on the right. Rows tint on hover, and the blue selection pill glides between rows on a spring while the toolbar title swaps with a blur. In a narrow frame the sidebar becomes a slide-over drawer. It should feel like a native macOS/iPadOS sidebar: light, precise and calm.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries `@container` / `@md:`), framer-motion (`motion`, `AnimatePresence`, `MotionConfig`, `useReducedMotion`, `layoutId`), lucide-react icons.
- File: `simple-sidebar.tsx`, default export `SimpleSidebar`; also export the types `SimpleSidebarProps`, `SimpleSidebarSection`, `SimpleSidebarItem` and the constant `SIMPLE_SIDEBAR_SECTIONS`.

## API

Every prop is optional; with none the block renders exactly the demo below.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `workspaceName` | `string` | `"Nexus Labs"` | Sidebar header name; its first letter (upper-cased) fills the logo tile. |
| `accent` | `string` | — | Hex colour for the selection pill, row icons, focus ring and the latest revenue bar, set as `--sb-accent` on the frame. Unset (or `#0071e3`) keeps `#0071e3`, with icons `#2997ff` in dark mode. |
| `greeting` | `string` | `"Good morning, Alex"` | Dashboard headline. |
| `dateLabel` | `string` | `"Tuesday, 14 October"` | Line above the headline. |
| `userName` | `string` | `"Alex Morgan"` | Footer account name; its first two initials fill the monogram. |
| `userEmail` | `string` | `"alex@nexuslabs.io"` | Line under the account name. |
| `compactBreakpoint` | `number` | `640` | Frame width (px) below which the sidebar becomes a drawer; clamped to 0–2000. |
| `sections` | `SimpleSidebarSection[]` (`{ id, title, items: { id, label, icon: LucideIcon, badge?, active? }[] }`) | `SIMPLE_SIDEBAR_SECTIONS` | Navigation groups. The item marked `active` (else the first) starts selected. |
| `className` | `string` | — | Merged onto the 560px frame (e.g. another height or radius). |

The dashboard figures (stats, revenue, pages, sign-ups) stay constants in the file.

## Layout and look

- Wrap everything in `<MotionConfig reducedMotion="user">`.
- Frame: `relative flex h-[560px] w-full overflow-hidden rounded-[22px]`, background `#f5f5f7` (dark `#000`), text `#1d1d1f` / `#f5f5f7`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.08)`).
- Sidebar (`aside`, `aria-label="Sidebar"`): 244px wide, `rounded-[18px]`, `bg-white/70 backdrop-blur-2xl backdrop-saturate-150` (dark `#1c1c1e` at 75%), flex column.
  - Wide: `relative my-2 ml-2`, shadow `0 0 0 .5px rgba(0,0,0,.08), 0 8px 24px -14px rgba(0,0,0,.18)` (dark `0 0 0 .5px rgba(255,255,255,.1)`).
  - Compact: `absolute inset-y-2 left-2 z-30`, shadow `0 0 0 .5px rgba(0,0,0,.1), 0 24px 48px -20px rgba(0,0,0,.35)` (dark ring white/12 and `rgba(0,0,0,.8)`).
- Header: `px-4 pt-3.5 pb-2`, gap 10px: a 28px tile `rounded-[8px]` `#1d1d1f` with white 12px semibold "N" (dark inverted), then "Nexus Labs" 14px semibold, tracking −0.01em, truncating. In compact mode a 28px round close button (X icon 16px, `#6e6e73`, hover `black/5`).
- Nav (`aria-label="Main"`): `px-2 pb-2`, scrolls with hidden scrollbar. Section titles 11px semibold `#86868b` (dark `#98989d`), `px-2.5 pb-1`; first section `mt-1`, next `mt-4`. Rows in a `ul` with 1px gaps.
- Row button: `h-7 w-full rounded-[10px] px-2.5 gap-2.5`, 13px medium, `transition-colors 150ms`. Idle: text `#1d1d1f`, hover `bg-black/[0.04]` (dark white/6). Icon 16px, stroke 1.75, `#0071e3` (dark `#2997ff`). Label truncates. Badge: 12px tabular, `#86868b`.
- Selected: text white, icon white, badge `white/80`, behind it a `motion.span` with `layoutId` (scoped with `useId`) `absolute inset-0 rounded-[10px] bg-[#0071e3]`, shadow `0 1px 2px rgba(0,0,0,.12), inset 0 .5px 0 rgba(255,255,255,.2)`.
- Footer: `border-t border-black/[0.06]` (dark white/8) `p-2`; a full-width account button `rounded-[12px] p-2`: 32px monogram "AM" (gradient `#a1a1a6 → #86868b`, dark `#8e8e93 → #636366`, white 11px semibold), "Alex Morgan" 13px medium, "alex@nexuslabs.io" 12px `#6e6e73`, and a `ChevronsUpDown` 16px icon.
- Main column: header `h-12 px-4` with (compact only) a 32px round menu button (`Menu` 18px) and the swapping title (15px semibold, leading 24px, 24px-high clipped box).
- Dashboard canvas (`@container`, `px-4 pb-4`, gap 12px): date "Tuesday, 14 October" (13px `#6e6e73`), "Good morning, Alex" 22px semibold tracking −0.025em, a "Last 12 months" chip (`#e8e8ed` / `#2c2c2e`, 12px). Three stat cards in a 3-column grid; a revenue bar chart card (spans 2 of 3 columns from `@md`) and a "Top pages" card (hidden below `@md`); a "Recent sign-ups" card (2 columns, 3 from `@md`). Cards: `rounded-[18px] bg-white` with `0 0 0 1px rgba(0,0,0,.05), 0 1px 2px rgba(0,0,0,.04)`; dark `#1c1c1e` with a white/8 ring. Bars `rounded-[5px]`, `#e8e8ed` (dark `#3a3a3c`), last bar `#0071e3`; month initials 10px.
- Responsive: the frame watches its own width with a ResizeObserver; under `compactBreakpoint` (640px) it is compact (drawer). Above, the sidebar sits inline.

## Motion

- Selection pill: spring stiffness 500, damping 32, mass 0.9.
- Row press: `whileTap scale 0.97`, spring 420/34. Close/menu buttons `scale 0.92`; account button `0.98`.
- Drawer: animate `x` between `-110%` (hidden) and `0%`, spring stiffness 260, damping 32. Use `{ duration: 0 }` until the first measurement lands (one rAF after the first ResizeObserver call) so there is no slide on mount.
- Scrim: `opacity 0 → 1`, 0.2s.
- Title swap (`AnimatePresence mode="popLayout" initial={false}`, keyed by label): in from `opacity 0, y 100%, blur(6px)`, out to `y -100%, blur(6px)`, spring 420/34. With reduced motion, opacity only.
- Bars: `scaleY 0 → 1` from the bottom on first view (`once`, margin −40px), spring 260/30, delay `i × 0.03`; reduced motion fades only.

## Interaction and states

- Clicking a row selects it (title updates) and closes the drawer.
- Compact: the menu button opens the drawer (`aria-expanded`); the scrim, the X button or Escape (handled on the frame) closes it. The hidden drawer gets `inert`.
- Selection starts on the item marked `active` (Home in the demo).

## Demo data

- Workspace: Home (active), Inbox (badge "4"), Dashboard, Analytics, Projects, Team, Calendar, Starred, Settings.
- Resources: Documentation, API reference, Changelog, Support, Sponsor.
- Icons: Home, Inbox, LayoutDashboard, BarChart2, Zap, Users, Calendar, Star, Settings, BookOpen, Code2, FileText, LifeBuoy, CircleDollarSign.
- Stats: Revenue $48,295 (+12.4%), Active users 3,842 (+4.1%), Conversion 5.27% (−0.3%, red `#ff3b30` trending-down; others green `#34c759`).
- Revenue: 38, 44, 41, 52, 49, 58, 63, 57, 66, 72, 69, 81 (J–D), caption "$81k in December".
- Top pages: /pricing 38%, / 27%, /docs/install 16%, /changelog 9%.
- Sign-ups: Maya Chen (Team plan), Jonas Weber (Pro trial), Ines Duarte (Team plan; hidden below `@md`).

## Accessibility

- Rows are buttons with `aria-current="page"` when selected; badges add a screen-reader-only " unread".
- Icons, monograms and the scrim are `aria-hidden`.
- Focus ring: 2px outline, 2px offset, `#0071e3`.
- Menu and close buttons have `aria-label`s ("Show sidebar", "Close sidebar"); the hidden drawer is `inert`.

## Acceptance checklist

- [ ] A 244px frosted sidebar floats 8px inside a 560px rounded frame.
- [ ] Hovering a row tints it; clicking slides the blue pill to it on a spring.
- [ ] The toolbar title swaps upward with a blur on every selection.
- [ ] Inbox shows a "4" badge that turns white/80 when selected.
- [ ] Below 640px frame width the sidebar is hidden off-canvas and a menu button appears.
- [ ] The drawer slides in over a scrim and closes via scrim, X, Escape or selecting a row.
- [ ] No slide animation on first mount.
- [ ] Dashboard cards collapse to fewer columns in a narrow container.
- [ ] Dark mode swaps every surface, ring and text colour listed above.
- [ ] Reduced motion removes blur/slide flourishes but keeps state changes.
