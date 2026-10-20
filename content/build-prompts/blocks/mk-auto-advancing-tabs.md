# Auto-advancing Tabs

Build a feature section with a vertical list of tabs on the left and a tinted panel on the right showing a small live visual for the active tab. Tabs advance on their own: a thin progress bar beside the active tab fills, then the next tab opens. Picking a tab jumps to it; hovering the section or keyboard-focusing the tabs pauses the timer. It should feel smooth and confident, like a product page that explains itself.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useInView`, `useMotionValue`, `useReducedMotion`), and a `cn` helper.
- File: `components/auto-advancing-tabs/auto-advancing-tabs.tsx`, named exports `AutoAdvancingTabs` and `DEFAULT_AUTO_ADVANCING_TABS`, types `AutoAdvancingTab`, `AutoAdvancingTabsProps`, `AutoAdvancingTabVisualProps`.
- `AutoAdvancingTab = { title; body; V: ComponentType<{ live: boolean }>; tint /* light panel bg */; tintDark? /* defaults to #1c1c1e */ }`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"One workspace, four jobs done."` | Heading above the tabs. |
| `tabs` | `AutoAdvancingTab[]` | 4 demo tabs | Tabs and their visuals. |
| `accent` | `string` | — | Any CSS colour. Unset: `#0071e3`, `#2997ff` in dark. |
| `autoplay` | `boolean` | `true` | Advances while on screen. |
| `duration` | `number` | `6` | Seconds per tab (minimum 1). |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg white / black, padding 20px sides, 64px vertical (80px from `sm`). Accent lives in `--ft-accent`: inline style when `accent` is given, otherwise classes `[--ft-accent:#0071e3] dark:[--ft-accent:#2997ff]`.
- Grid: max-width 1120px, one column with 40px gap; from `lg` columns `1fr 1.2fr`, gap 48px, items centred.
- Heading `<h2>`: `clamp(32px, 5vw, 54px)`, semibold, line-height 1.04, tracking −0.04em, `text-balance`, `#1d1d1f` / `#f5f5f7`. 24px gap to the tabs (32px from `sm`).
- Tab button: min-height 48px, radius 12px, padding 16px top/bottom, 24px left, 8px right, left-aligned column with 4px gap. Track on the left: 3px wide, inset 12px top and bottom, rounded, `#e8e8ed` / `#3a3a3c`; the active one holds an accent fill scaled on Y from the top by the progress value.
- Tab title: 19px (20px from `sm`) semibold, tracking −0.02em; active `#1d1d1f` / `#f5f5f7`; inactive `#86868b` / `#a1a1a6`, hover `#424245` / `#d1d1d6`, colour transition.
- Active body: 16px, line-height 1.5, `#6e6e73` / `#a1a1a6`.
- Panel: min-height 320px (380px from `sm`), radius 28px (32px `sm`), padding 16px (40px `sm`), overflow hidden, flex centred vertically, background `var(--ft-tint)` / dark `var(--ft-tint-dark)` set inline from the active tab, `transition-colors 500ms`.

