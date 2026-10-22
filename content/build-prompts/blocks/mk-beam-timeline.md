# Beam Timeline

Build a milestone timeline with a beam that follows your reading. As you scroll the frame, a line of light runs down the rail; its glowing head stretches longer the faster you scroll and settles when you stop. Each milestone lights up and slides in as the beam reaches it. It should feel Apple-light and calm, in light and dark mode. The frame scrolls on its own (it is a fixed-height scroll box), so it works the same on a full page and inside a small preview.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `useScroll`, `useVelocity`, `useSpring`, `useTransform`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`) and a `cn` helper.
- File: `components/blocks/beam-timeline.tsx`, named export `BeamTimeline`, types `BeamTimelineProps` and `BeamTimelineItem`, and the demo array `DEFAULT_BEAM_TIMELINE_ITEMS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `{ when, title, body }[]` | 5 demo milestones | `when` is the year or label shown in blue. |
| `heading` | `string` | `"How we got here"` | Heading at the top of the scrolling content. |
| `hint` | `string` | `"Scroll down."` | Line under the heading. |
| `label` | `string` | `"Timeline"` | Accessible name for the section and the scroll region. |
| `height` | `number` | `540` | Height of the scrolling frame in px. |
| `className` | `string` | none | Extra classes on the section. |

Demo milestones: 2023 "A folder of snippets" (Twelve animations copied between side projects. Nobody else had seen them.), 2024 "First public release" (Forty components, one landing page, and a launch post that did better than expected.), 2025 "Blocks and templates" (Whole sections, then whole sites. Teams started building their marketing pages on it.), 2026 "Studio Pro" (A paid library, a tuning panel, and the first full-time hire.), Next "Motion for everyone" (Accessible by default, light and dark, and a playground to tune every spring.). These are invented.

There is no `autoplay`: the beam is driven by scrolling the frame.

## Layout and look

- Root `<section aria-label>`: full width, background `#f5f5f7` (dark `#000`), padding 48px vertical and 16px horizontal (64px and 24px from `sm`). Inside, a centred `max-w-[1000px]` card: `overflow: hidden`, radius 24px, white (dark `#1c1c1e`), hairline `0 0 0 1px rgba(0,0,0,.05)` (dark `rgba(255,255,255,.08)`).
- Scroll frame: `height` px, `overflow-y: auto`, 20px side padding (40px from `sm`), focusable `region`. Content column `max-w-[620px]` centred, padding 56px top and 300px bottom (room so the last milestone can reach the middle).
- Heading `clamp(26px, 4vw, 36px)` semibold, tracking -0.03em, `#1d1d1f` / `#f5f5f7`; hint 8px below, 15px, `#6e6e73` / `#a1a1a6`.
- List: `<ol>` 40px below, left padding 40px, `position: relative`. Rail: 2px wide, `left: 11px`, full height, `#ececf0` (dark `#3a3a3c`). Beam: 2px wide, same x, `top: 0`, height = beam length, gradient `#5e5ce6` to `#0071e3` (dark end `#0a84ff`). Head: 6px wide at `left: 9px`, blurred 3px, gradient transparent to `#0071e3`, positioned at `top = max(0, beamLength - tail)` with height `tail`.
- Each milestone `<li>`: 56px bottom padding. Node: a 24px box at `left: -40px, top: 4px` holding a 14px circle with a 2px border: off = border `#d2d2d7` (dark `#48484a`), fill white (dark `#1c1c1e`); on = border and fill `#0071e3` (dark `#0a84ff`) plus a 6px halo `rgba(0,113,227,.12)` (dark `rgba(10,132,255,.2)`). Text: year 13px semibold tabular blue (`#0071e3`, dark `#2997ff`), title 20px semibold tracking -0.02em, body 15px / 1.55 in secondary colour.
- A 64px gradient fades the bottom of the frame into the card colour.

## Motion

- `useScroll({ container: frame })` gives `scrollYProgress` and `scrollY`. Progress is smoothed with `useSpring(scrollYProgress, { stiffness: 160, damping: 30 })`. Beam length = progress x list height (measured with a `ResizeObserver`).
- Tail length: `useSpring(min(160, 40 + |velocity| * 0.12), { stiffness: 120, damping: 20 })`, where velocity is `useVelocity(scrollY)`.
- A milestone is reached when `offsetTop + 14 <= beamLength`. Reached: node colours transition over 0.3s and the node pulses (scale 1, 1.4, 1 over 0.35s); text goes from opacity 0.4 and x 12px to opacity 1 and x 0 with a spring (300/30).

## Interaction and states

- Scroll the frame by wheel, touch, scrollbar or keyboard; scrolling back up dims later milestones again and retracts the beam.
- No clickable elements.

## Autoplay demo

Not applicable: it is scroll-driven. The preview renders `<BeamTimeline />` and the visitor scrolls the frame.

## Accessibility

- The scroll frame is a labelled, focusable `region` so keyboard users can scroll it. The list is a real ordered list; the rail, beam, head and nodes are `aria-hidden`. Text is always present in the DOM (milestones not yet reached are only dimmed to 40%).
- Focus outline: 2px `#0071e3` (dark `#0a84ff`), 2px offset. Text contrast in the lit state is at least 4.5:1 in both themes.
- Reduced motion (`useReducedMotion`): the beam still follows the scroll directly but without the spring, the head keeps a fixed length, and milestones fade without sliding or pulsing.

## Acceptance checklist

- [ ] `<BeamTimeline />` renders with no props at 540px high with all five milestones dimmed.
- [ ] Scrolling the frame draws the beam down the rail and lights each milestone as the beam passes it.
- [ ] Scrolling fast stretches the glowing head; stopping lets it settle.
- [ ] Scrolling back up dims milestones again.
- [ ] Works inside a small preview tile and on a full page, with no dependence on page scrolling.
- [ ] Dark mode swaps the card, rail, nodes and text.
- [ ] Reduced motion: no slide, pulse or stretch; milestones still light.
