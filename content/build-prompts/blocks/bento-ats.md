# ATS Bento Grid

Build a four-tile bento section for a hiring/ATS product: a match score that rolls between candidates on its own, a pipeline progress bar, a list of scheduled interviews, and a working résumé drop zone. Each tile has a soft spotlight that follows the cursor and lifts slightly on hover. It should feel precise and Apple-like: white tiles on light grey, big tight numerals, small springy details.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, variants, `layoutId`), lucide-react (`CalendarDays`, `CheckCircle2`, `FileText`, `Gauge`, `Upload`, `Video`, `Workflow`).
- File: `components/blocks/ats-bento-grid.tsx`, named export `AtsBentoGrid`, plus `AtsBentoGridProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `title` | `string` | `"Hire on evidence, not instinct."` | Section headline. |
| `description` | `string` | `"Screen applicants against the skills a role needs, keep every stage moving, and give your panel the same picture of each candidate."` | Lead paragraph. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Section: full width, bg `#f5f5f7` / dark `#000`, text `#1d1d1f` / `#f5f5f7`; padding 64px × 16px, 96px × 24px from `sm`, 32px sides from `lg`. Content max 72rem centred.
- Header: grid with 16px gap; from `md` `1.25fr 1fr`, bottom-aligned. H2 34px / 48px from `sm`, semibold, leading 1.07, tracking −0.035em, balanced. Paragraph 17px, leading 1.47, `#6e6e73` / `#a1a1a6`, max 28rem, pushed right from `md` with 8px bottom padding.
- Grid: 40px below (56px from `sm`), 1 column, 12 columns from `md`, gap 12px / 16px from `sm`. Row 1: Match score `col-span-7`, Pipeline `col-span-5`. Row 2: Interviews `col-span-5`, Intake `col-span-7`.
- Tile: `article`, radius 28px, padding 24px (32px from `sm`), flex column, `overflow: hidden`, white with `0 0 0 1px rgba(0,0,0,.05)`; hover `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -24px rgba(0,0,0,.28)`. Dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08)`, hover `0 0 0 1px rgba(255,255,255,.12), 0 24px 48px -24px rgba(0,0,0,.8)`. Shadow transitions 500ms ease-out.
- Spotlight layer: absolute, `radial-gradient(420px circle at var(--spot-x) var(--spot-y), var(--spot), transparent 65%)`; `--spot` is `rgba(0,0,0,.035)` light, `rgba(255,255,255,.055)` dark; fades in on hover over 500ms. Defaults `--spot-x: 50%`, `--spot-y: 0px`.
- Tile header: 13px medium muted label with a 16px icon (stroke 1.75); 8px below the headline 22px (24px from `sm`), semibold, leading 1.15, tracking −0.025em, max 22ch. Content area 24px below, flex-1.
- **Match score** (Gauge, "Match score", "Scored on the skills the role asks for."): grid with 24px gap; from `sm` (and again from `lg`) two columns `minmax(0,170px) 1fr`, bottom-aligned; single column at `md`. Left: the score numeral 64px (76px from `sm`) semibold tracking −0.045em in a clipped slot of the same height, "%" 26px; under it a 13px muted line with a 6px status dot: "Strong match" (≥90) / "Good match" (≥80, green `#34c759`) / "Partial match" (orange `#ff9500`) · first name. Right: list in a well (radius 20px, `#f5f5f7` / `#2c2c2e`, 6px padding); each row a full-width button (radius 14px, 12px × 10px): 32px initials avatar (11px semibold white; `#a1a1a6` / `#636366`, selected `#1d1d1f` / dark `#f5f5f7` with dark text), name 14px medium, skills 12px `#86868b` / `#98989d` joined by " · ", score 15px semibold tabular (muted unless selected). Selected row sits on a white pill (dark `#3a3a3c`) with `0 2px 6px rgba(0,0,0,.08), 0 0 0 .5px rgba(0,0,0,.04)`.
- **Pipeline** (Workflow, "Pipeline", "Every stage, visible to the whole panel."): "11" 56px/64px + "days" 24px; "Median time from application to offer." 15px muted. Progress: 6px track `#e8e8ed` / `#3a3a3c`, fill `#0071e3` to 50% (stage 2 of 0–4). Stage labels 11px (12px `sm`) spaced between: past muted, current semibold ink with `aria-current="step"`, future `#a1a1a6` / `#636366`. Then a hairline-divided list (`black/6%` / `white/8%`), 12px row padding, 14px: "Priya Raman · Interview" — "On track" (green dot); "Oliver Brandt · Screening" — "Waiting on feedback" (orange dot), status 12px muted.
- **Interviews** (CalendarDays, "Interviews", "One link. One invite. No back and forth."): 8px-gap list of well rows (radius 18px, 12px padding): 40px round photo (`object-cover`, hairline `0 0 0 .5px rgba(0,0,0,.08)`), name 14px medium, note 12px muted, right-aligned time 13px semibold tabular and status 11px with dot. Footer pinned bottom (24px top padding): 16px `Video` icon + "Video rooms are created with the invite." 13px muted.
- **Intake** (FileText, "Intake", "Drop in résumés from anywhere."): a full-width button drop zone, min 220px tall, radius 20px, 24px × 32px padding, well bg with `inset 0 0 0 1px rgba(0,0,0,.04)` (dark white/4%), hover `#ededf0` / `#323234`. Dragging: bg `#0071e3` at 6% (dark 14%), `inset 0 0 0 1.5px #0071e3`. Centre: 56px white circle (dark `#3a3a3c`) with `0 0 0 .5px rgba(0,0,0,.06), 0 8px 20px -8px rgba(0,0,0,.2)` holding a 20px `Upload` (blue while dragging) or a 24px green `CheckCircle2` after upload. Text block 20px below, fixed 46px tall, max 300px: 15px semibold line ("Upload a résumé" / "Drop to upload" / file name, truncated) over a 13px muted line ("PDF, DOCX or TXT, up to 10 MB" / "{size} · ready for scoring"). Under the zone, 13px muted: "Or forward applications to **jobs@yourteam.dev**. Parsing starts straight away."

