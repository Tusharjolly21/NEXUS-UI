# Build prompt: Halcyon, a cinematic pro laptop launch

Build a single-page launch site for **Halcyon**, an invented pro laptop (Halcyon 14 and 16, HX2 and HX2 Max chips) for people who edit, grade and render films. The feel is cinematic but light: a pale studio-grey stage, white cards, one slate accent, a sky-blue glow from the screen, big tight type and spring motion. The signature moment is the **pinned opening**: a laptop built entirely in CSS 3D sits closed on the stage; as you scroll, its lid swings open on its hinge, the screen powers on, the camera tilts down and the machine turns to face you, while three headlines cross-fade above it. Drag sideways at any point and the laptop turns on its axis, then swings back like a weighted turntable.

## Stack

- Next.js (App Router), React 19, TypeScript strict, one client component (`"use client"`). Keep the default export name the route expects.
- Tailwind CSS 4 with hard-coded colours only; no theme tokens.
- Framer Motion 12 for all motion. No three.js, no model files, no images and no web fonts: the laptop is divs with `transform-style: preserve-3d`, and every picture is gradients and clip-paths. This renders reliably everywhere, including headless browsers.
- Root: `<MotionConfig reducedMotion="user">`, then `bg-white text-[#1d1d1f] overflow-x-clip` with `style={{ colorScheme: "light" }}`.

## Page structure and copy

1. **Sticky glass nav**: a dark rounded square with a sky-blue arc and a white dot, "Halcyon"; links Performance, Display, Pro apps, Ports, Buy; slate "Order".
2. **Hero, pinned** (section 260vh tall on desktop, 230vh on phones, sticky child 100svh). Background `radial-gradient(70% 55% at 50% 70%, #fff, #eef0f3 55%, #e3e6ea)`. Three stages of copy at the top, each fading and lifting with scroll:
   - "New · Halcyon 14 and 16", the word "Halcyon" huge, and "A laptop for people who finish films on it. Scroll to open it, drag to turn it."
   - "Studio display" / "1,600 nits, the moment it opens."
   - "HX2 Max" / "Full-speed 8K, unplugged." with "Order from $2,099" and "See performance".
   At the bottom a small hint pill "Scroll to open · drag to turn" (fades after the first drag) and a thin progress bar.
3. **Stats row**: 3.1× faster 8K renders than Halcyon 15 (2023), 1,600 nits, 18 hrs, 80 Gb/s.
4. **Performance** (grey band): "Built for the long render, not the benchmark." A card racing three bars for exporting a 10-minute 8K timeline (HX2 Max 4:12, HX2 6:40, Halcyon 15 13:05) with a test footnote; a pausable export progress card ("Pause an export, take the call."); and a card of four on-device jobs with dot-matrix loaders (transcribing, tracking masks, denoising, building proxies).
5. **Display**: "Detail you can check without a loupe." Three spec rows and a draggable glass lens over a film frame with tiny slate text, so the magnification proves the pixel density.
6. **Pro apps** (grey band): "Grade on battery, at full brightness." A 16:9 frame graded live by four scrub fields (Exposure, Contrast, Warmth, Vibrance) through CSS filters.
7. **Connectivity**: "Off the card before you've packed the camera." Left and right port lists; a drop zone where footage files (.braw, .wav) become chips that fill and tick.
8. **And the rest** (grey band): four spotlight cards (six speakers, 12 MP camera, Wi-Fi 7, full-height function row).
9. **Buy**: "Pick a size. The rest follows." A preview that springs between 14 and 16 inch scale, a stretchy size switch, two chip options with a sliding ring (HX2 included, HX2 Max +$800), Slate and Mist finishes, a rolling total and an "Order" button. 14-inch from $2,099, 16-inch from $2,599.
10. **FAQ** (grey band): battery speed, fan noise, external displays, calibration, what the 14-inch lacks.
11. **CTA band**: "Finish the film on the plane home."
12. **Footer** saying the brand, products and figures are invented.

