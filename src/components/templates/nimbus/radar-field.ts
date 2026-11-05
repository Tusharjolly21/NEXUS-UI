/**
 * The rain field behind the radar: a smooth, drifting pattern of "rainfall intensity" from layered noise,
 * coloured with the same blue, green, yellow, orange and red ramp real weather radars use.
 * The numbers are not real measurements; this is a demo.
 */

/** A cheap deterministic hash of a grid point, 0..1. */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Smooth value noise built on `hash`. */
export function noise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0);
  const b = hash(x0 + 1, y0);
  const c = hash(x0, y0 + 1);
  const d = hash(x0 + 1, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Three octaves of noise: broad bands of rain with finer structure on top. */
export function rainNoise(x: number, y: number) {
  return 0.55 * noise(x, y) + 0.3 * noise(x * 2.1 + 5, y * 2.1) + 0.15 * noise(x * 4.2, y * 4.2 + 9);
}

type Rgba = [number, number, number, number];

/** Intensity (0..1) to colour. Light drizzle is a faint blue, then green, yellow, orange and red for the heaviest cells. */
const RAIN_COLORS: [number, Rgba][] = [
  [0, [80, 180, 255, 0]],
  [0.12, [80, 180, 255, 120]],
  [0.3, [52, 199, 89, 170]],
  [0.5, [255, 214, 10, 190]],
  [0.7, [255, 159, 10, 210]],
  [0.9, [255, 59, 48, 225]],
];

export function rainColor(intensity: number): Rgba {
  for (let i = RAIN_COLORS.length - 1; i >= 0; i--) {
    if (intensity >= RAIN_COLORS[i][0]) {
      const [at, color] = RAIN_COLORS[i];
      const next = RAIN_COLORS[i + 1];
      if (!next) return color;
      const t = (intensity - at) / (next[0] - at);
      return color.map((channel, k) => channel + (next[1][k] - channel) * t) as Rgba;
    }
  }
  return RAIN_COLORS[0][1];
}
