# Upload Chips

Build a file drop zone where each dropped or picked file becomes a chip that fills from the left as it uploads, with a live percentage and ring, then swaps the ring for a popping check. Clean and tactile like a macOS sheet: the zone leans in when a file hovers, chips slide in and out.

## Stack

- React 18/19 client component (`"use client"`), TypeScript, Tailwind CSS, framer-motion (`motion`, `AnimatePresence`).
- File: `components/upload-chips/upload-chips.tsx`, named export `UploadChips`, plus exported `UploadChipsProps`.

## API

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `accent` | `string` (6-digit hex; alpha suffixes are appended) | `"#0071e3"` | Drag highlight, "browse", fill, ring and check colour. |
| `upload` | `(file: File \| { name: string; size: number }, onProgress: (p: number) => void) => Promise<void>` | simulated | Uploads one file and reports progress 0..1. |
| `autoplay` | `boolean` | `false` | Drops sample files in by itself until someone interacts. |

Default simulated upload: every 180ms add `0.06 + random·0.14` to progress (capped at 1), call `onProgress`, resolve at 1.

Item state: `{ id, name, size, progress }`, ids from a ref counter starting at 1.

Helpers:
- size label: above 1,000,000 bytes show `(b/1e6).toFixed(1) + " MB"`, otherwise `max(1, round(b/1e3)) + " KB"`.
- extension badge: text after the last dot, uppercased, first 4 characters.

## Layout and look

Define three CSS variables on the root: `--uc-edge` `#d2d2d7` (dark `#48484a`), `--uc-fill` `#ffffff` (dark `#2c2c2e`), `--uc-track` `#e8e8ed` (dark `#3a3a3c`).

- Root: column, `w-full max-w-[400px]`, 12px gap.
- Drop zone: a `label` wrapping a visually hidden `<input type="file" multiple>`. Column, centred, 8px gap, padding 24px × 28px, radius 22px, 1.5px dashed border, text centred, `cursor-pointer`. Border colour `--uc-edge`, background `--uc-fill`; while a file is dragged over, border becomes `accent` and background `accent + "0f"`. Colour change uses a 200ms CSS transition.
  - Icon disc: 44×44 round, background `#f0f0f3` (dark `#3a3a3c`), icon colour `accent`. 20px upload arrow SVG, stroke 2.2, path `M12 16V4M7 9l5-5 5 5M5 20h14`.
  - Title: "Drop files or **browse**", 15px semibold `#1d1d1f` (dark `#f5f5f7`), "browse" in `accent`.
  - Hint: "Anything up to 25 MB", 13px `#86868b` (dark `#98989d`).
- Chip list: `ul`, column, 8px gap.
- Chip: 56px tall, row, items centred, 12px gap, radius 16px, `overflow-hidden`, white, left padding 10px, right 8px, shadow `0 0 0 1px rgba(0,0,0,.06)`. Dark: `#2c2c2e`, ring `rgba(255,255,255,.08)`. Children sit `relative` above the fill layer.
  - Fill layer: absolute, full height and width, `transform-origin: left`, background `accent + "14"`.
  - Extension badge: 36×36, radius 8px, background `#f0f0f3` (dark `#3a3a3c`), 10px bold wide-tracked `#6e6e73` (dark `#a1a1a6`).
  - Text column (flex-1, `min-w-0`): name 14px medium, truncated, `#1d1d1f` (dark `#f5f5f7`); meta 12px tabular `#86868b` (dark `#98989d`) showing `"{pct}% of {size}"` while uploading, just `{size}` when done.
  - Status slot 36×36: while uploading a 22×22 ring (viewBox 22, rotated −90° so it starts at 12 o'clock): track circle r 8.5 stroke `--uc-track` width 2.5, progress circle same geometry in `accent`, round cap. When done: a 24px `accent` disc with a 12px white check (`M5 12.5l4.5 4.5L19 7.5`, stroke 3.2, round).
  - Remove button: 32×32 round, × icon 12px stroke 2.8, colour `#86868b`, hover background black 5% / dark white 10%, hover text `#1d1d1f` / dark `#f5f5f7`.

## Motion

- **Drop zone hover**: `scale` 1 → 1.03 while dragging over, spring stiffness 400, damping 26. Icon disc moves `y` 0 → −4 (default spring).
- **Chip enter**: from `opacity 0, y −10, scale 0.96` to rest, spring stiffness 420, damping 32. Chips use `layout`, so removing one lets the rest close the gap on the same spring. `AnimatePresence initial={false}`.
- **Chip exit**: `opacity 0, x 40`, 0.2s.
- **Fill layer**: `scaleX` follows `progress` with a spring (stiffness 120, damping 20), so jumpy progress reads smooth. At done it animates to `scaleX 0, opacity 0`.
- **Ring**: progress circle `pathLength` animates to `progress` (default transition).
- **Ring → check**: `AnimatePresence mode="popLayout"`. Ring exits with `scale 0`. Check disc enters `scale 0 → 1` on a snappy spring (stiffness 600, damping 16); the check path draws `pathLength 0 → 1` over 0.3s after 0.1s.

## Interaction and states

- Drag over: `preventDefault`, hover on. Leave: off. Drop: `preventDefault`, hover off, mark touched, start every file.
- Picking via the input starts each file, then resets `input.value = ""` so the same file can be re-picked.
- Starting appends a chip at 0 and calls `upload(file, onProgress)`, which updates that chip by id; done at `progress >= 1`.
- Remove deletes the chip at any stage (the upload is not cancelled).

## Autoplay demo

Every 1600ms, with counter `k`: if `k % 4 === 3` clear all chips, else start sample `k % 4` from: `brand-guide.pdf` (2,400,000 B), `hero-shot.png` (860,000 B), `q3-numbers.csv` (42,000 B). A `pointerdown` in the root, a drop or a file pick marks touched; the next tick clears the interval.

## Accessibility

- The real file input is `sr-only` inside the label, so the zone is keyboard reachable; show a 2px `accent` outline with 4px offset on the label when the input has `:focus-visible` (`has-[:focus-visible]:outline`).
- Remove buttons: `aria-label="Remove {name}"`, 2px `accent` focus outline.
- All decorative SVGs `aria-hidden`.

## Acceptance checklist

- [ ] Dragging a file over the zone scales it to 1.03, tints it and lifts the icon; leaving restores it.
- [ ] Each dropped file appears as its own chip with the right extension badge and size label.
- [ ] Fill and ring advance smoothly; the percentage updates live.
- [ ] At 100% the fill fades out, the ring shrinks away and a check pops in with a drawn stroke.
- [ ] Removing a chip slides it right and the others close up.
- [ ] Autoplay adds three samples then clears, repeating, and stops on first pointer down.
- [ ] Dark mode uses the listed variables and colours.

## Sound

- Prop `enableSound?: boolean` (default `true`; `false` silences it).
- Dropping or choosing files plays `tap` from `@/lib/ui-sounds` (a soft, short click with a tiny falling pitch) once for the batch as the chips appear. When each upload's promise resolves, `done` plays (four soft triangle notes in a rising major chord, ringing together) as its check appears.
- The autoplay sample files, removing a chip and dragging over the zone are silent.
- The sounds follow the site-wide switch (`setSoundsEnabled` from `@/lib/ui-sounds`, on by default in installed apps). No audio files are used: they are Web Audio synthesis in one file, `@/lib/ui-sounds`, which the CLI installs automatically with the component.
