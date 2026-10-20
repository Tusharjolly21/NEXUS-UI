# Magnify Dock

Build a macOS-style app dock: a frosted glass bar of rounded-square app icons that swell smoothly as the pointer passes near them (neighbours grow a little, the one under the pointer the most), show a small label above while hovered, bounce when clicked, and keep a running dot underneath once launched. It should feel exactly like the Mac dock: fluid, springy, with icons growing upward out of the bar.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useTransform`).
- File: `components/magnify-dock/magnify-dock.tsx`, named export `MagnifyDock`; export `MagnifyDockProps` and `DockApp`.

## API

```ts
interface DockApp { id: string; label: string; bg: string /* any CSS background */; glyph: ReactNode }
```

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `apps` | `DockApp[]` | seven built-in apps | Icons in order. |
| `autoplay` | `boolean` | `false` | Sweeps an invisible pointer across the dock while nobody is hovering it. |

Default apps (label, background), each with a white line glyph at 56% of the icon size (stroke 1.9, round caps/joins):
Home `linear-gradient(180deg,#5ac8fa,#007aff)` (house); Mail `linear-gradient(180deg,#64d2ff,#0a84ff)` (envelope); Notes `linear-gradient(180deg,#ffe066,#ffcc00)` (three lines); Music `linear-gradient(180deg,#ff6482,#ff2d55)` (note); Photos `conic-gradient(from 0deg,#ff9f0a,#ffd60a,#30d158,#64d2ff,#bf5af2,#ff375f,#ff9f0a)` (circle); Maps `linear-gradient(180deg,#7ee08f,#34c759)` (pin); Settings `linear-gradient(180deg,#aeaeb2,#636366)` (gear).

## Layout and look

- Outer wrapper: 150px tall, content aligned to the bottom and centred, leaving headroom for magnified icons and labels.
- Bar: 66px tall, items aligned to the bottom, 10px gap, 10px horizontal padding, 6px bottom padding, radius 22px, `backdrop-blur-2xl`. Light: white/70%, shadow `0 0 0 1px rgba(0,0,0,.06), 0 20px 40px -20px rgba(0,0,0,.35)`. Dark: `#2c2c2e`/70%, shadow `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -20px rgba(0,0,0,.7)`. The bar does not clip; enlarged icons rise above it.
- Each slot: a vertical column (icon, then dot), `position: relative`.
- Icon: a button sized by a motion value (base 46px), radius 22% (a squircle-ish square), background = `bg`, glyph centred, shadow `inset 0 1px 0 rgba(255,255,255,.35), 0 6px 14px -6px rgba(0,0,0,.4)`.
- Running dot: 4px circle, 4px below the icon, `#1d1d1f` / dark `#f5f5f7`.
- Label: absolutely 40px above the slot top, no wrap, radius 8px, padding 4px × 10px, 12px medium, `backdrop-blur-md`. Light: white/90%, `#1d1d1f`, shadow `0 0 0 1px rgba(0,0,0,.06), 0 6px 16px -6px rgba(0,0,0,.3)`. Dark: `#2c2c2e`/90%, `#f5f5f7`, shadow `0 0 0 1px rgba(255,255,255,.08)`. Non-interactive.

## Motion

- One shared motion value `mouseX` (pointer `clientX`), starting at `Infinity` (meaning "no pointer").
- Per icon: `distance = mouseX − (icon's bounding-rect centre x)` (Infinity if not measured). Map distance `[−150, 0, 150] → [46, 76, 46]` px (clamped, so anything farther than 150px stays at 46). Smooth it with `useSpring(…, { stiffness: 320, damping: 22, mass: 0.2 })` and bind it to both `width` and `height`. This gives a smooth bell-shaped magnification with neighbours partially enlarged and a light, quick spring.
- Because the bar aligns items to the bottom, growing icons push upward and sideways, like the real dock.
- Label: enters from `opacity 0, y 6, scale 0.9` to rest (default spring), exits to `opacity 0, y 4, scale 0.95` in 0.1s.
- Launch bounce: on click, remount the glyph wrapper (key = bounce counter) and animate its `y` through `[0, −22, 0, −10, 0]` over 0.9s, easeOut — one big hop and a smaller one. Don't animate on initial mount.
- Running dot: animates `opacity` to 0.7 and `scale` to 1 when running, 0 and 0 otherwise (`initial={false}`).
- Autoplay sweep: `animate(mouseX, [barLeft − 40, barRight + 40], { duration: 2.6, ease: "easeInOut" })`, then set `mouseX` back to Infinity when it finishes (unless the user is hovering).

## Interaction and states

- Pointer move on the bar sets `mouseX` to `clientX` and marks it hovering; pointer leave sets `mouseX` to Infinity and clears hovering, so every icon springs back to 46px.
- Hover or keyboard focus on an icon shows its label; leave or blur hides it.
- Click: bounce the glyph and add the app to the running list (once). Home starts running.

## Autoplay demo

When `autoplay` is true: run a sweep 700ms after mount and then every 4200ms, skipping any sweep while the user is hovering the bar. Hovering doesn't stop autoplay permanently; sweeps resume after the pointer leaves. Stop any running sweep animation on unmount.

## Accessibility

- The bar is `role="toolbar"` with `aria-label="Dock"`.
- Each icon is a `type="button"` with `aria-label` = app label and a 2px `#0071e3` focus-visible outline, offset 2px. Focusing an icon shows its label (magnification is pointer-only).
- Glyph SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Seven 46px icons sit in a frosted bar with a dot under Home.
- [ ] Moving the pointer along the bar enlarges the nearest icon to about 76px and its neighbours progressively less, with no jitter.
- [ ] Icons grow upward out of the bar and push their neighbours apart.
- [ ] Leaving the bar springs all icons back to 46px.
- [ ] Hovering or tabbing to an icon shows its label above.
- [ ] Clicking an icon makes it hop twice and adds a running dot under it.
- [ ] With `autoplay`, an invisible pointer sweeps across every 4.2s, pausing while you hover.
- [ ] Dark mode uses the dark bar, label and dot colours.
