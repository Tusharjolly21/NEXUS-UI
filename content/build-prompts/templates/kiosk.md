# Build prompt: Kiosk — magazine and blog

Build **Kiosk**, an invented independent magazine "about design, technology and the details of a good life", as a small multi-page site in one React app. The feel is a calm, editorial magazine: white pages, near-black ink, very tight bold sans headlines, a serif for reading, and one highlighter yellow used like a marker pen. Every story cover is a small 3D-looking room drawn in SVG, so the site has no image files.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string for selection, focus rings, two keyframes and the drop cap. Everything sits under a `.ks` wrapper.
- Framer Motion 12 for all motion. No other animation, routing or UI libraries.
- Fonts self-hosted from `/public/fonts/kiosk`: Inter Tight (variable, 100 to 900) for headings and UI, Newsreader (variable, 200 to 800) for story text. Both are Open Font Licence; keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the writers' avatars are Notionists (CC0) SVGs turned into data URLs.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Pages and routing

The current page lives in the URL hash so it runs anywhere without a router: `#/` home, `#/articles`, `#/category/<slug>`, `#/article/<slug>`, `#/about`, `#/contact`, `#/privacy`, `#/terms`, and anything else (including unknown slugs) shows the 404. Links are real `<a href>` elements that push the hash and change page without reloading; the back button works through `hashchange`; a new page scrolls to the top. A context gives every component the route, `go(route)`, the saved list, `toggleSave(slug)`, `toast(message)`, `openSearch()` and `openSaved()`.

## Every page

1. **Ticker.** A thin black bar on top: a yellow "Today" tab with a floating dot, then headlines scrolling sideways forever, separated by yellow sparkles, faded at both ends.
2. **Header.** The Kiosk mark (a small faceted box) and the word "kiosk", then Home, Articles, Categories and About, with a white pill that slides between them under the pointer and sits on the current page. Categories opens a mega menu of the twelve desks and a featured story. On the right: a Search field with a ⌘K hint, a bookmark button that shows how many stories are saved, and a black "Contact" pill. The header turns frosted once you scroll. On mobile a menu button opens the links.
3. **Footer.** The mark, "Stories on design, technology, culture and the details of a good life.", social icons that lift on hover, three link columns (Categories, Navigation, Utility), a strip of tiny covers scrolling sideways, and "© 2026 Kiosk, a fictional magazine made for this template." with Privacy and Terms.
4. **Overlays.** Search (⌘K/Ctrl+K toggles it, / opens it when you are not typing): a field over a blurred page, up to seven stories matching the title, desk or writer with the matched letters highlighted in yellow, matching desks as chips, arrow keys and Enter to open, Esc to close, and "No stories match "…". Try a topic like design or travel." The saved drawer slides in from the right with the saved stories (remove buttons) or "Nothing saved yet". Toasts slide up at the bottom ("Saved for later", "Removed from saved", "Link copied to clipboard"). A back-to-top button appears after 1400px. On desktop a small ink dot follows the pointer on a spring and grows into a label (for example "Read") over links that name one.

## Home

1. **Hero.** "Stories worth slowing down for." in huge type with "slowing" underlined by a yellow marker stroke, and "Kiosk is an independent magazine about design, technology and the details of a good life. New stories every weekday." Below, an accordion carousel of four stories: the open one is wide with its desk pill, Sponsored pill, date, read time and title; the others are narrow with their titles rotated. It advances every 5.2 seconds with a progress bar, and pointing at a narrow card opens it and pauses the carousel.
2. **Browse by topic.** "Twelve desks, one standard. Point at a topic to peek inside." A grid of twelve plain tiles; pointing at one reveals its cover under a spotlight that follows the pointer, with the desk's blurb and story count.
3. **Fresh off the press.** "The newest stories from every desk." with View all, and a grid of story cards: cover, date and read time, title, Read more. Hovering a card zooms the cover, highlights the title with a yellow marker and shows a save button.
4. **Editors' picks.** A black band, "Read these first", with numbered tall cards (01 to 07) on a rail you drag or fling, arrow buttons and a progress line.
5. **Most read this month.** A ranked list of six stories with view counts; the hovered row's cover floats beside the pointer on a spring.
6. **About teaser.** "A magazine for the ten quiet minutes", "Most news is written to be skimmed. We write for the ten quiet minutes with a coffee…", the editors' avatars ("7 editors, 1 desk") and two covers that drift in opposite directions as you scroll, with "About Kiosk".
7. **Newsletter.** "The good stuff, once a week." "Six stories every Friday, picked by the editors. No noise, unsubscribe in one click." An email field and Subscribe; a bad address shows "Enter an email like you@domain.com"; a good one sends a paper plane off and shows "You're in. First issue lands Friday." Small covers float around it.

