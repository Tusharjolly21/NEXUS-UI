# Centered Intake Contact

Build a contact section on a white card: on the left a monogram and studio name, a short heading and a three-row list of who to contact for what; on the right a soft grey form card with a full-width "Start the conversation" button and a row of round social buttons. Sending shows a spinner, then the form morphs into a drawn green check. It should feel quiet and personal, like writing to a person, not a ticket system.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, variants, `whileInView`), `lucide-react` (`MessageCircle`) plus inline GitHub and LinkedIn SVG marks, and a `cn` helper.
- File: `components/blocks/contact-page.tsx`, named export `CenteredContactForm`. Export `ContactFormValues` (`{ name; email; company; message }`, strings) and `ContactSubmitHandler` (`(values) => Promise<void | { error?: string }>`), plus `ContactDetail`, `CENTERED_CONTACT_DETAILS`, `ContactFormCopy`, `DEFAULT_CONTACT_FORM_COPY` and `CenteredContactFormProps`. All copy below is the prop defaults; every string renders as plain text.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `brandName` | `string` | `"Northfield"` | Name beside the monogram (truncates); its first character, upper-cased, fills the monogram. |
| `title` | `string` | `"Say hello. A real person reads it."` | Large `h2`. |
| `details` | `ContactDetail[]` (`{ label; value }`) | `CENTERED_CONTACT_DETAILS` (exported; the three rows below) | Rows of the contact list. An empty array hides the list. |
| `showSocial` | `boolean` | `true` | Show the row of round social links under the form. |
| `formEyebrow` | `string` | `"Quick hello"` | Small grey label above the form title. |
| `formTitle` | `string` | `"What can we help with?"` | The form's `h3`. |
| `formDescription` | `string` | `"Questions, partnerships or a project you want to start. We route every note to the right person."` | Paragraph under the form title. |
| `buttonLabel` | `string` | `"Start the conversation"` | Submit button text. |
| `accent` | `string` (hex) | unset | Colours the submit button (hover `brightness(1.1)`), links, field focus (1px inset plus a 3px ring at a 25% mix, 30% in dark), the "Send another message" link and focus outlines through a `--contact-accent` variable set only when passed. Unset keeps the built-in blues: button and outlines `#0071e3` (hover `#0077ed`), links `#0066cc` / dark `#2997ff`, field focus `#0071e3` / dark `#2997ff`. |
| `formCopy` | `Partial<ContactFormCopy>` | `DEFAULT_CONTACT_FORM_COPY` | Overrides for the form's fixed strings: `nameLabel` "Name", `namePlaceholder` "Maya Srinivasan", `emailLabel` "Work email", `emailPlaceholder` "maya@northstar.dev", `companyLabel` "Company", `companyPlaceholder` "Northstar Labs", `optionalLabel` " (optional)" (empty hides it), `messageLabel` "Message", `messagePlaceholder` "Share the goal, deadline, and what a great outcome looks like.", `sendingLabel` "Sending…", `sentTitle` "Message sent", `sentMessage` "We'll get back to you within 24 hours.", `sendAnotherLabel` "Send another message ›", `errorFallback` "Couldn't send that. Please try again." |
| `onSubmit` | `ContactSubmitHandler` | simulated send (resolves after 900ms) | Receives the field values. Resolve to show the sent state; throw, or resolve `{ error }`, to show the message under the form. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

Colours: ink `#1d1d1f` / dark `#f5f5f7`; secondary `#6e6e73` / `#a1a1a6`; tertiary `#86868b` / `#98989d`; link `#0066cc` / `#2997ff`.

- Section: relative grid, content centred (`place-items: center`), `overflow: hidden`, radius 28px, white (dark black), min height 620px (760px from `md`), padding 16px with 40px top/bottom (24px sides from `sm`). Shadow ring `0 0 0 1px rgba(0,0,0,.06)` (dark `rgba(255,255,255,.08)`).
- Inner grid: full width up to `max-width: 72rem` (1152px), 40px gap. From `md`: two columns `0.75fr minmax(0, 1fr)`, rows stretched. Phones stack the intro above the form.
- Intro (vertical flex, centred vertically, left padding 24px from `md`, 48px from `lg`):
  - Brand row: flex, 12px gap. Monogram: 40px square, radius 12px, `#1d1d1f` with a white 17px semibold "N", tracking −0.02em (dark `#f5f5f7` with `#1d1d1f`). Name "Northfield", 15px semibold.
  - Heading (`h2`) 32px below: "Say hello. A real person reads it.", max width `sm` (24rem), 40px (48px from `sm`), semibold, line height 1.05, tracking −0.035em.
  - Definition list 40px below, max width `sm`, 15px. Three rows, each with a 1px top border `black/8%` (dark `white/10%`) and 16px vertical padding: term 13px tertiary, value 4px below in medium weight.
    - New projects — hello@northfield.design
    - Existing clients — Your Slack channel, or support@northfield.design
    - Office hours — Monday to Friday, 9:00 to 18:00 GMT
