/** A random number generator: each call returns the next number in [0, 1). */
export type Rand = () => number;

/** Smooth 2D noise: `n2` is Perlin noise in about [-1, 1], `fbm` sums a few octaves of it for a rougher texture. */
export type Noise = { n2: (x: number, y: number) => number; fbm: (x: number, y: number, octaves?: number) => number };

/** A small seeded generator (mulberry32), so the same prompt and seed always develop the same print. */
export function seededRandom(seed: number): Rand {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 1831565813) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random number between min and max. */
export const between = (rand: Rand, min: number, max: number) => min + (max - min) * rand();

/** A random item of a list. */
export const pick = <T>(rand: Rand, list: readonly T[]) => list[Math.floor(rand() * list.length) % list.length];

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Seeded Perlin noise: a shuffled permutation table and a random gradient per cell corner. */
export function makeNoise(seed: number): Noise {
  const rand = seededRandom(seed ^ 10855845);
  const order = Array.from({ length: 256 }, (_, index) => index);
  for (let index = 255; index > 0; index--) {
    const swap = Math.floor(rand() * (index + 1));
    const held = order[index];
    order[index] = order[swap];
    order[swap] = held;
  }
  const perm = new Uint8Array(512);
  for (let index = 0; index < 512; index++) {
    perm[index] = order[index & 255];
  }
  const gradX = new Float32Array(256);
  const gradY = new Float32Array(256);
  for (let index = 0; index < 256; index++) {
    const angle = rand() * Math.PI * 2;
    gradX[index] = Math.cos(angle);
    gradY[index] = Math.sin(angle);
  }
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  function n2(x: number, y: number) {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    const fx = x - cellX;
    const fy = y - cellY;
    const ix = cellX & 255;
    const iy = cellY & 255;
    const g00 = perm[perm[ix] + iy];
    const g10 = perm[perm[ix + 1] + iy];
    const g01 = perm[perm[ix] + iy + 1];
    const g11 = perm[perm[ix + 1] + iy + 1];
    const d00 = gradX[g00] * fx + gradY[g00] * fy;
    const d10 = gradX[g10] * (fx - 1) + gradY[g10] * fy;
    const d01 = gradX[g01] * fx + gradY[g01] * (fy - 1);
    const d11 = gradX[g11] * (fx - 1) + gradY[g11] * (fy - 1);
    const u = fade(fx);
    const v = fade(fy);
    return (d00 + (d10 - d00) * u + (d01 - d00) * v + (d00 - d10 - d01 + d11) * u * v) * 1.414;
  }
  function fbm(x: number, y: number, octaves = 4) {
    let total = 0;
    let amplitude = 0.5;
    let frequency = 1;
    let weight = 0;
    for (let octave = 0; octave < octaves; octave++) {
      total += amplitude * n2(x * frequency, y * frequency);
      weight += amplitude;
      amplitude *= 0.5;
      frequency *= 2.03;
    }
    return total / weight;
  }
  return { n2, fbm };
}
