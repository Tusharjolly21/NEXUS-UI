# Build prompt: Outpost — GPU inference platform landing page

Build **Outpost**, a one-page website for an invented inference platform that runs open and fine-tuned models on GPUs that sleep when nobody is asking, and answers every request from the region closest to the person who sent it. The feel is a quiet desert at dusk: a near-black page, a painted landscape of layered dunes under a low sun, and product surfaces that are live rather than pictured. Every demo on the page is drawn in code and keeps running.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (selection, focus rings, a blinking caret, a marquee, a ping) under an `.op` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/outpost`: Inter (variable) for everything, Geist Mono (variable) for code, request lines and metrics. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the faces are Notionists (CC0) SVGs turned into data URLs. The world map is a land mask rasterised once into a dot grid on a canvas.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **Landscape**: an SVG scene with a sky gradient, a sun disc with a soft halo, six ridge layers of dunes that get lighter toward the horizon, a haze band and a film-grain overlay. It takes a `scene` ("dusk" or "day"), a sun position and an id prefix so several can sit on one page.
- **Console**: a dark app window (sidebar with workspace, search, navigation, recent runs and the signed-in user) whose main pane shows an endpoint card over a small landscape, live metrics (a p50 latency sparkline with 1h, 24h and 7d tabs, a throughput chart), a streaming feed of requests (method, path, region code, tokens, milliseconds) and traffic by region with latency bars, plus today's totals.
- **Button**: pill buttons, light on dark for the primary and a quiet outline for the secondary.

## Sections

1. **Navigation.** Sticky and translucent: the Outpost mark, Product, Network, Developers, Models, Pricing, then Log in and Talk to sales. On phones a menu button opens the links.
2. **Hero.** On the dusk landscape: a "New: São Paulo and Singapore are live" pill, "Serve any model, a short hop from everyone", a sentence, Deploy a model and a row of faces with "3,200 teams serving with Outpost". The console rises up out of the landscape below, already streaming requests. A customer logo strip follows.
3. **Product.** "Everything between a checkpoint and an answer": a large card on a daylight landscape where a deploy runs through its steps (pull weights, build image, warm 4 GPUs, first token) with a timer, then four tabs (Deploy any model, Scale with traffic, Answer from nearby, Pay for tokens) that each swap the card's demo. Start deploying and Talk to an engineer.
4. **Builder.** "Wire up an endpoint in a minute": a node graph with Model, Hardware, Regions and Instructions cards wired into an Endpoint. Cards can be dragged; clicking a port connects it; the endpoint counts "Waiting for inputs · 1/4" and, once complete, four consumers (docs search, a community bot, nightly evals, spend alerts) light up in turn. Reset and Connect all buttons.
5. **Network.** "Every request lands close to home": a dot-matrix world map with eight region markers. Clicking anywhere sends a request that arcs to the closest region and reports its latency; requests per second and regions live sit beside it. Four short points below (one endpoint, closest-region routing, failover in seconds, GPU checks every 10 seconds).
6. **Developers.** "Change one URL. Keep the code you have.": a list of capabilities (chat completions, function calling, batch at half price, fine-tuning, tracing) beside an editor with main.py and .env tabs. Run types the request out and streams the answer into a response pane with first-token time, throughput and cost.
7. **Models.** "Every open model, ready to serve": feature chips (cold starts under 2 seconds, private weights, H100, H200 and L40S, fp8 and int4 builds, pinned versions, your own fine-tunes), and a model card next to a chat where a question about which docs pages close the most tickets is answered with a small table.
8. **Pricing.** A Monthly or Annual switch (save 20%) over four plans (Hobby, Pro, Dedicated, Enterprise), then a full comparison table grouped by usage, models, infrastructure and support, with ticks and dashes.
9. **Call to action.** "Ready to serve your first model?" over the landscape, with Deploy a model and Read the docs.
10. **Footer.** The mark and a line, Product, Developers and Company columns, social links, a live counter of tokens served this week and the copyright.

## Look

- Background `#09090B`, cards `#111114`, raised `#1E1E23`, hairlines at 7% and 12% white. Text `#F1EFEA`, secondary `#A1A1AA`, muted `#71717A`.
- Accents used sparingly for status and charts: teal `#3FE0C5`, amber `#F6B24B`, rose `#F27A8C`, violet `#A594FF`, sky `#6AA9FF`. The daylight cards switch to a light set (white, `#F7F7F5`, ink `#18181B`, accent `#0F9C86`).
- Titles in Inter at weight 500 with tight negative tracking, about `clamp(34px, 5vw, 60px)` for the hero; 14 to 16px body; mono at 11 to 13px for data.
- Container `max-w-[1120px]` with `px-5 sm:px-8`; cards with 16 to 24px radii and 1px inner hairlines rather than shadows.

## Motion

- One ease, `[0.22, 1, 0.36, 1]`, for reveals; springs (stiffness about 500) for toggles, ports snapping and rows entering the request feed.
- The console, the deploy timer, the request feed and the map traffic run on intervals only while they are on screen.
- Canvas drawing respects device pixel ratio and redraws on resize.
- With reduced motion, feeds show a still set of rows, counters show their final values and the deploy card shows its finished state.

## Content

Outpost, Northwind and every customer, person, figure and quote are invented sample content. Keep regions, requests, models, plans and the comparison table as arrays near the sections that use them so a reader can swap in their own.
