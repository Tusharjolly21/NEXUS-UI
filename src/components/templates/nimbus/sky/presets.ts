import type { Condition } from "../weather";

export type Rgb = readonly [number, number, number];

/**
 * Everything that makes one sky look different from another. The renderer blends smoothly from the current
 * numbers to the preset of the selected condition, so switching weather cross-fades instead of cutting.
 */
export type SkyPreset = {
  /** How much of the sky the clouds cover, 0..1. */
  coverage: number;
  /** How soft the cloud edges are, 0..1. */
  softness: number;
  /** The most opaque a cloud gets, 0..1. */
  maxAlpha: number;
  /** Cloud colour where it is lit from above, and where it is in shade. */
  lit: Rgb;
  shade: Rgb;
  /** 1 keeps the clouds in a band across the middle of the sky, 0 spreads them over all of it. */
  band: number;
  /** Cloud drift speed. */
  speed: number;
  /** 0..1 amount of rain, snow, night sky, sun and lightning. */
  rain: number;
  snow: number;
  night: number;
  sun: number;
  bolt: number;
};

export const SKY_PRESETS: Record<Condition, SkyPreset> = {
  sunny: { coverage: 0.34, softness: 0.16, maxAlpha: 0.97, lit: [255, 255, 255], shade: [160, 178, 204], band: 1, speed: 1, rain: 0, snow: 0, night: 0, sun: 1, bolt: 0 },
  rain: { coverage: 0.84, softness: 0.8, maxAlpha: 0.95, lit: [158, 167, 178], shade: [98, 107, 120], band: 0, speed: 1.7, rain: 0.55, snow: 0, night: 0, sun: 0, bolt: 0 },
  snow: { coverage: 0.82, softness: 0.85, maxAlpha: 0.9, lit: [206, 213, 222], shade: [136, 147, 162], band: 0, speed: 0.7, rain: 0, snow: 1, night: 0, sun: 0, bolt: 0 },
  storm: { coverage: 0.9, softness: 0.42, maxAlpha: 0.98, lit: [96, 103, 117], shade: [20, 24, 31], band: 0, speed: 2.8, rain: 1, snow: 0, night: 0, sun: 0, bolt: 1 },
  night: { coverage: 0.3, softness: 0.34, maxAlpha: 0.62, lit: [104, 116, 150], shade: [16, 22, 42], band: 1, speed: 0.8, rain: 0, snow: 0, night: 1, sun: 0, bolt: 0 },
};

/** A mutable copy of a preset: the "current" sky that is eased toward the target. */
export type SkyState = { -readonly [K in keyof SkyPreset]: SkyPreset[K] extends Rgb ? [number, number, number] : number };

export function cloneState(preset: SkyPreset): SkyState {
  return { ...preset, lit: [...preset.lit], shade: [...preset.shade] };
}

const SCALAR_KEYS = ["coverage", "softness", "maxAlpha", "band", "speed", "rain", "snow", "night", "sun", "bolt"] as const;

/** Moves `state` a fraction `amount` (0..1) of the way to `target`. */
export function easeState(state: SkyState, target: SkyPreset, amount: number) {
  for (const key of SCALAR_KEYS) state[key] += (target[key] - state[key]) * amount;
  for (let i = 0; i < 3; i++) {
    state.lit[i] += (target.lit[i] - state.lit[i]) * amount;
    state.shade[i] += (target.shade[i] - state.shade[i]) * amount;
  }
}

/** Jumps `state` straight to `target`. */
export function snapState(state: SkyState, target: SkyPreset) {
  easeState(state, target, 1);
}
