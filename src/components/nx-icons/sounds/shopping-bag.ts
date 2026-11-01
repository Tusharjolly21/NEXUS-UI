import { ding, plink, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.27;

/** A paper rustle as the bag sways, a plink as the handle lifts, and a cash-register ding as the smile appears. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.4, 4200, 0.045, "highpass");
  puff(c, o, t(0.4), 0.3, 3600, 0.03, "highpass");
  plink(c, o, N.G6, t(0.04), 0.07, 0.12);
  tick(c, o, t(0.3), 0.1, 3200);
  ding(c, o, N.C7, t(0.34), 0.08, 0.6);
  ding(c, o, N.E7, t(0.4), 0.05, 0.5);
}
