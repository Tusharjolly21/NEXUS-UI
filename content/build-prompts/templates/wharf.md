# Build prompt: Wharf — onchain payments landing page

Build **Wharf**, a landing page for an invented onchain settlement layer: a business takes whatever token a wallet holds, Wharf routes it across 30 chains, covers the gas, and lands stablecoins in the business's treasury. The feel is calm and precise: a near-white page, ink type, one electric blue, hairline frames, small monospace readouts, and illustrations that look like engineering drawings that come alive.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string for selection, focus rings and a handful of keyframes. Everything sits under a `.wf` wrapper and every id starts with `wf-`.
- Framer Motion 12 for motion, and `<canvas>` for the hero map and the call-to-action field. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/wharf`: Geist (variable, 100 to 900) for everything and Geist Mono for readouts, code and labels. Both are Open Font Licence; keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Sections

1. **Navigation.** A floating white pill: the Wharf mark and name (back to top), Product, Rails, Developers, Customers, Security as anchor links, then Sign in and a black "Start building". On mobile a menu button opens the links in a card.
2. **Hero.** "Money that crosses on its own." and "Wharf is the settlement layer for onchain apps. Take any token, route it across 30 chains, cover the gas, and land stablecoins in your treasury. One API, no bridges to babysit.", with Start building and "See the API", a row of proof (Live on 30 chains, 380+ teams, $4.2B settled, SOC 2 Type II) and the hint "Click a chain label to send a payment." On the right a canvas map: islands of dots for ETH, ARB, BASE, OP and SOL around a large Treasury island, drawn as a field of thin vertical bars that breathe. Each chain has a mono label with its coordinates. Every 6.5 seconds a payment leaves one chain, hops through another along a dotted arc and lands in the treasury: the labels it passes light up blue with a frame around their island, the treasury bars spike on arrival, and a settlement card under the map steps through "Quoting…", "Routing…" and "Settled" with a timer, the amount rolling in USDC, the path (BASE → ARB → Treasury) and "Gas covered · 0x…". Clicking a label sends a payment from that chain through a random other chain and holds off the automatic one for a few seconds.
3. **How it works.** "One payment. Four moves, one call." A tall section with a pinned stage: on the left the four steps (Accept, "Take whatever the wallet holds."; Route, "Find the cheapest path across 30 chains."; Sponsor, "Cover the gas so no payment fails."; Settle, "Land stablecoins, reconciled to the block.") with a progress rail, advancing as you scroll or when you click one; on the right a working checkout for Order 2841. Pay with an amount and a token menu (USDT, ETH, SOL, ARB, POL) showing the balance; Merchant receives the USDC quote, which dims and requotes briefly whenever the amount or token changes; the Pay button reads "Insufficient balance" or "Enter an amount" when it cannot pay. The Route step opens the split across Base, Arbitrum and Optimism pools; the Sponsor step highlights the sponsored gas toggle and the struck-through network fee; Pay counts down three beats and lands on "Settled" with "250.00 USDT → 249.70 USDC", "Fee 0.30 USDC · gas sponsored", View receipt and New payment, and a Reconciled strip with the block number.
4. **Rails.** "Four rails. One integration." and "Each rail works alone. Together they're one call." with "Compare the APIs". Four cards, each with an illustration that animates once on screen and does a little more on hover:
   - **Settle API**, "Any token in, stablecoins out.": a small machine where coins (ETH, SOL, USDT, ARB) ride a belt into a hopper and a display ticks over to USDC out.
   - **Route API**, "One quote across 30 chains.": a folded paper map with streets (Halo Ave, Meridian Rd, Arclane River), three pins and a route that draws itself, with a "Best of 3 quotes · 0.12% · 2 hops · 182ms" tag.
   - **Sponsor API**, "Gasless payments, paid for per app.": a gas gauge whose needle swings on a spring and settles in the green, stamped "Sponsored".
   - **Ledger**, "Revenue, failures and payouts in one view.": a ledger book whose pages fold open, revenue on the left and payouts on the right, a retried row that flips to matched, a total and a "Reconciled" receipt.
5. **Customers.** "380+ teams move money on Wharf across wallets, exchanges, payroll apps and treasuries." A row of customer names with icons (Brightwater, Kiln Pay, Tessellate, Corvid Exchange, Sorrel Finance, Northwind Treasury), three numbers that count up (Settled $4.2B, Transfers 61M, Median quote <400 ms), and an area chart of cumulative settled volume from Oct 2024 to Sep 2026 that draws itself in and shows the month and total under the pointer.
6. **Developers.** "Ship it this afternoon." and "Typed SDKs, test tokens on every chain, and webhooks that fire exactly once.", a copyable `npm i @wharf/sdk`, three checks (Sandbox on every chain, Idempotent webhooks, Typed errors you can switch on) and "Read the quickstart". On the right a dark code panel with Settle and Sponsor tabs, the endpoint (POST /v1/settle), line numbers and syntax colours. Run types out the console lines one by one (quote, route, settle with a block number) and then fills the Response panel with the JSON and "200 OK"; Copy copies the sample.
7. **Testimonial.** "We replaced three bridges and a spreadsheet with one Wharf call." from Mara Ilic, Head of Payments at Tessellate, with "Read the story", and a panel of two numbers that count up: 11s median settlement and 100% on-time payouts in Q3.
8. **Security.** "Built to be boring." and "Money infrastructure should be the least exciting part of your stack." with "Read the security overview". Three cards with small drawings: Audited ("Three independent audits. Reports are public.", an audit stamp reading 03 / 03 PASS), Always on ("99.99% uptime, trailing twelve months.", a dial of ticks around 99.99) and Your keys ("Non-custodial by default. You hold the keys.", a vault dial that spins through a combination on hover).
9. **FAQ.** "Questions, answered." with "Talk to an engineer", and five questions that open one at a time: how fast you can go live, which chains and tokens, how gas sponsorship works, what Wharf costs (0.12% per settled transfer) and whether it is custodial (no).
10. **Call to action.** "Ready when your product is." with Start building and Talk to sales, over a canvas of columns of mono glyphs falling slowly, brightening blue near the pointer.
11. **Footer.** A blue line glowing along the top, the mark, "Monthly notes on onchain payments" with an email field and Subscribe (turns to a green "Subscribed"), four link columns (Product, Developers, Company, Legal), "© 2026 Wharf Labs, a fictional company made for this template.", social icons, and a huge pale "Wharf" whose letters rise in one by one.

## Look

- Background `#F7F7F8`, ink `#111214`, text `#4E5159`, soft `#6C6F76`, faint `#A0A3A9`, lines `rgba(17,18,20,.08)`, blue `#2F6BFF` (deep `#1E54E6`, mid `#6F9BFF`, pale `#C3D6FF`, wash `#EAF1FF`), green `#16A34A` on `#DDF8E6`, the code panel `#16171A`.
- Headlines in Geist weight 500, tracking about -0.045em, line height 1, with the second half of each in the soft grey; readouts and labels in Geist Mono at 10 to 12px.
- Cards radius 22px on white or `#F1F2F4`, with a 1px line ring and a long soft shadow; the container is `max-w-[1200px]` with `px-5 sm:px-8`.

## Motion

- Reveals rise and fade once on scroll with ease `[0.16, 1, 0.3, 1]`; toggles and pills use a spring (stiffness 420, damping 34).
- The hero map and the glyph field are canvas loops that pause off screen; the rail drawings run only while in view.
- Round any trig-computed SVG coordinates to two decimals so the server and browser render the same markup.
- With reduced motion, entrances and loops are switched off and the hero shows a still map.

## Content

Wharf Labs and every company, person, chain figure, quote and number are invented sample content. Keep the chains, corridors, tokens, steps, rails, ledger rows, customers, volume series, security points and FAQs in one data file so a reader can swap in their own.
