# Build prompt: Surfaced — AI visibility tool landing page

Build **Surfaced**, a one-page website for an invented tool that asks AI assistants the questions a company's buyers ask, every morning, and shows which pages to change so the assistants name the company. The sample customer throughout is Calmchair, a booking tool for small dental clinics. The feel is a calm, nearly black product page with one cobalt accent, where most of the space goes to real-looking assistant answers and a working product dashboard.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string (selection, focus rings, a slow conic orbit, typing dots, a marquee) under an `.sf` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Inter (variable) self-hosted from `/public/fonts/surfaced`, with its licence file; the system monospace stack for small data.
- Icons are Phosphor paths inlined as SVG strings; the faces are Notionists (CC0) SVGs turned into data URLs.
- The assistants (ChatGPT, Claude, Gemini, Google, Perplexity) are shown with their app icons only to name the assistant being checked. Swap in neutral marks if you would rather not show them.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **AssistantIcon**: a rounded square holding an assistant's icon, with an optional ring, in a fixed size or fluid to its parent so it can sit inline in a headline.
- **Answer card**: the assistant and its icon, the question, the answer, numbered sources (domain and path) and a status line such as "Calmchair named #1", "Calmchair cited as a source" or "Calmchair not named", with a time.
- **Dashboard**: a product window with a sidebar (Overview, Prompts, Sources, Competitors, Reports, Settings), a visibility score with a weekly change and a line chart, a table of prompts with position and change, and a side panel where an assistant's answer is typed in with the brands it named and the next check time.
- **Reveal**: a fade and short rise used once per heading block; **Tag** for the small section labels.

## Sections

1. **Navigation.** The Surfaced wordmark, Product, Customers, Pricing, then Log in and Start free.
2. **Hero.** Centred: "When buyers ask Gemini, ChatGPT or Claude, make sure they hear you", each assistant's icon popping into the line beside its name and a blinking smile mark before "you". Each headline line comes in from a blur. A sentence, Start free and Run a sample check, then the dashboard rising in below.
3. **Customer strip.** "Used every morning by teams at" and six invented wordmarks, each set in its own type.
4. **Answers.** "Search got a new front door.": a wide carousel of answer cards from different assistants about clinic booking software that drifts on its own, pauses on hover, and can be dragged and flung.
5. **Features.** "Read every answer about you" and four cards with small playing demos: a lens that follows the pointer over a paragraph and shows the outdated sentence underneath (Catch answers that get you wrong); the morning check ticking through each assistant (Every assistant, every morning); a question with a suggested answer being applied to a page (Changes, not charts); a share-of-voice bar against competitors (Win more of the shortlist).
6. **How it works.** "From missing to mentioned": three steps (See where you stand, Write what's missing, Publish and check again) beside a run history for one question showing each assistant's position, the brands in the answer and the searches it ran first.
7. **Levels.** "Climb from findable to first choice": four levels (Findable, Understood, Trusted, Recommended) as an isometric stack that builds as the section scrolls, with small facts beside it (assistants checked every morning, questions tracked, the time from a published fix to the next check, minutes to set up).
8. **Customers.** "Teams that went from unnamed to first": a large blue card with a quote and a result that counts from 9% to 38%, and a grid of shorter quotes with faces, names and roles.
9. **Pricing.** "Plans that grow with your questions": a Monthly or Yearly switch (yearly saves 20%) over Starter, Growth (marked "Most teams pick this") and Agency, each with its included features.
10. **FAQ.** "Good questions" with a small chat illustration, then three groups (Getting started, How checks work, Plans and data) of questions that open one at a time.
11. **Call to action.** "Know what assistants say about you by breakfast" with Start free.
12. **Footer.** The wordmark, link columns and the copyright.

## Look

- Background `#0B0B0C`, cards `#141416`, hairlines at 7% and 12% white. Text `#EDEDEF`, secondary `#A3A3AA`, muted `#74747C`, faint `#4E4E55`.
- One accent, cobalt `#4B6BFB`, for the primary button, the smile mark and the customer card. Green `#3DD68C` for "named" and gains, red `#FF5C66` for losses.
- Titles in Inter 600 with tight tracking (about -0.045em), `clamp(32px, 5.4vw, 62px)` in the hero; body 14 to 15.5px with relaxed leading.
- Container `max-w-[1100px]` with `px-5 sm:px-8`; cards with 18 to 24px radii and 1px inner hairlines.

## Motion

- One ease for reveals and opening panels; springs for the inline icons popping in and the lens following the pointer.
- The carousel, the dashboard answer and the morning check run only while on screen.
- With reduced motion, the carousel stands still (it can still be dragged), the answer appears whole, the counters show their final values and the levels stack is shown complete.

## Content

Surfaced, Calmchair, ChairDesk, BookDental and every customer, person, figure and quote are invented sample content. Keep the answers, prompts, features, levels, testimonials, plans and questions as arrays near the sections that use them so a reader can swap in their own.
