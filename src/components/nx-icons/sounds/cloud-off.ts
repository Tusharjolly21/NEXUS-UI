import { plink, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.89;

/** A breath of air as the cloud drifts, two airy plucks that sink, and a dull low tone as the link drops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.3, 1600, 0.04, "bandpass");
  swish(c, o, t(0.05), t(0.5), 1400, 450, 0.04);
  plink(c, o, N.E6, t(0.12), 0.06, 0.18);
  plink(c, o, N.A5, t(0.3), 0.06, 0.2);
  blip(c, o, 200, t(0.5), 0.07, 0.3, 80, "sine");
  tick(c, o, t(0.6), 0.05, 2400);
}
