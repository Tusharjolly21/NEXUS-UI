import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** A round bell as the ring sends out its ripple, a rising swish as the arrow floats away, a falling swish as it returns from below, and two notes that step up as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, N.E5, t(0.02), 0.08, 0.5);
  swish(c, o, t(0.12), t(0.3), 700, 2800, 0.045);
  swish(c, o, t(0.5), t(0.34), 2400, 800, 0.035);
  plink(c, o, N.G6, t(0.8), 0.07, 0.14);
  plink(c, o, N.D7, t(0.88), 0.04, 0.2);
}
