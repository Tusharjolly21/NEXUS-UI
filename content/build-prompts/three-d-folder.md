Build a folder card that swings open when you hover, focus or tap it. The front flap falls forward on a loose spring and up to three papers fan up out of the folder, each settling with a wobble. Picking a paper grows its cover into a preview dialog you can page through with the arrow keys. 

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `LayoutGroup`, `useReducedMotion`), `createPortal` from react-dom.
- File: `components/three-d-folder/three-d-folder.tsx`. Named export `ThreeDFolder` (also default), types `FolderProject` and `ThreeDFolderProps`.

## API

`FolderProject = { id: string; title: string; image?: string; bg?: string; meta?: string; href?: string }`. `image` is a cover photo URL; without it a drawn cover on `bg` (CSS background, default `linear-gradient(160deg,#d2d2d7,#86868b)`) is used. `meta` is the preview subtitle. `href` adds an Open link.

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | `string` | `"Design Archive"` | Label under the folder and on the flap. |
| `projects` | `FolderProject[]` | 3 samples | First three are papers; the preview pages through all. |
| `folderBackColor` | `string` | `"#3d9cf0"` | Back panel. |
| `folderFrontColor` | `string` | `"#6cb8f6"` | Front flap. |
| `folderTabColor` | `string` | back colour | Tab. |
| `size` | `"sm" \| "md"` | `"md"` | `"sm"` draws at 0.62. |
| `onOpenProject` | `(id: string \| null) => void` | – | Id on open or paging, `null` on close. |
| `hint` | `string` | `"Hover or tap the folder."` | `md` only; `""` hides it. |
| `autoplay` | `boolean` | `false` | Opens and closes until touched. |
| `className` | `string` | – | Card classes. |

## Layout and look

- `u` is 1 for `md`, 0.62 for `sm`. The stage is `200u` by `150u` with `perspective: 700u`; every px size below is times `u`.
- Card: rounded 24, white (dark `#1c1c1e`), text `#1d1d1f` (dark `#f5f5f7`), shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)` (dark `rgba(255,255,255,.08)`, `rgba(0,0,0,.9)`). `md`: 300 wide, padding 24 with 92 on top. `sm`: 168 wide, `px-3 pb-4 pt-16`.
- Shadow ellipse: 0.9 of stage width, 16 tall, 10px blur, `black/25` (dark `black/60`), bottom -10.
- Back panel: 136 tall, radius 14, `folderBackColor`, tab 74 by 22 at top -14, left 14, radius `10 10 0 0`.
- Papers: 92 by 118, centred, bottom 8, middle one on top. Button: white (dark `#2c2c2e`), padding 5, radius 12, shadow `0 8px 18px -8px rgba(0,0,0,.4)`. Cover 72% of the height, radius 8; title semibold `max(9, 12u)` px, truncated.
- Drawn cover: two white pills top left, two soft white circles off the bottom right, and a vertical sheen.
- Front flap: 116 tall, radius 14, `folderFrontColor`, top highlight and diagonal sheen, a 1px `white/70` top edge, title uppercase semibold `max(8, 10u)` px, tracking 0.24em, `white/85`, 14% from the bottom.
- Below: title 17px (`sm` 14px) semibold, "N project(s)" 12px `#6e6e73` (dark `#a1a1a6`), hint 12px `#86868b` (dark `#98989d`).

## Motion

- Flap spring stiffness 240, damping 13 (reduced motion 500 and 50). Flap `rotateX` 0 to -34 from the bottom edge; back panel `rotateX` 0 to 8; shadow `scaleX` 0.94 to 1.08, opacity 0.6 to 0.9.
- Papers spring 210, 11, mass 0.9 (reduced 500 and 50), `initial={false}`. Open: (x, y, rotate) of (-84, -62, -14), (0, -92, 0), (84, -62, 14), scale 1, delay `0.05 + i * 0.05`. Closed: x -7, 0, 7, y 0, rotate -4, 0, 4, scale 0.94, delay `(count - 1 - i) * 0.03`. One paper takes the centre slot; two take left and right.
- Paper hover `y -10`, scale 1.05; tap 0.96; spring 400 and 20.
- Preview dialog from `y 24, scale 0.96` to rest, exit adds opacity 0, spring 300 and 26. The cover has `layoutId` `cover-<id>` in a per-instance `LayoutGroup`, so it grows out of the paper, which shows a flat `#f0f0f3` (dark `#3a3a3c`) block meanwhile.

## Interaction and states

- Mouse enter opens and leave closes (touch and pen ignored). Clicking the flap toggles, focusing a paper opens, focus leaving the card closes. Open means `open` or a preview showing.
- Preview: portalled to `document.body` after mount. Fixed, `z-[100]`, `bg-black/45`, `backdrop-blur-md`, padding 16 (32 at the `sm` breakpoint). Dialog max 560 wide, radius 24, white (dark `#1c1c1e`), shadow `0 40px 80px -30px rgba(0,0,0,.6)`. Cover 16/10. Footer padding 20: title 20px semibold, meta (else "2 of 3") 13px, 36px round chevron buttons (over one project), an Open pill (`#0071e3`, dark `#0a84ff`, new tab) with `href`, and a 32px close button top right (`black/35`, white X).
- Escape, backdrop click or close dismiss. Left and right arrows page with wraparound. Body scroll locks; focus goes to close, then back to the paper that opened it.

## Autoplay demo

Every 2200ms toggle `open`. A mouse enter, pointer down, click or focus sets a `touched` ref; the next tick clears the interval for good.

## Accessibility

- Flap labelled "<title>, N projects" with `aria-expanded`; papers "Preview <title>"; dialog `role="dialog"`, `aria-modal`, labelled by the project title; buttons Previous project, Next project, Close preview.
- Focus rings 2px `#0071e3` (dark `#0a84ff`); close uses white.

## Acceptance checklist

- [ ] Hover, focus or tap swings the flap and fans the papers with overshoot; leaving closes.
- [ ] A paper grows into the preview and shrinks back.
- [ ] Arrows page, Escape closes, focus returns.
- [ ] `size="sm"` is 168 wide with no hint.
- [ ] Reduced motion uses stiff springs.

## Examples on the page

- Single folder: `title="Selected work"`, three projects (Atlas and Signal with `bg`, Prism with `image`, Atlas and Prism with `href`), `folderBackColor="#3d9cf0"`, `folderFrontColor="#6cb8f6"`, and an `onOpenProject` that logs the id.
- Compact grid: a centred wrapping row of three folders, each `size="sm"` with its own `title` and colour pair (Brand blue `#3d9cf0`/`#6cb8f6`, Photos orange `#ff9f0a`/`#ffbf4d`, Product green `#30b65a`/`#5fd47f`) over the default projects.
