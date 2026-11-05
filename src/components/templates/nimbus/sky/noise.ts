/** Small numeric helpers shared by the sky code: clamping, smoothstep, seeded random numbers and value noise. */

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 0 below `edge0`, 1 above `edge1`, and a smooth S-curve in between. */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** A tiny seeded random number generator (linear congruential), so a given seed always gives the same sequence. */
export function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const NOISE_SIZE = 256;

/** A fixed 256 x 256 grid of random values: the lattice the value noise interpolates between. */
const NOISE_GRID = (() => {
  const next = createRng(20261104);
  const grid = new Float32Array(NOISE_SIZE * NOISE_SIZE);
  for (let i = 0; i < grid.length; i++) grid[i] = next();
  return grid;
})();

/** Smooth 2D value noise in 0..1. It repeats every 256 units. */
export function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const col0 = x0 & 255;
  const col1 = (x0 + 1) & 255;
  const row0 = (y0 & 255) << 8;
  const row1 = ((y0 + 1) & 255) << 8;
  const a = NOISE_GRID[row0 + col0];
  const b = NOISE_GRID[row0 + col1];
  const c = NOISE_GRID[row1 + col0];
  const d = NOISE_GRID[row1 + col1];
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Fractal noise: several octaves of `valueNoise`, each twice as fine and half as strong. Result in 0..1. */
export function fbm(x: number, y: number, octaves: number) {
  let sum = 0;
  let amplitude = 0.5;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(x + o * 17.3, y + o * 9.1) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    x *= 2.03;
    y *= 2.03;
  }
  return sum / total;
}
