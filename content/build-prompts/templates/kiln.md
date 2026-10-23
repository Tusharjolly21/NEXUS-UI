# Build prompt: Kiln — design and development studio landing page

Build a single-page marketing site for **Kiln**, a small studio that sells design and engineering as a flat monthly subscription: one team, one request at a time, weekly written updates. The feel is a dark, warm hero (a glowing amber horizon over black) that opens onto a calm light page of white cards. Amber is the only accent.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours, so it renders the same inside a dark-mode host.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Nav.** Logo (a white rounded square with a black K) and "Kiln". Links Work, Services, Pricing, Journal; a white "Book a call" button.
2. **Hero** on black, rounded at the bottom. A badge "Kiln Studio / Now booking for December". Headline "The design and engineering team you don't hire." Sub: "We design and build websites that bring in customers and keep up with your product. One flat monthly price. No calls you don't need. Just results." A dark pill button "Chat with Maya" with an illustrated portrait and a green presence dot. Behind it a thin amber arc, an amber glow rising from below it, faint stars and a ghosted 300px "Kiln" wordmark.
3. **Brand strip.** "Trusted by fast-growing teams" over a marquee of invented brands (Quillbase, Orbitly, Fernhouse, Copperline, Mosswell, Brightpath, Tidewater, Parcelkit, Juniper, Arcadia, Keystone, Lumenly, Driftwood, Sable). Each has its own small glyph and type treatment: serif, uppercase, light, black.
4. **What's included.** "Replace your whole product team." A bento: a black card "Design and development" with a "View pricing" button; a card "Weekly updates, written down" with a message from Maya; "Hosting, launches and upkeep" with a row of letter tiles; "Found on Google, and in AI answers" with a mock search result; "Components, dashboards and everything else" with an amber chip diagram.
5. **Request box.** "Send a request in one line." / "No briefs and no kickoff decks. Type what you need and it lands on our board. Most requests ship within 48 hours." Three amber check bullets (Unlimited requests, one at a time; An update in your inbox every weekday; Pause or cancel whenever you like). A text field that fills as you type on a **Lit Keyboard** (or tap its keys).
6. **Work wall.** A huge ghosted "Projects" word and a row of project cards: Relay (AI gateway), Tally (Fintech app), Wayfare (Travel booking), Side B (Music streaming), Helix (AI agents), Aether (Portfolio), each a scaled screenshot of its own page.
7. **Quotes.** "What clients say after launch." A snap carousel of five quote cards, each with the brand mark, the quote, an illustrated portrait, a name and a role.
8. **Scaling.** "Scaling teams that move fast." A bento: a 3x3 team grid whose tiles fill with portraits in turn and a "Meet the team" button; a count-up "120+ Launches shipped"; a logo marquee; one quote card with an amber wash; a pill row "What we build with" (Next.js, React, Tailwind, Motion, Figma, Vercel).
9. **Comparison.** "Kiln vs. the usual agency." A two-column table: approach, process, taste, stack, updates, deliverables, support.
10. **First call**, a tab pair: "Book a free call" and "Book a paid call", plus three small cards (Start this week; High impact, low overhead; Calm collaboration).
11. **Plans.** "Simple monthly plans." Components $3,900/mo (booked through November), Marketing pages $5,900/mo (2 spots left, dark card), Multi-page $9,800/mo (waitlist open). Every card shows the same checklist where it applies, a "Select plan" button and one client quote (not the same quote twice).
12. **Founder note.** A portrait of Maya Ortiz, "Founder, lead engineer", two short paragraphs in the first person.
13. **FAQ.** "Questions, answered" with a contact line, a card "Need a team that ships this month?" holding the same "Chat with Maya" button, and an accordion of questions about what the subscription covers, working with a non-technical team and so on. **Closing band** on black: "Make your website your best salesperson" over a giant transparent "Kiln" wordmark, then a footer noting this is a template.

## Look

- Page `#eff0eb`, cards `#fff`, hero and dark cards `#000` / `#0a0a0a`. Ink `#111`, secondary `#6b6b66`.
- Amber `#ffb52e` for graphics and the horizon, deep amber `#b45f06` for text on light.
- System font stack, antialiased. Hero headline `clamp(44px, 6.4vw, 84px)`, weight 600, tracking -0.045em, line-height 1.02.
- Cards radius 18px with a 1px `rgba(0,0,0,.06)` ring.

## Motion

- Reveals fade and rise once at 25% in view with ease `[0.16, 1, 0.3, 1]`.
- The horizon arc draws in, then the glow fades up; stars twinkle slowly.
- Marquees run linear and pause on hover. The team grid fills tiles in turn with a spring.
- Carousels snap and expose the position with pill dots.

## Motion Kit components and their jobs

- Lit Keyboard: the one-line request box.
- Snap Carousel: client quotes.
- Count Up: launches shipped.
- Avatar: portraits for the chat button, quotes, the team grid and the founder.
- Wordmark: the invented brand strip.

## Responsive and accessibility

- At 390px the hero stacks, the bento becomes one column, the keyboard sits in a fit-to-width scaler, and the page has no horizontal scroll.
- Avatars are decorative (`aria-hidden`) next to the visible name. Carousels are labelled and keyboard reachable.
- Text stays at 4.5:1; use the deep amber for amber text on white.
- No random values or `window` reads during render.

## Final checklist

- [ ] Every person has an illustrated portrait; no initial letters stand in for people.
- [ ] Each invented brand has its own mark.
- [ ] No two plan cards repeat the same quote.
- [ ] "Chat with Maya" appears only where it is useful (hero and FAQ).
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
