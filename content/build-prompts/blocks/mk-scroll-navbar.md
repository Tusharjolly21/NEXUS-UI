# Scroll Navbar

Build a site navigation bar that reacts to how the page is scrolled. At the top of the page it is a quiet full-width bar with no background. Scroll a little and it tucks into a floating glass pill. Keep scrolling down and it slides up out of the way; scroll back up even slightly and it returns straight away. A thin underline glides between the nav items to mark the section you are reading, and pressing a nav item scrolls to that section. It should feel Apple-light, springy and calm, never jumpy.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries), framer-motion (`motion`, `LayoutGroup`, `useReducedMotion`), `useSound` from `@/lib/ui-sounds`, and a `cn` helper.
- File: `components/blocks/scroll-navbar.tsx`, named exports `ScrollNavbar`, `ScrollNavbarDemoPage`, the constant `DEFAULT_SCROLL_NAVBAR_LINKS` and the type `ScrollNavbarProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Nexus"` | Wordmark next to the logo mark. Collapses away in pill mode. |
| `mark` | `string` | `"N"` | One or two letters inside the logo mark. |
| `links` | `string[]` | `["Product", "Pricing", "Customers", "Docs"]` | Nav items. Item N scrolls to the Nth element matching `sectionSelector`. |
| `ctaLabel` | `string` | `"Sign up"` | Label of the call-to-action button. |
| `scrollRef` | `RefObject<HTMLElement \| null>` | window | The scrolling element to watch, for example a panel with `overflow-y: auto`. Omit it to watch the window. |
| `sectionSelector` | `string` | `"[data-sec]"` | Selector for the sections the underline follows, searched inside `scrollRef` or the document. |
| `onNavigate` | `(label: string, index: number) => void` | none | Called when a nav item is activated. |
| `onCta` | `() => void` | none | Called when the call-to-action is pressed. |
| `enableSound` | `boolean` | `true` | Soft tick when a nav item is activated. Follows the site-wide sound switch. |
| `className` | `string` | none | Extra classes on the sticky rail. |

`ScrollNavbarDemoPage` is a demo body: a 440px hero ("Scroll this page." / "Watch the bar tuck into a pill, hide as you go down and return when you go up.") and one placeholder section per link, each marked `data-sec`, followed by 200px of space. Its props are `links`, `title` and `subtitle`. There is no `autoplay` prop: the component is driven by real scrolling.

## Layout and look

- The component renders a zero-height sticky rail: `position: sticky; top: 0; z-index: 30; height: 0; width: 100%`. The header is absolutely positioned inside it (`inset-x: 0; top: 0`), so it floats over whatever starts at the top of the page and never pushes it down. No `position: fixed` anywhere, so it also works inside a scrolling panel (put it as the first child of that panel and pass the panel as `scrollRef`). The header is a container-query root (`@container`).
- Header: flex, centred; its top padding is 0 at rest and 12px in pill mode.
- Nav (`<nav aria-label="Main">`): height 56px, full width, flex row with 8px gap, 16px side padding (24px from a 576px container up), `isolation: isolate`. In pill mode its max-width animates from 2000px to 520px and its border radius from 0 to 999px.
- Pill surface: an absolutely positioned layer behind the content (`inset: 0`, z -10, `border-radius: inherit`, `pointer-events: none`, aria-hidden) that fades from opacity 0 to 1 in pill mode. Light: `rgba(255,255,255,.78)` background, `backdrop-filter: blur(14px)`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 14px 30px -16px rgba(0,0,0,.3)`. Dark: `rgba(28,28,30,.8)` background, shadow `0 0 0 1px rgba(255,255,255,.08), 0 14px 30px -16px rgba(0,0,0,.9)`.
- Brand group pushed left (`margin-right: auto`): 15px semibold, ink `#1d1d1f` / dark `#f5f5f7`. A 28px square logo mark with 8px radius, 12px bold letter, `#1d1d1f` background with white letter (dark: `#f5f5f7` background, `#1d1d1f` letter); then the brand text, which animates its width to 0 and opacity to 0 in pill mode.
- Nav items (from a 576px container up; below that only the brand and the button show): 36px tall buttons, 12px side padding, 13.5px medium. The active one is ink (`#1d1d1f` / dark `#f5f5f7`), the others `#6e6e73` / dark `#a1a1a6`. The underline is a 2px tall, fully rounded bar `12px` in from each side and 4px above the bottom, `#1d1d1f` / dark `#f5f5f7`, shared across items with a framer-motion `layoutId` (unique per instance) inside a `LayoutGroup`.
- Call-to-action: 36px tall, fully rounded, `#0071e3` background, white 13px medium label, 16px side padding, pushed right (`margin-left: auto`, 8px from the links on wide containers).
- Focus: every control gets a 2px outline offset 2px, `#0071e3` (dark `#0a84ff`).

