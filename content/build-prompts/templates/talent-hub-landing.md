# TalentHub — remote staffing agency landing page

Build a one-page landing site for **TalentHub**, a staffing agency that places vetted remote engineers, designers and operators from Latin America, Europe, Africa and Asia with startups, and handles contracts, payroll and compliance. The question every founder has about remote hires is "will they be awake when we are?", so the hero answers it with an interactive planner of shared working hours. Tone: plain, specific, reassuring. One sky-blue accent on a white page. All people, companies and numbers are invented placeholders.

## Stack

- Next.js (App Router), one `"use client"` page component, React 19, TypeScript strict.
- Tailwind CSS 4 with hard-coded hex colours (no theme tokens), Framer Motion 12, no other dependencies, no remote images or web fonts.
- Root: `<MotionConfig reducedMotion="user">`, background `#ffffff`, text `#1d1d1f`, `colorScheme: "light"`.

## Page structure and copy

1. **Sticky glass nav.** Logo: a pale blue disc with three blue dots orbiting a dark centre, then "TalentHub". Links: Talent, Process, Why us, Pricing, FAQ. Magnetic CTA "Start hiring".
2. **Hero.** A two-column heading row: left, eyebrow "Remote staffing for startups" and H1 "Great people who share your **working day.**"; right, the subline ("TalentHub places vetted engineers, designers and operators… You get a shortlist in three days."), CTAs "Start hiring" and "How it works", and the note "No fee until your hire starts. Free replacement in the first 90 days." Below, full width, the **shared-hours planner** card:
   - "Where is your team?" chips: San Francisco (UTC−8), New York (−5, default), London (0), Berlin (+1).
   - A big rolling count, "181 vetted people share at least 4 hours of your 09:00–17:00 day".
   - A 24-hour scale in your local time, then a "You" row with a draggable 8-hour block, then six hub rows: Bogotá (−5, 46 people), Buenos Aires (−3, 63), Lisbon (0, 38), Kraków (+1, 41), Cape Town (+2, 29) and Manila (+8, night shift starting 21:00 local, 72). Each row shows that city's 9-to-5 as a light bar converted into your time (split in two if it crosses midnight), the shared hours as a dark bar, and "6 h" on the right (accent when ≥4 h).
   - Footnote: "Light bars are each city's working day, shown in your time. Dark bars are the hours you share. Times ignore daylight saving."
3. **Numbers.** 2,140 applied last month, 3% made it through vetting, 72 h median to a shortlist, 94% still placed after twelve months.
4. **The bench.** "Who's available this month." Discipline lines (Engineering, Design, Operations) beside a bubble cluster of available people sized by years of experience; switching discipline re-packs the cluster.
5. **How it works, a pinned scroll story.** "From brief to first day in about two weeks." Day 1 Brief (a role menu that grows out of its button: Full-stack engineer, Product designer, Operations manager, Support lead, Bookkeeper; picking one updates a brief summary chip); Day 3 Shortlist (a swipeable candidate deck with name, role, skills, city, shared hours and monthly rate; right books an interview, left passes); Day 5 Interview (a folder that tips open to show the code test, interview notes and references); Day 14 Start (an onboarding checklist where ticked rows strike through and sink away).
6. **Why a staffing partner.** "Hiring abroad yourself is possible. It's just slow." A comparison table, Hiring directly vs With TalentHub: time to shortlist, contracts and payroll, if it doesn't work out, upfront cost.
7. **Pricing.** "One monthly price per person. Everything in it." A checklist of what's included beside a price card: Rolling / 12 months toggle, a rolling odometer total (e.g. "$8,400 /mo"), "$4,200 per hire per month, cancel any month", and a "People placed" slider (1–25).
8. **From founders.** Three quote cards from invented founders.
9. **FAQ**, five questions: where people come from, employees or contractors, hiring directly later, if a hire isn't working out, part time.
10. **CTA band:** "Your next hire is already awake." and **footer**.

## Look

- Accent `#0369a1` (5.9:1 on white); tint `#e0f2fe`; light hub bars `#cfe3f1`; partial overlap `#7aa7c7`; tracks `#f5f5f7`. Text `#1d1d1f`, secondary `#6e6e73`. Sections alternate white and `#f5f5f7`.
- H1 `clamp(44px, 7vw, 88px)`, weight 600, line-height 0.98, tracking −0.055em; count `clamp(48px, 6vw, 68px)` tabular. Row labels 14px, captions 12px.
- Cards white, radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Planner tracks radius 9–12px; your block has a blue glow shadow.

## Motion

- **Signature hero interaction: drag your working day.** The block's x is a motion value driven by Framer drag (constrained to the track, no momentum). While dragging, its position snaps in 30-minute steps to set your start hour. Only that snapped hour goes into React state, so overlaps recompute twice per hour of travel, not every frame. On release it springs onto the snapped slot (stiffness 420, damping 32). Overlap bars animate their left and width with springs (320/28), and a faint band in every row follows the same motion value, so you can see your day across all six cities at once. The headline count springs between totals (140/22) and is rendered from a motion value. The block is also a keyboard slider (arrow keys ±30 min, `aria-valuetext` "09:00 to 17:00"). Changing city re-derives every row.
- Reveals once, ≤24px, small `amount`; table rows stagger 0.06s. City chips use a shared `layoutId` pill (480/34).
- Read media queries and measure the track after mount, never during render.

## Motion Kit components used

- **Bubble Cluster:** the bench of available people per discipline.
- **Stagger Menu:** choosing the role in the brief.
- **Swipe Stack:** reviewing the candidate shortlist.
- **Folder Peek:** the candidate's paper trail.
- **Todo List:** the day-one onboarding checklist.
- **Price Odometer:** per-hire pricing with rolling digits.

## Responsive and accessibility

- At 390px: the heading row stacks, the planner rows put the city label and shared hours above a full-width track, hour labels thin out to every six hours, the pinned story stacks with inline visuals, the comparison table keeps three readable columns, and nothing scrolls sideways.
- Real buttons with `role="radio"`/`aria-checked` for city chips, `aria-live` on the count, ARIA table roles on the comparison, labelled icon buttons on the swipe deck, focus rings in the accent, and text contrast of at least 4.5:1.

## Checklist

- [ ] Dragging your day changes the overlaps and the count; keyboard works too.
- [ ] Six or more Motion Kit components, each doing a staffing job.
- [ ] One accent, hard-coded colours, explicit background and light colour scheme.
- [ ] No hydration warnings; nothing random during render.
- [ ] Reduced motion respected; springs, not linear tweens.
- [ ] No real companies, clients or testimonials, and no "X-style" naming.
