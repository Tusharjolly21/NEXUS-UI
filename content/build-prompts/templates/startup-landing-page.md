# Build prompt: Aureon, an AI portfolio co-pilot for DIY investors

Build a single-page marketing site for **Aureon**, a startup that links an investor's brokerage, 401(k) and stock-plan accounts read-only, looks inside every fund, shows where the risk really sits, and drafts trades that the owner approves one by one. The feel is Apple-light and calm: a white page, grey bands, white cards, one olive-green accent, big tight headlines and spring motion. The signature moment is the **risk band** in the hero: a full-width stacked bar of the sample household's portfolio that re-splits live as you drag a risk dial.

## Stack

- Next.js (App Router), React 19, TypeScript strict. One client component (`"use client"`).
- Tailwind CSS 4 with hard-coded colours only. Never use theme tokens such as `bg-background` or `text-foreground`.
- Framer Motion 12 for all motion. No other libraries, no remote images, no web fonts: use the system font stack.
- Root: `<MotionConfig reducedMotion="user">`, then a div with `bg-white text-[#1d1d1f]`, `overflow-x-clip` and `style={{ colorScheme: "light" }}`.

## Page structure and copy

1. **Sticky glass nav** that condenses on scroll. Logo: three outlined rings in a row, the middle one olive and bobbing gently, plus "Aureon". Links X-ray, How it works, Planner, Pricing, FAQ. Olive "Get started" button.
2. **Hero, centred text over a wide console.** Pill: an olive "For DIY investors" chip, then "Read-only links. You approve every trade." Headline "Know exactly what you own." with "own." in olive. Sub: "Aureon links your brokerage, 401(k) and stock-plan accounts, looks inside every fund, and shows the risk hiding in plain sight. Then it drafts the trades to fix it, and waits for your yes." Buttons "Get your free X-ray" (olive) and "How it works" (white). Below, the **risk band card**: header "Sample household · 4 accounts · $412,880" and a live dot "Read-only · synced 2 min ago". Inside: a Today / Aureon plan segmented control, a 96-132px tall stacked bar (US stocks, International, Employer stock in rust, Bonds, Cash) with each segment's label and percentage, a legend, then the dial: a pill track with ten ticks, "Steadier" and "More growth" at the ends and a white numbered knob. Under it three tiles: "Largest single company" (31% today, 10% in the plan), "A bad year could cost" (dollar figure) and "Drafted moves, waiting for you" (the three biggest buys or sells). Caption: "Sample data. Drafts are suggestions for a made-up household, not advice for yours."
3. **Stats row**, four counters: 9 min median to first X-ray, $1,120 median yearly fund fees found, 34% of households over 20% in one company, 0 trades placed without approval. Caption naming the 6,214 beta households.
4. **The X-ray** (grey band): "Your accounts, finally in one picture." Three checked facts (Look-through, Stock plans, Fees). Right: a card with a **bubble cluster** of holdings sized by weight, a segmented control for All accounts, Brokerage and 401(k), and a one-line note per account ("One company is 31% of everything you own.").
5. **How it works** (pinned scroll story): "From login to a plan in one sitting."
   - 01 Connect, "Link accounts, read-only.": four sync rows, each with a dot-matrix loader.
   - 02 Review, "Swipe through what Aureon drafts.": a deck of drafted trades (Sell $86,700 employer stock, Buy $47,600 international fund, Sell $11,250 tech fund, Buy $18,400 Treasury fund), each with the reason and the tax cost. Drag right to approve, left to skip.
   - 03 Approve, "Hold to send. Then it's done.": an order summary and a hold-to-send button.
   - 04 Tax time, "Your tax pack, already sorted.": a folder "Tax pack 2026" that opens on hover.
