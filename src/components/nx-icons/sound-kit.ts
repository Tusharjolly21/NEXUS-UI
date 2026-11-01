import { hiss, tone } from "./sound-engine";

/**
 * The small building blocks every icon sound is made from, drawn with the Web Audio API (no audio files).
 * `at` is always seconds from the moment the icon is triggered, and the icon sounds pass it through `t`,
 * which stretches or squeezes time to match the icon's `speed` prop, so a sound stays in step with its picture.
 */
export type Time = (seconds: number) => number;

/** Notes, in hertz, from the C major pentatonic scale plus a few friends: bright but never shrill. */
export const N = {
  C4: 261.63, E4: 329.63, G4: 392, A4: 440,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, B6: 1975.53,
  C7: 2093, D7: 2349.32, E7: 2637.02, G7: 3135.96, C8: 4186,
} as const;

/** A glassy bell: a pure tone with a quiet octave and a faint overtone that dies first. */
export function ding(c: AudioContext, o: AudioNode, freq: number, at: number, gain = 0.12, decay = 0.6) {
  tone(c, o, { freq, at, attack: 0.004, decay, gain });
  tone(c, o, { freq: freq * 2, at, attack: 0.003, decay: decay * 0.45, gain: gain * 0.28 });
  tone(c, o, { freq: freq * 2.76, at, attack: 0.002, decay: decay * 0.18, gain: gain * 0.12 });
}

/** A bubbly note that springs up into pitch, with a tiny bright tick on top. */
export function plink(c: AudioContext, o: AudioNode, freq: number, at: number, gain = 0.1, decay = 0.13) {
  tone(c, o, { freq: freq * 0.72, to: freq, glide: 0.035, at, attack: 0.003, decay, gain });
  tone(c, o, { freq: freq * 3, at, attack: 0.001, decay: 0.025, gain: gain * 0.18 });
}

/** A short pitched blip. Give `to` to glide, and `type` for a rougher voice (triangle, sawtooth, square). */
export function blip(c: AudioContext, o: AudioNode, freq: number, at: number, gain = 0.1, decay = 0.08, to?: number, type: OscillatorType = "sine") {
  tone(c, o, { freq, to, glide: decay * 0.7, at, attack: 0.003, decay, gain, type });
}

/** A soft sweep of air between two pitches. */
export function swish(c: AudioContext, o: AudioNode, at: number, length: number, from: number, to: number, gain = 0.05) {
  hiss(c, o, { at, attack: length * 0.45, decay: length * 0.55, freq: from, to, gain, q: 0.8 });
}

/** A tiny dry click. */
export function tick(c: AudioContext, o: AudioNode, at: number, gain = 0.12, freq = 5000) {
  hiss(c, o, { at, freq, decay: 0.012, gain, filter: "highpass" });
}

/** A low thump: something soft landing. */
export function thud(c: AudioContext, o: AudioNode, at: number, freq = 110, gain = 0.3, decay = 0.14) {
  tone(c, o, { freq, to: freq * 0.55, glide: decay * 0.8, at, attack: 0.002, decay, gain });
  hiss(c, o, { at, freq: 500, decay: 0.04, gain: gain * 0.35, filter: "lowpass" });
}

/** A burst of noise: a crackle, a rustle, a puff of air. */
export function puff(c: AudioContext, o: AudioNode, at: number, length = 0.08, freq = 3000, gain = 0.06, filter: BiquadFilterType = "bandpass") {
  hiss(c, o, { at, attack: 0.004, decay: length, freq, gain, filter });
}
