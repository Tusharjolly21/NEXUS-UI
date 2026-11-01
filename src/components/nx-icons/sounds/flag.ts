import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.4;

/** A ting on the pole, then three flapping puffs of fabric as the cloth ripples in the wind. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.A6, t(0.02), 0.06, 0.4);
  [0.14, 0.34, 0.52].forEach((at, i) => { puff(c, o, t(at), 0.12, 1800 + i * 500, 0.045, "bandpass"); thud(c, o, t(at), 130, 0.05, 0.04); });
  swish(c, o, t(0.1), t(0.6), 600, 1800, 0.015);
}
