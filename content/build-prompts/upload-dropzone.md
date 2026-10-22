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


## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Dropping or choosing files that are accepted plays `drop` from `@/lib/ui-sounds` (a short low thump falling in pitch, with a soft landing hiss) as the tray squashes. If any file is rejected for size or type, `error` plays instead (two low square-wave bumps) as the zone shakes. When a file you added finishes uploading, `done` plays (four soft triangle notes in a rising major chord, ringing together); a rejected upload promise plays `error`.
- The autoplay example files play the same sounds: `drop` as each lands in the tray and `done` when it finishes uploading, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Files passed in through `initialFiles`, hovering and dragging over the zone are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- Upload Dropzone: Motion Kit variant brief -->

> The Upload Dropzone page now has 3 parts: the original Upload Dropzone (above) plus 2 Motion Kit variants, Avatar Upload and Upload Queue. The original source is on the page; the briefs below rebuild the two variants. Neither variant uploads anywhere: progress is simulated and every callback is optional.

---

<!-- variant: avatar-upload -->

# Avatar Upload

Build a profile photo picker that does the whole job: drop or choose an image, drag it around inside a circle and zoom to frame it, press Save, and a ring draws itself around the avatar as it "uploads" before a green check pops in. Dragging a file over the avatar makes it reach out for it. Apple-light and friendly.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `animate`, `useMotionValue`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/upload-dropzone/avatar-upload.tsx`. Named export `AvatarUpload`, exported types `AvatarUploadProps` and `AvatarUploadResult`.

## API

- `onUpload?: (result: { file: File | null; src: string; zoom: number; x: number; y: number }) => void`: fired when the simulated upload completes after a real Save. `src` is an object URL that is revoked on unmount or when the photo is replaced. `file` is null only for the built-in demo photo, which never fires this callback.
- `onRemove?: () => void`: after Remove or Cancel from a real interaction.
- `autoplay?: boolean`, default `false`.
- `className?: string`.
- Nothing is sent over the network. The simulated upload only animates.

## Layout and look

- Card: width 380px, `max-width: 100%`, column, centred, radius 28px, white, padding 28px top / 24px bottom / 20px sides (24px from 640px up), the usual hairline and soft shadow; dark `#1c1c1e` with a white 8% ring.
- Title "Profile photo" (19px semibold, tracking -0.02em). Under it a 13px muted line, centred: "PNG or JPG, drop it on the circle", or "Drag to reposition, slide to zoom" while cropping, or a red message ("That file is not an image. Try a PNG or JPG.") after a rejected drop. Muted is `#6e6e73` (dark `#a1a1a6`), error `#d70015` (dark `#ff453a`).
- Avatar stage: 24px below the text, a 172x172 box (diameter 148 plus 12px padding all round), `max-width: 100%`. Inside: an SVG ring layer and a 148px circular button at 12px inset, radius full, `#f5f5f7` (dark `#2c2c2e`), `overflow: hidden`.
- Ring: radius 82 (148/2 + 8), stroke width 4, round caps, rotated -90 degrees so it starts at the top. Track stroke `#ececf0` (dark `#3a3a3c`), visible only while uploading and done. Progress stroke `#0071e3` (dark `#0a84ff`), turning `#34c759` (dark `#30d158`) when done, using a 300ms CSS stroke transition on class names. `pathLength` is a motion value 0 to 1. The ring's opacity is 1 while uploading or done, 0 otherwise.
- Drag-over dashed ring: radius 82, stroke 2.5, dash `6 8`, blue, rotating 360 degrees every 6s linear, forever.
- Empty circle content: initials "MC" (34px semibold, tracking -0.02em, `#c7c7cc`, dark `#48484a`) over a 12px medium line with a camera glyph (13px) and "Add photo" in muted colour.
- Photo: an `img`, `object-fit: cover`, square of `148 * zoom` pixels centred in the circle, absolutely positioned, draggable with framer-motion `drag`, `dragConstraints` of plus/minus `(148 * zoom - 148) / 2` on both axes, `dragElastic .15`. `x` and `y` are motion values clamped again whenever the zoom shrinks.
- Thirds grid: while dragging, a white 60% 1px two-by-two grid overlay fades in over the circle.
- Drop overlay on the circle: `#0071e3` at 15% (dark `#0a84ff` at 20%) fill, `backdrop-blur 2px`, text "Drop to use" 13px semibold in the accent colour.
- Done badge: 36px green circle at bottom-right (12px inset) with a 4px ring in the card colour (white, dark `#1c1c1e`) and a white 18px check (stroke 3).
- Controls area: 20px below the stage, fixed 84px high, centred, swapped with `AnimatePresence mode="wait"`:
  - Empty: a "Choose photo" pill, 36px high, `#1d1d1f` background, white 13px medium text, padding-x 20px (dark: `#f5f5f7` background, `#1d1d1f` text).
  - Crop: a zoom slider row (max 260px wide): a 12px small square glyph, a native range input 1 to 3, step .01, `accent-color #1d1d1f` (dark `#f5f5f7`), and a 18px large square glyph, plus a "Cancel" pill (white, hairline ring; dark `#3a3a3c`) and a "Save" pill (primary) 8px apart.
  - Uploading: "Uploading…" in 13px muted.
  - Done: "Change" pill (secondary) and "Remove" text button in red (`#d70015`, dark `#ff453a`, hover tint).

