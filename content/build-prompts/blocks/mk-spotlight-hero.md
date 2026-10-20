# Spotlight Hero

Build a centred product hero: a faint dot grid that lights up in the accent under the pointer, an announcement pill with a passing shine, a two-line headline whose second line rotates through endings, two buttons, and a browser-window product shot of a small dashboard that tips upright as it scrolls into view. It should feel premium and quiet, with every motion soft and eased.

## Stack

- React 19 client component (`"use client"`), TypeScript, Tailwind CSS v4 (container queries: `@container`, `@md:`, `@lg:`, `@xl:`, `@2xl:`, `@3xl:`), framer-motion (`motion`, `AnimatePresence`, `animate`, `useInView`, `useMotionValue`, `useMotionTemplate`, `useMotionValueEvent`, `useScroll`, `useSpring`, `useTransform`, `useReducedMotion`), and a `cn` helper.
- File: `components/spotlight-hero/spotlight-hero.tsx`, named export `SpotlightHero` and type `SpotlightHeroProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `accent` | `string` | `"#0071e3"` | Rotating word, lit dots, glow, chart, primary button. |
| `accentDark` | `string` | — | Dark accent. If omitted: `#0a84ff` when `accent` is the default, else `accent`. |
| `lead` | `string` | `"The dashboard"` | Fixed first headline line. |
| `words` | `string[]` | `["for teams.", "for founders.", "for finance.", "for you."]` | Endings that rotate on line two. |
| `sub` | `string` | "Lumen pulls every number your company runs on into one live view. No spreadsheets, no exports, no waiting for Monday." | Paragraph. |
| `autoplay` | `boolean` | `true` | Rotates the ending every 2.4s. |
| `onAction` | `(label: "announcement" \| "primary" \| "secondary") => void` | — | Called on button press; buttons never navigate. |
| `className` | `string` | — | Extra classes on the section. |

## Layout and look

- Root `<section>`: `@container`, relative, overflow hidden, bg white / dark black, padding 20px sides, 64px top and bottom (80px from `@2xl`). Sets `--mk-accent` and `--mk-accent-dark`.
- Background layers (pointer-events none, `aria-hidden`):
  1. Dot grid: `radial-gradient(var(--mk-dot) 1px, transparent 1px)` at 22×22px, opacity .5, `--mk-dot` `#d2d2d7` / dark `#3a3a3c`, masked by `linear-gradient(#000, transparent 75%)`.
  2. Lit dots: same grid with 1.4px dots in the accent, masked by `radial-gradient(260px circle at Xpx Ypx, #000, transparent 70%)` built with `useMotionTemplate` from two motion values (start at −999).
  3. Glow: 820×420px ellipse centred at the top (`max-width: 200%`), `radial-gradient(closest-side, accent 13%, transparent)` (dark 22%), `blur-3xl`.
- Copy column: max-width 980px, centred, vertical gap 24px (28px from `@2xl`).
- Announcement pill: min-height 40px, fully rounded, padding 6px left, 16px right, 8px gap, 13px medium, bg white / `#1c1c1e`, ring `0 0 0 1px rgba(0,0,0,.08)` / `#3a3a3c`, overflow hidden. Contents: a "New" badge (accent bg, white 11px semibold, padding 4px 10px, rounded-full), "Live dashboards are here" (truncates), an accent "→". A shine strip 56px wide, skewed −12°, `from-transparent via-white to-transparent` (dark `via-white/15`).
- Headline `<h1>`: `clamp(38px, 8.6cqi, 96px)`, semibold, line-height 1, tracking −0.055em, `#1d1d1f` / `#f5f5f7`. Line one: `lead` split into words, each an inline-block with 0.22em right margin. Line two: an inline-flex window 1.08em tall, overflow hidden, holding the current ending in the accent, `white-space: nowrap`, 0.06em bottom padding.
- Sub: max-width 600px, `clamp(16px, 2.2cqi, 21px)`, line-height 1.45, tracking −0.015em, `#6e6e73` / `#a1a1a6`.
- Buttons (gap 12px, wrap): 48px tall pills, padding 0 24px, 15px medium. Primary "Start free trial": accent bg, white text, shadow `0 12px 30px -12px accent`. Secondary "Watch the tour": white / `#1c1c1e`, ring `rgba(0,0,0,.1)` / `#3a3a3c`, 14px play triangle.
- Product frame: margin-top 48px (64px from `@2xl`), max-width 1040px, `perspective: 1400px`. Window radius 18px (22px from `@2xl`), white / `#1c1c1e`, shadow `0 0 0 1px rgba(0,0,0,.07), 0 50px 100px -40px rgba(0,0,0,.4)` (dark `#3a3a3c`, `.9`). Title bar: 12px traffic lights `#ff5f57`, `#febc2e`, `#28c840`, and a centred "app.lumen.io" chip (11px, `black/4` / `white/6`). Body height 280px, 340px from `@lg`, 420px from `@3xl`.
- Dashboard (its own `@container`, bg `#fbfbfd` / `#1c1c1e`): a 180px sidebar from `@xl` (Overview active in accent at 8%/18% tint; Customers, Revenue, Reports, Settings in grey, 12px medium, radius 8px). Main: 3 KPI tiles (Revenue `$48,210`, Active users `12.4k`, Churn `1.8%`; label 11px `#86868b`, value `clamp(15px, 4.2cqi, 22px)` semibold) and a chart tile "Revenue, last 30 days" with green "+18.2%" (`#248a3d` / `#30d158`). Chart SVG viewBox 520×140, `preserveAspectRatio="none"`, path `M0 120 C 40 110, 60 70, 100 78 S 160 40, 200 52 S 260 96, 300 64 S 360 20, 420 30 S 480 46, 520 14`, accent stroke 3, `vector-effect: non-scaling-stroke`, plus a closed area fill with a vertical gradient (accent .22 → 0). Tiles: radius 12px, white / `#2c2c2e`, hairline ring.

