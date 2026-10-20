# Build prompt: Wayfare — trip planner and booking landing page

Build a single-page marketing site for **Wayfare**, a travel app that books flights and stays, keeps tickets, checks the weather and tells you when to leave for the airport. The feel is warm and calm: an off-white paper page, white cards, sand-coloured sections and one sunset orange. The hero is alive: a spinning dot globe with destination pins next to a search bar that types out places by itself.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so it looks the same inside a dark-mode host.
- Framer Motion 12 for every animation. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky pill nav.** Logo: an orange sun with slowly rotating rays setting behind a horizon line, plus "Wayfare". Links Explore, Plan, On the way, Membership; an orange "Plan a trip" button.
2. **Hero, two columns.** Left: eyebrow "Flights, stays and plans, together" in orange. Headline "The whole trip, in one **calm** place." (accent on "calm"), word by word. Sub: "Wayfare books the flights, keeps the tickets, checks the weather and tells you when to leave for the airport. You just go." A search card with "Where to" (a typewriter cycling Lisbon, Kyoto, Oaxaca, Reykjavík, Cape Town with a blinking caret), "When: 12–19 Mar" and a round magnetic search button. Under it an **Elastic Stepper** for Travellers (1-9, default 2). Right: a **Dot Globe** (500px on desktop, 380px below 1024px) with pins for Lisbon, Kyoto, Oaxaca, Reykjavík, Cape Town and New York, which enters by scaling up and un-rotating.
3. **Explore.** "Somewhere new, every season." / "Hand-built trips with flights, stays and a loose plan. Drag the reel to look around, or fling it." A **Curved Reel** of ten colourful typographic posters (Lisbon 7 nights from $640, Kyoto, Oaxaca, Bergen, Tangier, Hanoi, Tbilisi, Hobart, Lima, Seville). Below, four count-up stats: 140 countries covered, 1.2M trips planned, 24/7 real human help, 4.8 average trip rating.
4. **Plan**, sand section `#f5f1ea`. "Everything before you leave." Cards: "Weather, hour by hour." with a **Weather Puck** (drag the sun across the day); "A packing list that learns." with a **Todo List** seeded with Passport and boarding pass, Rain jacket (Thursday looks wet), Plug adapter type F, Book the Sintra day trip; and a wide "Your trips, laid out how you like." with a **Layout Switch** (grid, row, feature, pile).
5. **On the way: pinned scroll story.** "It keeps working after you leave." Steps: Flights "Every leg, tracked live." with a **Flight Tracker** NYC → LIS; Tickets "Tickets for the things you came for." with a **Tear Ticket** (museum entry, Thu 14 Mar 10:30, 2 adults); Memories "A stamp for every country." with a **Stamp Swirl** of four gradient stamps (PT, JP, IS, MX). The visual pins on the right on desktop and stacks under each step on mobile.
6. **Guides**, sand section. "Written by people who live there." An **Expandable Card** pair ("A slow Sunday in Alfama", "Temples before the crowds") that grow out of their card into a reader and fold back.
7. **Membership.** "Travel like you've done it before." Two radio tiles (Explorer Free; Wayfare Club $8 / month). The selected tile gets an orange inset ring that glides between tiles via `layoutId` and its feature list expands. The button reads "Join the Club" or "Start planning free". Beside it a **Lanyard Badge** for "Sam Alvarez, Member since 2024" whose tag follows the chosen tier, on an orange strap.
8. **FAQ**: changing or cancelling, offline use, planning with friends, round-the-clock human help.
9. **CTA band**: "Where to next?" / "Plan your first trip free. Book when it feels right."
10. **Footer** with Travel, Club and Help columns.

## Look

- Page `#fbfaf7`, sand sections `#f5f1ea`, cards white. Ink `#1d1d1f`, secondary `#6e6e73`, captions `#86868b`.
- Orange `#ff9f0a` for graphics and fills; darker orange `#c2410c` for text and buttons (about 5:1 on white).
- System font stack, antialiased. Hero headline `clamp(48px, 7.4vw, 90px)`, weight 600, line-height 0.98, tracking -0.055em. Stats `clamp(36px, 4.6vw, 50px)` with `tabular-nums`.
- Cards radius 28px with shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`; tiles radius 24px.
- Soft orange and yellow radial glows behind the hero only.

## Motion

- Reveals fade and rise once at 25% in view with ease `[0.16, 1, 0.3, 1]`; stats stagger with springs (stiffness 160, damping 22).
- Search card enters with a 0.9s ease and slight scale; the globe enters from scale 0.85 and -8deg over 1.4s.
- Typewriter: 90ms per letter, 1.8s pause, then the next place. Caret blinks with an opacity loop.
- Tier ring uses a `layoutId` spring (stiffness 400, damping 32); the feature list opens with a height spring (stiffness 300, damping 30) and items slide in 50ms apart.
- Scroll story visuals swap with a blur-and-lift spring (stiffness 140, damping 22) while a progress rail fills.
- The signature interaction: drag and spin the globe, and fling the curved poster reel.

## Motion Kit components and their jobs

- Dot Globe: the destination globe in the hero.
- Elastic Stepper: number of travellers.
- Curved Reel: destination posters.
- Weather Puck: hourly weather at the destination.
- Todo List: shared packing list.
- Layout Switch: trip photo layouts.
- Flight Tracker: live flight status.
- Tear Ticket: museum and tour tickets.
- Stamp Swirl: passport stamps.
- Expandable Card: local guides.
- Lanyard Badge: the membership pass.

## Responsive and accessibility

- At 390px the hero stacks with the globe below the copy, the search card stacks its fields and shows a full-width "Search trips" button, wide demos use a fit-to-width scaler, and there is no horizontal page scroll.
- The media query for the globe size must be hydration-safe (server and first client render agree, then update).
- Membership tiles use `role="radiogroup"` / `role="radio"` / `aria-checked`. Icon-only buttons have `aria-label`. Focus rings are visible.
- Orange text always uses the darker orange. No random values during render.

## Final checklist

- [ ] Globe spins and drags; the search bar types places on loop.
- [ ] The reel drags and flings; the scroll story pins on desktop and stacks on mobile.
- [ ] Choosing a tier moves the ring, opens its features and updates the lanyard tag.
- [ ] One accent family, hard-coded; correct in a dark-mode host.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
