import { ding, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.7;

/** A tape rip as the lid pops, a puff of air, and a deep cardboard thud as it drops back, ending on a happy ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.06), 0.28, 5200, 0.07, "highpass");
  swish(c, o, t(0.06), t(0.28), 1800, 5000, 0.035);
  thud(c, o, t(0.1), 170, 0.12, 0.08);
  puff(c, o, t(0.24), 0.14, 2600, 0.04, "bandpass");
  thud(c, o, t(0.48), 100, 0.3, 0.16);
  puff(c, o, t(0.48), 0.1, 900, 0.05, "lowpass");
  ding(c, o, N.G6, t(0.55), 0.07, 0.45);
}
