Build a fabric pouch that you unzip to reveal an invite code. Dragging the metal pull down makes the teeth part above the slider into a V, the cloth edges peel back with a soft shadow under them, and a gradient panel with the code comes into view behind. The pull tab swings like a real zipper pull as you move it, and the zip stays wherever you leave it. The feel is tactile and Apple-like: soft fabric, brushed metal, a little bounce.

## Stack

React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`animate`, `useMotionValue`, `useMotionValueEvent`, `useSpring`, `useVelocity`, `useReducedMotion`). The pouch is a single inline SVG. Suggested file: `components/zipper-reveal/zipper-reveal.tsx`, named export `ZipperReveal`, plus an exported `ZipperRevealProps` interface.

## API

- `code?: string`, default `"NXS-8F2Q-PRO"`. The invite code shown inside and copied by the button.
- `autoplay?: boolean`, default `false`. Zips itself open and shut until someone grabs the pull.

## Layout and look

- Root: flex column, centred, gap 12px: a fixed 320 by 420 relative box, then a caption.
- Inside panel (behind the SVG): absolute, fills the box, `rounded-[30px]`, overflow hidden, padding 28px, white text, background `linear-gradient(160deg, #0a84ff, #5e5ce6 60%, #bf5af2)`. Content is a 180px centred column, `pt-6`: eyebrow "You're in" (12px semibold uppercase, tracking 0.16em, white 70%); title "Early access to Nexus Pro" (26px semibold, tight leading, tracking -0.03em, `mt-2`); the code in a pill (`mt-5`, `rounded-[12px]`, white 15% with backdrop blur, `px-3 py-2`, mono 15px, tracking 0.08em); a "Copy code" button (`mt-3`, `h-9`, `px-4`, rounded-full, white, 13px semibold, `#1d1d1f`) that reads "Copied" for 1.5s after writing to `navigator.clipboard`.
- Caption below: 13px, `#86868b` (dark `#98989d`). Text: "Pull the zip down." when almost closed (progress below 0.05); "Keep going…" while opening; "Copy it before someone else does." once the code is visible (progress above 0.45).
- SVG overlay: 320 by 420 viewBox, overflow visible, container `pointer-events: none` (only the slider group takes events). Define a rounded-rect clip path (`rx` 30) for the cloth.
- Fabric colours (use CSS variables so dark mode works): light gradient `#f2f2f5` to `#e3e3e8` (diagonal), tape `#d4d4da`, stitching `#b9b9c0`; dark `#2c2c2e` to `#1c1c1e`, tape `#48484a`, stitching `#545458`. Metal (teeth, slider, pull, bottom stop) uses a diagonal gradient `#f5f5f7`, `#c4c4cb` at 50%, `#8e8e96`, in both themes.
- Weave: draw each panel twice, the second copy black through an `feTurbulence` filter (fractal noise, base frequency "0.9 0.35", 2 octaves, seed 4) scaled to 9% alpha.
- Hem: dashed rounded rect inset 10px, radius 22, 1.2px stroke, dash "5 4".

## Geometry

Let progress `p` run from 0 to 1 and the slider height be `sy = 34 + p * (392 - 34)`. The two cloth panels share the centre line x = 160. At height y, each edge sits at `open(y) = 0` for `y >= sy`, and `150 * (1 - exp(-0.62 * (sy - y) / 150))` above it, so the gap is widest at the top and tapers smoothly to the slider. Build each panel as a polyline sampled every 4px from top to bottom: the left panel runs from x = 0 to the left edge (160 - open), the right panel from the right edge (160 + open) to x = 320.
- Under the edges: a 14px black stroke at 35% opacity, blurred (std 5), shifted 4px toward the centre (the cast shadow).
- Over the panels: zip tape, a 9px stroke along each edge, shifted 4px outward.
- Teeth: from y = 40 to 390 every 4px, alternating left and right. Each tooth is a 10 by 4.4 rounded rectangle (radius 1.6, 0.5px dark stroke), centred on its edge plus 1.5px (3px once the gap is over 0.5px), rotated to follow the edge slope (slope measured over +/-2px, converted to degrees, sign flipped for the right side), and offset 2px along its length away from the centre.
- Bottom stop: a 14 by 7 metal rectangle at y = 391, radius 2.

## Motion

- Drag: pointer down on the slider captures the pointer; while dragging, map the pointer's y in SVG space to `p = clamp((y - 34) / 358, 0, 1)`. Set the motion value directly so the zip follows the finger exactly. Stop any running animation on press.
- Pull swing: take the velocity of `p` and drive a spring (stiffness 220, damping 9) with target `clamp(-velocity * 22, -38, 38)` degrees. The tab rotates by that angle around the point (0, 8) relative to the slider, so it flicks sideways when you move fast and wobbles back to hang straight.
- Slider: 26 by 30 rounded rectangle (radius 8) with a light highlight bar; the pull tab below it is 16 by 44 (radius 7) with a small dark hole near the end. A transparent 60 by 84 hit area surrounds it; cursor grab.
- Keyboard: arrow down or right adds 0.05, up or left subtracts 0.05, End goes to fully open, Home to closed, each animated with a spring (stiffness 300, damping 30).

## Autoplay demo

With `prefers-reduced-motion`, autoplay does not run. Otherwise every 2200ms, animate `p` to the next value in the sequence 0.78, 0.18, 0.55, 0, repeating, each over 1.3 seconds with ease `[0.45, 0, 0.2, 1]`. The schedule stops for good once the user touches or uses the keyboard on the zip. It is skipped while the tab is hidden or the component is off screen.

## Accessibility

The slider group has `role="slider"`, `tabIndex 0`, `aria-label="Zip"`, min 0, max 100, `aria-valuenow` equal to the percent open, and `aria-valuetext` of "Open: invite code showing" once the code is visible, otherwise "N% open". Focus shows a 3px blue stroke (`#0071e3`, dark `#2997ff`) on the slider body. The Copy button is not focusable and is `aria-hidden` until the code is visible.

## Acceptance checklist

- Dragging the pull down opens the pouch in a V that is widest at the top and closes to a point at the slider.
- The tab swings when moved quickly and settles with a visible wobble.
- The zip stays where released and can be pulled back up.
- The code is readable and the button works only after the pouch is over 45% open; copying shows "Copied" for 1.5 seconds.
- Dark mode darkens the fabric, tape and stitching, while the metal and the gradient panel keep their colours.
- With `autoplay`, the zip opens and closes on its own and stops for good when grabbed.
