# Build prompt: Strata — AI inference platform landing page

Build a single-page marketing site for **Strata**, a platform that serves open and custom models from GPUs that scale to zero, in the region nearest each user. The feel is near-black with one electric blue, a misty mountain behind the hero, and a light dashboard card that tilts flat as you scroll.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Nav.** Logo (a hexagon mark) and "Strata"; links Features, Network, Developers, Models, Pricing; "Log in" and a white "Talk to sales".
2. **Hero** over a dusk mountain photo darkened to near-black. Badge "New / Multi-region autoscaling is live". Headline "Serve any model, near every user." Sub: "Deploy open or custom models on GPUs that scale to zero. Every request runs in the region closest to the person who sent it." A white "Deploy a model" button and the line "$5 in credits every month / No card to start". Below, a **Dashboard** card (sidebar, a "Support agent" deployment banner, region tabs, p50 latency, a throughput bar chart that moves, and a traffic-by-region list) that starts tilted and flattens as you scroll.
3. **Brand strip.** "Serving production traffic for teams at" and six invented brands (Quillbase, Orbitly, Lumenly, Copperline, Halcyon, Keystone), each with its own mark.
4. **Deploy story.** "Everything between your weights and your users." Four tabs that auto-advance: Deploy any model, Scale with traffic, Route to the nearest region, Pay per token. Each swaps the card over the mountain panel (a build log, an autoscaler, a region router, a usage meter). Buttons "Start deploying" and "Talk to an engineer".
5. **Node canvas.** "Wire up an endpoint." / "Connect a model, hardware, regions and a prompt. Strata turns the graph into a live API. Drag the nodes around." Draggable nodes with live connecting curves: model (llama-3.1-70b-instruct, fp8, 128k), hardware (H100, 2 replicas), a system prompt, and the endpoint, ending at a support widget.
6. **Playground.** "The first token lands before you lift your hand." A text field that fills as you type on a **Lit Keyboard**, with first-token and throughput numbers.
7. **Network.** "Every request lands close to home." A dotted world map with pinging regions and a pill that reads "Virginia · 23ms"; four feature columns: One endpoint, seven regions; Nearest-region routing; Automatic failover; Health checks every 10s.
8. **Developers.** "Change one URL. Keep the code you have." / "Strata speaks the OpenAI API, so the SDKs and tools you use today work without changes." A tabbed code panel (Chat completions, Function calling, Batch, Fine-tuning, Training) beside a response panel that streams its answer one token at a time, with first-token, throughput and cost tiles.
9. **Model catalog.** "Every open model, ready to serve." A rail of five provider marks (each a different shape, no letters) that switches the detail card: name, provider, context length, tags, a sample exchange with an illustrated person and a regional status table. A checklist of six facts.
10. **Pricing.** "Pricing", a Monthly / Annual switch, and four tiers: Hobby (Free), Pro ($39 annual, $49 monthly), Dedicated ($1.99 per H100-hour annual, $2.49 monthly), Enterprise (Custom). The annual badges say what you save in numbers. Under them a full comparison table with section rows (Usage, Models, Infrastructure).
11. **Closing band** and footer noting this is a template.

## Look

- Page `#09090b`, cards `#0f0f12` and `#17171b`, hairlines `rgba(255,255,255,.08)`. Text white and `rgba(255,255,255,.62)`.
- Blue `#4c8dff` for accents, `#2f6bff` inside the light dashboard. Status green `#34d399`.
- System font stack plus a monospace stack for code. Hero headline `clamp(40px, 6.4vw, 74px)`, weight 500, tracking -0.045em.

## Motion

- Hero headline lines rise out of a mask with a blur-in. The dashboard tilts with `useScroll` → `useTransform` (rotateX 22deg to 0, scale 0.92 to 1).
- Tabs auto-advance every few seconds while in view and stop once the user interacts.
- Node curves follow dragged nodes. The response streams with a blinking caret.
- Pricing numbers slide when the billing switch changes.

## Motion Kit components and their jobs

- Dot World: the network map.
- Lit Keyboard: the playground.
- Mountains: the hero and the deploy panel.
- Avatar: the person in the sample exchange.
- Wordmark: the invented brand strip.

## Responsive and accessibility

- At 390px the dashboard drops its sidebar, the node canvas scrolls inside its own frame, the pricing table scrolls horizontally inside its wrapper, and the page has no horizontal scroll.
- Tabs and the model rail are real buttons with labels; the billing switch is a radio group.
- Text stays at 4.5:1 against the near-black.
- No random values or `window` reads during render.

## Final checklist

- [ ] No invented ratings or review counts anywhere.
- [ ] No letters used as icons; every mark is a shape.
- [ ] Dashboard tilts flat on scroll; nodes drag; the response streams.
- [ ] Annual and monthly prices both read correctly.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
