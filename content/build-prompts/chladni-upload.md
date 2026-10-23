# Chladni Upload

Build an upload progress indicator out of sand on a vibrating plate. Each stage of the upload is a higher note: the sand jumps off the moving parts of the plate and settles on the new quiet lines, so the pattern gets finer as the file goes up. At 100% the sand gathers into a check mark.

## Stack

- React 18/19 client component, TypeScript, Tailwind CSS, framer-motion (`motion`, `animate`, `useMotionValue`, `useTransform`, `useReducedMotion`) and a 2D canvas with 2,600 grains.
- File: `components/chladni-upload/chladni-upload.tsx` plus an `index.ts`. Named exports: `ChladniUpload` and `ChladniUploadProps`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `fileName` | `string` | `"mix-final.wav"` | File name under the plate. |
| `fileSize` | `number` | `24.6` | Size in MB; the "x of y MB" line counts up to it. |
| `onComplete` | `() => void` | none | Called each time an upload reaches 100%. |
| `autoplay` | `boolean` | `false` | Uploads, holds the check, resets and repeats until the button is pressed. |
| `className` | `string` | none | Extra classes for the card. |

## Layout and look

- Card: 340px wide, `max-width: 100%`, radius 24px, padding 20px, white / dark `#1c1c1e`.
- Plate: a square, radius 18px, background `#1d1d1f` with an inset ring and shadow, grains in `#f5f5f7`. A glass chip at the top left shows the note and mode ("A2 · mode 1:3") and says "Done" at the end.
- File row: a 40px tile with a music icon, the file name (15px semibold, truncating) and "24.6 MB · ready" or the running "x of y MB"; the percentage at the right (20px semibold).
- A 6px progress bar (blue while uploading, green when done) and a pill button: "Upload", then "Uploading…" (disabled), then "Upload another".
- Footnote: "Each stage is a higher note. The sand finds the new quiet lines."

## Motion

- Five stages (notes A2, E3, B3, F#4, C#5) use the plate modes (1,3), (2,3), (3,5), (3,7), (5,8). Each grain gets random jitter proportional to the local mode amplitude |cos(nπx)cos(mπy) − cos(mπx)cos(nπy)|, so the sand drifts off the antinodes and rests on the nodal lines.
- The upload runs 7 seconds on an ease curve; the stage follows progress. A stage change kicks the plate (a short scale pulse and extra jitter).
- On completion each grain is pulled to the nearest point on a check-mark polyline with a little jitter, and the plate gets a larger kick.
- The canvas loop only steps while the card is on screen. Autoplay uploads, holds the check, resets, waits, repeats; it only runs on screen and never under reduced motion; pressing the button ends it.

## Accessibility

- The progress bar is a `role="progressbar"` with `aria-label`. The canvas has a `role="img"` label that changes with the state. The button is a real button; it is disabled while uploading.
