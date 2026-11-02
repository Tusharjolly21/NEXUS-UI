# Receipt Hero

Build an editorial hero section whose product demo is a receipt. A dark printer slot prints this week's numbers one line at a time (title, week, revenue, users, churn, top channel, a small trend line, a note, a barcode), the paper holds long enough to read, then tears away and falls, and the next week prints. The paper leans a few degrees toward the pointer, and a "Tear off" button does the tearing on demand. The page around it is quiet: a mono masthead, a big sans headline with one italic serif word, hairline rules, no gradients, no cards. The receipt paper stays warm white in both themes; the panel around it switches between warm paper and near-black.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 and framer-motion (`motion`, `AnimatePresence`, `useInView`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`). `cn` from `@/lib/utils`. No other libraries.
- File: `components/blocks/motion-kit/receipt-hero/receipt-hero.tsx`, named export `ReceiptHero`, types `ReceiptHeroProps`, `ReceiptHeroLink`, `ReceiptHeroStat`, plus an `index.ts` that re-exports them.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Ledgerline"` | Name in the masthead and, upper-cased, at the top of every receipt ("LEDGERLINE WEEKLY"). |
| `kicker` | `string` | `"Weekly numbers, printed live"` | Centre of the masthead. Hidden in containers narrower than 448px. |
| `headline` | `string` | `"Stop waiting for"` | First part of the headline, sans. Split on spaces; each word rises in on its own. |
| `emphasis` | `string` | `"Monday's"` | The one italic serif phrase inside the headline. |
| `headlineEnd` | `string` | `"numbers."` | Last part of the headline, sans. |
| `description` | `string` | two sentences about the product | Paragraph under the headline. |
| `primaryCta` | `{ label, href }` | `{ "Get this week's report", "#" }` | Pill button with an arrow. |
| `secondaryCta` | `{ label, href } \| null` | `{ "See a sample", "#" }` | Text link with a hairline underline. `null` hides it. |
| `stats` | `{ value, label }[]` | 48 integrations, 2 min to set up, 06:00 every Monday | Up to three figures under the buttons. `[]` hides the row. |
| `startWeek` | `number` | `42` | Week number of the first receipt. |
| `accent` | `string` | `#1d1d1f` | Button colour in light mode (white text sits on it). |
| `accentDark` | `string` | `#f5f5f7` | Button colour in dark mode (near-black text sits on it). |
| `autoplay` | `boolean` | `true` | Prints, holds, tears and prints the next week by itself until the first pointer, key or touch. Off under reduced motion; paused when under 30% in view. |
| `className` | `string` | none | Extra classes on the outer wrapper. |

Sample copy is invented. The receipt content is not a prop: it is built by a pure function of the week number.

## The report (deterministic)

`buildReport(week, brand)` returns 12 lines. Use only arithmetic on the week number: no `Math.random`, no `Date`, no `performance.now`, so server and browser print the same paper and the same week always prints the same numbers.

```
seed     = week * 7
wobble(n, s) = round(n * (1 + (((seed * s) % 17) - 8) / 100))
revenue  = wobble(48210, 3)            -> "$" + en-US thousands separators
users    = (wobble(124, 5) / 10) fixed 1 -> "12.4k"
churn    = (1.4 + (seed % 5) / 10) fixed 1 -> "1.6%"
channel  = ["Search","Email","Referral","Direct"][week % 4]
note     = 4 invented "Worth a look: ..." sentences, indexed by week % 4
trend    = [3,4,5,4,6,6,7,6,8,9,8,10][i] + ((seed * (i + 2)) % 3) - 1
```

Lines in order: title, meta (`WEEK 42` left, `MON 06:00` right), rule, Revenue (up), Active users (up), Churn (down), Top channel, trend line, rule, note, rule, barcode (38 bars, bar i is 3px wide when `(i * 7 + seed) % 3 === 0`, else 1px).

## Layout and look

