# Global Signal Contact

Build a two-column contact section in a large grey panel: on the left an envelope tile, an eyebrow, a big heading, a paragraph, contact links and a dotted-grey world map with a pulsing blue "We are here" pin over India; on the right a white card holding a project-request form that sends, shows a spinner, and morphs into a drawn green check. It should feel composed and Apple-like: quiet greys, one blue, soft springs.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`, variants, `whileInView`), `lucide-react` (`Mail`), a `cn` helper, and `topojson-client` (imported dynamically) for the map.
- File: `components/blocks/contact-page.tsx`, named export `GlobalSignalContact`. Export the types `ContactFormValues` (`{ name; email; company; message }`, all strings) and `ContactSubmitHandler` (`(values) => Promise<void | { error?: string }>`), the shared `ContactForm` component with its `ContactFormProps`, the `ContactFormCopy` type with `DEFAULT_CONTACT_FORM_COPY`, and the `ContactVariantProps` / `GlobalSignalContactProps` types. All copy below is the prop defaults; every string renders as plain text.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `eyebrow` | `string` | `"A studio across three time zones"` | Grey line above the heading. |
| `title` | `string` | `"Let's shape the next interface."` | Large `h2`. |
| `description` | `string` | `"Send a product brief, launch notes or a rough idea. A designer and an engineer read every message and reply with a concrete next step."` | Paragraph under the heading. |
| `email` | `string` | `"hello@northfield.design"` | First contact link (`mailto:`). Empty hides it. |
| `phone` | `string` | `"+44 20 7946 0321"` | Second contact link; the `tel:` href keeps only digits and `+`. Empty hides it. |
| `responseNote` | `string` | `"Replies within a working day"` | Plain secondary note after the links. Empty hides it. |
| `showMap` | `boolean` | `true` | Show the world map. When false the map is not rendered and its data is never fetched. |
| `mapLabel` | `string` | `"We are here"` | Text of the pill above the pin. |
| `formEyebrow` | `string` | `"Project request"` | Small grey label above the form title. |
| `formTitle` | `string` | `"Tell us what you want to build"` | The form's `h3`. |
| `formDescription` | `string` | `"A few details are enough. We will reply with a practical next step, not a sales maze."` | Paragraph under the form title. |
| `buttonLabel` | `string` | `"Send request"` | Submit button text. |
| `accent` | `string` (hex) | unset | Colours the submit button (hover `brightness(1.1)`), links, field focus (1px inset plus a 3px ring at a 25% mix, 30% in dark), the "Send another message" link and focus outlines, plus the map stem, pulse rings and pin through a `--contact-accent` variable set only when passed. Unset keeps the built-in blues: button and outlines `#0071e3` (hover `#0077ed`), links `#0066cc` / dark `#2997ff`, field focus `#0071e3` / dark `#2997ff`. |
| `formCopy` | `Partial<ContactFormCopy>` | `DEFAULT_CONTACT_FORM_COPY` | Overrides for the form's fixed strings: `nameLabel` "Name", `namePlaceholder` "Maya Srinivasan", `emailLabel` "Work email", `emailPlaceholder` "maya@northstar.dev", `companyLabel` "Company", `companyPlaceholder` "Northstar Labs", `optionalLabel` " (optional)" (empty hides it), `messageLabel` "Message", `messagePlaceholder` "Share the goal, deadline, and what a great outcome looks like.", `sendingLabel` "Sending…", `sentTitle` "Message sent", `sentMessage` "We'll get back to you within 24 hours.", `sendAnotherLabel` "Send another message ›", `errorFallback` "Couldn't send that. Please try again." |
| `onSubmit` | `ContactSubmitHandler` | simulated send (resolves after 900ms) | Receives the field values. Resolve to show the sent state; throw, or resolve `{ error }`, to show the message under the form. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

Colours: ink `#1d1d1f` / dark `#f5f5f7`; secondary `#6e6e73` / `#a1a1a6`; tertiary `#86868b` / `#98989d`; link `#0066cc` / `#2997ff`.