## Motion

- Phases: `empty`, `crop`, `uploading`, `done`.
- The whole stage scales to 1.06 while a file is over the card (spring stiffness 400, damping 20).
- New photo enters with `opacity 0, scale 1.15, blur 10px` to `1, 1, 0` over 450ms, ease `[.2,0,0,1]`; exits with an opacity fade. Default zoom 1.2, position 0,0.
- Save: ring motion value animates 0 to 1 over 1.8s with ease `[.4,0,.2,1]`; on complete the phase becomes `done`, the badge springs in from `scale 0, rotate -60` (stiffness 500, damping 16) and its check draws after 150ms.
- Arrow keys on the focused circle nudge the photo 8px (crop phase only), clamped to the same limits.
- Reduced motion: no stage scale, no blur-in, no dashed ring rotation, no badge spin, the ring fills over 0.4s, check shown drawn, autoplay off.

## Interaction and states

- Choose: the circle (empty and done phases) and the "Choose photo" and "Change" buttons open a hidden `input type="file" accept="image/*"` (hidden from assistive tech; the buttons are the entry points).
- Drop: a depth counter on dragenter and dragleave stops flicker over child elements. A dropped or chosen non-image shows the red message and changes nothing.
- A new file replaces the old one: the previous object URL is revoked first, and the new one is created with `URL.createObjectURL`. The current object URL is also revoked on Cancel/Remove and on unmount. Running animations are stopped on reset and unmount so a stale completion cannot flip the phase.
- Cancel and Remove return to `empty`. Save runs the simulated ring; only after the ring completes does a real Save call `onUpload`.
- The demo draws its own landscape photo on a 600x600 canvas (sky gradient `#ffb38a` to `#ffd9b8` to `#f6efe6`, a `#fff6e8` sun, three sine-wave hills in `#d9826b`, `#a8525a`, `#5e2f45`) and uses its data URL; it is made once, inside the demo timers.

## Autoplay demo

Loop of 8600ms while running: reset at 0, show the drag-over state at 700ms, load the demo photo at 1600ms (clears over state), spring the photo to x -18, y 14 at 2300ms (stiffness 120, damping 16), zoom to 1.6 at 3000ms, Save at 3900ms (no callback), reset at 8200ms, restart at 8600ms. It runs only while `autoplay` is on, the card is at least 20% visible, the tab is visible, reduced motion is off and nothing has been pressed, dropped or dragged on the card. Pointer down or a drag enter ends it for good. All timers are cleared on stop and unmount.

## Accessibility

- The circle is a real `button`. Its label is "Choose a profile photo" when empty, "Photo frame. Drag, or use the arrow keys, to reposition." while cropping, and "Profile photo" otherwise. The zoom range has a screen-reader-only "Zoom" label.
- A polite `role="status"` region says "Uploading photo", "Photo added. Drag or use the arrow keys to reposition, then save.", "Photo saved." and "Photo removed.".
- Focus ring: 2px outline `#0071e3` (dark `#0a84ff`), 2px offset, on every control. Decorative SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Dragging an image over the card scales the avatar, rotates a dashed ring and shows "Drop to use".
- [ ] A dropped or chosen image blurs in; dragging moves it inside the circle without leaving gaps at any zoom; the slider and arrow keys frame it.
- [ ] Save draws the ring over 1.8s, then the ring turns green and the badge pops in with a drawn check.
- [ ] Change swaps the photo and revokes the old object URL; Remove returns to the empty state.
- [ ] A non-image shows the red message.
- [ ] No network calls anywhere; `onUpload` is optional.
- [ ] Autoplay runs the whole story with a drawn demo photo, pauses off screen and in hidden tabs, stops for good on the first touch.
- [ ] Fits at 320px wide; dark mode recolours card, ring, badge and buttons.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Dropping or choosing an image plays `drop` from `@/lib/ui-sounds` (a short low thump falling in pitch, with a soft landing hiss) as the photo appears in the circle. Choosing something that is not an image plays `error` (two low square-wave bumps). When the Save ring finishes and the check pops in, `done` plays (four soft triangle notes in a rising major chord, ringing together).
- The autoplay demo plays the same sounds: `drop` as its photo appears in the circle and `done` when its save finishes, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Dragging over the circle, repositioning and zooming are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.

