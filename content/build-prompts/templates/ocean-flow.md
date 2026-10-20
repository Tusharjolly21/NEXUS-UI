# Build prompt: Ocean Flow — diving equipment store

Build a single-page e-commerce landing site for **Ocean Flow**, a dive shop that sells a small range of masks, fins, computers, torches and wetsuits, fits them properly and pressure-tests everything before it ships. The feel: a bright product store, white cards, light grey sections, one ocean blue. The hero is the store's whole argument: a slice of reef with a depth gauge you drag down, and the water, the colours, the dive numbers and the recommended kit all change with depth.

## Stack

- Next.js (App Router), React 19, TypeScript in strict mode.
- Tailwind CSS 4 with hard-coded colours (no theme tokens), so it looks the same in a dark-mode host. Set `colorScheme: "light"` plus explicit background and text colours on the root.
- Framer Motion 12 for all motion. No other UI libraries, no remote images, no web fonts. Product shots are inline SVG.
- `"use client"` on interactive files; wrap the root in `<MotionConfig reducedMotion="user">`.

## Page structure and copy

1. **Sticky glass nav.** Logo: a blue disc with a swaying white wave, plus "Ocean Flow". Links Gear, Sizing, Kits, Delivery, Reviews. The right button is the bag ("Bag", then "Bag · 3") and opens the cart drawer.
2. **Hero: centred copy above a wide water window.** Pill "Fitted and pressure-tested before it ships". Headline "Gear for the **depth** you actually dive." Sub: "Drag the gauge down the reef. Watch the reds go, the water cool and the no-stop time shrink, and we'll pack the kit that suits that dive." Buttons "Shop the gear", "Find my size". Then a 1240px rounded window (620px tall, 700px on phones) with:
   - a vertical depth gauge on the right (0–40 m, white glass pill, a blue knob reading "18m");
   - a readout card top-left: "Punta Vela reef", the range (Open Water to 18 m, Advanced to 30 m, Deep specialty beyond), depth as a rolling number, pressure (1 + d/10 bar), water temperature (27 °C − 0.22 °C per metre), no-stop time from a recreational air table (10 m 219 min, 12 m 147, 14 m 98, 16 m 72, 18 m 56, 20 m 45, 22 m 37, 25 m 29, 30 m 20, 35 m 14, 40 m 9), five "colour left" dots where red, orange and yellow fade, and "Planning figures for air, first dive of the day. Not a dive table.";
   - a "Packed for 18 m" card bottom-right: Tern mask, the wetsuit for the temperature (3 mm at 24 °C+, 5 mm from 20 °C, 7 mm below), the Fathom computer from 10 m and the Lumen torch from 15 m, each with a reason and price, and "Add this kit · $906".
