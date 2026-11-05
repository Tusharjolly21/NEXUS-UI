# Build prompt: Margin, a developer portfolio

Build a one-page personal site for **Mira Kale**, a design engineer who designs interfaces and then builds them. The page is a single narrow column on a quiet grey page, framed by two hatched rails, and it works in light and dark. It opens on a pixel-art landscape, then reads like a well-kept profile: who she is, where she has worked, what she has shipped, what she is doing now and how to reach her. Everything is sample content for an invented person; nothing on it is real.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 for layout and spacing, plus one small block of plain CSS for the colour tokens, the hatched rails, the shared card surface, the focus ring and two keyframe loops. Every colour is a hard-coded value inside that block.
- Framer Motion 12 for all UI motion. The banner is a plain 2D canvas. No other animation or UI libraries, no remote images, no web fonts, no icon package.
- `"use client"` on interactive files; wrap the page in `<MotionConfig reducedMotion="user">`.
- Icons are inline SVG markup kept in one file, drawn with `currentColor`: Phosphor icons (MIT) for interface glyphs and Simple Icons marks (CC0) for the tool logos.
- Keep every word of copy and every number in one `data.ts` file so the page can be reused by editing that file.

## Theme

- Light and dark come from the class on `<html>`: `dark` means dark, `light` means light. When neither class is present the page follows the visitor's system setting.
- The header has a round sun and moon button. It writes the class on `<html>`. When the browser supports view transitions and motion is allowed, the new theme is revealed as a circle that grows from the click point over 620ms; otherwise it switches at once.
- The canvas banner is drawn for the current theme, so it redraws when the theme changes. Server rendering assumes light and the right theme is applied right after hydration.

## Page structure and copy

The column is at most 760px wide, centred, with a 48px hatched rail on each side from 768px up. A soft progressive blur is fixed to the bottom edge of the window.

1. **Banner.** A 216px tall (180px on phones) pixel-art landscape: four layered hill ridges, dithered to two colours. In light it has a sun with a thin ring and drifting cloud bands on a warm off-white sky, with dark green hills. In dark it has a crescent moon with a glow, twinkling stars and moonlit ridge edges. A small rounded caption sits near the top: "Make the first click feel like the hundredth." in italic.
2. **Header.** A round 88px avatar overlapping the banner: the initials MK in white on a rainbow conic gradient with a soft highlight, and a small green presence dot with a slow pulse ("Taking on projects"). Below it the name "Mira Kale" and the line "Design engineer • Founder of Northlight • Bengaluru 7:24 am", where the time is the live local time for Asia/Kolkata, refreshed every 15 seconds. On the right, three round icon buttons (GitHub, LinkedIn, Resume) and the theme button, each with a small tooltip below it on hover or focus.
3. **Intro.** "I design interfaces and then build them myself." in medium weight, then: "Currently running Northlight, a small studio, and writing Fieldnotes. Most of my work lives between a designer's file and a shipped product: the states nobody drew, the motion that tells you what just happened, and the details that make an app feel finished on the first click." Northlight and Fieldnotes are blue links with a small external-link icon. Hovering or focusing one opens a floating card: Northlight, "A two-person studio building first versions for early-stage teams. 14 launches since 2024." and Fieldnotes, "A monthly letter on interface craft. 3,100 readers, no tracking pixels."
4. **Professional experience.** An accordion of three jobs, one open at a time, the first open at load. Each row has a tinted logo tile, the company, a green "Current" badge where it applies, a kind badge, and a line with role, place and dates. The open panel has a one-line summary, three or two highlight cards and the tools used.
   - Northlight, Founder, Studio, Bengaluru, 2024 – Present, 2 yrs. "A two-person studio that designs and builds first versions for early-stage teams." Highlights: 14 launches (From first sketch to App Store or production.), Seed to Series A (Teams of three to thirty, mostly founders.), Six-week cycles (One product, one shipped version, then a handover.). Tools: Swift, React, Figma.
   - Kitebook, Senior design engineer, Full-time, Bengaluru, 2021 – 2024, 3 yrs. "Owned the design system across web and iOS for a team of forty." Highlights: 60 components (Each shipped with a motion spec and a11y notes.), A third fewer UI bugs (Reaching production, after visual tests in CI.), Weekly review (Ran the design and code review for five squads.). Tools: React, TypeScript, Swift, Figma.
   - Meridian, Design intern, Internship, Pune, Jun 2020 – Jan 2021, 8 mos. "Prototyped offline maps for the hiking app redesign." Highlights: 40 interviews (Ran on a prototype I built in Framer.), Offline downloads (Designed the flow that shipped in v4.). Tools: Figma, Framer.
