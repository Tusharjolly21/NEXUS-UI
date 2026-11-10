# Build prompt: Plotline — product planning SaaS landing page

Build **Plotline**, a landing page for an invented product-planning tool: requests, roadmaps and releases in one calm workspace. The feel is quiet and exact, the way a good B2B tool looks: a white page framed by hairlines running down both sides of the container, ink type, cool greys, one cobalt accent, and working product mocks set on soft painted skies. The page sells by letting the visitor use the product.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string for selection, focus rings and three keyframes (marquee, pulse, aurora). Everything sits under a `.pl` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/plotline`: Inter Tight (variable) for headlines and big numbers, Geist (variable) for everything else. Both are Open Font Licence; keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the team's faces are Notionists (CC0) SVGs turned into data URLs.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Sections

1. **Navigation.** A fixed white bar that frosts as you scroll: the Plotline mark (an ink square with a white curve ending in a cobalt dot), Product, Pricing, Customers, Changelog and Contact with a grey pill that slides between them under the pointer, then Sign in and a black "Start for free". On mobile a menu button opens the links.
2. **Hero.** A "New" pill linking to the changelog ("Plotline 3.0 drafts your weekly update for you"), "The planning tool for teams that ship." in very large tight type, "Requests, roadmaps and releases in one calm workspace. Everyone knows what's next, and nobody has to chase an update.", Book a demo and Start for free, and "Free for teams up to 10. No card needed." Below, on a dusk sky, the app in a browser frame (app.plotline.so / Launch plan) that starts tilted back and lays flat as you scroll to it, scaled to fit narrow screens. It has a sidebar (Home, Inbox 12, My work, Roadmap, Releases, Reports, and four projects) and four views behind tabs with a sliding underline:
   - **Timeline**: October to December with a Today marker and seven projects. The "New onboarding flow" bar can be dragged (or moved with the arrow keys); the three linked projects after it follow on progressively softer springs with a cobalt ring, their dates update live, and a toast says "Moved 3 linked projects 4 days later. Owners notified." Once on screen it demos itself (pushes the bar three days, then back) until the visitor drags. Two teammates' cursors (Maya, Theo) wander over it.
   - **Board**: Now, Next and Later columns of cards with owners, due dates and progress bars that fill in.
   - **List**: tasks with status dots; ticking one strikes it through.
   - **Updates**: past weekly updates, each "Drafted by Plotline, sent by" someone.
   A floating "Weekly update, drafted" card types out this week's update and has Edit and "Send to #product" (turns green, "Sent to #product"). A caption under the frame: "That's the real thing, give or take. Switch views, tick a task, or drag the onboarding bar and watch its dependants follow."
3. **Logo wall.** "Trusted by 4,000+ product teams, from two-person startups to public companies" over seven invented names with icons scrolling sideways forever, faded at both ends.
4. **How it works.** "One workspace for the whole plan. Requests come in, roadmaps take shape and releases go out. No status meetings." Then four steps, each with a headline and a live demo on a stage; on wide screens a sticky side list (Collect requests, Plan the roadmap, Track the work, Ship and share) follows the step in the middle of the screen, with a progress line and a sliding dot, and clicking an item scrolls to it.
   - **Collect**: a request inbox with All / Customers / Team filters, upvote buttons that roll their counts, and rows that re-sort by votes with layout animation.
   - **Plan** (on sand): a Now / Next / Later board; clicking a card moves it one column forward with a shared-layout move.
   - **Track**: the task list, a "Blocked for 2 days" card with Ask Finance (turns to "Asked in #finance"), and Billing v2 at 41% counting up.
   - **Ship** (on a day sky): release notes for v3.0 with New / Improved / Fixed, and "Publish and notify" that shows "Published, 37 customers notified".
5. **Stats.** Four numbers that count up once on screen, in a hairline grid: 4,000+ teams, 38% fewer status meetings, 2.4× faster from request to release, 99.99% uptime.
6. **Weekly updates.** "New in 3.0", "Your Friday update, already written." with three points (Drafted from real progress, Sent where people read, Written for the reader), and on an aurora sky the sent update as a chat message (Shipped, On track, Needs help) with reaction buttons that toggle and roll their counts.
7. **Customers.** "Teams that stopped chasing updates. Here is what changed for them." Three story cards, each with a drawing that plays on hover: Kettlebrook's release dots closing up from every 6 weeks to every 2 (3× more releases), Larchway's four tools flying into one Plotline mark (4 → 1), Quillmere's ring filling from 45% to 92% answered in 7 days.
8. **Quote.** "We used to spend Monday agreeing on what was true. Now the roadmap is true, and Monday is for building." from Nadia Okoro, VP of Product at Kettlebrook.
9. **Pricing.** "Free for small teams. Simple per-member pricing when you grow." A Monthly / Yearly switch (Save 20%) and a team-size slider. Free ($0, up to 10 members, warns past 10), Team ($10 or $8, most popular, with a conic gradient border), Business ($18 or $15) and Enterprise (Custom); prices and "$… a month for N" totals roll to their new values.
10. **FAQ.** Six questions that open one at a time, and "Can't find what you need? Our team replies within one working day." with Contact us.
11. **Changelog.** "Shipped this month. A new release every week." Four releases with date, version, New or Improved, title and body, each with a small picture on a sky; the row under the pointer widens onto a soft panel.
12. **Call to action.** On a dusk sky with a soft light that follows the pointer: "Plan less. Ship more." rising word by word, "Set up your first roadmap in ten minutes. Free for teams up to 10.", Book a demo and Start for free.
13. **Footer.** The mark, "The planning tool for teams that ship. Requests, roadmaps and releases in one calm workspace.", a pulsing "All systems normal", three link columns (Product, Company, Follow), and "© 2026 Plotline, a fictional company made for this template."

## Look

- Ink `#0E1116`, text `#4D5562`, soft `#6B7380`, faint `#9AA1AC`, lines `rgba(14,17,22,.08)` and `.12`, panels `#F5F6F8` and `#EEF0F3`, accent `#3355FF` on `#E9EDFF`, red `#E5484D`, green `#2F9E62`. White page.
- Headlines in Inter Tight weight 500, tracking about -0.035em to -0.045em, un-blurring word by word, with the second sentence in grey. The container is `max-w-[1280px]` with hairlines down both sides and across the top of each section.
- Skies: dusk (pink to periwinkle), day (blue) and aurora (peach, mint, blue, lilac), made of large blurred blobs drifting slowly under a film-grain overlay; sand is soft ridges drawn in SVG. Mock cards are white, radius 14px, with a hairline ring and a long soft shadow.

## Motion

- Reveals rise and un-blur once on scroll with ease `[0.16, 1, 0.3, 1]`; tabs, pills, toasts and cards use a spring (stiffness 420, damping 34).
- Drag and pointer effects use motion values and springs, not state. Round any trig-computed positions to two decimals so the server and browser render the same markup.
- With reduced motion, the skies stop drifting, the marquee stops, the cursors are hidden, counters jump to their values and the timeline does not demo itself.

## Content

Plotline and every company, person, figure and quote are invented sample content: the team is Maya Lind, Theo Ruiz, Jonas Berg, Priya Shah, Nadia Okoro and Sam Ito. Keep the nav, timeline rows, logos, FAQs and changelog in one data file so a reader can swap in their own.
