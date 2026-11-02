# Build prompt: Skein — observability landing page

Build a single-page marketing site for **Skein**, a tool that stitches logs, metrics and traces from every service into one live thread, and lets an engineer ask what broke in plain language. It ships in dark and light, with no accent colour: the page is warm near-black and off-white, and the only colour comes from status (green, amber, red, blue) and from a few particles that shift hue. The hero is a canvas drawing, not a screenshot: thousands of strands pulled into a single bright line.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4. Colours come from CSS variables holding space-separated RGB triplets (`--skein-ink: 250 250 249`) so utilities can add alpha, for example `bg-[rgb(var(--skein-raised)/.7)]`.
- Framer Motion 12 for UI motion. All particle scenes are plain 2D canvas with `requestAnimationFrame`. No three.js, no WebGL, no other animation or UI libraries, no remote images, no audio.
- No web fonts to load. The design uses Geist Sans, Geist Mono and Bricolage Grotesque; read them from `--font-geist-sans` and `--font-bricolage` if the app defines them and otherwise fall back to the system stack.
- `"use client"` on interactive files; wrap the page in `<MotionConfig reducedMotion="user">`.
- Dark mode is the `dark` class on `<html>`. The page's own toggle flips it (with a view transition when the browser supports it and motion is allowed) and saves the choice under `skein-theme`.
- Icons are inline SVG path data in one file, drawn with `currentColor`. No icon package.

## Shared canvas hook

One hook runs every scene. It sizes the canvas for the screen's pixel density (capped at 2), pauses when the canvas is off screen (with a 120px margin) or the tab is hidden, re-reads the theme tokens when the `dark` class changes, tracks the pointer relative to the canvas, and hands each frame `{ ctx, w, h, t, dt, reduced, dark, ink, mouse }`. With reduced motion it draws one settled frame instead of looping. Random values come from a seeded generator so every visitor sees the same scene.

## Page structure and copy

1. **Nav.** Sticky bar with the Skein mark (a scribble glyph) and name. Links: Product and Resources open hover menus, then Customers and FAQ. Product lists Trace, Ask and Watch, each with a one-line description and a dotted shape glyph drawn on canvas. Resources lists Documentation ("Guides, API reference and SDKs.") and Help centre ("Answers and walkthroughs for your team.") plus Integrations, Changelog, Blog, Careers. A theme toggle and a "Start tracing" button. Below the large breakpoint the links collapse into a menu button.
2. **Hero.** A "New" pill linking to "Skein Ask: question every trace in plain language". Headline "Every request, one thread" (display face, 74px at most, tight tracking). Sub: "Skein stitches logs, metrics and traces from every service into a single live thread. Ask what broke in plain language and get the answer with the evidence attached." Buttons "Start tracing" and "Book a demo". Beside it the **thread canvas**: 170 fibres fray out at both ends and twist into one bright thread in the middle, with small pulses of light travelling along them. Fibres spring away from the pointer and glow where it has passed, and a press sends a fast coloured pulse down the eight nearest fibres. Under the hero a three-step list: 1. Instrument ("One line of OpenTelemetry. 300+ integrations out of the box."), 2. Thread ("Skein links every span to the request it belongs to."), 3. Ask ("Question it in plain language and share the answer.").
3. **Logo strip.** "Running in production at 400+ engineering teams" over a slow horizontal marquee of invented wordmarks with glyphs (Northwind, Lumen, Quanta, Halcyon, Corvid, Meridian, Stratus, Polaris, Tidal, Arbor).
4. **Ask.** Headline "Your team loses hours hopping between dashboards to find one slow request. Skein turns that into one question." A prompt box that, once on screen, types out a question one character at a time and cycles through its four cases on its own, with chips Explain, Compare, Watch and Report. Clicking the box lets the visitor type their own question and get a sample answer (with the note "A sample answer. Connect your services for real ones."). Each chip is a scripted case: a question ("Why did checkout get slow at 14:02?"), scanning lines, then a result card with a heading ("3 likely causes"), rows of service, note, status tone and tag, and two action buttons. Under it a canvas **dot field**, a rolling wave of dots that fades toward the edges.
5. **Product story.** Three articles, Trace, Ask and Watch, each with a paragraph, three icon points and an "Explore" link. On wide screens the right half stays pinned and shows a visual that changes with scroll: a list of live services with spans per second (Trace), a typing prompt (Ask), a baseline and an alert (Watch). A canvas **morphing glyph** moves its 1,100 dots from the Trace shape to the Ask shape to the Watch shape as you scroll, and a ruler with 01, 02, 03 marks tracks progress. Under 1024px each visual sits under its own step.
6. **Integrations.** "Connect your stack: Kubernetes, databases, queues, the edge and CI. If it speaks OpenTelemetry, Skein already understands it." A panel of connected services scrolls vertically (28s loop, pauses on hover) next to a list of tool marks, and a "View all 300 integrations" link.
7. **Customers.** A carousel with previous and next buttons and direction-aware slides: a big figure ("6 minutes", "62% fewer pages", "9x faster"), a one-line claim, a short story and the team, and beside it a **trace waterfall** (route, trace id, total time, one bar per span on a shared time axis, slow spans in red, a text alternative that names them). Sample content only.
8. **Stats.** "Your services already send the data. Skein gives you the answer." Four figures with a colour-cycling icon: 9x, 62%, 1.2B, 41 min.
9. **FAQ.** "Questions engineers ask." Five questions as an accordion, one open at a time, with an animated plus and minus mark.
10. **Closing band.** "Every request, finally visible" over a canvas **line burst**: 560 curved lines radiate from the centre, drift, and bend away from the pointer, with dots that turn colourful near it. "Free for 50 million spans a month. Set up in the time it takes to deploy." Buttons "Start tracing" and "Book a demo".
11. **Footer.** Four link columns (Product, Company, Resources, Connect), a newsletter email field with validation ("Enter an email like name@company.com.") and a success state, an oversized faint "Skein" wordmark, and the line "A template: company names, people and figures are sample content."

