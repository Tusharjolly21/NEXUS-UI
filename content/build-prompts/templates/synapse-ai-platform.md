# Build prompt: Synapse — a visual builder for AI agents

Build a single-page marketing site for **Synapse**, a no-code builder where people design AI agents as steps on a canvas, test them on real inputs and deploy them to their site, inbox or API. The feel is Apple-light and playful: a dotted canvas texture, white node cards, one magenta accent, big tight headlines and springy, tactile motion. The hero is the builder itself: a canvas the visitor drags around and completes by drawing the missing wire.

## Stack

- Next.js (App Router), React 19, TypeScript strict.
- Tailwind CSS 4, hard-coded colours.
- Framer Motion 12 only; no other libraries, no remote images or web fonts.
- `"use client"` where needed; root in `<MotionConfig reducedMotion="user">` with `background #fbfbfd`, `color #1d1d1f`, `colorScheme: "light"`.

## Page structure and copy

1. **Sticky glass nav.** Logo: a dark node and a magenta node joined by a curve, then "Synapse". Links Why, Build, Test, Deploy, Pricing. Button "Start building".
2. **Hero canvas (full bleed).** A 22px dot grid fading out at the edges, a soft pink glow at the top. Centred chip "New · Branching on confidence is here", headline "Draw your agent. Test it. **Ship it.**", sub "Synapse is a visual builder for AI agents. Connect steps on a canvas, try them on real inputs, and deploy to your site, inbox or API without writing glue code.", buttons "Start building free" and "See the builder". Underneath, on the same texture, five nodes: Trigger "New support email", Model "Classify the intent", Knowledge "Search help center", Model "Draft a reply", Branch "Send or hand over". The wire from Search to Draft is missing. A floating toolbar reads "support-triage · draft" with a Run button that says "Connect to run" until the wire exists.
3. **Why a canvas.** "Same agent. One of these you can hand to a teammate." A before/after slider: a dark editor with a tangled prompt-and-glue TypeScript file against the same agent as five tidy steps.
4. **Build bento** on `#f5f5f7`: "Everything an agent needs, one drag away." Cards: "Add a step from anywhere." (a liquid dial with Model step, Tool call, Branch, Memory; picks appear as chips); "Tune it like a design tool." (scrub fields Creativity 0 to 1, Max steps, Timeout, with a Precise to Creative bar and a sentence that changes); "Give it knowledge." (a drop zone whose files become filling chips).
5. **Test (pinned story).** "Know it works before your customers find out." 01 Talk (a voice orb); 02 Trace (a run timeline with span bars and costs); 03 Score (v12 against v13 on 200 saved emails, paired bars); 04 Version (version list with Live pill and Roll back buttons).
6. **Deploy** on `#f5f5f7`: "One agent. Every place your customers are." A magnifying dock of channels (Website chat, Email inbox, Team chat, REST API, SMS, Phone line); clicking one adds it to "Live on N of 6 channels". A copyable agent ID chip and an embed snippet.
7. **Numbers**: 38 min from blank canvas to first deploy · 61% of Team builders never wrote code · 1.4M test runs scored. Marked as placeholders.
8. **Testimonials**: three invented people and companies.
9. **Pricing**: Monthly / Yearly toggle with a sliding pill; Free $0, Pro $29 ($23 yearly, highlighted with a magenta gradient border), Team $99 ($79). Prices roll digit by digit.
10. **FAQ**, **CTA band** ("Your first agent is one wire away."), **footer**.

## Look

- Page `#fbfbfd`, bands `#f5f5f7`, cards white. Text `#1d1d1f`, secondary `#6e6e73`. Accent `#db2777` for fills and wires, `#be185d` for accent text (contrast), tint `#fdf2f8`, light pink `#f9a8d4`.
- System font stack, monospace for code. Headline `clamp(42px, 6.4vw, 82px)`, weight 600, tracking -0.055em. Nodes 208 × 72px, radius 16px; cards radius 24px with shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`.

## Motion

- **Node canvas (signature).** Each node's x and y are motion values; nodes drag with `dragMomentum={false}`, constrained to the canvas, and scale to 1.04 while held. Wires are cubic beziers between output and input ports computed with `useTransform` from the four motion values, so they follow with no React re-renders; connected wires carry slowly marching dashes. Dragging from the pulsing magenta port draws a live wire to the pointer; released within 56px of the dashed target port it springs into place (stiffness 260, damping 22), otherwise it snaps back elastically (stiffness 380, damping 18). A tap or Enter on the port connects it too. Connecting runs the flow automatically: a pulse travels each wire in turn (about 3.2s, eased), each node gets a magenta ring as it is reached, and a result pill appears: "Test run 1 passed · 2.4 s · 3 articles cited · confidence 0.92 · reply sent". Below 720px wide the canvas re-lays out vertically with top and bottom ports, animating nodes to their new spots.
- Before/after divider trails the pointer through a spring; the dial's highlight stretches between actions; scrub fields show a delta badge; span and score bars grow on springs. Reveals at most 24px, once.

## Motion Kit components used

- **Before / After**: glue code against the canvas.
- **Liquid Dial**: adding a step.
- **Scrub Inputs**: model settings.
- **Upload Chips**: knowledge files.
- **Voice Orb**: testing by voice.
- **Dock**: deploy channels.
- **Copy Buttons** (chip): the agent ID.

## Responsive and accessibility

- The canvas stays interactive on phones (vertical flow, touch drag with `touch-action: none` on nodes only). Pinned story becomes inline below 1024px; fixed-width visuals scale to fit. No horizontal scroll at 390px.
- Nodes are labelled groups, the connect port is a labelled button, the result pill and channel list are `aria-live`, the billing toggle is a radio group, focus rings use the accent.
- No randomness or time reads during render; pointer-only effects on fine pointers; reduced motion respected.

## Checklist

- [ ] Wires follow every drag smoothly and the missing wire can be drawn by mouse, touch and keyboard.
- [ ] Run lights the flow in order and reports a result.
- [ ] One accent, hard-coded colours, forced light scheme.
- [ ] Invented customers and numbers only.
- [ ] Clean console, no hydration warnings, no overflow at 390px.
