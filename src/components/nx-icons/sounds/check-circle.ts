import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** Two rising plinks as the tick is drawn, then a shimmering ring. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  plink(c, o, N.E6, t(0.08), 0.1);
  plink(c, o, N.A6, t(0.26), 0.12);
  ding(c, o, N.E7, t(0.34), 0.05, 0.8);
  swish(c, o, t(0.3), t(0.6), 4000, 8000, 0.02);
}
