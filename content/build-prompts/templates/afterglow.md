# Build prompt: Afterglow — release analytics landing page

Build a single-page marketing site for **Afterglow**, a product that lines up every deploy with the metrics that moved after it. The feel is true black with one ember orange, warm off-white type, a hero dashboard you can actually use, and a full-width WebGL light trail halfway down the page.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts, no audio.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.
- The light trail is a small raw WebGL canvas (no three.js). It pauses off screen, slows down for reduced motion, and shows a striped gradient if WebGL is unavailable.

## Page structure and copy

1. **Nav.** Floating pill with the Afterglow mark; links Product, How it works, Customers, Pricing, FAQ; the active link follows the section in view. A "Start free" button. Below 768px the links collapse into a menu button that opens a panel; Escape closes it.
2. **Hero.** Badge "Release diffs for every deploy". Headline "See what every release actually changed." Sub: "Afterglow lines up each deploy with the metrics that moved after it, so you know within minutes whether a change helped, hurt, or did nothing at all." Buttons "Start free" and "Book a demo", and the note "Free for one project. No card needed." Under it a **release dashboard** in a browser frame.
3. **Release dashboard.** A sidebar (Releases, Metrics, Funnels, Replays, Alerts), four metric tabs, a 28-day line chart with release markers you can click, a hover read-out, and a table of releases with a sparkline and a confidence badge per row. Choosing a metric or a release redraws the chart and the table. It steps through releases by itself until the first interaction.
4. **Customer strip.** Ten invented company names set as marks, drifting slowly.
5. **How it works.** "Connect your repo / Ship the way you already do / Read what changed". Three steps that light up in turn as you scroll, each with a small preview: an install command with a copy button (`npx afterglow init`), a deploy marker, and an impact read-out.
6. **Product bento.** "Everything after the deploy button". Five cards: **Release diffs** (drag a handle across a chart to compare before and after; it snaps to the release), **Alerts that know what shipped** (alert cards you can roll back or dismiss, with a reset), **Funnels by release** (switch between two versions and see the step that broke), **Replays, filtered by change** (a cursor follows a path and presses), **Fits the tools you have** (integration toggles).
7. **Light trail.** "Every release leaves a trail." Full-width WebGL lanes of ember light that lean away from the cursor, with three stats over it.
8. **Customers.** "Teams that stopped guessing." A two-tone wall of twelve quotes on a dark ground, some with a highlighted phrase and some with one number.
9. **Pricing.** "Priced per project, not per seat". Monthly and Yearly switch (radio group) and three plans: Hobby ($0), Team ($29 monthly, $24 yearly, featured), Scale ($99 monthly, $82 yearly). The price digits slide when the switch changes. An Enterprise row below.
10. **FAQ.** Six questions in an accordion, one open at a time.
11. **Closing band and footer.** "Know what your last release did." Four link columns and a line noting this is a template.

## Look

- Page `#000000`, cards `#0b0b0c` and `#121214`, hairlines `rgba(255,255,255,.08)`.
- Text `#f3efe9`, secondary `#a39c94`, muted `#6a645e`.
- Ember `#ff7a2f`, light ember `#ffc58a`, up `#34d399`, down `#ff5a4d`.
- System font stack plus a monospace stack for code and version numbers. Hero headline `clamp(40px, 7vw, 84px)`, weight 600, tracking -0.05em.

## Motion

- Headline lines rise out of a mask. Sections fade up once as they enter.
- Chart lines draw in with `pathLength`. Sliding digits use `AnimatePresence mode="popLayout"`.
- The release-diff handle is driven by a motion value; the funnel switch uses a shared `layoutId` pill.
- Everything respects `prefers-reduced-motion`.

## Responsive and accessibility

- At 390px the dashboard drops its sidebar and the table drops its sparkline columns, the bento stacks to one column, the testimonial wall becomes a single scrolling column inside its frame, and the page has no horizontal scroll.
- Tabs, chart markers and table rows are keyboard operable with visible focus rings. The release-diff handle is a slider with arrow-key support.
- Text stays at 4.5:1 against black. A skip link goes to the first section.
- No random values or `window` reads during render.

## Final checklist

- [ ] No invented ratings or review counts; testimonials and numbers are plainly demo content for a fictional product.
- [ ] Choosing a metric or a release updates the chart and the table.
- [ ] The diff handle drags and snaps; alerts roll back and dismiss; the funnel switch changes the numbers.
- [ ] Monthly and yearly prices both read correctly.
- [ ] No hydration warnings or console errors; no horizontal scroll at 320, 390, 768, 1024 or 1440px.