---

<!-- variant: upload-queue -->

# Upload Queue

Build an upload list where each row is its own progress bar. The row fills left to right as the file "goes up", with the size and time left counting along. Pause turns the fill into moving stripes, cancel folds the row away, finishing fades the fill into a green check. Dragging files over the card says how many it is about to take. The transfer is simulated: file contents are never read or sent, and no object URLs are needed.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`, `useReducedMotion`), `cn` from `@/lib/utils`.
- File: `components/upload-dropzone/upload-queue.tsx`. Named export `UploadQueue`, exported type `UploadQueueProps`.

## API

- `onFiles?: (files: File[]) => void`: the real files dropped or chosen (names and sizes are listed; contents are never read).
- `onComplete?: (name: string) => void`: once per row when its simulated transfer ends.
- `onCancel?: (name: string) => void`.
- `autoplay?: boolean`, default `false`.
- `className?: string`.

## Layout and look

- Card: width 460px, `max-width: 100%`, relative, `overflow: hidden`, radius 28px, white, padding 16px (20px from 640px up), the usual hairline and soft shadow; dark `#1c1c1e` with a white 8% ring.
- Header: space-between, 12px gap. Left: title "Assets" (17px semibold) and a 13px tabular-nums muted line (`#6e6e73`, dark `#a1a1a6`) reading "{sent} of {total}" (for example "12.3 MB of 79.1 MB") or "Drop files anywhere on this card" when the list is empty. Right: an "Upload" pill, 36px high, `#1d1d1f` with white 13px medium text (dark `#f5f5f7` with `#1d1d1f` text) that opens a hidden multiple-file input.
- List: 16px below the header, `ul`, no bullets, column, 8px gap, minimum height 200px.
- Empty state: a 200px high dashed box (radius 16px, 1px dashed `#d2d2d7`, dark `#3a3a3c`), a 22px upload glyph and "Nothing uploading" in 13px muted.
- Row (`li`): relative, `overflow: hidden`, radius 16px, `#f5f5f7` (dark `#2c2c2e`), 60px high. Layers:
  - Fill: absolutely positioned, `inset-y 0`, left 0, width equal to the progress percentage, tinted with the file-type colour at 12% (dark 22%). Paused: a 45 degree stripe pattern in 20px tiles alternating the type colour at 18% and 7% (dark 32% and 12%), background position sliding 20px every second, linear, forever. Colours come from a `--nx-uq-c` CSS variable on the row, mixed with `color-mix`.
  - Content row (relative, 60px high, padding-x 12px, 12px gap): a file glyph 32x36px with radius 7px and the type colour, clipped by `polygon(0 0, 70% 0, 100% 26%, 100% 100%, 0 100%)` so the top-right corner is folded, with the extension in 8.5px bold uppercase white, bottom aligned; then a text column (name 14px medium truncating, `#1d1d1f` / dark `#f5f5f7`; below it a 12px tabular-nums muted line); then controls.
  - Status line: uploading "{done} of {size} · {n}s left" (n = max(1, round(remaining bytes / speed))); paused "Paused · {percent}%"; done: the size.
  - Controls: two 32px round buttons 4px apart: pause (two rounded bars) or resume (a play triangle), and cancel (an X, muted). When the row completes, they swap for a 28px green circle (`#34c759`, dark `#30d158`) with a white drawn check.
- File type colours: pdf `#ff3b30`, fig `#bf5af2`, mp4 `#ff9f0a`, zip `#8e8e93`, png and jpg `#0a84ff`, csv `#30d158`, anything else `#8e8e93`.
- Drop overlay: covers the card, z 10, `white/80` with `backdrop-blur 3px` (dark `#1c1c1e` at 80%), `pointer-events: none`. Inside: a 2px dashed accent border inset 12px with radius 20px, and a centred stack of a 48px accent circle with a 20px up arrow bobbing 5px up and down every 1s (ease in out, forever) and the line "Drop to upload {n} file(s)" in 15px semibold.

