# Float Glass Navbar

Build the navigation section for the top of a landing page: a floating frosted-glass pill bar with a logo and wordmark, centred links, and a blue call-to-action. A soft grey lens slides under whichever link you point at, thinning as it travels fast and filling out as it lands, then glides back to the active link. Once the page scrolls a little, the bar tucks itself into a narrower pill (the wordmark folds away). When the links no longer fit, they fold into a hamburger that opens a springy glass menu.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useScroll`, `useMotionValueEvent`, `useSpring`, `useVelocity`, `useTransform`, `useReducedMotion`).
- File: `components/float-glass-navbar/float-glass-navbar.tsx`, named export `FloatGlassNavbar` (alias `FloatingNav`), exported `DEFAULT_NAV_LINKS`, types `FloatGlassNavbarProps` and `FloatGlassNavLink` (`{ label: string; href: string }`).

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Nexus"` | Wordmark; folds away when condensed. |
| `logo` | `ReactNode` | drawn mark | Replaces the default logo. |
| `links` | `FloatGlassNavLink[]` | Overview `#overview`, Components `#components`, Templates `#templates`, Pricing `#pricing` | Links. |
| `activeHref` | `string` | — | Controlled active link. |
| `defaultActiveHref` | `string` | first link | Uncontrolled initial active link. |
| `cta` | `{ label; href?; onClick? } \| null` | `{ label: "Get started" }` | Right pill; `null` hides it. Without `href` the click is prevented and only `onClick` runs. |
| `onNavigate` | `(href: string) => void` | — | When set, link clicks `preventDefault` and call this. |
| `condensed` | `boolean` | — | Force compact; undefined = condense on scroll. |
| `scrollContainerRef` | `RefObject<HTMLElement \| null>` | — | Watch this element's scroll instead of the window. |
| `condenseAt` | `number` | `24` | Scroll px before condensing. |
| `position` | `"sticky" \| "fixed" \| "static"` | `"sticky"` | `sticky top-0 z-40`, `fixed inset-x-0 top-0 z-50`, or `relative`. |
| `autoplay` | `boolean` | `false` | Tours the links and breathes wide/compact until touched. |
| `className` | `string` | `""` | Wrapper classes. |

## Layout and look

- Wrapper: full width, padding 12px sides and top, positioned per `position`.
- `<nav aria-label="Main">`: centred, full width, max-width 920px wide (animated to a measured compact width when condensed), flex, gap 4px, rounded-full, padding 6px, 8px left, 6px right. 1px border `black/6` (dark `white/10`), bg `white/70` (dark `#1c1c1e/70`), `backdrop-blur-xl` + `backdrop-saturate-150`. Shadow wide `0 0 0 1px rgba(0,0,0,.02), 0 10px 30px -22px rgba(0,0,0,.3)` (dark `0 10px 30px -22px rgba(0,0,0,.8)`); compact `0 0 0 1px rgba(0,0,0,.03), 0 18px 40px -18px rgba(0,0,0,.35)` (dark `…rgba(0,0,0,.9)`), 300ms shadow transition.
- Brand link (to the first link): default mark is 28px, radius 9px, `linear-gradient(135deg, #5ac8fa 0%, #0071e3 55%, #5e5ce6 100%)`, inset highlight `inset 0 1px 0 rgba(255,255,255,.35)`, with a 16px white "N" stroke (`M5 14.5V5.5l10 9V5.5`, width 2.2, round caps). Wordmark 15px semibold, tracking −0.02em, `#1d1d1f` / `#f5f5f7`; keep an `sr-only` copy while folded.
- Links row: centred (`mx-auto`), relative. Each link: rounded-full, padding 6px 11px, 13.5px medium, tracking −0.01em; active `#1d1d1f` / `#f5f5f7`, others `#6e6e73` / `#a1a1a6` with hover to ink.
- Lens: absolute, full row height, rounded-full, `black/6` (dark `white/10`), positioned by `x` and `width` motion values.
- CTA: rounded-full, padding 8px 12px 8px 16px, 13px semibold white on `#0071e3` (hover `#0077ed`, dark `#0a84ff`), shadow `0 6px 16px -8px rgba(0,113,227,.8)`, 14px chevron (`M6 3.5 10.5 8 6 12.5`, stroke 2).
- Hamburger (only when folded): 36px circle, hover `black/5` / `white/10`; two 16×1.75px bars inside a 16×12px box.
- Menu: absolute, full nav width, 8px below, radius 22px, padding 8px, `white/90` (dark `#1c1c1e/90`), blur, border as the bar, shadow `0 0 0 1px rgba(0,0,0,.03), 0 24px 48px -24px rgba(0,0,0,.4)`, origin top. Items: radius 14px, padding 10px 14px, 15px medium, hover `black/4` / `white/6`; active item shows a 6px blue dot on the right.

