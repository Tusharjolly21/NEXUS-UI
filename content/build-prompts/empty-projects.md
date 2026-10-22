# Empty Projects

Build an empty projects screen that is one click from not being empty. Three starter templates sit in a loose stack inside a dashed box; point at them (or focus one) and they fan out so you can see each one. Pick one and that exact card flies into a project grid as your first project while the empty state steps aside. "Start over" brings the stack back.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), an `IntersectionObserver`, a `ResizeObserver` and the page visibility API.
- File: `components/empty-projects/empty-projects.tsx` plus an `index.ts`. Named exports `EmptyProjects`, `EMPTY_PROJECTS_TEMPLATES`, and the types `EmptyProjectsProps`, `EmptyProjectsTemplate`.

## API

`EmptyProjectsTemplate`: `{ id: string; name: string; tint: readonly [string, string] }`. `tint` is `[pastel background, accent]`. The ids `landing`, `dashboard` and `docs` draw their own mini page; any other id draws a plain one.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `templates` | `EmptyProjectsTemplate[]` | three demo templates | The stack, left to right. Three works best. |
| `title` | `string` | `"Projects"` | Heading above the grid. |
| `emptyTitle` | `string` | `"No projects yet"` | Headline of the empty state. |
| `emptyDescription` | `string` | `"Pick a starting point. You can change everything later."` | Line under the headline. |
| `onCreate` | `(template) => void` | none | Called when a template or the blank project is picked. Never called by the autoplay demo. |
| `autoplay` | `boolean` | `false` | Demos the fan and a pick on a loop until touched. |
| `enableSound` | `boolean` | `true` | Interface sounds. |
| `className` | `string` | none | Extra classes on the card. |

Demo templates: `landing` "Landing page" `["#e8f1ff", "#0a84ff"]`; `dashboard` "Dashboard" `["#f3ecff", "#bf5af2"]`; `docs` "Docs site" `["#e9f9ee", "#30d158"]`. A built-in blank template is `{ id: "blank", name: "Untitled", tint: ["#f5f5f7", "#c7c7cc"] }`.

## Layout and look

- Card: width 540px, `max-width: 100%`, radius 28px, white / dark `#1c1c1e`, padding 20px (24px from 640px), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 50px -30px rgba(0,0,0,.35)` (dark: ring `rgba(255,255,255,.08)`, shadow alpha .9).
- Header row: the title (20px semibold, tracking -0.02em, `#1d1d1f` / dark `#f5f5f7`) on the left and a "New project" pill on the right (36px tall, 16px side padding, 13px medium, bg `#1d1d1f` text white; dark bg `#f5f5f7` text `#1d1d1f`).
- Stage: `position: relative`, 330px tall, 20px below the header.
- Empty state: fills the stage, radius 20px, 1px dashed border `#d2d2d7` (dark `rgba(255,255,255,.15)`), 32px top padding, content centred. Inside: a 150px tall, 300px wide (`max-width: 100%`) fan area; then the headline (17px semibold, tracking -0.01em, 20px above), the description (14px, `#6e6e73` / dark `#a1a1a6`, centred, 4px below, 16px side padding), and a "Blank project" pill (36px tall, 13px medium, bg `#f5f5f7` / dark `#2c2c2e`, 16px below).
- Template card: 112px wide, 136px tall, radius 14px, pinned `left: 50%; top: 0; margin-left: -56px`. It is a button holding a mini page: white / dark `#2c2c2e` surface with shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -18px rgba(0,0,0,.45)` (dark ring `rgba(255,255,255,.1)`, shadow alpha .9). The top 46% is tinted with `tint[0]` (dark: `tint[1]` mixed 26% into `#2c2c2e`), 10px padding, with three 6px dots (`rgba(0,0,0,.1)`, dark white 25%). Art by id: `landing` a 8px bar 60% wide in the accent and a 6px bar 40% wide below; `dashboard` five bars (heights 40, 70, 55, 90, 65 percent of a box 60% of the height) in the accent with opacity `0.35 + index * 0.13`; `docs` a 40px by 28% block at the left and three bars at the right (accent 100%, grey 80%, grey 65%). The bottom part has two placeholder lines (6px tall, 85% and 60% wide, `#ececf0` / dark `#48484a`) and the name (11.5px semibold; 14px once in the grid).
- Grid: 2 columns (3 from 640px), 12px gap, content at the top. The first cell is the flown-in card, 160px tall, named "My <name lowercased>" ("Untitled" for blank). The second cell is a "Start over" button: 160px tall, radius 14px, 1px dashed border like the empty state, 13px medium muted text, a 36px round `+` chip (`#f5f5f7` / dark `#2c2c2e`) above the label. Below, a full-width note (radius 14px, bg `#f5f5f7` / dark `#2c2c2e`, 16px by 12px padding, 13px) with a 16px green `#34c759` check disc: "Project created. Invite your team when you're ready."