## Motion

- Row enter: `height 0, opacity 0, y 10` to `height 60, opacity 1, y 0`; exit: `height 0, opacity 0, scale .96` over 250ms. Layout: spring stiffness 380, damping 32; rows use `layout` so the others slide.
- Fill width: spring stiffness 90, damping 22 toward the current percentage. When the row is done, the fill's opacity goes to 0 over 600ms after a 300ms delay.
- Done badge: `scale 0, rotate -45` to `1, 0`, spring stiffness 500, damping 18; the check path draws after 100ms.
- Drop overlay: opacity fade; the dashed border scales from 1.04 to 1 with a spring (300/24); the stack rises 10px and scales from .95.
- Reduced motion: no layout animation, no stripe movement, no bobbing or scaling, quick fades only, autoplay off.

## Interaction and states

- Item: `{ id, name, size, done, state: "up" | "paused" | "ok", speed }`. New items get `speed = 2.2e6 + 3.5e6 * seeded random` bytes per second from a seeded generator (mulberry32, seed 2024). Real files use `max(file.size, 2e5)` as their size.
- Simulation: while at least one row is `up`, an interval ticks every 100ms. Each `up` row gains `speed * 0.1 * wobble`, where wobble is a repeatable 0.6 to 1.4 value from a hash of the row id and tick number. It is pure, so strict mode and re-renders agree. At `done >= size` the row becomes `ok`. The interval is cleared when no row is going up.
- Pause or resume toggles a row between `up` and `paused`; cancel removes the row and calls `onCancel`.
- Drag: dragging anything that carries files over the card (tracked with a depth counter) shows the overlay with the item count; dropping adds the rows and calls `onFiles`. Other drags are ignored.
- `onComplete` fires once per row via an effect that remembers finished ids.

## Autoplay demo

Loop of 14000ms while running: clear at 0, show the overlay with "3 files" at 500ms, hide it, clear the list and add three samples at 1500ms ("Brand guidelines.pdf" 8.4 MB, "Homepage v3.fig" 22.1 MB, "Launch film.mp4" 48.6 MB), pause the third row at 3800ms, resume it at 6200ms with speed 9 MB/s, clear the list at 13500ms, restart at 14000ms. It runs only while `autoplay` is on, the card is at least 20% visible, the tab is visible, reduced motion is off and nothing has been pressed or dragged over the card. Pointer down or a file drag enter ends it for good. Timers are cleared on stop and unmount.

## Accessibility

- The list is labelled "Uploads". Each fill is a `role="progressbar"` with `aria-label="{name} upload progress"` and `aria-valuenow`. Pause/resume and cancel buttons carry the file name in their labels ("Pause {name}", "Resume {name}", "Cancel {name}"). A finished row has a screen-reader-only "Uploaded".
- A polite `role="status"` region announces "{n} files added to the queue." and "{name} cancelled.".
- The Upload button is the keyboard path to adding files. Focus ring: 2px outline `#0071e3` (dark `#0a84ff`), 2px offset. Decorative SVGs are `aria-hidden`.

## Acceptance checklist

- [ ] Dropping files adds rows that fill left to right while size and "Ns left" count along.
- [ ] Pause turns the fill into sliding stripes and the line into "Paused · N%"; resume continues.
- [ ] Cancel folds the row away and the others slide up.
- [ ] A finished row's fill fades out and a green check pops in; the header total updates.
- [ ] Dragging files over the card shows the overlay with the right count; other drags do not.
- [ ] The simulation stops its interval when nothing is uploading; nothing is read or sent.
- [ ] Autoplay pauses off screen and in hidden tabs and stops for good on the first touch.
- [ ] Fits at 320px wide with truncating names; dark mode recolours card, rows, stripes and overlay.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Dropping files on the card or choosing them with Upload plays `drop` from `@/lib/ui-sounds` (a short low thump falling in pitch, with a soft landing hiss). Each row you added that finishes its transfer plays `done` when its check appears (four soft triangle notes in a rising major chord, ringing together).
- The autoplay sample rows play the same sounds: `drop` as they land and `done` as each finishes, through the `auto` variant of the same play function (`play.auto`), which stays silent until the visitor has interacted with the page once, because browsers keep audio asleep until then. Pausing, resuming, cancelling and dragging over the card are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
