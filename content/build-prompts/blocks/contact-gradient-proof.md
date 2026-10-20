# Gradient Proof Contact

Build a contact section that pairs social proof with the form: on the left a dark rounded panel cycling through three customer quotes on a timer, with pill-shaped pager dots; on the right an open, roomy form for booking a design review. Quotes rise in and blur out, and sending morphs the form into a drawn green check. It should feel confident and editorial: big quote type on near-black, generous whitespace beside it.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence` with `mode="popLayout"`, `useReducedMotion`, variants, `whileInView`), and a `cn` helper.
- File: `components/blocks/contact-page.tsx`, named export `GradientProofContact`. Export `ContactFormValues` (`{ name; email; company; message }`, strings) and `ContactSubmitHandler` (`(values) => Promise<void | { error?: string }>`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `onSubmit` | `ContactSubmitHandler` | simulated send (resolves after 900ms) | Receives the field values. Resolve to show the sent state; throw, or resolve `{ error }`, to show the message under the form. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

Colours: ink `#1d1d1f` / dark `#f5f5f7`; secondary `#6e6e73` / `#a1a1a6`; tertiary `#86868b` / `#98989d`; link `#0066cc` / `#2997ff`.

- Section: grid, 32px gap, `overflow: hidden`, radius 28px, white (dark black), ring shadow `0 0 0 1px rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`). Padding 16px / 24px `sm` / 40px `lg`. From `lg`: two columns `0.95fr 1fr`, min height 780px. Below `lg` the quote panel stacks above the form.
- Quote panel: relative vertical flex, `justify-between`, `overflow: hidden`, radius 24px, `#1d1d1f` (dark `#1c1c1e`), text `#f5f5f7`, min height 460px (540px from `sm`), padding 24px (40px from `sm`).
  - Top label: "What teams say after launch", 17px semibold, white at 60%.
  - Quote area: a `figure`, flex 1, grid with items centred, 40px vertical margin.
  - Quote: `blockquote` 24px (32px from `sm`), semibold, line height 1.25, tracking −0.025em, `text-wrap: pretty`, wrapped in curly quotes.
  - Caption 32px below: flex, 12px gap. 44px round avatar, white at 10%, 14px semibold initials (first letter of each name word). Name 15px semibold, role 13px white at 60% below it.
  - Pager: flex row, 8px gap. Each dot is a button 24px tall (hit area) holding an 8px-tall fully rounded bar: active white and 28px wide, inactive white at 30% (hover 50%) and 8px wide.
- Form side: flex, items centred, 4px side padding (16px from `sm`, 24px from `lg`). Holds the roomy form at full width with eyebrow "Customer success", title "Need help designing a better intake flow?", description "Share the workflow, audience, and deadline. We will suggest a component path that fits your product.", button "Book a design review", stretched full width.

### Shared contact form (roomy)

- Wrapper: full width, max width `2xl`, centred, `layout` animated.
- Eyebrow 15px semibold tertiary; title (`h3`) 6px below, 28px (40px from `sm`), semibold, line height 1.1, tracking −0.03em; description 16px below, max width `xl`, 15px (17px from `sm`), line height 1.5, secondary.
- Fields 32px below, 16px apart. Name, Work email and Company sit in a grid with a 14px gap that becomes two columns with a 16px gap from `sm`; Company spans both columns. Then Message full width.
  - Name (placeholder "Maya Srinivasan", `autocomplete="name"`), Work email (`type="email"`, "maya@northstar.dev"), Company + tertiary " (optional)" ("Northstar Labs", `organization`), Message (textarea, "Share the goal, deadline, and what a great outcome looks like."). Labels 13px medium. All required except Company.
