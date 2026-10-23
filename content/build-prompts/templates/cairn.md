# Build prompt: Cairn — web studio with a blueprint layout

Build a single-page marketing site for **Cairn**, a small web studio that sells fixed-price sites. The feel is light and architectural: the whole page sits inside dashed vertical rails like a drawing, a misty mountain hero opens it, and one blue is the only accent.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Frame.** A centred 1120px column with dashed `rgba(0,0,0,.14)` vertical rails and dashed horizontal dividers between sections, with a faint hatch in the gutters.
2. **Floating nav pill.** Logo, links Pricing, Work, Services, and a blue "Book a call".
3. **Hero** over a misty mountain photo. Headline "Websites that **earn trust** before the first scroll ends" (the highlighted phrase sits in a blue selection box with a little cursor handle), balanced across two lines. Sub: "Cairn is a small design and development studio. We build custom sites with a clear story, considered motion, and the performance to hold up when real traffic arrives." Buttons: blue "Talk to Ava" with an illustrated portrait and presence dot, and white "See our work". Below, "A few of the teams we've worked with" with four brands (Quillbase, Orbitly, Fernhouse, Brightpath), each with a glyph, a name and a one-word descriptor.
4. **Process.** "A process tuned for momentum." / "Design, build, polish, and stay in sync. Nothing gets lost in the handoff." A 2x2 grid of live scenes with numbered captions: Designing (a box you can drag, with resize handles), Development (a laptop running a terminal), Motion (a code card with a spring toggle), Updates (a chat channel that posts messages).
5. **Work.** "Recent work for teams you may know." A coverflow of page screenshots you can drag; below it a quote masonry of six cards and one blue feature quote.
6. **Services.** "One studio, from first sketch to launch day." A bento: web and app design and development (laptop), microinteractions and 3D (a lock-screen clock over rolling hills), copywriting and SEO (a lit keyboard typing words), creative direction and strategy (a call mock), and "Anything and everything web" with a dotted globe that points at a city chosen from a pill row, plus "Trusted by 60+ teams worldwide" with an avatar stack. A six-item feature list sits under it.
7. **Plans.** Two fixed-price plans side by side, the right one in blue: One page ($, 1-2 weeks, two revision rounds) and Multi-page (up to 5 pages, 3-4 weeks, add a page for $900). A custom-work strip underneath.
8. **FAQ** in a two-column grid of six questions.
9. **Collage CTA.** "Let's get your website designed and launched soon." around scattered page screenshots, with a "Talk to Ava" button and "See pricing".
10. **Floating section pill** at the bottom of the viewport showing the section you are in; a footer noting this is a template.

## Look

- Page `#fff`, soft cards `#f6f7f9`, ink `#111`, secondary `#6b7280`. Blue `#2f6bff` only.
- System font stack. Headings weight 600, tracking -0.04em.
- Cards radius 18px with a 1px hairline ring.

## Motion

- Reveals fade and rise once at 25% in view with ease `[0.16, 1, 0.3, 1]`.
- The coverflow tilts cards by distance from centre with a spring. The globe rotates and re-aims on selection.
- The section pill updates from scroll position without re-rendering the page.

## Motion Kit components and their jobs

- Coverflow: recent work.
- Dot Globe: the services bento.
- Lit Keyboard: the copywriting tile.
- Avatar and Avatar Stack: the hero button, quotes, team proof.
- Section Pill: the floating navigator.
- Wordmark and Brand Glyph: the client strip.

## Responsive and accessibility

- At 390px the grid collapses to one column, wide demos sit in fit-to-width scalers, and there is no horizontal page scroll.
- The floating pill sits above the safe area and does not cover the primary button.
- Text stays at 4.5:1. Decorative scenes are `aria-hidden`.
- No random values or `window` reads during render.

## Final checklist

- [ ] The headline is balanced and the highlight does not collide with the nav.
- [ ] Every person has an illustrated portrait; every brand has its own mark.
- [ ] The four process scenes animate without layout shift.
- [ ] The globe, coverflow and keyboard respond to input.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
