# Image Story Contact

Build a split contact section: the left half is a full-bleed landscape photo with a frosted-glass testimonial card floating at its bottom; the right half centres a white form card with a monogram header. Sending shows a spinner, then the form morphs into a drawn green check. It should feel warm and premium: a real place, a real quote, glass over photography, and a calm form beside it.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS (incl. `backdrop-blur`), framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, variants, `whileInView`), and a `cn` helper.
- File: `components/blocks/contact-page.tsx`, named export `ImageStoryContact`. Export `ContactFormValues` (`{ name; email; company; message }`, strings) and `ContactSubmitHandler` (`(values) => Promise<void | { error?: string }>`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `onSubmit` | `ContactSubmitHandler` | simulated send (resolves after 900ms) | Receives the field values. Resolve to show the sent state; throw, or resolve `{ error }`, to show the message under the form. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

Colours: ink `#1d1d1f` / dark `#f5f5f7`; secondary `#6e6e73` / `#a1a1a6`; tertiary `#86868b` / `#98989d`; link `#0066cc` / `#2997ff`.

- Section: grid, `overflow: hidden`, radius 28px, `#f5f5f7` (dark `#1c1c1e`), ink text. From `lg`: two equal columns, min height 780px. Below `lg` the photo stacks above the form.
- Photo side: relative, `background-size: cover`, centred, min height 420px (500px from `sm`, full row height from `lg`). Use a wide landscape photo (the reference uses a mountain-valley shot at 1600px wide); host it yourself or allow its domain.
  - Bottom shade: absolute, bottom half, gradient from black at 35% to transparent, upwards.
  - Testimonial card: absolute, 16px from the left, right and bottom (32px from `sm`); from `lg` it drops the right inset and is 520px wide. Radius 22px, white at 80% (dark `#1c1c1e` at 80%), `backdrop-blur-xl` with saturate 150%, shadow `0 20px 40px -24px rgba(0,0,0,.4)`, padding 20px (28px from `sm`).
  - Quote: 21px (26px from `sm`), semibold, line height 1.3, tracking −0.02em: “Our launch page finally feels like the product: fast, composed, and unmistakably ours.”
  - Byline 24px below: flex, 12px gap. 44px round avatar `#1d1d1f` with white 14px semibold "SN" (dark `#f5f5f7` / `#1d1d1f`). "Sana Noor" 15px semibold; "Founder, Meadow AI" 13px secondary.
- Form side: flex, items centred, padding 16px / 40px `sm` / 56px `lg`.
- Form card: full width up to `max-width: 32rem`, centred horizontally from `lg`, radius 28px, white (dark black), padding 20px (28px from `sm`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.08)`).
  - Header row, 24px above the form: flex, 12px gap. Monogram: 40px square, radius 12px, `#1d1d1f` with white 17px semibold "N", tracking −0.02em (dark inverted). Beside it "Northfield" 15px semibold over "Launch support" 13px tertiary.
  - Dense form: eyebrow "Talk to the team", title "Write to the people who build it.", description "Tell us where your page feels stuck. We can help with layout, motion, conversion details, or full section composition.", button "Send message".

### Shared contact form (dense)

- Wrapper: centred, max width `2xl`, `layout` animated.
- Eyebrow 15px semibold tertiary; title (`h3`) 6px below, 28px (32px from `lg`), semibold, line height 1.1, tracking −0.03em; description 12px below, max width `xl`, 15px, line height 1.5, secondary.
- Fields 24px below, 14px apart, single column: Name ("Maya Srinivasan", `autocomplete="name"`), Work email (`type="email"`, "maya@northstar.dev"), Company + tertiary " (optional)" ("Northstar Labs", `organization`), Message (textarea, "Share the goal, deadline, and what a great outcome looks like."). Labels 13px medium. All required except Company.
- Inputs: 44px tall (textarea min 96px, 12px vertical padding, no resize), 6px under the label, radius 12px, 14px horizontal padding, 16px text, white with `inset 0 0 0 1px rgba(0,0,0,.12)`, placeholder `#a1a1a6`. Focus: `inset 0 0 0 1px #0071e3, 0 0 0 3px rgba(0,113,227,.25)`. Dark: `#2c2c2e`, `inset 0 0 0 1px rgba(255,255,255,.1)`, placeholder `#8e8e93`, focus `inset 0 0 0 1px #2997ff, 0 0 0 3px rgba(41,151,255,.3)`. Disabled 60%.
- Error: 14px medium `#ff3b30`, 12px top padding.
- Submit: 20px below, 48px tall, fully rounded, `#0071e3` (hover `#0077ed`), 24px padding, 17px medium white; full width on phones, auto width with a 200px minimum from `sm`. Loading: 16px spinning ring (25% circle + 90% quarter arc, stroke 3) + "Sending…".
- Sent state: radius 20px, `#f5f5f7` (dark `#2c2c2e`), 24px/48px padding, centred column, 16px gap: 56px `#34c759`-at-15% disc with a 28px check (`M5 12.5l4.5 4.5L19 7.5`, `#34c759`, stroke 2.6, round caps/joins); "Message sent" 21px semibold; "We'll get back to you within 24 hours." 15px secondary; link-blue "Send another message ›" button.

## Motion

- Section is a variants container revealed once when 80px into view: `staggerChildren 0.06`, `delayChildren 0.05`. The glass testimonial card and the form card rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30). The photo itself does not animate.
- Form wrapper `layout` spring 260/32. Form ⇄ sent swap (`AnimatePresence mode="popLayout" initial={false}`): in from `opacity 0, y 12, blur(6px)`, out to `y −12, blur(6px)`, spring 320/32.
- Button label swap: in from `y 100%, blur(4px)`, out to `y −100%`, spring 420/34; press scales to 0.97.
- Error line: height/opacity from 0, spring 300/30.
- Sent mark: disc from `scale 0.6, opacity 0` (spring 420/18); check `pathLength 0 → 1`, 0.45s, delay 0.12s, easeOut.

