import { ding, plink, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.71;

/** A shutter squeeze that falls in pitch as the blades close with a dry click, a rising whoosh as they fan wide, and a bright pluck with a final click as the iris settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.09, 4600);
  swish(c, o, t(0.04), t(0.32), 3000, 800, 0.05);
  tick(c, o, t(0.34), 0.12, 3000);
  swish(c, o, t(0.38), t(0.34), 800, 3800, 0.05);
  plink(c, o, N.E6, t(0.66), 0.07, 0.14);
  plink(c, o, N.B5, t(0.72), 0.05, 0.14);
  plink(c, o, N.G6, t(0.78), 0.045, 0.16);
  ding(c, o, N.D7, t(0.84), 0.03, 0.3);
  tick(c, o, t(0.9), 0.07, 5200);
}
