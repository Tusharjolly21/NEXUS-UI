# Nexus UI templates: Motion Kit rebuild spec

You are rebuilding Nexus UI landing-page templates in the **Motion Kit style**: the same family as the four
reference templates Relay, Tally, Wayfare and Side B. Several agents work in parallel **in the same checkout**
(`/home/claude/nexus-ui`, branch `redesign/templates-v3`) and share one dev server, so follow the file-ownership
rules exactly.

## Read first
1. The four reference templates and their shared parts, from the original Motion Kit source:
   `/tmp/claude-0/mkzip/motion-kit-src/src/templates/{Relay,Tally,Wayfare,SideB,parts}.tsx`.
   Study how each one is built: a light page, one accent colour, real Motion Kit components doing real jobs
   in context (the hero demo IS the product), a pinned scroll story, honest copy, FAQ, CTA band, footer.
2. The component catalogue: `/tmp/claude-0/tpl/KIT_COMPONENTS.md` (66 components, what each does, and which
   reference template already uses it).
3. The Motion Kit skill rules, condensed in "Look" and "Motion" below.
4. The existing template you are replacing, for its product concept, brand name and section list only.
   Its old design is being thrown away.

## Where things live (already set up; do not edit these shared files)
- `src/components/templates/kit/parts.tsx`: shared page parts. Exports `Reveal, Stagger, Words, Fit, Counter,
  Marquee, Magnetic, SectionHead, Spotlight, Nav, Faq, StickyStory, CtaBand, Footer, Phone, card, ease,
  scrollToId` (read the file for props).
- `src/components/templates/kit/components/<Name>.tsx`: the 66 components (default exports, plus named
  exports in a few files, e.g. `MatrixLoader` in MatrixLoaders.tsx and `Switch` in AnimatedTabs.tsx).
- Import them with the alias, for example
  `import PacketRouter from "@/components/templates/kit/components/PacketRouter";` and
  `import { Nav, Reveal } from "@/components/templates/kit/parts";`.
- **Never edit `kit/`** (other agents depend on it). If a kit component needs a tweak for your page,
  copy it into your own file under `src/components/templates/<your-template-dir>/` and edit the copy.
- Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, framer-motion 12, TypeScript strict. No new
  dependencies. `"use client"` at the top of client files. Do not use `next/font` or remote images.

## What you deliver per template
1. **Rebuild the page in place**: same file path and the same exported component name as today, so routing,
   the live preview and the download keep working (paths are listed in your task). Replace the whole file
   contents. Keep the product concept and brand name (for example "Helix", an AI workflow platform with
   human approval), but rewrite the copy so it is specific, honest and believable. Use invented customer
   names, people and numbers, never real companies as customers, logos, testimonials or "trusted by" walls.
   Generic tech mentions (Next.js, Postgres, Slack integration) are fine.
2. **Look (Apple light, Motion Kit)**: page `#f5f5f7` or white, white cards, text `#1d1d1f`, secondary
   `#6e6e73`/`#86868b`, **one accent colour per template** (pick one that suits the brand and differs from the
   templates next to it), system font stack, radius 22-24px, the Motion Kit card shadow
   `0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)` (or the `card` export from parts),
   `tabular-nums` for numbers, tight negative tracking on big type, 12-13px captions with a one-line hint.
   Hard-code colours. Do not use the site's theme tokens (`bg-background`, `text-foreground`,
   `border-border` and so on): the template must look identical inside and outside Nexus UI and in the
   site's dark mode. Set an explicit background and text colour on the template root, plus
   `style={{ colorScheme: "light" }}`.
3. **Composition**: 8-11 sections, landing-page length similar to the references (roughly 6-10 viewport
   heights at 1440px). Use **at least 6 Motion Kit components**, each doing a real job for this product (a
   pricing picker, a signup step, a status feed, a gallery, a booking control and so on), never a random demo
   grid. **The hero must be interactive and alive**, with one signature interaction that is distinct from the
   other templates in your group and from the four references. Use the shared parts for nav, reveals, FAQ,
   CTA and footer so the family feels consistent. Give each template its own hero composition, so they don't
   all read as "headline on the left, demo on the right".
