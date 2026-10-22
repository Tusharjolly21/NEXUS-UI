# X-ray Hero

Build a product hero that can be x-rayed. The page is drawn twice, stacked: the finished design, and its blueprint (dark blue, dashed component boxes, type specs, red measurements, token names). The pointer is a round lens: inside it the blueprint shows, outside it the finished page. Move away and the lens closes. It should feel precise and designerly, Apple-light by default.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4, framer-motion (`motion`, `animate`, `useMotionValue`, `useMotionTemplate`, `useSpring`, `useTransform`, `useInView`, `useReducedMotion`), and a `cn` helper.
- File: `components/blocks/xray-hero.tsx`, named export `XrayHero` and type `XrayHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `autoplay` | `boolean` | `false` | Sweeps the lens across the page every 2s until the visitor first moves a pointer over it or opens the Blueprint toggle. Never runs under reduced motion. |
| `onAction` | `(label: "primary" \| "secondary") => void` | none | Called with the button that was pressed. Nothing navigates. |
| `className` | `string` | none | Extra classes on the section. |

## Layout and look

- Root `div`: relative, full width, `overflow: hidden`, height 560px (520px from `md`). It holds, in order: the finished layer, the blueprint layer inside a clipped wrapper, a ring, a hint pill and the Blueprint toggle.
- Both layers are the same `Layout` component with a `mode` of `final` or `plan`. Each is absolutely filled, a grid with one column and 40px gap (two columns `1.1fr 1fr` from `md`), items centred, padding 56px / 32px (`md`: 56px / 56px).
  - Finished background: `linear-gradient(160deg, #ffffff, #f3f5fb)` (dark `#000000` to `#0b0d14`).
  - Blueprint background: `#0b3a8c` with a 24 x 24px grid of `rgba(159,210,255,.14)` 1px lines.
- Left column content (all demo copy):
  1. Badge pill "New · Variables 2.0": padding 4px 12px, 13px medium, fully rounded, `#eef5ff` fill / `#0071e3` text (dark: `#0a84ff` at 15% fill, `#0a84ff` text).
  2. `<h1>` "Every pixel," line break "on purpose." margin-top 20px, `clamp(38px, 5.4vw, 64px)`, semibold, line-height 1.02, tracking -0.045em, `#1d1d1f` / `#f5f5f7`.
  3. Paragraph, margin-top 24px, max width 420px, 18px / 1.5: "Hover the page to see how it's built: spacing, type and components, measured." `#6e6e73` / `#a1a1a6`.
  4. Buttons, margin-top 32px, wrap, gap 12px, padding 14px 24px, 16px medium, pill: "Start building" (`#0071e3` fill, dark `#0a84ff`, white text) and "Read the docs" (white fill / `#2c2c2e`, ring `rgba(0,0,0,.08)` / `#3a3a3c`). In the finished layer they are real `<button type="button">`s; in the blueprint layer plain spans.
- Right column (hidden below `md`): a curve card and a row of three token chips.
  - Curve card: width 320px, right aligned, radius 24px, padding 20px, white (dark `#1c1c1e`) with a soft blue shadow. Header: "motion/ease-out" (15px semibold) and ".16, 1, .3, 1" (mono 11px `#86868b`). An SVG `viewBox 0 0 280 196`: a 5 x 5 grid of lines across a 236 x 132 plot at (22, 14), a dotted diagonal, the cubic bezier `C (.16, 1) (.3, 1)` as a 2.5px ink path with round caps, two bezier handles in the accent with 5px handle circles (white fill, 2px accent stroke), two 3.5px end dots, a vertical playhead line and a 5.5px accent dot riding the curve, and below it a track at y 178 (6px round, soft grey) with a filled accent portion and a 9px white knob (soft drop shadow) at the eased value. Footer mono 11px: "0ms" and "duration 1400ms". Accent `#0071e3` (dark `#0a84ff`), ink `#1d1d1f` (dark `#f5f5f7`), grid `#ececf0` (dark `#2c2c2e`).
  - Chips: three small pills (mono 11px, white / `#2c2c2e`, padding 6px 12px 6px 6px, 8px gap, right margin 40px) each with a 16px colour dot: `#0071e3` "blue/500", `#1d1d1f` "gray/900", `#e8e8ed` "radius/24".
- Blueprint-only overlay content: every element above gets a dashed 1px `#9fd2ff` at 70% outline with transparent fill and light blue text (`#e6f2ff`, paragraph `#cfe6ff`), and the layer adds mono 10.5px `#9fd2ff` notes: `<Badge tone="blue" />` above the badge, "SF Pro Display · 64 / 1.02 · -4.5%" above the headline's right end, "body/lg · #6E6E73 · max 420" under the paragraph, `<Button size="lg" />` under the primary button, `<CurveEditor padding=20 radius=24 />` above the card, "P1 (.16, 1) · P2 (.3, 1)" inside the card, `<TokenChip /> x 3` under the chips; and red measurement bars (`#ff6b8b`, 1px line with a small label pill, white mono 9.5px): "24" vertical under the headline, "12" horizontal above the buttons, "20" vertical beside the card.
- Lens wrapper: absolute, fills the root, `pointer-events: none`, `aria-hidden`, `clip-path: circle(R px at X px Y px)` built with `useMotionTemplate` from springs. The blueprint is decorative.
- Ring: absolute round element at the lens centre, `translate(-50%, -50%) scale(2)`, width and height = R, shadow `0 0 0 1.5px rgba(255,255,255,.9), 0 0 0 6px rgba(10,132,255,.18), 0 18px 40px -10px rgba(0,0,0,.35)`, pointer-events none.
- Hint pill: bottom 16px, centred, `bg-black/70`, white 12px, "Move over the page to x-ray it". Gone after the first pointer move or when the toggle is used.
- Blueprint toggle: a real button bottom-right (16px inset), `bg-black/70`, white 12px medium, padding 4px 12px, "Blueprint", `aria-pressed`.

## Motion

- Lens target values: `lx`, `ly` (pixels in the root) and `lr` (radius). Springs: position `{ stiffness: 260, damping: 30 }`, radius `{ stiffness: 200, damping: 22 }`. The radius used for clip and ring is clamped at 0 because the spring can overshoot below zero.
- Pointer move sets the target to the pointer and the radius to 150px (110px for touch). Pointer leave or cancel sets the radius to 0.
- One shared clock (a motion value animated 0 to 2300 linear, 2.3s, repeat forever) drives the curve card in both layers: `u = min(1, (t mod 2300) / 1400)`, eased with a bisection solve of cubic-bezier(.16, 1, .3, 1); the dot rides the curve, the playhead follows `u`, and the knob follows the eased value. 1.4s run then 0.9s hold. The clock only runs while the section is in view and the tab visible. Under reduced motion it rests at 1400.
- Under reduced motion the lens follows the pointer with no spring (the spring values jump).

## Interaction and states

- Pointer move over the root moves the lens. The Blueprint toggle (keyboard and touch path) sets the lens to the section's centre with a radius covering the whole box; pressing again closes it. While it is on, pointer moves are ignored.
- The blueprint layer never takes pointer events, so the finished buttons stay clickable under the lens. Buttons call `onAction` and never navigate.

## Autoplay demo

With `autoplay` (and motion allowed, section in view, tab visible, visitor not yet interacted), every 2000ms: set radius 140 and animate `lx` to `width x (0.25 + 0.5 x ((k x 0.37) mod 1))` and `ly` to `height x (0.3 + 0.4 x ((k x 0.61) mod 1))` over 2s easeInOut, `k` counting ticks. Stops for good on the first pointer move or when the toggle is used.

## Accessibility

- The finished layer is the real content: one `<h1>`, a paragraph and real buttons with a visible focus ring (2px outline, 2px offset, `#0071e3`, dark `#0a84ff`).
- The blueprint layer, ring and notes are `aria-hidden`.
- The toggle is a labelled button with `aria-pressed`.

## Acceptance checklist

- [ ] Moving a mouse over the hero opens a round lens showing the blueprint; leaving closes it with a spring.
- [ ] Inside the lens: dashed boxes, notes, red measurements and the blue grid appear in place over the finished page, aligned pixel for pixel.
- [ ] The curve dot, playhead and knob move in step in both layers.
- [ ] With `autoplay`, the lens drifts around until the first pointer move.
- [ ] The Blueprint toggle shows the whole blueprint and can be reached and pressed from the keyboard.
- [ ] Off screen or in a hidden tab the clock and the sweep stop.
- [ ] Under reduced motion the lens snaps to the pointer and the curve rests at the end.
- [ ] At 320px wide nothing overflows; the right column is hidden below `md`.
- [ ] Dark mode swaps the finished layer's background, text, card, chips and buttons; the blueprint keeps its blue.
