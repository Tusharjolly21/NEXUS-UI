import { blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.86;

/** Wind moving through branches, then four tiny descending ticks as a leaf flutters down and touches the ground. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.7), 500, 1500, 0.025);
  puff(c, o, t(0.1), 0.6, 3000, 0.018, "bandpass");
  [0.3, 0.45, 0.6, 0.75].forEach((at, i) => blip(c, o, N.G6 - i * 160, t(at), 0.035, 0.1));
  tick(c, o, t(0.88), 0.07, 2200);
}
