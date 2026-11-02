import { ding, plink, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.96;

/** A soft rising breath as the ring fills with colour, a falling swish as the arrow drops out, and a thud with two small bouncing notes as it lands back inside. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 400, 1800, 0.03);
  puff(c, o, t(0.1), 0.3, 1600, 0.02, "bandpass");
  swish(c, o, t(0.14), t(0.28), 2600, 600, 0.05);
  thud(c, o, t(0.56), 105, 0.22, 0.12);
  plink(c, o, N.C6, t(0.58), 0.07, 0.12);
  plink(c, o, N.G6, t(0.74), 0.045, 0.12);
  ding(c, o, N.E5, t(0.6), 0.04, 0.4);
}
