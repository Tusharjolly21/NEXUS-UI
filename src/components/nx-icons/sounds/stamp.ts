import { ding, plink, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A light lift swish, then a firm wooden thud and paper puff as the stamp lands, a dry click, and one confirming bell as it comes back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 600, 1800, 0.03);
  thud(c, o, t(0.44), 130, 0.32, 0.16);
  puff(c, o, t(0.44), 0.07, 1400, 0.05, "lowpass");
  tick(c, o, t(0.46), 0.1, 2600);
  swish(c, o, t(0.6), t(0.2), 1800, 700, 0.02);
  ding(c, o, N.E5, t(0.68), 0.06, 0.4);
  ding(c, o, N.B6, t(0.74), 0.04, 0.3);
  plink(c, o, N.D5, t(0.8), 0.04, 0.12);
}
