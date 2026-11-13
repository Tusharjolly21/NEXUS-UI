# Build prompt: Nightwatch — on-call incident tool landing page

Build **Nightwatch**, a one-page website for an invented on-call teammate that triages every alert, wakes only the person who can fix the problem, has the rollback ready before they open the laptop, and drafts the postmortem by breakfast. The feel is three in the morning turning into dawn: a deep navy night with a faint star field, cool blue-grey hairlines, and a warm coral-to-amber dawn gradient that only appears where something needs a human.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (selection, focus rings, a ping, a marquee, a dawn-gradient text helper) under an `.nw` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/nightwatch`: Instrument Sans (variable, 400 to 700) for everything, Geist Mono (variable) for commands, timestamps and incident ids. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the faces are Notionists (CC0) SVGs turned into data URLs. The hero chart is drawn on a canvas; everything else is SVG and HTML.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **LogoMark**: a crescent moon with a small dawn-gradient star.
- **Button**: a dawn pill for the primary action and a quiet translucent pill for the secondary.
- **useCycle**: a ticking counter that drives the small demos, running only while its card is on screen.
- **Avatar**, **Icon**, **Reveal** (a fade and short rise used once per heading block).

## Sections

1. **Navigation.** The mark and Nightwatch, Product, Customers, Pricing and a Resources menu, then Log in and Start free.
2. **Hero.** Over a star field: a "New: Postmortems that write themselves" pill, "Sleep through the page." in large type, a sentence, Start free and See it handle a page. Along the bottom a live latency chart scrolls on a canvas; every so often it spikes over the 800 ms SLO line, alert cards stack up, Nightwatch groups them, the line recovers, and a note reads "Resolved in 41 seconds. Nobody was woken up."
3. **Product window.** A full app window (sidebar with incidents, on-call, runbooks, status page, postmortems, integrations and who is on call now; an incident list with severity, service, owner and state; and an incident timeline) that tilts up from the page as it scrolls in. The timeline steps light up one by one: 47 alerts grouped, linked to a deploy, runbook run, p95 recovered, postmortem shared.
4. **Customer strip.** "The quiet rotation behind 2,400 engineering teams" and twelve invented wordmarks, each set in its own type.
5. **Features.** "Everything the 3am version of you would want" and cards with small playing demos: forty alert chips collapsing into one incident card (Forty alerts become one); a 24-hour clock face with an arc for each city's shift (Tokyo, Berlin, New York) where the shift that is awake gets the page and acknowledges it (Wakes the right person); a runbook whose commands tick through and stop for approval (Runbooks that run); a status page where one service dips to degraded and recovers (A status page that keeps up); a postmortem draft writing itself (The postmortem, drafted); then three short cards (Works with your alerts, SSO and SCIM included, Lives in your chat).
6. **Customers.** "Nights we got back" in the centre, with Read the stories, ringed by ten quote bubbles from on-call engineers (faces, names and roles). One bubble at a time comes into focus while the rest dim and blur slightly; the focus moves on by itself and follows the pointer.
7. **Wake up.** "Paged on whatever is closest": a paper plane flies along a wave, dropping the page on a watch, then a phone, then a laptop in turn, each lighting up with the alert as it arrives (On your wrist, On your phone, At your desk).
8. **Security.** Three cards: a sealed signal for encryption, a small map with Frankfurt, Virginia and Tokyo for data residency, and an endlessly scrolling audit log for "Every action, on the record".
9. **Pricing.** "Priced per person on call": a Monthly or Yearly switch (yearly saves 20%) over Hobby (free), Team (marked "Most teams") and Scale, with their included features.
10. **FAQ.** "Questions, answered" in three groups (Getting started, On call, Security) that open one at a time.
11. **Call to action.** "Tonight could be quiet." with Start free and Book a walkthrough, surrounded by floating product fragments (a status page, the week's on-call strip, a postmortem draft, a rollback command, a chat reply "Going back to sleep.", time to resolve down 86%).
12. **Footer.** The mark and a line, Product, Company, Resources and Legal columns, social links, the copyright and an "All systems normal" status.

## Look

- Night `#060A17`, deep `#0B1124`, cards `#0E152C`, raised `#141C38`, hairlines in a blue-tinted white at 10% and 18%. Text `#ECEFF8`, secondary `#A6AECA`, muted `#6E7898`, faint `#4A5371`.
- Dawn `#FF6B5A`, `#FF8E5E`, `#FFB86B`, used as a gradient for the primary button, the hero spike and the plane's trail. Green `#5BE3B0` for resolved, red `#FF5D6C` for severity 2.
- Titles in Instrument Sans 600 with tight tracking, very large in the hero; body 14 to 16px; Geist Mono at 10.5 to 12px for data.
- Container `max-w-[1200px]` with `px-5 sm:px-8`; cards with 20 to 24px radii, inner hairlines and long soft shadows.

## Motion

- One ease for reveals; scroll-linked motion values for the product window's tilt and the plane's path, so scrolling never re-renders React.
- Demos tick only while their card is on screen; the canvas chart pauses off screen and respects device pixel ratio.
- With reduced motion, the chart shows a still line, the product window sits flat with the whole timeline lit, the audit log stops scrolling, and each device shows its alert.

## Content

Nightwatch, Acme and every customer, person, figure and quote are invented sample content. Keep the incidents, timeline, features, quotes, plans and questions as arrays near the sections that use them so a reader can swap in their own.
