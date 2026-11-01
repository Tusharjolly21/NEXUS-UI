import { ding, plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.98;

/** A quick rising whisk, two crisp metallic clinks of fork against knife, and a small plate-top ping. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 1500, 3000, 0.02);
  tick(c, o, t(0.3), 0.16, 4600);
  ding(c, o, N.E7, t(0.3), 0.07, 0.4);
  ding(c, o, N.A6 * 2, t(0.3), 0.04, 0.3);
  tick(c, o, t(0.42), 0.08, 5200);
  ding(c, o, N.C8, t(0.42), 0.03, 0.25);
  plink(c, o, N.G6, t(0.66), 0.05, 0.14);
}
