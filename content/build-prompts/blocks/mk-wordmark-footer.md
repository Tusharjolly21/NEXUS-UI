# Wordmark Footer

Build a site footer whose giant wordmark sits half sunk into the bottom edge of the page. Move the pointer across it and the letters rise like piano keys, the nearest letter highest, each on its own slightly different spring so a pass of the pointer ripples through the word and settles letter by letter. A finger dragged along it on touch does the same, and with the keyboard you can focus it, step across the keys with the arrow keys or type a letter to raise it. Above the wordmark sit a newsletter field, link columns, a live status pill, a local clock and a back-to-top button. It is distinct from a ghost-wordmark footer: here the word is solid ink, cut off by the edge, and the motion is a keyboard of springs rather than a wave of opacity.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 and framer-motion (`motion`, `AnimatePresence`, `animate`, `motionValue`, `useInView`, `useReducedMotion`, `useSpring`, `useTransform`). `cn` from `@/lib/utils`. No other libraries.
- File: `components/blocks/motion-kit/wordmark-footer/wordmark-footer.tsx`, named export `WordmarkFooter`, types `WordmarkFooterProps`, `WordmarkFooterColumn`, `WordmarkFooterLink`, plus an `index.ts` re-exporting them.
- Icons: Framework7 Icons (MIT) via Iconify, two inline path strings (arrow-up, checkmark-alt) in a 56x56 box, with a comment crediting them.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Cadenza"` | The wordmark. One short word (4 to 9 letters); each character is a key. Also used in the copyright line. |
| `newsletterTitle` | `string` | `"Small notes, once a month."` | Heading above the field. |
| `newsletterText` | `string` | `"What we shipped and what we learned. Nothing else."` | Line under the heading. |
| `onSubscribe` | `(email: string) => Promise<void> \| void` | none | Called on a valid submit. A promise shows "Sending"; a throw shows an error. Without it the form simulates success. |
| `columns` | `{ title, links: { label, href }[] }[]` | Product, Company, Resources with four links each | Link columns. |
| `city` | `string` | `"Lisbon"` | Shown next to the clock. |
| `timeZone` | `string` | `"Europe/Lisbon"` | IANA zone for the clock and the year. An unknown zone falls back to the visitor's own. |
| `status` | `string \| null` | `"All systems normal"` | Text in the status pill. `null` hides it. |
| `statusHref` | `string` | `"#"` | Where the pill links. |
| `year` | `number` | read after mount | Year in the copyright line. Without it the line shows the brand alone until the clock is read. |
| `accent` | `string` | `#0071e3` | Colour a key takes as it rises (light mode). Also the tick in the success state. |
| `accentDark` | `string` | `#2997ff` | Same in dark mode. |
| `autoplay` | `boolean` | `true` | Plays a scale across the keys until the first pointer, key or touch. Off under reduced motion; paused when under 30% in view. |
| `className` | `string` | none | Extra classes on the outer `footer`. |

Colours pass through CSS variables on the root (`--wf-a`, `--wf-ad`) so they switch with the theme.

## Layout and look

- Root: `<footer class="@container w-full">` is only the container (container-query variants cannot style the container itself). Inside, a panel with `overflow: hidden`, background `#f5f5f7` (dark `#000`), ink `#1d1d1f` (dark `#f5f5f7`), padding `56px 20px 0` (`64px 40px 0` from `@2xl`). No bottom padding: the wordmark touches the bottom edge.
- Content is `max-width: 1100px`, centred. Top grid: one column with 48px gap; from `@3xl` (768px) two columns `1.3fr 2fr`.
- Newsletter block, max 340px: title 22px semibold, line height 1.25, tracking -0.02em; text 14px / 1.5 `#6e6e73` (dark `#98989d`), 8px below. Form 20px below: a pill 52px tall, white (dark `#1c1c1e`), 1px ring `black/8` (dark `white/10`), padding `4px 4px 4px 20px`; focus-within turns the ring 2px `#0071e3` (dark `#2997ff`). Input 15px, transparent, placeholder `#6e6e73` (dark `#98989d`). Submit button 44px tall, radius full, padding 0 20px, 14px medium, `#1d1d1f` with white text (dark `#f5f5f7` with `#1d1d1f` text). Under the form a 20px-tall message line (13px, `#c4001a`, dark `#ff6961`, 20px left padding) for errors, so nothing jumps.
- Link columns: 2 columns, 3 from `@md` (448px), 32px gaps. Column title 13px semibold; links 14px `#6e6e73` (dark `#98989d`), vertical padding 6px (44px minimum height on coarse pointers), hover or focus turns ink and draws a 1px underline from the left (300ms).
- Bottom bar: 48px below, a flex row that wraps, 24px column and 12px row gaps, top border `black/8` (dark `white/12`), 20px padding, 13px `#6e6e73` (dark `#98989d`). Left: status pill (min height 44px, padding 0 16px, white or `#1c1c1e`, 1px ring, 10px gap, a 8px `#30d158` dot with a soft ping ring that only runs when motion is allowed) and `City · hh:mm:ss` (tabular figures). Right: `© year brand` and a 44px round back-to-top button (white or `#1c1c1e`, ring, 15px arrow).
- Wordmark stage: centred, `max-width: 1180px`, 24px below the bar, 40px of top padding (so the keys react as the pointer approaches from above), `touch-action: pan-y`, no text selection. Inside it, a clip box whose height is `0.92em` of its own font size and `overflow: hidden`, with a mask that fades the lower part (`linear-gradient(180deg, #000 0, #000 58%, rgba(0,0,0,.3) 100%)`).
- Wordmark type: font size `clamp(64px, K cqi, 340px)` with `K = min(40, 88 / (0.56 * letters))` so the word fills about 88% of the width, which keeps a round-lettered word such as Cadenza inside the content box at every size (22.4cqi for seven letters); semibold, line height 0.8, tracking -0.06em, ink colour. The word sits at the bottom of the clip box, centred; every letter is an `inline-block` with `transform-origin: bottom`.

