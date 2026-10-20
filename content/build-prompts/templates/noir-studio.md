# Nova Studio — creative studio landing page

Build a one-page landing site for **Nova Studio**, an independent 14-person creative studio in Lisbon that does branding, motion and web under one roof. The feel is editorial and confident: a white page, huge tight type, one rose accent, and work that moves. Every interactive piece shows the studio's craft (a work reel, a rebrand comparison, a palette, a type specimen) rather than a generic demo. All client names, people and numbers are invented placeholders.

## Stack

- Next.js (App Router) with a single client component page (`"use client"`), React 19, TypeScript strict.
- Tailwind CSS 4 for layout and styling; colours hard-coded as hex values (no theme tokens), so the page looks identical in light and dark site themes.
- Framer Motion 12 for all motion. No other dependencies, no remote images, no web fonts.
- Wrap the page root in `<MotionConfig reducedMotion="user">`, set `background: #fff`, `color: #1d1d1f` and `colorScheme: "light"` on the root.

## Page structure and copy

1. **Sticky glass nav.** Logo: a four-point star in rose that rotates slowly, then "NOVA" (bold) and "Studio" (grey). Links: Work, Case study, Services, Studio, Contact. Magnetic rose CTA "Start a project". The bar gains a blurred white background and a hairline as you scroll; on phones the links fold into a dropdown sheet.
2. **Hero, the discipline index.** Top row: left, "Independent studio, est. 2016" / "Lisbon and remote · 14 people"; right, the H1 "We design brands, make them *move*, and build the sites they live on." ("move" in italic serif, rose). Below, three full-width rows separated by hairlines, each a button: a small meta column (number 01–03, a one-line description, project count) and a giant word: **Branding**, **Motion**, **Web**. Below the rows: CTAs "Start a project" and "Watch the reel", plus a pulsing green dot and "Booking new projects from February 2027."
3. **Selected work.** Eyebrow "Selected work, 2023–2026", title "Ten projects we'd show our parents.", side note "A slice of 146 projects…". A curved 3D poster reel of ten projects (Halden, Pilot, Sora, Ōto, Kiln, Vela, Fable, Moss, Tide, N°9) with caption "Drag the reel, or fling it." Then a slow marquee of invented client names alternating bold sans and italic serif.
4. **Case study: Halden Coffee.** Left: a before/after comparison of the 1984 badge logo (beige, double-ring badge, serif caps) versus the 2026 identity (espresso-brown field, huge lowercase "halden." wordmark with an ember dot, an orange coffee bag). Right: eyebrow "Case study · Halden Coffee", title "A forty-year-old roaster, redrawn for the next forty.", a paragraph, then three counting stats: +31% wholesale enquiries, 9 wks kickoff to shelves, 14 bag designs from one system.
5. **Services, a pinned scroll story.** Title "One team from first sketch to last deploy." Four steps scroll past on the left while a pinned visual swaps on the right: 01 Branding "Systems, not just logos." (a paint-chip deck of Halden's 12-colour palette that fans open; click copies a hex); 02 Motion "Every curve, tuned by hand." (design-tool scrub fields for radius, rotation and scale driving a shape); 03 Web "Sites built from the brand's own parts." (a UI card that explodes into its layers); 04 Craft "Look closer. We did." (a draggable glass lens over a Halden Grotesk type specimen).
6. **Studio.** Title "Small on purpose." Four counting stats (146 projects, 14 people, 68% returning clients, 3 projects at a time) and six team cards with gradient initials avatars.
7. **Engagements.** Three selectable cards in a radiogroup: Sprint (2 weeks, from €18k), Identity (8–10 weeks, from €65k, selected by default), Partner (monthly, from €14k / mo), each with a short description and a checklist.
8. **Start a project.** Left: title "Tell us what needs to move." and a brief card with four capsule toggles (Branding, Motion, Website, Naming and strategy), a Budget segmented control and a Start segmented control, plus a live "Brief:" summary line. Right: a signature card "Project brief · Nova Studio / Your company" you sign with the pointer; after a pause a plastic sleeve slides over it. Note: "It's a handshake, not a contract."
9. **FAQ** (four questions about early-stage clients, who does the work, in-house teams, payments).
10. **CTA band**, dark: "Have something that needs to move?" with "Start a project" and "See the reel".
11. **Footer** with three link columns and the placeholder disclaimer.

## Look

- Page `#ffffff`; alternate sections `#f5f5f7`. Text `#1d1d1f`, secondary `#6e6e73` (never lighter for body copy). Accent rose `#e11d48`; dark rose `#9f1239` on the pale rose summary chip `#fff1f3`.
- System font stack (`-apple-system, "SF Pro Display", "Helvetica Neue", system-ui, sans-serif`); italic accents use `ui-serif, Georgia, serif`.
- Hero words `clamp(60px, 11.6vw, 172px)`, weight 600, line-height 0.9, tracking −0.068em. H1 `clamp(26px, 3.2vw, 42px)`. Section titles `clamp(34px, 5.4vw, 60px)`, tracking −0.04em. Captions 12–13px.
- Cards white, radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Segmented controls `#f0f0f3` with a white sliding thumb. `tabular-nums` on every number.

## Motion

- **Signature hero interaction:** a floating preview card (300×214) follows the pointer over the index with a spring (stiffness 230, damping 24, mass 0.7) and tilts with horizontal velocity (±11°, from `useVelocity`, re-sprung at 300/30). Hovering a row makes it active: the word turns rose, slides 14px right and shows "↘" (spring 300/24). The card plays that discipline's three-frame mini reel: frames wipe in with a clip-path spring, with story-style progress bars on top. With no pointer over it, the card parks at the right end of the active row and the active row cycles every 3.6s. Use motion values only; no React state per pointer move. On touch or narrow screens, the card sits inline under the rows and a tap selects a row.
- Hero rows enter with opacity, blur and 24px of travel, staggered 0.08s.
- Reveals: once, small `amount`, at most 24px travel, never left invisible.
- Springs everywhere (segmented thumbs 420/32, cards 320/28). Counters count up once in view.
- Pointer-follow effects only on `(hover: hover) and (pointer: fine)`. Read media queries in effects, never during render, so server and client HTML match.

## Motion Kit components used

- **Curved Reel:** the selected-work poster reel.
- **Before / After:** the Halden rebrand comparison, with keyboard arrows on the handle.
- **Fan Deck:** Halden's palette; click a chip to copy its hex.
- **Scrub Inputs:** the motion step's hand-tuned radius, rotation and scale.
- **Component Layers:** the web step, a UI card exploding into its layers.
- **Glass Lens:** zoom on the type specimen.
- **Capsule Toggles:** the "what do you need" switches in the brief.
- **Sign & Seal:** signing the project brief.

## Responsive and accessibility

- Works from 390px up with no horizontal scroll: rows keep a 40px number column, the hero type scales down to 60px, grids collapse to one column, the pinned story becomes stacked steps with their visuals inline, and fixed-size demos are scaled to fit their column.
- Real `<button>` elements for rows, cards, chips and toggles, with `role="radio"`/`aria-checked` on choice groups, visible focus rings in rose, aria labels on icon-only controls, and text contrast of at least 4.5:1.

## Checklist

- [ ] Hero index, floating preview and idle cycle all work; nothing in the hero is blank before interaction.
- [ ] At least six Motion Kit components, each doing a studio job.
- [ ] One accent, hard-coded colours, explicit root background and light colour scheme.
- [ ] No hydration warnings, no `Math.random()`/`Date.now()` in render.
- [ ] Reduced motion respected; reveals ≤24px; springs, not linear tweens.
- [ ] No real companies, logos or testimonials.
