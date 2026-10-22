# Logo Stories

Build a logo cloud where every logo has a story behind it. Eight customer wordmarks sit in a grid; a soft highlight glides from logo to logo on a timer, and the panel underneath swaps to that customer's headline number and quote. Hover, focus or click a logo to jump to it. It should feel Apple-light, calm and considered. Logos are inline SVG marks plus text wordmarks of invented companies; never use real company logos or names.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), and a `cn` helper.
- File: `components/blocks/logo-stories.tsx`, named export `LogoStories`, types `LogoStoriesProps` and `LogoStory`, and `DEFAULT_LOGO_STORIES`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `stories` | `LogoStory[]` | 8 demo stories | `{ name, mark, metric, what, quote, who }`. `mark` is inline SVG shapes in a 20 x 20 box using `currentColor`. Use a stable array. |
| `heading` | `string` | `"Teams shipping with Nexus"` | Small caps line above the logos. |
| `autoplay` | `boolean` | `false` | Advances the highlight every `dwell` ms until the visitor hovers, focuses or clicks a logo. |
| `dwell` | `number` | `4500` | Milliseconds each story stays up. |
| `readLabel` | `string` | `"Read the story →"` | Label of the link under each quote. |
| `onReadStory` | `(story) => void` | none | Called when the link is pressed. Nothing navigates. |
| `className` | `string` | none | Extra classes on the section. |

Demo stories (all invented): Orbitly (ring) 3.2x faster landing pages, Northgale (two waves) -41% onboarding drop-off, Hexel (solid hexagon) 12 kB added to the bundle, Quadrel (four squares, two faded) AA accessibility out of the box, Velara (outlined triangle) +28% pricing page conversion, Pulsely (heartbeat line) 2 days from Figma to production, Meridane (circle with a line through it) 60 fps on a five-year-old phone, Lumora (dot with four rays) 1 week to rebuild the marketing site. Each has a one-sentence quote and a "Person Name, Role" attribution, with the company name appended after a comma.

## Layout and look

- Root `<section aria-label="Customer stories">`: full width, centred, padding 48px vertical and 16px horizontal, background `#f5f5f7` / `#000` in dark.
- Card: max width 760px, radius 28px, padding 20px (28px from `sm`), background white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.3)` (dark: `0 0 0 1px #3a3a3c, 0 20px 40px -26px rgba(0,0,0,.9)`).
- Heading: centred, 12px semibold uppercase, tracking 0.16em, `#6e6e73` / `#a1a1a6`.
- Logo grid: 20px below the heading, 2 columns (4 from `sm`), 6px gap. Each logo is a 64px tall button, radius 16px, centring a 20px SVG mark and the name (16px semibold, tracking -0.02em) with an 8px gap. Active colour `#1d1d1f` / `#f5f5f7`, inactive `#a1a1a6` / `#8e8e93`, colour transition 250 ms (a CSS class transition, not a hex string animated by framer-motion).
- Highlight: one shared element with `layoutId` behind the active logo, `absolute inset-0`, radius 16px, `#f5f5f7` / `#2c2c2e`, overflow hidden. While the timer runs it holds a 2px progress line along its bottom edge (`#1d1d1f` / `#f5f5f7`, origin left) that grows from `scaleX(0)` to 1 linearly over `dwell` seconds.
- Panel: 20px below the grid, min height 150px, radius 20px, padding 20px (24px from `sm`), `#f5f5f7` / `#2c2c2e`. Inside, a grid with one column on phones and `180px 1fr` with 24px gap from `sm`. Left: the metric at 44px semibold, line-height 1, tracking -0.04em, `#1d1d1f` / `#f5f5f7`, with the "what" line below it (14px, 8px gap, `#6e6e73` / `#a1a1a6`). Right: a figure with the quote in curly quotes (17px, line-height 1.45, tracking -0.01em), then a caption row (13px, `#6e6e73` / `#a1a1a6`, space-between, wraps) with "who, name" and the read link (medium, `#0071e3` / `#0a84ff`, underline on hover).

## Motion

- Highlight glide: shared-layout spring, stiffness 380, damping 34.
- Panel swap with `AnimatePresence mode="wait"` and `initial={false}`, keyed by the company. The container staggers children by 0.06 s. Metric block: from `opacity 0, y 14, blur 6px` to rest; exit `opacity 0, y -8, blur 4px` in 0.15 s. Quote figure: from `opacity 0, y 14` to rest; exit opacity 0 in 0.15 s.
- Reduced motion: the highlight jumps (duration 0), the panel only cross-fades (opacity, no blur, no y, no stagger), and the timer never runs.

## Interaction and states

- Pointer entering a logo, focusing it, or clicking it selects it and marks the section as touched. Tabbing through the logos therefore walks the stories.
- Hovering anywhere over the card pauses the timer; leaving resumes it.
- With `autoplay`, the timer is a single timeout per story. It does not run when the card is off screen (IntersectionObserver) or the tab is hidden, and it stops for good after the first logo interaction. It never runs under reduced motion.

## Autoplay demo

The preview passes `autoplay`: the highlight walks through the eight stories every 4.5 s with the progress line along the bottom of the highlight, until the first hover, focus or click on a logo.

## Accessibility

- The logo row is `role="tablist"` of real buttons (`role="tab"`, `aria-selected`, `aria-controls`); the panel is `role="tabpanel"` labelled by the active tab. The panel is `aria-live="polite"`, switched to `off` while the timer is driving it so it does not chatter.
- Marks are `aria-hidden`; the wordmark text names each logo.
- The read link is a real button that calls `onReadStory`; it never navigates.
- Focus outline: 2px `#0071e3` (dark `#0a84ff`), offset 2px.

## Acceptance checklist

- [ ] The highlight slides between logos with a spring and the progress line fills while autoplaying.
- [ ] The panel swaps with a staggered blur-and-rise, and the old content leaves first.
- [ ] Hovering, focusing or clicking a logo selects it and permanently stops autoplay.
- [ ] Hovering the card pauses the timer and leaving resumes it.
- [ ] Off screen or in a hidden tab the timer does not advance.
- [ ] With reduced motion nothing advances on its own and the panel only fades.
- [ ] Dark mode swaps card, highlight, panel and text to the dark palette; inactive logos stay readable.
- [ ] Two columns at 320px with no horizontal overflow.
- [ ] Only invented company names and hand-drawn marks appear.