6. **Planner** (grey band): "Ask “what if” with your real numbers." Three scrub fields (Monthly, Retire, Return), a readout "At 62 you'd have about $2,130,000" with a monthly income line, and an area chart from age 38 to 80 that redraws as you scrub.
7. **Ground rules**: "Built so it can't do the scary part." Four cards: Read-only links, Nothing trades without you, One flat price, Your data isn't for sale.
8. **Pricing** (grey band): "A flat price. Not a slice of your savings." Left: radio cards Free $0, Plus $12/mo, Household $24/mo. Right: "The fee math, per year": bars for a 1% adviser ($4,129), Household ($288) and Plus ($144), with an honest footnote.
9. **FAQ**: broker or not, moving money, supported accounts, is it advice, how Aureon makes money.
10. **CTA band** (dark): "Get your X-ray in about nine minutes."
11. **Footer** saying that the company, people and numbers are invented and nothing is investment advice.

## Look

- Page `#ffffff`, bands `#f5f5f7`, inner tiles `#f7f7f4`. Cards white, radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.
- Text `#1d1d1f`, secondary `#6e6e73`, captions `#424245`. Accent olive `#4d7c0f` (5:1 on white) for text, buttons and the main bar segment. Supporting greens `#8fae4f` and `#d3dcc2`. Rust `#c2410c` only for the concentration risk (employer stock) and `#9a3412` for sell amounts.
- Hero headline `clamp(44px, 7.6vw, 96px)`, weight 600, tracking -0.055em, leading 0.98. Section heads `clamp(34px, 5.4vw, 60px)`. Body 17-21px. Captions 12-13px. All numbers `tabular-nums`.

## Motion

- Every move is a spring. Segment widths: spring stiffness 170, damping 24. Plan toggle: stiffness 120, damping 20. Knob snap: stiffness 420, damping 32. Chart redraw: stiffness 120, damping 20.
- **Hero signature:** the knob is a draggable element constrained to the track. Its x position is a motion value; risk level, target mix and each segment's flex-grow are derived with `useTransform` and `useSpring`, so dragging never re-renders React. Only the integer level goes into state, which drives the rolling numbers and the drafted-moves list. On release the knob snaps to the nearest level. Clicking the track jumps there; arrow keys, Home and End work (`role="slider"`). The band opens on "Today" and switches to the plan by itself 1.6 s after load. A pulsing ring on the knob invites a drag until it is touched.
- Dollar amounts and percentages roll digit by digit. Wrap them in `leading-none` so the digit columns don't show their neighbours.
- Reveals: at most 0.6 s and 20px of travel, `once: true`, small `amount`, no layout shift. Pinned story visuals swap with a blur and spring.

## Motion Kit components used

- **Bubble Cluster**, copied as a Holdings Cluster: holdings sized by weight, groups are accounts.
- **Swipe Stack**, copied as a Draft Stack: the drafted trades to approve or skip.
- **Hold to Confirm**, copied as Hold to Send with a send icon: sends the approved orders.
- **Folder Peek**: the year-end tax pack.
- **Matrix Loaders**: account sync status rows.
- **Scrub Inputs** (the `ScrubField` export): the planner assumptions.
- **Radio Cards**: the plan picker.
- **Price Odometer's** `RollingNumber`: every live dollar figure.

## Responsive and accessibility

- At 390px everything stacks, the bar stays full width and drops its inside labels (the legend still shows percentages), the dial is fully usable by touch, and nothing scrolls sideways.
- Use real buttons and links with visible olive focus rings, aria labels on icon buttons, `aria-live` on changing captions, and an `aria-label` on the bar listing the current mix. Keep text at 4.5:1 or better.
- Avoid hydration mismatches: no `Math.random()` or `Date.now()` during render, and any media-query check must start from the server value (`useSyncExternalStore` with a server snapshot).

## Checklist

- [ ] Dragging the dial re-splits the bar smoothly and the drafted moves update.
- [ ] Draft amounts in the story match the hero plan.
- [ ] At least six Motion Kit components, each doing a real job.
- [ ] No theme tokens; looks identical in the site's dark mode.
- [ ] Zero console errors, no horizontal scroll at 390px, reduced motion respected.
- [ ] Copy is honest: invented names and figures, no real customers or logos.
