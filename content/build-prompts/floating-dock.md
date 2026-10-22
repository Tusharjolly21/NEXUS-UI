Build a macOS-style floating dock for site navigation. A frosted glass shelf holds app-like tiles; as the pointer glides along, tiles swell in a smooth rounded hill and push their neighbours aside on springs, and a small dark tooltip names the tile under the pointer. Click a tile and it bounces like a launching app (real gravity, a squash each time it lands) before a running dot slides under it. Below the `md` breakpoint the dock becomes one round glass button that springs the tiles up as a vertical stack of labelled rows.

## Stack

- React client components (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`AnimatePresence`, `LayoutGroup`, `animate`, `motion`, `useMotionValue`, `useReducedMotion`, `useSpring`, `useTransform`), Next.js `Link` and `usePathname`. Icons are usually lucide-react.
- Folder `components/floating-dock/`: `types.ts` (`FloatingDockItem`), `icon-container.tsx` (`IconContainer`, `DOCK_BASE`, `DOCK_PEAK`), `floating-dock-desktop.tsx` (`FloatingDockDesktop`), `floating-dock-mobile.tsx` (`FloatingDockMobile`), `floating-dock.tsx` (`FloatingDock`, `FloatingDockProps`), and an `index.ts` re-exporting them all.

## API

`FloatingDockItem = { title: string; icon: ReactNode; href: string; tint?: string; badge?: number | string }`. `tint` is any CSS colour or gradient; with it the icon turns white.

`FloatingDock` props:

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `items` | `FloatingDockItem[]` | required | Tiles. |
| `position` | `"fixed" \| "inline"` | `"fixed"` | Fixed: desktop pinned 24px from the viewport bottom (from `md`), mobile 20px (below `md`). Inline: rendered in place, switching via `hidden md:block` / `md:hidden`. |
| `activeHref` | `string` | — | Item with the running dot. Defaults to the route match. |
| `onSelect` | `(item) => void` | — | Called on click. |
| `disableLinks` | `boolean` | `false` | Buttons instead of links. |
| `autoplay` | `boolean` | `false` | Desktop: sweeps a virtual pointer and bounces tiles until touched. |
| `desktopClassName` / `mobileClassName` | `string` | `""` | Wrapper classes. |

Route match: `/` matches only `/`; others match the exact path or any sub-path. Active = `activeHref`, else for buttons the last pick then the route, for links the route then the last pick.

## Layout and look

- Desktop shelf (`<nav aria-label="Dock">`): 62px tall, items aligned to the bottom, gap 8, padding 10px sides and 5px bottom, radius 22, 1px `white/60` border, `white/60` fill, `backdrop-blur-2xl` + `saturate-150`, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -20px rgba(0,0,0,.35)`. Dark: border `white/10`, fill `#1c1c1e` at 65%, `0 0 0 1px rgba(255,255,255,.04), 0 20px 40px -20px rgba(0,0,0,.9)`. Fixed wrapper is pointer-events none with the nav re-enabled.
- Tile column: width = tile size, items at the bottom. Tile is square at the current size, radius `0.27·size`, glyph box `0.5·size` (svg fills it, stroke 1.75).
  - Plain tile: white (dark `#2c2c2e`), `#1d1d1f` / `#f5f5f7` icon, shadow `0 0 0 1px rgba(0,0,0,.06), 0 6px 14px -8px rgba(0,0,0,.3)` (dark `rgba(255,255,255,.08)` / `.8`).
  - Tinted tile: tint fill, a top-half `white/25 → transparent` gloss, white icon, `inset 0 1px 0 rgba(255,255,255,.35), 0 6px 14px -8px rgba(0,0,0,.45)`.
  - Badge: top-right (shifted 25% right), 18px tall, min-width 18, red `#ff3b30`, 11px semibold tabular white, ring `0 0 0 2px rgba(255,255,255,.9)` (dark `#1c1c1e`); it hops with the tile.
  - Tooltip above (12px gap): radius 8, padding 4×10, 12px medium, `#1d1d1f`/90% with white text (dark `#f5f5f7`/95% with `#1d1d1f`), blur, centred.
  - Running dot: a 4px slot under the tile with a 4px `#1d1d1f` / `#f5f5f7` dot.
- Mobile button: 56px round glass (`white/75`, border `white/60`, blur-xl, shadow `0 0 0 1px rgba(0,0,0,.05), 0 16px 32px -14px rgba(0,0,0,.45)`; dark `#1c1c1e`/80, border `white/10`). Icon: a 20px box with four 7px rounded squares (radius 2.5) at (2,2), (11,2), (2,11), (11,11), and two hidden 18×2 bars for an X.
- Mobile rows (stacked 12px above the button, gap 8): radius 18, padding 6px left / 16px right, `white/80` blur-xl, 15px medium, tracking −0.01em, shadow `0 0 0 1px rgba(0,0,0,.04), 0 12px 24px -14px rgba(0,0,0,.4)` (dark `#1c1c1e`/85). A 36px icon square (radius 10, 18px icon, tint or `#f0f0f3` / `#2c2c2e`), the title, and a 6px blue dot (`#0071e3` / `#0a84ff`) at the end when active. In fixed mode a full-screen `black/25` backdrop with 2px blur closes it.