3. **Promise strip**: count-up stats — $150 free shipping from, 60 days to return it even wet, 3 pm order by and it ships today, 4.8 from 3,214 diver reviews.
4. **Featured gear** (`#gear`): "Five things every diver ends up buying." A wide card for the **Fathom dive computer** ($429, two straps, an **Elastic Stepper** for quantity 1–4, its SVG screen shows the hero's depth and no-stop time). Cards for the Tern mask ($89, three colours), Glide fins ($149, three colours), Lumen 1200 torch ($119) and Drift snorkel ($29). Swatches have a gliding ring; "Add to bag" rolls to "Added" with a drawn check.
5. **Sizing** (`#fit`, grey): "Measured once, fitted for good." "Fins, by foot length." uses a **Ruler Picker** in millimetres (220–320) that rolls in a fin size XS–XL with its EU range. "Wetsuits, by the water." uses **Radio Cards** for the 3 / 5 / 7 mm Current suits, a segmented size control and a confirm button "Add size M 5 mm Current suit".
6. **Build a kit** (`#kit`): a sand-coloured flat-lay of SVG gear beside "Your first kit, priced honestly." / "Four pieces or more and we take 10% off the lot." Six rows with **Capsule Toggles**; each toggle springs its item on or off the flat-lay; the total rolls with the **Price Odometer** rolling number; a line reads "You save $45 on 5 pieces" or "2 more for 10% off"; "Add kit".
7. **Delivery and returns** (`#delivery`, grey, pinned scroll story): "Checked by a diver, not a scanner." with a self-ticking **Todo List** (regulator flow-tested at 200 bar, lens checked, computer charged, fins matched); "Shipping to an island? We fly it." with a **Flight Tracker** SAN → HNL; "Get it wet, then decide." with a prepaid 60-day return label.
8. **Reviews** (`#reviews`): "Divers who came back up happy." A rating card (4.8, 3,214 verified orders, star bars that grow in) beside six invented reviews with stars, product chip, quote, initials, name and dive history.
9. **FAQ**: returns, servicing, island shipping, whether the depth figures are dive-safe (no), pool try-ons.
10. **CTA band**: "Your next dive starts at the door." / "Order by 3 pm and it ships today, checked by someone who dives." **Footer**: Shop, Help, Visit.

**Cart.** A right-hand drawer (spring, dimmed backdrop, Escape closes, focus moves to the close button) with a free-shipping bar that turns green at $150, rows with thumbnail, variant, − / + quantity (zero removes the row), totals and "Check out". Checkout shows "Order OF-20419 is in.", a note that nothing was charged, and a **Receipt Unfold** built from the bag. Adds show a toast with "View bag".

## Look

- Page white, sections `#f5f5f7`, cards white. Ink `#1d1d1f`, secondary `#6e6e73`, `#424245` for small text on glass.
- Blue `#0284c7` for graphics, `#0369a1` for text and buttons (5.9:1 on white). Green `#15803d` only for "Added" and free shipping.
- Water gradient by depth at 0 / 10 / 25 / 40 m: top `#bdeafe, #38bdf8, #0369a1, #062437`; bottom `#38bdf8, #0284c7, #074b70, #03131f`.
- System font stack. Hero headline `clamp(42px, 6.4vw, 84px)`, weight 600, line-height 0.98, tracking -0.055em. Captions 12–13px. `tabular-nums` on prices and readings.
- Cards radius 28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`; pill buttons 44px.

## Motion

- The hero runs on one motion value, `depth`, and a spring copy (stiffness 110, damping 22, mass 0.8) that drives everything through `useTransform`: gradient, light rays gone by 22 m, the surface line rising out by 8 m, the reef rising and scaling, coral and fish colours fading (reds by 8 m, orange by 18 m, yellow by 30 m), a dark veil past 20 m. React re-renders only on whole metres; other sections read depth from a shared motion value.
- On load the depth glides 4 → 18 m (stiffness 26, damping 14) unless touched. Pressing the gauge springs there (stiffness 220, damping 26); dragging follows the pointer; the knob scales to 1.12 while held.
- Rolling readouts use stiffness 600, damping 36; the packed list re-flows with a layout spring (380 / 30). Swatch rings and size segments use `layoutId` springs (500 / 32). The drawer slides on 320 / 34.
- Bubbles and fish loop gently, positions fixed per index. Reveals travel 20px or less, once.

## Motion Kit components and their jobs

- Radio Cards (local copy with a confirm callback and footer slot): wetsuit thickness.
- Ruler Picker (local copy with an accessible label): foot length.
- Elastic Stepper: computer quantity. Capsule Toggles: kit pieces. Price Odometer rolling number: kit total.
- Todo List: pre-ship checks. Flight Tracker: island delivery. Receipt Unfold (local copy with header and payment props): the order receipt.
- A local pinned scroll story with a hydration-safe media query that keeps every visual mounted.

## Responsive and accessibility

- At 390px the readout sits top-left, the packed card spans the bottom beside the gauge, cards stack, wide demos use a fit-to-width scaler, and nothing scrolls sideways.
- The gauge knob is a `role="slider"` with `aria-valuetext` in metres and supports arrows, Page Up/Down, Home and End. Swatches and sizes are radio groups; the drawer is a modal dialog; icon buttons have labels; toasts use `role="status"`; focus rings are visible.
- Round trigonometry in SVG attributes so server and client match. No random values during render.

## Final checklist

- [ ] Dragging the gauge changes water, reef colours, readouts and packed kit together, smoothly.
- [ ] Every add reaches the bag; the drawer adjusts quantities, tracks free shipping and checks out to a receipt.
- [ ] One blue, hard-coded; correct in a dark-mode host; text contrast at least 4.5:1.
- [ ] No hydration warnings or console errors; no horizontal scroll at 390px.