## Look

- Light: page `#f8f7f5`, panel `#ffffff`, raised `#f0efec`, ink `#171513`, secondary `#57534e`, faint `#716b65`. Status: live `#15803d`, warn `#b45309`, crit `#dc2626`, info `#2563eb`. Primary button is ink on page, secondary is a hairline outline.
- Dark: page `#100f0d`, panel `#171513`, raised `#211f1c`, ink `#fafaf9`, secondary `#a8a29e`, faint `#88817b`. Status: live `#4ade80`, warn `#fbbf24`, crit `#f87171`, info `#60a5fa`. Primary button is `#fafaf9` with dark text.
- Everything sits in a 1140px column with 1px hairline borders on both sides and a hairline under each band.
- Display headings in Bricolage Grotesque 700 with tight negative tracking (hero `clamp(44px, 5.6vw, 74px)`, section titles `clamp(30px, 3vw, 38px)`); body in Geist Sans 15 to 16px; numbers and trace ids in Geist Mono with tabular figures.
- Cards are 14px radius with a 1px hairline from the ink colour at 10 to 12% and a panel fill at 50 to 90%.

## Motion

- Section titles and large figures reveal once as they enter: they fade out of a 10px blur with a brief red and blue fringe that settles to nothing.
- The hero text fades up out of a 6px blur in a short stagger; the thread canvas fades in over 1.6s.
- The Ask box types at 32ms a character, scans, then reveals its result; it advances through its cases by itself until the visitor takes over.
- The product glyph morphs on a cubic ease, with each dot delayed a little so the shape flows rather than snaps.
- Marquees pause on hover. Pulses (the live dot) use a soft ping.
- Everything respects `prefers-reduced-motion`: reveals and marquees stop, canvases draw one still frame, and smooth scrolling is off.

## Responsive and accessibility

- At 390px the nav collapses to a menu, the hero stacks with the thread under the text at a shorter height, the Ask box and chips wrap, the product story becomes a single column with each visual under its step, and the page has no horizontal scroll.
- Menus are buttons with `aria-expanded` and `aria-haspopup`, and close on Escape. The FAQ uses buttons with `aria-expanded` and `aria-controls`. The carousel announces changes politely. The waterfall has a text alternative.
- Canvases are `aria-hidden`; every canvas scene has the same information as text next to it.
- Text stays at 4.5:1 or better in both themes.
- No random values or `window` reads during render; coordinates computed with trigonometry are rounded so server and client markup match.

## Final checklist

- [ ] The company, people, figures and quotes are plainly sample content for a fictional product; no real company is named as a customer.
- [ ] Both themes read correctly, including the canvases (particle opacity is higher in light).
- [ ] Each Ask chip shows its own case, the box stops cycling once the visitor types, and timers never keep running after the section leaves the screen or the component unmounts.
- [ ] The product glyph passes through all three shapes in order as you scroll, and the pinned visual changes with it.
- [ ] No hydration warnings or console errors; no horizontal scroll at 320, 390, 768, 1024 or 1440px.
