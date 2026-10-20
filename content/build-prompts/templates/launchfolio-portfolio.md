# Build prompt: Launchfolio — product designer case study portfolio

Build a single-page portfolio for **Launchfolio**, the work of Maya Okafor, a product designer who redesigns the screens where customers give up. It is case-study driven rather than personal: every section is a problem, what was learned, the shipped interaction and the number that moved. The feel is clean and evidential: white page, light grey sections, one dark band, white cards, product UI drawn in CSS, and one warm orange. The hero is a real redesign you can drag: a before/after checkout whose divider drives the results beside it.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so it looks the same in a dark-mode host. Set `colorScheme: "light"` and explicit background and text colours on the root.
- Framer Motion 12 for all motion. No other UI libraries, no remote images, no web fonts. Screens are drawn with divs.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky glass nav.** Logo: a dark rounded square with an orange chevron that draws itself, plus "Launchfolio". Links Case studies, Fernway, Process, Contact; an orange "Book a call".
2. **Hero, demo first.** Left (wider) column: "Case 01 · Fernway checkout" / "Shipped March 2026", then a **Before / After** frame (local copy that accepts an external motion value for the divider, an aspect class and a ring colour; 16:10, 4:5 on phones). Both layers sit in a browser frame with a tall bar and a centred "fernway.shop/checkout" pill so the chips "Before · 3 steps" and "After · 1 page" rest on its ends. Before: a red promo banner, a three-step indicator, eleven tiny required fields including "Confirm email" and "Create a password", a deals checkbox, an upsell grid, a coupon box and a grey "Continue to shipping". After: "Express pay", "or pay by card", four fields with an address suggestion ("12 Larch Road, Bristol BS6 · Use this"), a summary with "Delivery Thu, 8–10 am" and an orange "Pay $64.20". Under it the Before / Split / After control, four chips (7 fields removed, Guest checkout by default, Address lookup, One obvious button) and "Numbers between the ends are blended as you drag; the ends are the measured before and after." Right column: "Maya Okafor · Product designer", headline "I redesign the screens where customers **give up.**", sub "Checkouts, onboarding, uploads. Each case study shows the screen, what I learned and the number that moved. Drag the divider to see this one change." Three live metrics with orange bars: Checkout completion 58% → 81%, Median time to pay 2:41 → 0:52, Fields to fill 11 → 4. Buttons "Read the case studies", "Book a call". On phones the copy comes first.
3. **Proof**: count-up stats — 14 products shipped since 2017, +19 pts average lift, 3 design systems in production, 6 wks typical kickoff to shipped.
4. **Case studies** (`#work`), grey. "Three folders. One problem each." Three cards, each with a **Folder Peek** (Fernway in orange, Ledgerly in slate, Tidepool in teal, with file counts and durations), the kind of work, the headline result (+23 pts completion, −74% cancelled uploads, 41 one-offs → 1 pattern) and "Read case 0n →".
5. **Case 01 · Fernway** (`#fernway`). "A checkout people actually finish." with the role line. One card with a **Stretch Nav** of chapters — Problem (a funnel 100 / 71 / 64 / 58% that grows in), Research (three participant quotes from 14 sessions), Design (seven removed fields that strike through one by one, tagged auto-filled, after payment or optional), Outcome (count-ups 81%, 0:52, −38% order tickets, plus how it was measured). Chapters slide in from the side.
6. **Case 02 · Ledgerly** (`#ledgerly`), grey. "Receipts in, dread out." Three ruled notes: What I changed, What I left out, What moved. Beside it an app card "Ledgerly · Expenses / October receipts" tagged "The shipped component" holding live **Upload Chips** ("Drop real files here to try it. Nothing leaves your browser.").
7. **Case 03 · Tidepool** (`#tidepool`). "Four apps, one system, five months." A bento: "Documented by layer." with **Component Layers**; "Tokens you can feel." with **Scrub Inputs**; a wide "41 settings screens became one pattern." with **Settings Tabs** and two stats (−63% settings code, 4 → 1 apps on one kit).
8. **Process** (`#process`), dark band `#1d1d1f`. "Seven weeks, one number." Four steps (Week 1 Listen, Week 2 Prototype the riskiest screen, Weeks 3–6 Ship with your engineers, Week 7 Measure, then write it up) on a scroll-linked orange line, horizontal on desktop and vertical on phones; each node lights and pops as the line reaches it.
9. **From the teams**: three quotes from invented partners with initials avatars.
10. **Contact** (`#contact`), grey. "Tell me which screen is costing you." A form card: a **Stagger Menu** for project type (Redesign a flow, New product 0 to 1, Design system, Audit and advice), start-date pills with a gliding orange pill, a one-sentence textarea, work email and "Send the brief", which swaps to a thank-you state that says nothing was sent.
11. **FAQ**, **CTA band** ("Bring me the screen people give up on."), **Footer** (Cases, Working together, Elsewhere; note "Product design case studies by Maya Okafor.").

## Look

- Page white, sections `#f5f5f7`, dark band `#1d1d1f` with `#f5f5f7` / `#a1a1a6` text and `#fdba74` eyebrows. Ink `#1d1d1f`, secondary `#6e6e73`.
- Orange `#ea580c` for graphics and bars, `#c2410c` for text and buttons (5.2:1 on white), wash `#fff4ec`.
- System font stack. Hero headline `clamp(40px, 4.4vw, 62px)`, weight 600, tracking -0.045em; section titles `clamp(34px, 5.4vw, 60px)`; metric values 26px with `tabular-nums`.
- Cards radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.

## Motion

- Hero: one motion value (0–100) is the divider. The frame springs it (stiffness 380, damping 34, mass 0.6); the page springs its own copy the same way and maps it with `useTransform` to the three metric texts and bar widths, so nothing re-renders the page while you drag. Jump buttons use a bouncier spring (160 / 18); autoplay sweeps 50 → 18 → 82 → 50 every 6.5 s until touched.
- Folders peek on autoplay and on hover. Chapter panels slide 16px with a spring (300 / 30). The funnel and strike-throughs grow in with springs (120–200 / 20–24).
- Process line follows `useScroll` through a spring (120 / 24); nodes interpolate grey → orange and scale to 1.25 as the line passes.
- Reveals travel 20px or less, once.

## Motion Kit components and their jobs

- Before / After (local copy): the checkout redesign and the hero signature.
- Folder Peek: case study index. Stretch Nav: case chapters.
- Upload Chips: Ledgerly's shipped upload flow.
- Component Layers, Scrub Inputs, Settings Tabs: Tidepool's design system.
- Stagger Menu: project type in the brief.

## Responsive and accessibility

- At 390px the hero copy and metrics come first, the frame switches to 4:5 and hides the address pill, case cards stack, wide components use a fit-to-width scaler, the process line turns vertical, and nothing scrolls sideways.
- The divider handle is a `role="slider"` with arrow-key support and `aria-valuetext`; chapter content is in an `aria-live` region; pills are radio groups; icon buttons have labels; focus rings are orange.
- No random values during render; metrics on either end are the real measured numbers.

## Final checklist

- [ ] Dragging the divider changes the screen and the three metrics together.
- [ ] Each case study has a problem, the shipped interaction and a result.
- [ ] Chapters switch; uploads work with real files; the brief form reaches its thank-you state.
- [ ] One orange, hard-coded; correct in a dark-mode host; contrast at least 4.5:1.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