## Motion

- Easing `[0.16, 1, 0.3, 1]` throughout.
- Pill: `opacity 0, y 10` → rest, 0.7s. Shine: `x −100 → 380`, 2.2s easeInOut, repeat forever with 2.6s delay.
- Lead words: `opacity 0, y 40, blur(12px)` → rest, 1s, delay `0.1 + k × 0.08`.
- Rotating ending: `AnimatePresence mode="popLayout" initial={false}` keyed by word. Enter from `y 100%, opacity 0, blur(8px)`, exit to `y −100%`; spring stiffness 160, damping 22, filter tween 0.35s. Reduced motion: opacity fade 0.3s.
- Sub: `opacity 0, y 14` → rest, 0.9s, delay .35. Buttons row: same, delay .5. Buttons `whileHover y −2`, `whileTap scale .96`.
- Frame: `useScroll` on the frame with offset `["start end", "center center"]`; `rotateX` 24° → 0 and `scale` 0.9 → 1, each through `useSpring` (stiffness 120, damping 22); `transform-origin: 50% 0%`. Not applied under reduced motion.
- KPI counters count from 0 when first in view: 1.8s, delay 0.6s, `en-US` formatting with fixed decimals, tabular numbers. Chart line draws `pathLength 0 → 1` 1.8s delay .6; area fades in at 1.6s over .8s.

## Interaction and states

- `pointermove` and `pointerdown` on the section set the spotlight to the pointer position relative to the section; a mouse `pointerleave` parks it at −999. Taps light the dots where you touch.
- Every button calls `preventDefault` and then `onAction` with its label.

## Autoplay demo

With `autoplay` and at least two words, advance the ending index every 2400ms, wrapping. The KPI count, chart draw and entrance animations run regardless.

## Accessibility

- The headline includes a visually hidden `words.join(" / ")`; the animated window is `aria-hidden` so screen readers do not hear the rotation.
- Background layers and the whole product frame are `aria-hidden`.
- Focus rings: 2px accent with 2px offset (black offset in dark).
- Respect `prefers-reduced-motion` for the shine, rotation style and scroll tilt.

## Acceptance checklist

- [ ] Moving the pointer lights accent dots in a 260px soft circle; leaving clears it.
- [ ] The "New" pill has a shine sweeping across every ~4.8s.
- [ ] Lead words blur up one after another; the ending rotates every 2.4s from below.
- [ ] Headline scales from 38px on phones to 96px wide.
- [ ] Product window starts tilted back ~24° and scaled .9, and straightens as it scrolls to centre.
- [ ] KPIs count up to $48,210, 12.4k and 1.8%; the chart line draws itself.
- [ ] Sidebar only appears when the window is wide enough.
- [ ] `onAction` receives "announcement", "primary" or "secondary"; nothing navigates.
- [ ] Changing `accent` recolours dots, glow, word, chart, badge and button.
- [ ] Dark mode swaps every surface and uses `accentDark`.
