# Build prompt: Ferry — multi-currency payments landing page

Build a single-page marketing site for **Ferry**, a business account that holds, converts and sends money in many currencies. It ships in light and dark, with one blue accent. The hero is a working currency converter next to a dotted globe that draws the route for the chosen corridor, and the page is full of small interfaces you can use: a treasury view, a rate lock, a payout router, approval rules, a code sample and a pricing calculator.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4. Colours come from CSS variables holding space-separated RGB triplets (`--ferry-ink: 10 10 10`) so utilities can add alpha, for example `bg-[rgb(var(--ferry-accent)/.1)]`.
- Framer Motion 12 for motion. No other animation or UI libraries, no remote images, no web fonts to load (use the app's Inter if it has one, otherwise the system stack), no audio.
- `"use client"` on interactive files; wrap the page in `<MotionConfig reducedMotion="user">`.
- The globe is a plain 2D canvas: dots from a compact encoded list of land points, projected on a sphere, with a great-circle arc between two cities. No three.js.
- Dark mode is the `dark` class on `<html>`. The page's own toggle flips it (with a view transition when the browser supports it and motion is allowed) and saves the choice under `ferry-theme`.

## Page structure and copy

1. **Nav.** Floating pill with the Ferry mark. Links: a Product menu (Treasury, Exchange and rails, Payouts, Approvals, each with a one-line description and a stat), Payouts, Developers, Pricing, FAQ. The active link follows the section in view. A theme toggle, "Sign in" and "Open an account". Below 1024px the links collapse into a menu button.
2. **Hero.** Headline "New York to Berlin in 3 minutes." where the two cities and the time change with the chosen corridor. Sub: "Ferry gives your company local accounts in 34 currencies, the real exchange rate, and payouts that land in minutes across 160 countries." Buttons "Open an account" and "See pricing", and the note "Licensed in the UK and EU. Client money is held at tier-one banks." Beside it a converter card: "You send" amount (editable) with a currency picker, a swap button, "They receive" with a picker, then Rate, Our fee, Arrives, and a "Send to Berlin" button with the line "A preview with sample rates. Nothing is sent." Digits roll when the amount or currency changes. The globe behind the card redraws its arc and launches a dot along it.
3. **Live treasury.** "Balances, rates and payouts in one treasury view." Three stat tiles (total balance, converted this month, average arrival), a 30-day balance line chart with a hover read-out, an "Arrival by rail" table with a headline success rate, a stack of three company cards you tap to cycle (each with its recent spend), and three region balances with Settled or Clearing badges.
4. **Product bento.** "Every payment path built for speed and control." Cards: a 24-hour **rate lock** with a dial that counts down, **reconciliation** with a daily total, **payout speed** with a Ferry versus SWIFT bar chart per region, a **cut-off map** table with time left per region, and a **webhook flow** diagram with a dot travelling along two paths. A second globe tile cycles through corridors.
5. **Payouts.** "Send every payout over the right local rail." A payment card with a list of five corridors (London to Mumbai, Berlin to São Paulo, New York to Lagos, Singapore to Sydney, Toronto to Mexico City). Choosing one routes the payout, shows the rail and time, and moves it to Arrived.
6. **Approvals.** "Rules your finance team sets once." Three rule switches (Second approver with an approval limit of $10k, $50k or $100k, Hold new recipients, Invoice required) beside a pending payment of €48,200 to Lumen GmbH. The checklist and the "Approve as Daniel" button follow the rules: above the limit it needs two people.
7. **Developers.** "Build Ferry into your product." Three feature rows (webhooks, safe retries, a sandbox) and a code panel with cURL, Node and Python tabs, syntax colours, a Copy button and a "Run request" button that types out a sample response.
8. **Customers.** "Finance teams move faster with Ferry." A row of six case cards that drifts sideways and pauses on hover or focus (it becomes a scrollable row under reduced motion). The companies, people and figures are plainly sample content.
9. **Pricing.** "Pricing that scales with your volume." Three plans (Starter $0 and 0.6%, Growth $49 and 0.4%, Scale $299 and 0.25%) and a logarithmic slider from $10k to $10M of monthly conversions. The plan that costs least at that volume gets "Best for your volume", and each card shows its cost at the chosen volume. A line compares it with a typical bank's 2.5% markup.
10. **FAQ.** "Treasury questions, answered." Six questions as an accordion, one open at a time, and a "Talk to us" button.
11. **Closing band and footer.** "Get started in about ten minutes." with an email field and "Open account", then five link columns, social icons and the line "A template: the company, people, rates and accounts shown are sample content."

## Look

- Light: page `#ffffff`, frame `#f8faff`, raised `#f5f6f8`, ink `#0a0a0a`, secondary `#52525b`, faint `#71717a`, accent `#2767ff`, gain `#1f883d`, loss `#dc2626`, amber `#a16207`.
- Dark: page `#000000`, frame `#07080b`, surface `#030305`, raised `#111115`, ink `#ffffff`, secondary `#a1a1aa`, accent `#2767ff` with `#8db0ff` for accent text, gain `#4ade80`, loss `#f87171`, amber `#f5b642`.
- Inter at weights 400 to 600. Section headings `clamp(34px, 4.3vw, 58px)`, weight 500, tracking -0.025em. Numbers use tabular figures.
- Cards are 22px radius with a 1px hairline from the ink colour at 8% and a soft panel shadow in light mode. A faint accent glow sits in the corner of the larger frames.

## Motion

- Digits roll with a spring (`AnimatePresence mode="popLayout"` plus a column of 0 to 9). Text that swaps (city names, rail names) blurs and slides.
- Currency menus and tooltips open with a short scale and fade; the card stack cycles with a spring.
- The rate-lock dial, the webhook dot and the Ferry versus SWIFT bars only run while in view.
- Everything respects `prefers-reduced-motion`: motion is removed, the customer row scrolls by hand, and the globe stops rotating.

## Responsive and accessibility

- At 390px the nav collapses to a menu, the hero stacks with the converter below the headline, the bento and the plans stack to one column, and the page has no horizontal scroll.
- The currency picker is a listbox with arrow keys and Escape. The rule switches use `role="switch"`. The FAQ uses buttons with `aria-expanded`. The slider is a native range input with a visible focus ring.
- Text stays at 4.5:1 or better in both themes.
- No random values or `window` reads during render; coordinates computed with trigonometry are rounded so server and client markup match.

## Final checklist

- [ ] The company, people, quotes, rates and figures are plainly sample content for a fictional product; no real company is named as a customer.
- [ ] The regulatory line in the hero is replaced with your own before launch.
- [ ] Changing a currency or the amount updates the rate, fee, arrival text, headline and globe together.
- [ ] Both themes read correctly, including the globe and the charts.
- [ ] The three rule switches and the limit change the approval checklist and the button.
- [ ] No hydration warnings or console errors; no horizontal scroll at 320, 390, 768, 1024 or 1440px.
