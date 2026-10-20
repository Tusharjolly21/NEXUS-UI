# Build prompt: Simplistic, AI agents that work overnight

Build a single-page landing site for **Simplistic**, a deliberately simple SaaS that runs routine business workflows with AI agents while the team sleeps: inbox triage, invoice reminders, stock sheets, the weekly numbers. Anything risky (sending email, payments over a limit, deleting records) waits for a human, and everyone gets a short list to review in the morning. The feel is calm and quiet: an Apple-light page, plenty of air, one cyan accent, gentle springs, no hype. The copy is plain and specific, and every promise is the kind a small business owner would believe.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens).
- Framer Motion 12 for all animation. No other UI or animation libraries.
- `"use client"` at the top of interactive files. System font stack, no web fonts, no remote images.

## Page structure and copy

1. **Sticky glass nav.** Logo: a cyan ring with a dot that breathes slowly, and "Simplistic". Links How it works, Agents, Pricing, FAQ. Magnetic "Start free" button. Collapses to a dropdown sheet on phones.
2. **Hero (split: copy left, night panel right).** Pill: "AI agents for the work nobody wants at 6pm". Headline: "Go to bed. The work gets done." with "done." in the accent. Sub: "Simplistic runs your routine workflows overnight: inbox triage, invoice reminders, stock sheets, the weekly numbers. Anything risky waits for you, with a short note in the morning." Buttons "Start with one agent" and "How it works". Caption: "Your first agent is free. Drag the timeline to scrub through a real night."
3. **Customer marquee.** "Working the night shift for 2,300 small teams, including" and invented names (Halden Freight, copperleaf, BIRCH & VALE, Ostrander, pinewood supply, Marlow Studio, QUAYSIDE, Tern Analytics).
4. **Principles.** Eyebrow "Calm by design", title "Fewer features. Fewer surprises." Three cards: "It asks first." (risky steps wait in a morning queue), "It writes everything down." (plain-English logs and a 24-hour undo), "It stays small." (no workflow canvas; most agents take four minutes).
5. **How it works (pinned scroll story, on a grey band).** Title "Four steps. No diagrams." Steps on the left, a pinned visual on the right: 01 When, "Pick a trigger." (a menu that grows out of its button with triggers like "Every night at 02:00", "When a file lands", "When an email arrives"); 02 What, "Connect only what it needs." (a magnifying dock of generic tools: Email, Calendar, Spreadsheets, Shared drive, Team chat, Accounting, CRM); 03 Limits, "Set the rules once." (four glass capsule switches: ask before any email, ask before payments over $1,000, never delete records, stop if a run costs over $5); 04 Morning, "Review over coffee." (a to-do list whose ticked items strike through and sink away).
6. **In control.** "Change tonight's plan in one tap." Left: four counters (11.4h saved per person each week, 92% of runs need no edits, 4 min to set up, 24h undo window). Right: an agent card ("Invoice chaser") with a liquid action dial: Run now, Skip tonight, Pause, Edit rules. The card's status line rolls to match the chosen action.
7. **Pricing (one plan).** "One plan. Pay per agent." A card split in two: on the left an elastic stepper for the number of agents (1 to 12) and a capsule switch for yearly billing; on the right, a dark panel with the monthly total rolling like an odometer ("1 free + 2 × $12"), what is included, and a "Start free" button. First agent free, then $12 per agent per month, or $10 yearly.
8. **Quotes.** Marquee of four invented customer quotes.
9. **FAQ.** "Good questions." Mistakes, models, prompts, daytime runs, data location.
10. **CTA band (light).** White panel with a soft cyan glow following the pointer: "Hand over one boring job tonight."
11. **Footer.**

## The look

- Page `#fbfbfd`, grey bands `#f5f5f7`, white cards. Text `#1d1d1f`, secondary `#6e6e73`, body on tinted rows `#424245`.
- Accent: `#0891b2` for fills, tracks and graphics; `#0e7490` for text and buttons (5.4:1 on white). Tints `#ecfeff` and `#cffafe`. Waiting items use amber (`#fef3c7` with `#92400e` text).
- Card radius 22 to 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`.
- Hero headline `clamp(46px, 7.2vw, 88px)`, weight 600, line-height 0.98, tracking -0.055em. Section titles `clamp(34px, 5.4vw, 60px)`. Body 16 to 21px. Captions 12 to 13px. `tabular-nums` on clocks, counts and prices.

## The motion

- **Hero signature interaction: the night scrubber.** A card with a sky above and a run log below. A single motion value `t` (0 is 22:00, 1 is 07:00) runs through a spring (`stiffness 90, damping 22`) and drives everything without React re-renders: the sky gradient (dusk rose to deep navy to dawn peach), twinkling stars that fade at dawn, a moon that travels an arc and hands over to the sun, the track fill and knob, and the clock, whose text is written straight into the DOM. The log only re-renders when another job crosses its timestamp: six jobs (Inbox triage at 22:30, Invoice chaser, Inventory sync, CRM tidy-up, Weekly numbers, Morning brief at 06:45) spring into a fixed-height list, which shows the latest three. Items that need approval get an amber dot. At 07:00 the badge rolls to "Good morning. 3 things need you." The night plays by itself over 13 seconds and loops, until the visitor drags or clicks the track, or uses the arrow keys, Home and End.
- Section reveals: once, short (at most 24px of travel), triggered at a small visible amount, never hiding content. Wrap the root in `MotionConfig reducedMotion="user"`.
- No `Math.random()` or `Date.now()` during render.

## Motion Kit components and their jobs

- **Stagger Menu:** choosing the agent's trigger.
- **Dock:** the tools an agent is allowed to touch.
- **Capsule Toggles:** the agent's rules, and yearly billing in pricing.
- **Todo List:** the morning review queue.
- **Liquid Dial:** quick actions for one agent (run, skip, pause, edit).
- **Elastic Stepper:** how many agents you are paying for.
- **Rolling Number** (from Price Odometer): the monthly total.

## Responsive and accessibility

- At 390px the hero stacks (copy, then the night panel at full width), the sky shrinks to 200px, and nothing scrolls sideways. The pinned story becomes a normal list with each visual under its step, scaled to fit.
- The timeline is a real slider: `role="slider"`, focusable, with arrow, Home and End keys and an `aria-valuetext` such as "3 of 6 jobs done". The log is an `aria-live` list.
- Real buttons and labels, visible focus rings, aria labels on icon buttons, text contrast at least 4.5:1 including captions and marquee names.
- Set an explicit background, text colour and `colorScheme: "light"` on the template root.

## Final checklist

- [ ] The night plays on load and the timeline can be scrubbed by pointer and keyboard.
- [ ] Sky, moon, sun and clock move from motion values, not React state.
- [ ] Only invented companies, people and figures.
- [ ] One accent family (cyan), used consistently.
- [ ] Reveals are short and never leave content invisible.
- [ ] No hydration warnings, no console errors, no horizontal scroll at 390px.
