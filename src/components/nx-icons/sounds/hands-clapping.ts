import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two sharp palm claps, each a burst of noise over a dull thump, with a pair of bright sparkle bells on each one. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.12), t(0.18), 900, 2600, 0.02);
  puff(c, o, t(0.32), 0.07, 1900, 0.16, "bandpass");
  puff(c, o, t(0.32), 0.04, 5200, 0.09, "highpass");
  thud(c, o, t(0.32), 170, 0.16, 0.08);
  ding(c, o, N.E7, t(0.34), 0.05, 0.4);
  ding(c, o, N.A6, t(0.4), 0.035, 0.35);
  swish(c, o, t(0.46), t(0.18), 900, 2600, 0.02);
  puff(c, o, t(0.66), 0.07, 2100, 0.17, "bandpass");
  puff(c, o, t(0.66), 0.04, 5600, 0.09, "highpass");
  thud(c, o, t(0.66), 160, 0.17, 0.08);
  ding(c, o, N.G7, t(0.68), 0.05, 0.5);
  ding(c, o, N.B6, t(0.74), 0.035, 0.45);
}
