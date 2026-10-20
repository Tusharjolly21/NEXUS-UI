# Build prompt: Helix — agents do the work, people approve the risky steps

Build a single-page marketing site for **Helix**, a workflow automation platform where AI agents run back-office work end to end (refunds, renewals, access requests, supplier payments) and stop for a person whenever a step is risky. The feel is Apple-light: a near-white page, white cards with hairline shadows, one indigo accent, big tight headlines and calm, spring-driven motion. The hero is the product: a live approval queue the visitor actually works through, not a dashboard screenshot.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4, with colours hard-coded (no theme tokens, so the page looks the same inside a dark-mode host).
- Framer Motion 12 for all animation. No other UI or animation libraries, no remote images, no web fonts.
- `"use client"` at the top of interactive files. Wrap the page root in `<MotionConfig reducedMotion="user">`, give it `background #fbfbfd`, `color #1d1d1f` and `style={{ colorScheme: "light" }}`.

## Page structure and copy

1. **Sticky glass nav.** Logo: two crossing helix strands with a small dot bobbing between them, then "Helix". Links How it works, Use cases, Guardrails, Pricing, FAQ (smooth-scroll to ids, offset for the bar). Indigo "Start free" button. On phones the links fold into a burger sheet.
2. **Hero, split.** Left: a chip "Live demo: five agents, one of you" with a pulsing dot; headline "Agents do the work. **You make the calls.**" (last three words indigo), revealed word by word; sub "Helix runs back-office workflows end to end: refunds, renewals, access requests, supplier payments. When a step is risky, the agent stops, attaches the evidence and asks the right person."; buttons "Start free" and "See how it works"; caption "Try the queue: approve or send back each request. With the queue focused, A and R work too."
   Right: the **approval queue** card (see Motion).
3. **Stats row.** 1.8M steps run by agents last month · 94% of runs finish without a person · 2.7 min median wait for an approval · 100% of decisions signed and logged. Under it: "Sample figures from a demo workspace."
4. **How it works (pinned story).** Eyebrow "How it works", title "Hand over the busywork. Keep the judgement." Four steps with a sticky visual on the right on desktop, inline visuals on mobile: 01 Plan "Describe the job. The agent writes the plan." (a checklist that ticks itself off); 02 Work "Agents work in parallel, all day and all night." (four agent tiles with dot-matrix loaders); 03 Stop "Risky steps stop and go to the right person." (a stopped INV-2207 card with a "Route to" menu: Finance on-call, The controller, Security team, Post in #approvals); 04 Sign "Every decision is signed into the record." (a signature card that seals itself).
5. **Use cases** on `#f5f5f7`. Title "Same idea, every team." A stretching pill switcher Finance / Support / IT / Revenue. The panel shows the workflow as step tiles, with the approval step filled indigo, plus three numbers (for example 1,240 invoices a week · 7% stop for a person · 3.1 min median approval).
6. **Guardrails bento.** Title "Rules your auditor can read." Cards: approval policies as sentences with switches (turning one off swaps its caption to "Off: agents will do this without asking" in amber); "One switch stops everything." with a hold-to-pause button; "Evidence comes attached." with file chips; "Approve where you already are." with a chat-style approval message.
7. **Testimonials.** Three cards with invented people and companies (for example Ana Duarte, Controller, Brightwater Supply).
8. **Pricing.** Title "Agents are free. Pay for the people who approve." Plan list Starter (Free), Team ($39 per approver / mo), Business ($79) as radio rows with a sliding ring; a calculator card with an approvers stepper (1 to 20) and a rolling monthly total.
9. **FAQ** accordion (what counts as risky, what if nobody approves, permissions, data region, setup time).
10. **CTA band** (dark, pointer-following glow): "Clear your first queue this afternoon." Buttons "Start free" and "Book a walkthrough".
11. **Footer** with Product, Teams and Company columns and a placeholder note.

## Look

- Page `#fbfbfd`, alternate sections `#f5f5f7`, cards white. Text `#1d1d1f`, secondary `#6e6e73` (use it for captions too, never lighter, to stay above 4.5:1). Accent `#4f46e5`, soft tint `#eef0ff`, amber warnings `#8a4b00` on `#fff4e0`.
- System font stack (`-apple-system, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui`). Hero headline `clamp(44px, 7vw, 84px)`, weight 600, line-height 0.98, tracking -0.05em. Section titles `clamp(34px, 5.4vw, 60px)`, tracking -0.04em. Body 17 to 21px, captions 12 to 13px.
- Cards: radius 24px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. Inner tiles radius 16 to 18px. Numbers use `tabular-nums`.

## Motion

- **Hero queue (signature).** Five requests, three visible at first; a new one arrives every 9 seconds. The top request is expanded (agent with a dot-matrix loader, title, amber "Stopped: …" chip, three evidence lines, Approve and Send back buttons); the rest are collapsed grey rows. Deciding stamps "Approved" or "Sent back" onto the card (spring from scale 1.9 and rotate -18deg to 1 and -9deg, stiffness 600, damping 20), then after about 0.6s the card exits and the next row expands, all via `layout` with a spring (stiffness 420, damping 34). The pending badge number rolls. A "Meanwhile, without asking" feed at the bottom adds a finished-work line every 2.9s and the result of each decision. Empty queue shows "Queue clear." and a Refill button.
- Reveals: fade and lift at most 24px, once, small amount threshold. Word-by-word headline reveal.
- Use-case panels slide in from the side (spring stiffness 300, damping 30); policy captions roll vertically when toggled.
- Hold-to-pause fills while held, springs back if released (stiffness 260, damping 22), then bursts into a check with an undo countdown.
- Drive continuous motion with motion values, never with per-frame React state.

## Motion Kit components used

- **Todo List**: the agent's plan, ticking steps off.
- **Matrix Loaders**: live state of each agent in the queue, feed and agent grid.
- **Stagger Menu**: the "Route to" escalation picker.
- **Sign & Seal**: the signed approval record.
- **Stretch Nav**: the team switcher in Use cases.
- **Switch (Settings Tabs)**: policy on/off.
- **Hold to Confirm**: kill switch, restyled with a pause icon.
- **Elastic Stepper**: approver count in pricing.

## Responsive and accessibility

- Stack the hero below 1024px; the queue goes full width and stays fully usable. Pinned story becomes inline steps below 1024px, with visuals scaled to fit. No horizontal scroll at 390px.
- Real `<button>` elements, visible focus rings in the accent, `aria-live` on the queue badge and feed, radio semantics on the plan list, labelled switches. Keyboard shortcuts only fire when the queue has focus and never inside inputs.
- No `Math.random()` or `Date.now()` during render. Pointer-only effects only on fine pointers. Respect reduced motion.

## Checklist

- [ ] Queue works with mouse, touch and keyboard, and keeps refilling.
- [ ] One accent colour, hard-coded, light scheme forced.
- [ ] All customers, people and numbers are invented and labelled as placeholders.
- [ ] Reveals short, never leave content hidden, no layout shift.
- [ ] Clean console, no hydration warnings, no overflow at 390px.
