# Build prompt: Pulse, engineering operations on one timeline

Build a single-page marketing site for **Pulse**, an engineering operations platform: issue tracking and cycles, incident triage and on-call, roadmaps and initiatives that roll up from the issues underneath. The feel is Apple-light and confident: pale page, white cards, one red accent used sparingly, big tight headlines, spring motion. The signature moment is **scrubbing the week** in the hero: drag a playhead along a heartbeat line spanning Monday to Sunday, and the issue board above rewinds and fast-forwards, cards springing between Triage, In progress, In review and Done, with an incident spiking on Wednesday.

## Stack

- Next.js (App Router), React 19, TypeScript strict. One client component (`"use client"`), plus a local triage deck component.
- Tailwind CSS 4 with hard-coded colours only (no `bg-background`-style theme tokens).
- Framer Motion 12 for all motion. No other libraries, no remote images, no web fonts. System font stack; `ui-monospace, "SF Mono", Menlo, monospace` for issue keys.
- Root wrapped in `<MotionConfig reducedMotion="user">` with `style={{ colorScheme: "light" }}`, `bg-[#fbfbfd]`, `text-[#1d1d1f]`.

## Page structure and copy

1. **Sticky glass nav.** Logo (a red rounded square with a white heartbeat line that draws itself) and "Pulse"; links Triage, Incidents, Roadmap, Pricing, FAQ; red "Start free" button.
2. **Hero: copy left, board right, timeline across the full width below both.** Pill "Issues, incidents and roadmaps in one place". Headline "Know what engineering did this week." with "this week." in red. Body: "Pulse keeps the issue tracker, the on-call incident and the quarter's roadmap on one timeline. Drag through the week and watch the work move." Buttons "Start with your team" and "See incident mode". The board card is headed "Cycle 34 · Platform", has an event ticker that rolls to the latest event ("SEV-2 declared: checkout 502s", "Incident resolved in 29 minutes"…) and a status pill that pulses red during the incident and turns green after. Four columns with rolling counts. Below, the timeline card: a play/pause button, a track with day dividers, a heartbeat path (grey in the future, red in the past) and a red playhead, then Mon to Sun labels with today's highlighted. Caption: "Drag the line, or use the arrow keys. Each blip is work moving; the spike on Wednesday is the incident."
3. **Signals**, four counters (29 min median time to resolve, 82% of cycle scope shipped on time, 3.4 h from report to triaged, 140 engineers on one workspace), with a placeholder-figures caption.
4. **Triage** on a grey band: a swipeable deck of incoming issues (key, priority chip, title, reporter and source). Drag right to send it to the cycle ("To cycle" stamp), left to close it ("Close" stamp); buttons do the same; the status line reports each decision; when empty it says "Inbox zero." with counts. Copy: "Inbox to cycle in a flick." plus three points about duplicates, crash context and closing with a reason.
5. **Incident mode** (pinned scroll story), head "When it breaks, everyone knows what to do.", kickers are clock times:
   - 09:02 Detect, "Alerts become incidents in one hold.": the alert, three impact tiles, and "Hold to declare SEV-1".
   - 09:04 Page, "The right people, not everyone.": paging rows (acknowledged, calling with a dot-matrix loader, channel created, status page draft).
   - 09:05 Respond, "The runbook runs with you.": a runbook checklist whose ticked steps strike through and sink away.
   - 09:31 Learn, "The postmortem is mostly written.": a timeline of five events, "Resolved in 29 min", and a copyable incident link chip.
6. **Roadmap and initiatives** on a grey band: head "Progress you don't have to ask for." A card with a stretchy Now / Next / Later switcher; each initiative row shows team, linked issue count, a progress bar that springs to length, an On track / At risk / Off track / Planned chip and a target date.
7. **Pricing**: "One tool instead of four." with a short checklist and a plan picker (Free, Team $10 per engineer, Business $18 per engineer) whose selection ring glides between options and opens the chosen plan's features, then a "Start a 14-day trial" button.
8. **FAQ** (migration, paging, initiative progress, who is a paid seat, data location).
9. **CTA band**: "Run this week's cycle in Pulse." with a red glow.
10. **Footer.**

All people, issues and numbers are invented. No real customers, logos or testimonials.

## Look

- Page `#fbfbfd`, bands `#f5f5f7`, white cards (radius 22-28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`).
- Text `#1d1d1f`, secondary `#6e6e73`, small grey text `#515154` when it sits on grey.
- Accent red `#dc2626` for fills, buttons (white text, 4.8:1) and graphics; `#b91c1c` for red text. Status colours only for meaning: green `#1a7f37` for done and on track, amber `#b25000` for at risk.
- Hero headline `clamp(44px, 5.8vw, 76px)`, weight 600, tracking -0.055em. Section heads `clamp(34px, 5.4vw, 60px)`. Board cards 13px titles and 11px mono keys. Numbers `tabular-nums`.

## Motion

- **Scrub the week (signature).** A motion value `p` (0 to 1) is the playhead; `useSpring(p, { stiffness: 260, damping: 30 })` smooths it. The playhead position and the red clip over the heartbeat path are `useTransform`s of the spring, so dragging never re-renders React. The board only re-renders when the spring crosses into a new six-hour slot (28 slots in the week). Each issue has a small history of `[slot, column]` pairs; the board shows each issue in its column for the current slot. Cards share a `layoutId`, so they spring between columns (340/28) and pop in when created. Column counts roll. While playing, the playhead hops forward one slot every 650 ms, holds at Sunday, then springs back to Monday; any drag or key press pauses autoplay for six seconds, and the play/pause button stops it entirely. The track is a `role="slider"` with arrow keys, Home/End and Page Up/Down.
- The heartbeat path is computed once from the issue histories (a blip wherever work moved, a tall spike for the incident).
- Story visuals swap with a spring (160/24). Roadmap bars spring (90/18). The triage deck tilts with drag and flings with a spring (180/24).
- Reveals rise at most 24px, once, with a small `amount`.

## Motion Kit components used

- **Swipe Stack**, adapted into the triage deck.
- **Hold to Confirm**: declaring a SEV-1.
- **Matrix Loader**: paging in progress.
- **Todo List**: the incident runbook.
- **Copy Chip**: sharing the incident link.
- **Stretch Nav**: Now / Next / Later on the roadmap.
- **Radio Cards**: the plan picker.

## Responsive and accessibility

- At 390px the hero stacks (copy, board, timeline). The board keeps four columns but cards shrink to their issue key; titles return from the small breakpoint up. Fixed-size components use a fit-to-width wrapper. No horizontal page scroll.
- The pinned story decides its layout after mount so the server and client HTML match.
- Real buttons with visible focus rings and labels (play/pause, accept and close in the deck). The event ticker and deck status are `aria-live="polite"`. Contrast at least 4.5:1.
- Autoplay can be paused (WCAG 2.2.2). No `Math.random()` or `Date.now()` during render.

## Final checklist

- [ ] Dragging, keys and autoplay all move the board, the ticker and the status pill consistently.
- [ ] Cards spring between columns; counts roll; the Wednesday spike lines up with the incident.
- [ ] Triage deck, hold-to-declare, runbook, copy chip, roadmap switcher and plan picker all work.
- [ ] One red accent; status colours only for status.
- [ ] No hydration warnings or console errors; no overflow at 390px; reduced motion respected.