No real brand names, product names, trademarks or customer logos anywhere in the copy.

## The CSS 3D laptop

- Base 600 × 404px deck, 14px thick. A rig div sits at the stage centre with `preserve-3d`; the deck is `rotateX(90deg)` so it lies flat, and four edge strips are placed with `translateZ` and `rotateY`. The deck holds a 14 × 6 key grid and a trackpad.
- The lid (600 × 390px) has `transform-origin: 50% 100%` and sits at the back edge (`z = -202px`), 3px above the deck so it never z-fights when closed. Its front face is the screen (bezel `#0b0c0e`, a grading app with a film still, timeline and colour wheels); its back face is `rotateY(180deg)` aluminium with a faint brand mark. Both faces use `backface-visibility: hidden`. A blurred sky-blue glow sits behind the screen.
- A radial floor shadow lies under the deck. Scale the whole stage with CSS (`scale-[0.5] sm:scale-[0.8] lg:scale-100`).

## Look

- Surfaces `#ffffff` and `#f5f5f7`; cards white, radius 24-28px, shadow `0 0 0 1px rgba(0,0,0,.05), 0 24px 48px -32px rgba(0,0,0,.35)`.
- Text `#1d1d1f`, secondary `#6e6e73`. Accent slate `#475569` (7.5:1 on white) for eyebrows, buttons, bars and rings. Sky `#7dd3fc` only for the screen glow and logo. Finishes Slate `#5b6472` and Mist `#d5d8dd`.
- Hero word `clamp(52px, 10vw, 132px)`, stage headlines `clamp(36px, 6vw, 76px)`, section heads `clamp(34px, 5.4vw, 60px)`, all weight 600 with -0.05em tracking. Numbers `tabular-nums`.

## Motion

- Scroll progress of the hero goes through `useSpring` (stiffness 140, damping 28). From it: lid angle -88° to 14° over 4-46% of the scroll, screen power from 30% to 48%, rig tilt -32° to -11°, scale 0.84 to 1.05, and a scroll turn of -26° to 8°. Copy stages use `useTransform` for opacity and a 20px lift, and their pointer events switch off when faded.
- **Drag to turn:** `onPan` adds the horizontal delta to a spin motion value (clamped to ±70°, smoothed by a spring of stiffness 80, damping 14). On release the spin animates back to 0 with a loose spring (stiffness 50, damping 9) seeded with the release velocity, so it swings past and settles. The stage keeps `touch-action: pan-y` so phones still scroll.
- Under reduced motion the lid is simply open and the screen on.
- Bars race on springs (stiffness 70, damping 18) when in view. Shared `layoutId` rings use stiffness 420, damping 30-32. Reveals stay within 0.6 s and 20px, `once: true`.

## Motion Kit components used

- **Glass Lens**: magnifies the film frame to show pixel density.
- **Scrub Inputs** (`ScrubField`): the live grade.
- **Squeeze Progress**: the pausable export.
- **Upload Chips**, copied as Offload Chips: footage copying off a card.
- **Stretch Nav**: the 14/16-inch size switch.
- **Matrix Loaders**: on-device job status.
- **Price Odometer's** `RollingNumber`: the configurator total.

## Responsive and accessibility

- At 390px the stage scales the laptop to half size, copy stays above it, sections stack, the lens and scrub fields remain usable, and nothing scrolls sideways.
- The 3D stage has `role="img"` and a label explaining scroll and drag. Real buttons with slate focus rings, `role="radio"` for chip and finish choices, text at 4.5:1 or better.

## Checklist

- [ ] The lid opens smoothly with scroll and the screen turns on; dragging turns the machine and it swings back.
- [ ] No WebGL or model files needed; nothing blank in headless screenshots.
- [ ] Six or more Motion Kit components, each with a job.
- [ ] Zero console errors, reduced motion respected, identical in dark mode.
- [ ] No real trademarks or product names in the copy.