## Motion

- Magnification: pointer x (Infinity when away). Per tile, `d = |x − tileCentre|`, `t = max(0, 1 − d/150)`, `target = 44 + (70 − 44)·(0.5 − 0.5·cos(π·t))`. Size through `useSpring(stiffness 420, damping 30, mass 0.12)`; the real width changes so neighbours make room. Only mouse pointers drive it; keyboard focus sets x to the focused tile's centre.
- Entrance: shelf from `y 24, opacity 0`, spring 260/22.
- Launch bounce (hand-integrated in rAF, dt ≤ 0.032): start `v = −620` px/s, gravity 2900 px/s². On landing (y ≥ 0): `squash.jump(min(1, |v|/650))` then `squash.set(0)` (spring 700/11), and `v = −0.42·v`. Stop when `|v| < 140` or after 3 landings. Squash maps to `scaleY = 1 − 0.22q`, `scaleX = 1 + 0.16q`, origin bottom.
- Tooltip: from `opacity 0, y 6, scale 0.9`, exit `y 4, scale 0.95`, spring 500/30.
- Running dot: shared `layoutId` inside a `LayoutGroup` (id from `useId`), spring 500/32, so it slides between tiles.
- Mobile rows: each enters from `opacity 0, y 24 + 10·fromBottom, scale 0.6`, spring 520/26 with delay `0.035·fromBottom` (bottom row first); exit to `y 16 + 6·fromBottom, scale 0.7` in 0.16s with delay `0.015·i`. Button icon: squares fly to the centre and vanish (x ±4.5, y ±4.5, scale 0) while the bars rotate to ±45° and scale in (spring 420/18); closing restores squares staggered 0.04s. Button `whileTap` 0.9.
- Reduced motion: no magnification, entrance, bounce; mobile rows fade only.

## Interaction and states

- Desktop: pointer leave or focus leaving the nav resets x to Infinity. Click or Enter activates: bounce, mark picked, `onSelect`.
- Mobile: the button toggles (`aria-expanded`, `aria-controls`); Escape closes and refocuses the button; picking a row closes it.

## Autoplay demo

Desktop only, after 700ms: animate a virtual x across the shelf (18px inset each side) over 2.4s with ease `[0.45, 0, 0.55, 1]`, alternating direction; at the end reset x, pick and bounce item `(3k + 1) mod n`, wait 1.6s, repeat. Any pointer move or focus stops it. Demo: Finder, Safari, Messages (badge 3), Mail, Music, Photos, Calendar (plain), Settings, tinted with 160° gradients, on a soft wallpaper card.

## Accessibility

- Each tile is a link (`aria-current="page"` when active) or button (`aria-pressed`) labelled with its title; tooltips have `role="tooltip"`; the badge reads "{n} new". Focus rings 2px `#0071e3` (dark `#0a84ff`) with 2px offset. Mobile nav labelled "Site navigation"; button "Open navigation" / "Close navigation".

## Sound

`FloatingDock` (and `FloatingDockDesktop` / `FloatingDockMobile`) take `enableSound?: boolean` (default `true`; `false` silences it). Pressing a dock tile, by click or keyboard, plays `pop` from `@/lib/ui-sounds` (a short sine glide from about 320 Hz up to 980 Hz in 70ms, soft and round). On the mobile stack the same `pop` plays when a row is chosen, and the round menu button plus its backdrop and Escape play a quiet `tap` (60% volume; a dry click, a sine dropping from 900 to 620 Hz in 60ms). Pointer magnification, tooltips and the autoplay sweep itself are silent. When the autoplay sweep ends and it bounces a tile, that plays the same `pop` as a press, through the same play function's `auto` variant, which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Still silent on hover. The sounds follow the site-wide switch (`setSoundsEnabled`, on by default in installed apps). No audio files: they are Web Audio synthesis from one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

## Acceptance checklist

- Gliding over the dock swells tiles in a smooth hill up to 70px while neighbours shift aside.
- A tooltip shows the hovered or focused tile's title.
- Clicking bounces the tile with squashes on landing and moves the running dot.
- Tinted tiles show white icons and gloss; badges hop with tiles.
- Below `md` a single glass button opens a springy stack of rows; Escape or the backdrop closes it.
- Autoplay sweeps and bounces until the first touch.
- Reduced motion keeps tiles at 44px with no bounce.
