# Build prompt: Forge, the coding copilot that has read your whole repo

Build a single-page marketing site for **Forge**, an AI coding assistant that indexes an entire repository (every file, commit and open pull request) so its answers and suggestions use the team's real helpers and conventions. The feel is Apple-light and calm: pale page, white cards, one warm amber accent, big tight headlines, spring motion. The signature moment is an **X-ray lens** in the hero: drag a glass circle over a code file and, inside the circle only, you see what Forge knows about each line.

## Stack

- Next.js (App Router), React 19, TypeScript strict. One client component (`"use client"`).
- Tailwind CSS 4 for layout and type. Hard-code every colour; do not use theme tokens such as `bg-background`.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts. Use the system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif`) and `ui-monospace, "SF Mono", Menlo, monospace` for code.
- Wrap the page root in `<MotionConfig reducedMotion="user">` and set `style={{ colorScheme: "light" }}`, `bg-[#fbfbfd]` and `text-[#1d1d1f]` on it.

## Page structure and copy

1. **Sticky glass nav.** Logo (a dark rounded square with a small amber flame over an anvil shape, plus the word "Forge"), links How it works, Review, Editors, Privacy, Pricing, and an amber "Install Forge" button. It blurs and gains a hairline on scroll; on phones the links fold into a sheet.
2. **Hero, demo on the left and copy on the right** (on phones the copy comes first). Pill: "Reads monorepos up to 4 million lines". Headline: "It already read the rest of your code." with "read" in amber. Body: two sentences on indexing the whole repo and warning about distant callers. Buttons "Install Forge" and "See a review". Below them a dark command line `npx forge init` with a Copy button that rolls to "Copied", and the caption "Indexing a 1M-line repo takes about six minutes, then stays in sync on every push."
3. **Stats row**, four counters that count up once: 71% of suggestions merged without edits, 6 min to index a million lines, 14 files read per answer, 0 days of your code kept after a request (counts down from 30). Caption: "Measured on our own 1.2M-line monorepo over the last 90 days. Your numbers will differ."
4. **How Forge knows** (pinned scroll story). Head: "Context is the whole product." Four steps on the left scroll past while the visual on the right stays pinned and swaps:
   - 01 Index, "It reads the whole repo, not the open tab." Visual: a folder for `northwind/checkout` (4,812 files, 1.2M lines) that tips open so file cards fan out, plus status rows with dot-matrix loaders (packages/payments done, commit history and open pull requests still reading).
   - 02 Ask, "Ask about any symbol, from where you are." Visual: a highlighted symbol in a code snippet and an "Ask Forge" menu that grows out of its button with Explain this, Find every caller, Write a test, Refactor safely and a red Forget this file.
   - 03 Suggest, "Suggestions that use your helpers." Visual: ghost-text completion lines in muted amber that arrive one by one, a Tab-to-accept hint, and chips for the files read before suggesting.
   - 04 Learn, "It picks up how your team writes." Visual: four learned conventions with percentage bars that spring to length.
5. **Review** on a grey band. Head: "Drag to see what it would change." A before/after comparison of two code panes ("Your draft" and "Forge"), with a draggable divider and Before / Split / After buttons. Three cards below: Runs your tests first, Cites its sources, One click to undo.
6. **Editors.** Head: "Same brain in every editor." A magnifying dock of six tiles (VS Code, JetBrains IDEs, Neovim, Terminal, Pull requests, Team chat) and a three-item checklist.
7. **Privacy** on a grey band. Head: "Your code stays your code." A settings card with three capsule toggles (keep request logs, use my code to improve models, keep the index in my cloud). The hint under each label rolls to a new sentence when you flip it. Compliance chips at the bottom.
8. **Pricing.** Head: "Priced per seat. Repos are free." Three plan cards (Solo free, Team $19 per seat with an amber ring and "Most teams" badge, Enterprise custom). Below them a seat calculator: an elastic stepper (1 to 30 seats) and a total whose digits roll like an odometer.
9. **FAQ** accordion, five honest questions (what reaches a model, repo size, languages, style, mistakes).
10. **CTA band**, dark rounded panel with a pointer-following amber glow: "Point Forge at your repo."
11. **Footer** with three link columns and a placeholder notice.

Everything is invented: no real customers, logos or testimonials.

## Look

- Page `#fbfbfd`, grey bands `#f5f5f7`, cards white with radius 22-28px and shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.
- Text `#1d1d1f`, secondary `#6e6e73`, captions 12-13px in `#6e6e73`.
- Accent: amber `#d97706` for fills and graphics, `#b45309` for amber text and buttons with white text (5:1 contrast).
- Hero headline `clamp(44px, 6.6vw, 84px)`, weight 600, line-height 0.98, tracking -0.055em. Section heads `clamp(34px, 5.4vw, 60px)`, tracking -0.04em. Body 17-20px.
- Numbers use `tabular-nums`. Code panes 13.5px mono with 26px lines and a light syntax palette (keywords `#9b2c9b`, strings `#2f7d32`, comments `#6e6e73`). Every code line keeps its whitespace (`whitespace-pre`).

## Motion

- **The X-ray lens (signature).** The code panel renders twice in the same position: a plain layer, and an X-ray layer with a warm dotted background, coverage bars in the gutter, underlined symbols, and a callout card for the symbol under the lens. The X-ray layer is clipped with `clip-path: circle(124px at x y)`, where x and y come from `useSpring` (stiffness 210, damping 24, mass 0.9) following target motion values. A ring with a "Forge sees" tag follows the same springs. With a mouse the lens follows the pointer; on touch you drag the ring itself (the panel keeps `touch-action: pan-y` so the page still scrolls). When nobody is touching it, the lens tours the four annotated symbols every 3 seconds and resumes six seconds after the last interaction. Four buttons below (Callers, Throws, Missing case, Untested) move the lens for keyboard users, and a polite live caption states the current finding. Only the active note index is React state; position never re-renders React.
- Headlines reveal word by word out of a blur. Section reveals rise at most 24px, use `once: true` and a small `amount`, and never leave content invisible.
- Springs everywhere: card swaps in the story 160/24, toggles and pills 420-480/30-36, convention bars 90/18, stepper rubber-bands at its limits.
- Pointer-follow effects apply to fine pointers only.

## Motion Kit components used

- **Folder Peek**: the repository index in the story.
- **Matrix Loader**: indexing status in the hero tab bar and story rows.
- **Stagger Menu**: the "Ask Forge" command menu.
- **Before / After**: the review comparison.
- **Dock**: the editor and integration picker.
- **Copy Command**: the `npx forge init` install line.
- **Capsule Toggle**: privacy settings.
- **Elastic Stepper** and the **Rolling Number** from Price Odometer: the seat calculator.

## Responsive and accessibility

- At 390px everything stacks, type scales via `clamp`, and fixed-size demos use a fit-to-width wrapper. No horizontal scroll.
- The pinned story becomes a normal list on phones with each visual under its text. Decide the layout after mount so server and client HTML match.
- Real `<button>` elements with visible focus rings, `aria-pressed` on the lens buttons, `aria-live` on the lens caption, labels on toggles and icon buttons. Text contrast at least 4.5:1, including captions.
- No `Math.random()` or `Date.now()` during render.

## Final checklist

- [ ] Hero lens works with mouse, touch drag and the four buttons, and tours by itself when idle.
- [ ] One amber accent only; no theme tokens; looks identical in a dark-mode host.
- [ ] Story pins on desktop and stacks on mobile without a hydration warning.
- [ ] Before/after, dock, toggles and seat calculator all respond and use springs.
- [ ] All code keeps its indentation.
- [ ] Reduced motion respected; no layout shift from reveals; no overflow at 390px; zero console errors.