## Motion

- State from scroll position `y` of the watched element: `pill = y > 40`. `hidden`: if `y < 120` show; else if the change since the last event is `> 6` px (down) hide; else if it is `< -3` px (up) show.
- Header: spring `{ stiffness: 380, damping: 34 }` animating `y` between 0 and -90 and `paddingTop` between 0 and 12.
- Nav: spring `{ stiffness: 300, damping: 32 }` animating `maxWidth` (2000 to 520) and `borderRadius` (0 to 999). The surface layer fades with a 0.25s duration. The brand text animates `width` (auto to 0) and `opacity` together.
- Underline: `layoutId` spring `{ stiffness: 420, damping: 34 }`.
- Active section: sections are the elements matching `sectionSelector`; the active one is the last whose top, measured from the top of the scrolled content, satisfies `top - 120 <= y`.
- Pressing a nav item scrolls smoothly (`behavior: "smooth"`) so the section's top sits 70px below the top of the viewport (or of the scroll element).
- Scroll is read with a passive `scroll` listener on the window or on `scrollRef.current`, plus one `requestAnimationFrame` read after mount so a page that is already scrolled starts in the right state. The listener and the frame are removed on unmount. Nothing reads the window during render.

## Interaction and states

- Nav items are real buttons; pressing one (click, Enter or Space) scrolls to its section and calls `onNavigate(label, index)`.
- The bar never hides while keyboard focus is inside it (focus-within overrides `hidden`). When it is hidden it is `inert`, so it cannot be tabbed into.
- Tracking order: top of page (full bar) -> scroll past 40px (pill) -> scroll down past 120px (hidden) -> any small upward scroll (back as a pill) -> back above 120px (always visible) -> back above 40px (full bar again).

## Autoplay demo

Not applicable: the component is scroll-driven, so it has no `autoplay` prop. The preview puts a 600px tall rounded frame (max width 1080px, ring 1px) on the page, with a scrolling inner panel (`overflow-y: auto`, `overscroll-behavior: contain`) that holds the navbar as its first child, passing the panel as `scrollRef`, followed by `ScrollNavbarDemoPage`.

## Accessibility

- `<nav aria-label="Main">`; the current section's button carries `aria-current="location"`.
- Logo mark and underline are `aria-hidden`; the brand text stays in the accessibility tree even when visually collapsed.
- Visible 2px focus outlines on every control; no keyboard traps.
- Reduced motion (`useReducedMotion`): the bar fades (0.15s) instead of sliding, the pill morph, underline glide and brand collapse happen instantly, and links scroll with `behavior: "auto"`. Every state is still reachable.
- Below a 576px container the links are not shown (only brand and button), as in the design.
- No network calls; nothing navigates away.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Activating a nav item (click, Enter or Space) plays `tick` from `@/lib/ui-sounds` at volume 0.5 (a tiny high click). Scrolling, the bar tucking or hiding, and the call-to-action are silent; nothing plays on hover or focus.
- The sound follows the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: it is Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] At the top the bar is full width with no background; after ~40px of scroll it becomes a floating glass pill and the brand text collapses.
- [ ] Scrolling down past ~120px slides the bar away; the smallest upward scroll brings it straight back.
- [ ] The underline glides to the section being read as you scroll.
- [ ] Pressing a link scrolls smoothly to its section and ticks once.
- [ ] Keyboard focus inside the bar keeps it visible; a hidden bar cannot be tabbed into.
- [ ] It works with the window as the scroller and with `scrollRef` pointing at a scrolling panel, with no `position: fixed`.
- [ ] Dark mode swaps the pill, ink, underline and hero to the dark palette.
- [ ] With reduced motion the bar fades instead of sliding and scrolling is instant.
- [ ] At 360px wide nothing overflows horizontally.