Demo tabs and visuals (shared chip style: radius 12px, white / `#2c2c2e`, padding 10px (12px `sm`), 12px medium, shadow `0 0 0 1px rgba(0,0,0,.05), 0 6px 12px -8px rgba(0,0,0,.25)`):
1. "Plan the work" — "Boards that move as fast as your team. Drag a card and everyone sees it land." tint `#e9f3ff` / `#0b1a2c`. Kanban: columns "To do", "Doing", "Done" (Done hidden below `sm`), each `white/70` / `#1c1c1e/80`, radius 16px, padding 8px (12px `sm`), 11px uppercase grey label with 0.08em tracking. Cards: Write launch post; Onboarding emails; Brand refresh; and "Pricing page copy", which moves between To do and Doing every 1.8s while `live`, as a shared `layoutId` with spring 300/28.
2. "Write it down" — "Docs with comments in the margin, right next to the work they're about." tint `#fff2e3` / `#2a1d0f`. Doc card (white / `#2c2c2e`, radius 16px, padding 20px/24px): "Q4 plan" 18px semibold, four 10px grey bars at 92/76/84/58% width (`#f0f0f3` / `#48484a`); the second gets an accent-20% highlight growing 0 → 70% (delay .4, .8s). Then a comment bubble "**Maya:** Can we pull this into October?" (`#f5f5f7` / `#3a3a3c`, right-aligned, 78% wide from `sm`) springs in from `y 8, scale .95` (300/22, delay 1.1).
3. "Track the results" — "Charts that build themselves from the work you already do." tint `#eaf8ee` / `#0f2416`. Six bars 42, 66, 54, 88, 72, 96% in a 220px card labelled Jan–Jun (11px grey); last bar solid accent, others accent at 25%; each grows `scaleY 0 → 1` from the bottom, spring 160/16, delay `i × 0.07`.
4. "Stay in the loop" — "One inbox for every update, sorted by what needs you first." tint `#f3ecfd` / `#1d1530`. Four rows (Billing "Invoice paid", Leo "Standup moved to 10", Maya "Deck is ready", Ops "Deploy finished"), each a white / `#2c2c2e` row radius 16px with a 36px initial avatar (first accent, then `#ff9f0a`, `#30d158`, `#ff375f`); first row gets an accent "Now" pill. Rows slide from `x 30`, spring 260/24, delay `i × 0.1`.

## Motion

- Progress: a motion value 0 → 1 driven by `requestAnimationFrame`: add `dt / duration` each frame unless hovered or keyboard-focused; at 1, advance to `(i + 1) % count` (wrapping). The loop restarts (progress 0) whenever the active tab changes, and only runs while the section is ≥30% in view and there are 2+ tabs. Without advancing, progress is held at 1 (full bar).
- Body text: `AnimatePresence initial={false}`, `height 0 ↔ auto` with opacity, spring 300/30.
- Panel swap: `AnimatePresence mode="popLayout" initial={false}` keyed by the index. Enter `opacity 0, y 30, scale .96, blur(10px)`; exit `y −30`; spring 180/24, filter tween .35s. Reduced motion: opacity only, 0.2s.

## Interaction and states

- Click a tab: make it active and reset progress to 0 (or 1 when not advancing).
- Keyboard on the tablist: ArrowDown/ArrowRight next, ArrowUp/ArrowLeft previous (wrapping), Home first, End last; move focus to the new tab and `preventDefault`.
- Mouse enter on the section sets `hovered`; leave clears it. Focus inside the tablist that matches `:focus-visible` sets `focused`; blur leaving the list clears it. Both pause the fill without resetting it.
- Return `null` when `tabs` is empty; clamp the active index to the list.

## Autoplay demo

With `autoplay` on and no reduced motion, each tab plays for `duration` seconds (6 by default) and the cycle loops forever while visible. Each visual's own loop (the kanban card) runs when `live` is true, which is whenever reduced motion is off.

## Accessibility

- `role="tablist"` with `aria-label="Features"` and `aria-orientation="vertical"`; buttons `role="tab"`, `aria-selected`, `aria-controls` → panel id, roving `tabIndex` (0 for active, −1 others). Panel `role="tabpanel"` with `aria-labelledby` the active tab id (ids via `useId`).
- Focus ring: 2px `--ft-accent`.
- Reduced motion stops auto-advancing and simplifies transitions.

## Acceptance checklist

- [ ] Four tabs; the active tab's bar fills over 6s, then the next tab opens.
- [ ] After the last tab it wraps to the first.
- [ ] Hovering the section pauses the fill; leaving resumes from where it stopped.
- [ ] Clicking a tab jumps to it and restarts its bar.
- [ ] Arrow keys, Home and End move between tabs and move focus.
- [ ] The panel tint cross-fades and the visual swaps with a blur-and-rise.
- [ ] The kanban card hops between columns every 1.8s.
- [ ] `duration={3}` halves the time per tab; `autoplay={false}` shows a full bar and never advances.
- [ ] `accent` recolours bars, focus rings, chart and badges; unset it brightens in dark mode.
- [ ] Two columns from `lg`, stacked on phones with the Done column hidden.