- Structure: `<section class="@container w-full">` is only the container. Inside it a panel `relative overflow-hidden px-5 py-10` (`px-10 py-14` from `@2xl`), background `#f4f3ef`, dark `#0c0c0b`, ink `#1d1d1f` / `#f5f5f7`. Content is `max-width: 1120px`, centred. (Container-query variants cannot style the element that is the container, so the padding lives on the inner panel.)
- Masthead: a row with a bottom border `#1d1d1f` at 15% (dark: white 15%), 12px below, mono 11px uppercase, tracking 0.14em, colour `#6e6e73` (dark `#98989d`). Brand left in ink semibold, kicker centre, `Vol. {week}` right with tabular figures.
- Body grid: one column; from `@4xl` (896px) two columns `1.25fr 1fr` with a 40px gap. 48px gap and 48px top padding on one column (56px top from `@4xl`).
- Left column: headline then a stack (32px gap) of description, buttons, stats; on two columns the headline sits at the top and the stack at the bottom (`justify-between`, 40 to 48px gap).
- Headline: `font-size: clamp(42px, 7.6cqi, 104px)`, semibold, line height 0.94, tracking -0.05em, `text-wrap: balance`. Words are `inline-block` spans separated by real spaces (so it wraps and reads normally). The emphasis is serif, normal weight, italic, tracking -0.03em, with a 0.04em right pad so the italic is not clipped.
- Description: 17px (18px from `@2xl`), line height 1.5, max 440px, `#424245` (dark `#c7c7cc`).
- Primary button: height 48px, radius full, padding `0 8px 0 24px`, 15px medium, background the accent, a 32px round chip on the right (`white/15`, dark `black/10`) holding a 14px stroke arrow that nudges 2px right on hover. Secondary link: min height 44px, 15px medium, ink, with a 1px underline that retracts to the left on hover. Buttons wrap with a 24px column gap and 8px row gap.
- Stats: `dl`, three equal columns, 12px gap, max 480px, top border like the masthead, 16px padding. Value 20px semibold (tracking -0.02em) above a 12px `#6e6e73` (dark `#98989d`) label.
- Printer (right column, max 300px wide): a bar 44px tall, radius 14px, `#1d1d1f` (dark `#2c2c2e`), 1px ring `black/10` (dark `white/10`), shadow `0 18px 30px -16px rgba(0,0,0,.6)`, z above the paper. Left: a 6px dot `#30d158` and a mono 10px uppercase label "Printing" or "Ready" in `white/70`. Along the bottom, inset 16px, a 4px black slot.
- Paper window: starts 12px under the top of the printer (`-mt-3`, so paper emerges from under it), 352px tall, clipped top and bottom only (`clip-path: inset(0 -56px)`, not `overflow: hidden`, so the paper can lean sideways without being cut), 24px side padding. Paper: `#fffdf8`, ink `#1d1d1f`, padding `36px 20px 0` (36px so the header clears the slot at full lean), shadow `0 24px 40px -24px rgba(0,0,0,.4)`, a 24px top shade (`black/10` to transparent), lines separated by 12px, 16px bottom padding, and a zigzag tear edge: an 8px-tall SVG (`viewBox 0 0 252 8`, 21 teeth, `preserveAspectRatio="none"`) hanging 7px below the paper in the paper colour.
- Line styles (mono, `font-mono`): title 15px bold, tracking 0.18em, centred; meta 11px `#6e6e73`; rule 1px dashed `#1d1d1f` at 30%; row 13px with a dotted leader (`#1d1d1f` at 35%) between label and a semibold tabular value, then an 8px triangle (up `#248a3d`, down `#d70015`); trend line a 180x22 SVG polyline, 1.5px ink, round joins, centred; note 12px / 1.45; barcode 36px tall bars.
- "Tear off" button under the paper, right aligned: min height 44px, padding 0 16px, radius full, mono 12px uppercase tracking 0.1em, `#424245` (dark `#c7c7cc`), hover `black/5` (dark `white/10`), a 12px down arrow. Disabled (50% opacity) while tearing.

## The mechanic

State: `week`, `printed` (lines on the paper), `tearing`, plus `touched`. One timer at a time, chosen from the current state in a single effect (cleared on every change and on unmount, and the effect does nothing while the block is under 30% in view or under reduced motion):

1. Printing: first line after 700ms, then one line every 260ms. Each line wipes in left to right (`clipPath: inset(0 100% 0 0)` to `inset(0 0% 0 0)`, 220ms linear) while dropping 5px into place, so the paper seems to step out. The paper itself slides 36px out of the slot with a spring (160/20) when a new sheet appears.
2. Holding: once all 12 lines are shown, wait 4.2s (autoplay only).
3. Tearing: the paper (an `AnimatePresence` child keyed by week) jerks up 6px, then falls 620px, rotating to 16deg, fading out at the end (0.95s, `easeIn`).
4. After 1s the week increments, `printed` resets to 0 and a fresh sheet appears; printing starts again.

Pointer lean: the section tracks the pointer; `mx` goes from -1 to 1 across the section, mapped to -4..4deg through a spring (120/14), applied as `rotate` on the paper with `transform-origin: top`. Leaving centres it.

"Tear off" runs step 3 immediately (also mid-print, which tears the unfinished sheet) and then step 4. The first print on arrival happens only with `autoplay`; with `autoplay` false the first receipt is already printed.

## Autoplay demo

While `autoplay` is on, the block is at least 30% in view and nobody has touched it: print (about 4s), hold 4.2s, tear (1s), repeat with the next week. The first pointer move or press, key press or touch stops the cycle for good: a receipt already printing finishes printing and then holds still; "Tear off" still works and prints the next week once. Leaving the viewport pauses every timer; returning resumes where it stopped. Off under reduced motion.

## Accessibility

- The animated paper is `aria-hidden`; the same report is a plain list in a visually hidden `role="group"` labelled "<brand> weekly report, week N" (each row as "Revenue: $48,210, up"). A visually hidden polite live region says "Week N report printed." only after the person has interacted, never during the autoplay loop.
- Real `h1`, links, `dl` for the stats. "Tear off" is a button. Visible 2px focus rings (`#0071e3`, dark `#2997ff`, with an offset on the primary button).
- Text contrast is at least 4.5:1 on its background in both themes (`#6e6e73` on `#f4f3ef` is 4.6:1). Touch targets are at least 44px.
- Reduced motion (`useReducedMotion`): the headline does not animate in, the receipt is shown fully printed, there is no lean, no blinking light, no autoplay; "Tear off" swaps to the next week instantly.

## Acceptance checklist

- [ ] `<ReceiptHero />` renders with no props: masthead, headline, description, two actions, three stats and a printer with a receipt.
- [ ] On arrival the receipt prints line by line, holds, tears off and falls, and the next week prints with different numbers.
- [ ] Server markup and first client render match (no `Math.random`, no `Date` in render); the same week always shows the same numbers.
- [ ] The paper leans toward the pointer and recentres on leave.
- [ ] The first pointer, key or touch stops the cycle for good; "Tear off" still works.
- [ ] Not printing while less than 30% is in view.
- [ ] No horizontal scroll at 320px; a deliberate single column at 390 and 768; two columns at 1280.
- [ ] Light and dark both read well; the paper stays warm white on near-black.
- [ ] Reduced motion: static printed receipt, nothing loops.
- [ ] `npx eslint` is clean on the folder.
