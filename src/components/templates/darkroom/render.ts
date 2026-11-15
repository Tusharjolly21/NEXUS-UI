import { paintContour, paintCyanotype, paintInkwash, paintMesh, paintPixel } from "./paint-drawn";
import { makeCanvas } from "./paint-kit";
import { paintBauhaus, paintHalftone, paintPapercut, paintRiso } from "./paint-print";
import { PALETTES, parsePrompt, pickPalette } from "./prompt";
import { makeNoise, seededRandom } from "./random";
import { buildScene } from "./scene";
import type { Aspect, PrintSpec } from "./types";

/** Height over width for each aspect ratio. */
export const ASPECTS: Record<Aspect, number> = {
  "1:1": 1,
  "4:5": 1.25,
  "3:2": 2 / 3,
  "16:9": 9 / 16,
};

/** Settle the parts of a spec that are left to chance: the palette and the canvas shape. */
export function resolveJob(spec: PrintSpec) {
  const parsed = parsePrompt(spec.prompt);
  const rand = seededRandom(spec.seed ^ 20973);
  const palette = spec.palette ?? pickPalette(parsed, rand);
  return {
    parsed,
    palette,
    style: spec.style,
    aspect: ASPECTS[spec.aspect],
  };
}

/** Paint a print onto a fresh canvas. The same spec always gives the same pixels. */
export function renderPrint(spec: PrintSpec, longEdge = 768) {
  const job = resolveJob(spec);
  const aspect = job.aspect;
  const width = Math.round(aspect > 1 ? longEdge / aspect : longEdge);
  const height = Math.round(width * aspect);
  const [canvas, ctx] = makeCanvas(width, height);
  const scene = buildScene(job.parsed, spec.seed, aspect);
  const colors = PALETTES[job.palette];
  const rand = seededRandom(spec.seed * 31 + 7);
  const noise = makeNoise(spec.seed + 99);
  switch (spec.style) {
    case "riso":
      paintRiso(ctx, width, height, scene, colors, job.palette, rand, noise, spec.seed);
      break;
    case "papercut":
      paintPapercut(ctx, width, height, scene, colors, rand, noise, spec.seed);
      break;
    case "halftone":
      paintHalftone(ctx, width, height, scene, colors, job.palette, rand, noise, spec.seed);
      break;
    case "bauhaus":
      paintBauhaus(ctx, width, height, scene, job.palette, rand, noise, spec.seed);
      break;
    case "cyanotype":
      paintCyanotype(ctx, width, height, scene, job.palette, rand, noise, spec.seed);
      break;
    case "contour":
      paintContour(ctx, width, height, scene, job.palette, rand, noise, spec.seed);
      break;
    case "mesh":
      paintMesh(ctx, width, height, scene, colors, job.palette, rand, noise, spec.seed);
      break;
    case "pixel":
      paintPixel(ctx, width, height, scene, colors, rand, noise);
      break;
    case "inkwash":
      paintInkwash(ctx, width, height, scene, colors, job.palette, rand, noise, spec.seed);
      break;
  }
  return {
    canvas,
    meta: {
      parsed: job.parsed,
      palette: job.palette,
      style: spec.style,
      w: width,
      h: height,
    },
  };
}

export const canvasUrl = (canvas: HTMLCanvasElement, type = "image/png", quality?: number) =>
  new Promise<string>((resolve) =>
    canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : canvas.toDataURL()), type, quality),
  );

/** Rendered canvases by print id, so the chat can reveal a print without painting it twice. */
export const printCache = new Map<string, HTMLCanvasElement>();
