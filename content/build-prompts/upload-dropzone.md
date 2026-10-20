Build a file drop target with an upload list underneath. While a file hovers, a little stack of three paper sheets fans out like a hand of cards over a blue tray, the zone grows slightly, tints and its dashed edge starts marching. When files land, the tray squashes as it "swallows" them. Each file gets a row with a coloured file glyph, a progress ring that fills and turns into a drawn green check, and a remove button. Rejected files shake the zone and show a red row. Friendly Apple-light.

## Stack

- React client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useSpring`, `useTransform`, `useReducedMotion`), React `useId`, and a `cn` class-merge helper.
- File: `components/upload-dropzone/upload-dropzone.tsx`, named exports `UploadDropzone` and `formatBytes`, exported types `UploadDropzoneProps`, `DropzoneItem` (`{ id, name, size, type, progress 0–1, status, error?, file? }`) and `DropzoneItemStatus` (`"uploading" | "done" | "error"`).

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accept` | `string` | – | Input `accept` syntax, e.g. `"image/*,.pdf"`. |
| `maxSize` | `number` | `5242880` | Max bytes (5 MB). |
| `multiple` | `boolean` | `true` | Several files at once; when false a new file replaces the list. |
| `onFiles` | `(files: File[]) => void` | – | Each batch of accepted files. |
| `onUpload` | `(file, setProgress) => Promise<void>` | simulated | Report 0–1; reject marks the row failed. |
| `initialFiles` | `{ name; size; type?; progress? }[]` | – | Shown on first render; unfinished ones keep uploading (simulated). |
| `title` | `string` | `"Drag a file here"` | Main line. |
| `hint` | `string` | `"Up to {maxSize}"` | Secondary line. |
| `accent` | `string` | `#0071e3` (dark `#0a84ff`) | Tray, marching edge, drag tint (`--dz-accent`). |
| `autoplay` | `boolean` | `false` | Drops example files until touched. |
| `disabled` | `boolean` | `false` | 50% opacity, ignores drops/clicks. |
| `className` | `string` | – | Wrapper classes. |

`formatBytes`: `< 1024` → "N B"; `< 1 MB` → rounded "N KB"; else MB with one decimal below 10 MB (trailing ".0" removed), none above. Accept matching: rules starting with "." match the name ending; "type/*" matches the type prefix; else exact type.

## Layout and look

- Wrapper: column, full width, max 340px, gap 10.
- Zone: a role-button, full width, column-centred, radius 24, padding 28 24 24, `overflow: hidden`, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)`; dark `#1c1c1e`, `0 0 0 1px rgba(255,255,255,.08), 0 20px 40px -26px rgba(0,0,0,.9)`. Focus ring 2px blue, offset 2 on `#f5f5f7` (dark black). Wrapped in a motion div used for the shake.
- Dashed edge: an SVG inset 7px with a rect (rx 17, stroke 1.5, dash `6 6`, no fill) in `#d2d2d7` (dark `#48484a`), accent while dragging. A full-size accent overlay fades to 6% opacity while dragging.
- Illustration (84×58, 8px below margin): three 27×34 sheets, radius 6, sitting 14px above the bottom, with a hairline + `0 4px 10px -4px rgba(0,0,0,.3)` shadow. Left sheet `#e8f1fe` (dark `#0a2b4d`), right `#fff3e0` (dark `#3a2405`), front white (dark `#3a3a3c`) with three 2px grey text lines (`#d2d2d7`, dark `#636366`) at 8, 13, 18px, the last shorter. Tray: 72×22, bottom-centred, radius 4 top / 12 bottom, accent, inner highlight `inset 0 1px 0 rgba(255,255,255,.25)`, with a 3px white-70% slot line 22px in from each side at top 7px.
- Text: title 15px semibold tracking −0.01em `#1d1d1f` (dark `#f5f5f7`), switching to "Drop to upload" while dragging; below it 12px `#6e6e73` (dark `#a1a1a6`): "{hint} · browse" with "browse" medium `#0066cc` (dark `#2997ff`).
- Rows (`ul`, gap 6): radius 18, padding 8 8 8 14, gap 12, white, shadow `0 0 0 1px rgba(0,0,0,.05), 0 8px 20px -16px rgba(0,0,0,.35)` (dark white 8% ring). Error rows use a red ring `rgba(255,59,48,.45)` (dark `rgba(255,69,58,.5)`).
  - File glyph 32×40: a dog-eared page (`#f5f5f7`, dark `#2c2c2e`, 1.2px 10% stroke) and an extension badge (first 4 chars of the extension or subtype, uppercase) at left −6px, bottom 7px: 8px bold white, radius 5, coloured: images/CSV `#248a3d`, SVG `#0e7c86`, video/KEY `#0071e3`, audio/FIG `#8944ab`, PDF `#d70015`, ZIP `#b25000`, DOC(X) `#0040dd`, others `#6e6e73`.
  - Name 13px medium truncated; meta 11.5px tabular grey: "1.2 MB of 2.4 MB" while uploading, size when done, red error text (`#d70015`, dark `#ff6961`) on error ("Over 5 MB" / "Not supported" / "Upload failed").
  - Status 24px: ring r 8.5 rotated −90°, track `#e5e5ea` (dark `#3a3a3c`), progress stroke 2.6 round in blue; done = green `#30d158` disc with white check (stroke 2.4); error = red `#ff3b30` disc with a white "!".
  - Remove: 28px round button, 10px × icon (stroke 1.6), grey, hover `#f0f0f3` (dark `#2c2c2e`).