- Section: grid, 32px gap, `overflow: hidden`, radius 28px, background `#f5f5f7` (dark `#1c1c1e`), ink text. Padding 16px, 24px from `sm`, 40px from `lg`. From `lg`: two columns `0.95fr 1.1fr`, min height 760px. Below `lg` the form stacks under the intro.
- Left column: vertical flex, `justify-between`, 4px side padding (8px from `sm`), 8px top; from `lg` min height 620px.
  - Envelope tile: 48px square, radius 14px, white with `0 0 0 1px rgba(0,0,0,.05)` (dark `#2c2c2e`, no ring), a 20px `Mail` icon (stroke 1.75) in `#0071e3` (dark `#2997ff`).
  - Eyebrow 32px below (40px from `sm`): "A studio across three time zones", 17px semibold tertiary.
  - Heading (`h2`) 8px below: "Let's shape the next interface.", max width `xl`, 40px / 52px from `sm` / 60px from `lg`, semibold, line height 1.05, tracking −0.035em.
  - Paragraph 20px below, max width `xl`, 17px (19px from `sm`), line height 1.5, secondary: "Send a product brief, launch notes or a rough idea. A designer and an engineer read every message and reply with a concrete next step."
  - Contact list 28px below, 15px: a column with 10px gap; from `sm` a wrapping row with 24px column gap. Items: link `hello@northfield.design` (`mailto:`), link `+44 20 7946 0321` (`tel:+442079460321`), both link-blue with underline on hover; then plain secondary text "Replies within a working day".
  - World map at the bottom: 40px top margin (48px from `sm`), 288px tall (416px from `sm`), full width, relative.
- Form card (right): radius 24px, white (dark `#2c2c2e` at 60%), padding 20px / 32px `sm` / 40px `lg`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -24px rgba(0,0,0,.25)` (dark `0 0 0 1px rgba(255,255,255,.08)`). Holds the dense form with the `form*` props: eyebrow "Project request", title "Tell us what you want to build", description "A few details are enough. We will reply with a practical next step, not a sales maze.", button "Send request".

### World map

- A canvas filling the box. Fetch the 110m land TopoJSON from the `world-atlas@2` package (`land-110m.json`), convert `objects.land` with `topojson.feature`, and collect every Polygon and each MultiPolygon's polygons. Cache the result module-wide (one fetch for all instances); on failure draw nothing.
- Size the canvas to its wrapper times `min(devicePixelRatio, 2)`. Equirectangular projection: `mapWidth = width × 1.04`, `mapHeight = height × 0.76`, `offsetX = (width − mapWidth) / 2`, `offsetY = height × 0.16`; `x = offsetX + (lon + 180) / 360 × mapWidth`, `y = offsetY + (90 − lat) / 180 × mapHeight`. Start a new subpath when consecutive points jump more than 45% of `mapWidth` (antimeridian). Fill each polygon with the `evenodd` rule.
- Fill colour comes from a CSS variable on the wrapper: `rgba(0,0,0,.13)` light, `rgba(255,255,255,.16)` dark. Redraw on resize (`ResizeObserver`) and when the `class` attribute on `<html>` changes (theme switch).
- A gradient over the bottom third fades from the panel colour (`#f5f5f7` / `#1c1c1e`) to transparent.
- On top, an SVG with `viewBox="0 0 760 280"` filling the box. Marker at (552, 126). A label (`mapLabel`) in a `foreignObject` 232 units wide, 40px tall, centred on the marker x at y 34, its content a centred flex row: a white single-line pill that truncates past that width (dark `#2c2c2e`), 12px/6px padding, 13px semibold ink, shadow `0 0 0 1px rgba(0,0,0,.06), 0 6px 16px -6px rgba(0,0,0,.2)` (dark `0 0 0 1px rgba(255,255,255,.1)`). A 1.5px `#0071e3` (or `accent`) stem with round caps runs from y 70 to the marker. The pin is a white circle r 6 with a `#0071e3` (or `accent`) circle r 4 inside; the pulse rings use the same colour.

### Shared contact form (dense)

