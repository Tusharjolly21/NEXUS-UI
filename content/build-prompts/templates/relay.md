# Build prompt: Relay — AI gateway landing page

Build a single-page marketing site for **Relay**, an AI gateway that sits between an app and every major model, routes each request to the cheapest model that can do the job, and fails over when a provider slows down. The feel is Apple-light: a near-white page, white cards with hairline shadows, one confident blue, big tight headlines and calm, spring-driven motion. The product demo is the hero: a live routing console, not a screenshot.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 for styling, with colours hard-coded (no theme tokens, so the page looks identical in a dark-mode host).
- Framer Motion 12 for every animation. No other animation or UI libraries, no remote images, no web fonts.
- Every interactive file starts with `"use client"`. The page root is wrapped in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky pill nav.** Logo (a ring with a small dot orbiting it) and "Relay"; links Product, Routing, Developers, Pricing, FAQ that smooth-scroll to section ids; a blue "Start free" button. The bar gains a blurred background and a hairline once you scroll; on mobile the links collapse into an animated burger menu.
2. **Hero, centred.** A pill button "New · Quality routing is live →" with a light sheen sweeping across it every few seconds. Headline: "One API. Every model. **Half the bill.**" (the last three words in blue), revealed word by word. Sub: "Relay sits between your app and every major model. It routes each request to the cheapest one that can do the job, and falls back the moment a provider wobbles." Buttons: a magnetic "Start free" and an install pill showing `$ npm i @relay/sdk` with a Copy chip that flips to "Copied" in green. Below, a browser-frame card titled "console.relay.dev / live traffic" with a pulsing green "Live" dot. Inside it runs the **Packet Router**: packets flow from a router node to four model tiers (Nano, Mini, Pro, Ultra) with live percentages, a Cost / Balanced / Quality strategy switch and a blended price per 1M tokens. The frame starts tilted back (rotateX 26deg, scale 0.88) and lies flat as it scrolls to the centre of the viewport.
3. **Customer marquee.** "Routing traffic for teams at" over an endless row of invented wordmarks (Northwind, LUMEN, parcel, Orbit Labs, HALCYON, fieldnote, Quanta, MERIDIAN), each with its own type treatment.
4. **Stats.** Four count-up figures with a top hairline: 2.4B requests routed every month; 38% average saving on model spend; 99.99% gateway uptime, last 12 months; 9ms added latency at p50.
5. **Product: pinned scroll story.** Eyebrow "The gateway", title "Everything between your app and the model." Four text steps scroll past on the left while the visual on the right stays pinned and swaps with a blur-and-lift transition; a thin blue progress rail fills. Steps: 01 Context ("Context that tidies itself up." with a **Context Meter**), 02 Voice ("Voice in, voice out, one endpoint." with a **Voice Orb**), 03 Status ("Know what every request is doing." with a list of four jobs, each with a **Matrix Loader**), 04 Alerts ("Problems reach you before users do." with a **Toast Stack**). On screens under 1024px each visual sits under its own step instead.
6. **Routing bento** on `#f5f5f7`: "Built for production / Fast everywhere. Calm under load." A wide card "Edge nodes in 32 regions." with a draggable **Dot Globe** and a pointer spotlight; beside it "Pause batch jobs safely." with **Squeeze Progress**, and "Feedback on every answer." with a **Feedback Pill**.
7. **Developers**, black section. "Switch in three lines." with four checked bullets (OpenAI-compatible endpoints; Typed SDKs for TypeScript and Python; Per-request cost and latency headers; Replay any request from the console) and a **Progress Button** "Deploy to edge" → "View logs". On the right, a dark code card with TypeScript / Python / cURL tabs; the active tab has a shared-layout highlight and the code lines stagger in with a small blur.
8. **Pricing.** "Pay for routing, not for guesswork." Two cards: "Choose a plan" with **Radio Cards** (Hobby Free, Pro $20/mo, Scale Custom, each with three features) and "Team seats" with a **Price Odometer** ($12 per seat monthly, $9 yearly, up to 200 seats).
9. **Quote marquee** of four short quotes attributed to roles at the invented companies.
10. **FAQ**, two columns: prompts storage, how routing decides, provider outages, bring your own keys.
11. **CTA band**, dark, with a pointer-following glow: "Route your first request in five minutes." / "Free up to 100k requests a month. No card needed." / "Get your API key" and "Talk to sales".
12. **Footer** with logo, a one-line note and three link columns.

