import { plink, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.56;

/** Soft rustles of foliage at each sway, a breath of air between, and two gentle plucked notes as the vein draws in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.04), 0.14, 5200, 0.03, "highpass");
  puff(c, o, t(0.22), 0.16, 4400, 0.035, "highpass");
  puff(c, o, t(0.48), 0.12, 6000, 0.03, "highpass");
  swish(c, o, t(0.1), t(0.5), 1400, 3400, 0.018);
  plink(c, o, N.A5, t(0.52), 0.07, 0.16);
  plink(c, o, N.E6, t(0.66), 0.05, 0.2);
}
