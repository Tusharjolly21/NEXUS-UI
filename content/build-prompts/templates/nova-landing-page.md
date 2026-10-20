# Build prompt: Nova One, a fanless laptop launch

Build a single-page launch site for **Nova One**, an invented 13.6-inch laptop that weighs 0.92 kg, runs 22 hours, has no fan, and tunes its display to the light in the room. The feel is a premium, quiet product page: white and pale-grey surfaces, white cards, warm amber as the one accent, big tight type and spring motion. The signature moment is the **ambient stage** in the hero: a laptop on a lit set with a glowing lamp you drag around. As the lamp moves, the room light, the laptop's screen tint, its brightness, the glare and the floor shadow all follow, and the screen reports its new white point and brightness.

## Stack

- Next.js (App Router), React 19, TypeScript strict, one client component (`"use client"`).
- Tailwind CSS 4 with hard-coded colours only; no theme tokens such as `bg-background`.
- Framer Motion 12 for all motion. No other libraries, no images (the landscape on the screen is drawn with gradients and clip-paths), no web fonts.
- Root: `<MotionConfig reducedMotion="user">`, then `bg-white text-[#1d1d1f] overflow-x-clip` with `style={{ colorScheme: "light" }}`.

## Page structure and copy

1. **Sticky glass nav**: a dark disc with a breathing amber core, "Nova"; links Display, Keyboard, Design, Specs, FAQ; amber "Buy" button.
2. **Hero, centred text over a full-width stage.** Eyebrow "Nova One · 13.6-inch · fanless" in amber. Headline "A screen that reads the room." with "room." in amber. Sub: "0.92 kg, 22 hours on a charge, and not a single fan. Nova One matches its display to the light around you, so a late edit looks the way it will in daylight." Buttons "Buy from $1,499" and "See the display". Below, the stage (radius 36px, 600px tall on desktop, 400px on phones): the laptop seen from the front, a draggable lamp puck, a chip top-left ("Warm lamp · 620 lux") and a caption "Drag the lamp. The display follows the room." The screen shows a photo-editing window: a dusk landscape and an "Ambient" panel with live "White point" (2,700 to 6,500 K) and "Brightness" (90 to 480 nits).
3. **Stats row**: 0.92 kg, 22 hrs, 0 dB, 100% recycled aluminium, each with a plain one-line caption.
4. **Silent** (grey band): a cycling headline "Silent while you're editing. / mixing. / writing. / grading." with the sub "No fan anywhere. The N2 chip spreads its heat across the whole case, so there's nothing to spin up."
5. **Display**: "Late-night edits that survive the morning." A before/after slider over the same landscape, "Ambient off" (cold, fixed at 6,500 K) against "Ambient on" (matched to the room at 3,900 K), with four specs beside it: 2560 × 1664, 10 to 120 Hz, 1,000 nits, two light sensors.
6. **Keyboard** (grey band): "Every key, tuned to 38 grams." Three bullets and a tilted keyboard that lights up under your typing with an amber afterglow, with record and replay.
7. **Designed to last** (pinned scroll story), four steps: "Awake before you sit down." (a small lid that opens on a loop, "0.3 s from lid open to a working cursor"); "22 hours, measured on ordinary days." (a six-month grid of hours on battery that stands up into 3D columns); "Nothing to hear. Ever." (three decibel bars: a quiet bedroom 28, a fan laptop under load 41, Nova One exporting 4K at none, plus a flat line); "Opens with one screwdriver." (four isometric layers that separate on a loop, labelled lid, display, logic board, battery).
8. **Buy** (grey band): "Make it yours." Left: a laptop preview whose base and wallpaper change with the finish, and three finish swatches (Sand, Graphite, Copper). Right: three configuration rows (Essential $1,499, Studio $1,999, Atelier $2,799) with a sliding selection ring, three add-on toggles (Engraving free, NovaCare+ $199, second charger $49), a quantity stepper, a rolling total, and an "Add to bag" button that turns into its own progress bar and lands on "Review bag".
9. **Tech specs**: six cards (Chip, Display, Battery, Size and weight, Ports, Wireless) and an "In the box" line.
10. **FAQ** (grey band): what is different, colour work with ambient on, shipping, returns, app compatibility.
11. **CTA band**: "Quiet, light, and ready when you open it."
12. **Footer** saying the company, product and figures are invented.

## Look

- Surfaces `#ffffff` and `#f5f5f7`; cards white, radius 24-28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.
- Text `#1d1d1f`, secondary `#6e6e73`, captions `#424245`. Accent amber `#b45309` for text and buttons (5:1 on white); brighter `#f59e0b` only for glows, dots and graphics, never for text.
- Laptop: bezel `#16161a`, screen radius 10px, base 16px tall with a darker notch. Finishes Sand `#d9ccb6`, Graphite `#5a5b60`, Copper `#bf8262`.
- Hero headline `clamp(44px, 7.4vw, 92px)`, weight 600, tracking -0.055em. Section heads `clamp(34px, 5.4vw, 60px)`. Numbers `tabular-nums`.

## Motion

- **Hero signature:** the lamp position is two motion values (0 to 1 across and down), each smoothed with `useSpring` (stiffness 140, damping 20). Everything else is derived with `useTransform` and `useMotionTemplate`: a radial room light at the lamp (warm `rgba(255,184,98,.62)` on the left, daylight blue on the right), the room base colour dimming lower down, a multiply tint on the screen, a black dim layer, a glare that moves opposite the lamp, and a floor shadow pushed away from it. The screen readouts are motion values rendered as children, so nothing re-renders. Until the visitor grabs the lamp it drifts on a slow Lissajous path (skipped under reduced motion). Dragging uses pointer capture on the lamp only, so the stage still scrolls on touch. Arrow keys move it, Shift for bigger steps.
- Selection rings use shared `layoutId` with spring stiffness 420, damping 30-32. Bars and the battery grid rise on springs. Reveals stay within 0.6 s and 20px, `once: true`.

## Motion Kit components used

- **Lit Keyboard**: try the keyboard.
- **Before / After**: ambient display off against on.
- **Text Reveal**: the cycling "Silent while you're…" line.
- **Standing Calendar**, copied as a Battery Calendar recoloured amber: hours on battery per day.
- **Capsule Toggles** (`CapsuleToggle` export): add-ons in the configurator.
- **Elastic Stepper**: quantity.
- **Progress Button**: Add to bag.
- **Price Odometer's** `RollingNumber`: the configurator total.

## Responsive and accessibility

- At 390px the laptop on the stage scales to fit, the lamp stays draggable, the configurator stacks and nothing scrolls sideways.
- Real buttons with amber focus rings, `role="radio"` on finishes and configurations, an aria label on the lamp explaining the keys, alt text via `role="img"` where art carries meaning. Text contrast at least 4.5:1.
- No hydration mismatches: seed any sample data, and make media-query checks start from the server value.

## Checklist

- [ ] Dragging the lamp visibly retunes the screen and room, and the readouts change.
- [ ] Total updates with configuration, add-ons and quantity.
- [ ] Six or more Motion Kit components, each with a job.
- [ ] Zero console errors; reduced motion respected; looks identical in dark mode.
- [ ] No real brands, products or testimonials.
