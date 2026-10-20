# Build prompt: Orion — autonomous incident response inside your guardrails

Build a single-page marketing site for **Orion**, an enterprise operations platform whose agents run runbooks when alerts fire (diagnose, plan, act, verify) with governance and a full audit trail. The feel is Apple-light with an operator's precision: near-white page, white cards, one deep teal accent, monospace details for logs, and spring-driven motion. The hero is an incident console where the visitor tunes the autonomy policy and watches the same incident replay under that rule.

## Stack

- Next.js (App Router), React 19, TypeScript strict.
- Tailwind CSS 4 with hard-coded colours (no theme tokens).
- Framer Motion 12 only. No remote images, no web fonts.
- `"use client"` on interactive files; root in `<MotionConfig reducedMotion="user">` with `background #fbfbfd`, `color #1d1d1f`, `colorScheme: "light"`.

## Page structure and copy

1. **Sticky glass nav.** Logo: three teal dots on a diagonal line, the middle one breathing, then "Orion". Links Runbooks, Governance, Audit, Pricing, FAQ. Button "Book a pilot".
2. **Editorial hero.** Two columns aligned to the bottom: left a monospace chip "INC-2291 is replaying below" and the headline "Incidents fixed at machine speed, **inside your rules.**" (accent on the last three words); right the sub "Orion agents run your runbooks when alerts fire: diagnose, plan, act, verify. How far they go on their own is a policy you set per service, and every step lands in an audit trail you can hand to a regulator." with "Book a pilot" and "How governance works". Below, full width, the **incident console**, and a caption "Drag the autonomy dial or change the host limit. The same 02:14 incident replays under your rule."
3. **Proof strip** (white band): 71% of Sev 2 and Sev 3 incidents closed without paging anyone · 4.6 min median time to resolve · 0 actions taken outside a written policy. "Figures from a sample pilot… Placeholder data."
4. **Runbooks** on `#f5f5f7`: "The runbooks you already wrote, finally executable." A copyable command `orion import ./runbooks --dry-run` and three folders (Deploys, Databases, Capacity) that tip open to show their files.
5. **Governance (pinned story).** "Autonomy you can explain to your auditor." 01 Scope (capsule toggles for Restart pods, Scale up to 2x, Roll back a deploy, Change DNS, Fail over a database, with a live "3 of 5 allowed"); 02 Pause (a runbook with a Pause / Resume button); 03 Two people (two approvers from different teams check in); 04 Record (hash-chained audit lines with "Chain verified").
6. **Postmortems** on `#f5f5f7`: "It writes the postmortem. The evidence stays underneath." A page you peel from the corner: the front is the drafted summary, the back is the raw exported timeline in monospace on dark teal.
7. **History**: "Thirty weeks of incidents, standing up." A contribution grid that stands up into 3D teal columns.
8. **Testimonials**: three invented SRE and infrastructure leads.
9. **Pricing**: "Priced per protected service." Radio cards Team ($900/mo, 25 services), Business ($3,600/mo, 150 services), Enterprise (custom) with features revealed on selection; a dark teal gradient card listing what every plan includes and "Book a 30-day pilot".
10. **FAQ**, **CTA band** ("Let the 2 a.m. page handle itself."), **footer**.

## Look

- Page `#fbfbfd`, bands `#f5f5f7` and white, console side panel `#f7f8f9`. Text `#1d1d1f`, secondary `#6e6e73`. Accent `#0e7490`, tint `#e0f2f6`, light accent `#a5dbe6`, waiting state amber `#8a4b00` on `#fff4e0`.
- System font stack, logs in `ui-monospace, "SF Mono", Menlo`. Headline `clamp(40px, 5.8vw, 74px)`, weight 600, tracking -0.05em. Card radius 24px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`. `tabular-nums` everywhere numbers change.

## Motion

- **Autonomy dial (signature).** A rail with four detents (Observe, Suggest, Safe actions, Autonomous). Dragging moves the knob through a spring (stiffness 520, damping 34); the knob stretches horizontally with its velocity (`useVelocity`), the level name rolls as you cross a detent, and release snaps to the nearest detent (stiffness 500, damping 26). Also clickable labels and arrow keys (`role="slider"`).
- **Replay.** Changing the level, the host limit (25 / 50 / 100) or pressing Replay restarts a scripted timeline: entries appear every 0.85s, with a longer 1.7s pause on policy gates. Observe pages a person and the human rolls back (24m 55s); Suggest waits for approval (10m 08s); Safe actions scales up alone then asks (6m 05s); Autonomous rolls back 38 hosts itself (4m 33s) unless the host limit is 25, when it asks first. A packet on the stage rail springs to the current stage (stiffness 120, damping 20), nodes fill as they complete, a waiting node turns amber, and "time to resolve" rolls in once closed.
- Folders open on hover; the page curl follows the pointer and lies back down on a spring; calendar columns rise in a wave. Reveals at most 24px and once.

## Motion Kit components used

- **Capsule Toggles**: per-action scope switches.
- **Folder Peek**: runbook libraries.
- **Copy Buttons** (command line): the import command.
- **Page Curl**: postmortem over raw evidence.
- **Standing Calendar** (teal copy): incident history.
- **Radio Cards**: plan picker.
- **Matrix Loaders**: "Orion is working" and "waiting" indicators, chain verification.

## Responsive and accessibility

- Hero columns stack; the console's policy panel moves above the incident; the stage rail stays horizontal with 11px labels; the audit trail keeps a fixed height and shows the newest entries. Pinned story becomes inline below 1024px with visuals scaled to fit. No horizontal scroll at 390px.
- Labelled slider and radio group, `aria-live` on the audit trail, focus rings in the accent, real buttons, text contrast of at least 4.5:1 including captions.
- No randomness or time reads during render; timers live in effects and are cleared.

## Checklist

- [ ] Every dial position and host limit produces a different, believable outcome.
- [ ] One accent, hard-coded colours, forced light scheme.
- [ ] Invented customers and figures only, labelled as placeholders.
- [ ] Clean console, no hydration warnings, no overflow at 390px.