## Interaction and states

- Statuses idle, loading, success, error. Submit prevents default, disables inputs and button, awaits `onSubmit(values)`. `{ error }` → error with that text; a throw → its message or "Couldn't send that. Please try again."; otherwise success and the fields clear.
- "Send another message ›" returns to idle.
- Without `onSubmit`, a simulated 900ms send always succeeds.

## Demo data

The copy above is the demo content (Northfield studio, Sana Noor quote). There is no autoplay.

## Accessibility

- The photo is a CSS background (decorative); the quote carries the meaning as text.
- Glass card text stays legible: 80% white behind ink text, plus the dark bottom shade.
- Form labels tied via `useId`; sent card `role="status"`; error `role="alert"`; the monogram is `aria-hidden`.
- Focus-visible: 2px `#0071e3` outline, 2px offset.
- Reduced motion: entrance is a 0.2s fade, swaps are 0.15s fades, no press scaling or check drawing.

## Acceptance checklist

- [ ] Photo left and form right in equal halves from `lg`, min 780px tall; photo on top below `lg` (420px, 500px from `sm`).
- [ ] The testimonial card is frosted glass, pinned 16px (32px from `sm`) from the photo's bottom edge, 520px wide from `lg`.
- [ ] A dark gradient rises from the photo's bottom behind the card.
- [ ] The form card is white, max 32rem, with a monogram + "Launch support" header.
- [ ] Fields are single column; Company is optional.
- [ ] The button is full width on phones and auto width (min 200px) from `sm`.
- [ ] Sending shows "Sending…" then a green check that draws itself.
- [ ] A returned `{ error }` shows red text under the fields and keeps the values.
- [ ] Cards rise in with a blur once on scroll.
- [ ] Dark mode: `#1c1c1e` section, black form card, `#1c1c1e`-at-80% glass.
