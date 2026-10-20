# Build prompt: Tally — personal finance app landing page

Build a single-page marketing site for **Tally**, a money app: send money to friends with a flick, review a week of spending in a minute, and save in the background. The feel is Apple-light and friendly, like the rest of a phone: a near-white page, white cards, black primary buttons and one fresh green. The hero shows the product itself, a live phone with a real-feeling home screen and a metal card that tilts under your pointer.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so the page looks identical inside a dark-mode host.
- Framer Motion 12 for all motion. No other animation or UI libraries, no remote images, no web fonts.
- `"use client"` at the top of interactive files. Wrap the page root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky pill nav.** Logo: two overlapping circles (green and blue, multiply blend) that drift together and apart, plus "Tally". Links Send, Spend, Save, Security, Plans; a black "Get the app" button. Burger menu on mobile.
2. **Hero, two columns.** Left: a rating pill with five stars that pop in one by one, "4.9 from 120,000 reviews". Headline "Money that **moves** like you do." (accent on "moves"), word by word. Sub: "Split a dinner with a flick, sort a week of spending in a minute, and save without thinking about it. Tally is the money app that feels like the rest of your phone." Buttons: black "Get Tally free" and white "See how it works". Caption: "No monthly fee on the Free plan. Takes about three minutes to open." Right: a phone frame with the app home: "Good morning, Sam", a total balance counting up to $4,218.60, "+ $318.60 this week", a seven-bar weekly chart that springs up, Send / Request / Top up buttons and five transactions. Behind it, a **Tilt Card** ("Tally Black", "•••• 4021") that parallaxes upward and straightens as you scroll, while the phone drifts down. A floating toast "Maya paid you · $32.50 · Dinner" bobs gently.
3. **Press marquee** of invented publication names on a white band.
4. **Send.** "Pay a friend with a flick." / "Drag the amount out of your avatar and drop it on theirs. It lands instantly, even if they bank somewhere else." The **Money Goo** demo (You → Maya, $32) sits in a card with scroll parallax; three stats: 0s to arrive, $0 in fees, 40+ currencies.
5. **Spend** on `#f5f5f7`. "A week of spending, sorted in a minute." Two cards: "Review, don't reconcile." with a **Swipe Stack** (swipe right to approve, left to flag) and "Receipts that unfold." with a **Receipt Unfold** ($58.24: groceries, household, bag, tax).
6. **Big transfer.** A white rounded panel with a green glow at the bottom: "Big transfers need a real yes." with a **Hold to Confirm** button "Hold to send $2,400" → "Keep holding…" → "Sent to Jordan".
7. **Save.** "Saving that runs in the background." Three tiles: "Weekly auto-save" with a **Ruler Picker** ($0-200, presets 10/25/50/100), a goal ring "Japan, next spring" filling to 68% of $3,000, and a **Streak Counter**.
8. **Security**, black section. "Locked down, never locked out." A light card "Two-step sign in." with an **OTP Input** auto-typing a code; a dark card "Card controls." with three rows (Freeze card, Online payments abroad, Instant alerts) using the **Switch** from Animated Tabs, each status line swapping with a small vertical slide; a wide card "Passwords, graded live." with **Password Strength**.
9. **Plans.** "Start free. Upgrade when it pays for itself." A Monthly / "Yearly · save 20%" segmented control with a sliding white thumb. Three plans (Free $0, Plus $4.99 or $3.99, Family $9.99 or $7.99); prices roll digit by digit when the period changes. Plus has a green-to-blue gradient border and a "Most popular" badge; cards lift 6px on hover.
10. **FAQ**: is my money protected, how fast do transfers arrive, can I cancel Plus, do you sell my data.
11. **CTA band**: "Open an account before your coffee cools." / "Three minutes, one photo of your ID, and you're in."
12. **Footer** noting that Tally is a template, not a real bank.

## Look

- Page `#fbfbfd`, grey sections `#f5f5f7`, dark sections `#000` and `#1c1c1e`. Ink `#1d1d1f`, secondary `#6e6e73`, captions `#86868b`.
- Green `#30d158` for fills and graphics, darker green `#1a7f42` for green text on white (about 5:1). Blue `#0a84ff` as a supporting graphic colour only.
- System font stack, antialiased. Hero headline `clamp(48px, 7.6vw, 92px)`, weight 600, line-height 0.98, tracking -0.055em. Prices 48px with -0.045em tracking and `tabular-nums`.
- Cards radius 28px, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`. Plan cards radius 30px.

## Motion

- Reveals: fade and rise once at 25% in view with the ease `[0.16, 1, 0.3, 1]`; staggered lists use springs (stiffness 160, damping 22).
- Hero parallax: `useScroll` page offset mapped to the card (0 → -120px, rotate 12deg → 4deg) and the phone (0 → 40px), smoothed by `useSpring` (stiffness 100, damping 20).
- Chart bars spring up from scaleY 0 (stiffness 180, damping 16) with a 60ms stagger; transactions slide in with springs (stiffness 260, damping 24).
- Price digits: each character enters from above and exits below with a spring (stiffness 400, damping 30), staggered 30ms.
- Billing thumb and toggles use `layoutId` springs (stiffness 500, damping 34).
- The signature interaction: drag money from one avatar to the other and watch it stretch like goo and land.

## Motion Kit components and their jobs

- Tilt Card: the metal debit card in the hero.
- Money Goo: drag-to-pay between two people.
- Swipe Stack: approve or flag unusual transactions.
- Receipt Unfold: itemised receipts.
- Hold to Confirm: safety for large transfers.
- Streak Counter: savings streaks.
- Ruler Picker: weekly auto-save amount.
- OTP Input: two-step sign-in.
- Password Strength: live password grading.
- Switch (Animated Tabs): card controls.

## Responsive and accessibility

- At 390px the hero stacks, the tilt card and floating toast hide, and wide demos sit in a fit-to-width scaler. No horizontal scroll.
- The billing control uses `role="radiogroup"` with `role="radio"` and `aria-checked`. Switches carry labels. Icon buttons have `aria-label`.
- Green text uses the darker green for contrast; keep all text at 4.5:1 or more.
- Pointer tilt and magnetic effects only on fine pointers. No random values or `window` reads during render.

## Final checklist

- [ ] Phone, card and toast animate in and respond to scroll without re-rendering React.
- [ ] Money Goo, Swipe Stack and Hold to Confirm all work with mouse, touch and keyboard.
- [ ] Price digits roll when switching Monthly and Yearly.
- [ ] One accent family (green), hard-coded; correct in a dark-mode host.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