4. **Motion rules (from the skill)**: springs, not linear durations; one signature move per component;
   drive continuous motion with motion values (`useMotionValue`, `useSpring`, `useTransform`, `useScroll`) so
   it doesn't re-render React. Reveals must be short (no more than 0.6s, no more than 24px of travel), never
   leave content invisible (use `once: true` and a small `amount`), and must not shift layout.
   Wrap the template root in `<MotionConfig reducedMotion="user">`. Pointer-driven effects only on fine
   pointers. No hydration mismatches (no `Math.random()` or `Date.now()` during render).
5. **Craft and accessibility**: real `<button>`/`<a>` elements, focus-visible rings, aria labels on icon
   buttons, text contrast of at least 4.5:1 (watch faded marquee and caption text), alt text, and no horizontal
   scroll at 390px. Mobile must look designed: stack, scale the type, and keep the hero demo usable.
6. **Build prompt**: write `content/build-prompts/templates/<slug>.md`. This is the Pro "build prompt": the brief
   a customer pastes into an AI coding agent to rebuild this template from scratch. Plain Markdown, 700-1400
   words, addressed to the agent ("Build a…"), with these parts:
   - what it is and the feel;
   - the stack;
   - the page structure, section by section, with the copy;
   - the look (exact colours, type sizes, radii, shadows);
   - the motion (springs with stiffness and damping, triggers, the hero's signature interaction);
   - the Motion Kit components used and what each does;
   - the responsive and accessibility rules;
   - a final checklist.
   Do not paste the source code.
7. **Catalogue notes**: write `/tmp/claude-0/tpl/notes/<slug>.json`. Do NOT edit `src/lib/catalog/templates.ts`
   (I merge these myself). Use this shape:
   `{"slug","title","description","category","tags":[],"techStack":[],"pages":["/"],"sections":[...],
   "features":[...],"pageLabels":[4 labels matching your 4 preview sections],"accent":"#hex",
   "kitComponents":["PacketRouter",...]}`.
   - `title`: "Brand — what it is", with no references to other companies or "X-style".
   - `category` must be one of: SaaS, AI Startup, Portfolio, Dashboard, Agency, Productivity,
     Developer Portfolio, Startup Landing Pages, AI Tools, Creator Websites, E-Commerce, Fintech, Travel, Music.
   - `techStack`: always include "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion".
8. **Preview images**, once the page is final: run
   `node /tmp/claude-0/tpl/previews.mjs <slug> "<sel1>" "<sel2>" "<sel3>" "<sel4>"`. Give 4 CSS selectors
   for 4 good-looking sections (add `id`s to your sections for this). It writes hero.webp and
   section-1..4.webp into `public/templates/<slug>/`. Open the images with the Read tool and check them.

## Verify (required)
- Dev server: `http://localhost:3123` is already running (do not start another, do not kill it). The isolated
  page for a template is `http://localhost:3123/live-preview/template/<slug>`. The first load of a page compiles
  it and can take 1-3 minutes, because the machine has 2 CPUs shared by all agents. Be patient, don't retry in a loop.
- Screenshots: `node /tmp/claude-0/tpl/shoot.mjs <slug> /tmp/claude-0/tpl/shots/<slug>-desktop 1440 900` and the
  same with `390 844` for mobile. It prints page errors and horizontal overflow, and saves one PNG per viewport.
  **Look at every screenshot** with the Read tool and fix anything off: blank areas, overlaps, clipped
  text, content that never appeared, misaligned cards, low contrast or overflow. Re-shoot after fixes.
  Zero page errors is required.
- Lint only your own files: `cd /home/claude/nexus-ui && npx eslint <your files>`. Do NOT run `tsc` on the
  whole project or `next build` (too heavy for the shared machine; I run them at the end). Type-check a single
  file only if you need to, with `npx tsc --noEmit -p tsconfig.json` piped through grep for your path, and
  only if the machine isn't busy.
- Do not commit, push or touch git. Do not edit files you don't own.

## Report back (your final message)
For each template:
- the new concept in one line;
- its accent;
- the hero interaction;
- the Motion Kit components used and their jobs;
- files written;
- the four preview selectors you used;
- an honest list of anything not verified or still imperfect.
Keep it short.
