# Lumis — AI automation agency landing page

Build a one-page landing site for **Lumis**, a small AI automation agency that designs, builds and runs custom AI agents for companies with 10 to 500 people. The pitch is practical, not hype: agents take over the dull half of the work, live inside the tools a company already uses, and ask a person before anything important goes out. The page should feel calm and precise: a near-white page, one fuchsia accent, and a hero that is a live, draggable workflow. All clients, people and numbers are invented placeholders.

## Stack

- Next.js (App Router), one `"use client"` page component, React 19, TypeScript strict.
- Tailwind CSS 4 with hard-coded hex colours (no theme tokens). Framer Motion 12. No other dependencies, no remote images, no web fonts.
- Root: `<MotionConfig reducedMotion="user">`, background `#fbfbfd`, text `#1d1d1f`, `colorScheme: "light"`.

## Page structure and copy

1. **Sticky glass nav.** Logo: three dots joined in a V (two fuchsia, one dark that pulses) and "Lumis". Links: Services, Process, Results, Pricing, FAQ. Magnetic CTA "Book a call".
2. **Hero, the workflow canvas.** The whole hero is one large white rounded panel (radius 32px) with a faint dot grid and a soft fuchsia glow in one corner. Inside, top left: a pill "AI automation agency · 61 agents in production" and the H1 "AI agents for the **boring half** of your business." Top right: the subline and two CTAs ("Book a 30-min call", "See client results"). Below, the canvas: five nodes in a zigzag row connected by curved wires: Trigger → Agent → Agent → Human → Done. Under the canvas, a chip row "Pick a job your team would happily give away": Answer support email, Chase unpaid invoices, Qualify new leads, Book jobs from calls. To the right, a pale fuchsia box: "Hours handed back this week" with a rolling number (starts at 312) and a one-line status ("Waiting on a human. Press Approve.").
3. **Numbers.** Four counting stats: 61 agents running, 38k hours handed back in 2026, 6 wks median to live, 100% of outbound messages checked by a rule you set.
4. **Services.** Title "Four kinds of agent cover most of the dull work." Four spotlight cards (Support, Finance, Sales and Phone agents), each with a small animated dot-matrix "working" icon, two lines of description and a typical saving in accent.
5. **Process, a pinned scroll story.** "Live in about six weeks, with you in the loop the whole way." Week 1 Audit (a file drop that turns SOPs, CSV exports and screen recordings into uploading chips); Weeks 2–4 Build (a "Test runs before launch" board with dot-matrix loaders: replaying 1,240 past tickets, checking refund rules, red-teaming angry customers, load test); Week 5 Approve (a swipeable review queue of drafted actions: a refund, an invoice reminder, a booking, a pricing email, a review reply, each with the agent's name and confidence; right sends, left holds); Week 6 on Run (an activity grid of tasks handled per day that stands up into 3D columns).
6. **Client results.** Title "Small teams, real hours back." A quote card from an invented COO, and two expanding story cards (a 12-clinic dental group, a 40-person freight firm) that open into sheets with the full story and numbers.
7. **ROI and pricing.** "Do the maths before you call us." Left card: an elastic stepper for "People doing this work" (1–20) and a ruler picker for "Hours each, per week" (0–40, presets 5/10/20/30). Right, dark card: rolling numbers for hours back per month (people × hours × 52 × 0.6 / 12), what that's worth at €32/h, and payback weeks on an €18k build, with the note "An estimate, not a promise." Below, three tiers: Audit €4,500, Build from €18k, Run €1,200 / mo per agent.
8. **Book a call.** "Thirty minutes, no slides." Three checkmark promises on the left. Right: a card with five day buttons (Mon 2 Nov … Fri 6 Nov), a 3×2 grid of time slots (taken slots struck through and disabled), "Times shown in Lisbon (WET)", the chosen slot summary, and a booking button that stretches into its own progress bar ("Holding your slot · 64%") then lands on a green "Booked · see invite".
9. **FAQ**, five questions: technical people, which tools, mistakes, data location, owning the agent.
10. **CTA band:** "Give the boring half to an agent." and **footer**.

## Look

- Accent fuchsia `#a21caf` (6.3:1 on white); soft tint `#fdf4ff`; text `#1d1d1f`, secondary `#6e6e73`; sections alternate `#fbfbfd` and `#f5f5f7`; the ROI result card is `#1d1d1f` with `#a1a1a6` labels.
- H1 `clamp(40px, 6.4vw, 84px)`, weight 600, tracking −0.055em, line-height 0.98. Section titles `clamp(34px, 5.4vw, 60px)`. Node titles 13px semibold, captions 12px.
- Cards white, radius 28px (nodes 20px), shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Wires: a grey dashed base (`#c7c7cc`, dash 3 6) under a 2.2px fuchsia stroke.

## Motion

- **Signature hero interaction: a workflow that builds itself and waits for you.** Choosing a job resets the canvas; pending nodes sit dimmed (50% opacity, greyscale, scale 0.95) and light up one by one (spring stiffness 420, damping 26) every 0.7s, each wire draws with `pathLength` (spring 90/20) and then carries a looping dot (SVG `animateMotion` along the wire). The Human node lights a fuchsia ring and a pulsing "Approve" button and the run pauses. Press it and the Done node turns green, the hours counter rolls up by that workflow's weekly saving, and after 4.6s, if you haven't interacted, the next job starts. The page loads on a finished run of the first job (all five nodes, 338 hours) so the first view is never empty; that first finished run stays up for 9s. If you have, it waits for you to press Approve. On fine pointers every node is draggable inside the canvas and the wires follow live: node positions are motion values and each wire's `d` is a `useTransform` of both nodes' base and drag offsets, so dragging never re-renders React. Narrow canvases switch to a zigzag column.
- Reveals: once, ≤24px of travel, small `amount`. Springs for chips (480/34), day and slot selection (460/34).
- Read media queries after mount so server and client HTML match.

## Motion Kit components used

- **Upload Chips:** the audit intake (sample SOPs, exports, recordings).
- **Matrix Loaders:** service icons and the pre-launch test board.
- **Swipe Stack:** the human review queue for drafted actions.
- **Standing Calendar:** tasks handled per day, recoloured fuchsia.
- **Expanding Card:** client case studies.
- **Elastic Stepper** and **Ruler Picker:** the ROI inputs.
- **Price Odometer** (its rolling digits): the hours and euro read-outs.
- **Progress Button:** the booking button.

## Responsive and accessibility

- No horizontal scroll at 390px: the hero panel keeps 12px side margins, the canvas becomes a vertical zigzag 540px tall, chips wrap, the pinned story stacks with inline visuals, and fixed-size demos scale to fit.
- Real buttons with `aria-pressed` or `role="radio"`/`aria-checked`, a screen-reader list of the current workflow's steps, `aria-live` on the counter status and booking summary, focus rings in the accent, and 4.5:1 text contrast (taken slots stay `#6e6e73`).

## Checklist

- [ ] The hero runs on its own, pauses at the human step, and responds to Approve, chips and dragging.
- [ ] Six or more Motion Kit components, each doing an agency job.
- [ ] One accent, hard-coded colours, explicit background and light colour scheme.
- [ ] No hydration warnings; nothing random during render.
- [ ] Reduced motion respected; springs, not linear tweens.
- [ ] No real companies as customers or testimonials.