## The keys

- Each letter's resting `translateY` is 46% of its own height (so about half of it is below the edge); fully risen it is -4%. It also stretches `scaleY` by up to 3.5% from the bottom.
- A second copy of the letter in the accent colour sits exactly over it (`aria-hidden`), its opacity equal to the rise, so a lifted key warms toward the accent.
- Targets: one `motionValue` per letter holding a rise from 0 to 1. For a "finger" at x pixels from the left of the word, `rise_i = exp(-((x - centre_i) / sigma)^2)` with `centre_i` the letter's `offsetLeft + offsetWidth / 2` and `sigma = 0.95 * wordWidth / letters`. The nearest key goes to about 1, its neighbours to about 0.3. x is converted for scaled preview frames by dividing the pointer offset by `getBoundingClientRect().width / offsetWidth`.
- Springs: each letter follows its target through its own `useSpring`, with stiffness `220 + ((i * 53) % 7) * 20`, damping `12 + (i % 3) * 2`, mass 0.8. Low damping lets keys overshoot and bounce; the different values stagger the settling so the word ripples rather than moving as one block.

## Interaction and states

- Pointer: move or press over the stage sets the finger; leaving or lifting a touch lets go (all keys spring back down). Touch drag along the word plays it while vertical drags still scroll the page.
- Keyboard: the stage is a focusable `role="group"` with a label explaining the keys, and a 2px focus ring. ArrowRight and ArrowLeft move the raised key one letter at a time (the first press raises the first letter), Home and End jump to the ends, typing a letter in the word raises its next occurrence, Escape or blur lets go. The key stays raised until the next key or release.
- Newsletter: submitting an invalid address shows "Enter a valid email address." (field `aria-invalid`, message in a `role="status"` line referenced by `aria-describedby`); a valid one shows "Sending" while a returned promise is pending, then the field swaps to a tick and "You are on the list." (a `role="status"` paragraph). A throw shows "Something went wrong. Try again in a moment." Typing clears the error.
- Clock: never read during render. State starts `null` and the text is the fixed placeholder `--:--:--`; an effect reads `Date.now()` in a timeout and then every second, formatted with `Intl.DateTimeFormat("en-GB", { timeZone, hourCycle: "h23", 2-digit hour, minute, second })`. The year comes from the same clock unless `year` is given. The interval runs only while the footer is in view.
- Back to top scrolls the nearest scrollable ancestor (or the window) to the top, smoothly unless reduced motion is on.
- Hover on the back-to-top button lifts it 2px; press scales it to 0.92.

## Autoplay demo

While `autoplay` is on, the footer is at least 30% in view and nobody has touched it, an invisible finger glides across the word from left to right in 2.8s (ease in-out, starting and ending one letter-width outside the word), the keys all spring back, there is a 1.4s rest, and it glides back from right to left, and so on. The first pointer move, press, key or touch stops it for good and the keys let go. Leaving the viewport stops it too. Off under reduced motion.

## Accessibility

- The wordmark letters are `aria-hidden` (the brand is already in the copyright line); the stage is a labelled group explaining the arrow keys and typing.
- Link columns are in `nav aria-label="Footer"`. Focus rings everywhere (2px `#0071e3`, dark `#2997ff`). All controls are at least 44px tall; text contrast is at least 4.5:1 in both themes.
- The clock is plain text and is not a live region (so the seconds are not read out).
- Reduced motion (`useReducedMotion`): the keys never move (pointer, touch and keys do nothing visible), the stage is not focusable (read through `useSyncExternalStore` with a `false` server snapshot, so the markup matches the server), no autoplay, no ping ring, the success tick swaps without motion, back to top jumps.

## Acceptance checklist

- [ ] `<WordmarkFooter />` renders with no props: newsletter, three link columns, status pill, `Lisbon · --:--:--` that becomes a live clock after mount, copyright, and a big wordmark cut off by the bottom edge.
- [ ] No hydration warnings: no `new Date()` or `Date.now()` during render.
- [ ] Moving across the word raises letters like keys, nearest highest, with a springy overshoot and a slightly different settle per letter.
- [ ] Dragging a finger along it raises letters on touch without blocking vertical scroll.
- [ ] Focus the word: arrows, Home, End and typed letters raise keys; Escape and blur let go.
- [ ] Autoplay plays a scale until the first interaction, then stops for good; nothing runs off screen.
- [ ] Invalid email shows an error; valid email shows the tick.
- [ ] No horizontal scroll at 320px; wordmark fits at 320, 390, 768 and 1280.
- [ ] Light and dark both read well.
- [ ] Reduced motion: the keys stay still.
- [ ] `npx eslint` is clean on the folder.
