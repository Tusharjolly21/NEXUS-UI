# Nexus UI site redesign: design and build plan

Date: 2026-10-19. Status: homepage direction approved by the owner. The four key pages are designed and waiting for review on the Superdesign canvas. No site code has changed yet.

## Why

Nexus UI (nexus-ui.com) has no paying customers yet. The audit found the site loses trust and attention before anyone reaches the product:
- invented testimonials, "loved by 12,000+ developers" and a logo strip of companies that don't use it
- a full-screen splash that hides every page until all ~3 MB has loaded
- gallery previews that render as black boxes
- component counts that disagree with each other (31, 16, 80, 100+) and server-render as "0+"
- placeholder demo copy ("Create the best average product today")
- three spellings of the brand
- a generic dark "starfield + glass" look

The redesign gives Nexus UI the same visual family as its sibling product mockframe.app, which the owner likes: light, colourful, playful and physical. It also fixes every trust and performance problem above.

## Goals
- A visitor feels within seconds that the motion here is real and fun, and that they "came to the right place".
- They reach a working component, or copy an install command, from the first screen.
- Every page looks like one family, with mockframe.app.
- Every number and claim is true.

## Non-goals (for now)
- Changing prices or plans. The pricing page restyles the current tiers; money decisions come later.
- Redesigning `/dashboard` and `/admin` beyond inheriting the new tokens.
- Rewriting the components themselves.

## Anti-goals (a failure even if it ships)
- Any invented social proof, rating or usage number.
- Content hidden behind a splash or fade until JavaScript finishes.
- More than one rainbow word per page, or rainbow text used as decoration.
- Previews that show an empty or black box.

## Approved design

- **Design system:** `.superdesign/design-system.md` ("Playground", same family as mockframe.app). Reference extraction: `.superdesign/website/mockframe.app/design.md`.
- **Canvas:** https://superdesign.dev/teams/52f9fcb6-5936-4dda-90ec-4ed928658332/projects/2a609ba7-41c9-478f-bcd4-6f26c817ef54

| Page | Draft | Status |
|---|---|---|
| Home | https://p.superdesign.dev/draft/412ac67d-cff8-42d4-81bb-07b3756a0c57 | approved |
| Components | https://p.superdesign.dev/draft/9d6e889e-3d0b-425d-ad77-64ac56eebc3e | for review |
| Component detail (Gooey Input) | https://p.superdesign.dev/draft/c83b8608-9214-4772-8a86-8805a28517f0 | for review |
| Templates | https://p.superdesign.dev/draft/505c41d5-f96d-453f-9c4d-6c86c17b026e | for review |
| Pricing | https://p.superdesign.dev/draft/a9c89719-704a-4f71-9a6e-dd0d9240fccc | for review |

The draft HTML sources live in `.superdesign/tmp/nexus-*.html` (git-ignored). They are the visual spec, not code to paste.

## Information architecture

Primary nav (dark floating capsule): **Components ▾**, Templates, Blocks, Docs, Pricing, theme switch (light / system / dark), "Browse free" white pill, Sign in.
- The Components dropdown lists the sidebar categories (Marketing sections, Layout & grids, Navigation, Cards & feedback, Forms & auth, Backgrounds, 3D & motion, Text effects).
- Blog and Contact move to the footer. The "UI systems lab" tagline is dropped. The brand is always written "Nexus UI".