## Motion

- Fan (while dragging or hovering, not reduced): left sheet rotate −6° → −18°, x −58% → −95%, y 0 → −6; right sheet 6° → 18°, x −42% → −5%, y −6; front sheet y 0 → −14. Spring 420/18, origin bottom.
- Swallow: `gulp` set to 1 then animated to 0 (spring 300/12); the tray uses `useSpring(gulp, 600/14)` → `scaleX = 1 + 0.16g`, `scaleY = 1 − 0.2g`, origin bottom.
- Zone scales to 1.02 while dragging (spring 420/24). Marching edge: `strokeDashoffset` 0 → −24 linear 0.6s, repeating; back to 0 in 0.2s.
- Reject shake: x `[0, −9, 8, −6, 5, −2, 0]` over 0.45s.
- Rows: `AnimatePresence mode="popLayout"` with `layout`; enter from `opacity 0, y −14, scale 0.94`, spring 420/30; exit `opacity 0, scale 0.94` in 0.16s.
- Progress ring: `strokeDashoffset = c × (1 − progress)` (c = 2π·8.5), spring 140/22; it exits with scale 0.6 + fade. Done/error icons pop from scale 0.4 (spring 520/15); the check draws `pathLength 0 → 1`, spring 240/22, delay 0.06.
- Simulated upload: every 130ms `p += speed × (0.5 + random)` with `speed = clamp(380000/size, 0.07, 0.2)`.

## Interaction and states

- Click or Enter/Space opens the hidden file input (reset its value after change). Drag enter/leave use a depth counter so child elements don't flicker the state; dragover sets `dropEffect = "copy"`; drop adds files.
- Adding: slice to one file when not `multiple`; validate size and type; append rows; start uploads for valid ones; call `onFiles` with accepted ones and swallow; shake if any rejected and announce their errors.
- Any pointer down, key or drag enter on the wrapper marks it touched. Track mounted state so late progress callbacks after unmount are ignored.
- Reduced motion: no fan, no swallow, no scale, no marching, no shake; rows only fade; check appears drawn.

## Autoplay demo

Every 2.9s until touched: set dragging on and fly a file glyph into the zone (from `y −46, rotate −14°` to `y 44, rotate 4°`, spring 90/13, opacity `[0,1,1,0]` at times `[0,.2,.75,1]` over 0.9s, scale `[1,1,0.7]`). After 900ms stop dragging, add the file (keeping only the last three rows), start a simulated upload and swallow. Files cycle: "Keynote draft.pdf" 2.4 MB, "Cover shot.png" 1.24 MB, "Launch film.mp4" 4.6 MB, "Q3 numbers.csv" 84 KB.

## Accessibility

- Zone `role="button"`, focusable (`−1` when disabled), `aria-disabled`, label "{title}. {hint}. Or press Enter to browse." The list is labelled "Files"; remove buttons "Remove {name}". A polite sr-only region announces "{name} uploaded", "{name} failed to upload" and rejection reasons. Decorative SVGs are `aria-hidden`.

## Acceptance checklist

- Hovering or dragging over the zone fans the sheets; dragging also marches the blue dashed edge, tints the zone and shows "Drop to upload".
- Dropping valid files squashes the tray and adds rows that fill their rings and turn into green checks.
- A file over the size limit or of the wrong type shakes the zone and shows a red row with the reason.
- Remove deletes a row with a quick fade; remaining rows slide up.
- `onUpload` progress drives the ring; a rejection shows "Upload failed".
- Autoplay flies four example files in a loop and stops on first touch.
- Dark mode recolours zone, sheets, rows and glyphs.
