# Build prompt: Meridian — operations dashboard app

Build **Meridian**, a full-screen operations workspace for an invented small software company called Fieldnote. It covers the numbers, the work, the money and the calendar in four pages behind one sidebar and a command palette. The feel is a precise, quiet dark dashboard with one blue accent and a light theme a click away. Every chart, table and board is a working mock with sample data.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (theme variables for dark and light, selection, focus rings, thin scrollbars) under an `.md` wrapper.
- Framer Motion 12 for all motion. No chart, table or UI libraries: charts are hand-drawn SVG.
- Fonts self-hosted from `/public/fonts/meridian`: Inter (variable) for everything, Geist Mono (variable) for figures. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; avatars are DiceBear Notionists SVGs inlined as data URLs.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **AreaChart**: this period against the last as two smooth lines with a soft fill, a crosshair that snaps to the nearest point with a readout, and points that tween when the range switches between week, month and year.
- **Sparkline**, **BarChart**, **Heatmap** (half a year of releases by day) and **Ring** (a budget against its limit).
- **FlowChart**: a sankey of cash from income sources through to spending categories, with hover to highlight one path.
- **Toasts** with an optional Undo, and a `useDismiss` hook for popovers (Escape and outside press).

## Pages

1. **Sidebar and header.** Logo and workspace, Home, Board, Finance and Calendar with counts, Support and Settings, a theme switch whose light theme spreads from the click as a circle, a search button that opens the command palette, and notifications. On phones the sidebar becomes a drawer.
2. **Home.** A greeting, KPI cards with sparklines and counting numbers, the revenue chart with its range switch, net new MRR bars, the release heatmap, the newest hires, and a customers table: search, plan filters, sortable columns, row selection with a bulk bar (change plan, archive with Undo, export as CSV) and a paged footer.
3. **Board.** A kanban with Backlog, In progress, In review and Done. Cards tilt with drag speed and settle with a spring; they move between columns by keyboard. A task panel opens beside the board with title, labels, a checklist, assignees, hours logged against an estimate and comments.
4. **Finance.** A period switch and a Statement button, balance, income, expenses and net margin cards, the cash flow chart, budgets as rings and a recent transactions list with categories.
5. **Calendar.** A month grid that slides left or right as it changes, filters by calendar, today highlighted, and a day panel that lists events and adds new ones.
6. **Command palette.** Ctrl K or Cmd K opens a palette that searches pages, actions, customers and tasks, grouped, with arrow keys and Enter.

## Look

- Dark: page `#0A0A0C`, panel `#0F0F12`, cards `#16161A` and `#1C1C21`, hairlines at 6.5 and 11% white; ink `#EDEDEF`, text `#A9A9B2`, soft `#8A8A94`; accent `#4A86E8`.
- Light: page `#EEEEEB`, panel `#F7F7F5`, cards white; ink `#16161A`, text `#4F4F58`, soft `#696973`; accent `#2F6BD6`.
- Inter at 12.5 to 14px for the interface, figures in Geist Mono with tabular numbers; radii 10 to 16px; charts use the accent and one muted grey.

## Motion

- Springs for the active nav pill, popovers, toasts and the board cards; tweened chart points when data changes.
- The theme change is a circular reveal from the pointer.
- Numbers count up when they first appear.
- With reduced motion, charts and numbers show their final state and the theme switches instantly.

## Content

Meridian, Fieldnote and every person, customer, figure and event are invented sample content. Keep customers, tasks, transactions, budgets and events as arrays in a data file so a reader can swap in their own.
