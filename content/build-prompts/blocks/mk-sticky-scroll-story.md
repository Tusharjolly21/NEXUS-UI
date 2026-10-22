# Sticky Scroll Story

Build a scroll story where the text scrolls and the picture stays. Each chapter of copy passes by on the left while one card on the right, pinned in place, keeps changing shape to match it: a pill button, then a menu, then a form, then a receipt. The reader watches a single object go through four states. It should feel Apple-light and calm, in light and dark mode. The frame scrolls on its own (it is a fixed-height scroll box), so it works the same on a full page and inside a small preview.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (including container queries), framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`) and a `cn` helper.
- File: `components/blocks/sticky-scroll-story.tsx`, named export `StickyScrollStory`, types `StickyScrollStoryProps` and `StickyScrollStoryStep`, and the demo array `DEFAULT_STICKY_SCROLL_STORY_STEPS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `steps` | `{ title, body }[]` | 4 demo steps | One entry per chapter of copy. |
| `renderVisual` | `(step: number) => ReactNode` | transfer card | Draws the pinned picture for the step in view. Keep it decorative. |
| `label` | `string` | `"Product story"` | Accessible name for the section and the scroll region. |
| `height` | `number` | `520` | Height of the scrolling frame in px. |
| `className` | `string` | none | Extra classes on the section. |

Demo steps: "Start with one button" (Every flow begins with a single, obvious action. Nothing else competes with it.), "Let it open into choices" (Press it and the same surface grows into the options. No new window, no jump.), "Ask only what you need" (Pick one and the options fold into the two fields that choice requires.), "End on a clear result" (Submit and the card settles into a receipt you can keep or undo.).

There is no `autoplay`: the story is driven by scrolling the frame, and the frame is scrollable anywhere.

## Layout and look

- Root `<section aria-label>`: `@container`, full width, white / `#000`, padding 48px vertical and 16px horizontal (64px and 24px from `sm`). Inside, a centred `max-w-[1100px]` card: `overflow: hidden`, radius 24px, background `#f5f5f7` (dark `#1c1c1e`).
- Scroll frame: `height` px, `overflow-y: auto`, focusable (`tabIndex=0`, `role="region"`, label "<label>, scrollable"). Inside, a grid: one column, 24px gap, 20px side padding; from the 2xl container width (672px) two equal columns and 40px side padding.
- Left column: padding 160px top and 220px bottom. Each step is a flex column centred vertically, `min-height: 300px`: a number "01".. in 13px semibold tabular `#0071e3` (dark `#2997ff`), then 8px below a 26px semibold title (tracking -0.03em, `#1d1d1f` / `#f5f5f7`), then 8px below a 16px / 1.5 body in `#6e6e73` (dark `#a1a1a6`), max width 340px. On narrow containers the visual also sits under each step, 20px below the body.
- Right column (wide containers only): contains a `position: sticky; top: 0` block as tall as the frame, centring the visual and, 20px below it, a row of one dot per step (6px tall pills, gap 6px, `#1d1d1f` / dark `#f5f5f7`): the active dot is 18px wide and fully opaque, the others 6px wide at 20% opacity.
- A 64px gradient fades the bottom edge of the frame into the card colour.
- Default visual, a card 280px wide (max 100%), padding 16px, white (dark `#2c2c2e`), radius 24px (999px in step 1), shadow `0 0 0 1px rgba(0,0,0,.06), 0 24px 50px -26px rgba(0,0,0,.35)` (dark: `0 0 0 1px rgba(255,255,255,.08), 0 24px 50px -26px rgba(0,0,0,.9)`):
  - Step 1: a pill with a 24px blue circle holding a plus, and "New transfer", 15px medium.
  - Step 2: three rows (14px radius, 12px/14px padding, 14px text): "To a person" (selected: `#eef5ff` fill, `#0071e3` semibold text; dark `rgba(10,132,255,.2)` and `#2997ff`), "To a business", "Between accounts" (`#f5f5f7` / dark `#3a3a3c`), each with a chevron on the right.
  - Step 3: a "To a person" label in blue, two fields (12px radius, `#f5f5f7` / dark `#3a3a3c`) reading "maya@orbitly.example" and "$ 240.00", and a full-width blue pill "Send" (`#0071e3` / dark `#0a84ff`).
  - Step 4: a 44px green circle (`#34c759`) with a white tick, "$240.00" at 22px semibold tabular, "sent to Maya Chen" in secondary text, and a blue "Undo".

## Motion

- Which step is in view: an `IntersectionObserver` rooted on the scroll frame with `rootMargin: -50% 0px -50% 0px` (a zero-height band at the middle); the step crossing that band becomes the active step. It starts on step 1.
- Step copy: opacity 1 for the active step and 0.4 for the others, 0.3s.
- The visual card is `motion.div layout` with a spring (300/30); its corner radius changes with the step. The content inside swaps with `AnimatePresence mode="popLayout"`: a fade, with the menu rows and form fields rising 10px / 8px with a 0.05s / 0.06s stagger; the receipt's circle scales 0.5 to 1 with a springy settle (400/16) and the tick draws (`pathLength` 0 to 1, 0.2s delay).
- Dots animate width and opacity on step change.

## Interaction and states

- Scroll or use the keyboard (the frame is focusable) to move through the story. Nothing else is clickable.
- On narrow containers (under 672px) the sticky column is hidden and each step shows its own picture inline.

## Autoplay demo

Not applicable: it is scroll-driven. The preview renders `<StickyScrollStory />` and the visitor scrolls the frame.

## Accessibility

- The scroll frame is a labelled, focusable `region` so keyboard users can scroll it with arrow keys, Page Up/Down and Space. Pictures (both the pinned one and the inline ones) are `aria-hidden`; the copy carries all the meaning. Colour contrast of active text is at least 4.5:1 in both themes; non-active steps are dimmed to 40% as a deliberate reading cue.
- Focus outline: 2px `#0071e3` (dark `#0a84ff`), 2px offset.
- Reduced motion (`MotionConfig reducedMotion="user"`): the card, menu rows and receipt swap without moving or resizing; opacity changes remain.

## Acceptance checklist

- [ ] `<StickyScrollStory />` renders with no props at 520px high with the pinned card showing "New transfer".
- [ ] Scrolling the frame changes the active step at the middle of the frame, and the pinned card morphs: pill, menu, form, receipt.
- [ ] The pinned card stays in place while the text scrolls; the dots track the step.
- [ ] Below 672px wide the card appears under each step and the right column is hidden.
- [ ] Works inside a small preview tile and on a full page, with no dependence on page scrolling.
- [ ] Dark mode swaps the frame, card, rows, fields and text.
- [ ] Reduced motion: no morphing movement, content still changes.