- Form card: full width up to `max-width: 32rem`, vertically centred, radius 28px, `#f5f5f7` (dark `#1c1c1e`), padding 20px (32px from `sm`).
  - Contains the dense form: eyebrow "Quick hello", title "What can we help with?", description "Questions, partnerships or a project you want to start. We route every note to the right person.", button "Start the conversation", stretched full width at every size.
  - Social row 28px below, separated by a 1px top border `black/8%` (dark `white/10%`) with 24px top padding: centred, 12px gap. Three 40px round links (GitHub, LinkedIn, Chat), `#e8e8ed` background, hover `#dcdce1` (dark `#2c2c2e`, hover `#3a3a3c`), ink 16px icons (stroke 1.75 for the outline icon).

### Shared contact form (dense)

- Wrapper: centred, max width `2xl`, `layout` animated.
- Eyebrow 15px semibold tertiary; title (`h3`) 6px below, 28px (32px from `lg`), semibold, line height 1.1, tracking −0.03em; description 12px below, max width `xl`, 15px, line height 1.5, secondary.
- Fields 24px below, 14px apart, single column: Name (placeholder "Maya Srinivasan", `autocomplete="name"`), Work email (`type="email"`, "maya@northstar.dev"), Company + tertiary " (optional)" ("Northstar Labs", `organization`), Message (textarea, "Share the goal, deadline, and what a great outcome looks like."). Labels 13px medium. All required except Company.
- Inputs: 44px tall (textarea min 96px, 12px vertical padding, no resize), 6px under the label, radius 12px, 14px horizontal padding, 16px text, white with `inset 0 0 0 1px rgba(0,0,0,.12)`, placeholder `#a1a1a6`. Focus: `inset 0 0 0 1px #0071e3, 0 0 0 3px rgba(0,113,227,.25)`. Dark: `#2c2c2e`, `inset 0 0 0 1px rgba(255,255,255,.1)`, placeholder `#8e8e93`, focus `inset 0 0 0 1px #2997ff, 0 0 0 3px rgba(41,151,255,.3)`. Disabled 60% opacity.
- Error line: 14px medium `#ff3b30`, 12px top padding.
- Submit: 20px below, 48px tall, full width, fully rounded, `#0071e3` (hover `#0077ed`), 17px medium white. Loading: a 16px spinning ring (25% circle + 90% quarter arc, stroke 3) and "Sending…".
- Sent state: radius 20px, `#f5f5f7` (dark `#2c2c2e`), 24px/48px padding, centred column with 16px gap: 56px disc in `#34c759` at 15% holding a 28px check (`M5 12.5l4.5 4.5L19 7.5`, `#34c759`, stroke 2.6, round caps/joins); "Message sent" 21px semibold; "We'll get back to you within 24 hours." 15px secondary; a link-blue "Send another message ›" button. (Inside the grey card the sent panel blends into it.)

## Motion

- Section is a variants container revealed once when 80px into view: `staggerChildren 0.06`, `delayChildren 0.05`. The brand row, heading, list and form card each rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30).
- Social buttons lift `y −2` on hover and press to `scale 0.94`, spring stiffness 420, damping 34.
- Form wrapper `layout` spring 260/32. Form ⇄ sent swap (`AnimatePresence mode="popLayout" initial={false}`): in from `opacity 0, y 12, blur(6px)`, out to `y −12, blur(6px)`, spring 320/32.
- Button label swap: in from `y 100%, blur(4px)`, out to `y −100%`, spring 420/34; press 0.97.
- Error line: height/opacity from 0, spring 300/30.
- Sent mark: disc from `scale 0.6, opacity 0` (spring 420/18); check `pathLength 0 → 1`, 0.45s, delay 0.12s, easeOut.

## Interaction and states

- Statuses idle, loading, success, error. Submit prevents default, disables fields and button, awaits `onSubmit(values)`. `{ error }` → error with that text; a throw → its message or "Couldn't send that. Please try again."; otherwise success and the fields clear.
- "Send another message ›" returns to idle.
- Without `onSubmit`, a simulated 900ms send always succeeds.
- Social links point at `#` as placeholders; replace with real URLs.

## Demo data

The copy above is the prop defaults. There is no autoplay.

## Accessibility

- Labels tied to fields via `useId`; sent card `role="status"`; error `role="alert"`.
- Social links are icon-only, so each has an `aria-label`: "GitHub", "LinkedIn", "Chat"; icons `aria-hidden`. The monogram is `aria-hidden` (the name follows as text).
- Office details use a real `dl` / `dt` / `dd`.
- Focus-visible: 2px `#0071e3` outline, 2px offset.
- Reduced motion: entrance is a 0.2s fade, no hover lift or press scale, swaps are 0.15s fades, no check drawing.

## Acceptance checklist

- [ ] White card with a hairline ring, at least 620px tall (760px from `md`), content vertically centred.
- [ ] Two columns from `md`; on phones the intro sits above the form.
- [ ] Three contact rows separated by hairlines, labels small and grey.
- [ ] The form card is grey, max 32rem wide, button full width.
- [ ] Three round social buttons under a hairline, each lifting slightly on hover.
- [ ] Company is optional; other fields are required.
- [ ] Sending shows "Sending…" then a green check that draws itself.
- [ ] A thrown error's message appears in red under the fields.
- [ ] Staggered blur-up reveal plays once on scroll.
- [ ] Dark mode: black card, `#1c1c1e` form card, `#2c2c2e` fields and social buttons.
