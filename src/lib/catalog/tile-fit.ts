import config from "./tile-fit.config.json";
import measured from "./tile-fit.generated.json";

/**
 * Per-component bento sizing. `scripts/measure-tiles.mjs` records where each preview actually
 * draws on its canvas; this turns that into the box the tile frames (`focus`) and how many columns
 * and bento rows the tile takes at each breakpoint, so every tile is shaped like its own component
 * while the wall stays an even grid.
 */

type Rect = [x: number, y: number, w: number, h: number];

type Measurement = {
  canvas: [number, number];
  surface: Rect;
  content: Rect;
  bg: string | null;
  coverage: number;
};

type Override = {
  /** Frame this box instead of the measured content. */
  focus?: Rect;
  /** Treat as a full-bleed scene (frame the whole surface). */
  scene?: boolean;
  /** Tile background: a colour, or null for the tile's tint (when the measured backdrop is only a passing state). */
  bg?: string | null;
  /** Treat as an object even if it measured as a scene: frame the content. */
  object?: boolean;
  /** Force the desktop column span. */
  span?: 1 | 2 | 3;
  /** Extra space around the content, as a fraction of its larger side. */
  pad?: number;
  /** Tile background when the preview is see-through or light. */
  surface?: "tint" | "card";
};

export type TileFit = {
  canvas: [number, number];
  focus: Rect;
  /** Background behind the preview: the preview's own colour for dark scenes, otherwise null (tint). */
  bg: string | null;
  /** True when the preview root's light background should be made see-through so the tint shows. */
  clearRoot: boolean;
  /** Dark surface: the tile chrome switches to light-on-dark. */
  dark: boolean;
  span: { base: 1; sm: 1 | 2; lg: 1 | 2 | 3 };
  rows: { base: number; sm: number; lg: number };
};

const DATA = measured as unknown as Record<string, Measurement>;
const OVERRIDES = (config as unknown as { overrides?: Record<string, Override> }).overrides ?? {};
const DEFAULT_CANVAS = config.defaultCanvas as [number, number];

/** Nominal column widths the row counts are computed for (gap 16px, container 1152px). */
const COL = { base: 343, sm: 300, lg: 276 };
const GAP = 16;
/** Bento row height. Tiles snap to 1–3 rows so the wall stays an even grid of rectangles. */
export const TILE_ROW = 148;
const MAX_ROWS = 3;

function luminance(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function clampRect([x, y, w, h]: Rect, [cw, ch]: [number, number]): Rect {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  return [x0, y0, Math.min(cw, x + w) - x0, Math.min(ch, y + h) - y0];
}

function widthFor(span: number, col: number) {
  return span * col + (span - 1) * GAP;
}

/** Snap a wanted height to whole bento rows (1–3), never shorter than the component needs to read. */
function rowsFor(height: number, minRows: number) {
  return Math.min(MAX_ROWS, Math.max(minRows, Math.round((height + GAP) / (TILE_ROW + GAP))));
}

const cache = new Map<string, TileFit>();

export function getTileFit(slug: string): TileFit {
  const hit = cache.get(slug);
  if (hit) return hit;

  const m = DATA[slug];
  const o = OVERRIDES[slug] ?? {};
  const canvas: [number, number] = m?.canvas ?? DEFAULT_CANVAS;

  const bg = o.bg !== undefined ? o.bg : (m?.bg ?? null);
  const darkBg = bg !== null && luminance(bg) < 0.2;
  const surface = m?.surface ?? [0, 0, canvas[0], canvas[1]];
  const content = m?.content ?? [canvas[0] * 0.2, canvas[1] * 0.2, canvas[0] * 0.6, canvas[1] * 0.6];
  const contentShare = (content[2] * content[3]) / Math.max(1, surface[2] * surface[3]);

  const scene = o.scene ?? (!o.object && darkBg && contentShare > 0.5);
  let focus: Rect;
  if (o.focus) focus = o.focus;
  else if (scene) focus = surface;
  else {
    const pad = Math.round(Math.max(28, Math.min(96, (o.pad ?? 0.16) * Math.max(content[2], content[3]))));
    focus = clampRect([content[0] - pad, content[1] - pad, content[2] + pad * 2, content[3] + pad * 2], canvas);
  }

  const [, , fw, fh] = focus;
  const aspect = fw / fh;

  // Desktop span: how wide the component wants to be shown at a comfortable scale.
  let lg: 1 | 2 | 3 = o.span ?? (fw * (scene ? 0.55 : 0.8) <= 330 ? 1 : 2);
  if (!o.span && lg === 1 && widthFor(1, COL.lg) / aspect < 150) lg = 2; // very wide strips need room
  const sm: 1 | 2 = lg >= 2 ? 2 : 1;

  const heightAt = (span: number, col: number) => widthFor(span, col) / aspect;
  // A single row only suits wide strips (navbars, inputs, marquees); everything else gets two or more.
  const minRows = (span: number, col: number) => (widthFor(span, col) / aspect < TILE_ROW * 1.15 ? 1 : 2);

  const fit: TileFit = {
    canvas,
    focus,
    bg: darkBg ? bg : null,
    clearRoot: !darkBg && o.surface !== "card",
    dark: darkBg,
    span: { base: 1, sm, lg },
    rows: {
      base: rowsFor(heightAt(1, COL.base), minRows(1, COL.base)),
      sm: rowsFor(heightAt(sm, COL.sm), minRows(sm, COL.sm)),
      lg: rowsFor(heightAt(lg, COL.lg), minRows(lg, COL.lg)),
    },
  };
  cache.set(slug, fit);
  return fit;
}