Footer (#09090B with a ghost wordmark) has four columns: Product, Components, Developers, Account. GitHub and X links go to the real accounts or are removed.

Routes stay as they are (`/`, `/components`, `/components/[slug]`, `/templates`, `/templates/[slug]`, `/blocks`, `/docs/*`, `/blog`, `/pricing`, `/contact`, `/login`, `/search`), so SEO is unaffected.

## Design tokens (Tailwind v4, `src/app/globals.css`)

Replace the near-grey shadcn palette with the Playground tokens, keeping the shadcn variable names so existing `ui/*` primitives inherit them:
- light: `--background #F5F5F7`, `--foreground #17171C`, `--card #FFFFFF`, `--muted-foreground #667781`, `--border rgba(23,23,28,.10)`, `--primary #17171C`
- dark: mockframe's dark values (`#0B0B10`, `#F5F5F7`, `#16161D`, `#A3ACB6`, `rgba(255,255,255,.12)`)
- add `--tint-violet|sky|peach|mint|butter|pink`, `--rainbow-1..6`, `--cta-from #FF7B42` / `--cta-to #F04A0D`, the dot-grid and bloom values, and `--radius-tile: 28px`
- **Default theme becomes light** (`src/app/layout.tsx` currently hard-codes `class="dark"`; `src/lib/theme.ts` `DEFAULT_THEME`), with the system option respected
- fonts: Inter stays (`next/font`); add Geist Mono via `next/font` for code only

## New shared components (`src/components/site/`)

| Component | Notes |
|---|---|
| `SiteNav` | Dark floating capsule; replaces `layout/site-header.tsx`. Mobile: capsule with logo, "Browse free" and a menu sheet. |
| `SiteFooter` | Replaces `layout/site-footer.tsx`. |
| `RainbowWord` | Letters in the six hues. Real text is server-rendered (letters visible without JS); drop-in and cursor lean are progressive enhancement. `aria-label` keeps the plain word. |
| `PhysicsStickers` | Matter.js, dynamically imported client-side after first paint. Stickers fall in once, rest on soft springs near the headline, can be thrown and drift home. Settled and static under `prefers-reduced-motion`. Hidden or reduced on small phones. |
| `PastelTile` | 28px radius, tint fill, preview slot, title and one line, Free/Pro tag. |
| `Band` | Full-width tinted section (mint, butter, violet). |
| `InstallCard` | Geist Mono command plus a Copy button that says "Copied". |
| `StatRow` | Static, server-rendered real numbers (no count-up from zero). |
| `ChipRail` | Horizontal pill rail; also used as filter chips. |
| `TemplateCard` | Browser frame, screenshot, name, category, "Live preview" and "Get template". |
| `PlanCard` | Pricing tiers. |

Component previews in the library:
- Each card gets a **static poster image** (WebP, generated once per component) as the default.
- The live preview mounts only on hover or focus, or when the card is in view on touch devices.
- This fixes the black tiles and cuts load.

## Page-by-page

1. **Home** (`src/components/marketing/landing-page.tsx`, rewrite).
   - Sections: hero (rainbow "landing page", physics stickers, install card), stat row and chip rail, bento of live previews, mint playground band, butter "Made with Nexus UI" wall of real template screenshots, category list, violet light/dark band, three steps, FAQ, gradient closing CTA.
   - Remove: Lenis smooth scroll, the starfield/particle canvases, the testimonial wall, the TrustedBy strip, the mosaic minis and the count-ups.
2. **Components** (`(site)/components/*`, `library/components-browser.tsx`).
   - Restyle the shell to page scroll. The current inner scroll container breaks native scrolling and scroll restoration.
   - Search with ⌘K, category chips plus sidebar, a "Free only" filter, and a bento grid of pastel tiles with poster previews.
3. **Component detail** (`library/component-detail-view.tsx`).
   - Tinted live stage with a light/dark switch and Replay, a playground panel (sliders and colours wired to the component's real props), Code/Manual tabs, an install card, a props table and a "Pairs well with" rail.
4. **Templates** (`(site)/templates/*`).
   - Filter chips by category, a featured card, and a two-column grid of real screenshots.
   - Live preview and Get template actions.
5. **Pricing** (`(site)/pricing`, `pricing/pricing-section.tsx`).
   - Three plan cards (Starter $0, Pro $99, All-Access $149, all one-time), a comparison table, an FAQ and the closing CTA.
   - Delete "Loved by 12,000+ developers", the star rating and the initials avatars.
   - Fix the homepage FAQ, which says "subscription".
6. **Blocks, Docs, Blog, Contact, Login, Search:** reskin with the shared components; no structural change.
7. **Global fixes**
   - Remove `NexusSplash` from `providers/app-providers.tsx`.
   - Drop GSAP and Lenis from the marketing pages (keep them inside the components that need them).
   - Fix the footer social links.
   - One brand spelling everywhere.

## Content rules
Real numbers only: **82 components, 18 templates, 9 blocks**. Derive them from the catalogue in `src/lib/catalog/*` at build time so they can never drift again. No testimonials, ratings or logos until there are real ones. Sentence case. One rainbow word per page.

## Build order

1. **Foundations.** Tokens in `globals.css`, light default, Geist Mono, `RainbowWord`, `PastelTile`, `Band`, `InstallCard`, `ChipRail`. Remove the splash.
2. **Shell.** `SiteNav` and `SiteFooter` in `site-shell.tsx`, including the mobile menu.
3. **Homepage**, including `PhysicsStickers` and the real template wall.
4. **Components index**, plus the poster-preview pipeline and page-scroll layout.
5. **Component detail and playground.**
6. **Templates.**
7. **Pricing**, then the FAQ fixes.
8. **Reskin the remaining pages.**
9. **QA.**
   - Lighthouse: LCP under 2.5s on mobile, with no splash.
   - Keyboard focus and screen-reader labels.
   - Reduced motion.
   - 375px mobile.
   - Light and dark.
   - The server HTML shows the real counts.

Each step is a separate PR against `main`. Step 1 must land first; steps 3 to 7 can then run in parallel.

## Notes for the builder
- This repo runs **Next.js 16**. Per `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` before writing code.
- The repo sits on an exFAT drive. Run git with `-c core.fileMode=false` and expect `._*` files, which you should ignore.
- The **Cinematic MacBook Launch** template copies Apple's site, logo and product names. Consider renaming or rebranding it before featuring it, because of trademark risk.

## Decisions I made (owner to confirm)
- The homepage headline is "Make your landing page move."
- The Components dropdown replaces separate Blog and Contact items in the nav.
- The Pro card carries a "Recommended" badge (not "Most picked", which would imply sales data).
- Single templates "from $49" is kept from the current pricing page.

## Inspiration from bencho.dev (added after step 1)

The owner asked for bencho.dev's structure and UX, keeping Nexus UI's own Playground look. Adopted for the remaining steps:
- **Gallery-first homepage.** A short hero, then straight into a live, filterable component gallery. Marketing sections shrink to what helps someone decide.
- **Filter by interaction** (Hover, Click, Drag, Scroll, Type, Loop) using `AnimationKind` from the taxonomy, alongside the categories.
- **Quiet tiles.** The live component is the thumbnail. The name, Free/Pro tag and actions (save, replay, customise) appear on hover and focus, and are always shown on touch. Pastel tints by category.
- **Component detail as a deep-linked modal** over the gallery (`?c=slug`). The full `/components/[slug]` page stays for SEO and direct links.
- **Playground controls** as switches (segmented) and levels (bar sliders) wired to real props.
- **Search is always reachable.** The nav capsule slims to logo, search and one action on scroll (done in step 2).
- **Honest paywall.** Pro tiles are blurred at the end of the free gallery under one "Unlock every component" panel.
- **Native page scroll everywhere.** This is the one thing not to copy: bencho, like the current `/components` page, scrolls inside an inner container.

Full notes: `side-session-notes/.../bencho-analysis.md` (session notes, not in the repo).