- Wrapper: centred, max width `2xl`, `layout` animated.
- Eyebrow 15px semibold tertiary; title (`h3`) 6px below, 28px (32px from `lg`), semibold, line height 1.1, tracking −0.03em; description 12px below, max width `xl`, 15px, line height 1.5, secondary.
- Fields 24px below with 14px vertical spacing, all single column: Name (placeholder "Maya Srinivasan", `autocomplete="name"`), Work email (`type="email"`, "maya@northstar.dev"), Company with a tertiary " (optional)" suffix ("Northstar Labs", `organization`), then Message (textarea, placeholder "Share the goal, deadline, and what a great outcome looks like."). Labels 13px medium. All required except Company.
- Inputs: 44px tall (textarea min 96px, 12px vertical padding, no resize), 6px below the label, radius 12px, 14px horizontal padding, 16px text, white with `inset 0 0 0 1px rgba(0,0,0,.12)`, placeholder `#a1a1a6`. Focus: `inset 0 0 0 1px #0071e3, 0 0 0 3px rgba(0,113,227,.25)`. Dark: `#2c2c2e`, `inset 0 0 0 1px rgba(255,255,255,.1)`, placeholder `#8e8e93`, focus `inset 0 0 0 1px #2997ff, 0 0 0 3px rgba(41,151,255,.3)`. Disabled 60% opacity.
- Error line: 14px medium `#ff3b30`, 12px top padding.
- Submit: 20px below, 48px tall, fully rounded, `#0071e3` (hover `#0077ed`), 24px padding, 17px medium white; full width on phones, auto with min width 200px from `sm`. Loading shows a 16px spinning ring (25% opacity circle plus a 90% opacity quarter arc, stroke 3) and "Sending…".
- Sent state: radius 20px, `#f5f5f7` (dark `#2c2c2e`), 24px/48px padding, centred column with 16px gap: a 56px disc in `#34c759` at 15% holding a 28px check (`M5 12.5l4.5 4.5L19 7.5`, stroke `#34c759` 2.6, round caps/joins); "Message sent" 21px semibold; "We'll get back to you within 24 hours." 15px secondary; a link-blue "Send another message ›" button.

## Motion

- Section is a variants container revealed once when 80px into view: `staggerChildren 0.06`, `delayChildren 0.05`. The tile, eyebrow, heading, paragraph, links, map and form card each rise from `opacity 0, y 16, blur(6px)` on a spring (stiffness 260, damping 30).
- Map stem draws `pathLength 0 → 1` once in view, spring stiffness 120, damping 24, delay 0.3s.
- Two pulse rings (r 6, `#0071e3`) loop from `scale 1, opacity 0.28` to `scale 6, opacity 0`, 2.2s, infinite, ease `[0.22, 1, 0.36, 1]`, delays 0 and 1.1s, transform origin at the marker.
- Form wrapper: `layout` spring stiffness 260, damping 32. Form ⇄ sent swap in `AnimatePresence mode="popLayout" initial={false}`: in from `opacity 0, y 12, blur(6px)`, out to `y −12, blur(6px)`, spring 320/32.
- Button label swap: in from `y 100%, blur(4px)`, out to `y −100%`, spring stiffness 420, damping 34. Press scales to 0.97.
- Error line: height and opacity from 0, spring 300/30.
- Sent mark: disc springs from `scale 0.6, opacity 0` (stiffness 420, damping 18); check draws `pathLength 0 → 1` over 0.45s, delay 0.12s, easeOut.

## Interaction and states

- Statuses: idle, loading, success, error. Submit prevents default, sets loading (fields and button disabled), awaits `onSubmit(values)`. A returned `{ error }` → error with that text. A throw → error with its message, or "Couldn't send that. Please try again." Otherwise success and the fields clear.
- "Send another message ›" returns to idle with empty fields.
- Without `onSubmit`, a simulated 900ms send always succeeds.

## Demo data

Everything above is the prop defaults; there is no autoplay.

## Accessibility

- Each label is tied to its field via `useId`; the sent card is `role="status"`; the error is `role="alert"`.
- Map SVG: `role="img"`, `aria-label="World map marker pointing to India"`; the canvas is decorative. Icons are `aria-hidden`.
- Focus-visible: 2px `#0071e3` outline, 2px offset, on links and buttons.
- Reduced motion: entrance is a 0.2s fade, no pulse rings, no stem drawing, swaps are 0.15s fades, no press scaling or check drawing.

## Acceptance checklist

- [ ] Two columns from `lg` (min 760px tall), stacked below.
- [ ] Land masses render as a soft grey fill that fades into the panel at the bottom.
- [ ] A "We are here" pill sits above India with a drawn stem and two breathing rings.
- [ ] The map redraws correctly after resizing and after toggling dark mode.
- [ ] Email and phone are working `mailto:` / `tel:` links.
- [ ] Submitting empty shows native required-field validation; Company is optional.
- [ ] Sending shows "Sending…" with a spinner for ~0.9s, then a green check that draws itself.
- [ ] An `onSubmit` returning `{ error: "Nope" }` shows "Nope" in red under the form.
- [ ] Content reveals with a staggered blur-up once.
- [ ] Dark mode uses `#1c1c1e` panel, translucent `#2c2c2e` form card and `#2997ff` links.