5. **Proof of work.** A two-column grid of four project cards. Each has a screenshot of the product's own home page in a tinted frame, the name with a round arrow button, a two-line description and up to three tag chips plus a "+n" chip. The four screenshots are 960 by 1254 JPEGs embedded in the code as data URIs.
   - Tidal: "Wind, tide and swell for small-boat sailors, readable with wet hands." SwiftUI, Charts, WeatherKit, +2.
   - Ledgerly: "Send an invoice in under a minute and know the day it gets paid." Next.js, Stripe, PDF, +1.
   - Overlap: "Finds the hours that work for a team spread across three time zones." React, Temporal, Calendar API, +1.
   - Quiet: "A focus timer that lives in the Mac menu bar and stays out of the way." SwiftUI, AppKit, Focus API, +1.
6. **Writing.** Three rows, each a title and an "Open" pill: "Springs, not durations: describing how heavy things are" (6 min read), "The empty state is the onboarding nobody designed" (4 min read), "What a menu bar app taught me about restraint" (7 min read). The reading time slides in from the right on hover (wide screens only).
7. **Now.** A two-column grid of four small cards, each with an icon, a small label and one line: Building, "Quiet 2.0, with sessions that sync to iPhone"; Learning, "Metal shaders, slowly"; Reading, "The Elements of Typographic Style"; Based in, "Bengaluru, where it's 7:24 am" (live time).
8. **Contributions.** Title "Contributions • @mirakale". A contribution calendar of 53 weeks by 7 days in five shades of green, with month labels, "1,145 contributions in the last year" and a "Less / More" key. The numbers come from a seeded generator (seed 2026, last day 4 November 2026, quieter at weekends and in some months) so they are identical every time. It is wider than a phone, so it scrolls sideways and starts at the newest week.
9. **Stack I use.** "What I reach for when something needs to ship this week." A sideways strip of 15 tool logos with names: Figma, Framer, React, Next.js, TypeScript, Tailwind, Swift, Node.js, Postgres, Supabase, Redis, Docker, Git, Vercel, Linear. Logos are grey and faded until hovered, then take their brand colour.
10. **Recently shipped.** Title "Recently shipped • November 4, 2026". One card with three rows, each with a purple branch icon, a title, a date, one line of detail and a small arrow link: "Ledgerly: reminders that sound like you" (Oct 2026, "Follow-ups now go out in your own words, on a schedule you set."), "Tidal: offline tide tables for 1,400 harbours" (Aug 2026, "Precomputed a year of tides into 3 MB so the app works at sea."), "Overlap: one link that books the shared hour" (Jun 2026, "Guests pick a slot in their own time zone; nobody does the maths.").
11. **Call button.** An italic line, "If you've read this far, we'd probably work well together.", over a pill button "Book a 20-minute call" with a small avatar on the left. On hover a "You" circle slides in beside the avatar.
12. **Let's connect.** "Find me across code, work and the occasional essay." Four pill buttons: GitHub, LinkedIn, Mail (copies hello@mirakale.studio to the clipboard and changes to a green check and "Email copied" for 1.6 seconds) and Resume. Under a hairline, "© 2026 Mira Kale." on the left and "Made in Bengaluru" on the right.

## Look

