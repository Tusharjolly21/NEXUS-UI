# Announce Bar

Build an announcement bar that can say more than one thing without shouting. A dark strip at the top of the page rolls through several short messages, each with a tag pill and a call-to-action, with a thin timer line running underneath. Hovering or focusing the bar pauses the roll so you can read. Dismissing folds the bar away while the page below slides up to fill the space, and a button brings it back. It should feel Apple-light, calm and precise.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `useSound` from `@/lib/ui-sounds`, and a `cn` helper.
- File: `components/blocks/announce-bar.tsx`, named export `AnnounceBar`, types `AnnounceBarProps` and `AnnounceBarItem`, and the demo constant `DEFAULT_ANNOUNCE_ITEMS`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `items` | `AnnounceBarItem[]` | 3 demo messages | `{ tag, text, cta, href? }`. One message holds still with no timer. Use a stable array. |
| `holdMs` | `number` | `3600` | How long each message stays. |
| `brand` | `string` | `"Nexus"` | Name in the demo page header under the bar. |
| `headline` | `string` | `"Your page starts here."` | Heading of the demo page under the bar. |
| `restoreLabel` | `string` | `"Bring the banner back"` | Label of the button that brings a dismissed bar back. |
| `enableSound` | `boolean` | `true` | Quiet swipe when the bar is dismissed. Follows the site-wide sound switch. |
| `onDismiss` | `() => void` | none | Called when the bar is dismissed. |
| `onNavigate` | `(item: AnnounceBarItem) => void` | none | Called when a message's link is followed. |
| `className` | `string` | none | Extra classes on the root. |

Demo messages: "New" / "Blocks 2.0 is out: 40 new sections" / "See what's new"; "Live" / "Motion workshop, Thursday 6pm CET" / "Save a seat"; "Pro" / "Annual plans are 20% off this week" / "Get the deal". A link left at `href: "#"` does not navigate.

There is no `autoplay` prop: the rotation is the component's resting behaviour (it holds while hovered, focused, off screen or in a hidden tab, and does not run under reduced motion).

## Layout and look

- Root: full width, `overflow: hidden`, background `#f5f5f7` / dark `#000`. It holds the bar and, below it, a demo page.
- Bar wrapper: `overflow: hidden`, height animates between 0 and auto.
- Bar (`role="region"`, `aria-label="Announcements"`): relative, flex, centred both ways, 12px gap, height 48px, 48px side padding (room for the buttons), text 13.5px white, background `#1d1d1f` / dark `#1c1c1e`.
- Message viewport: `position: relative; height: 20px; min-width: 0; overflow: hidden`, fills the width on narrow screens (`flex: 1`) and hugs its content from 640px up. The message is a link, flex, centred, 8px gap, no wrapping, line-height 20px, white: a tag pill (fully rounded, `rgba(255,255,255,.15)` background, 8px side padding, 11px semibold uppercase, 0.08em tracking), the text (truncates with an ellipsis), and from 640px up the CTA in `#64d2ff`, semibold, followed by an arrow that slides 4px right on hover.
- Dismiss button: absolutely positioned 12px from the right, 32px circle, a 10px cross (1.6px stroke, round caps) in `rgba(255,255,255,.7)`; hover `rgba(255,255,255,.1)` background and white cross.
- Timer: an absolutely positioned 2px line along the bottom edge of the bar, `rgba(255,255,255,.1)` track, `#64d2ff` fill that grows from the left (`scaleX` 0 to 1, origin left).
- Demo page (4px 20px 24px padding, 20px side): a 48px pill header (fully rounded, 16px side padding, white / dark `#1c1c1e`, ring `rgba(0,0,0,.05)` / dark `rgba(255,255,255,.08)`) with the brand on the left (14px semibold) and "Product", "Pricing" and (from 640px) "Docs" on the right (13px, `#6e6e73` / `#a1a1a6`); 24px below it a centred headline (`clamp(26px, 4.5vw, 40px)`, semibold, -0.035em tracking, `#1d1d1f` / `#f5f5f7`) in 24px vertical padding.
- Restore button (visible only while the bar is gone): 36px tall, fully rounded, 16px side padding, 13px medium, white / dark `#2c2c2e` with a hairline ring, 16px below the headline.

## Motion

- Messages roll with `AnimatePresence mode="popLayout"`: the new message enters from y +20 with opacity 0 to rest, the old one exits to y -20 with opacity 0, spring `{ stiffness: 400, damping: 34 }`.
- Timer: keyed by message index and pause state; it runs `scaleX` 0 -> 1 linearly over `holdMs`. While paused it eases back to 0 in 0.2s, and restarts when the pause ends (the next-message timeout restarts from zero in step).
- Advance: a single `setTimeout` of `holdMs` per message, cleared on change or unmount; it only runs while the bar is open, there is more than one message, motion is allowed and nothing is pausing it.
- Pause when: the pointer is over the bar, keyboard focus is inside it, the bar is off screen (IntersectionObserver) or the tab is hidden (`document.hidden`).
- Dismiss: the bar wrapper animates its height to 0 with a spring `{ stiffness: 380, damping: 36 }` and the page below (a `layout` motion element) slides up with the same spring. Restoring reverses it and returns to the first message. The restore button fades in and out.

## Interaction and states

- Pressing the dismiss button closes the bar (one swipe sound). If it was activated from the keyboard, focus moves to the restore button.
- The message is a real link; with the default `href` of `"#"` it does not navigate. `onNavigate` receives the item.
- With more than one message and motion allowed the live region is `aria-live="off"` (so the rotation does not chatter at screen readers); otherwise it is `polite`.

## Autoplay demo

Not applicable: the rotation is the resting behaviour. The preview renders `<AnnounceBar />`, centred vertically in a 420px tall stage, background `#f5f5f7` / dark `#000`.

## Accessibility

- Region landmark named "Announcements"; real link and button elements; the dismiss button is labelled "Dismiss announcements"; decorative arrow and cross are `aria-hidden`.
- Hover and keyboard focus pause the roll. Visible focus: underline on the message link, 2px white ring on the bar buttons, 2px `#0071e3` (dark `#0a84ff`) outline on the restore button.
- Reduced motion (`useReducedMotion`): nothing rolls by itself and the timer is hidden; a "Next" button (labelled "Next announcement") sits beside the dismiss button so every message is reachable; messages swap with a 0.12s fade and the bar folds and the page moves without a spring.
- Text contrast is at least 4.5:1 in both themes.

## Sound

- Prop `enableSound?: boolean` (default `true`).
- Dismissing the bar plays `swipe` from `@/lib/ui-sounds` at volume 0.5 (a short airy sweep). The rotation, the pause, the restore button and the Next button are silent; nothing plays on hover. The rotation is not user action, so there is no `play.auto`.
- The sound follows the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`). No audio files are used: it is Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- [ ] The three messages roll up in turn about every 3.6s, with the timer line filling underneath.
- [ ] Hovering or focusing the bar stops the roll and the timer; leaving or blurring resumes it.
- [ ] Off screen or in a hidden tab the roll holds.
- [ ] Dismiss folds the bar away, the page slides up, and one swipe plays; "Bring the banner back" restores it at the first message.
- [ ] Keyboard dismiss moves focus to the restore button.
- [ ] With reduced motion nothing rolls on its own, a Next button appears, and every message can be reached.
- [ ] Dark mode swaps the bar, demo header, button and page background to the dark palette.
- [ ] At 360px wide the message truncates with an ellipsis and nothing overflows.