## Motion

- Stack: for N templates let `o = index - (N - 1) / 2`. Resting: `x = o * 16`, `rotate = o * 7`, `y = 6` for the outer cards and `0` for the middle one. Fanned: `x = o * gap`, `rotate = o * 12`, `y = 10`, with the middle card lifted to `-14`. `gap` is 118px, shrinking to fit narrow containers: `clamp(64, (stageWidth - 136) / 2, 118)` measured with a `ResizeObserver`. The middle card sits on top (z-index 3, others 2). Spring stiffness 300, damping 22. While fanned, hovering a card lifts it a further 10px and scales it 1.04.
- Pick: every template card and the grid card share a `layoutId` (`tpl-<id>`) inside a `LayoutGroup`. The empty state is an `AnimatePresence mode="popLayout"` child that fades out over 200ms; the grid appears with the picked card travelling from its place in the stack to the first grid cell on a spring (stiffness 260, damping 26). "Start over" fades and scales in from 0.9 after 350ms; the note slides up 8px and fades in after 450ms.
- Reduced motion: the fan still opens and closes but with a 150ms transition and no hover lift; the picked card moves with a zero-duration layout transition; no scale or slide on the new cells.

## Interaction and states

- Pointer enter on the fan area, or focus within it, opens the fan; leave or focus moving out closes it.
- Clicking a template, "New project" (picks the first template) or "Blank project" creates the project: the fan closes, the grid replaces the empty state and `onCreate` is called.
- "Start over" returns to the empty state.
- After a keyboard pick, focus moves to "Start over"; after a keyboard "Start over", focus moves to the first template.

## Autoplay demo

Only while the card is on screen, the tab is visible and motion is not reduced. Loop of 6.8s: reset at 0, fan open at 0.9s, pick the second template at 2.6s (the fan closes), start over at 6.2s. Any pointer press or hover over the fan stops the loop for good. The demo never calls `onCreate`.

## Accessibility

- Every template is a real button labelled `Start from the <name> template`; the mini page art is `aria-hidden`. "New project", "Blank project" and "Start over" are real buttons. A polite `sr-only` `role="status"` region announces `Project created: <name>`.
- Focus rings are 2px `#0071e3` (dark `#0a84ff`) outlines with 2px offset. The fan opens on keyboard focus, so every template is reachable with Tab.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Picking a template (or Blank project, or New project) plays `tap` at 0.5 and, 520ms later as the card lands in the grid, `drop` at 0.55. Start over plays `tap` at 0.35.
- Autoplay plays the same `tap` and `drop` for its pick through `play.auto`, which stays silent until the visitor has interacted with the page once. Hover, focus and the fan-out are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs with the component.

## Acceptance checklist

- [ ] Three cards sit in a loose, overlapping stack; hovering or focusing fans them out with a slight rotation.
- [ ] Clicking one makes that exact card travel into the first grid cell while the dashed empty state fades.
- [ ] The grid shows "My <template>", a Start over cell and the green note.
- [ ] Start over brings the stack back; keyboard users never lose focus.
- [ ] The fan never pokes out of the card at 320px.
- [ ] Autoplay fans, picks the Dashboard template and starts over on a loop and stops for good on touch.
- [ ] Dark mode uses the dark card, darkened template tints and the brighter blue.
- [ ] Reduced motion keeps every state reachable with short fades.