- Light: page `#f4f4f5`, column `#fcfcfc`, cards `#ffffff`. Text `#121214`, with secondary, dim and faint text at 74%, 55% and 38% of the same colour. Hairlines `rgba(0,0,0,.07)`. Accent blue `#2563eb`. Card shadow `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.05), 0 6px 16px -10px rgba(0,0,0,.18)`.
- Dark: page `#000000`, column `#060607`, cards `#101012`. Text `#f4f4f5` with secondary, dim and faint at 76%, 56% and 38%. Hairlines `rgba(255,255,255,.08)`. Accent blue `#6b9bff`. Card shadow `0 0 0 1px rgba(255,255,255,.08), 0 1px 2px rgba(0,0,0,.5), 0 6px 16px -10px rgba(0,0,0,.8)`.
- Contribution greens, light: `rgba(0,0,0,.06)`, `#c3ead0`, `#86d6a2`, `#3fb46c`, `#1d7a43`. Dark: `rgba(255,255,255,.06)`, `#0f3d22`, `#166b3a`, `#22a257`, `#4ade80`.
- Rails: a 48px column with a 1px hairline on each side and a diagonal hatch of 1px lines every 7px at 7% (light) or 8% (dark) of black or white.
- Headings use a grotesque display face and body text a friendly geometric sans. The design names Cabinet Grotesk and Satoshi, with Bricolage Grotesque and DM Sans as stand-ins; nothing is downloaded, so each stack ends in the system sans. The name is 32px (36px from 640px) at weight 500; section titles are 20px at weight 400 in the dim colour; body copy is 14 to 18px.
- Small surfaces ("pills") are cards with a 1px ring shadow. Radii: 18px project cards, 14px cards, 12px highlight cards, 8px tooltips, full for buttons and chips.
- Sections are separated by a 1px hairline, with 24px side padding (32px from 640px) and 40px vertical padding.

## Motion

- One spring is used almost everywhere: stiffness 420, damping 34.
- Icon buttons lift 1px on hover and shrink to 0.9 when pressed. The sun and moon swap with a rotate and scale.
- The avatar's gradient turns 120 degrees on a slow spring while hovered. The presence dot pulses outward every 2 seconds.
- The accordion height animates on a spring and its highlight cards rise in one after another, 50ms apart; the chevron turns 180 degrees.
- A project card lifts 2px on hover; its screenshot scrolls up 44% over 2.6 seconds on an ease-in-out curve and returns on a spring; the frame fades to a gradient in the project's colour; the arrow turns 45 degrees. Keyboard focus does the same.
- Now cards fade up once when 60% in view. The contribution squares pop in on a diagonal, 12ms per step, once the graph is 30% in view.
- The banner redraws about 15 times a second only while it is on screen. Moving the pointer across it slides the ridges by different amounts (the nearer the ridge, the more it moves).
- The tool strip scrolls forever at 38 seconds per loop, pauses on hover and while off screen, and fades out at both edges.
- With reduced motion: the banner is drawn once, the strip and the pulse stop, transforms are off, and the theme switches without the circular reveal.

## Responsive and accessibility

- At 390px the rails disappear, the header wraps onto lines, project cards and Now cards go to one column, the highlight cards stack with the icon beside the text, and the contribution graph scrolls sideways. There is no horizontal scroll on the page.
- The accordion rows are buttons with `aria-expanded` and `aria-controls`. Icon buttons carry an `aria-label`; their tooltips also open on keyboard focus. Every interactive element has a visible 2px focus ring in the accent colour.
- The banner canvas is `aria-hidden` and its caption is real text. The contribution graph has an image label with the yearly total. The repeated half of the tool strip is `aria-hidden`.
- Placeholder links (`#`) stay on the page; real URLs open in a new tab.
- No random values or reads of `window` or the clock during render: the contribution data is seeded, and the local time is empty on the server and filled in after hydration.

## Final checklist

- [ ] The person, studio, employers and products are plainly invented, and the screenshots only show those invented products.
- [ ] Both themes read correctly, including the banner, and the theme button, the host class and the system setting all agree.
- [ ] The accordion opens one row at a time and can be closed; the project screenshots scroll on hover; the email button copies the address and resets by itself.
- [ ] The banner and the tool strip stop when off screen and stand still with reduced motion.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