## Look

- Page `#fbfbfd`, alternate sections `#f5f5f7`, dark sections `#000` and `#1c1c1e`. Text `#1d1d1f`, secondary `#6e6e73`, captions `#86868b`. Accent `#0071e3`, highlight `#5ac8fa`, success `#248a3d`.
- System font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", ..., system-ui, sans-serif`), antialiased.
- Hero headline `clamp(46px, 8.4vw, 104px)`, weight 600, line-height 0.98, tracking -0.055em, balanced wrapping. Section titles about 40-56px with -0.045em tracking. Body 16-22px, captions 12-13px. Numbers use `tabular-nums`.
- Cards: white, radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Pills are fully rounded.
- Soft radial blue gradients behind the hero, nothing louder.

## Motion

- Reveals: fade and rise (up to 28px) once, when 25% is in view, with an ease-out curve `[0.16, 1, 0.3, 1]`. Lists stagger children with springs (stiffness 160, damping 22).
- Words: each headline word rises with a 70ms stagger.
- Hero frame tilt: `useScroll` on the frame, mapped through `useTransform` and smoothed with `useSpring` (stiffness 120, damping 24). No React re-renders while scrolling.
- Magnetic buttons lean toward the pointer with springs (stiffness 260, damping 18). Only on fine pointers.
- Tab and nav highlights use `layoutId` springs (stiffness 500, damping 36). The copy label swaps with a vertical spring (stiffness 500, damping 30).
- Counters animate from 0 when 60% in view.
- The signature interaction is the Packet Router: switch the strategy and the traffic split re-flows live.

## Motion Kit components and their jobs

- Packet Router: the live routing console in the hero.
- Context Meter: shows what fills a model's context window and compacts it.
- Voice Orb: the voice endpoint, hold to talk.
- Matrix Loaders: per-job status indicators.
- Toast Stack: alert notifications that stack and expand.
- Dot Globe: draggable map of edge regions.
- Squeeze Progress: a pausable batch job.
- Feedback Pill: rating an answer inline.
- Progress Button: deploy action that becomes its own progress bar.
- Radio Cards: plan picker.
- Price Odometer: per-seat pricing with rolling digits.

## Responsive and accessibility

- Mobile at 390px: everything stacks, the hero type scales with `clamp`, wide demos are wrapped in a fit-to-width scaler so they shrink rather than overflow, and there is no horizontal page scroll. The code card scrolls inside itself.
- Real `<button>` and `<a>` elements, visible focus rings, `aria-label` on icon-only buttons, `role="tablist"`/`aria-selected` on the language tabs.
- Text contrast at least 4.5:1 on its background. Decorative SVGs get `aria-hidden`.
- No `Math.random()` or `Date.now()` during render, and no `window` reads during render, so server and client HTML match.
- Respect reduced motion through `MotionConfig`.

## Final checklist

- [ ] Hero routing console runs on load and responds to the strategy switch.
- [ ] Scroll story pins on desktop, stacks on mobile, and the right visual matches the active step.
- [ ] All counters, reveals and marquees settle and never leave content invisible.
- [ ] Only one accent colour, hard-coded; the page looks the same with the host in dark mode.
- [ ] No hydration warnings, no console errors, no horizontal scroll at 390px.
- [ ] Every control is keyboard reachable with a visible focus ring.
