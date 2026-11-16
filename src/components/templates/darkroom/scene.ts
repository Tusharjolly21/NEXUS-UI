import { between, lerp, makeNoise, seededRandom, type Noise, type Rand } from "./random";
import type { ParsedPrompt } from "./prompt";

/** A point in a print, in units of its width: x from 0 to 1, y downward. */
export type Point = [number, number];
/** A mountain's summit: where it is and how wide its flanks spread. */
export type Peak = {
  x: number;
  y: number;
  w: number;
};
/** Something standing on a layer's skyline: a polygon (a tree, a house, a tower) or a disc (a lamp, a dome). */
export type Shape =
  | {
      k: "p";
      pts: Point[];
    }
  | {
      k: "c";
      x: number;
      y: number;
      r: number;
    };
/** A lit window: x, y, width, height. */
export type Win = [number, number, number, number];
/** One band of land or water, from the horizon (t = 0) to the foreground (t = 1). */
export type Layer = {
  t: number;
  kind: string;
  top: Point[];
  extra: Shape[];
  peaks: Peak[];
  base: number;
  win: Win[];
  snow?: number;
  /** A river's banks, drawn as a band across the layer. */
  river?: Point[];
};
export type Orb = {
  x: number;
  y: number;
  r: number;
  moon: boolean;
  crescent: boolean;
};
export type Star = {
  x: number;
  y: number;
  r: number;
  tw: number;
};
export type Cloud = {
  x: number;
  y: number;
  w: number;
  puffs: {
    x: number;
    y: number;
    r: number;
  }[];
};
export type Bird = {
  x: number;
  y: number;
  s: number;
  a: number;
};
export type Boat = {
  x: number;
  y: number;
  s: number;
};
/** Everything a style paints: the horizon, the layers, the sky's furniture. Built once per prompt and seed. */
export type Scene = ReturnType<typeof buildScene>;
const RIDGE_STEPS = 220;
function ridgeLine(
  kind: string,
  base: number,
  height: number,
  rand: Rand,
  noise: Noise,
): {
  top: Point[];
  peaks: Peak[];
} {
  const top: Point[] = [];
  const peaks: Peak[] = [];
  const offsetX = rand() * 90;
  const offsetY = rand() * 90;
  if (kind === "mountain") {
    const u = 1 + Math.floor(rand() * 3);
    const c: { c: number; w: number; h: number }[] = [];
    for (let f = 0; f < u; f++) {
      c.push({
        c: between(rand, 0.04, 0.96),
        w: between(rand, 0.2, 0.46),
        h: f === 0 ? 1 : between(rand, 0.45, 0.85),
      });
    }
    for (let f = 0; f <= RIDGE_STEPS; f++) {
      const d = -0.02 + (1.04 * f) / RIDGE_STEPS;
      let m = 0;
      for (const x of c) {
        m = Math.max(m, x.h * Math.pow(Math.max(0, 1 - Math.abs(d - x.c) / x.w), 1.08));
      }
      const v = 1 - Math.abs(noise.fbm(d * 7 + offsetX, offsetY, 4));
      top.push([
        d,
        base - height * (m * 0.82 + 0.1 * (noise.fbm(d * 2.2 + offsetX, 3.1) + 0.6) + v * 0.19 * (0.3 + m)),
      ]);
    }
    for (const f of c) {
      const d = Math.round(((f.c + 0.02) / 1.04) * RIDGE_STEPS);
      if (d >= 0 && d <= RIDGE_STEPS) {
        peaks.push({
          x: f.c,
          y: top[d][1],
          w: f.w,
        });
      }
    }
  } else if (kind === "dune") {
    const u = between(rand, 5, 8);
    const c = rand() * 6;
    for (let f = 0; f <= RIDGE_STEPS; f++) {
      const d = -0.02 + (1.04 * f) / RIDGE_STEPS;
      const m = Math.pow(1 - Math.abs(Math.sin(d * u + c + 0.4 * noise.n2(d * 2, offsetX))), 1.6);
      top.push([d, base - height * (m * 0.75 + 0.25 * (noise.fbm(d * 1.4 + offsetX, offsetY, 3) + 0.5))]);
    }
  } else if (kind === "mesa") {
    const u = 2 + Math.floor(rand() * 2);
    const c: { c: number; w: number; h: number }[] = [];
    for (let f = 0; f < u; f++) {
      c.push({
        c: (f + 0.5) / u + between(rand, -0.12, 0.12),
        w: between(rand, 0.05, 0.16),
        h: between(rand, 0.55, 1),
      });
    }
    for (let f = 0; f <= RIDGE_STEPS; f++) {
      const d = -0.02 + (1.04 * f) / RIDGE_STEPS;
      let m = 0.08 + 0.05 * (noise.fbm(d * 3 + offsetX, offsetY, 3) + 0.5);
      for (const v of c) {
        const x = Math.abs(d - v.c) - v.w;
        const T =
          x < 0
            ? 1
            : x < 0.012
              ? 1 - Math.pow(x / 0.012, 0.7) * 0.55
              : x < 0.07
                ? 0.45 * Math.pow(1 - (x - 0.012) / 0.058, 1.8)
                : 0;
        m = Math.max(m, v.h * T + (x < 0 ? 0.015 * noise.n2(d * 40, offsetX) : 0));
      }
      top.push([d, base - height * m]);
    }
  } else {
    const u = kind === "ground" ? 1.1 : 1.7;
    for (let c = 0; c <= RIDGE_STEPS; c++) {
      const f = -0.02 + (1.04 * c) / RIDGE_STEPS;
      top.push([f, base - height * (0.5 + 0.5 * noise.fbm(f * u + offsetX, offsetY, 3) * 1.4)]);
    }
  }
  return {
    top: top,
    peaks: peaks,
  };
}
export const heightAt = (top: Point[], x: number) => {
  if (top.length !== RIDGE_STEPS + 1) {
    let o = top[0][1];
    for (let i = 1; i < top.length; i++) {
      if (top[i][0] >= x) {
        o = top[i - 1][0] <= x ? Math.min(top[i][1], top[i - 1][1]) : top[i][1];
        break;
      }
    }
    return o;
  }
  const n = Math.max(0, Math.min(RIDGE_STEPS, ((x + 0.02) / 1.04) * RIDGE_STEPS));
  const r = Math.floor(n);
  const s = Math.min(RIDGE_STEPS, r + 1);
  return lerp(top[r][1], top[s][1], n - r);
};
function pinePoints(x: number, y: number, size: number, rand: Rand): Point[] {
  const spread = size * between(rand, 0.2, 0.27);
  const TIERS = 4;
  const tip: Point[] = [[x, y - size]];
  const right: Point[] = [];
  const left: Point[] = [];
  for (let u = 1; u <= TIERS; u++) {
    const c = y - size + (size * 0.92 * u) / TIERS;
    const f = spread * (0.35 + 0.65 * (u / TIERS)) * between(rand, 0.88, 1.1);
    right.push([x + f, c], [x + f * 0.38, c - size * 0.035]);
    left.push([x - f * between(rand, 0.9, 1.08), c], [x - f * 0.38, c - size * 0.035]);
  }
  right.pop();
  left.pop();
  return [
    ...tip,
    ...right,
    [x + spread * 0.09, y - size * 0.08],
    [x + spread * 0.09, y + size * 0.15],
    [x - spread * 0.09, y + size * 0.15],
    [x - spread * 0.09, y - size * 0.08],
    ...left.reverse(),
  ];
}
function landmarkShapes(x: number, y: number, size: number, rand: Rand): Shape[] {
  const shapes: Shape[] = [
    {
      k: "p",
      pts: [
        [x - size * 0.03, y + size * 0.1],
        [x - size * 0.025, y - size * 0.5],
        [x + size * 0.025, y - size * 0.5],
        [x + size * 0.03, y + size * 0.1],
      ],
    },
  ];
  const puffs = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < puffs; i++) {
    const l = (i / puffs) * Math.PI * 2;
    shapes.push({
      k: "c",
      x: x + Math.cos(l) * size * 0.17,
      y: y - size * 0.62 + Math.sin(l) * size * 0.14,
      r: size * between(rand, 0.2, 0.27),
    });
  }
  return shapes;
}
function cityPieces(x: number, y: number, size: number, rand: Rand): Shape[] {
  const unit = size * 0.12;
  const pieces: Shape[] = [];
  const block = (cx: number, top: number, bottom: number, w: number): Shape[] => [
    {
      k: "p",
      pts: [
        [cx - w / 2, bottom],
        [cx - w / 2, top + w / 2],
        [cx + w / 2, top + w / 2],
        [cx + w / 2, bottom],
      ],
    },
    {
      k: "c",
      x: cx,
      y: top + w / 2,
      r: w / 2,
    },
  ];
  pieces.push(...block(x, y - size, y + size * 0.1, unit));
  const l = y - size * between(rand, 0.4, 0.55);
  const a = y - size * between(rand, 0.5, 0.68);
  pieces.push(
    {
      k: "p",
      pts: [
        [x - unit * 1.6, l + unit * 0.45],
        [x, l + unit * 0.45],
        [x, l - unit * 0.45],
        [x - unit * 1.6, l - unit * 0.45],
      ],
    },
    ...block(x - unit * 1.6, l - size * 0.28, l + unit * 0.4, unit * 0.85),
  );
  if (rand() < 0.8) {
    pieces.push(
      {
        k: "p",
        pts: [
          [x, a + unit * 0.45],
          [x + unit * 1.5, a + unit * 0.45],
          [x + unit * 1.5, a - unit * 0.45],
          [x, a - unit * 0.45],
        ],
      },
      ...block(x + unit * 1.5, a - size * 0.24, a + unit * 0.4, unit * 0.85),
    );
  }
  return pieces;
}
/** A waterfront skyline: towers, gables, domes and stepped blocks along the shore, with lit windows. */
function shoreLine(base: number, height: number, rand: Rand, windows: Win[], lit: number, scale: number): Point[] {
  const top: Point[] = [[-0.02, base]];
  let x = -0.02;
  for (; x < 1.02;) {
    const w = between(rand, 0.035, 0.075) * scale;
    // Taller toward the middle of the frame.
    const centre = 1 - Math.abs(x - 0.55) * 0.9;
    const tall = height * (0.25 + 0.75 * Math.pow(rand(), 1.6) * centre) * (rand() < 0.12 ? 1.45 : 1);
    const roof = base - tall;
    const kind = rand();
    if (kind < 0.18 && tall > height * 0.6) {
      // Stepped tower with a spire.
      const crown = w * 0.55;
      const step = (w - crown) / 2;
      const crownY = roof - tall * 0.16;
      top.push(
        [x, base],
        [x, roof],
        [x + step, roof],
        [x + step, crownY],
        [x + w / 2 - w * 0.03, crownY],
        [x + w / 2 - w * 0.03, crownY - tall * 0.14],
        [x + w / 2 + w * 0.03, crownY - tall * 0.14],
        [x + w / 2 + w * 0.03, crownY],
        [x + step + crown, crownY],
        [x + step + crown, roof],
        [x + w, roof],
        [x + w, base],
      );
    } else if (kind < 0.3) {
      top.push([x, base], [x, roof], [x + w / 2, roof - w * 0.45], [x + w, roof], [x + w, base]);
    } else if (kind < 0.38) {
      top.push([x, base], [x, roof]);
      for (let step = 0; step <= 8; step++) {
        const angle = Math.PI - (step / 8) * Math.PI;
        top.push([x + w / 2 + (Math.cos(angle) * w) / 2, roof - Math.sin(angle) * w * 0.45]);
      }
      top.push([x + w, base]);
    } else {
      top.push([x, base], [x, roof], [x + w, roof], [x + w, base]);
    }
    const cols = Math.max(2, Math.round(w / 0.011));
    const rows = Math.max(2, Math.round(tall / 0.016));
    for (let col = 0; col < cols; col++) {
      for (let row = 1; row < rows; row++) {
        if (rand() < lit) {
          windows.push([
            x + (w * (col + 0.3)) / cols,
            roof + (tall * row) / rows,
            (w / cols) * 0.45,
            (tall / rows) * 0.4,
          ]);
        }
      }
    }
    x += w + (rand() < 0.25 ? between(rand, 0.002, 0.012) : 0);
  }
  top.push([1.04, base]);
  return top;
}
export function buildScene(parsed: ParsedPrompt, seed: number, aspect: number) {
  const rand = seededRandom(seed * 7 + 3);
  const noise = makeNoise(seed);
  const subjects = new Set(parsed.subjects);
  const has = (subject: string) => subjects.has(subject);
  const night = has("night") || (has("moon") && !has("sun")) || parsed.palette === "night";
  const coastal = has("sea") || has("island") || has("lighthouse");
  let lamp: { x: number; y: number; r: number } | null = null;
  const horizon = aspect * (coastal ? between(rand, 0.5, 0.6) : between(rand, 0.46, 0.58));
  const layers: Layer[] = [];
  const makeLayer = (S: string, C: number, P: number, M: Partial<Layer> = {}): Layer => {
    const k = ridgeLine(
      S === "forest" || S === "island" || S === "cliff" ? "hill" : S === "ground" ? "ground" : S,
      C,
      P,
      rand,
      noise,
    );
    return {
      t: 0,
      kind: S,
      top: k.top,
      extra: [],
      peaks: k.peaks,
      base: C,
      win: [],
      ...M,
    };
  };
  const below = aspect - horizon;
  /** Scatters trees (or landmarks) along a layer's skyline. */
  const plant = (S: Layer, C: number, P: number, M = false) => {
    let k = -0.02;
    for (; k < 1.02;) {
      k += (C * between(rand, 0.22, 0.5)) / P;
      if (rand() < 0.12) {
        k += C * 0.8;
        continue;
      }
      const F = heightAt(S.top, k) + C * 0.06;
      const j = C * between(rand, 0.65, 1.15);
      if (M) {
        S.extra.push(...landmarkShapes(k, F, j, rand));
      } else {
        S.extra.push({
          k: "p",
          pts: pinePoints(k, F, j, rand),
        });
      }
    }
  };
  if (coastal) {
    if (has("city")) {
      const S: Layer = {
        t: 0,
        kind: "city",
        top: [],
        extra: [],
        peaks: [],
        base: horizon,
        win: [],
      };
      S.top = shoreLine(horizon + 0.002, aspect * 0.2, rand, S.win, night ? 0.35 : 0.12, 1);
      layers.push(S);
    } else if (has("mountain") || has("snow")) {
      layers.push(
        makeLayer("mountain", horizon + 0.004, aspect * between(rand, 0.16, 0.26), {
          snow: has("snow") || rand() < 0.4 ? 1 : 0,
        }),
      );
    } else if (!has("island") && rand() < 0.75) {
      const S = makeLayer("hill", horizon + 0.004, aspect * 0.04);
      for (const C of S.top) {
        C[1] = Math.min(horizon + 0.003, C[1] + 0.012 * (1 + Math.sin(C[0] * 9)));
      }
      layers.push(S);
    }
    layers.push({
      t: 0,
      kind: "water",
      top: [
        [-0.02, horizon],
        [1.04, horizon],
      ],
      extra: [],
      peaks: [],
      base: horizon,
      win: [],
    });
    if (has("island")) {
      const S = between(rand, 0.3, 0.7);
      const C = between(rand, 0.16, 0.26);
      const P = horizon + below * between(rand, 0.12, 0.25);
      const M: Point[] = [];
      for (let F = 0; F <= RIDGE_STEPS; F++) {
        const j = -0.02 + (1.04 * F) / RIDGE_STEPS;
        const R = Math.max(0, 1 - Math.pow((j - S) / C, 2));
        M.push([j, P - (R > 0 ? Math.pow(R, 0.6) * aspect * 0.07 * (1 + 0.2 * noise.n2(j * 12, 5)) : -0.004)]);
      }
      const k: Layer = {
        t: 0,
        kind: "island",
        top: M,
        extra: [],
        peaks: [],
        base: P,
        win: [],
      };
      for (let F = 0; F < 7; F++) {
        const j = S + (F / 6 - 0.5) * C * 1.1;
        if (Math.abs(j - S) < C * 0.85) {
          const R = heightAt(M, j) + 0.004;
          k.extra.push(
            ...(has("forest")
              ? [
                  {
                    k: "p" as const,
                    pts: pinePoints(j, R, aspect * 0.06 * between(rand, 0.7, 1.1), rand),
                  },
                ]
              : landmarkShapes(j, R, aspect * 0.05 * between(rand, 0.7, 1.2), rand)),
          );
        }
      }
      layers.push(k);
    } else if (!has("city") && (rand() < 0.7 || has("forest") || has("lighthouse"))) {
      const S = rand() < 0.5;
      const C = between(rand, 0.26, 0.4);
      const P = horizon + below * between(rand, 0.04, 0.22);
      const M: Point[] = [];
      for (let F = 0; F <= RIDGE_STEPS; F++) {
        const j = -0.02 + (1.04 * F) / RIDGE_STEPS;
        const O = ((S ? j : 1 - j) - C + 0.1) / 0.28;
        const H = O <= 0 ? 0 : Math.min(1.2, Math.pow(O, 1.6) + 0.06 * Math.floor(O * 5) * (O < 1 ? 1 : 0));
        M.push([
          j,
          P +
            0.012 * noise.fbm(j * 7, 2) +
            (aspect - P + 0.04) * H * 0.9 +
            0.006 * Math.abs(noise.n2(j * 40, 1)) * Math.min(1, O * 4),
        ]);
      }
      const k: Layer = {
        t: 0,
        kind: "cliff",
        top: M,
        extra: [],
        peaks: [],
        base: P,
        win: [],
      };
      if (has("lighthouse")) {
        const F = S ? C - 0.13 : 1 - C + 0.13;
        const j = heightAt(M, F) + 0.004;
        const R = aspect * 0.12;
        const O = 0.019;
        const H = 0.012;
        k.extra.push(
          {
            k: "p",
            pts: [
              [F - O, j + 0.02],
              [F - H, j - R],
              [F + H, j - R],
              [F + O, j + 0.02],
            ],
          },
          {
            k: "p",
            pts: [
              [F - 0.018, j - R],
              [F - 0.018, j - R - 0.006],
              [F + 0.018, j - R - 0.006],
              [F + 0.018, j - R],
            ],
          },
          {
            k: "p",
            pts: [
              [F - 0.0095, j - R - 0.006],
              [F - 0.0095, j - R - 0.022],
              [F + 0.0095, j - R - 0.022],
              [F + 0.0095, j - R - 0.006],
            ],
          },
          {
            k: "c",
            x: F,
            y: j - R - 0.022,
            r: 0.0095,
          },
          {
            k: "p",
            pts: [
              [F + (S ? -0.06 : 0.016), j + 0.01],
              [F + (S ? -0.06 : 0.016), j - 0.024],
              [F + (S ? -0.04 : 0.036), j - 0.04],
              [F + (S ? -0.02 : 0.056), j - 0.024],
              [F + (S ? -0.02 : 0.056), j + 0.01],
            ],
          },
        );
        lamp = {
          x: F,
          y: j - R - 0.014,
          r: 0.006,
        };
      }
      if (has("forest") || rand() < 0.5) {
        const F = aspect * 0.07;
        let j = S ? -0.01 : 1 - C + 0.05;
        const R = S ? C - 0.06 : 1.02;
        for (; j < R;) {
          const O = heightAt(M, j) + F * 0.06;
          k.extra.push({
            k: "p",
            pts: pinePoints(j, O, F * between(rand, 0.6, 1.1), rand),
          });
          j += F * between(rand, 0.18, 0.32);
        }
      }
      layers.push(k);
    }
  } else if (has("desert")) {
    layers.push(makeLayer("mesa", horizon + 0.01, aspect * between(rand, 0.1, 0.16)));
    for (let C = 0; C < 3; C++) {
      layers.push(makeLayer("dune", horizon + below * (0.15 + C * 0.27), below * (0.16 + C * 0.06)));
    }
    const S = layers[layers.length - 1];
    for (let C = 0; C < 1 + Math.floor(rand() * 2); C++) {
      const P = between(rand, 0.12, 0.88);
      S.extra.push(...cityPieces(P, heightAt(S.top, P) + 0.02, aspect * between(rand, 0.16, 0.24), rand));
    }
  } else if (has("city")) {
    layers.push(
      makeLayer(has("mountain") ? "mountain" : "hill", horizon - 0.02, aspect * (has("mountain") ? 0.2 : 0.08)),
    );
    const S: Layer = {
      t: 0,
      kind: "city",
      top: [],
      extra: [],
      peaks: [],
      base: horizon + 0.04,
      win: [],
    };
    S.top = shoreLine(horizon + 0.04, aspect * 0.22, rand, S.win, night ? 0.25 : 0.06, 0.8);
    layers.push(S);
    const C: Layer = {
      t: 0,
      kind: "city",
      top: [],
      extra: [],
      peaks: [],
      base: horizon + below * 0.42,
      win: [],
    };
    C.top = shoreLine(horizon + below * 0.42, aspect * 0.3, rand, C.win, night ? 0.3 : 0.08, 1.3);
    layers.push(C);
    layers.push(makeLayer("ground", aspect - below * 0.18, below * 0.08));
  } else {
    const S = has("mountain") || has("snow");
    const C = has("forest");
    const P = 4;
    for (let M = 0; M < P; M++) {
      const k = M / (P - 1);
      const F = S && M < (C ? 2 : 3) ? "mountain" : C && M > 0 ? "forest" : "hill";
      const j = horizon + below * (M === 0 ? 0.02 : 0.08 + 0.72 * Math.pow(k, 1.15));
      const R =
        F === "mountain" ? aspect * (0.34 - M * 0.07) : F === "forest" ? below * 0.16 : below * (0.12 + 0.04 * M);
      const O = makeLayer(F, j, R, {
        snow: F === "mountain" && (has("snow") || (M === 0 && rand() < 0.5)) ? 1 : 0,
      });
      if (F === "forest") {
        plant(O, aspect * (0.05 + 0.05 * k), 1 + k);
      } else {
        if (F === "hill" && M === P - 1 && (has("plant") || rand() < 0.35)) {
          plant(O, aspect * 0.08, 0.6, true);
        }
      }
      layers.push(O);
    }
  }
  if (has("river") && !coastal) {
    const S = layers[layers.length - 1];
    const C: Point[] = [];
    const P: Point[] = [];
    const M = layers[Math.max(0, layers.length - 3)].base;
    const k = between(rand, 0.35, 0.65);
    for (let F = 0; F <= 40; F++) {
      const j = F / 40;
      const R = lerp(M, aspect + 0.02, j);
      const O = 0.006 + 0.16 * j * j;
      const H = k + Math.sin(j * 5 + seed) * 0.12 * j + noise.n2(j * 3, 4) * 0.05;
      C.push([H - O, R]);
      P.unshift([H + O, R]);
    }
    S.river = [...C, ...P];
  }
  const x = layers.filter((S) => S.kind !== "water");
  x.forEach((S, i) => {
    S.t = x.length > 1 ? i / (x.length - 1) : 1;
  });
  let T = null;
  if (has("sun") || has("moon") || night || rand() < 0.8) {
    const S = night || (has("moon") && !has("sun"));
    const C = between(rand, 0.24, 0.76);
    const P = between(rand, 0.07, 0.12) * (S ? 0.8 : 1);
    const M = layers[0] ? heightAt(layers[0].top, C) : horizon;
    let k = Math.min(horizon - aspect * between(rand, 0.06, 0.3), M - P * (coastal ? 0.1 : 0.4));
    k = Math.max(k, aspect * 0.14 + P);
    T = {
      x: C,
      y: k,
      r: P,
      moon: S,
      crescent: S && rand() < 0.5,
    };
  }
  const p = [];
  if (night) {
    for (let S = 0; S < 160; S++) {
      p.push({
        x: rand(),
        y: Math.pow(rand(), 1.4) * horizon * 0.95,
        r: rand() < 0.08 ? 0.0022 : 0.0011,
      });
    }
  }
  const g = [];
  const E = has("cloud") ? 3 + Math.floor(rand() * 2) : rand() < 0.4 ? 1 + Math.floor(rand() * 2) : 0;
  for (let S = 0; S < E; S++) {
    const C = between(rand, 0.16, 0.3);
    const P = between(rand, -0.05, 1.05);
    const M = between(rand, 0.12, 0.85) * horizon;
    const k = [];
    const F = 5 + Math.floor(rand() * 4);
    for (let j = 0; j < F; j++) {
      const R = j / (F - 1);
      k.push({
        x: P + (R - 0.5) * C,
        y: M - Math.sin(R * Math.PI) * C * 0.14 * between(rand, 0.6, 1.2),
        r: C * (0.1 + 0.12 * Math.sin(R * Math.PI)) * between(rand, 0.8, 1.2),
      });
    }
    g.push({
      x: P,
      y: M,
      w: C,
      puffs: k,
    });
  }
  const b = [];
  if (has("bird")) {
    const S = between(rand, 0.25, 0.75);
    const C = horizon * between(rand, 0.25, 0.6);
    const P = 6 + Math.floor(rand() * 8);
    for (let M = 0; M < P; M++) {
      b.push({
        x: S + (rand() - 0.5) * 0.4,
        y: C + (rand() - 0.5) * horizon * 0.3,
        s: between(rand, 0.012, 0.024),
        a: between(rand, -0.4, 0.4),
      });
    }
  }
  const w =
    (coastal || has("river")) && rand() < 0.6
      ? {
          x: between(rand, 0.2, 0.8),
          y: coastal ? horizon + (aspect - horizon) * between(rand, 0.12, 0.35) : 0,
          s: between(rand, 0.04, 0.07),
        }
      : null;
  return {
    A: aspect,
    hz: horizon,
    night: night,
    layers: layers,
    subjects: subjects,
    words: parsed.words,
    orb: T,
    birds: b,
    stars: p,
    clouds: g,
    boat: w && w.y ? w : null,
    lamp: lamp,
  };
}
