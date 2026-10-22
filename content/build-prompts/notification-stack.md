# Notification Stack

Build a toast stack: new notifications slide up from the bottom and pile into a neat, receding stack of three. Hovering the stack fans every toast out into a list and pauses their timers. Toasts can be swiped away sideways or closed, and a "loading" toast turns into a success once its work finishes. Four trigger buttons push sample toasts. It should feel like a polished system notification centre: quick, springy and quiet.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `drag`).
- File: `components/notification-stack/notification-stack.tsx`, named export `NotificationStack`; export `NotificationStackProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Pushes sample toasts by itself until someone presses a trigger. |

Internal model: `{ id: number; kind: "success" | "error" | "loading" | "info"; title: string; body?: string }`.

Samples (one trigger each, in this order):
- success — "Changes saved" / "Your profile is up to date."
- info — "New sign-in" / "Safari on a Mac, just now."
- error — "Upload failed" / "The file is over 25 MB."
- loading — "Publishing…" / "This takes a few seconds." (its trigger is labelled "Promise")

## Layout and look

- Root: full-width vertical flex, centred, 24px gap.
- Stack: an `<ol>`, full width, max 380px, 240px tall, `position: relative`. Toasts are absolutely positioned at the bottom, full width, `transform-origin: 50% 100%`.
- Toast: 68px tall, radius 20px, row with 12px gap, padding left 14px, right 8px. Light: white/90% with `backdrop-blur-xl`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 12px 30px -12px rgba(0,0,0,.25)`. Dark: `#2c2c2e`/90%, shadow `0 0 0 1px rgba(255,255,255,.08), 0 12px 30px -12px rgba(0,0,0,.6)`. Cursor grab (grabbing while active).
- Icon badge: 36px circle tinted with the kind colour + `"1f"` (~12% alpha). Colours: success `#34c759`, error `#ff3b30`, info `#0071e3`, loading `#86868b`. Glyph: 16px SVG, stroke 3 in the kind colour, round caps — success `M5 12.5l4.5 4.5L19 7.5`, error `M7 7l10 10M17 7L7 17`, info `M12 11v6M12 7.5v.5`. Loading shows a 16px spinner: 2px border `#d2d2d7` with top `#1d1d1f` (dark `#48484a` / top `#f5f5f7`).
- Text column (flex 1, truncating): title 15px semibold, tracking −0.01em, `#1d1d1f` / `#f5f5f7`; body 13px `#6e6e73` / `#a1a1a6`.
- Close button: 36px circle, `#86868b` 14px × icon (stroke 2.6); hover bg black/5% and text `#1d1d1f` (dark: white/10%, `#f5f5f7`).
- Empty state: "Notifications appear here", 13px `#86868b` / `#98989d`, centred 24px above the bottom, fades in.
- Triggers: wrapping centred row, 8px gap. Pills 36px tall, 16px horizontal padding, 13px medium, capitalised kind name; white with `0 0 0 1px rgba(0,0,0,.08)` (hover `.16`), dark `#2c2c2e` with `rgba(255,255,255,.1)`, text `#1d1d1f` / `#f5f5f7`.

## Motion

- Every toast uses one spring: stiffness 380, damping 32.
- Order newest first; `i` = 0 for the newest.
- Collapsed: `y = −i × 13px`, `scale = 1 − i × 0.05`, `z-index = 100 − i`. Toasts with `i > 2` animate to opacity 0 (only three show).
- Expanded (hovered): `y = −i × (68 + 10)px`, scale 1, all visible — a list with 10px gaps growing upward.
- Enter: from `y 80, opacity 0, scale 0.9` (rises in from below). Exit: `opacity 0, scale 0.9, y 30` in a 0.2s tween. `AnimatePresence initial={false}`.
- Swipe: `drag="x"`, `dragElastic 0.6`, `dragSnapToOrigin`. On drag end, if `|offset.x| > 90` dismiss it; otherwise it snaps back.
- Icon change: `AnimatePresence mode="popLayout" initial={false}`. The spinner rotates 360° every 0.7s linear and exits by scaling to 0. A glyph enters from `scale 0.3, rotate −30°` with spring stiffness 600, damping 16, and its path draws `pathLength 0 → 1` in 0.35s after 0.1s.
- Trigger press: `whileTap` scale 0.94.

## Interaction and states

- Push: append with an incrementing id, keeping at most the 4 previous toasts (5 total; older ones are dropped).
- Auto-dismiss: non-loading toasts get a 4200ms timer. Keep timers in a `Map<id, timeoutId>`; dismissing clears the timer and removes the toast.
- Loading: after 1800ms, change that toast in place to success, "Published", "Your site is live.", then start its 4200ms timer. The icon morphs from spinner to tick.
- Hover: pointer enter on the stack expands it and clears all dismiss timers; pointer leave collapses it and reschedules every non-loading toast for 2600ms.
- Close button dismisses immediately.

## Autoplay demo

When `autoplay` is true, push the next sample every 1500ms, cycling success → info → error → loading. A pointer-down on the trigger row marks it touched and the interval clears itself on its next tick.

## Accessibility

- The `<ol>` has `aria-live="polite"` so new toasts are announced.
- Close buttons have `aria-label="Dismiss"`; triggers and close buttons show a 2px `#0071e3` focus-visible outline. Icons are `aria-hidden`.

## Acceptance checklist

- [ ] Pressing triggers stacks toasts: the newest in front, two smaller ones peeking above, older ones hidden.
- [ ] Hovering fans all toasts into a list with 10px gaps; leaving collapses them.
- [ ] Toasts don't disappear while hovered; after leaving they go about 2.6s later.
- [ ] Dragging a toast more than 90px sideways removes it; less snaps back.
- [ ] "Promise" shows a spinner that becomes a drawn green tick and "Published" after 1.8s.
- [ ] Never more than five toasts in the list.
- [ ] Empty state text shows when there are none.
- [ ] With `autoplay`, toasts arrive every 1.5s until a trigger is pressed.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Pressing a trigger button (success, info, error, promise) plays `ping` from `@/lib/ui-sounds` (one high, clear tone with a long tail) as the toast arrives.
- Each sample toast that autoplay pushes by itself plays the same `ping`, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. The loading-to-success change, auto-dismiss, swiping and the close button are silent, and nothing plays on hover.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
