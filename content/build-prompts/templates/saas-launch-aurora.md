# Build prompt: Aurora, an edge deploy platform

Build a single-page landing site for **Aurora**, an edge deploy platform whose promise is "push once, live in 18 regions in 38 seconds". Aurora builds an app once, ships it to every region in parallel, sends a small slice of traffic to the new version first, and rolls back by itself if errors climb. The feel is Apple-light and precise: a white page, one emerald accent, a big dotted world map as the hero stage, dark terminal and pricing panels as the only heavy surfaces. The copy is technical but plain, and every number is explained (the FAQ says how the 38 seconds is measured).

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens).
- Framer Motion 12 for every animation. No other animation, map or UI libraries.
- `"use client"` on interactive files. System font stack for text, `ui-monospace, SF Mono, Menlo` for code. No remote images or web fonts.

## Page structure and copy

1. **Sticky glass nav.** Logo: two emerald arcs with a small dot that bobs, and "Aurora". Links Pipeline, Rollouts, Developers, Pricing, FAQ. Magnetic "Deploy free" button; dropdown sheet on phones.
2. **Hero.** Top row: on the left a status pill ("All 18 regions operational", with a pulsing dot) and the headline "Push once. Live in 18 regions in 38 seconds." with "38 seconds." in the accent; on the right the sub ("Aurora builds your app once, ships it to every edge region in parallel, and rolls back on its own if errors climb. Click any region on the map to push from there.") and the buttons "Deploy free" and "How a push works". Below, a full-width dotted world map (about 1,300 dots generated from rough continent outlines, plus 18 region nodes). A white status card sits over the top right ("Regions live 12 / 18", "Since push 31.4s"), and a dark terminal card overlaps the bottom left of the map.
3. **Customer marquee.** "Shipping to the edge for 9,400 teams, including" with invented names (Fernway, KILN, outpost labs, Quillmark, SALTBOX, Harbor & Pine, Novarum, TELLER).
4. **Stats.** 38s median from push to live everywhere; 18 edge regions on every plan; 99.99% edge availability over the last 90 days; 0.4s median time to roll back.
5. **Pipeline.** "From git push to everywhere." Three cards: 01 Detect, "It reads the repo." (a folder that tips open to show `package.json`, `aurora.toml` and `app/page.tsx`); 02 Build, "Once, with a warm cache." (a build log where each step shows a dot-matrix loader while it runs and a check when done); 03 Ship, "Everywhere, and it tells you." (a stack of deploy notifications: deploying, preview ready, canary paused, rolled back).
6. **Safe rollouts (grey band).** "Ship to five percent first." Left card: canary controls, three sliders whose knob leaps along an arc when you click the track (canary traffic, error budget, watch time). Right card: an amber alert row ("a41f9c2 · error rate 2.1% in Singapore, budget 1%") above a hold-to-confirm button, "Hold to roll back", that bursts into a check and offers an undo timer.
7. **Deploy history.** "Deploy often. Sleep fine." A contribution grid of 30 weeks of deploys that stands up into 3D columns.
8. **Developers (grey band).** "One command, one small file." A copyable `npx aurora deploy` command, four check-marked facts, and a light code card showing a 13-line `aurora.toml` with simple syntax colours, lines sliding in one after another.
9. **Pricing.** "Every plan gets every region." Radio cards for Hobby (free), Pro ($24 per member) and Scale (custom). A dark summary panel beside it swaps its price and note with a spring when the plan changes.
10. **Quotes, FAQ ("Before you push.") and a dark CTA band:** "Your next push could be live everywhere."
11. **Footer.**

## The look

- Page `#fbfbfd`, bands `#f5f5f7`, white cards; dark panels `#1d1d1f` with `#e8e8ed` text and `#a1a1a6` secondary text.
- Accent: `#059669` for fills, map nodes, arcs and sliders; `#047857` for text and buttons (5.5:1 on white); mint `#6ee7b7` on dark surfaces; tints `#ecfdf5` and `#d1fae5`. Amber `#d97706` only for the canary warning.
- Map dots `#d4d7dd`, radius 2.3 on a 9-unit grid. Unlit nodes are white with a grey ring; lit nodes fill emerald.
- Radius 24 to 28px on cards, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. The terminal has an emerald-tinted drop shadow.
- Hero headline `clamp(44px, 7vw, 88px)`, weight 600, tracking -0.055em, line-height 0.98. Captions 12 to 13px in `#6e6e73`. `tabular-nums` for every count, timer and price.

## The motion

- **Hero signature interaction: push from anywhere.** Clicking a region on the map (each node has a real, focusable button over it) or one of the "Push from" chips in the terminal starts a rollout from that city. One motion value, `elapsed`, runs from 0 to 37.6 seconds, replayed five times faster and labelled as such. It writes the timer straight into the DOM and drives an expanding emerald ring centred on the origin. The terminal reveals its lines at fixed times: detected, building (with a loader), built in 14.2s, uploading, rolling out from the city, and finally "Live in 18 regions · 37.6s". Each region lights when the ring reaches it (its time is proportional to its distance from the origin), with a pulse and an arc that draws itself from the origin. React only re-renders when a stage or the lit count changes. Until the visitor clicks, the hero pushes by itself from Frankfurt, Virginia, Singapore and Sydney in turn.
- Springs everywhere else: node fill `stiffness 500, damping 20`; arcs `stiffness 60, damping 18`; log lines `stiffness 260, damping 26`. Reveals run once, travel at most 24px and never leave content hidden. Wrap the root in `MotionConfig reducedMotion="user"`. The map is computed at module load, so the server and client render the same dots.

## Motion Kit components and their jobs

- **Folder Peek:** the repo with its detected config files.
- **Matrix Loaders:** running build steps, in the pipeline and in the hero terminal.
- **Toast Stack:** deploy, preview, canary and rollback notifications.
- **Bolting Sliders:** canary traffic, error budget and watch time.
- **Hold to Confirm:** a deliberate manual rollback with undo.
- **Standing Calendar:** the deploy history.
- **Copy Buttons:** the CLI command.
- **Radio Cards:** plan selection.

## Responsive and accessibility

- At 390px the hero stacks: headline, sub and buttons, then the map at full width, then the status card and the terminal as normal blocks under it. Region buttons stay at least 24px. No horizontal scroll; wide components scale to fit the column.
- Real buttons with focus rings, `aria-pressed` on the origin chips, `aria-live` on the status card, keyboard support for sliders and the hold button (Space or Enter held down).
- Text contrast at least 4.5:1, including captions and marquee names.
- Explicit background, text colour and `colorScheme: "light"` on the root.

## Final checklist

- [ ] The hero rolls out on load, and clicking any region restarts it from there.
- [ ] Timer, ring and lit count stay in sync, and the run ends at 37.6s with all 18 lit.
- [ ] Only invented companies, people and figures.
- [ ] One accent family (emerald), with amber only for the canary warning.
- [ ] No hydration warnings, no console errors, no horizontal scroll at 390px.
