# Build prompt: Updraft — coding agent workspace landing page

Build **Updraft**, a one-page website for an invented agent workspace for software teams: it plans a change, writes it, runs the tests and brings back a diff worth merging, from a desktop app, the terminal, the editor and an agent kit. The feel is bright and exact: a white page, near-black ink, generous space, and one signature material, a field of tiny dots coloured along a violet-to-orange spectrum that leans toward the pointer. Product surfaces are live mocks, never videos.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (selection, focus rings, a blinking caret, a bob, a drift, a pulse, a spin) under a `.ud` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/updraft`: Onest (variable) for everything, Geist Mono (variable) for code and terminal text. Keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings. The dot field and the spectrum ribbon are drawn on canvases; everything else is SVG and HTML.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **SpectrumField**: a canvas of small dots on a grid whose colour runs through the spectrum and whose size swells around a focus point. The focus rests at a given spot and follows the pointer when it is over the field (or its parent); an optional mask fades the edges and an optional ellipse hushes the dots behind text. It fades in on first view, pauses when off screen and respects device pixel ratio.
- **SpectrumRibbon**: a narrower canvas band of the same dots that bends toward the pointer, used as a divider.
- **TypedText**: types a heading in with a spectrum-coloured caret, then calls back when done.
- **ScrubText**: a paragraph whose words go from pale to ink as it scrolls through the viewport.
- **TwoToneHeading**: a heading whose second line is set in the muted grey.
- **Button**: pills in dark, light, white and ghost, in three sizes. Every Download button opens the same download dialog through a context.

## Sections

1. **Navigation.** A thin announcement bar ("Draft 2 and scheduled agents are live in Updraft", Read the post), then the logo, Product, Use cases, Pricing, Enterprise and Resources with mega menus (a menu panel with a featured card and a grid of links), Sign in and Download. The bar hides on scroll down and returns on scroll up. On phones a menu button opens a full-screen panel with collapsible sections.
2. **Hero.** Centred over the dot field: a small "Now running on Draft 2" pill, "Hand off the work. Keep the craft." typed in, a sentence, Download for macOS and See how it works, and "Free while in preview. Also on Windows and Linux."
3. **Product tour.** A dark Updraft Desk window that widens to the full container as it scrolls in: projects and scheduled jobs in a sidebar, today's agents working through tasks (each row moving from planning to editing files to running tests to a +/− diff with a Review button), and a composer. A Play demo or Pause demo button below, and the caption "A live mock of Updraft Desk. Nothing here is a video."
4. **Tool strip.** A row of round tool icons (branches, shell, tests, bugs, schemas, deploys and more) that bob gently, slide sideways with scroll and lift on hover.
5. **Statement.** "Hand Updraft a ticket, a stack trace or a half-formed idea…" as a large scrubbed paragraph, then three figures (12 agents in parallel, 41 min median time to a reviewable diff, 0 changes merged without a human saying yes).
6. **Surfaces.** "One crew of agents. Four places to meet it.": on wide screens a sticky list of Updraft Desk, Shell, Lens and Kit beside a column of large cards; the name of the card in the middle of the viewport is highlighted with its description and link, and clicking a name scrolls to its card. The cards are live mocks: the Desk composer, a terminal running `updraft run "add retries to the webhook sender"` through plan, edit, test and done, an editor with a suggested function, and a Kit snippet with a Plan, Act, Verify loop.
7. **Teams.** "Built for people who ship and the backlogs they carry": a draggable carousel of four scenes (Solo founders with a kanban board filling itself, platform teams, mobile teams, agencies), each with a short story, a counter "01 / 04" and arrows.
8. **Plans.** Two cards: For individuals (Download, free while in preview) and For teams (Talk to us, with SSO, audit logs, private sandboxes and usage controls).
9. **Journal.** "From the journal": a horizontal row of post cards with drawn covers, dates and tags, scrolled with arrow buttons that dim at either end.
10. **Newsletter.** "Get the changelog, not the noise": topic chips (Everything, Desk, Shell, Lens, Kit), an email field with inline validation, a consent checkbox and Subscribe, which shows a confirmation.
11. **Download.** A dark rounded panel on the dot field: "Download Updraft" typed in when it comes into view, the version and release date, and buttons for Apple silicon, Intel Mac and the Windows and Linux builds.
12. **Footer.** "Hand off the work.", a line about Updraft Labs, Product, Resources and Company columns, then a giant "updraft" wordmark whose letters drift gently and lift and tilt toward the pointer, the copyright, legal links and "All systems normal".
13. **Download dialog.** A modal with platform tabs; each build row copies its name and shows a short busy then done state, with a note that the download has started. Escape closes it and focus moves into it on open.

## Look

- White page, ink `#121317`, text `#4A4D56`, muted `#767A84`, faint `#A9ACB4`, hairlines `#ECEDF0`, soft panels `#F2F3F5` to `#F7F7F9`; the dark panels are `#07080B`.
- Spectrum `#4B3BFF`, `#A63CF2`, `#FF4D7D`, `#FF9A2B`, used for the dots, the caret, the logo mark and small highlights only.
- Headings in Onest at weight 450 to 520 with tight tracking, large and calm; body 14 to 17px; Geist Mono at 11 to 13px for code.
- Container `max-w-[1320px]` with `px-5 sm:px-8 lg:px-12`; big panels with 28 to 40px radii.

## Motion

- Two eases: a soft one for reveals and a sharper ease-out for cards rising in; springs for menus, the carousel and the footer letters.
- Scroll-linked motion values for the tour window's width, the tool strip's slide and the scrubbed paragraphs, so scrolling never re-renders React.
- Canvas loops and demo timers run only while on screen.
- With reduced motion, the dot field draws once without drifting, the tour demo starts paused, the scenes show their finished state and headings appear without typing.

## Content

Updraft, Acme and every person, team, figure and post are invented sample content. Keep the tasks, tools, surfaces, scenes, plans, posts and platforms as arrays near the sections that use them so a reader can swap in their own.