## Fit measurement

Render an invisible, absolutely positioned copy of the full bar (same paddings and font sizes, logo as a 28px spacer, CTA plus a 14px spacer) and measure it with a ResizeObserver on the wrapper: `need = copy.scrollWidth + 4`, `avail = wrapper.clientWidth − 24`. `fold = avail < need`. Compact width `tight = fold ? min(avail, 280) : min(avail, need − brandWidth)`. Re-measure when links, CTA label or brand change.

## Motion

- Bar entrance `y −16, opacity 0, scale .97` → rest. Bar changes (y 0 → 4 when compact, maxWidth 920 ↔ tight) use spring stiffness 260, damping 24; opacity tween .3s. Wordmark animates `width auto ↔ 0` and opacity with the same spring.
- Lens: `x` and `width` springs stiffness 420, damping 30, mass .8; opacity spring 300/30. `scaleY = 1 − min(|velocity of x| / 3200, 0.32)` so it thins while moving fast. Jump (no animation) to the active link after mount, on resize of the row and when the active link changes.
- CTA: `whileTap` scale .95 (spring 500/22); on hover the chevron moves x 3 (spring 600/15).
- Hamburger bars: closed at y 1 and y 9; open both at y 5 rotated ±45° (spring 500/28).
- Menu: `opacity 0, y −8, scale .96` in, exit `opacity 0, y −6, scale .97`, spring 420/30; items slide from x −8, spring 500/30, stagger 35ms.
- Reduced motion: no entrance, instant bar and menu transitions, lens spring 2000/120 (effectively instant), no thinning, no hover/tap motion.

## Interaction and states

- Hover or focus a link moves the lens to it; leaving the row (or focus leaving it) returns the lens to the active link.
- Click sets the internal active link, closes the menu, and calls `onNavigate` if provided.
- Condensed = `condensed ?? autoplayCompact ?? (scrollY > condenseAt)` using `useScroll` on the window or the given container.
- Escape closes the open menu. The menu only renders while folded.

## Autoplay demo

Every 1.1s step `k`; with `n = links + 2` and `step = k mod 2n`, condense at `step = n`, expand at `step = 0`, and move the lens to link `step mod n` (or back to active for the two extra slots). The first pointer enter or focus anywhere in the bar stops it, clears the forced compact state and parks the lens on the active link.

## Accessibility

- `aria-current="page"` on the active link (bar and menu). Hamburger has `aria-expanded` and "Open menu" / "Close menu" labels. Logo and lens are `aria-hidden`. 2px `#0071e3` / `#0a84ff` focus rings everywhere.

## Acceptance checklist

- [ ] The lens slides between links, visibly thinner mid-flight, and returns to the active link on leave.
- [ ] Scrolling past 24px shrinks the bar into a pill, nudges it down 4px and hides the wordmark.
- [ ] Narrow widths hide the links and show a hamburger that opens a staggered glass menu.
- [ ] Escape closes the menu; the bars morph into an X and back.
- [ ] `onNavigate` receives hrefs and the browser does not navigate.
- [ ] Works with a custom scroll container.
- [ ] Autoplay tours links and breathes until touched.