## Other pages

- **Articles.** "Every story, in one place", "18 stories across 12 topics.", a search field, sort (Latest, Popular, Quick reads), grid or list layout, and desk chips with counts. Results reflow with layout animation; nothing found shows "No stories match that yet" and a clear button.
- **Category.** A big cover that drifts and scales as you scroll, the desk name and blurb, its stories, and "From other desks".
- **Story.** Reading progress across the top; breadcrumb and desk pill; the title; the dek in serif; the writer's avatar and role, date, read time, save, share (X, LinkedIn, Facebook) and copy link; a wide cover that drifts on scroll; then a three-column body: a sticky "On this page" table of contents that follows the section you are reading, the text in Newsreader with a drop cap, a pull quote, a figure, a list ("One thing, done well."), a vertical share bar, and at the end a clap button (up to 30, with a burst), Save for later, the writer card, previous and next stories and "Keep reading".
- **About.** "Why we write, and who we write for", a band that slides as you scroll, three values (Reported, not repackaged; Edited twice; Made to last), "The desk" with seven writers and their roles, and the newsletter.
- **Contact.** "Write to the desk", topic chips (A story idea, A correction, Partnership, Something else), name, email and message fields, and a thank-you state: "Thanks, <first name>. It's on the desk. An editor will reply within two working days." with Send another.
- **Privacy and Terms.** A side list of utility pages and the sample policy text.
- **404.** A huge outlined "404", "This page went to press without us.", four covers floating on parallax layers that follow the pointer, buttons back to the front page and to all stories, and desk chips.

## Look

- Ink `#0C0C0D`, text `#3F4045`, soft `#6E6F75`, faint `#A2A3A8`, lines `#ECECEE`, panels `#F6F6F7`, highlighter `#E6FF4F` with `#1B1F00` on it. White page.
- Headlines in Inter Tight weight 600 to 700, tracking about -0.045em, line height 1; story text in Newsreader around 19px with line height 1.7.
- Cards radius 20px, pills fully round, the container `max-w-[1240px]` with `px-5 sm:px-8`.
- Covers: eight scenes (a sphere on a plinth, jars, a bottle and an orange, a floating bowl, stacked books, columns, an arch and a vase, a pedestal) in eight palettes (warm orange, sage, sky and pink, teal, red, yellow, violet, slate), lit with soft gradients and a light beam, chosen per story by `{ v, p }`.

## Motion

- Reveals rise and un-blur once on scroll with ease `[0.16, 1, 0.3, 1]`; headings reveal word by word.
- Selection pills and drawers use a spring (stiffness 420, damping 34); the save bookmark swaps with a bouncy pop.
- Pointer-driven effects (the cursor, the most-read preview, the 404 layers, the picks rail) use motion values and springs, not state.
- With reduced motion, entrances and loops are switched off and the carousel stops advancing.

## Content

All names, stories, dates and view counts are invented sample content: eighteen stories across twelve desks (Business, Technology, Design, Science, Work Life, Culture, Travel, Entertainment, Gaming, Lifestyle, Hobbies, Food) by seven writers (Maya Lind, Theo Ruiz, Ines Duarte, Sam Ito, Ada Nwosu, Leo Hart, Nadia Kim). Keep it all in one data file so a reader can swap in their own.