## Motion

- Section: `whileInView` once (margin −80px), header and grid stagger 0.08s / 0.07s; interview rows stagger 0.07s after 0.25s. Rise: from `opacity 0, y 16, blur(6px)`, spring 240 / 30; reduced: 0.4s fade.
- Tiles: `whileHover y −3`, UI spring stiffness 440, damping 34. Spotlight follows the pointer by writing CSS variables directly on the element (no re-render); ignore touch pointers.
- Score: auto-advances to the next candidate every 2600ms, paused while the pointer is over or focus is inside the tile body. Numeral swaps: enter from `y 100%, blur(6px)`, exit to `y −100%`, UI spring, `mode="popLayout"`. Selected pill: shared `layoutId`, UI spring. Avatar/score colours transition 300ms.
- Pipeline fill: `width 0 → 50%` when in view (once, −80px), spring 120 / 24, delay 0.35s.
- Intake icon circle: `scale 1.08, y −4` while dragging (UI spring); icon and text swap with blur crossfades (`scale .6` for the icon, `y ±12` for text); button `whileTap scale .985`.

## Interaction and states

- Clicking a candidate selects it immediately.
- Drop zone: click opens a hidden file input (`accept=".pdf,.doc,.docx,.txt"`); drag enter/over/leave/drop toggles the dragging state; the first file's name and size (B/KB/MB) are shown. No upload happens.

## Demo data

Candidates: Mateo Alvarez 87 (React, Design systems, A11y); Oliver Brandt 81 (Node, Postgres, Next.js); Priya Raman 94 (TypeScript, Mentoring, Perf) — selected first; Sofia Lindqvist 76 (Vue, Testing, CSS). Stages: Applied, Screening, Interview, Offer, Hired (current = Interview). Interviews: Aiko Tanaka, "Frontend interview", 4:30 PM, Confirmed; Kenji Mori, "System design with hiring manager", Tomorrow, Awaiting reply (use any local or remote portrait images).

## Accessibility

- Candidate rows are buttons with `aria-pressed`; 2px `#0071e3` focus outline, offset 2px.
- Status dots and spotlight are `aria-hidden`; photos have empty `alt`.
- The file input is `sr-only`, `tabIndex -1`, `aria-hidden`; the visible button is the control.
- Reduced motion disables hover lift, scale effects and auto-advance.

## Acceptance checklist

- [ ] 7/5 then 5/7 column split from `md`; single column on phones.
- [ ] The score rolls 94 → 76 → 87 … every 2.6s with the highlight pill following.
- [ ] Hovering the score tile pauses the rotation.
- [ ] A faint spotlight tracks the cursor inside each tile; tiles lift 3px.
- [ ] Pipeline bar fills to 50% when scrolled into view.
- [ ] Dragging a file over Intake turns it blue and says "Drop to upload".
- [ ] Dropping or picking a file shows a green check, its name and size.
- [ ] `title`/`description` props replace the header copy.
- [ ] Dark mode colours match the spec.
