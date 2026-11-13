# Build prompt: Hoopla — playful creative studio website

Build **Hoopla**, a one-page website for an invented social content studio: "a tiny content studio turning brands into the ones everyone's group chat is talking about." The feel is loud, sunny and handmade: sky blue and white, deep ink outlines, condensed all-caps display type, and die-cut stickers everywhere, drawn as if peeled off a sticker sheet. Everything moves with a bounce.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 utilities plus one small CSS string for selection, focus rings, a custom-cursor rule, marquees, a wiggle and a bob. Everything sits under an `.hp` wrapper.
- Framer Motion 12 for all motion. No other animation or UI libraries.
- Fonts self-hosted from `/public/fonts/hoopla`: Anton for display titles, Inter Tight (variable) for everything else, Caveat (600) for handwritten stickers. All are Open Font Licence; keep the licence files beside them.
- Icons are Phosphor paths inlined as SVG strings; the faces are Notionists (CC0) SVGs turned into data URLs. Every other picture is drawn in SVG.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Building blocks

- **Doodles**: a sticker sheet drawn in SVG (smiley, heart, star, bolt, spark, rainbow, sun, flower, cloud, a "WOW!" bubble and more). Each draws its silhouette thick in white first for the die-cut edge, then its art with 3.5px ink outlines, then a soft drop shadow.
- **Sticker**: a word on a rotated label with a white edge and a shadow, in Anton or Caveat.
- **Eyes**: two cartoon eyes whose pupils follow the pointer anywhere on the page, on springs.
- **Sky**: a blue gradient with warm and pink glows drifting low and small flat clouds drifting across.
- **Scallop edge**: a full-width row of cloud bumps with an ink line, used above and below the sky band.
- **Button**: a chunky pill with an ink outline and a 4px drop edge that tips up on hover and squashes on press.
- **Cursor**: on mouse and trackpad only, a chunky ink arrow on a fast spring that shrinks when pressed and tilts into a little label ("Drag me", "View project", "Visit", "Replay intro") over elements that name one.

## Sections

1. **Intro.** For about three seconds, on the sky, stickers ("loading", "12%", "34%", "58%", "81%", "100%", "let's go") and doodles fly up from below the screen at staggered times while the page is locked; then they fade, the nav drops in and the hero plays. Clicking the logo scrolls to the top and replays it. With reduced motion it is skipped.
2. **Navigation.** A floating white bar: the "hoopla" wordmark with an orange dot, and Home, About, Work, Services, Process, Contact as outlined pills, each in its own colour; the pill for the section on screen fills in. On phones a menu button opens a grid of filled pills.
3. **Hero.** Pinned, it shrinks and lifts away as the page scrolls up over it. "WE MAKE POSTS / PEOPLE CAN'T / SKIP" in huge Anton, each line rising out of a mask in turn, SKIP in orange; the eyes pop in on the left of the second line and a rainbow on the right. Beside SKIP a small card loops through five post formats every 2.9 seconds: a chat ("is this an ad?", typing, "no, it's a mood."), a phone feed "that scrolls", a design sticker that drops in and squashes, a creator card, and notifications ("Ivy Chen saved your post"). Start a project below. Five stickers around it (a smiley, "100% fresh", a spark, a heart, "drag us around" in Caveat) bob gently and can be dragged and flung within the hero.
4. **About.** Rising over the hero behind a scallop edge: "Who we are" and a large paragraph that lights up word by word as you scroll, with the words "rainbow", "wow" and "heart" popping in as doodles, then "See what we make".
5. **Crew.** A sky card that grows and rounds as it scrolls in, with "meet the crew" and "say hi!" stickers, a blue hill and three portraits in arched frames (Rosa Vega, Creative lead; Theo Banks, Video & edit; Kemi Ade, Creator partnerships) that spring up in turn.
6. **Work.** "OUR WORK" and See all work, then four case studies in cards with a cloud-shaped bottom edge that tip upright and rise as they scroll in, the art zooming on hover: Game, Set, Post (tennis balls on a court), Fizz Friday (a soda can in the sky), Riding the Wave (a sunset over waves), Bloom Season (flowers).
7. **Services.** "OUR SERVICES": five coloured cards stacked as you scroll, each pinning and then tipping and shrinking a little as the next slides over it: title, description, four ruled items and a picture (Creator campaigns, Short-form video, UGC that feels real, Paid social, Launch moments).
8. **Superpowers.** "OUR SUPERPOWERS": a card that springs up with three faces, the eyes and a swaying flower, over two rows of coloured superpower stickers (Trend radar, Meme fluent, Brutally honest…) scrolling in opposite directions that grow on hover.
9. **Process.** "OUR PROCESS": three cards (Plan, Make, Amplify), tilted, that straighten as they land, each with a doodle that pops in and wiggles on hover.
10. **Clients.** "TRUSTED BY" and a marquee of round client badges with icons that lift and tilt on hover.
11. **Why us.** A sky band between two scallop edges: "WHY US?" and four numbered white cards (Playful, never silly; Data with taste; Actually authentic; Quick on our feet), each with a doodle.
12. **Results.** "Hoopla since 2021" and three coloured tiles that count up once on screen: +240% average engagement lift, 11x return on paid social, 18.4M views last year.
13. **Testimonials.** "DON'T JUST TAKE OUR WORD FOR IT": four quotes as coloured chat bubbles that slide in from alternating sides, with faces, names and company handles and a "so good" sticker.
14. **Call to action.** On the sky: "READY TO GO" over a white oval reading "VIRAL?" that wobbles while the pointer is over the card, Book a strategy call, a bobbing WOW! doodle and cloud, and four coloured arches that rise from the bottom on hover.
15. **Footer.** Ink, rounded at the top: the wordmark in a white circle, hello@hoopla.studio, outlined social buttons, the six sections as big wavy-edged pills that spring up and wobble on hover, and "Hoopla is a fictional studio made for this template. Portraits by Notionists (CC0)."
16. **Floating button.** On wide screens a white "Start a project" button sits in the corner; on hover its letters scramble and settle left to right.

## Look

- Sky `#4F9BFF`, ink `#0B1233`, muted `#5B6378`, orange `#FF7130`, green `#55C891`, yellow `#F7F17A`, sun `#FFD43B`, lilac `#E3A1F7`, pink `#FF6F7D`, violet `#B49BFF`. White page.
- Titles in Anton uppercase, line height 0.9, `clamp(56px, 9vw, 132px)`; body in Inter Tight with tight negative tracking; card titles in Inter Tight 600 at about 40px.
- Ink outlines of 2 to 3.5px, rounded cards (24 to 30px), the container `max-w-[1240px]` with `px-5 sm:px-8`.

## Motion

- Two springs: a calm one (stiffness 420, damping 30) for menus and reveals and a bouncy one (stiffness 520, damping 14) for stickers, buttons and pops; ease `[0.16, 1, 0.3, 1]` for masks and zooms.
- Springs take only two keyframes, so multi-step squashes run on a short tween.
- Scroll-linked effects (the hero shrink, the about words, the crew card, the work cards, the stacked services) use motion values, not state. Round any trig-computed SVG coordinates so the server and browser render the same markup.
- With reduced motion, the intro is skipped, the skies, marquees and bobbing stop, the format reel stays on its first tile and counters jump to their values.

## Content

Hoopla and every client, person, figure and quote are invented sample content. Keep the work, services, superpowers, process steps, clients, reasons and testimonials as arrays near the sections that use them so a reader can swap in their own.