- Inputs: 48px tall (textarea min 128px, 12px vertical padding, no resize), 6px under the label, radius 12px, 14px horizontal padding, 16px text, white with `inset 0 0 0 1px rgba(0,0,0,.12)`, placeholder `#a1a1a6`. Focus: `inset 0 0 0 1px #0071e3, 0 0 0 3px rgba(0,113,227,.25)`. Dark: `#2c2c2e`, `inset 0 0 0 1px rgba(255,255,255,.1)`, placeholder `#8e8e93`, focus `inset 0 0 0 1px #2997ff, 0 0 0 3px rgba(41,151,255,.3)`. Disabled 60%.
- Error: 14px medium `#ff3b30`, 12px top padding.
- Submit: 28px below, 48px tall, full width, fully rounded, `#0071e3` (hover `#0077ed`), 24px padding, 17px medium white. Loading: 16px spinning ring (25% circle + 90% quarter arc, stroke 3) + "Sending…".
- Sent state: radius 20px, `#f5f5f7` (dark `#2c2c2e`), 24px/48px padding, centred column, 16px gap: 56px `#34c759`-at-15% disc with a 28px check (`M5 12.5l4.5 4.5L19 7.5`, `#34c759`, stroke 2.6); "Message sent" 21px semibold; "We'll get back to you within 24 hours." 15px secondary; link-blue "Send another message ›" button.

## Motion

- Section is a variants container revealed once when 80px into view: `staggerChildren 0.06`, `delayChildren 0.05`. The quote panel and form side rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30).
- Quote swap keyed by index in `AnimatePresence mode="popLayout" initial={false}`: in from `opacity 0, y 24, blur(8px)`, out to `opacity 0, y −24, blur(8px)`, spring stiffness 220, damping 30.
- Pager bar width animates 8 ↔ 28px on a spring (stiffness 420, damping 34), `initial={false}`.
- Form wrapper `layout` spring 260/32; form ⇄ sent swap in from `y 12, blur(6px)`, out to `y −12, blur(6px)`, spring 320/32.
- Button label swap: in from `y 100%, blur(4px)`, out to `y −100%`, spring 420/34; press 0.97.
- Error line: height/opacity from 0, spring 300/30. Sent disc from `scale 0.6` (spring 420/18); check `pathLength 0 → 1`, 0.45s, delay 0.12s, easeOut.

## Interaction and states

- Quote rotation: state `index` (0) and `paused`. A timeout advances `index → (index + 1) % 3` 6500ms after each change; re-arm on every index change so a manual pick restarts the 6.5s wait. Hovering the figure pauses; leaving resumes. No rotation under reduced motion.
- Clicking a pager dot jumps to that quote.
- Form statuses idle, loading, success, error. Submit prevents default, disables inputs, awaits `onSubmit(values)`. `{ error }` → error with that text; a throw → its message or "Couldn't send that. Please try again."; otherwise success and clear fields. "Send another message ›" returns to idle. Without `onSubmit`, a 900ms simulated send succeeds.

## Autoplay demo

The quotes rotate on their own every 6.5s (see above):

1. "Northfield turned a vague redesign into a system we could launch. The new contact flow doubled qualified demo requests in a week." — Ira Kapoor, Growth lead, Orbitstack
2. "They asked better questions about our customers than we did. The intake form now does half of our sales team's first call." — Tomas Lindqvist, Head of product, Fernway
3. "Six weeks from first call to launch, and nothing about it felt rushed. Our support inbox got quieter the day it went live." — Amara Osei, Founder, Lumen Ledger

## Accessibility

- Pager: a `role="group"` labelled "Choose a testimonial"; each dot is a `button` with `aria-label` "Show testimonial from {name}" and `aria-pressed`.
- Quote uses `figure` / `blockquote` / `figcaption`.
- Form labels tied via `useId`; sent card `role="status"`; error `role="alert"`.
- Focus-visible: 2px `#0071e3` outline, 2px offset (also on the pager dots).
- Reduced motion: no auto-rotation, quotes and swaps cross-fade (0.2s / 0.15s), pager width jumps, entrance is a 0.2s fade.

## Acceptance checklist

- [ ] Near-black quote panel left and form right from `lg`; stacked below.
- [ ] Quotes advance every 6.5s with a rise-and-blur transition.
- [ ] Hovering the quote pauses rotation; moving away resumes it.
- [ ] The active pager bar is a 28px white pill; others are 8px dots.
- [ ] Clicking a dot shows that quote and restarts the timer.
- [ ] Initials avatars read IK, TL, AO.
- [ ] Name and email sit side by side from `sm`; Company spans the row.
- [ ] Button is full width and reads "Book a design review".
- [ ] Sending shows a spinner, then the green drawn check.
- [ ] Dark mode: black section, `#1c1c1e` quote panel, `#2c2c2e` fields.
