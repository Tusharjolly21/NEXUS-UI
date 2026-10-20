# Build prompt: Orbit, five AI agents that review every pull request

Build a single-page marketing site for **Orbit**, a code review product that runs five specialist AI agents on every pull request (tests, security, performance, style and docs) and posts one combined review. The feel is Apple-light and precise: a pale page, white cards, one clear blue accent, big tight headlines, and motion driven by springs. The signature moment is the **agent ring** in the hero: the five agents orbit a pull request card on a tilted ellipse, you drag the ring to spin it, and whichever agent lands in front reports its finding on the card.

## Stack

- Next.js (App Router) with React 19 and TypeScript in strict mode. One client component (`"use client"`).
- Tailwind CSS 4. Hard-code every colour; never use theme tokens such as `bg-background` or `text-foreground`.
- Framer Motion 12 for all motion. No other UI or animation libraries, no remote images, no web fonts. System font stack for text, `ui-monospace, "SF Mono", Menlo, monospace` for code.
- Wrap the root in `<MotionConfig reducedMotion="user">` and give it `style={{ colorScheme: "light" }}`, `bg-[#fbfbfd]` and `text-[#1d1d1f]`.

## Page structure and copy

1. **Sticky glass nav.** Logo (a dark planet with a tilted blue orbit line and a small moon that travels along it) and "Orbit"; links Agents, Review, Setup, Pricing, FAQ; blue "Add to GitHub" button.
2. **Hero, editorial header over a full-width stage.** Left: eyebrow "Code review, five ways at once" and the headline "Five reviewers on every pull request." with "Five" in blue. Right: "Orbit runs a tests, security, performance, style and docs agent on each PR, then posts one combined review. Your human reviewers get to talk about the design." Buttons "Add to GitHub" and "Read a sample review". Below, the stage: a dashed ellipse (back half behind the card, front half in front of it), five round agent buttons on the ellipse, and in the centre the PR card for "#4127 Retry failed webhook deliveries" (+184 −37). The card lists the five agents with a verdict and a Pass, Note or Blocking chip, shows the selected agent's finding with its file and line, and ends with "Merge blocked by Security". Caption: "Drag the ring to spin it. Whoever lands in front reports on the pull request."
3. **Stats row**, four counters: 4 min median review, 31% fewer reverted merges, 0 comments on a clean PR (counts down from 12), 1 combined review. Caption naming them as placeholder figures.
4. **The agents** (pinned scroll story), head "Each one does one job, properly.", five steps:
   - Tests, "Finds the lines your tests never run.": a code snippet with green and red coverage bars and a button "Add 2 tests to this PR" that turns into its own progress bar, then "View the commit".
   - Security, "Stops secrets and injections at the door.": a dark snippet with the line that logs the signing secret highlighted, and a "Hold to merge anyway" control that only confirms after a deliberate 1.6 s hold ("Override logged").
   - Performance, "Measures the change against a real budget.": "This PR adds +38 ms at p95", a ruler picker for the per-PR latency budget (0 to 90 ms, presets 10, 25, 50), and a chip that flips between "Over budget" and "Within budget" as you drag.
   - Style, "Your style guide, not a generic one.": four rule switches; the nit count at the bottom updates as you toggle them.
   - Docs, "Docs that ship with the code.": a markdown diff for docs/webhooks.md whose added lines slide in.
5. **The review** on a grey band, head "Comments where the problem is." A dark unified diff of `webhooks/deliver.ts` with line numbers, + and − markers, tinted rows and three inline agent comments. Beside it, a card "Answer a comment" with a liquid dial (Apply fix, Explain, Re-run, Dismiss); the line under it says what Orbit will do.
6. **Setup**, head "Ten minutes, then forget it.": three numbered steps and a light `.orbit.yml` panel with keys in blue and values in rust.
7. **Your team's year** on a grey band: "Every review, standing up." A contribution grid of pull requests reviewed that stands up into 3D columns.
8. **Pricing**, head "Pay for the people who open PRs.": a checklist and a per-seat price card with a Monthly/Yearly switch, a seat slider and digits that roll ($24 monthly, $19 yearly).
9. **FAQ** (five questions: replacing humans, comment noise, where code goes, how performance is measured, languages and CI).
10. **CTA band**: "Get your next PR reviewed five ways." with a blue glow.
11. **Footer.**

All names and numbers are invented. No real customer logos or testimonials.

## Look

- Page `#fbfbfd`, bands `#f5f5f7`, white cards with radius 22-28px and shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.
- Text `#1d1d1f`, secondary `#6e6e73`. Accent blue `#2563eb` for fills, text and buttons (5.2:1 on white). Status colours only for meaning: pass `#1a7f37`, note `#b25000`, blocking `#d70015`, each on a light tint.
- Hero headline `clamp(42px, 5.6vw, 72px)`, weight 600, tracking -0.055em. Section heads `clamp(34px, 5.4vw, 60px)`. Captions 12-13px.
- Code is 12.5-13px mono, line-height 1.8. **Every code panel keeps its whitespace**: render lines with `whitespace-pre` (and a horizontal scroll inside the panel if needed) so indentation never collapses.

## Motion

- **The agent ring (signature).** One motion value holds the ring's rotation. Each agent derives its angle (rotation + i × 72°) and from it x, y, scale (0.7 at the back to 1.08 at the front), opacity and z-index through `useTransform`, so spinning never re-renders React. Agents behind the card sit under it; agents in front sit over it. Drag horizontally anywhere on the stage (after a 6px threshold, so taps still press buttons) to spin the ring; on release, project the velocity forward and spring-snap the nearest agent to the front (stiffness 70, damping 16, carrying the release velocity). Pressing an agent springs it to the front by the shortest way round (90/17). While idle, the ring advances one agent every 3.6 s. The front agent is the selected one; only that index is React state, and the card's finding swaps with a short blur-and-slide spring.
- On phones the ring flattens into a band above the card, and the card sits below it at full width.
- Story visuals swap with a spring (160/24). Diff comments rise in once as they scroll into view. Switches, chips and pills use 420-500/26-36 springs.
- Reveals rise at most 24px, once, with a small `amount`.

## Motion Kit components used

- **Progress Button**: writing the missing tests.
- **Hold to Confirm**: the deliberate security override.
- **Ruler Picker**: the latency budget.
- **Switch** (from Settings Tabs): style rules.
- **Liquid Dial**: replying to a review comment.
- **Standing Calendar**: a year of reviews.
- **Price Odometer**: per-seat pricing.

## Responsive and accessibility

- At 390px everything stacks, the ring stage is 230px tall with a flatter ellipse, and fixed-size components are scaled with a fit-to-width wrapper. No page-level horizontal scroll.
- Every agent is a real `<button>` with `aria-pressed` and an `aria-label` such as "Security agent: Secret written to logs". The finding area is `aria-live="polite"`. Focus rings are visible.
- The pinned story decides its layout after mount so server and client HTML match.
- Contrast at least 4.5:1, including captions and code comments.

## Final checklist

- [ ] Ring spins by drag with inertia and snap, by pressing an agent, and by itself when idle.
- [ ] Selected agent, PR card row and finding always agree.
- [ ] All code panels keep indentation (`whitespace-pre`).
- [ ] One blue accent; status colours only for status.
- [ ] No hydration warnings, no console errors, no overflow at 390px, reduced motion respected.
